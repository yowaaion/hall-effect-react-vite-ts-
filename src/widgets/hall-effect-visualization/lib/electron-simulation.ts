import * as THREE from 'three';
import { createBeautifulElectronMesh } from './visualization';

export interface Electron {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  id: number;
  mesh: THREE.Mesh;
  initialPosition: THREE.Vector3;
  trailPoints: THREE.Vector3[]; // Точки для следа электрона
}

export class ElectronSimulation {
  private electrons: Electron[] = [];
  private scene: THREE.Scene;
  private lastCurrentVal: number = 0;
  private movementEnabled: boolean = true;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  public initializeElectrons(count: number = 18): Electron[] {
    this.dispose();
    
    this.electrons = Array.from({ length: count }, (_, i) => {
      const position = new THREE.Vector3(
        Math.random() * 4 - 2,
        Math.random() * 0.2 - 0.1,
        Math.random() * 0.4 - 0.2
      );
      
      const mesh = createBeautifulElectronMesh(position);
      this.scene.add(mesh);

      const velocity = new THREE.Vector3(-0.5, 0, 0);

      return {
        position,
        velocity,
        id: i,
        mesh,
        initialPosition: position.clone(),
        trailPoints: [] // Пустой массив для хранения точек следа
      };
    });
    
    return this.electrons;
  }
  
  public updateElectrons(
    electrons: Electron[],
    deltaTime: number,
    currentVal: number,
    magneticFieldVal: number,
    time: number
  ): void {
    const dt = Math.min(deltaTime, 0.033);
    
    // Визуализация накопления зарядов на краях полупроводника
    const showEdgeAccumulation = magneticFieldVal > 5 && currentVal > 1;
    
    electrons.forEach(electron => {
      // Используем переданные значения для более реалистичной симуляции
      // Сила тока влияет на скорость электронов
      electron.velocity.x = -0.5 * Math.max(0.2, currentVal / 5);
      
      // Более реалистичный расчет силы Лоренца: F = q[v×B]
      // Для электронов q отрицательный, поэтому направление отклонения противоположное
      const force = new THREE.Vector3();
      const B = new THREE.Vector3(0, -1, 0).multiplyScalar(magneticFieldVal);
      force.crossVectors(electron.velocity, B);
      
      // Отрицательный заряд электрона * коэффициент силы
      // Масштабируем эффект для лучшей визуализации
      const FORCE_SCALE = 0.15;
      force.multiplyScalar(-FORCE_SCALE); 
      
      // Обновляем положение электрона по осям X и Z
      electron.position.x += electron.velocity.x * dt;
      electron.position.z += force.z * dt * 0.5; // Уменьшаем коэффициент для более реалистичного отклонения
      
      // Небольшое случайное движение для реалистичности, но уменьшаем для плавности
      electron.position.y += (Math.random() - 0.5) * 0.00005;
      
      // Если электрон вышел за пределы полупроводника по X
      if (electron.position.x < -2.5) {
        electron.position.x = 2.5;
        // Случайное положение по Y и Z, но с учетом эффекта Холла
        electron.position.y = Math.random() * 0.2 - 0.1;
        
        // При сильном магнитном поле электроны стартуют уже отклоненными
        if (showEdgeAccumulation) {
          // Случайное значение, но с отрицательным смещением для имитации отрицательного накопления зарядов
          electron.position.z = Math.random() * 0.2 - 0.4;
        } else {
          electron.position.z = Math.random() * 0.4 - 0.2;
        }
      }
      
      // Ограничиваем положение электрона внутри полупроводника
      electron.position.y = THREE.MathUtils.clamp(electron.position.y, -0.2, 0.2);
      
      // Имитация накопления зарядов на краях - электроны должны скапливаться на одном краю при сильном поле
      if (showEdgeAccumulation) {
        // Используем сигмоидную функцию для плавного ограничения положения по Z
        // За пределы полупроводника электроны выходить не должны, но должны отклоняться
        const zLimit = 0.4 + (magneticFieldVal/100) * 0.1; // Увеличиваем предел при сильном поле
        electron.position.z = THREE.MathUtils.clamp(electron.position.z, -zLimit, zLimit);
      } else {
        electron.position.z = THREE.MathUtils.clamp(electron.position.z, -0.4, 0.4);
      }
      
      // Делаем размер электрона пульсирующим, чтобы добавить жизни
      const pulse = 1 + Math.sin(time * 0.003 + electron.id * 0.5) * 0.1;
      electron.mesh.scale.set(pulse, pulse, pulse);
      
      // Меняем яркость свечения в зависимости от скорости
      const electronMaterial = electron.mesh.material as THREE.MeshStandardMaterial;
      electronMaterial.emissiveIntensity = 0.3 + (Math.abs(electron.velocity.x) / 2) * 0.7;
      
      // Обновляем меш
      electron.mesh.position.copy(electron.position);
    });
  }
  
  public dispose(): void {
    this.electrons.forEach(electron => {
      this.scene.remove(electron.mesh);
      electron.mesh.geometry.dispose();
      (electron.mesh.material as THREE.Material).dispose();
    });
    this.electrons = [];
  }
  
  public getElectrons(): Electron[] {
    return this.electrons;
  }
} 