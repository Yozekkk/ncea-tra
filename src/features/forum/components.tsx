import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Clock, Lock, MessageCircle, Pencil, Pin, Plus, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/AuthProvider";
import type { ForumCategory, ForumPost, ForumTopic } from "@/features/community/types";
import { createReply, createTopic, deletePost, deleteTopic, updatePost, updateTopic } from "./api";
import { postSchema, topicSchema, type PostValues, type TopicValues } from "./schemas";

export const forumKeys = {
  all: ["forum"] as const,
  categories: ["forum", "categories"] as const,
  topics: (category?: number) => ["forum", "topics", category ?? "all"] as const,
  topic: (slug: string) => ["forum", "topic", slug] as const,
  posts: (id: string) => ["forum", "posts", id] as const,
};

export function formatCommunityDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

export function LoginPrompt({
  action = "участвовать в обсуждении",
  redirect = "/forum",
}: {
  action?: string;
  redirect?: string;
}) {
  return (
    <div className="write-prompt">
      <div>
        <strong>Войдите, чтобы {action}</strong>
        <p>Читать материалы можно без регистрации.</p>
      </div>
      <div className="community-actions">
        <Link to="/login" search={{ redirect }} className="community-button">
          Войти
        </Link>
        <Link to="/register" className="community-button-secondary">
          Регистрация
        </Link>
      </div>
    </div>
  );
}

export function TopicList({ topics }: { topics: ForumTopic[] }) {
  if (!topics.length)
    return (
      <div className="community-state">
        <strong>Тем пока нет</strong>
        <span>Создайте первое обсуждение в этой категории.</span>
      </div>
    );
  return (
    <div className="topic-list">
      {topics.map((topic) => (
        <Link
          key={topic.id}
          to="/forum/topic/$slug"
          params={{ slug: topic.slug }}
          className="topic-row"
        >
          <span className="activity-rail" aria-hidden="true" />
          <div className="topic-row-main">
            <div className="topic-flags">
              {topic.is_pinned ? (
                <span>
                  <Pin />
                  Закреплено
                </span>
              ) : null}
              {topic.is_locked ? (
                <span>
                  <Lock />
                  Закрыто
                </span>
              ) : null}
            </div>
            <h3>{topic.title}</h3>
            <p>
              {topic.forum_categories?.name} · {topic.profiles?.username ?? "Участник NCEA"}
            </p>
          </div>
          <div className="topic-row-meta">
            <span>
              <MessageCircle />
              {topic.forum_posts?.[0]?.count ?? 0}
            </span>
            <time dateTime={topic.created_at}>
              <Clock />
              {formatCommunityDate(topic.created_at)}
            </time>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function TopicComposer({
  categories,
  initialCategoryId,
}: {
  categories: ForumCategory[];
  initialCategoryId?: number;
}) {
  const auth = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm<TopicValues>({
    resolver: zodResolver(topicSchema),
    mode: "onBlur",
    defaultValues: { categoryId: initialCategoryId ?? categories[0]?.id, title: "", body: "" },
  });
  const mutation = useMutation({
    mutationFn: createTopic,
    onSuccess: async (topic) => {
      await queryClient.invalidateQueries({ queryKey: forumKeys.all });
      await navigate({ to: "/forum/topic/$slug", params: { slug: topic.slug } });
    },
  });
  if (!auth.user) return <LoginPrompt action="создать тему" />;
  return (
    <details className="composer-card">
      <summary>
        <Plus />
        Новая тема
      </summary>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="form-field">
          <Label htmlFor="topic-category">Категория</Label>
          <Select
            value={String(form.watch("categoryId") ?? "")}
            onValueChange={(value) =>
              form.setValue("categoryId", Number(value), { shouldValidate: true })
            }
          >
            <SelectTrigger id="topic-category" aria-label="Категория">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.categoryId ? (
            <p className="field-error" role="alert">
              {form.formState.errors.categoryId.message}
            </p>
          ) : null}
        </div>
        <div className="form-field">
          <Label htmlFor="topic-title">Заголовок</Label>
          <Input id="topic-title" autoComplete="off" maxLength={180} {...form.register("title")} />
          {form.formState.errors.title ? (
            <p className="field-error" role="alert">
              {form.formState.errors.title.message}
            </p>
          ) : null}
        </div>
        <div className="form-field">
          <Label htmlFor="topic-body">Первое сообщение</Label>
          <Textarea
            id="topic-body"
            autoComplete="off"
            rows={7}
            maxLength={20000}
            {...form.register("body")}
          />
          {form.formState.errors.body ? (
            <p className="field-error" role="alert">
              {form.formState.errors.body.message}
            </p>
          ) : null}
        </div>
        {mutation.error ? (
          <p className="form-error-summary" role="alert">
            {mutation.error.message}
          </p>
        ) : null}
        <Button className="rounded-full" disabled={mutation.isPending}>
          <Send />
          {mutation.isPending ? "Создание…" : "Создать тему"}
        </Button>
      </form>
    </details>
  );
}

export function ReplyComposer({ topic }: { topic: ForumTopic }) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const form = useForm<PostValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { body: "" },
    mode: "onBlur",
  });
  const mutation = useMutation({
    mutationFn: (values: PostValues) => createReply(topic.id, values.body),
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: forumKeys.posts(topic.id) });
      await queryClient.invalidateQueries({ queryKey: forumKeys.all });
    },
  });
  if (topic.is_locked && !auth.isStaff)
    return (
      <div className="write-prompt">
        <Lock />
        <div>
          <strong>Тема закрыта</strong>
          <p>Новые ответы отключены модератором.</p>
        </div>
      </div>
    );
  if (!auth.user) return <LoginPrompt action="ответить" redirect={`/forum/topic/${topic.slug}`} />;
  return (
    <form className="reply-form" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
      <Label htmlFor="reply-body">Ваш ответ</Label>
      <Textarea
        id="reply-body"
        autoComplete="off"
        rows={6}
        maxLength={20000}
        placeholder="Напишите по существу…"
        {...form.register("body")}
      />
      {form.formState.errors.body ? (
        <p className="field-error" role="alert">
          {form.formState.errors.body.message}
        </p>
      ) : null}
      {mutation.error ? (
        <p className="form-error-summary" role="alert">
          {mutation.error.message}
        </p>
      ) : null}
      <Button className="rounded-full" disabled={mutation.isPending}>
        <Send />
        {mutation.isPending ? "Отправка…" : "Ответить"}
      </Button>
    </form>
  );
}

