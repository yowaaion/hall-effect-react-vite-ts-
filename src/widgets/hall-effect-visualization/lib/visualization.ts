import * as THREE from 'three';
import { Electron } from './electron-simulation';

// Типы для визуализации
export interface LorentzArrow {
  arrow: THREE.ArrowHelper;
  originalDirection: THREE.Vector3;
  length: number;
}

// Функция создания магнитных стрелок - объединенная версия
export function createMagneticFieldArrows(): THREE.Group {
  const arrowsGroup = new THREE.Group();
  
  // Более яркий цвет для лучшей видимости
  const arrowMaterial = new THREE.MeshStandardMaterial({
    color: 0x6a0dad, // Фиолетовый цвет для магнитного поля
    emissive: 0x8a2be2,
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.7,
  });
  
  // Увеличиваем размер стрелок для лучшей видимости
  const arrowGeometry = new THREE.ConeGeometry(0.12, 0.4, 8);
  const lineGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1, 8);
  
  // Создаем больше стрелок для лучшей визуализации
  const arrowCount = 3; // По каждой оси
  const spacing = 1.6; // Расстояние между стрелками
  
  for (let i = 0; i < arrowCount; i++) {
    for (let j = 0; j < arrowCount; j++) {
      // Позиция стрелки
      const x = (i - arrowCount / 2 + 0.5) * spacing;
      const z = (j - arrowCount / 2 + 0.5) * spacing;
      
      // Создаем линию (стержень стрелки)
      const line = new THREE.Mesh(lineGeometry, arrowMaterial.clone());
      line.position.set(x, 0, z);
      // Ориентируем вертикально и смещаем для правильного положения
      line.rotation.x = Math.PI / 2;
      
      // Создаем наконечник стрелки
      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial.clone());
      arrow.position.set(x, -0.7, z); // Размещаем ниже полупроводника
      arrow.rotation.x = Math.PI; // Направляем вниз
      
      // Группируем линию и стрелку
      const arrowGroup = new THREE.Group();
      arrowGroup.add(line);
      arrowGroup.add(arrow);
      arrowGroup.userData = { baseY: line.position.y, baseScale: 1 };
      
      arrowsGroup.add(arrowGroup);
    }
  }
  
  // Устанавливаем начальную видимость (включена по умолчанию)
  arrowsGroup.visible = true;
  
  return arrowsGroup;
}

// Функция создания стрелок Лоренца - объединенная версия
export function createLorentzForceArrows(): THREE.Group {
  const arrowsGroup = new THREE.Group();
  
  // Яркий зеленый цвет для силы Лоренца с улучшенной яркостью
  const arrowMaterial = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x00ff00,
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.7,
  });
  
  // Увеличенный размер стрелок для лучшей видимости
  const arrowGeometry = new THREE.ConeGeometry(0.08, 0.2, 8);
  const lineGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.6, 8);
  
  // Создаем стрелки в нескольких точках внутри полупроводника
  const positions = [
    new THREE.Vector3(-1.5, 0, 0),
    new THREE.Vector3(-0.75, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.75, 0, 0),
    new THREE.Vector3(1.5, 0, 0),
  ];
  
  positions.forEach((position) => {
    // Создаем линию (стержень стрелки)
    const line = new THREE.Mesh(lineGeometry, arrowMaterial.clone());
    line.position.copy(position);
    // Ориентируем горизонтально в направлении силы Лоренца
    line.rotation.z = Math.PI / 2;
    line.scale.set(1, 1, 1); // Начальный масштаб
    
    // Создаем наконечник стрелки
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial.clone());
    arrow.position.set(position.x, position.y, position.z + 0.3);
    
    // Группируем линию и стрелку
    const arrowGroup = new THREE.Group();
    arrowGroup.add(line);
    arrowGroup.add(arrow);
    arrowGroup.userData = { baseScale: 1, basePosition: position.clone() };
    
    arrowsGroup.add(arrowGroup);
  });
  
  // По умолчанию стрелки скрыты, их видимость будет управляться в updateLorentzForceArrows
  arrowsGroup.visible = false;
  
  return arrowsGroup;
}

