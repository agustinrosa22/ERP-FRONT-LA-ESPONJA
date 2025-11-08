import React from 'react'
import './HistorialModal.css'

const HistorialModal = ({ productoId, historial, onClose }) => {
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTipoMovimientoInfo = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return { icon: '⬆️', label: 'Entrada', class: 'entrada' }
      case 'salida':
        return { icon: '⬇️', label: 'Salida', class: 'salida' }
      case 'ajuste':
        return { icon: '🔄', label: 'Ajuste', class: 'ajuste' }
      default:
        return { icon: '📦', label: 'Movimiento', class: 'default' }
    }
  }

  const calcularDiferencia = (stockAnterior, stockNuevo) => {
    const diferencia = stockNuevo - stockAnterior
    if (diferencia > 0) {
      return { valor: `+${diferencia}`, class: 'positivo' }
    } else if (diferencia < 0) {
      return { valor: diferencia.toString(), class: 'negativo' }
    }
    return { valor: '0', class: 'neutro' }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content historial-modal">
        <div className="modal-header">
          <h2>📋 Historial de Movimientos</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="historial-content">
          {historial && historial.length > 0 ? (
            <>
              <div className="historial-stats">
                <div className="stat-item">
                  <span className="stat-label">Total de Movimientos:</span>
                  <span className="stat-value">{historial.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Último Movimiento:</span>
                  <span className="stat-value">
                    {formatearFecha(historial[0]?.fecha_movimiento)}
                  </span>
                </div>
              </div>

              <div className="historial-timeline">
                {historial.map((movimiento, index) => {
                  const tipoInfo = getTipoMovimientoInfo(movimiento.tipo_movimiento)
                  const diferencia = calcularDiferencia(movimiento.stock_anterior, movimiento.stock_nuevo)
                  
                  return (
                    <div key={movimiento.id || index} className="timeline-item">
                      <div className="timeline-marker">
                        <div className={`marker-icon ${tipoInfo.class}`}>
                          {tipoInfo.icon}
                        </div>
                      </div>
                      
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <div className="timeline-info">
                            <span className={`tipo-badge ${tipoInfo.class}`}>
                              {tipoInfo.label}
                            </span>
                            <span className="sucursal-badge">
                              {movimiento.sucursal}
                            </span>
                            <span className="fecha">
                              {formatearFecha(movimiento.fecha_movimiento)}
                            </span>
                          </div>
                          <div className={`cantidad-badge ${diferencia.class}`}>
                            {diferencia.valor}
                          </div>
                        </div>

                        <div className="timeline-details">
                          <div className="detail-row">
                            <span className="detail-label">Cantidad:</span>
                            <span className="detail-value">
                              {movimiento.cantidad} {movimiento.unidad_medida || ''}
                            </span>
                          </div>
                          
                          <div className="detail-row">
                            <span className="detail-label">Stock:</span>
                            <span className="detail-value">
                              {movimiento.stock_anterior} → {movimiento.stock_nuevo}
                            </span>
                          </div>

                          {movimiento.motivo && (
                            <div className="detail-row">
                              <span className="detail-label">Motivo:</span>
                              <span className="detail-value motivo">
                                {movimiento.motivo}
                              </span>
                            </div>
                          )}

                          {movimiento.usuario && (
                            <div className="detail-row">
                              <span className="detail-label">Usuario:</span>
                              <span className="detail-value">
                                {movimiento.usuario}
                              </span>
                            </div>
                          )}

                          {movimiento.ubicacion && (
                            <div className="detail-row">
                              <span className="detail-label">Ubicación:</span>
                              <span className="detail-value">
                                {movimiento.ubicacion}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="empty-historial">
              <div className="empty-icon">📋</div>
              <h3>Sin historial de movimientos</h3>
              <p>No se encontraron movimientos para este producto</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default HistorialModal