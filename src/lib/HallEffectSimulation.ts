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
  private lastUpdateTime: number;
  private readonly ELECTRON_COUNT = 50;
  private readonly MOVEMENT_SPEED = 0.004;
  private readonly MAGNETIC_FORCE_FACTOR = 0.00004;
  private readonly RANDOM_MOVEMENT_FACTOR = 0.0003;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.current = 7;
    this.magneticField = 49.33;
    this.isRunning = true;
    this.lastUpdateTime = performance.now();
  }

  public initializeElectrons(count: number = this.ELECTRON_COUNT): void {
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
        Math.random() * 4 - 2,
        Math.random() * 0.2 - 0.1,
        Math.random() * 0.8 - 0.4
      );
      mesh.position.copy(position);
      mesh.userData.id = i;
      this.scene.add(mesh);

      return {
        position,
        velocity: new THREE.Vector3(Math.random() * 0.02 + 0.03, 0, 0),
        id: i,
        mesh,
        initialPosition: position.clone()
      };
    });
  }

  public update(deltaTime: number): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const timeSinceLastUpdate = (currentTime - this.lastUpdateTime) * 0.001;
    this.lastUpdateTime = currentTime;

    // Используем requestAnimationFrame для более плавного обновления
    requestAnimationFrame(() => {
      this.electrons.forEach(electron => {
        // Обновляем позицию с учетом времени
        const movement = this.current * this.MOVEMENT_SPEED * electron.velocity.x * timeSinceLastUpdate;
        electron.position.x += movement;
        
        // Применяем эффект Холла с плавным переходом
        const magneticForce = this.magneticField * this.current * this.MAGNETIC_FORCE_FACTOR * timeSinceLastUpdate;
        electron.position.y += magneticForce;

        // Добавляем плавное случайное движение
        const randomY = (Math.random() - 0.5) * this.RANDOM_MOVEMENT_FACTOR * timeSinceLastUpdate;
        const randomZ = (Math.random() - 0.5) * this.RANDOM_MOVEMENT_FACTOR * timeSinceLastUpdate;
        electron.position.y += randomY;
        electron.position.z += randomZ;

        // Плавный сброс позиции
        if (electron.position.x > 2) {
          electron.position.x = -2;
          electron.position.y = electron.initialPosition.y + (Math.random() - 0.5) * 0.1;
          electron.position.z = electron.initialPosition.z + (Math.random() - 0.5) * 0.2;
        }
        
        // Плавное ограничение движения
        if (Math.abs(electron.position.y) > 0.2) {
          electron.position.y = Math.sign(electron.position.y) * 0.2;
        }
        
        if (Math.abs(electron.position.z) > 0.4) {
          electron.position.z = Math.sign(electron.position.z) * 0.4;
        }

        // Плавное обновление позиции меша
        electron.mesh.position.lerp(electron.position, 0.5);
      });
    });
  }

  public setCurrent(value: number): void {
    this.current = value;
  }

  public setMagneticField(value: number): void {
    this.magneticField = value;
  }

  public setIsRunning(value: boolean): void {
    this.isRunning = value;
    if (value) {
      this.lastUpdateTime = performance.now();
    }
  }

  public getElectrons(): Electron[] {
    return this.electrons;
  }

  public dispose(): void {
    this.electrons.forEach(electron => {
      this.scene.remove(electron.mesh);
      electron.mesh.geometry.dispose();
      (electron.mesh.material as THREE.Material).dispose();
    });
    this.electrons = [];
  }
} 