import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InventoryItem {
  id: string;
  type: "cardback" | "hero";
}

export function useInventory() {
  const { user } = useAuth();
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [coins, setCoins] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load inventory on mount or user change
  useEffect(() => {
    if (!user) {
      setUnlockedItems([]);
      setCoins(0);
      setIsLoading(false);
      return;
    }

    const loadInventory = async () => {
      setIsLoading(true);
      
      // 1. Load from LocalStorage (Fast/Offline fallback)
      const localKey = `inventory_${user.id}`;
      const savedInventory = localStorage.getItem(localKey);
      const localItems = savedInventory ? JSON.parse(savedInventory) : [];
      
      const coinsKey = `coins_${user.id}`;
      const savedCoins = localStorage.getItem(coinsKey);
      let currentCoins = savedCoins ? parseInt(savedCoins) : 0;
      
      // Initial set from local storage
      setUnlockedItems(localItems);
      setCoins(currentCoins);

      // 2. Load from Supabase (Source of Truth)
      // We fetch separately because 'unlocked_items' column might not exist yet, 
      // and we don't want that to break the coin fetching.
      
      // A. Fetch Coins
      try {
        const { data: coinData, error: coinError } = await supabase
          .from("profiles")
          .select("divine_coins")
          .eq("user_id", user.id)
          .maybeSingle();

        if (coinData && typeof coinData.divine_coins === 'number') {
           currentCoins = coinData.divine_coins;
           setCoins(currentCoins);
           localStorage.setItem(coinsKey, currentCoins.toString());
        } else if (coinError) {
            console.error("Error fetching coins:", coinError);
        }
      } catch (e) {
        console.error("Exception fetching coins:", e);
      }

      // B. Fetch Items
      let dbItems: string[] = [];
      try {
        const { data: itemData, error: itemError } = await supabase
          .from("profiles")
          .select("unlocked_items")
          .eq("user_id", user.id)
          .maybeSingle() as any;

        if (itemData) {
          const rawItems = itemData.unlocked_items;
          if (Array.isArray(rawItems)) {
            dbItems = rawItems;
          }
        } else if (itemError) {
            // This is expected if column is missing
             console.warn("Could not fetch unlocked_items (column might be missing):", itemError);
        }
      } catch (e) {
         console.warn("Exception fetching unlocked_items:", e);
      }
      
      setIsLoading(false);
    };

    loadInventory();

    // 3. Subscribe to Realtime Changes (Crucial for Coin Updates)
    const channel = supabase
      .channel("inventory-updates")
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          if (payload.new) {
             // Update Coins
             if (typeof payload.new.divine_coins === 'number') {
                 setCoins(payload.new.divine_coins);
                 localStorage.setItem(`coins_${user.id}`, payload.new.divine_coins.toString());
             }
             // Update Items
             if (Array.isArray(payload.new.unlocked_items)) {
                 const newItems = payload.new.unlocked_items;
                 setUnlockedItems(prev => {
                     const merged = Array.from(new Set([...prev, ...newItems]));
                     localStorage.setItem(`inventory_${user.id}`, JSON.stringify(merged));
                     return merged;
                 });
             }
          }
        }
      )
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [user]);

  const purchaseItem = async (itemId: string, price: number): Promise<boolean> => {
    if (!user) {
      toast.error("Satın almak için giriş yapmalısınız.");
      return false;
    }

    if (coins < price) {
      return false; // Insufficient funds handled by UI usually, but good check
    }

    if (unlockedItems.includes(itemId)) {
      return true; // Already owned
    }

    const newCoins = coins - price;
    const newItems = [...unlockedItems, itemId];

    // 1. Optimistic Update (Local State & Storage)
    setCoins(newCoins);
    setUnlockedItems(newItems);
    
    const localKey = `inventory_${user.id}`;
    localStorage.setItem(localKey, JSON.stringify(newItems));
    localStorage.setItem(`coins_${user.id}`, newCoins.toString());

    // 2. Persist to Supabase
    // We split updates because 'unlocked_items' might not exist.
    
    // A. Update Coins (Critical)
    try {
      const { error: coinError } = await supabase
        .from("profiles")
        .update({ divine_coins: newCoins })
        .eq("user_id", user.id);

      if (coinError) {
        console.error("Supabase coin update failed:", coinError);
      }
    } catch (e) {
      console.error("Exception updating coins:", e);
    }

    // B. Update Items (Optional - if column exists)
    try {
      const { error: itemError } = await supabase
        .from("profiles")
        .update({ unlocked_items: newItems } as any)
        .eq("user_id", user.id);

      if (itemError) {
        console.warn("Supabase item update failed (expected if column missing):", itemError);
      }
    } catch (e) {
      console.warn("Exception updating items:", e);
    }

    return true;
  };

  return {
    unlockedItems,
    coins,
    isLoading,
    purchaseItem,
    setCoins, // Expose for other optimistic updates if needed
  };
}
