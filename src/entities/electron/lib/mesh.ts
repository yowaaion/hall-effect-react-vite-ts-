import * as THREE from 'three';
import { ELECTRON_CONSTANTS } from '../model/constants';

export function createElectronMesh(position: THREE.Vector3): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(ELECTRON_CONSTANTS.SIZE, 16, 16);
  const material = new THREE.MeshPhysicalMaterial({ 
    color: ELECTRON_CONSTANTS.COLOR,
    emissive: ELECTRON_CONSTANTS.EMISSIVE,
    emissiveIntensity: 0.5,
    metalness: 0.5,
    roughness: 0.2,
    clearcoat: 1,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.castShadow = true;

  return mesh;
} 