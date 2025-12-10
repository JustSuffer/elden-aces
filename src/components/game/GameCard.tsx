import { Card } from "@/data/cards";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Eye } from "lucide-react";

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
      <div className="relative">
        <div
          onClick={handleCardClick}
          className={cn(
            "w-24 h-36 border-2 rounded-lg relative overflow-hidden transition-all duration-300",
            "cursor-pointer hover:-translate-y-2 hover:shadow-lg",
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
              <span className="text-4xl text-primary glow-gold">{card.symbol}</span>
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
            
            {/* Card Symbol Meaning */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">Symbol:</span>
              <span className="text-sm text-foreground">
                {card.symbol === "Φ" && "Phi (Φ) - Balance / Genesis"}
                {card.symbol === "Θ" && "Theta (Θ) - Time"}
                {card.symbol === "Ψ" && "Psi (Ψ) - Mind"}
                {card.symbol === "Ω" && "Omega (Ω) - Chaos"}
                {card.symbol === "α" && "Alpha (α) - Twisted"}
                {card.symbol === "Δ" && "Delta (Δ) - Amplifier"}
                {card.symbol === "Σ" && "Sigma (Σ) - Reverse Amplifier"}
                {card.symbol === "β" && "Beta (β) - Nullifier"}
                {card.symbol === "γ" && "Gamma (γ) - Ultimate Shield"}
              </span>
            </div>
            
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
