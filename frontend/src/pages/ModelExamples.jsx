import { useState, useEffect } from 'react'
import axios from 'axios'

const ModelExamples = () => {
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [classNames, setClassNames] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Obtener nombres de clases
        const classesResponse = await axios.get('/api/model/classes')
        if (classesResponse.data && classesResponse.data.classes) {
          setClassNames(classesResponse.data.classes)
        }
        
        // La imagen se sirve desde el backend
        const url = '/api/model/data-audit'
        setImageUrl(url)
        setError(null)
      } catch (err) {
        console.error('Error cargando ejemplos:', err)
        setError('No se pudieron cargar los ejemplos del modelo')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const classDescriptions = {
    'Ankle_boot': 'Botas de tobillo - calzado que cubre el tobillo',
    'Bag': 'Bolso - accesorio para llevar objetos personales',
    'Coat': 'Abrigo - prenda exterior para clima frío',
    'Dress': 'Vestido - prenda de una sola pieza para el torso y piernas',
    'Pullover': 'Jersey/Pullover - prenda superior de punto',
    'Sandal': 'Sandalia - calzado abierto con suela',
    'Shirt': 'Camisa - prenda superior con botones y cuello',
    'Sneaker': 'Zapatillas - calzado deportivo cómodo',
    'T-shirt': 'Camiseta - prenda superior de algodón sin botones',
    'Trouser': 'Pantalón - prenda inferior que cubre las piernas'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ejemplos del Modelo
        </h1>
        <p className="text-gray-600 mb-6">
          Esta página muestra ejemplos de cada clase que el modelo CNN puede clasificar.
          El modelo ha sido entrenado para reconocer estas 10 categorías de prendas.
        </p>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {!loading && !error && imageUrl && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ejemplos Visuales</h2>
            <div className="flex justify-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <img
                  src={imageUrl}
                  alt="Ejemplos de clases del modelo"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  onError={() => setError('Error al cargar la imagen')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Descripción de clases */}
        {classNames.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Clases que el Modelo Puede Clasificar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classNames.map((className, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {index + 1}. {className}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {classDescriptions[className] || 'Descripción no disponible'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Model Information</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• El modelo CNN ha sido entrenado con miles de imágenes de cada clase</li>
            <li>• Puede clasificar imágenes con una precisión alta</li>
            <li>• Cada clase tiene características visuales únicas que el modelo aprende</li>
            <li>• El modelo también detecta el color dominante de cada prenda</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ModelExamples

