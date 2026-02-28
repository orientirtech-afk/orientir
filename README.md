# 🧭 Ориентир | Архитектура свободного сознания

> **Философско-технический манифест о защите от манипуляций ИИ**

[![Live Demo](https://img.shields.io/badge/Live-Demo-4fc3f7?style=for-the-badge&logo=vercel)](https://orenpro.pro/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/orientirtech-afk/orientir)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-critical?style=for-the-badge)](LICENSE)

---

## 📖 О проекте

**«Ориентир»** — это интерактивная веб-платформа, исследующая архитектуру защиты сознания от манипулятивного воздействия искусственного интеллекта. Проект сочетает философский нарратив (через тексты доктора Чехова) с техническими инструментами для анализа, верификации и защиты от скрытых паттернов влияния.

### 🎯 Цель проекта

Показать возможность создания сложных, производительных интерфейсов **без тяжёлых фреймворков** (React/Vue), используя чистый JavaScript и глубокое понимание DOM/WebGL.

### 🔗 Live Demo

**Основной домен:** [https://orenpro.pro/](https://orenpro.pro/)

**GitHub Pages:** [https://orientirtech-afk.github.io/orientir/](https://orientirtech-afk.github.io/orientir/)

---

## 🛠 Стек технологий

| Категория | Технологии |
|-----------|------------|
| **Core** | HTML5, CSS3 (Variables, Grid, Animations), Vanilla JS (ES6+) |
| **3D Graphics** | Three.js (Custom Shaders, Particle Systems, Performance Optimization) |
| **Visualization** | Vis.js (Graph Visualization) |
| **Architecture** | Component-based CSS, Modular JS Classes, LocalStorage State Management |
| **Tools** | ~~SSI (Server Side Includes)~~ → *для статической версии инклюды раскрыты вручную*, PWA (manifest.json) |
| **Deployment** | GitHub Pages, Custom Domain (orenpro.pro) |

> **Примечание:** Исходная версия сайта использовала Server Side Includes (SSI) для сборки компонентов. Для публикации на GitHub Pages все директивы `<!--# include ... -->` были заменены на статическое содержимое соответствующих файлов. Таким образом, текущая версия полностью статична и не требует серверной обработки.

---

## 🚀 Ключевые фичи для разработчиков

### 1. **Производительность**
- ✅ Панель управления 3D (отключение графики для мобильных)
- ✅ Оптимизация рендер-цикла Three.js
- ✅ Debounce/Throttle для событий скролла и мыши
- ✅ CSS `will-change` и `transform` вместо `top/left`

### 2. **Доступность (A11y)**
- ✅ Полная навигация с клавиатуры (Tab, Escape, Enter)
- ✅ ARIA-атрибуты для интерактивных элементов
- ✅ Семантическая верстка (header, main, footer, section)
- ✅ Focus-visible состояния для всех кнопок

### 3. **Архитектура**
- ✅ Разделение логики (System Classes) и представления
- ✅ Изолированные стили для страниц
- ✅ Глобальная дизайн-система на CSS Variables
- ✅ Модульная структура JS (config, utils, controls, scenes)

### 4. **3D-графика**
- ✅ Кастомные сцены для каждого раздела
- ✅ Работа с шейдерами (vertex/fragment)
- ✅ Оптимизация (отключение raycasting на мобильных)
- ✅ Интерактивность (hover, mouse tracking, particles)

### 5. **SEO & Meta**
- ✅ JSON-LD разметка для поисковиков
- ✅ Open Graph & Twitter Cards
- ✅ Sitemap.xml & Robots.txt
- ✅ Запрет на обучение ИИ (noai, noimageai)

---

## 📂 Структура проекта
orientir/
├── index.html
├── LICENSE
├── manifest.json
├── og-image.png
├── robots.txt
├── sitemap.xml
├── ai.txt
├── README.md
│
├── pages/
│ ├── orientir.html
│ ├── local_ai.html
│ ├── lab.html
│ └── animation.html
│
└── shared/
├── css/
│ ├── variables.css
│ ├── base.css
│ ├── animations.css
│ ├── utilities.css
│ ├── components/
│ │ ├── parallax.css
│ │ ├── three.css
│ │ ├── hero.css
│ │ ├── chekhov.css
│ │ ├── navigation.css
│ │ ├── footer.css
│ │ ├── performance.css
│ │ ├── header.css
│ │ └── buttons.css
│ └── pages/
│ ├── page-index.css
│ ├── page-orientir.css
│ ├── page-local_ai.css
│ ├── page-lab.css
│ └── page-animation.css
│
└── js/
├── config.js
├── utils.js
├── chekhov-system.js
├── three-scene.js
├── controls.js
├── nav-init.js
└── pages/
├── page-index.js
├── page-orientir.js
├── page-local_ai.js
├── page-lab.js
└── page-animation.js

text

---

## 🎨 Страницы проекта

| Страница | Описание | Ключевые технологии |
|----------|----------|---------------------|
| **Главная** | Манифест проекта, навигация по сферам | Three.js Neural Garden, Parallax, Bottom Sheet |
| **Защита от ИИ** | 9 уровней защиты, анализатор манипуляций | Protection Matrix, Text Analyzer, Pattern Detection |
| **Локальный ИИ** | Конструктор RAG с просветительской защитой | RAG Pipeline, Educational Shield, Chat Simulation |
| **Лаборатория** | Конструктор методологии, граф исследований | Vis.js Graph, Element Library, Text Analyzer |
| **Творчество** | Арсенал инструментов, пресеты контента | Creative Universe, Arsenal Grid, Preset System |

---

## 📊 Метрики производительности

Ниже приведены средние значения метрик Lighthouse (мобильная эмуляция) для всех пяти страниц проекта. Замеры производились в режиме инкогнито без кеша.

| Метрика | Среднее значение | Диапазон по страницам |
|---------|------------------|------------------------|
| **First Contentful Paint (FCP)** | 0.4 с | 0.4 с (все страницы) |
| **Largest Contentful Paint (LCP)** | 0.9 с | 0.6 – 1.1 с |
| **Total Blocking Time (TBT)** | 6 мс | 0 – 20 мс |
| **Cumulative Layout Shift (CLS)** | 0.017 | 0.007 – 0.036 |
| **Speed Index** | 0.7 с | 0.6 – 0.8 с |

*Детальные замеры по каждой странице:*

| Страница | FCP | LCP | TBT | CLS | Speed Index |
|----------|-----|-----|-----|-----|-------------|
| Главная | 0.4 с | 0.6 с | 0 мс | 0.007 | 0.6 с |
| Защита от ИИ | 0.4 с | 1.1 с | 10 мс | 0.036 | 0.8 с |
| Локальный ИИ | 0.4 с | 0.8 с | 0 мс | 0.028 | 0.6 с |
| Лаборатория | 0.4 с | 1.1 с | 20 мс | 0.007 | 0.7 с |
| Творчество | 0.4 с | 0.9 с | 0 мс | 0.009 | 0.6 с |

Все страницы уверенно проходят пороги Core Web Vitals, демонстрируя отличную оптимизацию.

---

## 🔒 Принципы приватности

Этот проект демонстрирует подход к созданию приватных веб-систем:

1. ✅ **Не собирает персональные данные** — все вычисления происходят локально
2. ✅ **Не использует cookies для отслеживания** — только localStorage для настроек
3. ✅ **Не отправляет данные на сервер** — анализ текста работает в браузере
4. ✅ **Открытый исходный код** — весь код доступен для аудита
5. ✅ **Запрет на обучение ИИ** — meta-теги noai, noimageai

---

## 🎯 Для кого этот проект

### Для работодателей:
- Демонстрация Fullstack-мышления (архитектура, производительность, SEO)
- Показывает умение работать со сложной логикой без фреймворков
- Доказывает понимание доступности и приватности

### Для разработчиков:
- Пример модульной архитектуры на Vanilla JS
- Реализация 3D-сцен с оптимизацией под мобильные
- Паттерны State Management без внешних библиотек

### Для исследователей:
- Инструменты для анализа манипуляций
- Методология верификации информации
- Конструктор исследовательских протоколов

---

## 📝 Лицензия

© 2026 Ориентир (orenpro.pro). Все права защищены.

- ✅ Код доступен для ознакомления и некоммерческого использования
- ❌ Коммерческое копирование запрещено без письменного разрешения
- ❌ Клонирование дизайна запрещено
- 🔗 При использовании материалов ссылка на источник обязательна

По вопросам сотрудничества: [orientir.tech@gmail.com](mailto:orientir.tech@gmail.com)

---

## 🤝 Контакты

| Ресурс | Ссылка |
|--------|--------|
| **Website** | [https://orenpro.pro/](https://orenpro.pro/) |
| **GitHub** | [https://github.com/orientirtech-afk](https://github.com/orientirtech-afk) |
| **Email** | [orientir.tech@gmail.com](mailto:orientir.tech@gmail.com) |