import { useState, useCallback, useEffect } from "react";

export function useChat() {
  const [playerMessage, setPlayerMessage] = useState<string | null>(null);
  const [opponentMessage, setOpponentMessage] = useState<string | null>(null);

  const sendPlayerMessage = useCallback((msg: string) => {
    setPlayerMessage(msg);
    // Auto-hide after 6 seconds
    setTimeout(() => setPlayerMessage(null), 6000);
  }, []);

  const sendOpponentMessage = useCallback((msg: string) => {
    setOpponentMessage(msg);
    setTimeout(() => setOpponentMessage(null), 6000);
  }, []);

  return {
    playerMessage,
    opponentMessage,
    sendPlayerMessage,
    sendOpponentMessage
  };
}

export const PREDEFINED_MESSAGES = [
  "Merhaba!",
  "İyi Oyundu!",
  "Şanslısın...",
  "Hata Yaptın!",
  "Sıra Bende.",
  "Düşünüyorum..."
];
