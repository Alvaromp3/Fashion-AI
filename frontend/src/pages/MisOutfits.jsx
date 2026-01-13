import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { FaMagic, FaSave, FaTrash, FaCog, FaStar } from 'react-icons/fa'
import axios from 'axios'
import OutfitCard from '../components/OutfitCard'
import PreferenciasModal from '../components/PreferenciasModal'

const MisOutfits = () => {
  const [outfits, setOutfits] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPreferencias, setShowPreferencias] = useState(false)
  const [activeTab, setActiveTab] = useState('recomendaciones') // 'recomendaciones' o 'guardados'
  const location = useLocation()

  useEffect(() => {
    fetchOutfits()
    
    if (location.state?.recommendations) {
      setRecommendations(location.state.recommendations)
    }
  }, [location])

  const fetchOutfits = async () => {
    try {
      const response = await axios.get('/api/outfits')
      setOutfits(response.data)
    } catch (error) {
      console.error('Error obteniendo outfits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (preferencias = {}) => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (preferencias.colores && preferencias.colores.length > 0) {
        params.append('colores', JSON.stringify(preferencias.colores))
      }
      if (preferencias.ocasion) {
        params.append('ocasion', preferencias.ocasion)
      }
      if (preferencias.estilo) {
        params.append('estilo', preferencias.estilo)
      }
      if (preferencias.incluirVestido) {
        params.append('incluirVestido', 'true')
      }
      
      const queryString = params.toString()
      const url = `/api/outfits/recommend${queryString ? '?' + queryString : ''}`
      
      const response = await axios.get(url)
      setRecommendations(response.data)
    } catch (error) {
      console.error('Error generando outfits:', error)
      alert('Error generating outfits. Make sure you have garments of all types.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveOutfit = async (outfit) => {
    try {
      await axios.post('/api/outfits/save', {
        superior_id: outfit.superior._id,
        inferior_id: outfit.inferior._id,
        zapatos_id: outfit.zapatos._id,
        puntuacion: outfit.puntuacion
      })
      alert('Outfit saved successfully')
      fetchOutfits()
      setRecommendations(recommendations.filter((_, i) => 
        recommendations.indexOf(outfit) !== i
      ))
    } catch (error) {
      console.error('Error guardando outfit:', error)
      alert('Error saving the outfit')
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/outfits/${id}`)
      fetchOutfits()
    } catch (error) {
      console.error('Error eliminando outfit:', error)
      alert('Error deleting the outfit')
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">
            My Outfits
          </h1>
          
          {/* Tabs */}
          <div className="flex space-x-2 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('recomendaciones')}
              className={`px-6 py-3 font-medium text-sm transition-all relative ${
                activeTab === 'recomendaciones'
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Recommendations
              {activeTab === 'recomendaciones' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('guardados')}
              className={`px-6 py-3 font-medium text-sm transition-all relative ${
                activeTab === 'guardados'
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Saved
              {activeTab === 'guardados' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></span>
              )}
              {outfits.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {outfits.length}
                </span>
              )}
            </button>
          </div>

          {/* Botones de acción solo en tab de recomendaciones */}
          {activeTab === 'recomendaciones' && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={() => handleGenerate({})}
                disabled={loading}
                className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-medium hover:shadow-large disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <FaStar />
                <span>Surprise Me</span>
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreferencias(true)}
                  className="bg-white text-gray-700 px-6 py-4 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-soft border border-gray-200 flex items-center space-x-2"
                >
                  <FaCog />
                  <span>Preferences</span>
                </button>
                <button
                  onClick={() => handleGenerate()}
                  disabled={loading}
                  className="bg-white text-gray-700 px-6 py-4 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-soft border border-gray-200 disabled:opacity-50 flex items-center space-x-2"
                >
                  <FaMagic />
                  <span>Generate</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <PreferenciasModal
          isOpen={showPreferencias}
          onClose={() => setShowPreferencias(false)}
          onGenerate={handleGenerate}
        />

        {/* Contenido de las tabs */}
        {activeTab === 'recomendaciones' && (
          <div>
            {recommendations.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900">Recommendations</h2>
                  <span className="text-sm text-gray-500">{recommendations.length} outfits</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {recommendations.map((outfit, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
                      <OutfitCard outfit={outfit} />
                      <div className="p-5 border-t border-gray-100 bg-gray-50">
                        <button
                          onClick={() => handleSaveOutfit(outfit)}
                          className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-soft hover:shadow-medium flex items-center justify-center space-x-2"
                        >
                          <FaSave />
                          <span>Save Outfit</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
                <FaMagic className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No recommendations yet.</p>
                <p className="text-sm text-gray-400">Click "Surprise Me" or "Generate" to get personalized outfits.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'guardados' && (
          <div>
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
              </div>
            ) : outfits.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
                <FaSave className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No saved outfits yet.</p>
                <p className="text-sm text-gray-400">Save your favorite outfits from the Recommendations tab.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900">Saved Outfits</h2>
                  <span className="text-sm text-gray-500">{outfits.length} outfit{outfits.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {outfits.map((outfit) => (
                    <div key={outfit._id} className="bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100">
                      <OutfitCard outfit={outfit} onDelete={fetchOutfits} />
                      <div className="p-5 border-t border-gray-100 bg-gray-50">
                        <button
                          onClick={() => handleDelete(outfit._id)}
                          className="w-full bg-white text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-soft border border-gray-200 hover:border-gray-300 flex items-center justify-center space-x-2"
                        >
                          <FaTrash />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MisOutfits
