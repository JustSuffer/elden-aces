import { cn } from "@/lib/utils";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DeckCounterProps {
  count: number;
  isOpponent?: boolean;
  className?: string; // If provided, uses class default image
  customImage?: string; // If provided, takes precedence
}

export function DeckCounter({ count, isOpponent = false, className, customImage }: DeckCounterProps) {
  const [imageError, setImageError] = React.useState(false);

  // Determine image source
  // Check if it already has an extension
  const formatPath = (name: string) => name.includes(".") ? `./assets/decks/${name}` : `./assets/decks/${name}.jpg`;

  const imagePath = customImage 
      ? formatPath(customImage)
      : (className ? formatPath(className) : null);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "w-24 h-36 rounded-xl border-2 flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-help overflow-hidden relative",
              "bg-card/40 backdrop-blur-sm",
              isOpponent ? "border-destructive/40" : "border-primary/40"
            )}
          >
            {imagePath && !imageError ? (
              <img 
                src={imagePath} 
                alt={`${className} Deck`}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                   const target = e.currentTarget;
                    if (target.src.endsWith(".jpg")) {
                        target.src = target.src.replace(".jpg", ".jpeg");
                    } else if (target.src.endsWith(".jpeg")) {
                        setImageError(true);
                    } else {
                        setImageError(true);
                    }
                }}
              />
            ) : (
              /* Minimal card back visual (Fallback) */
              <div className={cn(
                 "w-16 h-24 rounded-lg border border-white/5 bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center",
                 isOpponent ? "shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "shadow-[0_0_15px_rgba(197,160,89,0.1)]"
              )}>
                 <div className="w-10 h-14 border border-white/10 rounded opacity-20 rotate-12" />
                 <div className="absolute w-10 h-14 border border-white/10 rounded opacity-20 -rotate-6" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-black/95 border-gold/50 text-gold font-cinzel p-4 shadow-2xl">
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-bold glow-gold">{count}</span>
            <span className="text-xs tracking-widest opacity-80">CARDS REMAINING</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
