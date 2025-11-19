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
        }}
        className="relative"
      >
        {/* Front face (revealed state) */}
        <motion.div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
          }}
          animate={{
            opacity: isRevealed ? 1 : 0,
          }}
          transition={{ duration: 0.3, delay: isRevealed ? 0.3 : 0 }}
          className="absolute inset-0"
        >
          <motion.div
            animate={{
              filter: isRevealed ? "drop-shadow(0 10px 15px rgba(0,0,0,0.3))" : "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
            }}
            transition={{ duration: 0.3 }}
          >
            {frontContent}
          </motion.div>
        </motion.div>

        {/* Back face (hidden state) */}
        <motion.div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
          animate={{
            opacity: !isRevealed ? 1 : 0,
          }}
          transition={{ duration: 0.3, delay: !isRevealed ? 0.3 : 0 }}
          className="absolute inset-0"
        >
          <motion.div
            animate={{
              filter: !isRevealed ? "drop-shadow(0 10px 15px rgba(0,0,0,0.3))" : "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
            }}
            transition={{ duration: 0.3 }}
          >
            {backContent}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
