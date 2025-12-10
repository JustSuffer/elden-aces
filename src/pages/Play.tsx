import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Lobby {
  id: string;
  name: string;
  host_id: string;
  max_players: number;
  current_players: number;
  status: string;
  host_username?: string;
}

const Play = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lobbyName, setLobbyName] = useState("");
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchLobbies();
  }, []);

  const fetchLobbies = async () => {
    setIsRefreshing(true);
    
    const { data: lobbiesData, error } = await supabase
      .from("lobbies")
      .select("*")
      .eq("status", "waiting")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching lobbies:", error);
      setIsRefreshing(false);
      return;
    }

    // Fetch host usernames
    if (lobbiesData && lobbiesData.length > 0) {
      const hostIds = lobbiesData.map(l => l.host_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in("user_id", hostIds);

      const lobbiesWithUsernames = lobbiesData.map(lobby => ({
        ...lobby,
        host_username: profiles?.find(p => p.user_id === lobby.host_id)?.username || "Unknown"
      }));

      setLobbies(lobbiesWithUsernames);
    } else {
      setLobbies([]);
    }
    
    setIsRefreshing(false);
  };

  const handleCreateLobby = async () => {
    if (!lobbyName.trim()) {
      toast.error("Please enter a lobby name");
      return;
    }

    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from("lobbies")
      .insert({
        name: lobbyName.trim(),
        host_id: user.id,
        max_players: 2,
        current_players: 1,
        status: "waiting"
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create lobby");
      setIsLoading(false);
      return;
    }

    // Add host to lobby_players
    await supabase
      .from("lobby_players")
      .insert({
        lobby_id: data.id,
        user_id: user.id
      });

    toast.success("Lobby created!");
    setLobbyName("");
    fetchLobbies();
    setIsLoading(false);
  };

  const handleJoinLobby = async (lobby: Lobby) => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (lobby.current_players >= lobby.max_players) {
      toast.error("Lobby is full");
      return;
    }

    // Add player to lobby
    const { error: joinError } = await supabase
      .from("lobby_players")
      .insert({
        lobby_id: lobby.id,
        user_id: user.id
      });

    if (joinError) {
      toast.error("Failed to join lobby");
      return;
    }

    // Update lobby player count
    const { error: updateError } = await supabase
      .from("lobbies")
      .update({ 
        current_players: lobby.current_players + 1,
        status: lobby.current_players + 1 >= lobby.max_players ? "full" : "waiting"
      })
      .eq("id", lobby.id);

    if (updateError) {
      toast.error("Failed to update lobby");
      return;
    }

    toast.success(`Joined ${lobby.name}!`);
    navigate("/game");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Menu
        </Button>
        <div className="text-xl font-bold text-primary glow-gold">Online Play</div>
        <div className="w-24" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center p-8 gap-6">
        {/* Create Lobby */}
        <Card className="w-full max-w-2xl p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Lobby
          </h2>
          <div className="flex gap-3">
            <Input
              placeholder="Enter lobby name..."
              value={lobbyName}
              onChange={(e) => setLobbyName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleCreateLobby} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </Card>

        {/* Available Lobbies */}
        <Card className="w-full max-w-2xl p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Users className="w-5 h-5" />
              Available Lobbies
            </h2>
            <Button variant="ghost" size="sm" onClick={fetchLobbies} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {lobbies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No lobbies available. Create one to start playing!
            </div>
          ) : (
            <div className="space-y-3">
              {lobbies.map((lobby) => (
                <div
                  key={lobby.id}
                  className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-foreground">{lobby.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Host: {lobby.host_username} • {lobby.current_players}/{lobby.max_players} players
                    </p>
                  </div>
                  <Button
                    onClick={() => handleJoinLobby(lobby)}
                    disabled={lobby.current_players >= lobby.max_players || lobby.host_id === user?.id}
                    variant={lobby.host_id === user?.id ? "outline" : "default"}
                  >
                    {lobby.host_id === user?.id ? "Your Lobby" : "Join"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Play Option */}
        <Card className="w-full max-w-2xl p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <h2 className="text-xl font-bold text-primary mb-4">Quick Play</h2>
          <p className="text-muted-foreground mb-4">
            Play against the AI bot instantly without waiting for other players.
          </p>
          <Button onClick={() => navigate("/game")} className="w-full">
            Play vs Bot
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Play;
