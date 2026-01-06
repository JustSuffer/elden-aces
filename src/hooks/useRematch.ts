import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface RematchState {
  hasPendingRequest: boolean;
  isRequester: boolean;
  requestId: string | null;
  newMatchId: string | null;
}

export const useRematch = (matchId: string | undefined) => {
  const { user } = useAuth();
  const [rematchState, setRematchState] = useState<RematchState>({
    hasPendingRequest: false,
    isRequester: false,
    requestId: null,
    newMatchId: null
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing rematch request
  const checkRematchRequest = useCallback(async () => {
    if (!matchId || !user) return;

    const { data } = await supabase
      .from("rematch_requests" as any)
      .select("*")
      .eq("match_id", matchId)
      .eq("status", "pending")
      .maybeSingle() as { data: any };

    if (data) {
      setRematchState({
        hasPendingRequest: true,
        isRequester: data.requester_id === user.id,
        requestId: data.id,
        newMatchId: null
      });
    }
  }, [matchId, user]);

  // Subscribe to rematch requests
  useEffect(() => {
    if (!matchId || !user) return;

    checkRematchRequest();

    const channel = supabase
      .channel(`rematch-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rematch_requests',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          const data = payload.new as any;
          
          if (payload.eventType === 'INSERT') {
            setRematchState({
              hasPendingRequest: true,
              isRequester: data.requester_id === user.id,
              requestId: data.id,
              newMatchId: null
            });
            if (data.requester_id !== user.id) {
              toast.info("Rakibiniz rövanş istiyor!");
            }
          } else if (payload.eventType === 'UPDATE' && data.status === 'accepted' && data.new_match_id) {
            setRematchState(prev => ({
              ...prev,
              newMatchId: data.new_match_id
            }));
          } else if (payload.eventType === 'DELETE' || data.status === 'declined') {
            setRematchState({
              hasPendingRequest: false,
              isRequester: false,
              requestId: null,
              newMatchId: null
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, user, checkRematchRequest]);

  // Send rematch request
  const sendRematchRequest = async (opponentId: string) => {
    if (!matchId || !user) return;

    setIsLoading(true);
    const { error } = await supabase
      .from("rematch_requests" as any)
      .insert({
        match_id: matchId,
        requester_id: user.id,
        opponent_id: opponentId,
        status: "pending"
      });

    setIsLoading(false);

    if (error) {
      toast.error("Rövanş isteği gönderilemedi");
      return;
    }

    toast.success("Rövanş isteği gönderildi!");
    setRematchState({
      hasPendingRequest: true,
      isRequester: true,
      requestId: null,
      newMatchId: null
    });
  };

  // Accept rematch request
  const acceptRematch = async (originalMatch: any) => {
    if (!rematchState.requestId || !user || !originalMatch) return null;

    setIsLoading(true);

    // Determine who is player1/player2 in new match (swap)
    const isPlayer1 = originalMatch.player1_id === user.id;
    const newPlayer1Id = isPlayer1 ? originalMatch.player2_id : originalMatch.player1_id;
    const newPlayer2Id = user.id;
    const newPlayer1Deck = isPlayer1 ? originalMatch.player2_deck : originalMatch.player1_deck;
    const newPlayer2Deck = isPlayer1 ? originalMatch.player1_deck : originalMatch.player2_deck;

    // Create new match
    const { data: newMatch, error: matchError } = await supabase
      .from("matches" as any)
      .insert({
        player1_id: newPlayer1Id,
        player2_id: newPlayer2Id,
        player1_deck: newPlayer1Deck,
        player2_deck: newPlayer2Deck,
        status: "active",
        player1_field: [],
        player2_field: [],
        player1_ready: false,
        player2_ready: false,
        current_round: 1,
        phase: "placement"
      })
      .select()
      .single() as { data: { id: string } | null; error: any };

    if (matchError || !newMatch) {
      setIsLoading(false);
      toast.error("Yeni maç oluşturulamadı");
      return null;
    }

    // Update rematch request
    await supabase
      .from("rematch_requests" as any)
      .update({
        status: "accepted",
        new_match_id: newMatch.id
      })
      .eq("id", rematchState.requestId);

    setIsLoading(false);
    toast.success("Rövanş başlıyor!");
    
    return newMatch.id;
  };

  // Decline rematch request
  const declineRematch = async () => {
    if (!rematchState.requestId) return;

    await supabase
      .from("rematch_requests" as any)
      .update({ status: "declined" })
      .eq("id", rematchState.requestId);

    toast.info("Rövanş reddedildi");
    setRematchState({
      hasPendingRequest: false,
      isRequester: false,
      requestId: null,
      newMatchId: null
    });
  };

  // Cancel my rematch request
  const cancelRematchRequest = async () => {
    if (!matchId || !user) return;

    await supabase
      .from("rematch_requests" as any)
      .delete()
      .eq("match_id", matchId)
      .eq("requester_id", user.id);

    setRematchState({
      hasPendingRequest: false,
      isRequester: false,
      requestId: null,
      newMatchId: null
    });
  };

  return {
    rematchState,
    isLoading,
    sendRematchRequest,
    acceptRematch,
    declineRematch,
    cancelRematchRequest
  };
};
