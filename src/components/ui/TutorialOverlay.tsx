
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TutorialStep } from "@/data/tutorialData";

interface TutorialOverlayProps {
  step: TutorialStep;
  onNext: () => void;
  isVisible: boolean;
  isLastStep?: boolean;
}

export const TutorialOverlay = ({ step, onNext, isVisible }: TutorialOverlayProps) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (step.highlightElementId) {
      const el = document.getElementById(step.highlightElementId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        
        // Scroll into view if needed
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [step]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dark Overlay with cutout */}
      <div className="absolute inset-0 bg-black/60 transition-colors duration-500">
        {targetRect && (
          <div 
            className="absolute bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] rounded-xl transition-all duration-500 border-2 border-amber-500/50 animate-pulse"
            style={{
              top: targetRect.top - 10,
              left: targetRect.left - 10,
              width: targetRect.width + 20,
              height: targetRect.height + 20,
            }}
          />
        )}
      </div>

      {/* Helper Text / Dialog */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-stone-900/95 border border-amber-600 p-6 rounded-2xl max-w-md text-center shadow-2xl relative mt-32 pointer-events-auto"
          >
            <h3 className="text-amber-500 font-cinzel font-bold text-xl mb-2">EĞİTİM</h3>
            <p className="text-stone-300 text-lg mb-6 leading-relaxed">
              {step.message}
            </p>
            
            {step.allowedAction === "none" && (
               <Button onClick={onNext} className="bg-amber-700 hover:bg-amber-600">
                 {isLastStep ? "Savaşa Başla" : "Devam Et"} <ArrowRight className="w-4 h-4 ml-2" />
               </Button>
            )}
            
            {/* Visual Arrow pointing to target if exists */}
            {targetRect && (
                <div 
                    className="fixed text-amber-500 animate-bounce"
                    style={{
                        top: targetRect.top - 50,
                        left: targetRect.left + (targetRect.width / 2) - 12
                    }}
                >
                    ⬇
                </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
