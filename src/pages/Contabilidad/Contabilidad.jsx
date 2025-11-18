import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  obtenerMovimientos,
  obtenerBalance,
  obtenerEstadisticas,
  obtenerResumen,
  crearMovimiento,
  selectMovimientos,
  selectBalance,
  selectEstadisticas,
  selectResumen,
  selectFiltros,
  selectCargando,
  selectError,
  establecerFiltros,
  limpiarError
} from '../../store/slices/contabilidadSlice'
import CajaMovimientoCard from '../../components/CajaMovimientoCard/CajaMovimientoCard'
import './Contabilidad.css'

const Contabilidad = () => {
  const dispatch = useDispatch()
  const { selectedSucursalId } = useSelector((state) => state.sucursales || {})
  const { usuario, isAuthenticated } = useSelector((state) => state.auth || {})
  const movimientos = useSelector(selectMovimientos)
  const balance = useSelector(selectBalance)
  const estadisticas = useSelector(selectEstadisticas)
  const resumen = useSelector(selectResumen)
  const filtros = useSelector(selectFiltros)
  const cargando = useSelector(selectCargando)
  const error = useSelector(selectError)

  // Debug: Verificar datos
  console.log('🔍 Datos Redux en Contabilidad:', {
    movimientos: movimientos,
    movimientosLength: Array.isArray(movimientos) ? movimientos.length : 'No es array',
    balance: balance,
    estadisticas: estadisticas,
    resumen: resumen
  })

  // Datos de ejemplo para mostrar la interfaz mientras el backend no esté listo
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
      }
    ]
  }

  // Usar datos de ejemplo si no hay datos del Redux
  const estadisticasActuales = estadisticas && Object.keys(estadisticas).length > 0 ? estadisticas : datosEjemplo.estadisticas
  const movimientosActuales = Array.isArray(movimientos) && movimientos.length > 0 ? movimientos : datosEjemplo.movimientos
  const balanceActual = balance && Object.keys(balance).length > 0 ? balance : null

  // Extraer datos de estadísticas con la estructura real del backend
  const ingresoHoy = estadisticasActuales?.balance_hoy?.total_ingresos || 0
  const egresoHoy = estadisticasActuales?.balance_hoy?.total_egresos || 0
  const balanceHoy = estadisticasActuales?.balance_hoy?.balance_neto || 0
  const balanceMes = estadisticasActuales?.balance_mes?.balance_neto || 0

  // Combinar categorías de ingresos y egresos del endpoint balance
  let categoriasCombinadas = []
  let metodosPagoCombinados = []
  let movimientosRecientes = []
  
  // Si tenemos movimientos reales, usarlos para generar estadísticas
  if (Array.isArray(movimientos) && movimientos.length > 0) {
    console.log('📊 Generando estadísticas desde movimientos reales:', movimientos.length)
    
    // Agrupar movimientos por categoría y tipo
    const categoriasMap = {}
    const metodosMap = {}
    
    movimientos.forEach(mov => {
      // Categorías
      const catKey = `${mov.categoria}_${mov.tipo}`
      if (!categoriasMap[catKey]) {
        categoriasMap[catKey] = {
          categoria: mov.categoria,
          tipo: mov.tipo,
          total: 0
        }
      }
      categoriasMap[catKey].total += parseFloat(mov.monto) || 0
      
      // Métodos de pago
      const metKey = `${mov.metodo_pago}_${mov.tipo}`
      if (!metodosMap[metKey]) {
        metodosMap[metKey] = {
          metodo_pago: mov.metodo_pago,
          tipo: mov.tipo,
          total: 0
        }
      }
      metodosMap[metKey].total += parseFloat(mov.monto) || 0
    })
    
    categoriasCombinadas = Object.values(categoriasMap)
    metodosPagoCombinados = Object.values(metodosMap)
    movimientosRecientes = movimientos.slice(0, 5) // Últimos 5 movimientos
    
    console.log('📊 Categorías procesadas:', categoriasCombinadas)
    console.log('💳 Métodos de pago procesados:', metodosPagoCombinados)
    console.log('🕒 Movimientos recientes:', movimientosRecientes)
    
  } else if (balanceActual?.ingresos_por_categoria || balanceActual?.egresos_por_categoria) {
    // Usar datos del balance si están disponibles
    console.log('📊 Usando datos de balance para categorías')
    if (balanceActual.ingresos_por_categoria) {
      balanceActual.ingresos_por_categoria.forEach(cat => {
        categoriasCombinadas.push({
          categoria: cat.categoria,
          total: cat.total,
          tipo: 'ingreso'
        })
      })
    }
    if (balanceActual.egresos_por_categoria) {
      balanceActual.egresos_por_categoria.forEach(cat => {
        categoriasCombinadas.push({
          categoria: cat.categoria,
          total: cat.total,
          tipo: 'egreso'
        })
      })
    }
    
    // Métodos de pago del balance
    if (balanceActual.por_metodo_pago) {
      metodosPagoCombinados = balanceActual.por_metodo_pago
    }
  }

  const [vistaActual, setVistaActual] = useState('dashboard')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [movimientoEditando, setMovimientoEditando] = useState(null)
  const [periodoEstadisticas, setPeriodoEstadisticas] = useState('mes')

  // Fechas por defecto (último mes)
  const fechaHoy = new Date().toISOString().split('T')[0]
  const fechaHaceUnMes = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  useEffect(() => {
    cargarDatos()
  }, [dispatch])

  // Refrescar automáticamente al cambiar de sesión o sucursal activa
  useEffect(() => {
    if (!isAuthenticated) return
    // Recargar dashboard (balance, estadísticas, movimientos recientes)
    cargarDatos()
    // Si el usuario está en la vista de movimientos, recargar la lista base
    if (vistaActual === 'movimientos') {
      dispatch(obtenerMovimientos({ limite: 20, offset: 0 }))
    }
  }, [isAuthenticated, usuario?.id, usuario?.rol, selectedSucursalId])

  // Recargar movimientos cuando se cambie a la vista de movimientos
  useEffect(() => {
    if (vistaActual === 'movimientos') {
      console.log('Cargando movimientos para vista movimientos')
      dispatch(obtenerMovimientos({
        limite: 20,
        offset: 0
      }))
    }
  }, [vistaActual, dispatch])

  // Aplicar filtros automáticamente cuando cambien los filtros
  useEffect(() => {
    if (vistaActual === 'movimientos') {
      console.log('Aplicando filtros automáticamente:', filtros)
      const timeoutId = setTimeout(() => {
        dispatch(obtenerMovimientos({
          ...filtros,
          limite: 20,
          offset: 0
        }))
      }, 300) // Reducido a 300ms para ser más responsivo

      return () => clearTimeout(timeoutId)
    }
  }, [filtros, vistaActual, dispatch])

  const cargarDatos = async () => {
    try {
      // Cargar datos iniciales
      console.log('Cargando datos de contabilidad...')
      
      const resultados = await Promise.all([
        dispatch(obtenerBalance({ fechaDesde: fechaHaceUnMes, fechaHasta: fechaHoy })),
        dispatch(obtenerEstadisticas('mes')),
        dispatch(obtenerMovimientos({
          limite: 10,
          offset: 0,
          fechaDesde: fechaHaceUnMes,
          fechaHasta: fechaHoy
        }))
      ])
      
      console.log('Resultados cargados:', {
        balance: resultados[0],
        estadisticas: resultados[1],
        movimientos: resultados[2]
      })
    } catch (error) {
      console.error('Error al cargar datos:', error)
    }
  }

  const aplicarFiltros = () => {
    console.log('Aplicando filtros:', filtros)
    dispatch(obtenerMovimientos({
      ...filtros,
      limite: 20,
      offset: 0
    }))
  }

  const handleFiltroChange = (campo, valor) => {
    console.log(`Cambiando filtro ${campo}:`, valor)
    dispatch(establecerFiltros({ [campo]: valor }))
  }

  const limpiarFiltros = () => {
    console.log('Limpiando filtros')
    dispatch(establecerFiltros({
      tipo: '',
      categoria: '',
      fechaDesde: '',
      fechaHasta: '',
      metodo_pago: ''
    }))
    // Recargar movimientos sin filtros
    dispatch(obtenerMovimientos({
      limite: 20,
      offset: 0
    }))
  }

  const handleCrearMovimiento = async (movimientoData) => {
    try {
      await dispatch(crearMovimiento(movimientoData)).unwrap()
      setMostrarFormulario(false)
      // Recargar datos
      cargarDatos()
    } catch (error) {
      console.error('Error al crear movimiento:', error)
    }
  }

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

  const cambiarPeriodoEstadisticas = (nuevoPeriodo) => {
    setPeriodoEstadisticas(nuevoPeriodo)
    dispatch(obtenerEstadisticas(nuevoPeriodo))
  }

  if (error) {
    return (
      <div className="contabilidad-error">
        <div className="error-message">
          <h3>Error al cargar datos</h3>
          <p>{error}</p>
          <button 
            onClick={() => {
              dispatch(limpiarError())
              cargarDatos()
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
    <div className="contabilidad">
      <div className="contabilidad-header">
        <h1>Contabilidad y Caja</h1>
        <div className="header-actions">
          <div className="view-selector">
            <button 
              className={vistaActual === 'dashboard' ? 'active' : ''}
              onClick={() => setVistaActual('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={vistaActual === 'movimientos' ? 'active' : ''}
              onClick={() => setVistaActual('movimientos')}
            >
              Movimientos
            </button>
            <button 
              className={vistaActual === 'reportes' ? 'active' : ''}
              onClick={() => setVistaActual('reportes')}
            >
              Reportes
            </button>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setMostrarFormulario(true)}
          >
            + Nuevo Movimiento
          </button>
        </div>
      </div>

      {vistaActual === 'dashboard' && (
        <div className="dashboard-section">
          {/* Tarjetas de estadísticas principales */}
          <div className="stats-cards">
            <div className="stat-card ingresos">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Ingresos del Día</h3>
                <p className="stat-value">{formatearMoneda(ingresoHoy)}</p>
              </div>
            </div>

            <div className="stat-card egresos">
              <div className="stat-icon">💸</div>
              <div className="stat-content">
                <h3>Egresos del Día</h3>
                <p className="stat-value">{formatearMoneda(egresoHoy)}</p>
              </div>
            </div>

            <div className="stat-card balance">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Balance del Día</h3>
                <p className={`stat-value ${balanceHoy >= 0 ? 'positive' : 'negative'}`}>
                  {formatearMoneda(balanceHoy)}
                </p>
              </div>
            </div>

            <div className="stat-card balance-mes">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3>Balance del Mes</h3>
                <p className={`stat-value ${balanceMes >= 0 ? 'positive' : 'negative'}`}>
                  {formatearMoneda(balanceMes)}
                </p>
              </div>
            </div>
          </div>

          {/* Gráficos y análisis */}
          <div className="dashboard-charts">
            <div className="chart-container">
              <h3>Distribución por Categoría</h3>
              <div className="categoria-stats">
                {categoriasCombinadas && categoriasCombinadas.length > 0 ? (
                  categoriasCombinadas.map((cat, index) => (
                    <div key={index} className="categoria-item">
                      <span className="categoria-nombre">
                        {cat.categoria || 'Sin categoría'} 
                        <span className={`tipo-badge ${cat.tipo}`}>
                          {cat.tipo === 'ingreso' ? '↗️' : '↘️'}
                        </span>
                      </span>
                      <span className="categoria-monto">{formatearMoneda(cat.total || 0)}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-data">
                    <p>No hay datos de categorías disponibles</p>
                  </div>
                )}
              </div>
            </div>

            <div className="chart-container">
              <h3>Métodos de Pago</h3>
              <div className="metodo-pago-stats">
                {metodosPagoCombinados && metodosPagoCombinados.length > 0 ? (
                  metodosPagoCombinados.map((metodo, index) => (
                    <div key={index} className="metodo-item">
                      <span className="metodo-nombre">
                        {metodo.metodo_pago || 'Sin especificar'}
                        <span className={`tipo-badge ${metodo.tipo}`}>
                          {metodo.tipo === 'ingreso' ? '↗️' : '↘️'}
                        </span>
                      </span>
                      <span className="metodo-monto">{formatearMoneda(metodo.total || 0)}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-data">
                    <p>No hay datos de métodos de pago disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Últimos movimientos */}
          <div className="recent-movements">
            <h3>Últimos Movimientos</h3>
            <div className="movements-list">
              {movimientosRecientes && movimientosRecientes.length > 0 ? (
                movimientosRecientes.map((movimiento) => (
                  <CajaMovimientoCard 
                    key={movimiento.id} 
                    movimiento={movimiento}
                    onEdit={setMovimientoEditando}
                  />
                ))
              ) : (
                <div className="no-data">
                  <p>No hay movimientos para mostrar</p>
                  <small>No hay movimientos recientes disponibles</small>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {vistaActual === 'movimientos' && (
        <div className="movimientos-section">
          {/* Filtros */}
          <div className="filtros-container">
            <div className="filtros-grid">
              <select
                value={filtros.tipo}
                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="ingreso">Ingresos</option>
                <option value="egreso">Egresos</option>
              </select>

              <select
                value={filtros.categoria}
                onChange={(e) => handleFiltroChange('categoria', e.target.value)}
              >
                <option value="">Todas las categorías</option>
                <option value="venta">Ventas</option>
                <option value="compra">Compras</option>
                <option value="gasto_operativo">Gastos Operativos</option>
                <option value="gasto_administrativo">Gastos Administrativos</option>
                <option value="inversion">Inversión</option>
                <option value="otro">Otros</option>
              </select>

              <select
                value={filtros.metodo_pago}
                onChange={(e) => handleFiltroChange('metodo_pago', e.target.value)}
              >
                <option value="">Todos los métodos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="cheque">Cheque</option>
              </select>

              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                placeholder="Fecha desde"
              />

              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                placeholder="Fecha hasta"
              />

              <button onClick={limpiarFiltros} className="btn-outline">
                🗑️ Limpiar Filtros
              </button>
              
              <div className="filter-status">
                {(filtros.tipo || filtros.categoria || filtros.metodo_pago || filtros.fechaDesde || filtros.fechaHasta) && (
                  <span className="filters-active">
                    📊 Filtros activos
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lista de movimientos */}
          <div className="movimientos-list">
            {console.log('DEBUG RENDER:', { movimientos, length: movimientos?.length, isArray: Array.isArray(movimientos) })}
            {cargando ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                Cargando movimientos...
              </div>
            ) : Array.isArray(movimientos) && movimientos.length > 0 ? (
              <>
                <div className="movimientos-header">
                  <h4>Movimientos encontrados: {movimientos.length}</h4>
                </div>
                <div className="movements-grid">
                  {movimientos.map((movimiento) => (
                    <CajaMovimientoCard 
                      key={movimiento.id} 
                      movimiento={movimiento}
                      onEdit={setMovimientoEditando}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="no-results">
                <p>No se encontraron movimientos</p>
                <small>
                  {filtros.categoria && filtros.categoria !== '' ? 
                    `La categoría "${filtros.categoria}" no tiene movimientos registrados.` :
                    filtros.tipo && filtros.tipo !== '' ?
                    `No hay movimientos de tipo "${filtros.tipo}".` :
                    'No hay movimientos para mostrar con los filtros actuales.'
                  }
                </small>
                <button 
                  onClick={limpiarFiltros} 
                  className="btn-outline"
                  style={{ marginTop: '10px' }}
                >
                  🗑️ Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {vistaActual === 'reportes' && (
        <div className="reportes-section">
          <div className="periodo-selector">
            <h3>Seleccionar Período para Estadísticas</h3>
            <div className="periodo-buttons">
              <button 
                className={periodoEstadisticas === 'dia' ? 'active' : ''}
                onClick={() => cambiarPeriodoEstadisticas('dia')}
              >
                Hoy
              </button>
              <button 
                className={periodoEstadisticas === 'semana' ? 'active' : ''}
                onClick={() => cambiarPeriodoEstadisticas('semana')}
              >
                Esta Semana
              </button>
              <button 
                className={periodoEstadisticas === 'mes' ? 'active' : ''}
                onClick={() => cambiarPeriodoEstadisticas('mes')}
              >
                Este Mes
              </button>
              <button 
                className={periodoEstadisticas === 'año' ? 'active' : ''}
                onClick={() => cambiarPeriodoEstadisticas('año')}
              >
                Este Año
              </button>
            </div>
          </div>

          <div className="reportes-grid">
            <div className="reporte-card">
              <h4>Balance General</h4>
              <div className="balance-details">
                <div className="balance-item">
                  <span>Total Ingresos:</span>
                  <span className="positive">{formatearMoneda(balance.total_ingresos || 0)}</span>
                </div>
                <div className="balance-item">
                  <span>Total Egresos:</span>
                  <span className="negative">{formatearMoneda(balance.total_egresos || 0)}</span>
                </div>
                <div className="balance-item total">
                  <span>Balance Neto:</span>
                  <span className={`${(balance.balance_neto || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {formatearMoneda(balance.balance_neto || 0)}
                  </span>
                </div>
                <div className="balance-item">
                  <span>Total Movimientos:</span>
                  <span>{balance.movimientos_count || 0}</span>
                </div>
              </div>
            </div>

            <div className="reporte-card">
              <h4>Resumen del Período</h4>
              <div className="resumen-details">
                <p><strong>Período:</strong> {resumen.periodo || 'Último mes'}</p>
                <div className="resumen-item">
                  <span>Ingresos:</span>
                  <span className="positive">{formatearMoneda(resumen.total_ingresos || 0)}</span>
                </div>
                <div className="resumen-item">
                  <span>Egresos:</span>
                  <span className="negative">{formatearMoneda(resumen.total_egresos || 0)}</span>
                </div>
                <div className="resumen-item total">
                  <span>Balance:</span>
                  <span className={`${(resumen.balance || 0) >= 0 ? 'positive' : 'negative'}`}>
                    {formatearMoneda(resumen.balance || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{movimientoEditando ? 'Editar Movimiento' : 'Nuevo Movimiento'}</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setMostrarFormulario(false)
                  setMovimientoEditando(null)
                }}
              >
                ×
              </button>
            </div>
            <MovimientoForm
              movimiento={movimientoEditando}
              onSubmit={handleCrearMovimiento}
              onCancel={() => {
                setMostrarFormulario(false)
                setMovimientoEditando(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Contabilidad