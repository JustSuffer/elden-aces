import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Coins, CreditCard, Lock, Sparkles, Gem, ArrowRight, ShieldCheck, Crown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CoinPackage {
  id: string;
  amount: number;
  priceUSD: number;
  priceTRY: number;
  nameTR: string;
  nameEN: string;
  descriptionTR: string;
  descriptionEN: string;
  popular?: boolean;
  bestValue?: boolean;
}

const PACKAGES: CoinPackage[] = [
  {
    id: "pkg_starter",
    amount: 5000,
    priceUSD: 4.99,
    priceTRY: 179.00,
    nameTR: "Başlangıç Kese",
    nameEN: "Starter Pouch",
    descriptionTR: "Temel fiyat. (1k Coin ≈ $1)",
    descriptionEN: "Basic rate. (1k Coin ≈ $1)"
  },
  {
    id: "pkg_adventurer",
    amount: 7500,
    priceUSD: 6.99,
    priceTRY: 249.00,
    nameTR: "Maceracı Çantası",
    nameEN: "Adventurer's Bag",
    descriptionTR: "Ufak bir avantaj sağlar.",
    descriptionEN: "Provides a small advantage."
  },
  {
    id: "pkg_knight",
    amount: 10000,
    priceUSD: 8.99,
    priceTRY: 329.00,
    nameTR: "Şövalye Sandığı",
    nameEN: "Knight's Chest",
    descriptionTR: "En popüler olması hedeflenen paket.",
    descriptionEN: "Targeted to be the most popular.",
    popular: true
  },
  {
    id: "pkg_baron",
    amount: 15000,
    priceUSD: 12.99,
    priceTRY: 469.00,
    nameTR: "Baron Hazinesi",
    nameEN: "Baron's Treasure",
    descriptionTR: "Ara paket.",
    descriptionEN: "Mid-tier package."
  },
  {
    id: "pkg_royal",
    amount: 20000,
    priceUSD: 16.99,
    priceTRY: 649.00,
    nameTR: "Kraliyet Kasası",
    nameEN: "Royal Vault",
    descriptionTR: "Ciddi oyuncular için.",
    descriptionEN: "For serious players."
  },
  {
    id: "pkg_dragon",
    amount: 30000,
    priceUSD: 24.99,
    priceTRY: 899.00,
    nameTR: "Ejderha Yığını",
    nameEN: "Dragon's Hoard",
    descriptionTR: "%15+ kâr hissi verir.",
    descriptionEN: "Gives 15%+ profit feel."
  },
  {
    id: "pkg_yorea",
    amount: 50000,
    priceUSD: 39.99,
    priceTRY: 1399.00,
    nameTR: "YOREA'nın Serveti",
    nameEN: "Wealth of YOREA",
    descriptionTR: "\"En İyi Fiyat\" etiketi buraya yapışır.",
    descriptionEN: "\"Best Value\" label sticks here.",
    bestValue: true
  }
];

