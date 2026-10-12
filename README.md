<div align="center">
  <img src="public/images/brand/ncea-logo-mark.png" alt="Логотип NCEA" width="88">
  <h1>NCEA</h1>
  <p>Публичный сайт, сообщество и рабочая панель команды NCEA для Minecraft-проектов.</p>
  <p>
    <a href="https://github.com/Yozekkk/ncea-tra/actions/workflows/quality.yml"><img src="https://github.com/Yozekkk/ncea-tra/actions/workflows/quality.yml/badge.svg" alt="NCEA quality gates"></a>
    <img src="https://img.shields.io/badge/React-19-149eca" alt="React 19">
    <img src="https://img.shields.io/badge/TanStack_Start-1.x-ff6942" alt="TanStack Start 1.x">
    <img src="https://img.shields.io/badge/Supabase-Database_%26_Auth-3ecf8e" alt="Supabase Database and Auth">
  </p>
</div>

## О проекте

Репозиторий объединяет публичный сайт услуг NCEA, страницы сообщества и отдельное приложение для сотрудников. Публичная часть рассказывает о разработке плагинов, сборок, сайтов, дизайна и игровых событий. Зарегистрированные участники могут работать с форумом и объявлениями marketplace; доступ к административным операциям определяется ролями и политиками базы данных.

Это уже не исходный одностраничный макет: маршруты, клиентские операции и схема Supabase находятся в этом репозитории. Описание актуального состояния платформы подробнее приведено в [документации NCEA Platform](docs/ncea-platform.md).

## Что реализовано

| Часть | Возможности |
| --- | --- |
| Публичный сайт | Главная страница, страницы услуг, команды и контактов |
| Аккаунт | Регистрация, вход и профиль через Supabase Auth |
| Форум | Категории, темы и ответы; операции записи проходят через API и политики базы |
| Marketplace | Категории, карточки, собственные объявления, изображения и модерация публикаций |
| Панель команды | Пользователи, контент, модерация, аудит и отдельное рабочее пространство NCreate |

## Устройство репозитория

```text
src/routes/           Маршруты публичного приложения TanStack Start
src/features/         Auth, форум, marketplace и активность участников
src/components/site/  Компоненты публичного сайта
apps/admin/            Отдельное React/Vite-приложение для сотрудников
supabase/migrations/  Схема, функции и политики доступа PostgreSQL
supabase/functions/   Edge Function регистрации аккаунта
supabase/tests/       SQL-проверки политик и API-проверка
tests/                Тесты публичного приложения
docs/                 Документация платформы и проектные материалы
```

Публичное приложение использует React 19, TypeScript, TanStack Start/Router, Vite и Tailwind CSS. Панель сотрудников использует React 19, TypeScript и Vite. Обе части обращаются к Supabase; правила доступа задают миграции и серверные функции. В браузерном коде используется только publishable key, а сервисный ключ предназначен для серверной Edge Function.

## Локальный запуск

Для публичного приложения нужен Bun (в CI устанавливается актуальная версия). Установите зависимости и запустите Vite:

```bash
git clone https://github.com/Yozekkk/ncea-tra.git
cd ncea-tra
bun install --frozen-lockfile
bun run dev
```

Для операций с аккаунтами и сообществом скопируйте [.env.example](.env.example) в локальный `.env` и задайте `VITE_SUPABASE_URL` и `VITE_SUPABASE_PUBLISHABLE_KEY` своего проекта. Эти значения передаются браузеру; секретный `service_role` key в клиентскую конфигурацию помещать нельзя. Код содержит значения publishable key по умолчанию, поэтому для изолированной разработки явно задавайте окружение своего Supabase-проекта.

Панель сотрудников запускается отдельно. Для неё CI использует Node.js 24 и pnpm 11.19.0:

```bash
cd apps/admin
pnpm install --frozen-lockfile
pnpm dev
```

Её переменные перечислены в [apps/admin/.env.example](apps/admin/.env.example). Для входа нужны аккаунт и разрешённая роль в базе; локальный сервер сам по себе не выдаёт доступ к панели.

## Проверки и сборка

Команды публичного приложения совпадают с [quality workflow](.github/workflows/quality.yml):

```bash
bun run verify
bun run typecheck
bun run test
bun run lint
bun run build
```

`prebuild` дополнительно запускает генерацию build info и `verify`. Для локального просмотра сборки есть `bun run preview`. У панели отдельные `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` и `pnpm preview`; workflow запускает typecheck, lint и build. SQL-тесты политик находятся в `supabase/tests/` и требуют настроенной среды Supabase.

## Развёртывание и доступ

В корне лежит [конфигурация Vercel](vercel.json) для публичного сайта, а в [apps/admin/vercel.json](apps/admin/vercel.json) находятся правила маршрутизации и заголовки отдельной панели. Корневая конфигурация перенаправляет `/ncea-admin` на отдельное приложение. Само наличие конфигураций не подтверждает состояние текущего production deployment; проверяйте конкретную среду перед публикацией.

Схему и политики доступа определяют [миграции Supabase](supabase/migrations). Публичный интерфейс не заменяет проверку прав: таблицы, RPC и операции модерации контролируются базой. Не добавляйте реальные ключи, токены и содержимое `.env` в Git.

## Документация

- [NCEA Platform](docs/ncea-platform.md): схема сообщества, роли и базовая модель безопасности
- [Аудит безопасности 2026-10-12](docs/security-audit-2026-10-12.md): разбор 11 привилегированных RPC, RLS и защиты паролей
- [Third-party notices](docs/third-party-notices.md): сведения об использованных материалах
- [Проектные материалы](docs/plans): рабочие планы, которые следует сверять с кодом перед применением

Рабочее пространство NCreate в административном приложении связано с [NCreate Site](https://github.com/Yozekkk/ncreate-site), а клиентская экосистема NCreate включает [launcher](https://github.com/Yozekkk/ncreate-launcher), [pack](https://github.com/Yozekkk/ncreate-pack) и [manifests](https://github.com/Yozekkk/ncreate-manifests).
