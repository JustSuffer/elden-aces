export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bot_match_stats: {
        Row: {
          created_at: string
          deck_used_name: string | null
          divine_coins_earned: number
          id: string
          opponent_class: string
          opponent_final_hp: number
          opponent_name: string
          player_class: string
          player_final_hp: number
          result: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deck_used_name?: string | null
          divine_coins_earned?: number
          id?: string
          opponent_class: string
          opponent_final_hp?: number
          opponent_name?: string
          player_class: string
          player_final_hp?: number
          result: string
          user_id: string
        }
        Update: {
          created_at?: string
          deck_used_name?: string | null
          divine_coins_earned?: number
          id?: string
          opponent_class?: string
          opponent_final_hp?: number
          opponent_name?: string
          player_class?: string
          player_final_hp?: number
          result?: string
          user_id?: string
        }
        Relationships: []
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      game_stats: {
        Row: {
          created_at: string
          elo_rating: number
          id: string
          losses: number
          lp: number
          rank_tier: string
          total_games: number
          updated_at: string
          user_id: string
          wins: number
        }
        Insert: {
          created_at?: string
          elo_rating?: number
          id?: string
          losses?: number
          lp?: number
          rank_tier?: string
          total_games?: number
          updated_at?: string
          user_id: string
          wins?: number
        }
        Update: {
          created_at?: string
          elo_rating?: number
          id?: string
          losses?: number
          lp?: number
          rank_tier?: string
          total_games?: number
          updated_at?: string
          user_id?: string
          wins?: number
        }
        Relationships: []
      }
      lobbies: {
        Row: {
          created_at: string
          current_players: number
          host_id: string
          id: string
          max_players: number
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_players?: number
          host_id: string
          id?: string
          max_players?: number
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_players?: number
          host_id?: string
          id?: string
          max_players?: number
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      lobby_players: {
        Row: {
          id: string
          joined_at: string
          lobby_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          lobby_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          lobby_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobby_players_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          current_round: number | null
          finished_at: string | null
          game_started: boolean | null
          game_state: Json | null
          id: string
          phase: string | null
          player1_deck: Json
          player1_field: Json | null
          player1_field_round: number | null
          player1_final_hp: number | null
          player1_id: string
          player1_next_round_ready: boolean | null
          player1_ready: boolean | null
          player2_deck: Json
          player2_field: Json | null
          player2_field_round: number | null
          player2_final_hp: number | null
          player2_id: string
          player2_next_round_ready: boolean | null
          player2_ready: boolean | null
          status: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          current_round?: number | null
          finished_at?: string | null
          game_started?: boolean | null
          game_state?: Json | null
          id?: string
          phase?: string | null
          player1_deck: Json
          player1_field?: Json | null
          player1_field_round?: number | null
          player1_final_hp?: number | null
          player1_id: string
          player1_next_round_ready?: boolean | null
          player1_ready?: boolean | null
          player2_deck: Json
          player2_field?: Json | null
          player2_field_round?: number | null
          player2_final_hp?: number | null
          player2_id: string
          player2_next_round_ready?: boolean | null
          player2_ready?: boolean | null
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          current_round?: number | null
          finished_at?: string | null
          game_started?: boolean | null
          game_state?: Json | null
          id?: string
          phase?: string | null
          player1_deck?: Json
          player1_field?: Json | null
          player1_field_round?: number | null
          player1_final_hp?: number | null
          player1_id?: string
          player1_next_round_ready?: boolean | null
          player1_ready?: boolean | null
          player2_deck?: Json
          player2_field?: Json | null
          player2_field_round?: number | null
          player2_final_hp?: number | null
          player2_id?: string
          player2_next_round_ready?: boolean | null
          player2_ready?: boolean | null
          status?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      matchmaking_queue: {
        Row: {
          created_at: string
          deck_data: Json
          deck_name: string
          id: string
          main_class: string
          match_id: string | null
          matched_with: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deck_data: Json
          deck_name: string
          id?: string
          main_class: string
          match_id?: string | null
          matched_with?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deck_data?: Json
          deck_name?: string
          id?: string
          main_class?: string
          match_id?: string | null
          matched_with?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      private_match_invites: {
        Row: {
          created_at: string
          id: string
          match_id: string | null
          receiver_deck_id: string | null
          receiver_id: string
          sender_deck_id: string | null
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id?: string | null
          receiver_deck_id?: string | null
          receiver_id: string
          sender_deck_id?: string | null
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string | null
          receiver_deck_id?: string | null
          receiver_id?: string
          sender_deck_id?: string | null
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          divine_coins: number
          id: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          divine_coins?: number
          id?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          divine_coins?: number
          id?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      rematch_requests: {
        Row: {
          created_at: string
          id: string
          match_id: string
          new_match_id: string | null
          opponent_id: string
          requester_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          new_match_id?: string | null
          opponent_id: string
          requester_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          new_match_id?: string | null
          opponent_id?: string
          requester_id?: string
          status?: string
        }
        Relationships: []
      }
      user_decks: {
        Row: {
          created_at: string
          deck_data: Json
          filler_classes: string[]
          id: string
          main_class: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deck_data?: Json
          filler_classes?: string[]
          id?: string
          main_class: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deck_data?: Json
          filler_classes?: string[]
          id?: string
          main_class?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          last_seen: string
          status: string
          user_id: string
        }
        Insert: {
          last_seen?: string
          status?: string
          user_id: string
        }
        Update: {
          last_seen?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_coins: {
        Args: { amount: number; user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
