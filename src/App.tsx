import './App.css'
import { HallEffect3D } from './components/HallEffect3D'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
          Hall Effect Simulator (3D)
        </h1>
        <HallEffect3D />
      </div>
    </div>
  )
}

export default App
