import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Slider } from './ui/slider';
import { Card } from './ui/card';

interface Electron {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  id: number;
  mesh: THREE.Mesh;
}

export const HallEffect3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const electronsRef = useRef<Electron[]>([]);
  const animationFrameRef = useRef<number>(0);
  const arrowsRef = useRef<THREE.ArrowHelper[]>([]);
  const lastTimeRef = useRef<number>(0);

  const [current, setCurrent] = useState<number>(7);
  const [magneticField, setMagneticField] = useState<number>(49.33);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(3, 2, 4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const semiconductorGeometry = new THREE.BoxGeometry(4, 0.5, 1);
    const semiconductorMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.9,
      metalness: 0.2,
      roughness: 0.3,
      clearcoat: 0.4,
    });
    const semiconductor = new THREE.Mesh(semiconductorGeometry, semiconductorMaterial);
    scene.add(semiconductor);

    const arrowHelpers: THREE.ArrowHelper[] = [];
    for (let x = -1.5; x <= 1.5; x += 0.75) {
      for (let z = -0.4; z <= 0.4; z += 0.4) {
        const arrowHelper = new THREE.ArrowHelper(
          new THREE.Vector3(0, -1, 0),
          new THREE.Vector3(x, 1.5, z),
          1,
          0x1e40af,
          0.15,
          0.1
        );
        arrowHelpers.push(arrowHelper);
        scene.add(arrowHelper);
      }
    }
    arrowsRef.current = arrowHelpers;

    const currentArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-2.5, 0, 0),
      5,
      0xdc2626,
      0.3,
      0.15
    );
    scene.add(currentArrow);

    const electronGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const electronMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x3b82f6,
      emissive: 0x60a5fa,
      emissiveIntensity: 0.5,
      metalness: 0.5,
      roughness: 0.2,
      clearcoat: 1,
    });

    // Create electrons with their meshes
    electronsRef.current = Array.from({ length: 30 }, (_, i) => {
      const mesh = new THREE.Mesh(electronGeometry, electronMaterial);
      const position = new THREE.Vector3(
        Math.random() * 4 - 2,
        Math.random() * 0.2 - 0.1,
        Math.random() * 0.8 - 0.4
      );
      mesh.position.copy(position);
      mesh.userData.id = i;
      scene.add(mesh);

      return {
        position,
        velocity: new THREE.Vector3(Math.random() * 0.02 + 0.03, 0, 0),
        id: i,
        mesh
      };
    });

    const gridHelper = new THREE.GridHelper(10, 20, 0xcccccc, 0xe5e5e5);
    gridHelper.position.y = -0.25;
    scene.add(gridHelper);

    const animate = (currentTime: number) => {
      if (!isRunning || !scene || !camera || !renderer) return;

      const deltaTime = (currentTime - lastTimeRef.current) * 0.001;
      lastTimeRef.current = currentTime;

      // Update all electrons in a single loop
      electronsRef.current.forEach(electron => {
        // Update position based on current and velocity
        electron.position.x += current * 0.004 * electron.velocity.x * deltaTime;
        
        // Apply Hall effect
        const magneticForce = magneticField * current * 0.00004 * deltaTime;
        electron.position.y += magneticForce;

        // Add subtle random movement
        electron.position.y += (Math.random() - 0.5) * 0.0005;
        electron.position.z += (Math.random() - 0.5) * 0.0005;

        // Reset position with improved bounds checking
        if (electron.position.x > 2) {
          electron.position.x = -2;
          electron.position.y = Math.random() * 0.2 - 0.1;
          electron.position.z = Math.random() * 0.8 - 0.4;
        }
        
        if (Math.abs(electron.position.y) > 0.2) {
          electron.position.y = Math.sign(electron.position.y) * 0.2;
        }
        
        if (Math.abs(electron.position.z) > 0.4) {
          electron.position.z = Math.sign(electron.position.z) * 0.4;
        }

        // Update mesh position directly
        electron.mesh.position.copy(electron.position);
      });

      // Smooth camera rotation
      const time = currentTime * 0.0001;
      camera.position.x = 3 * Math.cos(time);
      camera.position.z = 4 * Math.sin(time);
      camera.lookAt(0, 0, 0);

      // Update magnetic field arrows
      arrowsRef.current.forEach(arrow => {
        arrow.scale.y = magneticField / 50;
      });

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animate(lastTimeRef.current);

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Dispose of geometries and materials
      electronGeometry.dispose();
      electronMaterial.dispose();
      semiconductorGeometry.dispose();
      semiconductorMaterial.dispose();
    };
  }, []);

  // Update animation when parameters change
  useEffect(() => {
    if (!sceneRef.current || !isRunning) return;
    
    // Update magnetic field arrow
    const magneticArrow = sceneRef.current.children.find(
      child => child instanceof THREE.ArrowHelper && child.position.y > 0
    ) as THREE.ArrowHelper | undefined;
    
    if (magneticArrow) {
      magneticArrow.scale.y = magneticField / 50;
    }
  }, [current, magneticField, isRunning]);

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Main visualization card */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Hall Effect Visualization</h2>
              <button
                onClick={() => setIsRunning(prev => !prev)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                         transition-colors duration-200 font-medium shadow-sm flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Resume
                  </>
                )}
              </button>
            </div>
            <div 
              ref={containerRef} 
              className="w-full h-[600px] rounded-lg overflow-hidden"
            />
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium mb-2">Legend:</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span>Electrons</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center text-red-600">→</div>
                  <span>Current Direction</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 flex items-center justify-center text-blue-800">⊗</div>
                  <span>Magnetic Field (into screen)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span>Semiconductor</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Controls card */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Parameters</h3>
            
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Current Intensity
                  </label>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-blue-600">{current} mA</span>
                    <span className="text-sm text-gray-500">Range: 1-15 mA</span>
                  </div>
                  <Slider
                    value={[current]}
                    onValueChange={(values: number[]) => setCurrent(values[0])}
                    min={1}
                    max={15}
                    step={0.1}
                    className="my-4"
                  />
                  <p className="text-sm text-gray-600">
                    Controls electron flow through the semiconductor
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Magnetic Field Strength
                  </label>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-blue-600">{magneticField} × 10³ A/m</span>
                    <span className="text-sm text-gray-500">Range: 10-100 × 10³ A/m</span>
                  </div>
                  <Slider
                    value={[magneticField]}
                    onValueChange={(values: number[]) => setMagneticField(values[0])}
                    min={10}
                    max={100}
                    step={0.1}
                    className="my-4"
                  />
                  <p className="text-sm text-gray-600">
                    Controls electron deflection strength
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">About Hall Effect</h4>
                <p className="text-sm text-gray-600 mb-4">
                  The Hall effect is the production of a voltage difference across a conductor when 
                  a magnetic field is applied perpendicular to the current flow. This visualization 
                  demonstrates how electrons (blue spheres) are deflected by the magnetic field, 
                  creating a measurable potential difference.
                </p>
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Key Components:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-500">
                    <li>Semiconductor material (gray block)</li>
                    <li>Electric current (red arrow)</li>
                    <li>Magnetic field (blue dots)</li>
                    <li>Moving electrons (blue spheres)</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}; 