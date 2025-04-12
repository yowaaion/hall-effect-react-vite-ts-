import * as THREE from 'three';
import { VISUAL, PHYSICS } from '../../config/constants';

/**
 * Parameters for semiconductor visualization
 */
export interface SemiconductorParams {
  width?: number;
  height?: number;
  depth?: number;
  color?: number;
  opacity?: number;
  isTransparent?: boolean;
  dopingType?: 'n' | 'p';
  dopingLevel?: number;
  wireframe?: boolean;
}

/**
 * Creates a semiconductor visualization
 * @param params Configuration parameters
 * @returns Group containing the semiconductor visualization
 */
export function createSemiconductor(params: SemiconductorParams = {}): THREE.Group {
  // Default parameters
  const {
    width = 4,
    height = 1,
    depth = 1,
    color = 0x4080ff,  // Default blue color
    opacity = 0.7,
    isTransparent = true,
    dopingType = 'n',
    dopingLevel = 0.5,
    wireframe = false
  } = params;
  
  // Create group to hold all semiconductor elements
  const semiconductorGroup = new THREE.Group();
  
  // Create the main semiconductor block
  const mainBlock = createSemiconductorBlock(
    width,
    height,
    depth,
    color,
    opacity,
    isTransparent,
    wireframe
  );
  
  // Add main block to group
  semiconductorGroup.add(mainBlock);
  
  // Add doping visualization if needed
  if (dopingLevel > 0) {
    const dopingVisualization = createDopingVisualization(
      width,
      height,
      depth,
      dopingType,
      dopingLevel
    );
    semiconductorGroup.add(dopingVisualization);
  }
  
  // Add electrode contacts for Hall effect measurements
  const electrodes = createElectrodes(width, height, depth);
  semiconductorGroup.add(electrodes);
  
  return semiconductorGroup;
}

/**
 * Creates the main semiconductor block
 * @param width Width of the semiconductor
 * @param height Height of the semiconductor
 * @param depth Depth of the semiconductor
 * @param color Color of the semiconductor
 * @param opacity Opacity of the semiconductor
 * @param isTransparent Whether the semiconductor is transparent
 * @param wireframe Whether to display the semiconductor as wireframe
 * @returns Mesh representing the semiconductor block
 */
function createSemiconductorBlock(
  width: number,
  height: number,
  depth: number,
  color: number,
  opacity: number,
  isTransparent: boolean,
  wireframe: boolean
): THREE.Mesh {
  // Create geometry
  const geometry = new THREE.BoxGeometry(width, height, depth);
  
  // Create material
  const material = new THREE.MeshPhysicalMaterial({
    color: color,
    transparent: isTransparent,
    opacity: opacity,
    roughness: 0.3,
    metalness: 0.1,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
    wireframe: wireframe
  });
  
  // Create mesh
  const semiconductor = new THREE.Mesh(geometry, material);
  
  return semiconductor;
}

/**
 * Creates a visualization of doping in the semiconductor
 * @param width Width of the semiconductor
 * @param height Height of the semiconductor
 * @param depth Depth of the semiconductor
 * @param dopingType Type of doping ('n' or 'p')
 * @param dopingLevel Level of doping (0-1)
 * @returns Group containing doping visualization
 */
