import * as THREE from 'three';

/**
 * Константы для физической модели эффекта Холла
 */
export const PHYSICS = {
  // Пороговые значения
  CURRENT_THRESHOLD: 2.0,         // Минимальное значение тока для визуальных эффектов
  MAGNETIC_THRESHOLD: 5.0,        // Минимальное значение магнитного поля для визуальных эффектов
  HALL_VOLTAGE_THRESHOLD: 0.0005, // Минимальное значение напряжения Холла для визуальных эффектов
  
  // Параметры для расчета накопления заряда на краях полупроводника
  EDGE_ACCUMULATION_CURRENT: 3.0, // Значение тока для заметного накопления заряда на краях
  EDGE_ACCUMULATION_FIELD: 10.0,  // Значение магнитного поля для заметного накопления заряда на краях
  
  // Параметры силы Лоренца и движения электронов
  LORENTZ_FORCE_SCALE: 0.05,      // Масштабный коэффициент для силы Лоренца
  ELECTRON_VELOCITY_SCALE: 0.2,   // Масштабный коэффициент для скорости электронов
  
  // Максимальный шаг по времени для стабильности симуляции
  MAX_DELTA_TIME: 0.1,            // Максимальный шаг времени для анимации (секунды)
};

/**
 * Константы для визуализации
 */
export const VISUAL = {
  // Цвета для различных элементов визуализации
  COLORS: {
    // Магнитное поле - синий
    MAGNETIC_FIELD: new THREE.Color(0x3080FF),       // Цвет стрелок магнитного поля
    MAGNETIC_EMISSIVE: new THREE.Color(0x1060CC),    // Цвет свечения магнитного поля
    
    // Сила Лоренца - фиолетовый
    LORENTZ_FORCE: new THREE.Color(0x8040FF),        // Цвет стрелок силы Лоренца
    LORENTZ_EMISSIVE: new THREE.Color(0x6020CC),     // Цвет свечения силы Лоренца
    
    // Ток - желтый/оранжевый
    CURRENT_MAIN: new THREE.Color(0xFFCC20),         // Цвет основной стрелки тока
    CURRENT_SMALL: new THREE.Color(0xFFA000),        // Цвет маленьких стрелок тока
    CURRENT_EMISSIVE: new THREE.Color(0xCC8000),     // Цвет свечения тока
    
    // Электроны - красный
    ELECTRON: new THREE.Color(0xFF4040),             // Цвет электронов
    ELECTRON_EMISSIVE: new THREE.Color(0xCC2020),    // Цвет свечения электронов
    
    // Полупроводник - голубой/сине-зеленый
    SEMICONDUCTOR: new THREE.Color(0x60A0B0),        // Цвет полупроводника
    SEMICONDUCTOR_EDGE: new THREE.Color(0x80C0D0),   // Цвет краев полупроводника
    SEMICONDUCTOR_BASE: {                            // Базовый цвет полупроводника в RGB
      r: 0.376,
      g: 0.627,
      b: 0.690
    },
    
    // Контакты - серебристый металл
    CONTACTS: new THREE.Color(0xC0C0C8),             // Цвет контактных площадок
    CONTACTS_EMISSIVE: new THREE.Color(0x606070),    // Цвет свечения контактов
    
    // Сетка и окружение
    GRID: new THREE.Color(0x404040),                 // Цвет сетки
    GROUND: new THREE.Color(0x303030),               // Цвет земли
    BACKGROUND: new THREE.Color(0x202025),           // Цвет фона
    
    // Интерфейс
    TEXT: new THREE.Color(0xFFFFFF),                 // Цвет текста
    TEXT_HIGHLIGHT: new THREE.Color(0x80D0FF),       // Цвет выделенного текста
  },
  
  // Параметры анимации
  ANIMATION: {
    PULSE_SPEED: 3.0,                                // Скорость пульсации эффектов
    ROTATION_SPEED: 0.05,                            // Скорость вращения камеры при автоповороте
    ELECTRON_SPAWN_RATE: 0.1,                        // Частота появления электронов (сек)
    ELECTRON_MAX_COUNT: 100,                         // Максимальное количество электронов
  },
  
  // Параметры освещения
  LIGHTING: {
    AMBIENT_INTENSITY: 0.4,                          // Интенсивность основного освещения
    DIRECTIONAL_INTENSITY: 0.6,                      // Интенсивность направленного света
    SPOT_INTENSITY: 0.8,                             // Интенсивность точечного света
  },
  
  // Параметры камеры
  CAMERA: {
    FOV: 50,                                         // Поле зрения (градусы)
    NEAR: 0.1,                                       // Ближняя плоскость отсечения
    FAR: 100,                                        // Дальняя плоскость отсечения
    INITIAL_POSITION: new THREE.Vector3(8, 5, 8),    // Начальная позиция камеры
    LOOK_AT: new THREE.Vector3(0, 0, 0),             // Точка, на которую смотрит камера
  },
};

// Начальные значения
export const INITIAL_VALUES = {
  CURRENT: 2,           // Начальное значение тока (А)
  MAGNETIC_FIELD: 30,   // Начальное значение магнитного поля (мТл)
  ELECTRON_COUNT: 18,   // Количество электронов в симуляции
}; 