import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Coins, Lock, ShoppingCart, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TAVERNER_QUOTES, ALL_SHOP_ITEMS, ShopItem } from "@/data/shopData";

export default function Shop() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [quote, setQuote] = useState("");
  const [coins, setCoins] = useState(0);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"cardback" | "hero">("cardback");

  // Load User Data with Realtime subscription
  useEffect(() => {
    if (!user) return;
    
    const fetchUserData = async () => {
      // Fetch coins and unlocked_items from profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select("divine_coins, unlocked_items")
        .eq("id", user.id) // IMPORTANT: changed user_id to id to match schema used in GameArena
        .maybeSingle();
      
      if (data) {
        setCoins((data as any).divine_coins || 0);
        // Ensure unlocked_items is an array
        const items = (data as any).unlocked_items;
        if (Array.isArray(items)) {
            setUnlockedItems(items);
        } else {
            setUnlockedItems([]);
        }
      } else {
        setCoins(0); 
        setUnlockedItems([]);
      }
    };
    
    fetchUserData();

    // Subscribe to coin changes
    const channel = supabase
      .channel("shop-coins")
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload: any) => {
          if (payload.new?.divine_coins !== undefined) {
            setCoins(payload.new.divine_coins);
          }
        }
      )
      .subscribe();

    // Random Quote
    const quotes = language === "tr" ? TAVERNER_QUOTES.tr : TAVERNER_QUOTES.en;
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, language]);

  const handlePurchase = async (item: ShopItem) => {
    if (unlockedItems.includes(item.id)) return;

    if (coins < item.price) {
      toast.error(language === "tr" ? "Yetersiz Divine Coin!" : "Insufficient Divine Coins!");
      return;
    }

    // Mock Transaction (Optimistic)
    const newCoins = coins - item.price;
    const newUnlocked = [...unlockedItems, item.id];

    // Optimistic UI
    setCoins(newCoins);
    setUnlockedItems(newUnlocked);
    toast.success(language === "tr" ? "Satın alma başarılı!" : "Purchase successful!");

    // Real DB Update
    if (user) {
        // We need to update both coins and the array.
        // Supabase basic update:
        const { error } = await supabase.from("profiles").update({
            divine_coins: newCoins,
            unlocked_items: newUnlocked
        } as any).eq("id", user.id);
        
        if (error) {
            console.error("Purchase failed", error);
            toast.error("Bağlantı hatası: İşlem kaydedilemedi.");
            // Revert state if needed, but for now just warn
        }
    }
  };

  const filteredItems = ALL_SHOP_ITEMS.filter(i => i.type === activeTab);

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col md:flex-row font-cinzel text-amber-500 overflow-hidden relative">
      
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[url('/assets/texture_paper.png')] opacity-20 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-80" />

      {/* LEFT: Taverner Section */}
      <div className="md:w-1/3 h-[40vh] md:h-screen relative flex flex-col items-center justify-end p-4 md:border-r border-amber-900/50 bg-black/40">
        
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="absolute top-4 left-4 text-amber-500/80 hover:text-amber-200 z-50"
          onClick={() => navigate("/menu")}
        >
           <ArrowLeft className="mr-2 h-5 w-5" /> 
           {language === "tr" ? "MENÜ" : "MENU"}
        </Button>

        {/* Currency Display (Mobile) */}
        <div className="md:hidden absolute top-4 right-4 flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full border border-amber-500/30">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-100 font-bold">{coins.toLocaleString()}</span>
        </div>

        {/* Speech Bubble */}
        <div className="relative mb-8 p-6 bg-stone-900/90 border-2 border-amber-700 rounded-2xl max-w-sm animate-in fade-in slide-in-from-left duration-700 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
           <p className="text-lg italic text-amber-100/90 leading-relaxed text-center">"{quote}"</p>
           {/* Triangle */}
           <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-stone-900 border-b-2 border-r-2 border-amber-700 rotate-45" />
        </div>

        {/* Taverner Image */}
        <div className="relative w-full max-w-sm aspect-square">
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-stone-950 to-transparent z-10" />
            <img 
              src="/assets/taverner.jpg" 
              onError={(e) => e.currentTarget.src = "https://via.placeholder.com/400x400?text=Taverner"}
              alt="Taverner" 
              className="w-full h-full object-cover object-top mask-image-gradient-b drop-shadow-[0_0_50px_rgba(200,100,0,0.2)]"
            />
        </div>
      </div>

      {/* RIGHT: Shop Items */}
      <div className="flex-1 flex flex-col h-[60vh] md:h-screen relative bg-stone-900/50">
         
         {/* Top Bar (Desktop) */}
         <div className="hidden md:flex justify-between items-center p-8 border-b border-amber-900/30 bg-stone-950/50 backdrop-blur-md">
            <h1 className="text-4xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-700">
               {language === "tr" ? "PAZAR YERİ" : "MARKETPLACE"}
            </h1>
            <div className="flex items-center gap-3 bg-black/40 px-6 py-3 rounded-xl border border-amber-500/30 shadow-inner">
                <Coins className="w-6 h-6 text-yellow-500 drop-shadow-md animate-pulse" />
                <span className="text-2xl font-bold text-yellow-100/90">{coins.toLocaleString()}</span>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex justify-center gap-4 p-6">
            <TabButton 
               active={activeTab === "cardback"} 
               onClick={() => setActiveTab("cardback")}
               label={language === "tr" ? "KART ARKALIKLARI" : "CARD BACKS"}
            />
            <TabButton 
               active={activeTab === "hero"} 
               onClick={() => setActiveTab("hero")}
               label={language === "tr" ? "KAHRAMANLAR" : "HEROES"}
            />
         </div>

         {/* Items Grid */}
         <div className="flex-1 overflow-y-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 align-start content-start acoria-scrollbar">
            {filteredItems.map(item => {
               const isUnlocked = unlockedItems.includes(item.id);
               const canAfford = coins >= item.price;
               
               return (
                  <div key={item.id} className="group relative bg-stone-950/80 border border-amber-800/50 rounded-xl overflow-hidden hover:border-amber-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] hover:-translate-y-1">
                     
                     {/* Image Placeholder */}
                     <div className="h-48 bg-stone-900 relative flex items-center justify-center overflow-hidden">
                        {/* Here we would put real images. For now placeholders or CSS art */}
                        <div className={`w-32 h-44 rounded-lg shadow-2xl transform group-hover:scale-105 transition-transform duration-500 ${isUnlocked ? 'grayscale-0' : 'grayscale-[0.3]'}`}
                             style={{ background: item.type === 'cardback' ? `linear-gradient(45deg, #333, #666)` : `url(/assets/avatars/${item.image}.jpg) center/cover` }}>
                             {/* Mock Visual */}
                             {item.type === 'cardback' && <div className="w-full h-full flex items-center justify-center border-4 border-amber-700/50 rounded-lg">
                                 <span className="text-4xl">🃏</span>
                             </div>}
                        </div>
                        
                        {isUnlocked && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-green-500 font-bold border-2 border-green-500 px-4 py-2 -rotate-12 text-xl tracking-widest">{language === "tr" ? "SAHİPSİN" : "OWNED"}</span>
                            </div>
                        )}
                     </div>

                     <div className="p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                           <div>
                              <h3 className="text-xl font-bold text-amber-100 group-hover:text-amber-400 transition-colors">{language === "tr" ? item.name.tr : item.name.en}</h3>
                              <p className="text-xs text-amber-500/60">{language === "tr" ? item.desc.tr : item.desc.en}</p>
                           </div>
                           <div className="text-right">
                              <span className={cn("font-bold text-lg", canAfford ? "text-yellow-400" : "text-red-400")}>{item.price.toLocaleString()}</span>
                              <Coins className="w-4 h-4 inline ml-1 -mt-1 text-yellow-600" />
                           </div>
                        </div>

                        <Button 
                           disabled={isUnlocked || !canAfford}
                           onClick={() => handlePurchase(item)}
                           className={cn(
                              "w-full mt-2 font-bold tracking-widest",
                              isUnlocked 
                                 ? "bg-green-900/20 text-green-700 border border-green-900/50" 
                                 : canAfford 
                                    ? "bg-amber-700 hover:bg-amber-600 text-white" 
                                    : "bg-red-900/20 text-red-500 border border-red-900/50 cursor-not-allowed"
                           )}
                        >
                           {isUnlocked 
                              ? (language === "tr" ? "ENVANTERDE" : "IN INVENTORY") 
                              : (language === "tr" ? "SATIN AL" : "PURCHASE")}
                        </Button>
                     </div>
                  </div>
               );
            })}
         </div>

      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button 
           onClick={onClick}
           className={cn(
             "px-6 py-2 rounded-full border transition-all duration-300 font-bold text-sm tracking-widest uppercase",
             active 
               ? "bg-amber-600 text-black border-amber-600 shadow-[0_0_20px_rgba(217,119,6,0.4)]" 
               : "bg-transparent text-amber-600/50 border-amber-600/20 hover:border-amber-600/50 hover:text-amber-500"
           )}
        >
            {label}
        </button>
    );
}
