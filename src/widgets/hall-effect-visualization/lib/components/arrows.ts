import * as THREE from 'three';
import { CurrentArrows } from '../utils/types';
import { PHYSICS, VISUAL } from '../../config/constants';

/**
 * Creates a basic arrow with customizable parameters.
 * @param length - The length of the arrow
 * @param color - The color of the arrow
 * @param headLength - The length of the arrow head
 * @param headWidth - The width of the arrow head
 * @param radius - The radius of the arrow shaft
 * @returns THREE.Object3D containing the arrow
 */
export function createArrow(
  length: number,
  color: number,
  headLength: number = 0.2,
  headWidth: number = 0.1,
  radius: number = 0.03
): THREE.Object3D {
  const arrow = new THREE.Object3D();
  
  // Create the shaft
  const shaftGeometry = new THREE.CylinderGeometry(radius, radius, length - headLength, 12);
  const shaftMaterial = new THREE.MeshStandardMaterial({ color: color });
  const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
  shaft.position.y = (length - headLength) / 2;
  shaft.rotation.x = Math.PI / 2;
  arrow.add(shaft);
  
  // Create the head
  const headGeometry = new THREE.ConeGeometry(headWidth, headLength, 12);
  const headMaterial = new THREE.MeshStandardMaterial({ color: color });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = length - headLength / 2;
  head.rotation.x = Math.PI / 2;
  arrow.add(head);
  
  return arrow;
}

/**
 * Creates a group of arrows representing a magnetic field.
 * @param numArrows - Number of arrows to create
 * @param spacing - Spacing between arrows
 * @returns THREE.Group containing the magnetic field arrows
 */
export function createMagneticFieldArrows(
  numArrows: number = 5,
  spacing: number = 0.4
): THREE.Group {
  const group = new THREE.Group();
  const arrowLength = 1.5;
  const color = 0x0000ff; // Blue for magnetic field
  
  for (let i = 0; i < numArrows; i++) {
    const x = (i - Math.floor(numArrows / 2)) * spacing;
    for (let j = 0; j < numArrows; j++) {
      const z = (j - Math.floor(numArrows / 2)) * spacing;
      
      const arrow = createArrow(arrowLength, color, 0.2, 0.1, 0.02);
      arrow.position.set(x, 0, z);
      arrow.scale.set(0.5, 0.5, 0.5);
      group.add(arrow);
    }
  }
  
  return group;
}

/**
 * Updates the magnetic field arrows based on field strength.
 * @param arrowGroup - The group of magnetic field arrows
 * @param fieldStrength - Strength of the magnetic field (0-1)
 * @param time - Current simulation time for animation
 */
export function updateMagneticFieldArrows(
  arrowGroup: THREE.Group,
  fieldStrength: number,
  time: number
): void {
  const normalizedStrength = Math.max(0.1, Math.min(1, fieldStrength));
  const arrowScale = 0.5 * normalizedStrength;
  
  arrowGroup.children.forEach((arrow, index) => {
    // Scale arrows based on field strength
    arrow.scale.set(arrowScale, arrowScale, arrowScale);
    
    // Optional: Add subtle animation
    const offset = index * 0.1;
    const yOffset = Math.sin(time * 2 + offset) * 0.02;
    arrow.position.y = yOffset;
  });
}

/**
 * Creates arrows representing current flow.
 * @param length - Length of each arrow
 * @param color - Color of the arrows
 * @returns THREE.Group containing the current arrows
 */
export function createCurrentArrows(
  length: number = 1.0,
  color: number = 0xff0000
): THREE.Group {
  const group = new THREE.Group();
  const numArrows = 5;
  const spacing = 0.3;
  
  for (let i = 0; i < numArrows; i++) {
    const x = -1.0 + i * spacing;
    
    const arrow = createArrow(length, color, 0.15, 0.08, 0.02);
    arrow.position.set(x, 0, 0);
    arrow.rotation.z = Math.PI / 2; // Point in x direction
    group.add(arrow);
  }
  
  return group;
}

/**
 * Updates the current arrows based on current value.
 * @param arrowGroup - The group of current arrows
 * @param currentValue - Value of the current (0-1)
 * @param time - Current simulation time for animation
 */
export function updateCurrentArrows(
  arrowGroup: THREE.Group,
  currentValue: number,
  time: number
): void {
  const normalizedCurrent = Math.max(0.1, Math.min(1, currentValue));
  
  arrowGroup.children.forEach((arrow, index) => {
    // Scale arrows based on current
    const scale = 0.5 + 0.5 * normalizedCurrent;
    arrow.scale.set(scale, scale, scale);
    
    // Animate arrows to simulate current flow
    const basePosition = -1.0 + index * 0.3;
    const offset = (time * normalizedCurrent * 0.5) % 2;
    let newX = basePosition + offset;
    
    // Reset position when arrow moves out of range
    if (newX > 1.0) {
      newX = -1.0 + (newX - 1.0);
    }
    
    arrow.position.x = newX;
  });
}

/**
 * Creates an arrow representing the Lorentz force.
 * @param length - Length of the arrow
 * @param color - Color of the arrow
 * @returns THREE.Object3D containing the Lorentz force arrow
 */
export function createLorentzForceArrow(
  length: number = 0.8,
  color: number = 0x00ff00
): THREE.Object3D {
  const arrow = createArrow(length, color, 0.2, 0.1, 0.03);
  arrow.rotation.x = Math.PI / 2; // Point in z direction
  return arrow;
}

/**
 * Updates the Lorentz force arrow based on current and magnetic field values.
 * @param arrow - The Lorentz force arrow
 * @param currentValue - Value of the current (0-1) 
 * @param magneticFieldValue - Value of the magnetic field (0-1)
 */
export function updateLorentzForceArrow(
  arrow: THREE.Object3D,
  currentValue: number,
  magneticFieldValue: number
): void {
  const forceStrength = currentValue * magneticFieldValue;
  const normalizedForce = Math.max(0.1, Math.min(1, forceStrength));
  
  // Scale arrow based on force strength
  const scale = normalizedForce;
  arrow.scale.set(scale, scale, scale);
  
  // Optional: Change arrow visibility based on minimum threshold
  arrow.visible = forceStrength > 0.05;
} 