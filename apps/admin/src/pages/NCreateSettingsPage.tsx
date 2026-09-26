import { CollectionTools } from "../components/CollectionTools";
import { useMutation } from "../lib/useMutation";
import { useState, type FormEvent } from "react";
import { Edit3, Plus } from "lucide-react";
import { useAdminAccess } from "../components/AdminAccess";
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
import {
  getNCreateCards,
  getNCreateSections,
  getNCreateSettings,
  saveNCreateCard,
  saveNCreateSection,
  saveNCreateSettings,
} from "../lib/ncreate-data";
import type { NCreateCard, NCreateSection } from "../lib/types";
import { useAsync } from "../lib/useAsync";

type Tab = "settings" | "sections" | "cards";
const nullText = (value: FormDataEntryValue | null) => String(value ?? "").trim() || null;

export function NCreateSettingsPage() {
  const { role } = useAdminAccess();
  const canWrite = role === "admin" || role === "owner";
  const [tab, setTab] = useState<Tab>("settings");
  const settings = useAsync(getNCreateSettings);
  const sections = useAsync(getNCreateSections);
  const cards = useAsync(getNCreateCards);
  const [editingSection, setEditingSection] = useState<NCreateSection | "new" | null>(null);
  const [editingCard, setEditingCard] = useState<NCreateCard | "new" | null>(null);

  const error = settings.error || sections.error || cards.error;

  const mutation = useMutation();
  const perform = mutation.perform;
  const submitSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await perform(
      () =>
        saveNCreateSettings({
          server_name: String(form.get("server_name")).trim(),
          hero_title: String(form.get("hero_title")).trim(),
          hero_subtitle: nullText(form.get("hero_subtitle")),
          server_ip: nullText(form.get("server_ip")),
          minecraft_version: nullText(form.get("minecraft_version")),
          online_players: Number(form.get("online_players")),
          record_players: Number(form.get("record_players")),
          total_players: Number(form.get("total_players")),
          discord_url: nullText(form.get("discord_url")),
          telegram_url: nullText(form.get("telegram_url")),
          youtube_url: nullText(form.get("youtube_url")),
          vk_url: nullText(form.get("vk_url")),
          donate_url: nullText(form.get("donate_url")),
          launcher_url: nullText(form.get("launcher_url")),
          status: String(form.get("status")),
        }),
      settings.reload,
    );
  };
  const submitSection = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item = editingSection === "new" ? null : editingSection;
    const saved = await perform(
      () =>
        saveNCreateSection(item?.id ?? null, {
          section_key: String(form.get("section_key")).trim(),
          title: nullText(form.get("title")),
          subtitle: nullText(form.get("subtitle")),
          sort_order: Number(form.get("sort_order")),
          is_published: form.get("is_published") === "on",
        }),
      sections.reload,
    );
    if (saved) setEditingSection(null);
  };
  const submitCard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item = editingCard === "new" ? null : editingCard;
    const saved = await perform(
      () =>
        saveNCreateCard(item?.id ?? null, {
          section_id: Number(form.get("section_id")),
          title: String(form.get("title")).trim(),
          description: nullText(form.get("description")),
          image_url: nullText(form.get("image_url")),
          sort_order: Number(form.get("sort_order")),
          is_published: form.get("is_published") === "on",
        }),
      cards.reload,
    );
    if (saved) setEditingCard(null);
  };
  const currentSection = editingSection === "new" ? null : editingSection;
  const currentCard = editingCard === "new" ? null : editingCard;
  return (
    <>
      <PageHeader
        controlLabel="NCREATE CONTROL"
        title="Сайт"
        description="Настройки, секции и карточки NCreate из базы данных."
        action={
          canWrite && tab !== "settings" ? (
            <Button
              onClick={() =>
                tab === "sections" ? setEditingSection("new") : setEditingCard("new")
              }
            >
              <Plus size={17} />
              Добавить
            </Button>
          ) : undefined
        }
      />
      <div className="tabs" role="tablist">
        {(["settings", "sections", "cards"] as Tab[]).map((item) => (
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
      {error && <ErrorState message={error} />}
      {mutation.message && (
        <div className="success-state" role="status">
          {mutation.message}
        </div>
      )}
      {mutation.error && <ErrorState message={mutation.error} />}
      {tab === "settings" &&
        (settings.loading ? (
          <LoadingState />
        ) : settings.data ? (
          <form
            className="admin-form ncreate-settings-form"
            onSubmit={(event) => void submitSettings(event)}
          >
            <fieldset disabled={!canWrite || mutation.busy}>
              <div className="form-grid">
                <Field
                  label="Название"
                  name="server_name"
                  value={settings.data.server_name}
                  required
                />
                <Field
                  label="Hero title"
                  name="hero_title"
                  value={settings.data.hero_title}
                  required
                  wide
                />
                <Field
                  label="Hero subtitle"
                  name="hero_subtitle"
                  value={settings.data.hero_subtitle}
                  wide
                />
                <Field label="IP" name="server_ip" value={settings.data.server_ip} />
                <Field
                  label="Версия"
                  name="minecraft_version"
                  value={settings.data.minecraft_version}
                />
                <Field
                  label="Онлайн"
                  name="online_players"
                  value={settings.data.online_players}
                  type="number"
                />
                <Field
                  label="Рекорд"
                  name="record_players"
                  value={settings.data.record_players}
                  type="number"
                />
                <Field
                  label="Всего"
                  name="total_players"
                  value={settings.data.total_players}
                  type="number"
                />
                <label>
                  <span>Статус</span>
                  <select name="status" defaultValue={settings.data.status}>
                    <option value="coming_soon">coming_soon</option>
                    <option value="online">online</option>
                    <option value="offline">offline</option>
                    <option value="maintenance">maintenance</option>
                  </select>
                </label>
                {[
                  "discord_url",
                  "telegram_url",
                  "youtube_url",
                  "vk_url",
                  "donate_url",
                  "launcher_url",
                ].map((name) => (
                  <Field
                    key={name}
                    label={name}
                    name={name}
                    value={
                      settings.data?.[name as keyof NonNullable<typeof settings.data>] as
                        string | null
                    }
                    wide
                  />
                ))}
              </div>
              {canWrite && (
                <Button type="submit" disabled={mutation.busy}>
                  Сохранить
                </Button>
              )}
            </fieldset>
          </form>
        ) : null)}
      {tab === "sections" &&
        (sections.loading ? (
          <LoadingState />
        ) : sections.data?.length ? (
          <CollectionTools
            rows={sections.data}
            text={(item) => `${item.title ?? ""} ${item.section_key}`}
          >
            {(visible) => (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Section</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.title ?? "Скоро будет"}</strong>
                          <small className="mono">{item.section_key}</small>
                        </td>
                        <td>{item.sort_order}</td>
                        <td>
                          <Badge tone={item.is_published ? "live" : "muted"}>
                            {item.is_published ? "published" : "draft"}
                          </Badge>
                        </td>
                        <td>
                          {canWrite && (
                            <IconButton
                              disabled={mutation.busy}
                              aria-label="Edit section"
                              onClick={() => setEditingSection(item)}
                            >
                              <Edit3 size={17} />
                            </IconButton>
                          )}
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
            title="Секций пока нет"
            detail="Создайте секцию, когда появится реальный контент."
          />
        ))}
      {tab === "cards" &&
        (cards.loading ? (
          <LoadingState />
        ) : cards.data?.length ? (
          <CollectionTools
            rows={cards.data}
            text={(item) => `${item.title} ${item.description ?? ""}`}
          >
            {(visible) => (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Card</th>
                      <th>Section ID</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.title}</strong>
                          <small>{item.description ?? "Скоро будет"}</small>
                        </td>
                        <td>{item.section_id}</td>
                        <td>{item.sort_order}</td>
                        <td>
                          <Badge tone={item.is_published ? "live" : "muted"}>
                            {item.is_published ? "published" : "draft"}
                          </Badge>
                        </td>
                        <td>
                          {canWrite && (
                            <IconButton
                              disabled={mutation.busy}
                              aria-label="Edit card"
                              onClick={() => setEditingCard(item)}
                            >
                              <Edit3 size={17} />
                            </IconButton>
                          )}
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
            title="Карточек пока нет"
            detail="Добавьте карточки только после появления проверенного контента."
          />
        ))}
      {editingSection && (
        <Modal
          title={currentSection ? "Редактировать секцию" : "Новая секция"}
          onClose={() => setEditingSection(null)}
        >
          <form className="modal-form" onSubmit={(event) => void submitSection(event)}>
            <Field label="Key" name="section_key" value={currentSection?.section_key} required />
            <Field label="Title" name="title" value={currentSection?.title} />
            <label>
              <span>Subtitle</span>
              <textarea name="subtitle" defaultValue={currentSection?.subtitle ?? ""} />
            </label>
            <Field
              label="Order"
              name="sort_order"
              value={currentSection?.sort_order ?? 0}
              type="number"
            />
            <label className="check">
              <input
                type="checkbox"
                name="is_published"
                defaultChecked={currentSection?.is_published ?? false}
              />
              Published
            </label>
            <Button type="submit" disabled={mutation.busy}>
              Сохранить
            </Button>
          </form>
        </Modal>
      )}
      {editingCard && (
        <Modal
          title={currentCard ? "Редактировать карточку" : "Новая карточка"}
          onClose={() => setEditingCard(null)}
        >
          <form className="modal-form" onSubmit={(event) => void submitCard(event)}>
            <label>
              <span>Section</span>
              <select name="section_id" defaultValue={currentCard?.section_id}>
                {sections.data?.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.title ?? item.section_key}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Title"
              name="title"
              value={currentCard?.title ?? "Скоро будет"}
              required
            />
            <label>
              <span>Description</span>
              <textarea name="description" defaultValue={currentCard?.description ?? ""} />
            </label>
            <Field label="Image URL" name="image_url" value={currentCard?.image_url} />
            <Field
              label="Order"
              name="sort_order"
              value={currentCard?.sort_order ?? 0}
              type="number"
            />
            <label className="check">
              <input
                type="checkbox"
                name="is_published"
                defaultChecked={currentCard?.is_published ?? false}
              />
              Published
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

function Field({
  label,
  name,
  value,
  type = "text",
  required = false,
  wide = false,
}: {
  label: string;
  name: string;
  value?: string | number | null;
  type?: string;
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "wide" : ""}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        min={type === "number" ? 0 : undefined}
        defaultValue={value ?? ""}
        required={required}
      />
    </label>
  );
}
