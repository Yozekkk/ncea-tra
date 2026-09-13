import { Boxes, CircleGauge, MessageSquareText, Rows3, UsersRound } from "lucide-react";
import { Badge, EmptyState, ErrorState, LoadingState, PageHeader } from "../components/ui";
import { getNCreateDashboard } from "../lib/ncreate-data";
import { useAsync } from "../lib/useAsync";

export function NCreateDashboard() {
  const dashboard = useAsync(getNCreateDashboard);
  return <><PageHeader controlLabel="NCREATE CONTROL" title="NCreate" description="Изолированный dashboard сайта и форума NCreate." />{dashboard.loading && <LoadingState />}{dashboard.error && <ErrorState message={dashboard.error} retry={dashboard.reload} />}{dashboard.data ? <><section className="metric-grid ncreate-metrics"><Metric icon={UsersRound} label="Игроков онлайн" value={dashboard.data.settings.online_players} /><Metric icon={MessageSquareText} label="Тем форума" value={dashboard.data.counts.topics} /><Metric icon={CircleGauge} label="Ответов" value={dashboard.data.counts.posts} /><Metric icon={Rows3} label="Категорий" value={dashboard.data.counts.categories} /><Metric icon={Boxes} label="Секций" value={dashboard.data.counts.sections} /></section><section className="dashboard-grid"><article className="panel ncreate-overview"><div className="panel-title"><h2>Server status</h2><Badge tone="warning">{dashboard.data.settings.status}</Badge></div><dl><div><dt>IP</dt><dd>{dashboard.data.settings.server_ip ?? "Скоро будет"}</dd></div><div><dt>Версия</dt><dd>{dashboard.data.settings.minecraft_version ?? "Скоро будет"}</dd></div><div><dt>Рекорд</dt><dd>{dashboard.data.settings.record_players}</dd></div></dl></article><EmptyState title="Данные не выдуманы" detail="Неизвестные значения остаются NULL, 0 или «Скоро будет»." /></section></> : null}</>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof Boxes; label: string; value: number }) {
  return <article className="metric-card"><Icon size={20} /><span>{label}</span><strong>{value}</strong></article>;
}
