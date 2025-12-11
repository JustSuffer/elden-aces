import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ChevronRight, ChevronLeft, Swords, Dices, Shield, Sparkles, Target, Zap } from "lucide-react";

const Tutorial = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "ACORIA'ya Hoş Geldiniz",
      icon: <Swords className="w-12 h-12 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>ACORIA, stratejik bir 1v1 kart oyunudur. Her iki oyuncu da 40 HP ile başlar (Class'a göre değişir) ve 6 tur boyunca savaşır.</p>
          <p>Amaç: Rakibinizin HP'sini 0'a düşürmek veya 6 tur sonunda daha yüksek HP'ye sahip olmak.</p>
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
            <p className="text-sm text-primary font-semibold">30 kartlık sabit deste:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• 24 sayısal kart (Φ/Θ/Ψ/Ω her birinden 1-6 arası)</li>
              <li>• 6 özel kart (2x Twisted α, 2x Deflate β, 1x Delta Δ, 1x Sigma Σ)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Semboller ve Kartlar",
      icon: <Sparkles className="w-12 h-12 text-primary" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-phi/20 p-3 rounded-lg border border-phi">
              <span className="text-2xl">Φ</span>
              <p className="text-sm font-semibold">Phi - Denge</p>
            </div>
            <div className="bg-theta/20 p-3 rounded-lg border border-theta">
              <span className="text-2xl">Θ</span>
              <p className="text-sm font-semibold">Theta - Zaman</p>
            </div>
            <div className="bg-psi/20 p-3 rounded-lg border border-psi">
              <span className="text-2xl">Ψ</span>
              <p className="text-sm font-semibold">Psi - Zihin</p>
            </div>
            <div className="bg-omega/20 p-3 rounded-lg border border-omega">
              <span className="text-2xl">Ω</span>
              <p className="text-sm font-semibold">Omega - Kaos</p>
            </div>
          </div>
          <p className="text-sm">Her sembolden 1-6 arası değerlerde kartlar bulunur.</p>
        </div>
      )
    },
    {
      title: "Tur Yapısı",
      icon: <Target className="w-12 h-12 text-primary" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">1</div>
              <p>Tur 1'de 6 kart çekilir, 5'i oynanır, 1'i sonraki tura taşınır.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">2</div>
              <p>Tur 2'de kalan kart + 5 yeni kart = 7 kart elinizde olur.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">3</div>
              <p>Her turda yine 5 kart oynanır, fazlalar taşınır.</p>
            </div>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">El boyutu: 6 → 7 → 8+ şeklinde büyüyebilir ama her turda sadece 5 kart oynanır.</p>
          </div>
        </div>
      )
    },
    {
      title: "Hasar Hesaplama",
      icon: <Zap className="w-12 h-12 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="font-semibold">Hasar sırası (1'den 5'e):</p>
          <ol className="space-y-2 text-sm">
            <li><span className="text-primary font-bold">1.</span> Dondurma/İptal: Cryomancer dondurur (0 Değer), Deflate iptal eder.</li>
            <li><span className="text-primary font-bold">2.</span> Base Hasar: Kart toplamları farkı. Twist/Delta buraya etki eder.</li>
            <li><span className="text-primary font-bold">3.</span> Combo Bonus (Sayısal): Ardışık (Straight) veya Aynı (Kind) sayılar bonus hasar ekler.</li>
            <li><span className="text-primary font-bold">4.</span> True Damage (Synergy): Sınıf sembolü sayısı kadar direkt hasar.</li>
            <li><span className="text-primary font-bold">5.</span> Class Yetenekleri: Sınıf yetenekleri son dokunuşu yapar.</li>
          </ol>
        </div>
      )
    },
    {
      title: "Özel Kartlar",
      icon: <Shield className="w-12 h-12 text-primary" />,
      content: (
        <div className="space-y-3">
          <div className="bg-card p-3 rounded-lg border border-primary/30">
            <p className="font-bold text-primary">α Twisted</p>
            <p className="text-sm">Rakip toplam değeri sizden yüksekse, hasarı tersine çevirir.</p>
          </div>
          <div className="bg-card p-3 rounded-lg border border-primary/30">
            <p className="font-bold text-primary">Δ Delta</p>
            <p className="text-sm">Önceki kartlara index bazlı 2x hasar. Twisted ile Sigma'ya dönüşür.</p>
          </div>
          <div className="bg-card p-3 rounded-lg border border-primary/30">
            <p className="font-bold text-primary">Σ Sigma</p>
            <p className="text-sm">Delta'nın tersi. Twisted ile Delta'ya dönüşür.</p>
          </div>
          <div className="bg-card p-3 rounded-lg border border-primary/30">
            <p className="font-bold text-primary">β Deflate</p>
            <p className="text-sm">Rakibin özel kartlarını etkisiz hale getirir.</p>
          </div>
          <div className="bg-card p-3 rounded-lg border border-primary/30">
            <p className="font-bold text-primary">γ Gamma</p>
            <p className="text-sm">0 hasar alır, öndeyse 2x hasar verir. Rakip sonraki tur 4 kart oynar.</p>
          </div>
        </div>
      )
    },
    {
      title: "Zar Sistemi (Π)",
      icon: <Dices className="w-12 h-12 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>Maç boyunca tam 2 kez kullanılabilir. 1-20 arası sonuç verir:</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-omega">1-5</span>
              <span>Bu tur sadece 4 kart oynarsın</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-psi">5-10</span>
              <span>2 rastgele kart desteden takas</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-theta">10-15</span>
              <span>2 kart seç, desteye gönder, 2 yeni çek</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-phi">15-18</span>
              <span>+1 Twisted (α) eline eklenir</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-primary">18-20</span>
              <span>+1 Gamma (γ) eline eklenir</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Sınıflar (Classes)",
      icon: <Sparkles className="w-12 h-12 text-primary" />,
      content: (
        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          <p>Oyunda 11 farklı sınıf vardır. Her birinin özel yetenekleri ve kazanma koşulları bulunur:</p>
          <div className="grid grid-cols-1 gap-2 text-sm">
             {/* Vitalist */}
             <div className="bg-green-900/20 p-2 rounded border border-green-500/30">
               <strong className="text-green-400">Vitalist (Φ):</strong> Tank. HP farkı ile kazanır (Start 50 HP).
             </div>
             {/* Slayer */}
             <div className="bg-red-900/20 p-2 rounded border border-red-500/30">
               <strong className="text-red-400">Slayer (Ω):</strong> DPS. Tek turda 12 hasar verirse kazanır.
             </div>
             {/* Fateweaver */}
             <div className="bg-yellow-900/20 p-2 rounded border border-yellow-500/30">
               <strong className="text-yellow-400">Fateweaver (Π):</strong> Kumarbaz. 5 Gamma (γ) kartı oynarsa kazanır.
             </div>
             {/* Oracle */}
             <div className="bg-purple-900/20 p-2 rounded border border-purple-500/30">
               <strong className="text-purple-400">Oracle (Ψ):</strong> Kahin. Destesini bitirirse (0 kart) kazanır.
             </div>
             {/* Chronokeeper */}
             <div className="bg-white/10 p-2 rounded border border-white/30">
               <strong className="text-white">Chronokeeper (τ):</strong> Zaman. 6 tur hayatta kalırsa kazanır.
             </div>
             {/* Cryomancer */}
             <div className="bg-cyan-900/20 p-2 rounded border border-cyan-400/30">
               <strong className="text-cyan-400">Cryomancer (Ξ):</strong> Kontrol. 3 Özel Kart dondurursa kazanır.
             </div>
             {/* Incinerator */}
             <div className="bg-orange-900/20 p-2 rounded border border-orange-500/30">
               <strong className="text-orange-400">Incinerator (ρ):</strong> Yakıcı. Rakip desteyi 4. Turda bitirirse kazanır.
             </div>
             {/* Siren */}
             <div className="bg-pink-900/20 p-2 rounded border border-pink-500/30">
               <strong className="text-pink-400">Siren (η):</strong> Hırsız. 5 Çalıntı kart oynarsa kazanır. (4. Turda hasar yer).
             </div>
             {/* Augmentor */}
             <div className="bg-blue-900/20 p-2 rounded border border-blue-500/30">
               <strong className="text-blue-400">Augmentor (Θ):</strong> Güçlendirici. Değeri 9+ olan kart oynarsa kazanır.
             </div>
             {/* Conjurer */}
             <div className="bg-orange-600/20 p-2 rounded border border-orange-400/30">
               <strong className="text-orange-300">Conjurer (μ):</strong> Çağırıcı. Sigma+Delta kombosu yaparsa kazanır.
             </div>
             {/* Mimic */}
             <div className="bg-gray-800/50 p-2 rounded border border-gray-500/30">
               <strong className="text-gray-400">Mimic (ν):</strong> Taklitçi. Rakibinin kazanma koşulunu kopyalar.
             </div>
          </div>
        </div>
      )
    },
    {
      title: "Oyun Sonu",
      icon: <Swords className="w-12 h-12 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>Oyun şu durumlarda biter:</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              <span>Bir oyuncunun HP'si 0'a düşerse (anında kaybeder)</span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              <span>6 tur tamamlandığında (düşük HP kaybeder)</span>
            </li>
          </ul>
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/30 mt-4">
            <p className="font-semibold text-primary">Ödüller:</p>
            <p className="text-sm mt-2">Galibiyet: +10 DivineCoin</p>
            <p className="text-sm">Mağlubiyet: +2 DivineCoin</p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Menu
        </Button>
        <div className="text-xl font-bold text-primary glow-gold">Tutorial</div>
        <div className="w-24" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Card className="w-full max-w-2xl p-8 bg-card/50 backdrop-blur-sm border-primary/20">
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-primary scale-125"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="text-center mb-6">
            {tutorialSteps[currentStep].icon}
          </div>
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">
            {tutorialSteps[currentStep].title}
          </h2>
          <div className="text-foreground min-h-[300px]">
            {tutorialSteps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Önceki
            </Button>
            {currentStep < tutorialSteps.length - 1 ? (
              <Button onClick={nextStep} className="gap-2">
                Sonraki
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={() => navigate("/")} className="gap-2">
                Tamamla
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Tutorial;
