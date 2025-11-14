import { cn } from "@/lib/utils";

interface HPBarProps {
  current: number;
  max: number;
  label: string;
  isOpponent?: boolean;
}

export function HPBar({ current, max, label, isOpponent = false }: HPBarProps) {
  const percentage = (current / max) * 100;
  const isLow = percentage <= 30;
  const isCritical = percentage <= 15;

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xs">
      <div className="flex items-center justify-between w-full">
        <span className={cn("text-sm font-semibold", isOpponent ? "text-destructive" : "text-primary")}>
          {label}
        </span>
        <span className="text-lg font-bold text-foreground">
          {current}/{max} HP
        </span>
      </div>
      <div className="w-full h-3 bg-card rounded-full overflow-hidden border border-border">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            isOpponent ? "bg-destructive" : "bg-primary",
            isCritical && "animate-pulse",
            isLow && !isCritical && "opacity-80"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
