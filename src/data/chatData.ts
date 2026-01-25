import { ClassName } from "@/types/game";

export type ChatKey = "GREETING" | "GOOD_GAME" | "LUCKY" | "MISTAKE" | "MY_TURN" | "THINKING";

interface ChatMessage {
  tr: string;
  en: string;
}

export const CHAT_OPTIONS: Record<ChatKey, { label: string }> = {
  GREETING: { label: "Merhaba!" },
  GOOD_GAME: { label: "İyi Oyundu!" },
  LUCKY: { label: "Şanslısın..." },
  MISTAKE: { label: "Hata Yaptın!" },
  MY_TURN: { label: "Sıra Bende." },
  THINKING: { label: "Düşünüyorum..." },
};

export const CHARACTER_CHAT: Record<ClassName, Record<ChatKey, ChatMessage>> = {
  Vitalist: {
    GREETING: { tr: "Doğa seni selamlıyor.", en: "Nature greets you." },
    GOOD_GAME: { tr: "Hayat döngüsü tamamlandı.", en: "The cycle of life is complete." },
    LUCKY: { tr: "Rüzgar senden yana...", en: "The wind favors you..." },
    MISTAKE: { tr: "Doğayı hafife aldın!", en: "You underestimated nature!" },
    MY_TURN: { tr: "Filizlenme zamanı.", en: "Time to bloom." },
    THINKING: { tr: "Kökleri dinliyorum...", en: "Listening to the roots..." },
  },
  Slayer: {
    GREETING: { tr: "Baltam kana susadı!", en: "My axe thirsts for blood!" },
    GOOD_GAME: { tr: "Onurlu bir dövüştü.", en: "A worthy fight." },
    LUCKY: { tr: "Sadece şans...", en: "Mere luck..." },
    MISTAKE: { tr: "Açık verdin!", en: "You left an opening!" },
    MY_TURN: { tr: "Sıradaki kurban!", en: "Next victim!" },
    THINKING: { tr: "Zayıf noktan neresi...", en: "Where is your weak point..." },
  },
  Fateweaver: {
    GREETING: { tr: "Merhaba, benim acınası zarım!", en: "Hello, my pathetic dice!" },
    GOOD_GAME: { tr: "Kader böyle istedi.", en: "Fate willed it so." },
    LUCKY: { tr: "Talihe güvenme.", en: "Do not trust fortune." },
    MISTAKE: { tr: "Yanlış bahis!", en: "Wrong bet!" },
    MY_TURN: { tr: "Zarları atalım.", en: "Let's roll the dice." },
    THINKING: { tr: "Olasılıkları hesaplıyorum...", en: "Calculating the odds..." },
  },
  Oracle: {
    GREETING: { tr: "Geleceğini görüyorum...", en: "I see your future..." },
    GOOD_GAME: { tr: "Öngörüldüğü gibi.", en: "As foreseen." },
    LUCKY: { tr: "Bu vizyonumda yoktu...", en: "This was not in my vision..." },
    MISTAKE: { tr: "Kaderden kaçamazsın.", en: "You cannot escape fate." },
    MY_TURN: { tr: "Gözlerim açılıyor.", en: "My eyes open." },
    THINKING: { tr: "Kehanet ne diyor...", en: "What does the prophecy say..." },
  },
  Chronokeeper: {
    GREETING: { tr: "Zamanın doluyor...", en: "Your time is running out..." },
    GOOD_GAME: { tr: "Geçmişte kaldın.", en: "You are in the past." },
    LUCKY: { tr: "Zamanı büktün mü?", en: "Did you bend time?" },
    MISTAKE: { tr: "Geri alınamaz bir hata.", en: "An irreversible mistake." },
    MY_TURN: { tr: "Saat işliyor.", en: "The clock ticks." },
    THINKING: { tr: "Zaman akıyor...", en: "Time flows..." },
  },
  Cryomancer: {
    GREETING: { tr: "İliklerine kadar üşüyeceksin.", en: "You will freeze to the bone." },
    GOOD_GAME: { tr: "Buz gibi bir zafer.", en: "An icy victory." },
    LUCKY: { tr: "Buz çatladı...", en: "The ice cracked..." },
    MISTAKE: { tr: "Dondurucu bir hata.", en: "A chilling mistake." },
    MY_TURN: { tr: "Kış geliyor.", en: "Winter is coming." },
    THINKING: { tr: "Soğuk hakim oluyor...", en: "The cold takes hold..." },
  },
  Decay: {
    GREETING: { tr: "Her şey çürüyecek.", en: "Everything will rot." },
    GOOD_GAME: { tr: "Toza dönüştün.", en: "You turned to dust." },
    LUCKY: { tr: "Çürümeyi geciktirdin.", en: "You delayed the rot." },
    MISTAKE: { tr: "Zaten ölüsün.", en: "You are already dead." },
    MY_TURN: { tr: "Yok oluş başlıyor.", en: "The decay begins." },
    THINKING: { tr: "Nasıl çürüsem...", en: "How to rot..." },
  },
  Siren: {
    GREETING: { tr: "Sesime kulak ver...", en: "Listen to my voice..." },
    GOOD_GAME: { tr: "Şarkım bitti.", en: "My song is over." },
    LUCKY: { tr: "Büyümü bozdun...", en: "You broke my spell..." },
    MISTAKE: { tr: "Tuzağıma düştün.", en: "You fell into my trap." },
    MY_TURN: { tr: "Sahne benim.", en: "The stage is mine." },
    THINKING: { tr: "Hangi melodi...", en: "Which melody..." },
  },
  Augmentor: {
    GREETING: { tr: "Sistemler devrede.", en: "Systems online." },
    GOOD_GAME: { tr: "Verimlilik %100.", en: "Efficiency 100%." },
    LUCKY: { tr: "Hesaplanamayan değişken.", en: "Uncalculated variable." },
    MISTAKE: { tr: "Kritik sistem hatası.", en: "Critical system error." },
    MY_TURN: { tr: "Yükseltme başlıyor.", en: "Initiating upgrade." },
    THINKING: { tr: "Analiz ediliyor...", en: "Analyzing..." },
  },
  Vessel: {
    GREETING: { tr: "Boşluktan geliyorum.", en: "I come from the void." },
    GOOD_GAME: { tr: "Kozmoz seni yuttu.", en: "The cosmos swallowed you." },
    LUCKY: { tr: "Yıldızlar hizalandı...", en: "The stars aligned..." },
    MISTAKE: { tr: "Evren affetmez.", en: "The universe does not forgive." },
    MY_TURN: { tr: "Çağrıya cevap ver.", en: "Answer the call." },
    THINKING: { tr: "Boyutlar arası...", en: "Interdimensional..." },
  },
  Mimic: {
    GREETING: { tr: "Sen kimsen ben oyum.", en: "I am whoever you are." },
    GOOD_GAME: { tr: "Kendime yenildim.", en: "I lost to myself." },
    LUCKY: { tr: "Hile mi yaptım?", en: "Did I cheat?" },
    MISTAKE: { tr: "Aynaya bak.", en: "Look in the mirror." },
    MY_TURN: { tr: "Taklit zamanı.", en: "Time to mimic." },
    THINKING: { tr: "Kim olsam...", en: "Who shall I be..." },
  },
};
