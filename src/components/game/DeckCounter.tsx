import { cn } from "@/lib/utils";

interface DeckCounterProps {
  count: number;
  isOpponent?: boolean;
}

export function DeckCounter({ count, isOpponent = false }: DeckCounterProps) {
  return (
    <div
      className={cn(
        "w-24 h-36 rounded-xl border-2 flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105",
        "bg-card/80 backdrop-blur-md",
        isOpponent ? "border-destructive/60" : "border-primary/60"
      )}
    >
      <div className="text-4xl font-bold text-primary glow-gold">{count}</div>
      <div className="text-sm text-muted-foreground mt-1 font-cinzel">cards</div>
    </div>
  );
}
