import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy, Crown, Medal, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { getRankByElo, getRankDisplayName, getRankTitle, getRankColor, getEloProgress } from "@/utils/eloRankSystem";
import { Progress } from "@/components/ui/progress";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  elo_rating: number;
  wins: number;
  losses: number;
  total_games: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const lang = language as "tr" | "en";

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const fetchLeaderboard = async () => {
    // Fetch game_stats with elo_rating, join with profiles for username
    const { data: stats, error } = await supabase
      .from("game_stats")
      .select("user_id, elo_rating, wins, losses, total_games")
      .order("elo_rating", { ascending: false })
      .limit(100) as { data: any[] | null; error: any };

    if (error || !stats) {
      console.error("Leaderboard fetch error:", error);
      setIsLoading(false);
      return;
    }

    // Fetch usernames for all user_ids
    const userIds = stats.map(s => s.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username")
      .in("user_id", userIds);

    const usernameMap = new Map((profiles || []).map(p => [p.user_id, p.username]));

    const entries: LeaderboardEntry[] = stats.map(s => ({
      user_id: s.user_id,
      username: usernameMap.get(s.user_id) || "Unknown",
      elo_rating: s.elo_rating,
      wins: s.wins,
      losses: s.losses,
      total_games: s.total_games
    }));

    setLeaderboard(entries);

    // Find current user's rank
    if (user) {
      const idx = entries.findIndex(e => e.user_id === user.id);
      setUserRank(idx >= 0 ? idx + 1 : null);
    }

    setIsLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{rank}</span>;
  };

  const getRankBg = (rank: number, elo: number) => {
    const rankData = getRankByElo(elo);
    if (rank === 1) return `bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50`;
    if (rank === 2) return "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/50";
    if (rank === 3) return "bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/50";
    return `bg-card/50 border-border/50`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl animate-pulse">{lang === "tr" ? "Yükleniyor..." : "Loading..."}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/menu")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {lang === "tr" ? "Menü" : "Menu"}
        </Button>
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-primary glow-gold font-cinzel">
            {lang === "tr" ? "Liderlik Tablosu" : "Leaderboard"}
          </span>
        </div>
        <div className="w-24" />
      </div>

      {/* User's Rank Banner */}
      {userRank && (
        <div className="container mx-auto px-4 pt-6">
          <Card className="p-4 bg-primary/10 border-primary/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">
                {lang === "tr" ? "Senin Sıran" : "Your Rank"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">#{userRank}</span>
              <span className="text-muted-foreground text-sm">
                / {leaderboard.length}
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="space-y-2">
          {leaderboard.map((entry, idx) => {
            const rank = idx + 1;
            const isCurrentUser = user?.id === entry.user_id;
            const winRate = entry.total_games > 0 
              ? ((entry.wins / entry.total_games) * 100).toFixed(0) 
              : "0";
            const rankData = getRankByElo(entry.elo_rating);

            return (
              <Card
                key={entry.user_id}
                className={`p-4 flex items-center gap-4 border transition-all ${getRankBg(rank, entry.elo_rating)} ${isCurrentUser ? "ring-2 ring-primary" : ""}`}
              >
                {/* Rank */}
                <div className="w-10 flex justify-center">
                  {getRankIcon(rank)}
                </div>

                {/* Username & Rank Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold truncate ${isCurrentUser ? "text-primary" : "text-foreground"}`}>
                      {entry.username}
                      {isCurrentUser && <span className="text-xs ml-2 text-muted-foreground">({lang === "tr" ? "Sen" : "You"})</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span 
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${rankData.color}30`, color: rankData.color }}
                    >
                      {getRankDisplayName(entry.elo_rating, lang)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {getRankTitle(entry.elo_rating, lang)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {entry.wins}{lang === "tr" ? "G" : "W"} / {entry.losses}{lang === "tr" ? "M" : "L"} ({winRate}%)
                  </p>
                </div>

                {/* ELO & Progress */}
                <div className="text-right w-24">
                  <p className="text-2xl font-bold" style={{ color: rankData.color }}>{entry.elo_rating}</p>
                  <p className="text-xs text-muted-foreground">ELO</p>
                  <Progress 
                    value={getEloProgress(entry.elo_rating)} 
                    className="h-1 mt-1"
                  />
                </div>
              </Card>
            );
          })}

          {leaderboard.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              {lang === "tr" ? "Henüz sıralama yok. İlk maçını oyna!" : "No rankings yet. Play your first match!"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
