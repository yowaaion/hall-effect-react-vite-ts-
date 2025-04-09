import * as THREE from 'three';

export interface Electron {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  id: number;
  mesh: THREE.Mesh;
}

export interface HallEffectParameters {
  current: number;           // Ток в мА
  magneticField: number;     // Магнитное поле в 10³ А/м
  thickness: number;         // Толщина образца в мм
  carrierDensity: number;    // Плотность носителей заряда в м⁻³
  temperature: number;       // Температура в К
}

export interface ExperimentResult {
  hallVoltage: number;      // Напряжение Холла в В
  lorentzForce: number;     // Сила Лоренца в Н
  hallCoefficient: number;  // Коэффициент Холла в м³/Кл
  mobility: number;         // Подвижность носителей заряда в м²/(В·с)
}

export interface VisualizationConfig {
  electronCount: number;    // Количество электронов
  electronSize: number;     // Размер электронов
  semiconductorSize: {      // Размеры полупроводника
    width: number;
    height: number;
    depth: number;
  };
  animationSpeed: number;   // Скорость анимации
  cameraConfig: {          // Настройки камеры
    fov: number;
    near: number;
    far: number;
    position: THREE.Vector3;
  };
} 