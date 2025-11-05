import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  obtenerEstadisticasDashboard,
  obtenerProductosBajoStock,
  selectEstadisticas,
  selectResumenFinanciero,
  selectActividadReciente,
  selectProductosBajoStock,
  selectCargando,
  selectError,
  limpiarError
} from '../../store/slices/dashboardSlice'
import './Dashboard.css'
import SucursalBadge from '../../components/SucursalBadge/SucursalBadge'

const Dashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { usuario } = useSelector((state) => state.auth)
  
  const estadisticas = useSelector(selectEstadisticas)
  const resumenFinanciero = useSelector(selectResumenFinanciero)
  const actividadReciente = useSelector(selectActividadReciente)
  const productosBajoStock = useSelector(selectProductosBajoStock)
  const cargando = useSelector(selectCargando)
  const error = useSelector(selectError)

  // Debug para ver datos del dashboard
  console.log('🏠 Dashboard datos:', {
    estadisticas,
    resumenFinanciero,
    actividadReciente,
    productosBajoStock,
    cargando,
    error
  })

  useEffect(() => {
    cargarDatosDashboard()
  }, [dispatch])

  const cargarDatosDashboard = async () => {
    try {
      await Promise.all([
        dispatch(obtenerEstadisticasDashboard()),
        dispatch(obtenerProductosBajoStock())
      ])
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error)
    }
  }

  const formatearMoneda = (valor) => {
    const numero = parseFloat(valor) || 0
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(numero)
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible'
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const obtenerIconoActividad = (tipo) => {
    const iconos = {
      'venta': '💰',
      'compra': '🛒',
      'ingreso': '💰',
      'egreso': '💸',
      'producto': '📦',
      'cliente': '👥',
      'empleado': '👤'
    }
    return iconos[tipo] || '📋'
  }

  const navegarA = (ruta) => {
    navigate(ruta)
  }

  const statsCards = [
    {
      title: 'Productos en Stock',
      value: estadisticas.productos_stock?.toLocaleString() || '0',
      icon: '📦',
      color: '#4caf50',
      change: resumenFinanciero.total_productos > 0 ? '+' + resumenFinanciero.total_productos : '0',
      onClick: () => navegarA('/productos')
    },
    {
      title: 'Balance del Mes',
      value: formatearMoneda(estadisticas.balance_mes),
      icon: '💰',
      color: '#2196f3',
      change: estadisticas.balance_mes >= 0 ? '+' + formatearMoneda(estadisticas.balance_mes) : formatearMoneda(estadisticas.balance_mes),
      onClick: () => navegarA('/contabilidad')
    },
    {
      title: 'Balance del Día',
      value: formatearMoneda(estadisticas.balance_dia),
      icon: '�',
      color: estadisticas.balance_dia >= 0 ? '#4caf50' : '#f44336',
      change: estadisticas.balance_dia >= 0 ? 'Positivo' : 'Negativo',
      onClick: () => navegarA('/contabilidad')
    },
    {
      title: 'Productos Bajo Stock',
      value: resumenFinanciero.productos_bajo_stock?.toString() || '0',
      icon: '⚠️',
      color: resumenFinanciero.productos_bajo_stock > 0 ? '#ff9800' : '#4caf50',
      change: resumenFinanciero.productos_bajo_stock > 0 ? 'Atención' : 'OK',
      onClick: () => navegarA('/inventario')
    }
  ]

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-message">
          <h3>Error al cargar el dashboard</h3>
          <p>{error}</p>
          <button 
            onClick={() => {
              dispatch(limpiarError())
              cargarDatosDashboard()
            }}
            className="btn-reintentar"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard - La Esponja ERP</h1>
        <p>Bienvenido de nuevo, {usuario?.nombre || 'Usuario'}</p>
        <div style={{ marginTop: 8 }}>
          <SucursalBadge />
        </div>
        <div className="dashboard-actions">
          <button 
            onClick={cargarDatosDashboard} 
            className="btn-refresh"
            disabled={cargando}
          >
            {cargando ? '🔄' : '↻'} Actualizar
          </button>
        </div>
      </div>

      {cargando && (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Cargando datos del dashboard...</p>
        </div>
      )}

      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div 
            key={index} 
            className="stat-card clickable" 
            onClick={stat.onClick}
            style={{ borderLeftColor: stat.color }}
          >
            <div className="stat-header">
              <span className="stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </span>
              <span className={`stat-change ${stat.change.includes('+') || stat.change === 'Positivo' || stat.change === 'OK' ? 'positive' : 'negative'}`}>
                {stat.change}
              </span>
            </div>
            <div className="stat-body">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen financiero rápido */}
      <div className="financial-summary">
        <h2>Resumen Financiero del Día</h2>
        <div className="financial-cards">
          <div className="financial-card income">
            <span className="financial-icon">💰</span>
            <div className="financial-info">
              <h4>Ingresos Hoy</h4>
              <p className="financial-amount">{formatearMoneda(resumenFinanciero.ingresos_hoy)}</p>
            </div>
          </div>
          <div className="financial-card expense">
            <span className="financial-icon">�</span>
            <div className="financial-info">
              <h4>Egresos Hoy</h4>
              <p className="financial-amount">{formatearMoneda(resumenFinanciero.egresos_hoy)}</p>
            </div>
          </div>
          <div className={`financial-card balance ${resumenFinanciero.balance_hoy >= 0 ? 'positive' : 'negative'}`}>
            <span className="financial-icon">📊</span>
            <div className="financial-info">
              <h4>Balance Hoy</h4>
              <p className="financial-amount">{formatearMoneda(resumenFinanciero.balance_hoy)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Actividad Reciente</h2>
          <div className="activity-list">
            {actividadReciente && actividadReciente.length > 0 ? (
              actividadReciente.slice(0, 6).map((actividad, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-icon">
                    {obtenerIconoActividad(actividad.tipo)}
                  </span>
                  <div className="activity-details">
                    <p>{actividad.descripcion}</p>
                    {actividad.monto && (
                      <span className="activity-amount">
                        {formatearMoneda(actividad.monto)}
                      </span>
                    )}
                    <span className="activity-time">
                      {formatearFecha(actividad.fecha)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity">
                <p>No hay actividad reciente para mostrar</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Productos con Bajo Stock</h2>
          <div className="low-stock-list">
            {productosBajoStock && productosBajoStock.length > 0 ? (
              productosBajoStock.slice(0, 5).map((producto, index) => (
                <div key={index} className="low-stock-item">
                  <span className="low-stock-icon">⚠️</span>
                  <div className="low-stock-details">
                    <p className="producto-nombre">{producto.nombre}</p>
                    <span className="stock-info">
                      Stock: {producto.stock} | Mínimo: {producto.stock_minimo || 5}
                    </span>
                  </div>
                  <button 
                    className="btn-restock"
                    onClick={() => navegarA(`/productos/${producto.id}`)}
                  >
                    Ver
                  </button>
                </div>
              ))
            ) : (
              <div className="no-low-stock">
                <p>✅ Todos los productos tienen stock suficiente</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Accesos Rápidos</h2>
          <div className="quick-actions">
            <button 
              className="quick-action-btn"
              onClick={() => navegarA('/productos')}
            >
              <span>📦</span>
              Gestionar Productos
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => navegarA('/ventas')}
            >
              <span>💰</span>
              Nueva Venta
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => navegarA('/contabilidad')}
            >
              <span>�</span>
              Ver Contabilidad
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => navegarA('/clientes')}
            >
              <span>�</span>
              Gestionar Clientes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard