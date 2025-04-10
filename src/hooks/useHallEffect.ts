import { useState, useCallback } from 'react';
import { HallEffectParameters, ExperimentResult } from '../types/hall-effect';
import { HALL_EFFECT_CONSTANTS, calculateHallVoltage, calculateLorentzForce } from '../lib/utils';

const DEFAULT_PARAMETERS: HallEffectParameters = {
  current: 7,
  magneticField: 49.33,
  thickness: 1,
  carrierDensity: 1e23,
  temperature: HALL_EFFECT_CONSTANTS.ROOM_TEMPERATURE
};

export const useHallEffect = (initialParams?: Partial<HallEffectParameters>) => {
  const [parameters, setParameters] = useState<HallEffectParameters>({
    ...DEFAULT_PARAMETERS,
    ...initialParams
  });

  const [results, setResults] = useState<ExperimentResult>({
    hallVoltage: 0,
    lorentzForce: 0,
    hallCoefficient: 0,
    mobility: 0
  });

  const calculateResults = useCallback(() => {
    const { current, magneticField, thickness, carrierDensity } = parameters;

    // Перевод значений в СИ
    const currentSI = current * 1e-3; // мА в А
    const magneticFieldSI = magneticField * 1e3; // 10³ А/м в А/м
    const thicknessSI = thickness * 1e-3; // мм в м

    // Расчет напряжения Холла
    const hallVoltage = calculateHallVoltage(
      currentSI,
      magneticFieldSI,
      thicknessSI,
      carrierDensity
    );

    // Расчет коэффициента Холла
    const hallCoefficient = 1 / (carrierDensity * HALL_EFFECT_CONSTANTS.ELECTRON_CHARGE);

    // Расчет силы Лоренца
    const electronVelocity = currentSI / (carrierDensity * HALL_EFFECT_CONSTANTS.ELECTRON_CHARGE * thicknessSI);
    const lorentzForce = calculateLorentzForce(
      HALL_EFFECT_CONSTANTS.ELECTRON_CHARGE,
      electronVelocity,
      magneticFieldSI
    );

    // Расчет подвижности носителей заряда
    const mobility = Math.abs(hallCoefficient) * carrierDensity * HALL_EFFECT_CONSTANTS.ELECTRON_CHARGE;

    setResults({
      hallVoltage,
      lorentzForce,
      hallCoefficient,
      mobility
    });
  }, [parameters]);

  const updateParameters = useCallback((newParams: Partial<HallEffectParameters>) => {
    setParameters(prev => ({ ...prev, ...newParams }));
  }, []);

  return {
    parameters,
    results,
    updateParameters,
    calculateResults
  };
}; 