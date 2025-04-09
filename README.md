# Визуализация эффекта Холла

Интерактивная 3D визуализация эффекта Холла, реализованная с использованием React, Three.js и TypeScript.

## Описание

Данное приложение демонстрирует эффект Холла - физическое явление, возникающее при протекании тока через проводник, помещенный в магнитное поле. Визуализация позволяет наблюдать:
- Движение электронов в проводнике
- Отклонение электронов под действием силы Лоренца
- Влияние величины тока и магнитного поля на поведение электронов

## Технологический стек

- **React** - для построения пользовательского интерфейса
- **Three.js** - для 3D визуализации
- **TypeScript** - для типизации и улучшения разработки
- **Tailwind CSS** - для стилизации компонентов

## Архитектура

Проект организован по методологии Feature-Sliced Design (FSD):

```
src/
├── app/               # Инициализация приложения
├── entities/          # Бизнес-сущности
│   └── electron/      # Сущность электрона
│       ├── model/     # Типы и константы
│       ├── lib/       # Утилиты
│       └── ui/        # Компоненты визуализации
├── features/          # Функциональные модули
│   └── hall-effect/   # Функционал эффекта Холла
│       ├── model/     # Логика симуляции
│       └── ui/        # Компоненты управления
├── widgets/           # Композиционные блоки
│   └── hall-effect-visualization/
│       └── ui/        # Основной компонент визуализации
└── shared/           # Переиспользуемые ресурсы
    ├── ui/           # UI компоненты
    ├── lib/          # Общие утилиты
    └── config/       # Конфигурации
```

## Физическая модель

### Основные компоненты
1. **Электроны**
   - Представлены как сферические частицы
   - Движутся против направления тока
   - Подвержены силе Лоренца в магнитном поле

2. **Магнитное поле**
   - Направлено вертикально вниз
   - Визуализируется стрелками
   - Сила пропорциональна заданному значению

3. **Электрический ток**
   - Направлен вдоль проводника
   - Определяет скорость движения электронов

### Формулы и расчеты

1. **Сила Лоренца**:
   ```
   F = q[v×B]
   ```
   где:
   - q - заряд электрона (отрицательный)
   - v - вектор скорости электрона
   - B - вектор магнитного поля
   - × - векторное произведение

2. **Отклонение электронов**:
   - Направление определяется правилом левой руки
   - Величина пропорциональна току и магнитному полю

## Использование

1. **Управление током**:
   - Ползунок в диапазоне 0-10 А
   - Влияет на скорость движения электронов

2. **Управление магнитным полем**:
   - Ползунок в диапазоне 0-100 мТл
   - Влияет на силу отклонения электронов

## Установка и запуск

1. Клонируйте репозиторий:
   ```bash
   git clone [url-репозитория]
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Запустите проект:
   ```bash
   npm run dev
   ```

## Особенности реализации

1. **Производительность**:
   - Оптимизированный рендеринг Three.js
   - Ограничение deltaTime для стабильной анимации
   - Эффективное управление ресурсами WebGL

2. **Физическая точность**:
   - Корректное моделирование эффекта Холла
   - Реалистичное поведение электронов
   - Точные векторные расчеты

3. **Пользовательский опыт**:
   - Интуитивное управление
   - Плавная анимация
   - Информативная визуализация

## Разработка

### Добавление новых функций

1. Создайте новую фичу в директории `features/`
2. Добавьте необходимые компоненты в `shared/ui/`
3. Интегрируйте в основной компонент визуализации

### Модификация физической модели

1. Измените константы в `entities/electron/model/constants.ts`
2. Обновите расчеты в `features/hall-effect/model/HallEffectSimulation.ts`

## Лицензия

MIT
