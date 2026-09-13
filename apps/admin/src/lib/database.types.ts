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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      forum_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          id: string
          is_protected: boolean
          topic_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          is_protected?: boolean
          topic_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          is_protected?: boolean
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          author_id: string
          category_id: number
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          id: string
          is_locked: boolean
          is_pinned: boolean
          is_protected: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category_id: number
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          is_protected?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category_id?: number
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          is_protected?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      marketplace_listing_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          listing_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          listing_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          archived_at: string | null
          category_id: number
          created_at: string
          currency_code: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          description: string
          id: string
          image_url: string | null
          listing_source: Database["public"]["Enums"]["marketplace_listing_source"]
          minecraft_version: string | null
          platform: string | null
          price_amount: number | null
          price_text: string | null
          published_at: string | null
          seller_id: string
          short_description: string
          slug: string
          sort_order: number | null
          status: Database["public"]["Enums"]["marketplace_listing_status"]
          submitted_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          category_id: number
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description: string
          id?: string
          image_url?: string | null
          listing_source?: Database["public"]["Enums"]["marketplace_listing_source"]
          minecraft_version?: string | null
          platform?: string | null
          price_amount?: number | null
          price_text?: string | null
          published_at?: string | null
          seller_id: string
          short_description: string
          slug: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["marketplace_listing_status"]
          submitted_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          category_id?: number
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          description?: string
          id?: string
          image_url?: string | null
          listing_source?: Database["public"]["Enums"]["marketplace_listing_source"]
          minecraft_version?: string | null
          platform?: string | null
          price_amount?: number | null
          price_text?: string | null
          published_at?: string | null
          seller_id?: string
          short_description?: string
          slug?: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["marketplace_listing_status"]
          submitted_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ncreate_forum_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      ncreate_forum_posts: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          id: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ncreate_forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ncreate_forum_posts_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ncreate_forum_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ncreate_forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      ncreate_forum_topics: {
        Row: {
          author_id: string
          category_id: number
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deletion_reason: string | null
          id: string
          is_locked: boolean
          is_pinned: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category_id: number
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category_id?: number
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deletion_reason?: string | null
          id?: string
          is_locked?: boolean
          is_pinned?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ncreate_forum_topics_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ncreate_forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ncreate_forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ncreate_forum_topics_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ncreate_home_cards: {
        Row: {
          created_at: string
          description: string | null
          id: number
          image_url: string | null
          is_published: boolean
          section_id: number
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          image_url?: string | null
          is_published?: boolean
          section_id: number
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          image_url?: string | null
          is_published?: boolean
          section_id?: number
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ncreate_home_cards_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "ncreate_home_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      ncreate_home_sections: {
        Row: {
          created_at: string
          id: number
          is_published: boolean
          section_key: string
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_published?: boolean
          section_key: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_published?: boolean
          section_key?: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ncreate_site_settings: {
        Row: {
          discord_url: string | null
          donate_url: string | null
          hero_subtitle: string | null
          hero_title: string
          launcher_url: string | null
          minecraft_version: string | null
          online_players: number
          record_players: number
          server_ip: string | null
          server_name: string
          site_id: string
          status: string
          telegram_url: string | null
          total_players: number
          updated_at: string
          vk_url: string | null
          youtube_url: string | null
        }
        Insert: {
          discord_url?: string | null
          donate_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string
          launcher_url?: string | null
          minecraft_version?: string | null
          online_players?: number
          record_players?: number
          server_ip?: string | null
          server_name?: string
          site_id?: string
          status?: string
          telegram_url?: string | null
          total_players?: number
          updated_at?: string
          vk_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          discord_url?: string | null
          donate_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string
          launcher_url?: string | null
          minecraft_version?: string | null
          online_players?: number
          record_players?: number
          server_ip?: string | null
          server_name?: string
          site_id?: string
          status?: string
          telegram_url?: string | null
          total_players?: number
          updated_at?: string
          vk_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      user_activity_streaks: {
        Row: {
          current_streak: number
          last_active_date: string
          last_bumped_at: string
          last_streak_renewed_at: string
          streak_started_on: string
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak: number
          last_active_date: string
          last_bumped_at: string
          last_streak_renewed_at: string
          streak_started_on: string
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          last_active_date?: string
          last_bumped_at?: string
          last_streak_renewed_at?: string
          streak_started_on?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      marketplace_feed: {
        Row: {
          agency_created_at: string | null
          agency_sort_order: number | null
          category_id: number | null
          category_name: string | null
          category_slug: string | null
          created_at: string | null
          currency_code: string | null
          description: string | null
          effective_streak: number | null
          feed_group: number | null
          id: string | null
          image_url: string | null
          last_bumped_at: string | null
          last_streak_renewed_at: string | null
          listing_source:
            | Database["public"]["Enums"]["marketplace_listing_source"]
            | null
          minecraft_version: string | null
          platform: string | null
          price_amount: number | null
          price_text: string | null
          promoted_published_at: string | null
          promotion_eligible: boolean | null
          published_at: string | null
          seller_avatar_url: string | null
          seller_id: string | null
          seller_username: string | null
          short_description: string | null
          slug: string | null
          sort_order: number | null
          status:
            | Database["public"]["Enums"]["marketplace_listing_status"]
            | null
          title: string | null
          updated_at: string | null
          user_created_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_save_marketplace_listing: {
        Args: {
          _category_id: number
          _currency_code: string
          _description: string
          _image_url: string
          _listing_id: string
          _listing_source: Database["public"]["Enums"]["marketplace_listing_source"]
          _minecraft_version: string
          _platform: string
          _price_amount: number
          _price_text: string
          _short_description: string
          _sort_order: number
          _status: Database["public"]["Enums"]["marketplace_listing_status"]
          _title: string
        }
        Returns: string
      }
      consume_registration_attempt: {
        Args: { _key_hash: string; _limit: number }
        Returns: boolean
      }
      create_forum_reply: {
        Args: { _body: string; _topic_id: string }
        Returns: string
      }
      create_forum_topic: {
        Args: {
          _body: string
          _category_id: number
          _slug: string
          _title: string
        }
        Returns: string
      }
      create_marketplace_listing: {
        Args: {
          _category_id: number
          _currency_code: string
          _description: string
          _minecraft_version: string
          _platform: string
          _price_amount: number
          _short_description: string
          _slug: string
          _submit?: boolean
          _title: string
        }
        Returns: string
      }
      create_ncreate_forum_reply: {
        Args: { _body: string; _topic_id: string }
        Returns: string
      }
      create_ncreate_forum_topic: {
        Args: {
          _body: string
          _category_id: number
          _slug: string
          _title: string
        }
        Returns: string
      }
      get_deleted_content: {
        Args: { _kind?: string }
        Returns: {
          author_username: string
          content_type: string
          deleted_at: string
          deleted_by_username: string
          deletion_reason: string
          id: string
          storage_paths: string[]
          title: string
        }[]
      }
      get_strike_mode_status: {
        Args: never
        Returns: {
          current_streak: number
          last_active_date: string
          last_streak_renewed_at: string
          renewed_today: boolean
          streak_started_on: string
        }[]
      }
      owner_save_forum_topic: {
        Args: {
          _category_id: number
          _content: string
          _is_locked: boolean
          _is_pinned: boolean
          _is_protected: boolean
          _title: string
          _topic_id: string
        }
        Returns: string
      }
      owner_update_forum_post: {
        Args: { _body: string; _post_id: string }
        Returns: undefined
      }
      permanently_delete_content: {
        Args: { _id: string; _kind: string }
        Returns: undefined
      }
      record_daily_activity: {
        Args: never
        Returns: {
          current_streak: number
          last_active_date: string
          last_bumped_at: string
          streak_started_on: string
        }[]
      }
      renew_strike_mode: {
        Args: never
        Returns: {
          current_streak: number
          last_active_date: string
          last_streak_renewed_at: string
          renewed: boolean
          renewed_today: boolean
          streak_started_on: string
        }[]
      }
      restore_deleted_content: {
        Args: { _id: string; _kind: string }
        Returns: undefined
      }
      set_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      soft_delete_forum_post: {
        Args: { _post_id: string; _reason?: string }
        Returns: undefined
      }
      soft_delete_forum_topic: {
        Args: { _reason?: string; _topic_id: string }
        Returns: undefined
      }
      soft_delete_marketplace_listing: {
        Args: { _listing_id: string; _reason?: string }
        Returns: undefined
      }
      update_marketplace_listing: {
        Args: {
          _category_id: number
          _currency_code: string
          _description: string
          _listing_id: string
          _minecraft_version: string
          _platform: string
          _price_amount: number
          _short_description: string
          _submit?: boolean
          _title: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "user" | "moderator" | "admin" | "owner"
      marketplace_listing_source: "agency" | "user"
      marketplace_listing_status:
        | "draft"
        | "pending_review"
        | "published"
        | "archived"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["user", "moderator", "admin", "owner"],
      marketplace_listing_source: ["agency", "user"],
      marketplace_listing_status: [
        "draft",
        "pending_review",
        "published",
        "archived",
      ],
    },
  },
} as const

