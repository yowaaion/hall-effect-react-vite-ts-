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
  const lastTimeRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  const [current, setCurrent] = useState<number>(7);
  const [magneticField, setMagneticField] = useState<number>(49.33);
  const [isRunning, setIsRunning] = useState(true);

  // Инициализация сцены
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    // Создаем сцену
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // Создаем камеру
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(3, 3, 4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Создаем рендерер
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Создаем полупроводник
    const semiconductorGeometry = new THREE.BoxGeometry(4, 0.5, 1);
    const semiconductorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.9,
      metalness: 0.2,
      roughness: 0.3,
    });
    const semiconductor = new THREE.Mesh(semiconductorGeometry, semiconductorMaterial);
    scene.add(semiconductor);

    // Добавляем стрелку тока
    const currentArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-2.5, 0, 0),
      5,
      0xdc2626,
      0.3,
      0.15
    );
    scene.add(currentArrow);

    // Добавляем сетку
    const gridHelper = new THREE.GridHelper(10, 20, 0xcccccc, 0xe5e5e5);
    gridHelper.position.y = -0.25;
    scene.add(gridHelper);

    // Инициализируем симуляцию
    const simulation = new HallEffectSimulation(scene);
    simulation.initializeElectrons();
    simulationRef.current = simulation;

    // Устанавливаем начальные значения
    simulation.setCurrent(current);
    simulation.setMagneticField(magneticField);
    simulation.setIsRunning(isRunning);

    isInitializedRef.current = true;
    lastTimeRef.current = performance.now();

    // Рендерим первый кадр
    renderer.render(scene, camera);

    // Очистка при размонтировании
    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (simulationRef.current) {
        simulationRef.current.dispose();
      }
      semiconductorGeometry.dispose();
      semiconductorMaterial.dispose();
      isInitializedRef.current = false;
    };
  }, []);

  // Анимация
  useEffect(() => {
    if (!isInitializedRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) {
      return;
    }

    let frameId: number;

    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !simulationRef.current) {
        return;
      }

      const currentTime = performance.now();
      const deltaTime = Math.min((currentTime - lastTimeRef.current) * 0.001, 0.1);
      lastTimeRef.current = currentTime;

      if (isRunning) {
        simulationRef.current.update(deltaTime);

        // Вращаем камеру
        const radius = 5;
        const speed = 0.2;
        cameraRef.current.position.x = radius * Math.cos(currentTime * 0.0002 * speed);
        cameraRef.current.position.z = radius * Math.sin(currentTime * 0.0002 * speed);
        cameraRef.current.lookAt(0, 0, 0);
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    
    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isRunning, magneticField]);

  // Обработка изменения размера окна
  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-full">
        {/* Main visualization card */}
        <div className="lg:col-span-2 h-full">
          <Card className="p-6 bg-white shadow-lg h-full flex flex-col">
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
            <div 
              ref={containerRef} 
              className="flex-1 w-full min-h-[600px] rounded-lg overflow-hidden bg-slate-100 relative"
            />
          </Card>
        </div>

        {/* Controls card */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-white shadow-lg sticky top-6">
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
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}; 