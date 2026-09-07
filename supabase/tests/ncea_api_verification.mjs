import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const statePath = process.env.NCEA_TEST_STATE_FILE || "/tmp/ncea-api-verification.json";
const mode = process.argv[2] || "verify";
if (!url || !key) throw new Error("Public Supabase test variables are missing");

const client = () =>
  createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
const check = (condition, message) => {
  if (!condition) throw new Error(message);
};

if (
  mode === "setup" ||
  mode === "setup-edge" ||
  mode === "setup-unconfirmed" ||
  mode === "setup-direct"
) {
  const stamp = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const accounts = ["a", "b", "admin"].map((label) => ({
    label,
    username: `verify_${label}_${randomUUID().slice(0, 8)}`,
    email: `ncea.verification.${stamp}.${label}@gmail.com`,
    password: `${randomUUID()}Aa1!`,
  }));
  for (const account of accounts) {
    if (mode === "setup-direct") {
      account.id = randomUUID();
      account.immediateSession = false;
    } else if (mode === "setup-edge") {
      const testClient = client();
      const { error: registrationError } = await testClient.functions.invoke("register-account", {
        body: account,
        headers: { Origin: "https://www.ncea-studio.com" },
      });
      if (registrationError) {
        throw new Error(`Edge signup ${account.label}: ${registrationError.message}`);
      }
      const { data, error } = await testClient.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });
      if (error || !data.user || !data.session) {
        throw new Error(
          `Edge login ${account.label}: ${error?.message ?? "immediate session missing"}`,
        );
      }
      account.id = data.user.id;
      account.immediateSession = true;
    } else {
      const { data, error } = await client().auth.signUp({
        email: account.email,
        password: account.password,
        options: { data: { username: account.username } },
      });
      if (error || !data.user)
        throw new Error(
          `Auth signup ${account.label}: ${error?.message ?? "user was not created"}`,
        );
      account.id = data.user.id;
      account.immediateSession = Boolean(data.session);
    }
  }
  writeFileSync(statePath, JSON.stringify({ accounts }), { mode: 0o600 });
  if (mode === "setup" && accounts.some((account) => !account.immediateSession)) {
    throw new Error("Auth signup: immediate session missing");
  }
  process.stdout.write(`${accounts.map((account) => account.id).join("\n")}\n`);
  process.exit(0);
}

const state = JSON.parse(readFileSync(statePath, "utf8"));
const accounts = state.accounts;
check(Array.isArray(accounts) && accounts.length === 3, "Invalid API test state");
const clients = accounts.map(() => client());
for (let index = 0; index < clients.length; index += 1) {
  const { error } = await clients[index].auth.signInWithPassword({
    email: accounts[index].email,
    password: accounts[index].password,
  });
  if (error) throw new Error(`Auth login ${accounts[index].label}: ${error.message}`);
}
const [userA, userB, admin] = clients;
const [accountA, accountB, accountAdmin] = accounts;
const anonymous = client();

const { data: profileA } = await userA
  .from("profiles")
  .select("username")
  .eq("id", accountA.id)
  .single();
check(profileA?.username === accountA.username, "Signup metadata username was not persisted");
const { data: roleA } = await userA
  .from("user_roles")
  .select("role")
  .eq("user_id", accountA.id)
  .single();
check(roleA?.role === "user", "New account did not receive user role");
const { data: roleAdmin } = await admin
  .from("user_roles")
  .select("role")
  .eq("user_id", accountAdmin.id)
  .single();
check(roleAdmin?.role === "admin", "Admin canonical role verification failed");

const { data: forumCategory, error: forumCategoryError } = await anonymous
  .from("forum_categories")
  .select("id")
  .eq("slug", "general")
  .single();
if (forumCategoryError) throw forumCategoryError;
const suffix = randomUUID().slice(0, 8);
const topicSlug = `api-verification-${suffix}`;
const { error: guestTopicError } = await anonymous.rpc("create_forum_topic", {
  _category_id: forumCategory.id,
  _title: "Guest topic must fail",
  _slug: `guest-verification-${suffix}`,
  _body: "Guest write",
});
check(Boolean(guestTopicError), "Guest could create a forum topic");
const { data: topicId, error: topicError } = await userA.rpc("create_forum_topic", {
  _category_id: forumCategory.id,
  _title: "API verification topic",
  _slug: topicSlug,
  _body: "Original <script>plain text</script>",
});
if (topicError || !topicId) throw new Error(`Atomic topic creation failed: ${topicError?.message}`);
const { data: originalPosts } = await userA
  .from("forum_posts")
  .select("id,body")
  .eq("topic_id", topicId);
check(originalPosts?.length === 1, "Atomic topic did not create one original post");

const { data: publicTopic } = await anonymous
  .from("forum_topics")
  .select("id")
  .eq("id", topicId)
  .single();
check(publicTopic?.id === topicId, "Guest cannot read a public topic");
const { data: bTopicUpdate, error: bTopicUpdateError } = await userB
  .from("forum_topics")
  .update({ title: "Unauthorized" })
  .eq("id", topicId)
  .select();
check(!bTopicUpdateError && bTopicUpdate?.length === 0, "User B could update User A topic");
const { error: ownershipError } = await userA
  .from("forum_topics")
  .update({ author_id: accountB.id })
  .eq("id", topicId);
check(Boolean(ownershipError), "User A changed topic author_id to User B");

const { data: reply, error: replyError } = await userA
  .from("forum_posts")
  .insert({ topic_id: topicId, author_id: accountA.id, body: "Owner reply" })
  .select()
  .single();
if (replyError) throw replyError;
const { data: editedReply, error: editReplyError } = await userA
  .from("forum_posts")
  .update({ body: "Owner reply edited" })
  .eq("id", reply.id)
  .select("body")
  .single();
