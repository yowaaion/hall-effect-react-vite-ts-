import * as THREE from 'three';

export interface Electron {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  id: number;
  initialPosition: THREE.Vector3;
  trailPoints: THREE.Vector3[]; // Точки для следа электрона
  // Мы больше не храним mesh в каждом электроне
  // mesh: THREE.Mesh;
}

export class ElectronSimulation {
  private electrons: Electron[] = [];
  private scene: THREE.Scene;
  private lastCurrentVal: number = 0;
  private movementEnabled: boolean = true;
  
  // Добавляем InstancedMesh для оптимизации рендеринга
  private electronsMesh: THREE.InstancedMesh | null = null;
  private electronsGlow: THREE.InstancedMesh | null = null;
  private electronsGeometry: THREE.SphereGeometry | null = null;
  private electronsMaterial: THREE.MeshStandardMaterial | null = null;
  private glowGeometry: THREE.SphereGeometry | null = null;
  private glowMaterial: THREE.MeshBasicMaterial | null = null;
  private dummy: THREE.Object3D = new THREE.Object3D();
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  public initializeElectrons(count: number = 18): Electron[] {
    this.dispose();
    
    // Создаем общую геометрию и материалы для всех электронов
    this.electronsGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    this.electronsMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1e40af,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.7,
      transparent: true,
      opacity: 0.9
    });
    
    // Создаем геометрию и материал для свечения
    this.glowGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    this.glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    
    // Создаем InstancedMesh для электронов и их свечения
    this.electronsMesh = new THREE.InstancedMesh(
      this.electronsGeometry,
      this.electronsMaterial,
      count
    );
    
    this.electronsGlow = new THREE.InstancedMesh(
      this.glowGeometry,
      this.glowMaterial,
      count
    );
    
    // Добавляем в сцену
    this.scene.add(this.electronsMesh);
    this.scene.add(this.electronsGlow);
    
    // Настройка для теней
    this.electronsMesh.castShadow = true;
    this.electronsMesh.receiveShadow = true;
    
    // Создаем массив электронов
    this.electrons = Array.from({ length: count }, (_, i) => {
      // Распределяем электроны равномерно внутри полупроводника
      const position = new THREE.Vector3(
        Math.random() * 4 - 2,      // X от -2 до 2
        Math.random() * 0.2 - 0.1,  // Y от -0.1 до 0.1
        Math.random() * 0.4 - 0.2   // Z от -0.2 до 0.2
      );
      
      // Базовая скорость электрона - направлена влево для физической точности
      const velocity = new THREE.Vector3(-0.5, 0, 0);
      
      // Устанавливаем позицию для этого экземпляра
      this.dummy.position.copy(position);
      this.dummy.scale.set(1, 1, 1);
      this.dummy.updateMatrix();
      
      if (this.electronsMesh) this.electronsMesh.setMatrixAt(i, this.dummy.matrix);
      if (this.electronsGlow) this.electronsGlow.setMatrixAt(i, this.dummy.matrix);

      return {
        position,
        velocity,
        id: i,
        initialPosition: position.clone(),
        trailPoints: [] // Пустой массив для хранения точек следа
      };
    });
    
    // Обновляем матрицы экземпляров
    if (this.electronsMesh) this.electronsMesh.instanceMatrix.needsUpdate = true;
    if (this.electronsGlow) this.electronsGlow.instanceMatrix.needsUpdate = true;
    
    // Активируем движение по умолчанию
    this.movementEnabled = true;
    
    return this.electrons;
  }
  
  private resetElectronPositions(): void {
    this.electrons.forEach((electron, index) => {
      // Распределяем электроны равномерно внутри полупроводника
      electron.position.set(
        Math.random() * 4 - 2,      // X от -2 до 2
        Math.random() * 0.2 - 0.1,  // Y от -0.1 до 0.1
        Math.random() * 0.4 - 0.2   // Z от -0.2 до 0.2
      );
      
      // Обновляем позицию в InstancedMesh
      this.dummy.position.copy(electron.position);
      this.dummy.scale.set(1, 1, 1);
      this.dummy.updateMatrix();
      
      if (this.electronsMesh) this.electronsMesh.setMatrixAt(index, this.dummy.matrix);
      if (this.electronsGlow) this.electronsGlow.setMatrixAt(index, this.dummy.matrix);
    });
    
    // Обновляем матрицы экземпляров
    if (this.electronsMesh) this.electronsMesh.instanceMatrix.needsUpdate = true;
    if (this.electronsGlow) this.electronsGlow.instanceMatrix.needsUpdate = true;
    
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
    
    // Проверяем переходы в значениях тока
    const currentTransitionToZero = this.lastCurrentVal > 0.1 && current <= 0.1;
    const currentTransitionFromZero = this.lastCurrentVal <= 0.1 && current > 0.1;
    
    // Сохраняем текущее значение для следующего вызова
    this.lastCurrentVal = current;
    
    // Если ток стал нулевым - сбрасываем положения электронов
    if (currentTransitionToZero) {
      this.resetElectronPositions();
    } 
    // Если ток стал ненулевым - возобновляем движение
    else if (currentTransitionFromZero) {
      this.resumeElectronMovement();
    }
    
    // Если ток близок к нулю - только обновляем визуальные эффекты
    if (current <= 0.1) {
      electrons.forEach((electron, index) => {
        // Делаем размер электрона пульсирующим с минимальной амплитудой
        const pulse = 1 + Math.sin(time * 2 + electron.id * 0.2) * 0.05;
        
        this.dummy.position.copy(electron.position);
        this.dummy.scale.set(pulse, pulse, pulse);
        this.dummy.updateMatrix();
        
        if (this.electronsMesh) this.electronsMesh.setMatrixAt(index, this.dummy.matrix);
        if (this.electronsGlow) this.electronsGlow.setMatrixAt(index, this.dummy.matrix);
        
        // Обновляем материал для всех электронов
        if (this.electronsMaterial) {
          this.electronsMaterial.emissive.setRGB(0.1, 0.1, 0.5); // Тусклый синий
          this.electronsMaterial.emissiveIntensity = 0.2;
        }
      });
      
      // Обновляем матрицы экземпляров
      if (this.electronsMesh) this.electronsMesh.instanceMatrix.needsUpdate = true;
      if (this.electronsGlow) this.electronsGlow.instanceMatrix.needsUpdate = true;
      
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
    
    // Обновляем эмиссию для всех электронов в зависимости от скорости
    if (this.electronsMaterial) {
      const velocityFactor = 0.5 * (current / 5); // Скорость электронов
      this.electronsMaterial.emissive.setRGB(0.1, 0.3, 0.8);
      this.electronsMaterial.emissiveIntensity = 0.3 + velocityFactor * 0.5;
    }
    
    electrons.forEach((electron, index) => {
      // Скорость электронов пропорциональна силе тока
      // В реальности электроны движутся от - к +, направление соответствует физике
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
      const FORCE_SCALE = 0.2;
      force.multiplyScalar(-FORCE_SCALE);
      
      // Обновляем положение электрона по оси X (направление тока)
      electron.position.x += electron.velocity.x * dt * 1.5;
      
      // Отклонение по Z происходит только при наличии магнитного поля
      if (magneticField > 0.1) {
        // Сила Лоренца вызывает отклонение по оси Z
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
      // Размер пульсирует для более естественного вида
      const pulse = 1 + Math.sin(time * 3 + electron.id * 0.5) * 0.1;
      
      // Обновляем позицию и масштаб в InstancedMesh
      this.dummy.position.copy(electron.position);
      this.dummy.scale.set(pulse, pulse, pulse);
      this.dummy.updateMatrix();
      
      if (this.electronsMesh) this.electronsMesh.setMatrixAt(index, this.dummy.matrix);
      if (this.electronsGlow) this.electronsGlow.setMatrixAt(index, this.dummy.matrix);
    });
    
    // Обновляем матрицы экземпляров
    if (this.electronsMesh) this.electronsMesh.instanceMatrix.needsUpdate = true;
    if (this.electronsGlow) this.electronsGlow.instanceMatrix.needsUpdate = true;
  }
  
  public dispose(): void {
    // Удаляем InstancedMesh и освобождаем ресурсы
    if (this.electronsMesh) {
      this.scene.remove(this.electronsMesh);
      this.electronsMesh.geometry.dispose();
      
      // Исправляем типизацию для материала
      if (this.electronsMesh.material instanceof THREE.Material) {
        this.electronsMesh.material.dispose();
      } else if (Array.isArray(this.electronsMesh.material)) {
        this.electronsMesh.material.forEach(material => material.dispose());
      }
      
      this.electronsMesh = null;
    }
    
    if (this.electronsGlow) {
      this.scene.remove(this.electronsGlow);
      this.electronsGlow.geometry.dispose();
      
      // Исправляем типизацию для материала
      if (this.electronsGlow.material instanceof THREE.Material) {
        this.electronsGlow.material.dispose();
      } else if (Array.isArray(this.electronsGlow.material)) {
        this.electronsGlow.material.forEach(material => material.dispose());
      }
      
      this.electronsGlow = null;
    }
    
    // Очищаем геометрию и материалы
    if (this.electronsGeometry) {
      this.electronsGeometry.dispose();
      this.electronsGeometry = null;
    }
    
    if (this.electronsMaterial) {
      this.electronsMaterial.dispose();
      this.electronsMaterial = null;
    }
    
    if (this.glowGeometry) {
      this.glowGeometry.dispose();
      this.glowGeometry = null;
    }
    
    if (this.glowMaterial) {
      this.glowMaterial.dispose();
      this.glowMaterial = null;
    }
    
    this.electrons = [];
  }
  
  public getElectrons(): Electron[] {
    return this.electrons;
  }
} 