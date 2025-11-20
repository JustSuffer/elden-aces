import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardFlipProps {
  isRevealed: boolean;
  frontContent: ReactNode;
  backContent: ReactNode;
  className?: string;
}

export function CardFlip({ isRevealed, frontContent, backContent, className }: CardFlipProps) {
  return (
    <div className={`relative ${className}`} style={{ perspective: "1000px" }}>
      <motion.div
        animate={{
          rotateY: isRevealed ? 0 : 180,
          scaleY: isRevealed ? 1 : 0.99,
        }}
        transition={{
          duration: 0.6,
          ease: [0.22, 0.9, 0.35, 1],
        }}
        style={{
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
        }}
        className="relative"
      >
        {/* Front face (revealed state) */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
          className={isRevealed ? "block" : "hidden"}
        >
          {frontContent}
        </div>

        {/* Back face (hidden state) */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute",
            top: 0,
            left: 0,
          }}
          className={!isRevealed ? "block" : "hidden"}
        >
          {backContent}
        </div>
      </motion.div>
    </div>
  );
}
