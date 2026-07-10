# Ориентир — Browser Extension (Уровень 7)

**Внешний фильтр между вами и ИИ. Блокирует телеметрию, поведенческие данные и слежку на сайтах ИИ-ассистентов.**

Это реализация **Уровня 7** (Ограничение слежки) из [девяти уровней архитектуры защиты](https://orenpro.pro/pages/orientir.html) проекта «Ориентир».

## Что делает

Расширение блокирует:

- **Телеметрические запросы** к Google Analytics, Segment, Mixpanel, Amplitude, Hotjar, FullStory, Sentry, Datadog, Facebook Pixel, DoubleClick и другим tracking-сервисам
- **Поведенческие события** на window/document: mousemove, scroll, click, keydown, touchstart, visibilitychange, pagehide и другие — сайты не видят, как вы двигаете мышью, сколько времени читаете ответ, когда переключаетесь на другую вкладку
- **Canvas fingerprinting** — добавляет шум в `toDataURL`, делая отпечаток браузера нестабильным
- **WebRTC IP leak** — блокирует ICE candidates, раскрывающие локальный IP
- **AudioContext fingerprinting** — добавляет шум в AudioBuffer
- **sendBeacon к telemetry-доменам** — перехватывает отправку данных при unload
- **FingerprintJS** — подменяет библиотеку заглушкой, возвращающей случайные значения

## Защищаемые сайты

- chatgpt.com / chat.openai.com
- claude.ai
- gemini.google.com / aistudio.google.com
- perplexity.ai
- you.com
- poe.com
- character.ai
- replika.com

## Установка (Chrome / Edge / Brave)

1. Скачайте папку `extension/` на компьютер
2. Откройте `chrome://extensions/` в браузере
3. Включите **Режим разработчика** (правый верхний угол)
4. Нажмите **«Загрузить распакованное расширение»**
5. Выберите папку `extension/`
6. Иконка 🧭 появится в панели расширений

## Установка (Firefox)

1. Скачайте папку `extension/` на компьютер
2. Откройте `about:debugging#/runtime/this-firefox`
3. Нажмите **«Загрузить временное дополнение»**
4. Выберите файл `extension/manifest.json`

> ⚠️ Firefox требует Manifest V2 или адаптации V3. Для production-сборки нужен polyfill.

## Использование

- **Иконка в панели** показывает состояние: `ON` (зелёный) — защита активна, `OFF` (серый) — отключена
- **Badge с числом** — сколько запросов заблокировано за сессию
- **Клик по иконке** — открывает popup со статистикой
- **Toggle в popup** — быстро включить/выключить
- **«Настройки»** — страница конфигурации (выбор модулей защиты, сброс статистики)

## Как это работает

Расширение использует три механизма:

### 1. declarativeNetRequest (DNR)
Static rules в `rules/telemetry_rules.json` блокируют сетевые запросы к известным telemetry-доменам. Это работает на network-уровне, до того как запрос будет отправлен. DNR — это Manifest V3 replacement для webRequest blocking, эффективнее и безопаснее.

### 2. Content script (MAIN world)
Скрипт `content.js` загружается в MAIN world (не изолированный) на каждой странице AI-сайта. Он перехватывает `addEventListener` и блокирует установку listeners для поведенческих событий на window/document. Также подменяет `canvas.toDataURL`, `AudioBuffer.getChannelData`, `RTCPeerConnection`, `navigator.sendBeacon`.

### 3. Background service worker
`background.js` ведёт учёт заблокированных запросов, обновляет badge, управляет состоянием вкл/выкл. Вся статистика хранится локально (`chrome.storage.local`), никаких внешних запросов.

## Приватность

**Расширение ничего не отправляет.** Никаких external requests, кроме блокировки. Вся статистика — локальная. Код — открытый, вы можете проверить.

## Ограничения

- Content script не может удалить listeners, уже установленные до его загрузки. Поэтому `run_at: document_start` — критичен. Если сайт успел установить listeners до загрузки расширения, они продолжат работать.
- Блокировка поведенческих событий на `window/document` — компромисс. Полная блокировка (на всех элементах) сломала бы UI. Блокируем только window/document-level tracking.
- DNR правила статичны. Если сайт меняет URL telemetry-эндпоинта, нужно обновить правила.
- WebRTC защита может повлиять на видеозвонки в браузере. Если используете Google Meet / Zoom — отключите опцию WebRTC в настройках.

## Дорожная карта

- [x] Уровень 7: Ограничение слежки (этот prototype)
- [ ] Уровень 2: Стабилизация эмоций (нормализация тона ИИ)
- [ ] Уровень 4: Фиксация темпа (буфер между streaming и пользователем)
- [ ] Уровень 1: Прозрачность намерений (декларация мотиваций ИИ)
- [ ] Уровень 6: Нейтральность визуалов (CSS-injection, DOM-scrubbing)
- [ ] Уровни 3, 5, 9: ML-assisted detection

Полная дорожная карта — на [сайте проекта](https://orenpro.pro/pages/orientir.html#roadmap).

## Разработка

```
extension/
├── manifest.json              # Manifest V3
├── background.js              # Service worker — статистика, badge, toggle
├── content.js                 # Content script (MAIN world) — listener blocking
├── rules/
│   └── telemetry_rules.json   # DNR rules — блокировка запросов
├── popup/
│   ├── popup.html             # UI popup
│   └── popup.js               # Popup logic
├── options/
│   ├── options.html           # Страница настроек
│   └── options.js             # Options logic
├── icons/
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md                  # Этот файл
```

## Лицензия

MIT License — используйте, модифицируйте, распространяйте. Открытый код — принципиальная позиция проекта.

## Связанные материалы

- [Манифест Ориентира](https://orenpro.pro/pages/blog/manifesto.html) — почему мы строим фильтр, а не ИИ-агента
- [Девять уровней архитектуры защиты](https://orenpro.pro/pages/orientir.html) — полная архитектура
- [Фильтр между человеком и ИИ: зачем и как](https://orenpro.pro/pages/blog/ai-filter-future.html) — концептуальное обоснование
- [Как я вижу развитие ИИ](https://orenpro.pro/pages/blog/ai-future-impact.html) — видение траектории

## Контакты

- Email: orientir.tech@gmail.com
- GitHub: https://github.com/orientirtech-afk
- Сайт: https://orenpro.pro
