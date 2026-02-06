
export const TAVERNER_QUOTES = {
  tr: [
    "Hoş geldin gezgin! Altınların parlıyor.",
    "Buralarda en iyi mallar benim tezgahımda.",
    "Acoria'nın derinliklerinden gelen eşyalar...",
    "Biraz dinlen, belki bir şeyler satın alırsın?",
    "Savaş zorlu mu geçiyor? Doğru yere geldin.",
    "Kaderini değiştirecek kartlar burada.",
    "Bu kupa senin için mi? Yoksa düşmanın için mi?",
    "Altınlarını akıllıca harca, geri dönüşü yok.",
    "Hah! O son maçını izledim, daha iyi kartlara ihtiyacın var.",
    "Efsaneler burada doğar... ve burada iflas eder.",
    "Gözlerin yorgun bakıyor, ama cüzdanın dolu gibi.",
    "Karanlıkta parlayan tek şey benim dükkanım.",
    "Bir büyücü, bir savaşçı ve sen... Bara girmemişsiniz ama dükkanındasınız.",
    "Nadir bulunan parçalar, sadece seçilmişler için.",
    "Korkma, fiyatlarım can yakmaz... en azından çok fazla.",
    "Bugün şanslı günündesin evlat.",
    "Bakma öyle, bu yara izlerini bedava almadım.",
    "Sessizliği severim ama altın sesini daha çok severim.",
    "Acele etme, zaman burada farklı akar.",
    "Bunu alırsan pişman olmazsın, almazsan belki."
  ],
  en: [
    "Welcome traveler! Your coin purse looks heavy.",
    "Best wares in all of Acoria right here.",
    "Artifacts from the deep abyss...",
    "Rest a while, spend a coin or two?",
    "War treating you rough? You came to the right place.",
    "Cards to change your fate lie here.",
    "Is that chalice for you? Or your enemy?",
    "Spend wisely, there are no refunds on destiny.",
    "Hah! I saw that last match, you need better gear.",
    "Legends are born here... and go broke here.",
    "Your eyes look tired, but your purse looks full.",
    "The only thing shining in the dark is my shop.",
    "Rare items, for the chosen few only.",
    "Don't worry, my prices don't bite... much.",
    "Today is your lucky day, kid.",
    "Don't stare, I didn't get these scars for free.",
    "I like silence, but I like the sound of gold more.",
    "Take your time, time flows differently here.",
    "Buy this and you won't regret it. Maybe.",
    "Looking for power? It has a price."
  ]
};

export interface ShopItem {
    id: string;
    type: "cardback" | "hero";
    price: number;
    name: { tr: string; en: string };
    desc: { tr: string; en: string };
    image: string; // Filename in /assets/avatars or /assets/decks
    isDefault?: boolean;
    className?: "Vitalist" | "Slayer" | "Fateweaver" | "Oracle" | "Chronokeeper" | "Cryomancer" | "Decay" | "Siren" | "Augmentor" | "Vessel" | "Mimic";
}

// "son atacağım dışında hepsi sadece shoptan alınabilecek"
export const CARD_BACKS: ShopItem[] = [
    // Premium (Locked) Backs - Reverted to Original Names with Updated Price (10000)
    { id: "cb_arid", type: "cardback", price: 10000, name: { tr: "Arid", en: "Arid" }, desc: { tr: "Kurak toprakların gücü.", en: "Power of the arid lands." }, image: "Arid.jpg", isDefault: false },
    { id: "cb_noty", type: "cardback", price: 10000, name: { tr: "Noty", en: "Noty" }, desc: { tr: "Gizemli semboller.", en: "Mysterious symbols." }, image: "Noty.jpg", isDefault: false },
    { id: "cb_reniur", type: "cardback", price: 10000, name: { tr: "Reniur", en: "Reniur" }, desc: { tr: "Kadim büyü.", en: "Ancient magic." }, image: "Reniur.jpg", isDefault: false },
    { id: "cb_perol", type: "cardback", price: 10000, name: { tr: "Perol", en: "Perol" }, desc: { tr: "İhtişamlı.", en: "Magnificent." }, image: "Perol.jpg", isDefault: false },
    { id: "cb_ctrix", type: "cardback", price: 10000, name: { tr: "Ctrix", en: "Ctrix" }, desc: { tr: "Teknolojik.", en: "Technological." }, image: "Ctrix.jpg", isDefault: false },
    { id: "cb_prxyla", type: "cardback", price: 10000, name: { tr: "Prxyla", en: "Prxyla" }, desc: { tr: "Kristalize enerji.", en: "Crystallized energy." }, image: "Prxyla.jpg", isDefault: false },
    { id: "cb_lrot", type: "cardback", price: 10000, name: { tr: "Lrot", en: "Lrot" }, desc: { tr: "Doğanın öfkesi.", en: "Nature's wrath." }, image: "Lrot.jpg", isDefault: false },
    
    // Story Reward (Not in Shop)

    
    // Default (Free) Back
   
];

export const HEROES: ShopItem[] = [
    { id: "hero_yorxy", type: "hero", price: 15000, name: { tr: "Yorxy", en: "Yorxy" }, desc: { tr: "Buzul Kraliçe.", en: "Glacial Queen." }, image: "yorxy.jpeg", className: "Cryomancer" },
    { id: "hero_notkhell", type: "hero", price: 15000, name: { tr: "Notkhell", en: "Notkhell" }, desc: { tr: "Soğuk Savaşçı.", en: "Cold Warrior." }, image: "notkhell.jpeg", className: "Cryomancer" },
    { id: "hero_ciel", type: "hero", price: 15000, name: { tr: "Ciel", en: "Ciel" }, desc: { tr: "Kristal Muhafız.", en: "Crystal Guardian." }, image: "ciel.jpeg", className: "Cryomancer" },
];

export const ALL_SHOP_ITEMS = [...CARD_BACKS.filter(i => !i.isDefault), ...HEROES];
