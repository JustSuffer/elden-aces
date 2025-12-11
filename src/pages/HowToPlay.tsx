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
            {/* Numeric Cards */}
            <div className="bg-card/50 border border-border rounded-lg p-6 space-y-3">
              <h3 className="text-xl font-bold text-primary">Numeric Cards (24 cards) + Mimic (36 cards)</h3>
              <p className="text-sm text-foreground/70">Each symbol has cards numbered 1-6:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-2xl text-phi-harmony">Φ</span>
                  <div>
                    <strong className="text-phi-harmony">Phi (Φ)</strong> - Balance / Genesis
                    <p className="text-muted-foreground">Represents harmony and creation</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl text-theta-wisdom">Θ</span>
                  <div>
                    <strong className="text-theta-wisdom">Theta (Θ)</strong> - Time
                    <p className="text-muted-foreground">Controls the flow of time</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl text-psi-mind">Ψ</span>
                  <div>
                    <strong className="text-psi-mind">Psi (Ψ)</strong> - Mind
                    <p className="text-muted-foreground">Power of consciousness</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl text-omega-chaos">Ω</span>
                  <div>
                    <strong className="text-omega-chaos">Omega (Ω)</strong> - Chaos
                    <p className="text-muted-foreground">Embraces unpredictability</p>
                  </div>
                </li>
              </ul>
            </div>

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

        {/* Classes & Abilities */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Sword className="w-8 h-8" />
            Classes & Abilities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {/* Vitalist */}
             <div className="bg-card/50 border border-green-500/30 rounded-lg p-4">
                <h3 className="text-xl font-bold text-green-500 mb-2">Vitalist (Φ)</h3>
                <p className="text-sm text-foreground/80 mb-2">Role: Tank</p>
                <ul className="text-sm space-y-1 text-foreground/70">
                    <li>❤️ HP: 50</li>
                    <li>🛡️ Passive: Start with 50 HP.</li>
                    <li>✨ Ability: Heals HP (Green Cards).</li>
                    <li className="text-xs text-muted-foreground pl-2 border-l-2 border-green-500/50">
                        Scale: 2: +4 | 3: +6 | 4: +8 | 5: +15 HP
                    </li>
                    <li>🏆 Win Con: End with MORE HP than Opponent.</li>
                    <li>⚠️ Counter: Must have LESS HP vs Slayer.</li>
                </ul>
             </div>

             {/* Slayer */}
             <div className="bg-card/50 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-xl font-bold text-red-500 mb-2">Slayer (Ω)</h3>
                <p className="text-sm text-foreground/80 mb-2">Role: DPS / Anti-Meta</p>
                <ul className="text-sm space-y-1 text-foreground/70">
                    <li>❤️ HP: 40</li>
                    <li>🛡️ Passive: Immune to Twisted (α).</li>
                    <li>✨ Ability: Direct Damage (Red Cards).</li>
                    <li className="text-xs text-muted-foreground pl-2 border-l-2 border-red-500/50">
                        Scale: 2: 3 | 3: 5 | 4: 8 | 5: 12 Dmg
                    </li>
                    <li>🏆 Win Con: Deal 12+ Ability Dmg in one turn.</li>
                    <li>⚠️ Lose Con: Deal 12+ Dmg but HP &gt; Opponent.</li>
                </ul>
             </div>

             {/* Fateweaver */}
             <div className="bg-card/50 border border-yellow-200/30 rounded-lg p-4">
                <h3 className="text-xl font-bold text-yellow-200 mb-2">Fateweaver (Π)</h3>
                <p className="text-sm text-foreground/80 mb-2">Role: Gambler</p>
                <ul className="text-sm space-y-1 text-foreground/70">
                    <li>❤️ HP: 40</li>
                    <li>🛡️ Passive: Dice active from Round 3+.</li>
                    <li>✨ Ability: Bonus Dice Rolls & Gamma Cards.</li>
                    <li className="text-xs text-muted-foreground pl-2 border-l-2 border-yellow-200/50">
                        Scale: 2: +2 | 3: +4 | 4: +7 | 5: +8 & Gamma
                    </li>
                    <li>🏆 Win Con: Play 5 Gamma (γ) Cards.</li>
                </ul>
             </div>

             {/* Oracle */}
             <div className="bg-card/50 border border-purple-500/30 rounded-lg p-4">
                <h3 className="text-xl font-bold text-purple-500 mb-2">Oracle (Ψ)</h3>
                <p className="text-sm text-foreground/80 mb-2">Role: Self-Mill</p>
                <ul className="text-sm space-y-1 text-foreground/70">
                    <li>❤️ HP: 40</li>
                    <li>🛡️ Passive: Draws extra cards / Self-Mills.</li>
                    <li>✨ Ability: Dmg & Draw (Purple Cards).</li>
                    <li className="text-xs text-muted-foreground pl-2 border-l-2 border-purple-500/50">
                        Scale: 2: 2/2 | 3: 3/3 | 4: 4/4 | 5: 10 Dmg / 5 Draw
                    </li>
                    <li>🏆 Win Con: Empty your own Deck (0 Cards).</li>
                    <li>⚠️ Counter: Vs Vitalist 0 Deck = 25 Pure Dmg.</li>
                </ul>
             </div>

             {/* Chronokeeper */}
             <div className="bg-card/50 border border-white/30 rounded-lg p-4">
                <h3 className="text-xl font-bold text-white mb-2">Chronokeeper (τ)</h3>
                <p className="text-sm text-foreground/80 mb-2">Role: Stall</p>
                <ul className="text-sm space-y-1 text-foreground/70">
                    <li>❤️ HP: 30</li>
                    <li>🛡️ Passive: Starts with 30 HP.</li>
                    <li>✨ Ability: Silences Opponent (Skips Turns).</li>
                    <li className="text-xs text-muted-foreground pl-2 border-l-2 border-white/50">
                        Scale: 3: 1 Rnd | 4: 2 Rnd | 5: 3 Rnd Silence
                    </li>
                    <li>🏆 Win Con: Survive until end of Round 6.</li>
                </ul>
             </div>

             {/* Cryomancer */}
             <div className="bg-card/50 border border-cyan-300/30 rounded-lg p-4">
                <h3 className="text-xl font-bold text-cyan-300 mb-2">Cryomancer (Ξ)</h3>
                <p className="text-sm text-foreground/80 mb-2">Role: Hard Control</p>
                <ul className="text-sm space-y-1 text-foreground/70">
                    <li>❤️ HP: 40</li>
                    <li>🛡️ Passive: Freezes enemy cards.</li>
                    <li>✨ Ability: Freeze Opponent Hand.</li>
                    <li className="text-xs text-muted-foreground pl-2 border-l-2 border-cyan-300/50">
                        Scale: 2: 2 | 3: 3 | 4: 4 | 5: ALL Cards
                    </li>
                    <li>🏆 Win Con: Freeze 3 Special Cards (Total).</li>
                </ul>
             </div>

             {/* Incinerator */}
             <div className="bg-card/50 border border-orange-900/30 rounded-lg p-4">
                <h3 className="text-xl font-bold text-orange-900 mb-2">Incinerator (ρ)</h3>
                <p className="text-sm text-foreground/80 mb-2">Role: Aggro Miller</p>
                <ul className="text-sm space-y-1 text-foreground/70">
                    <li>❤️ HP: 40</li>
                    <li>🛡️ Passive: Burns opponent's deck.</li>
                    <li>✨ Ability: Burn Opponent Deck.</li>
                    <li className="text-xs text-muted-foreground pl-2 border-l-2 border-orange-900/50">
                        Scale: 2: 3 | 3: 4 | 4: 5 | 5: 8 Cards + NoDeath
                    </li>
                    <li>🏆 Win Con: Opponent Deck at 0 by Round 4.</li>
                    <li>⚠️ Lose Con: Die if Opponent &gt; 0 cards at R4.</li>
                </ul>
             </div>

             {/* Siren */}
             <div className="bg-card/50 border border-pink-500/30 rounded-lg p-4">
                <h3 className="text-xl font-bold text-pink-500 mb-2">Siren (η)</h3>
                <p className="text-sm text-foreground/80 mb-2">Role: Thief</p>
                <ul className="text-sm space-y-1 text-foreground/70">
                    <li>❤️ HP: 40</li>
                    <li>🛡️ Passive: Steals cards from opponent.</li>
                    <li>✨ Ability: Steal Cards (Shiny).</li>
                    <li className="text-xs text-muted-foreground pl-2 border-l-2 border-pink-500/50">
                        Scale: 2: 2 | 3: 3 | 4: 4 | 5: 5 Cards
                    </li>
                    <li>🏆 Win Con: Play 5 Stolen Cards.</li>
                    <li>⚠️ Curse: Takes 5 Damage automatically at Round 4.</li>
                </ul>
             </div>

             {/* Augmentor */}
             <div className="bg-card/50 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-xl font-bold text-blue-500 mb-2">Augmentor (Θ)</h3>
                <p className="text-sm text-foreground/80 mb-2">Role: Scaler</p>
                <ul className="text-sm space-y-1 text-foreground/70">
                    <li>❤️ HP: 40</li>
                    <li>🛡️ Passive: Permanently buffs card values.</li>
                    <li>✨ Ability: Buff Played Cards.</li>
                    <li className="text-xs text-muted-foreground pl-2 border-l-2 border-blue-500/50">
                        Scale: 2: +1 | 3: +2 | 4: +3 | 5: +6 Value
                    </li>
                    <li>🏆 Win Con: Play a card with Value 9+.</li>
                </ul>
             </div>

              {/* Conjurer */}
              <div className="bg-card/50 border border-orange-500/30 rounded-lg p-4">
                <h3 className="text-xl font-bold text-orange-500 mb-2">Conjurer (μ)</h3>
                <p className="text-sm text-foreground/80 mb-2">Role: Summoner</p>
                <ul className="text-sm space-y-1 text-foreground/70">
                    <li>❤️ HP: 40</li>
                    <li>🛡️ Passive: Summons random cards.</li>
                    <li>✨ Ability: Spawn Cards.</li>
                    <li className="text-xs text-muted-foreground pl-2 border-l-2 border-orange-500/50">
                        Scale: 5: Spawns 5 Cards + Gamma
                    </li>
                    <li>🏆 Win Con: Perform a Sigma + Delta Combo.</li>
                </ul>
             </div>

              {/* Mimic */}
              <div className="bg-card/50 border border-gray-400/30 rounded-lg p-4">
                <h3 className="text-xl font-bold text-gray-400 mb-2">Mimic (ν)</h3>
                <p className="text-sm text-foreground/80 mb-2">Role: Copycat</p>
                <ul className="text-sm space-y-1 text-foreground/70">
                    <li>❤️ HP: 40</li>
                    <li>🛡️ Passive: 36 Card Deck (Copy + 6 Mimic).</li>
                    <li>✨ Ability: Copies Opponent's Last Ability Scale.</li>
                    <li>🏆 Win Con: Copies Opponent's Win Condition.</li>
                </ul>
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
