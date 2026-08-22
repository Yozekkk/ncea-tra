import type { IconKey } from "@/components/site/ui";

/* ============================================================
   NCEA — каталог услуг и ценообразование.
   Все цены в евро (€). Правьте значения здесь — конфигураторы
   и карточки услуг пересчитываются автоматически.
   ============================================================ */

export type Opt = {
  id: string;
  label: string;
  /** фиксированная доплата, € */
  price?: number;
  /** множитель к итогу */
  mult?: number;
  /** множитель к сроку */
  daysMult?: number;
  note?: string;
};

export type Field =
  | { id: string; label: string; type: "select"; options: Opt[]; def: string; help?: string }
  | { id: string; label: string; type: "toggle"; price?: number; mult?: number; def?: boolean; desc?: string }
  | {
      id: string;
      label: string;
      type: "number";
      min: number;
      max: number;
      step: number;
      def: number;
      unit: string;
      pricePerUnit: number;
      /** сколько дней добавляет каждая единица */
      daysPerUnit?: number;
      help?: string;
    }
  | { id: string; label: string; type: "text"; def?: string; placeholder?: string }
  | { id: string; label: string; type: "textarea"; def?: string; placeholder?: string };

export type Step = { title: string; desc?: string; fields: Field[] };

export type ServiceGroup = "mc" | "content" | "other";

export type Service = {
  id: string;
  path: string;
  title: string;
  short: string;
  desc: string;
  icon: IconKey;
  group: ServiceGroup;
  /** базовая стоимость, € */
  base: number;
  /** единый коэффициент ко всем денежным составляющим услуги */
  priceFactor?: number;
  /** базовый срок [мин, макс] в днях */
  days: [number, number];
  steps: Step[];
};

export const GROUPS: { id: ServiceGroup; label: string }[] = [
  { id: "mc", label: "Minecraft-разработка" },
  { id: "content", label: "Контент и оформление" },
  { id: "other", label: "Другие услуги" },
];

const REDUCED_PRICE_FACTOR = 0.4;

/* ---------- переиспользуемые наборы опций ---------- */

const MC_VERSIONS: Opt[] = [
  { id: "1.7.10", label: "1.7.10", mult: 1.3, note: "legacy" },
  { id: "1.8.9", label: "1.8.9", mult: 1.15 },
  { id: "1.12.2", label: "1.12.2", mult: 1.2 },
  { id: "1.16.5", label: "1.16.5", mult: 1.05 },
  { id: "1.18.2", label: "1.18.2", mult: 1.0 },
  { id: "1.19.4", label: "1.19.4", mult: 1.0 },
  { id: "1.20.1", label: "1.20.1", mult: 1.0, note: "популярная" },
  { id: "1.20.4", label: "1.20.4", mult: 1.0 },
  { id: "1.21", label: "1.21", mult: 1.05 },
  { id: "1.21.4", label: "1.21.4", mult: 1.1, note: "latest" },
];

const URGENCY: Opt[] = [
  { id: "normal", label: "Обычный", mult: 1 },
  { id: "fast", label: "Ускоренный", mult: 1.2, daysMult: 0.7, note: "+20%" },
  { id: "asap", label: "Срочный", mult: 1.45, daysMult: 0.45, note: "+45%" },
];

const urgencyField: Field = { id: "urgency", label: "Срок выполнения", type: "select", options: URGENCY, def: "normal" };
const versionField: Field = { id: "version", label: "Версия Minecraft", type: "select", options: MC_VERSIONS, def: "1.20.1" };
const docsField: Field = { id: "docs", label: "Документация к проекту", type: "toggle", price: 1 };
const sourcesField: Field = { id: "sources", label: "Передача исходников", type: "toggle", price: 1 };

/* ============================================================
   Услуги
   ============================================================ */

