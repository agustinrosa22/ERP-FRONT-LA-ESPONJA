import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  obtenerTodosProductos,
  buscarProductoPorCodigo,
  obtenerProductosStockBajo,
  clearError,
  clearSearchResults,
  setSearchResults,
  setFiltros
} from '../../store/slices/productosSlice'
import ProductoCard from '../../components/ProductoCard/ProductoCard'
import ProductoForm from '../../components/ProductoForm/ProductoForm'
import './Productos.css'

const Productos = () => {
  const dispatch = useDispatch()
  
  // Usar valores por defecto para evitar crashes
  const productosState = useSelector((state) => state.productos) || {}
  const { selectedSucursalId } = useSelector((state) => state.sucursales || {})
  const { 
    productos = [], 
    productosStockBajo = [],
    loading = false, 
    error = null, 
    searchResults = [], 
    filtros = { categoria: '', activo: 'todos', stockBajo: false },
    categorias = []
  } = productosState



  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState('nombre') // nombre, codigo, categoria
  const [showForm, setShowForm] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // grid, list
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showStockBajo, setShowStockBajo] = useState(false)
  const [modoGlobal, setModoGlobal] = useState(false)

  // Hook para detectar mobile
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile && viewMode === 'grid') {
        setViewMode('list')
      }
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [viewMode])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        await dispatch(obtenerTodosProductos({ incluir_stock_sucursal: true, ...(modoGlobal ? { global: true } : {}) }))
      } catch (error) {
        // Errores manejados en el slice
      }
    }
    loadProducts()
  }, [dispatch, selectedSucursalId, modoGlobal])

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
      if (searchType === 'codigo') {
        const result = await dispatch(buscarProductoPorCodigo({ codigo: searchTerm.trim(), params: { ...(modoGlobal ? { global: true } : {}) } }))
        
        if (buscarProductoPorCodigo.fulfilled.match(result)) {
          if (result.payload) {
            dispatch(setSearchResults([result.payload]))
          } else {
            dispatch(setSearchResults([]))
          }
        } else {
          dispatch(setSearchResults([]))
        }
      } else {
        // Para nombre y categoría, filtrar localmente
        const filtered = productos.filter(producto => {
          let value = ''
          if (searchType === 'nombre') {
            value = `${producto.nombre} ${producto.descripcion || ''}`.toLowerCase()
          } else if (searchType === 'categoria') {
            value = producto.categoria?.toLowerCase() || ''
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
    setShowStockBajo(false)
    dispatch(clearSearchResults())
    dispatch(clearError())
  }

  const handleShowStockBajo = async () => {
    setShowStockBajo(true)
    setHasSearched(true)
    setSearchTerm('')
    // Respetar modo global/estricto y traer con stock_bajo=true
    const result = await dispatch(obtenerTodosProductos({ incluir_stock_sucursal: true, stock_bajo: true, ...(modoGlobal ? { global: true } : {}) }))
    if (obtenerTodosProductos.fulfilled.match(result)) {
      dispatch(setSearchResults(Array.isArray(result.payload) ? result.payload : []))
    } else {
      dispatch(setSearchResults([]))
    }
  }

  const handleEditProducto = (producto) => {
    setSelectedProducto(producto)
    setShowForm(true)
  }

  const handleNewProducto = () => {
    setSelectedProducto(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setSelectedProducto(null)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setSelectedProducto(null)
    dispatch(obtenerTodosProductos())
    dispatch(obtenerProductosStockBajo())
  }

  const handleFiltroChange = (filtro, valor) => {
    const nuevosFiltros = { ...filtros, [filtro]: valor }
    dispatch(setFiltros(nuevosFiltros))
  }

  const getSearchTypeLabel = (type) => {
    const labels = {
      'nombre': 'Nombre',
      'codigo': 'Código',
      'categoria': 'Categoría'
    }
    return labels[type] || type
  }

  const getSearchPlaceholder = () => {
    const placeholders = {
      'nombre': 'Buscar por nombre o descripción...',
      'codigo': 'Buscar por código de producto...',
      'categoria': 'Buscar por categoría...'
    }
    return placeholders[searchType] || 'Buscar...'
  }

  // Aplicar filtros a los productos
  const aplicarFiltros = (productosLista) => {
    if (!productosLista || !Array.isArray(productosLista)) {
      return []
    }
    
    return productosLista.filter(producto => {
      // Filtro por categoría
      if (filtros.categoria && producto.categoria !== filtros.categoria) {
        return false
      }
      
      // Filtro por activo
      if (filtros.activo !== 'todos') {
        const esActivo = filtros.activo === 'activos'
        if (producto.activo !== esActivo) {
          return false
        }
      }
      
      return true
    })
  }

  const productosToShow = hasSearched ? (searchResults || []) : aplicarFiltros(productos || [])
  const showingSearchResults = hasSearched && (searchTerm.trim() !== '' || showStockBajo)

  // Si hay un error crítico, mostrar página de error
  if (error && error.includes('Error de red')) {
    return (
      <div className="productos-page">
        <div className="error-page">
          <h2>🔌 Sin conexión al servidor</h2>
          <p>No se puede conectar con el servidor backend.</p>
          <p>El módulo funciona en modo desarrollo sin datos.</p>
          <button onClick={() => window.location.reload()}>
            🔄 Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="productos-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🧪 Gestión de Productos</h1>
          <p>Catálogo de productos químicos</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-warning stock-alert" 
            onClick={handleShowStockBajo}
            disabled={loading}
          >
            ⚠️ Stock Bajo ({productosStockBajo?.length || 0})
          </button>
          <button className="btn-primary" onClick={handleNewProducto}>
            + Nuevo Producto
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="search-section">
        <div className="filtros-section">
          <div className="filtro-grupo">
            <label>Categoría:</label>
            <select 
              value={filtros.categoria} 
              onChange={(e) => handleFiltroChange('categoria', e.target.value)}
              className="filtro-select"
            >
              <option value="">Todas las categorías</option>
              {(categorias || []).map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Estado:</label>
            <select 
              value={filtros.activo} 
              onChange={(e) => handleFiltroChange('activo', e.target.value)}
              className="filtro-select"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-inputs">
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
              className="search-select"
            >
              <option value="nombre">Nombre</option>
              <option value="codigo">Código</option>
              <option value="categoria">Categoría</option>
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

        <div className="view-controls">
            <button 
              className={`view-btn ${modoGlobal ? 'active' : ''}`}
              onClick={() => setModoGlobal(v => !v)}
              title={modoGlobal ? 'Ver catálogo global (todos los productos)' : 'Ver solo productos presentes en la sucursal'}
            >
              {modoGlobal ? '🌐 Global' : '🏬 Estricto'}
            </button>
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
          {showStockBajo ? (
            <span>⚠️ Mostrando {productosToShow?.length || 0} producto(s) con stock bajo</span>
          ) : (productosToShow?.length || 0) > 0 ? (
            <span>📍 Mostrando {productosToShow?.length || 0} resultado(s) para "{searchTerm}"</span>
          ) : (
            <span>🔍 No se encontraron resultados para "{searchTerm}"</span>
          )}
        </div>
      )}

      {/* Lista/Grid de productos */}
      <div className="productos-content">
        {/* Contador de productos para mobile */}
        {(productosToShow?.length || 0) > 0 && !loading && (
          <div className="productos-count mobile-only">
            📦 {productosToShow?.length || 0} producto{(productosToShow?.length || 0) !== 1 ? 's' : ''} 
            {showingSearchResults ? 
              (showStockBajo ? ' con stock bajo' : ' encontrado' + ((productosToShow?.length || 0) !== 1 ? 's' : '')) 
              : ' total' + ((productosToShow?.length || 0) !== 1 ? 'es' : '')
            }
          </div>
        )}
        
        {loading && productos.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Cargando productos...</p>
            </div>
          </div>
        ) : (productosToShow && productosToShow.length > 0) ? (
          <div className={`productos-container ${viewMode}`}>
            {productosToShow.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                viewMode={viewMode}
                onEdit={handleEditProducto}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {showingSearchResults ? (
              <>
                <div className="no-results-icon">🔍</div>
                <h3>No se encontraron productos</h3>
                <p>
                  {showStockBajo ? 
                    'No hay productos con stock bajo en este momento' :
                    <>
                      No hay productos que coincidan con{' '}
                      <strong>"{searchTerm}"</strong>{' '}
                      en el campo <strong>{getSearchTypeLabel(searchType)}</strong>
                    </>
                  }
                </p>
                <div className="empty-state-actions">
                  <button onClick={handleClearSearch} className="btn-secondary">
                    Ver todos los productos
                  </button>
                  <button onClick={handleNewProducto} className="btn-primary">
                    Crear nuevo producto
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="empty-icon">📦</div>
                <h3>No hay productos registrados</h3>
                <p>Comienza agregando tu primer producto químico</p>
                <button onClick={handleNewProducto} className="btn-primary">
                  Crear primer producto
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal del formulario */}
      {showForm && (
        <ProductoForm 
          producto={selectedProducto}
          onClose={handleCloseForm}
          onSubmit={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default Productos