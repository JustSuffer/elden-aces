import { MenuButton } from "@/components/ui/menu-button";
import logo from "@/assets/acoria-logo.png";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Create Account / Login", onClick: () => console.log("Login") },
    { label: "Play Online (1v1 PvP)", onClick: () => console.log("Play Online") },
    { label: "Play vs Bot", onClick: () => navigate("/game") },
    { label: "Deck Builder", onClick: () => console.log("Deck") },
    { label: "Card Library", onClick: () => console.log("Library") },
    { label: "Settings", onClick: () => console.log("Settings") },
    { label: "Credits", onClick: () => console.log("Credits") },
  ];

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
          {menuItems.map((item, index) => (
            <MenuButton
              key={index}
              variant={index < 3 ? "primary" : "secondary"}
              onClick={item.onClick}
              className="w-full"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {item.label}
            </MenuButton>
          ))}
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

export default Index;
