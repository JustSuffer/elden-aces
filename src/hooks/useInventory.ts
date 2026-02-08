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

      // 2. Load from Supabase (Source of Truth)
      let dbItems: string[] = [];
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("unlocked_items, divine_coins")
          .eq("user_id", user.id)
          .maybeSingle() as any;

        if (data) {
          // If DB has data, use it (and merge possibly)
          // Note: `unlocked_items` is not in official types yet, so cast as any
          const rawItems = (data as any).unlocked_items;
          if (Array.isArray(rawItems)) {
            dbItems = rawItems;
          }
          
          if (typeof data.divine_coins === 'number') {
             currentCoins = data.divine_coins;
             // Update local storage to match DB
             localStorage.setItem(coinsKey, currentCoins.toString());
          }
        }
      } catch (e) {
        console.error("Failed to load inventory from Supabase:", e);
      }

      // Merge unique items
      const allItems = Array.from(new Set([...localItems, ...dbItems]));
      setUnlockedItems(allItems);
      setCoins(currentCoins);
      
      // Sync merged back to local storage
      localStorage.setItem(localKey, JSON.stringify(allItems));
      
      setIsLoading(false);
    };

    loadInventory();
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
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
            divine_coins: newCoins,
            unlocked_items: newItems 
        } as any)
        .eq("user_id", user.id);

      if (error) {
        console.error("Supabase purchase update failed:", error);
        // We don't revert here to avoid bad UX, we trust local storage as fallback
        // Maybe toast a warning: "Saved locally only."
      }
    } catch (e) {
      console.error("Supabase purchase error:", e);
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
