import { FaStar, FaTrash } from 'react-icons/fa'
import axios from 'axios'

const OutfitCard = ({ outfit, onDelete }) => {
  const getImageUrl = (url) => {
    if (!url) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23a3a3a3" font-size="12"%3ENo img%3C/text%3E%3C/svg%3E'
    }
    if (url.startsWith('http')) return url
    if (url.startsWith('/uploads/')) return url
    if (!url.startsWith('/')) return `/${url}`
    return url
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this outfit?')) {
      try {
        await axios.delete(`/api/outfits/${outfit._id}`)
        if (onDelete) onDelete()
      } catch (error) {
        console.error('Error eliminando outfit:', error)
        alert('Error deleting the outfit')
      }
    }
  }

  const superior = outfit.superior_id || outfit.superior
  const inferior = outfit.inferior_id || outfit.inferior
  const zapatos = outfit.zapatos_id || outfit.zapatos

  const getPuntuacionColor = (puntuacion) => {
    const score = puntuacion || 0
    if (score >= 80) return 'bg-gray-900 text-white'
    if (score >= 60) return 'bg-gray-700 text-white'
    return 'bg-gray-600 text-white'
  }

  const getPuntuacionBadge = (puntuacion) => {
    const score = puntuacion || 0
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    return 'Acceptable'
  }

  const placeholderImg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f5f5f5"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23a3a3a3" font-size="12"%3ENo img%3C/text%3E%3C/svg%3E'

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-medium transition-all border border-gray-100">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${getPuntuacionColor(outfit?.puntuacion || 0)}`}>
            <div className="flex items-center space-x-2">
              <FaStar className="text-xs" />
              <span>{outfit?.puntuacion || 0}/100</span>
            </div>
            <span className="text-xs block mt-1 opacity-90">{getPuntuacionBadge(outfit?.puntuacion || 0)}</span>
          </div>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaTrash className="text-sm" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-5 text-center">Complete Outfit</h3>
          
          <div className="grid grid-cols-3 gap-3">
            {superior && superior.imagen_url && (
              <div className="text-center">
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                    <img
                      src={getImageUrl(superior.imagen_url)}
                      alt="Top"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = placeholderImg
                      }}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-900 mb-0.5">Top</p>
                  <p className="text-xs text-gray-500 capitalize">{superior.clase_nombre || 'N/A'}</p>
                  <p className="text-xs text-gray-400 capitalize mt-1">{superior.color || 'N/A'}</p>
                </div>
              </div>
            )}

            {inferior && inferior.imagen_url && (
              <div className="text-center">
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                    <img
                      src={getImageUrl(inferior.imagen_url)}
                      alt="Bottom"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = placeholderImg
                      }}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-900 mb-0.5">Bottom</p>
                  <p className="text-xs text-gray-500 capitalize">{inferior.clase_nombre || 'N/A'}</p>
                  <p className="text-xs text-gray-400 capitalize mt-1">{inferior.color || 'N/A'}</p>
                </div>
              </div>
            )}

            {zapatos && zapatos.imagen_url && (
              <div className="text-center">
                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                    <img
                      src={getImageUrl(zapatos.imagen_url)}
                      alt="Shoes"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = placeholderImg
                      }}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-900 mb-0.5">Shoes</p>
                  <p className="text-xs text-gray-500 capitalize">{zapatos.clase_nombre || 'N/A'}</p>
                  <p className="text-xs text-gray-400 capitalize mt-1">{zapatos.color || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OutfitCard