export const SERVICES: Service[] = [
  /* ---------------- ПЛАГИНЫ ---------------- */
  {
    id: "plugins",
    path: "/plugins",
    title: "Разработка плагина",
    short: "Индивидуальные механики для вашего Minecraft-сервера.",
    desc: "Пишем плагины под задачу: механики, GUI, база данных, интеграции с Discord, PlaceholderAPI и Vault.",
    icon: "Service",
    group: "mc",
    base: 1.5,
    days: [3, 6],
    steps: [
      {
        title: "Платформа",
        desc: "На чём должен работать плагин.",
        fields: [
          {
            id: "platform",
            label: "Платформа",
            type: "select",
            def: "paper",
            options: [
              { id: "paper", label: "Paper", mult: 1, note: "рекомендуем" },
              { id: "spigot", label: "Spigot", mult: 1 },
              { id: "purpur", label: "Purpur", mult: 1.05 },
              { id: "bukkit", label: "Bukkit", mult: 1.05 },
              { id: "velocity", label: "Velocity", mult: 1.25 },
              { id: "bungeecord", label: "BungeeCord", mult: 1.2 },
              { id: "fabric", label: "Fabric", mult: 1.35 },
              { id: "forge", label: "Forge", mult: 1.4 },
              { id: "neoforge", label: "NeoForge", mult: 1.4 },
            ],
          },
          versionField,
        ],
      },
      {
        title: "Характеристики",
        fields: [
          {
            id: "kind",
            label: "Тип плагина",
            type: "select",
            def: "utility",
            options: [
              { id: "utility", label: "Утилита / QoL", mult: 1 },
              { id: "economy", label: "Экономика", mult: 1.25 },
              { id: "minigame", label: "Мини-игра", mult: 1.5 },
              { id: "rpg", label: "RPG-система", mult: 1.7 },
              { id: "admin", label: "Админ-инструмент", mult: 1.15 },
              { id: "protection", label: "Защита / античит", mult: 1.6 },
            ],
          },
          {
            id: "mechanics",
            label: "Количество основных механик",
            type: "number",
            min: 1,
            max: 15,
            step: 1,
            def: 2,
            unit: "шт.",
            pricePerUnit: 1,
            daysPerUnit: 0.7,
          },
          { id: "gui", label: "Графический интерфейс (GUI)", type: "toggle", price: 1 },
          {
            id: "db",
            label: "База данных",
            type: "select",
            def: "none",
            options: [
              { id: "none", label: "Не нужна", price: 0 },
              { id: "yaml", label: "YAML-файлы", price: 1 },
              { id: "sqlite", label: "SQLite", price: 1 },
              { id: "mysql", label: "MySQL / MariaDB", price: 1.2 },
            ],
          },
        ],
      },
      {
        title: "Интеграции",
        fields: [
          { id: "discord", label: "Интеграция с Discord", type: "toggle", price: 1 },
          { id: "papi", label: "PlaceholderAPI", type: "toggle", price: 1 },
          { id: "vault", label: "Vault", type: "toggle", price: 1 },
          { id: "multi", label: "Поддержка нескольких серверов", type: "toggle", price: 1.2 },
        ],
      },
      { title: "Дополнительно", fields: [sourcesField, docsField, urgencyField] },
    ],
  },

  /* ---------------- СБОРКИ ---------------- */
  {
    id: "modpacks",
    path: "/modpacks",
    title: "Заказать сборку",
    short: "Модпаки под ключ: моды, конфиги, квесты, оптимизация.",
    desc: "Собираем клиентские и серверные модпаки: подбор модов, конфигурация, квесты, меню и оптимизация.",
    icon: "Cube",
    group: "mc",
    priceFactor: REDUCED_PRICE_FACTOR,
    base: 1.8,
    days: [4, 8],
    steps: [
      {
        title: "Основа",
        fields: [
          versionField,
          {
            id: "loader",
            label: "Загрузчик",
            type: "select",
            def: "fabric",
            options: [
              { id: "forge", label: "Forge", mult: 1.1 },
              { id: "fabric", label: "Fabric", mult: 1 },
              { id: "neoforge", label: "NeoForge", mult: 1.1 },
            ],
          },
          {
            id: "kind",
            label: "Тип сборки",
            type: "select",
            def: "tech",
            options: [
              { id: "light", label: "Лёгкая / оптимизация", mult: 0.8 },
              { id: "tech", label: "Техномагия", mult: 1.2 },
              { id: "rpg", label: "RPG / приключения", mult: 1.4 },
              { id: "kitchen", label: "Kitchen-sink", mult: 1.5 },
            ],
          },
        ],
      },
      {
        title: "Состав",
        fields: [
          {
            id: "mods",
            label: "Примерное количество модов",
            type: "number",
            min: 10,
            max: 400,
            step: 10,
            def: 80,
            unit: "шт.",
            pricePerUnit: 1,
            daysPerUnit: 0.02,
          },
          {
            id: "side",
            label: "Тип клиента",
            type: "select",
            def: "client",
            options: [
              { id: "client", label: "Клиентская", price: 1 },
              { id: "server", label: "Серверная", price: 1 },
              { id: "both", label: "Клиент + сервер", price: 1.2 },
            ],
          },
        ],
      },
      {
        title: "Опции",
        fields: [
          { id: "optimize", label: "Оптимизация производительности", type: "toggle", price: 1, def: true },
          { id: "configs", label: "Настройка конфигураций", type: "toggle", price: 1 },
          { id: "quests", label: "Настройка квестов (FTB Quests)", type: "toggle", price: 1.5 },
          { id: "menu", label: "Кастомное главное меню", type: "toggle", price: 1 },
          { id: "respack", label: "Ресурспак под сборку", type: "toggle", price: 1.2 },
          { id: "readyserver", label: "Готовый сервер под сборку", type: "toggle", price: 1.2 },
        ],
      },
      { title: "Дополнительно", fields: [docsField, urgencyField] },
    ],
  },

  /* ---------------- НАСТРОЙКА СЕРВЕРА ---------------- */
  {
    id: "server-setup",
    path: "/server-setup",
    title: "Настройка сервера",
    short: "Ядро, плагины, права, защита и оптимизация под ключ.",
    desc: "Полная настройка Minecraft-сервера: ядро, плагины, права, чат, экономика, античит и оптимизация.",
    icon: "Wrench",
    group: "mc",
    priceFactor: REDUCED_PRICE_FACTOR,
    base: 2.4,
    days: [3, 7],
    steps: [
      {
        title: "Основа",
        fields: [
          {
            id: "core",
            label: "Ядро сервера",
            type: "select",
            def: "paper",
            options: [
              { id: "paper", label: "Paper", mult: 1 },
              { id: "purpur", label: "Purpur", mult: 1.05 },
              { id: "spigot", label: "Spigot", mult: 1 },
              { id: "folia", label: "Folia", mult: 1.5 },
              { id: "fabric", label: "Fabric", mult: 1.3 },
              { id: "forge", label: "Forge", mult: 1.35 },
              { id: "mohist", label: "Mohist (гибрид)", mult: 1.5 },
              { id: "velocity", label: "Velocity (прокси)", mult: 1.2 },
            ],
          },
          versionField,
          {
            id: "kind",
            label: "Тип сервера",
            type: "select",
            def: "survival",
            options: [
              { id: "survival", label: "Survival / Vanilla+", mult: 1 },
              { id: "hub", label: "Lobby / Hub", mult: 0.85 },
              { id: "skyblock", label: "SkyBlock", mult: 1.2 },
              { id: "minigames", label: "Minigames", mult: 1.45 },
              { id: "rpg", label: "RPG / MMO", mult: 1.8 },
              { id: "anarchy", label: "Anarchy", mult: 1.05 },
            ],
          },
        ],
      },
      {
        title: "Плагины и системы",
        fields: [
          {
            id: "plugins",
            label: "Количество плагинов",
            type: "number",
            min: 1,
            max: 72,
            step: 1,
            def: 15,
            unit: "шт.",
            pricePerUnit: 1,
            daysPerUnit: 0.05,
          },
          { id: "perms", label: "Настройка прав (LuckPerms)", type: "toggle", price: 1, def: true },
          { id: "tab", label: "Настройка TAB и Scoreboard", type: "toggle", price: 1 },
          { id: "chat", label: "Чат и форматирование", type: "toggle", price: 1 },
          { id: "auth", label: "Авторизация", type: "toggle", price: 1 },
          { id: "economy", label: "Экономика и магазины", type: "toggle", price: 1 },
        ],
      },
      {
        title: "Защита и производительность",
        fields: [
          { id: "anticheat", label: "Античит", type: "toggle", price: 1 },
          { id: "protect", label: "Защита территорий и гриферов", type: "toggle", price: 1 },
          { id: "optimize", label: "Оптимизация TPS", type: "toggle", price: 1, def: true },
          { id: "db", label: "Подключение базы данных", type: "toggle", price: 1 },
          { id: "proxy", label: "Настройка прокси-сети", type: "toggle", price: 1.2 },
        ],
      },
      {
        title: "Дополнительно",
        fields: [
          docsField,
          {
            id: "aftercare",
            label: "Поддержка после сдачи",
            type: "select",
            def: "none",
            options: [
              { id: "none", label: "Не нужна", price: 0 },
              { id: "week", label: "1 неделя", price: 1 },
              { id: "month", label: "1 месяц", price: 1.8 },
            ],
          },
          urgencyField,
        ],
      },
    ],
  },

  /* ---------------- РЕСУРСПАК ---------------- */
  {
    id: "resourcepacks",
    path: "/resourcepacks",
    title: "Создание ресурспака",
    short: "Текстуры, модели, интерфейс, шрифты и звуки.",
    desc: "Ресурспаки любой сложности: CustomModelData, CIT, интерфейс, шрифты, звуки и поддержка сервера.",
    icon: "Layers",
    group: "mc",
    priceFactor: REDUCED_PRICE_FACTOR,
    base: 1.2,
    days: [3, 6],
    steps: [
      {
        title: "Основа",
        fields: [
          versionField,
          {
            id: "res",
            label: "Разрешение текстур",
            type: "select",
            def: "16",
            options: [
              { id: "16", label: "16×16", mult: 1 },
              { id: "32", label: "32×32", mult: 1.35 },
              { id: "64", label: "64×64", mult: 1.8 },
              { id: "128", label: "128×128", mult: 2.4 },
            ],
          },
        ],
      },
      {
        title: "Содержимое",
        fields: [
          {
            id: "items",
            label: "Количество изменяемых предметов",
            type: "number",
            min: 1,
            max: 200,
            step: 1,
            def: 20,
            unit: "шт.",
            pricePerUnit: 1,
            daysPerUnit: 0.05,
          },
          { id: "blocks", label: "Блоки", type: "toggle", price: 1 },
          { id: "ui", label: "Интерфейс (GUI)", type: "toggle", price: 1 },
          { id: "fonts", label: "Шрифты", type: "toggle", price: 1 },
          { id: "sounds", label: "Звуки", type: "toggle", price: 1 },
          { id: "models", label: "3D-модели", type: "toggle", price: 1.2 },
        ],
      },
      {
        title: "Технические опции",
        fields: [
          { id: "cmd", label: "CustomModelData", type: "toggle", price: 1 },
          { id: "cit", label: "OptiFine / CIT", type: "toggle", price: 1 },
          { id: "server", label: "Поддержка сервера (авто-выдача)", type: "toggle", price: 1 },
          { id: "optimize", label: "Оптимизация размера пака", type: "toggle", price: 1 },
        ],
      },
      { title: "Дополнительно", fields: [sourcesField, urgencyField] },
    ],
  },

  /* ---------------- FANCYMENU ---------------- */
  {
    id: "fancymenu",
    path: "/fancymenu",
    title: "Настройка FancyMenu",
    short: "Кастомные меню, экраны загрузки и анимации.",
    desc: "Оформление клиента через FancyMenu: главное меню, пауза, экран загрузки, анимации и кнопки.",
    icon: "Monitor",
    group: "mc",
    base: 1.2,
    days: [2, 5],
    steps: [
      {
        title: "Основа",
        fields: [
          versionField,
          {
            id: "fmversion",
            label: "Версия FancyMenu",
            type: "select",
            def: "v3",
            options: [
              { id: "v2", label: "FancyMenu 2.x", mult: 1.1 },
              { id: "v3", label: "FancyMenu 3.x", mult: 1 },
            ],
          },
        ],
      },
      {
        title: "Экраны",
        fields: [
          { id: "main", label: "Главное меню", type: "toggle", price: 1, def: true },
          { id: "pause", label: "Меню паузы", type: "toggle", price: 1 },
          { id: "loading", label: "Загрузочный экран", type: "toggle", price: 1 },
          {
            id: "extra",
            label: "Дополнительные экраны",
            type: "number",
            min: 0,
            max: 10,
            step: 1,
            def: 0,
            unit: "шт.",
            pricePerUnit: 1,
            daysPerUnit: 0.3,
          },
        ],
      },
      {
        title: "Оформление",
        fields: [
          { id: "anim", label: "Анимации", type: "toggle", price: 1 },
          { id: "buttons", label: "Собственные кнопки", type: "toggle", price: 1 },
          { id: "logo", label: "Логотип проекта", type: "toggle", price: 1 },
          { id: "bg", label: "Кастомный фон", type: "toggle", price: 1 },
          { id: "model", label: "Модель персонажа на фоне", type: "toggle", price: 1 },
          { id: "music", label: "Музыка", type: "toggle", price: 1 },
          { id: "transitions", label: "Переходы между экранами", type: "toggle", price: 1 },
          { id: "connect", label: "Кнопка подключения к серверу", type: "toggle", price: 1 },
        ],
      },
      { title: "Дополнительно", fields: [sourcesField, urgencyField] },
    ],
  },

  /* ---------------- КАРТЫ ---------------- */
  {
    id: "maps",
    path: "/maps",
    title: "Создание карты",
    short: "Спавны, арены, приключенческие карты и ландшафт.",
    desc: "Строим карты любого масштаба: спавны, арены, лор-локации, редстоун и командные блоки.",
    icon: "Map",
    group: "content",
    base: 1.5,
    days: [4, 9],
    steps: [
      {
        title: "Тип и масштаб",
        fields: [
          {
            id: "kind",
            label: "Тип карты",
            type: "select",
            def: "spawn",
            options: [
              { id: "spawn", label: "Спавн / хаб", mult: 1 },
              { id: "arena", label: "PvP-арена", mult: 1.1 },
              { id: "adventure", label: "Приключенческая", mult: 1.6 },
              { id: "parkour", label: "Паркур", mult: 1.2 },
              { id: "city", label: "Город", mult: 1.8 },
            ],
          },
          {
            id: "size",
            label: "Размер",
            type: "select",
            def: "m",
            options: [
              { id: "s", label: "До 100×100", mult: 0.8 },
              { id: "m", label: "До 300×300", mult: 1 },
              { id: "l", label: "До 600×600", mult: 1.6 },
              { id: "xl", label: "Больше 600×600", mult: 2.2 },
            ],
          },
          {
            id: "style",
            label: "Стиль",
            type: "select",
            def: "fantasy",
            options: [
              { id: "vanilla", label: "Ванильный", mult: 0.95 },
              { id: "fantasy", label: "Фэнтези", mult: 1.1 },
              { id: "medieval", label: "Средневековье", mult: 1.1 },
              { id: "modern", label: "Современный", mult: 1.2 },
              { id: "scifi", label: "Sci-Fi", mult: 1.3 },
            ],
          },
          versionField,
        ],
      },
      {
        title: "Содержимое",
        fields: [
          {
            id: "locations",
            label: "Количество локаций",
            type: "number",
            min: 1,
            max: 40,
            step: 1,
            def: 4,
            unit: "шт.",
            pricePerUnit: 1,
            daysPerUnit: 0.4,
          },
          { id: "interior", label: "Интерьеры", type: "toggle", price: 1 },
          { id: "terrain", label: "Ручной ландшафт", type: "toggle", price: 1.2 },
          { id: "unique", label: "Уникальные постройки", type: "toggle", price: 1.2 },
        ],
      },
      {
        title: "Механика",
        fields: [
          { id: "redstone", label: "Редстоун-механизмы", type: "toggle", price: 1 },
          { id: "cmdblocks", label: "Командные блоки", type: "toggle", price: 1 },
          { id: "optimize", label: "Оптимизация карты", type: "toggle", price: 1 },
        ],
      },
      { title: "Дополнительно", fields: [urgencyField] },
    ],
  },

  /* ---------------- СКИНЫ ---------------- */
  {
    id: "skins",
    path: "/skins",
    title: "Создание скина",
    short: "Персональные скины с нуля или доработка существующих.",
    desc: "Рисуем скины: классический и slim формат, шейдинг, детализация, несколько вариантов.",
    icon: "User",
    group: "content",
    base: 1,
    days: [1, 3],
    steps: [
      {
        title: "Тип работы",
        fields: [
          {
            id: "mode",
            label: "Формат работы",
            type: "select",
            def: "new",
            options: [
              { id: "new", label: "Создание с нуля", mult: 1 },
              { id: "edit", label: "Редактирование готового", mult: 0.6 },
            ],
          },
          {
            id: "model",
            label: "Модель",
            type: "select",
            def: "classic",
            options: [
              { id: "classic", label: "Classic (4px)", mult: 1 },
              { id: "slim", label: "Slim (3px)", mult: 1 },
            ],
          },
          {
            id: "style",
            label: "Стиль",
            type: "select",
            def: "vanilla",
            options: [
              { id: "vanilla", label: "Ванильный", mult: 1 },
              { id: "detailed", label: "Детализированный", mult: 1.5 },
              { id: "fantasy", label: "Фэнтези / броня", mult: 1.7 },
            ],
          },
        ],
      },
      {
        title: "Объём",
        fields: [
          {
            id: "variants",
            label: "Количество вариантов",
            type: "number",
            min: 1,
            max: 10,
            step: 1,
            def: 1,
            unit: "шт.",
            pricePerUnit: 1,
            daysPerUnit: 0.4,
          },
          { id: "layers", label: "Дополнительные слои (шляпа, плащ)", type: "toggle", price: 1 },
          { id: "hq", label: "Повышенная детализация", type: "toggle", price: 1 },
          { id: "ref", label: "Есть референс", type: "toggle", price: -2, desc: "Скидка за готовый референс" },
        ],
      },
      { title: "Дополнительно", fields: [sourcesField, urgencyField] },
    ],
  },

  /* ---------------- ДИЗАЙН ---------------- */
  {
    id: "design",
    path: "/design",
    title: "Заказать дизайн",
    short: "Баннеры, аватары, карточки, оформление Discord и TG.",
    desc: "Графика для игровых проектов: баннеры, аватары, карточки, оформление соцсетей и сайта.",
    icon: "Paint",
    group: "content",
    base: 1,
    days: [2, 4],
    steps: [
      {
        title: "Тип дизайна",
        fields: [
          {
            id: "kind",
            label: "Что нужно оформить",
            type: "select",
            def: "banner",
            options: [
              { id: "banner", label: "Баннер", mult: 1 },
              { id: "avatar", label: "Аватар", mult: 0.8 },
              { id: "card", label: "Карточка / превью", mult: 0.9 },
              { id: "telegram", label: "Оформление Telegram", mult: 1.3 },
              { id: "discord", label: "Оформление Discord", mult: 1.4 },
              { id: "website", label: "Оформление сайта", mult: 1.9 },
            ],
          },
          {
            id: "size",
            label: "Размер",
            type: "select",
            def: "hd",
            options: [
              { id: "sm", label: "До 1000px", mult: 0.85 },
              { id: "hd", label: "HD (1920px)", mult: 1 },
              { id: "4k", label: "4K", mult: 1.4 },
            ],
          },
          {
            id: "style",
            label: "Стиль",
            type: "select",
            def: "game",
            options: [
              { id: "minimal", label: "Минимализм", mult: 0.9 },
              { id: "game", label: "Игровой", mult: 1 },
              { id: "3d", label: "3D-рендер", mult: 1.6 },
            ],
          },
        ],
      },
      {
        title: "Объём",
        fields: [
          {
            id: "count",
            label: "Количество изображений",
            type: "number",
            min: 1,
            max: 20,
            step: 1,
            def: 1,
            unit: "шт.",
            pricePerUnit: 1,
            daysPerUnit: 0.4,
          },
          sourcesField,
        ],
      },
      { title: "Дополнительно", fields: [urgencyField] },
    ],
  },

  /* ---------------- ЛОГОТИП ---------------- */
  {
    id: "logos",
    path: "/logos",
    title: "Создание логотипа",
    short: "Айдентика проекта: концепты, правки, исходники.",
    desc: "Логотипы для игровых и корпоративных проектов: концепты, правки, прозрачный фон и исходники.",
    icon: "Sparkle",
    group: "content",
    base: 1,
    days: [2, 5],
    steps: [
      {
        title: "Тип логотипа",
        fields: [
          {
            id: "kind",
            label: "Тип",
            type: "select",
            def: "combo",
            options: [
              { id: "text", label: "Текстовый", mult: 0.85 },
              { id: "symbol", label: "Символьный", mult: 1 },
              { id: "combo", label: "Комбинированный", mult: 1.25 },
            ],
          },
          {
            id: "style",
            label: "Стилистика",
            type: "select",
            def: "game",
            options: [
              { id: "game", label: "Игровая", mult: 1 },
              { id: "corp", label: "Корпоративная", mult: 1.15 },
            ],
          },
        ],
      },
      {
        title: "Объём работы",
        fields: [
          {
            id: "concepts",
            label: "Количество концептов",
            type: "number",
            min: 1,
            max: 6,
            step: 1,
            def: 2,
            unit: "шт.",
            pricePerUnit: 1,
            daysPerUnit: 0.5,
          },
          {
            id: "edits",
            label: "Количество правок",
            type: "number",
            min: 0,
            max: 10,
            step: 1,
            def: 2,
            unit: "шт.",
            pricePerUnit: 1,
            daysPerUnit: 0.2,
          },
        ],
      },
      {
        title: "Выдача файлов",
        fields: [
          { id: "transparent", label: "Прозрачный фон (PNG)", type: "toggle", price: 1, def: true },
          sourcesField,
          { id: "variants", label: "Дополнительные версии (тёмная, светлая, иконка)", type: "toggle", price: 1 },
        ],
      },
      { title: "Дополнительно", fields: [urgencyField] },
    ],
  },

  /* ---------------- ИВЕНТЫ ---------------- */
  {
    id: "events",
    path: "/events",
    title: "Заказать ивент",
    short: "Турниры, конкурсы, квесты и сезонные события.",
    desc: "Организация и проведение ивентов под ключ: сценарий, карта, плагины, ведущий, награды и трансляция.",
    icon: "Gift",
    group: "other",
    priceFactor: REDUCED_PRICE_FACTOR,
    base: 2.4,
    days: [5, 12],
    steps: [
      {
        title: "Формат",
        fields: [
          {
            id: "kind",
            label: "Тип ивента",
            type: "select",
            def: "pvp",
            options: [
              { id: "pvp", label: "PvP-турнир", mult: 1 },
              { id: "build", label: "Строительный конкурс", mult: 0.95 },
              { id: "quest", label: "Квест с сюжетом", mult: 1.4 },
              { id: "season", label: "Сезонный ивент", mult: 1.6 },
            ],
          },
          {
            id: "players",
            label: "Количество участников",
            type: "number",
            min: 4,
            max: 200,
            step: 2,
            def: 24,
            unit: "уч.",
            pricePerUnit: 1,
            daysPerUnit: 0.02,
          },
          {
            id: "duration",
            label: "Продолжительность",
            type: "number",
            min: 1,
            max: 14,
            step: 1,
            def: 2,
            unit: "дн.",
            pricePerUnit: 1,
            daysPerUnit: 0.5,
          },
          {
            id: "stages",
            label: "Количество игровых этапов",
            type: "number",
            min: 1,
            max: 12,
            step: 1,
            def: 3,
            unit: "шт.",
            pricePerUnit: 1,
            daysPerUnit: 0.3,
          },
        ],
      },
      {
        title: "Подготовка",
        fields: [
          { id: "map", label: "Карта под ивент", type: "toggle", price: 1.5 },
          { id: "script", label: "Сценарий и лор", type: "toggle", price: 1 },
          { id: "plugins", label: "Плагины под механику", type: "toggle", price: 1.5 },
          { id: "decor", label: "Оформление и графика", type: "toggle", price: 1 },
        ],
      },
      {
        title: "Проведение",
        fields: [
          { id: "host", label: "Ведущий", type: "toggle", price: 1 },
          { id: "tech", label: "Техническое сопровождение", type: "toggle", price: 1.2, def: true },
          { id: "rewards", label: "Наградная система", type: "toggle", price: 1 },
          { id: "stream", label: "Трансляция", type: "toggle", price: 1.2 },
        ],
      },
      { title: "Дополнительно", fields: [urgencyField] },
    ],
  },

  /* ---------------- САЙТЫ ---------------- */
  {
    id: "websites",
    path: "/websites",
    title: "Создание сайта",
    short: "Лендинги и многостраничные сайты для проектов.",
    desc: "Сайты для игровых сообществ: лендинги, личные кабинеты, админки, оплата и интеграции.",
    icon: "Globe",
    group: "other",
    priceFactor: REDUCED_PRICE_FACTOR,
    base: 3,
    days: [5, 14],
    steps: [
      {
        title: "Тип сайта",
        fields: [
          {
            id: "kind",
            label: "Формат",
            type: "select",
            def: "landing",
            options: [
              { id: "landing", label: "Лендинг", mult: 1 },
              { id: "multi", label: "Многостраничный сайт", mult: 1.6 },
              { id: "portal", label: "Портал / платформа", mult: 2.2 },
            ],
          },
          {
            id: "pages",
            label: "Количество страниц",
            type: "number",
            min: 1,
            max: 30,
            step: 1,
            def: 3,
            unit: "шт.",
            pricePerUnit: 1,
            daysPerUnit: 0.5,
          },
          { id: "mobile", label: "Адаптация под мобильные", type: "toggle", price: 1, def: true },
          { id: "anim", label: "Анимации и интерактив", type: "toggle", price: 1 },
        ],
      },
      {
        title: "Функциональность",
        fields: [
          { id: "auth", label: "Авторизация", type: "toggle", price: 1.5 },
          { id: "cabinet", label: "Личный кабинет", type: "toggle", price: 2.4 },
          { id: "db", label: "База данных", type: "toggle", price: 1.2 },
          { id: "admin", label: "Административная панель", type: "toggle", price: 1.8 },
          { id: "form", label: "Форма заказа / заявок", type: "toggle", price: 1 },
          { id: "bots", label: "Подключение Telegram / Discord", type: "toggle", price: 1 },
          { id: "pay", label: "Платёжная система", type: "toggle", price: 1.8 },
        ],
      },
      {
        title: "Запуск",
        fields: [
          { id: "domain", label: "Подключение домена", type: "toggle", price: 1 },
          { id: "deploy", label: "Публикация сайта", type: "toggle", price: 1, def: true },
          {
            id: "aftercare",
            label: "Дальнейшая поддержка",
            type: "select",
            def: "none",
            options: [
              { id: "none", label: "Не нужна", price: 0 },
              { id: "month", label: "1 месяц", price: 1.5 },
              { id: "quarter", label: "3 месяца", price: 3.6 },
            ],
          },
        ],
      },
      { title: "Дополнительно", fields: [urgencyField] },
    ],
  },

  /* ---------------- ПОДДЕРЖКА ---------------- */
  {
    id: "support",
    path: "/support",
    title: "Техническая поддержка",
    short: "Разовая помощь или подписка на сопровождение.",
    desc: "Диагностика, починка конфигов, устранение ошибок, обновления и бэкапы вашего проекта.",
    icon: "Heart",
    group: "other",
    base: 1,
    days: [1, 2],
    steps: [
      {
        title: "Формат помощи",
        fields: [
          {
            id: "mode",
            label: "Формат",
            type: "select",
            def: "once",
            options: [
              { id: "once", label: "Разовая помощь", mult: 1 },
              { id: "sub", label: "Подписка (месяц)", mult: 3.5 },
            ],
          },
          {
            id: "project",
            label: "Тип проекта",
            type: "select",
            def: "server",
            options: [
              { id: "server", label: "Minecraft-сервер", mult: 1 },
              { id: "modpack", label: "Модпак / клиент", mult: 1.1 },
              { id: "website", label: "Сайт", mult: 1.2 },
              { id: "bot", label: "Discord-бот", mult: 1.15 },
            ],
          },
          {
            id: "issue",
            label: "Тип проблемы",
            type: "select",
            def: "config",
            options: [
              { id: "config", label: "Конфигурации", mult: 1 },
              { id: "crash", label: "Краши и ошибки", mult: 1.3 },
              { id: "perf", label: "Производительность / лаги", mult: 1.35 },
              { id: "security", label: "Безопасность", mult: 1.4 },
            ],
          },
        ],
      },
      {
        title: "Объём работ",
        fields: [
          {
            id: "hours",
            label: "Количество часов поддержки",
            type: "number",
            min: 1,
            max: 40,
            step: 1,
            def: 2,
            unit: "ч.",
            pricePerUnit: 1,
            daysPerUnit: 0.1,
          },
          { id: "diag", label: "Удалённая диагностика", type: "toggle", price: 1, def: true },
          { id: "fixcfg", label: "Исправление конфигураций", type: "toggle", price: 1 },
          { id: "fixbugs", label: "Исправление ошибок", type: "toggle", price: 1 },
          { id: "update", label: "Обновление проекта", type: "toggle", price: 1 },
          { id: "backup", label: "Резервное копирование", type: "toggle", price: 1 },
        ],
      },
      { title: "Дополнительно", fields: [urgencyField] },
    ],
  },
];

