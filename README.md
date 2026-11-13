# Шри-Ланка 2027 — адвент-календарь поездки

PWA для поездки вдвоём в Мириссу, **13–24 марта 2027**: 12 дверок-дней, план дня с картой, каталог мест, еда, «вся Шри-Ланка», шкала зверушек, прогресс («были», оценки, заметки, свои фото), брони, офлайн и синхронизация двух телефонов.

> Приложение — подарок, поэтому **цены и бюджет не показываются**: суммы остаются в `data/*.json` для планирования, а в интерфейсе вырезаются (`src/lib/noPrices.ts`).

ТЗ — [`SPEC.md`](SPEC.md). Первоисточник данных — [`source/plan.txt`](source/plan.txt).

## Быстрый старт

```bash
npm ci
npm run dev          # http://localhost:5173/Shri-/
```

Нужен Node 22+. Открыть с телефона в той же сети: `npm run dev -- --host`.

| Команда | Что делает |
|---|---|
| `npm run dev` | дев-сервер |
| `npm run build` | валидация данных → проверка типов → сборка в `dist/` |
| `npm run preview` | посмотреть сборку (с service worker) |
| `npm test` | юнит-тесты Vitest (даты, часы работы, брони, маршруты, синк, вырезание цен) |
| `npm run e2e` | smoke-тесты Playwright (главная, день, «Сегодня», карточка места) |
| `npm run validate` | проверка `data/*.json` (zod + ссылки между файлами) |
| `npm run routes` | маршруты дней через OSRM → `public/routes/*.json` |
| `npm run geocode` | проверка координат через Nominatim → `data/geocode-report.md` |
| `npm run photos` | реальные фото мест и зверей (iNaturalist, Openverse/Flickr, Wikimedia Commons) → `public/photos/` |
| `npm run drop-photos -- sinharaja:3 animal:porcupine:1` | убрать неудачное фото (номер по порядку) |
| `npm run places:google` | (по ключу) фото, рейтинг и часы кафе из Google Places |

## Как устроено

- **Vite + React 18 + TypeScript + Tailwind 4**, роутинг `HashRouter` (работает на GitHub Pages без 404).
- **Данные** — `data/*.json`, импортируются в сборку, поэтому есть офлайн с первого запуска.
- **Карта** — Leaflet + тайлы OpenStreetMap. Маршруты дней считаются **заранее** скриптом (OSRM); если файла маршрута нет, рисуются прямые пунктиры.
- **Прогресс** — IndexedDB (`idb-keyval`), каждая запись `{ v, t, d }` (значение, время, устройство). Слияние — last-write-wins по `t`: так работают и синк, и импорт.
- **Свои фото** — сжимаются до 1600px JPEG, хранятся локально в IndexedDB, не синхронизируются.
- **PWA** — `vite-plugin-pwa`: прекеш приложения и превью фото, большие фото и тайлы — CacheFirst.
- **Время** — «сегодня» считается по Шри-Ланке (UTC+5:30), даже если телефон в Ташкенте (UTC+5).

```
data/            контент: places, days, animals, templates, info, itineraries, budget (не показывается) (+ seed.json, questions.md)
scripts/         split-seed, validate-data, build-routes, geocode, fetch-photos, fetch-places, render-icons
src/data/        zod-схемы (общие для приложения и скриптов)
src/lib/         время, деньги, ссылки, маршруты, брони, часы работы, хранилище, синк, офлайн
src/screens/     Календарь, День, Сегодня, Карта, Места (Поездка / Еда / Страна), Карточка, Мини-маршрут, Ещё/*
supabase/        schema.sql для синхронизации
tests/           Playwright smoke
```

## Как править данные

Всё в `data/*.json`, код трогать не нужно. После правки: `npm run validate`.

**Добавить место** — объект в `data/places.json` (схема — `src/data/schema.ts`, тип `Place`). Обязательно: уникальный `id` (латиница, дефисы), `name`, `category`, `tier`, `howToGet`, `sources`, `region` (из `info.json → regions`), `inPlan`. Не уверены в координатах — `coordsVerified: false`. Нет данных — пишите `TODO` и строку в `data/questions.md`. **Не выдумываем.**

**Добавить или изменить день** — `data/days.json`: `date`, `title`, `emoji`, `mood` (`active | easy | rest | travel`), `doorTeaser` (текст за дверкой), `steps[]` (`time`, `title`, `kind`, необязательно `placeId`, `transport`, `durationMin`, `costLkr`/`costUsd`, `note`). Валидатор проверит, что `placeId` существуют и даты в диапазоне поездки. После изменения маршрута — `npm run routes -- --force`.

**Бронь** — у места `bookAhead: { daysBefore, note }` и `messageTemplateId`. Дедлайн = первый день места в плане − `daysBefore`. Второй шаблон `<id>-car` (машина) подтягивается автоматически.

