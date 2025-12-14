import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dices, Sword, Shield, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const HowToPlay = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t("howToPlay.back")}
        </Button>
        <div className="text-xl font-bold text-primary glow-gold">{t("howToPlay.title")}</div>
        <div className="w-24" />
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-8 space-y-12">
        {/* Introduction */}
        <section className="space-y-4">
          <h1 className="text-4xl font-bold text-primary glow-gold">{t("howToPlay.intro.title")}</h1>
          <p className="text-lg text-foreground/80 leading-relaxed">
            {t("howToPlay.intro.text")}
          </p>
        </section>

        {/* Card Types */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Sword className="w-8 h-8" />
            {t("howToPlay.section.cardTypes")}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Special Cards */}
            <div className="bg-card/50 border border-border rounded-lg p-6 space-y-3">
              <h3 className="text-xl font-bold text-primary">{t("howToPlay.cardTypes.special")}</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <strong className="text-primary">{t("howToPlay.cards.twisted.name")}</strong> × 2
                  <p className="text-muted-foreground">{t("howToPlay.cards.twisted.desc")}</p>
                </li>
                <li>
                  <strong className="text-primary">{t("howToPlay.cards.deflate.name")}</strong> × 2
                  <p className="text-muted-foreground">{t("howToPlay.cards.deflate.desc")}</p>
                </li>
                <li>
                  <strong className="text-primary">{t("howToPlay.cards.delta.name")}</strong> × 1
                  <p className="text-muted-foreground">{t("howToPlay.cards.delta.desc")}</p>
                </li>
                <li>
                  <strong className="text-primary">{t("howToPlay.cards.sigma.name")}</strong> × 1
                  <p className="text-muted-foreground">{t("howToPlay.cards.sigma.desc")}</p>
                </li>
                <li>
                  <strong className="text-primary">{t("howToPlay.cards.gamma.name")}</strong> × 0
                  <p className="text-muted-foreground">{t("howToPlay.cards.gamma.desc")}</p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Game Structure */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Shield className="w-8 h-8" />
            {t("howToPlay.section.structure")}
          </h2>

          <div className="bg-card/50 border border-border rounded-lg p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-primary mb-2">{t("howToPlay.structure.setup.title")}</h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li>• {t("howToPlay.structure.setup.1")}</li>
                <li>• {t("howToPlay.structure.setup.2")}</li>
                <li>• {t("howToPlay.structure.setup.3")}</li>
                <li>• {t("howToPlay.structure.setup.4")}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary mb-2">{t("howToPlay.structure.flow.title")}</h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li>{t("howToPlay.structure.flow.1")}</li>
                <li>{t("howToPlay.structure.flow.2")}</li>
                <li>{t("howToPlay.structure.flow.3")}</li>
                <li>{t("howToPlay.structure.flow.4")}</li>
                <li>{t("howToPlay.structure.flow.5")}</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary mb-2">{t("howToPlay.structure.persist.title")}</h3>
              <p className="text-sm text-foreground/80">
                {t("howToPlay.structure.persist.text")}
              </p>
            </div>
          </div>
        </section>

        {/* Damage Calculation */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Zap className="w-8 h-8" />
            {t("howToPlay.section.damage")}
          </h2>

          <div className="bg-card/50 border border-border rounded-lg p-6 space-y-4">
            <p className="text-sm text-foreground/80">
              {t("howToPlay.damage.intro")}
            </p>

            <ol className="space-y-3 text-sm">
              <li className="bg-muted/30 p-3 rounded-lg">
                <strong className="text-primary">{t("howToPlay.damage.step1.title")}</strong>
                <p className="text-foreground/80 mt-1">{t("howToPlay.damage.step1.text")}</p>
              </li>
              <li className="bg-muted/30 p-3 rounded-lg">
                <strong className="text-primary">{t("howToPlay.damage.step2.title")}</strong>
                <p className="text-foreground/80 mt-1">{t("howToPlay.damage.step2.text")}</p>
              </li>
              <li className="bg-muted/30 p-3 rounded-lg">
                <strong className="text-primary">{t("howToPlay.damage.step3.title")}</strong>
                <p className="text-foreground/80 mt-1">{t("howToPlay.damage.step3.text")}</p>
              </li>
              <li className="bg-muted/30 p-3 rounded-lg">
                <strong className="text-primary">{t("howToPlay.damage.step4.title")}</strong>
                <p className="text-foreground/80 mt-1">{t("howToPlay.damage.step4.text")}</p>
              </li>
              <li className="bg-muted/30 p-3 rounded-lg">
                <strong className="text-primary">{t("howToPlay.damage.step5.title")}</strong>
                <p className="text-foreground/80 mt-1">{t("howToPlay.damage.step5.text")}</p>
              </li>
            </ol>
          </div>
        </section>

        {/* Special Card Details */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-primary">{t("howToPlay.section.mechanics")}</h2>

          <div className="space-y-4">
            <div className="bg-card/50 border border-primary/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-3">{t("howToPlay.mechanics.twisted.title")}</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{t("howToPlay.mechanics.twisted.text")}</p>
            </div>

            <div className="bg-card/50 border border-primary/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-3">{t("howToPlay.mechanics.delta.title")}</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{t("howToPlay.mechanics.delta.text")}</p>
            </div>

            <div className="bg-card/50 border border-primary/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-3">{t("howToPlay.mechanics.sigma.title")}</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{t("howToPlay.mechanics.sigma.text")}</p>
            </div>

            <div className="bg-card/50 border border-primary/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-3">{t("howToPlay.mechanics.deflate.title")}</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{t("howToPlay.mechanics.deflate.text")}</p>
            </div>

            <div className="bg-card/50 border border-primary/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-3">{t("howToPlay.mechanics.gamma.title")}</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{t("howToPlay.mechanics.gamma.text")}</p>
            </div>
          </div>
        </section>

        {/* Dice Roll System */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Dices className="w-8 h-8" />
            {t("howToPlay.section.dice")}
          </h2>

          <div className="bg-card/50 border border-border rounded-lg p-6 space-y-4">
            <p className="text-sm text-foreground/80">{t("howToPlay.dice.text")}</p>
            <div className="space-y-3">
              <div className="grid gap-3">
                <div className="bg-muted/30 p-3 rounded-lg"><strong className="text-primary">{t("howToPlay.dice.1_5")}</strong></div>
                <div className="bg-muted/30 p-3 rounded-lg"><strong className="text-primary">{t("howToPlay.dice.6_10")}</strong></div>
                <div className="bg-muted/30 p-3 rounded-lg"><strong className="text-primary">{t("howToPlay.dice.11_15")}</strong></div>
                <div className="bg-muted/30 p-3 rounded-lg"><strong className="text-primary">{t("howToPlay.dice.16_18")}</strong></div>
                <div className="bg-muted/30 p-3 rounded-lg"><strong className="text-primary">{t("howToPlay.dice.19_20")}</strong></div>
              </div>
            </div>
          </div>
        </section>

        {/* Classes & Abilities - Detailed Roster */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <Sword className="w-10 h-10 text-primary" />
            <h2 className="text-4xl font-bold text-primary font-cinzel">{t("howToPlay.section.classes")}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Cryomancer */}
            <div className="bg-gradient-to-br from-cyan-900/40 to-black border border-cyan-400/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">Ξ</div>
              <h4 className="text-xl font-bold text-cyan-300 mb-1">Cryomancer (Ξ)</h4>
              <p className="text-xs font-mono text-cyan-200/70 mb-3">HARD CONTROL</p>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong className="text-cyan-400">{t("classes.logic")}:</strong> "{t("classes.cryomancer.logic")}"</p>
                <p><strong className="text-white">{t("classes.mechanic")}:</strong> <span className="text-cyan-200">{t("classes.cryomancer.mechanic")}</span></p>
                <p className="text-xs italic text-gray-400 pt-2 border-t border-cyan-500/20">{t("classes.strategy")}: {t("classes.cryomancer.strategy")}</p>
              </div>
            </div>

            {/* Slayer */}
            <div className="bg-gradient-to-br from-red-900/40 to-black border border-red-500/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">Ω</div>
              <h4 className="text-xl font-bold text-red-500 mb-1">Slayer (Ω)</h4>
              <p className="text-xs font-mono text-red-200/70 mb-3">BRUISER / DPS</p>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong className="text-red-400">{t("classes.logic")}:</strong> "{t("classes.slayer.logic")}"</p>
                <p><strong className="text-white">{t("classes.mechanic")}:</strong> <span className="text-red-300">{t("classes.slayer.mechanic")}</span></p>
                <p className="text-xs italic text-gray-400 pt-2 border-t border-red-500/20">{t("classes.strategy")}: {t("classes.slayer.strategy")}</p>
              </div>
            </div>

            {/* Fateweaver */}
            <div className="bg-gradient-to-br from-yellow-700/20 to-black border border-yellow-400/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">Π</div>
              <h4 className="text-xl font-bold text-yellow-400 mb-1">Fateweaver (Π)</h4>
              <p className="text-xs font-mono text-yellow-200/70 mb-3">LATE GAME CARRY</p>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong className="text-yellow-500">{t("classes.logic")}:</strong> "{t("classes.fateweaver.logic")}"</p>
                <p><strong className="text-white">{t("classes.mechanic")}:</strong> <span className="text-yellow-200">{t("classes.fateweaver.mechanic")}</span></p>
                <p className="text-xs italic text-gray-400 pt-2 border-t border-yellow-500/20">{t("classes.strategy")}: {t("classes.fateweaver.strategy")}</p>
              </div>
            </div>

            {/* Chronokeeper */}
            <div className="bg-gradient-to-br from-gray-800 to-black border border-white/40 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">τ</div>
              <h4 className="text-xl font-bold text-white mb-1">Chronokeeper (τ)</h4>
              <p className="text-xs font-mono text-gray-400 mb-3">TEMPO / UTILITY</p>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong className="text-white">{t("classes.logic")}:</strong> "{t("classes.chronokeeper.logic")}"</p>
                <p><strong className="text-gray-400">{t("classes.mechanic")}:</strong> <span className="text-white">{t("classes.chronokeeper.mechanic")}</span></p>
                <p className="text-xs italic text-gray-500 pt-2 border-t border-white/20">{t("classes.strategy")}: {t("classes.chronokeeper.strategy")}</p>
              </div>
            </div>

            {/* Vitalist */}
            <div className="bg-gradient-to-br from-green-900/40 to-black border border-green-500/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">Φ</div>
              <h4 className="text-xl font-bold text-green-500 mb-1">Vitalist (Φ)</h4>
              <p className="text-xs font-mono text-green-200/70 mb-3">TANK / HEALER</p>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong className="text-green-400">{t("classes.logic")}:</strong> "{t("classes.vitalist.logic")}"</p>
                <p><strong className="text-white">{t("classes.mechanic")}:</strong> <span className="text-green-300">{t("classes.vitalist.mechanic")}</span></p>
                <p className="text-xs italic text-gray-400 pt-2 border-t border-green-500/20">{t("classes.strategy")}: {t("classes.vitalist.strategy")}</p>
              </div>
            </div>

            {/* Mimic */}
            <div className="bg-gradient-to-br from-gray-700/40 to-black border border-gray-400/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">ν</div>
              <h4 className="text-xl font-bold text-gray-300 mb-1">Mimic (ν)</h4>
              <p className="text-xs font-mono text-gray-500 mb-3">ROGUE</p>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong className="text-gray-400">{t("classes.logic")}:</strong> "{t("classes.mimic.logic")}"</p>
                <p><strong className="text-white">{t("classes.mechanic")}:</strong> <span className="text-gray-200">{t("classes.mimic.mechanic")}</span></p>
                <p className="text-xs italic text-gray-500 pt-2 border-t border-gray-500/20">{t("classes.strategy")}: {t("classes.mimic.strategy")}</p>
              </div>
            </div>

            {/* Oracle */}
            <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">Ψ</div>
              <h4 className="text-xl font-bold text-purple-400 mb-1">Oracle (Ψ)</h4>
              <p className="text-xs font-mono text-purple-300/70 mb-3">INFO / CONTROL</p>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong className="text-purple-400">{t("classes.logic")}:</strong> "{t("classes.oracle.logic")}"</p>
                <p><strong className="text-white">{t("classes.mechanic")}:</strong> <span className="text-purple-200">{t("classes.oracle.mechanic")}</span></p>
                <p className="text-xs italic text-gray-400 pt-2 border-t border-purple-500/20">{t("classes.strategy")}: {t("classes.oracle.strategy")}</p>
              </div>
            </div>

            {/* Siren */}
            <div className="bg-gradient-to-br from-pink-900/40 to-black border border-pink-500/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">η</div>
              <h4 className="text-xl font-bold text-pink-500 mb-1">Siren (η)</h4>
              <p className="text-xs font-mono text-pink-300/70 mb-3">DISRUPTOR</p>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong className="text-pink-400">{t("classes.logic")}:</strong> "{t("classes.siren.logic")}"</p>
                <p><strong className="text-white">{t("classes.mechanic")}:</strong> <span className="text-pink-200">{t("classes.siren.mechanic")}</span></p>
                <p className="text-xs italic text-gray-400 pt-2 border-t border-pink-500/20">{t("classes.strategy")}: {t("classes.siren.strategy")}</p>
              </div>
            </div>

            {/* Augmentor */}
            <div className="bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">Θ</div>
              <h4 className="text-xl font-bold text-blue-400 mb-1">Augmentor (Θ)</h4>
              <p className="text-xs font-mono text-blue-300/70 mb-3">BUFFER</p>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong className="text-blue-400">{t("classes.logic")}:</strong> "{t("classes.augmentor.logic")}"</p>
                <p><strong className="text-white">{t("classes.mechanic")}:</strong> <span className="text-blue-200">{t("classes.augmentor.mechanic")}</span></p>
                <p className="text-xs italic text-gray-400 pt-2 border-t border-blue-500/20">{t("classes.strategy")}: {t("classes.augmentor.strategy")}</p>
              </div>
            </div>

            {/* Conjurer */}
            <div className="bg-gradient-to-br from-orange-900/40 to-black border border-orange-500/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">μ</div>
              <h4 className="text-xl font-bold text-orange-400 mb-1">Vessel (μ)</h4>
              <p className="text-xs font-mono text-orange-300/70 mb-3">SUMMONER</p>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong className="text-orange-400">{t("classes.logic")}:</strong> "{t("classes.vessel.logic")}"</p>
                <p><strong className="text-white">{t("classes.mechanic")}:</strong> <span className="text-orange-200">{t("classes.vessel.mechanic")}</span></p>
                <p className="text-xs italic text-gray-400 pt-2 border-t border-orange-500/20">{t("classes.strategy")}: {t("classes.vessel.strategy")}</p>
              </div>
            </div>

            {/* Incinerator */}
            <div className="bg-gradient-to-br from-red-950/40 to-black border border-red-800/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">ρ</div>
              <h4 className="text-xl font-bold text-red-700 mb-1">Decay (ρ)</h4>
              <p className="text-xs font-mono text-red-500/70 mb-3">GLASS CANNON</p>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong className="text-red-600">{t("classes.logic")}:</strong> "{t("classes.decay.logic")}"</p>
                <p><strong className="text-white">{t("classes.mechanic")}:</strong> <span className="text-red-400">{t("classes.decay.mechanic")}</span></p>
                <p className="text-xs italic text-gray-400 pt-2 border-t border-red-800/20">{t("classes.strategy")}: {t("classes.decay.strategy")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Victory Conditions */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-primary">{t("howToPlay.section.victory")}</h2>

          <div className="bg-card/50 border border-border rounded-lg p-6 space-y-4">
            <div>
              <p className="text-sm text-foreground/80">
                {t("howToPlay.victory.win")}
              </p>
            </div>

            <div>
              <p className="text-sm text-foreground/80">
                {t("howToPlay.victory.rewards")}
              </p>
            </div>
          </div>
        </section>

        {/* Strategy Tips */}
        <section className="space-y-6 pb-12">
          <h2 className="text-3xl font-bold text-primary">{t("howToPlay.section.tips")}</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card/50 border border-primary/30 rounded-lg p-4">
              <p className="text-sm text-foreground/80">{t("howToPlay.tips.early")}</p>
            </div>

            <div className="bg-card/50 border border-primary/30 rounded-lg p-4">
              <p className="text-sm text-foreground/80">{t("howToPlay.tips.mid")}</p>
            </div>

            <div className="bg-card/50 border border-primary/30 rounded-lg p-4">
              <p className="text-sm text-foreground/80">{t("howToPlay.tips.late")}</p>
            </div>

            <div className="bg-card/50 border border-primary/30 rounded-lg p-4">
              <p className="text-sm text-foreground/80">{t("howToPlay.tips.dice")}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowToPlay;
