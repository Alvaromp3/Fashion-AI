import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUpload, FaMagic, FaTshirt, FaArrowRight, FaBrain, FaImage, FaChartLine, FaStar } from 'react-icons/fa'
import axios from 'axios'
import UploadModal from '../components/UploadModal'
import PrendaCard from '../components/PrendaCard'
import OutfitCard from '../components/OutfitCard'

const Dashboard = () => {
  const [prendas, setPrendas] = useState([])
  const [outfits, setOutfits] = useState([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPrendas()
    fetchOutfits()
  }, [])

  const fetchPrendas = async () => {
    try {
      const response = await axios.get('/api/prendas')
      setPrendas(response.data.slice(0, 6))
    } catch (error) {
      console.error('Error obteniendo prendas:', error)
      setPrendas([])
    } finally {
      setLoading(false)
    }
  }

  const fetchOutfits = async () => {
    try {
      const response = await axios.get('/api/outfits')
      setOutfits(response.data.slice(0, 3))
    } catch (error) {
      console.error('Error obteniendo outfits:', error)
      setOutfits([])
    }
  }

  const handleGenerateOutfit = async () => {
    navigate('/outfits')
  }

  const handlePrendaAdded = () => {
    fetchPrendas()
    setShowUploadModal(false)
  }

  const handleDeletePrenda = async (id) => {
    try {
      await axios.delete(`/api/prendas/${id}`)
      fetchPrendas()
    } catch (error) {
      console.error('Error eliminando prenda:', error)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Fashion AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Automatically classify your garments and receive personalized outfit recommendations
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gray-900 text-white px-8 py-4 rounded-xl text-base font-medium hover:bg-gray-800 transition-all shadow-medium hover:shadow-large flex items-center justify-center space-x-2"
          >
            <FaUpload />
            <span>Upload Garment</span>
          </button>
          
          <button
            onClick={handleGenerateOutfit}
            className="bg-white text-gray-900 px-8 py-4 rounded-xl text-base font-medium hover:bg-gray-50 transition-all shadow-soft hover:shadow-medium border border-gray-200 flex items-center justify-center space-x-2"
          >
            <FaMagic />
            <span>Generate Outfits</span>
          </button>
        </div>

        <div className="mb-16 bg-white rounded-2xl shadow-soft border border-gray-100 p-8 lg:p-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-gray-900">
              <FaBrain className="text-white text-xl" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-900">How does our AI work?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-gray-100 flex-shrink-0">
                  <FaImage className="text-gray-700 text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. Automatic Classification</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Upload a photo of your garment and our CNN (Convolutional Neural Network) model automatically analyzes it. 
                    Identifies the type of garment (T-shirt, Pullover, Pants, Sneakers, etc.) with 87% accuracy.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-gray-100 flex-shrink-0">
                  <FaStar className="text-gray-700 text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. Color Detection</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Our algorithm analyzes the image to detect the dominant color, ignoring the background. 
                    Uses HSV analysis and clustering to identify the main color of the garment.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-gray-100 flex-shrink-0">
                  <FaChartLine className="text-gray-700 text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. Smart Recommendations</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Based on your preferences (occasion, style, colors), our algorithm generates personalized 
                    outfits that combine color harmony and context appropriateness.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <FaBrain className="text-gray-600" />
                <span>Modelo CNN</span>
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Our model is trained with over 70,000 clothing garment images, classified into 10 different categories. 
                Uses deep learning techniques with TensorFlow/Keras, including data augmentation and early stopping to optimize 
                performance and prevent overfitting.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg">TensorFlow</span>
                <span className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg">Keras</span>
                <span className="px-3 py-1.5 bg-gray-700 text-white text-xs font-medium rounded-lg">CNN</span>
                <span className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg">87% Accuracy</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <FaTshirt className="text-gray-700" />
              </div>
              <span>Recent Garments</span>
            </h2>
            <button
              onClick={() => navigate('/prendas')}
              className="text-gray-600 hover:text-gray-900 font-medium flex items-center space-x-2 transition-colors"
            >
              <span>View all</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
            </div>
          ) : prendas.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-soft border border-gray-100">
              <p className="text-gray-500">No garments yet. Upload your first garment!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {prendas.map((prenda) => (
                <PrendaCard
                  key={prenda._id}
                  prenda={prenda}
                  onDelete={handleDeletePrenda}
                />
              ))}
            </div>
          )}
        </div>

        {outfits.length > 0 && (
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <FaMagic className="text-gray-700" />
                </div>
                <span>Saved Outfits</span>
              </h2>
              <button
                onClick={() => navigate('/outfits')}
                className="text-gray-600 hover:text-gray-900 font-medium flex items-center space-x-2 transition-colors"
              >
                <span>View all</span>
                <FaArrowRight className="text-sm" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {outfits.map((outfit) => (
                <OutfitCard key={outfit._id} outfit={outfit} />
              ))}
            </div>
          </div>
        )}

        {showUploadModal && (
          <UploadModal
            onClose={() => setShowUploadModal(false)}
            onSuccess={handlePrendaAdded}
          />
        )}

        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            Development by <span className="font-semibold text-gray-700">Alvaro Martin-Pena</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
