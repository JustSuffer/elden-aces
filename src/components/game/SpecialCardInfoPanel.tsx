import { SPECIAL_CARDS_DATA } from "@/data/gameData";
import { cn } from "@/lib/utils";
import { Info, Sparkles } from "lucide-react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useLanguage } from "@/hooks/useLanguage";

export const SpecialCardInfoPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();

  return (
    <div 
      className={cn(
        "fixed right-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ease-in-out font-sans",
        isExpanded ? "translate-x-0" : "translate-x-[calc(100%-24px)]"
      )}
    >
      <div className="flex items-start flex-row-reverse">
        {/* Panel Content */}
        <div className="bg-card/90 backdrop-blur-md border border-primary/30 rounded-l-xl shadow-lg shadow-black/50 p-4 max-w-[280px] text-xs md:text-sm overflow-y-auto max-h-[80vh] acoria-scrollbar">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 border-b border-primary/20 pb-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-primary text-base font-cinzel leading-tight">
              {t("library.special")}
            </h3>
          </div>

          <div className="space-y-4">
             {Object.entries(SPECIAL_CARDS_DATA).map(([type, card]) => (
                 <div key={card.symbol} className="bg-muted/30 rounded-lg p-3 border border-border hover:border-primary/30 transition-colors">
                     <div className="flex items-center gap-2 mb-1">
                         <span className="text-xl font-bold text-amber-400" >{card.symbol}</span>
                         <span className="font-bold text-foreground">
                            {t(`howToPlay.cards.${type}.name` as any)}
                         </span>
                     </div>
                     <p className="text-[10px] text-muted-foreground leading-relaxed">
                         {t(`howToPlay.cards.${type}.desc` as any)}
                     </p>
                 </div>
             ))}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-8 bg-amber-500/20 backdrop-blur border border-amber-500/50 border-r-0 rounded-l-xl p-0 hover:bg-amber-500/40 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] group flex items-center justify-center w-10 h-16"
          aria-label={isExpanded ? "Collapse special cards info" : "Expand special cards info"}
        >
          {isExpanded ? (
            <ChevronRight className="w-8 h-8 text-amber-400 group-hover:text-amber-200 transition-colors" />
          ) : (
            <ChevronLeft className="w-8 h-8 text-amber-400 group-hover:text-amber-200 transition-colors" />
          )}
        </button>
      </div>
    </div>
  );
};
