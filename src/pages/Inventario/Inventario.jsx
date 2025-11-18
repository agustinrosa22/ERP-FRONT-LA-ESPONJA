import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { obtenerStockSucursal, obtenerResumenGlobal, obtenerHistorialProducto } from '../../store/slices/stockSucursalSlice'
import { obtenerTodosProductos } from '../../store/slices/productosSlice'
import SucursalBadge from '../../components/SucursalBadge/SucursalBadge'
import StockSucursalCard from '../../components/StockSucursalCard/StockSucursalCard'
import StockModal from '../../components/StockModal/StockModal'
import HistorialModal from '../../components/HistorialModal/HistorialModal'
import './Inventario.css'

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

  useEffect(() => {
    // Por defecto el backend está en modo estricto (solo productos con stock en la sucursal del contexto)
    // Si el usuario activa modoGlobal, pedimos catálogo completo (global=true)
    dispatch(obtenerTodosProductos({ incluir_stock_sucursal: true, ...(modoGlobal ? { global: true } : {}) }))
    if (vistaActiva === 'stock') dispatch(obtenerStockSucursal())
    if (vistaActiva === 'resumen' && esAdmin) dispatch(obtenerResumenGlobal())
  }, [dispatch, vistaActiva, esAdmin, selectedSucursalId, modoGlobal])

  const stockFiltrado = stockItems.filter((stock) => {
    const stockActual = Number(stock.stock_actual ?? 0)
    const stockMinimo = Number(stock.stock_minimo ?? 0)
    let ok = true
    if (filtroProducto) ok = ok && (stock.producto?.nombre || '').toLowerCase().includes(filtroProducto.toLowerCase())
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
    try {
      setProductoHistorial(productoId)
      setMostrarModalHistorial(true)
      const result = await dispatch(obtenerHistorialProducto({ productoId }))
      if (result.payload?.success) setHistorialStock(result.payload.data || [])
      else setHistorialStock(historialProducto || [])
    } catch (e) {
      console.error('Historial error', e)
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
            {productos.map(p => <option key={p.id} value={p.nombre}>{p.nombre} ({p.codigo_producto})</option>)}
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
                <h3>{item.producto?.nombre || 'Producto'}</h3>
                {typeof item.stock_total !== 'undefined' && <span className="total-stock">Total: {item.stock_total}</span>}
              </div>
              <div className="sucursales-stock">
                {item.sucursales?.map(suc => (
                  <div key={suc.sucursal?.id || suc.sucursal?.nombre} className="sucursal-stock">
                    <span className="sucursal-nombre">{suc.sucursal?.nombre || 'Sucursal'}:</span>
                    <span className={`stock-valor ${suc.stock_bajo ? 'alerta' : ''}`}>{suc.stock_actual}</span>
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
              <span className="sucursal-badge">{stock.sucursal?.nombre || stock.sucursal_id}</span>
            </div>
            <div className="alerta-info">
              <h4>{stock.producto?.nombre || 'Producto'}</h4>
              <p><strong>Stock Actual:</strong> {Number(stock.stock_actual ?? 0)} {stock.producto?.unidad_medida}</p>
              <p><strong>Stock Mínimo:</strong> {stock.stock_minimo} {stock.producto?.unidad_medida}</p>
              <p><strong>Ubicación:</strong> {stock.ubicacion || 'No especificada'}</p>
            </div>
            <div className="alerta-actions">
              <button className="btn-small btn-primary" onClick={() => handleActualizarStock(stock)}>⬆️ Reabastecer</button>
              <button className="btn-small btn-secondary" onClick={() => handleVerHistorialStock(stock.producto_id)}>📋 Historial</button>
            </div>
          </div>
        ))}
      </div>
      {stockItems.filter(s => Number(s.stock_actual ?? 0) === 0 || Number(s.stock_actual ?? 0) < Number(s.stock_minimo ?? 0)).length === 0 && (
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
            {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.codigo_producto})</option>)}
          </select>
          <button className="btn-secondary" disabled={!productoSeleccionadoHistorial} onClick={() => productoSeleccionadoHistorial && handleVerHistorialStock(productoSeleccionadoHistorial)}>📋 Ver Historial</button>
        </div>
      </div>
      {loadingHistorial ? (
        <div className="loading-container"><div className="loading-spinner" /><span>Cargando historial...</span></div>
      ) : (historialStock.length > 0 || historialProducto.length > 0) ? (
        <div className="historial-lista">
          {(historialStock.length > 0 ? historialStock : historialProducto).map(mov => (
            <div key={mov.id} className="historial-card">
              <div className="historial-header">
                <span className="fecha">{mov.fecha_movimiento ? new Date(mov.fecha_movimiento).toLocaleDateString() : '-'}</span>
                <span className={`tipo-badge ${mov.tipo_movimiento}`}>{mov.tipo_movimiento === 'entrada' ? '⬆️ Entrada' : mov.tipo_movimiento === 'salida' ? '⬇️ Salida' : '🔄 Ajuste'}</span>
                <span className="sucursal-badge">{mov.sucursal || mov.sucursal_id}</span>
              </div>
              <div className="historial-info">
                <p><strong>Cantidad:</strong> {mov.cantidad} {mov.unidad_medida}</p>
                <p><strong>Stock Anterior:</strong> {mov.stock_anterior}</p>
                <p><strong>Stock Nuevo:</strong> {mov.stock_nuevo}</p>
                {mov.motivo && <p><strong>Motivo:</strong> {mov.motivo}</p>}
                {mov.usuario && <p><strong>Usuario:</strong> {mov.usuario}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state"><div className="empty-icon">📋</div><h3>Selecciona un producto</h3><p>Elige un producto para ver su historial</p></div>
      )}
    </div>
  )

  const totalAlertas = stockItems.filter(s => Number(s.stock_actual ?? 0) < Number(s.stock_minimo ?? 0)).length
  const productosUnicos = resumenGlobal.length > 0 ? resumenGlobal.length : new Set(stockItems.map(s => s.producto_id)).size

  return (
    <div className="inventario-page">
      <div className="page-header">
        <h1>🏭 Gestión de Inventario</h1>
        <SucursalBadge />
        <div className="header-stats">
          <div className="stat-card"><span className="stat-number">{stockItems.length}</span><span className="stat-label">Items en Stock</span></div>
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

export default Inventario
