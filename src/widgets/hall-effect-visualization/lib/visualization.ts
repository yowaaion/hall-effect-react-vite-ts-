import * as THREE from 'three';

// Типы для визуализации
export interface LorentzArrow {
  arrow: THREE.ArrowHelper;
  originalDirection: THREE.Vector3;
  length: number;
}

// Функция создания магнитных стрелок
export function createMagneticFieldArrows(): THREE.ArrowHelper[] {
  const arrowHelpers: THREE.ArrowHelper[] = [];
  for (let x = -1.5; x <= 1.5; x += 1.5) {
    for (let z = -0.4; z <= 0.4; z += 0.8) {
      const arrowHelper = new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(x, 1.5, z),
        1,
        0x1e40af,
        0.15,
        0.1
      );
      arrowHelpers.push(arrowHelper);
    }
  }
  return arrowHelpers;
}

// Функция создания стрелок Лоренца
export function createLorentzForceArrows(scene: THREE.Scene): LorentzArrow[] {
  const lorentzArrows: LorentzArrow[] = [];
  
  // Создаем стрелки для визуализации силы Лоренца
  // Стрелки должны показывать направление отклонения электронов
  const arrowPositions = [
    new THREE.Vector3(-1.5, 0.1, 0),
    new THREE.Vector3(0, 0.1, 0),
    new THREE.Vector3(1.5, 0.1, 0)
  ];
  
  arrowPositions.forEach((position) => {
    // Начальное направление - горизонтально вдоль оси Z (отклонение)
    const direction = new THREE.Vector3(0, 0, 1).normalize();
    const length = 0.5; // Начальная длина
    
    // Создаем стрелку
    const arrow = new THREE.ArrowHelper(
      direction,
      position,
      length,
      0x22c55e, // Зеленый цвет для силы Лоренца
      0.1,
      0.05
    );
    
    // Поворачиваем стрелку, чтобы она указывала в правильном направлении
    arrow.visible = false; // Изначально скрыта, будет показана при наличии магнитного поля
    
    scene.add(arrow);
    
    lorentzArrows.push({
      arrow,
      originalDirection: direction.clone(),
      length
    });
  });
  
  return lorentzArrows;
}

// Функция создания стрелок тока
export function createCurrentArrows(scene: THREE.Scene): {
  mainArrow: THREE.ArrowHelper,
  smallArrows: THREE.Mesh[]
} {
  // Основная стрелка тока
  const currentArrow = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-2.5, 0, 0),
    5,
    0xdc2626,
    0.3,
    0.15
  );
  scene.add(currentArrow);

  // Создаем дополнительные стрелки тока для лучшей визуализации
  const arrowCount = 6; // Количество дополнительных стрелок
  const arrowSpacing = 1.0; // Расстояние между стрелками
  const arrowMeshes: THREE.Mesh[] = [];
  
  for (let i = 0; i < arrowCount; i++) {
    // Создаем небольшие стрелки вдоль полупроводника для показа направления тока
    const arrowGeometry = new THREE.ConeGeometry(0.06, 0.2, 8);
    const arrowMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xff0000,
      emissiveIntensity: 0.2,
      roughness: 0.3
    });
    
    const arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrowMesh.rotation.z = -Math.PI / 2; // Поворачиваем стрелку
    arrowMesh.position.set(-2 + i * arrowSpacing, 0, 0); // Распределяем вдоль оси X
    
    // Добавляем небольшое смещение по Y и Z
    arrowMesh.position.y += 0.05;
    arrowMesh.position.z += 0.6;
    
    arrowMesh.castShadow = true;
    arrowMesh.visible = false; // Изначально скрываем, будем показывать в зависимости от тока
    
    scene.add(arrowMesh);
    arrowMeshes.push(arrowMesh);
  }
  
  return {
    mainArrow: currentArrow,
    smallArrows: arrowMeshes
  };
}

