import { SPECIAL_CARDS_DATA } from "@/data/gameData";
import { cn } from "@/lib/utils";
import { Info, Sparkles } from "lucide-react";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const SpecialCardInfoPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);

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
              Özel Kartlar
            </h3>
          </div>

          <div className="space-y-4">
             {Object.values(SPECIAL_CARDS_DATA).map((card) => (
                 <div key={card.symbol} className="bg-muted/30 rounded-lg p-3 border border-border hover:border-primary/30 transition-colors">
                     <div className="flex items-center gap-2 mb-1">
                         <span className="text-xl font-bold text-amber-400" >{card.symbol}</span>
                         <span className="font-bold text-foreground">{card.name}</span>
                     </div>
                     <p className="text-[10px] text-muted-foreground leading-relaxed">
                         {card.description}
                     </p>
                 </div>
             ))}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-8 bg-card border border-primary/30 border-r-0 rounded-l-lg p-1 hover:bg-primary/10 transition-colors shadow-lg"
          aria-label={isExpanded ? "Collapse special cards info" : "Expand special cards info"}
        >
          {isExpanded ? (
            <ChevronRight className="w-4 h-4 text-primary" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-primary" />
          )}
        </button>
      </div>
    </div>
  );
};
