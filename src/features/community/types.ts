export type AppRole = "user" | "moderator" | "admin";
export type ListingStatus = "draft" | "published" | "archived";

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
  description: string;
  price_amount: number | null;
  currency_code: string;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, "username" | "avatar_url"> | null;
  marketplace_categories?: Pick<MarketplaceCategory, "name" | "slug"> | null;
  marketplace_listing_images?: ListingImage[];
}
