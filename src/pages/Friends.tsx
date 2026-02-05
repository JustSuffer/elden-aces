import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEffect } from "react"; // Added useEffect
import {
  ArrowLeft,
  Users,
  UserPlus,
  Inbox,
  Send,
  Swords,
  Check,
  X,
  Trash2,
  Search,
  Clock,
  Circle,
} from "lucide-react";
import { useFriends } from "@/hooks/useFriends";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const Friends = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    matchInvites,
    outgoingMatchInvites,
    isLoading,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    sendMatchInvite,
    acceptMatchInvite,
    declineMatchInvite,
  } = useFriends();

  // Watch for accepted outgoing invites
  useEffect(() => {
    if (outgoingMatchInvites.length > 0) {
      const acceptedInvite = outgoingMatchInvites.find(inv => inv.status === 'accepted');
      if (acceptedInvite) {
        // Navigate to lobby
        navigate(`/private-lobby/${acceptedInvite.id}`);
      }
    }
  }, [outgoingMatchInvites, navigate]);

  const [searchUsername, setSearchUsername] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const handleSendRequest = async () => {
    if (!searchUsername.trim()) return;
    setIsSending(true);
    await sendFriendRequest(searchUsername.trim());
    setSearchUsername("");
    setIsSending(false);
  };

  const handleChallenge = async (friendId: string) => {
    await sendMatchInvite(friendId);
  };

  const handleAcceptInvite = async (inviteId: string) => {
    const result = await acceptMatchInvite(inviteId);
    if (result) {
      // Navigate to private match lobby
      navigate(`/private-lobby/${result}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "in_game":
        return "bg-amber-500";
      default:
        return "bg-muted-foreground/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return language === "tr" ? "Çevrimiçi" : "Online";
      case "in_game":
        return language === "tr" ? "Oyunda" : "In Game";
      default:
        return language === "tr" ? "Çevrimdışı" : "Offline";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl animate-pulse">
          {language === "tr" ? "Yükleniyor..." : "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {language === "tr" ? "Menü" : "Menu"}
        </Button>
        <div className="text-xl font-bold text-primary glow-gold font-cinzel">
          {language === "tr" ? "Arkadaşlar" : "Friends"}
        </div>
        <div className="w-20" />
      </div>

      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        {/* Match Invites Banner */}
        {matchInvites.length > 0 && (
          <Card className="mb-6 p-4 border-amber-500/50 bg-amber-500/10 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Swords className="w-6 h-6 text-amber-500" />
                <div>
                  <p className="font-bold text-foreground">
                    {matchInvites[0].sender_username}{" "}
                    {language === "tr"
                      ? "sizi düelloya davet ediyor!"
                      : "challenges you to a duel!"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(matchInvites[0].created_at), "HH:mm", {
                      locale: tr,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleAcceptInvite(matchInvites[0].id)}
                  className="gap-1"
                >
                  <Check className="w-4 h-4" />
                  {language === "tr" ? "Kabul" : "Accept"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => declineMatchInvite(matchInvites[0].id)}
                  className="gap-1"
                >
                  <X className="w-4 h-4" />
                  {language === "tr" ? "Reddet" : "Decline"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Add Friend Section */}
        <Card className="mb-6 p-4 border-primary/30">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-foreground">
            <UserPlus className="w-5 h-5 text-primary" />
            {language === "tr" ? "Arkadaş Ekle" : "Add Friend"}
          </h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={
                  language === "tr" ? "Kullanıcı adı girin..." : "Enter username..."
                }
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendRequest()}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleSendRequest}
              disabled={isSending || !searchUsername.trim()}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {language === "tr" ? "Gönder" : "Send"}
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="friends" className="gap-2">
              <Users className="w-4 h-4" />
              {language === "tr" ? "Arkadaşlar" : "Friends"}{" "}
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="incoming" className="gap-2">
              <Inbox className="w-4 h-4" />
              {language === "tr" ? "Gelen" : "Incoming"}{" "}
              {incomingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {incomingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="gap-2">
              <Send className="w-4 h-4" />
              {language === "tr" ? "Giden" : "Outgoing"}{" "}
              {outgoingRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {outgoingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Friends List */}
          <TabsContent value="friends">
            <ScrollArea className="h-[calc(100vh-400px)]">
              {friends.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>
                    {language === "tr"
                      ? "Henüz arkadaşınız yok."
                      : "You have no friends yet."}
                  </p>
                  <p className="text-sm mt-2">
                    {language === "tr"
                      ? "Yukarıdan kullanıcı adıyla arkadaş ekleyin!"
                      : "Add friends by username above!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <Card
                      key={friend.id}
                      className="p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-primary/20 overflow-hidden border-2 border-primary/30">
                            {friend.avatar_url ? (
                              <img
                                src={friend.avatar_url}
                                alt={friend.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                                {friend.username[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <Circle
                            className={cn(
                              "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background",
                              getStatusColor(friend.status)
                            )}
                            fill="currentColor"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {friend.username}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getStatusText(friend.status)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {friend.status === "online" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleChallenge(friend.id)}
                            className="gap-1"
                          >
                            <Swords className="w-4 h-4" />
                            {language === "tr" ? "Düello" : "Challenge"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmRemove(friend.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Incoming Requests */}
          <TabsContent value="incoming">
            <ScrollArea className="h-[calc(100vh-400px)]">
              {incomingRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Inbox className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>
                    {language === "tr"
                      ? "Bekleyen istek yok."
                      : "No pending requests."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {incomingRequests.map((req) => (
                    <Card
                      key={req.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden border-2 border-primary/30">
                          {req.sender_avatar ? (
                            <img
                              src={req.sender_avatar}
                              alt={req.sender_username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                              {req.sender_username[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {req.sender_username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(req.created_at), "d MMM", {
                              locale: tr,
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => acceptRequest(req.id)}
                          className="gap-1"
                        >
                          <Check className="w-4 h-4" />
                          {language === "tr" ? "Kabul" : "Accept"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectRequest(req.id)}
                          className="gap-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Outgoing Requests */}
          <TabsContent value="outgoing">
            <ScrollArea className="h-[calc(100vh-400px)]">
              {outgoingRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Send className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>
                    {language === "tr"
                      ? "Gönderilen istek yok."
                      : "No sent requests."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {outgoingRequests.map((req) => (
                    <Card
                      key={req.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border-2 border-border">
                          {req.sender_avatar ? (
                            <img
                              src={req.sender_avatar}
                              alt={req.sender_username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold">
                              {req.sender_username[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {req.sender_username}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {language === "tr" ? "Beklemede" : "Pending"}
                          </p>
                        </div>
                      </div>

                      <Badge variant="secondary">
                        {language === "tr" ? "Bekliyor..." : "Waiting..."}
                      </Badge>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirm Remove Dialog */}
      <Dialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {language === "tr" ? "Arkadaşı Sil" : "Remove Friend"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            {language === "tr"
              ? "Bu arkadaşı silmek istediğinizden emin misiniz?"
              : "Are you sure you want to remove this friend?"}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemove(null)}>
              {language === "tr" ? "İptal" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmRemove) {
                  removeFriend(confirmRemove);
                  setConfirmRemove(null);
                }
              }}
            >
              {language === "tr" ? "Sil" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Friends;
