import { useState, type FormEvent } from "react";
import { Edit3, Lock, Pin, PinOff, Plus, Unlock } from "lucide-react";
import {
  deletePost,
  deleteTopic,
  getForumCategories,
  getPosts,
  getTopics,
  saveForumCategory,
  updateTopic,
} from "../lib/data";
import type { ForumCategory } from "../lib/types";
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

type Tab = "categories" | "topics" | "posts";

export function ForumPage() {
  const [tab, setTab] = useState<Tab>("categories");
  const categories = useAsync(getForumCategories);
  const topics = useAsync(getTopics);
  const posts = useAsync(getPosts);
  const [editing, setEditing] = useState<ForumCategory | "new" | null>(null);
  const [actionError, setActionError] = useState("");

  const perform = async (action: () => Promise<void>, reload: () => Promise<void>) => {
    setActionError("");
    try {
      await action();
      await reload();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Action failed.");
    }
  };

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const current = editing === "new" ? null : editing;
    await perform(
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
    setEditing(null);
  };

  const current = tab === "categories" ? categories : tab === "topics" ? topics : posts;
  return (
    <>
      <PageHeader
        title="Forum"
        description="Categories, topics and post moderation."
        action={
          tab === "categories" ? (
            <Button onClick={() => setEditing("new")}>
              <Plus size={17} /> New category
            </Button>
          ) : undefined
        }
      />
      <div className="tabs" role="tablist">
        {(["categories", "topics", "posts"] as Tab[]).map((item) => (
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
                        {!item.is_pinned && !item.is_locked && <Badge>open</Badge>}
                      </div>
                    </td>
                    <td>
                      <div className="action-row">
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
                      <ConfirmButton
                        confirmLabel="Remove this post?"
                        onConfirm={() => perform(() => deletePost(item.id), posts.reload)}
                      >
                        Moderate
                      </ConfirmButton>
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
    </>
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
