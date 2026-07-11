# Changelog

Все заметные изменения проекта «Ориентир» документируются здесь.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
версионирование — [Semantic Versioning](https://semver.org/lang/ru/).

## [0.3.1] — 2026-07-11

### Удалено
- **Сайт: TOC для длинных статей** — `article-toc.js` убран из всех статей блога. Файл удалён. Sticky-оглавление и reading progress bar больше не показываются.
- **Сайт: FAQ-раздел** из `pages/reference.html`. Страница теперь содержит только глоссарий и сравнительную таблицу. Заголовок страницы обновлён: «Глоссарий и сравнение».
- **Сайт: SRI-хеши** — `integrity` и добавленный `crossorigin="anonymous"` убраны из всех `<script>` и `<link>`. SRI ломал загрузку стилей из-за дублирующего атрибута `crossorigin` (в исходных тегах уже был `crossorigin` без значения).

## [0.3.0] — 2026-07-11

### Добавлено
- **Расширение: пауза на 1 час.** Кнопка «⏸ Пауза 1ч» в popup. Отключает защиту на час, автоматически возобновляет через `chrome.alarms`. Можно возобновить вручную.
- **Расширение: Export/Import настроек.** Экспорт опций + whitelist в JSON-файл. Импорт — восстановление из файла. Для бэкапа и переноса между устройствами.
- **Расширение: Whitelist сайтов.** Опции теперь показывают список защищаемых доменов с возможностью добавить свой (например, локальную Ollama Web UI) или удалить существующий.
- **Сайт: RSS-фид блога** (`/feed.xml`). Подписка без алгоритмов и email-рассылок.
- **Сайт: Справочник** (`/pages/reference.html`) — глоссарий (16 терминов) и сравнительная таблица с uBlock Origin, Privacy Badger, NoScript.
- **Сайт: Категория «Кейсы» в блоге.** Стартовый кейс «Три недели с ChatGPT: что я заметил в собственном мышлении».
- **Сайт: Поиск по блогу.** Client-side фильтр по статьям. Hotkey `/` для фокуса.
- **Сайт: Print-friendly CSS.** `@media print` — сброс тёмной темы, скрытие навигации, читаемый чёрный текст на белом.
- **Сайт: BreadcrumbList JSON-LD** для всех статей блога.
- **Документация: CONTRIBUTING.md** с инструкциями для контрибьюторов.
- **Документация: Issue templates** (bug report, feature request, pattern submission).
- **Документация: LICENSE** (MIT для кода + CC BY 4.0 для контента).

### Изменено
- **Сайт: nginx-конфиг** — добавлены Brotli (15-20% эффективнее gzip) и HTTP/3 (Chrome 116+, Firefox 114+).
- **Сайт: блок «OrenPro»** в футере главной — объединённое описание проекта и услуг.
- **Сайт: заголовок блога** — «Блог» вместо «Блог и исследования», расширенный подзаголовок.
- **Сайт: Манифест переписан** — объединяет суть «От автора», «Фильтра» и «Как я вижу развитие ИИ». Заголовок: «Право остаться собой».
- **Сайт: 3D-сцена выключена по умолчанию на мобильных** — экономия батареи и трафика. Кнопка toggle работает.
- **Сайт: noscript fallback** для глав Чехова — без JS главы разворачиваются автоматически.
- **Сайт: удалены орфанные ассеты** (`pages_local_ai-*.js`, `pages_animation-*.js` + соответствующие CSS).
- **Сайт: удалён мёртвый CSS** для `[data-page=local_ai]` и `[data-page=animation]`.
- **Сайт: robots.txt очищен** от несуществующих Disallow.
- **Сайт: update_github.sh** — динамический путь вместо хардкода `/home/z/my-project/site_new`.
- **Расширение: architecture** — добавлен `content-bridge.js` (ISOLATED world) для моста MAIN ↔ background.
- **Расширение: статистика** — используется `declarativeNetRequest.onRuleMatchedInfo` (единственный источник истины, без дублирования паттернов).
- **Расширение: popup.js** — `chrome.storage.onChanged` вместо `setInterval`.
- **Расширение: защиты улучшены** — canvas шумит 4 пикселя (seed-based), WebRTC блокирует и `typ host`, и `typ srflx`, AudioContext шумит 5 сэмплов + AnalyserNode, FingerprintJS ловится через `Object.defineProperty` + перехват `import()`.
- **Расширение: убраны лишние permissions** — `scripting` и `web_accessible_resources` (не использовались).

### Исправлено
- **Расширение: content.js messaging** — MAIN world не имеет доступа к `chrome.runtime`. Добавлен bridge в ISOLATED world.
- **Расширение: опции в options.js** — тогглы не применялись (теперь функциональны через bridge).
- **Расширение: webRequest listener** — слушал `<all_urls>`, теперь только AI-домены.
- **Сайт: битые ссылки** в `rlhf-cannot-derive-ought.html` (bayesian-portfolio, rpg-projective-diagnosis).
- **Сайт: лицензионная путаница** — README говорил MIT, footer «Все права защищены». Приведено к единому виду (MIT + CC BY 4.0).

## [0.2.0] — 2026-07-10

### Добавлено
- Расширение: bridge между MAIN и ISOLATED world (`content-bridge.js`).
- Расширение: `declarativeNetRequestFeedback` permission для подсчёта заблокированных.
- Сайт: noscript fallback для глав Чехова.
- Сайт: LICENSE-файл.

### Изменено
- Расширение: переписан `background.js` — статистика через `onRuleMatchedInfo`.
- Расширение: переписан `content.js` — все защиты уважают опции.
- Расширение: переписан `popup.js` — `storage.onChanged` вместо опроса.
- Сайт: footer'ы во всех 15 HTML — обновлён копирайт (MIT + CC BY 4.0).

### Исправлено
- Сайт: удалены орфанные ассеты.
- Сайт: удалены битые ссылки.
- Сайт: удалён мёртвый CSS.

## [0.1.0] — 2026-07-10

### Добавлено
- Первый прототип расширения (Manifest V3).
- 39 DNR-правил блокировки телеметрии.
- Content script в MAIN world — перехват addEventListener, canvas, WebRTC, AudioContext, sendBeacon.
- Background service worker — статистика, badge, toggle.
- 9 уровней архитектуры защиты.
- 10 паттернов манипуляций.
- OSINT-методология.
- 4 принципа автономного исследования.
- 10 статей в блоге.
- PWA-манифест, Service Worker.
- nginx-конфиг с CSP, HSTS, security headers.
- robots.txt, sitemap.xml, ai.txt.
