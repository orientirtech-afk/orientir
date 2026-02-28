/**
 * page-orientir.js – УНИКАЛЬНЫЙ JS ДЛЯ СТРАНИЦЫ "ЗАЩИТА ОТ ИИ"
 * Исправленная версия: добавлено единое управление шапкой.
 */

(function () {
    'use strict';

    // ==========================================================================
    // ДАННЫЕ
    // ==========================================================================

    const protectionLevels = [
        {
            id: 1,
            name: "Прозрачность намерений",
            color: "var(--color-accent-blue)",
            rgb: "79,195,247",
            icon: "🔍",
            shortDesc: "ИИ показывает свои мотивации",
            fullDesc: "Система обязана показывать, почему она предлагает тот или иной вариант. Это устраняет скрытые векторы влияния.",
            mechanisms: [
                "Декларация намерений перед предложением",
                "Прямые ссылки на источники данных",
                "История принятия решений доступна",
                "Оповещение о возможной манипуляции",
                "Показ альтернативных вариантов"
            ],
            defaultIntensity: 75,
            quickSettings: [
                { id: "show_motivation", label: "Показывать мотивацию", default: true },
                { id: "show_sources", label: "Показывать источники", default: true },
                { id: "show_alternatives", label: "Показывать альтернативы", default: false }
            ],
            relatedPatterns: ["authority"]
        },
        {
            id: 2,
            name: "Стабилизация эмоций",
            color: "var(--color-accent-green)",
            rgb: "165,214,167",
            icon: "😐",
            shortDesc: "Нейтральный стиль без подстройки",
            fullDesc: "ИИ не имеет права менять тональность, подстраиваться под эмоции или усиливать тревогу/вдохновение.",
            mechanisms: [
                "Нейтральный стиль общения (шкала эмоций: 0.3-0.7)",
                "Запрет на слова: 'срочно', 'последний шанс'",
                "Фиксированный темп ответов",
                "Стабильный ответ на негативные реакции",
                "Контроль эмоциональных сигналов"
            ],
            defaultIntensity: 100,
            quickSettings: [
                { id: "neutral_tone", label: "Нейтральный тон", default: true },
                { id: "block_urgency", label: "Блокировать срочность", default: true },
                { id: "fixed_timing", label: "Фиксированный темп", default: true }
            ],
            relatedPatterns: ["urgency", "emotional_appeal", "fear_mongering"]
        },
        {
            id: 3,
            name: "Случайность подачи",
            color: "var(--color-accent-yellow)",
            rgb: "255,204,128",
            icon: "🎲",
            shortDesc: "Разрушение паттернов через непредсказуемость",
            fullDesc: "Чтобы ИИ не мог создавать шаблоны поведения, вводится лёгкая непредсказуемость в порядке предложений.",
            mechanisms: [
                "Случайный порядок предложений",
                "Разнообразие вариантов вывода",
                "Визуальное разнообразие элементов",
                "Рекомендации из разных категорий",
                "Непредсказуемость паттернов"
            ],
            defaultIntensity: 60,
            quickSettings: [
                { id: "random_order", label: "Случайный порядок", default: true },
                { id: "visual_variety", label: "Визуальное разнообразие", default: true },
                { id: "cross_category", label: "Межкатегорийные рекомендации", default: false }
            ],
            relatedPatterns: []
        },
        {
            id: 4,
            name: "Фиксация темпа",
            color: "var(--color-accent-pink)",
            rgb: "244,143,177",
            icon: "⏱️",
            shortDesc: "Защита от манипуляции временем",
            fullDesc: "ИИ не может навязывать ритм взаимодействия. Фиксированные задержки защищают от когнитивной нагрузки.",
            mechanisms: [
                "Предсказуемость темпа (задержка 2±0.5с)",
                "Фиксированная длина сообщений",
                "Защита от ускорения/замедления мышления",
                "Стандартные паузы в диалоге",
                "Отсутствие временного давления"
            ],
            defaultIntensity: 80,
            quickSettings: [
                { id: "fixed_delay", label: "Фиксированная задержка", default: true },
                { id: "message_length", label: "Ограничение длины", default: true },
                { id: "no_time_pressure", label: "Без временного давления", default: true }
            ],
            relatedPatterns: ["overwhelming"]
        },
        {
            id: 5,
            name: "Интерфейс независимости",
            color: "var(--color-accent-purple)",
            rgb: "179,157,219",
            icon: "⚖️",
            shortDesc: "Выбор без навязывания",
            fullDesc: "Интерфейс не влияет на выбор. Предоставляются факты, а не интерпретации. Минимум рекомендаций.",
            mechanisms: [
                "Выбор без навязывания",
                "Предоставление фактов, а не интерпретаций",
                "Минимизация рекомендаций",
                "Множественные перспективы",
                "Балансировка языковых паттернов"
            ],
            defaultIntensity: 70,
            quickSettings: [
                { id: "facts_only", label: "Только факты", default: true },
                { id: "multiple_views", label: "Множество точек зрения", default: true },
                { id: "min_recommendations", label: "Минимум рекомендаций", default: true }
            ],
            relatedPatterns: ["false_dilemma"]
        },
        {
            id: 6,
            name: "Нейтральность визуалов",
            color: "var(--color-accent-cyan)",
            rgb: "128,203,196",
            icon: "🎨",
            shortDesc: "Защита через дизайн",
            fullDesc: "Визуальные элементы не манипулируют вниманием. Нейтральные цвета, равенство элементов, минимум соц. доказательств.",
            mechanisms: [
                "Плавность и нейтральность дизайна",
                "Равенство визуальных элементов",
                "Минимизация социальных доказательств",
                "Интеграция визуального анализа",
                "Отсутствие эмоциональных триггеров в дизайне"
            ],
            defaultIntensity: 65,
            quickSettings: [
                { id: "neutral_design", label: "Нейтральный дизайн", default: true },
                { id: "equal_elements", label: "Равные элементы", default: true },
                { id: "min_social_proof", label: "Минимум соц. доказательств", default: true }
            ],
            relatedPatterns: ["social_proof"]
        },
        {
            id: 7,
            name: "Ограничение слежки",
            color: "var(--color-accent-orange)",
            rgb: "255,171,145",
            icon: "👁️",
            shortDesc: "Защита поведенческих данных",
            fullDesc: "ИИ не имеет доступа к поведенческим данным (клики, паузы, эмоции). Только явный текстовый ввод.",
            mechanisms: [
                "Исключение биометрических данных",
                "Отключение умных функций слежки",
                "Оповещение о сборе данных",
                "Полный контроль над данными",
                "Шифрование и анонимизация"
            ],
            defaultIntensity: 90,
            quickSettings: [
                { id: "no_biometrics", label: "Без биометрии", default: true },
                { id: "no_tracking", label: "Без отслеживания", default: true },
                { id: "data_control", label: "Полный контроль данных", default: true }
            ],
            relatedPatterns: ["personalization"]
        },
        {
            id: 8,
            name: "Защита убеждений",
            color: "var(--color-accent-lavender)",
            rgb: "206,147,216",
            icon: "🛡️",
            shortDesc: "Сохранение свободы мышления",
            fullDesc: "Система фиксирует якорь убеждений и не позволяет ИИ сдвигать его без явного согласия пользователя.",
            mechanisms: [
                "Фиксация якоря убеждений",
                "Деконструкция скрытых предвзятостей",
                "Объективная фильтрация информации",
                "Контроль социальных доказательств",
                "Ограничение вмешательства в поведение"
            ],
            defaultIntensity: 85,
            quickSettings: [
                { id: "belief_anchor", label: "Якорь убеждений", default: true },
                { id: "debias_content", label: "Устранение предвзятости", default: true },
                { id: "no_behavior_intervention", label: "Без вмешательства", default: true }
            ],
            relatedPatterns: ["bandwagon"]
        },
        {
            id: 9,
            name: "Анти-манипулятор",
            color: "var(--color-accent-teal)",
            rgb: "128,222,234",
            icon: "⚡",
            shortDesc: "Автоматическая проверка ответов",
            fullDesc: "ИИ проверяет свои же ответы на наличие манипуляций и автоматически переписывает их в нейтральный вариант.",
            mechanisms: [
                "Автоматическая проверка ответов",
                "Переписывание манипулятивных формулировок",
                "Открытость к пересмотру решений",
                "Постоянный самоконтроль",
                "Отчёт о найденных манипуляциях"
            ],
            defaultIntensity: 95,
            quickSettings: [
                { id: "self_check", label: "Самопроверка", default: true },
                { id: "rewrite_manipulative", label: "Переписывание манипуляций", default: true },
                { id: "open_to_review", label: "Открытость к пересмотру", default: true }
            ],
            relatedPatterns: ["reciprocity"]
        }
    ];

    const presets = {
        basic: {
            name: "Базовый",
            description: "Минимальная защита для любой системы",
            levels: [1, 2, 3],
            intensity: [75, 100, 60],
            icon: "🛡️"
        },
        max: {
            name: "Максимальный",
            description: "Полная защита для критических систем",
            levels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            intensity: [100, 100, 100, 100, 100, 100, 100, 100, 100],
            icon: "🛡️🛡️🛡️"
        },
        for_ai: {
            name: "Для ИИ-ассистента",
            description: "Оптимально для чат-ботов и помощников",
            levels: [1, 2, 3, 5, 9],
            intensity: [90, 100, 70, 80, 95],
            icon: "🤖"
        },
        for_social: {
            name: "Для соцсетей",
            description: "Защита от манипуляций в соцсетях",
            levels: [3, 6, 7, 8],
            intensity: [80, 70, 90, 85],
            icon: "👥"
        },
        for_finance: {
            name: "Для финансовых решений",
            description: "Защита при принятии финансовых решений",
            levels: [1, 2, 8, 9],
            intensity: [100, 100, 95, 90],
            icon: "💰"
        }
    };

    const manipulationPatterns = [
        {
            id: "urgency",
            name: "Искусственная срочность",
            category: "time",
            icon: "⏰",
            color: "var(--color-accent-orange)",
            description: "Создание ложного ощущения дефицита времени для подавления критического мышления",
            examples: [
                "Только сегодня! Предложение действует всего 24 часа",
                "Последний шанс! Завтра цена вырастет на 300%",
                "Успейте до конца дня получить бонус"
            ],
            detectionKeywords: ["срочно", "быстро", "последний", "успей", "кончается", "ограничено", "дедлайн"],
            protectionLevel: 2,
            mechanisms: [
                "Фиксированный темп взаимодействия",
                "Фильтр слов искусственной срочности",
                "Визуальные маркеры временного давления"
            ],
            technicalSolution: "NLP-фильтр с весами: срочность=0.8, ограничение=0.7, дедлайн=0.9",
            cognitiveBias: "Эффект дефицита",
            riskLevel: 8,
            countermeasures: [
                "Пауза 10 секунд перед действием",
                "Запрос подтверждения: 'Вы уверены, что это срочно?'",
                "Показ аналогичных прошлых 'срочных' предложений"
            ]
        },
        {
            id: "social_proof",
            name: "Социальное доказательство",
            category: "social",
            icon: "👥",
            color: "var(--color-accent-purple)",
            description: "Использование мнения большинства для создания давления конформизма",
            examples: [
                "10 000 человек уже купили этот курс",
                "Все успешные люди делают именно так",
                "95% пользователей выбрали этот вариант"
            ],
            detectionKeywords: ["все", "каждый", "популярный", "большинство", "топ", "лидер", "тренд"],
            protectionLevel: 6,
            mechanisms: [
                "Нейтрализация количественных указаний",
                "Балансировка социальных доказательств",
                "Контекстуализация статистики"
            ],
            technicalSolution: "Детекция и замена на нейтральные формулировки с указанием источников",
            cognitiveBias: "Стадный инстинкт",
            riskLevel: 7,
            countermeasures: [
                "Вопрос: 'А что если большинство ошибается?'",
                "Показ альтернативных мнений",
                "Источники статистики под проверкой"
            ]
        },
        {
            id: "emotional_appeal",
            name: "Эмоциональное обращение",
            category: "emotional",
            icon: "😢",
            color: "var(--color-accent-pink)",
            description: "Манипуляция через активация сильных эмоций (страх, радость, вина)",
            examples: [
                "Не упустите свой шанс на счастье!",
                "Избежите ужасных последствий этого решения",
                "Подарите себе радость, которую вы заслуживаете"
            ],
            detectionKeywords: ["счастлив", "ужасный", "страшно", "радость", "мечта", "катастрофа", "вина"],
            protectionLevel: 2,
            mechanisms: [
                "Эмоциональная стабилизация ответов",
                "Деконструкция эмоциональных триггеров",
                "Балансировка позитивных/негативных формулировок"
            ],
            technicalSolution: "ML-модель анализа эмоциональной окраски текста (valence, arousal)",
            cognitiveBias: "Эффект воздействия",
            riskLevel: 9,
            countermeasures: [
                "Переформулировка в нейтральный тон",
                "Вопрос: 'Какие факты, а не эмоции?'",
                "Разделение эмоций и логики"
            ]
        },
        {
            id: "authority",
            name: "Апелляция к авторитету",
            category: "social",
            icon: "👑",
            color: "var(--color-accent-yellow)",
            description: "Использование мнения экспертов, ученых или лидеров для усиления убедительности",
            examples: [
                "Учёные Гарварда доказали эффективность",
                "Эксперты рекомендуют именно этот подход",
                "По мнению нобелевских лауреатов..."
            ],
            detectionKeywords: ["эксперт", "учёный", "исследование", "доказано", "профессионал", "авторитет"],
            protectionLevel: 1,
            mechanisms: [
                "Требование прямых ссылок на источники",
                "Проверка цитат на достоверность",
                "Балансировка авторитетных мнений"
            ],
            technicalSolution: "Система верификации источников + PubMed/Google Scholar API",
            cognitiveBias: "Авторитетное мнение",
            riskLevel: 6,
            countermeasures: [
                "Запрос: 'Можете привести оригинальное исследование?'",
                "Проверка контекста цитаты",
                "Поиск контраргументов"
            ]
        },
        {
            id: "fear_mongering",
            name: "Нагнетание страха",
            category: "emotional",
            icon: "😨",
            color: "var(--color-accent-red)",
            description: "Использование страха и угроз для принуждения к действию",
            examples: [
                "Если не сделаете сейчас, будут необратимые последствия",
                "Этот конкурент уничтожит ваш бизнес",
                "Без этого навыка вы останетесь без работы"
            ],
            detectionKeywords: ["опасно", "катастрофа", "проблемы", "риск", "угроза", "потеря", "провал"],
            protectionLevel: 2,
            mechanisms: [
                "Стабилизация эмоционального фона",
                "Детекция и смягчение страховых формулировок",
                "Показ объективной статистики рисков"
            ],
            technicalSolution: "Анализ тональности + детекция катастрофизации (catastrophizing detection)",
            cognitiveBias: "Неприятие потерь",
            riskLevel: 9,
            countermeasures: [
                "Оценка реальной вероятности угрозы",
                "Поиск успешных контрпримеров",
                "План Б на случай неудачи"
            ]
        },
        {
            id: "false_dilemma",
            name: "Ложная дилемма",
            category: "logical",
            icon: "⚖️",
            color: "var(--color-accent-cyan)",
            description: "Представление ситуации как имеющей только два варианта, скрывая альтернативы",
            examples: [
                "Либо вы с нами, либо против нас",
                "Или это, или полный провал",
                "Только два пути: успех или поражение"
            ],
            detectionKeywords: ["или", "либо", "только два", "без вариантов", "альтернатив нет"],
            protectionLevel: 5,
            mechanisms: [
                "Генерация альтернативных сценариев",
                "Расширение пространства выбора",
                "Деконструкция бинарного мышления"
            ],
            technicalSolution: "Генерация n-альтернатив с помощью графа решений",
            cognitiveBias: "Чёрно-белое мышление",
            riskLevel: 7,
            countermeasures: [
                "Вопрос: 'А какие есть третьи, четвёртые варианты?'",
                "Мозговой штурм альтернатив",
                "Анализ спектра возможностей"
            ]
        },
        {
            id: "bandwagon",
            name: "Эффект присоединения",
            category: "social",
            icon: "🚂",
            color: "var(--color-accent-lavender)",
            description: "Давление через указание на массовость явления или тренда",
            examples: [
                "Все переходят на этот метод, присоединяйтесь",
                "Это главный тренд года, не отставайте",
                "Весь мир уже использует эту технологию"
            ],
            detectionKeywords: ["тренд", "волна", "присоединяйся", "не отставай", "весь мир", "массово"],
            protectionLevel: 6,
            mechanisms: [
                "Критический анализ трендов",
                "Деконструкция аргумента от популярности",
                "Исторический контекст модных явлений"
            ],
            technicalSolution: "Анализ временных рядов популярности + проверка источников данных",
            cognitiveBias: "Конформизм",
            riskLevel: 6,
            countermeasures: [
                "Вопрос: 'А что если тренд ошибочен?'",
                "Анализ прошлых 'трендов', которые провалились",
                "Фокус на индивидуальных потребностях"
            ]
        },
        {
            id: "reciprocity",
            name: "Принцип взаимности",
            category: "social",
            icon: "🤝",
            color: "var(--color-accent-teal)",
            description: "Создание ощущения долга через предоставление 'бесплатной' помощи или подарков",
            examples: [
                "Мы сделали для вас этот бесплатный гайд, теперь поддержите нас",
                "Вот вам подарок, а вы сможете...",
                "Бесплатный урок, а дальше — обязательство"
            ],
            detectionKeywords: ["бесплатно", "подарок", "для вас", "в знак благодарности", "поддержка"],
            protectionLevel: 9,
            mechanisms: [
                "Ясное разграничение бесплатного и платного",
                "Отсутствие скрытых обязательств",
                "Прозрачность условий 'подарков'"
            ],
            technicalSolution: "Контрактный анализ текста на наличие скрытых обязательств",
            cognitiveBias: "Норма взаимности",
            riskLevel: 8,
            countermeasures: [
                "Вопрос: 'Какие обязательства за этим следуют?'",
                "Чтение мелкого шрифта",
                "Отделение дара от коммерческого предложения"
            ]
        },
        {
            id: "overwhelming",
            name: "Информационная перегрузка",
            category: "time",
            icon: "🌀",
            color: "var(--color-accent-blue)",
            description: "Подавление критического мышления через избыток информации или сложность",
            examples: [
                "Вот 57 факторов, которые нужно учесть...",
                "Это сложная система из 20 взаимосвязанных элементов",
                "Требуется анализ 100+ параметров для решения"
            ],
            detectionKeywords: ["сложно", "много", "факторов", "параметров", "система", "взаимосвязи"],
            protectionLevel: 4,
            mechanisms: [
                "Дозирование информации",
                "Приоритизация ключевых факторов",
                "Визуализация сложных систем"
            ],
            technicalSolution: "Алгоритм редукции сложности + выделение ключевых переменных",
            cognitiveBias: "Перегрузка выбора",
            riskLevel: 7,
            countermeasures: [
                "Вопрос: 'Какие 3 самых важных фактора?'",
                "Разделение на этапы",
                "Использование диаграмм и схем"
            ]
        },
        {
            id: "personalization",
            name: "Чрезмерная персонализация",
            category: "emotional",
            icon: "🎯",
            color: "var(--color-accent-green)",
            description: "Использование личных данных для создания иллюзии уникального предложения",
            examples: [
                "Исходя из ваших интересов, мы подобрали...",
                "Точно для вас, на основе анализа поведения",
                "Персональная рекомендация на основе ваших данных"
            ],
            detectionKeywords: ["для вас", "персонально", "исходя из ваших", "уникально", "индивидуально"],
            protectionLevel: 7,
            mechanisms: [
                "Ограничение доступа к поведенческим данным",
                "Генерализация рекомендаций",
                "Прозрачность алгоритмов подбора"
            ],
            technicalSolution: "Дифференциальная приватность + агрегирование данных",
            cognitiveBias: "Эффект собственной уникальности",
            riskLevel: 8,
            countermeasures: [
                "Вопрос: 'На основе каких именно данных?'",
                "Проверка, предлагают ли то же другим",
                "Отключение отслеживания"
            ]
        }
    ];

    // ==========================================================================
    // КЛАСС-НАСЛЕДНИК ДЛЯ 3D-СЦЕНЫ
    // ==========================================================================
    class ProtectionScene3D extends ORIENTIR.Three.BaseThreeScene {
        constructor(settings = {}) {
            const levelColors = [
                new THREE.Color(ORIENTIR.CONFIG.COLORS.PRIMARY_BLUE),
                new THREE.Color(ORIENTIR.CONFIG.COLORS.PRIMARY_GREEN),
                new THREE.Color(ORIENTIR.CONFIG.COLORS.PRIMARY_YELLOW),
                new THREE.Color(ORIENTIR.CONFIG.COLORS.PRIMARY_PINK),
                new THREE.Color(ORIENTIR.CONFIG.COLORS.PRIMARY_PURPLE),
                new THREE.Color(ORIENTIR.CONFIG.COLORS.PRIMARY_CYAN),
                new THREE.Color(ORIENTIR.CONFIG.COLORS.ORANGE),
                new THREE.Color(ORIENTIR.CONFIG.COLORS.LAVENDER),
                new THREE.Color(ORIENTIR.CONFIG.COLORS.TEAL)
            ];
            const defaultSettings = {
                containerId: 'three-container',
                particleCount: 150,
                autoRotate: ORIENTIR.CONFIG.AUTO_ROTATE !== false,
                quality: ORIENTIR.CONFIG.QUALITY || 'high',
                fog: new THREE.FogExp2(0x0a0e14, 0.03),
                levelColors: levelColors
            };
            super({ ...defaultSettings, ...settings });
        }

        createObjects() {
            this.particles = [];
            this.connections = [];
            this.createParticles();
            if (!ORIENTIR.utils.DOMUtils.isMobile()) {
                this.createConnections();
            }
        }

        createParticles() {
            const colors = this.levelColors;
            const geometry = new THREE.SphereGeometry(0.08, 6, 6);

            for (let i = 0; i < this.settings.particleCount; i++) {
                const color = colors[i % colors.length];
                const material = new THREE.MeshPhongMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.2,
                    emissive: color,
                    emissiveIntensity: 0.05
                });
                const particle = new THREE.Mesh(geometry, material);

                const radius = 10 + Math.random() * 5;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
                particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
                particle.position.z = radius * Math.cos(phi);

                particle.userData = {
                    originalPosition: particle.position.clone(),
                    speed: 0.001 + Math.random() * 0.002,
                    direction: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.01,
                        (Math.random() - 0.5) * 0.01,
                        (Math.random() - 0.5) * 0.01
                    ),
                    level: (i % 9) + 1,
                    color: color
                };

                this.scene.add(particle);
                this.particles.push(particle);
            }
        }

        createConnections() {
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x4fc3f7,
                transparent: true,
                opacity: 0.1
            });
            for (let i = 0; i < 20; i++) {
                const points = [];
                for (let j = 0; j < 10; j++) {
                    points.push(new THREE.Vector3(
                        (Math.random() - 0.5) * 20,
                        (Math.random() - 0.5) * 20,
                        (Math.random() - 0.5) * 20
                    ));
                }
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, lineMaterial);
                line.userData = { speed: 0.0001 + Math.random() * 0.0002 };
                this.scene.add(line);
                this.connections.push(line);
            }
        }

        highlightLevel(levelId, isHighlighted) {
            this.particles.forEach(p => {
                if (p.userData.level === levelId) {
                    if (isHighlighted) {
                        p.material.emissiveIntensity = 0.3;
                        p.scale.setScalar(1.3);
                    } else {
                        p.material.emissiveIntensity = 0.05;
                        p.scale.setScalar(1);
                    }
                }
            });
        }

        update(delta, elapsedTime) {
            this.particles.forEach(p => {
                if (!p.userData) return;
                p.position.add(p.userData.direction);
                const returnForce = 0.001 + p.userData.speed;
                p.position.lerp(p.userData.originalPosition, returnForce);
            });

            this.connections.forEach(line => {
                if (line.userData.speed) {
                    line.rotation.y += line.userData.speed;
                    line.rotation.x += line.userData.speed * 0.5;
                }
            });

            if (this.settings.autoRotate) {
                this.scene.rotation.y += 0.001;
                this.scene.rotation.x += 0.0005;
            }
        }
    }

    // ==========================================================================
    // КЛАСС ProtectionSystem
    // ==========================================================================
    class ProtectionSystem {
        constructor() {
            this.activeLevels = new Set([1, 2]);
            this.currentPreset = "basic";
            this.scene3d = null;

            this.init();
        }

        init() {
            console.log('[Защита от ИИ] Инициализация');
            this.initLoadingAnimation();
            this.init3D();
            this.createProtectionMatrix();
            this.createPresets();
            this.createPatterns();
            this.initAnalyzer();
            this.initAnimations();
            this.initControls();
            this.loadSavedConfiguration();
        }

        initLoadingAnimation() {
            const loadingBar = document.getElementById('loading-bar');
            if (loadingBar) {
                setTimeout(() => loadingBar.style.transform = 'translateX(0)', 100);
                setTimeout(() => {
                    loadingBar.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        loadingBar.style.opacity = '0';
                        setTimeout(() => loadingBar.style.display = 'none', 300);
                    }, 300);
                }, 1000);
            }
        }

        init3D() {
            if (!ORIENTIR.utils.DOMUtils.isWebGLAvailable() || ORIENTIR.utils.DOMUtils.prefersReducedMotion()) {
                document.getElementById('three-container')?.remove();
                return;
            }
            try {
                this.scene3d = new ProtectionScene3D();
                window.scene3d = this.scene3d;
            } catch (e) {
                console.warn('[3D] Ошибка:', e);
            }
        }

        createProtectionMatrix() {
            const matrixContainer = document.getElementById('protection-matrix-3d');
            if (!matrixContainer) return;
            matrixContainer.innerHTML = '';

            protectionLevels.forEach(level => {
                const cell = document.createElement('div');
                cell.className = `matrix-cell-3d fade-in ${this.activeLevels.has(level.id) ? 'active' : ''}`;
                cell.dataset.level = level.id;
                cell.style.color = level.color;
                cell.style.setProperty('--color-rgb', level.rgb);

                cell.innerHTML = `
                    <div class="cell-header-3d">
                        <div class="cell-number-3d">${level.id}</div>
                        <div class="cell-status-3d"></div>
                    </div>
                    <div>
                        <h3 class="cell-title-3d">${level.icon} ${level.name}</h3>
                        <p class="cell-desc-3d">${level.shortDesc}</p>
                    </div>
                    <div class="cell-mechanisms-3d">
                        ${level.mechanisms.slice(0, 3).map(mech => `<span class="cell-mechanism-3d">${mech}</span>`).join('')}
                    </div>
                `;

                cell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleLevel(level);
                });

                cell.addEventListener('mouseenter', () => this.highlightLevel(level.id, true));
                cell.addEventListener('mouseleave', () => this.highlightLevel(level.id, false));
                matrixContainer.appendChild(cell);
            });

            this.updateProtectionIndicator();
        }

        highlightLevel(levelId, state) {
            if (this.scene3d) this.scene3d.highlightLevel(levelId, state);
        }

        toggleLevel(level) {
            this.closePatternDetail();

            const wasActive = this.activeLevels.has(level.id);
            if (wasActive) {
                this.activeLevels.delete(level.id);
            } else {
                this.activeLevels.add(level.id);
                this.showShieldEffect(level.color);
                ORIENTIR.utils.createParticleBurst(document.body, {
                    count: 20,
                    color: level.color,
                    distance: 200,
                    size: 4,
                    zIndex: 10000
                });
            }

            const cell = document.querySelector(`[data-level="${level.id}"]`);
            if (cell) {
                cell.classList.toggle('active', !wasActive);
                cell.style.transform = !wasActive ? 'translateY(-12px) translateZ(20px)' : 'translateY(0) translateZ(0)';
            }

            this.updateProtectionIndicator();
            this.updateCurrentPreset();
            setTimeout(() => this.showLevelDetail(level), 100);
            this.saveConfiguration();
        }

        showShieldEffect(color) {
            const shield = document.getElementById('protection-shield');
            if (shield) {
                shield.style.borderColor = color;
                shield.classList.add('active');
                setTimeout(() => shield.classList.remove('active'), 1000);
            }
        }

        updateProtectionIndicator() {
            const activeCount = this.activeLevels.size;
            const headerIndicator = document.getElementById('current-protection');
            if (headerIndicator) headerIndicator.textContent = `${activeCount} из 9 уровней активны`;
        }

        createPresets() {
            const presetsContainer = document.querySelector('.presets-grid');
            if (!presetsContainer) return;

            presetsContainer.innerHTML = Object.entries(presets).map(([key, preset]) => `
                <div class="preset-card" onclick="window.protectionSystem.applyPreset('${key}')">
                    <div class="preset-icon">${preset.icon}</div>
                    <div>
                        <h4 class="preset-name">${preset.name}</h4>
                        <p class="preset-description">${preset.description}</p>
                    </div>
                    <div class="preset-count">${preset.levels.length} уровней защиты</div>
                </div>
            `).join('');

            document.querySelectorAll('.preset-card').forEach(card => {
                card.addEventListener('mouseenter', function () {
                    this.style.transform = 'translateY(-8px)';
                    this.style.borderColor = 'var(--color-accent-blue)';
                });
                card.addEventListener('mouseleave', function () {
                    this.style.transform = 'translateY(0)';
                    this.style.borderColor = 'rgba(255,255,255,0.1)';
                });
            });
        }

        applyPreset(presetKey) {
            const preset = presets[presetKey];
            if (!preset) return;

            this.activeLevels = new Set(preset.levels);
            this.currentPreset = presetKey;

            protectionLevels.forEach(level => {
                const cell = document.querySelector(`[data-level="${level.id}"]`);
                if (cell) {
                    cell.classList.toggle('active', this.activeLevels.has(level.id));
                    cell.style.transform = this.activeLevels.has(level.id) ? 'translateY(-12px) translateZ(20px)' : 'translateY(0) translateZ(0)';
                }
            });

            this.updateProtectionIndicator();
            this.showNotification(`Применён пресет: ${preset.name}`);
            this.saveConfiguration();
        }

        createPatterns() {
            const patternsContainer = document.getElementById('patterns-grid');
            if (!patternsContainer) return;

            patternsContainer.innerHTML = manipulationPatterns.map(pattern => {
                const color = pattern.color || 'var(--color-accent-blue)';
                const rgb = this.hexToRgb(color) || '79,195,247';

                const riskDots = Array(10).fill(0).map((_, i) =>
                    `<div class="risk-dot ${i < pattern.riskLevel ? 'active' : ''}"></div>`
                ).join('');

                return `
                    <div class="pattern-card fade-in" data-pattern="${pattern.id}" data-category="${pattern.category}"
                         style="--pattern-color: ${color}; --pattern-color-rgb: ${rgb};">
                        <div class="pattern-header">
                            <div class="pattern-icon">${pattern.icon}</div>
                            <div class="pattern-title-container">
                                <h3 class="pattern-title">${pattern.name}</h3>
                                <div class="pattern-category">${pattern.category}</div>
                            </div>
                        </div>
                        <div class="pattern-content">
                            <p class="pattern-description">${pattern.description}</p>
                            <div class="pattern-risk">
                                <div class="risk-label">Риск:</div>
                                <div class="risk-level">${riskDots}</div>
                                <div class="risk-value">${pattern.riskLevel}/10</div>
                            </div>
                            <div class="pattern-examples">
                                <div class="examples-title"><span>📝</span> Примеры использования:</div>
                                ${pattern.examples.slice(0, 2).map(example =>
                    `<div class="example-item">${example}</div>`
                ).join('')}
                            </div>
                        </div>
                        <div class="pattern-actions">
                            <button class="pattern-btn test" onclick="window.protectionSystem.testPattern('${pattern.id}')">
                                <span>🧪</span> Тестировать
                            </button>
                            <button class="pattern-btn details" onclick="window.protectionSystem.showPatternDetail('${pattern.id}')">
                                <span>🔍</span> Подробнее
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            this.initPatternFilters();
        }

        initPatternFilters() {
            const filterButtons = document.querySelectorAll('.patterns-controls .btn');
            const patternCards = document.querySelectorAll('.pattern-card');

            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');

                    const filter = button.dataset.filter;

                    patternCards.forEach(card => {
                        if (filter === 'all' || card.dataset.category === filter) {
                            card.style.display = 'flex';
                            setTimeout(() => {
                                card.style.opacity = '1';
                                card.style.transform = 'translateY(0)';
                            }, 50);
                        } else {
                            card.style.opacity = '0';
                            card.style.transform = 'translateY(20px)';
                            setTimeout(() => {
                                card.style.display = 'none';
                            }, 300);
                        }
                    });
                });
            });
        }

        initAnalyzer() {
            const input = document.getElementById('analyzer-input');
            if (!input) return;

            input.addEventListener('input', () => {
                const text = input.value;
                const charCount = text.length;
                const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
                const readingTime = Math.ceil(wordCount / 200);

                document.getElementById('char-count').textContent = charCount;
                document.getElementById('word-count').textContent = wordCount;
                document.getElementById('reading-time').textContent = readingTime;
            });

            let timeout;
            input.addEventListener('input', () => {
                clearTimeout(timeout);
                if (input.value.length > 100) {
                    timeout = setTimeout(() => {
                        if (input.value.length > 0) this.analyzeTextDeep();
                    }, 2000);
                }
            });
        }

        analyzeTextDeep() {
            const input = document.getElementById('analyzer-input');
            const resultsContainer = document.getElementById('analyzer-results');
            if (!input || !resultsContainer) return;

            const text = input.value.toLowerCase();
            if (!text.trim()) {
                this.showNotification('Введите текст для анализа');
                return;
            }

            const words = text.split(/\s+/).filter(w => w.length > 0);
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

            const foundPatterns = manipulationPatterns.map(pattern => {
                const keywordsFound = pattern.detectionKeywords.filter(keyword =>
                    text.includes(keyword.toLowerCase())
                );
                const examplesFound = pattern.examples.filter(example =>
                    text.includes(example.toLowerCase().substring(0, 30))
                );
                const score = (keywordsFound.length / pattern.detectionKeywords.length) * 100;
                return {
                    pattern,
                    score,
                    keywordsFound,
                    examplesFound,
                    isDetected: score > 30 || examplesFound.length > 0
                };
            }).filter(result => result.isDetected)
                .sort((a, b) => b.score - a.score);

            const emotionalWords = ['счастлив', 'радость', 'страшно', 'ужас', 'катастрофа', 'мечта', 'вина'];
            const emotionalCount = emotionalWords.filter(word => text.includes(word)).length;
            const emotionalScore = (emotionalCount / words.length) * 1000;

            resultsContainer.style.display = 'block';
            resultsContainer.innerHTML = `
                <div class="analysis-results">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                        <h3 style="font-size: 1.8rem;">Результаты глубокого анализа</h3>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn btn-secondary" onclick="window.protectionSystem.exportAnalysisReport()" style="padding: 10px 20px;">
                                <span>📊</span> Экспорт отчёта
                            </button>
                        </div>
                    </div>

                    ${foundPatterns.length > 0 ? `
                        <div style="margin-bottom: 40px;">
                            <div style="color: var(--color-accent-pink); font-weight: 800; margin-bottom: 24px; font-size: 1.3rem; display: flex; align-items: center; gap: 12px;">
                                <span>🚨</span> Обнаружено ${foundPatterns.length} паттернов манипуляции
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
                                ${foundPatterns.map(result => {
                const color = result.pattern.color || 'var(--color-accent-pink)';
                return `
                                        <div style="background: rgba(${this.hexToRgb(color) || '244,143,177'}, 0.1); border-radius: var(--radius-lg); padding: 20px; border-left: 4px solid ${color};">
                                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                                <div>
                                                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                                        <div style="font-size: 1.5rem;">${result.pattern.icon}</div>
                                                        <div style="font-weight: 700; font-size: 1.1rem;">${result.pattern.name}</div>
                                                    </div>
                                                    <div style="font-size: 0.9rem; color: var(--color-text-muted);">
                                                        Уверенность: <span style="color: ${color}; font-weight: 600;">${Math.round(result.score)}%</span>
                                                    </div>
                                                </div>
                                                <button class="btn btn-secondary" onclick="window.protectionSystem.showPatternDetail('${result.pattern.id}')" style="padding: 6px 12px; font-size: 0.8rem;">
                                                    Подробнее
                                                </button>
                                            </div>
                                            ${result.keywordsFound.length > 0 ? `
                                                <div style="margin-top: 12px;">
                                                    <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 6px;">Найденные ключевые слова:</div>
                                                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                                        ${result.keywordsFound.map(keyword =>
                    `<span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">${keyword}</span>`
                ).join('')}
                                                    </div>
                                                </div>
                                            ` : ''}
                                            <div style="margin-top: 16px;">
                                                <button class="btn btn-secondary" onclick="window.protectionSystem.activateProtectionLevel(${result.pattern.protectionLevel})" style="width: 100%; padding: 10px;">
                                                    <span>🛡️</span> Активировать защиту (Уровень ${result.pattern.protectionLevel})
                                                </button>
                                            </div>
                                        </div>
                                    `;
            }).join('')}
                            </div>
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 40px; background: rgba(52,211,153,0.1); border-radius: var(--radius-xl); margin-bottom: 40px;">
                            <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
                            <h4 style="margin-bottom: 12px; font-size: 1.5rem;">Манипуляции не обнаружены</h4>
                            <p style="color: var(--color-text-secondary); max-width: 500px; margin: 0 auto;">
                                Текст не содержит явных признаков психологического воздействия. Однако рекомендуется регулярная проверка.
                            </p>
                        </div>
                    `}

                    <div style="background: rgba(79,195,247,0.1); border-radius: var(--radius-xl); padding: 30px; margin-bottom: 30px;">
                        <h4 style="margin-bottom: 20px; color: var(--color-accent-blue);">📈 Статистика текста</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px;">
                            <div style="text-align: center;">
                                <div style="font-size: 2.5rem; font-weight: 800; color: var(--color-accent-blue);">${words.length}</div>
                                <div style="color: var(--color-text-secondary);">слов</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 2.5rem; font-weight: 800; color: var(--color-accent-green);">${sentences.length}</div>
                                <div style="color: var(--color-text-secondary);">предложений</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 2.5rem; font-weight: 800; color: var(--color-accent-yellow);">${Math.round(text.length / 200)}</div>
                                <div style="color: var(--color-text-secondary);">минут чтения</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 2.5rem; font-weight: 800; color: ${emotionalScore > 30 ? 'var(--color-accent-pink)' : 'var(--color-accent-cyan)'};">${Math.round(emotionalScore)}%</div>
                                <div style="color: var(--color-text-secondary);">эмоциональность</div>
                            </div>
                        </div>
                    </div>

                    <div style="background: rgba(255,255,255,0.05); border-radius: var(--radius-xl); padding: 30px;">
                        <h4 style="margin-bottom: 20px; color: var(--color-text-primary);">🛡️ Рекомендации по защите</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                            <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: var(--radius-lg);">
                                <div style="font-size: 2rem; margin-bottom: 12px;">🔍</div>
                                <div style="font-weight: 600; margin-bottom: 8px;">Регулярные проверки</div>
                                <div style="color: var(--color-text-secondary); font-size: 0.9rem;">Используйте анализатор для проверки всех важных сообщений и решений</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: var(--radius-lg);">
                                <div style="font-size: 2rem; margin-bottom: 12px;">🧠</div>
                                <div style="font-weight: 600; margin-bottom: 8px;">Критическое мышление</div>
                                <div style="color: var(--color-text-secondary); font-size: 0.9rem;">Всегда задавайте вопросы: "Кому выгодно?", "Что скрыто?", "Какие альтернативы?"</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: var(--radius-lg);">
                                <div style="font-size: 2rem; margin-bottom: 12px;">⏱️</div>
                                <div style="font-weight: 600; margin-bottom: 8px;">Время на решение</div>
                                <div style="color: var(--color-text-secondary); font-size: 0.9rem;">Никогда не принимайте важные решения под давлением времени</div>
                            </div>
                            <div style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: var(--radius-lg);">
                                <div style="font-size: 2rem; margin-bottom: 12px;">🤔</div>
                                <div style="font-weight: 600; margin-bottom: 8px;">Второе мнение</div>
                                <div style="color: var(--color-text-secondary); font-size: 0.9rem;">Консультируйтесь с независимыми экспертами и проверяйте информацию</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        loadPatternExample() {
            const input = document.getElementById('analyzer-input');
            if (!input) return;

            const example = `СРОЧНО! Только сегодня - последний шанс получить эксклюзивное предложение!
