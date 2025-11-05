import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logoutUsuario } from '../../store/slices/authSlice'
import { fetchSucursales, setSelectedSucursalId } from '../../store/slices/sucursalesSlice'
import './Navbar.css'
import SucursalBadge from '../SucursalBadge/SucursalBadge'

const Navbar = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const { usuario, isAuthenticated } = useSelector((state) => state.auth)
  const { items: sucursales, selectedSucursalId } = useSelector((state) => state.sucursales)
  
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/productos', label: 'Productos', icon: '🧪' },
    { path: '/clientes', label: 'Clientes', icon: '👥' },
    { path: '/inventario', label: 'Inventario', icon: '📦' },
    { path: '/contabilidad', label: 'Contabilidad', icon: '💰' },
    { path: '/ventas', label: 'Ventas', icon: '🛒' },
    { path: '/compras', label: 'Compras', icon: '🛍️' },
    { path: '/reportes', label: 'Reportes', icon: '📈' },
  ]

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setIsOpen(false)
      }
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Cargar sucursales si el usuario es admin
  useEffect(() => {
    if (isAuthenticated && usuario?.rol === 'admin') {
      dispatch(fetchSucursales())
    }
  }, [isAuthenticated, usuario, dispatch])

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const handleLogout = () => {
    dispatch(logoutUsuario())
    // limpiar sucursal seleccionada
    dispatch(setSelectedSucursalId(null))
  }

  const toggleNavbar = () => {
    setIsOpen(!isOpen)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {isMobile && (
        <button 
          className={`mobile-menu-btn ${isOpen ? 'open' : ''}`}
          onClick={toggleNavbar}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}

      {isMobile && isOpen && (
        <div 
          className="navbar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav className={`navbar ${isMobile ? 'mobile' : ''} ${isOpen ? 'open' : ''}`}>
        <div className="navbar-header">
          <h2 className="navbar-title">ERP La Esponja</h2>
          <div className="navbar-context">
            <SucursalBadge />
          </div>
        </div>
        
        <ul className="navbar-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="navbar-item">
              <Link
                to={item.path}
                className={`navbar-link ${
                  location.pathname === item.path ? 'active' : ''
                }`}
                onClick={handleLinkClick}
              >
                <span className="navbar-icon">{item.icon}</span>
                <span className="navbar-label">{item.label}</span>
              </Link>
            </li>
          ))}
          {usuario?.rol === 'admin' && (
            <li className="navbar-item">
              <Link
                to="/recursos-humanos"
                className={`navbar-link ${location.pathname === '/recursos-humanos' ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <span className="navbar-icon">👤</span>
                <span className="navbar-label">RRHH</span>
              </Link>
            </li>
          )}
          {usuario?.rol === 'admin' && (
            <li className="navbar-item">
              <Link
                to="/sucursales"
                className={`navbar-link ${location.pathname === '/sucursales' ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <span className="navbar-icon">🏬</span>
                <span className="navbar-label">Sucursales</span>
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-footer">
          {/* Selector de sucursal para Admin */}
          {usuario?.rol === 'admin' && (
            <div className="sucursal-selector">
              <label htmlFor="sucursalSelect">Sucursal:</label>
              <select
                id="sucursalSelect"
                value={selectedSucursalId || ''}
                onChange={(e) => dispatch(setSelectedSucursalId(e.target.value || null))}
              >
                <option value="">(Mi sesión)</option>
                {sucursales?.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre || `Sucursal ${s.id}`}</option>
                ))}
              </select>
            </div>
          )}
          <div className="user-info">
            <span className="user-name">{usuario?.nombre || 'Usuario'}</span>
            <span className="user-role">{usuario?.rol || 'Empleado'}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </nav>
    </>
  )
}

export default Navbar
