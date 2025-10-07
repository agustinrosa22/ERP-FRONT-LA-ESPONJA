import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  obtenerTodosClientes, 
  buscarClientePorDocumento,
  obtenerEstadisticasCliente,
  clearError,
  clearSearchResults,
  setSearchResults 
} from '../../store/slices/clientesSlice'
import ClienteCard from '../../components/ClienteCard/ClienteCard'
import ClienteForm from '../../components/ClienteForm/ClienteForm'
import './Clientes.css'

const Clientes = () => {
  const dispatch = useDispatch()
  const { clientes, loading, error, searchResults, estadisticas } = useSelector((state) => state.clientes)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState('nombre_completo') // nombre_completo, documento, email
  const [showForm, setShowForm] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // grid, list
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedClienteStats, setSelectedClienteStats] = useState(null)
  const [showStats, setShowStats] = useState(false)

  // Hook para detectar mobile
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      // Auto cambiar a lista en mobile si está en grid
      if (mobile && viewMode === 'grid') {
        setViewMode('list')
      }
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [viewMode])

  useEffect(() => {
    dispatch(obtenerTodosClientes())
  }, [dispatch])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchTerm.trim()) {
      dispatch(clearSearchResults())
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      if (searchType === 'documento') {
        const result = await dispatch(buscarClientePorDocumento(searchTerm.trim()))
        
        if (buscarClientePorDocumento.fulfilled.match(result)) {
          // Si encontró resultados
          if (result.payload) {
            dispatch(setSearchResults([result.payload]))
          } else {
            dispatch(setSearchResults([]))
          }
        } else {
          // Si hubo error o no encontró nada
          dispatch(setSearchResults([]))
        }
      } else {
        // Para nombre_completo y email, filtrar localmente
        const filtered = clientes.filter(cliente => {
          let value = ''
          if (searchType === 'nombre_completo') {
            const nombreCompleto = cliente.nombre_completo || 
                                 `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim()
            value = nombreCompleto.toLowerCase()
          } else {
            value = cliente[searchType]?.toLowerCase() || ''
          }
          return value.includes(searchTerm.toLowerCase())
        })
        dispatch(setSearchResults(filtered))
      }
    } catch (error) {
      console.error('Error en búsqueda:', error)
      dispatch(setSearchResults([]))
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setHasSearched(false)
    dispatch(clearSearchResults())
    dispatch(clearError())
  }

  const handleEditCliente = (cliente) => {
    setSelectedCliente(cliente)
    setShowForm(true)
  }

  const handleViewStats = async (cliente) => {
    setSelectedClienteStats(cliente)
    setShowStats(true)
    
    // Cargar estadísticas si no están en caché
    if (!estadisticas[cliente.id]) {
      await dispatch(obtenerEstadisticasCliente(cliente.id))
    }
  }

  const handleCloseStats = () => {
    setShowStats(false)
    setSelectedClienteStats(null)
  }

  const handleNewCliente = () => {
    setSelectedCliente(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setSelectedCliente(null)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setSelectedCliente(null)
    dispatch(obtenerTodosClientes()) // Recargar lista
  }

  const getSearchTypeLabel = (type) => {
    const labels = {
      'nombre_completo': 'Nombre',
      'documento': 'Documento',
      'email': 'Email'
    }
    return labels[type] || type
  }

  const getSearchPlaceholder = () => {
    const placeholders = {
      'nombre_completo': 'Buscar por nombre o apellido...',
      'documento': 'Buscar por número de documento...',
      'email': 'Buscar por dirección de email...'
    }
    return placeholders[searchType] || 'Buscar...'
  }

  const clientesToShow = hasSearched ? searchResults : clientes
  const showingSearchResults = hasSearched && searchTerm.trim() !== ''

  return (
    <div className="clientes-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Gestión de Clientes</h1>
          <p>Administra la información de tus clientes</p>
        </div>
        <button className="btn-primary" onClick={handleNewCliente}>
          + Nuevo Cliente
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-inputs">
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
              className="search-select"
            >
              <option value="nombre_completo">Nombre</option>
              <option value="documento">Documento</option>
              <option value="email">Email</option>
            </select>
            
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <button type="submit" className="btn-search" disabled={loading || isSearching}>
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
            
            {(searchTerm || showingSearchResults) && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                className="btn-clear"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>

        {/* Controles de vista */}
        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            📱 Tarjetas
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 Lista
          </button>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={() => dispatch(clearError())}>✕</button>
        </div>
      )}

      {showingSearchResults && (
        <div className="search-info">
          {clientesToShow.length > 0 ? (
            <span>📍 Mostrando {clientesToShow.length} resultado(s) para "{searchTerm}"</span>
          ) : (
            <span>🔍 No se encontraron resultados para "{searchTerm}"</span>
          )}
        </div>
      )}

      {/* Lista/Grid de clientes */}
      <div className="clientes-content">
        {/* Contador de clientes para mobile */}
        {clientesToShow.length > 0 && !loading && (
          <div className="clientes-count mobile-only">
            📊 {clientesToShow.length} cliente{clientesToShow.length !== 1 ? 's' : ''} 
            {showingSearchResults ? ' encontrado' + (clientesToShow.length !== 1 ? 's' : '') : ' total' + (clientesToShow.length !== 1 ? 'es' : '')}
          </div>
        )}
        
        {loading && clientes.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Cargando clientes...</p>
            </div>
          </div>
        ) : clientesToShow.length > 0 ? (
          <div className={`clientes-container ${viewMode}`}>
            {clientesToShow.map((cliente) => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                viewMode={viewMode}
                onEdit={handleEditCliente}
                onViewStats={handleViewStats}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {showingSearchResults ? (
              <>
                <div className="no-results-icon">🔍</div>
                <h3>No se encontraron clientes</h3>
                <p>
                  No hay clientes que coincidan con{' '}
                  <strong>"{searchTerm}"</strong>{' '}
                  en el campo <strong>{getSearchTypeLabel(searchType)}</strong>
                </p>
                <div className="search-suggestions">
                  <p>💡 Sugerencias:</p>
                  <ul>
                    <li>Verifica que el término de búsqueda esté escrito correctamente</li>
                    <li>Intenta buscar por un campo diferente</li>
                    <li>Usa términos más generales (ej: parte del nombre)</li>
                  </ul>
                </div>
                <div className="empty-state-actions">
                  <button onClick={handleClearSearch} className="btn-secondary">
                    Ver todos los clientes
                  </button>
                  <button onClick={handleNewCliente} className="btn-primary">
                    Crear nuevo cliente
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="empty-icon">👥</div>
                <h3>No hay clientes registrados</h3>
                <p>Comienza agregando tu primer cliente</p>
                <button onClick={handleNewCliente} className="btn-primary">
                  Crear primer cliente
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal del formulario */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ClienteForm 
              cliente={selectedCliente}
              onClose={handleCloseForm}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}

      {/* Modal de estadísticas */}
      {showStats && selectedClienteStats && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="stats-modal">
              <div className="stats-header">
                <h2>📊 Estadísticas de Cliente</h2>
                <button className="close-btn" onClick={handleCloseStats}>
                  ✕
                </button>
              </div>
              
              <div className="cliente-info">
                <h3>{selectedClienteStats.nombre_completo || `${selectedClienteStats.nombre} ${selectedClienteStats.apellido}`}</h3>
                <p>📄 {selectedClienteStats.documento}</p>
                <p>📧 {selectedClienteStats.email}</p>
              </div>

              {estadisticas[selectedClienteStats.id] ? (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">🛒</div>
                    <div className="stat-content">
                      <h4>Total Compras</h4>
                      <p className="stat-value">{estadisticas[selectedClienteStats.id].total_compras}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                      <h4>Monto Total</h4>
                      <p className="stat-value">${estadisticas[selectedClienteStats.id].monto_total_comprado?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                      <h4>Compra Promedio</h4>
                      <p className="stat-value">${estadisticas[selectedClienteStats.id].compra_promedio?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                      <h4>Productos Comprados</h4>
                      <p className="stat-value">{estadisticas[selectedClienteStats.id].productos_comprados}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">💳</div>
                    <div className="stat-content">
                      <h4>Crédito Disponible</h4>
                      <p className="stat-value">${estadisticas[selectedClienteStats.id].credito_disponible?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                      <h4>Crédito Usado</h4>
                      <p className="stat-value">{estadisticas[selectedClienteStats.id].porcentaje_credito_usado}%</p>
                    </div>
                  </div>

                  {estadisticas[selectedClienteStats.id].ultima_compra && (
                    <div className="stat-card full-width">
                      <div className="stat-icon">🕒</div>
                      <div className="stat-content">
                        <h4>Última Compra</h4>
                        <p className="stat-value">{new Date(estadisticas[selectedClienteStats.id].ultima_compra).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="loading-stats">
                  <div className="spinner"></div>
                  <p>Cargando estadísticas...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clientes