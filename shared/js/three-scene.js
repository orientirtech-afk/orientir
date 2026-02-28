/* ==========================================================================
   three-scene.js – Базовые классы для Three.js сцен
   Зависимости: THREE (глобально), ORIENTIR.utils, ORIENTIR.CONFIG
   Оптимизированная версия с отключением raycasting на мобильных.
   ========================================================================== */

window.ORIENTIR = window.ORIENTIR || {};
ORIENTIR.Three = {};

// ---------- Базовый класс ----------
ORIENTIR.Three.BaseThreeScene = class BaseThreeScene {
    constructor(settings = {}) {
        this.settings = {
            containerId: 'three-container',
            antialias: !ORIENTIR.utils.DOMUtils.isMobile(),
            pixelRatio: ORIENTIR.utils.DOMUtils.isMobile() ? 1 : Math.min(window.devicePixelRatio, 2),
            clearColor: 0x000000,
            clearAlpha: 0,
            autoRotate: ORIENTIR.CONFIG.AUTO_ROTATE,
            fog: null,
            // Сохраняем любые переданные массивы/свойства
            sphereColors: null,
            levelColors: null,
            creativeObjects: null,
            particles: null,
            creativePalette: null,
            ...settings
        };

        // Сохраняем переданные массивы как свойства экземпляра
        if (this.settings.sphereColors) this.sphereColors = this.settings.sphereColors;
        if (this.settings.levelColors) this.levelColors = this.settings.levelColors;
        if (this.settings.creativeObjects) this.creativeObjects = this.settings.creativeObjects;
        if (this.settings.particles) this.particles = this.settings.particles;
        if (this.settings.creativePalette) this.creativePalette = this.settings.creativePalette;

        // Инициализируем массивы, которые могут понадобиться наследникам
        this.orbitalObjects = this.settings.orbitalObjects || [];
        this.nodes = this.settings.nodes || [];
        this.connections = this.settings.connections || [];
        this.particles = this.settings.particles || [];   // исправлено (было this.people)
        this.creativeObjects = this.settings.creativeObjects || [];

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();
        this.isRunning = false;
        this.rafId = null;

        this.init();
    }

    init() {
        if (typeof THREE === 'undefined') {
            console.error('[Three] Библиотека не загружена');
            return;
        }
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createObjects(); // будет вызван после того, как все массивы уже инициализированы
        this.bindEvents();
        this.startAnimation();
    }

    createScene() {
        this.scene = new THREE.Scene();
        if (this.settings.fog) {
            this.scene.fog = this.settings.fog;
        }
    }

    createCamera() {
        const container = document.getElementById(this.settings.containerId);
        if (!container) return;
        const aspect = container.clientWidth / container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(0, 5, 25);
    }

    createRenderer() {
        const container = document.getElementById(this.settings.containerId);
        if (!container) return;

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: this.settings.antialias,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(this.settings.pixelRatio);
        this.renderer.setClearColor(this.settings.clearColor, this.settings.clearAlpha);
        container.appendChild(this.renderer.domElement);
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }

    createObjects() {
        // Переопределяется в наследниках
    }

    update(delta, elapsedTime) {
        // Переопределяется в наследниках
    }

    bindEvents() {
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('visibilitychange', () => this.onVisibilityChange());
    }

    onWindowResize() {
        const container = document.getElementById(this.settings.containerId);
        if (!container) return;
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    onVisibilityChange() {
        if (document.hidden) {
            this.stopAnimation();
        } else {
            this.startAnimation();
        }
    }

    startAnimation() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }

    animate() {
        if (!this.isRunning) return;
        this.rafId = requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.elapsedTime;

        this.update(delta, elapsedTime);
        this.renderer.render(this.scene, this.camera);
    }

    stopAnimation() {
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    setQuality(quality) {
        this.settings.quality = quality;
        const pixelRatio = quality === 'high' ? Math.min(window.devicePixelRatio, 2) : 1;
        this.renderer.setPixelRatio(pixelRatio);
    }

    setAutoRotate(enable) {
        this.settings.autoRotate = enable;
    }

    toggleRotation() {
        this.settings.autoRotate = !this.settings.autoRotate;
        return this.settings.autoRotate;
    }

    toggleQuality() {
        this.settings.quality = this.settings.quality === 'high' ? 'low' : 'high';
        this.setQuality(this.settings.quality);
        return this.settings.quality;
    }

    dispose() {
        this.stopAnimation();
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            if (this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
        if (this.controls) this.controls.dispose();
        window.removeEventListener('resize', this.onWindowResize);
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
};

// ---------- Реализация: EnhancedNeuralGarden (нейронный сад, частицы, сферы) ----------
ORIENTIR.Three.EnhancedNeuralGarden = class EnhancedNeuralGarden extends ORIENTIR.Three.BaseThreeScene {
    constructor(settings = {}) {
        // Подготовка данных для super
        const sphereColors = [
            { hex: ORIENTIR.CONFIG.COLORS.PRIMARY_BLUE, label: 'Защита от манипуляций ИИ' },
            { hex: ORIENTIR.CONFIG.COLORS.PRIMARY_GREEN, label: 'Локальный ИИ' },
            { hex: ORIENTIR.CONFIG.COLORS.PRIMARY_YELLOW, label: 'Лаборатория' },
            { hex: ORIENTIR.CONFIG.COLORS.PRIMARY_PINK, label: 'Творчество' }
        ];
        const defaultSettings = {
            containerId: 'three-container',
            particleCount: ORIENTIR.CONFIG.PARTICLE_COUNT || 400,
            connectionDistance: ORIENTIR.CONFIG.CONNECTION_DISTANCE || 100,
            autoRotate: ORIENTIR.CONFIG.AUTO_ROTATE !== false,
            quality: ORIENTIR.CONFIG.QUALITY || 'high',
            fog: new THREE.FogExp2(0x0a0e14, 0.03),
            sphereColors: sphereColors
        };

        // Сначала super
        super({ ...defaultSettings, ...settings });

        // Теперь инициализация собственных полей
        this.mousePos = new THREE.Vector2(0, 0);
        this.hoverIntensity = 0;
        this.time = 0;
        this.activeSphereLabel = null;
        // Используем значение из конфига с защитой на случай, если конфиг ещё не загружен
        this.rotationSpeed = (ORIENTIR.CONFIG && ORIENTIR.CONFIG.SPHERE_ROTATION_SPEED) || 0.0008;

        // Сохраняем переданные цвета для удобства (можно везде использовать this.sphereColors)
        this.sphereColors = this.settings.sphereColors;

        // Инициализируем остальные массивы
        this.orbitalObjects = this.settings.orbitalObjects || [];
        this.nodes = this.settings.nodes || [];
        this.connections = this.settings.connections || [];
        this.particles = this.settings.particles || [];
        this.creativeObjects = this.settings.creativeObjects || [];

        this.particleSystem = null;
        this.particleGeometry = null;
        this.particleMaterial = null;
        this.connections = null;
    }

    createCamera() {
        super.createCamera();
        this.camera.position.z = 35;
        this.camera.position.y = 10;
        this.camera.lookAt(0, 0, 0); // обязательно!
    }

    createObjects() {
        this.createParticleSystem();
        if (!ORIENTIR.utils.DOMUtils.isMobile()) {
            this.createConnections();
            this.setupMouseInteraction();
        }
    }

    createParticleSystem() {
        const isMobile = ORIENTIR.utils.DOMUtils.isMobile();
        this.particleGeometry = new THREE.BufferGeometry();

        const count = this.settings.particleCount;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const colorHelper = new THREE.Color();

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const radius = 12 + Math.random() * 8;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            const colorData = this.sphereColors[Math.floor(Math.random() * this.sphereColors.length)];
            colorHelper.setHex(colorData.hex);
            colors[i3] = colorHelper.r;
            colors[i3 + 1] = colorHelper.g;
            colors[i3 + 2] = colorHelper.b;

            sizes[i] = 0.5 + Math.random() * 0.5;
        }

        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        let vertexShader, fragmentShader;

        if (isMobile) {
            vertexShader = `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
            fragmentShader = `
            varying vec3 vColor;
            uniform float hoverIntensity;
            void main() {
                vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                float r = dot(cxy, cxy);
                if (r > 1.0) discard;
                float alpha = (1.0 - r) * 0.6 * (1.0 + hoverIntensity * 0.5);
                gl_FragColor = vec4(vColor, alpha);
            }
        `;
        } else {
            vertexShader = `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                float pulse = 1.0 + 0.2 * sin(time * 2.0 + position.x * 0.5);
                gl_PointSize = size * (300.0 / -mvPosition.z) * pulse;
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
            fragmentShader = `
            varying vec3 vColor;
            uniform float time;
            uniform float hoverIntensity;
            void main() {
                vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                float r = dot(cxy, cxy);
                if (r > 1.0) discard;
                float dist = length(cxy);
                float alpha = (1.0 - dist) * (0.7 + 0.3 * sin(time * 5.0 + gl_PointCoord.x * 20.0));
                alpha *= (1.0 + hoverIntensity);
                float glow = smoothstep(0.8, 1.0, dist);
                alpha += glow * 0.2 * (1.0 + hoverIntensity);
                gl_FragColor = vec4(vColor, alpha);
            }
        `;
        }

        this.particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: this.time },
                mousePos: { value: this.mousePos },
                hoverIntensity: { value: this.hoverIntensity }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
        this.scene.add(this.particleSystem);
    }

    createConnections() {
        const positions = this.particleGeometry.attributes.position.array;
        const lines = [];
        const maxChecks = Math.min(positions.length / 3, 150);

        for (let i = 0; i < maxChecks; i++) {
            const i3 = i * 3;
            const x1 = positions[i3];
            const y1 = positions[i3 + 1];
            const z1 = positions[i3 + 2];

            for (let j = i + 1; j < maxChecks; j++) {
                const j3 = j * 3;
                const x2 = positions[j3];
                const y2 = positions[j3 + 1];
                const z2 = positions[j3 + 2];
                const distance = Math.sqrt(
                    Math.pow(x2 - x1, 2) +
                    Math.pow(y2 - y1, 2) +
                    Math.pow(z2 - z1, 2)
                );

                if (distance < this.settings.connectionDistance) {
                    lines.push(x1, y1, z1, x2, y2, z2);
                }
            }
        }

        const lineGeometry = new THREE.BufferGeometry();
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x4fc3f7,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending
        });

        this.connections = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(this.connections);
    }

    setupMouseInteraction() {
        if (ORIENTIR.utils.DOMUtils.isMobile()) return;
        const container = this.renderer.domElement;
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            this.mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            if (this.particleMaterial) {
                this.particleMaterial.uniforms.mousePos.value = this.mousePos;
                this.particleMaterial.uniforms.hoverIntensity.value = 1;
            }
            this.handleParticleHover(e);
        });
        container.addEventListener('mouseleave', () => {
            this.mousePos.set(0, 0);
            if (this.particleMaterial) {
                this.particleMaterial.uniforms.hoverIntensity.value = 0;
            }
            this.clearSphereHighlight();
        });
    }

    handleParticleHover(event) {
        if (ORIENTIR.utils.DOMUtils.isMobile()) return;
        if (!this.renderer || !this.camera || !this.particleSystem) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = {
            x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
            y: -((event.clientY - rect.top) / rect.height) * 2 + 1
        };

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const intersects = raycaster.intersectObject(this.particleSystem);
        if (intersects.length > 0) {
            const index = intersects[0].index;
            const colors = this.particleGeometry.attributes.color.array;
            const r = colors[index * 3];
            const g = colors[index * 3 + 1];
            const b = colors[index * 3 + 2];
            const color = new THREE.Color(r, g, b);
            const colorHex = color.getHex();

            const sphereColors = {
                '0x4fc3f7': 'Защита от манипуляций ИИ',
                '0xa5d6a7': 'Локальный ИИ',
                '0xffcc80': 'Лаборатория',
                '0xf48fb1': 'Творчество'
            };

            const colorKey = Object.keys(sphereColors).find(key => Math.abs(parseInt(key) - colorHex) < 100);
            if (colorKey) {
                const label = sphereColors[colorKey];
                this.highlightSphere(label);
            }
        } else {
            this.clearSphereHighlight();
        }
    }

    highlightSphere(label) {
        document.querySelectorAll('.sphere-link').forEach(link => link.classList.remove('particle-hover'));
        const sphereLink = document.querySelector(`.sphere-link[data-label="${label}"]`);
        if (sphereLink) {
            sphereLink.classList.add('particle-hover');
            this.activeSphereLabel = label;
            if (this.particleMaterial) {
                this.particleMaterial.uniforms.hoverIntensity.value = 2;
            }
        }
    }

    clearSphereHighlight() {
        document.querySelectorAll('.sphere-link').forEach(link => link.classList.remove('particle-hover'));
        this.activeSphereLabel = null;
        if (this.particleMaterial) {
            this.particleMaterial.uniforms.hoverIntensity.value = 0;
        }
    }

    onSphereHover(label, intensity) {
        this.hoverIntensity = intensity * 2;
        if (this.particleMaterial) {
            this.particleMaterial.uniforms.hoverIntensity.value = this.hoverIntensity;
        }
    }

    update(delta, time) {
        this.time += delta;
        if (this.particleMaterial) {
            this.particleMaterial.uniforms.time.value = this.time;
        }
        // ---------- ИСПРАВЛЕНИЕ: защита от NaN в повороте ----------
        if (this.settings.autoRotate && this.scene) {
            // Проверяем, что скорость вращения — корректное число
            const rotSpeed = (typeof this.rotationSpeed === 'number' && !isNaN(this.rotationSpeed) && isFinite(this.rotationSpeed))
                ? this.rotationSpeed
                : 0.0008; // надёжное значение по умолчанию
            this.scene.rotation.y += rotSpeed;
            this.scene.rotation.x += 0.0002;
        }
        // -----------------------------------------------------------
        if (this.controls) this.controls.update();
    }

    setSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        if (newSettings.autoRotate !== undefined) {
            this.settings.autoRotate = newSettings.autoRotate;
        }
        if (newSettings.quality !== undefined) {
            this.setQuality(newSettings.quality);
        }
    }
};