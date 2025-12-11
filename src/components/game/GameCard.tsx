import { Card } from "@/types/game";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React, { useState } from "react";
import { Eye } from "lucide-react";
import { SPECIAL_CARDS_DATA } from "@/data/gameData";

interface GameCardProps {
  card: Card | null;
  onClick?: () => void;
  isPlaceholder?: boolean;
  className?: string;
  faceDown?: boolean;
  showEyeIcon?: boolean;
}

export function GameCard({ card, onClick, isPlaceholder = false, className, faceDown = false, showEyeIcon = false }: GameCardProps) {
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
            card.isStolen && !faceDown && "ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-pulse", // SHINY EFFECT
            className
          )}
        >
        {faceDown ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="text-4xl opacity-30 animate-pulse">ΦΩ</div>
          </div>
        ) : (
          <div className="relative h-full flex flex-col items-center justify-between p-2">
            {/* Symbol at top */}
            <div className={cn("text-2xl font-bold")} style={textColorStyle}>
              {card.symbol}
            </div>

            {/* Value or special indicator in middle */}
            {card.type === "numeric" && card.value && (
              <div className="text-5xl font-bold text-foreground">{card.value}</div>
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
        
        {showEyeIcon && card && !faceDown && (
          <button
            onDoubleClick={handleEyeDoubleClick}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-primary/30 hover:bg-primary/50 rounded-full p-2 transition-all z-20 border border-primary/50 shadow-lg hover:shadow-primary/50"
            aria-label="Double click to view card details"
            title="Çift tıkla detayları gör"
          >
            <Eye className="w-4 h-4 text-primary" />
          </button>
        )}
      </div>

      {/* Card Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <span className="text-4xl" style={textColorStyle}>{card.symbol}</span>
              {card.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Card Type */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">Type:</span>
              <span className="text-sm text-foreground">{card.type === "numeric" ? "Numeric Card" : "Special Card"}</span>
            </div>
            
            {/* Card Value for numeric cards */}
            {card.type === "numeric" && card.value && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">Value:</span>
                <span className="text-3xl font-bold text-foreground">{card.value}</span>
              </div>
            )}
            
            {/* Special Type Info */}
            {card.specialType && (
                 <div className="flex items-center gap-2">
                 <span className="text-sm font-semibold text-primary">Effect:</span>
                 <span className="text-sm text-foreground">
                    {SPECIAL_CARDS_DATA[card.specialType]?.description || "Unknown Effect"}
                 </span>
               </div>
            )}
            
            {/* Description */}
            {card.description && (
              <div className="bg-muted/50 p-4 rounded-lg border border-primary/20 max-h-96 overflow-y-auto">
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{card.description}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
