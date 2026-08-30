import { createFileRoute } from "@tanstack/react-router";
import { UsersRound } from "lucide-react";
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
          <h1>Работники скоро будут добавлены</h1>
          <p>
            Мы готовим аккуратную страницу команды. Здесь появятся только реальные сотрудники NCEA.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
