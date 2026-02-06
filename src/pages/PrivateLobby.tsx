import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCloudDecks } from "@/hooks/useCloudDecks";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Swords, Check, X, ArrowLeft, Layers, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { SavedDeck } from "@/types/deck";
import { cn } from "@/lib/utils";
import { shuffleDeck } from "@/data/gameData";

interface InviteData {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_deck_id: string | null;
  receiver_deck_id: string | null;
  status: string;
  match_id: string | null;
}

interface PlayerProfile {
  user_id: string;
  username: string;
  avatar_url: string | null;
}

export default function PrivateLobby() {
  const { inviteId } = useParams<{ inviteId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { decks, isLoading: decksLoading } = useCloudDecks();

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [senderProfile, setSenderProfile] = useState<PlayerProfile | null>(null);
  const [receiverProfile, setReceiverProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [opponentDeckName, setOpponentDeckName] = useState<string | null>(null);

  const isSender = user?.id === invite?.sender_id;
  const myDeckColumn = isSender ? "sender_deck_id" : "receiver_deck_id";
  const opponentDeckColumn = isSender ? "receiver_deck_id" : "sender_deck_id";

  // Fetch invite and profiles
  useEffect(() => {
    if (!inviteId || !user) return;

    const fetchInvite = async () => {
      setIsLoading(true);
      
      const { data, error } = await (supabase
        .from("private_match_invites" as any) as any)
        .select("*")
        .eq("id", inviteId)
        .single();

      if (error || !data) {
        console.error("Invite not found:", error);
        toast.error(language === "tr" ? "Davet bulunamadı!" : "Invite not found!");
        navigate("/friends");
        return;
      }

      // Check if user is part of this invite
      if (data.sender_id !== user.id && data.receiver_id !== user.id) {
        toast.error(language === "tr" ? "Bu davete erişim yetkiniz yok!" : "You don't have access to this invite!");
        navigate("/friends");
        return;
      }

      // Check if already started
      if (data.match_id && data.status === "started") {
        navigate(`/online-game/${data.match_id}`);
        return;
      }

      setInvite(data);

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", [data.sender_id, data.receiver_id]);

      if (profiles) {
        const sender = profiles.find((p: any) => p.user_id === data.sender_id);
        const receiver = profiles.find((p: any) => p.user_id === data.receiver_id);
        setSenderProfile(sender || null);
        setReceiverProfile(receiver || null);
      }

      // Check if I already selected a deck
      const myDeckId = user.id === data.sender_id ? data.sender_deck_id : data.receiver_deck_id;
      if (myDeckId) {
        setSelectedDeckId(myDeckId);
        setIsReady(true);
      }

      // Check if opponent selected a deck
      const oppDeckId = user.id === data.sender_id ? data.receiver_deck_id : data.sender_deck_id;
      if (oppDeckId) {
        setOpponentReady(true);
        // Fetch opponent deck name
        const { data: deckData } = await (supabase
          .from("user_decks" as any) as any)
          .select("name")
          .eq("id", oppDeckId)
          .single();
        if (deckData) {
          setOpponentDeckName(deckData.name);
        }
      }

      setIsLoading(false);
    };

    fetchInvite();
  }, [inviteId, user, navigate, language]);

  // Start the match when both ready
  const startMatch = useCallback(async () => {
    if (!invite || !user) return;

    // Re-fetch the latest invite to get fresh deck IDs
    const { data: freshInvite } = await (supabase
      .from("private_match_invites" as any) as any)
      .select("*")
      .eq("id", invite.id)
      .maybeSingle();

    if (!freshInvite?.sender_deck_id || !freshInvite?.receiver_deck_id) {
      console.log("[PrivateLobby] Not both decks set yet, waiting...");
      return;
    }

    // Check if match already created (prevent double creation)
    if (freshInvite.match_id) {
      console.log("[PrivateLobby] Match already created, navigating...");
      navigate(`/online-game/${freshInvite.match_id}?mode=private`);
      return;
    }

    // Fetch both decks
    const { data: senderDeckData } = await (supabase
      .from("user_decks" as any) as any)
      .select("*")
      .eq("id", freshInvite.sender_deck_id)
      .maybeSingle();

    const { data: receiverDeckData } = await (supabase
      .from("user_decks" as any) as any)
      .select("*")
      .eq("id", freshInvite.receiver_deck_id)
      .maybeSingle();

    if (!senderDeckData || !receiverDeckData) {
      console.error("[PrivateLobby] Failed to fetch decks:", { senderDeckData, receiverDeckData });
      toast.error(language === "tr" ? "Deste bilgisi alınamadı!" : "Failed to fetch deck data!");
      return;
    }



    // Convert to SavedDeck format
    const convertDeck = (d: any): SavedDeck => ({
      id: d.id,
      name: d.name,
      mainClass: d.main_class,
      secondaryClasses: d.filler_classes || [],
      cardBack: d.deck_data?.cardBack || d.main_class,
      cards: d.deck_data?.cards || [],
      createdAt: d.created_at,
    });

    // Shuffle the cards for the initial hand randomization!
    // This fixes the issue where players always get the same fixed cards (e.g. 6 class cards) in private matches.
    const player1Deck = convertDeck(senderDeckData);
    if (player1Deck.cards && player1Deck.cards.length > 0) {
        player1Deck.cards = shuffleDeck([...player1Deck.cards]);
    }

    const player2Deck = convertDeck(receiverDeckData);
    if (player2Deck.cards && player2Deck.cards.length > 0) {
        player2Deck.cards = shuffleDeck([...player2Deck.cards]);
    }

    // Create match
    const { data: matchData, error: matchError } = await (supabase
      .from("matches" as any) as any)
      .insert({
        player1_id: freshInvite.sender_id,
        player2_id: freshInvite.receiver_id,
        player1_deck: player1Deck,
        player2_deck: player2Deck,
        status: "active",
        current_round: 1,
        phase: "placement",
        player1_field: [null, null, null, null, null],
        player2_field: [null, null, null, null, null],
      })
      .select()
      .single();

    if (matchError || !matchData) {
      console.error("Error creating match:", matchError);
      toast.error(language === "tr" ? "Maç oluşturulamadı!" : "Failed to create match!");
      return;
    }

    // Update invite with match_id
    await (supabase
      .from("private_match_invites" as any) as any)
      .update({
        match_id: matchData.id,
        status: "started"
      })
      .eq("id", invite.id);

    toast.success(language === "tr" ? "Maç başlıyor!" : "Match starting!");
    navigate(`/online-game/${matchData.id}?mode=private`);
  }, [invite, user, navigate, language]);

  // Subscribe to invite updates
  useEffect(() => {
    if (!inviteId || !user) return;

    const channel = supabase
      .channel(`private-invite-${inviteId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'private_match_invites',
          filter: `id=eq.${inviteId}`
        },
        async (payload) => {
          const updated = payload.new as InviteData;
          setInvite(updated);

          // If match started, navigate
          if (updated.match_id && updated.status === "started") {
            toast.success(language === "tr" ? "Maç başlıyor!" : "Match starting!");
            navigate(`/online-game/${updated.match_id}?mode=private`);
            return;
          }

          // Check opponent readiness
          const oppDeckId = user.id === updated.sender_id ? updated.receiver_deck_id : updated.sender_deck_id;
          const myDeckId = user.id === updated.sender_id ? updated.sender_deck_id : updated.receiver_deck_id;
          
          if (oppDeckId) {
            setOpponentReady(true);
            const { data: deckData } = await (supabase
              .from("user_decks" as any) as any)
              .select("name")
              .eq("id", oppDeckId)
              .maybeSingle();
            if (deckData) {
              setOpponentDeckName(deckData.name);
            }
            
            // If both decks are set and no match yet, start the match
            if (myDeckId && !updated.match_id) {
              await startMatch();
            }
          } else {
            setOpponentReady(false);
            setOpponentDeckName(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [inviteId, user, navigate, language, startMatch]);

  // Handle deck selection and ready
  const handleReady = useCallback(async () => {
    if (!invite || !user || !selectedDeckId) return;

    setIsReady(true);

    // Update invite with selected deck
    const { error } = await (supabase
      .from("private_match_invites" as any) as any)
      .update({ [myDeckColumn]: selectedDeckId })
      .eq("id", invite.id);

    if (error) {
      console.error("Error setting deck:", error);
      toast.error(language === "tr" ? "Deste seçilemedi!" : "Failed to select deck!");
      setIsReady(false);
      return;
    }

    toast.success(language === "tr" ? "Deste seçildi! Rakip bekleniyor..." : "Deck selected! Waiting for opponent...");

    // Check if opponent is also ready - if so, start match
    const { data: currentInvite } = await (supabase
      .from("private_match_invites" as any) as any)
      .select("sender_deck_id, receiver_deck_id")
      .eq("id", invite.id)
      .maybeSingle();

    if (currentInvite?.sender_deck_id && currentInvite?.receiver_deck_id) {
      await startMatch();
    }
  }, [invite, user, selectedDeckId, myDeckColumn, language, startMatch]);


  // Cancel/Leave lobby
  const handleCancel = async () => {
    if (!invite) return;

    if (isSender) {
      // Delete the invite
      await (supabase.from("private_match_invites" as any) as any)
        .delete()
        .eq("id", invite.id);
      toast.info(language === "tr" ? "Davet iptal edildi." : "Invite cancelled.");
    } else {
      // Decline the invite
      await (supabase.from("private_match_invites" as any) as any)
        .update({ status: "rejected" })
        .eq("id", invite.id);
      toast.info(language === "tr" ? "Lobiden ayrıldınız." : "Left the lobby.");
    }

    navigate("/friends");
  };

  const myProfile = isSender ? senderProfile : receiverProfile;
  const opponentProfile = isSender ? receiverProfile : senderProfile;

  if (isLoading || decksLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <Button variant="ghost" onClick={handleCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {language === "tr" ? "Çık" : "Leave"}
        </Button>
        <div className="text-xl font-bold text-primary glow-gold font-cinzel flex items-center gap-2">
          <Swords className="w-5 h-5" />
          {language === "tr" ? "Özel Düello Lobisi" : "Private Duel Lobby"}
        </div>
        <div className="w-20" />
      </div>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* VS Display */}
        <div className="flex items-center justify-center gap-8 mb-12">
          {/* Me */}
          <Card className={cn(
            "p-6 flex flex-col items-center border-2 transition-all",
            isReady ? "border-green-500 bg-green-500/10" : "border-border"
          )}>
            <div className="w-20 h-20 rounded-full bg-primary/20 overflow-hidden border-2 border-primary/50 mb-3">
              {myProfile?.avatar_url ? (
                <img src={myProfile.avatar_url} alt={myProfile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-bold text-2xl">
                  {myProfile?.username?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <p className="font-bold text-lg text-foreground">{myProfile?.username || "..."}</p>
            <p className="text-xs text-muted-foreground">{language === "tr" ? "(Sen)" : "(You)"}</p>
            {isReady && (
              <div className="mt-2 flex items-center gap-1 text-green-500 text-sm">
                <Check className="w-4 h-4" />
                {language === "tr" ? "Hazır" : "Ready"}
              </div>
            )}
          </Card>

          {/* VS */}
          <div className="text-4xl font-bold text-primary glow-gold">VS</div>

          {/* Opponent */}
          <Card className={cn(
            "p-6 flex flex-col items-center border-2 transition-all",
            opponentReady ? "border-green-500 bg-green-500/10" : "border-border"
          )}>
            <div className="w-20 h-20 rounded-full bg-muted overflow-hidden border-2 border-muted-foreground/30 mb-3">
              {opponentProfile?.avatar_url ? (
                <img src={opponentProfile.avatar_url} alt={opponentProfile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold text-2xl">
                  {opponentProfile?.username?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <p className="font-bold text-lg text-foreground">{opponentProfile?.username || "..."}</p>
            {opponentReady ? (
              <div className="mt-2 flex items-center gap-1 text-green-500 text-sm">
                <Check className="w-4 h-4" />
                {opponentDeckName ? `${language === "tr" ? "Hazır" : "Ready"}: ${opponentDeckName}` : (language === "tr" ? "Hazır" : "Ready")}
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-1 text-amber-500 text-sm animate-pulse">
                <Clock className="w-4 h-4" />
                {language === "tr" ? "Bekleniyor..." : "Waiting..."}
              </div>
            )}
          </Card>
        </div>

        {/* Deck Selection */}
        {!isReady && (
          <Card className="p-6 border-primary/30 max-w-md mx-auto">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground">
              <Layers className="w-5 h-5 text-primary" />
              {language === "tr" ? "Savaş Desteni Seç" : "Select Your Battle Deck"}
            </h3>

            {decks.length > 0 ? (
              <>
                <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={language === "tr" ? "Deste Seç..." : "Select Deck..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {decks.map((deck) => (
                      <SelectItem key={deck.id} value={deck.id}>
                        {deck.name} ({deck.mainClass})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  className="w-full mt-4"
                  disabled={!selectedDeckId}
                  onClick={handleReady}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {language === "tr" ? "Hazırım!" : "I'm Ready!"}
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-red-400 mb-3">
                  {language === "tr"
                    ? "Hiç kayıtlı desteniz yok! Önce bir deste oluşturun."
                    : "You have no saved decks! Create one first."}
                </p>
                <Button variant="outline" onClick={() => navigate("/deck-builder")}>
                  {language === "tr" ? "Deste Oluştur" : "Create Deck"}
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Waiting for opponent */}
        {isReady && !opponentReady && (
          <Card className="p-8 max-w-md mx-auto text-center border-amber-500/30 bg-amber-500/5">
            <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
            <p className="text-lg font-bold text-foreground mb-2">
              {language === "tr" ? "Rakip Bekleniyor..." : "Waiting for Opponent..."}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "tr"
                ? `${opponentProfile?.username || "Rakip"} deste seçiyor...`
                : `${opponentProfile?.username || "Opponent"} is selecting their deck...`}
            </p>
          </Card>
        )}

        {/* Both ready - starting */}
        {isReady && opponentReady && (
          <Card className="p-8 max-w-md mx-auto text-center border-green-500/30 bg-green-500/5">
            <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
            <p className="text-lg font-bold text-foreground mb-2">
              {language === "tr" ? "Her İki Taraf Hazır!" : "Both Players Ready!"}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "tr" ? "Maç başlatılıyor..." : "Starting match..."}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
