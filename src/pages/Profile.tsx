import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Mail, Trophy, LogOut, History, TrendingUp, Swords, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { MatchHistory } from "@/components/profile/MatchHistory";
import { MASTER_CLASSES } from "@/data/gameData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

interface ClassStat {
  wins: number;
  losses: number;
  total: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [botStats, setBotStats] = useState<Record<string, ClassStat>>({});
  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      fetchBotStats();
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

  const fetchBotStats = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("bot_match_stats")
      .select("player_class, result")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching bot stats:", error);
      return;
    }

    const aggregated: Record<string, ClassStat> = {};
    data?.forEach(match => {
      const cls = match.player_class;
      if (!aggregated[cls]) aggregated[cls] = { wins: 0, losses: 0, total: 0 };

      aggregated[cls].total++;
      if (match.result === "win") aggregated[cls].wins++;
      else aggregated[cls].losses++;
    });

    setBotStats(aggregated);
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

  const handleAvatarUpdate = async (className: string) => {
    if (!user) return;
    const avatarUrl = `/assets/avatars/${className.toLowerCase()}.jpg`;

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Avatar error");
      return;
    }

    setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
    setIsAvatarOpen(false);
    toast.success("Avatar updated!");
  };

  const handleLogout = async () => {
    await signOut();
    toast.success(t("profile.toast.logoutSuccess"));
    navigate("/auth");
  };

  const winRate = stats && stats.total_games > 0
    ? ((stats.wins / stats.total_games) * 100).toFixed(1)
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
      <div className="flex-1 flex flex-col items-center p-8 gap-6 overflow-y-auto">
        {/* Profile Info Card */}
        <Card className="w-full max-w-2xl p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary overflow-hidden cursor-pointer" onClick={() => setIsEditing(true)}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-primary" />
                )}
              </div>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsAvatarOpen(true)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
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
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="stats" className="gap-2">
                <Trophy className="w-4 h-4" />
                {t("profile.stats")}
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                Maç Geçmişi
              </TabsTrigger>
              <TabsTrigger value="bot-stats" className="gap-2">
                <Swords className="w-4 h-4" />
                Bot İstatistikleri
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

            <TabsContent value="bot-stats">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2 text-sm font-bold text-muted-foreground border-b border-border pb-2">
                  <div>Sınıf</div>
                  <div className="text-center">Maç</div>
                  <div className="text-center">K / K</div>
                  <div className="text-right">Oran</div>
                </div>
                {Object.keys(botStats).length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 italic">Henüz bot maçı verisi yok.</div>
                ) : (
                  Object.entries(botStats).map(([cls, stat]) => (
                    <div key={cls} className="grid grid-cols-4 gap-2 items-center bg-background/30 p-2 rounded hover:bg-background/50">
                      <div className="font-bold text-primary flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 border border-gold/50 flex items-center justify-center text-[10px]">
                          {MASTER_CLASSES[cls as keyof typeof MASTER_CLASSES]?.symbol}
                        </span>
                        {cls}
                      </div>
                      <div className="text-center">{stat.total}</div>
                      <div className="text-center text-xs">
                        <span className="text-green-500">{stat.wins}</span> / <span className="text-red-500">{stat.losses}</span>
                      </div>
                      <div className="text-right font-bold text-yellow-500">
                        {((stat.wins / stat.total) * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <Dialog open={isAvatarOpen} onOpenChange={setIsAvatarOpen}>
        <DialogContent className="bg-black/95 border-gold/40 text-gold max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profil Fotoğrafı Seç</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 p-4 max-h-[60vh] overflow-y-auto">
            {Object.keys(MASTER_CLASSES).map((cls) => (
              <div
                key={cls}
                className="cursor-pointer group relative aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-gold transition-all"
                onClick={() => handleAvatarUpdate(cls)}
              >
                <img
                  src={`/assets/avatars/${cls.toLowerCase()}.jpg`}
                  alt={cls}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
                <div className="absolute bottom-0 inset-x-0 bg-black/80 text-center text-xs py-1 text-gold/80">
                  {cls}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
