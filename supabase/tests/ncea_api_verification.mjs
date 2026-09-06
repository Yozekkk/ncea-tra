import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("Public Supabase test variables are missing");

const stamp = Date.now();
const credentials = ["a", "b", "admin"].map((label) => ({
  label,
  email:
    process.env[`NCEA_TEST_EMAIL_${label.toUpperCase()}`] ||
    `ncea.verification.${stamp}.${label}@gmail.com`,
  password: process.env[`NCEA_TEST_PASSWORD_${label.toUpperCase()}`] || `${randomUUID()}Aa1!`,
}));

const clients = credentials.map(() =>
  createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  }),
);

const providedIds = process.env.NCEA_TEST_USER_IDS?.split(",").filter(Boolean);
const ids = providedIds?.length === 3 ? providedIds : [];
if (!ids.length) {
  for (let index = 0; index < clients.length; index += 1) {
    const { data, error } = await clients[index].auth.signUp(credentials[index]);
    if (error || !data.user)
      throw new Error(`Auth signup ${credentials[index].label}: ${error?.message}`);
    ids.push(data.user.id);
  }
  console.log(`TEST_USERS=${ids.join(",")}`);
  throw new Error("Confirm temporary users and rerun with their IDs and credentials.");
}

for (let index = 0; index < clients.length; index += 1) {
  const { error } = await clients[index].auth.signInWithPassword(credentials[index]);
  if (error) throw new Error(`Auth login ${credentials[index].label}: ${error.message}`);
}
const [userA, userB, admin] = clients;
const [userAId] = ids;

const { data: role, error: roleError } = await admin
  .from("user_roles")
  .select("role")
  .eq("user_id", ids[2])
  .single();
if (roleError || role.role !== "admin") throw new Error("Admin canonical role verification failed");

const suffix = randomUUID().slice(0, 8);
const { data: forumCategory, error: forumCategoryError } = await admin
  .from("forum_categories")
  .insert({
    name: "API verification",
    slug: `api-verification-${suffix}`,
    is_active: true,
    sort_order: 9999,
  })
  .select()
  .single();
if (forumCategoryError) throw forumCategoryError;
const { data: marketCategory, error: marketCategoryError } = await admin
  .from("marketplace_categories")
  .insert({
    name: "API verification",
    slug: `api-verification-${suffix}`,
    is_active: true,
    sort_order: 9999,
  })
  .select()
  .single();
if (marketCategoryError) throw marketCategoryError;

const { data: topic, error: topicError } = await userA
  .from("forum_topics")
  .insert({
    category_id: forumCategory.id,
    author_id: userAId,
    title: "API verification topic",
    slug: `api-verification-${suffix}`,
  })
  .select()
  .single();
if (topicError) throw topicError;
const { data: post, error: postError } = await userA
  .from("forum_posts")
  .insert({
    topic_id: topic.id,
    author_id: userAId,
    body: "API verification post",
  })
  .select()
  .single();
if (postError) throw postError;

const { data: visibleTopic, error: visibleTopicError } = await userB
  .from("forum_topics")
  .select("id")
  .eq("id", topic.id)
  .single();
if (visibleTopicError || visibleTopic.id !== topic.id)
  throw new Error("User B cannot read User A public topic");
const { data: changedTopic, error: changedTopicError } = await userB
  .from("forum_topics")
  .update({ title: "Unauthorized" })
  .eq("id", topic.id)
  .select();
if (changedTopicError || changedTopic.length !== 0)
  throw new Error("User B could update User A topic");

const { data: listing, error: listingError } = await userA
  .from("marketplace_listings")
  .insert({
    category_id: marketCategory.id,
    seller_id: userAId,
    title: "API verification listing",
    slug: `api-verification-${suffix}`,
    description: "Temporary verification listing",
    price_amount: 25,
    currency_code: "EUR",
  })
  .select()
  .single();
if (listingError) throw listingError;
const path = `${userAId}/${listing.id}/verification.png`;
const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
const { error: uploadError } = await userA.storage
  .from("marketplace-listings")
  .upload(path, png, { contentType: "image/png" });
if (uploadError) throw new Error(`Owner upload failed: ${uploadError.message}`);
const { error: imageError } = await userA
  .from("marketplace_listing_images")
  .insert({ listing_id: listing.id, storage_path: path });
if (imageError) throw imageError;

const { data: draftForB, error: draftForBError } = await userB
  .from("marketplace_listings")
  .select("id")
  .eq("id", listing.id);
if (draftForBError || draftForB.length !== 0)
  throw new Error("User B can read User A draft listing");
await userB.storage.from("marketplace-listings").remove([path]);
const { data: ownerFiles, error: ownerFilesError } = await userA.storage
  .from("marketplace-listings")
  .list(`${userAId}/${listing.id}`);
if (ownerFilesError || !ownerFiles.some((file) => file.name === "verification.png"))
  throw new Error("User B deleted User A image");

const { data: selfPublish } = await userA
  .from("marketplace_listings")
  .update({ status: "published" })
  .eq("id", listing.id)
  .select();
if (selfPublish?.length) throw new Error("Seller self-published a listing");
const { error: publishError } = await admin
  .from("marketplace_listings")
  .update({ status: "published" })
  .eq("id", listing.id);
if (publishError) throw publishError;

const anonymous = createClient(url, key, { auth: { persistSession: false } });
const { data: publicListing, error: publicListingError } = await anonymous
  .from("marketplace_listings")
  .select("id")
  .eq("id", listing.id)
  .single();
if (publicListingError || publicListing.id !== listing.id)
  throw new Error("Anonymous cannot read published listing");
const { error: downloadError } = await anonymous.storage
  .from("marketplace-listings")
  .download(path);
if (downloadError)
  throw new Error(`Anonymous cannot read published image: ${downloadError.message}`);

const { error: lockError } = await admin
  .from("forum_topics")
  .update({ is_locked: true, is_pinned: true })
  .eq("id", topic.id);
if (lockError) throw lockError;
const { error: moderateError } = await admin.from("forum_posts").delete().eq("id", post.id);
if (moderateError) throw moderateError;
const { error: archiveError } = await admin
  .from("marketplace_listings")
  .update({ status: "archived" })
  .eq("id", listing.id);
if (archiveError) throw archiveError;

await admin.storage.from("marketplace-listings").remove([path]);
await admin.from("forum_topics").delete().eq("id", topic.id);
await admin.from("marketplace_listings").delete().eq("id", listing.id);
await admin.from("forum_categories").delete().eq("id", forumCategory.id);
await admin.from("marketplace_categories").delete().eq("id", marketCategory.id);

console.log("NCEA API verification passed: Auth, roles, forum, marketplace and Storage.");
