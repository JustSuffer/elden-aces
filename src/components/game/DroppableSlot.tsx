import { useDroppable, useDraggable } from "@dnd-kit/core";
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
  const { attributes, listeners, setNodeRef: setDragNodeRef, transform } = useDraggable({
    id: `rearrange-${id}`,
    disabled: !card,
    data: { type: 'rearrange', card, originalSlot: id }
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      className={`transition-all ${isOver && !card ? "ring-4 ring-primary scale-105" : ""}`}
    >
      <div ref={setDragNodeRef} style={style} {...listeners} {...attributes}>
        <GameCard
          card={card}
          isPlaceholder={!card}
          onClick={onRemove}
          faceDown={faceDown}
          className={card && onRemove ? "ring-2 ring-primary cursor-pointer" : ""}
          showEyeIcon={!!card && !faceDown}
        />
      </div>
    </div>
  );
}
