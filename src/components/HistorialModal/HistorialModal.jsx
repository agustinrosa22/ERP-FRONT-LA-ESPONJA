import React from 'react'
import './HistorialModal.css'

// Función utilitaria para renderizar valores de manera segura
const safeRender = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'object') {
    if (value.nombre) return String(value.nombre)
    if (value.id) return String(value.id)
    return String(fallback)
  }
  return String(value)
}

const HistorialModal = ({ productoId, historial, onClose }) => {
  const formatearFecha = (fecha) => {
    console.log('📅 FORMATEANDO FECHA:', fecha, 'tipo:', typeof fecha)
    
    // Si no hay fecha o es null/undefined
    if (!fecha || fecha === null || fecha === undefined) {
      console.log('📅 Sin fecha disponible')
      return 'Sin fecha'
    }

    // Si la fecha es una cadena vacía
    if (typeof fecha === 'string' && fecha.trim() === '') {
      console.log('📅 Cadena de fecha vacía')
      return 'Sin fecha'
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
          console.log('📅 Objeto de fecha no reconocido:', fecha)
          return 'Fecha desconocida'
        }
      }
      else {
        console.log('📅 Formato de fecha completamente desconocido:', typeof fecha, fecha)
        return 'Sin fecha'
      }

      // Verificar si la fecha resultante es válida
      if (!fechaObj || isNaN(fechaObj.getTime())) {
        console.log('📅 Fecha inválida después del parseo:', fechaObj)
        return 'Fecha inválida'
      }

      // Formatear la fecha
      const fechaFormateada = fechaObj.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires'
      })

      console.log('📅 Fecha formateada exitosamente:', fechaFormateada)
      return fechaFormateada

    } catch (error) {
      console.error('📅 Error al formatear fecha:', error, 'Fecha original:', fecha)
      return 'Error en fecha'
    }
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

  // Logging de datos del historial
  React.useEffect(() => {
    console.log('📋 HISTORIAL MODAL - Datos recibidos:')
    console.log('📋 productoId:', productoId)
    console.log('📋 historial completo:', historial)
    if (historial && historial.length > 0) {
      console.log('📋 Primer item del historial:', historial[0])
      console.log('📋 Estructura de fechas:', historial.map(h => ({
        id: h.id,
        fecha_original: h.fecha_movimiento,
        tipo_fecha: typeof h.fecha_movimiento
      })))
    }
  }, [productoId, historial])

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
                    {formatearFecha(historial[0]?.fecha_creacion)}
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
                              {movimiento.fecha_creacion}
                            </span>
                          </div>
                          {/* <div className={`cantidad-badge ${diferencia.class}`}>
                            {diferencia.valor}
                          </div> */}
                        </div>

                        <div className="timeline-details">
                          <div className="detail-row">
                            <span className="detail-label">Cantidad:</span>
                            <span className="detail-value">
                              {movimiento.cantidad} {movimiento.unidad_medida || ''}
                            </span>
                          </div>
                          
                          {/* <div className="detail-row">
                            <span className="detail-label">Stock:</span>
                            <span className="detail-value">
                              {movimiento.stock_anterior} → {movimiento.stock_nuevo}
                            </span>
                          </div> */}

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
                                {safeRender(movimiento.usuario, 'Usuario')}
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