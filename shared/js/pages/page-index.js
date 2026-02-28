/**
 * page-index.js – уникальный JavaScript для страницы INDEX.
 * Полностью воспроизводит функциональность оригинального index.html,
 * используя общие модули ORIENTIR.
 */

// Глобальные переменные для анимаций и обработчиков
let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
let sphereTransforms = new Map();
let rafId = null;
let lastMouseTime = 0;
const MOUSE_UPDATE_RATE = 16;
let activeSphereLabel = null;
let neuralGarden = null;
let is3DEnabled = true;
let isHighQuality = true;
let isAutoRotate = true;
let isMobile = ORIENTIR.utils.DOMUtils.isMobile();

// ========== КЛАСС ParallaxSystem ==========
class ParallaxSystem {
    constructor() {
        this.layers = [];
    }

    init() {
        this.layers = [
            document.querySelector('.bg-layer-1'),
            document.querySelector('.bg-layer-2')
        ];

        window.addEventListener('scroll', ORIENTIR.utils.Performance.throttle(this.handleScroll.bind(this), 16));
        this.handleScroll();
    }

    handleScroll() {
        const scrolled = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const progress = scrolled / (documentHeight - windowHeight);

        if (this.layers[0]) {
            this.layers[0].style.transform = `translateY(${scrolled * (isMobile ? 0.05 : 0.1)}px)`;
        }
        if (this.layers[1]) {
            this.layers[1].style.transform = `translateY(${scrolled * (isMobile ? 0.02 : 0.05)}px)`;
        }

        const bgNoise = document.querySelector('.bg-noise');
        if (bgNoise) bgNoise.style.opacity = 0.1 + (progress * 0.2);
    }
}

// ========== КЛАСС ScrollAnimator ==========
class ScrollAnimator {
    constructor() {
        this.observerOptions = { threshold: 0.1, rootMargin: '50px' };
        this.observer = null;
    }

    init() {
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), this.observerOptions);
        document.querySelectorAll('.fade-in').forEach(el => this.observer.observe(el));
        this.animateTitleWords();
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }

    animateTitleWords() {
        const words = document.querySelectorAll('.title-word');
        words.forEach((word, index) => {
            if (!isMobile) {
                word.addEventListener('mouseenter', () => this.createParticleEffect(word));
            }
        });
    }

    createParticleEffect(element) {
        if (isMobile) return;
        ORIENTIR.utils.createParticleBurst(element, {
            count: 15,
            color: 'currentColor',
            distance: 100,
            size: 6,
            zIndex: 1000
        });
    }
}

// ========== ФУНКЦИИ ДЛЯ АНИМАЦИИ СФЕР ==========
function updateAnimations() {
    mouse.x += (mouse.targetX - mouse.x) * ORIENTIR.CONFIG.MOUSE_SMOOTHING;
    mouse.y += (mouse.targetY - mouse.y) * ORIENTIR.CONFIG.MOUSE_SMOOTHING;
    updateSpheres();
    if (rafId) rafId = requestAnimationFrame(updateAnimations);
}

