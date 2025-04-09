import { VisualizationConfig } from '../types/hall-effect';
import * as THREE from 'three';

export const DEFAULT_VISUALIZATION_CONFIG: VisualizationConfig = {
  electronCount: 30,
  electronSize: 0.06,
  semiconductorSize: {
    width: 4,
    height: 0.5,
    depth: 1
  },
  animationSpeed: 0.01,
  cameraConfig: {
    fov: 60,
    near: 0.1,
    far: 1000,
    position: new THREE.Vector3(3, 2, 4)
  }
};

export const COLORS = {
  BACKGROUND: 0xf8fafc,
  ELECTRON: 0x3b82f6,
  ELECTRON_GLOW: 0x60a5fa,
  SEMICONDUCTOR: 0xe2e8f0,
  MAGNETIC_FIELD: 0x1e40af,
  CURRENT: 0xdc2626,
  GRID: {
    PRIMARY: 0xcccccc,
    SECONDARY: 0xe5e5e5
  }
};

export const MATERIAL_PROPERTIES = {
  ELECTRON: {
    emissiveIntensity: 0.5,
    metalness: 0.5,
    roughness: 0.2,
    clearcoat: 1
  },
  SEMICONDUCTOR: {
    opacity: 0.9,
    metalness: 0.2,
    roughness: 0.3,
    clearcoat: 0.4
  }
};

export const ANIMATION_CONSTANTS = {
  CURRENT_MULTIPLIER: 0.004,
  MAGNETIC_FORCE_MULTIPLIER: 0.00004,
  RANDOM_MOVEMENT_FACTOR: 0.0005,
  CAMERA_ROTATION_SPEED: 0.0001
};

export const SIMULATION_LIMITS = {
  CURRENT: {
    MIN: 1,
    MAX: 15,
    STEP: 0.1
  },
  MAGNETIC_FIELD: {
    MIN: 10,
    MAX: 100,
    STEP: 0.1
  },
  POSITION: {
    X_MAX: 2,
    Y_MAX: 0.2,
    Z_MAX: 0.4
  }
}; 