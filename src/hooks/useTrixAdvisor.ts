import { useMemo } from "react";
import { Card, ClassName } from "@/types/game";

export interface TrixAdvice {
  suggestedIds: Set<string>;
  message: string;
}

// Score special cards based on the opponent matchup
function specialBaseScore(specialType: string | undefined, opp: ClassName): number {
  if (!specialType) return 0;
  const base: Record<string, number> = {
    gamma: 14,
    twisted: 9,
    deflate: 7,
    delta: 8,
    sigma: 8,
    die: 6,
  };
  let s = base[specialType] ?? 5;
  // Matchup tweaks
  if (specialType === "twisted" && (opp === "Slayer" || opp === "Augmentor" || opp === "Decay")) s += 4;
  if (specialType === "deflate" && (opp === "Oracle" || opp === "Fateweaver" || opp === "Vessel" || opp === "Siren")) s += 5;
  if (specialType === "delta" && (opp === "Vitalist" || opp === "Chronokeeper")) s += 2;
  if (specialType === "sigma" && (opp === "Slayer" || opp === "Augmentor")) s += 3;
  if (specialType === "gamma") s += 2;
  return s;
}

function classAdvice(player: ClassName, opp: ClassName, lang: "tr" | "en"): string {
  const tr: Partial<Record<ClassName, string>> = {
    Vitalist: `Rakip ${opp}. Hayatta kalmaya odaklan, yüksek sayısal kartları öne koy.`,
    Slayer: `Rakip ${opp}. Tek turda 12+ hasar için en yüksek değerleri art arda diz.`,
    Fateweaver: `Rakip ${opp}. Zar açıldıysa Gamma'ları sakla; özel kartları yan yana koyma.`,
    Oracle: `Rakip ${opp}. Desteyi tüket — sayısalları öne, özelleri sonraya yay.`,
    Chronokeeper: `Rakip ${opp}. Tur atlamak için dengeli yerleştir, 7. tura kadar dayan.`,
    Cryomancer: `Rakip ${opp}. Özel kartlarını dondurmak için sınıf kartlarını yığ.`,
    Decay: `Rakip ${opp}. Erken agresif oyna, yüksek sayısalları öne yerleştir.`,
    Siren: `Rakip ${opp}. Çalıntı kartları sağa koy ki kombo kurulsun.`,
    Augmentor: `Rakip ${opp}. Buff almış yüksek değerli kartları aynı turda topla.`,
    Vessel: `Rakip ${opp}. Sigma/Delta'ları yan yana diz, kombo etkisini büyüt.`,
    Mimic: `Rakip ${opp}. Rakibin oynayacağı kartları taklit et — esnek diz.`,
  };
  const en: Partial<Record<ClassName, string>> = {
    Vitalist: `Opponent ${opp}. Survive — front-load your highest numeric cards.`,
    Slayer: `Opponent ${opp}. Stack 12+ damage in one round — biggest values together.`,
    Fateweaver: `Opponent ${opp}. Save Gammas if the Die is open; don't bunch specials.`,
    Oracle: `Opponent ${opp}. Mill yourself — numerics first, spread specials later.`,
    Chronokeeper: `Opponent ${opp}. Balanced placement to skip rounds and reach R7.`,
    Cryomancer: `Opponent ${opp}. Pile up class cards to freeze their specials.`,
    Decay: `Opponent ${opp}. Go aggressive early — high numerics up front.`,
    Siren: `Opponent ${opp}. Place stolen cards to the right for the combo.`,
    Augmentor: `Opponent ${opp}. Group buffed high-value cards in one round.`,
    Vessel: `Opponent ${opp}. Adjacent Sigma/Delta amplifies the combo.`,
    Mimic: `Opponent ${opp}. Mirror their play — keep placement flexible.`,
  };
  return (lang === "tr" ? tr[player] : en[player]) || (lang === "tr" ? `Rakip ${opp}. Dikkatli oyna.` : `Opponent ${opp}. Play carefully.`);
}

export function useTrixAdvisor(
  hand: Card[],
  playerClass: ClassName,
  opponentClass: ClassName,
  phase: string,
  language: "tr" | "en"
): TrixAdvice {
  return useMemo(() => {
    if (phase !== "placement" || !hand || hand.length === 0) {
      return { suggestedIds: new Set(), message: language === "tr" ? "Düşünüyorum..." : "Thinking..." };
    }
    const scored = hand.map((c) => {
      let score = 0;
      if (c.type === "special") {
        score = specialBaseScore(c.specialType, opponentClass);
      } else {
        score = (c.value ?? 0);
        // Class-card bonus for scaler/freeze/etc strategies
        if (c.classSymbol) {
          if (playerClass === "Cryomancer" || playerClass === "Augmentor" || playerClass === "Vitalist") score += 2;
          else score += 1;
        }
      }
      return { card: c, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, Math.min(5, hand.length));
    const ids = new Set(top.map((s) => s.card.id));
    const message = classAdvice(playerClass, opponentClass, language);
    return { suggestedIds: ids, message };
  }, [hand, playerClass, opponentClass, phase, language]);
}

// LocalStorage helper
const KEY = "trix-tutorial-enabled";
export function getTrixEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(KEY);
  return v === null ? true : v === "true";
}
export function setTrixEnabled(v: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, v ? "true" : "false");
  window.dispatchEvent(new CustomEvent("trix-toggle", { detail: v }));
}