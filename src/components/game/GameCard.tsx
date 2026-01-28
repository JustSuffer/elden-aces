import { Card } from "@/types/game";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React, { useState } from "react";
import { Eye, Snowflake } from "lucide-react";
import { SPECIAL_CARDS_DATA } from "@/data/gameData";

interface GameCardProps {
  card: Card | null;
  onClick?: () => void;
  isPlaceholder?: boolean;
  className?: string;
  faceDown?: boolean;
  showEyeIcon?: boolean;
  backImage?: string;
}

export function GameCard({ card, onClick, isPlaceholder = false, className, faceDown = false, showEyeIcon = false, backImage }: GameCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (isPlaceholder) {
    return (
      <div
        className={cn(
          "w-24 h-36 border-2 border-dashed border-border rounded-lg bg-card/20",
          "flex items-center justify-center text-muted-foreground/30 text-xs",
          className
        )}
      >
        Empty
      </div>
    );
  }

  if (!card) return null;

  const handleCardClick = () => {
    onClick?.();
  };

  const handleEyeDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(true);
  };

  // Dynamic style for colors
  const cardStyle = !faceDown && card.color ? {
    borderColor: card.color,
    backgroundColor: `${card.color}1A`, // 10% opacity
    boxShadow: `0 0 10px ${card.color}33` // faint glow
  } : {};

  const textColorStyle = !faceDown && card.color ? {
      color: card.color,
      textShadow: `0 0 5px ${card.color}66`
  } : {};

  return (
    <>
      <div className="relative group">
        <div
          onClick={handleCardClick}
          style={cardStyle}
          className={cn(
            "w-24 h-36 border-2 rounded-lg relative overflow-hidden transition-all duration-300",
            "cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:scale-105",
            faceDown ? "bg-card border-border shadow-inner" : "",
            card.type === "special" && !faceDown && "hover:shadow-primary/50",
            card.isStolen && !faceDown && "ring-4 ring-yellow-400/80 shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-pulse z-10",
            card.isFrozen && !faceDown && "ring-4 ring-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.5)] bg-cyan-900/20 grayscale-[0.5] contrast-125 z-10",
            card.specialType === "gamma" && !faceDown && "ring-4 ring-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.8)] border-amber-300 bg-gradient-to-br from-amber-950/50 to-yellow-900/20 z-10 hover:shadow-amber-500/50",
            className
          )}
        >
        {faceDown ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
             {backImage ? (
               <img src={`/assets/decks/${backImage}.jpg`} className="w-full h-full object-cover opacity-80" alt="Card Back" />
             ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                  <div className="text-4xl opacity-30 animate-pulse">ΦΩ</div>
                </div>
             )}
          </div>
        ) : (
          <div className="relative h-full flex flex-col items-center justify-between p-2">
            {/* Frozen Overlay */}
            {card.isFrozen && (
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-cyan-500/10 backdrop-blur-[1px]">
                 <Snowflake className="w-16 h-16 text-cyan-200/80 animate-spin-slow drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ animationDuration: "10s" }} />
              </div>
            )}

            {/* Symbol at top */}
            <div className={cn("text-2xl font-bold")} style={textColorStyle}>
              {card.symbol}
            </div>

            {/* Value or special indicator in middle */}
            {card.type === "numeric" && (
              <div className={cn("text-5xl font-bold text-foreground", 
                  card.value === 0 && card.isFrozen && "text-cyan-200",
                  card.isBuffed && "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]"
              )}>
                  {card.value}
              </div>
            )}
            
            {/* Special Type Indicator if numeric value is 0 or missing */}
            {card.type === "special" && (
                <div className="text-sm font-bold opacity-80" style={textColorStyle}>
                   {card.specialType?.toUpperCase()}
                </div>
            )}

            {/* Name at bottom */}
            <div className="text-[10px] text-center text-foreground/80 font-semibold tracking-wide truncate w-full px-1">
              {card.name}
            </div>
          </div>
        )}
        </div>
        
      </div>

      {/* Card Details Dialog Removed */}
    </>
  );
}
