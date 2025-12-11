import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dices, Sword, Shield, Zap } from "lucide-react";

const HowToPlay = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </Button>
        <div className="text-xl font-bold text-primary glow-gold">How To Play</div>
        <div className="w-24" />
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-8 space-y-12">
        {/* Introduction */}
        <section className="space-y-4">
          <h1 className="text-4xl font-bold text-primary glow-gold">Welcome to ACORIA</h1>
          <p className="text-lg text-foreground/80 leading-relaxed">
            ACORIA is a strategic card battle game where you face opponents in 6 intense rounds. 
            Each decision matters as you combine numeric cards with powerful special abilities to 
            outmaneuver your opponent and reduce their HP to zero.
          </p>
        </section>

        {/* Card Types */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Sword className="w-8 h-8" />
            Card Types & Symbols
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
                    
            {/* <div className="bg-card/50 border border-border rounded-lg p-6 space-y-3">
              <h3 className="text-xl font-bold text-primary">Numeric Cards (24 cards)</h3>
              <p className="text-sm text-foreground/70">Each symbol has cards numbered 1-6:</p>
            </div> */}

            {/* Special Cards */}
            <div className="bg-card/50 border border-border rounded-lg p-6 space-y-3">
              <h3 className="text-xl font-bold text-primary">Special Cards (6 cards)</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <strong className="text-primary">Twisted (α)</strong> × 2
                  <p className="text-muted-foreground">Reflects damage when losing</p>
                </li>
                <li>
                  <strong className="text-primary">Deflate (β)</strong> × 2
                  <p className="text-muted-foreground">Nullifies opponent's special cards</p>
                </li>
                <li>
                  <strong className="text-primary">Delta (Δ)</strong> × 1
                  <p className="text-muted-foreground">Index-based 2× damage amplifier</p>
                </li>
                <li>
                  <strong className="text-primary">Sigma (Σ)</strong> × 1
                  <p className="text-muted-foreground">Reverse Delta effect</p>
                </li>
                <li>
                  <strong className="text-primary">Gamma (γ)</strong> × 0
                  <p className="text-muted-foreground">Only obtained via Dice Roll</p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Game Structure */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Game Structure
          </h2>
          
          <div className="bg-card/50 border border-border rounded-lg p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-primary mb-2">Match Setup</h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li>• Both players start with <strong>40 HP</strong> (varies by Class)</li>
                <li>• The game lasts <strong>6 rounds</strong></li>
                <li>• Each player draws <strong>6 cards</strong> at the start</li>
                <li>• Players place <strong>5 cards</strong> per round (or 4 if penalized by dice)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary mb-2">Round Flow</h3>
              <ol className="space-y-2 text-sm text-foreground/80">
                <li><strong>1. Placement Phase:</strong> Both players place their 5 cards face-down</li>
                <li><strong>2. Reveal Phase:</strong> All cards are revealed simultaneously</li>
                <li><strong>3. Damage Calculation:</strong> Totals are compared and special effects resolve</li>
                <li><strong>4. HP Adjustment:</strong> Damage is dealt to the losing player</li>
                <li><strong>5. Next Round:</strong> Unused cards stay in hand, draw 5 new cards</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary mb-2">Card Persistence</h3>
              <p className="text-sm text-foreground/80">
                Cards not played in a round remain in your hand for the next round. This means:
              </p>
              <ul className="space-y-1 text-sm text-foreground/80 mt-2">
                <li>• Round 1: 6 cards → play 5 → 1 leftover</li>
                <li>• Round 2: 1 leftover + 5 new = 7 cards → play 5 → 2 leftover</li>
                <li>• Round 3: 2 leftover + 5 new = 8 cards → play 5 → 3 leftover</li>
                <li>• And so on...</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Damage Calculation */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Zap className="w-8 h-8" />
            Damage Calculation Order
          </h2>
          
          <div className="bg-card/50 border border-border rounded-lg p-6 space-y-4">
            <p className="text-sm text-foreground/80">
              Damage is calculated in a specific order to ensure fair and predictable outcomes:
            </p>
            
            <ol className="space-y-3 text-sm">
              <li className="bg-muted/30 p-3 rounded-lg">
                <strong className="text-primary">1. Pre-Calculation (Cryomancer/Deflate)</strong>
                <p className="text-foreground/80 mt-1">
                  Cryomancer freezes occur first (Value 0, Symbol Loss). Deflate cancels opponent specials.
                </p>
              </li>
              
              <li className="bg-muted/30 p-3 rounded-lg">
                <strong className="text-primary">2. Base Damage</strong>
                <p className="text-foreground/80 mt-1">
                  Sum all numeric values from your 5 cards (after freeze). The player with the higher total 
                  deals the difference as damage to their opponent.
                </p>
              </li>
              
              <li className="bg-muted/30 p-3 rounded-lg">
                <strong className="text-primary">3. Numeric Combo Bonus (Step 3)</strong>
                <p className="text-foreground/80 mt-1">
                  If you have 3+ consecutive numbers (e.g., 2-3-4 or 4-5-6), you deal bonus 
                  damage equal to length. If you have 3+ of same Value (e.g. 5-5-5), deal damage equal to Count.
                </p>
              </li>
              
              <li className="bg-muted/30 p-3 rounded-lg">
                <strong className="text-primary">4. Class Synergy (True Damage)</strong>
                <p className="text-foreground/80 mt-1">
                 Count of cards matching YOUR Class Symbol (or generic symbol) deals True Damage equal to count.
                </p>
              </li>

              <li className="bg-muted/30 p-3 rounded-lg">
                <strong className="text-primary">5. Special Resolution (Reflect/Amplify)</strong>
                <p className="text-foreground/80 mt-1">
                  Twisted (Reflect), Delta/Sigma (Amplify) are processed on the Step 2 Damage.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* Special Card Details */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-primary">Special Card Mechanics</h2>
          
          <div className="space-y-4">
            <div className="bg-card/50 border border-primary/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-3">Twisted (α) - Alpha</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                When your total numeric value is lower than your opponent's, Twisted reverses 
                all damage that would be dealt to you back to your opponent. This creates 
                powerful comeback opportunities but requires careful planning. The reflection 
                happens after base damage is calculated but before it's applied.
              </p>
            </div>

            <div className="bg-card/50 border border-primary/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-3">Delta (Δ)</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Delta's position in your lineup determines its effect. If Delta is in position 3, 
                it compares the sum of cards in positions 1-2 from both players. If the opponent's 
                sum is higher, they take 2× the difference. If your sum is higher, you take 2× 
                the difference. <strong>TRANSFORMATION:</strong> If the card immediately after 
                Delta (to its right) is Twisted (α), Delta transforms into Sigma (Σ) and uses 
                Sigma's reverse calculation instead.
              </p>
            </div>

            <div className="bg-card/50 border border-primary/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-3">Sigma (Σ)</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Sigma works opposite to Delta. If Sigma is in position 3, it compares positions 1-2. 
                If you are lower, your opponent takes 2× the difference. If you are higher, you take 
                2× the difference. <strong>TRANSFORMATION:</strong> If the card immediately after 
                Sigma (to its right) is Twisted (α), Sigma transforms into Delta (Δ) and uses 
                Delta's calculation instead.
              </p>
            </div>

            <div className="bg-card/50 border border-primary/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-3">Deflate (β) - Beta</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                When Deflate is in your lineup, it completely nullifies all of your opponent's 
                special card effects for that round. Gamma (γ), Twisted (α), Sigma (Σ), and 
                Delta (Δ) become ordinary cards with no effects. This powerful defensive card 
                can shut down devastating combos but has no offensive value itself.
              </p>
            </div>

            <div className="bg-card/50 border border-primary/30 rounded-lg p-6">
              <h3 className="text-xl font-bold text-primary mb-3">Gamma (γ) - Ultimate Shield</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Gamma can only be obtained through the Dice Roll (18-20). When played, you take 
                <strong> zero damage</strong> this round. If your total is higher than your opponent's, 
                they take <strong>2× the damage</strong> difference. Additionally, your opponent 
                can only play <strong>4 cards</strong> in the next round, severely limiting their options.
              </p>
            </div>
          </div>
        </section>

        {/* Dice Roll System */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Dices className="w-8 h-8" />
            Roll Dice (Π) System
          </h2>
          
          <div className="bg-card/50 border border-border rounded-lg p-6 space-y-4">
            <p className="text-sm text-foreground/80">
              The Dice (Π) can be rolled <strong>only 2 times per entire match</strong>. Use it 
              wisely during the Placement Phase to gain strategic advantages or recover from 
              difficult situations.
            </p>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-primary">Dice Roll Outcomes:</h3>
              
              <div className="grid gap-3">
                <div className="bg-muted/30 p-3 rounded-lg">
                  <strong className="text-primary">1-5:</strong>
                  <span className="text-sm text-foreground/80 ml-2">
                    You can only play <strong>4 cards</strong> this round. The 5th slot is disabled.
                  </span>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-lg">
                  <strong className="text-primary">6-10:</strong>
                  <span className="text-sm text-foreground/80 ml-2">
                    <strong>2 random cards</strong> from your hand are swapped with <strong>2 random 
                    cards</strong> from your deck.
                  </span>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-lg">
                  <strong className="text-primary">11-15:</strong>
                  <span className="text-sm text-foreground/80 ml-2">
                    You <strong>choose 2 cards</strong> to send back to your deck and draw 
                    <strong> 2 new cards</strong>.
                  </span>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-lg">
                  <strong className="text-primary">16-18:</strong>
                  <span className="text-sm text-foreground/80 ml-2">
                    <strong>+1 Twisted (α)</strong> card is added directly to your hand.
                  </span>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-lg">
                  <strong className="text-primary">19-20:</strong>
                  <span className="text-sm text-foreground/80 ml-2">
                    <strong>+1 Gamma (γ)</strong> card is added directly to your hand.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Card Interaction */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-primary">Card Interaction</h2>
          
          <div className="bg-card/50 border border-border rounded-lg p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-primary mb-2">Placing Cards</h3>
              <p className="text-sm text-foreground/80">
                You can place cards on the battlefield in two ways:
              </p>
              <ul className="space-y-1 text-sm text-foreground/80 mt-2">
                <li>• <strong>Tap:</strong> Click/tap a card to place it in the first empty slot</li>
                <li>• <strong>Drag & Drop:</strong> Drag a card to a specific slot on the field</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary mb-2">Rearranging Cards</h3>
              <p className="text-sm text-foreground/80">
                Once cards are on the field, you can drag them between slots to change their 
                order. This is crucial for cards like Delta and Sigma where position matters!
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary mb-2">Viewing Card Details</h3>
              <p className="text-sm text-foreground/80">
                Click the <strong>eye icon</strong> below any card to see detailed information 
                including its symbol meaning, value, and special ability descriptions.
              </p>
            </div>
          </div>
        </section>

        {/* Classes & Abilities - Detailed Roster */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 mb-6">
             <Sword className="w-10 h-10 text-primary" />
             <h2 className="text-4xl font-bold text-primary font-cinzel">Sınıf Rehberi</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Cryomancer */}
                <div className="bg-gradient-to-br from-cyan-900/40 to-black border border-cyan-400/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">Ξ</div>
                   <h4 className="text-xl font-bold text-cyan-300 mb-1">Cryomancer (Ξ)</h4>
                   <p className="text-xs font-mono text-cyan-200/70 mb-3">HARD CONTROL</p>
                   <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-cyan-400">Mantık:</strong> "Oyunun hızını ben belirlerim."</p>
                      <p><strong className="text-white">Mekanik:</strong> <span className="text-cyan-200">Deep Freeze:</span> Rakibin zarlarını dondurur ve hamle yapmasını engeller.</p>
                      <p className="text-xs italic text-gray-400 pt-2 border-t border-cyan-500/20">Strateji: Fateweaver'ı patlama turunda dondurup zarlarını yak.</p>
                   </div>
                </div>

                {/* Slayer */}
                <div className="bg-gradient-to-br from-red-900/40 to-black border border-red-500/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">Ω</div>
                   <h4 className="text-xl font-bold text-red-500 mb-1">Slayer (Ω)</h4>
                   <p className="text-xs font-mono text-red-200/70 mb-3">BRUISER / DPS</p>
                   <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-red-400">Mantık:</strong> "Basitlik en büyük silahtır."</p>
                      <p><strong className="text-white">Mekanik:</strong> <span className="text-red-300">Twisted Immunity:</span> Kitle kontrole dirençli. Sadece vurur.</p>
                      <p className="text-xs italic text-gray-400 pt-2 border-t border-red-500/20">Strateji: R4-5'te işi bitir. Late game'e kalma.</p>
                   </div>
                </div>

                {/* Fateweaver */}
                <div className="bg-gradient-to-br from-yellow-700/20 to-black border border-yellow-400/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">Π</div>
                   <h4 className="text-xl font-bold text-yellow-400 mb-1">Fateweaver (Π)</h4>
                   <p className="text-xs font-mono text-yellow-200/70 mb-3">LATE GAME CARRY</p>
                   <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-yellow-500">Mantık:</strong> "Sabreden derviş, dünyayı yakmış."</p>
                      <p><strong className="text-white">Mekanik:</strong> <span className="text-yellow-200">Dice Stacking:</span> Zarları biriktirip tek turda Gamma (γ) yağdırır.</p>
                      <p className="text-xs italic text-gray-400 pt-2 border-t border-yellow-500/20">Zayıflık: Erken oyunda Aggro'ya kaybeder.</p>
                   </div>
                </div>

                {/* Chronokeeper */}
                <div className="bg-gradient-to-br from-gray-800 to-black border border-white/40 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">τ</div>
                   <h4 className="text-xl font-bold text-white mb-1">Chronokeeper (τ)</h4>
                   <p className="text-xs font-mono text-gray-400 mb-3">TEMPO / UTILITY</p>
                   <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-white">Mantık:</strong> "Senin sıran henüz gelmedi."</p>
                      <p><strong className="text-gray-400">Mekanik:</strong> <span className="text-white">Time Manipulation:</span> Rakip sırasını çalar veya kendini hızlandırır.</p>
                      <p className="text-xs italic text-gray-500 pt-2 border-t border-white/20">Strateji: Vitalist'i 'Outscale' eder.</p>
                   </div>
                </div>

                {/* Vitalist */}
                <div className="bg-gradient-to-br from-green-900/40 to-black border border-green-500/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">Φ</div>
                   <h4 className="text-xl font-bold text-green-500 mb-1">Vitalist (Φ)</h4>
                   <p className="text-xs font-mono text-green-200/70 mb-3">TANK / HEALER</p>
                   <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-green-400">Mantık:</strong> "Beni öldürmeyen şey vaktimi harcar."</p>
                      <p><strong className="text-white">Mekanik:</strong> <span className="text-green-300">Overheal:</span> 50 HP ile başlar. Burst hasarı emer.</p>
                      <p className="text-xs italic text-gray-400 pt-2 border-t border-green-500/20">Strateji: Fateweaver'ın patlamasından sağ çıkabilen tek sınıf.</p>
                   </div>
                </div>

                {/* Mimic */}
                <div className="bg-gradient-to-br from-gray-700/40 to-black border border-gray-400/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">ν</div>
                   <h4 className="text-xl font-bold text-gray-300 mb-1">Mimic (ν)</h4>
                   <p className="text-xs font-mono text-gray-500 mb-3">ROGUE</p>
                   <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-gray-400">Mantık:</strong> "Sen neysen, ben daha iyisiyim."</p>
                      <p><strong className="text-white">Mekanik:</strong> <span className="text-gray-200">Copycat:</span> Rakibin destesini kopyalar.</p>
                      <p className="text-xs italic text-gray-500 pt-2 border-t border-gray-500/20">Strateji: Rakibini kendi silahıyla vur.</p>
                   </div>
                </div>

                {/* Oracle */}
                 <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">Ψ</div>
                   <h4 className="text-xl font-bold text-purple-400 mb-1">Oracle (Ψ)</h4>
                   <p className="text-xs font-mono text-purple-300/70 mb-3">INFO / CONTROL</p>
                   <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-purple-400">Mantık:</strong> "Hamleni önceden biliyorum."</p>
                      <p><strong className="text-white">Mekanik:</strong> <span className="text-purple-200">Future Sight:</span> Kart çekerken rakibin canını almayı hedefler. (Mill).</p>
                      <p className="text-xs italic text-gray-400 pt-2 border-t border-purple-500/20">Strateji: Deste bitir (Mill Win).</p>
                   </div>
                </div>

                {/* Siren */}
                 <div className="bg-gradient-to-br from-pink-900/40 to-black border border-pink-500/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">η</div>
                   <h4 className="text-xl font-bold text-pink-500 mb-1">Siren (η)</h4>
                   <p className="text-xs font-mono text-pink-300/70 mb-3">DISRUPTOR</p>
                   <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-pink-400">Mantık:</strong> "Güzellik acıdır."</p>
                      <p><strong className="text-white">Mekanik:</strong> <span className="text-pink-200">Charm:</span> Rakibin kartlarını kullanır. (Round 4'te -5 HP yer).</p>
                      <p className="text-xs italic text-gray-400 pt-2 border-t border-pink-500/20">Strateji: Rakibi kendi kartlarıyla cezbedin.</p>
                   </div>
                </div>

                {/* Augmentor */}
                <div className="bg-gradient-to-br from-blue-900/40 to-black border border-blue-500/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">Θ</div>
                   <h4 className="text-xl font-bold text-blue-400 mb-1">Augmentor (Θ)</h4>
                   <p className="text-xs font-mono text-blue-300/70 mb-3">BUFFER</p>
                   <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-blue-400">Mantık:</strong> "Sınırları zorla."</p>
                      <p><strong className="text-white">Mekanik:</strong> <span className="text-blue-200">Upgrade:</span> Kartları güçlendirir.</p>
                      <p className="text-xs italic text-gray-400 pt-2 border-t border-blue-500/20">Strateji: Kart değerlerini yükselterek kazan.</p>
                   </div>
                </div>

                {/* Conjurer */}
                <div className="bg-gradient-to-br from-orange-900/40 to-black border border-orange-500/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">μ</div>
                   <h4 className="text-xl font-bold text-orange-400 mb-1">Conjurer (μ)</h4>
                   <p className="text-xs font-mono text-orange-300/70 mb-3">SUMMONER</p>
                   <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-orange-400">Mantık:</strong> "Çoklukta kuvvet vardır."</p>
                      <p><strong className="text-white">Mekanik:</strong> <span className="text-orange-200">Swarm:</span> Sahayı özel kartlarla doldurur.</p>
                      <p className="text-xs italic text-gray-400 pt-2 border-t border-orange-500/20">Strateji: özel kartlarla oyunu kazan.</p>
                   </div>
                </div>

                 {/* Incinerator */}
                <div className="bg-gradient-to-br from-red-950/40 to-black border border-red-800/50 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none text-6xl">ρ</div>
                   <h4 className="text-xl font-bold text-red-700 mb-1">Incinerator (ρ)</h4>
                   <p className="text-xs font-mono text-red-500/70 mb-3">GLASS CANNON</p>
                   <div className="space-y-2 text-sm text-gray-300">
                      <p><strong className="text-red-600">Mantık:</strong> "Yanan sönmez."</p>
                      <p><strong className="text-white">Mekanik:</strong> <span className="text-red-400">Overheat:</span> Kendi destesini yakar.</p>
                      <p className="text-xs italic text-gray-400 pt-2 border-t border-red-800/20">Strateji: Hızlı ve ölümcül oyun tarzı</p>
                   </div>
                </div>
          </div>
        </section>

        {/* Victory Conditions */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-primary">Victory & Defeat</h2>
          
          <div className="bg-card/50 border border-border rounded-lg p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-primary mb-2">How to Win</h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li>• Reduce your opponent's HP to <strong>0 or below</strong>, OR</li>
                <li>• Have <strong>higher HP</strong> than your opponent after 6 rounds</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-primary mb-2">Rewards</h3>
              <ul className="space-y-1 text-sm text-foreground/80">
                <li>• <strong>Victory:</strong> +10 DivineCoin</li>
                <li>• <strong>Defeat:</strong> +2 DivineCoin</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Strategy Tips */}
        <section className="space-y-6 pb-12">
          <h2 className="text-3xl font-bold text-primary">Strategy Tips</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card/50 border border-primary/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-primary mb-2">Early Game</h3>
              <p className="text-sm text-foreground/80">
                Focus on consistent damage with numeric combos. Save special cards for critical moments.
              </p>
            </div>
            
            <div className="bg-card/50 border border-primary/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-primary mb-2">Mid Game</h3>
              <p className="text-sm text-foreground/80">
                Watch for combo opportunities. Sequential and symbol bonuses can swing rounds in your favor.
              </p>
            </div>
            
            <div className="bg-card/50 border border-primary/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-primary mb-2">Late Game</h3>
              <p className="text-sm text-foreground/80">
                Special cards become crucial. Position Delta/Sigma carefully and use Twisted when behind.
              </p>
            </div>
            
            <div className="bg-card/50 border border-primary/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-primary mb-2">Dice Usage</h3>
              <p className="text-sm text-foreground/80">
                Save dice rolls for desperate situations or when you need a Gamma card for victory.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowToPlay;
