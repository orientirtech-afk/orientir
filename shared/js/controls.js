/* ==========================================================================
   controls.js – Универсальное управление панелью производительности
   Зависимости: ORIENTIR.Three.BaseThreeScene (или объект с методами)
   ========================================================================== */

window.ORIENTIR = window.ORIENTIR || {};
ORIENTIR.PerformanceControls = class PerformanceControls {
    /**
     * @param {Object} scene3d - экземпляр BaseThreeScene или объект с методами toggleQuality, toggleRotation
     * @param {Object} options - селекторы и колбэки
     */
    constructor(scene3d, options = {}) {
        this.scene = scene3d;
        const defaults = {
            toggle3DBtn: '#toggle-3d',
            qualityBtn: '#quality-mode',
            rotateBtn: '#auto-rotate',
            container3d: '#three-container',
            onToggle3D: null
        };
        this.options = { ...defaults, ...options };
        this.is3DEnabled = true;
        this.init();
    }

    init() {
        const toggle3DBtn = document.querySelector(this.options.toggle3DBtn);
        const qualityBtn = document.querySelector(this.options.qualityBtn);
        const rotateBtn = document.querySelector(this.options.rotateBtn);
        const container = document.querySelector(this.options.container3d);

        if (toggle3DBtn) {
            toggle3DBtn.addEventListener('click', () => {
                this.is3DEnabled = !this.is3DEnabled;
                if (container) {
                    container.style.opacity = this.is3DEnabled ? '0.7' : '0';
                    container.style.pointerEvents = this.is3DEnabled ? 'auto' : 'none';
                }
                toggle3DBtn.classList.toggle('active', this.is3DEnabled);
                const label = toggle3DBtn.querySelector('.perf-label');
                if (label) label.textContent = `3D: ${this.is3DEnabled ? 'Вкл' : 'Выкл'}`;
                if (this.options.onToggle3D) this.options.onToggle3D(this.is3DEnabled);
            });
        }

        if (qualityBtn && typeof this.scene.toggleQuality === 'function') {
            qualityBtn.addEventListener('click', () => {
                const newQuality = this.scene.toggleQuality();
                qualityBtn.classList.toggle('active', newQuality === 'high');
                const label = qualityBtn.querySelector('.perf-label');
                if (label) label.textContent = `Качество: ${newQuality === 'high' ? 'Высокое' : 'Эконом'}`;
            });
        }

        if (rotateBtn && typeof this.scene.toggleRotation === 'function') {
            rotateBtn.addEventListener('click', () => {
                const newState = this.scene.toggleRotation();
                rotateBtn.classList.toggle('active', newState);
                const label = rotateBtn.querySelector('.perf-label');
                if (label) label.textContent = `Вращение: ${newState ? 'Вкл' : 'Выкл'}`;
            });
        }
    }
};