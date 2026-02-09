import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Lock, Trophy, Sword, Skull, MapPin } from "lucide-react";
import { STORY_REGIONS, Region, StoryLevel } from "@/data/storyData";
import { useStoryProgress } from "@/hooks/useStoryProgress";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

export default function StoryMode() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isRegionUnlocked, isLevelCompleted } = useStoryProgress();
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // Helper for localization
  const getLoc = (obj: any) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[language] || obj["en"] || "";
  };

  // Handle Level Start
  const handleStartLevel = (regionId: string, level: StoryLevel) => {
    navigate(`/story-game/${regionId}/${level.id}`);
  };

  return (
    <div className="min-h-screen bg-black text-gold font-cinzel relative overflow-x-hidden">
      
      {/* Centered Map Container */}
      <div className="flex items-center justify-center min-h-screen p-4 md:p-10">
        
        {/* Relative Container matching image size */}
        <div className="relative w-full max-w-[1920px] shadow-2xl border border-gold/20 rounded-lg overflow-hidden group/map">
           <img 
             src="/assets/world_map.jpg" 
             alt="World Map" 
             className="w-full h-auto block"
           />
           <div className="absolute inset-0 bg-black/20 pointer-events-none group-hover/map:bg-black/10 transition-colors duration-1000" /> {/* Slight Overlay */}
           
           {/* Map Pins Layer - Absolute inset-0 matches the image exactly */}
           <div className="absolute inset-0">
               {STORY_REGIONS.map((region) => {
                 const isUnlocked = isRegionUnlocked(region.id);
                 return (
                   <div
                     key={region.id}
                     className="absolute pointer-events-auto group cursor-pointer"
                     style={{ left: `${region.coordinates.x}%`, top: `${region.coordinates.y}%` }}
                     onClick={() => setSelectedRegion(region)}
                   >
                     {/* Pin Icon */}
                     <div className={cn(
                       "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-all duration-300",
                       "flex items-center justify-center w-8 h-8 md:w-12 md:h-12 shadow-[0_0_10px_rgba(0,0,0,0.8)]",
                       isUnlocked 
                         ? "bg-black/80 border-gold text-gold hover:scale-125 hover:bg-gold/20 hover:shadow-[0_0_20px_rgba(197,160,89,0.8)]" 
                         : "bg-gray-900/90 border-gray-600/50 text-gray-500 scale-75 cursor-not-allowed grayscale opacity-70"
                     )}>
                        {isUnlocked ? <MapPin className="w-5 h-5 md:w-7 md:h-7" /> : <Lock className="w-4 h-4 md:w-5 md:h-5" />}
                        
                        {/* Ripple Effect for Unlocked */}
                        {isUnlocked && (
                          <div className="absolute inset-0 rounded-full border border-gold opacity-0 animate-[ping_2s_ease-in-out_infinite]" />
                        )}
                     </div>
    
                     {/* Region Label Tooltip - Only visible on hover/active */}
                     <div className={cn(
                       "absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 rounded-md bg-black/90 border border-gold/40 text-center whitespace-nowrap transition-all duration-300 z-20 pointer-events-none",
                       "opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 shadow-lg"
                     )}>
                       <p className="text-gold font-bold text-sm md:text-base tracking-wider">{region.name}</p>
                       <p className="text-[10px] uppercase text-gold/60">{isUnlocked ? (language === "tr" ? "Keşfet" : "Explore") : (language === "tr" ? "Kilitli" : "Locked")}</p>
                     </div>
                   </div>
                 );
               })}
           </div>
        </div>
      </div>

      {/* Header (Top-Left Absolute) */}
      <div className="absolute top-0 left-0 z-10 p-4 md:p-6 pointer-events-none w-full flex flex-col gap-2 items-start">
        <Button 
          variant="outline" 
          className="pointer-events-auto bg-black/50 border-gold/50 text-gold hover:bg-gold/20 backdrop-blur-sm"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {language === "tr" ? "Ana Menü" : "Main Menu"}
        </Button>
        <div className="bg-red-900/80 text-white px-4 py-1 rounded border border-red-500/50 backdrop-blur-sm shadow-lg animate-pulse pointer-events-auto">
             <span className="text-xs md:text-sm font-bold tracking-widest">
                 {t("common.development")}
             </span>
        </div>
      </div>

      {/* Region Detail Modal */}
      <Dialog open={!!selectedRegion} onOpenChange={(open) => !open && setSelectedRegion(null)}>
        <DialogContent className="bg-black/95 border-gold/50 text-gold max-w-5xl h-[90vh] md:h-[80vh] flex flex-col p-0 overflow-hidden font-cinzel">
          {selectedRegion && (
            <>
              {/* Modal Header with Image/Lore */}
              <div className="relative h-40 md:h-60 border-b border-gold/30 shrink-0">
                 <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all"
                      style={{ backgroundImage: `url('/assets/world_map.jpg')` }} // region specific art would be better
                 />
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
                 
                 <div className="absolute bottom-6 left-6 right-6">
                    <DialogTitle className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                      {selectedRegion.name}
                      {!isRegionUnlocked(selectedRegion.id) && <Lock className="w-6 h-6 text-red-500" />}
                    </DialogTitle>
                    <DialogDescription className="text-gold/80 text-base md:text-lg line-clamp-2">
                       {getLoc(selectedRegion.description)}
                    </DialogDescription>
                 </div>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2">
                {/* Lore Column */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-gold/20 overflow-y-auto">
                   <h3 className="text-xl font-bold mb-4 text-white border-b border-gold/20 pb-2">{language === "tr" ? "Bölge Tarihi" : "Region History"}</h3>
                   <p className="text-gold/70 leading-relaxed whitespace-pre-line text-sm md:text-base">
                     {getLoc(selectedRegion.longDescription)}
                   </p>
                   
                   <div className="mt-8 p-4 bg-gold/5 rounded border border-gold/20">
                      <h4 className="font-bold mb-2 text-white">{language === "tr" ? "Bölge Özellikleri" : "Region Traits"}</h4>
                      <ul className="text-sm space-y-2 text-gold/60">
                         <li>• {language === "tr" ? "Hakim Sınıf:" : "Dominant Class:"} <span className="text-white">{selectedRegion.className}</span></li>
                         <li>• {language === "tr" ? "Zorluk:" : "Difficulty:"} <span className="text-white">Değişken</span></li>
                         <li>• {language === "tr" ? "Özel Ödül:" : "Special Reward:"} <span className="text-white">{selectedRegion.className} {language === "tr" ? "Kart Arkası" : "Card Back"}</span></li>
                      </ul>
                   </div>
                </div>

                {/* Levels Column */}
                <div className="flex flex-col h-full overflow-hidden bg-black/20">
                   <div className="p-4 border-b border-gold/20 bg-gold/5 flex justify-between items-center">
                      <h3 className="text-xl font-bold">{language === "tr" ? "Savaşlar" : "Battles"}</h3>
                      <span className="text-xs text-gold/50">{selectedRegion.levels.length} {language === "tr" ? "Seviye" : "Levels"}</span>
                   </div>
                   
                   <ScrollArea className="flex-1 p-4 md:p-6">
                      <div className="space-y-3">
                        {isRegionUnlocked(selectedRegion.id) ? (
                          selectedRegion.levels.map((level, index) => {
                             const isCompleted = isLevelCompleted(level.id);
                             const prevLevel = index > 0 ? selectedRegion.levels[index-1] : null;
                             const isLocked = prevLevel && !isLevelCompleted(prevLevel.id);

                             return (
                               <div 
                                 key={level.id}
                                 className={cn(
                                   "relative p-3 md:p-4 rounded-lg border transition-all duration-300",
                                   isLocked 
                                     ? "bg-gray-900/50 border-gray-800 opacity-50" 
                                     : isCompleted
                                       ? "bg-green-950/20 border-green-500/30 hover:bg-green-900/30"
                                       : "bg-black/40 border-gold/30 hover:border-gold hover:bg-gold/10 cursor-pointer"
                                 )}
                                 onClick={() => !isLocked && handleStartLevel(selectedRegion.id, level)}
                               >
                                  <div className="flex items-center justify-between mb-1">
                                     <h4 className={cn("font-bold text-base md:text-lg", isCompleted && "text-green-500")}>
                                       {index + 1}. {getLoc(level.name)}
                                     </h4>
                                     {isCompleted ? <Trophy className="w-4 h-4 text-green-500" /> : 
                                      level.difficulty === "boss" ? <Skull className="w-4 h-4 text-red-500" /> :
                                      <Sword className="w-4 h-4 text-gold/50" />
                                     }
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <div className="text-xs md:text-sm text-gold/60">
                                       <span className="text-white/80">{getLoc(level.opponentName)}</span> <span className="text-gold/40">({level.opponentClass})</span>
                                    </div>
                                    {level.difficulty === "boss" && !isCompleted && (
                                        <span className="text-[10px] font-bold text-red-400 border border-red-500/30 px-1 rounded">BOSS</span>
                                    )}
                                  </div>
                                  
                                  {isLocked && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                                       <Lock className="w-5 h-5 text-gray-600" />
                                    </div>
                                  )}
                               </div>
                             );
                          })
                        ) : (
                          <div className="text-center py-20 text-gold/40 italic flex flex-col items-center">
                             <Lock className="w-10 h-10 mb-4 opacity-30" />
                             <span>{language === "tr" ? "Bu bölge henüz keşfedilmedi." : "Region strictly locked."}</span>
                             <span className="text-sm opacity-50 mt-2">{language === "tr" ? "Önceki bölgeleri tamamlayın." : "Complete previous regions first."}</span>
                          </div>
                        )}
                      </div>
                   </ScrollArea>
                </div>
              </div>

              <DialogFooter className="p-4 border-t border-gold/20 bg-black/40 shrink-0">
                 <Button variant="ghost" onClick={() => setSelectedRegion(null)} className="hover:bg-gold/10 text-gold">
                   {language === "tr" ? "Kapat" : "Close"}
                 </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
