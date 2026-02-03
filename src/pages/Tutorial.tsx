
import React from "react";
import { GameMatch } from "@/components/game/GameMatch";
import { SavedDeck } from "@/types/deck";
import { MASTER_CLASSES, createDeck } from "@/data/gameData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Tutorial = () => {
  const navigate = useNavigate();

  // Create a proper playable deck for tutorial
  const tutorialDeck: SavedDeck = {
      id: "tutorial_deck",
      name: "Eğitim Destesi",
      mainClass: "Cryomancer",
      secondaryClasses: [],
      cards: createDeck("Cryomancer"), // Use helper to get full deck
      createdAt: new Date().toISOString()
  };
  
  // Ensure the script works by ensuring we have specific cards if needed
  // For now rely on luck or generic script that doesn't check specific card IDs strictly
  
  return (
    <div className="w-full h-screen bg-black overflow-hidden">
        <GameMatch 
            playerDeck={tutorialDeck}
            opponentClass="Slayer"
            isTutorial={true}
            onGameEnd={(result) => {
                if(result === "win") {
                    toast.success("Tebrikler! Temelleri öğrendin.");
                    navigate("/deck-builder");
                }
            }}
        />
    </div>
  );
};

export default Tutorial;
