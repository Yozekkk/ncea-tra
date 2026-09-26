import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { EmployeeCard } from "@/components/site/EmployeeCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getActiveEmployees } from "@/lib/employees";
import {
  WORKERS_MOTION_VIEWPORT,
  workersCardReveal,
  workersHeadingReveal,
  workersStaggerContainer,
} from "@/lib/motion";

export const Route = createFileRoute("/workers")({
  head: () => ({
    meta: [
      { title: "Сотрудники NCEA" },
      {
        name: "description",
        content: "Команда NCEA: разработка, дизайн, контент и управление проектами.",
      },
      { name: "theme-color", content: "#fafafa" },
    ],
  }),
  component: WorkersPage,
});

function WorkersPage() {
  const employees = useQuery({
    queryKey: ["ncea", "employees", "active"],
    queryFn: getActiveEmployees,
    staleTime: 30_000,
    retry: 1,
  });
  return (
    <div className="ref-site workers-page">
      <SiteHeader />
      <main className="ref-workers">
        <section className="workers-section">
          <motion.header
            className="workers-heading"
            variants={workersHeadingReveal}
            initial="hidden"
            whileInView="visible"
            viewport={WORKERS_MOTION_VIEWPORT}
          >
            <p className="ref-eyebrow">КОМАНДА NCEA</p>
            <h1>Наша команда</h1>
            <p>Разработка, дизайн, контент и управление проектами — люди, которые стоят за NCEA.</p>
          </motion.header>

          {employees.isLoading ? (
            <div className="workers-state" role="status">
              Загружаем команду NCEA…
            </div>
          ) : employees.error ? (
            <div className="workers-state workers-state--error" role="alert">
              <strong>Не удалось загрузить сотрудников</strong>
              <span>{employees.error.message}</span>
              <button type="button" onClick={() => void employees.refetch()}>
                Повторить
              </button>
            </div>
          ) : !employees.data?.length ? (
            <div className="workers-state">
              <strong>Команда скоро появится здесь</strong>
              <span>Активных карточек сотрудников пока нет.</span>
            </div>
          ) : (
            <motion.div
              className={`employees-deck${employees.data.length > 6 ? " employees-deck--expanded" : ""}`}
              variants={workersStaggerContainer}
              initial="hidden"
              animate="visible"
            >
              {employees.data.map((employee, index) => (
                <motion.div
                  className={`employee-card-motion employee-card-motion--${Math.min(index + 1, 6)}`}
                  key={employee.id}
                  custom={index}
                  variants={workersCardReveal}
                >
                  <EmployeeCard employee={employee} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