// Создание стрелок тока - объединенная версия
export function createCurrentArrows(): { 
  mainArrow: THREE.ArrowHelper,
  smallArrows: THREE.Mesh[] 
} {
  const GROUP_COUNT = 2;
  
  // Основная стрелка тока - делаем крупнее и заметнее
  const currentArrow = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-2.5, 0, 0),
    5,
    0xdc2626,
    0.4,   // Увеличенный размер головки стрелки
    0.2    // Увеличенный размер конуса
  );
  
  // Создаем материалы с разной интенсивностью свечения
  const arrowMaterials = Array.from({ length: GROUP_COUNT }, (_, i) => {
    return new THREE.MeshStandardMaterial({
      color: 0xff6b6b, // Красный цвет для тока
      emissive: 0xff3333,
      emissiveIntensity: 0.7 + i * 0.2, // Увеличенная интенсивность свечения
      roughness: 0.3,
      metalness: 0.5,
    });
  });
  
  // Увеличенный размер маленьких стрелок для лучшей видимости
  const arrowGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
  const smallArrows: THREE.Mesh[] = [];
  
  // Создаем несколько групп стрелок с разным смещением
  for (let g = 0; g < GROUP_COUNT; g++) {
    // Рассчитываем смещение для группы
    const groupOffset = (g / GROUP_COUNT) * 1.5;
    
    // Создаем стрелки с разными позициями
    for (let i = 0; i < 5; i++) {
      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterials[g].clone());
      // Располагаем стрелки равномерно вдоль полупроводника
      const xPos = -2 + i + groupOffset;
      arrow.position.set(xPos, 0.4, 0);
      arrow.rotation.z = Math.PI / 2; // Направление вправо
      arrow.castShadow = true;
      smallArrows.push(arrow);
    }
  }
  
  return {
    mainArrow: currentArrow,
    smallArrows: smallArrows
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
  
  // Добавляем материал для сетки, чтобы сделать ее прозрачной
  const gridMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  
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

// Обновление визуализации силы Лоренца - объединенная версия
export function updateLorentzForceArrows(
  arrows: THREE.Group,
  magneticField: number,
  current: number,
  time: number
): void {
  // Стрелки силы Лоренца видны даже при малых значениях
  // Но их размер и яркость зависят от величины этих значений
  const isVisible = magneticField > 0.05 && current > 0.05;
  arrows.visible = isVisible;
  
  if (!isVisible) return;
  
  // Сила Лоренца пропорциональна произведению тока и магнитного поля,
  // но делаем эффект более выраженным для наглядности
  const forceStrength = Math.max(0.2, (magneticField / 40) * (current / 4));
  
  // Базовый размер стрелок силы Лоренца должен быть заметным даже при слабых полях
  const baseLength = 0.5 * forceStrength * 3; // Увеличиваем множитель для лучшей видимости
  
  arrows.children.forEach((arrowGroupObj) => {
    // Правильное приведение типа
    const arrowGroup = arrowGroupObj as THREE.Group;
    
    // Увеличиваем минимальную длину для лучшей видимости
    const finalLength = Math.max(0.5, baseLength);
    
    // Более выраженная пульсация для улучшения видимости
    const pulseIntensity = Math.min(0.25, forceStrength / 1.5);
    const pulse = 1 + Math.sin(time * 2 + arrowGroup.id * 0.5) * pulseIntensity;
    
    // Линия стрелки
    const line = arrowGroup.children[0] as THREE.Mesh;
    // Наконечник стрелки
    const arrow = arrowGroup.children[1] as THREE.Mesh;
    
    // Масштабируем линию для лучшей видимости
    line.scale.y = finalLength * pulse;
    
    // Перемещаем наконечник на конец линии
    const basePos = (arrowGroup.userData as any).basePosition;
    arrow.position.set(basePos.x, basePos.y, basePos.z + (finalLength * 0.5 * pulse));
    
    // Делаем стрелку более заметной и яркой
    const lineMaterial = line.material as THREE.MeshStandardMaterial;
    const arrowMaterial = arrow.material as THREE.MeshStandardMaterial;
    
    // Меняем цвет от зеленого к более яркому желто-зеленому с увеличением силы
    const intensity = Math.min(1.0, forceStrength * 2);
    const r = 0.1 + intensity * 0.8; // 0.1-0.9
    const g = 0.7 + intensity * 0.3; // 0.7-1.0
    const b = 0.1 + intensity * 0.1; // 0.1-0.2
    
    lineMaterial.color.setRGB(r, g, b);
    arrowMaterial.color.setRGB(r, g, b);
    
    // Увеличиваем яркость эмиссии для лучшего визуального эффекта
    lineMaterial.emissive.setRGB(r*0.7, g*0.7, b*0.1);
    arrowMaterial.emissive.setRGB(r*0.7, g*0.7, b*0.1);
    
    // Значительно увеличиваем интенсивность свечения при сильных полях
    lineMaterial.emissiveIntensity = 0.5 + intensity * 0.9;
    arrowMaterial.emissiveIntensity = 0.5 + intensity * 0.9;
    
    // Меняем толщину линии для лучшей видимости
    line.geometry.dispose();
    const thickness = 0.03 + finalLength * 0.03; // Толщина увеличивается с длиной
    line.geometry = new THREE.CylinderGeometry(thickness, thickness, finalLength, 8);
    
    // Меняем размер наконечника
    arrow.geometry.dispose();
    const arrowSize = 0.08 + finalLength * 0.08;
    arrow.geometry = new THREE.ConeGeometry(arrowSize, arrowSize * 3, 8);
  });
}

// Обновление стрелок магнитного поля - объединенная версия
export function updateMagneticFieldArrows(
  arrows: THREE.Group,
  magneticField: number,
  time: number
): void {
  // Делаем стрелки видимыми даже при малых значениях магнитного поля
  const isVisible = magneticField > 0.05; // Уменьшаем порог видимости
  arrows.visible = isVisible;
  
  if (!isVisible) return;
  
  // Увеличиваем базовый масштаб для лучшей видимости
  const baseScale = Math.max(0.4, (magneticField / 50) * 1.0);
  
  // Добавляем более заметную пульсацию 
  const pulseIntensity = Math.min(0.2, magneticField / 150);
  const pulse = 1 + Math.sin(time * 1.5) * pulseIntensity;
  
  // Цвет и размер стрелок меняются в зависимости от силы поля
  arrows.children.forEach((arrowGroupObj) => {
    // Правильное приведение типа
    const arrowGroup = arrowGroupObj as THREE.Group;
    
    // Постепенно меняем цвет от светло-синего до яркого фиолетового при увеличении поля
    const intensity = Math.min(1.0, magneticField / 80); // Увеличиваем скорость изменения цвета
    const line = arrowGroup.children[0] as THREE.Mesh;
    const arrow = arrowGroup.children[1] as THREE.Mesh;
    
    const lineMaterial = line.material as THREE.MeshStandardMaterial;
    const arrowMaterial = arrow.material as THREE.MeshStandardMaterial;
    
    // Увеличиваем насыщенность цвета для лучшей видимости
    const r = 0.42 + intensity * 0.38; // 0.42-0.8 (от синего к яркому фиолетовому)
    const g = 0.1 + intensity * 0.1;   // 0.1-0.2
    const b = 0.85 - intensity * 0.15;  // 0.85-0.7
    
    lineMaterial.color.setRGB(r, g, b);
    arrowMaterial.color.setRGB(r, g, b);
    
    lineMaterial.emissive.setRGB(r*0.9, g*0.9, b*0.9); // Увеличиваем яркость эмиссии
    arrowMaterial.emissive.setRGB(r*0.9, g*0.9, b*0.9);
    
    // Увеличиваем интенсивность свечения
    lineMaterial.emissiveIntensity = 0.4 + intensity * 0.8;
    arrowMaterial.emissiveIntensity = 0.4 + intensity * 0.8;
    
    // Масштабирование с пульсацией
    const finalScale = baseScale * pulse;
    line.scale.set(finalScale, 1, finalScale);
    
    // Стрелки немного варьируются по размеру для более естественного вида
    const arrowVariation = 1 + Math.sin(arrowGroup.id * 0.5 + time * 1.2) * 0.15;
    arrow.scale.set(finalScale * arrowVariation * 1.4, finalScale * arrowVariation, finalScale * arrowVariation * 1.4);
    
    // Увеличиваем толщину линий для лучшей видимости
    line.geometry.dispose();
    line.geometry = new THREE.CylinderGeometry(0.04 * finalScale, 0.04 * finalScale, 1, 8);
  });
}

// Обновление стрелок тока - объединенная версия
export function updateCurrentArrows(
  mainArrow: THREE.ArrowHelper,
  smallArrows: THREE.Mesh[],
  current: number,
  deltaTime: number
): void {
  // Строгая проверка нулевого тока
  const hasCurrentFlow = current > 0.1;
  
  // Делаем основную стрелку видимой только при наличии тока
  mainArrow.visible = hasCurrentFlow;
  
  if (hasCurrentFlow) {
    // Изменяем размер стрелки тока в зависимости от величины тока
    const arrowScale = 0.7 + (current / 10) * 0.8; // Увеличенный масштаб
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
    if (!hasCurrentFlow) {
      smallArrows.forEach(arrow => {
        arrow.visible = false;
      });
      return;
    }
    
    // Количество видимых стрелок зависит от силы тока - увеличиваем для большей визуальной активности
    const visibleArrows = Math.max(3, Math.min(smallArrows.length, Math.floor(current * 1.5)));
    
    smallArrows.forEach((arrow, index) => {
      // Делаем видимыми только нужное количество стрелок
      arrow.visible = index < visibleArrows;
      
      if (arrow.visible) {
        // Добавляем пульсацию для стрелок тока, зависящую от величины тока
        const pulseIntensity = Math.min(0.15, current / 20);
        const pulseScale = 1 + Math.sin(performance.now() * 0.008 + index * 0.5) * pulseIntensity;
        const baseScale = 0.8 + (current / 10) * 0.8; // Увеличенный базовый масштаб
        arrow.scale.set(baseScale * pulseScale, baseScale * pulseScale, baseScale * pulseScale);
        
        // Корректируем цвет от желтого до красного в зависимости от тока
        const arrowMaterial = arrow.material as THREE.MeshStandardMaterial;
        const hue = 0.05 - (current / 20) * 0.05; // от желтого до красного
        arrowMaterial.emissive.setHSL(hue, 1, 0.5);
        arrowMaterial.emissiveIntensity = 0.3 + current * 0.08; // Увеличенная интенсивность
        
        // Добавляем движение стрелок, чтобы показать поток - скорость зависит от силы тока
        // Увеличиваем скорость для более заметного движения
        const arrowSpeed = 0.05 + current * 0.02;
        arrow.position.x += arrowSpeed * deltaTime;
        if (arrow.position.x > 2.5) {
          arrow.position.x = -2.5 + (index % 3) * 0.2; // Возвращаем в начало с небольшим смещением
        }
      }
    });
  }
}

// Функция создания красивого электрона
export function createBeautifulElectronMesh(position: THREE.Vector3): THREE.Mesh {
  // Создаем материал с эффектом свечения
  const electronMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a56db,
    emissive: 0x3366ff,
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.7,
  });

  // Создаем меш электрона
  const electronGeometry = new THREE.SphereGeometry(0.07, 16, 16);
  const electronMesh = new THREE.Mesh(electronGeometry, electronMaterial);
  electronMesh.position.copy(position);
  
  electronMesh.castShadow = true;
  electronMesh.receiveShadow = true;
  
  return electronMesh;
}

// Создание контактов на концах полупроводника
export function createContacts(): THREE.Group {
  const group = new THREE.Group();
  
  // Создание геометрии и материала для контактов
  const geometry = new THREE.BoxGeometry(0.2, 0.5, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0xFFD700, // Золотой цвет для контактов
    roughness: 0.2,
    metalness: 0.8,
  });
  
  // Левый контакт
  const leftContact = new THREE.Mesh(geometry, material);
  leftContact.position.set(-2.6, 0, 0);
  leftContact.castShadow = true;
  leftContact.receiveShadow = true;
  
  // Правый контакт
  const rightContact = new THREE.Mesh(geometry, material);
  rightContact.position.set(2.6, 0, 0);
  rightContact.castShadow = true;
  rightContact.receiveShadow = true;
  
  group.add(leftContact, rightContact);
  
  return group;
} 