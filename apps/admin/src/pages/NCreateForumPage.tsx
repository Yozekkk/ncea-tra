import { NCreateTrash } from "./NCreateTrash";
import { CollectionTools } from "../components/CollectionTools";
import { useMutation } from "../lib/useMutation";
import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Edit3, Lock, Pin, PinOff, Plus, Trash2, Unlock } from "lucide-react";
import { useAdminAccess } from "../components/AdminAccess";
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
import { categorySlug, formatDate } from "../lib/format";
import {
  deleteNCreateCategory,
  deleteNCreatePost,
  deleteNCreateTopic,
  getNCreateCategories,
  getNCreatePosts,
  getNCreateTopics,
  reorderNCreateCategories,
  saveNCreateCategory,
  updateNCreatePost,
  updateNCreateTopic,
} from "../lib/ncreate-data";
import type { NCreateForumCategory, NCreatePostView } from "../lib/types";
import { useAsync } from "../lib/useAsync";

type Tab = "categories" | "topics" | "posts" | "deleted";

export function NCreateForumPage() {
  const { role } = useAdminAccess();
  const canManageCategories = role === "admin" || role === "owner";
  const [tab, setTab] = useState<Tab>(canManageCategories ? "categories" : "topics");
  const categories = useAsync(getNCreateCategories);
  const topics = useAsync(getNCreateTopics);
  const posts = useAsync(getNCreatePosts);
  const [editingCategory, setEditingCategory] = useState<NCreateForumCategory | "new" | null>(null);
  const [editingPost, setEditingPost] = useState<NCreatePostView | null>(null);

  const mutation = useMutation();
  const perform = mutation.perform;

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item = editingCategory === "new" ? null : editingCategory;
    const name = String(form.get("name")).trim();
    const slug = String(form.get("slug")).trim() || categorySlug(name);
    const saved = await perform(
      () =>
        saveNCreateCategory(item?.id ?? null, {
          name,
          slug,
          description: String(form.get("description")).trim() || null,
          sort_order: Number(form.get("sort_order")),
          is_active: form.get("is_active") === "on",
        }),
      categories.reload,
    );
    if (saved) setEditingCategory(null);
  };
  const submitPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPost) return;
    const body = String(new FormData(event.currentTarget).get("body")).trim();
    const saved = await perform(() => updateNCreatePost(editingPost.id, { body }), posts.reload);
    if (saved) setEditingPost(null);
  };
  const current = tab === "categories" ? categories : tab === "topics" ? topics : posts;
  return (
    <>
      <PageHeader
        controlLabel="NCREATE CONTROL"
        title="Forum"
        description="Категории, темы и ответы только форума NCreate."
        action={
          tab === "categories" && canManageCategories ? (
            <Button onClick={() => setEditingCategory("new")}>
              <Plus size={17} />
              Новая категория
            </Button>
          ) : undefined
        }
      />
      <div className="tabs" role="tablist">
        {(canManageCategories ? ["categories", "topics", "posts", "deleted"] : ["topics", "posts", "deleted"]).map(
          (item) => (
            <button
              role="tab"
              aria-selected={tab === item}
              className={tab === item ? "active" : ""}
              onClick={() => setTab(item as Tab)}
              key={item}
            >
              {item}
            </button>
          ),
        )}
      </div>
      {mutation.error && <ErrorState message={mutation.error} />}
      {mutation.message && (
        <div className="success-state" role="status">
          {mutation.message}
        </div>
      )}
      {current.loading && <LoadingState />}
      {current.error && <ErrorState message={current.error} retry={current.reload} />}
      {tab === "deleted" && <NCreateTrash />}
      {tab === "categories" &&
        categories.data &&
        (categories.data.length ? (
          <CollectionTools rows={categories.data} text={(item) => `${item.name} ${item.slug}`}>
            {(visible) => (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Категория</th>
                      <th>Slug</th>
                      <th>Порядок</th>
                      <th>Статус</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((item, index) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                          <small>{item.description ?? "Без описания"}</small>
                        </td>
                        <td className="mono">{item.slug}</td>
                        <td>{item.sort_order}</td>
                        <td>
                          <Badge tone={item.is_active ? "live" : "muted"}>
                            {item.is_active ? "отображается" : "скрыта"}
                          </Badge>
                        </td>
                        <td>
                          <div className="action-row">
                            <IconButton
                              aria-label={`Поднять ${item.name}`}
                              disabled={mutation.busy || index === 0}
                              onClick={() => {
                                const ids = categories.data!.map((category) => category.id);
                                [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
                                void perform(
                                  () => reorderNCreateCategories(ids),
                                  categories.reload,
                                );
                              }}
                            >
                              <ArrowUp size={17} />
                            </IconButton>
                            <IconButton
                              aria-label={`Опустить ${item.name}`}
                              disabled={mutation.busy || index === categories.data!.length - 1}
                              onClick={() => {
                                const ids = categories.data!.map((category) => category.id);
                                [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
                                void perform(
                                  () => reorderNCreateCategories(ids),
                                  categories.reload,
                                );
                              }}
                            >
                              <ArrowDown size={17} />
                            </IconButton>
                            <IconButton
                              disabled={mutation.busy}
                              aria-label={`Редактировать ${item.name}`}
                              onClick={() => setEditingCategory(item)}
                            >
                              <Edit3 size={17} />
                            </IconButton>
                            <ConfirmButton
                              disabled={mutation.busy}
                              confirmLabel={`Удалить категорию «${item.name}»? Это действие нельзя отменить.`}
                              onConfirm={() =>
                                perform(() => deleteNCreateCategory(item.id), categories.reload)
                              }
                            >
                              <Trash2 size={15} />
                            </ConfirmButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollectionTools>
        ) : (
          <EmptyState
            title="Категорий пока нет"
            detail="Создайте первую категорию без фиктивных тем."
          />
        ))}
      {tab === "topics" &&
        topics.data &&
        (topics.data.length ? (
          <CollectionTools
            rows={topics.data}
            text={(item) => `${item.title} ${item.author} ${item.category}`}
          >
            {(visible) => (
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
                    {visible.map((item) => (
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
                              disabled={mutation.busy}
                              aria-label={item.is_pinned ? "Unpin" : "Pin"}
                              onClick={() =>
                                void perform(
                                  () => updateNCreateTopic(item.id, { is_pinned: !item.is_pinned }),
                                  topics.reload,
                                )
                              }
                            >
                              {item.is_pinned ? <PinOff size={17} /> : <Pin size={17} />}
                            </IconButton>
                            <IconButton
                              disabled={mutation.busy}
                              aria-label={item.is_locked ? "Unlock" : "Lock"}
                              onClick={() =>
                                void perform(
                                  () => updateNCreateTopic(item.id, { is_locked: !item.is_locked }),
                                  topics.reload,
                                )
                              }
                            >
                              {item.is_locked ? <Unlock size={17} /> : <Lock size={17} />}
                            </IconButton>
                            <ConfirmButton
                              disabled={mutation.busy}
                              confirmLabel="Скрыть тему NCreate?"
                              onConfirm={() =>
                                perform(() => deleteNCreateTopic(item.id), topics.reload)
                              }
                            >
                              <Trash2 size={15} />
                            </ConfirmButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollectionTools>
        ) : (
          <EmptyState
            title="Тем пока нет"
            detail="Пользователи смогут создать темы после появления категорий."
          />
        ))}
      {tab === "posts" &&
        posts.data &&
        (posts.data.length ? (
          <CollectionTools
            rows={posts.data}
            text={(item) => `${item.body} ${item.author} ${item.topic}`}
          >
            {(visible) => (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Post</th>
                      <th>Topic</th>
                      <th>Author</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((item) => (
                      <tr key={item.id}>
                        <td className="truncate-cell">{item.body}</td>
                        <td>{item.topic}</td>
                        <td>@{item.author}</td>
                        <td>{formatDate(item.created_at)}</td>
                        <td>
                          <div className="action-row">
                            <IconButton
                              disabled={mutation.busy}
                              aria-label="Edit post"
                              onClick={() => setEditingPost(item)}
                            >
                              <Edit3 size={17} />
                            </IconButton>
                            <ConfirmButton
                              disabled={mutation.busy}
                              confirmLabel="Скрыть ответ NCreate?"
                              onConfirm={() =>
                                perform(() => deleteNCreatePost(item.id), posts.reload)
                              }
                            >
                              <Trash2 size={15} />
                            </ConfirmButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollectionTools>
        ) : (
          <EmptyState title="Ответов пока нет" detail="Скоро будет" />
        ))}
      {editingCategory && (
        <Modal
          title={editingCategory === "new" ? "Новая категория NCreate" : "Редактировать категорию"}
          onClose={() => setEditingCategory(null)}
        >
          <CategoryForm item={editingCategory} onSubmit={submitCategory} />
        </Modal>
      )}
      {editingPost && (
        <Modal title="Редактировать ответ NCreate" onClose={() => setEditingPost(null)} wide>
          <form className="modal-form" onSubmit={(event) => void submitPost(event)}>
            <label>
              <span>Body</span>
              <textarea name="body" rows={12} defaultValue={editingPost.body} required />
            </label>
            <Button type="submit" disabled={mutation.busy}>
              Сохранить
            </Button>
          </form>
        </Modal>
      )}
    </>
  );
}

function CategoryForm({
  item,
  onSubmit,
}: {
  item: NCreateForumCategory | "new";
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [name, setName] = useState(item === "new" ? "" : item.name);
  const [slug, setSlug] = useState(item === "new" ? "" : item.slug);
  const [slugEdited, setSlugEdited] = useState(item !== "new");
  return (
    <form className="modal-form" onSubmit={onSubmit}>
      <label>
        <span>Название</span>
        <input
          name="name"
          value={name}
          onChange={(event) => {
            const next = event.target.value;
            setName(next);
            if (!slugEdited) setSlug(categorySlug(next));
          }}
          required
        />
      </label>
      <label>
        <span>Slug</span>
        <input
          name="slug"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value.toLowerCase());
            setSlugEdited(true);
          }}
          placeholder="sozdaetsya-iz-nazvaniya"
          required
        />
      </label>
      <label>
        <span>Описание</span>
        <textarea
          name="description"
          defaultValue={item === "new" ? "" : (item.description ?? "")}
        />
      </label>
      <label>
        <span>Порядок / position</span>
        <input
          name="sort_order"
          type="number"
          defaultValue={item === "new" ? 0 : item.sort_order}
        />
      </label>
      <label className="check">
        <input name="is_active" type="checkbox" defaultChecked={item === "new" || item.is_active} />
        Отображается на форуме
      </label>
      <Button type="submit">Сохранить категорию</Button>
    </form>
  );
}
