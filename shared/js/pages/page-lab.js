/**
 * page-lab.js – УНИКАЛЬНЫЙ JS ДЛЯ СТРАНИЦЫ "ЛАБОРАТОРИЯ"
 * Исправленная версия: массив particles инициализируется до super, удалён явный вызов createObjects().
 * Добавлено единое управление шапкой.
 */

(function () {
    'use strict';

    // ==========================================================================
    // ДАННЫЕ
    // ==========================================================================

    const methodologyStages = [
        {
            id: "focus",
            name: "Фокус исследования",
            number: 1,
            color: "var(--step1)",
            rgb: "96,165,250",
            icon: "🎯",
            description: "Определите область и глубину исследования",
            placeholder: "Выберите фокус исследования",
            placeholderIcon: "🎯"
        },
        {
            id: "tools",
            name: "Инструментарий",
            number: 2,
            color: "var(--step2)",
            rgb: "52,211,153",
            icon: "🛠️",
            description: "Выберите методы и технологии анализа",
            placeholder: "Добавьте инструменты анализа",
            placeholderIcon: "🛠️"
        },
        {
            id: "protocol",
            name: "Протокол работы",
            number: 3,
            color: "var(--step3)",
            rgb: "251,191,36",
            icon: "📋",
            description: "Установите правила и последовательность",
            placeholder: "Определите протокол исследования",
            placeholderIcon: "📋"
        },
        {
            id: "verification",
            name: "Верификация",
            number: 4,
            color: "var(--step4)",
            rgb: "244,114,182",
            icon: "✅",
            description: "Настройте проверку и валидацию",
            placeholder: "Добавьте методы верификации",
            placeholderIcon: "✅"
        }
    ];

    const LAB_ELEMENTS = [
        { id: 1, icon: '🔬', title: 'Системный анализ', type: 'focus', description: 'Исследование сложных систем и их эмерджентных свойств', tags: ['системы', 'анализ', 'паттерны'], color: 'var(--step1)', rgb: '96,165,250', createdAt: new Date().toISOString(), isDefault: true },
        { id: 2, icon: '🕸️', title: 'OSINT-фреймворки', type: 'tools', description: 'Maltego, SpiderFoot для сбора и анализа открытых данных', tags: ['OSINT', 'сбор', 'анализ'], color: 'var(--step2)', rgb: '52,211,153', createdAt: new Date().toISOString(), isDefault: true },
        { id: 3, icon: '🤖', title: 'Локальные ИИ', type: 'tools', description: 'Ollama, LM Studio для приватного анализа данных', tags: ['ИИ', 'анализ', 'приватность'], color: 'var(--step2)', rgb: '52,211,153', createdAt: new Date().toISOString(), isDefault: true },
        { id: 4, icon: '🚫', title: 'Нулевое доверие', type: 'protocol', description: 'Все данные проверяются независимо от источника', tags: ['верификация', 'критика', 'проверка'], color: 'var(--step3)', rgb: '251,191,36', createdAt: new Date().toISOString(), isDefault: true },
        { id: 5, icon: '🎭', title: 'Проверка искажений', type: 'verification', description: 'Систематический поиск когнитивных искажений в анализе', tags: ['когниция', 'искажения', 'самопроверка'], color: 'var(--step4)', rgb: '244,114,182', createdAt: new Date().toISOString(), isDefault: true },
        { id: 6, icon: '📊', title: 'Визуализация данных', type: 'tools', description: 'Gephi, D3.js для визульного анализа связей', tags: ['визуализация', 'графы', 'анализ'], color: 'var(--step2)', rgb: '52,211,153', createdAt: new Date().toISOString(), isDefault: true },
        { id: 7, icon: '🔍', title: 'Фокус на доказательствах', type: 'focus', description: 'Приоритет верифицируемых данных над теориями', tags: ['доказательства', 'верификация', 'факты'], color: 'var(--step1)', rgb: '96,165,250', createdAt: new Date().toISOString(), isDefault: true },
        { id: 8, icon: '🔄', title: 'Итерационный подход', type: 'protocol', description: 'Постепенное уточнение гипотез через циклы проверка', tags: ['итерации', 'циклы', 'уточнение'], color: 'var(--step3)', rgb: '251,191,36', createdAt: new Date().toISOString(), isDefault: true }
    ];

    const researchPatterns = [
        {
            id: "confirmation_bias",
            name: "Предвзятость подтверждения",
            icon: "👁️",
            description: "Поиск и интерпретация информации, подтверждающей существующие убеждения",
            examples: ["Игнорирование противоречащих данных", "Выборочное цитирование источников"],
            detectionKeywords: ["очевидно", "безусловно", "несомненно", "доказано что"],
            protectionLevel: "verification"
        },
        {
            id: "sampling_bias",
            name: "Смещение выборки",
            icon: "🎲",
            description: "Использование нерепрезентативной выборки для выводов о популяции",
            examples: ["Опрос только определённой группы", "Игнорирование разнообразия данных"],
            detectionKeywords: ["все", "каждый", "никто", "всегда"],
            protectionLevel: "focus"
        }
    ];

    // ==========================================================================
    // КЛАСС-НАСЛЕДНИК ДЛЯ 3D-СЦЕНЫ
    // ==========================================================================
    class LabScene3D extends ORIENTIR.Three.BaseThreeScene {
        constructor(settings = {}) {
            const defaultSettings = {
                containerId: 'three-container',
                particleCount: 120,
                autoRotate: ORIENTIR.CONFIG.AUTO_ROTATE !== false,
                quality: ORIENTIR.CONFIG.QUALITY || 'high',
                fog: new THREE.Fog(0x0a0e14, 5, 50)
            };
            super({ ...defaultSettings, ...settings });
        }

        createObjects() {
            this.particles = [];
            this.createLabParticles();
        }

        createLights() {
            const ambient = new THREE.AmbientLight(0xffffff, 0.4);
            this.scene.add(ambient);
            const pointLight = new THREE.PointLight(0xffcc80, 0.6, 100);
            pointLight.position.set(15, 15, 15);
            this.scene.add(pointLight);
        }

        createLabParticles() {
            const colors = [
                ORIENTIR.CONFIG.COLORS.PRIMARY_BLUE,
                ORIENTIR.CONFIG.COLORS.PRIMARY_GREEN,
                ORIENTIR.CONFIG.COLORS.PRIMARY_YELLOW,
                ORIENTIR.CONFIG.COLORS.PRIMARY_PINK
            ].map(hex => new THREE.Color(hex));
            const geometry = new THREE.SphereGeometry(0.08, 8, 8);

            for (let i = 0; i < this.settings.particleCount; i++) {
                const material = new THREE.MeshPhongMaterial({
                    color: colors[i % colors.length],
                    transparent: true,
                    opacity: 0.2,
                    emissive: colors[i % colors.length],
                    emissiveIntensity: 0.05
                });
                const particle = new THREE.Mesh(geometry, material);

                const r = 10 + Math.random() * 5;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                particle.position.set(
                    r * Math.sin(phi) * Math.cos(theta),
                    r * Math.sin(phi) * Math.sin(theta),
                    r * Math.cos(phi)
                );

                particle.userData = {
                    originalPosition: particle.position.clone(),
                    speed: 0.001 + Math.random() * 0.002,
                    direction: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.01,
                        (Math.random() - 0.5) * 0.01,
                        (Math.random() - 0.5) * 0.01
                    ),
                    stage: (i % 4) + 1,
                    isActive: false
                };

                this.scene.add(particle);
                this.particles.push(particle);
            }
        }

        activateStage(stageId, active) {
            this.particles.forEach(p => {
                if (p.userData.stage === stageId) {
                    p.userData.isActive = active;
                }
            });
        }

        update(delta, elapsedTime) {
            this.particles.forEach(p => {
                if (!p.userData) return;
                p.position.add(p.userData.direction);
                p.position.lerp(p.userData.originalPosition, 0.001 + p.userData.speed);
                p.rotation.x += 0.01 * p.userData.speed;
                p.rotation.y += 0.01 * p.userData.speed;

                if (p.userData.isActive) {
                    p.material.emissiveIntensity = 0.2 + Math.sin(elapsedTime * 5) * 0.1;
                    p.material.opacity = 0.3 + Math.sin(elapsedTime * 5) * 0.2;
                }
            });

            if (this.settings.autoRotate) {
                this.scene.rotation.y += 0.001;
                this.scene.rotation.x += 0.0005;
            }
        }
    }

    // ==========================================================================
    // КЛАССЫ GraphManager, LabSystem
    // ==========================================================================

    class GraphManager {
        constructor() {
            this.network = null;
            this.nodes = new vis.DataSet([]);
            this.edges = new vis.DataSet([]);
            this.container = null;
            this.nodeColors = {
                focus: { background: '#4fc3f7', border: '#1e88e5' },
                tools: { background: '#a5d6a7', border: '#66bb6a' },
                protocol: { background: '#ffcc80', border: '#ffa726' },
                verification: { background: '#f48fb1', border: '#ec407a' },
                stage: { background: '#7986cb', border: '#5c6bc0' },
                library: { background: '#757575', border: '#424242' }
            };
        }

        init(containerId) {
            this.container = document.getElementById(containerId);
            if (!this.container) return;
            this.buildGraphData();
            const options = {
                nodes: { shape: 'dot', size: 26, font: { size: 14, face: 'Manrope', color: '#fff' }, borderWidth: 2, shadow: true },
                edges: { width: 2, color: { inherit: 'from' }, smooth: { type: 'continuous', roundness: 0.5 }, arrows: { to: { enabled: true, scaleFactor: 0.5 } } },
                physics: { enabled: true, solver: 'forceAtlas2Based', forceAtlas2Based: { gravitationalConstant: -50, centralGravity: 0.01, springLength: 100, springConstant: 0.08, damping: 0.4 }, stabilization: { iterations: 100, updateInterval: 10 } },
                interaction: { hover: true, tooltipDelay: 200, hideEdgesOnDrag: true, navigationButtons: true, keyboard: { enabled: true, speed: { x: 10, y: 10, zoom: 0.02 } } }
            };
            const data = { nodes: this.nodes, edges: this.edges };
            this.network = new vis.Network(this.container, data, options);
            this.setupEventHandlers();
        }

        buildGraphData() {
            this.nodes.clear(); this.edges.clear();
            methodologyStages.forEach(stage => {
                this.nodes.add({ id: `stage_${stage.id}`, label: stage.name, title: stage.description, color: this.nodeColors.stage, shape: 'hexagon', size: 35, font: { size: 16, bold: true }, borderWidth: 3, shadow: true, level: 0, stage: true });
            });
            if (window.labSystem?.methodology) {
                Object.entries(window.labSystem.methodology.stages).forEach(([stageId, elements]) => {
                    if (Array.isArray(elements)) elements.forEach(element => {
                        this.nodes.add({ id: `element_${element.id}`, label: element.title, title: `${element.description}\n\nТеги: ${element.tags?.join(', ') || 'нет'}`, color: this.nodeColors[element.type] || this.nodeColors.tools, shape: 'circle', size: 20 + (element.tags?.length || 0) * 2, font: { size: 12 }, element: true, stageId, level: 1, data: element });
                        this.edges.add({ id: `edge_${element.id}_to_${stageId}`, from: `element_${element.id}`, to: `stage_${stageId}`, color: { color: methodologyStages.find(s => s.id === stageId)?.color || '#fff' }, width: 3, dashes: false });
                    });
                });
                this.buildElementConnections();
            }
            this.addLibraryElements();
        }

        buildElementConnections() {
            if (!window.labSystem?.methodology) return;
            const allElements = [];
            Object.values(window.labSystem.methodology.stages).forEach(elements => { if (Array.isArray(elements)) allElements.push(...elements); });
            for (let i = 0; i < allElements.length; i++) {
                for (let j = i + 1; j < allElements.length; j++) {
                    const commonTags = allElements[i].tags?.filter(tag => allElements[j].tags?.includes(tag)) || [];
                    if (commonTags.length > 0) {
                        const strength = Math.min(commonTags.length * 0.3, 1);
                        this.edges.add({ id: `connection_${allElements[i].id}_${allElements[j].id}`, from: `element_${allElements[i].id}`, to: `element_${allElements[j].id}`, color: { color: '#64B5F6', opacity: strength }, width: 1 + strength * 2, dashes: [5, 5], title: `Общие теги: ${commonTags.join(', ')}` });
                    }
                }
            }
        }

        addLibraryElements() {
            const addedIds = new Set();
            if (window.labSystem?.methodology) {
                Object.values(window.labSystem.methodology.stages).forEach(elements => { if (Array.isArray(elements)) elements.forEach(el => addedIds.add(el.id)); });
            }
            LAB_ELEMENTS.forEach(element => {
                if (!addedIds.has(element.id)) {
                    this.nodes.add({ id: `lib_${element.id}`, label: element.title, title: `${element.description}\n\n(Ещё не добавлен в методологию)`, color: this.nodeColors.library, shape: 'square', size: 18, font: { size: 11, color: '#BDBDBD' }, element: true, library: true, level: 2, data: element });
                    const stageId = element.type;
                    if (methodologyStages.find(s => s.id === stageId)) {
                        this.edges.add({ id: `potential_${element.id}_to_${stageId}`, from: `lib_${element.id}`, to: `stage_${stageId}`, color: { color: '#9E9E9E', opacity: 0.3 }, width: 1, dashes: [10, 5], title: 'Потенциальная связь' });
                    }
                }
            });
        }

        setupEventHandlers() {
            if (!this.network) return;
            this.network.on('click', params => { if (params.nodes.length > 0) this.handleNodeClick(params.nodes[0]); });
            this.network.on('doubleClick', params => { if (params.nodes.length > 0) this.handleNodeDoubleClick(params.nodes[0]); });
            this.network.on('hoverNode', params => this.highlightConnectedNodes(params.node));
            this.network.on('blurNode', () => this.clearHighlights());
        }

        handleNodeClick(nodeId) {
            const node = this.nodes.get(nodeId);
            if (!node) return;
            this.showNodeDetails(node);
            if (node.library) this.showAddToMethodologyPrompt(node.data);
        }

        handleNodeDoubleClick(nodeId) {
            this.network?.focus(nodeId, { scale: 1.5, animation: { duration: 1000, easingFunction: 'easeInOutQuad' } });
        }

        highlightConnectedNodes(nodeId) {
            if (!this.network) return;
            const connectedNodes = this.network.getConnectedNodes(nodeId);
            const allNodeIds = [nodeId, ...connectedNodes];
            this.nodes.forEach(node => {
                const isConnected = allNodeIds.includes(node.id);
                this.nodes.update({ id: node.id, color: { background: isConnected ? node.color.background : '#2D3748', border: isConnected ? node.color.border : '#4A5568' }, font: { color: isConnected ? '#fff' : '#718096' } });
            });
        }

        clearHighlights() {
            this.nodes.forEach(node => {
                const originalColor = this.getOriginalColor(node);
                this.nodes.update({ id: node.id, color: originalColor, font: { color: '#fff' } });
            });
        }

        getOriginalColor(node) {
            if (node.stage) return this.nodeColors.stage;
            if (node.library) return this.nodeColors.library;
            const type = node.data?.type || node.type;
            return this.nodeColors[type] || this.nodeColors.tools;
        }

        showNodeDetails(node) {
            const popup = document.createElement('div');
            popup.className = 'graph-node-popup';
            const isStage = node.stage;
            const isLibrary = node.library;
            let content = '';
            if (isStage) {
                const stage = methodologyStages.find(s => s.id === node.id.replace('stage_', ''));
                content = `<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px"><div style="font-size:2.5rem">${stage?.icon || ''}</div><div><h3 style="margin:0 0 8px 0;color:${node.color.border}">${node.label}</h3><p style="margin:0;color:var(--text2)">${node.title}</p></div></div><div style="background:rgba(0,0,0,0.2);padding:12px;border-radius:var(--radius-md)"><div style="color:var(--text2);font-size:0.9rem">Элементов: ${window.labSystem?.methodology?.stages?.[node.id.replace('stage_', '')]?.length || 0}</div></div>`;
            } else if (node.element) {
                const element = node.data;
                content = `<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px"><div style="font-size:2.5rem">${element.icon}</div><div><h3 style="margin:0 0 8px 0;color:${node.color.border}">${element.title}</h3><p style="margin:0;color:var(--text2)">${element.description}</p></div></div>${element.tags ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">${element.tags.map(tag => `<span style="background:rgba(${node.color.border},0.2);color:${node.color.border};padding:4px 12px;border-radius:20px;font-size:0.85rem">${tag}</span>`).join('')}</div>` : ''}${isLibrary ? `<button onclick="window.labSystem?.showQuickAddMenu(${JSON.stringify(element).replace(/"/g, '&quot;')}); this.closest('.graph-node-popup').remove()" style="width:100%;padding:12px;background:${node.color.border};color:#fff;border:none;border-radius:var(--radius-md);font-weight:700;cursor:pointer;margin-top:12px">Добавить в методологию</button>` : ''}`;
            }
            popup.innerHTML = `<div style="position:relative;background:var(--surface);border-radius:var(--radius-lg);padding:24px;max-width:400px;border:2px solid ${node.color.border};box-shadow:var(--shadow-xl)"><button onclick="this.closest('.graph-node-popup').remove()" style="position:absolute;top:12px;right:12px;background:none;border:none;color:var(--text2);font-size:1.5rem;cursor:pointer">×</button>${content}</div>`;
            document.querySelector('.graph-node-popup')?.remove();
            popup.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000; animation: popupFadeIn 0.3s var(--ease-soft);';
            document.body.appendChild(popup);
            if (!document.querySelector('#graph-popup-styles')) {
                const style = document.createElement('style'); style.id = 'graph-popup-styles';
                style.textContent = '@keyframes popupFadeIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }';
                document.head.appendChild(style);
            }
        }

        showAddToMethodologyPrompt(element) {
            window.labSystem?.showQuickAddMenu(element);
        }

        refresh() { this.buildGraphData(); ORIENTIR.utils.NotificationUtils.show('Граф обновлён'); }
        exportAsImage() { if (!this.container) return; html2canvas(this.container).then(canvas => { const link = document.createElement('a'); link.download = `граф_методологии_${new Date().toISOString().split('T')[0]}.png`; link.href = canvas.toDataURL('image/png'); link.click(); ORIENTIR.utils.NotificationUtils.show('Граф экспортирован как изображение'); }); }
    }

    // ==========================================================================
    // КЛАСС LabSystem
    // ==========================================================================
    class LabSystem {
        constructor() {
            this.methodology = { stages: { focus: [], tools: [], protocol: [], verification: [] }, elementStatus: new Map(), version: '2.1' };
            this.currentFilter = "all";
            this.selectedElements = new Set();
            this.isSelectionMode = false;
            this.currentElementForQuickAdd = null;
            this.scene3d = null;
            this.graphManager = new GraphManager();
            this.initializationAttempts = 0;
            this.MAX_INIT_ATTEMPTS = 3;
            this.isInitialized = false;
            this.init();
        }

        init() {
            if (this.isInitialized) return;
            this.initializationAttempts++;
            if (this.initializationAttempts > this.MAX_INIT_ATTEMPTS) { console.error('Превышено количество попыток инициализации'); this.showNotification('Ошибка инициализации системы', 'warning'); return; }
            try {
                this.loadSavedMethodology(); this.loadLibraryElements();
                this.init3D(); this.createMethodologyMatrix(); this.createElementLibrary(); this.initAnalyzer(); this.initAnimations(); this.initControls();
                setTimeout(() => { try { this.graphManager.init('graph-network'); } catch (e) { console.error('Ошибка инициализации графа:', e); } }, 1500);
                this.isInitialized = true;
            } catch (error) { console.error('Критическая ошибка при инициализации:', error); this.showNotification('Ошибка инициализации системы', 'warning'); }
        }

        init3D() {
            if (!ORIENTIR.utils.DOMUtils.isWebGLAvailable() || ORIENTIR.utils.DOMUtils.prefersReducedMotion()) return;
            try {
                this.scene3d = new LabScene3D();
                window.scene3d = this.scene3d;
            } catch (e) {
                console.warn('[3D] Ошибка:', e);
            }
        }

        saveLibraryElements() {
            try { const userElements = LAB_ELEMENTS.filter(el => !el.isDefault); localStorage.setItem('lab_library_elements', JSON.stringify(userElements)); } catch (e) { console.error('Ошибка сохранения библиотеки:', e); }
        }
        loadLibraryElements() {
            try {
                const saved = localStorage.getItem('lab_library_elements');
                if (!saved) return;
                const userElements = JSON.parse(saved);
                const existingIds = new Set(LAB_ELEMENTS.map(el => el.id));
                userElements.forEach(newEl => { if (!existingIds.has(newEl.id)) { LAB_ELEMENTS.push({ ...newEl, isDefault: false }); } });
            } catch (e) { console.warn('Ошибка загрузки библиотеки:', e); }
        }

        createMethodologyMatrix() {
            const matrix = document.getElementById('methodology-matrix-3d');
            if (!matrix) return;
            matrix.innerHTML = '';
            methodologyStages.forEach(stage => {
                const cell = document.createElement('div'); cell.className = 'stage-cell-3d fade-in'; cell.dataset.stage = stage.id; cell.style.color = stage.color; cell.style.setProperty('--color-rgb', stage.rgb);
                cell.innerHTML = `<div class="cell-header-3d"><div class="cell-marker-3d">${stage.number}</div><h3 class="cell-title-3d">${stage.icon} ${stage.name}</h3></div><p class="cell-desc-3d">${stage.description}</p><div class="methodology-elements-container empty" id="elements-${stage.id}"><div class="empty-stage-icon">${stage.placeholderIcon}</div><p>${stage.placeholder}</p><small>Нажмите на элемент в библиотеке и выберите этот этап</small></div>`;
                matrix.appendChild(cell);
            });
            this.updateMethodologyStats();
        }

        getElementStatus(elementId) {
            if (!this.methodology.elementStatus || !(this.methodology.elementStatus instanceof Map)) { console.warn('elementStatus не Map, создаем новый'); this.methodology.elementStatus = new Map(); return { added: false, stageId: null, addedAt: null }; }
            try { return this.methodology.elementStatus.get(elementId) || { added: false, stageId: null, addedAt: null }; } catch (e) { console.error('Ошибка получения статуса элемента:', e); return { added: false, stageId: null, addedAt: null }; }
        }

        addElementToStage(stageId, element) {
            if (!element?.id) { this.showNotification('Ошибка: некорректный элемент', 'warning'); return; }
            if (!this.methodology.stages[stageId]) { this.showNotification(`Ошибка: неизвестный этап "${stageId}"`, 'warning'); return; }
            try {
                const status = this.getElementStatus(element.id);
                if (status.added) { this.showNotification(`Элемент уже добавлен в этап "${status.stageId}"`, 'warning'); return; }
                const elementCopy = { ...element };
                this.methodology.stages[stageId].push(elementCopy);
                this.methodology.elementStatus.set(element.id, { stageId, added: true, addedAt: new Date().toISOString() });
                this.renderElementInStage(stageId, elementCopy);
                this.updateMethodologyStats();
                this.updateLibraryElementStatus(element.id);
                this.saveMethodology(); this.saveLibraryElements();
                this.onMethodologyChanged();
                const stageName = methodologyStages.find(s => s.id === stageId)?.name || stageId;
                this.showNotification(`«${element.title}» добавлен в «${stageName}»`);
            } catch (e) { console.error('Ошибка добавления элемента:', e); this.showNotification('Ошибка при добавлении элемента', 'warning'); }
        }

        renderElementInStage(stageId, element) {
            const container = document.getElementById(`elements-${stageId}`);
            if (!container) return;
            if (container.classList.contains('empty')) { container.innerHTML = ''; container.classList.remove('empty'); }
            const tagsHtml = element.tags?.length ? `<div class="element-tags">${element.tags.map(tag => `<span class="element-tag">${tag}</span>`).join(' ')}</div>` : '';
            const elDiv = document.createElement('div'); elDiv.className = 'matrix-element-3d'; elDiv.dataset.elementId = element.id; elDiv.style.borderLeftColor = element.color;
            elDiv.innerHTML = `<div class="element-header-3d"><div class="element-title-3d"><span class="element-icon">${element.icon}</span><span class="element-title-text">${element.title}</span></div><div class="element-controls-3d"><button class="quantum-control-3d" title="Удалить" onclick="if (window.labSystem) { window.labSystem.removeElement(${element.id}, '${stageId}'); }">🗑️</button></div></div><p class="element-description-3d">${element.description}</p>${tagsHtml}`;
            elDiv.style.opacity = '0'; elDiv.style.transform = 'translateY(20px)';
            container.appendChild(elDiv);
            requestAnimationFrame(() => { elDiv.style.transition = 'all 0.5s var(--ease-soft)'; elDiv.style.opacity = '1'; elDiv.style.transform = 'translateY(0)'; });
        }

        removeElement(elementId, stageId) {
            try {
                elementId = Number(elementId);
                if (!this.methodology.stages[stageId]) return;
                const idx = this.methodology.stages[stageId].findIndex(el => el.id == elementId);
                if (idx === -1) { this.showNotification('Элемент не найден', 'warning'); return; }
                const removed = this.methodology.stages[stageId][idx];
                this.methodology.stages[stageId].splice(idx, 1);
                this.methodology.elementStatus.delete(elementId);
                const container = document.getElementById(`elements-${stageId}`);
                if (container) {
                    const el = container.querySelector(`[data-element-id="${elementId}"]`);
                    if (el) { el.style.opacity = '0'; el.style.transform = 'translateY(-20px) scale(0.9)'; setTimeout(() => { el.remove(); if (this.methodology.stages[stageId].length === 0) { const stage = methodologyStages.find(s => s.id === stageId); container.innerHTML = `<div class="empty-stage-icon">${stage.placeholderIcon}</div><p>${stage.placeholder}</p><small>Нажмите на элемент в библиотеке и выберите этот этап</small>`; container.classList.add('empty'); } }, 300); }
                }
                this.updateLibraryElementStatus(elementId);
                this.saveMethodology(); this.updateMethodologyStats(); this.onMethodologyChanged();
                this.showNotification(`Элемент «${removed.title}» удалён`);
            } catch (e) { console.error('Ошибка удаления элемента:', e); this.showNotification('Ошибка при удалении элемента', 'warning'); }
        }

        updateMethodologyStats() {
            try {
                const total = Object.values(this.methodology.stages).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
                const progress = Math.min(100, (total / 16) * 100);
                document.getElementById('elements-count') && (document.getElementById('elements-count').textContent = total);
                document.getElementById('methodology-progress') && (document.getElementById('methodology-progress').style.width = `${progress}%`);
                document.getElementById('header-progress') && (document.getElementById('header-progress').style.width = `${progress}%`);
                const ind = document.getElementById('current-method'); if (ind) ind.textContent = total > 0 ? `${total} элемент${this.pluralize(total)}` : 'Не настроена';
                this.updateMethodologyDetails();
            } catch (e) { console.error('Ошибка обновления статистики:', e); }
        }
        pluralize(n) { if (n % 10 === 1 && n % 100 !== 11) return ''; if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'а'; return 'ов'; }
        updateMethodologyDetails() {
            const det = document.getElementById('methodology-details'); if (!det) return;
            const total = Object.values(this.methodology.stages).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
            if (total === 0) { det.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px"><div style="font-size:3rem;margin-bottom:16px">🔬</div><div>Начните сборку методологии, выбирая элементы из библиотеки</div></div>'; return; }
            let html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px">';
            methodologyStages.forEach(stage => { const cnt = Array.isArray(this.methodology.stages[stage.id]) ? this.methodology.stages[stage.id].length : 0; if (cnt > 0) html += `<div style="background:rgba(${stage.rgb},.1);padding:16px;border-radius:var(--radius-md);border-left:4px solid ${stage.color}"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><div style="font-size:1.5rem">${stage.icon}</div><div style="font-weight:700">${stage.name}</div></div><div style="font-size:.9rem;color:var(--text2)">${cnt} элемент${this.pluralize(cnt)}</div></div>`; });
            html += '</div>'; det.innerHTML = html;
        }

        createElementLibrary() {
            const grid = document.getElementById('quantum-grid-3d'); if (!grid) return;
            this.renderElementGrid(grid);
            document.querySelectorAll('.filter-quantum-3d').forEach(f => f.addEventListener('click', () => { document.querySelectorAll('.filter-quantum-3d').forEach(f2 => f2.classList.remove('active')); f.classList.add('active'); this.currentFilter = f.dataset.category; this.filterElements(); }));
        }
        renderElementGrid(container) {
            if (!container) return; container.innerHTML = '';
            LAB_ELEMENTS.forEach(el => { const card = this.createElementCard(el); if (card) container.appendChild(card); });
            this.updateFilterCounts();
        }
        createElementCard(element) {
            if (!element?.id) return null;
            try {
                const status = this.getElementStatus(element.id); const alreadyAdded = status.added; const isUserElement = element.isDefault === false;
                const card = document.createElement('div'); card.className = 'element-particle-3d'; card.dataset.elementId = element.id; card.dataset.category = element.type || 'custom';
                if (alreadyAdded) card.classList.add('added');
                const addBtnText = alreadyAdded ? '<span class="action-icon">✓</span><span class="action-text">Добавлен</span>' : '<span class="action-icon">➕</span><span class="action-text">Добавить</span>';
                const tagsHtml = element.tags?.length ? `<div class="particle-tags">${element.tags.map(tag => `<span class="particle-tag">${tag}</span>`).join(' ')}</div>` : '';
                const deleteBtn = isUserElement ? `<button class="particle-action-btn delete-from-library" title="Удалить из библиотеки" onclick="event.stopPropagation(); if (window.labSystem) window.labSystem.removeElementFromLibrary(${element.id})"><span class="action-icon">🗑️</span></button>` : '';
                card.innerHTML = `<div class="particle-icon-3d">${element.icon || '🔬'}</div><div class="particle-header-3d"><h4 class="particle-title-3d">${element.title || 'Без названия'}</h4><div class="particle-meta-3d"><span class="particle-type-3d" style="background:${element.color}20;color:${element.color}">${this.getElementTypeName(element.type)}</span><span class="particle-id">#${element.id}</span></div></div><p class="particle-description-3d">${element.description || 'Описание отсутствует'}</p>${tagsHtml}<div class="particle-actions"><button class="particle-action-btn add-to-methodology" ${alreadyAdded ? 'disabled' : ''} title="Добавить в методологию">${addBtnText}</button><button class="particle-action-btn quick-preview" title="Быстрый просмотр"><span class="action-icon">👁️</span></button>${deleteBtn}</div>`;
                if (alreadyAdded) { const ind = document.createElement('div'); ind.className = 'element-added-indicator'; ind.innerHTML = '✓'; card.appendChild(ind); }
                card.querySelector('.add-to-methodology')?.addEventListener('click', (e) => { e.stopPropagation(); if (!alreadyAdded) { this.showQuickAddMenu(element); e.currentTarget.classList.add('clicked'); setTimeout(() => e.currentTarget.classList.remove('clicked'), 300); } });
                card.querySelector('.quick-preview')?.addEventListener('click', (e) => { e.stopPropagation(); this.showElementPreview(element); });
                card.addEventListener('click', (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); this.toggleElementSelection(element.id); } });
                card.addEventListener('dblclick', (e) => { if (!alreadyAdded) { e.stopPropagation(); this.showQuickAddMenu(element); } });
                card.addEventListener('contextmenu', (e) => { e.preventDefault(); if (!alreadyAdded) this.showQuickAddMenu(element); });
                return card;
            } catch (e) { console.error('Ошибка создания карточки элемента:', e, element); return null; }
        }
        updateLibraryElementStatus(elementId) {
            try {
                const element = LAB_ELEMENTS.find(e => e.id == elementId); if (!element) return;
                const card = document.querySelector(`.element-particle-3d[data-element-id="${elementId}"]`); if (!card) return;
                const status = this.getElementStatus(elementId); const added = status.added;
                const btn = card.querySelector('.add-to-methodology');
                if (added) { card.classList.add('added'); if (btn) { btn.disabled = true; btn.innerHTML = '<span class="action-icon">✓</span><span class="action-text">Добавлен</span>'; } if (!card.querySelector('.element-added-indicator')) { const ind = document.createElement('div'); ind.className = 'element-added-indicator'; ind.innerHTML = '✓'; card.appendChild(ind); } }
                else { card.classList.remove('added'); if (btn) { btn.disabled = false; btn.innerHTML = '<span class="action-icon">➕</span><span class="action-text">Добавить</span>'; } card.querySelector('.element-added-indicator')?.remove(); }
            } catch (e) { console.warn(`Ошибка обновления статуса элемента ${elementId}:`, e); }
        }
        removeElementFromLibrary(elementId) {
            try {
                const idx = LAB_ELEMENTS.findIndex(el => el.id == elementId);
                if (idx !== -1) {
                    const status = this.getElementStatus(elementId);
                    if (status.added) { this.showNotification('Сначала удалите элемент из методологии', 'warning'); return; }
                    const removed = LAB_ELEMENTS[idx]; LAB_ELEMENTS.splice(idx, 1);
                    const card = document.querySelector(`.element-particle-3d[data-element-id="${elementId}"]`);
                    if (card) { card.style.transition = 'all 0.3s var(--ease-soft)'; card.style.opacity = '0'; card.style.transform = 'scale(0.8) translateY(20px)'; setTimeout(() => card.parentNode?.removeChild(card), 300); }
                    this.saveLibraryElements(); this.updateFilterCounts(); this.showNotification(`Элемент «${removed.title}» удалён из библиотеки`);
                }
            } catch (e) { console.error('Ошибка удаления элемента из библиотеки:', e); this.showNotification('Ошибка удаления элемента', 'warning'); }
        }
        getElementTypeName(type) { const names = { focus: 'Фокус', tools: 'Инструмент', protocol: 'Протокол', verification: 'Верификация', custom: 'Пользовательский' }; return names[type] || type || 'Неизвестно'; }
        filterElements() {
            document.querySelectorAll('.element-particle-3d').forEach(card => {
                const id = parseInt(card.dataset.elementId); const el = LAB_ELEMENTS.find(e => e.id == id);
                if (!el) return;
                if (this.currentFilter === 'all' || el.type === this.currentFilter) { card.style.display = 'block'; setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0) translateZ(0)'; }, 50); }
                else { card.style.opacity = '0'; card.style.transform = 'translateY(10px) translateZ(0)'; setTimeout(() => card.style.display = 'none', 300); }
            });
        }
        updateFilterCounts() {
            ['all', 'focus', 'tools', 'protocol', 'verification', 'custom'].forEach(cat => {
                const btn = document.querySelector(`.filter-quantum-3d[data-category="${cat}"]`);
                if (btn) { const count = cat === 'all' ? LAB_ELEMENTS.length : LAB_ELEMENTS.filter(el => el.type === cat).length; const base = btn.textContent.split('(')[0].trim(); btn.innerHTML = `${base} <small>(${count})</small>`; }
            });
        }

        showQuickAddMenu(element) {
            if (!element) return;
            this.currentElementForQuickAdd = element;
            const menu = document.getElementById('quick-add-menu'), title = document.getElementById('quick-add-title'), desc = document.getElementById('quick-add-description'), stageOpts = document.getElementById('stage-options');
            if (!menu || !title || !desc || !stageOpts) return;
            title.textContent = `Добавить: ${element.title}`; desc.textContent = element.description;
            const status = this.getElementStatus(element.id);
            if (status.added) { stageOpts.innerHTML = `<div style="text-align:center;padding:40px;grid-column:1/-1;color:var(--text2)"><div style="font-size:3rem;margin-bottom:16px">✓</div><p>Этот элемент уже добавлен в методологию</p><button class="btn btn-secondary" onclick="if (window.labSystem) window.labSystem.hideQuickAddMenu()" style="margin-top:20px">Закрыть</button></div>`; }
            else {
                stageOpts.innerHTML = methodologyStages.map(stage => {
                    const cnt = Array.isArray(this.methodology.stages[stage.id]) ? this.methodology.stages[stage.id].length : 0;
                    return `<div class="stage-option" style="color:${stage.color};border-color:${stage.color}40" onclick="if (window.labSystem) { window.labSystem.addElementToStage('${stage.id}', window.labSystem.currentElementForQuickAdd); window.labSystem.hideQuickAddMenu(); }"><div style="font-size:2rem;margin-bottom:12px">${stage.icon}</div><div style="font-weight:700;margin-bottom:8px">${stage.name}</div><div style="font-size:0.9rem;color:var(--text2)">${stage.description}</div><div class="stage-option-count">${cnt}</div></div>`;
                }).join('');
            }
            menu.classList.add('active');
        }
        hideQuickAddMenu() { document.getElementById('quick-add-menu')?.classList.remove('active'); this.currentElementForQuickAdd = null; }

        toggleElementSelection(elementId) {
            if (!this.isSelectionMode) { this.isSelectionMode = true; document.body.classList.add('selection-mode-active'); this.showSelectionControls(); }
            const status = this.getElementStatus(elementId); if (status.added) return;
            if (this.selectedElements.has(elementId)) this.selectedElements.delete(elementId); else this.selectedElements.add(elementId);
            this.updateSelectionUI();
        }
        updateSelectionUI() {
            document.querySelectorAll('.element-particle-3d').forEach(card => { const id = parseInt(card.dataset.elementId); this.selectedElements.has(id) ? card.classList.add('selected') : card.classList.remove('selected'); });
            const cnt = document.getElementById('selection-count'); if (cnt) cnt.textContent = this.selectedElements.size;
            const ctrl = document.getElementById('selection-controls'); if (ctrl) { this.selectedElements.size > 0 ? ctrl.classList.add('active') : ctrl.classList.remove('active'); }
        }
        showSelectionControls() { setTimeout(() => document.getElementById('selection-controls')?.classList.add('active'), 100); }
        clearSelection() { this.selectedElements.clear(); this.isSelectionMode = false; document.body.classList.remove('selection-mode-active'); this.updateSelectionUI(); document.getElementById('selection-controls')?.classList.remove('active'); }
        addSelectedToMethodology() {
            if (this.selectedElements.size === 0) return;
            const modal = document.createElement('div'); modal.className = 'quick-add-floating-menu active';
            modal.innerHTML = `<div class="quick-add-content"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px"><h3 style="font-size:1.8rem;color:var(--lab)">Добавить выбранные элементы (${this.selectedElements.size})</h3><button class="btn-close-modal" onclick="this.closest('.quick-add-floating-menu').remove()">×</button></div><p style="color:var(--text2);margin-bottom:24px">Выберите этап методологии для добавления всех выбранных элементов</p><div class="stage-options-grid">${methodologyStages.map(stage => `<div class="stage-option" style="color:${stage.color};border-color:${stage.color}40" onclick="if (window.labSystem) { window.labSystem.addSelectedToStage('${stage.id}'); this.closest('.quick-add-floating-menu').remove(); }"><div style="font-size:2rem;margin-bottom:12px">${stage.icon}</div><div style="font-weight:700;margin-bottom:8px">${stage.name}</div><div style="font-size:0.9rem;color:var(--text2)">${stage.description}</div><div class="stage-option-count">${Array.isArray(this.methodology.stages[stage.id]) ? this.methodology.stages[stage.id].length : 0}</div></div>`).join('')}</div><div style="display:flex;gap:12px;justify-content:flex-end;margin-top:32px"><button class="btn btn-secondary" onclick="this.closest('.quick-add-floating-menu').remove()">Отмена</button></div></div>`;
            document.body.appendChild(modal);
        }
        addSelectedToStage(stageId) {
            const selected = Array.from(this.selectedElements); let added = 0;
            selected.forEach(id => {
                const el = LAB_ELEMENTS.find(e => e.id === id);
                if (el && !this.getElementStatus(el.id).added) {
                    this.methodology.stages[stageId].push(el);
                    this.methodology.elementStatus.set(el.id, { stageId, added: true, addedAt: new Date().toISOString() });
                    this.renderElementInStage(stageId, el); this.updateLibraryElementStatus(el.id); added++;
                }
            });
            this.clearSelection(); this.updateMethodologyStats(); this.saveMethodology(); this.saveLibraryElements(); this.onMethodologyChanged();
            if (added > 0) this.showNotification(`${added} элементов добавлено в методологию`);
        }

        initAnalyzer() {
            const inp = document.getElementById('analyzer-input'); if (!inp) return;
            inp.addEventListener('input', () => { const cc = document.getElementById('char-count'); if (cc) cc.textContent = inp.value.length; });
            let tout; inp.addEventListener('input', () => { clearTimeout(tout); if (inp.value.length > 200) tout = setTimeout(() => { if (inp.value.length > 0) this.analyzeText(); }, 3000); });
        }
        analyzeText() {
            const inp = document.getElementById('analyzer-input'); const res = document.getElementById('analyzer-results'); if (!inp || !res) return;
            const text = inp.value.toLowerCase(); if (!text.trim()) { this.showNotification('Введите текст для анализа'); return; }
            const found = researchPatterns.filter(p => p.detectionKeywords.some(k => text.includes(k)));
            res.style.display = 'block';
            res.innerHTML = `<div style="margin-bottom:32px"><h3 style="font-size:1.5rem;margin-bottom:24px">Результаты анализа</h3>${found.length ? `<div style="margin-bottom:24px"><div style="color:var(--step4);font-weight:700;margin-bottom:16px">⚠️ Обнаружено ${found.length} методологических проблем</div>${found.map(p => `<div style="background:rgba(244,114,182,.1);border-radius:var(--radius-md);padding:16px;margin-bottom:12px;border-left:4px solid var(--step4)"><div style="display:flex;align-items:center;gap:12px;margin-bottom:8px"><div style="font-size:1.5rem">${p.icon}</div><div style="font-weight:700">${p.name}</div></div><div style="color:var(--text2);margin-bottom:12px">${p.description}</div><div style="font-size:.9rem;color:var(--text-muted)"><strong>Рекомендация:</strong> Добавьте элемент верификации</div></div>`).join('')}</div>` : `<div style="text-align:center;padding:40px"><div style="font-size:3rem;margin-bottom:16px">✅</div><h4 style="margin-bottom:12px">Методологические проблемы не обнаружены</h4><p style="color:var(--text2)">Текст соответствует принципам научного исследования.</p></div>`}<div style="background:rgba(255,204,128,.1);border-radius:var(--radius-md);padding:20px"><h4 style="margin-bottom:12px;color:var(--lab)">Рекомендации:</h4><ul style="color:var(--text2);padding-left:20px"><li>Добавьте элементы верификации</li><li>Используйте системный подход</li><li>Проверяйте все предположения</li></ul></div></div>`;
            res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        loadResearchExample() { const inp = document.getElementById('analyzer-input'); if (inp) { inp.value = `Исследование показало, что все пользователи предпочитают новый интерфейс.\nОчевидно, что старый дизайн был неэффективен. Следовательно, необходимо немедленно внедрить изменения.\nНаши данные безусловно доказывают преимущество нового подхода.`; this.analyzeText(); } }
        clearAnalyzer() { const inp = document.getElementById('analyzer-input'); const res = document.getElementById('analyzer-results'); if (inp) inp.value = ''; if (res) { res.style.display = 'none'; res.innerHTML = ''; } const cc = document.getElementById('char-count'); if (cc) cc.textContent = '0'; }

        initAnimations() {
            const obs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }); }, { threshold: 0.1, rootMargin: '50px' });
            document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
            document.querySelectorAll('.title-word').forEach(word => word.addEventListener('mouseenter', () => this.createParticleEffect(word)));
        }
        createParticleEffect(element) {
            ORIENTIR.utils.createParticleBurst(element, { count: 8, color: 'currentColor' });
        }

        initControls() {
            if (this.scene3d) {
                new ORIENTIR.PerformanceControls(this.scene3d, {
                    toggle3DBtn: '#toggle-3d',
                    qualityBtn: '#quality-mode',
                    rotateBtn: '#auto-rotate'
                });
            }

            document.getElementById('graph-refresh')?.addEventListener('click', () => this.graphManager?.refresh());
            document.getElementById('graph-export')?.addEventListener('click', () => this.graphManager?.exportAsImage());
            document.getElementById('graph-auto-layout')?.addEventListener('click', () => { if (this.graphManager?.network) this.graphManager.network.fit({ animation: { duration: 1000, easingFunction: 'easeInOutQuad' } }); });

            document.addEventListener('keydown', e => {
                if (e.ctrlKey && e.shiftKey && e.key === 'D') { console.log('=== ОТЛАДКА СИСТЕМЫ ===', LAB_ELEMENTS, this.methodology, Array.from(this.methodology.elementStatus.entries())); this.showNotification('Информация для отладки выведена в консоль'); }
                if (e.key === 'Escape' && this.isSelectionMode) this.clearSelection();
                if (e.ctrlKey) { switch (e.key) { case 'n': e.preventDefault(); this.showElementCreationModal(); break; case 's': e.preventDefault(); this.saveMethodology(); break; case 'e': e.preventDefault(); this.exportConfiguration(); break; } }
            });
        }

        saveMethodology() {
            try {
                const elementStatusArray = this.methodology.elementStatus instanceof Map ? Array.from(this.methodology.elementStatus.entries()) : [];
                const data = { methodology: { stages: this.methodology.stages, elementStatus: elementStatusArray, version: this.methodology.version }, libraryElements: LAB_ELEMENTS.filter(el => !el.isDefault), lastModified: new Date().toISOString() };
                localStorage.setItem('lab_methodology_v2', JSON.stringify(data));
            } catch (e) { console.error('Ошибка сохранения методологии:', e); this.showNotification('Ошибка сохранения данных', 'warning'); }
        }
        loadSavedMethodology() {
            try {
                const saved = localStorage.getItem('lab_methodology_v2'); if (!saved) { this.methodology.elementStatus = new Map(); return; }
                const data = JSON.parse(saved);
                if (data.methodology) {
                    this.methodology.stages = { focus: [], tools: [], protocol: [], verification: [] };
                    if (data.methodology.stages) { Object.keys(data.methodology.stages).forEach(stageId => { if (this.methodology.stages.hasOwnProperty(stageId)) { this.methodology.stages[stageId] = data.methodology.stages[stageId].map(el => LAB_ELEMENTS.find(e => e.id == el.id) || el); } }); }
                    this.methodology.elementStatus = new Map(); if (Array.isArray(data.methodology.elementStatus)) { data.methodology.elementStatus.forEach(([k, v]) => { if (k !== undefined && v !== undefined) this.methodology.elementStatus.set(Number(k), v); }); }
                    setTimeout(() => this.visualizeLoadedMethodology(), 500);
                }
            } catch (e) { console.warn('Ошибка загрузки методологии:', e); this.methodology.elementStatus = new Map(); }
        }
        visualizeLoadedMethodology() {
            try {
                methodologyStages.forEach(stage => { const c = document.getElementById(`elements-${stage.id}`); if (c) { c.innerHTML = ''; c.classList.remove('empty'); } });
                methodologyStages.forEach(stage => { const els = this.methodology.stages[stage.id]; if (Array.isArray(els)) els.forEach(el => this.renderElementInStage(stage.id, el)); const c = document.getElementById(`elements-${stage.id}`); if (c && c.children.length === 0) { c.innerHTML = `<div class="empty-stage-icon">${stage.placeholderIcon}</div><p>${stage.placeholder}</p><small>Нажмите на элемент в библиотеке и выберите этот этап</small>`; c.classList.add('empty'); } });
                this.updateMethodologyStats();
                LAB_ELEMENTS.forEach(el => this.updateLibraryElementStatus(el.id));
            } catch (e) { console.error('Ошибка визуализации методологии:', e); }
        }

        onMethodologyChanged() { setTimeout(() => { try { this.graphManager?.refresh(); } catch (e) { console.error('Ошибка обновления графа:', e); } }, 100); }

        // Метод startInteractiveDemo УДАЛЁН

        showElementPreview(element) {
            if (!document.getElementById('preview-styles')) {
                const style = document.createElement('style');
                style.id = 'preview-styles';
                style.textContent = `
                    .element-preview-modal{position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px}
                    .preview-backdrop{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(10,14,20,.95);backdrop-filter:blur(10px)}
                    .preview-content{position:relative;background:var(--surface);border-radius:var(--radius-xl);padding:32px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;border:2px solid rgba(255,204,128,.3);box-shadow:0 40px 120px rgba(0,0,0,.8);animation:previewSlideIn .4s var(--ease-soft)}
                    @keyframes previewSlideIn{from{opacity:0;transform:translateY(30px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
                    .preview-close{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;border:none;background:rgba(255,255,255,.1);color:var(--text);font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s}
                    .preview-close:hover{background:rgba(255,255,255,.2);transform:rotate(90deg)}
                    .preview-header{display:flex;align-items:center;gap:20px;margin-bottom:24px;padding-bottom:20px;border-bottom:2px solid rgba(255,255,255,.1)}
                    .preview-icon{font-size:3rem}
                    .preview-title{font-size:1.5rem;font-weight:800;margin-bottom:8px}
                    .preview-meta{display:flex;gap:16px;font-size:.9rem;color:var(--text2)}
                    .preview-body{display:flex;flex-direction:column;gap:24px}
                    .preview-description h4,.preview-tags h4{font-size:1rem;margin-bottom:12px;color:var(--text);font-weight:700}
                    .preview-description p{color:var(--text2);line-height:1.6}
                    .preview-tags .tags-container{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
                    .preview-tag{display:inline-block;padding:6px 12px;background:rgba(255,255,255,.07);border-radius:16px;font-size:.8rem;color:var(--text2);white-space:nowrap}
                    .preview-actions{display:flex;gap:12px;margin-top:24px}
                    .preview-action-btn{flex:1;padding:12px 20px;border-radius:var(--radius-md);border:2px solid transparent;font-family:'Manrope',sans-serif;font-weight:600;cursor:pointer;transition:all .3s;display:flex;align-items:center;justify-content:center;gap:8px}
                    .preview-action-btn.primary{background:var(--lab);color:#fff}
                    .preview-action-btn.primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,204,128,.3)}
                    .preview-action-btn.secondary{background:rgba(255,255,255,.1);color:var(--text);border-color:rgba(255,255,255,.2)}
                    .preview-action-btn.secondary:hover{background:rgba(255,255,255,.15)}
                `;
                document.head.appendChild(style);
            }

            const modal = document.createElement('div');
            modal.className = 'element-preview-modal';
            modal.innerHTML = `
                <div class="preview-backdrop" onclick="this.closest('.element-preview-modal').remove()"></div>
                <div class="preview-content">
                    <button class="preview-close" onclick="this.closest('.element-preview-modal').remove()"><span>×</span></button>
                    <div class="preview-header">
                        <div class="preview-icon">${element.icon}</div>
                        <div>
                            <h3 class="preview-title">${element.title}</h3>
                            <div class="preview-meta">
                                <span class="preview-type" style="color:${element.color}">${this.getElementTypeName(element.type)}</span>
                                <span class="preview-id">ID: ${element.id}</span>
                            </div>
                        </div>
                    </div>
                    <div class="preview-body">
                        <div class="preview-description">
                            <h4>Описание</h4>
                            <p>${element.description}</p>
                        </div>
                        ${element.tags?.length ? `
                            <div class="preview-tags">
                                <h4>Теги</h4>
                                <div class="tags-container">
                                    ${element.tags.map(tag => `<span class="preview-tag">${tag}</span>`).join(' ')}
                                </div>
                            </div>
                        ` : ''}
                        <div class="preview-actions">
                            <button class="preview-action-btn primary" onclick="if (window.labSystem) { window.labSystem.showQuickAddMenu(${JSON.stringify(element).replace(/"/g, '&quot;')}); this.closest('.element-preview-modal').remove(); }">
                                <span>➕</span> Добавить в методологию
                            </button>
                            <button class="preview-action-btn secondary" onclick="this.closest('.element-preview-modal').remove()">Закрыть</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        showElementCreationModal() {
            const modal = document.getElementById('element-creation-modal'); const content = document.getElementById('modal-content-3d');
            if (!modal || !content) return;
            content.innerHTML = `<button class="btn-close-modal" onclick="if (window.labSystem) window.labSystem.closeModal()">×</button><div style="margin-bottom:32px"><h3 style="font-size:1.8rem;margin-bottom:24px;color:var(--lab)">Создать новый элемент</h3><div style="display:grid;gap:24px"><div><label style="display:block;margin-bottom:8px;font-weight:600">Название</label><input type="text" id="new-element-name" style="width:100%;padding:12px;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);border-radius:var(--radius-md);color:var(--text)" placeholder="Например: 'Динамический анализ систем'"></div><div><label style="display:block;margin-bottom:8px;font-weight:600">Описание</label><textarea id="new-element-desc" style="width:100%;padding:12px;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);border-radius:var(--radius-md);color:var(--text);min-height:100px" placeholder="Опишите назначение..."></textarea></div><div><label style="display:block;margin-bottom:8px;font-weight:600">Тип</label><select id="new-element-type" style="width:100%;padding:12px;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);border-radius:var(--radius-md);color:var(--text)"><option value="focus">Фокус</option><option value="tools">Инструмент</option><option value="protocol">Протокол</option><option value="verification">Верификация</option><option value="custom">Пользовательский</option></select></div><div><label style="display:block;margin-bottom:8px;font-weight:600">Иконка</label><div style="display:flex;gap:12px;flex-wrap:wrap"><button class="icon-btn" data-icon="🔬" onclick="this.parentElement.querySelectorAll('.icon-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">🔬</button><button class="icon-btn" data-icon="🕸️" onclick="this.parentElement.querySelectorAll('.icon-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">🕸️</button><button class="icon-btn" data-icon="🤖" onclick="this.parentElement.querySelectorAll('.icon-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">🤖</button><button class="icon-btn" data-icon="📊" onclick="this.parentElement.querySelectorAll('.icon-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">📊</button><button class="icon-btn" data-icon="🔍" onclick="this.parentElement.querySelectorAll('.icon-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">🔍</button></div></div></div></div><div style="display:flex;gap:16px"><button class="btn btn-primary" onclick="if (window.labSystem) window.labSystem.createNewElement()"><span>⚡</span> Создать</button><button class="btn btn-secondary" onclick="if (window.labSystem) window.labSystem.closeModal()">Отмена</button></div>`;
            const style = document.createElement('style'); style.textContent = `.icon-btn{width:48px;height:48px;font-size:1.5rem;background:rgba(255,255,255,.05);border:2px solid transparent;border-radius:var(--radius-md);cursor:pointer;transition:all .3s}.icon-btn:hover{background:rgba(255,255,255,.1);transform:scale(1.1)}.icon-btn.active{background:var(--lab);border-color:var(--lab)}`; document.head.appendChild(style);
            modal.classList.add('active');
        }
        closeModal() {
            const modal = document.getElementById('element-creation-modal');
            if (modal) {
                modal.classList.remove('active');
                const nameInput = document.getElementById('new-element-name');
                if (nameInput) nameInput.value = '';

                const descInput = document.getElementById('new-element-desc');
                if (descInput) descInput.value = '';

                const typeSelect = document.getElementById('new-element-type');
                if (typeSelect) typeSelect.value = 'focus';
                document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('active'));
            }
        }
        createNewElement() {
            const name = document.getElementById('new-element-name'); const desc = document.getElementById('new-element-desc'); const type = document.getElementById('new-element-type'); const iconBtn = document.querySelector('.icon-btn.active');
            if (!name?.value.trim() || !desc?.value.trim() || !type?.value) { this.showNotification('Заполните все поля', 'warning'); return; }
            const newId = Date.now(); const newEl = { id: newId, icon: iconBtn?.dataset.icon || '🔬', title: name.value.trim(), type: type.value, description: desc.value.trim(), tags: [], color: methodologyStages.find(s => s.id === type.value)?.color || 'var(--lab)', rgb: methodologyStages.find(s => s.id === type.value)?.rgb || '255,204,128', createdAt: new Date().toISOString(), isDefault: false };
            LAB_ELEMENTS.push(newEl); this.saveLibraryElements(); this.closeModal();
            const grid = document.getElementById('quantum-grid-3d'); if (grid) { const card = this.createElementCard(newEl); if (card) { grid.appendChild(card); card.style.opacity = '0'; card.style.transform = 'scale(0.8)'; setTimeout(() => { card.style.transition = 'all 0.5s var(--ease-soft)'; card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 10); } }
            this.updateFilterCounts(); this.showNotification(`Элемент «${newEl.title}» создан`);
            setTimeout(() => { const el = document.querySelector(`[data-element-id="${newId}"]`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); el.animate([{ transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255,204,128,0)' }, { transform: 'scale(1.05)', boxShadow: '0 0 20px 10px rgba(255,204,128,0.3)' }, { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255,204,128,0)' }], { duration: 1000 }); } }, 500);
        }

        showImportDialog() {
            const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'; input.style.display = 'none';
            input.addEventListener('change', e => {
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        if (data.elements && Array.isArray(data.elements)) {
                            const grid = document.getElementById('quantum-grid-3d'); let imported = 0;
                            data.elements.forEach(newEl => {
                                if (!LAB_ELEMENTS.some(ex => ex.id === newEl.id)) {
                                    LAB_ELEMENTS.push({ ...newEl, isDefault: false });
                                    if (grid) { const card = this.createElementCard(newEl); if (card) { grid.appendChild(card); imported++; } }
                                }
                            });
                            this.updateFilterCounts(); this.filterElements(); this.saveLibraryElements();
                            this.showNotification(`Импортировано ${imported} элементов`);
                        } else throw new Error('Неверный формат файла');
                    } catch (err) { console.error('Ошибка импорта:', err); this.showNotification('Ошибка чтения файла', 'warning'); }
                };
                reader.readAsText(file);
            });
            document.body.appendChild(input); input.click(); setTimeout(() => input.parentNode?.removeChild(input), 100);
        }

        showExportOptions() {
            const modal = document.createElement('div');
            modal.innerHTML = `<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--surface);border-radius:var(--radius-xl);padding:24px;z-index:10000;box-shadow:0 40px 120px rgba(0,0,0,.8);min-width:400px;border:2px solid var(--lab)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><strong style="font-size:1.2rem">📤 Экспорт</strong><button onclick="this.closest('div').remove()" style="background:none;border:none;color:var(--text2);font-size:1.5rem;cursor:pointer">×</button></div><div style="display:grid;gap:12px;margin-bottom:24px"><button onclick="if (window.labSystem) window.labSystem.exportConfiguration()" style="display:flex;align-items:center;gap:16px;padding:16px;background:rgba(255,204,128,.1);border:1px solid var(--lab);border-radius:var(--radius-md);color:var(--text);cursor:pointer;transition:all .3s"><span style="font-size:1.5rem">📄</span><div style="text-align:left"><div style="font-weight:600">JSON (рекомендуется)</div><div style="font-size:.9rem;color:var(--text2)">Полная структура, можно импортировать обратно</div></div></button><button onclick="if (window.labSystem) window.labSystem.exportAsHTML()" style="display:flex;align-items:center;gap:16px;padding:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:var(--radius-md);color:var(--text);cursor:pointer;transition:all .3s"><span style="font-size:1.5rem">🌐</span><div style="text-align:left"><div style="font-weight:600">HTML отчет</div><div style="font-size:.9rem;color:var(--text2)">Красивый читаемый формат</div></div></button></div><div style="font-size:.9rem;color:var(--text-muted);text-align:center">Всего элементов: ${Object.values(this.methodology.stages).reduce((s, a) => s + (Array.isArray(a) ? a.length : 0), 0)}</div></div>`;
            document.body.appendChild(modal);
            setTimeout(() => { const handler = e => { if (!modal.contains(e.target)) { modal.remove(); document.removeEventListener('click', handler); } }; document.addEventListener('click', handler); }, 0);
        }
        exportConfiguration() {
            try {
                const elementStatusArray = this.methodology.elementStatus instanceof Map ? Array.from(this.methodology.elementStatus.entries()) : [];
                const config = { version: '2.1', name: 'Методология', timestamp: new Date().toISOString(), methodology: { stages: this.methodology.stages, elementStatus: elementStatusArray, version: this.methodology.version }, libraryElements: LAB_ELEMENTS.filter(el => !el.isDefault), stages: methodologyStages };
                const dataStr = JSON.stringify(config, null, 2); const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr); const fileName = `методология_${new Date().toISOString().split('T')[0]}.json`;
                const link = document.createElement('a'); link.href = dataUri; link.download = fileName; link.click(); this.showNotification('Конфигурация экспортирована');
            } catch (e) { console.error('Ошибка экспорта конфигурации:', e); this.showNotification('Ошибка экспорта', 'warning'); }
        }
        exportAsHTML() {
            try {
                let html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>Методология</title><style>body{font-family:'Segoe UI',sans-serif;line-height:1.6;max-width:1000px;margin:0 auto;padding:20px}.stage{background:#f5f5f5;border-radius:10px;padding:20px;margin:20px 0;border-left:4px solid}.element{background:#fff;border-radius:8px;padding:15px;margin:10px 0;box-shadow:0 2px 4px rgba(0,0,0,.1)}</style></head><body><h1>Методология исследования</h1><div style="background:#fff3cd;padding:15px;border-radius:8px;margin-bottom:20px"><p><strong>Дата:</strong> ${new Date().toLocaleString()}</p><p><strong>Всего элементов:</strong> ${Object.values(this.methodology.stages).reduce((s, a) => s + (Array.isArray(a) ? a.length : 0), 0)}</p></div>`;
                methodologyStages.forEach(stage => { const els = this.methodology.stages[stage.id]; const cnt = Array.isArray(els) ? els.length : 0; html += `<div class="stage" style="border-color:${stage.color}"><h2>${stage.icon} ${stage.name}</h2>${cnt ? els.map(el => `<div class="element"><h3>${el.icon} ${el.title}</h3><p>${el.description}</p><small>Тип: ${this.getElementTypeName(el.type)} | ID: ${el.id}</small></div>`).join('') : '<p><em>Нет элементов</em></p>'}</div>`; });
                html += '</body></html>';
                const blob = new Blob([html], { type: 'text/html' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `методология_${new Date().toISOString().split('T')[0]}.html`; link.click(); URL.revokeObjectURL(url); this.showNotification('HTML отчет экспортирован');
            } catch (e) { console.error('Ошибка экспорта HTML:', e); this.showNotification('Ошибка экспорта HTML', 'warning'); }
        }

        showEthicsReport() { alert(`Политика приватности:\n\n1. Этот сайт не собирает персональные данные\n2. Не использует cookies для отслеживания\n3. Все вычисления происходят локально`); }

        showNotification(message, type = 'success') {
            ORIENTIR.utils.NotificationUtils.show(message, type);
        }

        dispose() {
            if (this.scene3d) this.scene3d.dispose();
        }
    }

    // ==========================================================================
    // ИНИЦИАЛИЗАЦИЯ
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        window.labSystem = new LabSystem();

        window.addEventListener('beforeunload', () => window.labSystem?.dispose());

        const newElementBtn = document.getElementById('new-element-btn');
        if (newElementBtn) newElementBtn.addEventListener('click', () => window.labSystem?.showElementCreationModal());

        const importBtn = document.getElementById('import-elements-btn');
        if (importBtn) importBtn.addEventListener('click', () => window.labSystem?.showImportDialog());

        const exportBtn = document.getElementById('export-elements-btn');
        if (exportBtn) exportBtn.addEventListener('click', () => window.labSystem?.showExportOptions());

        const createElementCard = document.getElementById('create-element-card');
        if (createElementCard) createElementCard.addEventListener('click', () => window.labSystem?.showElementCreationModal());

        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn) analyzeBtn.addEventListener('click', () => window.labSystem?.analyzeText());

        const loadExampleBtn = document.getElementById('load-example-btn');
        if (loadExampleBtn) loadExampleBtn.addEventListener('click', () => window.labSystem?.loadResearchExample());

        const clearAnalyzerBtn = document.getElementById('clear-analyzer-btn');
        if (clearAnalyzerBtn) clearAnalyzerBtn.addEventListener('click', () => window.labSystem?.clearAnalyzer());

        const closeQuickAdd = document.getElementById('close-quick-add');
        if (closeQuickAdd) closeQuickAdd.addEventListener('click', () => window.labSystem?.hideQuickAddMenu());

        const cancelQuickAdd = document.getElementById('cancel-quick-add');
        if (cancelQuickAdd) cancelQuickAdd.addEventListener('click', () => window.labSystem?.hideQuickAddMenu());

        const clearSelectionBtn = document.getElementById('clear-selection-btn');
        if (clearSelectionBtn) clearSelectionBtn.addEventListener('click', () => window.labSystem?.clearSelection());

        const addSelectedBtn = document.getElementById('add-selected-btn');
        if (addSelectedBtn) addSelectedBtn.addEventListener('click', () => window.labSystem?.addSelectedToMethodology());

        const privacyBtn = document.getElementById('privacy-policy-btn');
        if (privacyBtn) privacyBtn.addEventListener('click', () => window.labSystem?.showEthicsReport());

        window.addEventListener('scroll', () => {
            const header = document.getElementById('site-header');
            if (header) {
                if (window.scrollY > 50) {
                    header.style.background = 'rgba(10,14,20,.98)';
                    header.style.backdropFilter = 'blur(30px)';
                } else {
                    header.style.background = 'rgba(10,14,20,.98)';
                    header.style.backdropFilter = 'blur(20px)';
                }
            }
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

        console.log('Лаборатория успешно инициализирована');
    });

})();