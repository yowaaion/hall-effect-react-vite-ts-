import './App.css'
import { HallEffect3D } from './widgets/hall-effect-visualization/ui/HallEffect3D'

function App() {
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 py-8 overflow-hidden">
      <div className="container mx-auto px-4 h-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          Hall Effect Simulator (3D)
        </h1>
        <div className="w-full h-full min-h-[calc(100vh-200px)]">
          <HallEffect3D />
        </div>
      </div>
    </div>
  )
}

export default App
