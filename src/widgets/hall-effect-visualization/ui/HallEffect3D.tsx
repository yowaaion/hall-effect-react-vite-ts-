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
  updateCurrentArrows,
  LorentzArrow
} from '../lib/visualization';
import { ElectronSimulation, Electron } from '../lib/electron-simulation';

export const HallEffect3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const simulationRef = useRef<ElectronSimulation | null>(null);
  
  // Referencing 3D objects
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

  // Начинаем с небольших ненулевых значений для начальной визуализации
  const [current, setCurrent] = useState<number>(2);
  const [magneticField, setMagneticField] = useState<number>(30);
  const [isRunning] = useState(true);

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

    // Создание визуальных элементов для магнитного поля
    const magneticArrows = createMagneticFieldArrows();
    // Сразу установим видимость стрелок магнитного поля
    magneticArrows.visible = magneticField > 0.1;
    scene.add(magneticArrows);
    magneticArrowsRef.current = magneticArrows;

    // Создание визуальных элементов для силы Лоренца
    const lorentzArrows = createLorentzForceArrows();
    // Установим видимость стрелок Лоренца (зависит от тока и магнитного поля)
    lorentzArrows.visible = current > 0.1 && magneticField > 0.1;
    scene.add(lorentzArrows);
    lorentzArrowsRef.current = lorentzArrows;

    // Создание стрелок тока
    const currentArrows = createCurrentArrows();
    // Установим видимость основной стрелки тока
    currentArrows.mainArrow.visible = current > 0.1;
    // Добавляем основную стрелку в сцену
    scene.add(currentArrows.mainArrow);
    
    // Добавляем и настраиваем маленькие стрелки тока
    currentArrows.smallArrows.forEach((arrow, index) => {
      // Показываем только некоторые стрелки в зависимости от силы тока
      arrow.visible = current > 0.1 && index < Math.max(1, Math.min(currentArrows.smallArrows.length, Math.floor(current * 1.2)));
      scene.add(arrow);
    });
    currentArrowRef.current = currentArrows;

    // Инициализация системы электронов
    const electronSimulation = new ElectronSimulation(scene);
    const electrons = electronSimulation.initializeElectrons();
    electronsRef.current = electrons;
    simulationRef.current = electronSimulation;

    // Сразу запускаем обновление с начальными значениями
    if (simulationRef.current && electrons.length > 0) {
      simulationRef.current.updateElectrons(
        electrons,
        0.016,
        current,
        magneticField,
        performance.now() * 0.001
      );
    }

    // Обновляем визуальные элементы с начальными значениями
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

      // Расчет deltaTime с ограничением максимального значения для стабильности
      const currentTime = performance.now();
      const deltaTime = Math.min((currentTime - prevTime) * 0.001, 0.05); // в секундах, максимум 50 мс
      prevTime = currentTime;

      // Текущие значения из state
      const currentValue = current;
      const magneticFieldValue = magneticField;

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

      // Улучшенное плавное вращение камеры с различной скоростью для разных секторов
      // Используем более сложные синусоидальные шаблоны для естественного движения
      const time = currentTime * 0.0005; // Замедляем общую скорость для более плавного движения
      
      // Переменная скорость движения камеры в зависимости от позиции
      const cameraSpeed = 0.002 + Math.sin(time) * 0.0015;
      cameraAngle += cameraSpeed;
      
      // Радиус орбиты камеры с небольшими вариациями
      const baseRadius = 5.0;
      const radiusVariation = 0.7;
      const radius = baseRadius + Math.sin(time * 0.7) * radiusVariation;
      
      // Высота камеры также меняется синусоидально
      const baseHeight = 2.2;
      const heightVariation = 0.8;
      const height = baseHeight + Math.sin(time * 0.5) * heightVariation;
      
      // Обновляем позицию камеры
      cameraRef.current.position.x = radius * Math.cos(cameraAngle);
      cameraRef.current.position.y = height;
      cameraRef.current.position.z = radius * Math.sin(cameraAngle);
      
      // Точка фокуса камеры тоже немного перемещается для более естественного вида
      const targetX = Math.sin(time * 0.3) * 0.3;
      const targetY = 0.1 + Math.sin(time * 0.4) * 0.1;
      cameraRef.current.lookAt(targetX, targetY, 0);

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

  // Обработчики изменения значений с немедленным форсированным обновлением
  const handleCurrentChange = (value: number) => {
    // Форсированно применяем новые значения к симуляции
    setCurrent(value);
    
    // Немедленное обновление визуализации для отзывчивости интерфейса
    if (isInitializedRef.current && simulationRef.current && 
        electronsRef.current.length > 0 && rendererRef.current && 
        sceneRef.current && cameraRef.current && currentArrowRef.current) {
      
      // Обновляем электроны с нулевым deltaTime, чтобы только применить новое значение
      // но без перемещения
      simulationRef.current.updateElectrons(
        electronsRef.current,
        0,
        value,
        magneticField,
        performance.now() * 0.001
      );
      
      // Обновляем стрелки тока для мгновенной обратной связи
      updateCurrentArrows(
        currentArrowRef.current.mainArrow,
        currentArrowRef.current.smallArrows,
        value,
        0.016
      );
      
      // Обновляем стрелки силы Лоренца в зависимости от тока и магнитного поля
      if (lorentzArrowsRef.current) {
        updateLorentzForceArrows(
          lorentzArrowsRef.current,
          magneticField,
          value,
          performance.now() * 0.001
        );
      }
      
      // Рендерим сцену для мгновенного отображения изменений
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const handleMagneticFieldChange = (value: number) => {
    // Форсированно применяем новые значения к симуляции
    setMagneticField(value);
    
    // Немедленное обновление визуализации для лучшей отзывчивости
    if (isInitializedRef.current && simulationRef.current && 
        electronsRef.current.length > 0 && rendererRef.current && 
        sceneRef.current && cameraRef.current) {
      
      // Обновляем электроны без перемещения - только применяем новое значение магнитного поля
      simulationRef.current.updateElectrons(
        electronsRef.current,
        0,
        current,
        value,
        performance.now() * 0.001
      );
      
      // Обновляем стрелки магнитного поля для мгновенной обратной связи
      if (magneticArrowsRef.current) {
        updateMagneticFieldArrows(
          magneticArrowsRef.current,
          value,
          performance.now() * 0.001
        );
      }
      
      // Обновляем стрелки силы Лоренца для мгновенной обратной связи
      if (lorentzArrowsRef.current) {
        updateLorentzForceArrows(
          lorentzArrowsRef.current,
          value,
          current,
          performance.now() * 0.001
        );
      }
      
      // Рендерим сцену для мгновенного отображения изменений
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
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
                    <span>{current > 0.1 ? "Движение электронов →" : "Нет движения"}</span>
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
                    <span>{magneticField > 0.1 ? "Сила Лоренца ↑" : "Нет отклонения"}</span>
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