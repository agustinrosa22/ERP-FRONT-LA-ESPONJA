import './CajaMovimientoCard.css'

const CajaMovimientoCard = ({ movimiento, onEdit, onDelete }) => {
  if (!movimiento) {
    console.warn('CajaMovimientoCard: movimiento no proporcionado')
    return null
  }

  console.log('CajaMovimientoCard: Datos del movimiento:', movimiento)
  const formatearMoneda = (monto) => {
    const valor = parseFloat(monto) || 0
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(valor)
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const obtenerIconoTipo = (tipo) => {
    return tipo === 'ingreso' ? '💰' : '💸'
  }

  const obtenerClaseTipo = (tipo) => {
    return tipo === 'ingreso' ? 'ingreso' : 'egreso'
  }

  const obtenerTextoCategoria = (categoria) => {
    const categorias = {
      'venta': 'Venta',
      'compra': 'Compra',
      'gasto_operativo': 'Gasto Operativo',
      'gasto_administrativo': 'Gasto Administrativo', 
      'inversion': 'Inversión',
      'otro': 'Otros'
    }
    return categorias[categoria] || categoria
  }

  const obtenerTextoMetodoPago = (metodo) => {
    const metodos = {
      'efectivo': 'Efectivo',
      'tarjeta': 'Tarjeta',
      'transferencia': 'Transferencia',
      'cheque': 'Cheque'
    }
    return metodos[metodo] || metodo
  }

  const obtenerTextoEstado = (estado) => {
    const estados = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado', 
      'anulado': 'Anulado'
    }
    return estados[estado] || estado
  }

  return (
    <div className={`caja-movimiento-card ${obtenerClaseTipo(movimiento.tipo)}`}>
      <div className="movimiento-header">
        <div className="movimiento-tipo">
          <span className="tipo-icon">{obtenerIconoTipo(movimiento.tipo)}</span>
          <span className="tipo-text">{movimiento.tipo.toUpperCase()}</span>
        </div>
        <div className="movimiento-monto">
          <span className={`monto ${obtenerClaseTipo(movimiento.tipo)}`}>
            {movimiento.tipo === 'egreso' && '-'}
            {formatearMoneda(movimiento.monto)}
          </span>
        </div>
      </div>

      <div className="movimiento-info">
        <div className="info-item">
          <span className="label">Descripción:</span>
          <span className="value">{movimiento.descripcion}</span>
        </div>

        <div className="info-item">
          <span className="label">Categoría:</span>
          <span className="value categoria">{obtenerTextoCategoria(movimiento.categoria)}</span>
        </div>

        <div className="info-item">
          <span className="label">Método de Pago:</span>
          <span className="value">{obtenerTextoMetodoPago(movimiento.metodo_pago)}</span>
        </div>

        {movimiento.comprobante && (
          <div className="info-item">
            <span className="label">Comprobante:</span>
            <span className="value">{movimiento.comprobante}</span>
          </div>
        )}

        <div className="info-item">
          <span className="label">Estado:</span>
          <span className={`value estado ${movimiento.estado}`}>
            {obtenerTextoEstado(movimiento.estado)}
          </span>
        </div>

        <div className="info-item">
          <span className="label">Fecha:</span>
          <span className="value">{formatearFecha(movimiento.fecha)}</span>
        </div>

        {movimiento.observaciones && (
          <div className="info-item observaciones">
            <span className="label">Observaciones:</span>
            <span className="value">{movimiento.observaciones}</span>
          </div>
        )}

        {/* Referencias a venta o compra */}
        {movimiento.venta && (
          <div className="info-item referencia">
            <span className="label">Venta:</span>
            <span className="value">
              {movimiento.venta.numero_factura} - {movimiento.venta.cliente_nombre}
            </span>
          </div>
        )}

        {movimiento.compra && (
          <div className="info-item referencia">
            <span className="label">Compra:</span>
            <span className="value">Factura #{movimiento.compra.numero_factura}</span>
          </div>
        )}

        {movimiento.usuario && (
          <div className="info-item">
            <span className="label">Usuario:</span>
            <span className="value">{movimiento.usuario.nombre}</span>
          </div>
        )}
      </div>

      <div className="movimiento-actions">
        {onEdit && movimiento.estado !== 'cancelado' && (
          <button 
            className="btn-edit"
            onClick={() => onEdit(movimiento)}
            title="Editar movimiento"
          >
            ✏️ Editar
          </button>
        )}
        
        {onDelete && movimiento.estado !== 'confirmado' && !movimiento.venta_id && !movimiento.compra_id && (
          <button 
            className="btn-delete"
            onClick={() => onDelete(movimiento.id)}
            title="Eliminar movimiento"
          >
            🗑️ Eliminar
          </button>
        )}
      </div>
    </div>
  )
}

export default CajaMovimientoCard