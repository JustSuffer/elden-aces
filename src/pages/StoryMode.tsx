
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
import { cn } from "@/lib/utils";

export default function StoryMode() {
  const navigate = useNavigate();
  const { isRegionUnlocked, isLevelCompleted } = useStoryProgress();
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // Handle Level Start
  const handleStartLevel = (regionId: string, level: StoryLevel) => {
    navigate(`/story-game/${regionId}/${level.id}`);
  };

  return (
    <div className="min-h-screen bg-black text-gold font-cinzel relative overflow-hidden">
      {/* Background Map */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/world_map.jpg" 
          alt="World Map" 
          className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-[20s] ease-linear"
        />
        <div className="absolute inset-0 bg-black/40" /> {/* Overlay for readability */}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 flex items-center justify-between pointer-events-none">
        <Button 
          variant="outline" 
          className="pointer-events-auto bg-black/50 border-gold/50 text-gold hover:bg-gold/20"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {/* Main Menu */}
          Ana Menü
        </Button>
        
        <div className="bg-black/80 border border-gold/50 px-6 py-2 rounded-lg backdrop-blur-md">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-200 to-gold drop-shadow-md">
            Acoria Chronicles
          </h1>
        </div>
        
        <div className="w-[100px]" /> {/* Spacer */}
      </div>

      {/* Map Pins Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* We need a container that matches the map aspect ratio or use percentages */}
        <div className="relative w-full h-full">
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
                  "relative -translate-x-1/2 -translate-y-1/2 p-3 rounded-full border-2 transition-all duration-300",
                  "flex items-center justify-center w-12 h-12 md:w-16 md:h-16 shadow-[0_0_20px_rgba(0,0,0,0.8)]",
                  isUnlocked 
                    ? "bg-black/80 border-gold text-gold hover:scale-110 hover:bg-gold/20 hover:shadow-[0_0_30px_rgba(197,160,89,0.6)]" 
                    : "bg-gray-900/90 border-gray-600 text-gray-500 cursor-not-allowed grayscale"
                )}>
                   {isUnlocked ? <MapPin className="scale-125" /> : <Lock />}
                   
                   {/* Ripple Effect for Unlocked */}
                   {isUnlocked && (
                     <div className="absolute inset-0 rounded-full border border-gold opacity-0 animate-[ping_2s_ease-in-out_infinite]" />
                   )}
                </div>

                {/* Region Label Tooltip (Always Visible on PC, or Hover) */}
                <div className={cn(
                  "absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 rounded bg-black/90 border border-gold/30 text-center whitespace-nowrap transition-all duration-300",
                  "opacity-0 md:group-hover:opacity-100 translate-y-2 md:group-hover:translate-y-0"
                )}>
                  <p className="text-gold font-bold text-lg">{region.name}</p>
                  <p className="text-xs text-gold/60">{isUnlocked ? "Bölgeyi Keşfet" : "Kilitli"}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Region Detail Modal */}
      <Dialog open={!!selectedRegion} onOpenChange={(open) => !open && setSelectedRegion(null)}>
        <DialogContent className="bg-black/95 border-gold/50 text-gold max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
          {selectedRegion && (
            <>
              {/* Modal Header with Image/Lore */}
              <div className="relative h-48 md:h-64 border-b border-gold/30 shrink-0">
                 <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all"
                      style={{ backgroundImage: `url('/assets/world_map.jpg')` }} // Ideally region specific art
                 />
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />
                 
                 <div className="absolute bottom-6 left-6 right-6">
                    <DialogTitle className="text-4xl font-bold mb-2 flex items-center gap-3">
                      {selectedRegion.name}
                      {!isRegionUnlocked(selectedRegion.id) && <Lock className="w-6 h-6 text-red-500" />}
                    </DialogTitle>
                    <DialogDescription className="text-gold/80 text-lg line-clamp-2 md:line-clamp-none">
                      {selectedRegion.description}
                    </DialogDescription>
                 </div>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2">
                {/* Lore Column */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-gold/20 overflow-y-auto">
                   <h3 className="text-xl font-bold mb-4 text-white">Bölge Tarihi</h3>
                   <p className="text-gold/70 leading-relaxed whitespace-pre-line">
                     {selectedRegion.longDescription}
                   </p>
                   
                   <div className="mt-8 p-4 bg-gold/5 rounded border border-gold/20">
                      <h4 className="font-bold mb-2">Bölge Özellikleri</h4>
                      <ul className="text-sm space-y-2 text-gold/60">
                         <li>• Hakim Sınıf: <span className="text-white">{selectedRegion.className}</span></li>
                         <li>• Zorluk: <span className="text-white">Değişken</span></li>
                         <li>• Özel Ödül: <span className="text-white">{selectedRegion.className} Kart Arkası</span></li>
                      </ul>
                   </div>
                </div>

                {/* Levels Column */}
                <div className="flex flex-col h-full overflow-hidden bg-black/20">
                   <div className="p-4 border-b border-gold/20 bg-gold/5">
                      <h3 className="text-xl font-bold text-center">Savaşlar</h3>
                   </div>
                   
                   <ScrollArea className="flex-1 p-6">
                      <div className="space-y-4">
                        {isRegionUnlocked(selectedRegion.id) ? (
                          selectedRegion.levels.map((level, index) => {
                             const isCompleted = isLevelCompleted(level.id);
                             // Unlock next level logic: simplified, need to beat prev level
                             const prevLevel = index > 0 ? selectedRegion.levels[index-1] : null;
                             const isLocked = prevLevel && !isLevelCompleted(prevLevel.id);

                             return (
                               <div 
                                 key={level.id}
                                 className={cn(
                                   "relative p-4 rounded-lg border transition-all duration-300",
                                   isLocked 
                                     ? "bg-gray-900/50 border-gray-700 opacity-60" 
                                     : isCompleted
                                       ? "bg-green-950/30 border-green-500/50 hover:bg-green-900/40"
                                       : "bg-black/40 border-gold/30 hover:border-gold hover:bg-gold/10 cursor-pointer"
                                 )}
                                 onClick={() => !isLocked && handleStartLevel(selectedRegion.id, level)}
                               >
                                  <div className="flex items-center justify-between mb-2">
                                     <h4 className={cn("font-bold text-lg", isCompleted && "text-green-400")}>
                                       {index + 1}. {level.name}
                                     </h4>
                                     {isCompleted ? <Trophy className="w-5 h-5 text-green-500" /> : 
                                      level.difficulty === "boss" ? <Skull className="w-5 h-5 text-red-500" /> :
                                      <Sword className="w-5 h-5 text-gold/50" />
                                     }
                                  </div>
                                  
                                  <div className="text-sm text-gold/60 mb-3">
                                     <span className="text-white/80">{level.opponentName}</span> ({level.opponentClass})
                                  </div>

                                  {level.difficulty === "boss" && (
                                    <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/50 text-red-200 border border-red-500/30 mb-2">
                                      BOSS BATTLE
                                    </div>
                                  )}
                                  
                                  {isLocked && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
                                       <Lock className="w-6 h-6 text-gray-500" />
                                    </div>
                                  )}
                               </div>
                             );
                          })
                        ) : (
                          <div className="text-center py-20 text-gold/40 italic">
                             <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                             Bu bölge henüz keşfedilmedi. <br/>
                             Başka bölgelerdeki görevleri tamamlayarak açılabilir.
                          </div>
                        )}
                      </div>
                   </ScrollArea>
                </div>
              </div>

              <DialogFooter className="p-4 border-t border-gold/20 bg-black/40 shrink-0">
                 <Button variant="ghost" onClick={() => setSelectedRegion(null)}>Kapat</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
