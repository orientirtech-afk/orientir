/* ==========================================================================
   config.js – Базовые константы проекта
   ========================================================================== */

window.ORIENTIR = window.ORIENTIR || {};

ORIENTIR.CONFIG = {
    // ---------- Адаптивность ----------
    MOBILE_BREAKPOINT: 768,
    IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768,

    // ---------- 3D: общие настройки ----------
    PARTICLE_COUNT: 400,
    CONNECTION_DISTANCE: 100,
    AUTO_ROTATE: true,
    QUALITY: 'high',
    MOUSE_SMOOTHING: 0.08,
    SPHERE_FLOAT_AMPLITUDE: 15,
    SPHERE_ROTATION_SPEED: 0.0008,  // обязательно должно быть числом

    // ---------- 3D: специфика разных сцен ----------
    CREATIVE_PALETTE: [
        0xF48FB1, 0x4FC3F7, 0xA5D6A7, 0xFFCC80, 0xB39DDB, 0x80CBC4
    ],
    ORBITAL_OBJECTS_COUNT: 25,

    // ---------- Уведомления ----------
    NOTIFICATION_DURATION: 3000,

    // ---------- Цветовая палитра (общая) ----------
    COLORS: {
        PRIMARY_BLUE: 0x4fc3f7,
        PRIMARY_GREEN: 0xa5d6a7,
        PRIMARY_YELLOW: 0xffcc80,
        PRIMARY_PINK: 0xf48fb1,
        PRIMARY_PURPLE: 0xb39ddb,
        PRIMARY_CYAN: 0x80cbc4,
        // Дополнительные цвета для страниц orientir и local_ai
        ORANGE: 0xff8a65,
        LAVENDER: 0xce93d8,
        TEAL: 0x80deea,
        RED: 0xef4444
    }
};