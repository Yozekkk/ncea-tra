import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, UsersRound } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
export const Route = createFileRoute("/workers")({
  head: () => ({
    meta: [{ title: "Работники NCEA" }, { name: "description", content: "Страница команды NCEA." }],
  }),
  component: WorkersPage,
});
function WorkersPage() {
  return (
    <div className="ref-site">
      <SiteHeader />
      <main className="ref-workers">
        <section>
          <div className="ref-workers-icon">
            <UsersRound />
          </div>
          <p className="ref-eyebrow">КОМАНДА NCEA</p>
          <h1>Работники</h1>
          <p>
            Страница сотрудников подготовлена и подключена к навигации. Здесь появятся роли,
            специализации и контакты участников команды NCEA.
          </p>
          <a href="https://t.me/ncea_official" target="_blank" rel="noreferrer">
            Следить за новостями <ArrowUpRight />
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
