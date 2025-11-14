import { cn } from "@/lib/utils";

interface DeckCounterProps {
  count: number;
  isOpponent?: boolean;
}

export function DeckCounter({ count, isOpponent = false }: DeckCounterProps) {
  return (
    <div
      className={cn(
        "w-20 h-28 rounded-lg border-2 flex flex-col items-center justify-center",
        "bg-card/50 backdrop-blur-sm",
        isOpponent ? "border-destructive/50" : "border-primary/50"
      )}
    >
      <div className="text-3xl font-bold text-primary">{count}</div>
      <div className="text-xs text-muted-foreground mt-1">cards</div>
    </div>
  );
}
