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
        .eq("user_id", user.id)
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
        } as any).eq("user_id", user.id);
        
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
                  <div key={item.id} className="group relative bg-stone-950 border border-amber-800/50 rounded-xl overflow-hidden hover:border-amber-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,119,6,0.2)] hover:-translate-y-1 flex flex-col">
                     
                     {/* Image Section */}
                     <div className="h-96 bg-black/40 relative flex items-center justify-center overflow-hidden p-6">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                        
                        <div className={`w-56 h-80 rounded-xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500 ${isUnlocked ? 'grayscale-0' : 'grayscale-[0.3]'} border border-amber-900/30`}
                             style={{ 
                                 backgroundImage: item.type === 'cardback' ? `url(/assets/decks/${item.image})` : `url(/assets/avatars/${item.image})`,
                                 backgroundPosition: 'center',
                                 backgroundSize: 'contain',
                                 backgroundRepeat: 'no-repeat'
                             }}>
                        </div>
                        
                        {isUnlocked && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-green-400 font-bold border-2 border-green-500/50 bg-green-900/20 px-6 py-2 -rotate-12 text-xl tracking-[0.2em] shadow-lg backdrop-blur-md">
                                    {language === "tr" ? "SAHİPSİN" : "OWNED"}
                                </span>
                            </div>
                        )}
                     </div>

                     {/* Details Section */}
                     <div className="p-5 flex flex-col gap-4 bg-gradient-to-b from-stone-900 to-stone-950 flex-1 border-t border-amber-900/30">
                        <div className="flex justify-between items-start gap-2">
                           <div className="flex flex-col gap-1">
                              <h3 className="text-xl font-bold text-amber-100 group-hover:text-amber-400 transition-colors uppercase tracking-wide">
                                {language === "tr" ? item.name.tr : item.name.en}
                              </h3>
                              <p className="text-xs text-amber-500/60 font-medium leading-relaxed max-w-[150px]">
                                {language === "tr" ? item.desc.tr : item.desc.en}
                              </p>
                           </div>
                           <div className="text-right whitespace-nowrap bg-black/30 px-3 py-1 rounded-lg border border-amber-500/10">
                              <span className={cn("font-bold text-lg", canAfford ? "text-amber-400" : "text-red-400")}>
                                {item.price.toLocaleString()}
                              </span>
                              <Coins className="w-4 h-4 inline ml-1.5 -mt-1 text-amber-500" />
                           </div>
                        </div>

                        <div className="mt-auto pt-2">
                            <Button 
                               disabled={isUnlocked || !canAfford}
                               onClick={() => handlePurchase(item)}
                               className={cn(
                                  "w-full h-12 font-bold tracking-[0.15em] transition-all duration-300 relative overflow-hidden",
                                  isUnlocked 
                                     ? "bg-stone-800 text-stone-500 border border-stone-700 pointer-events-none" 
                                     : canAfford 
                                        ? "bg-amber-900/40 hover:bg-amber-600 text-amber-100 border border-amber-700 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(217,119,6,0.4)]" 
                                        : "bg-red-900/10 text-red-500 border border-red-900/30 cursor-not-allowed opacity-70"
                               )}
                            >
                               <span className="relative z-10 flex items-center justify-center gap-2">
                                   {isUnlocked 
                                      ? (language === "tr" ? "ENVANTERDE" : "IN INVENTORY") 
                                      : (language === "tr" ? "SATIN AL" : "PURCHASE")}
                               </span>
                            </Button>
                        </div>
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
