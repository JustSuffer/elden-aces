import { useDroppable, useDraggable } from "@dnd-kit/core";
import { GameCard } from "./GameCard";
import { Card } from "@/types/game";
import { ReactNode } from "react";

interface DroppableSlotProps {
  id: string;
  card: Card | null;
  onRemove?: () => void;
  faceDown?: boolean;
  isPlaceholder?: boolean;
  className?: string;
  children?: ReactNode;
}

export function DroppableSlot({ id, card, onRemove, faceDown, isPlaceholder = false, className, children }: DroppableSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const { attributes, listeners, setNodeRef: setDragNodeRef, transform } = useDraggable({
    id: card ? `field-${id.replace("field-", "")}` : id,
    disabled: !card,
    data: { type: 'rearrange', card, originalSlot: id }
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  if (isPlaceholder) {
    return <div ref={setNodeRef} className={className}>{children}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      className={`transition-all ${isOver && !card ? "ring-4 ring-primary scale-105" : ""}`}
    >
      <div ref={setDragNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
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
