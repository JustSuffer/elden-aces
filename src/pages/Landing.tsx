import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import logo from "@/assets/acoria-logo.png";
import { Sparkles, Sword, Shield } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  // If already logged in, redirect to main menu
  useEffect(() => {
    if (user && !loading) {
      navigate("/menu");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl animate-pulse">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Deep Atmospheric Background */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent" />

      {/* Animated Mist Layers */}
      <div className="absolute inset-0 bg-mist opacity-20 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute inset-0 bg-mist opacity-15 animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />

      {/* Decorative Circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-primary/10 rounded-full animate-spin-slow opacity-30" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-primary/5 rounded-full animate-spin-slower opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/5 rounded-full" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4 max-w-2xl w-full">
        {/* Logo with Glow */}
        <div className="relative mb-8 animate-float" style={{ animationDuration: '4s' }}>
          <img
            src={logo}
            alt="ACORIA"
            className="w-72 md:w-96 h-auto drop-shadow-2xl"
          />
          <div className="absolute inset-0 bg-primary/20 blur-3xl -z-10 animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute -inset-4 bg-gradient-radial from-primary/10 to-transparent -z-20" />
        </div>

        {/* Divine Subtitle */}
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50" />
          <Sparkles className="w-5 h-5 text-primary/70 animate-pulse" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50" />
        </div>

        <h2 className="text-primary/80 text-sm md:text-base tracking-[0.4em] uppercase text-center font-cinzel mb-2">
          {t("landing.title1")}
        </h2>
        <p className="text-muted-foreground text-xs md:text-sm tracking-[0.2em] uppercase text-center mb-16">
          {t("landing.title2")}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-4 w-full max-w-sm">
          {/* Start Adventure Button - Primary */}
          <button
            onClick={() => navigate("/auth?tab=signup")}
            className="group relative w-full py-5 px-8 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 
                       border-2 border-primary/50 rounded-lg overflow-hidden
                       hover:border-primary hover:from-primary/30 hover:via-primary/40 hover:to-primary/30
                       transition-all duration-500 transform hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent 
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
            <div className="relative flex items-center justify-center gap-3">
              <Sword className="w-5 h-5 text-primary" />
              <span className="text-lg font-cinzel tracking-[0.15em] text-primary">
                {t("landing.cta.start")}
              </span>
              <Shield className="w-5 h-5 text-primary" />
            </div>
          </button>

          {/* Login Button - Secondary */}
          <button
            onClick={() => navigate("/auth?tab=login")}
            className="group relative w-full py-4 px-8 bg-transparent
                       border border-muted-foreground/30 rounded-lg
                       hover:border-primary/50 hover:bg-primary/5
                       transition-all duration-300"
          >
            <span className="text-base font-cinzel tracking-[0.15em] text-muted-foreground group-hover:text-primary transition-colors">
              {t("landing.cta.login")}
            </span>
          </button>
        </div>

        {/* Version Info */}
        <div className="mt-20 text-muted-foreground/40 text-xs tracking-[0.3em]">
          {t("common.version")}
        </div>
      </div>

      {/* Bottom Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
};

export default Landing;
