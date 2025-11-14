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
          "border-2 rounded-lg overflow-hidden group",
          variant === "primary" && [
            "border-primary text-primary",
            "hover:bg-primary hover:text-primary-foreground",
            "hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]",
            "before:absolute before:inset-0 before:bg-primary before:translate-y-full",
            "before:transition-transform before:duration-300 hover:before:translate-y-0",
          ],
          variant === "secondary" && [
            "border-muted text-foreground",
            "hover:border-primary hover:text-primary",
            "hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]",
          ],
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

MenuButton.displayName = "MenuButton";

export { MenuButton };
