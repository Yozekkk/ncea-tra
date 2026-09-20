import { useState, type FormEvent } from "react";
import { Edit3, Lock, Pin, PinOff, Plus, Unlock } from "lucide-react";
import {
  deletePost,
  deleteTopic,
  getForumCategories,
  getForumTopicContent,
  getPosts,
  getTopics,
  saveForumCategory,
  saveOwnerForumTopic,
  updateOwnerForumPost,
  updateTopic,
} from "../lib/data";
import type { ForumCategory, PostView, TopicView } from "../lib/types";
import { formatDate } from "../lib/format";
import { useAsync } from "../lib/useAsync";
import {
  Badge,
  Button,
  ConfirmButton,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Modal,
  PageHeader,
} from "../components/ui";
import { useAdminAccess } from "../components/AdminAccess";
import { UrlImagePreview } from "../components/UrlImagePreview";
import { isSafeHttpUrl, normalizeOptionalText } from "../lib/validation";

type Tab = "categories" | "topics" | "posts";

export function ForumPage() {
  const { role } = useAdminAccess();
  const isAdmin = role === "admin" || role === "owner";
  const isOwner = role === "owner";
  const [tab, setTab] = useState<Tab>(isAdmin ? "categories" : "topics");
  const categories = useAsync(getForumCategories);
  const topics = useAsync(getTopics);
  const posts = useAsync(getPosts);
  const [editing, setEditing] = useState<ForumCategory | "new" | null>(null);
  const [editingTopic, setEditingTopic] = useState<{
    item: TopicView | null;
    content: string;
  } | null>(null);
  const [editingPost, setEditingPost] = useState<PostView | null>(null);
  const [actionError, setActionError] = useState("");

  const perform = async (action: () => Promise<void>, reload: () => Promise<void>) => {
    setActionError("");
    try {
      await action();
      await reload();
      return true;
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Action failed.");
      return false;
    }
  };

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const current = editing === "new" ? null : editing;
    const saved = await perform(
      () =>
        saveForumCategory(current?.id ?? null, {
          name: String(form.get("name")),
          slug: String(form.get("slug")),
          description: String(form.get("description")) || null,
          sort_order: Number(form.get("sort_order")),
          is_active: form.get("is_active") === "on",
        }),
      categories.reload,
    );
    if (saved) setEditing(null);
  };

  const openTopicEditor = async (item: TopicView | null) => {
    setActionError("");
    try {
      setEditingTopic({ item, content: item ? await getForumTopicContent(item.id) : "" });
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Could not open topic editor.");
    }
  };

  const submitTopic = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item = editingTopic?.item;
    const imageUrl = normalizeOptionalText(form.get("image_url"));
    if (imageUrl && !isSafeHttpUrl(imageUrl)) {
      setActionError("Cover URL must be a valid http/https URL without markup or credentials.");
      return;
    }
    const saved = await perform(
      () =>
        saveOwnerForumTopic(item?.id ?? null, {
          category_id: Number(form.get("category_id")),
          title: String(form.get("title")),
          content: String(form.get("content")),
          is_pinned: form.get("is_pinned") === "on",
          is_locked: form.get("is_locked") === "on",
          is_protected: form.get("is_protected") === "on",
          image_url: imageUrl,
        }),
      topics.reload,
    );
    if (saved) {
      setEditingTopic(null);
      await posts.reload();
    }
  };

  const submitPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPost) return;
    const form = new FormData(event.currentTarget);
    const saved = await perform(
      () => updateOwnerForumPost(editingPost.id, String(form.get("body"))),
      posts.reload,
    );
    if (saved) setEditingPost(null);
  };

  const current = tab === "categories" ? categories : tab === "topics" ? topics : posts;
  return (
    <>
      <PageHeader
        title="Forum"
        description="Categories, topics and post moderation."
        action={
          tab === "categories" && isAdmin ? (
            <Button onClick={() => setEditing("new")}>
              <Plus size={17} /> New category
            </Button>
          ) : tab === "topics" && isAdmin ? (
            <Button onClick={() => void openTopicEditor(null)}>
              <Plus size={17} /> Новая тема
            </Button>
          ) : undefined
        }
      />
      <div className="tabs" role="tablist">
        {(isAdmin
          ? (["categories", "topics", "posts"] as Tab[])
          : (["topics", "posts"] as Tab[])
        ).map((item) => (
          <button
            role="tab"
            aria-selected={tab === item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      {actionError && <ErrorState message={actionError} />}
      {current.loading && <LoadingState />}
      {current.error && <ErrorState message={current.error} retry={current.reload} />}
      {tab === "categories" &&
        categories.data &&
        (categories.data.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Slug</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.data.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <small>{item.description || "No description"}</small>
                    </td>
                    <td className="mono">{item.slug}</td>
                    <td>{item.sort_order}</td>
                    <td>
                      <Badge tone={item.is_active ? "live" : "muted"}>
                        {item.is_active ? "active" : "inactive"}
                      </Badge>
                    </td>
                    <td>
                      <IconButton aria-label={`Edit ${item.name}`} onClick={() => setEditing(item)}>
                        <Edit3 size={17} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No forum categories"
            detail="Create the first category to prepare the forum."
          />
        ))}
      {tab === "topics" &&
        topics.data &&
        (topics.data.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Author</th>
                  <th>Created</th>
                  <th>State</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topics.data.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.title}</strong>
                      <small>{item.category}</small>
                    </td>
                    <td>@{item.author}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                      <div className="badge-row">
                        {item.is_pinned && <Badge tone="live">pinned</Badge>}
                        {item.is_locked && <Badge tone="warning">locked</Badge>}
                        {item.is_protected && <Badge tone="muted">protected</Badge>}
                        {!item.is_pinned && !item.is_locked && !item.is_protected && (
                          <Badge>open</Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      {item.is_protected && !isAdmin ? (
                        <Badge tone="muted">protected</Badge>
                      ) : (
                        <div className="action-row">
                          {isAdmin ? (
                            <IconButton
                              aria-label={`Edit ${item.title}`}
                              onClick={() => void openTopicEditor(item)}
                            >
                              <Edit3 size={17} />
                            </IconButton>
                          ) : null}
                          <IconButton
                            aria-label={item.is_pinned ? "Unpin topic" : "Pin topic"}
                            onClick={() =>
                              void perform(
                                () => updateTopic(item.id, { is_pinned: !item.is_pinned }),
                                topics.reload,
                              )
                            }
                          >
                            {item.is_pinned ? <PinOff size={17} /> : <Pin size={17} />}
                          </IconButton>
                          <IconButton
                            aria-label={item.is_locked ? "Unlock topic" : "Lock topic"}
                            onClick={() =>
                              void perform(
                                () => updateTopic(item.id, { is_locked: !item.is_locked }),
                                topics.reload,
                              )
                            }
                          >
                            {item.is_locked ? <Unlock size={17} /> : <Lock size={17} />}
                          </IconButton>
                          <ConfirmButton
                            confirmLabel={`Delete topic “${item.title}” and all of its posts?`}
                            onConfirm={() => perform(() => deleteTopic(item.id), topics.reload)}
                          >
                            Delete
                          </ConfirmButton>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No forum topics"
            detail="Topics created by members will appear here."
          />
        ))}
      {tab === "posts" &&
        posts.data &&
        (posts.data.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Post</th>
                  <th>Author</th>
                  <th>Topic</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {posts.data.map((item) => (
                  <tr key={item.id}>
                    <td className="post-preview">{item.body}</td>
                    <td>@{item.author}</td>
                    <td>{item.topic}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                      {item.is_protected && !isOwner ? (
                        <Badge tone="muted">protected</Badge>
                      ) : (
                        <div className="action-row">
                          {isOwner ? (
                            <IconButton aria-label="Edit post" onClick={() => setEditingPost(item)}>
                              <Edit3 size={17} />
                            </IconButton>
                          ) : null}
                          <ConfirmButton
                            confirmLabel="Move this post to trash?"
                            onConfirm={() => perform(() => deletePost(item.id), posts.reload)}
                          >
                            Moderate
                          </ConfirmButton>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No forum posts" detail="Member posts will appear here." />
        ))}
      {editing && (
        <Modal
          title={editing === "new" ? "New forum category" : "Edit forum category"}
          onClose={() => setEditing(null)}
        >
          <CategoryForm item={editing === "new" ? null : editing} onSubmit={submitCategory} />
        </Modal>
      )}
      {editingTopic && (
        <Modal
          title={editingTopic.item ? "Редактировать тему" : "Новая тема"}
          onClose={() => setEditingTopic(null)}
          wide
        >
          <TopicForm
            item={editingTopic.item}
            content={editingTopic.content}
            categories={categories.data ?? []}
            onSubmit={submitTopic}
          />
        </Modal>
      )}
      {editingPost && (
        <Modal title="Редактировать сообщение" onClose={() => setEditingPost(null)} wide>
          <form className="dialog-form" onSubmit={submitPost}>
            <label>
              Содержимое
              <textarea
                name="body"
                defaultValue={editingPost.body}
                minLength={1}
                maxLength={20000}
                rows={10}
                required
              />
            </label>
            <Button type="submit">Сохранить сообщение</Button>
          </form>
        </Modal>
      )}
    </>
  );
}

function TopicForm({
  item,
  content,
  categories,
  onSubmit,
}: {
  item: TopicView | null;
  content: string;
  categories: ForumCategory[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? "");
  const invalidImage = Boolean(imageUrl && !isSafeHttpUrl(imageUrl));
  return (
    <form className="dialog-form" onSubmit={onSubmit} autoComplete="off">
      <label>
        Название
        <input
          name="title"
          defaultValue={item?.title ?? ""}
          minLength={3}
          maxLength={180}
          required
        />
      </label>
      <label>
        Категория
        <select name="category_id" defaultValue={item?.category_id ?? categories[0]?.id} required>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Содержимое
        <textarea
          name="content"
          defaultValue={content}
          minLength={1}
          maxLength={20000}
          rows={12}
          required
        />
      </label>
      <label>
        URL обложки
        <input
          name="image_url"
          type="url"
          inputMode="url"
          placeholder="https://example.com/forum-cover.webp"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          maxLength={2048}
        />
        {invalidImage ? (
          <span className="field-error" role="alert">
            Допустим только безопасный прямой http/https URL.
          </span>
        ) : null}
      </label>
      <UrlImagePreview url={imageUrl} alt="Предпросмотр обложки темы" />
      <div className="dialog-checks">
        <label className="check-label">
          <input name="is_pinned" type="checkbox" defaultChecked={item?.is_pinned ?? false} />{" "}
          Закреплена
        </label>
        <label className="check-label">
          <input name="is_locked" type="checkbox" defaultChecked={item?.is_locked ?? false} />{" "}
          Закрыта
        </label>
        <label className="check-label">
          <input name="is_protected" type="checkbox" defaultChecked={item?.is_protected ?? true} />{" "}
          Официальная NCEA
        </label>
      </div>
      <Button type="submit" disabled={invalidImage}>
        Сохранить тему
      </Button>
    </form>
  );
}

function CategoryForm({
  item,
  onSubmit,
}: {
  item: ForumCategory | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="dialog-form" onSubmit={onSubmit}>
      <label>
        Name
        <input name="name" defaultValue={item?.name} required minLength={1} maxLength={80} />
      </label>
      <label>
        Slug
        <input name="slug" defaultValue={item?.slug} required pattern="[a-z0-9-]+" />
      </label>
      <label>
        Description
        <textarea
          name="description"
          defaultValue={item?.description ?? ""}
          maxLength={280}
          rows={3}
        />
      </label>
      <label>
        Sort order
        <input name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} required />
      </label>
      <label className="check-label">
        <input name="is_active" type="checkbox" defaultChecked={item?.is_active ?? true} /> Active
      </label>
      <Button type="submit">Save category</Button>
    </form>
  );
}