export default function Checkout() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0);

  // Fetch Coins
  useEffect(() => {
    if (!user) return;
    const fetchCoins = async () => {
      const { data } = await supabase.from("profiles").select("divine_coins").eq("user_id", user.id).single();
      if (data) setCoins(data.divine_coins || 0);
    };
    fetchCoins();
    
    // Subscribe
    const channel = supabase
      .channel("checkout-coins")
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `user_id=eq.${user.id}` }, 
        (payload: any) => { if (payload.new?.divine_coins !== undefined) setCoins(payload.new.divine_coins); }
      )
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handlePurchase = (pkg: CoinPackage) => {
    toast.error(language === "tr" ? "Ödeme sistemi şu anda kapalıdır." : "Payment system is currently closed.");
  };

  return (
    <div className="min-h-screen bg-black text-gold relative overflow-x-hidden font-cinzel selection:bg-gold/30">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black -z-50" />
      <div className="fixed inset-0 bg-[url('./assets/hex-pattern.png')] opacity-5 -z-40" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-gold/10 bg-black/80">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)} 
              className="hover:bg-gold/10 hover:text-gold text-gold/70"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold tracking-widest bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
              {language === "tr" ? "COIN MAĞAZASI" : "COIN STORE"}
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-full border border-gold/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
            <Coins className="w-5 h-5 text-yellow-500 animate-pulse" />
            <span className="text-xl font-bold text-yellow-100 tabular-nums">
              {coins.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-32">
        {/* Intro Section */}
        <div className="text-center mb-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold/80 text-sm mb-4"
          >
            <ShieldCheck className="w-4 h-4" />
            {language === "tr" ? "Güvenli Ödeme & Anında Teslimat" : "Secure Payment & Instant Delivery"}
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-2"
          >
            {language === "tr" ? "Hazineni Doldur" : "Fill Your Treasury"}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gold/60 max-w-2xl mx-auto text-lg"
          >
            {language === "tr" 
              ? "Divine Coin satın alarak yeni kahramanlar, kart arkaları ve özel kozmetikler aç." 
              : "Purchase Divine Coins to unlock new heroes, card backs, and exclusive cosmetics."}
          </motion.p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PACKAGES.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={cn(
                "group relative bg-slate-900/60 border rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]",
                pkg.popular 
                  ? "border-amber-500/60 bg-gradient-to-b from-amber-950/40 to-slate-900/60" 
                  : pkg.bestValue
                    ? "border-purple-500/60 bg-gradient-to-b from-purple-950/40 to-slate-900/60"
                    : "border-white/10 hover:border-gold/30"
              )}
            >
              {/* Badges */}
              {pkg.popular && (
                <div className="absolute top-0 right-0 z-10">
                  <div className="bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg shadow-lg flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    {language === "tr" ? "EN POPÜLER" : "MOST POPULAR"}
                  </div>
                </div>
              )}
              {pkg.bestValue && (
                <div className="absolute top-0 right-0 z-10">
                  <div className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-lg flex items-center gap-1">
                    <Gem className="w-3 h-3" />
                    {language === "tr" ? "EN İYİ FİYAT" : "BEST VALUE"}
                  </div>
                </div>
              )}

              <div className="p-6 flex flex-col h-full">
                {/* Visual */}
                <div className="flex justify-center mb-6 relative">
                  <div className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 duration-500",
                    pkg.popular || pkg.bestValue ? "bg-gold/20" : "bg-slate-800"
                  )}>
                    <Coins className={cn(
                      "w-12 h-12",
                      pkg.bestValue ? "text-purple-400" : "text-amber-400"
                    )} />
                  </div>
                  {/* Glow Effect */}
                  <div className={cn(
                    "absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500",
                    pkg.bestValue ? "bg-purple-500" : "bg-amber-500"
                  )} />
                </div>

                {/* Content */}
                <div className="text-center mb-6 flex-grow">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-gold transition-colors">
                    {language === "tr" ? pkg.nameTR : pkg.nameEN}
                  </h3>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 mb-2">
                    {pkg.amount.toLocaleString()} <span className="text-base text-gold/70">DC</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {language === "tr" ? pkg.descriptionTR : pkg.descriptionEN}
                  </p>
                </div>

                {/* Price & Action */}
                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-400 px-2">
                    <span>USD: ${pkg.priceUSD}</span>
                    <span>TRY: {pkg.priceTRY} ₺</span>
                  </div>
                  
                  <Button 
                    className={cn(
                      "w-full h-12 text-lg font-bold relative overflow-hidden transition-all",
                      pkg.bestValue 
                        ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                        : "bg-gold hover:bg-yellow-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                    )}
                    onClick={() => handlePurchase(pkg)}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 transform skew-y-12" />
                    <span className="relative z-10 flex items-center gap-2">
                      {language === "tr" ? "SATIN AL" : "PURCHASE"}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
