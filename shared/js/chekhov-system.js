// =====================================================
// chekhov-system.js – Универсальное управление блоками Чехова
// Работает по классам, поддерживает несколько блоков на странице
// =====================================================

class ChekhovBlock {
    constructor(container) {
        this.container = container;
        this.toggle = container.querySelector('.about-toggle');
        this.content = container.querySelector('.about-content');
        this.closeBtn = container.querySelector('.chekhov-close-btn');
        this.isOpen = false;
        this.isAnimating = false;
        this.animationDuration = 800; // ms

        if (!this.toggle || !this.content) return;
        this.init();
    }

    init() {
        this.toggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleBlock();
        });

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        }

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Начальное состояние – закрыто
        this.content.classList.remove('active');
        this.toggle.classList.remove('active');
    }

    toggleBlock() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.toggle.classList.add('active');
        this.content.classList.add('active');
        setTimeout(() => {
            this.isAnimating = false;
        }, this.animationDuration);
    }

    close() {
        this.isOpen = false;
        this.toggle.classList.remove('active');
        this.content.classList.remove('active');
        setTimeout(() => {
            this.isAnimating = false;
        }, this.animationDuration);
    }
}

// Автоинициализация всех блоков Чехова при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.about-project').forEach(el => new ChekhovBlock(el));
});