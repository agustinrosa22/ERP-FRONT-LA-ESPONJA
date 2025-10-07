import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { obtenerEstadisticasCliente } from '../../store/slices/clientesSlice'
import './ClienteCard.css'

const ClienteCard = ({ cliente, viewMode, onEdit }) => {
  const dispatch = useDispatch()
  const [showEstadisticas, setShowEstadisticas] = useState(false)
  const [estadisticas, setEstadisticas] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  const handleVerEstadisticas = async () => {
    if (!showEstadisticas && !estadisticas) {
      setLoadingStats(true)
      try {
        const result = await dispatch(obtenerEstadisticasCliente(cliente.id))
        if (result.payload) {
          setEstadisticas(result.payload.estadisticas)
        }
      } catch (error) {
        console.error('Error al obtener estadísticas:', error)
      } finally {
        setLoadingStats(false)
      }
    }
    setShowEstadisticas(!showEstadisticas)
  }

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
              <span>📄 {cliente.documento || 'Sin documento'}</span>
              <span>📧 {cliente.email || 'Sin email'}</span>
              <span>📱 {cliente.telefono || 'Sin teléfono'}</span>
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
            onClick={handleVerEstadisticas}
            disabled={loadingStats}
          >
            {loadingStats ? '⏳' : '📊'} Estadísticas
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
            onClick={handleVerEstadisticas}
            disabled={loadingStats}
            title="Ver estadísticas"
          >
            {loadingStats ? '⏳' : '📊'}
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
          
          <div className="info-item">
            <label>Ciudad:</label>
            <span>{cliente.ciudad || 'No especificada'}</span>
          </div>
          
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
            <span className="credit available">{formatCurrency(cliente.credito_disponible)}</span>
          </div>
        </div>

        <div className="cliente-dates">
          <small>Creado: {formatDate(cliente.fecha_creacion)}</small>
          {cliente.fecha_actualizacion && (
            <small>Actualizado: {formatDate(cliente.fecha_actualizacion)}</small>
          )}
        </div>

        {showEstadisticas && (
          <div className="estadisticas-section">
            <h4>📊 Estadísticas del Cliente</h4>
            {loadingStats ? (
              <div className="loading-stats">Cargando estadísticas...</div>
            ) : estadisticas ? (
              <div className="estadisticas-grid">
                <div className="stat-item">
                  <label>Total Compras:</label>
                  <span className="stat-value">{formatCurrency(estadisticas.total_compras)}</span>
                </div>
                <div className="stat-item">
                  <label>Cantidad Órdenes:</label>
                  <span className="stat-value">{estadisticas.cantidad_ordenes || 0}</span>
                </div>
                <div className="stat-item">
                  <label>Última Compra:</label>
                  <span className="stat-value">{formatDate(estadisticas.ultima_compra)}</span>
                </div>
                <div className="stat-item">
                  <label>Promedio Compra:</label>
                  <span className="stat-value">{formatCurrency(estadisticas.promedio_compra)}</span>
                </div>
              </div>
            ) : (
              <div className="no-stats">No hay estadísticas disponibles</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClienteCard