// =============================================
// nav-init.js – подсветка активного пункта навигации
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;

    // Для nav-spheres (шапка, компактная)
    document.querySelectorAll('.nav-sphere').forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.endsWith(href) ||
            (href === '/pages/index.shtml' && (currentPath === '/' || currentPath.endsWith('/index.shtml')))) {
            link.classList.add('active');
        }
    });

    // Для подвала (опционально)
    document.querySelectorAll('.footer-project').forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.endsWith(href)) {
            link.classList.add('active');
        }
    });
});