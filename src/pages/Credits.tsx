import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Heart, Code } from "lucide-react";

const Credits = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="text-xl font-bold text-primary glow-gold">Credits</div>
        <div className="w-20" />
      </div>

      {/* Credits Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-6">
          {/* Game Title */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-6xl font-bold text-primary glow-gold">ACORIA</h1>
            <p className="text-xl text-muted-foreground">A Strategic Card Battle Experience</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Development Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Development
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-primary">Game Design</p>
                  <p className="text-sm text-muted-foreground">Core mechanics & balancing</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">Programming</p>
                  <p className="text-sm text-muted-foreground">React, TypeScript, Tailwind CSS</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">UI/UX Design</p>
                  <p className="text-sm text-muted-foreground">Interface & visual design</p>
                </div>
              </CardContent>
            </Card>

            {/* Art & Design */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Art & Design
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-primary">Card Artwork</p>
                  <p className="text-sm text-muted-foreground">Original card designs</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">Visual Effects</p>
                  <p className="text-sm text-muted-foreground">Animations & transitions</p>
                </div>
                <div>
                  <p className="font-semibold text-primary">Branding</p>
                  <p className="text-sm text-muted-foreground">Logo & identity</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Special Thanks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Special Thanks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                To all players who embark on this strategic journey through the ancient realms of ACORIA.
                May your cards be ever in your favor, and your strategy unmatched.

                                    
              </p>
              <p className="text-center text-muted-foreground">İzzet Can Sorna</p>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          <Card>
            <CardHeader>
              <CardTitle>Technology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 justify-center">
                {["React", "TypeScript", "Tailwind CSS", "Vite", "Lucide Icons", "Radix UI"].map((tech) => (
                  <div
                    key={tech}
                    className="px-4 py-2 bg-muted rounded-full text-sm font-medium"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-8">
            <p>© 2025 ACORIA. All rights reserved.</p>
            <p className="mt-2">Built with passion for strategic card game enthusiasts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credits;
