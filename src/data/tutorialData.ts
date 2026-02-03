
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
    message: "Şimdi savaş zamanı! 'Buz Mızrağı' kartını ortadaki yuvaya sürükle.",
    highlightElementId: "card-0", // Assuming first card is the target
    allowedAction: "place_card",
    requiredCardId: "ice_shard", // Logical ID check
    targetSlotIndex: 2
  },
  {
    id: "placement_done",
    message: "Mükemmel. Kartın yerleşti. Artık turu bitirebilirsin.",
    highlightElementId: "end-turn-button",
    allowedAction: "end_turn"
  },
  {
    id: "combat_watch",
    message: "Şimdi izle! Kartlar açılacak ve hasar hesaplanacak.",
    allowedAction: "none",
    autoAdvanceDelay: 4000
  },
  {
    id: "win_round",
    message: "Harika! Rakibine hasar verdin. Element avantajını kullanarak daha fazla vurabilirsin.",
    allowedAction: "none"
  },
  {
    id: "finish",
    message: "Temelleri öğrendin. Şimdi kendi desteni yapma zamanı!",
    allowedAction: "none"
  }
];