function createDopingVisualization(
  width: number,
  height: number,
  depth: number,
  dopingType: 'n' | 'p',
  dopingLevel: number
): THREE.Group {
  const dopingGroup = new THREE.Group();
  
  // Determine doping parameters
  const dopingColor = dopingType === 'n' ? 0x3366ff : 0xff6666; // Blue for n, Red for p
  const dopingDensity = Math.max(5, Math.round(dopingLevel * 30)); // Number of dopant atoms
  
  // Create dopant atoms
  for (let i = 0; i < dopingDensity; i++) {
    // Create a small sphere representing a dopant atom
    const radius = 0.05 + Math.random() * 0.03;
    const sphereGeometry = new THREE.SphereGeometry(radius, 8, 8);
    
    // Create material with slight emission for better visibility
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: dopingColor,
      emissive: dopingColor,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.8,
      shininess: 70
    });
    
    const dopant = new THREE.Mesh(sphereGeometry, sphereMaterial);
    
    // Position dopant randomly within the semiconductor
    dopant.position.set(
      (Math.random() - 0.5) * width * 0.9,
      (Math.random() - 0.5) * height * 0.9,
      (Math.random() - 0.5) * depth * 0.9
    );
    
    // Add to group
    dopingGroup.add(dopant);
  }
  
  // For p-type, add some electron holes (visually represented as small semi-transparent spheres)
  if (dopingType === 'p') {
    const holeCount = Math.max(3, Math.round(dopingLevel * 15));
    
    for (let i = 0; i < holeCount; i++) {
      const holeGeometry = new THREE.SphereGeometry(0.07, 8, 8);
      const holeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        wireframe: true
      });
      
      const hole = new THREE.Mesh(holeGeometry, holeMaterial);
      
      // Position holes randomly within the semiconductor
      hole.position.set(
        (Math.random() - 0.5) * width * 0.8,
        (Math.random() - 0.5) * height * 0.8,
        (Math.random() - 0.5) * depth * 0.8
      );
      
      dopingGroup.add(hole);
    }
  }
  
  return dopingGroup;
}

/**
 * Creates Hall effect electrode contacts (side contacts for measuring Hall voltage)
 * @param width Width of the semiconductor
 * @param height Height of the semiconductor
 * @param depth Depth of the semiconductor
 * @returns Group containing electrode contacts
 */
function createElectrodes(
  width: number,
  height: number,
  depth: number
): THREE.Group {
  const electrodesGroup = new THREE.Group();
  
  // Size of electrodes
  const electrodeWidth = 0.2;
  const electrodeHeight = height * 0.6;
  const electrodeDepth = 0.1;
  
  // Create electrode geometry
  const electrodeGeometry = new THREE.BoxGeometry(
    electrodeWidth,
    electrodeHeight,
    electrodeDepth
  );
  
  // Create material for electrodes
  const electrodeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xcccccc, // Silver color
    metalness: 0.9,
    roughness: 0.1,
    reflectivity: 0.9
  });
  
  // Create left electrode (for Hall voltage measurement)
  const leftElectrode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  leftElectrode.position.set(0, 0, -depth / 2 - electrodeDepth / 2);
  
  // Create right electrode (for Hall voltage measurement)
  const rightElectrode = new THREE.Mesh(electrodeGeometry, electrodeMaterial);
  rightElectrode.position.set(0, 0, depth / 2 + electrodeDepth / 2);
  
  // Add the electrodes to the group
  electrodesGroup.add(leftElectrode);
  electrodesGroup.add(rightElectrode);
  
  return electrodesGroup;
}

/**
 * Creates a current path visualization inside the semiconductor
 * @param params Semiconductor parameters
 * @param currentDirection Direction of the current flow
 * @returns Group containing the current path visualization
 */
