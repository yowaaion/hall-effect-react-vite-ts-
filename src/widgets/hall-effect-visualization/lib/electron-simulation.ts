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
  private lastMagneticFieldVal: number = 0;
  private movementEnabled: boolean = true;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  public initializeElectrons(count: number = 18): Electron[] {
    this.dispose();
    
    this.electrons = Array.from({ length: count }, (_, i) => {
      // Распределяем электроны равномерно внутри полупроводника
      const position = new THREE.Vector3(
        Math.random() * 4 - 2,      // X от -2 до 2
        Math.random() * 0.2 - 0.1,  // Y от -0.1 до 0.1
        Math.random() * 0.4 - 0.2   // Z от -0.2 до 0.2
      );
      
      const mesh = createBeautifulElectronMesh(position);
      this.scene.add(mesh);

      // Электрон может иметь начальную ненулевую скорость
      // В зависимости от текущих начальных настроек тока
      const velocity = new THREE.Vector3(0, 0, 0);

      return {
        position,
        velocity,
        id: i,
        mesh,
        initialPosition: position.clone(),
        trailPoints: [] // Пустой массив для хранения точек следа
      };
    });
    
    // Активируем движение по умолчанию
    this.movementEnabled = true;
    
    return this.electrons;
  }
  
  // Метод для сброса положения электронов при переходе от ненулевого тока к нулевому
  private resetElectronPositions(): void {
    this.electrons.forEach(electron => {
      // Распределяем электроны равномерно внутри полупроводника
      electron.position.set(
        Math.random() * 4 - 2,      // X от -2 до 2
        Math.random() * 0.2 - 0.1,  // Y от -0.1 до 0.1
        Math.random() * 0.4 - 0.2   // Z от -0.2 до 0.2
      );
      
      // Сбрасываем скорость до нуля
      electron.velocity.set(0, 0, 0);
      
      // Обновляем положение меша
      electron.mesh.position.copy(electron.position);
    });
    
    // Отключаем движение
    this.movementEnabled = false;
  }
  
  // Метод для возобновления движения электронов
  private resumeElectronMovement(): void {
    this.movementEnabled = true;
  }
  
  public updateElectrons(
    electrons: Electron[],
    deltaTime: number,
    currentVal: number,
    magneticFieldVal: number,
    time: number
  ): void {
    // Защита от некорректных значений
    const current = Math.max(0, currentVal || 0);
    const magneticField = Math.max(0, magneticFieldVal || 0);
    const dt = Math.min(deltaTime, 0.033); // Ограничиваем deltaTime для стабильности
    
    // Проверяем переходы в значениях тока и магнитного поля
    const currentTransitionToZero = this.lastCurrentVal > 0.1 && current <= 0.1;
    const currentTransitionFromZero = this.lastCurrentVal <= 0.1 && current > 0.1;
    
    // Сохраняем текущие значения для следующего вызова
    this.lastCurrentVal = current;
    this.lastMagneticFieldVal = magneticField;
    
    // Если ток стал нулевым - сбрасываем положения электронов и останавливаем движение
    if (currentTransitionToZero) {
      this.resetElectronPositions();
    } 
    // Если ток стал ненулевым - возобновляем движение
    else if (currentTransitionFromZero) {
      this.resumeElectronMovement();
    }
    
    // Если ток около нуля - только обновляем визуальные эффекты и ГАРАНТИРУЕМ остановку
    if (current <= 0.1) {
      electrons.forEach(electron => {
        // Принудительно устанавливаем нулевую скорость
        electron.velocity.set(0, 0, 0);
        
        // Делаем размер электрона пульсирующим с минимальной амплитудой
        const pulse = 1 + Math.sin(time * 2 + electron.id * 0.2) * 0.05;
        electron.mesh.scale.set(pulse, pulse, pulse);
        
        // Меняем цвет на более тусклый (неактивный)
        const electronMaterial = electron.mesh.material as THREE.MeshStandardMaterial;
        electronMaterial.emissive.setRGB(0.1, 0.1, 0.5); // Тусклый синий
        electronMaterial.emissiveIntensity = 0.2;
        
        // Замораживаем положение
        electron.mesh.position.copy(electron.position);
      });
      return;
    }
    
    // Если движение не активировано, но ток > 0, активируем движение
    if (!this.movementEnabled && current > 0.1) {
      this.resumeElectronMovement();
    }
    
    // Пропускаем обновление, если движение отключено
    if (!this.movementEnabled) return;
    
    // Флаг для имитации накопления зарядов на краях полупроводника
    // Это происходит только при значительном магнитном поле и токе
    const showEdgeAccumulation = magneticField > 10 && current > 1;
    
    electrons.forEach(electron => {
      // Скорость электронов пропорциональна силе тока
      // В реальности электроны движутся от - к +, но для наглядности делаем движение слева направо
      const baseVelocity = 0.5 * (current / 5);
      electron.velocity.x = -baseVelocity;
      
      // Расчет силы Лоренца: F = q[v×B]
      // Для электронов q отрицательный, направление по правилу левой руки
      const force = new THREE.Vector3();
      
      // Магнитное поле направлено вниз (по оси -Y)
      const B = new THREE.Vector3(0, -1, 0).multiplyScalar(magneticField / 50);
      
      // Вычисляем векторное произведение скорости и магнитного поля
      force.crossVectors(electron.velocity, B);
      
      // Умножаем на отрицательный заряд электрона
      // Масштабируем для лучшей визуализации (сила Лоренца слаба)
      const FORCE_SCALE = 0.2;
      force.multiplyScalar(-FORCE_SCALE);
      
      // Обновляем положение электрона по оси X (направление тока)
      // Используем больший множитель для более заметного движения
      electron.position.x += electron.velocity.x * dt * 1.5;
      
      // Отклонение по Z происходит только при наличии магнитного поля
      if (magneticField > 0.1) {
        // Сила Лоренца вызывает отклонение по оси Z
        // Усиливаем эффект для лучшей видимости
        electron.position.z += force.z * dt * 1.2;
      }
      
      // Небольшое случайное движение для реалистичности
      electron.position.y += (Math.random() - 0.5) * 0.0001;
      
      // Перенос электронов при выходе за границу
      if (electron.position.x < -2.5) {
        // Если электрон вышел слева, переносим его справа
        electron.position.x = 2.5;
        electron.position.y = Math.random() * 0.2 - 0.1;
        
        // В присутствии сильного магнитного поля и тока
        // новые электроны появляются с учетом накопления заряда
        if (showEdgeAccumulation) {
          // Смещаем начальное положение к нижней части полупроводника
          // это имитирует отрицательное накопление зарядов на одной стороне
          electron.position.z = Math.random() * 0.2 - 0.4;
        } else {
          electron.position.z = Math.random() * 0.4 - 0.2;
        }
      }
      
      // Ограничиваем положение электрона внутри полупроводника
      electron.position.y = THREE.MathUtils.clamp(electron.position.y, -0.2, 0.2);
      
      // Имитация эффекта Холла - накопление зарядов на краях
      if (showEdgeAccumulation) {
        // При сильном магнитном поле увеличиваем предел отклонения
        const zLimit = 0.4 + (magneticField/100) * 0.1;
        electron.position.z = THREE.MathUtils.clamp(electron.position.z, -zLimit, zLimit);
      } else {
        electron.position.z = THREE.MathUtils.clamp(electron.position.z, -0.4, 0.4);
      }
      
      // Визуальные эффекты для электронов
      // Размер и яркость зависят от скорости и положения
      const velocityFactor = Math.abs(electron.velocity.x);
      const pulse = 1 + Math.sin(time * 0.003 + electron.id * 0.5) * 0.1;
      electron.mesh.scale.set(pulse, pulse, pulse);
      
      // Меняем цвет в зависимости от скорости
      const electronMaterial = electron.mesh.material as THREE.MeshStandardMaterial;
      electronMaterial.emissive.setRGB(0.1, 0.3, 0.8);
      electronMaterial.emissiveIntensity = 0.3 + velocityFactor * 0.5;
      
      // Обновляем меш
      electron.mesh.position.copy(electron.position);
    });
  }
  
  public dispose(): void {
    this.electrons.forEach(electron => {
      this.scene.remove(electron.mesh);
      if (electron.mesh) {
        if (electron.mesh.geometry) electron.mesh.geometry.dispose();
        if (electron.mesh.material) {
          if (Array.isArray(electron.mesh.material)) {
            electron.mesh.material.forEach(material => material.dispose());
          } else {
            electron.mesh.material.dispose();
          }
        }
      }
    });
    this.electrons = [];
  }
  
  public getElectrons(): Electron[] {
    return this.electrons;
  }
} 