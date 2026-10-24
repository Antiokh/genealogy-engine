# Genealogy Engine — движок семейной энциклопедии

[![Engine CI](https://github.com/Antiokh/genealogy-engine/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Antiokh/genealogy-engine/actions/workflows/ci.yml)
[![Сайт: Семейная энциклопедия](https://img.shields.io/badge/%D1%81%D0%B0%D0%B9%D1%82-tree.antiokh.ru-795138)](https://tree.antiokh.ru/)
[![Люди](https://tree.antiokh.ru/badges/people.svg)](https://tree.antiokh.ru/people/)
[![События](https://tree.antiokh.ru/badges/events.svg)](https://tree.antiokh.ru/events/)
[![Места](https://tree.antiokh.ru/badges/places.svg)](https://tree.antiokh.ru/places/)
[![Фото](https://tree.antiokh.ru/badges/photos.svg)](https://github.com/Antiokh/genealogy-antiokh/tree/main/src/content/docs/media)

**Открытый движок генеалогической энциклопедии** на Astro и Starlight: страницы людей и событий, семейная навигация, родственные связи, визуализация дерева, карты, фотогалереи и оформление под архивный альбом.

В этом репозитории находятся приложение, компоненты, стили, графовые алгоритмы и генераторы. **Настоящие биографии, фотографии, источники и импорты живут в отдельном репозитории**. Здесь для разработки используется небольшой синтетический набор людей.

## Два репозитория — один сайт

| | Движок | Семейные данные и публикация |
| --- | --- | --- |
| **Репозиторий** | **[Antiokh/genealogy-engine](https://github.com/Antiokh/genealogy-engine)** (вы здесь) | **[Antiokh/genealogy-antiokh](https://github.com/Antiokh/genealogy-antiokh)** |
| **Менять здесь** | Компоненты, CSS, темы, родственные связи, визуализацию, общие скрипты | Биографии, факты, источники, портреты, импорт, настройки конкретного сайта |
| **Ключевые каталоги** | [`src/components/`](src/components/), [`src/styles/`](src/styles/), [`public/tree/`](public/tree/), [`scripts/`](scripts/) | [`src/content/docs/`](https://github.com/Antiokh/genealogy-antiokh/tree/main/src/content/docs), [`imports/`](https://github.com/Antiokh/genealogy-antiokh/tree/main/imports), [`research/`](https://github.com/Antiokh/genealogy-antiokh/tree/main/research) |
| **README** | Этот документ | **[README семейной энциклопедии](https://github.com/Antiokh/genealogy-antiokh#readme)** |

**Хотите поправить биографию?** Идите в [репозиторий семейных данных](https://github.com/Antiokh/genealogy-antiokh). **Хотите изменить вид карточки, дерево или логику сборки?** Работайте здесь. Прежде чем править код, прочитайте [AGENTS.md](AGENTS.md).

Посмотреть результат: **[tree.antiokh.ru](https://tree.antiokh.ru/)**.

## Возможности

- **Энциклопедия на Starlight:** страницы людей, событий, мест и источников, навигация по семейным группам, поиск и статическая генерация.
- **Данные как читаемые файлы:** Markdown/MDX и YAML-frontmatter. Git остаётся источником изменений; отдельная закрытая база для основного контента не требуется.
- **Генеалогическая модель:** родители, партнёры и события задаются явно; дети, сиблинги, компоненты связности и граф дерева вычисляются сборкой.
- **Интерфейс:** светлая бумажно-альбомная и тёмная кожано-металлическая темы, архивные примечания, адаптивная шапка, переключение темы и управление боковыми панелями.
- **Представления:** компоненты персональных страниц, галерей и хронологии; генерация данных для деревьев; экспериментальные рендереры [Family Chart](src/pages/trees/renderers/family-chart.astro) и [BALKAN FamilyTreeJS](src/pages/trees/renderers/balkan-familytree-classic.astro).
- **География:** карты событий и связанная с ними сборка данных на основе MapLibre.
- **Публикация:** статическая сборка Astro, подготовка изображений/OG-карточек и автоматическая доставка кода движка в репозиторий сайта.

**Важно:** синтетический пример в этом репозитории — технический полигон, а не публичная база семейной истории. Состояние и правила реального контента описаны в [README сайта](https://github.com/Antiokh/genealogy-antiokh#readme).

## Стек

| Задача | Технологии |
| --- | --- |
| Сайт и документация | Astro 7, Starlight, Markdown/MDX |
| Схемы и импортируемые данные | YAML-frontmatter, скрипты Node.js |
| Дерево и графы | BALKAN FamilyTreeJS, Vue Flow, ELK |
| Карты | MapLibre GL JS |
| Изображения | Sharp, PhotoSwipe, resvg |
| Проверки | `astro check`, специализированные проверки, GitHub Actions |

Точные версии — в [`package.json`](package.json) и [`package-lock.json`](package-lock.json). Версия Node — в [`.nvmrc`](.nvmrc).

## Быстрый старт

Требуется Node.js из [`.nvmrc`](.nvmrc) и npm:

```bash
git clone https://github.com/Antiokh/genealogy-engine.git
cd genealogy-engine
npm ci
npm run dev
```

Dev-сервер использует **только синтетические страницы** в [`src/content/docs/`](src/content/docs/). Реальный семейный контент для запуска движка не нужен.

```bash
npm run build:data   # генерация графа, карт, медиа и OG-данных
npm run check        # синтаксис, контентные и Astro-проверки
npm run build        # полная статическая сборка в dist/
npm run preview      # локальный просмотр результата
```

Перед PR рекомендуется выполнять `npm ci`, `npm run check` и `npm run build`. Этот же контракт выполняется в [Engine CI](.github/workflows/ci.yml).

## Как устроена сборка

```text
src/content/docs/ (синтетический набор в engine)
                  │
                  ▼
      Markdown + YAML frontmatter
                  │
                  ▼
 scripts/build-genealogy.mjs
 scripts/augment-genealogy-metadata.mjs
 scripts/build-tree-data.mjs
 scripts/build-events-places.mjs
 scripts/build-media.mjs
 scripts/build-og-images.mjs
                  │
                  ▼
 public/generated/ (JSON, данные визуализаций)
                  │
                  ▼
     Astro / Starlight / компоненты
                  │
                  ▼
               dist/
```

Связи, которые можно однозначно вывести из канонических записей (например, дети по родителям), **не должны поддерживаться в нескольких местах вручную**. Отдельные люди остаются доступными как записи энциклопедии, даже если у них нет рёбер в визуальном графе. Система валидирует ссылки на другие записи.

Детали реальной модели, типов сущностей и примеры frontmatter — в [документации семейных данных](https://github.com/Antiokh/genealogy-antiokh/blob/main/docs/content-model-and-build.md).

## Структура проекта

```text
.github/workflows/ci.yml       проверка движка и синхронизация после merge
src/
  components/                  компоненты страниц, галереи, карта, дерево
  content/docs/                только синтетические тестовые страницы
  content.config.ts            схема коллекции
  pages/                       дополнительные маршруты и рендереры
  scripts/                     клиентская логика визуализаций
  styles/                      темы, архивные примечания, адаптивный UI
  routeData.ts                 данные маршрутов Starlight
public/tree/                   JS/CSS-адаптеры дерева
scripts/                       общие сборочные скрипты и проверки
  sync-engine-to-content.mjs   список синхронизируемых файлов и правила
docs/engine-content-sync.md    контракт автоматической доставки
astro.config.mjs               конфигурация только демонстрационного engine
AGENTS.md                      правила работы агентов
```

Основные места для начала работы:
- [`src/styles/genealogy.css`](src/styles/genealogy.css) и [`src/styles/asides-genealogy.css`](src/styles/asides-genealogy.css) — оформление.
- [`src/components/FamilyTree.astro`](src/components/FamilyTree.astro) и [`public/tree/`](public/tree/) — генеалогические представления.
- [`scripts/build-genealogy.mjs`](scripts/build-genealogy.mjs) и [`scripts/starlight-people-sidebar.mjs`](scripts/starlight-people-sidebar.mjs) — модель связей и семейная навигация.
- [`astro.config.mjs`](astro.config.mjs) — демонстрационная Starlight-конфигурация; production-конфигурация принадлежит сайту.

## Синхронизация движка и семейной энциклопедии

В отличие от схемы, где контент переносят в движок, **здесь направление обратное**: проверенный код движка автоматически копируется в репозиторий, который собирает реальный сайт.

```text
genealogy-engine / main
  └─ Engine CI: check + build
       └─ sync-engine-to-content.mjs (разрешённые файлы)
            └─ genealogy-antiokh / main
                 └─ GitHub Actions + Cloudflare Pages
                      └─ tree.antiokh.ru
```

1. Изменение UI или общей логики попадает в PR **этого репозитория**.
2. [Engine CI](.github/workflows/ci.yml) проверяет работу с синтетическими данными.
3. После слияния в `main` успешный CI запускает [`sync-engine-to-content.mjs`](scripts/sync-engine-to-content.mjs).
4. Через repository-scoped secret `GENEALOGY_CONTENT_PUSH_TOKEN` синхронизируются **только файлы из allowlist**. В `genealogy-antiokh` появляется commit от `genealogy-engine[bot]`.
5. Файл [`.genealogy-engine-managed.json`](https://github.com/Antiokh/genealogy-antiokh/blob/main/.genealogy-engine-managed.json) перечисляет управляемые пути. Изменение кода в целевом репозитории напрямую не является штатным способом разработки.
6. Push в репозиторий сайта запускает его собственную сборку и Cloudflare Pages; **успех Engine CI сам по себе не означает успешного деплоя**.

**Что не синхронизируется:** биографии и другие файлы `src/content/docs/`, портреты `src/assets/`, импорты, исследования, production `astro.config.mjs`, зависимости, workflow сайта и локальные скрипты. В частности, `scripts/check-public-person-catalog.mjs` в двух репозиториях намеренно различается: реальные семейные тест-кейсы не заменяются синтетическими.

Если изменение движка требует новую зависимость или правку production-конфига, нужен отдельный согласованный коммит в репозиторий сайта.

Полный контракт, правила первоначальной синхронизации и диагностика: **[`docs/engine-content-sync.md`](docs/engine-content-sync.md)**.

## Публикация и диагностика

- **Публичный сайт:** [tree.antiokh.ru](https://tree.antiokh.ru/).
- **Исходные записи и конфигурация публикации:** [genealogy-antiokh](https://github.com/Antiokh/genealogy-antiokh).
- **Сборки движка:** [Engine CI](https://github.com/Antiokh/genealogy-engine/actions/workflows/ci.yml).
- **Результат публикации:** проверка `Cloudflare Pages` на коммите репозитория сайта.
- **Альтернативный хостинг GitHub Pages:** настройки и ограничения описаны в [документации сайта](https://github.com/Antiokh/genealogy-antiokh/blob/main/docs/hosting-dual-pages.md).

Если после изменения UI сайт не обновился, проверьте по цепочке: **PR → Engine CI → sync-коммит сайта → сборка сайта → Cloudflare Pages**. Не исправляйте эту проблему несогласованным редактированием синхронизированной копии CSS в `genealogy-antiokh`.

## Документация и участие

- [**AGENTS.md**](AGENTS.md) — где агентам разрешено менять код и как действовать между репозиториями.
- [**Engine → site: синхронизация**](docs/engine-content-sync.md) — список путей, CI и права доступа.
- [**README семейной энциклопедии**](https://github.com/Antiokh/genealogy-antiokh#readme) — реальная модель данных, frontmatter, импорт, редакционные правила и направления развития.
- [**Модель контента и графа**](https://github.com/Antiokh/genealogy-antiokh/blob/main/docs/content-model-and-build.md).
- [**Стратегия импорта GEDCOM**](https://github.com/Antiokh/genealogy-antiokh/blob/main/docs/gedcom-import-conflicts.md).

Движок был выделен из общего репозитория с фильтрацией истории, чтобы не переносить реальные семейные материалы в открытый исходный код. Дальнейшая разработка общего интерфейса ведётся здесь, а наполнение энциклопедии — в [репозитории данных](https://github.com/Antiokh/genealogy-antiokh).
