import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Swords, Trophy, Skull, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface MatchHistoryEntry {
  id: string;
  opponent_username: string;
  opponent_class: string;
  player_class: string;
  result: "win" | "loss" | "draw";
  player_final_hp: number;
  opponent_final_hp: number;
  finished_at: string;
}

export const MatchHistory = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMatchHistory();
    }
  }, [user]);

  const fetchMatchHistory = async () => {
    if (!user) return;

    // Fetch completed matches where user is player1 or player2
    const { data: matchData, error } = await supabase
      .from("matches" as any)
      .select("*")
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .eq("status", "completed")
      .order("finished_at", { ascending: false })
      .limit(20) as { data: any[] | null; error: any };

    if (error || !matchData) {
      console.error("Match history fetch error:", error);
      setIsLoading(false);
      return;
    }

    // Get opponent user IDs
    const opponentIds = matchData.map(m => 
      m.player1_id === user.id ? m.player2_id : m.player1_id
    );

    // Fetch opponent usernames
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username")
      .in("user_id", opponentIds);

    const usernameMap = new Map((profiles || []).map(p => [p.user_id, p.username]));

    const entries: MatchHistoryEntry[] = matchData.map(m => {
      const isPlayer1 = m.player1_id === user.id;
      const opponentId = isPlayer1 ? m.player2_id : m.player1_id;
      
      // Determine result
      let result: "win" | "loss" | "draw" = "draw";
      if (m.winner_id === user.id) result = "win";
      else if (m.winner_id && m.winner_id !== user.id) result = "loss";

      return {
        id: m.id,
        opponent_username: usernameMap.get(opponentId) || "Unknown",
        opponent_class: isPlayer1 ? m.player2_deck?.mainClass : m.player1_deck?.mainClass,
        player_class: isPlayer1 ? m.player1_deck?.mainClass : m.player2_deck?.mainClass,
        result,
        player_final_hp: isPlayer1 ? (m.player1_final_hp ?? 0) : (m.player2_final_hp ?? 0),
        opponent_final_hp: isPlayer1 ? (m.player2_final_hp ?? 0) : (m.player1_final_hp ?? 0),
        finished_at: m.finished_at || m.updated_at
      };
    });

    setMatches(entries);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground py-8 animate-pulse">
        Maç geçmişi yükleniyor...
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Henüz tamamlanmış maç yok.</p>
        <p className="text-sm mt-2">Online maç oyna ve geçmişini gör!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <Card
          key={match.id}
          className={`p-4 border ${
            match.result === "win" 
              ? "border-green-500/30 bg-green-500/5" 
              : match.result === "loss"
              ? "border-red-500/30 bg-red-500/5"
              : "border-border/50 bg-card/50"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Result & Opponent */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                match.result === "win" ? "bg-green-500/20" : 
                match.result === "loss" ? "bg-red-500/20" : "bg-muted"
              }`}>
                {match.result === "win" ? (
                  <Trophy className="w-5 h-5 text-green-500" />
                ) : match.result === "loss" ? (
                  <Skull className="w-5 h-5 text-red-500" />
                ) : (
                  <Swords className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-bold text-foreground">
                  vs {match.opponent_username}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{match.player_class}</span>
                  <span>vs</span>
                  <span>{match.opponent_class}</span>
                </div>
              </div>
            </div>

            {/* HP & Date */}
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <Badge variant={match.result === "win" ? "default" : match.result === "loss" ? "destructive" : "secondary"}>
                  {match.player_final_hp} HP - {match.opponent_final_hp} HP
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 justify-end">
                <Clock className="w-3 h-3" />
                {match.finished_at && format(new Date(match.finished_at), "d MMM yyyy HH:mm", { locale: tr })}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
