import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import './Dashboard.css'

const Dashboard = () => {
  const { usuario } = useSelector((state) => state.auth)

  useEffect(() => {
    // Aquí puedes cargar datos del dashboard
  }, [])

  const stats = [
    {
      title: 'Productos en Stock',
      value: '1,234',
      icon: '📦',
      color: '#4caf50',
      change: '+5.2%'
    },
    {
      title: 'Ventas del Mes',
      value: '$45,678',
      icon: '💰',
      color: '#2196f3',
      change: '+12.5%'
    },
    {
      title: 'Empleados Activos',
      value: '89',
      icon: '👥',
      color: '#ff9800',
      change: '+2.1%'
    },
    {
      title: 'Pedidos Pendientes',
      value: '23',
      icon: '📋',
      color: '#f44336',
      change: '-8.3%'
    }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bienvenido de nuevo, {usuario?.nombre || 'Usuario'}</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <span className="stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </span>
              <span className={`stat-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
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

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Actividad Reciente</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">📦</span>
              <div className="activity-details">
                <p>Nuevo producto agregado al inventario</p>
                <span className="activity-time">Hace 2 horas</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">💰</span>
              <div className="activity-details">
                <p>Venta procesada por $1,250</p>
                <span className="activity-time">Hace 4 horas</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">👥</span>
              <div className="activity-details">
                <p>Nuevo empleado registrado</p>
                <span className="activity-time">Ayer</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Accesos Rápidos</h2>
          <div className="quick-actions">
            <button className="quick-action-btn">
              <span>📦</span>
              Agregar Producto
            </button>
            <button className="quick-action-btn">
              <span>💰</span>
              Nueva Venta
            </button>
            <button className="quick-action-btn">
              <span>👥</span>
              Registrar Empleado
            </button>
            <button className="quick-action-btn">
              <span>📊</span>
              Ver Reportes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard