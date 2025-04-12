import * as THREE from 'three';

/**
 * Creates a ground plane for the scene
 * @param size Size of the ground plane
 * @param color Ground color
 * @returns Ground plane mesh
 */
export function createGround(size: number = 10, color: number = 0xeeeeee): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.8,
    metalness: 0,
    side: THREE.DoubleSide
  });
  
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  ground.receiveShadow = true;
  
  return ground;
}

/**
 * Creates a grid overlay for the ground
 * @param size Size of the grid
 * @param divisions Number of grid divisions
 * @param mainColor Main grid lines color
 * @param secondaryColor Secondary grid lines color
 * @returns Grid helper object
 */
export function createGrid(
  size: number = 10,
  divisions: number = 10,
  mainColor: number = 0x888888,
  secondaryColor: number = 0xcccccc
): THREE.GridHelper {
  const grid = new THREE.GridHelper(size, divisions, mainColor, secondaryColor);
  grid.position.y = 0.01; // Slightly above ground to avoid z-fighting
  return grid;
}

/**
 * Configuration parameters for scene lighting
 */
interface LightingParams {
  ambientIntensity?: number;
  directionalIntensity?: number;
  directionalPosition?: THREE.Vector3;
  pointLightIntensity?: number;
  pointLightPositions?: THREE.Vector3[];
  castShadows?: boolean;
}

/**
 * Creates lighting for the scene
 * @param params Lighting configuration parameters
 * @returns Group containing all light objects
 */
export function createLighting(params: LightingParams = {}): THREE.Group {
  // Default parameters
  const {
    ambientIntensity = 0.4,
    directionalIntensity = 0.6,
    directionalPosition = new THREE.Vector3(5, 8, 3),
    pointLightIntensity = 0.4,
    pointLightPositions = [
      new THREE.Vector3(-3, 2, -3),
      new THREE.Vector3(3, 2, 3)
    ],
    castShadows = true
  } = params;
  
  const lights = new THREE.Group();
  
  // Ambient light (general scene illumination)
  const ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
  lights.add(ambientLight);
  
  // Main directional light (sun-like, casts shadows)
  const directionalLight = new THREE.DirectionalLight(0xffffff, directionalIntensity);
  directionalLight.position.copy(directionalPosition);
  
  if (castShadows) {
    // Configure shadows for directional light
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 30;
    
    // Set appropriate shadow camera frustum
    const shadowSize = 7;
    directionalLight.shadow.camera.left = -shadowSize;
    directionalLight.shadow.camera.right = shadowSize;
    directionalLight.shadow.camera.top = shadowSize;
    directionalLight.shadow.camera.bottom = -shadowSize;
    
    // Improve shadow quality
    directionalLight.shadow.bias = -0.0005;
  }
  
  lights.add(directionalLight);
  
  // Add point lights for additional illumination
  pointLightPositions.forEach(position => {
    const pointLight = new THREE.PointLight(0xffffff, pointLightIntensity, 10);
    pointLight.position.copy(position);
    
    if (castShadows) {
      pointLight.castShadow = true;
      pointLight.shadow.mapSize.width = 512;
      pointLight.shadow.mapSize.height = 512;
    }
    
    lights.add(pointLight);
  });
  
  return lights;
}

/**
 * Creates a skybox for the scene background
 * @param color Skybox color (if not using cubemap)
 * @returns Scene background
 */
export function createSkybox(color: number = 0xd0e0f0): THREE.Color {
  // Simple color background
  // For more complex skyboxes, you would use a CubeTexture here
  return new THREE.Color(color);
}

/**
 * Creates a set of coordinate axes for reference
 * @param size Size of the axes
 * @returns Axes helper object
 */
export function createAxes(size: number = 5): THREE.AxesHelper {
  const axes = new THREE.AxesHelper(size);
  // X is red, Y is green, Z is blue
  return axes;
}

/**
 * Creates a fog effect for the scene
 * @param color Fog color
 * @param near Distance at which fog starts
 * @param far Distance at which fog is fully opaque
 * @returns Fog object
 */
export function createFog(
  color: number = 0xffffff, 
  near: number = 7, 
  far: number = 20
): THREE.Fog {
  return new THREE.Fog(color, near, far);
}

/**
 * Creates labels for the axes
 * @returns Group containing text meshes for axis labels
 */
export function createAxisLabels(): THREE.Group {
  const labels = new THREE.Group();
  
  // This would typically use a TextGeometry or HTML/CSS overlay
  // For simplicity, we'll just use placeholder objects here
  // In a real implementation, you'd use either:
  // 1. THREE.TextGeometry with a font
  // 2. CSS2DRenderer for HTML overlays
  // 3. Sprite with a canvas texture
  
  const createLabel = (text: string, position: THREE.Vector3, color: number): THREE.Mesh => {
    // This is a placeholder - in a real implementation you'd use text
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({ color });
    const label = new THREE.Mesh(geometry, material);
    label.position.copy(position);
    label.userData.text = text;
    return label;
  };
  
  // Create labels for each axis
  labels.add(createLabel('X', new THREE.Vector3(5.2, 0, 0), 0xff0000));
  labels.add(createLabel('Y', new THREE.Vector3(0, 5.2, 0), 0x00ff00));
  labels.add(createLabel('Z', new THREE.Vector3(0, 0, 5.2), 0x0000ff));
  
  return labels;
}

/**
 * Creates a floating info panel for displaying values
 * @returns Group containing the info panel objects
 */
export function createInfoPanel(): THREE.Group {
  // This would typically be implemented with HTML/CSS overlays
  // using CSS2DRenderer or similar
  const panel = new THREE.Group();
  
  // Placeholder for info panel
  // In a real implementation, you would use DOM elements
  
  return panel;
} 