export function TopicActions({ topic }: { topic: ForumTopic }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canOwn = auth.user?.id === topic.author_id && !topic.is_locked;
  const canModerate = auth.isStaff;
  const update = useMutation({
    mutationFn: (values: Parameters<typeof updateTopic>[1]) => updateTopic(topic.id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: forumKeys.all }),
  });
  const remove = useMutation({
    mutationFn: () => deleteTopic(topic.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: forumKeys.all });
      await navigate({ to: "/forum" });
    },
  });
  if (!canOwn && !canModerate) return null;
  return (
    <div className="community-actions topic-actions">
      {canOwn ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const title = window.prompt("Новый заголовок", topic.title)?.trim();
            if (title && title.length >= 3) update.mutate({ title });
          }}
        >
          <Pencil />
          Изменить
        </Button>
      ) : null}
      {canModerate ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => update.mutate({ is_pinned: !topic.is_pinned })}
          >
            <Pin />
            {topic.is_pinned ? "Открепить" : "Закрепить"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => update.mutate({ is_locked: !topic.is_locked })}
          >
            <Lock />
            {topic.is_locked ? "Открыть" : "Закрыть"}
          </Button>
        </>
      ) : null}
      <Button
        variant="destructive"
        size="sm"
        onClick={() => window.confirm("Удалить тему и все ответы?") && remove.mutate()}
      >
        <Trash2 />
        Удалить
      </Button>
    </div>
  );
}

export function PostCard({
  post,
  index,
  topic,
}: {
  post: ForumPost;
  index: number;
  topic: ForumTopic;
}) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(post.body);
  const canManage =
    auth.isStaff || (auth.user?.id === post.author_id && (!topic.is_locked || auth.isStaff));
  const save = useMutation({
    mutationFn: () => updatePost(post.id, body),
    onSuccess: async () => {
      setEditing(false);
      await queryClient.invalidateQueries({ queryKey: forumKeys.posts(topic.id) });
    },
  });
  const remove = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: forumKeys.posts(topic.id) }),
  });
  return (
    <article className="forum-post">
      <header>
        <div className="user-avatar" aria-hidden="true">
          {(post.profiles?.username ?? "N").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <strong>{post.profiles?.username ?? "Участник NCEA"}</strong>
          <time dateTime={post.created_at}>{formatCommunityDate(post.created_at)}</time>
        </div>
        <span className="post-number">#{index + 1}</span>
      </header>
      {editing ? (
        <div className="post-editor">
          <Textarea
            aria-label="Изменить сообщение"
            autoComplete="off"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={7}
            maxLength={20000}
          />
          <div className="community-actions">
            <Button
              size="sm"
              onClick={() => save.mutate()}
              disabled={!body.trim() || save.isPending}
            >
              Сохранить
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setBody(post.body);
                setEditing(false);
              }}
            >
              Отмена
            </Button>
          </div>
        </div>
      ) : (
        <p className="user-content">{post.body}</p>
      )}
      {canManage ? (
        <div className="community-actions post-actions">
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil />
            Изменить
          </Button>
          {index > 0 || auth.isStaff ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.confirm("Удалить сообщение?") && remove.mutate()}
            >
              <Trash2 />
              Удалить
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
