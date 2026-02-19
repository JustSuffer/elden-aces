import { ClassName } from "@/types/game";
import { MASTER_CLASSES } from "@/data/gameData";
import { cn } from "@/lib/utils";
import { Info, ShieldAlert, Trophy } from "lucide-react";
import { useState } from "react";

interface ClassInfoPanelProps {
  className: ClassName;
}

import { useLanguage } from "@/hooks/useLanguage";
import { useMemo } from "react";

export const ClassInfoPanel = ({ className }: ClassInfoPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const data = MASTER_CLASSES[className];
  const { t } = useLanguage();

  if (!data) {
    console.warn(`[ClassInfoPanel] Missing data for class: ${className}`);
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed left-0 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ease-in-out",
        isExpanded ? "translate-x-0" : "-translate-x-[calc(100%-24px)]"
      )}
    >
      <div className="flex items-start">
        {/* Panel Content */}
        <div className="bg-card/90 backdrop-blur-md border border-primary/30 rounded-r-xl shadow-lg shadow-black/50 p-4 max-w-[280px] text-xs md:text-sm overflow-y-auto max-h-[80vh] acoria-scrollbar">
          
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 border-b border-primary/20 pb-2">
            <span style={{ color: data.color }} className="text-2xl font-bold">
              {data.symbol}
            </span>
            <div>
              <h3 className="font-bold text-primary text-base font-cinzel leading-tight">
                {className}
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {data.role}
              </p>
            </div>
          </div>

          {/* Ability Scales */}
          <div className="mb-4">
            <h4 className="font-bold text-muted-foreground mb-2 flex items-center gap-1 text-[10px] uppercase">
              <Info className="w-3 h-3" />
              {t("ui.abilityScale")}
            </h4>
            <div className="space-y-1.5">
              {data.abilityScales.map((scale) => (
                <div key={scale.count} className="grid grid-cols-[20px_1fr] gap-2 items-start group">
                  <div className="bg-primary/10 text-primary font-bold text-center rounded text-[10px] py-0.5 group-hover:bg-primary/20 transition-colors">
                    {scale.count}
                  </div>
                  <div className="text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
                    {t(`classes.${className.toLowerCase()}.scale.${scale.count}` as any)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Win Condition */}
          <div className="mb-3">
            <h4 className="font-bold text-muted-foreground mb-1 flex items-center gap-1 text-[10px] uppercase">
              <Trophy className="w-3 h-3 text-yellow-500" />
              {t("ui.winCondition")}
            </h4>
            <p className="text-yellow-500/90 leading-tight bg-yellow-500/5 p-2 rounded border border-yellow-500/10">
              {t(`classes.${className.toLowerCase()}.winCon` as any)}
            </p>
          </div>

          {/* Lose Condition (if any) */}
          {data.loseCondition && (
            <div className="mb-3">
              <h4 className="font-bold text-muted-foreground mb-1 flex items-center gap-1 text-[10px] uppercase">
                <ShieldAlert className="w-3 h-3 text-destructive" />
                {t("ui.loseCondition")}
              </h4>
              <p className="text-destructive/90 leading-tight bg-destructive/10 p-2 rounded border border-destructive/20">
                {t(`classes.${className.toLowerCase()}.loseCondition` as any)}
              </p>
            </div>
          )}

           {/* Passive (Optional description) */}
           <div className="mt-2 text-[10px] text-muted-foreground italic border-t border-white/5 pt-2">
             {t(`classes.${className.toLowerCase()}.passive` as any)}
           </div>

        </div>

        {/* Toggle Handle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-primary/20 hover:bg-primary/40 text-primary border border-l-0 border-primary/30 rounded-r-lg p-1.5 mt-8 backdrop-blur-sm transition-colors"
          title={isExpanded ? "Gizle" : "Göster"}
        >
          {isExpanded ? "◀" : "▶"}
          {/* Vertical Text if collapsed? No, straightforward arrow is better. */}
        </button>
      </div>
    </div>
  );
};
