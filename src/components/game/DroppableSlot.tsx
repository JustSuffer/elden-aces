import { useDroppable } from "@dnd-kit/core";
import { GameCard } from "./GameCard";
import { Card } from "@/data/cards";

interface DroppableSlotProps {
  id: string;
  card: Card | null;
  onRemove?: () => void;
  faceDown?: boolean;
}

export function DroppableSlot({ id, card, onRemove, faceDown }: DroppableSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`transition-all ${isOver && !card ? "ring-4 ring-primary scale-105" : ""}`}
    >
      <GameCard
        card={card}
        isPlaceholder={!card}
        onClick={onRemove}
        faceDown={faceDown}
        className={card && onRemove ? "ring-2 ring-primary cursor-pointer" : ""}
      />
    </div>
  );
}
