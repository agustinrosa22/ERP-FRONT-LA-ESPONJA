import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { obtenerStockSucursal, obtenerResumenGlobal, obtenerHistorialProducto } from '../../store/slices/stockSucursalSlice'
import { obtenerTodosProductos } from '../../store/slices/productosSlice'
import { fetchSucursales } from '../../store/slices/sucursalesSlice'
import SucursalBadge from '../../components/SucursalBadge/SucursalBadge'
import StockSucursalCard from '../../components/StockSucursalCard/StockSucursalCard'
import StockModal from '../../components/StockModal/StockModal'
import HistorialModal from '../../components/HistorialModal/HistorialModal'
import { safeRender, SafeText } from '../../utils/safeRender'
import './Inventario.css'

// Función para formatear fechas de manera segura
const formatearFechaSafe = (fecha) => {
  console.log('📅 INVENTARIO - Formateando fecha:', fecha, 'tipo:', typeof fecha)
  
  // Si no hay fecha o es null/undefined
  if (!fecha || fecha === null || fecha === undefined) {
    console.log('📅 INVENTARIO - Sin fecha disponible')
    return '-'
  }

  // Si la fecha es una cadena vacía
  if (typeof fecha === 'string' && fecha.trim() === '') {
    console.log('📅 INVENTARIO - Cadena de fecha vacía')
    return '-'
  }
  
  try {
    let fechaObj
    
    // Si ya es un objeto Date válido
    if (fecha instanceof Date && !isNaN(fecha.getTime())) {
      fechaObj = fecha
    }
    // Si es un string
    else if (typeof fecha === 'string') {
      const fechaStr = fecha.trim()
      
      // Formato ISO completo: "2024-11-24T15:30:00.000Z" o "2024-11-24T15:30:00Z"
      if (fechaStr.includes('T') && (fechaStr.includes('Z') || fechaStr.includes('+'))) {
        fechaObj = new Date(fechaStr)
      }
      // Formato MySQL datetime: "2024-11-24 15:30:00"
      else if (fechaStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        fechaObj = new Date(fechaStr.replace(' ', 'T') + 'Z')
      }
      // Formato fecha simple: "2024-11-24"
      else if (fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        fechaObj = new Date(fechaStr + 'T00:00:00Z')
      }
      // Formato Laravel timestamp: "2024-11-24T15:30:00.000000Z"
      else if (fechaStr.includes('T') && fechaStr.includes('.')) {
        fechaObj = new Date(fechaStr.substring(0, fechaStr.lastIndexOf('.')) + 'Z')
      }
      // Formato dd/mm/yyyy
      else if (fechaStr.match(/^\d{2}\/\d{2}\/\d{4}/)) {
        const partes = fechaStr.split('/')
        fechaObj = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`)
      }
      // Intentar parseo directo como último recurso
      else {
        fechaObj = new Date(fechaStr)
      }
    }
    // Si es un número (timestamp Unix)
    else if (typeof fecha === 'number') {
      // Verificar si es timestamp en segundos (10 dígitos) o milisegundos (13 dígitos)
      const timestamp = fecha.toString().length === 10 ? fecha * 1000 : fecha
      fechaObj = new Date(timestamp)
    }
    // Si es un objeto con propiedades de fecha
    else if (typeof fecha === 'object' && fecha !== null) {
      if (fecha.date) {
        fechaObj = new Date(fecha.date)
      } else if (fecha.timestamp) {
        fechaObj = new Date(fecha.timestamp)
      } else {
        console.log('📅 INVENTARIO - Objeto de fecha no reconocido:', fecha)
        return '-'
      }
    }
    else {
      console.log('📅 INVENTARIO - Formato completamente desconocido:', typeof fecha, fecha)
      return '-'
    }

    // Verificar si la fecha resultante es válida
    if (!fechaObj || isNaN(fechaObj.getTime())) {
      console.log('📅 INVENTARIO - Fecha inválida después del parseo:', fechaObj)
      return 'Fecha inválida'
    }

    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Argentina/Buenos_Aires'
    })

    console.log('📅 INVENTARIO - Fecha formateada exitosamente:', fechaFormateada)
    return fechaFormateada
  } catch (error) {
    console.error('📅 INVENTARIO - Error al formatear fecha:', error, 'Fecha original:', fecha)
    return 'Error'
  }
}

// Error Boundary para capturar errores de renderizado
class InventarioErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error en Inventario:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>⚠️ Error en el componente Inventario</h2>
          <p>Se detectó un error al renderizar los datos.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Reintentar
          </button>
          <details>
            <summary>Detalles del error</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      )
    }
    return this.props.children
  }
}

const Inventario = () => {
  const dispatch = useDispatch()
  const { usuario } = useSelector((state) => state.auth)
  const { items: sucursalesItems = [], selectedSucursalId } = useSelector((state) => state.sucursales || {})
  const { stockItems = [], resumenGlobal = [], loading: loadingStock, loadingResumen, loadingHistorial, historialProducto = [], error: errorStock } = useSelector((state) => state.stockSucursal)
  const { productos = [] } = useSelector((state) => state.productos)

  const [vistaActiva, setVistaActiva] = useState('stock')
  const [mostrarModalStock, setMostrarModalStock] = useState(false)
  const [stockSeleccionado, setStockSeleccionado] = useState(null)
  const [mostrarModalHistorial, setMostrarModalHistorial] = useState(false)
  const [productoHistorial, setProductoHistorial] = useState(null)
  const [historialStock, setHistorialStock] = useState([])
  const [filtroProducto, setFiltroProducto] = useState('')
  const [filtroSucursal, setFiltroSucursal] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [productoSeleccionadoHistorial, setProductoSeleccionadoHistorial] = useState('')
  const [modoGlobal, setModoGlobal] = useState(false)

  const esAdmin = (usuario?.rol || '').toLowerCase() === 'admin'

  // 🔍 LOGGING DE DATOS DESDE REDUX STORE
  React.useEffect(() => {
    console.log('👤 USUARIO INFO:', usuario)
    console.log('🏢 SUCURSALES RAW:', sucursalesItems)
    console.log('📦 STOCK ITEMS RAW:', stockItems)
    console.log('📋 HISTORIAL STOCK RAW:', historialStock)
    console.log('📋 HISTORIAL PRODUCTO RAW:', historialProducto)
    console.log('🛍️ PRODUCTOS RAW:', productos)
    console.log('⚡ LOADING STATES:', { loadingStock, loadingResumen, loadingHistorial })
    console.log('❌ ERRORS:', { errorStock })
  }, [usuario, sucursalesItems, stockItems, historialStock, historialProducto, productos, loadingStock, loadingResumen, loadingHistorial, errorStock])

  // Validación y sanitización de datos del store
  const productosValidados = React.useMemo(() => {
    const validados = productos.filter(p => p && typeof p === 'object' && p.id).map(p => ({
      ...p,
      nombre: safeRender(p.nombre, `Producto ${p.id}`),
      codigo_producto: safeRender(p.codigo_producto, ''),
      unidad_medida: safeRender(p.unidad_medida, '')
    }))
    console.log('🛍️ PRODUCTOS VALIDADOS:', validados)
    return validados
  }, [productos])

  const stockValidado = React.useMemo(() => {
    const validado = stockItems.filter(s => s && typeof s === 'object').map(s => ({
      ...s,
      producto: s.producto ? {
        ...s.producto,
        nombre: safeRender(s.producto.nombre, 'Producto'),
        unidad_medida: safeRender(s.producto.unidad_medida, '')
      } : null,
      sucursal: s.sucursal ? {
        ...s.sucursal,
        nombre: safeRender(s.sucursal.nombre, 'Sucursal')
      } : null
    }))
    console.log('📦 STOCK VALIDADO:', validado)
    return validado
  }, [stockItems])

  // Sanitización del historial
  const historialValidado = React.useMemo(() => {
    const combinado = [...historialStock, ...historialProducto]
    console.log('📋 HISTORIAL COMBINADO:', combinado)
    
    const validado = combinado.filter(h => h && typeof h === 'object').map(h => {
      const sanitizado = {
        ...h,
        usuario: safeRender(h.usuario, 'Usuario'),
        motivo: safeRender(h.motivo, ''),
        sucursal: safeRender(h.sucursal, h.sucursal_nombre || h.sucursal_id || 'Sin sucursal'),
        cantidad: safeRender(h.cantidad, '0'),
        unidad_medida: safeRender(h.unidad_medida, ''),
        stock_anterior: safeRender(h.stock_anterior, '-'),
        stock_nuevo: safeRender(h.stock_nuevo, '-')
      }
      console.log('📋 Item historial antes:', h, 'después:', sanitizado)
      return sanitizado
    })
    
    console.log('📋 HISTORIAL VALIDADO FINAL:', validado)
    return validado
  }, [historialStock, historialProducto])

  useEffect(() => {
    console.log('🚀 INICIANDO CARGA DE DATOS...')
    console.log('🚀 Estado actual:', { esAdmin, modoGlobal, vistaActiva, selectedSucursalId })
    
    // Cargar datos iniciales
    console.log('🏢 Cargando sucursales...')
    dispatch(fetchSucursales()) // Cargar sucursales disponibles
    
    // Por defecto el backend está en modo estricto (solo productos con stock en la sucursal del contexto)
    // Si el usuario activa modoGlobal, pedimos catálogo completo (global=true)
    console.log('🛍️ Cargando productos con parámetros:', { incluir_stock_sucursal: true, ...(modoGlobal ? { global: true } : {}) })
    dispatch(obtenerTodosProductos({ incluir_stock_sucursal: true, ...(modoGlobal ? { global: true } : {}) }))
    
    if (vistaActiva === 'stock') {
      console.log('📦 Cargando stock sucursal...')
      dispatch(obtenerStockSucursal())
    }
    if (vistaActiva === 'resumen' && esAdmin) {
      console.log('📊 Cargando resumen global (admin)...')
      dispatch(obtenerResumenGlobal())
    }
  }, [dispatch, vistaActiva, esAdmin, selectedSucursalId, modoGlobal])

  const stockFiltrado = stockValidado.filter((stock) => {
    const stockActual = Number(stock.stock_actual ?? 0)
    const stockMinimo = Number(stock.stock_minimo ?? 0)
    let ok = true
    if (filtroProducto) ok = ok && String(stock.producto?.id || stock.producto_id || '') === String(filtroProducto)
    if (filtroSucursal) {
      const sucId = stock.sucursal?.id ? String(stock.sucursal.id) : String(stock.sucursal_id || '')
      ok = ok && sucId === String(filtroSucursal)
    }
    if (filtroEstado) {
      switch (filtroEstado) {
        case 'bajo': ok = ok && stockActual < stockMinimo; break
        case 'sin_stock': ok = ok && stockActual === 0; break
        case 'normal': ok = ok && stockActual >= stockMinimo && stockActual > 0; break
        case 'alto': ok = ok && (stock.stock_maximo ? stockActual > stock.stock_maximo * 0.8 : stockActual > stockMinimo * 2); break
        default: break
      }
    }
    return ok
  })

  const itemsPorPagina = 12
  const totalPaginas = Math.ceil(stockFiltrado.length / itemsPorPagina)

  const getSucursalesDisponibles = () => {
    const base = sucursalesItems.map(s => ({ value: String(s.id), label: s.nombre }))
    if (esAdmin) return base
    const sucId = usuario?.sucursal_id ? String(usuario.sucursal_id) : null
    return sucId ? base.filter(s => s.value === sucId) : base
  }

  const handleAbrirModalStock = () => { setStockSeleccionado(null); setMostrarModalStock(true) }
  const handleActualizarStock = (stock) => { setStockSeleccionado(stock); setMostrarModalStock(true) }
  const limpiarFiltrosStock = () => { setFiltroProducto(''); setFiltroSucursal(''); setFiltroEstado(''); setPaginaActual(1) }

  const handleVerHistorialStock = async (productoId) => {
    console.log('📋 INICIANDO HISTORIAL PARA PRODUCTO:', productoId)
    try {
      setProductoHistorial(productoId)
      setMostrarModalHistorial(true)
      
      console.log('📋 Llamando dispatch obtenerHistorialProducto...')
      const result = await dispatch(obtenerHistorialProducto({ productoId }))
      console.log('📋 Resultado del dispatch:', result)
      
      if (result.payload?.success) {
        console.log('📋 Historial obtenido exitosamente:', result.payload.data)
        setHistorialStock(result.payload.data || [])
      } else {
        console.log('📋 No se pudo obtener historial, usando historialProducto:', historialProducto)
        setHistorialStock(historialProducto || [])
      }
    } catch (e) {
      console.error('📋 ERROR en handleVerHistorialStock:', e)
      setHistorialStock([])
    }
  }

  const handleStockActualizado = () => { dispatch(obtenerStockSucursal()) }

  const renderFiltrosStock = () => (
    <div className="filtros-container">
      <div className="filtros-row">
        <div className="filtro-group">
          <label>Producto:</label>
          <select value={filtroProducto} onChange={(e) => setFiltroProducto(e.target.value)}>
            <option value="">Todos</option>
            {productosValidados.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.codigo_producto})</option>)}
          </select>
        </div>
        <div className="filtro-group">
          <label>Sucursal:</label>
          <select value={filtroSucursal} onChange={(e) => setFiltroSucursal(e.target.value)}>
            <option value="">Todas</option>
            {getSucursalesDisponibles().map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="filtro-group">
          <label>Estado:</label>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="bajo">Stock Bajo</option>
            <option value="normal">Stock Normal</option>
            <option value="alto">Stock Alto</option>
            <option value="sin_stock">Sin Stock</option>
          </select>
        </div>
        <div className="filtro-group">
          <label>Catálogo:</label>
          <button
            type="button"
            className={`btn-toggle ${modoGlobal ? 'active' : ''}`}
            onClick={() => setModoGlobal(v => !v)}
            title={modoGlobal ? 'Ver solo productos presentes en la sucursal' : 'Ver catálogo global'}
          >
            {modoGlobal ? 'Global' : 'Estricto'}
          </button>
        </div>
      </div>
      <div className="filtros-actions">
        <button className="btn-filtrar" onClick={() => {/* filtros reactivos */}}>🔍 Filtrar</button>
        <button className="btn-limpiar" onClick={limpiarFiltrosStock}>🗑️ Limpiar</button>
        {esAdmin && <button className="btn-resumen" onClick={() => setVistaActiva('resumen')}>📊 Resumen Global</button>}
      </div>
    </div>
  )

  const renderStock = () => (
    <div className="stock-section">
      <div className="section-header">
        <h2>📦 Stock por Sucursal</h2>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleAbrirModalStock}>+ Nuevo Stock</button>
          <button className="btn-secondary" onClick={() => dispatch(obtenerStockSucursal())}>🔄 Actualizar</button>
        </div>
      </div>
      {renderFiltrosStock()}
      <div className="stock-lista">
        {loadingStock ? (
          <div className="loading-container"><div className="loading-spinner" /><span>Cargando stock...</span></div>
        ) : errorStock ? (
          <div className="error-container"><p>Error: {errorStock}</p><button onClick={() => dispatch(obtenerStockSucursal())}>Reintentar</button></div>
        ) : stockFiltrado.length > 0 ? (
          <div className="stock-grid">
            {stockFiltrado.map(stock => (
              <StockSucursalCard
                key={`${stock.producto_id}-${stock.sucursal?.id || stock.sucursal_id || 'sin'}`}
                stockItem={stock}
                onActualizar={() => handleActualizarStock(stock)}
                onVerHistorial={() => handleVerHistorialStock(stock.producto_id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No hay stock registrado</h3>
            <p>El stock por sucursal aparecerá aquí</p>
            <button className="btn-primary" onClick={handleAbrirModalStock}>Registrar Primer Stock</button>
          </div>
        )}
      </div>
      {totalPaginas > 1 && (
        <div className="paginacion">
          <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} className="btn-paginacion">‹ Anterior</button>
          <span className="paginacion-info">Página {paginaActual} de {totalPaginas}</span>
          <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas} className="btn-paginacion">Siguiente ›</button>
        </div>
      )}
    </div>
  )

  const renderResumen = () => (
    <div className="resumen-section">
      <div className="section-header">
        <h2>📊 Resumen Global de Stock</h2>
        <button className="btn-secondary" onClick={() => dispatch(obtenerResumenGlobal())}>🔄 Actualizar</button>
      </div>
      {loadingResumen ? (
        <div className="loading-container"><div className="loading-spinner" /><span>Cargando resumen...</span></div>
      ) : Array.isArray(resumenGlobal) && resumenGlobal.length > 0 ? (
        <div className="resumen-grid">
          {resumenGlobal.map(item => (
            <div key={item.producto?.id || item.producto?.codigo_producto || Math.random()} className="resumen-producto-card">
              <div className="producto-header">
                <h3>{safeRender(item.producto?.nombre, 'Producto')}</h3>
                {typeof item.stock_total !== 'undefined' && <span className="total-stock">Total: {safeRender(item.stock_total)}</span>}
              </div>
              <div className="sucursales-stock">
                {item.sucursales?.map(suc => (
                  <div key={suc.sucursal?.id || suc.sucursal?.nombre} className="sucursal-stock">
                    <span className="sucursal-nombre">{safeRender(suc.sucursal, 'Sucursal')}:</span>
                    <span className={`stock-valor ${suc.stock_bajo ? 'alerta' : ''}`}>{safeRender(suc.stock_actual)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state"><div className="empty-icon">📊</div><h3>No hay datos de resumen</h3><p>El resumen global aparecerá aquí</p></div>
      )}
    </div>
  )

  const renderAlertas = () => (
    <div className="alertas-section">
      <div className="section-header">
        <h2>🚨 Alertas de Stock</h2>
        <button className="btn-secondary" onClick={() => dispatch(obtenerStockSucursal())}>🔄 Actualizar</button>
      </div>
      <div className="alertas-grid">
        {stockItems.filter(s => Number(s.stock_actual ?? 0) === 0 || Number(s.stock_actual ?? 0) < Number(s.stock_minimo ?? 0)).map(stock => (
          <div key={`${stock.producto_id}-${stock.sucursal?.id || stock.sucursal_id || 'sin'}`} className="alerta-card">
            <div className="alerta-header">
              <span className={`alerta-badge ${Number(stock.stock_actual ?? 0) === 0 ? 'sin-stock' : 'stock-bajo'}`}>{Number(stock.stock_actual ?? 0) === 0 ? '🔴 Sin Stock' : '🟡 Stock Bajo'}</span>
              <span className="sucursal-badge">{safeRender(stock.sucursal, stock.sucursal_id)}</span>
            </div>
            <div className="alerta-info">
              <h4>{safeRender(stock.producto?.nombre, 'Producto')}</h4>
              <p><strong>Stock Actual:</strong> {Number(stock.stock_actual ?? 0)} {safeRender(stock.producto?.unidad_medida)}</p>
              <p><strong>Stock Mínimo:</strong> {safeRender(stock.stock_minimo)} {safeRender(stock.producto?.unidad_medida)}</p>
              <p><strong>Ubicación:</strong> {safeRender(stock.ubicacion, 'No especificada')}</p>
            </div>
            <div className="alerta-actions">
              <button className="btn-small btn-primary" onClick={() => handleActualizarStock(stock)}>⬆️ Reabastecer</button>
              <button className="btn-small btn-secondary" onClick={() => handleVerHistorialStock(stock.producto_id)}>📋 Historial</button>
            </div>
          </div>
        ))}
      </div>
      {stockValidado.filter(s => Number(s.stock_actual ?? 0) === 0 || Number(s.stock_actual ?? 0) < Number(s.stock_minimo ?? 0)).length === 0 && (
        <div className="empty-state"><div className="empty-icon">✅</div><h3>¡Todo el stock está en niveles normales!</h3><p>No hay alertas de stock</p></div>
      )}
    </div>
  )

  const renderHistorial = () => (
    <div className="historial-section">
      <div className="section-header">
        <h2>📋 Historial de Movimientos</h2>
        <div className="header-actions">
          <select value={productoSeleccionadoHistorial} onChange={(e) => setProductoSeleccionadoHistorial(e.target.value)}>
            <option value="">Seleccionar producto</option>
            {productosValidados.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.codigo_producto})</option>)}
          </select>
          <button className="btn-secondary" disabled={!productoSeleccionadoHistorial} onClick={() => productoSeleccionadoHistorial && handleVerHistorialStock(productoSeleccionadoHistorial)}>📋 Ver Historial</button>
        </div>
      </div>
      {loadingHistorial ? (
        <div className="loading-container"><div className="loading-spinner" /><span>Cargando historial...</span></div>
      ) : historialValidado.length > 0 ? (
        <div className="historial-lista">
          {historialValidado.map((mov, index) => (
            <div key={mov?.id || `historial-${index}`} className="historial-card">
              <div className="historial-header">
                <span className="fecha">{formatearFechaSafe(mov.fecha_movimiento)}</span>
                <span className={`tipo-badge ${mov.tipo_movimiento}`}>{mov.tipo_movimiento === 'entrada' ? '⬆️ Entrada' : mov.tipo_movimiento === 'salida' ? '⬇️ Salida' : '🔄 Ajuste'}</span>
                <span className="sucursal-badge"><SafeText fallback="Sin sucursal">{mov.sucursal}</SafeText></span>
              </div>
              <div className="historial-info">
                <p><strong>Cantidad:</strong> <SafeText fallback="0">{mov.cantidad}</SafeText> <SafeText>{mov.unidad_medida}</SafeText></p>
                <p><strong>Stock Anterior:</strong> <SafeText fallback="-">{mov.stock_anterior}</SafeText></p>
                <p><strong>Stock Nuevo:</strong> <SafeText fallback="-">{mov.stock_nuevo}</SafeText></p>
                {mov.motivo && <p><strong>Motivo:</strong> <SafeText>{mov.motivo}</SafeText></p>}
                {mov.usuario && <p><strong>Usuario:</strong> <SafeText fallback="Usuario">{mov.usuario}</SafeText></p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state"><div className="empty-icon">📋</div><h3>Selecciona un producto</h3><p>Elige un producto para ver su historial</p></div>
      )}
    </div>
  )

  const totalAlertas = stockValidado.filter(s => Number(s.stock_actual ?? 0) < Number(s.stock_minimo ?? 0)).length
  const productosUnicos = resumenGlobal.length > 0 ? resumenGlobal.length : new Set(stockValidado.map(s => s.producto_id)).size

  return (
    <div className="inventario-page">
      <div className="page-header">
        <h1>🏭 Gestión de Inventario</h1>
        <SucursalBadge />
        <div className="header-stats">
          <div className="stat-card"><span className="stat-number">{stockValidado.length}</span><span className="stat-label">Items en Stock</span></div>
          <div className="stat-card"><span className="stat-number">{totalAlertas}</span><span className="stat-label">Alertas</span></div>
          <div className="stat-card"><span className="stat-number">{productosUnicos}</span><span className="stat-label">Productos Únicos</span></div>
        </div>
      </div>
      <div className="vista-tabs">
        <button className={`tab-button ${vistaActiva === 'stock' ? 'active' : ''}`} onClick={() => setVistaActiva('stock')}>📦 Stock</button>
        <button className={`tab-button ${vistaActiva === 'alertas' ? 'active' : ''}`} onClick={() => setVistaActiva('alertas')}>🚨 Alertas</button>
        {esAdmin && <button className={`tab-button ${vistaActiva === 'resumen' ? 'active' : ''}`} onClick={() => setVistaActiva('resumen')}>📊 Resumen</button>}
        <button className={`tab-button ${vistaActiva === 'historial' ? 'active' : ''}`} onClick={() => setVistaActiva('historial')}>📋 Historial</button>
      </div>
      <div className="vista-content">
        {vistaActiva === 'stock' && renderStock()}
        {vistaActiva === 'alertas' && renderAlertas()}
        {vistaActiva === 'resumen' && esAdmin && renderResumen()}
        {vistaActiva === 'historial' && renderHistorial()}
      </div>
      {mostrarModalStock && (
        <StockModal
          stock={stockSeleccionado}
          onClose={() => { setMostrarModalStock(false); setStockSeleccionado(null) }}
          onSuccess={handleStockActualizado}
        />
      )}
      {mostrarModalHistorial && (
        <HistorialModal
          productoId={productoHistorial}
          historial={historialStock.length > 0 ? historialStock : historialProducto}
          onClose={() => { setMostrarModalHistorial(false); setProductoHistorial(null); setHistorialStock([]) }}
        />
      )}
    </div>
  )
}

// Componente envuelto con Error Boundary
const InventarioConErrorBoundary = () => (
  <InventarioErrorBoundary>
    <Inventario />
  </InventarioErrorBoundary>
)

export default InventarioConErrorBoundary
