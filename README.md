# 🧭 Ориентир — Архитектура защиты от скрытых манипуляций ИИ

**Сайт:** [orenpro.pro](https://orenpro.pro) · **Манифест:** [Право остаться собой](https://orenpro.pro/pages/blog/manifesto.html)

Проект «Ориентир» — архитектура защиты от скрытых психологических воздействий ИИ. Девять уровней архитектуры защиты, OSINT-методология проверки фактов, методология автономного исследования. Open-source browser extension — первый прототип Уровня 7.

## Структура проекта

```
Ориентир
├── Защита (pages/orientir.html)        — 9 уровней + дорожная карта + эволюция
├── OSINT (pages/osint.html)            — методология проверки фактов без ИИ
├── Методология (pages/lab.html)        — автономное исследование без агента
├── Справочник (pages/reference.html)   — глоссарий и сравнение с privacy-инструментами
├── Блог (pages/blog/)                  — статьи, кейсы, разборы паттернов
├── RSS (feed.xml)                      — подписка без алгоритмов
└── Browser Extension (extension/)      — прототип Уровня 7 (ограничение слежки)
```

## Структура репозитория

```
.
├── index.html                    # Главная страница
├── 404.html                      # Страница 404
├── LICENSE                       # MIT (код) + CC BY 4.0 (контент)
├── manifest.json                 # PWA-манифест
├── sw.js                         # Service Worker
├── robots.txt                    # robots.txt
├── sitemap.xml                   # Sitemap
├── ai.txt                        # Инструкция для AI-краулеров
├── orenpro.conf                  # nginx-конфиг
├── .gitignore
│
├── pages/
│   ├── orientir.html             # Защита — 9 уровней, дорожная карта, эволюция
│   ├── osint.html                # OSINT — методология проверки фактов
│   ├── lab.html                  # Методология автономного исследования
│   ├── reference.html            # Глоссарий + сравнение с privacy-инструментами
│   └── blog/
│       ├── index.html            # Индекс блога (с поиском и фильтрами)
│       ├── manifesto.html        # Манифест: право остаться собой
│       ├── case-three-weeks-chatgpt.html  # Кейс: три недели с ChatGPT
│       ├── ai-future-impact.html # От текста к среде: пять эпох
│       ├── ai-filter-future.html # Почему внешний фильтр, а не этичная модель
│       ├── rlhf-cannot-derive-ought.html  # Гильотина Юма
│       ├── ai-sycophancy.html
│       ├── urgency-marketing.html
│       ├── news-headlines.html
│       ├── social-proof-fake.html
│       ├── false-dilemma-politics.html
│       └── personalization-trap.html
│
├── extension/                    # Browser Extension (Уровень 7)
│   ├── manifest.json             # Manifest V3 (два content_scripts: ISOLATED + MAIN)
│   ├── background.js             # Service worker — статистика через DNR onRuleMatchedInfo
│   ├── content-bridge.js         # Content script (ISOLATED) — мост MAIN ↔ background
│   ├── content.js                # Content script (MAIN world) — перехват API
│   ├── rules/
│   │   └── telemetry_rules.json  # 39 DNR правил блокировки
│   ├── popup/                    # UI popup (storage.onChanged вместо опроса)
│   ├── options/                  # Страница настроек (функциональные тогглы)
│   ├── icons/                    # Иконки 16/32/48/128
│   └── README.md                 # Документация расширения
│
└── assets/
    ├── css/                      # Минифицированные CSS
    └── js/                       # Минифицированные JS
```

## Что НЕ в репозитории (раздаётся сервером)

- `/favicon.ico`, `/favicon.svg`, `/favicon-96x96.png`, `/apple-touch-icon.png`
- `/web-app-manifest-192x192.png`, `/web-app-manifest-512x512.png`
- `/og-image-*.png` (og-image-index, og-image-orientir, og-image-blog)
- `/fonts/Manrope-Variable.woff2`, `/fonts/JetBrainsMono-Variable.woff2`

## Локальный запуск

Сайт — статический. Любой HTTP-сервер:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve

# nginx (локально)
nginx -p . -c orenpro.conf
```

Открыть: `http://localhost:8000`

## Установка расширения (разработка)

1. Откройте `chrome://extensions/`
2. Включите **Режим разработчика**
3. **«Загрузить распакованное расширение»** → выберите папку `extension/`
4. Иконка 🧭 появится в панели

Подробности — в [`extension/README.md`](extension/README.md).

## Деплой на сервер

```bash
# Клонировать репозиторий
git clone https://github.com/orientirtech-afk/orientir.git
cd orientir

# Скопировать файлы в webroot (пример)
sudo cp -r * /var/www/orenpro.pro/

# Перезапустить nginx
sudo nginx -t && sudo nginx -s reload
```

Шрифты и favicon должны быть размещены отдельно (не в репозитории).

## Технологии

- **Frontend:** Vanilla JS, ES-модули, Three.js (3D-сцены)
- **Сборка:** Vite (минификация, хеширование)
- **Шрифты:** Manrope Variable, JetBrains Mono Variable (self-hosted)
- **PWA:** Service Worker, Web App Manifest
- **Extension:** Manifest V3, declarativeNetRequest, content scripts (MAIN world)
- **Сервер:** nginx (orenpro.conf включён)
- **Приватность:** Нет Google Analytics, нет Яндекс.Метрики, нет cookies, нет трекеров. CSP запрещает произвольные источники.

## Архитектура защиты — 9 уровней

| Уровень | Принцип | Статус реализации |
|---------|---------|-------------------|
| 1 | Прозрачность намерений | Принцип описан, прототипа нет |
| 2 | Стабилизация эмоций | Словарь триггеров (regex) |
| 3 | Случайность подачи | Принцип описан |
| 4 | Фиксация темпа | Принцип описан |
| 5 | Интерфейс независимости | Принцип описан |
| 6 | Нейтральность визуалов | CSS-overrides (план) |
| 7 | **Ограничение слежки** | **🟡 Прототип (browser extension)** |
| 8 | Защита убеждений | Принцип описан |
| 9 | Анти-манипулятор | Rule-based checker |

Подробно — на [странице Защита](https://orenpro.pro/pages/orientir.html).

## Дорожная карта

- **Фаза 0 (2026):** Исследование, принципы, статьи ✅
- **Фаза 1 (2026–2027):** Browser Extension — Уровень 7 🟡 В разработке
- **Фаза 2 (2027–2028):** Local Proxy Filter — Уровни 1, 2, 4, 6
- **Фаза 3 (2028–2029):** ML-Assisted Detection — Уровни 3, 5, 9
- **Фаза 4 (2029–2030):** Belief Anchor System — Уровень 8
- **Фаза 5 (2030+):** Adaptive Filter for Wearable/BCI Era

## Лицензия

MIT License — используйте, модифицируйте, распространяйте.

## Контакты

- 📧 Email: orientir.tech@gmail.com
- 🐙 GitHub: [orientirtech-afk](https://github.com/orientirtech-afk)
- 🌐 Сайт: [orenpro.pro](https://orenpro.pro)

## Связанные материалы

- [Манифест Ориентира](https://orenpro.pro/pages/blog/manifesto.html) — право остаться собой в эпоху умных машин
- [Девять уровней архитектуры защиты](https://orenpro.pro/pages/orientir.html) — полная архитектура
- [Как я вижу развитие ИИ](https://orenpro.pro/pages/blog/ai-future-impact.html) — видение траектории
- [Фильтр между человеком и ИИ: зачем и как](https://orenpro.pro/pages/blog/ai-filter-future.html) — концепция
