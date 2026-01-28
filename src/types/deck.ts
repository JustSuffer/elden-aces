import { ClassName, Card } from "./game";

export interface SavedDeck {
  id: string;
  name: string;
  mainClass: ClassName;
  secondaryClasses: ClassName[];
  cards: Card[];
  cardBack?: string; // e.g. "Slayer", "Vessel", "Default"
  createdAt: string;
}

export interface DeckConfig {
  mainClass: ClassName;
  secondaryClasses: ClassName[];
}
