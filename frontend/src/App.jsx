import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import MisPrendas from './pages/MisPrendas'
import MisOutfits from './pages/MisOutfits'
import ConfusionMatrix from './pages/ConfusionMatrix'
import ModelExamples from './pages/ModelExamples'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/prendas" element={<MisPrendas />} />
          <Route path="/outfits" element={<MisOutfits />} />
          <Route path="/modelo/confusion-matrix" element={<ConfusionMatrix />} />
          <Route path="/modelo/ejemplos" element={<ModelExamples />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

