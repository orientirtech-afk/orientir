/**
 * page-animation.js – УНИКАЛЬНЫЙ JS ДЛЯ СТРАНИЦЫ "ТВОРЧЕСТВО"
 * Исправленная версия: устранено дублирование метода createObjects,
 * добавлена защита от отсутствия объекта mouse в update.
 * Добавлено единое управление шапкой.
 * Удалён блок анализатора этичности.
 */

(function () {
    'use strict';

    // ==========================================================================
    // ДАННЫЕ
    // ==========================================================================

    const CREATIVE_CONFIG = {
        MOUSE_SMOOTHING: 0.08,
        ORBITAL_OBJECTS_COUNT: 25,
        CONNECTION_DISTANCE: 120,
        AUTO_ROTATE: true,
        QUALITY: 'high',
        CREATIVE_PALETTE: [
            0xF48FB1, 0x4FC3F7, 0xA5D6A7, 0xFFCC80, 0xB39DDB, 0x80CBC4
        ]
    };

    const creativeLevels = [
        { id: 'conceptual', title: '📋 Концептуальная автономия', description: 'Идея, стратегия, архитектура проекта', color: 'var(--color-accent-blue)', rgb: '79,195,247', icon: '📋', tools: [] },
        { id: 'narrative', title: '✍️ Нарративный суверенитет', description: 'Текст, структура, смысловая прозрачность', color: 'var(--color-accent-green)', rgb: '165,214,167', icon: '✍️', tools: [] },
        { id: 'visual', title: '🎨 Визуальная независимость', description: 'Графика, видео, контроль над образами', color: 'var(--color-accent-yellow)', rgb: '255,204,128', icon: '🎨', tools: [] },
        { id: 'motion', title: '✨ Движение без манипуляций', description: 'Анимация, эффекты, контроль внимания', color: 'var(--color-accent-pink)', rgb: '244,143,177', icon: '✨', tools: [] },
        { id: 'audio', title: '🎵 Аудиальный суверенитет', description: 'Звук, музыка, эмоциональный контроль', color: 'var(--color-accent-purple)', rgb: '179,157,219', icon: '🎵', tools: [] },
        { id: 'final', title: '🎬 Финальная верификация', description: 'Монтаж, цвет, этичная публикация', color: 'var(--color-accent-cyan)', rgb: '128,203,196', icon: '🎬', tools: [] }
    ];

    const arsenalTools = [
        { id: 'obsidian', name: 'Obsidian', category: 'writing', level: 'conceptual', description: 'Картирование идей в локальном графе знаний', ethical: true, local: true, tags: ['суверенитет', 'оффлайн', 'приватность'], protection: '🛡️ Полный контроль над данными' },
        { id: 'logseq', name: 'Logseq', category: 'writing', level: 'conceptual', description: 'Иерархическое планирование с локальным хранением', ethical: true, local: true, tags: ['outliner', 'локально', 'знания'], protection: '🔓 Открытый исходный код' },
        { id: 'kitty_scroll', name: 'Kitty Scroll', category: 'writing', level: 'narrative', description: 'Писательский редактор в терминале без телеметрии', ethical: true, local: true, tags: ['терминал', 'Vim', 'минимализм'], protection: '⚡ Нулевая телеметрия' },
        { id: 'local_llm', name: 'Локальная LLM', category: 'ai', level: 'narrative', description: 'Помощь в написании без отправки данных в облако', ethical: true, local: true, tags: ['Ollama', 'приватность', 'локальный ИИ'], protection: '🛡️ Данные остаются на устройстве' },
        { id: 'krita', name: 'Krita', category: 'visual', level: 'visual', description: 'Цифровая живопись с открытым исходным кодом', ethical: true, local: true, tags: ['рисование', 'open-source', 'бесплатно'], protection: '🔓 FOSS, сообщество-driven' },
        { id: 'gimp', name: 'GIMP', category: 'visual', level: 'visual', description: 'Редактирование изображений без подписок', ethical: true, local: true, tags: ['фоторедактор', 'альтернатива Photoshop'], protection: '⚖️ Этичная лицензия' },
        { id: 'blender', name: 'Blender', category: 'visual', level: 'motion', description: '3D-анимация и рендеринг с открытым кодом', ethical: true, local: true, tags: ['3D', 'анимация', 'рендеринг'], protection: '🌍 Глобальное сообщество' },
        { id: 'synfig', name: 'Synfig Studio', category: 'visual', level: 'motion', description: '2D-анимация с векторным рендерингом', ethical: true, local: true, tags: ['2D', 'векторная анимация'], protection: '🔓 Открытые стандарты' },
        { id: 'audacity', name: 'Audacity', category: 'audio', level: 'audio', description: 'Запись и редактирование звука локально', ethical: true, local: true, tags: ['аудио', 'запись', 'редактирование'], protection: '🛡️ Без облачной обработки' },
        { id: 'ardour', name: 'Ardour', category: 'audio', level: 'audio', description: 'Цифровая звуковая рабочая станция', ethical: true, local: true, tags: ['DAW', 'микширование'], protection: '⚡ Производительность на устройстве' },
        { id: 'kdenlive', name: 'Kdenlive', category: 'visual', level: 'final', description: 'Профессиональный видеомонтаж с открытым кодом', ethical: true, local: true, tags: ['видеомонтаж', 'эффекты', 'цветокоррекция'], protection: '🔍 Прозрачность алгоритмов' },
        { id: 'handbrake', name: 'HandBrake', category: 'visual', level: 'final', description: 'Конвертация видео без телеметрии', ethical: true, local: true, tags: ['конвертация', 'кодирование'], protection: '🛡️ Без отправки данных' }
    ];

    // ==========================================================================
    // КЛАСС-НАСЛЕДНИК ДЛЯ 3D-СЦЕНЫ
    // ==========================================================================
    class CreativeScene3D extends ORIENTIR.Three.BaseThreeScene {
        constructor(settings = {}) {
            // Подготовка данных для super
            const creativePalette = [
                ORIENTIR.CONFIG.COLORS.PRIMARY_PINK,
                ORIENTIR.CONFIG.COLORS.PRIMARY_BLUE,
                ORIENTIR.CONFIG.COLORS.PRIMARY_GREEN,
                ORIENTIR.CONFIG.COLORS.PRIMARY_YELLOW,
                ORIENTIR.CONFIG.COLORS.PRIMARY_PURPLE,
                ORIENTIR.CONFIG.COLORS.PRIMARY_CYAN
            ].map(hex => new THREE.Color(hex));
            const defaultSettings = {
                containerId: 'creative-universe',
                autoRotate: ORIENTIR.CONFIG.AUTO_ROTATE !== false,
                quality: ORIENTIR.CONFIG.QUALITY || 'high',
                fog: new THREE.Fog(0x0a0e14, 15, 100),
                creativePalette: creativePalette,
                creativeObjects: []
            };

            // Вызов super
            super({ ...defaultSettings, ...settings });

            // Сохраняем переданные массивы для использования в методах
            this.creativePalette = this.settings.creativePalette;
            this.creativeObjects = this.settings.creativeObjects;
            this.orbitalObjects = this.settings.orbitalObjects || [];

            // Инициализация полей для мыши
            this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
            this.mouseSmoothing = 0.08;
        }

        // ЕДИНСТВЕННЫЙ МЕТОД createObjects (второй дублирующий удалён)
        createObjects() {
            this.createCreativeCore();
            this.createOrbitalObjects();
        }

        createCamera() {
            super.createCamera();
            this.camera.position.set(0, 8, 30);
        }

        createLights() {
            const ambient = new THREE.AmbientLight(0xffffff, 0.4);
            this.scene.add(ambient);
            const keyLight = new THREE.DirectionalLight(0xf48fb1, 0.7);
            keyLight.position.set(25, 25, 25);
            this.scene.add(keyLight);
            const fillLight = new THREE.DirectionalLight(0x4fc3f7, 0.3);
            fillLight.position.set(-25, -25, -25);
            this.scene.add(fillLight);
        }

        createCreativeCore() {
            const geometry = new THREE.IcosahedronGeometry(6, 3);
            const material = new THREE.MeshPhongMaterial({
                color: this.creativePalette[0],
                emissive: this.creativePalette[0],
                emissiveIntensity: 0.2,
                transparent: true,
                opacity: 0.6
            });
            const core = new THREE.Mesh(geometry, material);
            core.userData = { type: 'creative-core', rotationSpeed: 0.0007 };
            this.scene.add(core);
            this.creativeObjects.push(core);
        }

        createOrbitalObjects() {
            const palette = this.creativePalette;
            const count = 25;
            for (let i = 0; i < count; i++) {
                const geometry = new THREE.SphereGeometry(0.6 + Math.random() * 1.2, 24, 24);
                const color = palette[Math.floor(Math.random() * palette.length)];
                const material = new THREE.MeshPhongMaterial({
                    color,
                    transparent: true,
                    opacity: 0.8 + Math.random() * 0.2
                });
                const mesh = new THREE.Mesh(geometry, material);

                const radius = 12 + Math.random() * 25;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                mesh.position.set(
                    radius * Math.sin(phi) * Math.cos(theta),
                    radius * Math.sin(phi) * Math.sin(theta),
                    radius * Math.cos(phi)
                );

                mesh.userData = {
                    type: 'orbital',
                    radius,
                    theta,
                    phi,
                    thetaSpeed: 0.0003 + Math.random() * 0.0007,
                    phiSpeed: (Math.random() - 0.5) * 0.0002
                };

                this.scene.add(mesh);
                this.orbitalObjects.push(mesh);
                this.creativeObjects.push(mesh);
            }
        }

        update(delta, elapsedTime) {
            // Защита от отсутствия объекта mouse (если конструктор не успел инициализировать)
            if (!this.mouse) {
                console.warn('[3D] mouse отсутствует, инициализирую заново');
                this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
                this.mouseSmoothing = 0.08;
            }

            this.orbitalObjects.forEach(obj => {
                const ud = obj.userData;
                ud.theta += ud.thetaSpeed * delta * 60;
                ud.phi += ud.phiSpeed * delta * 60;
                obj.position.x = ud.radius * Math.sin(ud.phi) * Math.cos(ud.theta);
                obj.position.y = ud.radius * Math.sin(ud.phi) * Math.sin(ud.theta);
                obj.position.z = ud.radius * Math.cos(ud.phi);
                obj.rotation.x += 0.01;
                obj.rotation.y += 0.01;
            });

            this.creativeObjects.forEach(obj => {
                if (obj.userData.type === 'creative-core') {
                    obj.rotation.y += obj.userData.rotationSpeed * delta * 60;
                    obj.rotation.x += 0.0003 * delta * 60;
                }
            });

            this.mouse.x += (this.mouse.targetX - this.mouse.x) * this.mouseSmoothing;
            this.mouse.y += (this.mouse.targetY - this.mouse.y) * this.mouseSmoothing;

            if (this.settings.autoRotate) {
                this.scene.rotation.y += 0.00025;
                this.scene.rotation.x += 0.0001;
            }
            this.scene.rotation.y += this.mouse.x * 0.0002;
            this.scene.rotation.x += this.mouse.y * 0.0002;
        }

        toggleUniverse() {
            this.settings.autoRotate = !this.settings.autoRotate;
            return this.settings.autoRotate;
        }

        toggleQuality() {
            this.settings.quality = this.settings.quality === 'high' ? 'low' : 'high';
            this.setQuality(this.settings.quality);
            return this.settings.quality;
        }

        toggleAutoRotate() {
            this.settings.autoRotate = !this.settings.autoRotate;
            return this.settings.autoRotate;
        }
    }

    // ==========================================================================
    // КЛАСС CreativeSovereigntySystem
    // ==========================================================================
    class CreativeSovereigntySystem {
        constructor() {
            this.activeLevels = JSON.parse(JSON.stringify(creativeLevels));
            this.activeFilter = 'all';
            this.scene3d = null;
            this.init();
        }

        init() {
            this.initCreativeUniverse();
            this.renderProtectionMatrix();
            this.renderArsenal();
            this.updateProgress();
            this.initFilters();
            this.initControls();

            const saved = localStorage.getItem('creative-archetype');
            if (saved) {
                try {
                    this.activeLevels = JSON.parse(saved);
                    this.renderProtectionMatrix();
                    this.updateProgress();
                    this.showNotification('Предыдущий архетип загружен', 'success');
                } catch (e) {
                    console.error('Ошибка загрузки:', e);
                }
            }
        }

        initCreativeUniverse() {
            if (!ORIENTIR.utils.DOMUtils.isWebGLAvailable() || ORIENTIR.utils.DOMUtils.prefersReducedMotion()) return;
            try {
                this.scene3d = new CreativeScene3D();
                window.scene3d = this.scene3d;
            } catch (e) {
                console.warn('[3D] Ошибка:', e);
            }
        }

        renderProtectionMatrix() {
            const container = document.getElementById('protection-matrix-3d');
            if (!container) return;
            container.innerHTML = '';
            this.activeLevels.forEach((level, index) => {
                const cell = document.createElement('div');
                cell.className = 'protection-cell-3d fade-in';
                cell.id = `level-${level.id}`;
                cell.dataset.level = level.id;
                cell.style.color = level.color;
                cell.style.setProperty('--color-rgb', level.rgb);
                cell.innerHTML = `
                    <div class="cell-header-3d">
                        <div class="cell-icon-3d">${level.icon}</div>
                        <div>
                            <h3 class="cell-title-3d">${level.title}</h3>
                            <div class="cell-number-3d">УРОВЕНЬ_${String(index + 1).padStart(2, '0')}</div>
                        </div>
                    </div>
                    <p style="color:var(--color-text-secondary);margin-bottom:20px;">${level.description}</p>
                    <div class="cell-tools-list">
                        ${level.tools.length === 0
                        ? `<div class="empty-tools-message">
                                    <div style="font-size:2rem;margin-bottom:12px;opacity:0.5;">📭</div>
                                    <p>Добавьте инструменты из арсенала</p>
                               </div>`
                        : this.renderToolsInLevel(level.tools)}
                    </div>
                `;
                container.appendChild(cell);
            });
            setTimeout(() => {
                document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
            }, 100);
        }

        renderToolsInLevel(tools) {
            return tools.map(tool => `
                <div class="tool-element-3d" data-tool-id="${tool.id}" style="color:${this.getLevelColor(tool.level)}">
                    <div class="tool-header-3d">
                        <div class="tool-title-3d">
                            ${tool.ethical ? '🛡️' : ''}${tool.local ? '💻' : ''}
                            <span>${tool.name}</span>
                        </div>
                        <button class="tool-remove-3d" onclick="creativeSystem.removeToolFromLevel('${tool.id}')">×</button>
                    </div>
                    <p class="tool-desc-3d">${tool.description}</p>
                    <div class="tool-tags-3d">
                        ${tool.tags.map(tag => `<span class="tool-tag-3d">${tag}</span>`).join('')}
                        <span class="tool-tag-3d" style="background:rgba(255,255,255,0.1);">${tool.protection}</span>
                    </div>
                </div>
            `).join('');
        }

        renderArsenal() {
            const container = document.getElementById('arsenal-grid');
            if (!container) return;
            const filteredTools = this.activeFilter === 'all'
                ? arsenalTools
                : arsenalTools.filter(tool => tool.category === this.activeFilter);
            container.innerHTML = filteredTools.map(tool => `
                <div class="arsenal-tool-3d fade-in" data-tool-id="${tool.id}" data-category="${tool.category}" data-level="${tool.level}" style="color:${this.getLevelColor(tool.level)}">
                    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:16px;">
                        <h4 style="margin:0;font-size:1.2rem;">${tool.name}</h4>
                        <div style="display:flex;gap:6px;">
                            ${tool.ethical ? '<span title="Этичный" style="color:var(--color-accent-green);">🛡️</span>' : ''}
                            ${tool.local ? '<span title="Локальный" style="color:var(--color-accent-blue);">💻</span>' : ''}
                        </div>
                    </div>
                    <p style="color:var(--color-text-secondary);font-size:0.95rem;margin-bottom:20px;">${tool.description}</p>
                    <div style="margin-bottom:16px;">
                        <div style="font-size:0.85rem;color:${this.getLevelColor(tool.level)};font-weight:600;margin-bottom:8px;">
                            ${tool.protection}
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px;">
                            ${tool.tags.map(tag => `<span style="font-size:0.75rem;padding:2px 8px;background:rgba(255,255,255,0.05);border-radius:10px;color:var(--color-text-muted);">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.85rem;padding:4px 12px;background:${this.getLevelColor(tool.level)}20;color:${this.getLevelColor(tool.level)};border-radius:var(--radius-sm);">
                            ${this.getLevelName(tool.level)}
                        </span>
                        <button class="btn btn-sm btn-secondary" onclick="creativeSystem.addToolToLevel('${tool.id}')" style="padding:6px 16px;">
                            Добавить
                        </button>
                    </div>
                </div>
            `).join('');
            setTimeout(() => {
                container.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
            }, 100);
        }

        getLevelColor(levelId) {
            const level = creativeLevels.find(l => l.id === levelId);
            return level ? level.color : 'var(--color-text-muted)';
        }

        getLevelName(levelId) {
            const level = creativeLevels.find(l => l.id === levelId);
            return level ? level.title.split(' ')[1] : levelId;
        }

        addToolToLevel(toolId, levelId = null) {
            const tool = arsenalTools.find(t => t.id === toolId);
            if (!tool) return;
            const targetLevelId = levelId || tool.level;
            const levelIndex = this.activeLevels.findIndex(l => l.id === targetLevelId);
            if (levelIndex === -1) return;
            if (!this.activeLevels[levelIndex].tools.find(t => t.id === toolId)) {
                this.activeLevels[levelIndex].tools.push(tool);
                this.renderProtectionMatrix();
                this.updateProgress();
                this.saveArchetype();
                this.showNotification(`«${tool.name}» добавлен к уровню «${this.activeLevels[levelIndex].title}»`, 'success');
            }
        }

        removeToolFromLevel(toolId) {
            for (const level of this.activeLevels) {
                const toolIndex = level.tools.findIndex(t => t.id === toolId);
                if (toolIndex !== -1) {
                    const removedTool = level.tools[toolIndex];
                    level.tools.splice(toolIndex, 1);
                    this.renderProtectionMatrix();
                    this.updateProgress();
                    this.saveArchetype();
                    this.showNotification(`«${removedTool.name}» удалён`, 'warning');
                    break;
                }
            }
        }

        initFilters() {
            document.querySelectorAll('[data-filter]').forEach(button => {
                button.addEventListener('click', () => {
                    document.querySelectorAll('[data-filter]').forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    this.activeFilter = button.dataset.filter;
                    this.renderArsenal();
                });
            });
        }

        updateProgress() {
            const totalTools = this.activeLevels.reduce((sum, level) => sum + level.tools.length, 0);
            document.getElementById('selected-tools').textContent = totalTools;
            const ethicalTools = this.activeLevels.reduce((sum, level) => sum + level.tools.filter(tool => tool.ethical).length, 0);
            const ethicalScore = totalTools > 0 ? Math.round((ethicalTools / totalTools) * 100) : 0;
            document.getElementById('ethical-score').textContent = ethicalScore + '%';
            const localTools = this.activeLevels.reduce((sum, level) => sum + level.tools.filter(tool => tool.local).length, 0);
            document.getElementById('local-tools').textContent = localTools;
            const estimatedHours = totalTools * 2;
            document.getElementById('estimated-time').textContent = estimatedHours + 'ч';
            const filledLevels = this.activeLevels.filter(level => level.tools.length > 0).length;
            document.getElementById('current-protection').textContent = `${filledLevels} из 6 уровней активны`;
        }

        initControls() {
            if (this.scene3d) {
                new ORIENTIR.PerformanceControls(this.scene3d, {
                    toggle3DBtn: '#toggle-universe',
                    qualityBtn: '#quality-mode',
                    rotateBtn: '#auto-rotate'
                });
            }

            const toggleUniverseBtn = document.getElementById('toggle-universe');
            if (toggleUniverseBtn && this.scene3d) {
                toggleUniverseBtn.addEventListener('click', () => {
                    const isEnabled = this.scene3d.toggleUniverse();
                    toggleUniverseBtn.classList.toggle('active', isEnabled);
                    toggleUniverseBtn.querySelector('.creative-label').textContent = `3D: ${isEnabled ? 'Вкл' : 'Выкл'}`;
                });
            }

            const qualityBtn = document.getElementById('quality-mode');
            if (qualityBtn && this.scene3d) {
                qualityBtn.addEventListener('click', () => {
                    const isHighQuality = this.scene3d.toggleQuality();
                    qualityBtn.classList.toggle('active', isHighQuality);
                    qualityBtn.querySelector('.creative-label').textContent = `Качество: ${isHighQuality ? 'Высокое' : 'Эконом'}`;
                });
            }

            const rotateBtn = document.getElementById('auto-rotate');
            if (rotateBtn && this.scene3d) {
                rotateBtn.addEventListener('click', () => {
                    const isAutoRotate = this.scene3d.toggleAutoRotate();
                    rotateBtn.classList.toggle('active', isAutoRotate);
                    rotateBtn.querySelector('.creative-label').textContent = `Вращение: ${isAutoRotate ? 'Вкл' : 'Выкл'}`;
                });
            }
        }

        applyPreset(presetId) {
            const presets = {
                'short-video': { conceptual: ['obsidian'], narrative: ['kitty_scroll'], visual: ['krita'], motion: ['blender'], audio: ['audacity'], final: ['kdenlive'] },
                'documentary': { conceptual: ['logseq'], narrative: ['kitty_scroll', 'local_llm'], visual: ['gimp'], motion: ['synfig'], audio: ['ardour'], final: ['handbrake'] },
                'educational': { conceptual: ['obsidian'], narrative: ['local_llm'], visual: ['krita'], motion: ['blender'], audio: ['audacity'], final: ['kdenlive'] }
            };
            const preset = presets[presetId];
            if (!preset) return;
            this.activeLevels = JSON.parse(JSON.stringify(creativeLevels));
            Object.keys(preset).forEach(levelId => {
                const levelIndex = this.activeLevels.findIndex(l => l.id === levelId);
                if (levelIndex !== -1) {
                    preset[levelId].forEach(toolId => {
                        const tool = arsenalTools.find(t => t.id === toolId);
                        if (tool) this.activeLevels[levelIndex].tools.push(tool);
                    });
                }
            });
            this.renderProtectionMatrix();
            this.updateProgress();
            this.saveArchetype();
            this.showNotification('Пресет применён! Настройте архетип под свои нужды.', 'success');
        }

        showNotification(message, type = 'info') {
            ORIENTIR.utils.NotificationUtils.show(message, type);
        }

        createParticleEffect(element) {
            ORIENTIR.utils.createParticleBurst(element, { count: 6, color: 'currentColor' });
        }

        saveArchetype() {
            localStorage.setItem('creative-archetype', JSON.stringify(this.activeLevels));
        }

        exportArchetype() {
            const exportData = {
                name: 'Мой архетип творческого суверенитета',
                created: new Date().toISOString(),
                levels: this.activeLevels.map(level => ({ level: level.title, tools: level.tools.map(tool => tool.name) })),
                stats: {
                    totalTools: this.activeLevels.reduce((sum, level) => sum + level.tools.length, 0),
                    ethicalScore: document.getElementById('ethical-score').textContent
                }
            };
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileName = `архетип-суверенитета-${new Date().toISOString().split('T')[0]}.json`;
            const link = document.createElement('a');
            link.setAttribute('href', dataUri);
            link.setAttribute('download', exportFileName);
            link.click();
            this.showNotification('Архетип экспортирован в JSON', 'success');
        }

        showEthicsReport() {
            const ethicalScore = document.getElementById('ethical-score').textContent;
            const localTools = document.getElementById('local-tools').textContent;
            const totalTools = document.getElementById('selected-tools').textContent;
            this.showNotification(`Отчёт о суверенитете:\n• Индекс этичности: ${ethicalScore}\n• Локальных инструментов: ${localTools}/${totalTools}\n• Уровней активировано: ${this.activeLevels.filter(l => l.tools.length > 0).length}/6`, 'info');
        }

        dispose() {
            if (this.scene3d) this.scene3d.dispose();
        }
    }

    // ==========================================================================
    // ГЛОБАЛЬНЫЕ ФУНКЦИИ
    // ==========================================================================

    window.exportArchetype = function () {
        if (window.creativeSystem) window.creativeSystem.exportArchetype();
    };

    window.showEthicsReport = function () {
        if (window.creativeSystem) window.creativeSystem.showEthicsReport();
    };

    window.showPrivacyPolicy = function () {
        ORIENTIR.utils.NotificationUtils.showPrivacyPolicy();
    };

    window.applyPreset = function (presetId) {
        if (window.creativeSystem) window.creativeSystem.applyPreset(presetId);
    };

    // ==========================================================================
    // ИНИЦИАЛИЗАЦИЯ
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        window.creativeSystem = new CreativeSovereigntySystem();

        window.addEventListener('beforeunload', () => window.creativeSystem?.dispose());

        // Удалены обработчики для анализатора

        const exportArchetypeBtn = document.getElementById('export-archetype-btn');
        if (exportArchetypeBtn) exportArchetypeBtn.addEventListener('click', window.exportArchetype);

        const showEthicsReportBtn = document.getElementById('show-ethics-report-btn');
        if (showEthicsReportBtn) showEthicsReportBtn.addEventListener('click', window.showEthicsReport);

        const privacyBtn = document.getElementById('privacy-policy-btn');
        if (privacyBtn) privacyBtn.addEventListener('click', window.showPrivacyPolicy);

        const titleWords = document.querySelectorAll('.title-word');
        titleWords.forEach(word => {
            word.addEventListener('mouseenter', () => {
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                ORIENTIR.utils.createParticleBurst(word, { count: 6, color: 'currentColor' });
            });
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
                ticking = false;
            };

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(updateHeader);
                    ticking = true;
                }
            }, { passive: true });

            updateHeader();
        }
        // ===== Конец управления шапкой =====

        console.log('[СИСТЕМА] Архитектура творческого суверенитета инициализирована');
    });

})();