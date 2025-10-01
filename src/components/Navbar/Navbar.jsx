import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logoutUsuario } from '../../store/slices/authSlice'
import './Navbar.css'

const Navbar = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const { usuario, isAuthenticated } = useSelector((state) => state.auth)

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/inventario', label: 'Inventario', icon: '📦' },
    { path: '/recursos-humanos', label: 'RRHH', icon: '👥' },
    { path: '/contabilidad', label: 'Contabilidad', icon: '💰' },
    { path: '/ventas', label: 'Ventas', icon: '🛒' },
    { path: '/compras', label: 'Compras', icon: '🛍️' },
    { path: '/reportes', label: 'Reportes', icon: '📈' },
  ]

  const handleLogout = () => {
    dispatch(logoutUsuario())
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <h2 className="navbar-title">ERP La Esponja</h2>
      </div>
      
      <ul className="navbar-menu">
        {menuItems.map((item) => (
          <li key={item.path} className="navbar-item">
            <Link
              to={item.path}
              className={`navbar-link ${
                location.pathname === item.path ? 'active' : ''
              }`}
            >
              <span className="navbar-icon">{item.icon}</span>
              <span className="navbar-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="navbar-footer">
        <div className="user-info">
          <span className="user-name">{usuario?.nombre || 'Usuario'}</span>
          <span className="user-role">{usuario?.rol || 'Empleado'}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  )
}

export default Navbar