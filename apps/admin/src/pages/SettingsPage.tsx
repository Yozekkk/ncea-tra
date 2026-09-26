import { useAsync } from "../lib/useAsync";
import { checkDatabaseHealth } from "../lib/data";
import { supabaseConfig } from "../lib/supabase";
import { Badge, ErrorState, LoadingState, PageHeader } from "../components/ui";
import { Button } from "../components/ui";
import { getSiteSettings, saveSiteSettings } from "../lib/operations";
import { useMutation } from "../lib/useMutation";

export function SettingsPage() {
  const health = useAsync(checkDatabaseHealth);
  const settings = useAsync(getSiteSettings);
  const mutation = useMutation();
  const environment = import.meta.env.MODE === "production" ? "Production" : import.meta.env.MODE;
  return (
    <>
      <PageHeader
        title="Settings"
        description="Non-sensitive application and connection diagnostics."
      />
      {health.loading && <LoadingState />}
      {health.error && <ErrorState message={health.error} retry={health.reload} />}
      {settings.loading && <LoadingState />}
      {settings.error && <ErrorState message={settings.error} retry={settings.reload} />}
      {mutation.error && <ErrorState message={mutation.error} />}
      {mutation.message && (
        <div className="success-state" role="status">
          {mutation.message}
        </div>
      )}
      {settings.data && (
        <form
          className="dialog-form panel"
          key={settings.data.updated_at}
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void mutation.perform(
              () =>
                saveSiteSettings({
                  announcement: String(form.get("announcement") ?? "").trim(),
                  announcement_enabled: form.get("announcement_enabled") === "on",
                }),
              settings.reload,
            );
          }}
        >
          <fieldset disabled={mutation.busy}>
            <legend>Публичное объявление NCEA</legend>
            <label>
              Текст объявления
              <textarea
                name="announcement"
                maxLength={500}
                rows={4}
                defaultValue={settings.data.announcement}
              />
            </label>
            <label className="check-label">
              <input
                name="announcement_enabled"
                type="checkbox"
                defaultChecked={settings.data.announcement_enabled}
              />
              Показывать на сайте
            </label>
            <Button type="submit" disabled={mutation.busy}>
              {mutation.busy ? "Сохранение…" : "Сохранить объявление"}
            </Button>
          </fieldset>
        </form>
      )}
      <section className="settings-grid">
        <Info label="Environment" value={environment} />
        <Info label="Application version" value="1.0.0" mono />
        <Info label="Supabase project" value={supabaseConfig.projectHost} mono />
        <Info
          label="Configuration"
          value={supabaseConfig.configured ? "Configured" : "Missing variables"}
          status={supabaseConfig.configured}
        />
        <Info
          label="Database health"
          value={health.data?.ok ? `Connected · ${health.data.latency} ms` : "Unavailable"}
          status={health.data?.ok}
        />
      </section>
      <p className="settings-note">
        Only public connection metadata is shown. Secret keys, passwords and tokens are never
        exposed here.
      </p>
    </>
  );
}

function Info({
  label,
  value,
  status,
  mono = false,
}: {
  label: string;
  value: string;
  status?: boolean;
  mono?: boolean;
}) {
  return (
    <article className="info-card">
      <span>{label}</span>
      <div className={mono ? "mono" : ""}>
        {status !== undefined && (
          <Badge tone={status ? "live" : "danger"}>{status ? "OK" : "ERROR"}</Badge>
        )}
        <strong>{value}</strong>
      </div>
    </article>
  );
}