export const SERVICE_BY_ID: Record<string, Service> = Object.fromEntries(SERVICES.map((s) => [s.id, s]));

export function getService(id: string): Service {
  const s = SERVICE_BY_ID[id];
  if (!s) throw new Error(`Unknown service: ${id}`);
  return s;
}

/* ============================================================
   Расчёт стоимости
   ============================================================ */

/** Максимальная итоговая стоимость любой услуги, € */
export const PRICE_CAP_EUR = 40;

export type Values = Record<string, string | number | boolean>;

export type QuoteLine = { label: string; value: string; amount?: number; mult?: number };

export type Quote = {
  base: number;
  addons: number;
  multPct: number;
  total: number;
  daysMin: number;
  daysMax: number;
  lines: QuoteLine[];
};

export function defaultValues(service: Service): Values {
  const v: Values = {};
  for (const step of service.steps) {
    for (const f of step.fields) {
      if (f.type === "select") v[f.id] = f.def;
      else if (f.type === "toggle") v[f.id] = f.def ?? false;
      else if (f.type === "number") v[f.id] = f.def;
      else v[f.id] = f.def ?? "";
    }
  }
  return v;
}

export function allFields(service: Service): Field[] {
  return service.steps.flatMap((s) => s.fields);
}

function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}

/** Применяет единый коэффициент услуги к сумме в базовой валюте EUR. */
export function priceForService(service: Service, amount: number) {
  return roundPrice(amount * (service.priceFactor ?? 1));
}

