// Lovable Cloud Function: matchmake
// Ensures two *actively searching* players are paired, with race-safe reservation.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type MatchmakeRequest = {
  queueEntryId: string;
};

type MatchmakeResponse =
  | { status: "matched"; matchId: string; opponentUserId: string }
  | { status: "waiting" };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      console.error("[matchmake] Missing env vars", {
        hasUrl: !!supabaseUrl,
        hasAnon: !!supabaseAnonKey,
        hasService: !!supabaseServiceRoleKey,
      });
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userData?.user) {
      console.error("[matchmake] auth.getUser failed", userErr);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { queueEntryId } = (await req.json()) as MatchmakeRequest;
    if (!queueEntryId) {
      return new Response(JSON.stringify({ error: "queueEntryId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = userData.user;
    const admin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const nowIso = new Date().toISOString();
    const activeCutoffIso = new Date(Date.now() - 25 * 1000).toISOString();

    // Load and validate my queue row
    const { data: myRow, error: myErr } = await admin
      .from("matchmaking_queue")
      .select("id,user_id,deck_data,status,match_id")
      .eq("id", queueEntryId)
      .maybeSingle();

    if (myErr || !myRow) {
      console.error("[matchmake] myRow fetch failed", myErr);
      return new Response(JSON.stringify({ error: "Queue entry not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (myRow.user_id !== user.id) {
      console.error("[matchmake] queueEntryId not owned by user", { queueEntryId, userId: user.id });
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If already matched, just return it.
    if (myRow.status === "matched" && myRow.match_id) {
      // We don't know opponent user id reliably here without reading matched_with;
      // client will pick it up via realtime anyway.
      return new Response(JSON.stringify({ status: "waiting" } satisfies MatchmakeResponse), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Keepalive my row while searching
    if (myRow.status === "searching") {
      await admin.from("matchmaking_queue").update({ updated_at: nowIso }).eq("id", queueEntryId);
    }

    if (myRow.status !== "searching") {
      return new Response(JSON.stringify({ status: "waiting" } satisfies MatchmakeResponse), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find candidate opponents (only actively heartbeating)
    const { data: candidates, error: candErr } = await admin
      .from("matchmaking_queue")
      .select("id,user_id,deck_data")
      .eq("status", "searching")
      .neq("user_id", user.id)
      .gt("updated_at", activeCutoffIso)
      .order("created_at", { ascending: true })
      .limit(5);

    if (candErr) {
      console.error("[matchmake] candidates query failed", candErr);
      return new Response(JSON.stringify({ status: "waiting" } satisfies MatchmakeResponse), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const opp of candidates ?? []) {
      // Reserve opponent (race-safe): searching -> matching
      const { data: reservedOpp } = await admin
        .from("matchmaking_queue")
        .update({
          status: "matching",
          matched_with: user.id,
          updated_at: nowIso,
        })
        .eq("id", opp.id)
        .eq("status", "searching")
        .is("match_id", null)
        .select("id,user_id,deck_data")
        .maybeSingle();

      if (!reservedOpp) continue; // Lost race

      // Reserve me (ensure I'm still searching)
      const { data: reservedMe } = await admin
        .from("matchmaking_queue")
        .update({
          status: "matching",
          matched_with: reservedOpp.user_id,
          updated_at: nowIso,
        })
        .eq("id", queueEntryId)
        .eq("status", "searching")
        .is("match_id", null)
        .select("id,user_id,deck_data")
        .maybeSingle();

      if (!reservedMe) {
        // Rollback opponent reservation
        await admin
          .from("matchmaking_queue")
          .update({ status: "searching", matched_with: null, updated_at: nowIso })
          .eq("id", reservedOpp.id);
        continue;
      }

      // Create match with full sync columns (prevents empty field/phase issues)
      const emptyField = [null, null, null, null, null];
      const { data: match, error: matchErr } = await admin
        .from("matches")
        .insert({
          player1_id: reservedOpp.user_id,
          player2_id: user.id,
          player1_deck: reservedOpp.deck_data,
          player2_deck: reservedMe.deck_data,
          status: "active",
          player1_field: emptyField,
          player2_field: emptyField,
          player1_ready: false,
          player2_ready: false,
          current_round: 1,
          phase: "placement",
        })
        .select("id")
        .single();

      if (matchErr || !match) {
        console.error("[matchmake] match insert failed", matchErr);
        // Rollback both reservations
        await admin
          .from("matchmaking_queue")
          .update({ status: "searching", matched_with: null, updated_at: nowIso })
          .in("id", [reservedOpp.id, reservedMe.id]);

        return new Response(JSON.stringify({ status: "waiting" } satisfies MatchmakeResponse), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Finalize queue rows
      await admin
        .from("matchmaking_queue")
        .update({ status: "matched", match_id: match.id, updated_at: nowIso })
        .eq("id", reservedOpp.id);

      await admin
        .from("matchmaking_queue")
        .update({ status: "matched", match_id: match.id, updated_at: nowIso })
        .eq("id", reservedMe.id);

      const response: MatchmakeResponse = {
        status: "matched",
        matchId: match.id,
        opponentUserId: reservedOpp.user_id,
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ status: "waiting" } satisfies MatchmakeResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[matchmake] Unhandled error", e);
    return new Response(JSON.stringify({ error: "Unhandled" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