// Функция создания полупроводника
export function createSemiconductor(scene: THREE.Scene): void {
  // Улучшенная геометрия полупроводника
  const semiconductorGeometry = new THREE.BoxGeometry(4, 0.5, 1);
  const semiconductorMaterial = new THREE.MeshStandardMaterial({
    color: 0xd0e0f5,
    transparent: true,
    opacity: 0.9,
    roughness: 0.2,
    metalness: 0.1,
    envMapIntensity: 1.0
  });
  const semiconductor = new THREE.Mesh(semiconductorGeometry, semiconductorMaterial);
  semiconductor.receiveShadow = true;
  semiconductor.castShadow = true;
  scene.add(semiconductor);

  // Добавляем красивую рамку вокруг полупроводника
  const edgeGeometry = new THREE.BoxGeometry(4.05, 0.55, 1.05);
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.2,
    roughness: 0.5,
    metalness: 0.7
  });
  const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
  edge.receiveShadow = true;
  edge.castShadow = false;
  scene.add(edge);
}

// Функция создания грунта и сетки
export function createGroundAndGrid(scene: THREE.Scene): void {
  // Улучшенная сетка с градиентом
  const gridHelper = new THREE.GridHelper(12, 12, 0x888888, 0xcccccc);
  gridHelper.position.y = -0.25;
  
  // Добавляем плоскость под сеткой для лучшего вида
  const groundGeometry = new THREE.PlaneGeometry(12, 12);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0f5ff,
    roughness: 0.9,
    metalness: 0.1,
    transparent: true,
    opacity: 0.8
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.25;
  ground.receiveShadow = true;
  scene.add(ground);
  scene.add(gridHelper);
}

// Функция настройки освещения
export function setupLighting(scene: THREE.Scene): void {
  // Улучшенное освещение
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024; // Повышаем качество теней
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 15;
  directionalLight.shadow.camera.left = -7;
  directionalLight.shadow.camera.right = 7;
  directionalLight.shadow.camera.top = 7;
  directionalLight.shadow.camera.bottom = -7;
  directionalLight.shadow.bias = -0.001;
  scene.add(directionalLight);

  // Добавляем второй свет для более объемного освещения
  const fillLight = new THREE.DirectionalLight(0xc2d0ff, 0.4);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  // Добавляем рассеянный свет снизу для более мягкого эффекта
  const bottomLight = new THREE.HemisphereLight(0x6080ff, 0x402010, 0.3);
  scene.add(bottomLight);
}

// Обновление визуализации силы Лоренца
export function updateLorentzForceArrows(
  lorentzArrows: LorentzArrow[],
  magneticField: number,
  current: number,
  time: number
): void {
  // Показываем стрелки только если есть магнитное поле и ток
  const shouldShowArrows = magneticField > 0.01 && current > 0.01;
  
  lorentzArrows.forEach((lorentzArrow, index) => {
    lorentzArrow.arrow.visible = shouldShowArrows;
    
    if (shouldShowArrows) {
      // Направление силы Лоренца для электронов - вверх по оси Z
      // При отрицательном заряде и отрицательной скорости (электроны движутся влево)
      
      // Расчет силы Лоренца (пропорциональна произведению тока и магнитного поля)
      const forceStrength = (magneticField / 50) * (current / 5);
      
      // Устанавливаем длину стрелки
      const baseLength = lorentzArrow.length * forceStrength * 2;
      
      // Добавляем анимацию пульсации
      const pulseIntensity = 0.2;
      const pulseSpeed = 3; // Скорость пульсации
      const pulse = 1 + Math.sin(time * pulseSpeed + index) * pulseIntensity;
      
      // Применяем длину с учетом пульсации
      const finalLength = baseLength * pulse;
      lorentzArrow.arrow.setLength(finalLength, 0.12 * pulse, 0.08 * pulse);
      
      // Меняем цвет в зависимости от силы
      const color = new THREE.Color();
      color.setHSL(0.33 - forceStrength * 0.1, 0.8, 0.5); // От зеленого к желтому
      
      if (lorentzArrow.arrow.line) {
        (lorentzArrow.arrow.line.material as THREE.LineBasicMaterial).color = color;
      }
      if (lorentzArrow.arrow.cone) {
        (lorentzArrow.arrow.cone.material as THREE.MeshBasicMaterial).color = color;
      }
    }
  });
}

