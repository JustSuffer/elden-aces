/**
 * ELO-Based Rank System for ACORIA
 * 
 * Bölgeler ve Rütbeler:
 * - REVIN (0-400): Bronz - Çöl ve Kader
 * - NYXIA (400-800): Gümüş - Gizem ve Büyü
 * - OGIA (800-1200): Platin - Doğa ve Uyum
 * - TYPHON (1200-1600): Zümrüt - Savaş ve Kan
 * - TALOS (1600-2000): Altın - Çelik ve Buhar
 * - LOREAS (1600-2000): Elmas - Soğuk ve Kusursuzluk
 * - TARTARUS (2000-2400): Master - Yıkım ve Ateş
 * - AEON (2400-2800): Grandmaster - Zaman ve Hiçlik
 * - YOREA (2800-3000): Challenger - İlahi Düzen
 * - YOREA+ (3000+): Gerçek Zirve
 */

export interface RankTier {
  id: string;
  name: { tr: string; en: string };
  region: string;
  color: string;
  minElo: number;
  maxElo: number;
  tier: number; // IV = 4, III = 3, II = 2, I = 1
  description: { tr: string; en: string };
}

export const RANK_TIERS: RankTier[] = [
  // REVIN - Bronz (0-400)
  {
    id: "revin_iv",
    name: { tr: "Avare", en: "Drifter" },
    region: "REVIN",
    color: "#D97706", // Sarı/Turuncu
    minElo: 0,
    maxElo: 100,
    tier: 4,
    description: { tr: "Çölde yolunu kaybetmiş, henüz bir amacı olmayan.", en: "Lost in the desert, without purpose yet." }
  },
  {
    id: "revin_iii",
    name: { tr: "Kum Taciri", en: "Dune Trader" },
    region: "REVIN",
    color: "#D97706",
    minElo: 100,
    maxElo: 200,
    tier: 3,
    description: { tr: "Hayatta kalmanın yollarını öğrenmeye başlayan.", en: "Learning the ways of survival." }
  },
  {
    id: "revin_ii",
    name: { tr: "Hilebaz", en: "Trickster" },
    region: "REVIN",
    color: "#D97706",
    minElo: 200,
    maxElo: 300,
    tier: 2,
    description: { tr: "Mimic'lerin doğasını çözen, kurnazlaşan.", en: "Mastering the nature of Mimics." }
  },
  {
    id: "revin_i",
    name: { tr: "Vaha Prensi", en: "Prince of Oasis" },
    region: "REVIN",
    color: "#D97706",
    minElo: 300,
    maxElo: 400,
    tier: 1,
    description: { tr: "Çölün zenginliğine ve kaosuna hükmeden.", en: "Ruling the chaos and riches of the desert." }
  },

  // NYXIA - Gümüş (400-800)
  {
    id: "nyxia_iv",
    name: { tr: "Gece Nöbetçisi", en: "Night Watch" },
    region: "NYXIA",
    color: "#7C3AED", // Koyu Mor
    minElo: 400,
    maxElo: 500,
    tier: 4,
    description: { tr: "Ormanın sınırında bekleyen.", en: "Standing guard at the forest's edge." }
  },
  {
    id: "nyxia_iii",
    name: { tr: "Ley Gezgini", en: "Ley Walker" },
    region: "NYXIA",
    color: "#7C3AED",
    minElo: 500,
    maxElo: 600,
    tier: 3,
    description: { tr: "Büyü damarlarını takip edebilen.", en: "Following the veins of magic." }
  },
  {
    id: "nyxia_ii",
    name: { tr: "Kahin", en: "Soothsayer" },
    region: "NYXIA",
    color: "#7C3AED",
    minElo: 600,
    maxElo: 700,
    tier: 2,
    description: { tr: "Geleceği parça parça görebilen.", en: "Seeing glimpses of the future." }
  },
  {
    id: "nyxia_i",
    name: { tr: "Mor Göz", en: "Violet Eye" },
    region: "NYXIA",
    color: "#7C3AED",
    minElo: 700,
    maxElo: 800,
    tier: 1,
    description: { tr: "Karanlıkta bile gerçeği gören, ormanın efendisi.", en: "Seeing truth in darkness, master of the forest." }
  },

  // OGIA - Platin (800-1200)
  {
    id: "ogia_iv",
    name: { tr: "Filiz", en: "Sprout" },
    region: "OGIA",
    color: "#22C55E", // Yeşil
    minElo: 800,
    maxElo: 900,
    tier: 4,
    description: { tr: "Potansiyeli olan ama henüz ham.", en: "Raw potential waiting to bloom." }
  },
  {
    id: "ogia_iii",
    name: { tr: "Yaban Bekçisi", en: "Wild Warden" },
    region: "OGIA",
    color: "#22C55E",
    minElo: 900,
    maxElo: 1000,
    tier: 3,
    description: { tr: "Kendi koridorunu/alanını kusursuz savunan.", en: "Defending their territory flawlessly." }
  },
  {
    id: "ogia_ii",
    name: { tr: "Siren Sesi", en: "Siren's Call" },
    region: "OGIA",
    color: "#22C55E",
    minElo: 1000,
    maxElo: 1100,
    tier: 2,
    description: { tr: "Rakiplerini oyuna getirip tuzağa çeken.", en: "Luring opponents into traps." }
  },
  {
    id: "ogia_i",
    name: { tr: "Doğa Ana'nın Seçilmişi", en: "Chosen of Gaia" },
    region: "OGIA",
    color: "#22C55E",
    minElo: 1100,
    maxElo: 1200,
    tier: 1,
    description: { tr: "Bölgenin en saf gücü.", en: "The purest power of the region." }
  },

  // TYPHON - Zümrüt (1200-1600)
  {
    id: "typhon_iv",
    name: { tr: "Kemik Kıran", en: "Bone Breaker" },
    region: "TYPHON",
    color: "#EF4444", // Açık Kırmızı
    minElo: 1200,
    maxElo: 1300,
    tier: 4,
    description: { tr: "Kaba kuvvetle ilerleyen.", en: "Advancing through brute force." }
  },
  {
    id: "typhon_iii",
    name: { tr: "Kızıl Yağmacı", en: "Crimson Raider" },
    region: "TYPHON",
    color: "#EF4444",
    minElo: 1300,
    maxElo: 1400,
    tier: 3,
    description: { tr: "Rakiplerin hatalarını affetmeyen.", en: "Never forgiving opponent's mistakes." }
  },
  {
    id: "typhon_ii",
    name: { tr: "Savaş Lordu", en: "Warlord" },
    region: "TYPHON",
    color: "#EF4444",
    minElo: 1400,
    maxElo: 1500,
    tier: 2,
    description: { tr: "Sadece kendini değil, savaşı yöneten.", en: "Commanding the battle, not just self." }
  },
  {
    id: "typhon_i",
    name: { tr: "Katil", en: "Slayer" },
    region: "TYPHON",
    color: "#EF4444",
    minElo: 1500,
    maxElo: 1600,
    tier: 1,
    description: { tr: "Bölgenin adına yaraşır, saf bir ölüm makinesi.", en: "A pure death machine, worthy of the region." }
  },

  // LOREAS - Elmas (1600-2000)
  {
    id: "loreas_iv",
    name: { tr: "Buzul", en: "Glacier" },
    region: "LOREAS",
    color: "#38BDF8", // Açık Mavi
    minElo: 1600,
    maxElo: 1700,
    tier: 4,
    description: { tr: "Sarsılmaz, yıkılmaz.", en: "Unshakeable, indestructible." }
  },
  {
    id: "loreas_iii",
    name: { tr: "Kristal Muhafız", en: "Crystal Guard" },
    region: "LOREAS",
    color: "#38BDF8",
    minElo: 1700,
    maxElo: 1800,
    tier: 3,
    description: { tr: "Parlak ve keskin.", en: "Brilliant and sharp." }
  },
  {
    id: "loreas_ii",
    name: { tr: "Ayazbükücü", en: "Frostbinder" },
    region: "LOREAS",
    color: "#38BDF8",
    minElo: 1800,
    maxElo: 1900,
    tier: 2,
    description: { tr: "Rakiplerini dondurup kontrol eden.", en: "Freezing and controlling opponents." }
  },
  {
    id: "loreas_i",
    name: { tr: "Kışın Tacı", en: "Crown of Winter" },
    region: "LOREAS",
    color: "#38BDF8",
    minElo: 1900,
    maxElo: 2000,
    tier: 1,
    description: { tr: "Zirvenin soğuğuna hükmeden.", en: "Commanding the cold of the peak." }
  },

  // TARTARUS - Master (2000-2400)
  {
    id: "tartarus_iv",
    name: { tr: "Köz", en: "Ember" },
    region: "TARTARUS",
    color: "#991B1B", // Koyu Kırmızı/Bordo
    minElo: 2000,
    maxElo: 2100,
    tier: 4,
    description: { tr: "Sönmeyen bir tehdit.", en: "An undying threat." }
  },
  {
    id: "tartarus_iii",
    name: { tr: "Lav Yürüyen", en: "Magma Walker" },
    region: "TARTARUS",
    color: "#991B1B",
    minElo: 2100,
    maxElo: 2200,
    tier: 3,
    description: { tr: "En tehlikeli zeminlerde bile hata yapmayan.", en: "Flawless even on the most dangerous ground." }
  },
  {
    id: "tartarus_ii",
    name: { tr: "Kıyamet Tellalı", en: "Doom Herald" },
    region: "TARTARUS",
    color: "#991B1B",
    minElo: 2200,
    maxElo: 2300,
    tier: 2,
    description: { tr: "Oyunun sonunu getiren.", en: "Bringing the end of the game." }
  },
  {
    id: "tartarus_i",
    name: { tr: "Cehennem Lordu", en: "Hell Lord" },
    region: "TARTARUS",
    color: "#991B1B",
    minElo: 2300,
    maxElo: 2400,
    tier: 1,
    description: { tr: "Yıkımın efendisi.", en: "Lord of destruction." }
  },

  // AEON - Grandmaster (2400-2800)
  {
    id: "aeon_iv",
    name: { tr: "Zaman Yolcusu", en: "Time Traveler" },
    region: "AEON",
    color: "#6B7280", // Gri
    minElo: 2400,
    maxElo: 2500,
    tier: 4,
    description: { tr: "Hataları geri alabilen.", en: "Able to undo mistakes." }
  },
  {
    id: "aeon_iii",
    name: { tr: "Hiçlik Gözü", en: "Void Eye" },
    region: "AEON",
    color: "#6B7280",
    minElo: 2500,
    maxElo: 2600,
    tier: 3,
    description: { tr: "Haritanın her yerini gören.", en: "Seeing every corner of the map." }
  },
  {
    id: "aeon_ii",
    name: { tr: "Kronometre", en: "Chronometer" },
    region: "AEON",
    color: "#6B7280",
    minElo: 2600,
    maxElo: 2700,
    tier: 2,
    description: { tr: "Her saniyesi hesaplı, kusursuz zamanlama.", en: "Every second calculated, perfect timing." }
  },
  {
    id: "aeon_i",
    name: { tr: "Sonsuzluk", en: "Eternity" },
    region: "AEON",
    color: "#6B7280",
    minElo: 2700,
    maxElo: 2800,
    tier: 1,
    description: { tr: "Ölümsüz ve yenilmez hissettiren.", en: "Feeling immortal and invincible." }
  },

  // YOREA - Challenger (2800-3000)
  {
    id: "yorea",
    name: { tr: "Yorea", en: "Yorea" },
    region: "YOREA",
    color: "#F59E0B", // Altın
    minElo: 2800,
    maxElo: 3000,
    tier: 1,
    description: { tr: "Sadece en iyilerin girebildiği ilahi kat.", en: "The divine realm only the best can enter." }
  },

  // YOREA+ - Gerçek Zirve (3000+)
  {
    id: "yorea_plus",
    name: { tr: "Yorea Efsanesi", en: "Yorea Legend" },
    region: "YOREA",
    color: "#FBBF24", // Parlak Altın
    minElo: 3000,
    maxElo: 99999,
    tier: 0,
    description: { tr: "Gerçek zirve. Efsane.", en: "The true peak. Legend." }
  }
];

