import { useState, useEffect, useRef } from 'react';
import { Slider } from './ui/slider';
import { Card } from './ui/card';

interface Electron {
  x: number;
  y: number;
  id: number;
  velocity: number;
}

export const HallEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const electronsRef = useRef<Electron[]>([]);
  const animationFrameRef = useRef<number>(0);
  const [current, setCurrent] = useState<number>(7); // mA
  const [magneticField, setMagneticField] = useState<number>(49.33); // * 10^3 A/m
  const [isRunning, setIsRunning] = useState(true);

  // Initialize electrons
  useEffect(() => {
    electronsRef.current = Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 400,
      y: 150,
      id: i,
      velocity: Math.random() * 0.5 + 0.5, // Random velocity for more natural movement
    }));
  }, []);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !isRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!isRunning) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw semiconductor with gradient
      const gradient = ctx.createLinearGradient(50, 100, 50, 200);
      gradient.addColorStop(0, '#e2e8f0');
      gradient.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = gradient;
      ctx.fillRect(50, 100, 400, 100);

      // Draw magnetic field visualization
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      for (let x = 100; x <= 400; x += 50) {
        ctx.fillText('⊗', x, 50);
      }

      // Draw magnetic field lines
      ctx.strokeStyle = '#93c5fd';
      ctx.setLineDash([5, 5]);
      for (let x = 100; x <= 400; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 30);
        ctx.lineTo(x, 70);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw current direction with arrow
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, 150);
      ctx.lineTo(470, 150);
      ctx.stroke();

      // Draw arrow head
      ctx.beginPath();
      ctx.moveTo(470, 150);
      ctx.lineTo(460, 145);
      ctx.lineTo(460, 155);
      ctx.fillStyle = '#dc2626';
      ctx.fill();

      // Update and draw electrons
      electronsRef.current = electronsRef.current.map(electron => {
        // Move electrons based on current and individual velocity
        let newX = electron.x + (current * 0.3 * electron.velocity);
        
        // Hall effect deviation with smooth transition
        let deviation = (magneticField * current * 0.0001);
        let newY = electron.y + deviation * electron.velocity;

        // Keep electrons within bounds
        if (newX > 450) newX = 50;
        if (newY < 110) newY = 110;
        if (newY > 190) newY = 190;

        // Draw electron with glow effect
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(newX, newY, 0, newX, newY, 4);
        gradient.addColorStop(0, '#60a5fa');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(newX, newY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw electron core
        ctx.beginPath();
        ctx.arc(newX, newY, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#2563eb';
        ctx.fill();

        return {
          ...electron,
          x: newX,
          y: newY,
        };
      });

      // Draw Hall voltage indicator
      const hallVoltage = (current * magneticField * 0.001).toFixed(2);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      
      // Draw voltage difference indicators
      ctx.beginPath();
      ctx.moveTo(250, 90);
      ctx.lineTo(250, 210);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw voltage labels
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'right';
      ctx.fillText('+', 245, 95);
      ctx.fillText('−', 245, 205);
      
      // Draw Hall voltage value
      ctx.textAlign = 'left';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(`Hall Voltage: ${hallVoltage} mV`, 50, 270);

      // Add explanatory text with better styling
      ctx.fillStyle = '#475569';
      ctx.font = '13px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Magnetic Field (B) ⊗', 50, 50);
      ctx.fillText('Current (I) →', 50, 80);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [current, magneticField, isRunning]);

  return (
    <Card className="p-6 max-w-3xl mx-auto mt-8 bg-white shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Hall Effect Visualization</h2>
      <p className="text-gray-600 mb-6">
        Observe how electrons (blue dots) deviate in the presence of a magnetic field,
        creating the Hall effect. Adjust the current and magnetic field strength to see
        their impact on the electron movement and Hall voltage.
      </p>
      <div className="space-y-6">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={500}
            height={300}
            className="border border-gray-200 rounded-lg shadow-inner bg-gray-50"
          />
        </div>
        
        <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Current Intensity (mA): {current}
            </label>
            <Slider
              value={[current]}
              onValueChange={(values: number[]) => setCurrent(values[0])}
              min={1}
              max={15}
              step={0.1}
              className="my-4"
            />
            <p className="text-xs text-gray-500">
              Controls the flow of electrons through the semiconductor
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Magnetic Field Strength (×10³ A/m): {magneticField}
            </label>
            <Slider
              value={[magneticField]}
              onValueChange={(values: number[]) => setMagneticField(values[0])}
              min={10}
              max={100}
              step={0.1}
              className="my-4"
            />
            <p className="text-xs text-gray-500">
              Affects the deflection of electrons perpendicular to current flow
            </p>
          </div>

          <button
            onClick={() => setIsRunning(prev => !prev)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                     transition-colors duration-200 font-medium shadow-sm"
          >
            {isRunning ? 'Pause Animation' : 'Resume Animation'}
          </button>
        </div>
      </div>
    </Card>
  );
}; 