export function computeQuote(service: Service, values: Values): Quote {
  let addons = 0;
  let mult = 1;
  let extraDays = 0;
  let daysMult = 1;
  const lines: QuoteLine[] = [];

  for (const f of allFields(service)) {
    const val = values[f.id];
    if (f.type === "select") {
      const opt = f.options.find((o) => o.id === val) ?? f.options.find((o) => o.id === f.def);
      if (!opt) continue;
      if (opt.price) addons += opt.price;
      if (opt.mult && opt.mult !== 1) mult *= opt.mult;
      if (opt.daysMult) daysMult *= opt.daysMult;
      lines.push({
        label: f.label,
        value: opt.label,
        amount: opt.price || undefined,
        mult: opt.mult && opt.mult !== 1 ? opt.mult : undefined,
      });
    } else if (f.type === "toggle") {
      if (val) {
        if (f.price) addons += f.price;
        if (f.mult) mult *= f.mult;
        lines.push({ label: f.label, value: "да", amount: f.price || undefined });
      }
    } else if (f.type === "number") {
      const n = Number(val ?? f.def);
      const amount = Math.round(n * f.pricePerUnit * 100) / 100;
      addons += amount;
      extraDays += n * (f.daysPerUnit ?? 0);
      lines.push({ label: f.label, value: `${n} ${f.unit}`, amount });
    }
  }

  const rawBase = service.base;
  const subtotal = rawBase + addons;
  /* Потолок стоимости NCEA — доступные цены для небольших проектов. */
  const rawTotal = Math.min(PRICE_CAP_EUR, Math.max(0, Math.round(subtotal * mult)));
  const base = priceForService(service, rawBase);
  const scaledAddons = priceForService(service, addons);
  const total = priceForService(service, rawTotal);
  const scaledLines = lines.map((line) => line.amount == null ? line : { ...line, amount: priceForService(service, line.amount) });
  const daysMin = Math.max(1, Math.round((service.days[0] + extraDays * 0.6) * daysMult));
  const daysMax = Math.max(daysMin + 1, Math.round((service.days[1] + extraDays) * daysMult));

  return {
    base,
    addons: scaledAddons,
    multPct: Math.round((mult - 1) * 100),
    total,
    daysMin,
    daysMax,
    lines: scaledLines,
  };
}

export function formatEUR(n: number) {
  return `${n.toLocaleString("ru-RU")} €`;
}

/** стартовая цена услуги при значениях по умолчанию */
export function startingPrice(service: Service) {
  return computeQuote(service, defaultValues(service)).total;
}