/**
 * Get rank tier by ELO
 */
export function getRankByElo(elo: number): RankTier {
  // Find the tier that matches the ELO
  const tier = RANK_TIERS.find(t => elo >= t.minElo && elo < t.maxElo);
  return tier || RANK_TIERS[0]; // Default to first tier
}

/**
 * Get rank display name by ELO (with tier number)
 */
export function getRankDisplayName(elo: number, lang: "tr" | "en" = "tr"): string {
  const tier = getRankByElo(elo);
  const tierNum = tier.tier > 0 ? ` ${["I", "II", "III", "IV"][tier.tier - 1]}` : "";
  return `${tier.region}${tierNum}`;
}

/**
 * Get rank title (e.g., "Avare", "Drifter")
 */
export function getRankTitle(elo: number, lang: "tr" | "en" = "tr"): string {
  const tier = getRankByElo(elo);
  return tier.name[lang];
}

/**
 * Get full rank info string
 */
export function getFullRankInfo(elo: number, lang: "tr" | "en" = "tr"): string {
  const tier = getRankByElo(elo);
  const tierNum = tier.tier > 0 ? ` ${["I", "II", "III", "IV"][tier.tier - 1]}` : "";
  return `${tier.region}${tierNum} - ${tier.name[lang]}`;
}

