import { useEffect, useState, type FormEvent } from "react";
import { Edit3, Eye, EyeOff, ImageOff, Plus } from "lucide-react";
import { UrlImagePreview } from "../components/UrlImagePreview";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Modal,
  PageHeader,
} from "../components/ui";
import { getEmployees, saveEmployee, setEmployeeActive } from "../lib/data";
import type { EmployeeEditorValues, NceaEmployee } from "../lib/types";
import { useAsync } from "../lib/useAsync";
import { isSafeHttpUrl, normalizeOptionalText, normalizeTelegram } from "../lib/validation";

const LEVELS: EmployeeEditorValues["level"][] = ["Стажёр", "Junior", "Middle", "Lead"];

export function EmployeesPage() {
  const employees = useAsync(getEmployees);
  const [editing, setEditing] = useState<NceaEmployee | "new" | null>(null);
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);

  const perform = async (action: () => Promise<void>) => {
    setActionError("");
    setSaving(true);
    try {
      await action();
      await employees.reload();
      return true;
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Не удалось сохранить изменения.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submitEmployee = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const current = editing === "new" ? null : editing;
    const intent = String(form.get("intent") ?? "save");
    const githubUrl = normalizeOptionalText(form.get("github_url"));
    const imageUrl = normalizeOptionalText(form.get("image_url"));
    if (githubUrl && !isSafeHttpUrl(githubUrl)) {
      setActionError(
        "GitHub URL должен быть безопасной ссылкой http:// или https:// без credentials.",
      );
      return;
    }
    if (imageUrl && !isSafeHttpUrl(imageUrl)) {
      setActionError(
        "URL фотографии должен быть безопасной ссылкой http:// или https:// без credentials.",
      );
      return;
    }
    let telegram: string | null;
    try {
      telegram = normalizeTelegram(normalizeOptionalText(form.get("telegram")));
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "Некорректный Telegram.");
      return;
    }
    const saved = await perform(() =>
      saveEmployee(current?.id ?? null, {
        name: String(form.get("name") ?? "").trim(),
        role: String(form.get("role") ?? "").trim(),
        level: String(form.get("level")) as EmployeeEditorValues["level"],
        timezone: normalizeOptionalText(form.get("timezone")),
        telegram,
        discord: normalizeOptionalText(form.get("discord")),
        github_url: githubUrl,
        image_url: imageUrl,
        bio: normalizeOptionalText(form.get("bio")),
        sort_order: Number(form.get("sort_order")),
        is_active: intent === "publish" || form.get("is_active") === "on",
      }),
    );
    if (saved) setEditing(null);
  };

  return (
    <>
      <PageHeader
        title="Сотрудники"
        description="Карточки команды NCEA обновляются на публичной странице сразу после сохранения."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus size={17} /> Добавить сотрудника
          </Button>
        }
      />
      {actionError && <ErrorState message={actionError} />}
      {employees.loading && <LoadingState />}
      {employees.error && <ErrorState message={employees.error} retry={employees.reload} />}
      {employees.data &&
        (employees.data.length ? (
          <div className="table-wrap wide-table">
            <table>
              <thead>
                <tr>
                  <th>Фото</th>
                  <th>Сотрудник</th>
                  <th>Уровень</th>
                  <th>Контакты</th>
                  <th>Статус</th>
                  <th>Порядок</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {employees.data.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <EmployeeThumb employee={employee} />
                    </td>
                    <td>
                      <strong>{employee.name}</strong>
                      <small>{employee.role}</small>
                    </td>
                    <td>
                      <Badge tone="muted">{employee.level}</Badge>
                    </td>
                    <td>
                      <span>{employee.telegram ?? "Telegram не указан"}</span>
                      <small>{employee.discord ?? "Discord не указан"}</small>
                    </td>
                    <td>
                      <Badge tone={employee.is_active ? "live" : "muted"}>
                        {employee.is_active ? "активен" : "скрыт"}
                      </Badge>
                    </td>
                    <td className="mono">{employee.sort_order}</td>
                    <td>
                      <div className="action-row">
                        <IconButton
                          aria-label={`Редактировать ${employee.name}`}
                          onClick={() => setEditing(employee)}
                        >
                          <Edit3 size={17} />
                        </IconButton>
                        <IconButton
                          aria-label={
                            employee.is_active
                              ? `Скрыть ${employee.name}`
                              : `Опубликовать ${employee.name}`
                          }
                          disabled={saving}
                          onClick={() =>
                            void perform(() => setEmployeeActive(employee.id, !employee.is_active))
                          }
                        >
                          {employee.is_active ? <EyeOff size={17} /> : <Eye size={17} />}
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Сотрудников пока нет"
            detail="Добавьте первую карточку команды NCEA."
          />
        ))}
      {editing && (
        <Modal
          title={editing === "new" ? "Добавить сотрудника" : `Редактировать: ${editing.name}`}
          onClose={() => !saving && setEditing(null)}
          wide
        >
          <EmployeeForm
            employee={editing === "new" ? null : editing}
            saving={saving}
            onSubmit={submitEmployee}
            onHide={
              editing !== "new" && editing.is_active
                ? async () => {
                    if (await perform(() => setEmployeeActive(editing.id, false))) setEditing(null);
                  }
                : undefined
            }
          />
        </Modal>
      )}
    </>
  );
}

