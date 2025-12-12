import { MenuButton } from "@/components/ui/menu-button";
import logo from "@/assets/acoria-logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

const Menu = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Atmospheric Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-muted/20 via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      {/* Mist Effect */}
      <div className="absolute inset-0 bg-mist opacity-30 animate-pulse" style={{ animationDuration: '4s' }} />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-12 px-4 max-w-2xl w-full">
        {/* Logo */}
        <div className="relative">
          <img 
            src={logo} 
            alt="ACORIA" 
            className="w-64 md:w-80 h-auto drop-shadow-2xl animate-float"
          />
          <div className="absolute inset-0 bg-primary/10 blur-3xl -z-10 animate-pulse" style={{ animationDuration: '3s' }} />
        </div>

        {/* Subtitle */}
        <p className="text-muted-foreground text-sm md:text-base tracking-[0.3em] uppercase text-center glow-gold opacity-80">
          A Divine Card Game of Strategy
        </p>

        {/* Menu Items */}
        <div className="flex flex-col space-y-4 w-full max-w-md">
          <MenuButton onClick={() => navigate("/play")} variant="primary">
            Çevrimiçi Oyna
          </MenuButton>
          <MenuButton onClick={() => navigate("/game")}>
            Bot ile Oyna
          </MenuButton>
          <MenuButton onClick={() => navigate("/profile")}>
            Profil
          </MenuButton>
          <MenuButton onClick={() => navigate("/card-library")}>
            Kart Kütüphanesi
          </MenuButton>
          <MenuButton onClick={() => navigate("/deck-builder")}>
            Deste Oluşturucu
          </MenuButton>
          <MenuButton onClick={() => navigate("/settings")}>
            Ayarlar
          </MenuButton>
          <MenuButton onClick={() => navigate("/credits")}>
            Ekip
          </MenuButton>
          <MenuButton onClick={() => navigate("/how-to-play")}>
            Nasıl Oynanır
          </MenuButton>
          <MenuButton onClick={() => navigate("/tutorial")}>
            Eğitim
          </MenuButton>
          
          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 py-3 px-6 text-muted-foreground/70 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm tracking-wider">Çıkış Yap</span>
          </button>
        </div>

        {/* Version Info */}
        <div className="text-muted-foreground/50 text-xs tracking-widest pt-8">
          ALPHA VERSION 0.1
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border border-primary/20 rounded-full animate-spin-slow" />
      <div className="absolute bottom-20 right-20 w-48 h-48 border border-primary/10 rounded-full animate-spin-slower" />
    </div>
  );
};

export default Menu;
