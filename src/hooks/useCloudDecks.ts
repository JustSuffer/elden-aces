import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SavedDeck } from "@/types/deck";
import { toast } from "sonner";

interface CloudDeck {
  id: string;
  user_id: string;
  name: string;
  main_class: string;
  filler_classes: string[];
  deck_data: any;
  created_at: string;
  updated_at: string;
}

export function useCloudDecks() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<SavedDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Convert cloud deck to SavedDeck format
  const cloudToSavedDeck = (cloudDeck: CloudDeck): SavedDeck => ({
    id: cloudDeck.id,
    name: cloudDeck.name,
    mainClass: cloudDeck.main_class as any,
    secondaryClasses: cloudDeck.filler_classes as any[],
    cardBack: cloudDeck.deck_data?.cardBack || cloudDeck.main_class,
    cards: cloudDeck.deck_data?.cards || [],
    createdAt: cloudDeck.created_at,
  });

  // Convert SavedDeck to cloud format
  const savedDeckToCloud = (deck: SavedDeck, userId: string) => ({
    user_id: userId,
    name: deck.name,
    main_class: deck.mainClass,
    filler_classes: deck.secondaryClasses,
    deck_data: {
      cards: deck.cards,
      cardBack: deck.cardBack,
    },
  });

  // Fetch decks from cloud
  const fetchDecks = useCallback(async () => {
    if (!user) {
      setDecks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await (supabase
        .from("user_decks" as any) as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const savedDecks = (data || []).map(cloudToSavedDeck);
      setDecks(savedDecks);

      // Also update localStorage for offline access
      localStorage.setItem("acoria-saved-decks", JSON.stringify(savedDecks));
    } catch (error) {
      console.error("Error fetching decks:", error);
      // Fallback to localStorage
      const stored = localStorage.getItem("acoria-saved-decks");
      if (stored) {
        setDecks(JSON.parse(stored));
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Save or update deck
  const saveDeck = async (deck: SavedDeck, isEdit: boolean = false): Promise<boolean> => {
    if (!user) {
      toast.error("Deste kaydetmek için giriş yapmalısınız!");
      return false;
    }

    setIsSyncing(true);
    try {
      const cloudData = savedDeckToCloud(deck, user.id);

      if (isEdit) {
        const { error } = await (supabase
          .from("user_decks" as any) as any)
          .update(cloudData)
          .eq("id", deck.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast.success("Deste güncellendi!");
      } else {
        const { data, error } = await (supabase
          .from("user_decks" as any) as any)
          .insert(cloudData)
          .select()
          .single();

        if (error) throw error;
        toast.success("Deste kaydedildi!");
      }

      await fetchDecks();
      return true;
    } catch (error: any) {
      console.error("Error saving deck:", error);
      if (error.code === "23505") {
        toast.error("Bu isimde bir deste zaten var!");
      } else {
        toast.error("Deste kaydedilemedi!");
      }
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete deck
  const deleteDeck = async (deckId: string): Promise<boolean> => {
    if (!user) return false;

    setIsSyncing(true);
    try {
      const { error } = await (supabase
        .from("user_decks" as any) as any)
        .delete()
        .eq("id", deckId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Deste silindi!");
      await fetchDecks();
      return true;
    } catch (error) {
      console.error("Error deleting deck:", error);
      toast.error("Deste silinemedi!");
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Migrate localStorage decks to cloud (one-time sync)
  const migrateLocalDecks = async () => {
    if (!user) return;

    const localDecks = localStorage.getItem("acoria-saved-decks");
    if (!localDecks) return;

    const parsed: SavedDeck[] = JSON.parse(localDecks);
    if (parsed.length === 0) return;

    // Check if user already has cloud decks
    const { count } = await (supabase
      .from("user_decks" as any) as any)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (count && count > 0) {
      // User already has cloud decks, skip migration
      return;
    }

    // Migrate local decks to cloud
    setIsSyncing(true);
    try {
      const cloudDecks = parsed.map(deck => ({
        id: deck.id,
        ...savedDeckToCloud(deck, user.id),
      }));

      const { error } = await (supabase
        .from("user_decks" as any) as any)
        .insert(cloudDecks);

      if (error) throw error;

      toast.success(`${parsed.length} deste buluta aktarıldı!`);
      await fetchDecks();
    } catch (error) {
      console.error("Migration error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Initial fetch and migration
  useEffect(() => {
    if (user) {
      fetchDecks().then(() => migrateLocalDecks());
    } else {
      // Load from localStorage for non-authenticated users
      const stored = localStorage.getItem("acoria-saved-decks");
      if (stored) {
        setDecks(JSON.parse(stored));
      }
      setIsLoading(false);
    }
  }, [user, fetchDecks]);

  return {
    decks,
    isLoading,
    isSyncing,
    saveDeck,
    deleteDeck,
    fetchDecks,
  };
}
