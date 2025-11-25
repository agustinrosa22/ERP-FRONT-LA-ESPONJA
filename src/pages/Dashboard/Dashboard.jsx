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
// Importar datos de contabilidad real
import {
  obtenerMovimientos,
  obtenerBalance,
  obtenerEstadisticas as obtenerEstadisticasContabilidad,
  selectMovimientos as selectMovimientosContabilidad,
  selectBalance as selectBalanceContabilidad,
  selectEstadisticas as selectEstadisticasContabilidad
} from '../../store/slices/contabilidadSlice'
import './Dashboard.css'
import SucursalBadge from '../../components/SucursalBadge/SucursalBadge'

const Dashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { usuario } = useSelector((state) => state.auth)
  
  // Datos del dashboard original (fallback)
  const estadisticas = useSelector(selectEstadisticas)
  const resumenFinanciero = useSelector(selectResumenFinanciero)
  const actividadReciente = useSelector(selectActividadReciente)
  const productosBajoStock = useSelector(selectProductosBajoStock)
  const cargando = useSelector(selectCargando)
  const error = useSelector(selectError)

  // Datos reales de contabilidad
  const movimientosContabilidad = useSelector(selectMovimientosContabilidad)
  const balanceContabilidad = useSelector(selectBalanceContabilidad)
  const estadisticasContabilidad = useSelector(selectEstadisticasContabilidad)
  const cargandoContabilidad = useSelector((state) => state.contabilidad?.cargando)

  // Debug para ver datos del dashboard
  console.log('🏠 Dashboard datos originales:', {
    estadisticas,
    resumenFinanciero,
    actividadReciente,
    productosBajoStock,
    cargando,
    error
  })

  // Debug para ver datos reales de contabilidad
  console.log('💰 Datos contabilidad en Dashboard:', {
    movimientosContabilidad: movimientosContabilidad?.length || 'No hay movimientos',
    movimientosArray: Array.isArray(movimientosContabilidad),
    balanceContabilidad: balanceContabilidad || 'No hay balance',
    estadisticasContabilidad: estadisticasContabilidad || 'No hay estadísticas',
    cargandoContabilidad
  })

  useEffect(() => {
    cargarDatosDashboard()
  }, [dispatch])

  const cargarDatosDashboard = async () => {
    try {
      console.log('🚀 Cargando datos del dashboard...')
      
      // Fechas para obtener datos del día y mes
      const fechaHoy = new Date().toISOString().split('T')[0]
      const fechaHaceUnMes = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      await Promise.all([
        // Datos originales del dashboard
        dispatch(obtenerEstadisticasDashboard()),
        dispatch(obtenerProductosBajoStock()),
        // Datos reales de contabilidad
        dispatch(obtenerMovimientos({ limite: 20, fechaDesde: fechaHaceUnMes, fechaHasta: fechaHoy })),
        dispatch(obtenerBalance({ fechaDesde: fechaHaceUnMes, fechaHasta: fechaHoy })),
        dispatch(obtenerEstadisticasContabilidad('mes'))
      ])
      
      console.log('✅ Datos del dashboard cargados')
    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error)
    }
  }

  // Datos de ejemplo para mostrar mientras el backend no esté listo (igual que en Contabilidad)
  const datosEjemplo = {
    estadisticas: {
      ingresos_hoy: 15000,
      egresos_hoy: 5000,
      balance_hoy: 10000,
      balance_mes: 45000,
      por_categoria: [
        { categoria: 'venta', total: 25000, cantidad: 15 },
        { categoria: 'compra', total: 8000, cantidad: 5 },
        { categoria: 'gasto_operativo', total: 3000, cantidad: 3 }
      ],
      por_metodo_pago: [
        { metodo_pago: 'efectivo', total: 18000, cantidad: 12 },
        { metodo_pago: 'transferencia', total: 15000, cantidad: 8 }
      ]
    },
    movimientos: [
      {
        id: 1,
        tipo: 'ingreso',
        monto: 5000,
        categoria: 'venta',
        descripcion: 'Venta de productos',
        metodo_pago: 'efectivo',
        fecha: new Date().toISOString(),
        usuario: { nombre: 'Juan Pérez' },
        estado: 'confirmado'
      },
      {
        id: 2,
        tipo: 'egreso',
        monto: 1500,
        categoria: 'compra',
        descripcion: 'Compra de materiales',
        metodo_pago: 'transferencia',
        fecha: new Date().toISOString(),
        usuario: { nombre: 'María García' },
        estado: 'pendiente'
      },
      {
        id: 3,
        tipo: 'ingreso',
        monto: 8000,
        categoria: 'venta',
        descripcion: 'Venta directa al cliente',
        metodo_pago: 'efectivo',
        fecha: new Date().toISOString(),
        usuario: { nombre: 'Ana López' },
        estado: 'confirmado'
      }
    ]
  }

  // Calcular datos reales basados en movimientos de contabilidad
  const calcularDatosReales = () => {
    const hoy = new Date().toISOString().split('T')[0]
    
    let datosReales = {
      ingresoHoy: 0,
      egresoHoy: 0,
      balanceHoy: 0,
      ingresoMes: 0,
      egresoMes: 0,
      balanceMes: 0,
      actividadReciente: []
    }

    // Si tenemos datos del balance de contabilidad, usarlos primero
    if (balanceContabilidad && Object.keys(balanceContabilidad).length > 0) {
      console.log('📊 Usando datos de balance:', balanceContabilidad)
      datosReales.ingresoMes = balanceContabilidad.total_ingresos || 0
      datosReales.egresoMes = balanceContabilidad.total_egresos || 0
      datosReales.balanceMes = balanceContabilidad.balance_neto || 0
    }

    // Si tenemos estadísticas de contabilidad, usarlas
    if (estadisticasContabilidad && Object.keys(estadisticasContabilidad).length > 0) {
      console.log('📈 Usando estadísticas de contabilidad:', estadisticasContabilidad)
      
      if (estadisticasContabilidad.balance_hoy) {
        datosReales.ingresoHoy = estadisticasContabilidad.balance_hoy.total_ingresos || 0
        datosReales.egresoHoy = estadisticasContabilidad.balance_hoy.total_egresos || 0
        datosReales.balanceHoy = estadisticasContabilidad.balance_hoy.balance_neto || 0
      }
      
      if (estadisticasContabilidad.balance_mes) {
        datosReales.ingresoMes = estadisticasContabilidad.balance_mes.total_ingresos || 0
        datosReales.egresoMes = estadisticasContabilidad.balance_mes.total_egresos || 0
        datosReales.balanceMes = estadisticasContabilidad.balance_mes.balance_neto || 0
      }
    }

    // Si tenemos movimientos, calcular datos del día y actividad reciente
    if (Array.isArray(movimientosContabilidad) && movimientosContabilidad.length > 0) {
      console.log('📋 Calculando desde movimientos:', movimientosContabilidad.length, 'movimientos')
      
      // Filtrar movimientos de hoy
      const movimientosHoy = movimientosContabilidad.filter(mov => {
        const fechaMovimiento = new Date(mov.fecha).toISOString().split('T')[0]
        return fechaMovimiento === hoy
      })
      
      console.log('📅 Movimientos de hoy:', movimientosHoy.length)
      
      // Calcular totales del día desde movimientos
      const ingresoHoyCalculado = movimientosHoy
        .filter(mov => mov.tipo === 'ingreso')
        .reduce((sum, mov) => sum + (parseFloat(mov.monto) || 0), 0)
      
      const egresoHoyCalculado = movimientosHoy
        .filter(mov => mov.tipo === 'egreso')
        .reduce((sum, mov) => sum + (parseFloat(mov.monto) || 0), 0)
      
      // Solo usar datos calculados si no los tenemos de las estadísticas
      if (!estadisticasContabilidad?.balance_hoy) {
        datosReales.ingresoHoy = ingresoHoyCalculado
        datosReales.egresoHoy = egresoHoyCalculado
        datosReales.balanceHoy = ingresoHoyCalculado - egresoHoyCalculado
      }
      
      // Actividad reciente (últimos 5 movimientos)
      datosReales.actividadReciente = movimientosContabilidad.slice(0, 5).map(mov => ({
        tipo: mov.tipo === 'ingreso' ? 'venta' : 'compra',
        descripcion: mov.descripcion || `${mov.tipo} - ${mov.categoria}`,
        monto: mov.monto,
        fecha: mov.fecha
      }))
    }

    // Si no tenemos datos del backend, usar datos de ejemplo
    if (datosReales.ingresoHoy === 0 && datosReales.egresoHoy === 0 && datosReales.balanceHoy === 0) {
      console.log('💡 Usando datos de ejemplo para el Dashboard')
      datosReales = {
        ingresoHoy: datosEjemplo.estadisticas.ingresos_hoy,
        egresoHoy: datosEjemplo.estadisticas.egresos_hoy,
        balanceHoy: datosEjemplo.estadisticas.balance_hoy,
        ingresoMes: datosEjemplo.estadisticas.balance_mes,
        egresoMes: datosEjemplo.estadisticas.egresos_hoy * 10, // Simulando un mes
        balanceMes: datosEjemplo.estadisticas.balance_mes,
        actividadReciente: datosEjemplo.movimientos.map(mov => ({
          tipo: mov.tipo === 'ingreso' ? 'venta' : 'compra',
          descripcion: mov.descripcion || `${mov.tipo} - ${mov.categoria}`,
          monto: mov.monto,
          fecha: mov.fecha
        }))
      }
    }

    console.log('💡 Datos finales calculados:', datosReales)
    return datosReales
  }

  // Obtener datos reales calculados
  const datosReales = calcularDatosReales()

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
      value: formatearMoneda(datosReales.balanceMes || estadisticas.balance_mes),
      icon: '💰',
      color: '#2196f3',
      change: (datosReales.balanceMes || estadisticas.balance_mes) >= 0 ? '+' + formatearMoneda(datosReales.balanceMes || estadisticas.balance_mes) : formatearMoneda(datosReales.balanceMes || estadisticas.balance_mes),
      onClick: () => navegarA('/contabilidad')
    },
    {
      title: 'Balance del Día',
      value: formatearMoneda(datosReales.balanceHoy || estadisticas.balance_dia),
      icon: '📊',
      color: (datosReales.balanceHoy || estadisticas.balance_dia) >= 0 ? '#4caf50' : '#f44336',
      change: (datosReales.balanceHoy || estadisticas.balance_dia) >= 0 ? 'Positivo' : 'Negativo',
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
        <h2>Resumen Financiero del Día 
          {(datosReales.ingresoHoy === datosEjemplo.estadisticas.ingresos_hoy) && (
            <small style={{ fontSize: '0.7em', color: '#666', marginLeft: '10px' }}>
              (Datos de ejemplo)
            </small>
          )}
        </h2>
        <div className="financial-cards">
          <div className="financial-card income">
            <span className="financial-icon">💰</span>
            <div className="financial-info">
              <h4>Ingresos Hoy</h4>
              <p className="financial-amount">{formatearMoneda(datosReales.ingresoHoy || resumenFinanciero.ingresos_hoy)}</p>
            </div>
          </div>
          <div className="financial-card expense">
            <span className="financial-icon">💸</span>
            <div className="financial-info">
              <h4>Egresos Hoy</h4>
              <p className="financial-amount">{formatearMoneda(datosReales.egresoHoy || resumenFinanciero.egresos_hoy)}</p>
            </div>
          </div>
          <div className={`financial-card balance ${(datosReales.balanceHoy || resumenFinanciero.balance_hoy) >= 0 ? 'positive' : 'negative'}`}>
            <span className="financial-icon">📊</span>
            <div className="financial-info">
              <h4>Balance Hoy</h4>
              <p className="financial-amount">{formatearMoneda(datosReales.balanceHoy || resumenFinanciero.balance_hoy)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Actividad Reciente</h2>
          <div className="activity-list">
            {(datosReales.actividadReciente && datosReales.actividadReciente.length > 0) || (actividadReciente && actividadReciente.length > 0) ? (
              (datosReales.actividadReciente || actividadReciente).slice(0, 6).map((actividad, index) => (
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
                <small>Los datos aparecerán cuando haya movimientos registrados en Contabilidad</small>
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