import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Mail, Trophy, LogOut, History, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { MatchHistory } from "@/components/profile/MatchHistory";

interface Profile {
  username: string;
  avatar_url: string | null;
}

interface GameStats {
  wins: number;
  losses: number;
  total_games: number;
  elo_rating: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    if (data) {
      setProfile(data);
      setUsername(data.username);
    }
    setIsLoading(false);
  };

  const fetchStats = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("game_stats")
      .select("wins, losses, total_games, elo_rating")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching stats:", error);
      return;
    }

    if (data) {
      setStats(data);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("user_id", user.id);

    if (error) {
      toast.error(t("profile.toast.updateError"));
      return;
    }

    setProfile(prev => prev ? { ...prev, username } : null);
    toast.success(t("profile.toast.updateSuccess"));
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success(t("profile.toast.logoutSuccess"));
    navigate("/auth");
  };

  const winRate = stats && stats.wins + stats.losses > 0
    ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1)
    : "0";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl animate-pulse">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t("menu.back")}
        </Button>
        <div className="text-xl font-bold text-primary glow-gold">{t("profile.title")}</div>
        <Button variant="ghost" onClick={handleLogout} className="gap-2 text-destructive hover:text-destructive">
          <LogOut className="w-4 h-4" />
          {t("menu.logout")}
        </Button>
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
              <h2 className="text-2xl font-bold text-foreground">{profile?.username || "Player"}</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="username">{t("profile.username")}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="flex-1">
                  {t("profile.edit")}
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90">
                    {t("profile.save")}
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                    {t("profile.cancel")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Stats & History Tabs */}
        <Card className="w-full max-w-2xl p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="stats" className="gap-2">
                <Trophy className="w-4 h-4" />
                {t("profile.stats")}
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                Maç Geçmişi
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-primary">{stats?.elo_rating || 1000}</div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    ELO
                  </div>
                </div>
                <div className="bg-background/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-500">{stats?.wins || 0}</div>
                  <div className="text-sm text-muted-foreground">{t("profile.wins")}</div>
                </div>
                <div className="bg-background/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-500">{stats?.losses || 0}</div>
                  <div className="text-sm text-muted-foreground">{t("profile.losses")}</div>
                </div>
                <div className="bg-background/50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-muted-foreground">{winRate}%</div>
                  <div className="text-sm text-muted-foreground">{t("profile.winRate")}</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <MatchHistory />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
