import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MobileLandscapeWrapperProps {
  children: React.ReactNode;
}

export const MobileLandscapeWrapper = ({ children }: MobileLandscapeWrapperProps) => {
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);

  useEffect(() => {
    const checkLandscape = () => {
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      // Check for mobile-like dimensions (max-height 500px covers most phones in landscape)
      const isMobileHeight = window.matchMedia("(max-height: 500px)").matches;
      // Also check touch capability to distinguish from small desktop windows if possible, 
      // but height is usually a good enough proxy for "phone in landscape" vs "monitor"
      setIsMobileLandscape(isLandscape && isMobileHeight);
    };

    checkLandscape();
    window.addEventListener("resize", checkLandscape);
    return () => window.removeEventListener("resize", checkLandscape);
  }, []);

  return (
    <div
      className={cn(
        "min-h-screen w-full transition-all duration-300",
        isMobileLandscape && "mobile-landscape-scale"
      )}
    >
      {children}
    </div>
  );
};
