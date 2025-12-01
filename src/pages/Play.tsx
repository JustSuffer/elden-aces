import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { toast } from "sonner";

interface Lobby {
  id: string;
  name: string;
  host: string;
  players: number;
  maxPlayers: number;
}

const Play = () => {
  const navigate = useNavigate();
  const [lobbyName, setLobbyName] = useState("");
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock lobbies for now - will be replaced with real-time data
  useEffect(() => {
    setLobbies([
      { id: "1", name: "Quick Match", host: "Player1", players: 1, maxPlayers: 2 },
      { id: "2", name: "Ranked Battle", host: "ProGamer", players: 1, maxPlayers: 2 },
    ]);
  }, []);

  const handleCreateLobby = () => {
    if (!lobbyName.trim()) {
      toast.error("Please enter a lobby name");
      return;
    }

    setLoading(true);
    // TODO: Create lobby in database
    setTimeout(() => {
      toast.success(`Lobby "${lobbyName}" created!`);
      setLobbyName("");
      setLoading(false);
    }, 500);
  };

  const handleJoinLobby = (lobbyId: string) => {
    setLoading(true);
    // TODO: Join lobby in database
    setTimeout(() => {
      toast.success("Joined lobby!");
      navigate("/game");
    }, 500);
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
      <div className="flex-1 flex flex-col items-center p-8 gap-8">
        {/* Create Lobby Section */}
        <Card className="w-full max-w-2xl p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Create Lobby
          </h2>
          <div className="flex gap-3">
            <Input
              placeholder="Enter lobby name..."
              value={lobbyName}
              onChange={(e) => setLobbyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateLobby()}
              className="flex-1"
            />
            <Button
              onClick={handleCreateLobby}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              Create
            </Button>
          </div>
        </Card>

        {/* Available Lobbies */}
        <Card className="w-full max-w-2xl p-6 bg-card/50 backdrop-blur-sm border-primary/20">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Available Lobbies
          </h2>
          <div className="space-y-3">
            {lobbies.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No lobbies available. Create one to get started!
              </p>
            ) : (
              lobbies.map((lobby) => (
                <div
                  key={lobby.id}
                  className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div>
                    <h3 className="font-bold text-foreground">{lobby.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Host: {lobby.host} • Players: {lobby.players}/{lobby.maxPlayers}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleJoinLobby(lobby.id)}
                    disabled={loading || lobby.players >= lobby.maxPlayers}
                    variant="default"
                  >
                    {lobby.players >= lobby.maxPlayers ? "Full" : "Join"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Info Box */}
        <Card className="w-full max-w-2xl p-4 bg-muted/20 border-primary/10">
          <p className="text-sm text-muted-foreground text-center">
            Online play is in early development. More features coming soon!
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Play;
