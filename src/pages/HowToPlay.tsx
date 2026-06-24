import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dices, Sword, Shield, Zap, Sparkles, AlertTriangle, BookOpen, Skull, Flame } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 15 } }
};

const HowToPlay = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const handleFinish = () => {
    localStorage.setItem("acoria_has_seen_how_to_play", "true");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black relative overflow-x-hidden text-foreground selection:bg-purple-900 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/40 via-black to-black" />
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-amber-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute inset-0 bg-[url('./assets/hex-pattern.png')] opacity-[0.05]" />
      </div>

      {/* Header Sticky */}
      <div className="relative z-20 flex items-center justify-between p-4 md:p-6 border-b border-purple-900/50 bg-black/60 backdrop-blur-xl sticky top-0 shadow-2xl shadow-black">
        <Button variant="ghost" onClick={handleFinish} className="gap-2 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t("howToPlay.back")}
        </Button>
        <div className="text-xl md:text-2xl font-bold font-cinzel text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] tracking-widest">
          {t("howToPlay.title")}
        </div>
        <div className="w-24 hidden md:block" />
      </div>

      {/* Main Content */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl mx-auto p-6 md:p-12 space-y-20 pb-40"
      >
        {/* Intro */}
        <motion.section variants={itemVariants} className="text-center space-y-6 pt-10">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
          <h1 className="text-5xl md:text-6xl font-bold font-cinzel bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-transparent bg-clip-text drop-shadow-sm pb-2">
            {language === 'tr' ? 'ACORIA\'YA HOŞ GELDİN' : 'WELCOME TO ACORIA'}
          </h1>
          <p className="text-xl text-purple-200/80 leading-relaxed max-w-3xl mx-auto font-light">
            {t("howToPlay.intro.text")}
          </p>
        </motion.section>

        {/* 1. Setup & Basics */}
        <motion.section variants={itemVariants} className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative bg-black/40 border border-purple-500/30 rounded-2xl p-8 md:p-10 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            <h2 className="text-3xl font-bold font-cinzel text-purple-300 flex items-center gap-4 mb-8 border-b border-purple-500/20 pb-4">
              <Shield className="w-8 h-8 text-purple-400" />
              1. {t("howToPlay.section.structure")}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-purple-400"/> {t("howToPlay.structure.setup.title")}</h3>
                <ul className="space-y-3 text-purple-200/80 text-lg">
                  <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-amber-400 mt-2" /> {t("howToPlay.structure.setup.1")}</li>
                  <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-amber-400 mt-2" /> {t("howToPlay.structure.setup.2")}</li>
                  <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-amber-400 mt-2" /> {t("howToPlay.structure.setup.3")}</li>
                  <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-amber-400 mt-2" /> {t("howToPlay.structure.setup.4")}</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><Flame className="w-5 h-5 text-amber-500"/> {t("howToPlay.structure.flow.title")}</h3>
                <ul className="space-y-3 text-purple-200/80 text-lg">
                  <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-indigo-400 mt-2" /> {t("howToPlay.structure.flow.1")}</li>
                  <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-indigo-400 mt-2" /> {t("howToPlay.structure.flow.2")}</li>
                  <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-indigo-400 mt-2" /> {t("howToPlay.structure.flow.3")}</li>
                  <li className="flex items-start gap-3"><div className="w-2 h-2 rounded-full bg-indigo-400 mt-2" /> {t("howToPlay.structure.flow.4")}</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 2. Dice Rolls */}
        <motion.section variants={itemVariants} className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative bg-black/40 border border-amber-500/30 rounded-2xl p-8 md:p-10 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            <h2 className="text-3xl font-bold font-cinzel text-amber-400 flex items-center gap-4 mb-6 border-b border-amber-500/20 pb-4">
              <Dices className="w-8 h-8 text-amber-500" />
              2. {t("howToPlay.section.dice")}
            </h2>
            <p className="text-lg text-amber-100/80 mb-8">{t("howToPlay.dice.text")}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="bg-gradient-to-br from-red-950/80 to-black border border-red-500/30 p-4 rounded-xl text-center shadow-lg transform hover:-translate-y-1 transition-transform">
                <div className="text-2xl font-bold text-red-500 mb-2">1-5</div>
                <div className="text-sm text-red-200/80 leading-tight">{t("howToPlay.dice.1_5")}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-950/80 to-black border border-orange-500/30 p-4 rounded-xl text-center shadow-lg transform hover:-translate-y-1 transition-transform">
                <div className="text-2xl font-bold text-orange-400 mb-2">6-10</div>
                <div className="text-sm text-orange-200/80 leading-tight">{t("howToPlay.dice.6_10")}</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-950/80 to-black border border-yellow-500/30 p-4 rounded-xl text-center shadow-lg transform hover:-translate-y-1 transition-transform">
                <div className="text-2xl font-bold text-yellow-400 mb-2">11-15</div>
                <div className="text-sm text-yellow-200/80 leading-tight">{t("howToPlay.dice.11_15")}</div>
              </div>
              <div className="bg-gradient-to-br from-green-950/80 to-black border border-green-500/30 p-4 rounded-xl text-center shadow-lg transform hover:-translate-y-1 transition-transform">
                <div className="text-2xl font-bold text-green-400 mb-2">16-18</div>
                <div className="text-sm text-green-200/80 leading-tight">{t("howToPlay.dice.16_18")}</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-900/80 to-black border border-emerald-400/50 p-4 rounded-xl text-center shadow-[0_0_15px_rgba(52,211,153,0.3)] transform hover:-translate-y-1 transition-transform relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity"/>
                <div className="text-2xl font-bold text-emerald-300 mb-2 drop-shadow-md">19-20</div>
                <div className="text-sm text-emerald-100/90 leading-tight">{t("howToPlay.dice.19_20")}</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 3. Combat & Damage */}
        <motion.section variants={itemVariants} className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative bg-black/40 border border-red-500/30 rounded-2xl p-8 md:p-10 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            <h2 className="text-3xl font-bold font-cinzel text-red-400 flex items-center gap-4 mb-6 border-b border-red-500/20 pb-4">
              <Zap className="w-8 h-8 text-red-500" />
              3. {t("howToPlay.section.damage")}
            </h2>
            <p className="text-lg text-red-100/80 mb-8">{t("howToPlay.damage.intro")}</p>
            
            <ol className="grid md:grid-cols-2 gap-4">
              <li className="bg-red-950/30 border border-red-900/50 p-5 rounded-xl hover:bg-red-900/30 transition-colors">
                <strong className="text-red-300 text-lg block mb-1">1. {t("howToPlay.damage.step1.title")}</strong>
                <p className="text-red-100/70">{t("howToPlay.damage.step1.text")}</p>
              </li>
              <li className="bg-red-950/30 border border-red-900/50 p-5 rounded-xl hover:bg-red-900/30 transition-colors">
                <strong className="text-red-300 text-lg block mb-1">2. {t("howToPlay.damage.step2.title")}</strong>
                <p className="text-red-100/70">{t("howToPlay.damage.step2.text")}</p>
              </li>
              <li className="bg-red-950/30 border border-red-900/50 p-5 rounded-xl hover:bg-red-900/30 transition-colors">
                <strong className="text-red-300 text-lg block mb-1">3. {t("howToPlay.damage.step3.title")}</strong>
                <p className="text-red-100/70">{t("howToPlay.damage.step3.text")}</p>
              </li>
              <li className="bg-red-950/30 border border-red-900/50 p-5 rounded-xl hover:bg-red-900/30 transition-colors">
                <strong className="text-red-300 text-lg block mb-1">4. {t("howToPlay.damage.step4.title")}</strong>
                <p className="text-red-100/70">{t("howToPlay.damage.step4.text")}</p>
              </li>
              <li className="bg-red-950/30 border border-red-900/50 p-5 rounded-xl hover:bg-red-900/30 transition-colors md:col-span-2 text-center">
                <strong className="text-red-400 text-lg block mb-1">5. {t("howToPlay.damage.step5.title")}</strong>
                <p className="text-red-100/70 max-w-2xl mx-auto">{t("howToPlay.damage.step5.text")}</p>
              </li>
            </ol>
          </div>
        </motion.section>

        {/* 4. Tips & Strategy */}
        <motion.section variants={itemVariants} className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative bg-black/40 border border-blue-500/30 rounded-2xl p-8 md:p-10 backdrop-blur-sm shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            <h2 className="text-3xl font-bold font-cinzel text-cyan-300 flex items-center gap-4 mb-8 border-b border-cyan-500/20 pb-4">
              <Sword className="w-8 h-8 text-cyan-400" />
              4. {t("howToPlay.section.tips")}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4 items-start bg-blue-950/30 p-5 rounded-xl border border-blue-900/50">
                <div className="mt-1 bg-blue-500/20 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-blue-400"/></div>
                <div>
                  <h4 className="font-bold text-blue-300 text-lg mb-1">{language === 'tr' ? 'Erken Oyun' : 'Early Game'}</h4>
                  <p className="text-blue-100/70">{t("howToPlay.tips.early")}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-indigo-950/30 p-5 rounded-xl border border-indigo-900/50">
                <div className="mt-1 bg-indigo-500/20 p-2 rounded-lg"><Shield className="w-5 h-5 text-indigo-400"/></div>
                <div>
                  <h4 className="font-bold text-indigo-300 text-lg mb-1">{language === 'tr' ? 'Orta Oyun' : 'Mid Game'}</h4>
                  <p className="text-indigo-100/70">{t("howToPlay.tips.mid")}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-purple-950/30 p-5 rounded-xl border border-purple-900/50">
                <div className="mt-1 bg-purple-500/20 p-2 rounded-lg"><Skull className="w-5 h-5 text-purple-400"/></div>
                <div>
                  <h4 className="font-bold text-purple-300 text-lg mb-1">{language === 'tr' ? 'Geç Oyun' : 'Late Game'}</h4>
                  <p className="text-purple-100/70">{t("howToPlay.tips.late")}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start bg-amber-950/30 p-5 rounded-xl border border-amber-900/50">
                <div className="mt-1 bg-amber-500/20 p-2 rounded-lg"><Dices className="w-5 h-5 text-amber-400"/></div>
                <div>
                  <h4 className="font-bold text-amber-300 text-lg mb-1">{language === 'tr' ? 'Zar Şansı' : 'Dice Luck'}</h4>
                  <p className="text-amber-100/70">{t("howToPlay.tips.dice")}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.div variants={itemVariants} className="pt-10 flex justify-center">
          <button 
            onClick={handleFinish}
            className="group relative inline-flex items-center justify-center gap-3 px-12 py-5 text-lg md:text-xl font-bold tracking-[0.2em] uppercase text-amber-300 bg-black border-2 border-amber-500/50 rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:shadow-[0_0_50px_rgba(251,191,36,0.4)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-amber-400/20 to-amber-600/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span>{language === 'tr' ? 'ARTIK HAZIRIM' : 'I AM READY'}</span>
            <Sword className="w-6 h-6 animate-bounce" />
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default HowToPlay;
