import type { Tables } from "./database.types";

export type AppRole = "user" | "moderator" | "admin" | "owner";
export type StaffRole = "moderator" | "admin" | "owner";
export type ListingStatus = "draft" | "pending_review" | "published" | "archived";
export type Profile = Tables<"profiles">;
export type UserRole = Tables<"user_roles">;
export type ForumCategory = Tables<"forum_categories">;
export type ForumTopic = Tables<"forum_topics">;
export type ForumPost = Tables<"forum_posts">;
export type MarketplaceCategory = Tables<"marketplace_categories">;
export type MarketplaceListing = Tables<"marketplace_listings">;
export type NCreateSettings = Tables<"ncreate_site_settings">;
export type NCreateSection = Tables<"ncreate_home_sections">;
export type NCreateCard = Tables<"ncreate_home_cards">;
export type NCreateForumCategory = Tables<"ncreate_forum_categories">;
export type NCreateForumTopic = Tables<"ncreate_forum_topics">;
export type NCreateForumPost = Tables<"ncreate_forum_posts">;

export type AdminUser = Profile & { role: AppRole };
export type TopicView = ForumTopic & { author: string; category: string };
export type PostView = ForumPost & { author: string; topic: string };
export type ListingView = MarketplaceListing & { seller: string; category: string };
export type NCreateTopicView = NCreateForumTopic & { author: string; category: string };
export type NCreatePostView = NCreateForumPost & { author: string; topic: string };
export type AdminWorkspace = "ncea" | "ncreate";
export type DeletedContentType = "marketplace" | "topics" | "posts";
export interface DeletedItem {
  content_type: DeletedContentType;
  id: string;
  title: string;
  author_username: string;
  deleted_by_username: string | null;
  deleted_at: string;
  deletion_reason: string | null;
  storage_paths: string[];
}

export interface MarketplaceEditorValues {
  category_id: number;
  title: string;
  short_description: string;
  description: string;
  listing_source: "agency" | "user";
  image_url: string | null;
  price_amount: number | null;
  price_text: string | null;
  currency_code: string;
  minecraft_version: string | null;
  platform: string | null;
  sort_order: number | null;
  status: ListingStatus;
}

export interface ForumTopicEditorValues {
  category_id: number;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_protected: boolean;
}

export interface DashboardData {
  counts: {
    users: number;
    topics: number;
    posts: number;
    listings: number;
    published: number;
  };
  users: AdminUser[];
  topics: TopicView[];
  listings: ListingView[];
}
