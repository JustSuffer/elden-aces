import { cn } from "@/lib/utils";
import { Sword } from "lucide-react";

interface KnifeBarProps {
  count: number;
  max?: number;
  isOpponent?: boolean;
  className?: string;
}

export function KnifeBar({ count, max = 12, isOpponent = false, className }: KnifeBarProps) {
  const percentage = Math.min(100, (count / max) * 100);
  
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg",
        className
      )}
    >
      {/* Knife Icon */}
      <div className="relative">
        <Sword 
          className={cn(
            "w-8 h-8 transition-all duration-300",
            count >= max 
              ? "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse" 
              : "text-slate-400"
          )} 
        />
        {count >= max && (
          <div className="absolute inset-0 animate-ping">
            <Sword className="w-8 h-8 text-amber-400 opacity-30" />
          </div>
        )}
      </div>
      
      {/* Counter and Bar */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
        {/* Label */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Knife
          </span>
          <span 
            className={cn(
              "text-lg font-bold font-cinzel",
              count >= max 
                ? "text-amber-400 glow-gold" 
                : count >= max * 0.75 
                ? "text-amber-500" 
                : "text-foreground"
            )}
          >
            {count}/{max}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-3 bg-slate-900/80 rounded-full border border-slate-700/50 overflow-hidden relative">
          {/* Background glow when near completion */}
          {count >= max * 0.75 && (
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-400/20 animate-pulse" />
          )}
          
          {/* Progress fill */}
          <div 
            className={cn(
              "h-full transition-all duration-700 ease-out relative",
              count >= max 
                ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300" 
                : "bg-gradient-to-r from-slate-600 via-slate-500 to-slate-400"
            )}
            style={{ width: `${percentage}%` }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
            
            {/* Animated glow at edge */}
            {count < max && count > 0 && (
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-r from-transparent to-white/50" />
            )}
          </div>
          
          {/* Tick marks */}
          <div className="absolute inset-0 flex justify-between px-[1px]">
            {Array.from({ length: 11 }).map((_, i) => (
              <div 
                key={i} 
                className="w-px h-full bg-slate-700/50" 
                style={{ marginLeft: i === 0 ? 0 : 'auto' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
