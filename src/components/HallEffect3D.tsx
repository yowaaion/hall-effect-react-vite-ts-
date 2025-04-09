import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Slider } from './ui/slider';
import { Card } from './ui/card';
import { HallEffectSimulation } from '../lib/HallEffectSimulation';

export const HallEffect3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const simulationRef = useRef<HallEffectSimulation | null>(null);
  const animationFrameRef = useRef<number>(0);
  const arrowsRef = useRef<THREE.ArrowHelper[]>([]);
  const lastTimeRef = useRef<number>(0);
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(3, 2, 4));

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
    camera.position.copy(cameraPositionRef.current);
    camera.lookAt(cameraTargetRef.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
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
    semiconductor.receiveShadow = true;
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

    const gridHelper = new THREE.GridHelper(10, 20, 0xcccccc, 0xe5e5e5);
    gridHelper.position.y = -0.25;
    scene.add(gridHelper);

    // Initialize simulation
    const simulation = new HallEffectSimulation(scene);
    simulation.initializeElectrons();
    simulationRef.current = simulation;

    const animate = (currentTime: number) => {
      if (!isRunning || !scene || !camera || !renderer || !simulationRef.current) return;

      const deltaTime = (currentTime - lastTimeRef.current) * 0.001;
      lastTimeRef.current = currentTime;

      // Update simulation
      simulationRef.current.update(deltaTime);

      // Плавное вращение камеры
      const time = currentTime * 0.0001;
      const radius = 4;
      const height = 2;
      const targetX = radius * Math.cos(time);
      const targetZ = radius * Math.sin(time);
      
      // Плавное перемещение камеры
      cameraPositionRef.current.x += (targetX - cameraPositionRef.current.x) * 0.02;
      cameraPositionRef.current.z += (targetZ - cameraPositionRef.current.z) * 0.02;
      camera.position.copy(cameraPositionRef.current);
      camera.lookAt(cameraTargetRef.current);

      // Плавное обновление стрелок магнитного поля
      arrowsRef.current.forEach(arrow => {
        const targetScale = magneticField / 50;
        arrow.scale.y += (targetScale - arrow.scale.y) * 0.1;
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
      if (simulationRef.current) {
        simulationRef.current.dispose();
      }
      // Dispose of geometries and materials
      semiconductorGeometry.dispose();
      semiconductorMaterial.dispose();
    };
  }, []);

  // Update simulation parameters when they change
  useEffect(() => {
    if (!simulationRef.current) return;
    
    simulationRef.current.setCurrent(current);
    simulationRef.current.setMagneticField(magneticField);
    simulationRef.current.setIsRunning(isRunning);
  }, [current, magneticField, isRunning]);

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Main visualization card */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Визуализация эффекта Холла</h2>
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
                    Пауза
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Старт
                  </>
                )}
              </button>
            </div>
            <div ref={containerRef} className="w-full h-[500px] rounded-lg overflow-hidden" />
          </Card>
        </div>

        {/* Controls card */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Управление симуляцией</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сила тока (А)
                </label>
                <Slider
                  value={[current]}
                  onValueChange={(values) => setCurrent(values[0])}
                  min={0}
                  max={14}
                  step={0.1}
                />
                <div className="mt-1 text-sm text-gray-500">
                  {current.toFixed(1)} А
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Магнитное поле (мТл)
                </label>
                <Slider
                  value={[magneticField]}
                  onValueChange={(values) => setMagneticField(values[0])}
                  min={0}
                  max={100}
                  step={0.1}
                />
                <div className="mt-1 text-sm text-gray-500">
                  {magneticField.toFixed(2)} мТл
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-lg font-semibold text-blue-800 mb-3">Об эффекте Холла</h4>
                <div className="space-y-3 text-sm text-blue-700">
                  <p>
                    Эффект Холла — это явление возникновения поперечной разности потенциалов в проводнике с током, помещённом в магнитное поле, перпендикулярное направлению тока.
                  </p>
                  <p>
                    В данной симуляции вы можете наблюдать:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>Движение электронов (синие сферы) под действием тока</li>
                    <li>Отклонение электронов магнитным полем (синие стрелки)</li>
                    <li>Образование поперечного электрического поля</li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-4">
                    Формула: VH = B·I·d / (n·e), где:
                    <br />
                    VH — напряжение Холла
                    <br />
                    B — магнитная индукция
                    <br />
                    I — сила тока
                    <br />
                    d — толщина проводника
                    <br />
                    n — концентрация носителей заряда
                    <br />
                    e — элементарный заряд
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}; 