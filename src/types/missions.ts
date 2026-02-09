export type MissionType = 
  | "play_games"
  | "win_games"
  | "win_class"
  | "steal_cards" // Siren
  | "freeze_cards" // Cryomancer
  | "burn_cards" // Decay
  | "heal_points" // Vitalist
  | "deal_damage"
  | "play_special" // Play X special cards
  | "reach_round_7";

export interface MissionDefinition {
  id: string;
  type: MissionType;
  targetCount: number;
  reward: 200 | 300;
  classRequirement?: string; // Optional specific class requirement
  translationKey: string; // Key for localization
  params?: Record<string, string | number>; // Dynamic params for text
}

export interface DailyMission extends MissionDefinition {
  progress: number;
  isClaimed: boolean;
  dateKey: string; // "YYYY-MM-DD" to track when it was assigned
}

export interface MissionState {
  missions: DailyMission[];
  lastRefreshDate: string; // ISO String
}
