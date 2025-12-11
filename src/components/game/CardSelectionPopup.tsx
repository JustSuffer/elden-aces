import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/types/game";
import { GameCard } from "./GameCard";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface CardSelectionPopupProps {
  open: boolean;
  cards: Card[];
  onConfirm: (selectedIndices: number[]) => void;
}

export function CardSelectionPopup({ open, cards, onConfirm }: CardSelectionPopupProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleCardClick = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else if (selectedIndices.length < 2) {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const handleConfirm = () => {
    if (selectedIndices.length === 2) {
      onConfirm(selectedIndices);
      setSelectedIndices([]);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-primary">
            Select 2 Cards to Return
          </DialogTitle>
          <DialogDescription className="text-center">
            Choose 2 cards from your hand to return to the deck. You will draw 2 new cards.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          <div className="flex gap-3 flex-wrap justify-center">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="relative cursor-pointer transition-all duration-200"
                onClick={() => handleCardClick(index)}
              >
                <div className={`transition-all ${selectedIndices.includes(index) ? 'ring-4 ring-primary scale-95 opacity-75' : 'hover:scale-105'}`}>
                  <GameCard card={card} />
                </div>
                {selectedIndices.includes(index) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-primary drop-shadow-lg" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Selected: {selectedIndices.length} / 2 cards
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={handleConfirm}
              disabled={selectedIndices.length !== 2}
              className="w-48"
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
