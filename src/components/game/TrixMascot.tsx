import trixIconAsset from "@/assets/trix-icon.asset.json";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TrixMascotProps {
  message: string;
  hasSuggestion: boolean;
}

export function TrixMascot({ message, hasSuggestion }: TrixMascotProps) {
  const [open, setOpen] = useState(true);

  // Auto-pulse on new message
  const [pulseKey, setPulseKey] = useState(0);
  useEffect(() => { setPulseKey((k) => k + 1); }, [message]);

  return (
    <div className="fixed bottom-4 right-4 z-[120] flex flex-col items-end gap-2 select-none pointer-events-none">
      {open && hasSuggestion && message && (
        <div
          key={pulseKey}
          className="pointer-events-auto max-w-[280px] bg-black/85 border-2 border-amber-500/70 rounded-xl px-3 py-2 text-amber-100 text-xs md:text-sm font-cinzel shadow-[0_0_25px_rgba(245,158,11,0.45)] animate-in fade-in slide-in-from-bottom-2 duration-300 relative"
        >
          <div className="absolute -top-2 right-3 text-[10px] uppercase tracking-widest text-amber-400/80 bg-black/85 px-1.5 rounded">Trix</div>
          <p className="leading-snug">{message}</p>
          <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-black/85 rotate-45 border-r-2 border-b-2 border-amber-500/70" />
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Trix"
        className={cn(
          "pointer-events-auto relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-amber-500/80",
          "shadow-[0_0_25px_rgba(245,158,11,0.55)] transition-all hover:scale-110 hover:shadow-[0_0_40px_rgba(245,158,11,0.8)]",
          "bg-black/60 backdrop-blur-sm"
        )}
      >
        <img
          src={trixIconAsset.url}
          alt="Trix"
          className="w-full h-full object-cover object-center scale-110"
          draggable={false}
          loading="eager"
          width={768}
          height={768}
        />
        {hasSuggestion && (
          <span className="absolute inset-0 rounded-full ring-2 ring-amber-300/70 animate-ping opacity-60" />
        )}
      </button>
    </div>
  );
}