import { useState, useEffect } from 'react'
import { FaFilter, FaUpload } from 'react-icons/fa'
import axios from 'axios'
import PrendaCard from '../components/PrendaCard'
import UploadModal from '../components/UploadModal'
import EditOcasionModal from '../components/EditOcasionModal'

const MisPrendas = () => {
  const [prendas, setPrendas] = useState([])
  const [filteredPrendas, setFilteredPrendas] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPrenda, setSelectedPrenda] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrendas()
  }, [])

  useEffect(() => {
    filterPrendas()
  }, [prendas, selectedFilter])

  const fetchPrendas = async () => {
    try {
      const response = await axios.get('/api/prendas')
      setPrendas(response.data)
    } catch (error) {
      console.error('Error obteniendo prendas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterPrendas = () => {
    if (selectedFilter === 'all') {
      setFilteredPrendas(prendas)
    } else {
      setFilteredPrendas(prendas.filter(p => p.tipo === selectedFilter))
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/prendas/${id}`)
      fetchPrendas()
    } catch (error) {
      console.error('Error eliminando prenda:', error)
      alert('Error deleting the garment')
    }
  }

  const handleEdit = (prenda) => {
    setSelectedPrenda(prenda)
    setShowEditModal(true)
  }

  const tipos = ['all', 'superior', 'inferior', 'zapatos', 'abrigo', 'vestido']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-4 sm:mb-0">
          My Garments
        </h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors flex items-center space-x-2"
        >
          <FaUpload />
          <span>Upload Garment</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FaFilter className="text-gray-600 mt-2" />
        {tipos.map((tipo) => (
          <button
            key={tipo}
            onClick={() => setSelectedFilter(tipo)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedFilter === tipo
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </button>
        ))}
      </div>

      {/* Galería */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredPrendas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {selectedFilter === 'all'
              ? 'No garments yet. Upload your first garment!'
              : `No garments of type "${selectedFilter}"`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPrendas.map((prenda) => (
            <PrendaCard
              key={prenda._id}
              prenda={prenda}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Modal de subir prenda */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            fetchPrendas()
            setShowUploadModal(false)
          }}
        />
      )}

      {/* Modal de editar ocasión */}
      {showEditModal && selectedPrenda && (
        <EditOcasionModal
          prenda={selectedPrenda}
          onClose={() => {
            setShowEditModal(false)
            setSelectedPrenda(null)
          }}
          onSuccess={() => {
            fetchPrendas()
            setShowEditModal(false)
            setSelectedPrenda(null)
          }}
        />
      )}
    </div>
  )
}

export default MisPrendas