**Шаблоны сообщений** — `data/templates.json`. Если у места есть контакт `whatsapp`, кнопка открывает `wa.me/<номер>?text=…`.

**Мини-маршруты** — `data/itineraries.json`, шаги как у дня; для 2-го и следующих дней ставьте `fromHotel: false`.

## Фото, маршруты, координаты

Скриптам нужен интернет. Из облачной среды, где собирался проект, OSRM, Wikimedia и Nominatim были недоступны, поэтому запустите их у себя:

```bash
npm run routes            # маршруты по дорогам (1 запрос/сек к публичному OSRM)
npm run geocode           # отчёт по координатам; ничего не перезаписывает
npm run photos -- --dry   # посмотреть, что найдётся
npm run photos            # скачать: только CC0 / CC BY / CC BY-SA / PD, webp 1280 + превью 400
                          # звери — iNaturalist (наблюдения со Шри-Ланки), места — Openverse (Flickr), запасной — Commons
git add data public && git commit -m "Фото и маршруты"
```

Фото кафе с Google (необязательно): ключ `GOOGLE_PLACES_API_KEY` в `.env` (см. `.env.example`), затем `npm run places:google`. Атрибуция Google и авторов показывается в карточке и на странице «Авторы фото». Фото из Google/TripAdvisor вручную не брать — лицензии.

Иконки PWA перерисовываются из `public/icons/icon.svg`: `npx tsx scripts/render-icons.ts`.

## Деплой (GitHub Pages)

1. Settings → Pages → Source: **GitHub Actions**.
2. Влить изменения в `main` — workflow `.github/workflows/deploy.yml` проверит данные, прогонит тесты, соберёт с `BASE_PATH=/<имя-репозитория>/` и опубликует.
3. Адрес: `https://<user>.github.io/<repo>/`. На телефоне: «Поделиться → На экран „Домой“» (iPhone) или «Установить приложение» (Android).

Синк на Pages: добавьте в Settings → Secrets and variables → Actions → **Variables** переменные `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` — workflow уже передаёт их в сборку (anon key публичный по своей природе, защита — RLS).

## Синхронизация двух телефонов (Supabase)

1. Создать проект на supabase.com (бесплатный план).
2. SQL Editor → выполнить [`supabase/schema.sql`](supabase/schema.sql) (таблица `progress`, RLS по коду поездки, функция `push_progress` с last-write-wins).
3. Project Settings → API: скопировать URL и `anon` key в `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. Пересобрать. В приложении: Ещё → Настройки → Синхронизация → «Новый» код → «Включить». На втором телефоне ввести тот же код.

Синкаются галочки, оценки, заметки, увиденные зверушки, статусы броней, записи меню, вишлист. Свои фото — только локально. Логина нет: доступ к строкам даёт только код поездки (≥ 8 символов; кнопка «Новый» генерирует 12 случайных) — не публикуйте его.

Без Supabase: Настройки → «Отправить ссылкой» или «Скачать файл» → на втором телефоне открыть ссылку или «Загрузить файл».

## Зверушки

`data/animals.json` — 113 видов: `family` (плитка меню: белки, летучие лисицы и крыланы, обезьяны…), `where` (id мест), `chance` (`high | medium | low`), латинское название для фото. Экран «Зверушки» (лапка в центре нижнего меню) — альбом наклеек: меню семейств с фото, шкала с уровнями, «зверушка дня», отметки «увидели» с датой, местом и заметкой; в карточке места и в дне — «Кого можно встретить».

## Офлайн

- Приложение, данные и превью фото кешируются при первом открытии.
- Настройки → **Скачать всё для офлайна** — большие фото и маршруты.
- Настройки → **Скачать карту района** — ~640 тайлов (~11 МБ): обзор Галле–Матара–Удавалаве на зумах 9–13 и детальные 14–16 вокруг отеля и мест из плана. Не больше: [правила tile.openstreetmap.org](https://operations.osmfoundation.org/policies/tiles/) запрещают массовое скачивание.

## Проверка

- Настройки → «как будто сегодня» — подменить дату (дверки, «Сегодня», дедлайны броней).
- `npm test && npm run build && npm run e2e`.
- Lighthouse (не запускался в среде сборки): `npm run build && npm run preview`, затем `npx lighthouse http://localhost:4173/Shri-/ --preset=perf --form-factor=mobile` или вкладка Lighthouse в Chrome DevTools. Цель: Performance и PWA ≥ 90.

## Что осталось / известные ограничения

- Фото, маршруты по дорогам и проверка координат ждут запуска скриптов с интернетом (см. выше). Пока — заглушки с эмодзи, пунктирные линии и приблизительные координаты.
- Меню с ценами у кафе не заполнены, кафе в других районах не собраны, мест 74 из целевых 80–100 — подробности в [`data/questions.md`](data/questions.md).
