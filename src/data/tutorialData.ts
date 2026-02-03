
export type TutorialStep = {
  id: string;
  message: string;
  highlightElementId?: string; // ID of the DOM element to highlight
  allowedAction?: "place_card" | "end_turn" | "roll_dice" | "none";
  requiredCardId?: string; // If specific card needed
  targetSlotIndex?: number; // If specific slot needed
  autoAdvanceDelay?: number; // Auto advance after X ms
};

export const TUTORIAL_SCRIPT: TutorialStep[] = [
  {
    id: "welcome",
    message: "Acoria'ya hoş geldin, Yükselen. Kaderini çizmeye hazır mısın? (Devam etmek için ekrana tıkla)",
    allowedAction: "none"
  },
  {
    id: "goal",
    message: "Amacın basit: Rakibinin Can Puanını (HP) sıfıra indir.",
    highlightElementId: "opponent-hp-bar",
    allowedAction: "none"
  },
  {
    id: "hand",
    message: "Bunlar senin kartların. Her kartın bir gücü ve elementi vardır.",
    highlightElementId: "player-hand",
    allowedAction: "none"
  },
  {
    id: "field",
    message: "Burası savaş alanı. Kartlarını buraya yerleştireceksin.",
    highlightElementId: "player-field-area",
    allowedAction: "none"
  },
  {
    id: "placement_instruction",
    message: "Şimdi savaş zamanı! Elindeki kartlardan birini işaretli yuvaya sürükle.",
    highlightElementId: "card-0", // Assuming first card is the target
    allowedAction: "place_card",
    requiredCardId: undefined, // Allow any card
    targetSlotIndex: 2
  }
];
