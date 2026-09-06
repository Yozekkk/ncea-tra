import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getUsers, setUserRole } from "../lib/data";
import { formatDate } from "../lib/format";
import type { AppRole } from "../lib/types";
import { useAsync } from "../lib/useAsync";
import { Badge, EmptyState, ErrorState, LoadingState, PageHeader } from "../components/ui";

export function UsersPage() {
  const state = useAsync(getUsers);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"all" | AppRole>("all");
  const [actionError, setActionError] = useState("");
  const filtered = useMemo(
    () =>
      (state.data ?? []).filter((user) => {
        const needle = query.trim().toLowerCase();
        const matchesText =
          !needle ||
          user.username.toLowerCase().includes(needle) ||
          (user.display_name ?? "").toLowerCase().includes(needle);
        return matchesText && (role === "all" || user.role === role);
      }),
    [query, role, state.data],
  );

  const changeRole = async (userId: string, next: AppRole) => {
    setActionError("");
    try {
      await setUserRole(userId, next);
      await state.reload();
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
        <label className="search-control">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search username or display name"
          />
        </label>
        <select
          aria-label="Filter by role"
          value={role}
          onChange={(e) => setRole(e.target.value as typeof role)}
        >
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {actionError && <ErrorState message={actionError} />}
      {state.loading && <LoadingState />}
      {state.error && <ErrorState message={state.error} retry={state.reload} />}
      {!state.loading &&
        !state.error &&
        (filtered.length ? (
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
                {filtered.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>@{user.username}</strong>
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
                        onChange={(e) => void changeRole(user.id, e.target.value as AppRole)}
                      >
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
        ) : (
          <EmptyState title="No matching users" detail="Adjust the search or role filter." />
        ))}
    </>
  );
}
