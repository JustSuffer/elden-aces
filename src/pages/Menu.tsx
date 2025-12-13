import { MenuButton } from "@/components/ui/menu-button";
import logo from "@/assets/acoria-logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: { type: "spring", stiffness: 50, damping: 10 }
  }
};

const Menu = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Bio-Digital Background Grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            transform: 'perspective(500px) rotateX(60deg) translateY(-100px) scale(2)',
            maskImage: 'linear-gradient(to bottom, transparent, black, transparent)'
        }}
      />

      {/* Atmospheric Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-muted/20 via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      {/* Mist Effect */}
      <div className="absolute inset-0 bg-mist opacity-30 animate-pulse" style={{ animationDuration: '4s' }} />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 px-4 max-w-2xl w-full">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, type: "spring" }}
          className="relative"
        >
          <img 
            src={logo} 
            alt="ACORIA" 
            className="w-64 md:w-80 h-auto drop-shadow-2xl animate-float"
          />
          <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10 animate-pulse" style={{ animationDuration: '3s' }} />
        </motion.div>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.8 }}
          className="text-muted-foreground text-sm md:text-base tracking-[0.3em] uppercase text-center glow-gold"
        >
          {t("menu.subtitle")}
        </motion.p>

        {/* Menu Items */}
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col space-y-4 w-full max-w-lg"
        >
          <motion.div variants={itemVariants}>
             <MenuButton onClick={() => navigate("/play")} variant="primary" className="w-full h-16 text-xl tracking-widest shadow-lg shadow-primary/20">
               {t("menu.playOnline")}
             </MenuButton>
          </motion.div>
          <motion.div variants={itemVariants}>
             <MenuButton onClick={() => navigate("/game")} className="w-full h-14 text-lg">
               {t("menu.playBot")}
             </MenuButton>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
              <motion.div variants={itemVariants}>
                 <MenuButton onClick={() => navigate("/profile")} className="w-full h-14 text-base px-2">
                   {t("menu.profile")}
                 </MenuButton>
              </motion.div>
              <motion.div variants={itemVariants}>
                 <MenuButton onClick={() => navigate("/card-library")} className="w-full h-14 text-base px-2 whitespace-nowrap">
                   {t("menu.library")}
                 </MenuButton>
              </motion.div>
              <motion.div variants={itemVariants}>
                 <MenuButton onClick={() => navigate("/deck-builder")} className="w-full h-14 text-base px-2 whitespace-nowrap">
                   {t("menu.deckBuilder")}
                 </MenuButton>
              </motion.div>
              <motion.div variants={itemVariants}>
                 <MenuButton onClick={() => navigate("/settings")} className="w-full h-14 text-base px-2">
                   {t("menu.settings")}
                 </MenuButton>
              </motion.div>
          </div>

          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 pt-2">
             <MenuButton onClick={() => navigate("/credits")} className="h-10 text-xs px-1 border-white/20 hover:border-white/40">{t("menu.team")}</MenuButton>
             <MenuButton onClick={() => navigate("/how-to-play")} className="h-10 text-xs px-1 border-white/20 hover:border-white/40">{t("menu.howToPlay")}</MenuButton>
             <MenuButton onClick={() => navigate("/tutorial")} className="h-10 text-xs px-1 border-white/20 hover:border-white/40">{t("menu.tutorial")}</MenuButton>
          </motion.div>
          
          {/* Logout Button */}
          <motion.button
            variants={itemVariants}
            onClick={handleSignOut}
            whileHover={{ scale: 1.05, color: "#f87171" }}
            className="flex items-center justify-center gap-2 py-3 px-6 text-muted-foreground/70 transition-colors mx-auto mt-4"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm tracking-wider">{t("menu.logout")}</span>
          </motion.button>
        </motion.div>

        {/* Version Info */}
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 0.3 }} 
            transition={{ delay: 1.5 }}
            className="text-muted-foreground/50 text-xs tracking-widest pt-4"
        >
          {t("common.version")}
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border border-primary/20 rounded-full animate-spin-slow pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-48 h-48 border border-primary/10 rounded-full animate-spin-slower pointer-events-none" />
    </div>
  );
};

export default Menu;
