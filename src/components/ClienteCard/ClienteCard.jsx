import './ClienteCard.css'

const ClienteCard = ({ cliente, viewMode, onEdit, onViewStats }) => {

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No registrada'
    return new Date(dateString).toLocaleDateString('es-AR')
  }

  // Función para construir la dirección completa
  const buildDireccionCompleta = (cliente) => {
    const partes = []
    if (cliente.calle) partes.push(cliente.calle)
    if (cliente.numero) partes.push(cliente.numero)
    if (cliente.piso_depto) partes.push(`Piso ${cliente.piso_depto}`)
    if (cliente.barrio) partes.push(`- ${cliente.barrio}`)
    if (cliente.codigo_postal) partes.push(`(CP: ${cliente.codigo_postal})`)
    return partes.length > 0 ? partes.join(' ') : null
  }

  const direccionCompleta = cliente.direccion_completa || buildDireccionCompleta(cliente)

  if (viewMode === 'list') {
    return (
      <div className="cliente-card list-view">
        <div className="cliente-info">
          <div className="cliente-avatar">
            {cliente.nombre_completo?.charAt(0).toUpperCase() || cliente.nombre?.charAt(0).toUpperCase() || '👤'}
          </div>
          <div className="cliente-details">
            <h3>{cliente.nombre_completo || cliente.nombre || 'Sin nombre'}</h3>
            <div className="cliente-meta">
              <span>📄 {cliente.tipo_documento}: {cliente.documento || 'Sin documento'}</span>
              <span>📧 {cliente.email || 'Sin email'}</span>
              <span>📱 {cliente.telefono || 'Sin teléfono'}</span>
              {direccionCompleta && <span>📍 {direccionCompleta}</span>}
              <span>🏙️ {cliente.ciudad || 'Sin ciudad'}</span>
              <span className={`status ${cliente.activo ? 'active' : 'inactive'}`}>
                {cliente.activo ? '✅ Activo' : '❌ Inactivo'}
              </span>
            </div>
          </div>
        </div>
        <div className="cliente-actions">
          <button 
            className="btn-stats" 
            onClick={() => onViewStats && onViewStats(cliente)}
          >
            📊 Estadísticas
          </button>
          <button className="btn-edit" onClick={() => onEdit(cliente)}>
            ✏️ Editar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cliente-card grid-view">
      <div className="card-header">
        <div className="cliente-avatar">
          {cliente.nombre_completo?.charAt(0).toUpperCase() || cliente.nombre?.charAt(0).toUpperCase() || '👤'}
        </div>
        <div className="card-actions">
          <button 
            className="btn-icon" 
            onClick={() => onViewStats && onViewStats(cliente)}
            title="Ver estadísticas"
          >
            📊
          </button>
          <button 
            className="btn-icon" 
            onClick={() => onEdit(cliente)}
            title="Editar cliente"
          >
            ✏️
          </button>
        </div>
      </div>

      <div className="card-body">
        <h3 className="cliente-nombre">{cliente.nombre_completo || cliente.nombre || 'Sin nombre'}</h3>
        
        <div className="cliente-info-grid">
          <div className="info-item">
            <label>Tipo Doc:</label>
            <span>{cliente.tipo_documento || 'No especificado'}</span>
          </div>
          
          <div className="info-item">
            <label>Documento:</label>
            <span>{cliente.documento || 'No especificado'}</span>
          </div>
          
          <div className="info-item">
            <label>Email:</label>
            <span className="email">{cliente.email || 'No especificado'}</span>
          </div>
          
          <div className="info-item">
            <label>Teléfono:</label>
            <span>{cliente.telefono || 'No especificado'}</span>
          </div>

          {direccionCompleta && (
            <div className="info-item full-width">
              <label>📍 Dirección:</label>
              <span className="address">{direccionCompleta}</span>
            </div>
          )}
          
          <div className="info-item">
            <label>Ciudad:</label>
            <span>{cliente.ciudad || 'No especificada'}</span>
          </div>

          {cliente.fecha_nacimiento && (
            <div className="info-item">
              <label>Fecha Nac:</label>
              <span>{formatDate(cliente.fecha_nacimiento)}</span>
            </div>
          )}
          
          <div className="info-item">
            <label>Estado:</label>
            <span className={`status ${cliente.activo ? 'active' : 'inactive'}`}>
              {cliente.activo ? '✅ Activo' : '❌ Inactivo'}
            </span>
          </div>
          
          <div className="info-item">
            <label>Límite Crédito:</label>
            <span className="credit">{formatCurrency(cliente.limite_credito)}</span>
          </div>
          
          <div className="info-item">
            <label>Crédito Disponible:</label>
            <span className="credit available">{formatCurrency(cliente.credito_disponible || (cliente.limite_credito - cliente.credito_usado))}</span>
          </div>

          {cliente.observaciones && (
            <div className="info-item full-width">
              <label>📝 Observaciones:</label>
              <span className="observations">{cliente.observaciones}</span>
            </div>
          )}
        </div>

        <div className="cliente-dates">
          <small>Creado: {formatDate(cliente.fecha_creacion)}</small>
          {cliente.fecha_actualizacion && (
            <small>Actualizado: {formatDate(cliente.fecha_actualizacion)}</small>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClienteCard