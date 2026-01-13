import { useState, useEffect } from 'react'
import axios from 'axios'

const ConfusionMatrix = () => {
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [overall, setOverall] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Cargar imagen
        const url = '/api/model/confusion-matrix'
        setImageUrl(url)
        
        // Cargar métricas
        const metricsResponse = await axios.get('/api/model/metrics')
        if (metricsResponse.data) {
          setMetrics(metricsResponse.data.metrics || [])
          setOverall(metricsResponse.data.overall || null)
        }
        
        setError(null)
      } catch (err) {
        console.error('Error cargando datos:', err)
        setError('No se pudieron cargar los datos del modelo. Asegúrate de haber entrenado el modelo primero.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatValue = (value) => {
    return value.toFixed(2)
  }

  const formatPercent = (value) => {
    return (value * 100).toFixed(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Matriz de Confusión
        </h1>
        <p className="text-gray-600 mb-6">
          La matriz de confusión muestra el rendimiento del modelo CNN en la clasificación de prendas.
          Cada celda indica cuántas imágenes de una clase fueron clasificadas como otra clase.
        </p>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {!loading && !error && imageUrl && (
          <div className="mb-8">
            <div className="flex justify-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <img
                  src={imageUrl}
                  alt="Matriz de Confusión"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  onError={() => setError('Error al cargar la imagen')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Reporte de Clasificación en formato tabla */}
        {metrics && metrics.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reporte de Clasificación</h2>
            <div className="overflow-x-auto bg-gray-50 rounded-lg p-4">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase border-b">
                      Clase
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase border-b">
                      Precision
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase border-b">
                      Recall
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase border-b">
                      F1-Score
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 uppercase border-b">
                      Support
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {metrics.map((metric, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{metric.class}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-700">{formatValue(metric.precision)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-700">{formatValue(metric.recall)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-700">{formatValue(metric.f1_score)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className="text-sm text-gray-700">{metric.support}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {overall && (
                  <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                    <tr>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        accuracy
                      </td>
                      <td colSpan="3" className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {formatValue(overall.accuracy)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {metrics.reduce((sum, m) => sum + m.support, 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        macro avg
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {formatValue(overall.macro_avg_precision)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {formatValue(overall.macro_avg_recall)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {formatValue(overall.macro_avg_f1)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {metrics.reduce((sum, m) => sum + m.support, 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        weighted avg
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {formatValue(overall.weighted_avg_precision)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {formatValue(overall.weighted_avg_recall)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {formatValue(overall.weighted_avg_f1)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        {metrics.reduce((sum, m) => sum + m.support, 0)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">¿Cómo interpretar la matriz?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Diagonal principal:</strong> Predicciones correctas (valores altos = mejor)</li>
            <li>• <strong>Fuera de la diagonal:</strong> Errores de clasificación</li>
            <li>• <strong>Colores más oscuros:</strong> Mayor número de predicciones</li>
            <li>• <strong>Colores más claros:</strong> Menor número de predicciones</li>
            <li>• <strong>Precision:</strong> De las predicciones positivas, cuántas son realmente correctas</li>
            <li>• <strong>Recall:</strong> De todas las muestras reales, cuántas fueron detectadas correctamente</li>
            <li>• <strong>F1-Score:</strong> Media armónica entre Precision y Recall</li>
            <li>• <strong>Support:</strong> Número de muestras reales de cada clase</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ConfusionMatrix
