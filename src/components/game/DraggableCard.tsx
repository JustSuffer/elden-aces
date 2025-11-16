import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GameCard } from "./GameCard";
import { Card } from "@/data/cards";

interface DraggableCardProps {
  card: Card;
  id: string;
  disabled?: boolean;
}

export function DraggableCard({ card, id, disabled }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <GameCard card={card} className={isDragging ? "ring-2 ring-primary" : ""} />
    </div>
  );
}
