# Hall Effect 3D Visualization

An interactive 3D visualization of the Hall Effect implemented using React, Three.js, and TypeScript. This educational tool demonstrates the physics of the Hall Effect with accurate electron behavior, magnetic field interactions, and current flow visualization.

## Overview

The Hall Effect is a fundamental phenomenon in electromagnetism where a voltage difference (Hall voltage) is produced across an electrical conductor, transverse to the electric current and magnetic field. This visualization demonstrates:

- Electron movement in a semiconductor
- Electron deflection due to the Lorentz force
- Charge accumulation on semiconductor edges
- Visual representation of current and magnetic field

## Tech Stack

- **React** - User interface and component structure
- **Three.js** - 3D visualization engine
- **TypeScript** - Type safety and improved development experience
- **Tailwind CSS** - Styling and responsive design

## Project Structure

```
src/
├── widgets/
│   └── hall-effect-visualization/
│       ├── config/
│       │   └── constants.ts           # Physics and visual constants
│       ├── lib/
│       │   ├── components/            # Visualization components
│       │   │   ├── arrows.ts          # Arrow visualizations
│       │   │   ├── current.ts         # Current flow visualization
│       │   │   ├── environment.ts     # Scene environment
│       │   │   ├── magnetic-field.ts  # Magnetic field visualization
│       │   │   └── semiconductor.ts   # Semiconductor visualization
│       │   ├── physics/               # Physics calculations
│       │   ├── utils/                 # Utility functions
│       │   │   └── types.ts           # Type definitions
│       │   ├── electron-simulation.ts # Electron simulation logic
│       │   └── visualization.ts       # Main visualization setup
│       └── ui/                        # React components
├── components/                        # Shared React components
└── ...
```

## Physics Model

### Key Components

1. **Electrons**
   - Represented as glowing spherical particles
   - Move against conventional current direction (physically accurate)
   - Affected by Lorentz force in magnetic field
   - Accumulate at semiconductor edges

2. **Magnetic Field**
   - Directed vertically (along y-axis)
   - Visualized with arrows and field lines
   - Strength proportional to user input

3. **Current Flow**
   - Directed along the semiconductor length
   - Determines electron velocity
   - Visualized with animated arrows

4. **Hall Voltage**
   - Created by charge accumulation
   - Proportional to current and magnetic field strength
   - Visualized as a potential difference across semiconductor

### Formulas and Physics

1. **Lorentz Force**:
   ```
   F = q[v×B]
   ```
   where:
   - q - electron charge (negative)
   - v - electron velocity vector
   - B - magnetic field vector
   - × - cross product

2. **Hall Voltage**:
   ```
   V_H = (I×B)/(n×e×d)
   ```
   where:
   - I - current
   - B - magnetic field strength
   - n - charge carrier density
   - e - elementary charge
   - d - semiconductor thickness

## Key Features

1. **High-Performance Rendering**
   - Optimized Three.js rendering pipeline
   - Efficient electron movement calculations
   - Limited deltaTime for animation stability

2. **Physics Accuracy**
   - Proper Lorentz force calculations
   - Realistic electron behavior
   - Accurate visualization of Hall Effect phenomena

3. **Visual Quality**
   - Custom materials with emissive properties
   - Realistic lighting and shadows
   - Smooth animations and transitions

4. **Responsive Interface**
   - Adapts to different screen sizes
   - Intuitive controls for current and magnetic field
   - Real-time parameter updates

## Implementation Details

### Electron Simulation

The electron simulation is handled by the `ElectronSimulation` class, which:
- Creates and manages electron particles
- Calculates electron movement based on current
- Applies Lorentz force based on magnetic field
- Handles visual effects like pulsating size and color

```typescript
// Key methods:
initializeElectrons(count: number): Electron[]
updateElectrons(electrons: Electron[], deltaTime: number, current: number, magneticField: number): void
```

### Visualization Elements

1. **Magnetic Field Arrows**
   - Direction indicates field orientation
   - Size and opacity reflect field strength
   - Blue color for easy identification

2. **Current Arrows**
   - Flow along semiconductor length
   - Size and animation speed reflect current strength
   - Red/orange color scheme

3. **Semiconductor**
   - Semi-transparent to show internal electron movement
   - Side contacts for Hall voltage measurement
   - Optional doping visualization

4. **Environment**
   - Grid and ground plane for spatial reference
   - Ambient and directional lighting
   - Camera controls for user exploration

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Current Control**:
   - Adjust slider to set current value (0-10 A)
   - Affects electron speed and Hall Effect magnitude

2. **Magnetic Field Control**:
   - Adjust slider to set magnetic field strength (0-100 mT)
   - Affects electron deflection and Hall voltage

3. **Visualization Interactions**:
   - Rotate: Left-click drag
   - Pan: Right-click drag
   - Zoom: Mouse wheel

## License

MIT