export function createCurrentPath(
  params: SemiconductorParams = {},
  currentDirection: THREE.Vector3 = new THREE.Vector3(1, 0, 0)
): THREE.Group {
  // Default parameters
  const {
    width = 4,
    height = 1,
    depth = 1
  } = params;
  
  const pathGroup = new THREE.Group();
  
  // Create a line showing the current path through the semiconductor
  const points = [];
  
  // Normalize current direction
  const normalizedDirection = currentDirection.clone().normalize();
  
  // Calculate start and end points based on semiconductor dimensions and current direction
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDepth = depth / 2;
  
  // Start point at the negative end of the semiconductor
  const startPoint = new THREE.Vector3(
    -halfWidth * normalizedDirection.x,
    0,
    0
  );
  
  // End point at the positive end of the semiconductor
  const endPoint = new THREE.Vector3(
    halfWidth * normalizedDirection.x,
    0,
    0
  );
  
  // Create a curve for more visual interest
  const curvePoints = 10;
  for (let i = 0; i < curvePoints; i++) {
    const t = i / (curvePoints - 1);
    
    // Interpolate between start and end points
    const point = new THREE.Vector3().lerpVectors(startPoint, endPoint, t);
    
    // Add small sinusoidal variation to make it look like a flowing current
    point.y += Math.sin(t * Math.PI * 2) * 0.1;
    
    points.push(point);
  }
  
  // Create geometry
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  // Create material with glow and animation
  const material = new THREE.LineDashedMaterial({
    color: 0x33aaff,
    dashSize: 0.2,
    gapSize: 0.1,
    opacity: 0.8,
    transparent: true
  });
  
  // Create line
  const currentPath = new THREE.Line(geometry, material);
  currentPath.computeLineDistances(); // Required for dashed lines
  
  // Add to group
  pathGroup.add(currentPath);
  
  return pathGroup;
}

/**
 * Updates the semiconductor visualization based on parameters
 * @param semiconductor Group containing the semiconductor visualization
 * @param params New parameters to apply
 */
export function updateSemiconductor(
  semiconductor: THREE.Group,
  params: Partial<SemiconductorParams> = {}
): void {
  // Skip if no semiconductor group
  if (!semiconductor) return;
  
  // Update material properties if main block exists
  if (semiconductor.children.length > 0) {
    const mainBlock = semiconductor.children[0] as THREE.Mesh;
    const material = mainBlock.material as THREE.MeshPhysicalMaterial;
    
    // Update color if specified
    if (params.color !== undefined) {
      material.color.setHex(params.color);
    }
    
    // Update opacity if specified
    if (params.opacity !== undefined) {
      material.opacity = params.opacity;
      material.transparent = params.opacity < 1;
    }
    
    // Update wireframe mode if specified
    if (params.wireframe !== undefined) {
      material.wireframe = params.wireframe;
    }
  }
}

/**
 * Creates a band diagram to illustrate semiconductor physics
 * @param params Configuration parameters
 * @param hallEffect Whether to show Hall Effect in the band diagram
 * @returns Group containing the band diagram
 */
export function createBandDiagram(
  params: SemiconductorParams = {},
  hallEffect: boolean = false
): THREE.Group {
  // Default parameters
  const {
    width = 2,
    height = 1,
    dopingType = 'n',
    dopingLevel = 0.5
  } = params;
  
  const diagramGroup = new THREE.Group();
  
  // Create band lines
  const conductionBand = createBandLine(
    width,
    dopingType === 'n' ? -0.3 - dopingLevel * 0.2 : -0.3,
    0x3399ff, // Blue for conduction band
    hallEffect
  );
  
  const valenceBand = createBandLine(
    width,
    dopingType === 'p' ? -0.8 + dopingLevel * 0.2 : -0.8,
    0xff6666, // Red for valence band
    hallEffect
  );
  
  // Create Fermi level
  const fermiLevel = createFermiLine(
    width,
    dopingType === 'n' 
      ? -0.3 - dopingLevel * 0.1 - 0.1 
      : -0.8 + dopingLevel * 0.1 + 0.1,
    0x33cc33 // Green for Fermi level
  );
  
  // Create labels
  const bandLabels = createBandLabels(width, height);
  
  // Add all elements to the group
  diagramGroup.add(conductionBand);
  diagramGroup.add(valenceBand);
  diagramGroup.add(fermiLevel);
  diagramGroup.add(bandLabels);
  
  // Position the diagram
  diagramGroup.position.set(0, -height * 0.8, 0);
  diagramGroup.scale.set(0.5, 0.5, 0.5);
  
  return diagramGroup;
}

/**
 * Creates a band line for the band diagram
 * @param width Width of the line
 * @param yPosition Vertical position of the line
 * @param color Color of the line
 * @param hallEffect Whether to show Hall Effect (tilting)
 * @returns Line mesh
 */