function EmployeeThumb({ employee }: { employee: NceaEmployee }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [employee.image_url]);
  return (
    <div className="employee-admin-thumb">
      {employee.image_url && !failed ? (
        <img
          src={employee.image_url}
          alt={`Фото: ${employee.name}`}
          onError={() => setFailed(true)}
        />
      ) : (
        <ImageOff size={18} aria-label="Фото не указано" />
      )}
    </div>
  );
}

function EmployeeForm({
  employee,
  saving,
  onSubmit,
  onHide,
}: {
  employee: NceaEmployee | null;
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onHide?: () => void;
}) {
  const [imageUrl, setImageUrl] = useState(employee?.image_url ?? "");
  return (
    <form className="dialog-form employee-editor" onSubmit={onSubmit} autoComplete="off">
      <fieldset disabled={saving}>
        <legend>Основное</legend>
        <div className="dialog-grid">
          <label>
            Имя
            <input name="name" defaultValue={employee?.name ?? ""} maxLength={80} required />
          </label>
          <label>
            Должность
            <input name="role" defaultValue={employee?.role ?? ""} maxLength={120} required />
          </label>
          <label>
            Уровень
            <select name="level" defaultValue={employee?.level ?? "Junior"} required>
              {LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
          <label>
            Часовой пояс
            <input
              name="timezone"
              defaultValue={employee?.timezone ?? ""}
              maxLength={40}
              placeholder="CET / UTC+3 / МСК"
            />
          </label>
        </div>
      </fieldset>

      <fieldset disabled={saving}>
        <legend>Контакты</legend>
        <div className="dialog-grid">
          <label>
            Telegram
            <input
              name="telegram"
              defaultValue={employee?.telegram ?? ""}
              maxLength={2048}
              placeholder="@username"
            />
          </label>
          <label>
            Discord
            <input
              name="discord"
              defaultValue={employee?.discord ?? ""}
              maxLength={80}
              placeholder="username123"
            />
          </label>
          <label className="field-wide">
            GitHub URL
            <input
              name="github_url"
              type="url"
              defaultValue={employee?.github_url ?? ""}
              maxLength={2048}
              placeholder="https://github.com/example"
            />
          </label>
        </div>
      </fieldset>

      <fieldset disabled={saving}>
        <legend>Карточка</legend>
        <label>
          URL фотографии
          <input
            name="image_url"
            type="url"
            value={imageUrl}
            maxLength={2048}
            placeholder="https://example.com/avatar.webp"
            onChange={(event) => setImageUrl(event.target.value)}
          />
        </label>
        <UrlImagePreview
          url={imageUrl}
          alt={`Preview фотографии: ${employee?.name ?? "новый сотрудник"}`}
        />
        <label>
          Описание / bio
          <textarea name="bio" defaultValue={employee?.bio ?? ""} maxLength={2000} rows={5} />
        </label>
        <div className="dialog-grid">
          <label>
            Порядок
            <input
              name="sort_order"
              type="number"
              min={-100000}
              max={100000}
              defaultValue={employee?.sort_order ?? 100}
              required
            />
            <small>Меньшее число поднимает карточку выше.</small>
          </label>
          <label className="check-label employee-active-toggle">
            <input name="is_active" type="checkbox" defaultChecked={employee?.is_active ?? true} />
            Активен на публичной странице
          </label>
        </div>
      </fieldset>

      <div className="dialog-actions">
        <Button type="submit" name="intent" value="save" disabled={saving}>
          {saving ? "Сохранение…" : employee ? "Сохранить изменения" : "Сохранить"}
        </Button>
        {!employee ? (
          <Button
            className="button-secondary"
            type="submit"
            name="intent"
            value="publish"
            disabled={saving}
          >
            Сохранить и опубликовать
          </Button>
        ) : null}
        {onHide ? (
          <Button className="button-danger" type="button" onClick={onHide} disabled={saving}>
            Скрыть карточку
          </Button>
        ) : null}
      </div>
    </form>
  );
}
