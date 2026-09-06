import type { Tables } from "./database.types";

export type AppRole = "user" | "moderator" | "admin";
export type ListingStatus = "draft" | "published" | "archived";
export type Profile = Tables<"profiles">;
export type UserRole = Tables<"user_roles">;
export type ForumCategory = Tables<"forum_categories">;
export type ForumTopic = Tables<"forum_topics">;
export type ForumPost = Tables<"forum_posts">;
export type MarketplaceCategory = Tables<"marketplace_categories">;
export type MarketplaceListing = Tables<"marketplace_listings">;

export type AdminUser = Profile & { role: AppRole };
export type TopicView = ForumTopic & { author: string; category: string };
export type PostView = ForumPost & { author: string; topic: string };
export type ListingView = MarketplaceListing & { seller: string; category: string };

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
