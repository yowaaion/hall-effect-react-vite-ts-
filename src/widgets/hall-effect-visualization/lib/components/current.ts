import * as THREE from 'three';

/**
 * Parameters for current flow visualization
 */
export interface CurrentParams {
  strength?: number;
  direction?: THREE.Vector3;
  width?: number;
  depth?: number;
  height?: number;
  color?: number;
  opacity?: number;
  arrowScale?: number;
  arrowCount?: number;
}

/**
 * Creates a visualization of electric current with flowing arrows
 * @param params Configuration parameters
 * @returns Group containing the current visualization
 */
export function createCurrentFlow(params: CurrentParams = {}): THREE.Group {
  // Default parameters
  const {
    strength = 1,
    direction = new THREE.Vector3(1, 0, 0), // Default X-axis
    width = 4,
    depth = 1,
    height = 1,
    color = 0xff3333, // Red for current
    opacity = 0.8,
    arrowScale = 0.3,
    arrowCount = 5
  } = params;
  
  // Create group to hold all current visualization elements
  const currentGroup = new THREE.Group();
  
  // Create the flow arrows
  const flowArrows = createFlowArrows(
    direction,
    width,
    height,
    depth,
    color,
    arrowScale,
    arrowCount,
    strength
  );
  
  currentGroup.add(flowArrows);
  
  return currentGroup;
}

/**
 * Creates arrows indicating current flow direction
 * @param direction Flow direction
 * @param width Width of flow area
 * @param height Height of flow area
 * @param depth Depth of flow area
 * @param color Arrow color
 * @param scale Arrow scale factor
 * @param count Number of arrows
 * @param strength Current strength (affects arrow size)
 * @returns Group containing flow arrows
 */
function createFlowArrows(
  direction: THREE.Vector3,
  width: number,
  height: number,
  depth: number,
  color: number,
  scale: number,
  count: number,
  strength: number
): THREE.Group {
  const arrowsGroup = new THREE.Group();
  
  // Normalize direction
  const normalizedDirection = direction.clone().normalize();
  
  // Calculate arrow size based on current strength and scale
  const arrowSize = Math.max(0.1, scale * Math.min(1.5, strength));
  
  // Create arrows along the flow path
  for (let i = 0; i < count; i++) {
    // Position along the flow path (normalized from 0 to 1)
    const position = i / (count - 1);
    
    // Create arrow
    const arrow = createFlowArrow(normalizedDirection, arrowSize, color);
    
    // Calculate position based on direction and path width
    // This positions arrows along a line through the center of the flow area
    const arrowPosition = new THREE.Vector3()
      .addScaledVector(normalizedDirection, (position - 0.5) * width);
    
    // Add slight randomness to y and z position for more natural appearance
    const randomOffset = new THREE.Vector3(
      0,
      (Math.random() - 0.5) * height * 0.6,
      (Math.random() - 0.5) * depth * 0.6
    );
    
    // Apply position
    arrow.position.copy(arrowPosition).add(randomOffset);
    
    // Add to group
    arrowsGroup.add(arrow);
  }
  
  return arrowsGroup;
}

/**
 * Creates a single flow arrow for current visualization
 * @param direction Flow direction
 * @param size Arrow size
 * @param color Arrow color
 * @returns Mesh representing the flow arrow
 */
function createFlowArrow(
  direction: THREE.Vector3,
  size: number,
  color: number
): THREE.Group {
  // Create arrow geometry
  const headLength = size * 0.3;
  const headWidth = size * 0.2;
  const shaftLength = size;
  const shaftWidth = size * 0.05;
  
  // Create arrow parts
  const shaftGeometry = new THREE.BoxGeometry(shaftLength, shaftWidth, shaftWidth);
  const headGeometry = new THREE.ConeGeometry(headWidth, headLength, 8);
  
  // Create material
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.4,
    metalness: 0.6,
    transparent: true,
    opacity: 0.9
  });
  
  // Create meshes
  const shaft = new THREE.Mesh(shaftGeometry, material);
  const head = new THREE.Mesh(headGeometry, material);
  
  // Position parts
  shaft.position.x = 0;
  head.position.x = shaftLength / 2 + headLength / 2;
  
  // Create group and add parts
  const arrow = new THREE.Group();
  arrow.add(shaft);
  arrow.add(head);
  
  // Rotate arrow to point in the direction
  if (!direction.equals(new THREE.Vector3(1, 0, 0))) {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction);
    arrow.setRotationFromQuaternion(quaternion);
  }
  
  return arrow;
}

/**
 * Creates electron particles for current flow animation
 * @param params Configuration parameters
 * @returns Group containing electron particles
 */
export function createElectrons(params: CurrentParams = {}): THREE.Group {
  // Default parameters
  const {
    strength = 1,
    direction = new THREE.Vector3(1, 0, 0),
    width = 4,
    depth = 1,
    height = 1,
    color = 0x3399ff, // Blue for electrons
    opacity = 0.8
  } = params;
  
  // Create group for electrons
  const electronsGroup = new THREE.Group();
  
  // Calculate number of electrons based on current strength
  const electronCount = Math.max(5, Math.round(strength * 15));
  
  // Create electrons
  for (let i = 0; i < electronCount; i++) {
    const electron = createElectron(color, opacity);
    
    // Position electrons randomly within the semiconductor volume
    electron.position.set(
      (Math.random() - 0.5) * width,
      (Math.random() - 0.5) * height,
      (Math.random() - 0.5) * depth
    );
    
    // Add direction and speed information for animation
    electron.userData.direction = direction.clone();
    electron.userData.speed = 0.02 + Math.random() * 0.03 * strength;
    
    // Add to group
    electronsGroup.add(electron);
  }
  
  return electronsGroup;
}

/**
 * Creates a single electron particle
 * @param color Electron color
 * @param opacity Electron opacity
 * @returns Mesh representing an electron
 */
function createElectron(color: number, opacity: number): THREE.Mesh {
  // Create geometry
  const geometry = new THREE.SphereGeometry(0.08, 8, 8);
  
  // Create material with glow effect
  const material = new THREE.MeshPhongMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: opacity,
    shininess: 90
  });
  
  // Create mesh
  const electron = new THREE.Mesh(geometry, material);
  
  return electron;
}

/**
 * Updates electrons position for animation
 * @param electrons Group containing electron particles
 * @param deltaTime Time since last update
 * @param bounds Bounds object defining the area electrons can move in
 * @param magneticField Magnetic field direction and strength
 */
export function updateElectrons(
  electrons: THREE.Group,
  deltaTime: number,
  bounds: { width: number; height: number; depth: number },
  magneticField?: { direction: THREE.Vector3; strength: number }
): void {
  electrons.children.forEach(electron => {
    // Get electron data
    const speed = electron.userData.speed || 0.05;
    const direction = electron.userData.direction || new THREE.Vector3(1, 0, 0);
    
    // Apply magnetic field effect (Lorentz force) if present
    if (magneticField && magneticField.strength > 0) {
      // F = q(v × B) - calculate force direction
      const magneticDirection = magneticField.direction.clone().normalize();
      const forceDirection = new THREE.Vector3().crossVectors(direction, magneticDirection);
      
      // Apply force to velocity (simplified physics)
      const deflection = forceDirection.multiplyScalar(magneticField.strength * 0.05);
      direction.add(deflection);
      direction.normalize(); // Keep as unit vector
      
      // Store updated direction
      electron.userData.direction = direction;
    }
    
    // Move electron
    electron.position.addScaledVector(direction, speed * deltaTime * 60);
    
    // Check bounds and wrap around if needed
    const halfWidth = bounds.width / 2;
    const halfHeight = bounds.height / 2;
    const halfDepth = bounds.depth / 2;
    
    // X bounds
    if (electron.position.x > halfWidth) {
      electron.position.x = -halfWidth;
    } else if (electron.position.x < -halfWidth) {
      electron.position.x = halfWidth;
    }
    
    // Y bounds
    if (electron.position.y > halfHeight) {
      electron.position.y = -halfHeight;
    } else if (electron.position.y < -halfHeight) {
      electron.position.y = halfHeight;
    }
    
    // Z bounds
    if (electron.position.z > halfDepth) {
      electron.position.z = -halfDepth;
    } else if (electron.position.z < -halfDepth) {
      electron.position.z = halfDepth;
    }
  });
}

/**
 * Creates a visual representation of the Hall voltage buildup
 * @param params Configuration parameters
 * @returns Group containing the Hall voltage visualization
 */
export function createHallVoltage(params: CurrentParams = {}): THREE.Group {
  // Default parameters
  const {
    strength = 1,
    width = 4,
    height = 1,
    depth = 1,
    color = 0x33cccc // Cyan for Hall voltage
  } = params;
  
  // Create group
  const voltageGroup = new THREE.Group();
  
  // Only create visualization if there's a significant voltage
  if (strength > 0.1) {
    // Create positive charge buildup (right side)
    const positiveCharges = createChargeBuildup(
      new THREE.Vector3(0, 0, depth / 2), // Right side of semiconductor
      Math.min(1, strength),
      0xff5555, // Red for positive
      Math.ceil(strength * 5)
    );
    
    // Create negative charge buildup (left side)
    const negativeCharges = createChargeBuildup(
      new THREE.Vector3(0, 0, -depth / 2), // Left side of semiconductor
      Math.min(1, strength),
      0x5555ff, // Blue for negative
      Math.ceil(strength * 5)
    );
    
    // Add to group
    voltageGroup.add(positiveCharges);
    voltageGroup.add(negativeCharges);
    
    // Add a line representing the electric field created by the Hall voltage
    const fieldLine = createHallField(width, height, depth, color, strength);
    voltageGroup.add(fieldLine);
  }
  
  return voltageGroup;
}

/**
 * Creates a visual representation of charge buildup on one side
 * @param position Central position of the charge buildup
 * @param strength Strength of the charge effect
 * @param color Color of the charges
 * @param count Number of charge indicators
 * @returns Group containing the charge visualization
 */
function createChargeBuildup(
  position: THREE.Vector3,
  strength: number,
  color: number,
  count: number
): THREE.Group {
  const chargeGroup = new THREE.Group();
  
  // Create charge indicators
  for (let i = 0; i < count; i++) {
    // Create a small sphere representing charge
    const chargeGeometry = new THREE.SphereGeometry(0.05 * strength, 8, 8);
    const chargeMaterial = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });
    
    const charge = new THREE.Mesh(chargeGeometry, chargeMaterial);
    
    // Position charges in a small area around the central position
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.1
    );
    
    charge.position.copy(position).add(offset);
    
    // Add to group
    chargeGroup.add(charge);
  }
  
  return chargeGroup;
}

/**
 * Creates a visual representation of the Hall electric field
 * @param width Width of the semiconductor
 * @param height Height of the semiconductor
 * @param depth Depth of the semiconductor
 * @param color Color of the field line
 * @param strength Strength of the Hall effect
 * @returns Line representing the Hall field
 */
function createHallField(
  width: number,
  height: number,
  depth: number,
  color: number,
  strength: number
): THREE.Line {
  // Create points for the line
  const points = [];
  
  // Create a line going from positive to negative side
  points.push(new THREE.Vector3(0, 0, depth / 2)); // Start at positive side
  points.push(new THREE.Vector3(0, 0, -depth / 2)); // End at negative side
  
  // Create geometry
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  // Create dashed line material
  const material = new THREE.LineDashedMaterial({
    color: color,
    dashSize: 0.1,
    gapSize: 0.05,
    linewidth: 2,
    transparent: true,
    opacity: Math.min(0.8, strength)
  });
  
  // Create line
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances(); // Required for dashed lines
  
  // Position line
  const halfHeight = height / 2;
  line.position.set(0, halfHeight * 0.8, 0); // Position near the top
  
  return line;
}

/**
 * Updates Hall voltage visualization based on strength
 * @param hallVoltage Group containing Hall voltage visualization
 * @param strength New strength value
 * @param color Optional color to update
 */
export function updateHallVoltage(
  hallVoltage: THREE.Group,
  strength: number,
  color?: number
): void {
  // Skip if no Hall voltage group or too weak effect
  if (!hallVoltage || strength < 0.1) return;
  
  // Update opacity of all elements based on strength
  hallVoltage.traverse(child => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshPhongMaterial;
      material.opacity = Math.min(0.8, strength);
      
      // Update color if specified
      if (color !== undefined) {
        material.color.setHex(color);
        material.emissive.setHex(color);
      }
    } else if (child instanceof THREE.Line) {
      const material = child.material as THREE.LineDashedMaterial;
      material.opacity = Math.min(0.8, strength);
      
      // Update color if specified
      if (color !== undefined) {
        material.color.setHex(color);
      }
    }
  });
} 