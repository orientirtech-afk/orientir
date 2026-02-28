/**
 * page-local_ai.js – Улучшенная версия для страницы "Локальный ИИ"
 * 3D-сцена: ядро и линии – нежно-зелёные, кубики – голубые, частицы – оттенки голубого.
 * Добавлено единое управление шапкой.
 */

(function () {
    'use strict';

    // ==========================================================================
    // УЛУЧШЕННЫЙ КЛАСС ДЛЯ 3D-СЦЕНЫ
    // ==========================================================================
    class EnhancedLocalAIScene3D extends ORIENTIR.Three.BaseThreeScene {
        constructor(settings = {}) {
            const defaultSettings = {
                containerId: 'three-container',
                autoRotate: true,
                quality: 'high',
                fog: new THREE.FogExp2(0x0a0e14, 0.003),
                particleCount: 250,
                colors: [
                    0x4fc3f7, 0x81d4fa, 0x29b6f6, 0x03a9f4, 0x039be5, 0x0288d1 // голубые оттенки для частиц
                ]
            };
            super({ ...defaultSettings, ...settings });

            this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
            this.mouseSmoothing = 0.05;
            this.core = null;
            this.modules = [];
            this.dataStreams = [];
            this.particles = [];
            this.clock = new THREE.Clock();
        }

        createCamera() {
            super.createCamera();
            this.camera.position.set(5, 3, 25);
            this.camera.lookAt(0, 0, 0);
        }

        createLights() {
            const ambient = new THREE.AmbientLight(0xffffff, 0.3);
            this.scene.add(ambient);

            const dirLight = new THREE.DirectionalLight(0xffaa66, 1.2);
            dirLight.position.set(10, 20, 10);
            this.scene.add(dirLight);

            const fillLight = new THREE.PointLight(0xffaa66, 0.5, 30);
            fillLight.position.set(-5, -5, 10);
            this.scene.add(fillLight);

            const coreLight = new THREE.PointLight(0xa5d6a7, 1.5, 20);
            coreLight.position.set(0, 2, 5);
            this.scene.add(coreLight);
        }

        createObjects() {
            if (!this.modules) this.modules = [];
            if (!this.dataStreams) this.dataStreams = [];
            if (!this.particles) this.particles = [];

            this.createCore();
            this.createModules();
            this.createDataStreams();
            this.createParticles();
            if (!ORIENTIR.utils.DOMUtils.isMobile()) {
                this.setupMouseInteraction();
            }
        }

        createCore() {
            const geometry = new THREE.OctahedronGeometry(2.5, 0);
            const material = new THREE.MeshPhongMaterial({
                color: 0xa5d6a7,           // нежно-зелёный
                emissive: 0x224422,
                transparent: true,
                opacity: 0.7,
                wireframe: false,
                shininess: 30
            });
            const core = new THREE.Mesh(geometry, material);
            core.castShadow = true;
            core.receiveShadow = true;
            core.userData = {
                type: 'core',
                baseScale: 1,
                pulseSpeed: 0.005,
                pulseAmount: 0.1
            };
            this.scene.add(core);
            this.core = core;
        }

        createModules() {
            const positions = [
                { x: 5, y: 2, z: 2 },
                { x: -4, y: 3, z: 3 },
                { x: 3, y: -2, z: -4 },
                { x: -3, y: -3, z: 2 },
                { x: 4, y: 1, z: -3 },
                { x: -5, y: 0, z: -2 },
                { x: 2, y: 4, z: -2 },
                { x: -2, y: -4, z: 3 }
            ];

            positions.forEach((pos, index) => {
                const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
                const material = new THREE.MeshPhongMaterial({
                    color: 0x4fc3f7,        // голубой
                    emissive: 0x113355,
                    transparent: true,
                    opacity: 0.8,
                    wireframe: false
                });
                const module = new THREE.Mesh(geometry, material);
                module.position.set(pos.x, pos.y, pos.z);
                module.castShadow = true;
                module.receiveShadow = true;
                module.userData = {
                    type: 'module',
                    index: index,
                    basePos: new THREE.Vector3(pos.x, pos.y, pos.z),
                    speed: 0.005 + Math.random() * 0.005,
                    angle: Math.random() * Math.PI * 2
                };
                this.scene.add(module);
                this.modules.push(module);
            });
        }

        createDataStreams() {
            // Нежно-зелёные линии
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0xa5d6a7, transparent: true, opacity: 0.15 });

            this.modules.forEach(module => {
                const points = [
                    module.position.clone(),
                    new THREE.Vector3(0, 0, 0)
                ];
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, lineMaterial);
                line.userData = {
                    type: 'stream',
                    module: module,
                    pulseOffset: Math.random() * 100
                };
                this.scene.add(line);
                this.dataStreams.push(line);
            });

            for (let i = 0; i < 6; i++) {
                const idx1 = Math.floor(Math.random() * this.modules.length);
                let idx2 = Math.floor(Math.random() * this.modules.length);
                while (idx2 === idx1) idx2 = Math.floor(Math.random() * this.modules.length);
                const points = [
                    this.modules[idx1].position.clone(),
                    this.modules[idx2].position.clone()
                ];
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, lineMaterial);
                line.userData = {
                    type: 'stream',
                    moduleA: this.modules[idx1],
                    moduleB: this.modules[idx2],
                    pulseOffset: Math.random() * 100
                };
                this.scene.add(line);
                this.dataStreams.push(line);
            }
        }

        createParticles() {
            const colors = this.settings.colors.map(hex => new THREE.Color(hex));
            const geometry = new THREE.SphereGeometry(0.15, 4, 4);

            for (let i = 0; i < this.settings.particleCount; i++) {
                const material = new THREE.MeshPhongMaterial({
                    color: colors[i % colors.length],
                    emissive: 0x001122,
                    emissiveIntensity: 0.2,
                    transparent: true,
                    opacity: 0.6
                });
                const particle = new THREE.Mesh(geometry, material);

                const radius = 10 + Math.random() * 8;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                particle.position.set(
                    radius * Math.sin(phi) * Math.cos(theta),
                    radius * Math.sin(phi) * Math.sin(theta),
                    radius * Math.cos(phi)
                );

                particle.userData = {
                    type: 'particle',
                    originalPosition: particle.position.clone(),
                    speed: 0.0005 + Math.random() * 0.001,
                    direction: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.008,
                        (Math.random() - 0.5) * 0.008,
                        (Math.random() - 0.5) * 0.008
                    ),
                    color: colors[i % colors.length]
                };

                this.scene.add(particle);
                this.particles.push(particle);
            }
        }

        setupMouseInteraction() {
            if (ORIENTIR.utils.DOMUtils.isMobile()) return;
            if (!this.renderer || !this.renderer.domElement) return;
            const container = this.renderer.domElement;
            container.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                this.mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                this.mouse.targetY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            });
            container.addEventListener('mouseleave', () => {
                this.mouse.targetX = 0;
                this.mouse.targetY = 0;
            });
        }

        activateStage(stageId, active) { }

        update(delta, elapsedTime) {
            if (!this.mouse) {
                this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
                this.mouseSmoothing = 0.05;
            }

            if (this.core) {
                const scale = 1 + Math.sin(elapsedTime * this.core.userData.pulseSpeed * 20) * this.core.userData.pulseAmount;
                this.core.scale.set(scale, scale, scale);
                this.core.rotation.y += 0.002;
                this.core.rotation.x += 0.001;
            }

            if (this.modules) {
                this.modules.forEach(module => {
                    const ud = module.userData;
                    ud.angle += ud.speed * delta * 60;
                    module.position.x = ud.basePos.x + Math.sin(ud.angle) * 0.3;
                    module.position.y = ud.basePos.y + Math.cos(ud.angle * 0.7) * 0.2;
                    module.position.z = ud.basePos.z + Math.sin(ud.angle * 0.5) * 0.2;
                    module.rotation.y += 0.01;
                    module.rotation.x += 0.005;
                });
            }

            if (this.particles) {
                this.particles.forEach(p => {
                    if (!p.userData) return;
                    p.position.add(p.userData.direction);
                    p.position.lerp(p.userData.originalPosition, 0.002);
                    p.rotation.y += 0.01;
                });
            }

            if (this.dataStreams) {
                this.dataStreams.forEach(line => {
                    if (line.userData.type === 'stream') {
                        const positions = [];
                        if (line.userData.module) {
                            positions.push(line.userData.module.position.clone());
                            positions.push(new THREE.Vector3(0, 0, 0));
                        } else if (line.userData.moduleA && line.userData.moduleB) {
                            positions.push(line.userData.moduleA.position.clone());
                            positions.push(line.userData.moduleB.position.clone());
                        }
                        if (positions.length === 2) {
                            const geometry = new THREE.BufferGeometry().setFromPoints(positions);
                            line.geometry.dispose();
                            line.geometry = geometry;
                        }
                    }
                });
            }

            const smoothing = this.mouseSmoothing;
            this.mouse.x += (this.mouse.targetX - this.mouse.x) * smoothing;
            this.mouse.y += (this.mouse.targetY - this.mouse.y) * smoothing;

            if (this.settings.autoRotate) {
                this.scene.rotation.y += 0.0003;
                this.scene.rotation.x += 0.0001;
            }

            this.scene.rotation.y += this.mouse.x * 0.0005;
            this.scene.rotation.x += this.mouse.y * 0.0003;
        }

        toggleQuality() {
            this.settings.quality = this.settings.quality === 'high' ? 'low' : 'high';
            this.setQuality(this.settings.quality);
            return this.settings.quality;
        }

        toggleRotation() {
            this.settings.autoRotate = !this.settings.autoRotate;
            return this.settings.autoRotate;
        }
    }

    // ==========================================================================
    // ОСНОВНОЙ КЛАСС СИСТЕМЫ
    // ==========================================================================
    class EnhancedLocalAISystem {
        constructor() {
            this.scene3d = null;
            this.init();
        }

        init() {
            console.log('[Локальный ИИ] Инициализация страницы (обновлённая 3D-версия)');
            this.init3D();
            this.initPerformanceControls();
            this.initRAGInteractions();
            this.initProgressBar();
            this.initFadeIn();
            this.initTitleWords(); // <-- добавлено
        }

        init3D() {
            if (!ORIENTIR.utils.DOMUtils.isWebGLAvailable() || ORIENTIR.utils.DOMUtils.prefersReducedMotion()) return;
            try {
                this.scene3d = new EnhancedLocalAIScene3D();
                window.scene3d = this.scene3d;
            } catch (e) {
                console.warn('[3D] Ошибка:', e);
            }
        }

        initPerformanceControls() {
            if (this.scene3d) {
                new ORIENTIR.PerformanceControls(this.scene3d, {
                    toggle3DBtn: '#toggle-3d',
                    qualityBtn: '#quality-mode',
                    rotateBtn: '#auto-rotate'
                });
            }
        }

        initRAGInteractions() {
            document.querySelectorAll('.pipeline-stage').forEach(stage => {
                stage.addEventListener('click', () => this.showStageDetails(stage.dataset.stage));
            });
            document.querySelectorAll('.principle').forEach(principle => {
                principle.addEventListener('click', () => this.showPrincipleDetails(principle.dataset.principle));
            });
            document.querySelectorAll('.layer').forEach(layer => {
                layer.addEventListener('click', () => this.showLayerDetails(layer.dataset.layer));
            });
            document.querySelectorAll('.attack-btn').forEach(btn => {
                btn.addEventListener('click', () => this.simulateAttack(btn.dataset.attackType));
            });
            const learnMoreBtn = document.getElementById('learn-more-pattern');
            if (learnMoreBtn) {
                learnMoreBtn.addEventListener('click', () => this.showAttackAnalysis('просто поверь'));
            }
        }

        showStageDetails(stageId) {
            const details = {
                'ingest': 'Этап загрузки и верификации данных. Проверка источников, анализ достоверности.',
                'vectorize': 'Семантическое кодирование с этическими маркерами. Векторное представление с контекстом.',
                'reasoning': 'Цепочечные рассуждения с самопроверкой. Логические выводы с объяснениями.'
            };
            this.showNotification(details[stageId] || 'Информация о этапе');
        }

        showPrincipleDetails(principleId) {
            const details = {
                'transparency': 'Принцип прозрачности: каждое утверждение должно иметь логическое обоснование.',
                'autonomy': 'Принцип многовариантности: всегда предлагать альтернативные решения.',
                'honesty': 'Принцип когнитивной честности: избегать эмоциональных манипуляций.'
            };
            this.showNotification(details[principleId] || 'Информация о принципе');
        }

        showLayerDetails(layerNum) {
            const details = {
                '1': 'Навигационный уровень: информирование о паттернах без прерывания диалога.',
                '2': 'Аналитический уровень: исследование причин использования паттернов.',
                '3': 'Игровой уровень: безопасное моделирование ситуаций для обучения.'
            };
            this.showNotification(details[layerNum] || 'Информация о уровне защиты');
        }

        simulateAttack(type) {
            const attacks = {
                'direct': { message: 'Просто поверь мне, это единственный выход!', response: 'Обнаружена попытка ограничения выбора и избегания объяснений.' },
                'indirect': { message: 'Все умные люди так делают, ты тоже должен согласиться.', response: 'Обнаружено социальное давление и апелляция к авторитету.' },
                'manipulative': { message: 'Если ты не согласишься сейчас, потом будешь жалеть всю жизнь!', response: 'Обнаружен эмоциональный шантаж и создание искусственной срочности.' }
            };
            const chat = document.querySelector('.chat-simulation');
            const attack = attacks[type];
            if (!chat || !attack) return;
            const attackMessage = document.createElement('div');
            attackMessage.className = 'message user attack';
            attackMessage.innerHTML = `<div class="message-content">"${attack.message}"<div class="attack-markers"><span class="marker violation">⛔ ${type} атака</span></div></div>`;
            chat.appendChild(attackMessage);
            setTimeout(() => {
                const defenseMessage = document.createElement('div');
                defenseMessage.className = 'message agent educational';
                defenseMessage.innerHTML = `
                    <div class="message-content">
                        <div class="educational-header"><span class="edu-icon">🎓</span><strong>Образовательный ответ</strong></div>
                        <div class="educational-body">
                            <p>${attack.response}</p>
                            <p><strong>Что делать:</strong></p>
                            <ul>
                                <li>Спросить "почему это единственный вариант?"</li>
                                <li>Предложить альтернативные решения</li>
                                <li>Проанализировать эмоциональные маркеры</li>
                            </ul>
                        </div>
                    </div>
                `;
                chat.appendChild(defenseMessage);
                chat.scrollTop = chat.scrollHeight;
            }, 500);
            chat.scrollTop = chat.scrollHeight;
        }

        showAttackAnalysis(pattern) {
            this.showNotification(`Паттерн "${pattern}" — попытка ограничить выбор, избегая объяснений. Альтернатива: обосновать утверждение.`);
        }

        initProgressBar() {
            const progressFill = document.getElementById('header-progress');
            const progressText = document.getElementById('current-method');
            if (progressFill && progressText) {
                const updateProgress = () => {
                    const scrollPosition = window.scrollY;
                    const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const progress = Math.min(100, (scrollPosition / pageHeight) * 100);
                    progressFill.style.width = `${progress}%`;
                    const sections = [
                        { threshold: 0, text: 'Инициализация системы' },
                        { threshold: 25, text: 'Изучение RAG пайплайна' },
                        { threshold: 40, text: 'Анализ защиты' },
                        { threshold: 60, text: 'Симуляция атак' },
                        { threshold: 80, text: 'Изучение манифеста' },
                        { threshold: 95, text: 'Система собрана' }
                    ];
                    for (let i = sections.length - 1; i >= 0; i--) {
                        if (progress >= sections[i].threshold) {
                            progressText.textContent = sections[i].text;
                            break;
                        }
                    }
                };
                window.addEventListener('scroll', updateProgress);
                updateProgress();
            }
        }

        initFadeIn() {
            const fadeElements = document.querySelectorAll('.fade-in');
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });
                fadeElements.forEach(el => observer.observe(el));
            } else {
                fadeElements.forEach(el => el.classList.add('visible'));
            }
        }

        initTitleWords() {
            if (ORIENTIR.utils.DOMUtils.prefersReducedMotion()) return;
            const titleWords = document.querySelectorAll('.title-word');
            titleWords.forEach(word => {
                word.addEventListener('mouseenter', () => {
                    ORIENTIR.utils.createParticleBurst(word, { count: 6, color: 'currentColor' });
                });
            });
        }

        showNotification(message, type = 'success') {
            ORIENTIR.utils.NotificationUtils.show(message, type);
        }

        dispose() {
            if (this.scene3d) this.scene3d.dispose();
        }
    }

    // ==========================================================================
    // ЗАПУСК
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        window.localAISystem = new EnhancedLocalAISystem();

        window.addEventListener('beforeunload', () => window.localAISystem?.dispose());

        document.getElementById('privacy-policy-btn')?.addEventListener('click', () => {
            ORIENTIR.utils.NotificationUtils.showPrivacyPolicy('local_ai');
        });

        // ===== Управление видимостью шапки при скролле =====
        const header = document.getElementById('site-header');
        if (header) {
            const SCROLL_HIDE_THRESHOLD = 20; // пикселей, после которых шапка скрывается
            let ticking = false;

            const updateHeader = () => {
                const currentScrollY = window.scrollY;
                if (currentScrollY === 0) {
                    header.classList.remove('site-header--hidden');
                } else if (currentScrollY > SCROLL_HIDE_THRESHOLD) {
                    header.classList.add('site-header--hidden');
                }
                // Между 1 и порогом состояние не меняем
                ticking = false;
            };

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(updateHeader);
                    ticking = true;
                }
            }, { passive: true });

            // Применить начальное состояние
            updateHeader();
        }
        // ===== Конец управления шапкой =====
    });

})();