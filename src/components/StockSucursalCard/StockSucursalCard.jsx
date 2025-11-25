import React from 'react'
import './StockSucursalCard.css'

const StockSucursalCard = ({ stockItem, onActualizar, onVerHistorial }) => {
  const { producto, stock_actual, stock_minimo, stock_maximo, ubicacion, sucursal } = stockItem
  
  // Determinar si el stock está bajo
  const stockBajo = stock_actual <= stock_minimo
  const porcentajeStock = stock_maximo ? (stock_actual / stock_maximo) * 100 : 0

  return (
    <div className={`stock-card ${stockBajo ? 'stock-bajo' : ''}`}>
      <div className="stock-card-header">
        <div className="producto-info">
          <h3>{producto?.nombre || 'Producto sin nombre'}</h3>
          <span className="codigo">{producto?.codigo_producto}</span>
          <span className="categoria">{producto?.categoria}</span>
        </div>
        <div className="stock-status">
          {stockBajo && <span className="alerta-badge">⚠️ Stock Bajo</span>}
        </div>
      </div>

      <div className="stock-details">
        <div className="stock-amounts">
          <div className="stock-item">
            <label>Stock Actual:</label>
            <span className={`cantidad ${stockBajo ? 'bajo' : ''}`}>
              {stock_actual} {producto?.unidad_medida || 'unidades'}
            </span>
          </div>
          
          <div className="stock-item">
            <label>Stock Mínimo:</label>
            <span className="cantidad minimo">
              {stock_minimo} {producto?.unidad_medida || 'unidades'}
            </span>
          </div>
          
          {stock_maximo && (
            <div className="stock-item">
              <label>Stock Máximo:</label>
              <span className="cantidad maximo">
                {stock_maximo} {producto?.unidad_medida || 'unidades'}
              </span>
            </div>
          )}
        </div>

        {stock_maximo && (
          <div className="stock-bar">
            <div 
              className="stock-fill" 
              style={{ 
                width: `${Math.min(porcentajeStock, 100)}%`,
                backgroundColor: stockBajo ? '#e74c3c' : porcentajeStock > 80 ? '#27ae60' : '#f39c12'
              }}
            ></div>
          </div>
        )}

        {ubicacion && (
          <div className="ubicacion-info">
            <label>📍 Ubicación:</label>
            <span>{ubicacion}</span>
          </div>
        )}

        {sucursal && (
          <div className="sucursal-info">
            <label>🏭 Sucursal:</label>
            <span>{typeof sucursal === 'object' ? (sucursal.nombre || sucursal.id || 'Sin nombre') : sucursal}</span>
          </div>
        )}

        {producto?.precio && (
          <div className="valor-info">
            <label>💰 Valor en Stock:</label>
            <span>${(stock_actual * producto.precio).toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="stock-actions">
        <button 
          className="btn-secondary"
          onClick={() => onVerHistorial && onVerHistorial(stockItem)}
        >
          📊 Historial
        </button>
        <button 
          className="btn-primary"
          onClick={() => onActualizar && onActualizar(stockItem)}
        >
          ✏️ Actualizar
        </button>
      </div>
    </div>
  )
}

export default StockSucursalCard