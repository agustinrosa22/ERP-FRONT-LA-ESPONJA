import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { obtenerEstadisticasCliente, obtenerTransaccionesCliente } from '../../store/slices/clientesSlice'
import './ClienteEstadisticas.css'

const ClienteEstadisticas = ({ cliente, onClose }) => {
  const dispatch = useDispatch()
  const { 
    estadisticas, 
    transacciones, 
    loadingEstadisticas, 
    loadingTransacciones, 
    error 
  } = useSelector(state => state.clientes)
  
  const [activeTab, setActiveTab] = useState('resumen')
  const [filtrosTransacciones, setFiltrosTransacciones] = useState({
    page: 1,
    limit: 10,
    fecha_desde: '',
    fecha_hasta: '',
    categoria_producto: '',
    orden: 'fecha_desc'
  })

  const clienteId = cliente?.id
  const clienteStats = estadisticas[clienteId]
  const clienteTransacciones = transacciones[clienteId]

  useEffect(() => {
    if (clienteId) {
      // Cargar estadísticas con historial limitado
      dispatch(obtenerEstadisticasCliente({ 
        id: clienteId, 
        params: { limite_historial: 5 } 
      }))
      
      // Cargar transacciones iniciales
      dispatch(obtenerTransaccionesCliente({ 
        id: clienteId, 
        params: filtrosTransacciones 
      }))
    }
  }, [clienteId, dispatch])

  const handleFiltroChange = (campo, valor) => {
    const nuevosFiltros = { ...filtrosTransacciones, [campo]: valor, page: 1 }
    setFiltrosTransacciones(nuevosFiltros)
    
    dispatch(obtenerTransaccionesCliente({ 
      id: clienteId, 
      params: nuevosFiltros 
    }))
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'ARS'
    }).format(valor)
  }

  const getTendenciaIcon = (tendencia) => {
    switch (tendencia?.toLowerCase()) {
      case 'creciente':
        return '📈'
      case 'decreciente':
        return '📉'
      case 'estable':
        return '➡️'
      default:
        return '📊'
    }
  }

  const getFrecuenciaColor = (frecuencia) => {
    switch (frecuencia?.toLowerCase()) {
      case 'muy frecuente':
        return '#10b981'
      case 'frecuente':
        return '#3b82f6'
      case 'moderada':
        return '#f59e0b'
      case 'baja':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  if (loadingEstadisticas) {
    return (
      <div className="cliente-estadisticas-modal">
        <div className="modal-content">
          <div className="modal-header">
            <div className="header-info">
              <h2>📊 Estadísticas del Cliente</h2>
              {cliente && (
                <p className="cliente-info">
                  {cliente.nombre_completo || `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim()} 
                  - {cliente.documento}
                </p>
              )}
            </div>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="cliente-estadisticas-modal">
        <div className="modal-content">
          <div className="modal-header">
            <div className="header-info">
              <h2>📊 Estadísticas del Cliente</h2>
              {cliente && (
                <p className="cliente-info">
                  {cliente.nombre_completo || `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim()} 
                  - {cliente.documento}
                </p>
              )}
            </div>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="error-container">
            <p>Error: {error}</p>
            <button onClick={() => dispatch(obtenerEstadisticasCliente({ id: clienteId }))}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cliente-estadisticas-modal">
      <div className="modal-content large">
        <div className="modal-header">
          <div className="header-info">
            <h2>📊 Estadísticas del Cliente</h2>
            {cliente && (
              <p className="cliente-info">
                {cliente.nombre_completo || `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim()} 
                - {cliente.documento}
              </p>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="stats-tabs">
          <button 
            className={`tab ${activeTab === 'resumen' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumen')}
          >
            📋 Resumen
          </button>
          <button 
            className={`tab ${activeTab === 'tendencias' ? 'active' : ''}`}
            onClick={() => setActiveTab('tendencias')}
          >
            📈 Tendencias
          </button>
          <button 
            className={`tab ${activeTab === 'transacciones' ? 'active' : ''}`}
            onClick={() => setActiveTab('transacciones')}
          >
            🧾 Transacciones
          </button>
        </div>

        <div className="stats-content">
          {activeTab === 'resumen' && clienteStats && (
            <div className="resumen-tab">
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <span className="stat-value">{formatearMoneda(clienteStats.monto_total_comprado || 0)}</span>
                    <span className="stat-label">Total Comprado</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">🛍️</div>
                  <div className="stat-info">
                    <span className="stat-value">{clienteStats.total_compras || 0}</span>
                    <span className="stat-label">Total Compras</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <span className="stat-value">{formatearMoneda(clienteStats.compra_promedio || 0)}</span>
                    <span className="stat-label">Compra Promedio</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">💳</div>
                  <div className="stat-info">
                    <span className="stat-value">{formatearMoneda(clienteStats.credito_disponible || 0)}</span>
                    <span className="stat-label">Crédito Disponible</span>
                  </div>
                </div>
              </div>

              <div className="credit-progress">
                <div className="progress-header">
                  <span>Uso de Crédito</span>
                  <span>{clienteStats.porcentaje_credito_usado || 0}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${Math.min(clienteStats.porcentaje_credito_usado || 0, 100)}%`,
                      backgroundColor: (clienteStats.porcentaje_credito_usado || 0) > 80 ? '#ef4444' : '#3b82f6'
                    }}
                  ></div>
                </div>
              </div>

              {clienteStats.historial_transacciones && clienteStats.historial_transacciones.length > 0 && (
                <div className="recent-transactions">
                  <h3>🕐 Transacciones Recientes</h3>
                  <div className="transactions-list">
                    {clienteStats.historial_transacciones.map(transaccion => (
                      <div key={transaccion.venta_id} className="transaction-item">
                        <div className="transaction-header">
                          <div className="transaction-info">
                            <div className="transaction-title">
                              <span className="venta-id">Venta #{transaccion.venta_id}</span>
                              <span className="transaction-date">
                                {formatearFecha(transaccion.fecha)}
                              </span>
                            </div>
                            <div className="transaction-summary">
                              <span className="items-count">{transaccion.cantidad_items} items</span>
                              <span className="products-count">{transaccion.productos?.length || 0} productos</span>
                            </div>
                          </div>
                          <div className="transaction-amount">
                            <span className="amount">{formatearMoneda(transaccion.total)}</span>
                            <span className="payment-method">{transaccion.metodo_pago}</span>
                          </div>
                        </div>
                        
                        {/* Productos comprados */}
                        {transaccion.productos && transaccion.productos.length > 0 && (
                          <div className="transaction-products">
                            <div className="products-header">
                              <span>📦 Productos comprados:</span>
                            </div>
                            <div className="products-grid">
                              {transaccion.productos.map((producto, idx) => (
                                <div key={idx} className="product-item">
                                  <div className="product-info">
                                    <span className="product-name">{producto.nombre}</span>
                                    {producto.codigo_producto && (
                                      <span className="product-code">#{producto.codigo_producto}</span>
                                    )}
                                    {producto.unidad_medida && (
                                      <span className="product-unit">📦 {producto.unidad_medida}</span>
                                    )}
                                  </div>
                                  <div className="product-quantity">
                                    {producto.cantidad} {producto.unidad_medida || 'unid'} x {formatearMoneda(producto.precio_unitario || 0)}
                                  </div>
                                  <div className="product-total">
                                    {formatearMoneda(producto.subtotal || (producto.cantidad * (producto.precio_unitario || 0)))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Categorías de productos */}
                        {transaccion.productos && transaccion.productos.length > 0 && (
                          <div className="transaction-categories">
                            <span>🏷️ Categorías: </span>
                            <div className="categories-tags">
                              {[...new Set(transaccion.productos.map(p => p.categoria))].map((categoria, idx) => {
                                const cantidadEnCategoria = transaccion.productos
                                  .filter(p => p.categoria === categoria)
                                  .reduce((sum, p) => sum + p.cantidad, 0)
                                return (
                                  <span key={idx} className="category-tag">
                                    {categoria} ({cantidadEnCategoria})
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Descuentos aplicados */}
                        {transaccion.descuentos_aplicados && transaccion.descuentos_aplicados > 0 && (
                          <div className="transaction-discount">
                            <span>💰 Descuento aplicado: {formatearMoneda(transaccion.descuentos_aplicados)}</span>
                          </div>
                        )}
                        
                        {/* Información adicional */}
                        <div className="transaction-footer">
                          {transaccion.vendedor && (
                            <span className="seller-info">👤 Vendedor: {transaccion.vendedor}</span>
                          )}
                          {transaccion.sucursal && (
                            <span className="branch-info">🏪 Sucursal: {transaccion.sucursal}</span>
                          )}
                          {transaccion.observaciones && (
                            <span className="notes">📝 {transaccion.observaciones}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tendencias' && clienteStats?.tendencias_compra && (
            <div className="tendencias-tab">
              <div className="tendencias-grid">
                <div className="tendencia-card">
                  <h3>🎯 Productos Favoritos</h3>
                  <div className="productos-list">
                    {clienteStats.tendencias_compra.productos_favoritos?.map(producto => (
                      <div key={producto.producto_id} className="producto-favorito">
                        <div className="producto-info">
                          <span className="producto-nombre">{producto.nombre}</span>
                          <span className="producto-categoria">{producto.categoria}</span>
                          {producto.codigo_producto && (
                            <span className="producto-codigo">#{producto.codigo_producto}</span>
                          )}
                        </div>
                        <div className="producto-stats">
                          <span>{producto.total_cantidad} {producto.unidad_medida || 'unid'}</span>
                          <span>{formatearMoneda(producto.monto_total)}</span>
                          <span className="veces-comprado">{producto.veces_comprado} compras</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="tendencia-card">
                  <h3>📂 Categorías Preferidas</h3>
                  <div className="categorias-list">
                    {clienteStats.tendencias_compra.categorias_preferidas?.map(categoria => (
                      <div key={categoria.categoria} className="categoria-item">
                        <div className="categoria-info">
                          <span className="categoria-nombre">{categoria.categoria}</span>
                          <span className="categoria-veces">
                            {categoria.veces_comprado} compras • {categoria.total_cantidad} items
                          </span>
                        </div>
                        <div className="categoria-monto">
                          {formatearMoneda(categoria.monto_total)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="tendencia-card">
                  <h3>⏰ Frecuencia de Compra</h3>
                  <div className="frecuencia-info">
                    <div className="frecuencia-item">
                      <span className="frecuencia-label">Frecuencia:</span>
                      <span 
                        className="frecuencia-value"
                        style={{ 
                          color: getFrecuenciaColor(clienteStats.tendencias_compra.frecuencia_compra?.frecuencia) 
                        }}
                      >
                        {clienteStats.tendencias_compra.frecuencia_compra?.frecuencia}
                      </span>
                    </div>
                    <div className="frecuencia-item">
                      <span className="frecuencia-label">Días entre compras:</span>
                      <span className="frecuencia-value">
                        {clienteStats.tendencias_compra.frecuencia_compra?.dias_entre_compras} días
                      </span>
                    </div>
                    <div className="frecuencia-item">
                      <span className="frecuencia-label">Última compra:</span>
                      <span className="frecuencia-value">
                        Hace {clienteStats.tendencias_compra.frecuencia_compra?.ultima_compra_hace_dias} días
                      </span>
                    </div>
                  </div>
                </div>

                <div className="tendencia-card">
                  <h3>
                    {getTendenciaIcon(clienteStats.tendencias_compra.evolucion_ticket?.tendencia)} 
                    Evolución del Ticket
                  </h3>
                  <div className="evolucion-info">
                    <div className="evolucion-item">
                      <span className="evolucion-label">Tendencia:</span>
                      <span className="evolucion-value">
                        {clienteStats.tendencias_compra.evolucion_ticket?.tendencia}
                      </span>
                    </div>
                    <div className="evolucion-item">
                      <span className="evolucion-label">Cambio:</span>
                      <span 
                        className={`evolucion-value ${
                          (clienteStats.tendencias_compra.evolucion_ticket?.cambio_porcentual || 0) >= 0 
                            ? 'positive' : 'negative'
                        }`}
                      >
                        {clienteStats.tendencias_compra.evolucion_ticket?.cambio_porcentual || 0}%
                      </span>
                    </div>
                    <div className="ticket-comparison">
                      <div className="ticket-item">
                        <span>Inicial: {formatearMoneda(clienteStats.tendencias_compra.evolucion_ticket?.ticket_inicial || 0)}</span>
                      </div>
                      <div className="ticket-item">
                        <span>Actual: {formatearMoneda(clienteStats.tendencias_compra.evolucion_ticket?.ticket_actual || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transacciones' && (
            <div className="transacciones-tab">
              <div className="filtros-transacciones">
                <div className="filtros-row">
                  <div className="filtro-group">
                    <label>Desde:</label>
                    <input
                      type="date"
                      value={filtrosTransacciones.fecha_desde}
                      onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
                    />
                  </div>
                  
                  <div className="filtro-group">
                    <label>Hasta:</label>
                    <input
                      type="date"
                      value={filtrosTransacciones.fecha_hasta}
                      onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
                    />
                  </div>
                  
                  {/* <div className="filtro-group">
                    <label>Categoría:</label>
                    <select
                      value={filtrosTransacciones.categoria_producto}
                      onChange={(e) => handleFiltroChange('categoria_producto', e.target.value)}
                    >
                      <option value="">Todas</option>
                      <option value="Limpieza">Limpieza</option>
                      <option value="Cuidado Personal">Cuidado Personal</option>
                      <option value="Hogar">Hogar</option>
                      <option value="Industriales">Industriales</option>
                    </select>
                  </div> */}
                  
                  <div className="filtro-group">
                    <label>Ordenar:</label>
                    <select
                      value={filtrosTransacciones.orden}
                      onChange={(e) => handleFiltroChange('orden', e.target.value)}
                    >
                      <option value="fecha_desc">Más recientes</option>
                      <option value="fecha_asc">Más antiguos</option>
                      <option value="monto_desc">Mayor monto</option>
                      <option value="monto_asc">Menor monto</option>
                    </select>
                  </div>
                </div>
              </div>

              {loadingTransacciones ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Cargando transacciones...</p>
                </div>
              ) : clienteTransacciones?.transacciones?.length > 0 ? (
                <div className="transacciones-list">
                  {clienteTransacciones.estadisticas_periodo && (
                    <div className="periodo-stats">
                      <h4>📊 Estadísticas del Período</h4>
                      <div className="periodo-grid">
                        <span>Total: {formatearMoneda(clienteTransacciones.estadisticas_periodo.monto_total_periodo)}</span>
                        <span>Transacciones: {clienteTransacciones.estadisticas_periodo.total_transacciones}</span>
                        <span>Ticket Promedio: {formatearMoneda(clienteTransacciones.estadisticas_periodo.ticket_promedio)}</span>
                        <span>Productos Diferentes: {clienteTransacciones.estadisticas_periodo.productos_diferentes}</span>
                      </div>
                    </div>
                  )}

                  {clienteTransacciones.transacciones.map(transaccion => (
                    <div key={transaccion.venta_id} className="transaccion-detalle">
                      <div className="transaccion-header">
                        <div className="transaccion-info">
                          <span className="venta-id">Venta #{transaccion.venta_id}</span>
                          <span className="transaccion-fecha">
                            {formatearFecha(transaccion.fecha)}
                          </span>
                        </div>
                        <div className="transaccion-monto">
                          <span className="monto-total">{formatearMoneda(transaccion.total)}</span>
                          <span className="metodo-pago">{transaccion.metodo_pago}</span>
                        </div>
                      </div>

                      <div className="transaccion-resumen">
                        <span>{transaccion.resumen?.cantidad_items || 0} items</span>
                        <span>{transaccion.resumen?.cantidad_productos || 0} productos</span>
                        {transaccion.resumen?.monto_descuentos > 0 && (
                          <span className="descuento">
                            Descuento: {formatearMoneda(transaccion.resumen.monto_descuentos)}
                          </span>
                        )}
                      </div>

                      <div className="productos-transaccion">
                        {transaccion.productos?.map(producto => (
                          <div key={`${transaccion.venta_id}-${producto.producto_id}`} className="producto-transaccion">
                            <div className="producto-detalle">
                              <span className="producto-nombre">{producto.nombre}</span>
                              <span className="producto-codigo">{producto.codigo_producto}</span>
                              {producto.unidad && (
                                <span className="producto-unidad">📦 {producto.unidad}</span>
                              )}
                            </div>
                            <div className="producto-cantidad">
                              {producto.cantidad} {producto.unidad ? `${producto.unidad}` : 'unid'} x {formatearMoneda(producto.precio_unitario)}
                            </div>
                            <div className="producto-subtotal">
                              {formatearMoneda(producto.subtotal)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {clienteTransacciones.paginacion?.total_pages > 1 && (
                    <div className="paginacion">
                      <button
                        onClick={() => handleFiltroChange('page', filtrosTransacciones.page - 1)}
                        disabled={filtrosTransacciones.page <= 1}
                      >
                        ‹ Anterior
                      </button>
                      
                      <span className="page-info">
                        Página {filtrosTransacciones.page} de {clienteTransacciones.paginacion.total_pages}
                      </span>
                      
                      <button
                        onClick={() => handleFiltroChange('page', filtrosTransacciones.page + 1)}
                        disabled={filtrosTransacciones.page >= clienteTransacciones.paginacion.total_pages}
                      >
                        Siguiente ›
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-transactions">
                  <div className="empty-icon">🧾</div>
                  <h3>No hay transacciones</h3>
                  <p>No se encontraron transacciones con los filtros aplicados</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClienteEstadisticas