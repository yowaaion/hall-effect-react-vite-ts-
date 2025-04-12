import * as THREE from 'three';

/**
 * Parameters for magnetic field visualization
 */
export interface MagneticFieldParams {
  strength?: number;
  direction?: THREE.Vector3;
  size?: number; 
  density?: number;
  color?: number;
  opacity?: number;
  arrowScale?: number;
}

/**
 * Creates magnetic field arrows to visualize the field direction and strength
 * @param params Configuration parameters for the magnetic field
 * @returns Group containing the magnetic field arrows
 */
export function createMagneticFieldArrows(params: MagneticFieldParams = {}): THREE.Group {
  // Default parameters
  const {
    strength = 1,
    direction = new THREE.Vector3(0, 1, 0), // Default direction is Y-axis (up)
    size = 5,
    density = 2,
    color = 0x3333ff,
    opacity = 0.8,
    arrowScale = 0.5
  } = params;
  
  // Normalize direction
  const normalizedDirection = direction.clone().normalize();
  
  // Create group to hold all arrows
  const fieldGroup = new THREE.Group();
  
  // Calculate number of arrows based on density
  const count = Math.max(3, Math.floor(density * 3));
  
  // Create a grid of arrows
  const halfSize = size / 2;
  const step = size / count;
  
  // Create arrows throughout the volume
  for (let x = -halfSize; x <= halfSize; x += step) {
    for (let z = -halfSize; z <= halfSize; z += step) {
      // Skip some positions to create a less uniform appearance
      if (Math.random() > 0.7) continue;
      
      // Vary y positions for better distribution
      const yPositions = [
        -halfSize, 
        -halfSize / 2, 
        0, 
        halfSize / 2, 
        halfSize
      ];
      
      yPositions.forEach(y => {
        if (Math.random() > 0.7) return; // Skip some arrows randomly
        
        // Create arrow at this position
        const position = new THREE.Vector3(x, y, z);
        
        // Create arrow
        const arrow = createFieldArrow(
          position,
          normalizedDirection,
          strength * arrowScale,
          color,
          opacity
        );
        
        fieldGroup.add(arrow);
      });
    }
  }
  
  return fieldGroup;
}

/**
 * Creates a single magnetic field arrow
 * @param position Position of the arrow
 * @param direction Direction the arrow points
 * @param length Length of the arrow (based on field strength)
 * @param color Arrow color
 * @param opacity Arrow opacity
 * @returns Mesh representing the arrow
 */
function createFieldArrow(
  position: THREE.Vector3,
  direction: THREE.Vector3,
  length: number,
  color: number,
  opacity: number
): THREE.Mesh {
  // Create arrow geometry
  const arrowHeadHeight = length * 0.3;
  const arrowHeadRadius = length * 0.1;
  const shaftRadius = length * 0.03;
  
  // Create cylinder for arrow shaft
  const shaftGeometry = new THREE.CylinderGeometry(
    shaftRadius, 
    shaftRadius, 
    length - arrowHeadHeight, 
    8
  );
  
  // Create cone for arrow head
  const headGeometry = new THREE.ConeGeometry(
    arrowHeadRadius, 
    arrowHeadHeight, 
    8
  );
  
  // Create materials
  const material = new THREE.MeshStandardMaterial({
    color: color,
    transparent: opacity < 1,
    opacity: opacity,
    roughness: 0.5,
    metalness: 0.3
  });
  
  // Create meshes
  const shaft = new THREE.Mesh(shaftGeometry, material);
  const head = new THREE.Mesh(headGeometry, material);
  
  // Position shaft and head
  shaft.position.y = -arrowHeadHeight / 2;
  head.position.y = (length - arrowHeadHeight) / 2;
  
  // Create group for the arrow parts
  const arrow = new THREE.Group();
  arrow.add(shaft);
  arrow.add(head);
  
  // Center the arrow so it rotates around its center
  arrow.position.copy(position);
  
  // Orient arrow along the direction vector
  if (!direction.equals(new THREE.Vector3(0, 1, 0))) {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    arrow.setRotationFromQuaternion(quaternion);
  }
  
  // Convert group to a mesh for better performance
  const arrowMesh = new THREE.Mesh();
  
  // Create and return arrow mesh
  return arrow as unknown as THREE.Mesh;
}

/**
 * Creates magnetic field lines
 * @param params Configuration parameters
 * @returns Group containing the field lines
 */
export function createMagneticFieldLines(params: MagneticFieldParams = {}): THREE.Group {
  // Default parameters
  const {
    strength = 1,
    direction = new THREE.Vector3(0, 1, 0),
    size = 5,
    density = 2,
    color = 0x3333ff,
    opacity = 0.4
  } = params;
  
  // Normalize direction
  const normalizedDirection = direction.clone().normalize();
  
  // Create a group to hold all field lines
  const fieldLinesGroup = new THREE.Group();
  
  // Calculate number of field lines
  const count = Math.max(3, Math.round(density * 5));
  const halfSize = size / 2;
  
  // Create perpendicular plane to field direction
  const planeNormal = normalizedDirection.clone();
  
  // Find perpendicular vectors to define the plane
  const perpendicularA = new THREE.Vector3(1, 0, 0);
  if (Math.abs(planeNormal.dot(perpendicularA)) > 0.9) {
    perpendicularA.set(0, 1, 0);
  }
  
  // Cross products to get perpendicular vectors
  const perpendicularB = new THREE.Vector3().crossVectors(planeNormal, perpendicularA).normalize();
  perpendicularA.crossVectors(perpendicularB, planeNormal).normalize();
  
  // Generate field lines starting positions on a plane perpendicular to field
  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      // Skip some positions randomly
      if (Math.random() > 0.7) continue;
      
      // Calculate position on the plane
      const u = (i / (count - 1)) * 2 - 1; // Range: -1 to 1
      const v = (j / (count - 1)) * 2 - 1; // Range: -1 to 1
      
      // Create start position on the plane
      const startPosition = new THREE.Vector3()
        .addScaledVector(perpendicularA, u * halfSize)
        .addScaledVector(perpendicularB, v * halfSize)
        .addScaledVector(planeNormal, -halfSize * 1.5); // Offset to start before the volume
      
      // Create the field line
      const fieldLine = createFieldLine(
        startPosition,
        normalizedDirection,
        size * 3, // Make lines extend through the whole volume
        color,
        opacity,
        strength
      );
      
      fieldLinesGroup.add(fieldLine);
    }
  }
  
  return fieldLinesGroup;
}

/**
 * Creates a single field line
 * @param startPosition Start position of the line
 * @param direction Field direction
 * @param length Line length
 * @param color Line color
 * @param opacity Line opacity
 * @param strength Field strength (affects line appearance)
 * @returns Line mesh
 */
function createFieldLine(
  startPosition: THREE.Vector3,
  direction: THREE.Vector3,
  length: number,
  color: number,
  opacity: number,
  strength: number
): THREE.Line {
  // Number of points along the line
  const points = 100;
  
  // Create array for positions
  const positions = [];
  
  // Generate slightly wavy line along the direction
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const waviness = 0.05 * Math.sin(t * Math.PI * 10) * (1 - strength * 0.5);
    
    // Create slightly wavy lines
    const perpOffset = new THREE.Vector3(
      Math.sin(t * 5) * waviness,
      0,
      Math.cos(t * 5) * waviness
    );
    
    // Rotate offset to align with direction
    if (!direction.equals(new THREE.Vector3(0, 1, 0))) {
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      perpOffset.applyQuaternion(quaternion);
    }
    
    // Create point
    const point = startPosition.clone()
      .addScaledVector(direction, t * length)
      .add(perpOffset);
    
    positions.push(point.x, point.y, point.z);
  }
  
  // Create buffer geometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  
  // Create line material
  const material = new THREE.LineBasicMaterial({
    color: color,
    transparent: opacity < 1,
    opacity: opacity,
    linewidth: 1
  });
  
  // Create line
  const line = new THREE.Line(geometry, material);
  
  return line;
}

/**
 * Updates magnetic field visualization based on current field strength
 * @param fieldArrows Group containing field arrows
 * @param fieldLines Group containing field lines
 * @param strength New field strength value
 * @param color Optional color to update
 */
export function updateMagneticField(
  fieldArrows: THREE.Group,
  fieldLines: THREE.Group,
  strength: number,
  color?: number
): void {
  // Scale all arrows based on strength
  fieldArrows.children.forEach(child => {
    // Scale the arrow based on strength
    child.scale.set(1, strength, 1);
    
    // Update color if specified
    if (color !== undefined && child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshStandardMaterial;
      material.color.setHex(color);
    }
  });
  
  // Update field lines opacity based on strength
  fieldLines.children.forEach(child => {
    if (child instanceof THREE.Line) {
      const material = child.material as THREE.LineBasicMaterial;
      
      // Update opacity based on strength
      material.opacity = Math.max(0.1, Math.min(0.8, 0.4 * strength));
      
      // Update color if specified
      if (color !== undefined) {
        material.color.setHex(color);
      }
    }
  });
}

/**
 * Creates a visual indicator showing the Lorentz force calculation
 * @param params Configuration parameters
 * @returns Group containing the Lorentz force visualization
 */
export function createLorentzForceIndicator(params: MagneticFieldParams = {}): THREE.Group {
  // Default parameters
  const {
    strength = 1,
    direction = new THREE.Vector3(0, 1, 0),
    size = 2,
    color = 0x33ff33,
    opacity = 0.8
  } = params;
  
  const group = new THREE.Group();
  
  // Create a vector for the magnetic field (B)
  const fieldVector = createVectorArrow(
    new THREE.Vector3(0, 0, 0),
    direction.clone().normalize().multiplyScalar(size),
    0x3333ff, // Blue for magnetic field
    'B'
  );
  
  // Create a vector for the current (I or v)
  const currentVector = createVectorArrow(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(size, 0, 0), // Current flowing in X direction
    0xff3333, // Red for current
    'v'
  );
  
  // Calculate Lorentz force direction (F = q(v × B))
  const forceDirection = new THREE.Vector3().crossVectors(
    new THREE.Vector3(1, 0, 0), // Current direction (v)
    direction.normalize() // Magnetic field direction (B)
  ).normalize();
  
  // Create a vector for the force (F)
  const forceVector = createVectorArrow(
    new THREE.Vector3(0, 0, 0),
    forceDirection.multiplyScalar(size * strength),
    color, // Green for force
    'F'
  );
  
  // Add vectors to group
  group.add(fieldVector);
  group.add(currentVector);
  group.add(forceVector);
  
  // Position the group
  group.position.set(0, size / 2, 0);
  
  return group;
}

/**
 * Creates a vector arrow with label for force diagrams
 * @param origin Origin point of the vector
 * @param direction Direction and magnitude of the vector
 * @param color Arrow color
 * @param label Text label for the vector
 * @returns Group containing the arrow and label
 */
function createVectorArrow(
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  color: number,
  label: string
): THREE.Group {
  const group = new THREE.Group();
  
  // Calculate arrow properties
  const length = direction.length();
  const arrowDir = direction.clone().normalize();
  
  // Create arrow geometry
  const arrowHeadHeight = length * 0.2;
  const arrowHeadRadius = length * 0.05;
  const shaftRadius = length * 0.02;
  
  // Create cylinder for arrow shaft
  const shaftGeometry = new THREE.CylinderGeometry(
    shaftRadius, 
    shaftRadius, 
    length - arrowHeadHeight, 
    8
  );
  
  // Create cone for arrow head
  const headGeometry = new THREE.ConeGeometry(
    arrowHeadRadius, 
    arrowHeadHeight, 
    8
  );
  
  // Create materials
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.5,
    metalness: 0.3
  });
  
  // Create meshes
  const shaft = new THREE.Mesh(shaftGeometry, material);
  const head = new THREE.Mesh(headGeometry, material);
  
  // Create arrow group
  const arrow = new THREE.Group();
  
  // Position shaft and head
  shaft.position.y = (length - arrowHeadHeight) / 2;
  head.position.y = length - arrowHeadHeight / 2;
  
  // Add to arrow group
  arrow.add(shaft);
  arrow.add(head);
  
  // Orient arrow along the direction vector
  if (!arrowDir.equals(new THREE.Vector3(0, 1, 0))) {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), arrowDir);
    arrow.setRotationFromQuaternion(quaternion);
  }
  
  // Position arrow at origin
  arrow.position.copy(origin);
  
  // Add to main group
  group.add(arrow);
  
  // In a real implementation, you would add a text label here
  // This is a placeholder for the label
  const labelPlaceholder = new THREE.Mesh(
    new THREE.SphereGeometry(0.05),
    new THREE.MeshBasicMaterial({ color: color })
  );
  
  // Position the label at the end of the arrow
  labelPlaceholder.position.copy(direction.clone().multiplyScalar(1.1));
  labelPlaceholder.userData.label = label;
  
  group.add(labelPlaceholder);
  
  return group;
} 