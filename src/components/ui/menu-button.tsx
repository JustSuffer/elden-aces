import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface MenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative px-8 py-4 text-lg font-semibold tracking-wider transition-all duration-300",
          "border-2 rounded-lg overflow-hidden group active:scale-95",
          variant === "primary" && [
            "border-primary text-primary",
            "hover:bg-primary/10 hover:text-primary-foreground",
            "hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]",
            "hover:border-primary-glow",
            // Shine Effect
            "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
            "before:translate-x-[-200%] before:skew-x-[-20deg]",
            "hover:before:translate-x-[200%] before:transition-transform before:duration-700",
          ],
          variant === "secondary" && [
            "border-muted text-foreground",
            "hover:border-primary hover:text-primary",
            "hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]",
            "bg-background/20 backdrop-blur-sm"
          ],
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      </button>
    );
  }
);

MenuButton.displayName = "MenuButton";

export { MenuButton };
