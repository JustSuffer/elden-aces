import { ClassName, Card } from "./game";

export interface SavedDeck {
  id: string;
  name: string;
  mainClass: ClassName;
  secondaryClasses: ClassName[];
  cards: Card[];
  createdAt: string;
}

export interface DeckConfig {
  mainClass: ClassName;
  secondaryClasses: ClassName[];
}
