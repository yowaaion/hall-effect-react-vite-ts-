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
  private readonly MOVEMENT_SPEED = 0.5;
  private readonly MAGNETIC_FORCE_FACTOR = 0.001;
  private readonly RANDOM_MOVEMENT_FACTOR = 0.0005;
  private readonly RESET_POSITION_X = 2.5;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.current = 7;
    this.magneticField = 49.33;
    this.isRunning = true;
    console.log("HallEffectSimulation создан");
  }

  public initializeElectrons(count: number = this.ELECTRON_COUNT): void {
    console.log("Инициализация электронов");
    
    // Очищаем предыдущие электроны
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
        Math.random() * 0.8 - 0.4   // от -0.4 до 0.4
      );
      mesh.position.copy(position);
      mesh.castShadow = true;
      mesh.userData.id = i;
      this.scene.add(mesh);

      return {
        position,
        velocity: new THREE.Vector3(this.MOVEMENT_SPEED, 0, 0),
        id: i,
        mesh,
        initialPosition: position.clone()
      };
    });
    
    console.log(`Создано ${this.electrons.length} электронов`);
  }

  public update(deltaTime: number): void {
    if (!this.isRunning) return;
    
    this.electrons.forEach(electron => {
      // Движение под действием тока (вдоль оси X)
      const currentForce = this.current * this.MOVEMENT_SPEED * deltaTime;
      electron.position.x += currentForce;
      
      // Эффект Холла (отклонение вдоль оси Y)
      const hallForce = this.current * this.magneticField * this.MAGNETIC_FORCE_FACTOR * deltaTime;
      electron.position.y += hallForce;
      
      // Случайные флуктуации
      electron.position.y += (Math.random() - 0.5) * this.RANDOM_MOVEMENT_FACTOR;
      electron.position.z += (Math.random() - 0.5) * this.RANDOM_MOVEMENT_FACTOR;
      
      // Сброс позиции при достижении края
      if (electron.position.x > this.RESET_POSITION_X) {
        electron.position.x = -this.RESET_POSITION_X;
        electron.position.y = Math.random() * 0.2 - 0.1;
        electron.position.z = Math.random() * 0.8 - 0.4;
      }
      
      // Ограничение движения
      electron.position.y = THREE.MathUtils.clamp(electron.position.y, -0.2, 0.2);
      electron.position.z = THREE.MathUtils.clamp(electron.position.z, -0.4, 0.4);
      
      // Обновление позиции меша
      electron.mesh.position.copy(electron.position);
    });
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