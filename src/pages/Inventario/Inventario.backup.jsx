import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  obtenerMovimientos, 
  setFiltrosMovimientos,
  clearFiltrosMovimientos 
} from '../../store/slices/inventarioSlice'
import { 
  obtenerStockSucursal,
  obtenerResumenGlobal,
  obtenerHistorialProducto,
  setFiltros as setFiltrosStock,
  clearFiltros as clearFiltrosStock 
} from '../../store/slices/stockSucursalSlice'
import { obtenerProductos } from '../../store/slices/productosSlice'
import MovimientoForm from '../../components/MovimientoForm/MovimientoForm'
import MovimientoCard from '../../components/MovimientoCard/MovimientoCard'
import StockSucursalCard from '../../components/StockSucursalCard/StockSucursalCard'
import StockModal from '../../components/StockModal/StockModal'
import HistorialModal from '../../components/HistorialModal/HistorialModal'
import './Inventario.css'
import SucursalBadge from '../../components/SucursalBadge/SucursalBadge'

const Inventario = () => {
  const dispatch = useDispatch()
  const { selectedSucursalId } = useSelector((state) => state.sucursales)
  const { usuario } = useSelector((state) => state.auth)
  
  // Estado del inventario (movimientos)
  const inventarioState = useSelector((state) => state.inventario)
  const { 
    movimientos = [], 
    loadingMovimientos, 
    error: errorMovimientos, 
    filtrosMovimientos 
  } = inventarioState
  
  // Estado del stock por sucursal
  const stockState = useSelector((state) => state.stockSucursal)
  const {
    stockItems = [],
    estadisticas,
    pagination,
    resumenGlobal = [],
    historialProducto = [],
    loading: loadingStock,
    loadingResumen,
    loadingHistorial,
    error: errorStock,
    filtros: filtrosStock
  } = stockState
  
  // Estado de productos
  const productosState = useSelector((state) => state.productos)
  const {
    productos = [],
    loading: loadingProductos
  } = productosState
  


  // Estados locales
  const [vistaActiva, setVistaActiva] = useState('stock') // stock, alertas, resumen, historial
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null)
  const [productoPreseleccionado, setProductoPreseleccionado] = useState(null)
  
  // Estados para el nuevo sistema de stock
  const [mostrarModalStock, setMostrarModalStock] = useState(false)
  const [mostrarModalHistorial, setMostrarModalHistorial] = useState(false)
  const [stockSeleccionado, setStockSeleccionado] = useState(null)
  const [productoHistorial, setProductoHistorial] = useState(null)
  const [historialStock, setHistorialStock] = useState([])
  
  // Filtros locales
  const [filtroProducto, setFiltroProducto] = useState('')
  const [filtroSucursal, setFiltroSucursal] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [productoSeleccionadoHistorial, setProductoSeleccionadoHistorial] = useState('')
  
  // Stock filtrado calculado
  const stockFiltrado = stockItems.filter(stock => {
    let cumpleFiltros = true
    
    if (filtroProducto) {
      const nombreProducto = stock.producto?.nombre?.toLowerCase() || ''
      cumpleFiltros = cumpleFiltros && nombreProducto.includes(filtroProducto.toLowerCase())
    }
    
    if (filtroSucursal) {
      cumpleFiltros = cumpleFiltros && stock.sucursal === filtroSucursal
    }
    
    if (filtroEstado) {
      switch (filtroEstado) {
        case 'bajo':
          cumpleFiltros = cumpleFiltros && stock.cantidad < stock.stock_minimo
          break
        case 'sin_stock':
          cumpleFiltros = cumpleFiltros && stock.cantidad === 0
          break
        case 'normal':
          cumpleFiltros = cumpleFiltros && stock.cantidad >= stock.stock_minimo && stock.cantidad > 0
          break
        default:
          break
      }
    }
    
    return cumpleFiltros
  })
  
  // Paginación
  const itemsPorPagina = 12
  const totalPaginas = Math.ceil(stockFiltrado.length / itemsPorPagina)
  
  // Determinar si es admin
  const esAdmin = usuario?.rol === 'ADMIN'
  
  // Función para obtener sucursales disponibles según el rol
  const getSucursalesDisponibles = () => {
    const todasSucursales = [
      { value: 'PRINCIPAL', label: 'Principal' },
      { value: 'DEPOSITO', label: 'Depósito' },
      { value: 'SUCURSAL_1', label: 'Sucursal Norte' },
      { value: 'SUCURSAL_2', label: 'Sucursal Sur' }
    ]
    
    // Si es admin, puede ver todas las sucursales
    if (esAdmin) {
      return todasSucursales
    }
    
    // Si es vendedor, solo su sucursal asignada
    const sucursalUsuario = usuario?.sucursal_asignada || usuario?.sucursal
    if (sucursalUsuario) {
      return todasSucursales.filter(s => s.value === sucursalUsuario)
    }
    
    return todasSucursales
  }

  useEffect(() => {
    // Cargar productos siempre al inicio
    dispatch(obtenerProductos())
    
    // Cargar datos según la vista activa
    if (vistaActiva === 'stock') {
      dispatch(obtenerStockSucursal())
    } else if (vistaActiva === 'movimientos') {
      dispatch(obtenerMovimientos(filtrosMovimientos))
    } else if (vistaActiva === 'resumen' && esAdmin) {
      dispatch(obtenerResumenGlobal())
    }
  }, [dispatch, selectedSucursalId, vistaActiva, esAdmin])

  // Handlers para movimientos
  const handleFiltroChange = (campo, valor) => {
    dispatch(setFiltrosMovimientos({ [campo]: valor }))
  }

  const aplicarFiltros = () => {
    dispatch(obtenerMovimientos(filtrosMovimientos))
  }

  const limpiarFiltros = () => {
    dispatch(clearFiltrosMovimientos())
    dispatch(obtenerMovimientos())
  }

  const handleMovimientoSuccess = () => {
    // Recargar movimientos y stock después de crear uno nuevo
    dispatch(obtenerMovimientos(filtrosMovimientos))
    if (vistaActiva === 'stock') {
      dispatch(obtenerStockSucursal(filtrosStock))
    }
    setMostrarFormulario(false)
    setProductoPreseleccionado(null)
  }

  const handleVerDetalle = (movimiento) => {
    setMovimientoSeleccionado(movimiento)
  }

  // Handlers para stock
  const handleFiltroStockChange = (campo, valor) => {
    const nuevosFiltros = { ...filtrosStock, [campo]: valor }
    if (campo !== 'page') {
      nuevosFiltros.page = 1 // Resetear página al cambiar filtros
    }
    dispatch(setFiltrosStock(nuevosFiltros))
  }

  const aplicarFiltrosStock = () => {
    // Los filtros se aplican automáticamente via stockFiltrado
    // Solo necesitamos recargar si es necesario
    dispatch(obtenerStockSucursal())
  }

  const handleAbrirModalStock = () => {
    setStockSeleccionado(null)
    setMostrarModalStock(true)
  }

  const handleActualizarStock = (stockItem) => {
    setStockSeleccionado(stockItem)
    setMostrarModalStock(true)
  }

  const handleVerHistorialStock = async (productoId) => {
    try {
      setProductoHistorial(productoId)
      setMostrarModalHistorial(true) // Abrir modal primero
      
      // Obtener historial del producto
      const result = await dispatch(obtenerHistorialProducto({ productoId }))
      
      if (result.payload?.success) {
        setHistorialStock(result.payload.data || [])
      } else {
        // Si hay error, usar datos del store si están disponibles
        setHistorialStock(historialProducto || [])
      }
    } catch (error) {
      console.error('Error al obtener historial:', error)
      // En caso de error, abrir el modal con datos vacíos
      setHistorialStock([])
    }
  }
  }

  const handleStockActualizado = () => {
    // Recargar la lista de stock después de actualizar
    dispatch(obtenerStockSucursal())
  }

  const limpiarFiltrosStock = () => {
    setFiltroProducto('')
    setFiltroSucursal('')
    setFiltroEstado('')
    setPaginaActual(1)
  }

  const handleCambiarVista = (vista) => {
    setVistaActiva(vista)
    // Cargar datos según la vista seleccionada
    if (vista === 'stock') {
      dispatch(obtenerStockSucursal(filtrosStock))
    } else if (vista === 'movimientos') {
      dispatch(obtenerMovimientos(filtrosMovimientos))
    } else if (vista === 'resumen-global' && esAdmin) {
      dispatch(obtenerResumenGlobal())
    }
  }

  const renderFiltrosMovimientos = () => (
    <div className="filtros-container">
      <div className="filtros-row">
        <div className="filtro-group">
          <label>Tipo de Movimiento:</label>
          <select
            value={filtrosMovimientos.tipo || ''}
            onChange={(e) => handleFiltroChange('tipo', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
            <option value="ajuste">Ajustes</option>
          </select>
        </div>

        <div className="filtro-group">
          <label>Producto:</label>
          <select
            value={filtrosMovimientos.productoId}
            onChange={(e) => handleFiltroChange('productoId', e.target.value)}
          >
            <option value="">Todos los productos</option>
            {Array.isArray(productos) && productos.map(producto => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label>Desde:</label>
          <input
            type="date"
            value={filtrosMovimientos.fechaInicio}
            onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
          />
        </div>

        <div className="filtro-group">
          <label>Hasta:</label>
          <input
            type="date"
            value={filtrosMovimientos.fechaFin}
            onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
          />
        </div>
      </div>

      <div className="filtros-actions">
        <button className="btn-filtrar" onClick={aplicarFiltros}>
          🔍 Aplicar Filtros
        </button>
        <button className="btn-limpiar" onClick={limpiarFiltros}>
          🗑️ Limpiar
        </button>
      </div>
    </div>
  )

  const renderFiltrosStock = () => (
    <div className="filtros-container">
      <div className="filtros-row">
        <div className="filtro-group">
          <label>Producto:</label>
          <select
            value={filtroProducto}
            onChange={(e) => setFiltroProducto(e.target.value)}
          >
            <option value="">Todos los productos</option>
            {productos.map(producto => (
              <option key={producto.id} value={producto.nombre}>
                {producto.nombre} ({producto.codigo_producto})
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label>Sucursal:</label>
          <select
            value={filtroSucursal}
            onChange={(e) => setFiltroSucursal(e.target.value)}
          >
            <option value="">Todas las sucursales</option>
            {getSucursalesDisponibles().map(sucursal => (
              <option key={sucursal.value} value={sucursal.value}>
                {sucursal.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label>Estado de Stock:</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="bajo">Stock Bajo</option>
            <option value="normal">Stock Normal</option>
            <option value="alto">Stock Alto</option>
            <option value="sin_stock">Sin Stock</option>
          </select>
        </div>
      </div>

      <div className="filtros-actions">
        <button className="btn-filtrar" onClick={aplicarFiltrosStock}>
          🔍 Filtrar
        </button>
        <button className="btn-limpiar" onClick={limpiarFiltrosStock}>
          🗑️ Limpiar
        </button>
        <button className="btn-resumen" onClick={() => setVistaActiva('resumen')}>
          📊 Ver Resumen Global
        </button>
      </div>
    </div>
  )

  const renderStock = () => (
    <div className="stock-section">
      <div className="section-header">
        <h2>📦 Stock por Sucursal</h2>
        <div className="header-actions">
          <button 
            className="btn-primary"
            onClick={handleAbrirModalStock}
          >
            + Nuevo Stock
          </button>
          <button 
            className="btn-secondary"
            onClick={() => dispatch(obtenerStockSucursal())}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {renderFiltrosStock()}

      <div className="stock-lista">
        {loadingStock ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span>Cargando stock...</span>
          </div>
        ) : errorStock ? (
          <div className="error-container">
            <p>Error: {errorStock}</p>
            <button onClick={() => dispatch(obtenerStockSucursal())}>
              Reintentar
            </button>
          </div>
        ) : stockFiltrado.length > 0 ? (
          <div className="stock-grid">
            {stockFiltrado.map(stock => (
              <StockSucursalCard
                key={`${stock.producto_id}-${stock.sucursal}`}
                stock={stock}
                onActualizar={handleActualizarStock}
                onVerHistorial={handleVerHistorialStock}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No hay stock registrado</h3>
            <p>El stock por sucursal aparecerá aquí</p>
            <button 
              className="btn-primary"
              onClick={handleAbrirModalStock}
            >
              Registrar Primer Stock
            </button>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="paginacion">
          <button
            onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
            disabled={paginaActual === 1}
            className="btn-paginacion"
          >
            ‹ Anterior
          </button>
          
          <span className="paginacion-info">
            Página {paginaActual} de {totalPaginas}
          </span>
          
          <button
            onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
            disabled={paginaActual === totalPaginas}
            className="btn-paginacion"
          >
            Siguiente ›
          </button>
        </div>
      )}
    </div>
  )

  const renderResumen = () => (
    <div className="resumen-section">
      <div className="section-header">
        <h2>📊 Resumen Global de Stock</h2>
        <button 
          className="btn-secondary"
          onClick={() => dispatch(obtenerResumenGlobal())}
        >
          🔄 Actualizar
        </button>
      </div>

      {loadingResumen ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Cargando resumen...</span>
        </div>
      ) : resumenGlobal ? (
        <div className="resumen-grid">
          {resumenGlobal.productos?.map(producto => (
            <div key={producto.producto_id} className="resumen-producto-card">
              <div className="producto-header">
                <h3>{producto.nombre_producto}</h3>
                <span className="total-stock">Total: {producto.stock_total} {producto.unidad_medida}</span>
              </div>
              
              <div className="sucursales-stock">
                {producto.por_sucursal?.map(sucursal => (
                  <div key={sucursal.sucursal} className="sucursal-stock">
                    <span className="sucursal-nombre">{sucursal.sucursal}:</span>
                    <span className={`stock-valor ${sucursal.stock < producto.stock_minimo ? 'alerta' : ''}`}>
                      {sucursal.stock} {producto.unidad_medida}
                    </span>
                  </div>
                ))}
              </div>

              {producto.stock_total < producto.stock_minimo && (
                <div className="alerta-stock">
                  ⚠️ Stock total por debajo del mínimo ({producto.stock_minimo})
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No hay datos de resumen</h3>
          <p>El resumen global aparecerá aquí</p>
        </div>
      )}
    </div>
  )

  const renderAlertas = () => (
    <div className="alertas-section">
      <div className="section-header">
        <h2>🚨 Alertas de Stock</h2>
        <button 
          className="btn-secondary"
          onClick={() => dispatch(obtenerStockSucursal())}
        >
          🔄 Actualizar
        </button>
      </div>

      <div className="alertas-grid">
        {stockItems
          .filter(stock => 
            stock.cantidad < stock.stock_minimo || 
            stock.cantidad === 0
          )
          .map(stock => (
            <div key={`${stock.producto_id}-${stock.sucursal}`} className="alerta-card">
              <div className="alerta-header">
                <span className={`alerta-badge ${stock.cantidad === 0 ? 'sin-stock' : 'stock-bajo'}`}>
                  {stock.cantidad === 0 ? '🔴 Sin Stock' : '🟡 Stock Bajo'}
                </span>
                <span className="sucursal-badge">{stock.sucursal}</span>
              </div>
              
              <div className="alerta-info">
                <h4>{stock.producto?.nombre || 'Producto'}</h4>
                <p>
                  <strong>Stock Actual:</strong> {stock.cantidad} {stock.producto?.unidad_medida}
                </p>
                <p>
                  <strong>Stock Mínimo:</strong> {stock.stock_minimo} {stock.producto?.unidad_medida}
                </p>
                <p>
                  <strong>Ubicación:</strong> {stock.ubicacion || 'No especificada'}
                </p>
              </div>

              <div className="alerta-actions">
                <button 
                  className="btn-small btn-primary"
                  onClick={() => handleActualizarStock(stock)}
                >
                  ⬆️ Reabastecer
                </button>
                <button 
                  className="btn-small btn-secondary"
                  onClick={() => handleVerHistorialStock(stock.producto_id)}
                >
                  📋 Historial
                </button>
              </div>
            </div>
          ))}
      </div>

      {stockItems.filter(stock => stock.cantidad < stock.stock_minimo || stock.cantidad === 0).length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>¡Todo el stock está en niveles normales!</h3>
          <p>No hay alertas de stock en este momento</p>
        </div>
      )}
    </div>
  )

  const renderHistorial = () => (
    <div className="historial-section">
      <div className="section-header">
        <h2>📋 Historial de Movimientos</h2>
        <div className="header-actions">
          <select 
            value={productoSeleccionadoHistorial}
            onChange={(e) => setProductoSeleccionadoHistorial(e.target.value)}
          >
            <option value="">Seleccionar producto</option>
            {productos.map(producto => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} ({producto.codigo_producto})
              </option>
            ))}
          </select>
          <button 
            className="btn-secondary"
            onClick={() => productoSeleccionadoHistorial && handleVerHistorialStock(productoSeleccionadoHistorial)}
            disabled={!productoSeleccionadoHistorial}
          >
            📋 Ver Historial
          </button>
        </div>
      </div>

      {loadingHistorial ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Cargando historial...</span>
        </div>
      ) : (historialStock.length > 0 || historialProducto.length > 0) ? (
        <div className="historial-lista">
          {(historialStock.length > 0 ? historialStock : historialProducto).map(movimiento => (
            <div key={movimiento.id} className="historial-card">
              <div className="historial-header">
                <span className="fecha">{new Date(movimiento.fecha_movimiento).toLocaleDateString()}</span>
                <span className={`tipo-badge ${movimiento.tipo_movimiento}`}>
                  {movimiento.tipo_movimiento === 'entrada' ? '⬆️ Entrada' : 
                   movimiento.tipo_movimiento === 'salida' ? '⬇️ Salida' : '🔄 Ajuste'}
                </span>
                <span className="sucursal-badge">{movimiento.sucursal}</span>
              </div>
              
              <div className="historial-info">
                <p><strong>Cantidad:</strong> {movimiento.cantidad} {movimiento.unidad_medida}</p>
                <p><strong>Stock Anterior:</strong> {movimiento.stock_anterior}</p>
                <p><strong>Stock Nuevo:</strong> {movimiento.stock_nuevo}</p>
                {movimiento.motivo && <p><strong>Motivo:</strong> {movimiento.motivo}</p>}
                {movimiento.usuario && <p><strong>Usuario:</strong> {movimiento.usuario}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Selecciona un producto</h3>
          <p>Elige un producto para ver su historial de movimientos</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="inventario-page">
      <div className="page-header">
        <h1>🏭 Gestión de Inventario</h1>
        <SucursalBadge />
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{stockItems.length}</span>
            <span className="stat-label">Items en Stock</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {stockItems.filter(s => s.cantidad < s.stock_minimo).length}
            </span>
            <span className="stat-label">Alertas</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">
              {resumenGlobal?.total_productos || 0}
            </span>
            <span className="stat-label">Productos Únicos</span>
          </div>
        </div>
      </div>

      <div className="vista-tabs">
        <button 
          className={`tab-button ${vistaActiva === 'stock' ? 'active' : ''}`}
          onClick={() => setVistaActiva('stock')}
        >
          📦 Stock por Sucursal
        </button>
        <button 
          className={`tab-button ${vistaActiva === 'alertas' ? 'active' : ''}`}
          onClick={() => setVistaActiva('alertas')}
        >
          🚨 Alertas de Stock
        </button>
        <button 
          className={`tab-button ${vistaActiva === 'resumen' ? 'active' : ''}`}
          onClick={() => setVistaActiva('resumen')}
        >
          📊 Resumen Global
        </button>
        <button 
          className={`tab-button ${vistaActiva === 'historial' ? 'active' : ''}`}
          onClick={() => setVistaActiva('historial')}
        >
          📋 Historial
        </button>
      </div>

      <div className="vista-content">
        {vistaActiva === 'stock' && renderStock()}
        {vistaActiva === 'alertas' && renderAlertas()}
        {vistaActiva === 'resumen' && renderResumen()}
        {vistaActiva === 'historial' && renderHistorial()}
      </div>

      {/* Modales */}
      {mostrarModalStock && (
        <StockModal
          stock={stockSeleccionado}
          onClose={() => {
            setMostrarModalStock(false)
            setStockSeleccionado(null)
          }}
          onSuccess={handleStockActualizado}
        />
      )}

      {mostrarModalHistorial && (
        <HistorialModal
          productoId={productoHistorial}
          historial={historialStock.length > 0 ? historialStock : historialProducto}
          onClose={() => {
            setMostrarModalHistorial(false)
            setProductoHistorial(null)
            setHistorialStock([])
          }}
        />
      )}
    </div>
  )


export default Inventario

