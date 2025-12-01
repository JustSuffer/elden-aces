import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Mail, Trophy } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Player123");
  const [email, setEmail] = useState("player@acoria.com");
  const [wins, setWins] = useState(12);
  const [losses, setLosses] = useState(8);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // TODO: Save to database
    toast.success("Profile updated!");
    setIsEditing(false);
  };

  const winRate = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Menu
        </Button>
        <div className="text-xl font-bold text-primary glow-gold">Profile</div>
        <div className="w-24" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center p-8 gap-6">
        {/* Profile Info Card */}
        <Card className="w-full max-w-2xl p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{username}</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {email}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="flex-1">
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90">
                    Save Changes
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Card */}
        <Card className="w-full max-w-2xl p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background/50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-primary">{wins}</div>
              <div className="text-sm text-muted-foreground">Wins</div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-omega">{losses}</div>
              <div className="text-sm text-muted-foreground">Losses</div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-theta">{wins + losses}</div>
              <div className="text-sm text-muted-foreground">Total Games</div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-psi">{winRate}%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
