import { useMemo, useState } from "react";
import { getUsers, setUserRole } from "../lib/data";
import { formatDate } from "../lib/format";
import type { AppRole, AdminUser } from "../lib/types";
import { CollectionTools } from "../components/CollectionTools";
import { getUserActivity } from "../lib/operations";
import { useMutation } from "../lib/useMutation";
import { useAsync } from "../lib/useAsync";
import {
  Badge,
  Button,
  Modal,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "../components/ui";

export function UsersPage() {
  const state = useAsync(getUsers);
  const [role, setRole] = useState<"all" | AppRole>("all");
  const [actionError, setActionError] = useState("");
  const mutation = useMutation();
  const [viewing, setViewing] = useState<AdminUser | null>(null);
  const filtered = useMemo(
    () =>
      (state.data ?? []).filter((user) => {
        return role === "all" || user.role === role;
      }),
    [role, state.data],
  );

  const changeRole = async (userId: string, next: AppRole) => {
    if (!window.confirm(`Изменить роль пользователя на ${next}?`)) return;
    setActionError("");
    try {
      await mutation.perform(() => setUserRole(userId, next), state.reload);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Role update failed.");
    }
  };

  return (
    <>
      <PageHeader
        title="Users"
        description="Profiles and canonical roles protected by database authorization."
      />
      <div className="toolbar">
        <select
          aria-label="Filter by role"
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
        >
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </select>
      </div>
      {actionError && <ErrorState message={actionError} />}
      {mutation.error && <ErrorState message={mutation.error} />}
      {mutation.message && (
        <div className="success-state" role="status">
          {mutation.message}
        </div>
      )}
      {state.loading && <LoadingState />}
      {state.error && <ErrorState message={state.error} retry={state.reload} />}
      {!state.loading &&
        !state.error &&
        (filtered.length ? (
          <CollectionTools
            rows={filtered}
            text={(u) => `${u.username} ${u.display_name ?? ""} ${u.id}`}
            sort={(a, b) => a.created_at.localeCompare(b.created_at)}
            sorts={["По дате добавления", "Старые сначала", "Новые сначала"]}
          >
            {(visible) => (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Display name</th>
                      <th>Created</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong>@{user.username}</strong>
                          <small className="mono">{user.id}</small>
                          <Button
                            className="button-secondary button-small"
                            onClick={() => setViewing(user)}
                          >
                            Профиль
                          </Button>
                        </td>
                        <td>{user.display_name || "—"}</td>
                        <td>{formatDate(user.created_at)}</td>
                        <td>
                          <Badge tone={user.role}>{user.role}</Badge>
                        </td>
                        <td>
                          <select
                            aria-label={`Role for ${user.username}`}
                            value={user.role}
                            disabled={user.role === "owner" || mutation.busy}
                            onChange={(e) => void changeRole(user.id, e.target.value as AppRole)}
                          >
                            {user.role === "owner" ? <option value="owner">Owner</option> : null}
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollectionTools>
        ) : (
          <EmptyState title="No matching users" detail="Adjust the search or role filter." />
        ))}
      {viewing && (
        <Modal title={`Профиль @${viewing.username}`} onClose={() => setViewing(null)}>
          <UserDetails user={viewing} />
        </Modal>
      )}
    </>
  );
}

function UserDetails({ user }: { user: AdminUser }) {
  const activity = useAsync(() => getUserActivity(user.id), [user.id]);
  return (
    <div className="dialog-form">
      <p className="mono">{user.id}</p>
      <p>
        {user.display_name ?? "Без отображаемого имени"} · {user.role}
      </p>
      <p>Регистрация: {formatDate(user.created_at)}</p>
      <p>{user.bio ?? "Описание не указано"}</p>
      {activity.loading && <LoadingState />}
      {activity.error && <ErrorState message={activity.error} retry={activity.reload} />}
      {activity.data && (
        <p>
          Темы: {activity.data.topics} · Ответы: {activity.data.posts} · Объявления:{" "}
          {activity.data.listings}
        </p>
      )}
    </div>
  );
}
