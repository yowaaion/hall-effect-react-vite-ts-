import * as THREE from 'three';

export interface Electron {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  id: number;
  mesh: THREE.Mesh;
  initialPosition: THREE.Vector3;
}

export class HallEffectSimulation {
  private electrons: Electron[] = [];
  private scene: THREE.Scene;
  private current: number;
  private magneticField: number;
  private isRunning: boolean;
  private readonly ELECTRON_COUNT = 50;
  private readonly BASE_VELOCITY = 0.5; // Базовая скорость электронов
  private readonly ELECTRON_CHARGE = -1; // Отрицательный заряд электрона
  private readonly HALL_EFFECT_FACTOR = 0.1; // Значительно увеличен для видимого эффекта
  private readonly RANDOM_MOVEMENT_FACTOR = 0.0001; // Сильно уменьшен
  private readonly RESET_POSITION_X = 2.5;
  private lastForce = new THREE.Vector3(); // Для отладки

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.current = 7;
    this.magneticField = 49.33;
    this.isRunning = true;
    console.log("HallEffectSimulation создан с током", this.current, "и магнитным полем", this.magneticField);
  }

  private calculateLorentzForce(velocity: THREE.Vector3, magneticField: number): THREE.Vector3 {
    // Магнитное поле направлено вниз по Y
    const B = new THREE.Vector3(0, -1, 0).multiplyScalar(magneticField);
    
    // Вычисляем силу Лоренца F = q[v×B]
    const force = new THREE.Vector3();
    force.crossVectors(velocity, B);
    
    // Сохраняем силу для отладки
    this.lastForce.copy(force);
    
    // Применяем масштабирование
    return force.multiplyScalar(this.HALL_EFFECT_FACTOR);
  }

  public initializeElectrons(count: number = this.ELECTRON_COUNT): void {
    console.log("Инициализация электронов");
    
    this.dispose();
    
    const electronGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const electronMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x3b82f6,
      emissive: 0x60a5fa,
      emissiveIntensity: 0.5,
      metalness: 0.5,
      roughness: 0.2,
      clearcoat: 1,
    });

    this.electrons = Array.from({ length: count }, (_, i) => {
      const mesh = new THREE.Mesh(electronGeometry, electronMaterial);
      const position = new THREE.Vector3(
        Math.random() * 4 - 2,  // от -2 до 2
        Math.random() * 0.2 - 0.1,  // от -0.1 до 0.1
        0  // Начинаем с Z = 0 для лучшей видимости эффекта
      );
      mesh.position.copy(position);
      mesh.castShadow = true;
      mesh.userData.id = i;
      this.scene.add(mesh);

      const velocity = new THREE.Vector3(-this.BASE_VELOCITY, 0, 0);

      return {
        position,
        velocity,
        id: i,
        mesh,
        initialPosition: position.clone()
      };
    });
    
    console.log(`Создано ${this.electrons.length} электронов`);
  }

  public update(deltaTime: number): void {
    if (!this.isRunning) return;
    
    const dt = Math.min(deltaTime, 0.1);
    
    this.electrons.forEach(electron => {
      // Обновляем скорость (против тока)
      electron.velocity.x = -this.BASE_VELOCITY * this.current;
      
      // Вычисляем силу Лоренца
      const lorentzForce = this.calculateLorentzForce(electron.velocity, this.magneticField);
      
      // Движение вдоль X (ток)
      electron.position.x += electron.velocity.x * dt;
      
      // Движение вдоль Z (эффект Холла)
      // Увеличиваем эффект для лучшей видимости
      electron.position.z += lorentzForce.z * dt * Math.abs(this.magneticField);
      
      // Минимальные случайные флуктуации
      electron.position.y += (Math.random() - 0.5) * this.RANDOM_MOVEMENT_FACTOR;
      
      // Сброс позиции
      if (electron.position.x < -this.RESET_POSITION_X) {
        electron.position.x = this.RESET_POSITION_X;
        electron.position.y = Math.random() * 0.2 - 0.1;
        electron.position.z = 0; // Сбрасываем в центр по Z
      }
      
      // Ограничения
      electron.position.y = THREE.MathUtils.clamp(electron.position.y, -0.2, 0.2);
      electron.position.z = THREE.MathUtils.clamp(electron.position.z, -0.4, 0.4);
      
      electron.mesh.position.copy(electron.position);
    });

    // Отладочная информация
    if (this.electrons.length > 0) {
      const firstElectron = this.electrons[0];
      console.log(
        `Диагностика: ток=${this.current}, поле=${this.magneticField}, ` +
        `скорость=(${firstElectron.velocity.x.toFixed(3)}, ${firstElectron.velocity.y.toFixed(3)}, ${firstElectron.velocity.z.toFixed(3)}), ` +
        `сила=(${this.lastForce.x.toFixed(3)}, ${this.lastForce.y.toFixed(3)}, ${this.lastForce.z.toFixed(3)}), ` +
        `позиция Z=${firstElectron.position.z.toFixed(3)}`
      );
    }
  }

  public setCurrent(value: number): void {
    this.current = value;
    console.log("Ток обновлен:", value);
  }

  public setMagneticField(value: number): void {
    this.magneticField = value;
    console.log("Магнитное поле обновлено:", value);
  }

  public setIsRunning(value: boolean): void {
    this.isRunning = value;
    console.log("Состояние запуска обновлено:", value);
  }

  public getElectrons(): Electron[] {
    return this.electrons;
  }

  public dispose(): void {
    console.log("Очистка симуляции");
    this.electrons.forEach(electron => {
      this.scene.remove(electron.mesh);
      electron.mesh.geometry.dispose();
      (electron.mesh.material as THREE.Material).dispose();
    });
    this.electrons = [];
  }
} 