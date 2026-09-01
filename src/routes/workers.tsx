import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { EmployeeCard } from "@/components/site/EmployeeCard";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { employees } from "@/lib/employees";

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

const CARD_START_X = [180, 120, 60, -60, -120, -180];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.76, ease: [0.16, 1, 0.3, 1] },
  },
};

const deckVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.12,
    },
  },
};

const cardVariants: Variants = {
  hidden: (index: number) => ({
    opacity: 0,
    x: CARD_START_X[index],
    y: 40,
    scale: 0.95,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { duration: 0.84, ease: [0.16, 1, 0.3, 1] },
  },
};

function WorkersPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="ref-site workers-page">
      <SiteHeader />
      <main className="ref-workers">
        <motion.section
          className="workers-section"
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.16 }}
        >
          <motion.header className="workers-heading" variants={headerVariants}>
            <p className="ref-eyebrow">КОМАНДА NCEA</p>
            <h1>Наша команда</h1>
            <p>Разработка, дизайн, контент и управление проектами — люди, которые стоят за NCEA.</p>
          </motion.header>

          <motion.div className="employees-deck" variants={deckVariants}>
            {employees.map((employee, index) => (
              <motion.div
                className={`employee-card-motion employee-card-motion--${index + 1}`}
                key={`${employee.name}-${employee.telegram}`}
                custom={index}
                variants={reduceMotion ? undefined : cardVariants}
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
