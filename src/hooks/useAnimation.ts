import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { Electron } from '../types/hall-effect';
import { ANIMATION_CONSTANTS, SIMULATION_LIMITS } from '../config/constants';

export const useAnimation = (
  isRunning: boolean,
  current: number,
  magneticField: number
) => {
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const electronsRef = useRef<Electron[]>([]);

  const updateElectronPositions = useCallback((deltaTime: number) => {
    electronsRef.current.forEach(electron => {
      // Обновление позиции на основе тока и скорости
      electron.position.x += current * 
        ANIMATION_CONSTANTS.CURRENT_MULTIPLIER * 
        electron.velocity.x * 
        deltaTime;
      
      // Применение эффекта Холла
      const magneticForce = magneticField * 
        current * 
        ANIMATION_CONSTANTS.MAGNETIC_FORCE_MULTIPLIER * 
        deltaTime;
      electron.position.y += magneticForce;

      // Добавление случайного движения
      electron.position.y += (Math.random() - 0.5) * ANIMATION_CONSTANTS.RANDOM_MOVEMENT_FACTOR;
      electron.position.z += (Math.random() - 0.5) * ANIMATION_CONSTANTS.RANDOM_MOVEMENT_FACTOR;

      // Проверка границ и сброс позиции
      if (electron.position.x > SIMULATION_LIMITS.POSITION.X_MAX) {
        electron.position.x = -SIMULATION_LIMITS.POSITION.X_MAX;
        electron.position.y = Math.random() * SIMULATION_LIMITS.POSITION.Y_MAX * 2 - SIMULATION_LIMITS.POSITION.Y_MAX;
        electron.position.z = Math.random() * SIMULATION_LIMITS.POSITION.Z_MAX * 2 - SIMULATION_LIMITS.POSITION.Z_MAX;
      }
      
      if (Math.abs(electron.position.y) > SIMULATION_LIMITS.POSITION.Y_MAX) {
        electron.position.y = Math.sign(electron.position.y) * SIMULATION_LIMITS.POSITION.Y_MAX;
      }
      
      if (Math.abs(electron.position.z) > SIMULATION_LIMITS.POSITION.Z_MAX) {
        electron.position.z = Math.sign(electron.position.z) * SIMULATION_LIMITS.POSITION.Z_MAX;
      }

      // Обновление позиции меша
      electron.mesh.position.copy(electron.position);
    });
  }, [current, magneticField]);

  const animate = useCallback((currentTime: number) => {
    if (!isRunning) return;

    const deltaTime = (currentTime - lastTimeRef.current) * 0.001;
    lastTimeRef.current = currentTime;

    updateElectronPositions(deltaTime);

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isRunning, updateElectronPositions]);

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, animate]);

  return {
    electronsRef,
    updateElectronPositions
  };
}; 