import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Settings, Maximize, Minimize, Sun, Flag, Play, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { getTrixEnabled, setTrixEnabled as persistTrix } from "@/hooks/useTrixAdvisor";
import trixIconAsset from "@/assets/trix-icon.asset.json";
const trixIcon = trixIconAsset.url;

interface GameMenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConcede: () => void;
  onResume: () => void; // Usually same as closing
  showTrixToggle?: boolean;
}

export function GameMenuModal({ open, onOpenChange, onConcede, onResume, showTrixToggle = false }: GameMenuModalProps) {
  const { language } = useLanguage();
  const [trixOn, setTrixOnState] = useState<boolean>(() => getTrixEnabled());
  const toggleTrix = () => {
    const next = !trixOn;
    setTrixOnState(next);
    persistTrix(next);
  };
  
  const strings = {
    title: {tr: "OYUN MENÜSÜ", en: "GAME MENU"},
    optionsTitle: {tr: "OYUN AYARLARI", en: "GAME OPTIONS"},
    resume: {tr: "DEVAM ET", en: "RESUME"},
    settings: {tr: "AYARLAR", en: "OPTIONS"},
    concede: {tr: "TESLİM OL", en: "CONCEDE"},
    screenMode: {tr: "EKRAN MODU", en: "SCREEN MODE"},
    fullscreen: {tr: "TAM EKRAN", en: "FULLSCREEN"},
    exitFullscreen: {tr: "TAM EKRANDAN ÇIK", en: "EXIT FULLSCREEN"},
    brightness: {tr: "PARLAKLIK", en: "BRIGHTNESS"},
    back: {tr: "GERİ DÖN", en: "GO BACK"},
  };

  const txt = (key: keyof typeof strings) => strings[key][language as "tr" | "en"] || strings[key]["en"];

  const [showOptions, setShowOptions] = useState(false);
  const [brightness, setBrightness] = useState([100]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Handle Brightness (Apply filter to body)
  useEffect(() => {
    const value = brightness[0] / 100;
    // We can't easily filter body per component, but we can put an overlay div
    // OR we can set a CSS variable on the root
    document.documentElement.style.filter = `brightness(${value})`;
    return () => {
      document.documentElement.style.filter = "brightness(1)";
    };
  }, [brightness]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-stone-900/95 border-amber-600/50 text-amber-500 font-cinzel p-0 gap-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Header */}
        <div className="bg-stone-950/80 p-4 border-b border-amber-600/30 flex items-center justify-center relative">
          <DialogTitle className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-t from-amber-600 to-amber-200">
             {showOptions ? txt("optionsTitle") : txt("title")}
          </DialogTitle>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-600/50" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1px] w-8 bg-gradient-to-l from-transparent to-amber-600/50" />
        </div>

        <div className="p-8 flex flex-col gap-4 items-center justify-center min-h-[300px] relative">
           
           {/* Background Art */}
           <div className="absolute inset-0 bg-[url('./assets/card-back-default.png')] opacity-5 pointer-events-none bg-center bg-no-repeat bg-contain" />

           {!showOptions ? (
             /* Main Menu */
             <>
                <MenuButton 
                  icon={<Play className="w-5 h-5" />} 
                  label={txt("resume")} 
                  onClick={onResume}
                  variant="primary"
                />
                
                <MenuButton 
                  icon={<Settings className="w-5 h-5" />} 
                  label={txt("settings")} 
                  onClick={() => setShowOptions(true)}
                />
                
                <div className="w-full h-[1px] bg-amber-600/20 my-2" />

                {showTrixToggle && (
                  <Button
                    variant="outline"
                    onClick={toggleTrix}
                    className="w-full h-14 justify-between px-6 border-2 bg-black/40 border-amber-600/30 hover:bg-amber-600/10 hover:border-amber-500 text-amber-300 font-cinzel"
                  >
                    <span className="flex items-center gap-3">
                      <img src={trixIcon} alt="Trix" className="w-7 h-7 rounded-full object-cover object-center border border-amber-500/70" />
                      <span className="text-sm md:text-base font-bold tracking-wider">
                        {language === "tr" ? "Öğretici Modu: Trix" : "Tutorial: Trix"}
                      </span>
                    </span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold tracking-widest border",
                      trixOn ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-stone-800/60 border-stone-600 text-stone-400"
                    )}>
                      {trixOn ? "ON" : "OFF"}
                    </span>
                  </Button>
                )}

                <MenuButton 
                  icon={<Flag className="w-5 h-5" />} 
                  label={txt("concede")} 
                  onClick={onConcede}
                  variant="destructive"
                />
             </>
           ) : (
             /* Options Menu */
             <div className="w-full space-y-6 animate-in slide-in-from-right">
                
                {/* Fullscreen Toggle */}
                <div className="space-y-2">
                   <label className="text-sm font-bold text-amber-500/80 uppercase tracking-widest pl-1">{txt("screenMode")}</label>
                   <Button 
                      variant="outline" 
                      onClick={toggleFullscreen} 
                      className="w-full justify-between h-12 bg-black/40 border-amber-600/30 hover:bg-amber-600/10 hover:border-amber-500 text-amber-400 group"
                    >
                      <span className="flex items-center gap-3">
                         {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                         {isFullscreen ? txt("exitFullscreen") : txt("fullscreen")}
                      </span>
                      <div className={cn("w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]", isFullscreen ? "bg-green-500 text-green-500" : "bg-stone-600")} />
                   </Button>
                </div>

                {/* Brightness Slider */}
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <label className="text-sm font-bold text-amber-500/80 uppercase tracking-widest pl-1">{txt("brightness")}</label>
                      <span className="text-xs font-mono text-amber-500/60">{brightness}%</span>
                   </div>
                   <div className="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-amber-600/20">
                      <Sun className="w-5 h-5 text-amber-500/50" />
                      <Slider 
                        value={brightness} 
                        onValueChange={setBrightness} 
                        min={30} 
                        max={120} 
                        step={5}
                        className="flex-1"
                      />
                      <Sun className="w-6 h-6 text-amber-200 glow-sm" />
                   </div>
                </div>

                <div className="pt-6">
                   <Button 
                     variant="ghost" 
                     onClick={() => setShowOptions(false)}
                     className="w-full text-amber-500/60 hover:text-amber-200 hover:bg-transparent -mt-2"
                   >
                     {txt("back")}
                   </Button>
                </div>
             </div>
           )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

function MenuButton({ icon, label, onClick, variant = "default" }: { icon: any, label: string, onClick: () => void, variant?: "default" | "primary" | "destructive" }) {
  const styles = {
    default: "bg-black/40 border-amber-600/30 hover:bg-amber-600/10 hover:border-amber-500 text-amber-400",
    primary: "bg-amber-600/10 border-amber-500/50 hover:bg-amber-600/20 hover:border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(217,119,6,0.1)]",
    destructive: "bg-red-950/20 border-red-500/30 hover:bg-red-900/40 hover:border-red-500 text-red-400"
  };

  return (
    <Button 
      variant="outline" 
      onClick={onClick} 
      className={cn(
        "w-full h-14 text-lg font-bold tracking-wider justify-start px-6 gap-4 border-2 transition-all duration-300 group relative overflow-hidden",
        styles[variant]
      )}
    > 
      <div className="relative z-10 flex items-center gap-4">
        {icon}
        {label}
      </div>
      {/* Hover slide effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
    </Button>
  );
}
