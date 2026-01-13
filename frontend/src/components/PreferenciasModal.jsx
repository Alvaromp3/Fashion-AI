import { useState } from 'react'
import { FaTimes, FaPalette, FaCalendar, FaTshirt } from 'react-icons/fa'

const PreferenciasModal = ({ isOpen, onClose, onGenerate }) => {
  const [preferencias, setPreferencias] = useState({
    colores: [],
    ocasion: '',
    estilo: '',
    incluirVestido: false
  })

  const coloresDisponibles = [
    'negro', 'blanco', 'gris', 'rojo', 'azul', 'verde', 
    'amarillo', 'naranja', 'rosa', 'beige', 'marrón'
  ]

  const occasions = [
    { value: 'casual', label: 'Casual', icon: '👕', desc: 'For everyday wear' },
    { value: 'formal', label: 'Formal', icon: '👔', desc: 'Important events' },
    { value: 'deportivo', label: 'Sporty', icon: '🏃', desc: 'Exercise and activity' },
    { value: 'fiesta', label: 'Party', icon: '🎉', desc: 'Celebrations' },
    { value: 'trabajo', label: 'Work', icon: '💼', desc: 'Professional office' }
  ]

  const styles = [
    { value: 'minimalista', label: 'Minimalist', icon: '⚪', desc: 'Neutral colors' },
    { value: 'colorido', label: 'Colorful', icon: '🌈', desc: 'Vibrant colors' },
    { value: 'elegante', label: 'Elegant', icon: '✨', desc: 'Sophisticated' },
    { value: 'moderno', label: 'Modern', icon: '🔥', desc: 'Current trend' }
  ]

  const toggleColor = (color) => {
    setPreferencias(prev => ({
      ...prev,
      colores: prev.colores.includes(color)
        ? prev.colores.filter(c => c !== color)
        : [...prev.colores, color]
    }))
  }

  const handleGenerate = () => {
    onGenerate(preferencias)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-large max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-center z-10">
          <h2 className="text-2xl font-semibold text-gray-900">Outfit Preferences</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 rounded-lg bg-gray-100">
                <FaPalette className="text-gray-700 text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Preferred Colors</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Select the colors you like (optional)</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {coloresDisponibles.map(color => (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    preferencias.colores.includes(color)
                      ? 'border-gray-900 bg-gray-900 text-white shadow-soft'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="capitalize">{color}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 rounded-lg bg-gray-100">
                <FaCalendar className="text-gray-700 text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Occasion</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">What occasion do you need the outfit for?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {occasions.map(ocasion => (
                <button
                  key={ocasion.value}
                  onClick={() => setPreferencias(prev => ({ ...prev, ocasion: ocasion.value }))}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    preferencias.ocasion === ocasion.value
                      ? 'border-gray-900 bg-gray-900 text-white shadow-soft'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <span className="text-2xl mr-2">{ocasion.icon}</span>
                    <span className="font-medium text-sm">{ocasion.label}</span>
                  </div>
                  <p className={`text-xs mt-1 ${preferencias.ocasion === ocasion.value ? 'text-white/80' : 'text-gray-500'}`}>
                    {ocasion.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 rounded-lg bg-gray-100">
                <FaTshirt className="text-gray-700 text-sm" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Style</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">What style do you prefer?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {styles.map(estilo => (
                <button
                  key={estilo.value}
                  onClick={() => setPreferencias(prev => ({ ...prev, estilo: estilo.value }))}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    preferencias.estilo === estilo.value
                      ? 'border-gray-900 bg-gray-900 text-white shadow-soft'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{estilo.icon}</div>
                  <div className="font-medium text-sm">{estilo.label}</div>
                  <div className={`text-xs mt-1 ${preferencias.estilo === estilo.value ? 'text-white/80' : 'text-gray-500'}`}>
                    {estilo.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferencias.incluirVestido}
                onChange={(e) => setPreferencias(prev => ({ ...prev, incluirVestido: e.target.checked }))}
                className="w-5 h-5 text-gray-900 rounded border-gray-300 focus:ring-gray-900"
              />
              <span className="text-gray-700 font-medium text-sm">Include dresses in recommendations</span>
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-5 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-soft"
          >
            Generate 3 Outfits
          </button>
        </div>
      </div>
    </div>
  )
}

export default PreferenciasModal
