import { ClassName } from "@/types/game";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChatBubble } from "./ChatBubble";

interface CharacterAvatarProps {
  className: ClassName;
  isPlayer: boolean;
  onClick?: () => void;
  chatMessage?: string | null;
  characterName: string;
  sizeClass?: string; 
  hideName?: boolean;
  classNameOverride?: string;
}

export const CharacterAvatar = ({ 
  className, 
  isPlayer, 
  onClick, 
  chatMessage,
  characterName,
  sizeClass = "w-24 h-24 md:w-32 md:h-32",
  hideName = false,
  classNameOverride
}: CharacterAvatarProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Map class name to asset file
  const getAvatarPath = (c: ClassName) => {
    const map: Record<string, string> = {
      "Vitalist": "vitalist.jpg",
      "Cryomancer": "cryomancer.jpg",
      "Oracle": "oracle.jpg",
      "Vessel": "vessel.jpg",
      "Fateweaver": "fateweaver.jpg",
      "Slayer": "slayer.jpg",
      "Siren": "siren.jpg", 
      "Decay": "decay.jpg",
      "Chronokeeper": "chronokeeper.jpg",
      "Augmentor": "augmentor.jpg",
      "Mimic": "mimic.jpg",
    };
    return `/assets/avatars/${map[c] || "vitalist.jpg"}`;
  };

  return (
    <div 
      className={cn(
        "relative group cursor-pointer transition-transform duration-300 hover:scale-105 z-50",
        isPlayer ? "origin-bottom-left" : "origin-top-right"
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Name Tag - Always on Left side, Only on Hover */}
      {characterName && !hideName && (
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 mr-4 px-4 py-2 bg-black/90 border border-gold/50 rounded-lg text-sm font-cinzel text-gold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-[0_0_15px_rgba(197,160,89,0.3)]",
          "right-full" 
        )}>
          {characterName}
        </div>
      )}

      {/* Frame */}
      <div className={cn(
        "relative rounded-full border-4 border-[#C5A059] shadow-[0_0_15px_rgba(197,160,89,0.5)] overflow-hidden bg-black/50",
        sizeClass,
        classNameOverride
      )}>
        <img 
          src={getAvatarPath(className)} 
          alt={className}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Chat Bubble Position */}
      <div className={cn(
        "absolute z-[60] w-64 pointer-events-none transition-all duration-300",
        isPlayer ? "left-full bottom-full ml-2 mb-2 origin-bottom-left" : "right-full top-full mr-2 mt-2 origin-top-right"
      )}>
        <ChatBubble message={chatMessage} isVisible={!!chatMessage} />
      </div>
    </div>
  );
};
