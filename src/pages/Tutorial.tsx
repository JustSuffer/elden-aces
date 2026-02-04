
import React from "react";
import { GameMatch } from "@/components/game/GameMatch";
import { SavedDeck } from "@/types/deck";
import { MASTER_CLASSES, createDeck } from "@/data/gameData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Tutorial = () => {
  const navigate = useNavigate();

  // Create a proper playable deck for tutorial
  // Helper to create class-specific cards
  const createClassCards = (className: string, count: number = 6) => {
      const classData = MASTER_CLASSES[className as keyof typeof MASTER_CLASSES];
      if (!classData) return [];
      
      return Array.from({ length: count }, (_, i) => ({
          id: `${className.toLowerCase()}-${i}-${Date.now()}`,
          name: `${classData.name} Card`,
          symbol: classData.symbol,
          value: i + 1,
          type: "numeric" as const,
          classSymbol: classData.symbol,
          color: classData.color
      }));
  };

  const getSpecialCards = () => createDeck("Cryomancer").filter(c => c.type === "special"); // Reuse helper for specials

  // Player Deck: Cryomancer + Siren, Fateweaver, Vitalist
  const playerSubclasses = ["Siren", "Fateweaver", "Vitalist"];
  const playerCards = [
      ...createClassCards("Cryomancer", 6),
      ...getSpecialCards(),
      ...playerSubclasses.flatMap(cls => createClassCards(cls, 6))
  ];

  const tutorialPlayerDeck: SavedDeck = {
      id: "tutorial_player",
      name: "Eğitim (Cryomancer)",
      mainClass: "Cryomancer",
      secondaryClasses: playerSubclasses,
      cards: playerCards, 
      createdAt: new Date().toISOString()
  };

  // Opponent Deck: Slayer + Siren, Fateweaver, Vitalist
  const opponentSubclasses = ["Siren", "Fateweaver", "Vitalist"];
  const opponentCards = [
      ...createClassCards("Slayer", 6),
      ...getSpecialCards(),
      ...opponentSubclasses.flatMap(cls => createClassCards(cls, 6))
  ];

  const tutorialOpponentDeck: SavedDeck = {
      id: "tutorial_opponent",
      name: "Eğitim (Slayer)",
      mainClass: "Slayer",
      secondaryClasses: opponentSubclasses,
      cards: opponentCards,
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