function updateSpheres() {
    const sphereLinks = document.querySelectorAll('.sphere-link');
    if (!sphereLinks.length) return;

    if (activeSphereLabel) return;

    sphereLinks.forEach(link => {
        const sphere = link.querySelector('.sphere');
        if (!sphere) return;

        const rect = link.getBoundingClientRect();
        const linkCenterX = rect.left + rect.width / 2;
        const linkCenterY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
            Math.pow(mouse.x * window.innerWidth - linkCenterX, 2) +
            Math.pow(mouse.y * window.innerHeight - linkCenterY, 2)
        );
        const maxDistance = isMobile ? 150 : 300;
        const proximity = Math.max(0, 1 - (distance / maxDistance));

        if (proximity > 0 && neuralGarden) {
            const label = link.getAttribute('data-label');
            neuralGarden.onSphereHover(label, proximity);
        }

        const parallaxX = (mouse.x - 0.5) * ORIENTIR.CONFIG.SPHERE_FLOAT_AMPLITUDE * proximity * (isMobile ? 0.5 : 1);
        const parallaxY = (mouse.y - 0.5) * ORIENTIR.CONFIG.SPHERE_FLOAT_AMPLITUDE * proximity * (isMobile ? 0.5 : 1);

        if (!sphereTransforms.has(sphere)) sphereTransforms.set(sphere, { x: 0, y: 0 });

        const current = sphereTransforms.get(sphere);
        const smoothX = current.x + (parallaxX - current.x) * 0.1;
        const smoothY = current.y + (parallaxY - current.y) * 0.1;

        sphereTransforms.set(sphere, { x: smoothX, y: smoothY });

        sphere.style.transform = `translate(${smoothX}px, ${smoothY}px) scale(${1 + proximity * (isMobile ? 0.05 : 0.1)})`;

        const glowIntensity = isMobile ? 5 : 10 + proximity * 30;
        const color = link.dataset.color || '#4fc3f7';
        sphere.style.filter = `brightness(${1 + proximity * (isMobile ? 0.15 : 0.3)}) drop-shadow(0 0 ${glowIntensity}px ${color})`;
    });
}

function handleMouseMove(e) {
    const now = performance.now();
    if (now - lastMouseTime < MOUSE_UPDATE_RATE) return;
    lastMouseTime = now;

    mouse.targetX = e.clientX / window.innerWidth;
    mouse.targetY = e.clientY / window.innerHeight;

    if (!rafId) rafId = requestAnimationFrame(updateAnimations);
}

function initSphereInteractivity() {
    document.querySelectorAll('.sphere-link').forEach(link => {
        link.addEventListener('mouseenter', function () { this.classList.add('active'); });
        link.addEventListener('mouseleave', function () { this.classList.remove('active'); });
        link.addEventListener('focus', function () { this.classList.add('focused'); });
        link.addEventListener('blur', function () { this.classList.remove('focused'); });
    });
}

function init3DControls() {
    const toggle3DBtn = document.getElementById('toggle-3d');
    const qualityBtn = document.getElementById('quality-mode');
    const rotateBtn = document.getElementById('auto-rotate');

    if (toggle3DBtn) {
        toggle3DBtn.addEventListener('click', () => {
            if (!neuralGarden) return;
            is3DEnabled = !is3DEnabled;
            const container = document.getElementById('three-container');
            if (container) {
                container.style.opacity = is3DEnabled ? '0.7' : '0';
                container.style.pointerEvents = is3DEnabled ? 'auto' : 'none';
                toggle3DBtn.classList.toggle('active', is3DEnabled);
                const label = toggle3DBtn.querySelector('.perf-label');
                if (label) label.textContent = `3D: ${is3DEnabled ? 'Вкл' : 'Выкл'}`;
            }
        });
    }

    if (qualityBtn && neuralGarden) {
        qualityBtn.addEventListener('click', () => {
            if (!neuralGarden) return;
            isHighQuality = !isHighQuality;
            const newQuality = neuralGarden.toggleQuality();
            qualityBtn.classList.toggle('active', isHighQuality);
            const label = qualityBtn.querySelector('.perf-label');
            if (label) label.textContent = `Качество: ${isHighQuality ? 'Высокое' : 'Эконом'}`;
        });
    }

    if (rotateBtn && neuralGarden) {
        rotateBtn.addEventListener('click', () => {
            if (!neuralGarden) return;
            isAutoRotate = !isAutoRotate;
            neuralGarden.setSettings({ autoRotate: isAutoRotate });
            rotateBtn.classList.toggle('active', isAutoRotate);
            const label = rotateBtn.querySelector('.perf-label');
            if (label) label.textContent = `Вращение: ${isAutoRotate ? 'Вкл' : 'Выкл'}`;
        });
    }
}

function disable3DEffects() {
    const container = document.getElementById('three-container');
    if (container) {
        container.style.display = 'none';
        container.style.pointerEvents = 'none';
    }
    const panel = document.querySelector('.performance-panel');
    if (panel) panel.style.display = 'none';
    is3DEnabled = false;
}

