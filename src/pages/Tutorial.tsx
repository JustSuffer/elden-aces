
import React from "react";
import { GameMatch } from "@/components/game/GameMatch";
import { SavedDeck } from "@/types/deck";
import { MASTER_CLASSES, createDeck } from "@/data/gameData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Tutorial = () => {
  const navigate = useNavigate();

  // Create a proper playable deck for tutorial
  // Create custom decks for tutorial
  const tutorialPlayerDeck: SavedDeck = {
      id: "tutorial_player",
      name: "Eğitim (Cryomancer)",
      mainClass: "Cryomancer",
      secondaryClasses: ["Siren", "Fateweaver", "Vitalist"],
      cards: createDeck("Cryomancer").filter(c => c.name !== "Standard"), 
      createdAt: new Date().toISOString()
  };

  const tutorialOpponentDeck: SavedDeck = {
      id: "tutorial_opponent",
      name: "Eğitim (Slayer)",
      mainClass: "Slayer",
      secondaryClasses: ["Siren", "Fateweaver", "Vitalist"],
      cards: createDeck("Slayer").filter(c => c.name !== "Standard"),
      createdAt: new Date().toISOString()
  };
  
  // Ensure the script works by ensuring we have specific cards if needed
  // For now rely on luck or generic script that doesn't check specific card IDs strictly
  
  return (
    <div className="w-full h-screen bg-black overflow-hidden">
        <GameMatch 
            playerDeck={tutorialPlayerDeck}
            opponentClass="Slayer"
            opponentDeck={tutorialOpponentDeck}
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
