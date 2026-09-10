import { useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { getDeletedContent, permanentlyDeleteContent, restoreDeletedContent } from "../lib/data";
import type { DeletedContentType, DeletedItem } from "../lib/types";
import { useAsync } from "../lib/useAsync";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  PageHeader,
} from "../components/ui";

type Filter = "all" | DeletedContentType;

const labels: Record<Filter, string> = {
  all: "Все",
  marketplace: "Marketplace",
  topics: "Темы",
  posts: "Сообщения",
};

export function DeletedPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const state = useAsync(() => getDeletedContent(filter), [filter]);
  const [confirming, setConfirming] = useState<DeletedItem | null>(null);
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const perform = async (item: DeletedItem, action: (item: DeletedItem) => Promise<void>) => {
    setBusyId(item.id);
    setActionError("");
    try {
      await action(item);
      await state.reload();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Trash action failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Удалённые"
        description="Owner-only корзина с восстановлением и окончательным удалением."
      />
      <div className="tabs" role="tablist" aria-label="Фильтр удалённого содержимого">
        {(Object.keys(labels) as Filter[]).map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={filter === item}
            className={filter === item ? "active" : ""}
            onClick={() => setFilter(item)}
          >
            {labels[item]}
          </button>
        ))}
      </div>
      {actionError ? <ErrorState message={actionError} /> : null}
      {state.loading ? <LoadingState /> : null}
      {state.error ? <ErrorState message={state.error} retry={state.reload} /> : null}
      {!state.loading &&
        !state.error &&
        (state.data?.length ? (
          <div className="table-wrap wide-table">
            <table>
              <thead>
                <tr>
                  <th>Что удалено</th>
                  <th>Автор</th>
                  <th>Кто удалил</th>
                  <th>Дата</th>
                  <th>Причина</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {state.data.map((item) => (
                  <tr key={`${item.content_type}:${item.id}`}>
                    <td>
                      <strong>{item.title}</strong>
                      <small>
                        <Badge tone="muted">{labels[item.content_type]}</Badge>
                      </small>
                    </td>
                    <td>@{item.author_username}</td>
                    <td>
                      {item.deleted_by_username
                        ? `@${item.deleted_by_username}`
                        : "Системный пользователь"}
                    </td>
                    <td>
                      <time dateTime={item.deleted_at}>
                        {new Date(item.deleted_at).toLocaleString("ru-RU")}
                      </time>
                    </td>
                    <td>{item.deletion_reason || "—"}</td>
                    <td>
                      <div className="action-row">
                        <Button
                          className="button-small"
                          disabled={busyId === item.id}
                          onClick={() => void perform(item, restoreDeletedContent)}
                        >
                          <RotateCcw size={15} />
                          Восстановить
                        </Button>
                        <Button
                          className="button-danger button-small"
                          disabled={busyId === item.id}
                          onClick={() => setConfirming(item)}
                        >
                          <Trash2 size={15} />
                          Удалить навсегда
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Корзина пуста"
            detail="Удалённые товары, темы и сообщения появятся здесь."
          />
        ))}
      {confirming ? (
        <Modal title="Удалить навсегда?" onClose={() => setConfirming(null)}>
          <div className="confirmation-copy">
            <p>«{confirming.title}» и связанные файлы нельзя будет восстановить.</p>
            <div className="dialog-actions">
              <Button onClick={() => setConfirming(null)}>Отмена</Button>
              <Button
                className="button-danger"
                onClick={() => {
                  const item = confirming;
                  setConfirming(null);
                  void perform(item, permanentlyDeleteContent);
                }}
              >
                Подтвердить удаление
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