function createBandLine(
  width: number,
  yPosition: number,
  color: number,
  hallEffect: boolean
): THREE.Line {
  // Create points
  const points = [];
  
  // Number of segments to use for the line
  const segments = 20;
  
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * width - width / 2;
    
    // Calculate y position with potential tilt for Hall effect
    let y = yPosition;
    
    if (hallEffect) {
      // Add tilt to show band bending due to Hall effect
      const tiltFactor = 0.2;
      y += Math.abs(x) * tiltFactor * (x > 0 ? 1 : -1);
    }
    
    points.push(new THREE.Vector3(x, y, 0));
  }
  
  // Create geometry
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  // Create material
  const material = new THREE.LineBasicMaterial({
    color: color,
    linewidth: 2
  });
  
  // Create line
  const line = new THREE.Line(geometry, material);
  
  return line;
}

/**
 * Creates the Fermi level line for band diagram
 * @param width Width of the line
 * @param yPosition Vertical position of the line
 * @param color Color of the line
 * @returns Line mesh
 */
function createFermiLine(
  width: number,
  yPosition: number,
  color: number
): THREE.Line {
  // Create points
  const points = [];
  
  // Create dashed line effect
  const segments = 10;
  const dashLength = width / segments / 2;
  
  for (let i = 0; i < segments; i++) {
    // Calculate start and end of this dash
    const startX = (i / segments) * width - width / 2;
    const endX = startX + dashLength;
    
    // Add points for this dash
    points.push(new THREE.Vector3(startX, yPosition, 0));
    points.push(new THREE.Vector3(endX, yPosition, 0));
  }
  
  // Create geometry
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  // Create material
  const material = new THREE.LineBasicMaterial({
    color: color,
    linewidth: 2
  });
  
  // Create line
  const line = new THREE.Line(geometry, material);
  
  return line;
}

/**
 * Creates labels for the band diagram
 * @param width Width of the diagram
 * @param height Height of the diagram
 * @returns Group containing label planes
 */
function createBandLabels(width: number, height: number): THREE.Group {
  // This is a placeholder for actual text implementation
  // In a real scenario, you would use TextGeometry or HTML overlays
  // Here we just create colored planes as indicators
  
  const labelsGroup = new THREE.Group();
  
  // Create a simple placeholder for the conduction band label
  const cbLabelGeometry = new THREE.PlaneGeometry(0.5, 0.1);
  const cbLabelMaterial = new THREE.MeshBasicMaterial({
    color: 0x3399ff, // Blue for conduction band
    transparent: true,
    opacity: 0.7
  });
  
  const cbLabel = new THREE.Mesh(cbLabelGeometry, cbLabelMaterial);
  cbLabel.position.set(-width / 2 - 0.3, -0.3, 0);
  
  // Create a simple placeholder for the valence band label
  const vbLabelGeometry = new THREE.PlaneGeometry(0.5, 0.1);
  const vbLabelMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6666, // Red for valence band
    transparent: true,
    opacity: 0.7
  });
  
  const vbLabel = new THREE.Mesh(vbLabelGeometry, vbLabelMaterial);
  vbLabel.position.set(-width / 2 - 0.3, -0.8, 0);
  
  // Create a simple placeholder for the Fermi level label
  const flLabelGeometry = new THREE.PlaneGeometry(0.5, 0.1);
  const flLabelMaterial = new THREE.MeshBasicMaterial({
    color: 0x33cc33, // Green for Fermi level
    transparent: true,
    opacity: 0.7
  });
  
  const flLabel = new THREE.Mesh(flLabelGeometry, flLabelMaterial);
  flLabel.position.set(-width / 2 - 0.3, -0.55, 0);
  
  // Add labels to group
  labelsGroup.add(cbLabel);
  labelsGroup.add(vbLabel);
  labelsGroup.add(flLabel);
  
  return labelsGroup;
} 