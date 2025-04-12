import * as THREE from 'three';

// Типы для визуализации
export interface LorentzArrow {
  arrow: THREE.ArrowHelper;
  originalDirection: THREE.Vector3;
  length: number;
}

// Интерфейс для электрона
export interface Electron {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  id: number;
  mesh: THREE.Mesh;
  initialPosition: THREE.Vector3;
  trailPoints: THREE.Vector3[]; // Точки для следа электрона
}

// Интерфейс для стрелок тока
export interface CurrentArrows {
  mainArrow: THREE.ArrowHelper;
  smallArrows: THREE.Mesh[];
}

// Интерфейс для компонента стрелки
export interface ArrowComponent {
  line: THREE.Mesh;
  cone: THREE.Mesh;
  group: THREE.Group;
}

// Типы для функций обновления
export type UpdateFunction<T> = (
  object: T,
  ...args: any[]
) => void; 