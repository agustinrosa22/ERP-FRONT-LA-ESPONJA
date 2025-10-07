import './ProductoCard.css'

const ProductoCard = ({ producto, viewMode, onEdit }) => {
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

  const getStockStatus = (stock, stockMinimo) => {
    if (stock <= 0) return { status: 'agotado', text: 'Agotado', icon: '❌' }
    if (stock <= stockMinimo) return { status: 'bajo', text: 'Stock Bajo', icon: '⚠️' }
    return { status: 'normal', text: 'Disponible', icon: '✅' }
  }

  const getCategoryIcon = (categoria) => {
    const icons = {
      'Ácidos': '🧪',
      'Bases': '⚗️',
      'Sales': '🧂',
      'Solventes': '💧',
      'Reactivos': '🔬',
      'Materiales de Laboratorio': '🥽',
      'Equipamiento': '⚙️',
      'Otros': '📦'
    }
    return icons[categoria] || '📦'
  }

  const stockInfo = getStockStatus(producto.stock, producto.stock_minimo)

  if (viewMode === 'list') {
    return (
      <div className="producto-card list-view">
        <div className="producto-info">
          <div className="producto-avatar">
            {getCategoryIcon(producto.categoria)}
          </div>
          <div className="producto-details">
            <h3>{producto.nombre}</h3>
            <div className="producto-meta">
              <span className="codigo">#{producto.codigo_producto}</span>
              <span className="categoria">{producto.categoria}</span>
              <span className={`status ${producto.activo ? 'active' : 'inactive'}`}>
                {producto.activo ? '✅ Activo' : '❌ Inactivo'}
              </span>
            </div>
            <p className="descripcion">{producto.descripcion}</p>
          </div>
        </div>
        
        <div className="producto-stats">
          <div className="stat-item">
            <label>Precio:</label>
            <span className="precio">{formatCurrency(producto.precio)}</span>
          </div>
          <div className="stat-item">
            <label>Costo:</label>
            <span className="costo">{formatCurrency(producto.costo)}</span>
          </div>
          <div className="stat-item">
            <label>Stock:</label>
            <span className={`stock ${stockInfo.status}`}>
              {stockInfo.icon} {producto.stock} {producto.unidad_medida}
            </span>
          </div>
        </div>
        
        <div className="producto-actions">
          <button className="btn-edit" onClick={() => onEdit(producto)}>
            ✏️ Editar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="producto-card grid-view">
      <div className="card-header">
        <div className="producto-avatar">
          {getCategoryIcon(producto.categoria)}
        </div>
        <div className="card-actions">
          <button 
            className="btn-icon" 
            onClick={() => onEdit(producto)}
            title="Editar producto"
          >
            ✏️
          </button>
        </div>
      </div>

      <div className="card-body">
        <h3 className="producto-nombre">{producto.nombre}</h3>
        <p className="producto-codigo">#{producto.codigo_producto}</p>
        
        <div className="producto-info-grid">
          <div className="info-item">
            <label>Categoría:</label>
            <span>{producto.categoria}</span>
          </div>
          
          <div className="info-item">
            <label>Precio:</label>
            <span className="precio">{formatCurrency(producto.precio)}</span>
          </div>
          
          <div className="info-item">
            <label>Costo:</label>
            <span className="costo">{formatCurrency(producto.costo)}</span>
          </div>
          
          <div className="info-item">
            <label>Stock:</label>
            <span className={`stock ${stockInfo.status}`}>
              {stockInfo.icon} {producto.stock} {producto.unidad_medida}
            </span>
          </div>
          
          <div className="info-item">
            <label>Mínimo:</label>
            <span>{producto.stock_minimo} {producto.unidad_medida}</span>
          </div>
          
          <div className="info-item">
            <label>Estado:</label>
            <span className={`status ${producto.activo ? 'active' : 'inactive'}`}>
              {producto.activo ? '✅ Activo' : '❌ Inactivo'}
            </span>
          </div>
        </div>

        {producto.descripcion && (
          <div className="producto-descripcion">
            <label>Descripción:</label>
            <p>{producto.descripcion}</p>
          </div>
        )}

        <div className="producto-dates">
          <small>Creado: {formatDate(producto.fecha_creacion)}</small>
          {producto.fecha_actualizacion && (
            <small>Actualizado: {formatDate(producto.fecha_actualizacion)}</small>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductoCard