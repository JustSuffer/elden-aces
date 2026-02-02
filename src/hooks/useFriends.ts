import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  status: "online" | "in_game" | "offline";
  last_seen: string;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  sender_username: string;
  sender_avatar: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

interface PrivateMatchInvite {
  id: string;
  sender_id: string;
  sender_username: string;
  sender_avatar: string | null;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "started";
  match_id: string | null;
  created_at: string;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [matchInvites, setMatchInvites] = useState<PrivateMatchInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch friends list
  const fetchFriends = useCallback(async () => {
    if (!user) return;

    try {
      // Get friendships where user is either user1 or user2
      const { data: friendships, error } = await (supabase
        .from("friendships" as any) as any)
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) throw error;

      if (!friendships || friendships.length === 0) {
        setFriends([]);
        return;
      }

      // Get friend IDs
      const friendIds = friendships.map((f: any) =>
        f.user1_id === user.id ? f.user2_id : f.user1_id
      );

      // Fetch profiles and presence
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", friendIds);

      const { data: presences } = await (supabase
        .from("user_presence" as any) as any)
        .select("*")
        .in("user_id", friendIds);

      const presenceMap = new Map(
        (presences || []).map((p: any) => [p.user_id, p])
      );

      const friendsList: Friend[] = (profiles || []).map((p: any) => {
        const presence = presenceMap.get(p.user_id) as any;
        return {
          id: p.user_id,
          username: p.username,
          avatar_url: p.avatar_url,
          status: (presence?.status as "online" | "in_game" | "offline") || "offline",
          last_seen: (presence?.last_seen as string) || new Date().toISOString(),
        };
      });

      // Sort by online status
      friendsList.sort((a, b) => {
        const order = { online: 0, in_game: 1, offline: 2 };
        return order[a.status] - order[b.status];
      });

      setFriends(friendsList);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  }, [user]);

  // Fetch friend requests
  const fetchRequests = useCallback(async () => {
    if (!user) return;

    try {
      // Incoming requests
      const { data: incoming } = await (supabase
        .from("friend_requests" as any) as any)
        .select("*")
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      // Outgoing requests
      const { data: outgoing } = await (supabase
        .from("friend_requests" as any) as any)
        .select("*")
        .eq("sender_id", user.id)
        .eq("status", "pending");

      // Get sender/receiver profiles
      const senderIds = (incoming || []).map((r: any) => r.sender_id);
      const receiverIds = (outgoing || []).map((r: any) => r.receiver_id);
      const allIds = [...senderIds, ...receiverIds];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", allIds);

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p])
      );

      setIncomingRequests(
        (incoming || []).map((r: any) => {
          const sender = profileMap.get(r.sender_id);
          return {
            id: r.id,
            sender_id: r.sender_id,
            sender_username: sender?.username || "Unknown",
            sender_avatar: sender?.avatar_url,
            status: r.status,
            created_at: r.created_at,
          };
        })
      );

      setOutgoingRequests(
        (outgoing || []).map((r: any) => {
          const receiver = profileMap.get(r.receiver_id);
          return {
            id: r.id,
            sender_id: r.receiver_id,
            sender_username: receiver?.username || "Unknown",
            sender_avatar: receiver?.avatar_url,
            status: r.status,
            created_at: r.created_at,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  }, [user]);

  // Fetch match invites
  const fetchMatchInvites = useCallback(async () => {
    if (!user) return;

    try {
      const { data: invites } = await (supabase
        .from("private_match_invites" as any) as any)
        .select("*")
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (!invites || invites.length === 0) {
        setMatchInvites([]);
        return;
      }

      const senderIds = invites.map((i: any) => i.sender_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", senderIds);

      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p])
      );

      setMatchInvites(
        invites.map((i: any) => {
          const sender = profileMap.get(i.sender_id);
          return {
            id: i.id,
            sender_id: i.sender_id,
            sender_username: sender?.username || "Unknown",
            sender_avatar: sender?.avatar_url,
            status: i.status,
            match_id: i.match_id,
            created_at: i.created_at,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching match invites:", error);
    }
  }, [user]);

  // Send friend request by username
  const sendFriendRequest = async (username: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Find user by username
      const { data: targetProfile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("username", username)
        .single();

      if (profileError || !targetProfile) {
        toast.error("Kullanıcı bulunamadı!");
        return false;
      }

      if (targetProfile.user_id === user.id) {
        toast.error("Kendinize istek gönderemezsiniz!");
        return false;
      }

      // Check if already friends
      const { data: existingFriendship } = await (supabase
        .from("friendships" as any) as any)
        .select("id")
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${targetProfile.user_id}),and(user1_id.eq.${targetProfile.user_id},user2_id.eq.${user.id})`
        )
        .maybeSingle();

      if (existingFriendship) {
        toast.error("Bu kullanıcı zaten arkadaşınız!");
        return false;
      }

      // Check if request already exists
      const { data: existingRequest } = await (supabase
        .from("friend_requests" as any) as any)
        .select("id, status")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${targetProfile.user_id}),and(sender_id.eq.${targetProfile.user_id},receiver_id.eq.${user.id})`
        )
        .eq("status", "pending")
        .maybeSingle();

      if (existingRequest) {
        toast.error("Zaten bekleyen bir istek var!");
        return false;
      }

      // Send request
      const { error } = await (supabase
        .from("friend_requests" as any) as any)
        .insert({
          sender_id: user.id,
          receiver_id: targetProfile.user_id,
        });

      if (error) throw error;

      toast.success(`${username} kullanıcısına arkadaşlık isteği gönderildi!`);
      await fetchRequests();
      return true;
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("İstek gönderilemedi!");
      return false;
    }
  };

  // Accept friend request
  const acceptRequest = async (requestId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Get request details
      const { data: request } = await (supabase
        .from("friend_requests" as any) as any)
        .select("*")
        .eq("id", requestId)
        .single();

      if (!request) {
        toast.error("İstek bulunamadı!");
        return false;
      }

      // Create friendship (ensure user1_id < user2_id for uniqueness)
      const [user1, user2] = [request.sender_id, user.id].sort();
      const { error: friendshipError } = await (supabase
        .from("friendships" as any) as any)
        .insert({ user1_id: user1, user2_id: user2 });

      if (friendshipError) throw friendshipError;

      // Update request status
      await (supabase.from("friend_requests" as any) as any)
        .update({ status: "accepted" })
        .eq("id", requestId);

      toast.success("Arkadaşlık isteği kabul edildi!");
      await Promise.all([fetchFriends(), fetchRequests()]);
      return true;
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("İstek kabul edilemedi!");
      return false;
    }
  };

  // Reject friend request
  const rejectRequest = async (requestId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await (supabase.from("friend_requests" as any) as any)
        .update({ status: "rejected" })
        .eq("id", requestId);

      toast.success("İstek reddedildi.");
      await fetchRequests();
      return true;
    } catch (error) {
      console.error("Error rejecting request:", error);
      return false;
    }
  };

