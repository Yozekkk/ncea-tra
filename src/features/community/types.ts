export type AppRole = "user" | "moderator" | "admin";
export type ListingStatus = "draft" | "pending_review" | "published" | "archived";
export type ListingSource = "agency" | "user";

export interface ActivityStreak {
  current_streak: number;
  last_active_date: string | null;
  streak_started_on: string | null;
  last_streak_renewed_at: string | null;
  renewed_today: boolean;
}

export interface StreakRenewalResult extends ActivityStreak {
  renewed: boolean;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface ForumCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ForumTopic {
  id: string;
  category_id: number;
  author_id: string;
  title: string;
  slug: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_protected: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, "username" | "avatar_url"> | null;
  forum_categories?: Pick<ForumCategory, "name" | "slug"> | null;
  forum_posts?: Array<{ count: number }>;
}

export interface ForumPost {
  id: string;
  topic_id: string;
  author_id: string;
  body: string;
  is_protected: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, "username" | "avatar_url"> | null;
}

export type MarketplaceCategory = ForumCategory;

export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
  signed_url?: string;
}

export interface MarketplaceListing {
  id: string;
  category_id: number;
  seller_id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  price_amount: number | null;
  currency_code: string;
  minecraft_version: string | null;
  platform: string | null;
  status: ListingStatus;
  listing_source: ListingSource;
  sort_order: number | null;
  submitted_at: string | null;
  published_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  effective_streak?: number;
  promotion_eligible?: boolean;
  last_bumped_at?: string | null;
  last_streak_renewed_at?: string | null;
  profiles?: Pick<Profile, "username" | "avatar_url"> | null;
  marketplace_categories?: Pick<MarketplaceCategory, "name" | "slug"> | null;
  marketplace_listing_images?: ListingImage[];
}
