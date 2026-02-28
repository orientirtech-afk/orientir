/* ==========================================================================
   utils.js – Универсальные утилиты
   ========================================================================== */

window.ORIENTIR = window.ORIENTIR || {};
ORIENTIR.utils = {};

/* ----------------- Производительность ----------------- */
ORIENTIR.utils.Performance = {
    debounce: (fn, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    },
    throttle: (fn, limit) => {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                fn(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    rafDebounce: (fn) => {
        let raf;
        return (...args) => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                fn(...args);
                raf = null;
            });
        };
    }
};

/* ----------------- DOM и определения ----------------- */
ORIENTIR.utils.DOMUtils = {
    isMobile: () => ORIENTIR.CONFIG.IS_MOBILE,

    isWebGLAvailable: () => {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    },

    prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,

    getContainerSize: (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return { width: 0, height: 0 };
        return { width: container.clientWidth, height: container.clientHeight };
    },

    hexToRgb: (hex) => {
        const bigint = parseInt(hex.slice(1), 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }
};

/* ----------------- Уведомления ----------------- */
ORIENTIR.utils.NotificationUtils = {
    show: (message, type = 'info', duration = ORIENTIR.CONFIG.NOTIFICATION_DURATION) => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : '💡'}</span>
            <span class="notification-text">${message}</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    // Единый текст для всех страниц (версия больше не используется)
    showPrivacyPolicy: (version = 'default') => {
        alert('Принципы приватности:\n\n1. Этот сайт не собирает персональные данные\n2. Не использует cookies для отслеживания\n3. Все вычисления происходят локально');
    }
};

/* ----------------- Эффект вспышки частиц (Burst) ----------------- */
ORIENTIR.utils.createParticleBurst = (element, options = {}) => {
    if (ORIENTIR.utils.DOMUtils.prefersReducedMotion()) return;

    const {
        count = 8,
        color = 'currentColor',
        distance = 50,
        duration = 800,
        size = 6,
        zIndex = 10000
    } = options;

    const rect = element.getBoundingClientRect();
    const particles = [];

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            z-index: ${zIndex};
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            filter: blur(1px);
        `;
        document.body.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const dist = distance + Math.random() * 50;
        const animDuration = duration + Math.random() * 400;

        particle.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`, opacity: 0 }
        ], { duration: animDuration, easing: 'cubic-bezier(0.2,0,0.8,1)' });

        setTimeout(() => particle.remove(), animDuration);
        particles.push(particle);
    }
    return particles;
};