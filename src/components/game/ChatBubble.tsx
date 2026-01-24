import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ChatBubbleProps {
  message: string | null | undefined;
  isVisible: boolean;
}

export const ChatBubble = ({ message, isVisible }: ChatBubbleProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible && message) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [isVisible, message]);

  if (!isVisible && !show) return null;

  return (
    <div 
      className={cn(
        "relative bg-black/90 border border-[#C5A059] px-4 py-3 rounded-xl shadow-lg transform transition-all duration-300",
        show ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
      )}
    >
      <p className="text-sm font-medium text-[#E8DCC0] leading-snug font-cinzel">
        {message}
      </p>
      
      {/* Arrow */}
      <div className="absolute w-3 h-3 bg-black/90 border-r border-b border-[#C5A059] transform rotate-45 -bottom-1.5 left-4" />
    </div>
  );
};
