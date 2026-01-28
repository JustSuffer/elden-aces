
import { Card, ClassName } from "@/types/game";
import { MASTER_CLASSES } from "@/data/gameData";

export interface StoryLevel {
  id: string;
  name: string;
  opponentName: string;
  opponentClass: ClassName;
  difficulty: "easy" | "medium" | "hard" | "boss";
  description: string;
  dialogue: {
    intro: string;
    win: string;
    lose: string;
  };
  rewards?: {
    gold?: number;
    cardBack?: string;
  };
  customDeck?: Card[]; // If we want specific decks for bosses
}

export interface Region {
  id: string;
  name: string;
  className?: ClassName; // The dominant class of this region
  description: string;
  longDescription: string;
  coordinates: { x: number; y: number }; // Percentage 0-100 on the map
  levels: StoryLevel[];
  unlockCondition?: string; // e.g. "complete_region_loreas"
}

export const STORY_REGIONS: Region[] = [
  {
    id: "loreas",
    name: "LOREAS",
    className: "Cryomancer",
    coordinates: { x: 25, y: 15 },
    description: "Devasa, acımasız bir tundra. Buz kristalleri ve sürekli kar fırtınaları.",
    longDescription:
      "Burası sadece Cryomancer'ların değil, soğuğa dayanıklı tüm ırkların yaşadığı devasa, acımasız bir tundra. Sivri buz dağları, donmuş nehirler ve sürekli devam eden kar fırtınaları hakim. Şehirler, devasa buz kristallerinden oyulmuş kubbeler şeklinde. Gökyüzünde sürekli bir aurora (kuzey ışıkları) var.",
    levels: [
      {
        id: "loreas_1",
        name: "Buzdan İzci",
        opponentName: "Donmuş Muhafız",
        opponentClass: "Cryomancer",
        difficulty: "easy",
        description: "Şehrin girişinde duran, buzla kaplı bir zırha sahip nöbetçi.",
        dialogue: {
          intro: "Dur yolcu! Sadece soğuğa hükmedenler geçebilir.",
          win: "Soğuk... ilk defa soğuğu hissediyorum...",
          lose: "Buz heykellerim arasına katılacaksın.",
        },
      },
      {
        id: "loreas_boss",
        name: "Buz Kraliçesi",
        opponentName: "Cryomancer Lideri",
        opponentClass: "Cryomancer",
        difficulty: "boss",
        description: "Tundranın hakimi. Kalbi de toprakları kadar soğuk.",
        dialogue: {
          intro: "Sıcak kanın karların üzerine dökülecek.",
          win: "Kış... sona eriyor...",
          lose: "Sonsuz kışa hoş geldin.",
        },
        rewards: { cardBack: "Cryomancer" },
      },
    ],
  },
  {
    id: "nyxia",
    name: "NYXIA",
    className: "Oracle",
    coordinates: { x: 50, y: 45 },
    description: "Gizemli ormanlar ve antik kulelerle dolu, büyünün kontrolsüzce aktığı bölge.",
    longDescription:
      "Büyünün kontrolsüzce aktığı, gizemli ormanlar ve antik kulelerle dolu bir bölge. Topraktan fışkıran mor 'ley hatları' (büyü damarları) görülür. Ağaçlar biyolüminesans mantarlarla kaplı. Yerçekimine meydan okuyan yüzen büyücü kuleleri ve her zaman gece gibi görünen mor bir gökyüzü vardır.",
    levels: [
      {
        id: "nyxia_1",
        name: "Orman Ruhu",
        opponentName: "Ley Koruyucusu",
        opponentClass: "Oracle",
        difficulty: "medium",
        description: "Büyü damarlarını koruyan kadim bir varlık.",
        dialogue: {
          intro: "Geleceğini görüyorum... ve orada zafer yok.",
          win: "Kehanet... yanıldı mı?",
          lose: "Kaderinden kaçamazsın.",
        },
      },
      {
        id: "nyxia_boss",
        name: "Yüce Kahin",
        opponentName: "Oracle",
        opponentClass: "Oracle",
        difficulty: "boss",
        description: "Kulelerin en tepesinde oturan, her şeyi gören göz.",
        dialogue: {
          intro: "Senin her hamleni sen yapmadan önce biliyorum.",
          win: "Görüşüm... bulanıklaşıyor...",
          lose: "Her şey öngörüldüğü gibi.",
        },
        rewards: { cardBack: "Oracle" },
      },
    ],
  },
  {
    id: "yorea",
    name: "YOREA",
    className: "Vessel",
    coordinates: { x: 80, y: 15 },
    description: "Düzenin, medeniyetin ve kutsal gücün merkezi. Işıkla dolu şehirler.",
    longDescription:
      "Düzenin, medeniyetin ve kutsal gücün merkezi. Beyaz mermer ve altından yapılmış devasa, düzenli şehirler. Bulutların arasından sürekli güneş ışığı huzmeleri iniyor. Bakımlı bahçeler, devasa melek heykelleri ve korunaklı yüksek surlar.",
    levels: [
      {
        id: "yorea_1",
        name: "Işık Şövalyesi",
        opponentName: "Tapınak Şövalyesi",
        opponentClass: "Vessel",
        difficulty: "medium",
        description: "Kutsal düzeni korumaya yeminli sadık bir savaşçı.",
        dialogue: {
          intro: "Işığın adaletiyle yüzleş!",
          win: "Işık... beni terk etme...",
          lose: "Karanlık defedildi.",
        },
      },
      {
        id: "yorea_boss",
        name: "Baş Rahip",
        opponentName: "Vessel",
        opponentClass: "Vessel",
        difficulty: "boss",
        description: "Kutsal gücün yeryüzündeki temsilcisi.",
        dialogue: {
          intro: "Senin varlığın bu kutsal topraklara hakaret.",
          win: "İnancım sarsıldı...",
          lose: "Kutsal ateş seni arındırsın.",
        },
         rewards: { cardBack: "Vessel" },
      },
    ],
  },
  {
    id: "typhon",
    name: "TYPHON",
    className: "Slayer",
    coordinates: { x: 35, y: 35 },
    description: "Savaşın şekillendirdiği sert coğrafya. Kızıl topraklar ve kemik yığınları.",
    longDescription:
      "Mutant savaşçıların ve dayanıklı ırkların yaşadığı, savaşın şekillendirdiği sert coğrafya. Çatlamış kızıl topraklar, dikenli kaya oluşumları ve toz fırtınaları. Şehirler daha çok devasa savaş kampları. Etrafta devasa canavar kemikleri ve savaş kalıntıları var.",
    levels: [
      {
        id: "typhon_1",
        name: "Savaşçı",
        opponentName: "Kanlı Balta",
        opponentClass: "Slayer",
        difficulty: "easy",
        description: "Sadece savaşmak için yaşayan bir barbar.",
        dialogue: {
          intro: "Kafatasından kadeh yapacağım!",
          win: "İyi... vuruştu...",
          lose: "Zayıflara yer yok!",
        },
      },
      {
        id: "typhon_boss",
        name: "Savaş Lordu",
        opponentName: "Slayer",
        opponentClass: "Slayer",
        difficulty: "boss",
        description: "Yüzlerce savaştan sağ çıkmış, yenilmez bir komutan.",
        dialogue: {
          intro: "Bana gerçek bir meydan okuma ver!",
          win: "Sonunda... onurlu bir ölüm...",
          lose: "Sadece bir yemektin.",
        },
        rewards: { cardBack: "Slayer" },
      },
    ],
  },
  {
    id: "tartarus",
    name: "TARTARUS",
    className: "Decay",
    coordinates: { x: 65, y: 30 },
    description: "Çürümenin ve yıkıcı ateşin hüküm sürdüğü lanetli bölge. Volkanlar ve kül.",
    longDescription:
      "Çürümenin ve yıkıcı ateşin hüküm sürdüğü, lanetli bölge. Aktif volkanlar, lav nehirleri ve kararmış, ölü ormanlar. Gökyüzü duman ve külle kaplı, kırmızı şimşekler çakıyor. Şehirler obsidyen ve demirden yapılmış, korkutucu görünümlü.",
    levels: [
      {
        id: "tartarus_1",
        name: "Kül Bekçisi",
        opponentName: "Yanık Ruh",
        opponentClass: "Decay",
        difficulty: "medium",
        description: "Volkanik küllerin arasından doğmuş bir varlık.",
        dialogue: {
          intro: "Her şey küle dönecek.",
          win: "Söndüm...",
          lose: "Yan ve yok ol.",
        },
      },
      {
        id: "tartarus_boss",
        name: "Yıkım Getiren",
        opponentName: "Decay",
        opponentClass: "Decay",
        difficulty: "boss",
        description: "Sadece yok etmeyi amaçlayan kadim bir güç.",
        dialogue: {
          intro: "Dünyanın sonunu getireceğim.",
          win: "Yıkım... durduruldu...",
          lose: "Hiçlik seni bekliyor.",
        },
         rewards: { cardBack: "Decay" },
      },
    ],
  },
  {
    id: "revin",
    name: "REVIN",
    className: "Fateweaver", // Shared with Mimic
    coordinates: { x: 50, y: 65 },
    description: "Düzenbazların, tüccarların ve şansına güvenenlerin buluşma noktası.",
    longDescription:
      "Uçsuz bucaksız altın kum tepeleri arasında devasa bir vaha şehri. Labirent gibi çarşılar, kumarhaneler ve gösterişli, oryantal mimari. Her köşe başında bir Mimic veya kaderini arayan bir Fateweaver olabilir. Kaotik, canlı ve aldatıcı.",
    levels: [
      {
        id: "revin_1",
        name: "Kumarbaz",
        opponentName: "Zar Ustası",
        opponentClass: "Fateweaver",
        difficulty: "medium",
        description: "Şansına aşırı güvenen bir sokak kumarbazı.",
        dialogue: {
          intro: "Bahisleri görelim!",
          win: "Şansım... döndü...",
          lose: "Kasa her zaman kazanır.",
        },
      },
      {
        id: "revin_2",
        name: "Taklitçi",
        opponentName: "Gizli Mimic",
        opponentClass: "Mimic",
        difficulty: "hard",
        description: "Normal bir sandık gibi görünen tehlikeli bir yaratık.",
        dialogue: {
          intro: "Sürpriz!",
          win: "Gerçek yüzümü... gördün...",
          lose: "Ne olduğumu asla bilemeyeceksin.",
        },
      },
       {
        id: "revin_boss",
        name: "Kader Oyuncusu",
        opponentName: "Fateweaver",
        opponentClass: "Fateweaver",
        difficulty: "boss",
        description: "Şehrin yeraltı dünyasını yöneten baron.",
        dialogue: {
          intro: "Kaderin ipleri ellerimde.",
          win: "İpler... koptu...",
          lose: "Oyun bitti.",
        },
         rewards: { cardBack: "Fateweaver" },
      },
    ],
  },
  {
    id: "talos",
    name: "TALOS",
    className: "Augmentor",
    coordinates: { x: 85, y: 70 },
    description: "Bilim ve teknolojinin doğayla birleştiği endüstriyel ada.",
    longDescription:
      "Bilim ve teknolojinin doğayla birleştiği yer. Adanın her yerinden buharlar tütüyor. Devasa çarklar, pirinç borular ve saat kulesi benzeri yapılar var. Dağların zirvelerinde Valkürlerin iniş pistleri, yer altında ise Cücelerin devasa atölyeleri var.",
    levels: [
      {
        id: "talos_boss",
        name: "Baş Mühendis",
        opponentName: "Augmentor",
        opponentClass: "Augmentor",
        difficulty: "boss",
        description: "Makinelerin efendisi.",
        dialogue: {
          intro: "Verimliliğin çok düşük. Seni güncelleyeceğim.",
          win: "Sistem... hatası...",
          lose: "Eskidi ve atıldı.",
        },
         rewards: { cardBack: "Augmentor" },
      },
    ],
  },
   {
    id: "ogia",
    name: "OGIA",
    className: "Vitalist", // Shared with Siren
    coordinates: { x: 90, y: 85 },
    description: "Doğanın en saf ve en güçlü hali. Huzurlu ve büyüleyici.",
    longDescription:
      "Doğanın en saf ve en güçlü hali. Cennet gibi, huzurlu, mitolojik ve büyüleyici. İki zıt ama uyumlu biyom bir arada.",
    levels: [
       {
        id: "ogia_1",
        name: "Siren'in Şarkısı",
        opponentName: "Siren",
        opponentClass: "Siren",
        difficulty: "hard",
        description: "Kıyı şeridinde denizcileri bekleyen tehlikeli güzel.",
        dialogue: {
          intro: "Sesime kulak ver...",
          win: "Şarkım... sustu...",
          lose: "Derinliklere gel.",
        },
      },
      {
        id: "ogia_boss",
        name: "Doğa Ana",
        opponentName: "Vitalist",
        opponentClass: "Vitalist",
        difficulty: "boss",
        description: "Ormanın kalbi ve koruyucusu.",
        dialogue: {
          intro: "Doğa intikamını alacak.",
          win: "Döngü... devam eder...",
          lose: "Toprağa karış.",
        },
         rewards: { cardBack: "Vitalist" },
      },
    ],
  },
  {
    id: "aeon",
    name: "AEON",
    className: "Chronokeeper",
    coordinates: { x: 10, y: 80 },
    description: "Zaman ve mekanın ötesindeki varlıkların merkezi.",
    longDescription:
      "Dünyanın dengesini koruyan, zaman ve mekanın ötesindeki varlıkların (Rix, Chronokeeper) merkezleri. Gizemli, erişilmez ve zamansız.",
    levels: [
      {
        id: "aeon_boss",
        name: "Zaman Bekçisi",
        opponentName: "Chronokeeper",
        opponentClass: "Chronokeeper",
        difficulty: "boss",
        description: "Zamanın akışını kontrol eden kadim varlık.",
        dialogue: {
          intro: "Zaman senin için doldu.",
          win: "Zaman... durdu...",
          lose: "Tarihten silindin.",
        },
         rewards: { cardBack: "Chronokeeper" },
      },
    ],
  },
];