// ========== ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function () {
    console.log('[INDEX] Инициализация страницы');

    // 1. 3D-сцена (EnhancedNeuralGarden)
    if (ORIENTIR.utils.DOMUtils.isWebGLAvailable() && !ORIENTIR.utils.DOMUtils.prefersReducedMotion()) {
        try {
            neuralGarden = new ORIENTIR.Three.EnhancedNeuralGarden({
                particleCount: ORIENTIR.CONFIG.PARTICLE_COUNT,
                connectionDistance: ORIENTIR.CONFIG.CONNECTION_DISTANCE,
                autoRotate: ORIENTIR.CONFIG.AUTO_ROTATE,
                quality: ORIENTIR.CONFIG.QUALITY
            });
            console.log('[3D] EnhancedNeuralGarden инициализирован');
            window.neuralGarden = neuralGarden;
        } catch (error) {
            console.warn('[3D] Ошибка инициализации:', error);
            disable3DEffects();
        }
    } else {
        disable3DEffects();
    }

    // 2. Параллакс
    const parallaxSystem = new ParallaxSystem();
    parallaxSystem.init();

    // 3. Анимации при скролле
    const scrollAnimator = new ScrollAnimator();
    scrollAnimator.init();

    // 4. Обработчики мыши (только не на мобильных)
    if (!isMobile) {
        window.addEventListener('mousemove', ORIENTIR.utils.Performance.throttle(handleMouseMove, 16), { passive: true });
    }

    // 5. Инициализация трансформаций сфер
    document.querySelectorAll('.sphere').forEach(sphere => sphereTransforms.set(sphere, { x: 0, y: 0 }));

    // 6. Интерактивность сфер
    initSphereInteractivity();

    // 7. Управление 3D-панелью (кнопки)
    if (neuralGarden) {
        init3DControls();
    }

    // 8. Запуск цикла анимации сфер (только не на мобильных)
    if (!isMobile) {
        rafId = requestAnimationFrame(updateAnimations);
    }

    // 9. Эффект частиц при наведении на авторскую сферу
    const authorSphereBtn = document.getElementById('author-sphere-btn');
    if (authorSphereBtn && !isMobile && !ORIENTIR.utils.DOMUtils.prefersReducedMotion()) {
        authorSphereBtn.addEventListener('mouseenter', function () {
            ORIENTIR.utils.createParticleBurst(this, {
                count: 8,
                color: 'radial-gradient(circle, rgba(212,165,116,0.9), rgba(255,204,128,0.7))',
                distance: 50,
                size: 4,
                zIndex: 1000
            });
        });
    }

    // 10. Кнопка "Принципы приватности"
    const privacyBtn = document.getElementById('privacy-policy-btn');
    if (privacyBtn) {
        privacyBtn.addEventListener('click', () => ORIENTIR.utils.NotificationUtils.showPrivacyPolicy('index'));
    }

    // ========== Управление bottom-sheet (авторская шторка) ==========
    const authorSheet = document.getElementById('author-sheet');
    const closeSheetBtn = document.getElementById('close-author-sheet');
    const sheetOverlay = document.querySelector('.sheet-overlay');

    if (authorSphereBtn && authorSheet) {
        // Открытие по клику
        authorSphereBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authorSheet.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        // Функция закрытия
        function closeSheet() {
            authorSheet.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Закрытие по крестику
        if (closeSheetBtn) {
            closeSheetBtn.addEventListener('click', closeSheet);
        }

        // Закрытие по оверлею
        if (sheetOverlay) {
            sheetOverlay.addEventListener('click', closeSheet);
        }

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && authorSheet.classList.contains('active')) {
                closeSheet();
            }
        });
    }

    console.log('[INDEX] Инициализация завершена');
});

// Очистка ресурсов при уходе со страницы
window.addEventListener('beforeunload', () => {
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    if (neuralGarden) {
        neuralGarden.dispose();
        neuralGarden = null;
    }
    sphereTransforms.clear();
});
