import { MissionDefinition } from "@/types/missions";
import { ClassName } from "@/types/game";

const CLASSES: ClassName[] = [
  "Vitalist", "Slayer", "Fateweaver", "Oracle", "Chronokeeper", 
  "Cryomancer", "Decay", "Siren", "Augmentor", "Vessel", "Mimic"
];

const generateMissions = (): MissionDefinition[] => {
  const missions: MissionDefinition[] = [];

  // 1. Generic Wins (Standard - 200 Reward)
  missions.push({
    id: "gen_win_3",
    type: "win_games",
    targetCount: 3,
    reward: 200,
    translationKey: "mission_win_generic",
    params: { count: 3 }
  });

  // 2. Class Specific Wins (200 Reward)
  CLASSES.forEach(cls => {
    missions.push({
      id: `win_${cls.toLowerCase()}_3`,
      type: "win_class",
      targetCount: 3,
      reward: 200,
      classRequirement: cls,
      translationKey: "mission_win_class",
      params: { count: 3, className: cls }
    });
  });

  // 3. Play Games (Easier - 200 Reward)
  CLASSES.forEach(cls => {
    missions.push({
      id: `play_${cls.toLowerCase()}_5`,
      type: "play_games",
      targetCount: 5,
      reward: 200,
      classRequirement: cls,
      translationKey: "mission_play_class", 
      params: { count: 5, className: cls }
    });
  });

  // 4. Harder/Specific Class Mechanics (300 Reward)
  
  // Siren: Steal Cards
  missions.push({
    id: "siren_steal_10",
    type: "steal_cards",
    targetCount: 10,
    reward: 300,
    classRequirement: "Siren",
    translationKey: "mission_siren_steal",
    params: { count: 10 }
  });

  // Cryomancer: Freeze Cards (Assuming we can track this)
  missions.push({
    id: "cryo_freeze_15",
    type: "freeze_cards",
    targetCount: 15, // 3 per game approx -> 5 games
    reward: 300,
    classRequirement: "Cryomancer",
    translationKey: "mission_cryo_freeze",
    params: { count: 15 }
  });

  // Decay: Burn Cards
  missions.push({
    id: "decay_burn_20",
    type: "burn_cards",
    targetCount: 20,
    reward: 300,
    classRequirement: "Decay",
    translationKey: "mission_decay_burn",
    params: { count: 20 }
  });

  // Vitalist: Heal (If tracked) or Win with High HP
  missions.push({
    id: "vitalist_heal_50",
    type: "heal_points",
    targetCount: 50,
    reward: 300,
    classRequirement: "Vitalist",
    translationKey: "mission_vitalist_heal",
    params: { count: 50 }
  });

  // Fateweaver: Win with Gambling (Simulated as just winning for now or specific internal tracking)
  missions.push({
    id: "fate_win_streak",
    type: "win_class",
    targetCount: 5,
    reward: 300,
    classRequirement: "Fateweaver",
    translationKey: "mission_fateweaver_master",
    params: { count: 5 }
  });

  // Generic Damage Dealer
  missions.push({
    id: "deal_damage_100",
    type: "deal_damage",
    targetCount: 100,
    reward: 200,
    translationKey: "mission_deal_damage",
    params: { count: 100 }
  });

  // Play Special Cards
  missions.push({
    id: "play_special_20",
    type: "play_special",
    targetCount: 20,
    reward: 200,
    translationKey: "mission_play_special",
    params: { count: 20 }
  });

  // Reach Round 7 (Stall Decks)
  missions.push({
    id: "survive_r7_5",
    type: "reach_round_7",
    targetCount: 5,
    reward: 300,
    translationKey: "mission_survive_r7",
    params: { count: 5 }
  });

  return missions;
};

export const MISSION_POOL = generateMissions();

export const getTranslation = (key: string, lang: "tr" | "en", params?: Record<string, string | number>): string => {
  const translations: Record<string, { tr: string, en: string }> = {
    "mission_win_generic": {
      tr: "{count} Maç Kazan",
      en: "Win {count} Matches"
    },
    "mission_win_class": {
      tr: "{className} ile {count} Maç Kazan",
      en: "Win {count} Matches with {className}"
    },
    "mission_play_class": {
      tr: "{className} ile {count} Maç Oyna",
      en: "Play {count} Matches with {className}"
    },
    "mission_siren_steal": {
      tr: "Siren ile {count} Kart Çal",
      en: "Steal {count} Cards with Siren"
    },
    "mission_cryo_freeze": {
      tr: "Cryomancer ile {count} Kart Dondur",
      en: "Freeze {count} Cards with Cryomancer"
    },
    "mission_decay_burn": {
      tr: "Decay ile {count} Kart Yak",
      en: "Burn {count} Cards with Decay"
    },
    "mission_vitalist_heal": {
      tr: "Vitalist ile {count} Can İyileş",
      en: "Heal {count} HP with Vitalist"
    },
    "mission_fateweaver_master": {
      tr: "Fateweaver ile {count} Zafer Kazan",
      en: "Win {count} times with Fateweaver"
    },
    "mission_deal_damage": {
      tr: "Rakibe Toplam {count} Hasar Ver",
      en: "Deal {count} Total Damage to Opponent"
    },
    "mission_play_special": {
      tr: "{count} Özel Kart Oyna",
      en: "Play {count} Special Cards"
    },
    "mission_survive_r7": {
      tr: "{count} Kez 7. Tura Ulaş",
      en: "Reach Round 7 {count} Times"
    }
  };

  let template = translations[key]?.[lang] || key;
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      template = template.replace(`{${k}}`, String(v));
    });
  }

  return template;
};
