import { Card } from "@/data/cards";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface GameCardProps {
  card: Card | null;
  onClick?: () => void;
  isPlaceholder?: boolean;
  className?: string;
  faceDown?: boolean;
}

export function GameCard({ card, onClick, isPlaceholder = false, className, faceDown = false }: GameCardProps) {
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
    if (card.type === "special" && !faceDown) {
      setShowDetails(true);
    }
    onClick?.();
  };

  const getCardColor = () => {
    switch (card.color) {
      case "phi":
        return "border-phi bg-phi/10";
      case "theta":
        return "border-theta bg-theta/10";
      case "psi":
        return "border-psi bg-psi/10";
      case "omega":
        return "border-omega bg-omega/10";
      default:
        return "border-primary bg-primary/10";
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          "w-24 h-36 border-2 rounded-lg relative overflow-hidden transition-all duration-300",
          "cursor-pointer hover:scale-105 hover:shadow-lg",
          faceDown ? "bg-card border-border" : getCardColor(),
          card.type === "special" && !faceDown && "hover:shadow-primary/50",
          className
        )}
      >
        {faceDown ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-card">
            <div className="text-4xl text-primary opacity-50">⚔</div>
          </div>
        ) : (
          <div className="relative h-full flex flex-col items-center justify-between p-2">
            {/* Symbol at top */}
            <div className={cn("text-2xl font-bold", card.color === "primary" ? "text-primary" : `text-${card.color}`)}>
              {card.symbol}
            </div>

            {/* Value or special indicator in middle */}
            {card.type === "numeric" && card.value && (
              <div className="text-5xl font-bold text-foreground">{card.value}</div>
            )}

            {/* Name at bottom */}
            <div className="text-[10px] text-center text-foreground/80 font-semibold tracking-wide">
              {card.name}
            </div>
          </div>
        )}
      </div>

      {/* Special Card Details Dialog */}
      {card.type === "special" && card.description && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <span className="text-4xl text-primary">{card.symbol}</span>
                {card.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-lg leading-relaxed text-muted-foreground">{card.description}</p>
              <div className="bg-muted/50 p-4 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground/70">
                  Click on special cards during the game to view their effects.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
