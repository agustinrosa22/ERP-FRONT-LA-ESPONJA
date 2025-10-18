import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { obtenerProductosStockBajo } from '../../store/slices/inventarioSlice'
import './AlertasStock.css'

const AlertasStock = ({ onProductoSelect }) => {
  const dispatch = useDispatch()
  const { productosStockBajo = [], loading } = useSelector(state => state.inventario)
  const [alertasVistas, setAlertasVistas] = useState(new Set())

  useEffect(() => {
    dispatch(obtenerProductosStockBajo())
    
    // Actualizar cada 5 minutos
    const interval = setInterval(() => {
      dispatch(obtenerProductosStockBajo())
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [dispatch])

  const marcarComoVista = (productoId) => {
    setAlertasVistas(prev => new Set([...prev, productoId]))
  }

  const calcularNivelAlerta = (stock, stockMinimo) => {
    const porcentaje = (stock / stockMinimo) * 100
    
    if (stock === 0) return 'sin-stock'
    if (porcentaje <= 25) return 'critico'
    if (porcentaje <= 50) return 'bajo'
    if (porcentaje <= 100) return 'medio'
    return 'normal'
  }

  const getNivelTexto = (nivel) => {
    switch(nivel) {
      case 'sin-stock': return 'Sin Stock'
      case 'critico': return 'Crítico'
      case 'bajo': return 'Bajo'
      case 'medio': return 'Medio'
      default: return 'Normal'
    }
  }

  const getNivelIcon = (nivel) => {
    switch(nivel) {
      case 'sin-stock': return '❌'
      case 'critico': return '🚨'
      case 'bajo': return '⚠️'
      case 'medio': return '📊'
      default: return '✅'
    }
  }

  const productosOrdenados = [...productosStockBajo].sort((a, b) => {
    const nivelA = calcularNivelAlerta(a.stock, a.stock_minimo)
    const nivelB = calcularNivelAlerta(b.stock, b.stock_minimo)
    
    const prioridad = {
      'sin-stock': 4,
      'critico': 3,
      'bajo': 2,
      'medio': 1,
      'normal': 0
    }
    
    return prioridad[nivelB] - prioridad[nivelA]
  })

  if (loading) {
    return (
      <div className="alertas-stock-container">
        <div className="alertas-header">
          <h3>📊 Alertas de Stock</h3>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Cargando alertas...</span>
        </div>
      </div>
    )
  }

  if (productosStockBajo.length === 0) {
    return (
      <div className="alertas-stock-container">
        <div className="alertas-header">
          <h3>📊 Alertas de Stock</h3>
        </div>
        <div className="no-alertas">
          <div className="no-alertas-icon">✅</div>
          <p>No hay productos con stock bajo</p>
          <small>Todos los productos tienen stock suficiente</small>
        </div>
      </div>
    )
  }

  return (
    <div className="alertas-stock-container">
      <div className="alertas-header">
        <h3>📊 Alertas de Stock</h3>
        <div className="alertas-count">
          <span className="count-badge">{productosStockBajo.length}</span>
          <span className="count-text">productos requieren atención</span>
        </div>
      </div>

      <div className="alertas-resumen">
        <div className="resumen-stats">
          <div className="stat-item sin-stock">
            <span className="stat-number">
              {productosStockBajo.filter(p => p.stock === 0).length}
            </span>
            <span className="stat-label">Sin Stock</span>
          </div>
          <div className="stat-item critico">
            <span className="stat-number">
              {productosStockBajo.filter(p => calcularNivelAlerta(p.stock, p.stock_minimo) === 'critico' && p.stock > 0).length}
            </span>
            <span className="stat-label">Crítico</span>
          </div>
          <div className="stat-item bajo">
            <span className="stat-number">
              {productosStockBajo.filter(p => calcularNivelAlerta(p.stock, p.stock_minimo) === 'bajo').length}
            </span>
            <span className="stat-label">Bajo</span>
          </div>
        </div>
      </div>

      <div className="alertas-lista">
        {productosOrdenados.map(producto => {
          const nivel = calcularNivelAlerta(producto.stock, producto.stock_minimo)
          const esVista = alertasVistas.has(producto.id)
          
          return (
            <div 
              key={producto.id} 
              className={`alerta-item ${nivel} ${esVista ? 'vista' : ''}`}
              onClick={() => {
                marcarComoVista(producto.id)
                if (onProductoSelect) onProductoSelect(producto)
              }}
            >
              <div className="alerta-icon">
                {getNivelIcon(nivel)}
              </div>
              
              <div className="alerta-info">
                <div className="producto-nombre">
                  {producto.nombre}
                </div>
                <div className="producto-codigo">
                  {producto.codigo_producto}
                </div>
              </div>
              
              <div className="stock-info">
                <div className="stock-actual">
                  <span className="stock-number">{producto.stock}</span>
                  <span className="stock-unit">{producto.unidad_medida}</span>
                </div>
                <div className="stock-minimo">
                  Mín: {producto.stock_minimo}
                </div>
              </div>
              
              <div className="nivel-badge">
                <span className={`nivel-text ${nivel}`}>
                  {getNivelTexto(nivel)}
                </span>
              </div>
              
              <div className="alerta-actions">
                <button 
                  className="btn-reabastecer"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Aquí se puede abrir el formulario de movimiento con entrada
                    if (onProductoSelect) {
                      onProductoSelect(producto, 'entrada')
                    }
                  }}
                >
                  Reabastecer
                </button>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="alertas-footer">
        <button 
          className="btn-refresh"
          onClick={() => dispatch(obtenerProductosStockBajo())}
          disabled={loading}
        >
          🔄 Actualizar
        </button>
        <small className="ultima-actualizacion">
          Última actualización: {new Date().toLocaleTimeString('es-ES')}
        </small>
      </div>
    </div>
  )
}

export default AlertasStock