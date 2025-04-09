import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Функция для объединения классов Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Константы для эффекта Холла
export const HALL_EFFECT_CONSTANTS = {
  ELECTRON_CHARGE: 1.602e-19, // Заряд электрона в Кулонах
  ELECTRON_MASS: 9.109e-31,   // Масса электрона в кг
  BOLTZMANN_CONSTANT: 1.380649e-23, // Постоянная Больцмана
  ROOM_TEMPERATURE: 293.15,   // Комнатная температура в Кельвинах
}

// Функции для расчетов эффекта Холла
export const calculateHallVoltage = (
  current: number,     // Ток в амперах
  magneticField: number, // Магнитное поле в теслах
  thickness: number,   // Толщина образца в метрах
  carrierDensity: number // Плотность носителей заряда
): number => {
  const hallCoefficient = 1 / (carrierDensity * HALL_EFFECT_CONSTANTS.ELECTRON_CHARGE)
  return (hallCoefficient * current * magneticField) / thickness
}

export const calculateLorentzForce = (
  charge: number,      // Заряд частицы
  velocity: number,    // Скорость частицы
  magneticField: number // Магнитное поле
): number => {
  return charge * velocity * magneticField
}

// Функции для форматирования значений
export const formatScientific = (num: number, precision: number = 2): string => {
  return num.toExponential(precision)
}

export const formatWithUnit = (value: number, unit: string): string => {
  return `${value.toFixed(2)} ${unit}`
} 