#!/bin/bash
# ============================================================
# Ориентир — Обновление GitHub репозитория
# ============================================================
#
# Этот скрипт обновляет https://github.com/orientirtech-afk/orientir
# новой версией сайта.
#
# Запуск:
#   cd /path/to/site_new
#   bash update_github.sh
#
# Требования:
#   - git установлен
#   - настроен SSH-ключ или HTTPS-доступ к github.com/orientirtech-afk
#   - проверьте: git config --global user.name и user.email
# ============================================================

set -e

REPO_URL="git@github.com:orientirtech-afk/orientir.git"
REPO_URL_HTTPS="https://github.com/orientirtech-afk/orientir.git"
TEMP_DIR="/tmp/orientir-update-$$"

echo "🧭 Ориентир — обновление GitHub"
echo "================================"
echo ""

# Проверяем, что мы в правильной директории
if [ ! -f "index.html" ] || [ ! -d "extension" ]; then
    echo "❌ Ошибка: запустите из директории site_new (где index.html и extension/)"
    exit 1
fi

echo "📁 Текущая директория: $(pwd)"
echo ""

# Спрашиваем подтверждение
echo "Это заменит содержимое github.com/orientirtech-afk/orientir"
echo "Продолжить? [y/N]"
read -r confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Отменено."
    exit 0
fi

echo ""
echo "📥 Клонирование существующего репозитория..."

# Пробуем SSH, потом HTTPS
if git clone "$REPO_URL" "$TEMP_DIR" 2>/dev/null; then
    echo "   ✓ SSH-доступ работает"
    REMOTE_URL="$REPO_URL"
else
    echo "   ⚠ SSH не сработал, пробуем HTTPS..."
    if git clone "$REPO_URL_HTTPS" "$TEMP_DIR" 2>/dev/null; then
        echo "   ✓ HTTPS-доступ работает"
        REMOTE_URL="$REPO_URL_HTTPS"
    else
        echo "❌ Не удалось клонировать. Проверьте доступ к GitHub."
        exit 1
    fi
fi

echo ""
echo "🗑 Удаление старых файлов из репозитория..."

# Сохраняем .git
cd "$TEMP_DIR"
# Удаляем всё кроме .git
find . -maxdepth 1 -not -name '.git' -not -name '.' -exec rm -rf {} +

echo "   ✓ Старые файлы удалены"

echo ""
echo "📋 Копирование новых файлов..."

# Копируем из site_new
# Копируем новые файлы из вашей рабочей папки Windows
cp -r "/c/Users/koc/Desktop/orenpro/Новая версия сайта/orientir-deploy-v2.7.2/orientir-new/"* .


# Удаляем .git из скопированной директории (если есть)
rm -rf .git-backup

echo "   ✓ Файлы скопированы"

echo ""
echo "📊 Статус изменений:"
git add -A
git status --short | head -20
echo "..."
TOTAL=$(git status --short | wc -l)
echo "Всего изменений: $TOTAL файлов"

echo ""
echo "💾 Создание коммита..."
git commit -m "Полное обновление: фильтр вместо ИИ-агента + browser extension

Удалено:
- pages/local_ai.html (ИИ-агент)
- pages/animation.html (Творческий суверенитет)
- 3 agent-specific блога

Добавлено:
- pages/osint.html (OSINT — методология проверки фактов)
- pages/blog/manifesto.html (Манифест)
- pages/blog/ai-future-impact.html (Видение развития ИИ)
- extension/ (Browser extension — Уровень 7)

Обновлено:
- 9 уровней с фазами реализации + дорожная карта + эволюция
- Навигация: 4 сферы вместо 5
- Все блоги и страницы обновлены
- README.md переписан
- CSS: сфера OSINT вместо local_ai

См. https://orenpro.pro/pages/blog/manifesto.html" 2>&1 | tail -5

echo ""
echo "🚀 Пуш на GitHub..."
git push origin main

echo ""
echo "✅ Готово!"
echo ""
echo "Репозиторий обновлён: https://github.com/orientirtech-afk/orientir"
echo ""
echo "Следующие шаги:"
echo "  1. Проверьте, что сайт отображается корректно"
echo "  2. Обновите продакшн-сервер (git pull в webroot)"
echo "  3. Разместите шрифты и favicon на сервере (не в репозитории)"
echo ""

# Очистка
cd /
rm -rf "$TEMP_DIR"
