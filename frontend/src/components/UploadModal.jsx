import { useState } from 'react'
import { FaTimes, FaUpload, FaSpinner, FaCalendar } from 'react-icons/fa'
import axios from 'axios'

const UploadModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [classifying, setClassifying] = useState(false)
  const [classification, setClassification] = useState(null)
  const [selectedOccasions, setSelectedOccasions] = useState([])
  const [error, setError] = useState(null)

  const occasions = [
    { value: 'casual', label: 'Casual', icon: '👕', desc: 'For everyday wear' },
    { value: 'formal', label: 'Formal', icon: '👔', desc: 'Important events' },
    { value: 'deportivo', label: 'Sporty', icon: '🏃', desc: 'Exercise and activity' },
    { value: 'fiesta', label: 'Party', icon: '🎉', desc: 'Celebrations' },
    { value: 'trabajo', label: 'Work', icon: '💼', desc: 'Professional office' }
  ]

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      // Para HEIC, intentar crear preview (puede no funcionar en todos los navegadores)
      const fileExt = selectedFile.name.toLowerCase().split('.').pop()
      if (fileExt === 'heic' || fileExt === 'heif') {
        // HEIC no se puede mostrar directamente, mostrar mensaje
        setPreview(null)
        setError('Note: HEIC images will be automatically converted to JPEG')
      } else {
        setPreview(URL.createObjectURL(selectedFile))
      }
      
      setClassification(null)
      if (fileExt !== 'heic' && fileExt !== 'heif') {
        setError(null)
      }
    }
  }

  const handleClassify = async () => {
    if (!file) {
      setError('Please select an image first')
      return
    }

    setClassifying(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('imagen', file)

      const response = await axios.post('/api/classify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setClassification(response.data)
    } catch (error) {
      console.error('Error clasificando:', error)
      setError('Error classifying the image. Please try again.')
    } finally {
      setClassifying(false)
    }
  }

  const handleSave = async () => {
    if (!file || !classification) {
      setError('Please classify the image first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('imagen', file)
      formData.append('tipo', classification.tipo)
      formData.append('clase_nombre', classification.clase_nombre || 'desconocido')
      formData.append('color', classification.color)
      formData.append('confianza', classification.confianza)
      if (selectedOccasions.length > 0) {
        selectedOccasions.forEach(oc => {
          formData.append('ocasion', oc)
        })
      }

      await axios.post('/api/prendas/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Resetear estado
      setFile(null)
      setPreview(null)
      setClassification(null)
      setSelectedOccasions([])
      setError(null)
      
      onSuccess()
    } catch (error) {
      console.error('Error guardando prenda:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.details || 'Error saving the garment. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-large max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900">Upload Garment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors bg-gray-50">
              <input
                type="file"
                accept="image/*,.heic,.heif"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <FaUpload className="text-4xl text-gray-400" />
                <span className="text-gray-600">
                  {file ? file.name : 'Click or drag an image here'}
                </span>
              </label>
            </div>
          </div>

          {/* Preview */}
          {preview ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-64 object-contain mx-auto rounded-lg border"
              />
            </div>
          ) : file && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected File
              </label>
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-gray-600">{file.name}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') 
                    ? 'HEIC image - Will be automatically converted'
                    : 'Preview not available'}
                </p>
              </div>
            </div>
          )}

          {classification && (
            <>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Classification:</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700"><span className="font-medium text-gray-900">Garment:</span> {classification.clase_nombre || 'unknown'}</p>
                  <p className="text-gray-700"><span className="font-medium text-gray-900">Type:</span> {classification.tipo}</p>
                  <p className="text-gray-700"><span className="font-medium text-gray-900">Color:</span> {classification.color}</p>
                  <p className="text-gray-700"><span className="font-medium text-gray-900">Confidence:</span> {(classification.confianza * 100).toFixed(1)}%</p>
                  
                  {classification.top3 && classification.top3.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="font-medium text-gray-900 mb-2 text-xs">Top 3 Predictions:</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        {classification.top3.map((pred, idx) => (
                          <p key={idx} className={idx === 0 ? 'font-semibold text-gray-900' : ''}>
                            {idx + 1}. {pred.clase_nombre} ({pred.tipo}) - {(pred.confianza * 100).toFixed(1)}%
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <FaCalendar className="text-gray-600" />
                  <label className="block text-sm font-medium text-gray-900">Occasions (optional)</label>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  What occasions is this garment for? (you can select multiple)
                  {selectedOccasions.length > 0 && (
                    <span className="ml-2 font-medium text-gray-700">
                      ({selectedOccasions.length} selected)
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {occasions.map(oc => {
                    const isSelected = selectedOccasions.includes(oc.value)
                    return (
                      <button
                        key={oc.value}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedOccasions(prev => prev.filter(o => o !== oc.value))
                          } else {
                            setSelectedOccasions(prev => [...prev, oc.value])
                          }
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-left relative ${
                          isSelected
                            ? 'border-gray-900 bg-gray-900 text-white shadow-soft'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          <div className={`w-5 h-5 rounded border-2 mr-2 flex items-center justify-center ${
                            isSelected 
                              ? 'bg-white border-white' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-2xl mr-2">{oc.icon}</span>
                          <span className="font-medium text-sm">{oc.label}</span>
                        </div>
                        <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                          {oc.desc}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={handleClassify}
              disabled={!file || classifying}
              className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {classifying ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Classifying...</span>
                </>
              ) : (
                <span>Classify</span>
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={!classification || loading}
              className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadModal

