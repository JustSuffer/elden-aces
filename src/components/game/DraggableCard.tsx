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
  highlight?: boolean;
}

export function DraggableCard({ card, id, disabled, onTap, dragEnabled = true, highlight = false }: DraggableCardProps) {
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
    <div ref={setNodeRef} style={style} {...dragListeners} {...attributes} className="relative">
      {highlight && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-1.5 rounded-xl z-0"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(245,158,11,0.95), rgba(253,224,71,0.4), rgba(245,158,11,0.95), rgba(253,224,71,0.4), rgba(245,158,11,0.95))",
              filter: "blur(6px)",
              animation: "trix-spin 3s linear infinite",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-0.5 rounded-lg z-0 border-2 border-amber-300/90 animate-pulse shadow-[0_0_18px_rgba(245,158,11,0.85)]"
          />
        </>
      )}
      <div className="relative z-10">
        <GameCard
          card={card}
          className={isDragging ? "ring-2 ring-primary" : ""}
          onClick={onTap}
          showEyeIcon
        />
      </div>
    </div>
  );
}
