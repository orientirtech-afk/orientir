// ============================================================
// Blog Search — клиентский поиск по статьям блога
// ============================================================
//
// Без внешних библиотек. Строит индекс из статического JSON
// (/pages/blog/search-index.json) или из DOM-карточек.
// Простое совпадение по словам в заголовке, excerpt, категории.

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const blogList = document.querySelector('.blog-grid');
    if (!blogList) return;

    const cards = Array.from(blogList.querySelectorAll('.blog-card'));

    // Создаём поисковое поле
    const searchWrap = document.createElement('div');
    searchWrap.className = 'blog-search-wrap';

    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'blog-search-input';
    searchInput.placeholder = 'Поиск по статьям...';
    searchInput.setAttribute('aria-label', 'Поиск по статьям');
    searchInput.id = 'blog-search';

    const searchHint = document.createElement('div');
    searchHint.className = 'blog-search-hint';
    searchHint.textContent = 'Введите слово — фильтр сработает сразу';

    searchWrap.appendChild(searchInput);
    searchWrap.appendChild(searchHint);

    // Вставляем перед фильтрами
    const filters = document.querySelector('.blog-filters');
    if (filters && filters.parentNode) {
      filters.parentNode.insertBefore(searchWrap, filters);
    } else {
      blogList.parentNode.insertBefore(searchWrap, blogList);
    }

    // CSS
    const style = document.createElement('style');
    style.textContent = `
      .blog-search-wrap {
        margin-bottom: 24px;
        max-width: 520px;
      }
      .blog-search-input {
        width: 100%;
        padding: 12px 16px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        color: var(--color-text-primary, #e8e8e8);
        font-size: 1rem;
        font-family: inherit;
        transition: all 0.2s;
      }
      .blog-search-input:focus {
        outline: none;
        border-color: var(--color-accent-cyan, #80cbc4);
        background: rgba(255,255,255,0.06);
        box-shadow: 0 0 0 3px rgba(128,203,196,0.1);
      }
      .blog-search-input::placeholder { color: var(--color-text-muted, #888); }
      .blog-search-hint {
        font-size: 0.82rem;
        color: var(--color-text-muted, #888);
        margin-top: 6px;
        padding-left: 4px;
      }
      .blog-card.search-hidden { display: none !important; }
      .blog-search-empty {
        grid-column: 1 / -1;
        padding: 32px;
        text-align: center;
        color: var(--color-text-muted, #888);
        font-style: italic;
      }
    `;
    document.head.appendChild(style);

    // Функция поиска
    function performSearch(query) {
      const q = query.trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach(card => {
        if (!q) {
          card.classList.remove('search-hidden');
          visibleCount++;
          return;
        }

        const title = (card.querySelector('.blog-card-title')?.textContent || '').toLowerCase();
        const excerpt = (card.querySelector('.blog-card-excerpt')?.textContent || '').toLowerCase();
        const category = (card.querySelector('.blog-card-category')?.textContent || '').toLowerCase();

        // Совпадение по любому слову запроса
        const words = q.split(/\s+/).filter(w => w.length > 0);
        const matches = words.every(w => title.includes(w) || excerpt.includes(w) || category.includes(w));

        if (matches) {
          card.classList.remove('search-hidden');
          visibleCount++;
        } else {
          card.classList.add('search-hidden');
        }
      });

      // Показываем empty state
      let empty = blogList.querySelector('.blog-search-empty');
      if (visibleCount === 0 && q) {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'blog-search-empty';
          blogList.appendChild(empty);
        }
        empty.textContent = `Ничего не найдено по запросу «${query}»`;
      } else if (empty) {
        empty.remove();
      }

      // Обновляем подсказку
      if (q) {
        searchHint.textContent = `Найдено: ${visibleCount} ${pluralize(visibleCount, ['статья', 'статьи', 'статей'])}`;
      } else {
        searchHint.textContent = 'Введите слово — фильтр сработает сразу';
      }
    }

    function pluralize(n, forms) {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod100 >= 11 && mod100 <= 14) return forms[2];
      if (mod10 === 1) return forms[0];
      if (mod10 >= 2 && mod10 <= 4) return forms[1];
      return forms[2];
    }

    // Debounced input
    let timer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => performSearch(e.target.value), 150);
    });

    // Сброс по Escape
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        performSearch('');
        searchInput.blur();
      }
    });

    // Shortcut: '/' фокусирует поиск
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          searchInput.focus();
        }
      }
    });
  });
})();
