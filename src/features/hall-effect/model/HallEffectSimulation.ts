import * as THREE from 'three';
import { Electron } from '../../../entities/electron/model/types';
import { ELECTRON_CONSTANTS } from '../../../entities/electron/model/constants';
import { createElectronMesh } from '../../../entities/electron/lib/mesh';

export class HallEffectSimulation {
  private electrons: Electron[] = [];
  private scene: THREE.Scene;
  private current: number;
  private magneticField: number;
  private isRunning: boolean;
  private lastForce = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.current = 7;
    this.magneticField = 49.33;
    this.isRunning = true;
    console.log("HallEffectSimulation создан с током", this.current, "и магнитным полем", this.magneticField);
  }

  private calculateLorentzForce(velocity: THREE.Vector3, magneticField: number): THREE.Vector3 {
    const B = new THREE.Vector3(0, -1, 0).multiplyScalar(magneticField);
    const force = new THREE.Vector3();
    force.crossVectors(velocity, B);
    this.lastForce.copy(force);
    return force.multiplyScalar(ELECTRON_CONSTANTS.EFFECT_FACTOR);
  }

  public initializeElectrons(count: number = ELECTRON_CONSTANTS.COUNT): void {
    console.log("Инициализация электронов");
    this.dispose();

    this.electrons = Array.from({ length: count }, (_, i) => {
      const position = new THREE.Vector3(
        Math.random() * 4 - 2,
        Math.random() * 0.2 - 0.1,
        0
      );
      
      const mesh = createElectronMesh(position);
      this.scene.add(mesh);

      const velocity = new THREE.Vector3(-ELECTRON_CONSTANTS.BASE_VELOCITY, 0, 0);

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
      electron.velocity.x = -ELECTRON_CONSTANTS.BASE_VELOCITY * this.current;
      
      const lorentzForce = this.calculateLorentzForce(electron.velocity, this.magneticField);
      
      electron.position.x += electron.velocity.x * dt;
      electron.position.z += lorentzForce.z * dt * Math.abs(this.magneticField);
      electron.position.y += (Math.random() - 0.5) * ELECTRON_CONSTANTS.RANDOM_MOVEMENT_FACTOR;
      
      if (electron.position.x < -ELECTRON_CONSTANTS.RESET_POSITION_X) {
        electron.position.x = ELECTRON_CONSTANTS.RESET_POSITION_X;
        electron.position.y = Math.random() * 0.2 - 0.1;
        electron.position.z = 0;
      }
      
      electron.position.y = THREE.MathUtils.clamp(electron.position.y, -0.2, 0.2);
      electron.position.z = THREE.MathUtils.clamp(electron.position.z, -0.4, 0.4);
      
      electron.mesh.position.copy(electron.position);
    });

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