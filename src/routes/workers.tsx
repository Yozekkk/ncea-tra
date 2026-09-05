import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { EmployeeCard } from "@/components/site/EmployeeCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { employees } from "@/lib/employees";
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
  return (
    <div className="ref-site workers-page">
      <SiteHeader />
      <main className="ref-workers">
        <motion.section
          className="workers-section"
          initial="hidden"
          whileInView="visible"
          viewport={WORKERS_MOTION_VIEWPORT}
        >
          <motion.header className="workers-heading" variants={workersHeadingReveal}>
            <p className="ref-eyebrow">КОМАНДА NCEA</p>
            <h1>Наша команда</h1>
            <p>Разработка, дизайн, контент и управление проектами — люди, которые стоят за NCEA.</p>
          </motion.header>

          <motion.div className="employees-deck" variants={workersStaggerContainer}>
            {employees.map((employee, index) => (
              <motion.div
                className={`employee-card-motion employee-card-motion--${index + 1}`}
                key={`${employee.name}-${employee.telegram}`}
                custom={index}
                variants={workersCardReveal}
              >
                <EmployeeCard employee={employee} index={index} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </main>
      <SiteFooter />
    </div>
  );
}
