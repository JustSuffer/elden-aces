
import { Card, ClassName } from "@/types/game";
import { MASTER_CLASSES } from "@/data/gameData";

// Localization Helper Type
export type LocalizedString = {
  tr: string;
  en: string;
};

export interface StoryLevel {
  id: string;
  name: LocalizedString; // Localized
  opponentName: LocalizedString; // Localized
  opponentClass: ClassName;
  difficulty: "easy" | "medium" | "hard" | "boss";
  description: LocalizedString; // Localized
  dialogue: {
    intro: LocalizedString;
    win: LocalizedString;
    lose: LocalizedString;
  };
  rewards?: {
    gold?: number;
    cardBack?: string;
  };
  customDeck?: Card[]; // If we want specific decks for bosses
}

export interface Region {
  id: string;
  name: string; // Region names are usually proper nouns, but could be localized if needed
  className?: ClassName; // The dominant class of this region
  description: LocalizedString;
  longDescription: LocalizedString;
  coordinates: { x: number; y: number }; // Percentage 0-100 on the map
  levels: StoryLevel[];
  unlockCondition?: string; // e.g. "complete_region_loreas"
}

// Helpers to generate levels
const CLASSES: ClassName[] = [
  "Vitalist", "Slayer", "Fateweaver", "Oracle", "Chronokeeper",
  "Cryomancer", "Decay", "Siren", "Augmentor", "Vessel", "Mimic"
];

