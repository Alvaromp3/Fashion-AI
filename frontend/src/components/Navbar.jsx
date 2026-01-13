import { Link, useLocation } from 'react-router-dom'
import { FaTshirt, FaHome, FaSocks, FaChartBar, FaImages } from 'react-icons/fa'

const Navbar = () => {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-lg bg-gray-900 group-hover:bg-gray-800 transition-colors">
              <FaTshirt className="text-xl text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 tracking-tight">Fashion AI</span>
          </Link>
          
          <div className="flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/')
                  ? 'bg-gray-900 text-white shadow-soft'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaHome className="inline mr-2" />
              Dashboard
            </Link>
            <Link
              to="/prendas"
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/prendas')
                  ? 'bg-gray-900 text-white shadow-soft'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaTshirt className="inline mr-2" />
              Garments
            </Link>
            <Link
              to="/outfits"
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/outfits')
                  ? 'bg-gray-900 text-white shadow-soft'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaSocks className="inline mr-2" />
              Outfits
            </Link>
            <Link
              to="/modelo/confusion-matrix"
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/modelo/confusion-matrix')
                  ? 'bg-gray-900 text-white shadow-soft'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaChartBar className="inline mr-2" />
              Metrics
            </Link>
            <Link
              to="/modelo/ejemplos"
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/modelo/ejemplos')
                  ? 'bg-gray-900 text-white shadow-soft'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FaImages className="inline mr-2" />
              Examples
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
