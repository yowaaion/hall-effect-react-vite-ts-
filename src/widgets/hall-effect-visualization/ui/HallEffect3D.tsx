import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Slider } from '../../../shared/ui/slider';
import { Card } from '../../../shared/ui/card';
import { 
  createMagneticFieldArrows, 
  createLorentzForceArrows, 
  createCurrentArrows, 
  createSemiconductor, 
  createGroundAndGrid, 
  setupLighting,
  updateLorentzForceArrows,
  updateMagneticFieldArrows,
  updateCurrentArrows
} from '../lib/visualization';
import { ElectronSimulation, Electron } from '../lib/electron-simulation';

export const HallEffect3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const simulationRef = useRef<ElectronSimulation | null>(null);
  
  // Referencing 3D objects - обновляем типы для соответствия изменениям в visualization.ts
  const magneticArrowsRef = useRef<THREE.Group | null>(null);
  const lorentzArrowsRef = useRef<THREE.Group | null>(null);
  const currentArrowRef = useRef<{
    mainArrow: THREE.ArrowHelper;
    smallArrows: THREE.Mesh[];
  } | null>(null);
  
  const electronsRef = useRef<Electron[]>([]);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // Начинаем с небольших значений для начальной визуализации
  const [current, setCurrent] = useState<number>(2);
  const [magneticField, setMagneticField] = useState<number>(30);

  // Инициализация сцены - запускается только один раз при монтировании
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || isInitializedRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f5ff); // Более приятный голубоватый фон
    sceneRef.current = scene;
    
    // Настраиваем размеры в соответствии с родительским контейнером
    const updateSizes = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      return { width, height };
    };
    
    const { width, height } = updateSizes();

    const camera = new THREE.PerspectiveCamera(
      60,
      width / height,
      0.1,
      1000
    );
    camera.position.set(3, 2, 4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      canvas: canvas
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Уменьшаем pixelRatio для производительности
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace; // Улучшаем отображение цветов
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Улучшаем тональную компрессию
    renderer.toneMappingExposure = 1.1; // Немного повышаем яркость
    rendererRef.current = renderer;

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      const { width, height } = updateSizes();
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Настройка освещения
    setupLighting(scene);

    // Создание полупроводника
    createSemiconductor(scene);

    // Добавление поверхности и сетки
    createGroundAndGrid(scene);

    // Создание визуальных элементов для магнитного поля - обновленная реализация с группой
    const magneticArrows = createMagneticFieldArrows();
    scene.add(magneticArrows);
    magneticArrowsRef.current = magneticArrows;

    // Создание визуальных элементов для силы Лоренца - обновленная реализация с группой
    const lorentzArrows = createLorentzForceArrows();
    scene.add(lorentzArrows);
    lorentzArrowsRef.current = lorentzArrows;

    // Создание стрелок тока
    const currentArrows = createCurrentArrows();
    scene.add(currentArrows.group); // Используем возвращаемую группу вместо parent
    currentArrowRef.current = currentArrows;

    // Инициализация системы электронов
    const electronSimulation = new ElectronSimulation(scene);
    const electrons = electronSimulation.initializeElectrons();
    electronsRef.current = electrons;
    simulationRef.current = electronSimulation;

    // Сразу обновляем визуализацию с начальными значениями
    if (magneticArrowsRef.current) {
      updateMagneticFieldArrows(
        magneticArrowsRef.current,
        magneticField,
        performance.now() * 0.001
      );
    }
    
    if (lorentzArrowsRef.current) {
      updateLorentzForceArrows(
        lorentzArrowsRef.current,
        magneticField,
        current,
        performance.now() * 0.001
      );
    }
    
    if (currentArrowRef.current) {
      updateCurrentArrows(
        currentArrowRef.current.mainArrow,
        currentArrowRef.current.smallArrows,
        current,
        0.016
      );
    }

    // Рендерим первый кадр
    renderer.render(scene, camera);

    isInitializedRef.current = true;
    lastTimeRef.current = performance.now();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (simulationRef.current) {
        simulationRef.current.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      isInitializedRef.current = false;
    };
  }, []); // Запускаем только один раз при монтировании

  // Единый эффект для всей анимации - запускается один раз
  useEffect(() => {
    if (!isInitializedRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) {
      return;
    }

    // Сохраняем и используем общие переменные для анимации
    let cameraAngle = 0;
    let prevTime = performance.now();
    let rafId: number | null = null;

    const animate = () => {
      if (!isInitializedRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
        if (rafId) cancelAnimationFrame(rafId);
        return;
      }

      // Расчет deltaTime
      const currentTime = performance.now();
      const deltaTime = (currentTime - prevTime) * 0.001; // в секундах
      prevTime = currentTime;

      // Текущие значения из state
      const currentValue = Math.max(0, current ?? 0);
      const magneticFieldValue = Math.max(0, magneticField ?? 0);

      // Обновляем симуляцию электронов
      if (simulationRef.current && electronsRef.current.length > 0) {
        simulationRef.current.updateElectrons(
          electronsRef.current, 
          deltaTime, 
          currentValue, 
          magneticFieldValue,
          currentTime * 0.001
        );
      }

      // Плавное вращение камеры с переменной скоростью
      // Делаем более плавным и интересным - камера двигается медленнее на "интересных" ракурсах
      const cameraSpeed = 0.0015 + Math.sin(cameraAngle * 2) * 0.0005;
      cameraAngle += cameraSpeed;
      const radius = 5 + Math.sin(cameraAngle * 0.5) * 0.5;
      const height = 2 + Math.sin(cameraAngle * 0.7) * 0.5;
      cameraRef.current.position.x = radius * Math.cos(cameraAngle);
      cameraRef.current.position.y = height;
      cameraRef.current.position.z = radius * Math.sin(cameraAngle);
      cameraRef.current.lookAt(0, 0, 0);

      // Обновляем стрелки магнитного поля
      if (magneticArrowsRef.current) {
        updateMagneticFieldArrows(
          magneticArrowsRef.current,
          magneticFieldValue,
          currentTime * 0.001
        );
      }

      // Обновляем стрелки силы Лоренца
      if (lorentzArrowsRef.current) {
        updateLorentzForceArrows(
          lorentzArrowsRef.current,
          magneticFieldValue,
          currentValue,
          currentTime * 0.001
        );
      }

      // Обновляем стрелки тока
      if (currentArrowRef.current) {
        updateCurrentArrows(
          currentArrowRef.current.mainArrow,
          currentArrowRef.current.smallArrows,
          currentValue,
          deltaTime
        );
      }

      // Рендерим сцену
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Запрашиваем следующий кадр
      rafId = requestAnimationFrame(animate);
    };

    // Запускаем анимацию
    rafId = requestAnimationFrame(animate);

    // Очистка
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []); // Пустой массив зависимостей - запускаем только один раз

  // Эффект для немедленного обновления при изменении значений
  useEffect(() => {
    // Если симуляция еще не инициализирована - выходим
    if (!isInitializedRef.current || !simulationRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
      return;
    }

    // Обновляем симуляцию электронов с новыми значениями
    if (electronsRef.current.length > 0) {
      // Делаем мгновенное обновление с малым deltaTime для плавности
      simulationRef.current.updateElectrons(
        electronsRef.current, 
        0.016, // Фиксированный малый deltaTime
        Math.max(0, current ?? 0),
        Math.max(0, magneticField ?? 0),
        performance.now() * 0.001
      );
    }

    // Обновляем стрелки магнитного поля
    if (magneticArrowsRef.current) {
      updateMagneticFieldArrows(
        magneticArrowsRef.current,
        Math.max(0, magneticField ?? 0),
        performance.now() * 0.001
      );
    }

    // Обновляем стрелки силы Лоренца
    if (lorentzArrowsRef.current) {
      updateLorentzForceArrows(
        lorentzArrowsRef.current,
        Math.max(0, magneticField ?? 0),
        Math.max(0, current ?? 0),
        performance.now() * 0.001
      );
    }

    // Обновляем стрелки тока
    if (currentArrowRef.current) {
      updateCurrentArrows(
        currentArrowRef.current.mainArrow,
        currentArrowRef.current.smallArrows,
        Math.max(0, current ?? 0),
        0.016 // Фиксированный малый deltaTime
      );
    }

    // Рендерим сцену
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [current, magneticField]); // Запускаем при изменении значений

  // Обработчики изменения значений с проверкой
  const handleCurrentChange = (value: number) => {
    // Гарантируем, что значение неотрицательное
    const validValue = Math.max(0, value);
    setCurrent(validValue);
  };

  const handleMagneticFieldChange = (value: number) => {
    // Гарантируем, что значение неотрицательное
    const validValue = Math.max(0, value);
    setMagneticField(validValue);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4">
      <div className="w-full h-[calc(100vh-2rem)] relative mx-auto max-w-[1250px] px-4">
        {/* Адаптивный контейнер */}
        <div className="relative w-full h-full flex flex-col lg:flex-row">
          {/* Карточки слева - мобильная версия сверху */}
          <div className="w-full lg:w-[320px] lg:absolute lg:top-4 lg:left-4 lg:space-y-3 lg:z-10 order-2 lg:order-1 mb-4 lg:mb-0">
            <div className="grid grid-cols-1 gap-3 lg:block">
              {/* Title Card */}
              <Card className="p-4 shadow-md border border-blue-100/50">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    Эффект Холла
                    <span className="text-sm font-normal text-slate-500 hidden sm:inline">(Эдвин Холл, 1879)</span>
                  </h2>
                  <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                </div>
              </Card>

              {/* Physical Essence Card */}
              <Card variant="blue" className="p-3 shadow-md">
                <h3 className="text-sm font-semibold text-blue-900 mb-2 text-center">Физическая сущность явления</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Эффект Холла — возникновение поперечной разности потенциалов в проводнике с током, 
                  помещённом в магнитное поле, перпендикулярное току.
                </p>
              </Card>

              {/* Математическая модель - скрываем на маленьких экранах */}
              <Card variant="indigo" className="p-3 shadow-md hidden lg:block">
                <h3 className="text-sm font-semibold text-indigo-900 mb-2 text-center">Математическая модель</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-white rounded-md p-2">
                    <p className="text-sm text-center text-slate-700 font-medium">Сила Лоренца</p>
                    <p className="text-sm text-center text-slate-800 font-bold">F = q · [v × B]</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* 3D Canvas - ЦЕНТРАЛЬНЫЙ ЭЛЕМЕНТ */}
          <div className="flex-grow order-1 lg:order-2 relative 
                         lg:absolute lg:top-4 lg:left-[340px] lg:right-[340px] lg:bottom-4 
                         h-[300px] sm:h-[400px] md:h-[500px] lg:h-auto 
                         bg-gradient-to-br from-slate-100 to-white rounded-lg overflow-hidden border border-slate-200 shadow-lg">
            <div ref={containerRef} className="w-full h-full flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                className="w-full h-full" 
              />
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-sm rounded-md p-2 text-center text-xs sm:text-sm text-slate-600 shadow-sm">
              <p>Визуализация: электроны движутся под действием тока (→) и отклоняются магнитным полем (↓) из-за силы Лоренца</p>
            </div>
          </div>

          {/* Карточки справа - мобильная версия внизу */}
          <div className="w-full lg:w-[320px] lg:absolute lg:top-4 lg:right-4 lg:space-y-3 lg:z-10 order-3 mt-4 lg:mt-0">
            <div className="grid grid-cols-1 gap-3 lg:block">
        {/* Controls Card */}
              <Card className="p-4 space-y-4 shadow-md border border-slate-200/50 bg-white/90 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center justify-between">
                  Управление
                  <span className="text-xs text-slate-500 font-normal hidden sm:inline">Изменяйте параметры</span>
                </h3>
                <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Ток (А)</label>
            <Slider
              value={current}
                    onChange={handleCurrentChange}
              min={0}
              max={10}
              step={0.1}
                    className="py-1"
            />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Ток: {current.toFixed(1)} А</span>
                    <span>Скорость электронов ↑</span>
                  </div>
          </div>
                <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Магнитное поле (мТл)</label>
            <Slider
              value={magneticField}
                    onChange={handleMagneticFieldChange}
              min={0}
              max={100}
              step={0.1}
                    className="py-1"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>B: {magneticField.toFixed(1)} мТл</span>
                    <span>Сила Лоренца ↑</span>
              </div>
                </div>
              </Card>

              {/* Key Characteristics Card */}
              <Card variant="yellow" className="p-3 shadow-md">
                <h3 className="text-sm font-semibold text-amber-900 mb-3 text-center">Ключевые характеристики</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-amber-800">Напряжение Холла</h4>
                    <div className="p-2 bg-white rounded-lg">
                      <p className="text-sm text-slate-600">VH = (IB)/(ned)</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Скрываем на маленьких экранах */}
              <Card variant="green" className="p-3 shadow-md hidden lg:block">
                <h3 className="text-sm font-semibold text-emerald-900 mb-2 text-center">Применение</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h4 className="text-sm font-medium text-emerald-800 mb-1">Измерения</h4>
                    <ul className="text-xs text-slate-600 list-disc list-inside">
                      <li>Датчики магнитного поля</li>
                      <li>Датчики Холла</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-emerald-800 mb-1">Исследования</h4>
                    <ul className="text-xs text-slate-600 list-disc list-inside">
                      <li>Тип проводимости</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 