// Обновление стрелок магнитного поля
export function updateMagneticFieldArrows(
  arrows: THREE.ArrowHelper[],
  magneticField: number,
  time: number
): void {
  arrows.forEach((arrow, index) => {
    // Делаем стрелки видимыми только при наличии магнитного поля
    arrow.visible = magneticField > 0.01;
    
    if (magneticField > 0.01) {
      // Базовое масштабирование в зависимости от величины поля
      const baseScale = magneticField / 50;
      
      // Добавляем небольшую пульсацию для живости
      const pulse = 1 + Math.sin(time * 0.002 + index) * 0.1;
      
      arrow.scale.setY(baseScale * pulse);
      
      // Меняем цвет в зависимости от силы поля
      const arrowColor = new THREE.Color();
      
      // От синего до фиолетового по мере увеличения силы поля
      const hue = 0.6 - (magneticField / 150) * 0.1; // значение hue: 0.6 (голубой) -> 0.5 (синий)
      const saturation = 0.7 + (magneticField / 100) * 0.3;
      const lightness = 0.5;
      
      arrowColor.setHSL(hue, saturation, lightness);
      
      // Применяем новый цвет
      if (arrow.line) {
        (arrow.line.material as THREE.LineBasicMaterial).color = arrowColor;
      }
      if (arrow.cone) {
        (arrow.cone.material as THREE.MeshBasicMaterial).color = arrowColor;
      }
    }
  });
}

// Обновление стрелок тока
export function updateCurrentArrows(
  mainArrow: THREE.ArrowHelper,
  smallArrows: THREE.Mesh[],
  current: number,
  deltaTime: number
): void {
  // Делаем основную стрелку видимой только при наличии тока
  mainArrow.visible = current > 0.01;
  
  if (current > 0.01) {
    // Изменяем размер стрелки тока в зависимости от величины тока
    const arrowScale = 0.7 + (current / 10) * 0.6;
    mainArrow.scale.set(arrowScale, arrowScale, arrowScale);
    
    // Изменяем цвет стрелки тока от желтого до красного в зависимости от тока
    const arrowColor = new THREE.Color();
    const hue = 0.05 - (current / 20) * 0.05; // от желтого до красного
    arrowColor.setHSL(hue, 1, 0.5);
    
    // Применяем новый цвет
    if (mainArrow.line) {
      (mainArrow.line.material as THREE.LineBasicMaterial).color = arrowColor;
    }
    if (mainArrow.cone) {
      (mainArrow.cone.material as THREE.MeshBasicMaterial).color = arrowColor;
    }
  }
  
  // Обновляем маленькие стрелки
  if (smallArrows && smallArrows.length > 0) {
    // Если тока нет - скрываем все стрелки
    if (current <= 0.01) {
      smallArrows.forEach(arrow => {
        arrow.visible = false;
      });
      return;
    }
    
    const visibleArrows = Math.max(1, Math.floor(current / 2)); // Количество видимых стрелок
    
    smallArrows.forEach((arrow, index) => {
      // Делаем видимыми только нужное количество стрелок
      arrow.visible = index < visibleArrows;
      
      if (arrow.visible) {
        // Добавляем пульсацию для стрелок тока, зависящую от величины тока
        const pulseScale = 1 + Math.sin(performance.now() * 0.005 + index * 0.5) * 0.08;
        const baseScale = 0.7 + (current / 10) * 0.6; // Масштаб зависит от тока
        arrow.scale.set(baseScale * pulseScale, baseScale * pulseScale, baseScale * pulseScale);
        
        // Корректируем цвет от желтого до красного в зависимости от тока
        const arrowMaterial = arrow.material as THREE.MeshStandardMaterial;
        const hue = 0.05 - (current / 20) * 0.05; // от желтого до красного
        arrowMaterial.emissive.setHSL(hue, 1, 0.5);
        arrowMaterial.emissiveIntensity = 0.2 + current * 0.05;
        
        // Добавляем движение стрелок, чтобы показать поток
        arrow.position.x += (0.02 + current * 0.01) * deltaTime;
        if (arrow.position.x > 2.5) {
          arrow.position.x = -2.5 + (index % 3) * 0.2; // Возвращаем в начало с небольшим смещением
        }
      }
    });
  }
}

// Функция создания красивого электрона
export function createBeautifulElectronMesh(position: THREE.Vector3): THREE.Mesh {
  // Создаем сферу с более качественной геометрией
  const geometry = new THREE.SphereGeometry(0.05, 12, 12);
  
  // Создаем красивый материал для электронов
  const material = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x1e40af,
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.5,
    transparent: true,
    opacity: 0.9
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.castShadow = true; // Электроны тоже будут отбрасывать тени
  
  // Добавляем небольшое свечение вокруг электрона
  const glowGeometry = new THREE.SphereGeometry(0.06, 8, 8);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.3
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  mesh.add(glow);
  
  return mesh;
} 