if (editReplyError || editedReply?.body !== "Owner reply edited") {
  throw new Error(`User A could not edit own reply: ${editReplyError?.message ?? "wrong body"}`);
}
const { data: bPostUpdate } = await userB
  .from("forum_posts")
  .update({ body: "Unauthorized" })
  .eq("id", reply.id)
  .select();
check(bPostUpdate?.length === 0, "User B could update User A post");
const { error: guestWriteError } = await anonymous
  .from("forum_posts")
  .insert({ topic_id: topicId, author_id: accountA.id, body: "Guest write" });
check(Boolean(guestWriteError), "Guest could write a forum post");

const { data: marketCategory, error: marketCategoryError } = await anonymous
  .from("marketplace_categories")
  .select("id")
  .eq("slug", "development")
  .single();
if (marketCategoryError) throw marketCategoryError;
const { error: guestListingError } = await anonymous.from("marketplace_listings").insert({
  category_id: marketCategory.id,
  seller_id: accountA.id,
  title: "Guest listing must fail",
  slug: `guest-verification-${suffix}`,
  description: "Guest write",
  currency_code: "EUR",
});
check(Boolean(guestListingError), "Guest could create a marketplace listing");
const { data: listing, error: listingError } = await userA
  .from("marketplace_listings")
  .insert({
    category_id: marketCategory.id,
    seller_id: accountA.id,
    title: "API verification listing",
    slug: `api-verification-${suffix}`,
    description: "Temporary verification listing",
    price_amount: 25,
    currency_code: "EUR",
  })
  .select()
  .single();
if (listingError) throw listingError;
const { data: editedListing, error: editListingError } = await userA
  .from("marketplace_listings")
  .update({ title: "API verification listing edited" })
  .eq("id", listing.id)
  .select("title")
  .single();
if (editListingError || editedListing?.title !== "API verification listing edited") {
  throw new Error(
    `User A could not edit own listing: ${editListingError?.message ?? "wrong title"}`,
  );
}
const { data: bListingUpdate, error: bListingUpdateError } = await userB
  .from("marketplace_listings")
  .update({ title: "Unauthorized" })
  .eq("id", listing.id)
  .select();
check(!bListingUpdateError && bListingUpdate?.length === 0, "User B could update User A listing");
const path = `${accountA.id}/${listing.id}/verification.png`;
const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
const { error: uploadError } = await userA.storage
  .from("marketplace-listings")
  .upload(path, png, { contentType: "image/png" });
if (uploadError) throw new Error(`Owner upload failed: ${uploadError.message}`);
const { data: image, error: imageError } = await userA
  .from("marketplace_listing_images")
  .insert({ listing_id: listing.id, storage_path: path })
  .select()
  .single();
if (imageError) throw imageError;

const { data: draftForB } = await userB
  .from("marketplace_listings")
  .select("id")
  .eq("id", listing.id);
check(draftForB?.length === 0, "User B can read User A draft listing");
await userB.storage.from("marketplace-listings").remove([path]);
const { data: ownerFiles } = await userA.storage
  .from("marketplace-listings")
  .list(`${accountA.id}/${listing.id}`);
check(
  ownerFiles?.some((file) => file.name === "verification.png"),
  "User B deleted User A image",
);
const { error: imageReassignError } = await userA
  .from("marketplace_listing_images")
  .update({ listing_id: randomUUID() })
  .eq("id", image.id);
check(Boolean(imageReassignError), "Owner reassigned listing image outside owned listing");

const { data: selfPublish, error: selfPublishError } = await userA
  .from("marketplace_listings")
  .update({ status: "published" })
  .eq("id", listing.id)
  .select();
check(Boolean(selfPublishError) || selfPublish?.length === 0, "Seller self-published listing");
const { error: publishError } = await admin
  .from("marketplace_listings")
  .update({ status: "published" })
  .eq("id", listing.id);
if (publishError) throw publishError;
const { data: publicListing } = await anonymous
  .from("marketplace_listings")
  .select("id")
  .eq("id", listing.id)
  .single();
check(publicListing?.id === listing.id, "Guest cannot read published listing");
const { error: downloadError } = await anonymous.storage
  .from("marketplace-listings")
  .download(path);
if (downloadError) throw new Error(`Guest cannot read published image: ${downloadError.message}`);

const { error: archiveError } = await userA
  .from("marketplace_listings")
  .update({ status: "archived" })
  .eq("id", listing.id);
if (archiveError)
  throw new Error(`Owner cannot archive published listing: ${archiveError.message}`);
const { error: republishError } = await admin
  .from("marketplace_listings")
  .update({ status: "published" })
  .eq("id", listing.id);
if (republishError) throw republishError;
const { error: lockError } = await admin
  .from("forum_topics")
  .update({ is_locked: true, is_pinned: true })
  .eq("id", topicId);
if (lockError) throw lockError;
const { error: lockedReplyError } = await userA
  .from("forum_posts")
  .insert({ topic_id: topicId, author_id: accountA.id, body: "Locked reply" });
check(Boolean(lockedReplyError), "User replied to a locked topic");

await admin.storage.from("marketplace-listings").remove([path]);
await admin.from("marketplace_listing_images").delete().eq("id", image.id);
await admin.from("marketplace_listings").delete().eq("id", listing.id);
await admin.from("forum_topics").delete().eq("id", topicId);

for (const testClient of clients) {
  const { error } = await testClient.auth.signOut();
  if (error) throw error;
  const { data } = await testClient.auth.getSession();
  check(data.session === null, "Logout did not clear the client session");
}

process.stdout.write(`NCEA API verification passed for Guest/User A/User B/Admin.\n`);
