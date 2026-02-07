
import { ClassName } from "@/types/game";

export type AchievementCategory = "Combat" | "Mastery" | "Collection" | "Story" | "Social";

export interface Achievement {
  id: string;
  titleTR: string;
  titleEN: string;
  descriptionTR: string;
  descriptionEN: string;
  category: AchievementCategory;
  reward: number; // Divine Coins
  icon?: string; // Lucide icon name or generic type
  
  // Progress Logic
  targetCount: number;
  conditionType: 
    | "total_wins" 
    | "class_wins" 
    | "total_games"
    | "coins_earned"
    | "story_level_complete"
    | "story_region_unlock"
    | "items_owned"
    | "perfect_win" // Win with full HP
    | "close_call" // Win with < 5 HP
    | "damage_dealt";
    
  conditionParam?: string; // e.g., "Vitalist" for class_wins, or level ID for story
}

const ACHIEVEMENTS: Achievement[] = [];

// Helper to add achievements
const add = (a: Achievement) => ACHIEVEMENTS.push(a);

// --- 1. GENERAL COMBAT (Total Wins) ---
const winMilestones = [1, 5, 10, 25, 50, 100, 250, 500, 1000];
winMilestones.forEach(count => {
  add({
    id: `achiv_wins_${count}`,
    titleTR: `Savaşçı ${count}`,
    titleEN: `Warrior ${count}`,
    descriptionTR: `${count} kez zafer kazan.`,
    descriptionEN: `Win ${count} matches.`,
    category: "Combat",
    reward: 500,
    targetCount: count,
    conditionType: "total_wins"
  });
});

// --- 2. CLASS MASTERY (Wins per Class) ---
const CLASSES: ClassName[] = [
  "Vitalist", "Slayer", "Fateweaver", "Oracle", "Chronokeeper", 
  "Cryomancer", "Decay", "Siren", "Augmentor", "Vessel", "Mimic"
];
const classMilestones = [1, 5, 10, 25, 50];

CLASSES.forEach(cls => {
  classMilestones.forEach(count => {
    add({
      id: `achiv_mastery_${cls.toLowerCase()}_${count}`,
      titleTR: `${cls} Uzmanı ${count}`,
      titleEN: `${cls} Master ${count}`,
      descriptionTR: `${cls} sınıfı ile ${count} oyun kazan.`,
      descriptionEN: `Win ${count} games with ${cls}.`,
      category: "Mastery",
      reward: 500,
      targetCount: count,
      conditionType: "class_wins",
      conditionParam: cls
    });
  });
}); 
// 11 classes * 5 milestones = 55 achievements
// + 9 total win achievements = 64 so far.

// --- 3. STORY PROGRESS ---
// Region Unlocks
const regions = ["loreas", "typhon", "nyxia", "solara", "aethelgard", "void"];
regions.forEach(region => {
  const cap = region.charAt(0).toUpperCase() + region.slice(1);
  add({
    id: `achiv_story_unlock_${region}`,
    titleTR: `${cap}'a Yolculuk`,
    titleEN: `Journey to ${cap}`,
    descriptionTR: `${cap} bölgesinin kilidini aç.`,
    descriptionEN: `Unlock the ${cap} region.`,
    category: "Story",
    reward: 500,
    targetCount: 1,
    conditionType: "story_region_unlock",
    conditionParam: region
  });
});

// Specific Boss Kills (Mocked IDs based on region logic usually ending in _boss)
regions.forEach(region => {
    const cap = region.charAt(0).toUpperCase() + region.slice(1);
    add({
      id: `achiv_story_boss_${region}`,
      titleTR: `${cap} Fatihi`,
      titleEN: `Conqueror of ${cap}`,
      descriptionTR: `${cap} bölge patronunu yen.`,
      descriptionEN: `Defeat the ${cap} region boss.`,
      category: "Story",
      reward: 500,
      targetCount: 1,
      conditionType: "story_level_complete",
      conditionParam: `${region}_boss` // Assumed convention
    });
});
// 6 regions * 2 types = 12 achievements. Total: 76.

// --- 4. WEALTH (Coins Earned/Held) ---
// Note: Condition might check current balance or total earned lifetime if tracked. Assuming Balance for now or specific stat.
const coinMilestones = [1000, 5000, 10000, 50000, 100000, 1000000];
coinMilestones.forEach(amount => {
  add({
    id: `achiv_wealth_${amount}`,
    titleTR: `Servet: ${amount.toLocaleString()}`,
    titleEN: `Wealth: ${amount.toLocaleString()}`,
    descriptionTR: `${amount.toLocaleString()} Divine Coin biriktir.`,
    descriptionEN: `Amass ${amount.toLocaleString()} Divine Coins.`,
    category: "Collection",
    reward: 500,
    targetCount: amount,
    conditionType: "coins_earned" // Implementation will check current balance
  });
});
// 6 achievements. Total: 82.

// --- 5. COLLECTION (Items Owned) ---
const itemMilestones = [1, 5, 10, 20, 50];
itemMilestones.forEach(count => {
  add({
    id: `achiv_collection_${count}`,
    titleTR: `Koleksiyoner ${count}`,
    titleEN: `Collector ${count}`,
    descriptionTR: `Mağazadan ${count} eşya satın al/aç.`,
    descriptionEN: `Unlock ${count} items from the shop.`,
    category: "Collection",
    reward: 500,
    targetCount: count,
    conditionType: "items_owned"
  });
});
// 5 achievements. Total: 87.

// --- 6. SPECIAL CHALLENGES ---
add({
  id: "achiv_close_call",
  titleTR: "Kıl Payı",
  titleEN: "Close Call",
  descriptionTR: "5 veya daha az HP ile bir maç kazan.",
  descriptionEN: "Win a match with 5 or less HP remaining.",
  category: "Combat",
  reward: 500,
  targetCount: 1,
  conditionType: "close_call"
});

add({
  id: "achiv_perfect",
  titleTR: "Kusursuz Zafer",
  titleEN: "Flawless Victory",
  descriptionTR: "Hiç hasar almadan bir maç kazan (Max HP).",
  descriptionEN: "Win a match with full HP.",
  category: "Combat",
  reward: 500,
  targetCount: 1,
  conditionType: "perfect_win"
});

// Fill up to 100+ with repetitive grinding goals
// 89 so far.

// --- 7. DEDICATION (Total Games Played) ---
const gamesPlayedParams = [10, 50, 100, 500, 1000];
gamesPlayedParams.forEach(count => {
    add({
      id: `achiv_dedication_${count}`,
      titleTR: `Adanmışlık ${count}`,
      titleEN: `Dedication ${count}`,
      descriptionTR: `Toplam ${count} maç oyna.`,
      descriptionEN: `Play a total of ${count} matches.`,
      category: "Social", // Fitting for "Time spent" or general play
      reward: 500,
      targetCount: count,
      conditionType: "total_games"
    });
});
// 5 achivs. Total: 94.

export { ACHIEVEMENTS };