/**
 * Get progress to next tier (0-100)
 */
export function getEloProgress(elo: number): number {
  const tier = getRankByElo(elo);
  const range = tier.maxElo - tier.minElo;
  const progress = elo - tier.minElo;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

/**
 * Get ELO needed for next tier
 */
export function getEloToNextTier(elo: number): number {
  const tier = getRankByElo(elo);
  return Math.max(0, tier.maxElo - elo);
}

/**
 * Get rank color
 */
export function getRankColor(elo: number): string {
  return getRankByElo(elo).color;
}

/**
 * Calculate new ELO after match
 * K-factor adjusts based on rank
 */
export function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  won: boolean
): number {
  // K-factor varies by rank
  let kFactor = 32;
  if (playerElo >= 2000) kFactor = 24;
  if (playerElo >= 2400) kFactor = 20;
  if (playerElo >= 2800) kFactor = 16;

  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actualScore = won ? 1 : 0;
  const change = Math.round(kFactor * (actualScore - expectedScore));

  return change;
}

/**
 * Get region theme info
 */
export const REGION_THEMES: Record<string, { theme: { tr: string; en: string }; equivalent: string }> = {
  REVIN: { theme: { tr: "Şans, Ticaret ve Çöl", en: "Luck, Trade and Desert" }, equivalent: "BRONZE" },
  NYXIA: { theme: { tr: "Karanlık orman ve büyü", en: "Dark forest and magic" }, equivalent: "SILVER" },
  OGIA: { theme: { tr: "Yaşam ve Saflık", en: "Life and Purity" }, equivalent: "PLATINUM" },
  TYPHON: { theme: { tr: "Vahşet ve Mücadele", en: "Brutality and Struggle" }, equivalent: "EMERALD" },
  LOREAS: { theme: { tr: "Buz ve Kristal", en: "Ice and Crystal" }, equivalent: "DIAMOND" },
  TARTARUS: { theme: { tr: "Yıkım ve Ateş", en: "Destruction and Fire" }, equivalent: "MASTER" },
  AEON: { theme: { tr: "Zaman ve Hiçlik", en: "Time and Void" }, equivalent: "GRANDMASTER" },
  YOREA: { theme: { tr: "Işık, Düzen ve Krallık", en: "Light, Order and Kingdom" }, equivalent: "CHALLENGER" }
};
