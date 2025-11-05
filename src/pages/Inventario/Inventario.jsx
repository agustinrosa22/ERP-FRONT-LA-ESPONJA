import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  obtenerProductos, 
  obtenerMovimientos, 
  setFiltrosMovimientos,
  clearFiltrosMovimientos 
} from '../../store/slices/inventarioSlice'
import MovimientoForm from '../../components/MovimientoForm/MovimientoForm'
import MovimientoCard from '../../components/MovimientoCard/MovimientoCard'
import AlertasStock from '../../components/AlertasStock/AlertasStock'
import './Inventario.css'
import SucursalBadge from '../../components/SucursalBadge/SucursalBadge'

const Inventario = () => {
  const dispatch = useDispatch()
  const { selectedSucursalId } = useSelector((state) => state.sucursales)
  const inventarioState = useSelector((state) => state.inventario)
  const { 
    productos = [], 
    movimientos = [], 
    loading, 
    loadingMovimientos, 
    error, 
    filtrosMovimientos 
  } = inventarioState
  


  // Estados locales
  const [vistaActiva, setVistaActiva] = useState('movimientos') // movimientos, alertas, productos
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null)
  const [productoPreseleccionado, setProductoPreseleccionado] = useState(null)

  useEffect(() => {
    // Cargar datos iniciales y cuando cambia la sucursal activa
    dispatch(obtenerProductos())
    dispatch(obtenerMovimientos())
  }, [dispatch, selectedSucursalId])

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

  const handleProductoSeleccionado = (producto, tipoMovimiento = null) => {
    setProductoPreseleccionado({ producto, tipoMovimiento })
    setMostrarFormulario(true)
  }

  const handleMovimientoSuccess = () => {
    // Recargar tanto movimientos como productos después de crear uno nuevo
    dispatch(obtenerMovimientos(filtrosMovimientos))
    dispatch(obtenerProductos())
    setMostrarFormulario(false)
    setProductoPreseleccionado(null)
  }

  const handleVerDetalle = (movimiento) => {
    setMovimientoSeleccionado(movimiento)
    // Aquí se podría abrir un modal de detalle
  }

  const renderFiltros = () => (
    <div className="filtros-container">
      <div className="filtros-row">
        <div className="filtro-group">
          <label>Tipo de Movimiento:</label>
          <select
            value={filtrosMovimientos.tipo}
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

  const renderMovimientos = () => (
    <div className="movimientos-section">
      <div className="section-header">
        <h2>📦 Movimientos de Inventario</h2>
        <button 
          className="btn-primary"
          onClick={() => setMostrarFormulario(true)}
        >
          + Nuevo Movimiento
        </button>
      </div>

      {renderFiltros()}

      <div className="movimientos-lista">
        {loadingMovimientos ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span>Cargando movimientos...</span>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>Error: {error}</p>
            <button onClick={() => dispatch(obtenerMovimientos())}>
              Reintentar
            </button>
          </div>
        ) : movimientos.length > 0 ? (
          movimientos.map(movimiento => {

            return (
              <MovimientoCard
                key={movimiento.id}
                movimiento={movimiento}
                onVerDetalle={handleVerDetalle}
              />
            )
          })
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No hay movimientos registrados</h3>
            <p>Los movimientos de inventario aparecerán aquí</p>
            <button 
              className="btn-primary"
              onClick={() => setMostrarFormulario(true)}
            >
              Registrar Primer Movimiento
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const renderAlertas = () => (
    <div className="alertas-section">
      <AlertasStock onProductoSelect={handleProductoSeleccionado} />
    </div>
  )

  const renderProductos = () => (
    <div className="productos-section">
      <div className="section-header">
        <h2>📋 Lista de Productos</h2>
      </div>

      <div className="productos-grid">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span>Cargando productos...</span>
          </div>
        ) : productos.length > 0 ? (
          productos.map(producto => (
            <div key={producto.id} className="producto-card">
              <div className="producto-header">
                <h3>{producto.nombre}</h3>
                <span className="producto-codigo">{producto.codigo_producto}</span>
              </div>
              
              <div className="producto-info">
                <p><strong>Stock:</strong> {producto.stock} {producto.unidad_medida}</p>
                <p><strong>Stock Mín:</strong> {producto.stock_minimo}</p>
                <p><strong>Precio:</strong> ${producto.precio}</p>
                <p><strong>Categoría:</strong> {producto.categoria}</p>
              </div>

              <div className="producto-actions">
                <button 
                  className="btn-entrada"
                  onClick={() => handleProductoSeleccionado(producto, 'entrada')}
                >
                  + Entrada
                </button>
                <button 
                  className="btn-salida"
                  onClick={() => handleProductoSeleccionado(producto, 'salida')}
                >
                  - Salida
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No hay productos registrados</h3>
            <p>Ve a la sección de Productos para agregar productos</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="inventario-page">
      <div className="page-header">
        <h1>🏭 Gestión de Inventario</h1>
        <SucursalBadge />
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{productos.length}</span>
            <span className="stat-label">Productos</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{movimientos.length}</span>
            <span className="stat-label">Movimientos</span>
          </div>
        </div>
      </div>

      <div className="vista-tabs">
        <button 
          className={`tab-button ${vistaActiva === 'movimientos' ? 'active' : ''}`}
          onClick={() => setVistaActiva('movimientos')}
        >
          📦 Movimientos
        </button>
        <button 
          className={`tab-button ${vistaActiva === 'alertas' ? 'active' : ''}`}
          onClick={() => setVistaActiva('alertas')}
        >
          🚨 Alertas de Stock
        </button>
        <button 
          className={`tab-button ${vistaActiva === 'productos' ? 'active' : ''}`}
          onClick={() => setVistaActiva('productos')}
        >
          📋 Productos
        </button>
      </div>

      <div className="vista-content">
        {vistaActiva === 'movimientos' && renderMovimientos()}
        {vistaActiva === 'alertas' && renderAlertas()}
        {vistaActiva === 'productos' && renderProductos()}
      </div>

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <MovimientoForm
          onClose={() => {
            setMostrarFormulario(false)
            setProductoPreseleccionado(null)
          }}
          onSuccess={handleMovimientoSuccess}
          productoPreseleccionado={productoPreseleccionado}
        />
      )}
    </div>
  )
}

export default Inventario