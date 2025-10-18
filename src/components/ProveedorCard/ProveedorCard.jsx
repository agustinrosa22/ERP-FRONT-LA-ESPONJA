import React from 'react'
import './ProveedorCard.css'

const ProveedorCard = ({ 
  proveedor, 
  onEdit, 
  onViewDetails, 
  onToggleStatus,
  showActions = true 
}) => {
  const formatCondicionesPago = (condiciones) => {
    const condicionesMap = {
      'contado': 'Contado',
      '30_dias': '30 días',
      '60_dias': '60 días',
      '90_dias': '90 días'
    }
    return condicionesMap[condiciones] || condiciones
  }

  const formatCuit = (cuit) => {
    if (!cuit) return 'No especificado'
    // Si ya está formateado, devolverlo tal como está
    if (cuit.includes('-')) return cuit
    // Si no está formateado, intentar formatearlo
    if (cuit.length === 11) {
      return `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`
    }
    return cuit
  }

  const handleEdit = () => {
    if (onEdit) onEdit(proveedor)
  }

  const handleViewDetails = () => {
    if (onViewDetails) onViewDetails(proveedor)
  }

  const handleToggleStatus = () => {
    if (onToggleStatus) onToggleStatus(proveedor)
  }

  return (
    <div className={`proveedor-card ${!proveedor.activo ? 'inactivo' : ''}`}>
      {/* Header de la Card */}
      <div className="proveedor-card-header">
        <div className="proveedor-info-principal">
          <h3 className="proveedor-razon-social">
            {proveedor.nombre}
          </h3>
          <div className="proveedor-cuit">
            <span className="label">CUIT:</span>
            <span className="value">{formatCuit(proveedor.cuit)}</span>
          </div>
        </div>
        
        <div className="proveedor-estado">
          <span className={`estado-badge ${proveedor.activo ? 'activo' : 'inactivo'}`}>
            {proveedor.activo ? '✅ Activo' : '❌ Inactivo'}
          </span>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="proveedor-card-body">
        <div className="info-section">
          <h4>📞 Contacto</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Teléfono:</span>
              <span className="value">{proveedor.telefono || 'No especificado'}</span>
            </div>
            {proveedor.email && (
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value email">{proveedor.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dirección */}
        <div className="info-section">
          <h4>🏠 Dirección</h4>
          <div className="direccion-completa">
            {proveedor.direccion || 'No especificada'}
          </div>
        </div>

        {/* Condiciones Comerciales */}
        <div className="info-section">
          <h4>💰 Condiciones Comerciales</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Pago:</span>
              <span className="value">{formatCondicionesPago(proveedor.condiciones_pago)}</span>
            </div>
          </div>
        </div>

        {/* Persona de Contacto */}
        {(proveedor.contacto_nombre || proveedor.contacto_telefono) && (
          <div className="info-section">
            <h4>👤 Contacto Comercial</h4>
            <div className="info-grid">
              {proveedor.contacto_nombre && (
                <div className="info-item">
                  <span className="label">Nombre:</span>
                  <span className="value">{proveedor.contacto_nombre}</span>
                </div>
              )}
              {proveedor.contacto_telefono && (
                <div className="info-item">
                  <span className="label">Teléfono:</span>
                  <span className="value">{proveedor.contacto_telefono}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Observaciones */}
        {proveedor.observaciones && (
          <div className="info-section">
            <h4>📝 Observaciones</h4>
            <div className="observaciones">
              {proveedor.observaciones}
            </div>
          </div>
        )}

        {/* Información de Fechas */}
        <div className="info-section fechas">
          <div className="info-item">
            <span className="label">Creado:</span>
            <span className="value fecha">
              {new Date(proveedor.fecha_creacion).toLocaleDateString('es-AR')}
            </span>
          </div>
          {proveedor.fecha_actualizacion && (
            <div className="info-item">
              <span className="label">Actualizado:</span>
              <span className="value fecha">
                {new Date(proveedor.fecha_actualizacion).toLocaleDateString('es-AR')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Botones de Acción */}
      {showActions && (
        <div className="proveedor-card-actions">
          {/* <button
            onClick={handleViewDetails}
            className="btn-action btn-info"
            title="Ver estadísticas y detalles"
          >
            👁️ Ver Detalles
          </button> */}
          
          <button
            onClick={handleEdit}
            className="btn-action btn-edit"
            title="Editar proveedor"
          >
            ✏️ Editar
          </button>

          <button
            onClick={handleToggleStatus}
            className={`btn-action ${proveedor.activo ? 'btn-deactivate' : 'btn-activate'}`}
            title={proveedor.activo ? 'Desactivar proveedor' : 'Activar proveedor'}
          >
            {proveedor.activo ? '🚫 Desactivar' : '✅ Activar'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ProveedorCard