  // Remove friend
  const removeFriend = async (friendId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await (supabase.from("friendships" as any) as any)
        .delete()
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${user.id})`
        );

      toast.success("Arkadaş silindi.");
      await fetchFriends();
      return true;
    } catch (error) {
      console.error("Error removing friend:", error);
      return false;
    }
  };

  // Send match invite (challenge)
  const sendMatchInvite = async (friendId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await (supabase
        .from("private_match_invites" as any) as any)
        .insert({
          sender_id: user.id,
          receiver_id: friendId,
        });

      if (error) throw error;

      toast.success("Düello daveti gönderildi!");
      return true;
    } catch (error) {
      console.error("Error sending match invite:", error);
      toast.error("Davet gönderilemedi!");
      return false;
    }
  };

  // Accept match invite
  const acceptMatchInvite = async (inviteId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Update invite status
      const { data: invite, error } = await (supabase
        .from("private_match_invites" as any) as any)
        .update({ status: "accepted" })
        .eq("id", inviteId)
        .select()
        .single();

      if (error) throw error;

      toast.success("Düello daveti kabul edildi!");
      return invite.id; // Return invite ID to navigate to lobby
    } catch (error) {
      console.error("Error accepting match invite:", error);
      return null;
    }
  };

  // Decline match invite
  const declineMatchInvite = async (inviteId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await (supabase.from("private_match_invites" as any) as any)
        .update({ status: "rejected" })
        .eq("id", inviteId);

      toast.success("Davet reddedildi.");
      await fetchMatchInvites();
      return true;
    } catch (error) {
      console.error("Error declining match invite:", error);
      return false;
    }
  };

  // Update user presence
  const updatePresence = async (status: "online" | "in_game" | "offline") => {
    if (!user) return;

    try {
      await (supabase.from("user_presence" as any) as any).upsert({
        user_id: user.id,
        status,
        last_seen: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating presence:", error);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([fetchFriends(), fetchRequests(), fetchMatchInvites()]).finally(
        () => setIsLoading(false)
      );

      // Set online status
      updatePresence("online");

      // Subscribe to realtime updates for friend requests and invites
      const requestsChannel = supabase
        .channel("friend_requests_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "friend_requests",
            filter: `receiver_id=eq.${user.id}`,
          },
          () => fetchRequests()
        )
        .subscribe();

      const invitesChannel = supabase
        .channel("match_invites_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "private_match_invites",
            filter: `receiver_id=eq.${user.id}`,
          },
          () => fetchMatchInvites()
        )
        .subscribe();

      // Cleanup
      return () => {
        updatePresence("offline");
        supabase.removeChannel(requestsChannel);
        supabase.removeChannel(invitesChannel);
      };
    } else {
      setIsLoading(false);
    }
  }, [user, fetchFriends, fetchRequests, fetchMatchInvites]);

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    matchInvites,
    isLoading,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    sendMatchInvite,
    acceptMatchInvite,
    declineMatchInvite,
    updatePresence,
    refresh: () =>
      Promise.all([fetchFriends(), fetchRequests(), fetchMatchInvites()]),
  };
}