function getRandomClass(except?: ClassName): ClassName {
  const pool = CLASSES.filter(c => c !== except);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Procedural Name Generators (Bilingual)
const TITLES = {
  common: [
    { tr: "Nöbetçi", en: "Sentry" },
    { tr: "Savaşçı", en: "Warrior" },
    { tr: "Gezgin", en: "Wanderer" },
    { tr: "Koruyucu", en: "Guardian" },
    { tr: "Avcı", en: "Hunter" },
    { tr: "Casus", en: "Spy" },
    { tr: "Büyücü", en: "Mage" },
    { tr: "Haydut", en: "Bandit" }
  ],
  // Could add class-specific titles later
};

const PREFIXES = [
  { tr: "Kaybolmuş", en: "Lost" },
  { tr: "Karanlık", en: "Dark" },
  { tr: "Vahşi", en: "Savage" },
  { tr: "Eski", en: "Ancient" },
  { tr: "Genç", en: "Young" },
  { tr: "Yorgun", en: "Weary" },
  { tr: "Hırslı", en: "Ambitious" },
  { tr: "Sessiz", en: "Silent" }
];

function generatePatrols(regionId: string, regionClass: ClassName, count: number, startIdx: number): StoryLevel[] {
  const levels: StoryLevel[] = [];

  for (let i = 0; i < count; i++) {
    const id = `${regionId}_gen_${startIdx + i}`;
    const isHard = i > count / 2;
    const opponentClass = Math.random() > 0.4 ? regionClass : getRandomClass(regionClass);

    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const title = TITLES.common[Math.floor(Math.random() * TITLES.common.length)];

    const nameTR = `${prefix.tr} ${title.tr}`;
    const nameEN = `${prefix.en} ${title.en}`;

    levels.push({
      id,
      name: { tr: `Mücadele ${startIdx + i}`, en: `Skirmish ${startIdx + i}` },
      opponentName: { tr: nameTR, en: nameEN },
      opponentClass,
      difficulty: isHard ? "hard" : "medium",
      description: {
        tr: "Bölgede devriye gezen tehlikeli bir düşman.",
        en: "A dangerous enemy patrolling the area."
      },
      dialogue: {
        intro: { tr: "Burada ne işin var yabancı?", en: "What are you doing here, stranger?" },
        win: { tr: "Güçlüymüşsün...", en: "You are... strong..." },
        lose: { tr: "Burası bizim bölgemiz.", en: "This contains to us." }
      }
    });
  }
  return levels;
}

// Base regions with some custom levels
const RAW_REGIONS: Region[] = [
  {
    id: "loreas",
    name: "LOREAS",
    className: "Cryomancer",
    coordinates: { x: 32, y: 18 },
    description: {
      tr: "Devasa, acımasız bir tundra. Buz kristalleri ve sürekli kar fırtınaları.",
      en: "A vast, unforgiving tundra. Ice crystals and constant blizzards."
    },
    longDescription: {
      tr: "Burası sadece Cryomancer'ların değil, soğuğa dayanıklı tüm ırkların yaşadığı devasa, acımasız bir tundra. Sivri buz dağları, donmuş nehirler ve sürekli devam eden kar fırtınaları hakim. Şehirler, devasa buz kristallerinden oyulmuş kubbeler şeklinde. Gökyüzünde sürekli bir aurora (kuzey ışıkları) var.",
      en: "A vast, unforgiving tundra inhabited not only by Cryomancers but all cold-resistant races. Jagged ice mountains, frozen rivers, and perpetual blizzards dominate the landscape. Cities are carved domes within massive ice crystals. An aurora borealis is always visible in the sky."
    },
    levels: [
      {
        id: "loreas_1",
        name: { tr: "Buzdan İzci", en: "Ice Scout" },
        opponentName: { tr: "Donmuş Muhafız", en: "Frozen Guardian" },
        opponentClass: "Cryomancer",
        difficulty: "easy",
        description: {
          tr: "Şehrin girişinde duran, buzla kaplı bir zırha sahip nöbetçi.",
          en: "A sentry with ice-covered armor standing at the city gates."
        },
        dialogue: {
          intro: { tr: "Dur yolcu! Sadece soğuğa hükmedenler geçebilir.", en: "Halt! Only those who command the cold may pass." },
          win: { tr: "Soğuk... ilk defa soğuğu hissediyorum...", en: "Cold... for the first time, I feel cold..." },
          lose: { tr: "Buz heykellerim arasına katılacaksın.", en: "You shall join my collection of ice statues." },
        },
      },
      // Levels 2-19 generated below
      {
        id: "loreas_boss",
        name: { tr: "Buz Kraliçesi (BOSS)", en: "Ice Queen (BOSS)" },
        opponentName: { tr: "Cryomancer Lideri", en: "Cryomancer Leader" },
        opponentClass: "Cryomancer",
        difficulty: "boss",
        description: {
          tr: "Tundranın hakimi. Kalbi de toprakları kadar soğuk.",
          en: "Ruler of the tundra. Her heart is as cold as her lands."
        },
        dialogue: {
          intro: { tr: "Sıcak kanın karların üzerine dökülecek.", en: "Your hot blood will spill upon the snow." },
          win: { tr: "Kış... sona eriyor...", en: "Winter... is ending..." },
          lose: { tr: "Sonsuz kışa hoş geldin.", en: "Welcome to eternal winter." },
        },
        rewards: { cardBack: "Cryomancer" },
      },
    ],
  },
  {
    id: "nyxia",
    name: "NYXIA",
    className: "Oracle",
    coordinates: { x: 55, y: 52 },
    description: {
      tr: "Gizemli ormanlar ve antik kulelerle dolu, büyünün kontrolsüzce aktığı bölge.",
      en: "A region full of mysterious forests and ancient towers where magic flows uncontrolled."
    },
    longDescription: {
      tr: "Büyünün kontrolsüzce aktığı, gizemli ormanlar ve antik kulelerle dolu bir bölge. Topraktan fışkıran mor 'ley hatları' (büyü damarları) görülür. Ağaçlar biyolüminesans mantarlarla kaplı. Yerçekimine meydan okuyan yüzen büyücü kuleleri ve her zaman gece gibi görünen mor bir gökyüzü vardır.",
      en: "A region teeming with uncontrolled magic, mysterious forests, and ancient towers. Purple 'ley lines' burst from the ground. Trees are covered in bioluminescent fungi. Floating wizard towers defy gravity under a perpetually purple night sky."
    },
    levels: [
      {
        id: "nyxia_1",
        name: { tr: "Orman Ruhu", en: "Forest Spirit" },
        opponentName: { tr: "Ley Koruyucusu", en: "Ley Guardian" },
        opponentClass: "Oracle",
        difficulty: "medium",
        description: {
          tr: "Büyü damarlarını koruyan kadim bir varlık.",
          en: "An ancient entity protecting the magic veins."
        },
        dialogue: {
          intro: { tr: "Geleceğini görüyorum... ve orada zafer yok.", en: "I see your future... and there is no victory there." },
          win: { tr: "Kehanet... yanıldı mı?", en: "Did the prophecy... fail?" },
          lose: { tr: "Kaderinden kaçamazsın.", en: "You cannot escape your destiny." },
        },
      },
      // Levels 2-19 generated below
      {
        id: "nyxia_boss",
        name: { tr: "Yüce Kahin (BOSS)", en: "High Oracle (BOSS)" },
        opponentName: { tr: "Oracle", en: "Oracle" }, // Name implies class is unique enough
        opponentClass: "Oracle",
        difficulty: "boss",
        description: {
          tr: "Kulelerin en tepesinde oturan, her şeyi gören göz.",
          en: "The all-seeing eye sitting atop the highest tower."
        },
        dialogue: {
          intro: { tr: "Senin her hamleni sen yapmadan önce biliyorum.", en: "I know your every move before you make it." },
          win: { tr: "Görüşüm... bulanıklaşıyor...", en: "My vision... is blurring..." },
          lose: { tr: "Her şey öngörüldüğü gibi.", en: "Everything is as foreseen." },
        },
        rewards: { cardBack: "Oracle" },
      },
    ],
  },
  {
    id: "yorea",
    name: "YOREA",
    className: "Vessel",
    coordinates: { x: 88, y: 22 },
    description: {
      tr: "Düzenin, medeniyetin ve kutsal gücün merkezi. Işıkla dolu şehirler.",
      en: "Center of order, civilization, and holy power. Cities filled with light."
    },
    longDescription: {
      tr: "Düzenin, medeniyetin ve kutsal gücün merkezi. Beyaz mermer ve altından yapılmış devasa, düzenli şehirler. Bulutların arasından sürekli güneş ışığı huzmeleri iniyor. Bakımlı bahçeler, devasa melek heykelleri ve korunaklı yüksek surlar.",
      en: "The center of order, civilization, and holy power. Massive, orderly cities made of white marble and gold. Beams of sunlight constantly descend through the clouds. Manicured gardens, massive angel statues, and high fortified walls."
    },
    levels: [
      {
        id: "yorea_1",
        name: { tr: "Işık Şövalyesi", en: "Light Knight" },
        opponentName: { tr: "Tapınak Şövalyesi", en: "Templar Knight" },
        opponentClass: "Vessel",
        difficulty: "medium",
        description: {
          tr: "Kutsal düzeni korumaya yeminli sadık bir savaşçı.",
          en: "A loyal warrior sworn to protect the holy order."
        },
        dialogue: {
          intro: { tr: "Işığın adaletiyle yüzleş!", en: "Face the justice of the Light!" },
          win: { tr: "Işık... beni terk etme...", en: "Light... do not abandon me..." },
          lose: { tr: "Karanlık defedildi.", en: "Darkness is banished." },
        },
      },
      // Levels 2-19 generated below
      {
        id: "yorea_boss",
        name: { tr: "Baş Rahip (BOSS)", en: "High Priest (BOSS)" },
        opponentName: { tr: "Vessel", en: "Vessel" },
        opponentClass: "Vessel",
        difficulty: "boss",
        description: {
          tr: "Kutsal gücün yeryüzündeki temsilcisi.",
          en: "Representative of the holy power on earth."
        },
        dialogue: {
          intro: { tr: "Senin varlığın bu kutsal topraklara hakaret.", en: "Your presence is an insult to these holy lands." },
          win: { tr: "İnancım sarsıldı...", en: "My faith is shaken..." },
          lose: { tr: "Kutsal ateş seni arındırsın.", en: "May the holy fire purify you." },
        },
        rewards: { cardBack: "Vessel" },
      },
    ],
  },
  {
    id: "typhon",
    name: "TYPHON",
    className: "Slayer",
    coordinates: { x: 42, y: 40 },
    description: {
      tr: "Savaşın şekillendirdiği sert coğrafya. Kızıl topraklar ve kemik yığınları.",
      en: "A harsh geography shaped by war. Red lands and piles of bones."
    },
    longDescription: {
      tr: "Mutant savaşçıların ve dayanıklı ırkların yaşadığı, savaşın şekillendirdiği sert coğrafya. Çatlamış kızıl topraklar, dikenli kaya oluşumları ve toz fırtınaları. Şehirler daha çok devasa savaş kampları. Etrafta devasa canavar kemikleri ve savaş kalıntıları var.",
      en: "A harsh geography inhabited by mutant warriors and resilient races, shaped by war. Cracked red earth, thorny rock formations, and dust storms. Cities are more like massive war camps. Giant monster bones and war remnants are scattered everywhere."
    },
    levels: [
      {
        id: "typhon_1",
        name: { tr: "Savaşçı", en: "Warrior" },
        opponentName: { tr: "Kanlı Balta", en: "Bloody Axe" },
        opponentClass: "Slayer",
        difficulty: "easy",
        description: {
          tr: "Sadece savaşmak için yaşayan bir barbar.",
          en: "A barbarian living only to fight."
        },
        dialogue: {
          intro: { tr: "Kafatasından kadeh yapacağım!", en: "I will make a goblet from your skull!" },
          win: { tr: "İyi... vuruştu...", en: "Good... hit..." },
          lose: { tr: "Zayıflara yer yok!", en: "No place for the weak!" },
        },
      },
      // Levels 2-19 generated below
      {
        id: "typhon_boss",
        name: { tr: "Savaş Lordu (BOSS)", en: "Warlord (BOSS)" },
        opponentName: { tr: "Slayer", en: "Slayer" },
        opponentClass: "Slayer",
        difficulty: "boss",
        description: {
          tr: "Yüzlerce savaştan sağ çıkmış, yenilmez bir komutan.",
          en: "An invincible commander who survived hundreds of battles."
        },
        dialogue: {
          intro: { tr: "Bana gerçek bir meydan okuma ver!", en: "Give me a real challenge!" },
          win: { tr: "Sonunda... onurlu bir ölüm...", en: "Finally... an honorable death..." },
          lose: { tr: "Sadece bir yemektin.", en: "You were just a meal." },
        },
        rewards: { cardBack: "Slayer" },
      },
    ],
  },
  {
    id: "tartarus",
    name: "TARTARUS",
    className: "Decay",
    coordinates: { x: 74, y: 38 },
    description: {
      tr: "Çürümenin ve yıkıcı ateşin hüküm sürdüğü lanetli bölge. Volkanlar ve kül.",
      en: "A cursed region ruled by decay and destructive fire. Volcanoes and ash."
    },
    longDescription: {
      tr: "Çürümenin ve yıkıcı ateşin hüküm sürdüğü, lanetli bölge. Aktif volkanlar, lav nehirleri ve kararmış, ölü ormanlar. Gökyüzü duman ve külle kaplı, kırmızı şimşekler çakıyor. Şehirler obsidyen ve demirden yapılmış, korkutucu görünümlü.",
      en: "A cursed region ruled by decay and destructive fire. Active volcanoes, rivers of lava, and blackened, dead forests. The sky is covered in smoke and ash, with red lightning striking. Cities are made of obsidian and iron, looking terrifying."
    },
    levels: [
      {
        id: "tartarus_1",
        name: { tr: "Kül Bekçisi", en: "Ash Warden" },
        opponentName: { tr: "Yanık Ruh", en: "Burnt Soul" },
        opponentClass: "Decay",
        difficulty: "medium",
        description: {
          tr: "Volkanik küllerin arasından doğmuş bir varlık.",
          en: "An entity born from volcanic ash."
        },
        dialogue: {
          intro: { tr: "Her şey küle dönecek.", en: "Everything will turn to ash." },
          win: { tr: "Söndüm...", en: "Extinguished..." },
          lose: { tr: "Yan ve yok ol.", en: "Burn and perish." },
        },
      },
      // Levels 2-19 generated below
      {
        id: "tartarus_boss",
        name: { tr: "Yıkım Getiren (BOSS)", en: "Bringer of Ruin (BOSS)" },
        opponentName: { tr: "Decay", en: "Decay" },
        opponentClass: "Decay",
        difficulty: "boss",
        description: {
          tr: "Sadece yok etmeyi amaçlayan kadim bir güç.",
          en: "An ancient power sensing only destruction."
        },
        dialogue: {
          intro: { tr: "Dünyanın sonunu getireceğim.", en: "I will bring the end of the world." },
          win: { tr: "Yıkım... durduruldu...", en: "Destruction... halted..." },
          lose: { tr: "Hiçlik seni bekliyor.", en: "Void awaits you." },
        },
        rewards: { cardBack: "Decay" },
      },
    ],
  },
  {
    id: "revin",
    name: "REVIN",
    className: "Fateweaver", // Shared with Mimic
    coordinates: { x: 50, y: 70 },
    description: {
      tr: "Düzenbazların, tüccarların ve şansına güvenenlerin buluşma noktası.",
      en: "A meeting point for tricksters, merchants, and those who trust their luck."
    },
    longDescription: {
      tr: "Uçsuz bucaksız altın kum tepeleri arasında devasa bir vaha şehri. Labirent gibi çarşılar, kumarhaneler ve gösterişli, oryantal mimari. Her köşe başında bir Mimic veya kaderini arayan bir Fateweaver olabilir. Kaotik, canlı ve aldatıcı.",
      en: "A massive oasis city amidst endless golden dunes. Labyrinthine bazaars, casinos, and flashy oriental architecture. A Mimic or a Fateweaver seeking their destiny could be around every corner. Chaotic, vibrant, and deceptive."
    },
    levels: [
      {
        id: "revin_1",
        name: { tr: "Kumarbaz", en: "Gambler" },
        opponentName: { tr: "Zar Ustası", en: "Dice Master" },
        opponentClass: "Fateweaver",
        difficulty: "medium",
        description: {
          tr: "Şansına aşırı güvenen bir sokak kumarbazı.",
          en: "A street gambler overly confident in their luck."
        },
        dialogue: {
          intro: { tr: "Bahisleri görelim!", en: "Let's see the bets!" },
          win: { tr: "Şansım... döndü...", en: "My luck... turned..." },
          lose: { tr: "Kasa her zaman kazanır.", en: "The house always wins." },
        },
      },
      // Levels 2-19 generated below
      {
        id: "revin_boss",
        name: { tr: "Kader Oyuncusu (BOSS)", en: "Fate Player (BOSS)" },
        opponentName: { tr: "Fateweaver", en: "Fateweaver" },
        opponentClass: "Fateweaver",
        difficulty: "boss",
        description: {
          tr: "Şehrin yeraltı dünyasını yöneten baron.",
          en: "The baron ruling the city's underworld."
        },
        dialogue: {
          intro: { tr: "Kaderin ipleri ellerimde.", en: "The strings of fate are in my hands." },
          win: { tr: "İpler... koptu...", en: "Strings... snapped..." },
          lose: { tr: "Oyun bitti.", en: "Game over." },
        },
        rewards: { cardBack: "Fateweaver" },
      },
    ],
  },
  {
    id: "talos",
    name: "TALOS",
    className: "Augmentor",
    coordinates: { x: 92, y: 70 },
    description: {
      tr: "Bilim ve teknolojinin doğayla birleştiği endüstriyel ada.",
      en: "An industrial island where science and technology merge with nature."
    },
    longDescription: {
      tr: "Bilim ve teknolojinin doğayla birleştiği yer. Adanın her yerinden buharlar tütüyor. Devasa çarklar, pirinç borular ve saat kulesi benzeri yapılar var. Dağların zirvelerinde Valkürlerin iniş pistleri, yer altında ise Cücelerin devasa atölyeleri var.",
      en: "Where science and technology merge with nature. Steam rises from everywhere on the island. Massive gears, brass pipes, and clocktower-like structures abound. Valkyrie landing strips atop mountains, and massive Dwarven workshops underground."
    },
    levels: [
      {
        id: "talos_1",
        name: { tr: "Otomat", en: "Automaton" },
        opponentName: { tr: "MK-1 Muhafız", en: "MK-1 Guardian" },
        opponentClass: "Augmentor",
        difficulty: "medium",
        description: {
          tr: "Fabrika çıkışlı, duygusuz bir savaş makinesi.",
          en: "An emotionless war machine fresh from the factory."
        },
        dialogue: {
          intro: { tr: "Hedef kilitlendi. İmha prosedürü başlatılıyor.", en: "Target locked. Initiation destruction procedure." },
          win: { tr: "Güç... seviyesi... kritik...", en: "Power... level... critical..." },
          lose: { tr: "Tehdit ortadan kaldırıldı.", en: "Threat eliminated." },
        },
      },
      // Levels 2-19 generated below
      {
        id: "talos_boss",
        name: { tr: "Baş Mühendis (BOSS)", en: "Chief Engineer (BOSS)" },
        opponentName: { tr: "Augmentor", en: "Augmentor" },
        opponentClass: "Augmentor",
        difficulty: "boss",
        description: {
          tr: "Makinelerin efendisi.",
          en: "Master of machines."
        },
        dialogue: {
          intro: { tr: "Verimliliğin çok düşük. Seni güncelleyeceğim.", en: "Your efficiency is too low. I will upgrade you." },
          win: { tr: "Sistem... hatası...", en: "System... error..." },
          lose: { tr: "Eskidi ve atıldı.", en: "Obsolete and discarded." },
        },
        rewards: { cardBack: "Augmentor" },
      },
    ],
  },
  {
    id: "ogia",
    name: "OGIA",
    className: "Vitalist", // Shared with Siren
    coordinates: { x: 92, y: 88 },
    description: {
      tr: "Doğanın en saf ve en güçlü hali. Huzurlu ve büyüleyici.",
      en: "Nature in its purest and most powerful form. Peaceful and enchanting."
    },
    longDescription: {
      tr: "Doğanın en saf ve en güçlü hali. Cennet gibi, huzurlu, mitolojik ve büyüleyici. İki zıt ama uyumlu biyom bir arada.",
      en: "Nature in its purest and most powerful form. Heaven-like, peaceful, mythological, and enchanting. Two opposite but harmonious biomes together."
    },
    levels: [
      {
        id: "ogia_1",
        name: { tr: "Orman Bekçisi", en: "Forest Warden" },
        opponentName: { tr: "Kök Muhafız", en: "Root Guardian" },
        opponentClass: "Vitalist",
        difficulty: "medium",
        description: {
          tr: "Ağaçlarla bütünleşmiş bir doğa koruyucusu.",
          en: "A nature guardian moved with the trees."
        },
        dialogue: {
          intro: { tr: "Orman yabancıları sevmez.", en: "The forest does not like strangers." },
          win: { tr: "Toprak... beni çağırıyor...", en: "The soil... calls me..." },
          lose: { tr: "Ormanın gübresi olacaksın.", en: "You will be fertilizer for the forest." },
        },
      },
      // Levels 2-19 generated below
      {
        id: "ogia_boss",
        name: { tr: "Doğa Ana (BOSS)", en: "Mother Nature (BOSS)" },
        opponentName: { tr: "Vitalist", en: "Vitalist" },
        opponentClass: "Vitalist",
        difficulty: "boss",
        description: {
          tr: "Ormanın kalbi ve koruyucusu.",
          en: "Heart and guardian of the forest."
        },
        dialogue: {
          intro: { tr: "Doğa intikamını alacak.", en: "Nature will take its revenge." },
          win: { tr: "Döngü... devam eder...", en: "The cycle... continues..." },
          lose: { tr: "Toprağa karış.", en: "Return to the earth." },
        },
        rewards: { cardBack: "Vitalist" },
      },
    ],
  },
  {
    id: "aeon",
    name: "AEON",
    className: "Chronokeeper",
    coordinates: { x: 14, y: 78 },
    description: {
      tr: "Zaman ve mekanın ötesindeki varlıkların merkezi.",
      en: "Center of beings beyond time and space."
    },
    longDescription: {
      tr: "Dünyanın dengesini koruyan, zaman ve mekanın ötesindeki varlıkların (Rix, Chronokeeper) merkezleri. Gizemli, erişilmez ve zamansız.",
      en: "Centers for beings beyond time and space (Rix, Chronokeeper) who maintain the world's balance. Mysterious, inaccessible, and timeless."
    },
    levels: [
      {
        id: "aeon_1",
        name: { tr: "Gölge", en: "Shadow" },
        opponentName: { tr: "Hiçlik Gezgini", en: "Void Walker" },
        opponentClass: "Mimic",
        difficulty: "hard",
        description: {
          tr: "Zamanın çatlaklarında yaşayan bir gölge.",
          en: "A shadow living in the cracks of time."
        },
        dialogue: {
          intro: { tr: "Ben yokum... ama senin sonunum.", en: "I do not exist... but I am your end." },
          win: { tr: "Hiçliğe... dönüyorum...", en: "Returning... to void..." },
          lose: { tr: "Varla yok arası.", en: "Between existence and non-existence." },
        },
      },
      // Levels 2-19 generated below
      {
        id: "aeon_boss",
        name: { tr: "Zaman Bekçisi (BOSS)", en: "Time Keeper (BOSS)" },
        opponentName: { tr: "Chronokeeper", en: "Chronokeeper" },
        opponentClass: "Chronokeeper",
        difficulty: "boss",
        description: {
          tr: "Zamanı manipüle ederek suç işleyen bir hain.",
          en: "A traitor committing crimes by manipulating time."
        },
        dialogue: {
          intro: { tr: "Zaman senin için doldu.", en: "Time is up for you." },
          win: { tr: "Zaman... durdu...", en: "Time... stopped..." },
          lose: { tr: "Tarihten silindin.", en: "Erased from history." },
        },
        rewards: { cardBack: "Chronokeeper" },
      },
    ],
  },
];

// Enrich with procedural levels
export const STORY_REGIONS = RAW_REGIONS.map(region => {
  // We already have level 1 (idx 0) and the Boss (last idx)
  // We want 20 levels total. So we need to insert 18 procedural levels between 1st and Boss.
  // The boss is currently at index 1 in the array above.
  const firstLevel = region.levels[0];
  const bossLevel = region.levels[region.levels.length - 1]; // Should be level 20 in the end

  const patrols = generatePatrols(region.id, region.className || "Slayer", 18, 2);

  // Assign IDs correctly
  // Level 1: id already set
  // Levels 2-19: patrols
  // Level 20: boss

  // Fix IDs of boss
  bossLevel.id = `${region.id}_20`; // Level 20

  // Fix boss name display logic if needed (it's already localized object)

  return {
    ...region,
    levels: [firstLevel, ...patrols, bossLevel]
  };
});
