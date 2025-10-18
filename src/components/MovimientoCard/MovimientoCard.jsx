import React from 'react'
import './MovimientoCard.css'

const MovimientoCard = ({ movimiento, onVerDetalle }) => {
  if (!movimiento) return null

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(valor || 0)
  }

  const getTipoClass = (tipo) => {
    switch(tipo) {
      case 'entrada': return 'tipo-entrada'
      case 'salida': return 'tipo-salida'
      case 'ajuste': return 'tipo-ajuste'
      default: return ''
    }
  }

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'entrada': return '📥'
      case 'salida': return '📤'
      case 'ajuste': return '⚖️'
      default: return '📦'
    }
  }

  const getTipoTexto = (tipo) => {
    switch(tipo) {
      case 'entrada': return 'Entrada'
      case 'salida': return 'Salida'
      case 'ajuste': return 'Ajuste'
      default: return tipo
    }
  }

  const calcularValorTotal = () => {
    if (movimiento.precio_unitario && movimiento.cantidad) {
      return movimiento.precio_unitario * movimiento.cantidad
    }
    return 0
  }

  return (
    <div className={`movimiento-card ${getTipoClass(movimiento.tipo)}`}>
      {/* Header de la tarjeta */}
      <div className="movimiento-header">
        <div className="tipo-badge">
          <span className="tipo-icon">{getTipoIcon(movimiento.tipo)}</span>
          <span className="tipo-text">{getTipoTexto(movimiento.tipo)}</span>
        </div>
        <div className="fecha">
          {formatearFecha(movimiento.fecha)}
        </div>
      </div>

      {/* Información del producto */}
      <div className="producto-info">
        <h3 className="producto-nombre">
          {movimiento.producto?.nombre || 'Producto eliminado'}
        </h3>
        <p className="producto-codigo">
          Código: {movimiento.producto?.codigo_producto || 'N/A'}
        </p>
      </div>

      {/* Detalles del movimiento */}
      <div className="movimiento-detalles">
        <div className="detalle-row">
          <div className="detalle-item">
            <span className="label">Cantidad:</span>
            <span className="value cantidad">
              {movimiento.cantidad} {movimiento.producto?.unidad_medida || 'unidad'}
            </span>
          </div>
          
          {movimiento.precio_unitario > 0 && (
            <div className="detalle-item">
              <span className="label">Precio Unit.:</span>
              <span className="value precio">
                {formatearMoneda(movimiento.precio_unitario)}
              </span>
            </div>
          )}
        </div>

        {calcularValorTotal() > 0 && (
          <div className="detalle-row">
            <div className="detalle-item total">
              <span className="label">Total:</span>
              <span className="value">
                {formatearMoneda(calcularValorTotal())}
              </span>
            </div>
          </div>
        )}

        <div className="detalle-row">
          <div className="detalle-item motivo">
            <span className="label">Motivo:</span>
            <span className="value">{movimiento.motivo}</span>
          </div>
        </div>

        {movimiento.observaciones && (
          <div className="detalle-row">
            <div className="detalle-item observaciones">
              <span className="label">Observaciones:</span>
              <span className="value">{movimiento.observaciones}</span>
            </div>
          </div>
        )}
      </div>

      {/* Usuario que registró */}
      <div className="movimiento-footer">
        <div className="usuario-info">
          <span className="usuario-label">Registrado por:</span>
          <span className="usuario-nombre">
            {movimiento.Usuario?.nombre || 'Sistema'}
          </span>
        </div>
        
        {onVerDetalle && (
          <button 
            className="btn-ver-detalle"
            onClick={() => onVerDetalle(movimiento)}
          >
            Ver Detalle
          </button>
        )}
      </div>

      {/* Indicador de impacto en stock */}
      <div className="stock-impact">
        {movimiento.tipo === 'entrada' && (
          <div className="impact-positive">
            +{movimiento.cantidad} en stock
          </div>
        )}
        {movimiento.tipo === 'salida' && (
          <div className="impact-negative">
            -{movimiento.cantidad} en stock
          </div>
        )}
        {movimiento.tipo === 'ajuste' && (
          <div className="impact-neutral">
            Ajuste de stock
          </div>
        )}
      </div>
    </div>
  )
}

export default MovimientoCard