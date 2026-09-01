export type EmployeeLevel = "Стажёр" | "Junior" | "Middle" | "Lead";

export type Employee = {
  name: string;
  timezone: string;
  telegram: string;
  discord: string;
  role: string;
  level: EmployeeLevel;
  github: string | null;
};

export const employees: Employee[] = [
  {
    name: "Степан",
    timezone: "МСК",
    telegram: "@bblsmile",
    discord: "joykin0065",
    role: "Контент-мейкер",
    level: "Middle",
    github: null,
  },
  {
    name: "Максим",
    timezone: "EEST",
    telegram: "@circusoff",
    discord: "qw3nn",
    role: "Веб-разработчик",
    level: "Стажёр",
    github: null,
  },
  {
    name: "Егор",
    timezone: "GMT +2",
    telegram: "@m1ndyp",
    discord: ".163.",
    role: "Веб-разработка / разработка модов",
    level: "Junior",
    github: null,
  },
  {
    name: "Антон",
    timezone: "CET (-1 от МСК)",
    telegram: "@YOURDEPRESSEDVAMPIRE",
    discord: "@nevskydev",
    role: "Fullstack-разработка",
    level: "Lead",
    github: null,
  },
  {
    name: "Стас",
    timezone: "МСК",
    telegram: "@Stacyhomk",
    discord: "stacygomk",
    role: "Менеджер",
    level: "Стажёр",
    github: null,
  },
  {
    name: "Максим",
    timezone: "UTC+3 / Киев",
    telegram: "@LOGICSPARK",
    discord: "_STALKER_2",
    role: "Веб-программист",
    level: "Стажёр",
    github: null,
  },
];
