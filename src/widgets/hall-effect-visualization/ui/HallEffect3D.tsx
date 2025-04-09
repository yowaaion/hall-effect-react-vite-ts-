import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Slider } from '../../../shared/ui/slider';
import { Card } from '../../../shared/ui/card';
import { HallEffectSimulation } from '../../../features/hall-effect/model/HallEffectSimulation';

export const HallEffect3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const simulationRef = useRef<HallEffectSimulation | null>(null);
  const animationFrameRef = useRef<number>(0);
  const arrowsRef = useRef<THREE.ArrowHelper[]>([]);
  const lastTimeRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  const [current, setCurrent] = useState<number>(7);
  const [magneticField, setMagneticField] = useState<number>(49.33);
  const [isRunning, setIsRunning] = useState(true);

  // Инициализация сцены
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Полупроводник
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

    // Стрелки магнитного поля
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

    // Стрелка тока
    const currentArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-2.5, 0, 0),
      5,
      0xdc2626,
      0.3,
      0.15
    );
    scene.add(currentArrow);

    // Сетка
    const gridHelper = new THREE.GridHelper(10, 20, 0xcccccc, 0xe5e5e5);
    gridHelper.position.y = -0.25;
    scene.add(gridHelper);

    // Инициализация симуляции
    const simulation = new HallEffectSimulation(scene);
    simulation.initializeElectrons();
    simulationRef.current = simulation;

    simulation.setCurrent(current);
    simulation.setMagneticField(magneticField);
    simulation.setIsRunning(isRunning);

    isInitializedRef.current = true;
    lastTimeRef.current = performance.now();

    return () => {
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
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

    const animate = (currentTime: number) => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !simulationRef.current) {
        return;
      }

      const deltaTime = Math.min((currentTime - lastTimeRef.current) * 0.001, 0.1);
      lastTimeRef.current = currentTime;

      simulationRef.current.update(deltaTime);

      // Вращение камеры
      const radius = 5;
      const speed = 0.2;
      cameraRef.current.position.x = radius * Math.cos(currentTime * 0.0002 * speed);
      cameraRef.current.position.z = radius * Math.sin(currentTime * 0.0002 * speed);
      cameraRef.current.lookAt(0, 0, 0);

      // Обновление стрелок магнитного поля
      arrowsRef.current.forEach(arrow => {
        arrow.scale.setY(magneticField / 50);
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [magneticField]);

  // Обработчики изменения параметров
  useEffect(() => {
    if (simulationRef.current) {
      simulationRef.current.setCurrent(current);
    }
  }, [current]);

  useEffect(() => {
    if (simulationRef.current) {
      simulationRef.current.setMagneticField(magneticField);
    }
  }, [magneticField]);

  useEffect(() => {
    if (simulationRef.current) {
      simulationRef.current.setIsRunning(isRunning);
    }
  }, [isRunning]);

  return (
    <div className="w-full h-full">
      <div ref={containerRef} className="w-full h-[600px] relative">
        <Card className="absolute top-4 right-4 p-4 space-y-4 w-64">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ток (А)</label>
            <Slider
              value={current}
              onChange={setCurrent}
              min={0}
              max={10}
              step={0.1}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Магнитное поле (мТл)</label>
            <Slider
              value={magneticField}
              onChange={setMagneticField}
              min={0}
              max={100}
              step={0.1}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}; 