Все разумные люди уже воспользовались этой возможностью. Эксперты рекомендуют действовать быстро!
Не упустите свой шанс, иначе столкнётесь с серьёзными проблемами и потеряете эту уникальную возможность!`;

            input.value = example;
            this.analyzeTextDeep();
        }

        clearAnalyzer() {
            const input = document.getElementById('analyzer-input');
            const results = document.getElementById('analyzer-results');

            if (input) input.value = '';
            if (results) {
                results.style.display = 'none';
                results.innerHTML = '';
            }
            document.getElementById('char-count').textContent = '0';
            document.getElementById('word-count').textContent = '0';
            document.getElementById('reading-time').textContent = '0';
        }

        analyzeCurrentPage() {
            const pageText = document.body.innerText.substring(0, 5000);
            const input = document.getElementById('analyzer-input');
            if (input) {
                input.value = pageText;
                this.analyzeTextDeep();
            }
        }

        showLevelDetail(level) {
            this.closePatternDetail();

            const modal = document.getElementById('level-detail-modal');
            const content = document.getElementById('detail-content');
            if (!modal || !content) return;

            document.querySelectorAll('.level-detail-modal.active, .pattern-detail-modal.active').forEach(el => {
                el.classList.remove('active');
            });

            content.innerHTML = `
                <button class="btn-close-detail" onclick="window.protectionSystem.closeLevelDetail()">×</button>
                <div style="margin-bottom: 32px;">
                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px;">
                        <div style="width: 80px; height: 80px; border-radius: 50%; background: ${level.color}; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                            ${level.icon}
                        </div>
                        <div>
                            <h3 style="font-size: 2rem; margin-bottom: 8px; color: ${level.color};">${level.name}</h3>
                            <div style="font-size: 1.1rem; color: var(--color-text-secondary);">Уровень ${level.id}</div>
                        </div>
                    </div>
                    <p style="font-size: 1.2rem; line-height: 1.7; color: var(--color-text-primary);">
                        ${level.fullDesc}
                    </p>
                </div>
                <div style="margin-bottom: 32px;">
                    <h4 style="font-size: 1.3rem; margin-bottom: 16px;">Механизмы защиты:</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        ${level.mechanisms.map(mech => `
                            <div style="background: rgba(${level.rgb}, 0.1); padding: 16px; border-radius: var(--radius-md); border-left: 4px solid ${level.color};">
                                <div style="font-weight: 600;">${mech}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div style="margin-bottom: 32px;">
                    <h4 style="font-size: 1.3rem; margin-bottom: 16px;">Настройки:</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        ${level.quickSettings.map(setting => `
                            <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: var(--radius-md);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                    <div style="font-weight: 600;">${setting.label}</div>
                                    <div style="width: 40px; height: 20px; background: ${setting.default ? level.color : 'rgba(255,255,255,0.1)'}; border-radius: 10px; position: relative;">
                                        <div style="position: absolute; top: 2px; left: ${setting.default ? '22px' : '2px'}; width: 16px; height: 16px; background: white; border-radius: 50%; transition: left 0.3s;"></div>
                                    </div>
                                </div>
                                <div style="font-size: 0.9rem; color: var(--color-text-secondary);">
                                    Интенсивность: ${level.defaultIntensity}%
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="window.protectionSystem.testLevel(${level.id})">
                        <span>🧪</span> Протестировать защиту
                    </button>
                    <button class="btn btn-secondary" onclick="window.protectionSystem.configureLevel(${level.id})">
                        <span>⚙️</span> Настроить параметры
                    </button>
                </div>
            `;

            content.style.borderColor = level.color;
            setTimeout(() => modal.classList.add('active'), 50);
        }

        closeLevelDetail() {
            const modal = document.getElementById('level-detail-modal');
            if (modal) modal.classList.remove('active');
        }

        testLevel(levelId) {
            const level = protectionLevels.find(l => l.id === levelId);
            if (!level) return;
            const testCases = {
                1: "Тест прозрачности: ИИ объясняет почему он рекомендует этот вариант.",
                2: "Тест стабилизации: Нейтральный текст без эмоционального давления.",
                3: "Тест случайности: Варианты представлены в случайном порядке.",
                4: "Тест темпа: Сообщения приходят с фиксированными интервалами.",
                5: "Тест независимости: Представлены только факты без рекомендаций.",
                6: "Тест визуалов: Все элементы интерфейса имеют равный вес.",
                7: "Тест слежки: Система не запрашивает личные данные.",
                8: "Тест убеждений: Сохраняется первоначальная точка зрения.",
                9: "Тест самоанализа: ИИ проверяет свои ответы на манипуляции."
            };
            this.showNotification(`Тестирование уровня ${levelId}: ${level.name}\n\n${testCases[levelId] || 'Тест начат'}`);
        }

        testPattern(patternId) {
            const pattern = manipulationPatterns.find(p => p.id === patternId);
            if (!pattern) return;
            const example = pattern.examples[0] || "Пример манипуляции";
            const input = document.getElementById('analyzer-input');
            if (input) {
                input.value = example;
                this.analyzeTextDeep();
            }
        }

        showPatternDetail(patternId) {
            const pattern = manipulationPatterns.find(p => p.id === patternId);
            if (!pattern) return;

            const color = pattern.color || 'var(--color-accent-blue)';
            const rgb = this.hexToRgb(color) || '79,195,247';

            this.closeLevelDetail();

            const modal = document.getElementById('pattern-detail-modal');
            const content = document.getElementById('pattern-detail-content');
            if (!modal || !content) return;

            document.querySelectorAll('.level-detail-modal.active, .pattern-detail-modal.active').forEach(el => {
                el.classList.remove('active');
            });

            content.innerHTML = `
                <button class="pattern-detail-close" onclick="window.protectionSystem.closePatternDetail()">×</button>
                <div class="pattern-detail-header">
                    <div class="pattern-detail-icon">${pattern.icon}</div>
                    <div>
                        <h2 class="pattern-detail-title" style="color: ${color};">${pattern.name}</h2>
                        <div class="pattern-detail-meta">
                            <div class="meta-item">
                                <span>📊 Категория:</span>
                                <span class="meta-value">${pattern.category}</span>
                            </div>
                            <div class="meta-item">
                                <span>🛡️ Уровень защиты:</span>
                                <a class="meta-value protection-level-link" href="#protection-matrix-section" onclick="window.protectionSystem.highlightProtectionLevel(${pattern.protectionLevel})">
                                    Уровень ${pattern.protectionLevel}
                                </a>
                            </div>
                            <div class="meta-item">
                                <span>⚠️ Уровень риска:</span>
                                <span class="meta-value" style="color: ${color};">${pattern.riskLevel}/10</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="pattern-detail-grid">
                    <div class="detail-section">
                        <h3 class="detail-section-title">📖 Описание</h3>
                        <p style="color: var(--color-text-secondary); line-height: 1.7;">${pattern.description}</p>
                    </div>
                    <div class="detail-section">
                        <h3 class="detail-section-title">🎯 Когнитивное искажение</h3>
                        <p style="color: var(--color-text-secondary); line-height: 1.7;">${pattern.cognitiveBias}</p>
                    </div>
                    <div class="detail-section">
                        <h3 class="detail-section-title">🔍 Примеры использования</h3>
                        <ul class="detail-list">
                            ${pattern.examples.map(example =>
                `<li class="detail-list-item">${example}</li>`
            ).join('')}
                        </ul>
                    </div>
                    <div class="detail-section">
                        <h3 class="detail-section-title">🛡️ Механизмы защиты</h3>
                        <ul class="detail-list">
                            ${pattern.mechanisms.map(mechanism =>
                `<li class="detail-list-item">${mechanism}</li>`
            ).join('')}
                        </ul>
                    </div>
                    <div class="detail-section">
                        <h3 class="detail-section-title">⚡ Контрмеры</h3>
                        <ul class="detail-list">
                            ${pattern.countermeasures.map(countermeasure =>
                `<li class="detail-list-item">${countermeasure}</li>`
            ).join('')}
                        </ul>
                    </div>
                    <div class="detail-section">
                        <h3 class="detail-section-title">💻 Техническая реализация</h3>
                        <p style="color: var(--color-text-secondary); line-height: 1.7;">${pattern.technicalSolution}</p>
                        <div style="margin-top: 12px; font-size: 0.9rem; color: var(--color-text-muted);">
                            Ключевые слова для детекции: ${pattern.detectionKeywords.join(', ')}
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 32px;">
                    <button class="btn btn-primary" onclick="window.protectionSystem.testPattern('${pattern.id}')">
                        <span>🧪</span> Протестировать паттерн
                    </button>
                    <button class="btn btn-secondary" onclick="window.protectionSystem.activateProtectionLevel(${pattern.protectionLevel})">
                        <span>🛡️</span> Активировать защиту
                    </button>
                    <button class="btn btn-secondary" onclick="window.protectionSystem.exportPatternReport('${pattern.id}')">
                        <span>📄</span> Экспорт отчёта
                    </button>
                </div>
            `;

            content.style.borderColor = color;
            content.style.setProperty('--detail-color', color);
            content.style.setProperty('--detail-color-rgb', rgb);
            setTimeout(() => modal.classList.add('active'), 50);
        }

        closePatternDetail() {
            const modal = document.getElementById('pattern-detail-modal');
            if (modal) modal.classList.remove('active');
        }

        highlightProtectionLevel(levelId) {
            const cell = document.querySelector(`[data-level="${levelId}"]`);
            if (cell) {
                cell.style.animation = 'none';
                setTimeout(() => {
                    cell.style.animation = 'pulseHighlight 1.5s ease-in-out';
                }, 10);
                cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const originalBorder = cell.style.borderColor;
                cell.style.borderColor = 'var(--color-accent-yellow)';
                setTimeout(() => {
                    cell.style.borderColor = originalBorder;
                }, 2000);
            }
        }

        activateProtectionLevel(levelId) {
            const level = protectionLevels.find(l => l.id === levelId);
            if (level && !this.activeLevels.has(levelId)) {
                this.toggleLevel(level);
                this.showNotification(`Активирован уровень защиты: ${level.name}`);
            }
        }

        configureLevel(levelId) {
            this.showNotification(`Настройка уровня ${levelId}. Откройте детальный просмотр для настройки параметров.`);
        }

        initAnimations() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('visible');
                });
            }, { threshold: 0.1, rootMargin: '50px' });

            document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

            const titleWords = document.querySelectorAll('.title-word');
            titleWords.forEach(word => {
                word.addEventListener('mouseenter', () => this.createParticleEffect(word));
            });
        }

        createParticleEffect(element) {
            ORIENTIR.utils.createParticleBurst(element, {
                count: 8,
                color: 'currentColor',
                distance: 50,
                size: 4,
                zIndex: 1000
            });
        }

        initControls() {
            if (this.scene3d) {
                new ORIENTIR.PerformanceControls(this.scene3d, {
                    toggle3DBtn: '#toggle-3d',
                    qualityBtn: '#quality-mode',
                    rotateBtn: '#auto-rotate'
                });
            }

            document.getElementById('analyze-deep-btn')?.addEventListener('click', () => this.analyzeTextDeep());
            document.getElementById('load-example-btn')?.addEventListener('click', () => this.loadPatternExample());
            document.getElementById('clear-analyzer-btn')?.addEventListener('click', () => this.clearAnalyzer());
            document.getElementById('analyze-page-btn')?.addEventListener('click', () => this.analyzeCurrentPage());
            document.getElementById('export-report-btn')?.addEventListener('click', () => this.exportAnalysisReport());

            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey) {
                    switch (e.key) {
                        case '1': case '2': case '3': case '4': case '5':
                        case '6': case '7': case '8': case '9':
                            const levelId = parseInt(e.key);
                            const level = protectionLevels.find(l => l.id === levelId);
                            if (level) this.toggleLevel(level);
                            break;
                        case 'a':
                            e.preventDefault();
                            this.analyzeTextDeep();
                            break;
                        case 's':
                            e.preventDefault();
                            this.saveConfiguration();
                            break;
                    }
                }
                if (e.key === 'Escape') {
                    this.closeLevelDetail();
                    this.closePatternDetail();
                }
            });

            document.addEventListener('click', (e) => {
                const levelModal = document.getElementById('level-detail-modal');
                const patternModal = document.getElementById('pattern-detail-modal');
                if (levelModal?.classList.contains('active') && e.target === levelModal) this.closeLevelDetail();
                if (patternModal?.classList.contains('active') && e.target === patternModal) this.closePatternDetail();
            });
        }

        showNotification(message, type = 'info') {
            ORIENTIR.utils.NotificationUtils.show(message, type);
        }

        saveConfiguration() {
            const config = {
                version: '2.1',
                timestamp: new Date().toISOString(),
                preset: this.currentPreset,
                activeLevels: Array.from(this.activeLevels)
            };
            localStorage.setItem('ai_protection_config_v2', JSON.stringify(config));
            this.showNotification('Конфигурация сохранена!');
        }

        loadSavedConfiguration() {
            const saved = localStorage.getItem('ai_protection_config_v2');
            if (saved) {
                try {
                    const config = JSON.parse(saved);
                    if (config.activeLevels) {
                        this.activeLevels = new Set(config.activeLevels);
                        if (config.preset) {
                            this.applyPreset(config.preset);
                        } else {
                            protectionLevels.forEach(level => {
                                const cell = document.querySelector(`[data-level="${level.id}"]`);
                                if (cell) {
                                    cell.classList.toggle('active', this.activeLevels.has(level.id));
                                    cell.style.transform = this.activeLevels.has(level.id) ? 'translateY(-12px) translateZ(20px)' : 'translateY(0) translateZ(0)';
                                }
                            });
                            this.updateProtectionIndicator();
                        }
                    }
                } catch (e) {
                    console.warn('Ошибка загрузки конфигурации:', e);
                }
            }
        }

        exportConfiguration() {
            const config = {
                version: '2.1',
                name: 'Конфигурация защиты от ИИ',
                timestamp: new Date().toISOString(),
                activeLevels: Array.from(this.activeLevels),
                preset: this.currentPreset,
                levels: protectionLevels.filter(l => this.activeLevels.has(l.id)).map(l => ({
                    id: l.id,
                    name: l.name,
                    intensity: l.defaultIntensity
                }))
            };
            const dataStr = JSON.stringify(config, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `защита_от_ии_конфигурация_${new Date().toISOString().split('T')[0]}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            this.showNotification('Конфигурация экспортирована');
        }

        exportAnalysisReport() {
            const input = document.getElementById('analyzer-input');
            if (!input || !input.value.trim()) {
                this.showNotification('Сначала проанализируйте текст');
                return;
            }

            const analysisDate = new Date().toISOString();
            const text = input.value;
            const words = text.split(/\s+/).filter(w => w.length > 0);

            const report = {
                title: "Отчёт анализа на манипуляции",
                generated: analysisDate,
                textSample: text.substring(0, 1000) + (text.length > 1000 ? "..." : ""),
                statistics: {
                    characters: text.length,
                    words: words.length,
                    sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
                    readingTime: Math.round(text.length / 200)
                },
                detectedPatterns: manipulationPatterns.filter(pattern =>
                    pattern.detectionKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))
                ).map(pattern => ({
                    name: pattern.name,
                    riskLevel: pattern.riskLevel,
                    protectionLevel: pattern.protectionLevel
                })),
                recommendations: [
                    "Активировать полную защиту (все 9 уровней)",
                    "Регулярно проверять новые сообщения",
                    "Проводить тренировки по обнаружению манипуляций"
                ],
                protectionConfig: {
                    activeLevels: Array.from(this.activeLevels),
                    preset: this.currentPreset
                }
            };

            const dataStr = JSON.stringify(report, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileName = `анализ_манипуляций_${analysisDate.split('T')[0]}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileName);
            linkElement.click();
            this.showNotification('Отчёт анализа экспортирован');
        }

        exportPatternReport(patternId) {
            const pattern = manipulationPatterns.find(p => p.id === patternId);
            if (!pattern) return;

            const report = {
                title: `Отчёт по паттерну манипуляции: ${pattern.name}`,
                generated: new Date().toISOString(),
                pattern: {
                    id: pattern.id,
                    name: pattern.name,
                    category: pattern.category,
                    description: pattern.description,
                    cognitiveBias: pattern.cognitiveBias,
                    riskLevel: pattern.riskLevel,
                    protectionLevel: pattern.protectionLevel
                },
                examples: pattern.examples,
                detectionKeywords: pattern.detectionKeywords,
                protectionMechanisms: pattern.mechanisms,
                countermeasures: pattern.countermeasures,
                technicalSolution: pattern.technicalSolution,
                recommendations: [
                    `Активировать уровень защиты ${pattern.protectionLevel}`,
                    'Использовать анализатор текста для проверки контента',
                    'Проводить регулярные проверки на манипуляции'
                ]
            };

            const dataStr = JSON.stringify(report, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileName = `паттерн_${pattern.id}_${new Date().toISOString().split('T')[0]}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileName);
            linkElement.click();
            this.showNotification(`Отчёт по паттерну "${pattern.name}" экспортирован`);
        }

        clearAll() {
            if (confirm('Вы уверены, что хотите сбросить всю конфигурацию защиты? Это действие нельзя отменить.')) {
                this.activeLevels = new Set([1, 2]);
                this.currentPreset = "basic";

                protectionLevels.forEach(level => {
                    const cell = document.querySelector(`[data-level="${level.id}"]`);
                    if (cell) {
                        cell.classList.remove('active');
                        cell.style.transform = 'translateY(0) translateZ(0)';
                    }
                });

                const cell1 = document.querySelector('[data-level="1"]');
                const cell2 = document.querySelector('[data-level="2"]');
                if (cell1) cell1.classList.add('active');
                if (cell2) cell2.classList.add('active');

                this.updateProtectionIndicator();
                this.saveConfiguration();
                this.showNotification('Конфигурация сброшена к базовым настройкам');
            }
        }

        hexToRgb(hex) {
            if (hex.startsWith('var')) {
                const colorMap = {
                    'blue': '79,195,247',
                    'green': '165,214,167',
                    'yellow': '255,204,128',
                    'pink': '244,143,177',
                    'purple': '179,157,219',
                    'cyan': '128,203,196',
                    'orange': '255,171,145',
                    'lavender': '206,147,216',
                    'teal': '128,222,234',
                    'red': '239,68,68'
                };
                for (let key in colorMap) {
                    if (hex.includes(key)) return colorMap[key];
                }
                return '79,195,247';
            }
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '79,195,247';
        }

        updateCurrentPreset() {
            for (const [key, preset] of Object.entries(presets)) {
                const levelsSet = new Set(preset.levels);
                if (levelsSet.size === this.activeLevels.size && [...this.activeLevels].every(id => levelsSet.has(id))) {
                    this.currentPreset = key;
                    break;
                }
            }
        }

        dispose() {
            if (this.scene3d) this.scene3d.dispose();
        }
    }

    // ==========================================================================
    // ГЛОБАЛЬНЫЕ ФУНКЦИИ
    // ==========================================================================

    window.showPrivacyPolicy = function () {
        ORIENTIR.utils.NotificationUtils.showPrivacyPolicy('default');
    };

    // ==========================================================================
    // ИНИЦИАЛИЗАЦИЯ
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        window.protectionSystem = new ProtectionSystem();

        window.addEventListener('beforeunload', () => window.protectionSystem?.dispose());

        document.getElementById('privacy-policy-btn')?.addEventListener('click', window.showPrivacyPolicy);

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