import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  obtenerVentas,
  obtenerVentaPorId,
  cancelarVenta,
  obtenerEstadisticasVentas,
  setFiltros,
  clearFiltros,
  selectVentas,
  selectLoadingVentas,
  selectLoadingCancelar,
  selectFiltrosVentas,
  selectEstadisticasVentas,
  selectErrorVentas
} from '../../store/slices/ventasSlice'
import { obtenerTodosClientes } from '../../store/slices/clientesSlice'
import VentaForm from '../../components/VentaForm/VentaForm'
import './Ventas.css'

const Ventas = () => {
  const dispatch = useDispatch()
  
  // Estados de Redux
  const ventas = useSelector(selectVentas)
  const loadingVentas = useSelector(selectLoadingVentas)
  const loadingCancelar = useSelector(selectLoadingCancelar)
  const filtros = useSelector(selectFiltrosVentas)
  const estadisticas = useSelector(selectEstadisticasVentas)
  const error = useSelector(selectErrorVentas)
  

  
  const { clientes = [] } = useSelector(state => state.clientes || {})

  // Estados locales
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null)
  const [mostrarDetalle, setMostrarDetalle] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        await dispatch(obtenerVentas(filtros))
        await dispatch(obtenerEstadisticasVentas())
        await dispatch(obtenerTodosClientes())
      } catch (error) {
        console.error('Error al cargar datos:', error)
      }
    }
    
    cargarDatos()
  }, [dispatch])

  // Actualizar ventas cuando cambian los filtros
  useEffect(() => {
    dispatch(obtenerVentas(filtros))
  }, [filtros, dispatch])

  // Handlers
  const handleNuevaVenta = () => {
    setMostrarFormulario(true)
  }

  const handleVentaSuccess = () => {
    setMostrarFormulario(false)
    dispatch(obtenerVentas(filtros))
    dispatch(obtenerEstadisticasVentas())
  }

  const handleVerDetalle = async (venta) => {
    try {
      await dispatch(obtenerVentaPorId(venta.id))
      setVentaSeleccionada(venta)
      setMostrarDetalle(true)
    } catch (error) {
      alert(`Error al cargar detalles: ${error}`)
    }
  }

  const handleCancelarVenta = async (ventaId) => {
    if (window.confirm('¿Está seguro de cancelar esta venta? Esta acción no se puede deshacer.')) {
      try {
        await dispatch(cancelarVenta(ventaId)).unwrap()
        alert('Venta cancelada exitosamente')
        dispatch(obtenerVentas(filtros))
        dispatch(obtenerEstadisticasVentas())
      } catch (error) {
        alert(`Error al cancelar venta: ${error}`)
      }
    }
  }

  const handleFiltroChange = (filtroKey, valor) => {
    dispatch(setFiltros({ [filtroKey]: valor }))
  }

  const handleLimpiarFiltros = () => {
    dispatch(clearFiltros())
  }

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Obtener nombre del cliente
  const obtenerNombreCliente = (venta) => {
    if (venta.cliente_nombre) {
      return venta.cliente_nombre
    }
    if (venta.cliente) {
      return `${venta.cliente.nombre} ${venta.cliente.apellido}`
    }
    return 'Cliente no registrado'
  }

  // Renderizar estadísticas
  const renderEstadisticas = () => (
      <div className="estadisticas-ventas">
        <h3>📊 Resumen de Ventas</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-number">
                ${(estadisticas.resumen?.monto_total || 0).toLocaleString('es-AR')}
              </span>
              <span className="stat-label">Monto Total</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <span className="stat-number">
                {estadisticas.resumen?.total_ventas || 0}
              </span>
              <span className="stat-label">Total de Ventas</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <span className="stat-number">
                ${(estadisticas.resumen?.venta_promedio || 0).toLocaleString('es-AR')}
              </span>
              <span className="stat-label">Venta Promedio</span>
            </div>
          </div>

          {estadisticas.ventas_por_metodo && estadisticas.ventas_por_metodo.length > 0 && (
            <div className="stat-card">
              <div className="stat-icon">💳</div>
              <div className="stat-info">
                <span className="stat-number">
                  {estadisticas.ventas_por_metodo[0]?.metodo_pago?.charAt(0).toUpperCase() + 
                   estadisticas.ventas_por_metodo[0]?.metodo_pago?.slice(1) || 'N/A'}
                </span>
                <span className="stat-label">Método Más Usado</span>
                <small style={{ color: '#28a745', fontSize: '0.8rem' }}>
                  {estadisticas.ventas_por_metodo[0]?.cantidad || 0} ventas - 
                  ${parseFloat(estadisticas.ventas_por_metodo[0]?.monto_total || 0).toLocaleString('es-AR')}
                </small>
              </div>
            </div>
          )}
        </div>

        {/* Productos más vendidos */}
        {estadisticas.top_productos && estadisticas.top_productos.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h4>🏆 Productos Más Vendidos</h4>
            <div className="stats-grid">
              {estadisticas.top_productos.slice(0, 3).map((producto, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-info">
                    <span className="stat-number">
                      {producto.total_vendido} ARG
                    </span>
                    <span className="stat-label">{producto.producto?.nombre || 'Producto'}</span>
                    <small style={{ color: '#28a745', fontSize: '0.8rem' }}>
                      ${parseFloat(producto.monto_total || 0).toLocaleString('es-AR')}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )

  // Renderizar filtros
  const renderFiltros = () => (
    <div className="filtros-section">
      <h3>🔍 Filtros</h3>
      <div className="filtros-grid">
        <input
          type="text"
          placeholder="🔍 Buscar por número de factura o cliente..."
          value={filtros.search || ''}
          onChange={(e) => handleFiltroChange('search', e.target.value)}
          className="filtro-input"
        />

        <select
          value={filtros.cliente_id || ''}
          onChange={(e) => handleFiltroChange('cliente_id', e.target.value)}
          className="filtro-select"
        >
          <option value="">Todos los clientes</option>
          {clientes.map(cliente => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre} {cliente.apellido}
            </option>
          ))}
        </select>

        <select
          value={filtros.metodo_pago || ''}
          onChange={(e) => handleFiltroChange('metodo_pago', e.target.value)}
          className="filtro-select"
        >
          <option value="">Todos los métodos</option>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta_credito">Tarjeta de Crédito</option>
          <option value="tarjeta_debito">Tarjeta de Débito</option>
          <option value="transferencia">Transferencia</option>
          <option value="credito">Crédito</option>
        </select>

        <select
          value={filtros.estado || ''}
          onChange={(e) => handleFiltroChange('estado', e.target.value)}
          className="filtro-select"
        >
          <option value="">Todos los estados</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>

        <input
          type="date"
          value={filtros.fecha_desde || ''}
          onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
          className="filtro-input"
        />

        <input
          type="date"
          value={filtros.fecha_hasta || ''}
          onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
          className="filtro-input"
        />

        <button onClick={handleLimpiarFiltros} className="btn-secondary">
          🧹 Limpiar
        </button>
      </div>
    </div>
  )

  // Renderizar modal de detalle
  const renderModalDetalle = () => (
    mostrarDetalle && ventaSeleccionada && (
      <div className="modal-overlay">
        <div className="modal-content venta-detalle-modal">
          <div className="modal-header">
            <h2>📄 Detalles de Venta #{ventaSeleccionada.numero_factura}</h2>
            <button 
              onClick={() => setMostrarDetalle(false)}
              className="close-button"
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="venta-detalle-content">
              <div className="detalle-section">
                <h3>📋 Información General</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Cliente:</span>
                    <span className="detalle-value">{obtenerNombreCliente(ventaSeleccionada)}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Fecha:</span>
                    <span className="detalle-value">{formatearFecha(ventaSeleccionada.fecha)}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Método de Pago:</span>
                    <span className="detalle-value">{ventaSeleccionada.metodo_pago}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Estado:</span>
                    <span className={`status-badge status-${ventaSeleccionada.estado}`}>
                      {ventaSeleccionada.estado}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Descuento:</span>
                    <span className="detalle-value">{ventaSeleccionada.descuento}%</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Total:</span>
                    <span className="detalle-value detalle-total">
                      ${(ventaSeleccionada.total || 0).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>

              {ventaSeleccionada.detalles && ventaSeleccionada.detalles.length > 0 && (
                <div className="detalle-section">
                  <h3>📦 Productos Vendidos</h3>
                  <div className="productos-table">
                    <div className="table-header">
                      <span>Producto</span>
                      <span>Cantidad</span>
                      <span>Precio Unit.</span>
                      <span>Subtotal</span>
                    </div>
                    {ventaSeleccionada.detalles.map((detalle, index) => (
                      <div key={index} className="table-row">
                        <span>{detalle.producto?.nombre || 'Producto eliminado'}</span>
                        <span>{detalle.cantidad}</span>
                        <span>${(detalle.precio_unitario || 0).toLocaleString('es-AR')}</span>
                        <span>${(detalle.subtotal || 0).toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ventaSeleccionada.observaciones && (
                <div className="detalle-section">
                  <h3>📝 Observaciones</h3>
                  <p className="observaciones-text">{ventaSeleccionada.observaciones}</p>
                </div>
              )}

              {ventaSeleccionada.estado === 'completada' && (
                <div className="detalle-section">
                  <h3>🔄 Acciones</h3>
                  <div className="acciones-buttons">
                    <button 
                      className="btn-danger"
                      onClick={() => {
                        setMostrarDetalle(false)
                        handleCancelarVenta(ventaSeleccionada.id)
                      }}
                      disabled={loadingCancelar}
                    >
                      ❌ Cancelar Venta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  )

  return (
    <div className="ventas-page">
      <div className="page-header">
        <h1>🛒 Módulo de Ventas</h1>
        <p>Gestión completa de ventas y facturación</p>
      </div>

      {/* Estadísticas */}
      {renderEstadisticas()}

      {/* Filtros */}
      {renderFiltros()}

      {/* Header con botón de nueva venta */}
      <div className="section-header">
        <h2>📄 Historial de Ventas</h2>
        <button onClick={handleNuevaVenta} className="btn-primary">
          ➕ Nueva Venta
        </button>
      </div>

      {/* Lista de ventas */}
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {loadingVentas ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando ventas...</p>
        </div>
      ) : ventas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>No hay ventas registradas</h3>
          <p>Comienza creando tu primera venta</p>
          <button onClick={handleNuevaVenta} className="btn-primary">
            ➕ Crear Primera Venta
          </button>
        </div>
      ) : (
        <div className="ventas-grid">
          {ventas.map(venta => (
            <div key={venta.id} className="venta-card">
              <div className="card-header">
                <div className="venta-info">
                  <h3>Venta #{venta.numero_factura}</h3>
                  <p className="fecha">{formatearFecha(venta.fecha)}</p>
                </div>
                <span className={`status-badge status-${venta.estado}`}>
                  {venta.estado}
                </span>
              </div>

              <div className="card-content">
                <div className="venta-details">
                  <p><strong>Cliente:</strong> {obtenerNombreCliente(venta)}</p>
                  <p><strong>Método de Pago:</strong> {venta.metodo_pago}</p>
                  <p><strong>Total:</strong> ${(venta.total || 0).toLocaleString('es-AR')}</p>
                  {venta.observaciones && (
                    <p><strong>Obs:</strong> {venta.observaciones}</p>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-secondary btn-small"
                  onClick={() => handleVerDetalle(venta)}
                >
                  👁️ Ver Detalle
                </button>
                {venta.estado === 'completada' && (
                  <button 
                    className="btn-danger btn-small"
                    onClick={() => handleCancelarVenta(venta.id)}
                    disabled={loadingCancelar}
                  >
                    ❌ Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      {mostrarFormulario && (
        <VentaForm
          onClose={() => setMostrarFormulario(false)}
          onSuccess={handleVentaSuccess}
        />
      )}

      {renderModalDetalle()}
    </div>
  )
}

export default Ventas