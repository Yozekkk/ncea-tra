import { useAsync } from "../lib/useAsync";
import { checkDatabaseHealth } from "../lib/data";
import { supabaseConfig } from "../lib/supabase";
import { Badge, ErrorState, LoadingState, PageHeader } from "../components/ui";

export function SettingsPage() {
  const health = useAsync(checkDatabaseHealth);
  const environment = import.meta.env.MODE === "production" ? "Production" : import.meta.env.MODE;
  return (
    <>
      <PageHeader
        title="Settings"
        description="Non-sensitive application and connection diagnostics."
      />
      {health.loading && <LoadingState />}
      {health.error && <ErrorState message={health.error} retry={health.reload} />}
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
