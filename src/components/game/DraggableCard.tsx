import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GameCard } from "./GameCard";
import { Card } from "@/types/game";

interface DraggableCardProps {
  card: Card;
  id: string;
  disabled?: boolean;
  onTap?: () => void;
  dragEnabled?: boolean;
}

export function DraggableCard({ card, id, disabled, onTap, dragEnabled = true }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: disabled || !dragEnabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : (dragEnabled ? "grab" : "pointer"),
  };

  // Only attach listeners if drag is enabled
  const dragListeners = dragEnabled ? listeners : {};

  return (
    <div ref={setNodeRef} style={style} {...dragListeners} {...attributes}>
      <GameCard 
        card={card} 
        className={isDragging ? "ring-2 ring-primary" : ""} 
        onClick={onTap}
        showEyeIcon
      />
    </div>
  );
}
