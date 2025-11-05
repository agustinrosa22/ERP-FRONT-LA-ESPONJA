import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import './ProtectedRoute.css'

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, usuario } = useSelector((state) => state.auth)
  const location = useLocation()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // Si se especifican roles y el usuario no pertenece, mostrar 403 o redirigir
  if (roles && usuario && !roles.includes(usuario.rol)) {
    return <Navigate to="/dashboard" replace />
  }

  // Si está autenticado, mostrar el contenido
  return children
}

export default ProtectedRoute