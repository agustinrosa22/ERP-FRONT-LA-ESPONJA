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

  // Debug: Verificar datos REALES del endpoint
  console.log('🔍 Datos Redux en Contabilidad (SOLO DATOS REALES):', {
    movimientos: movimientos,
    movimientosLength: Array.isArray(movimientos) ? movimientos.length : 'No es array',
    balance: balance,
    estadisticas: estadisticas,
    resumen: resumen,
    balanceCompleto: balance // Ver estructura completa
  })

  // Extraer ÚNICAMENTE datos reales del endpoint /api/caja/balance
  let ingresoHoy = 0, egresoHoy = 0, balanceHoy = 0, balanceMes = 0
  
  // SOLO usar datos del endpoint /api/caja/balance (estructura que me pasaste)
  if (balance && balance.balance_general) {
    console.log('📊 ✅ USANDO DATOS REALES del endpoint /api/caja/balance:', balance)
    ingresoHoy = balance.balance_general.total_ingresos
    egresoHoy = balance.balance_general.total_egresos
    balanceHoy = balance.balance_general.balance_neto
    balanceMes = balance.balance_general.balance_neto // Usar el mismo valor para el mes por ahora
  } else {
    console.log('⚠️ NO HAY DATOS del endpoint /api/caja/balance - Mostrando valores en 0')
  }

  // Debug: verificar valores REALES
  console.log('💰 VALORES REALES del endpoint /api/caja/balance:', {
    ingresoHoy,
    egresoHoy, 
    balanceHoy,
    balanceMes,
    tieneBalance: !!balance,
    tieneBalanceGeneral: !!(balance && balance.balance_general),
    estructuraBalance: balance
  })

  // Procesar ÚNICAMENTE datos reales del endpoint /api/caja/balance
  let categoriasCombinadas = []
  let metodosPagoCombinados = []
  let movimientosRecientes = []
  
  // SOLO usar datos del endpoint /api/caja/balance
  if (balance) {
    console.log('📊 ✅ Procesando datos REALES del endpoint /api/caja/balance para gráficos:', balance)
    
    // Procesar ingresos por categoría del endpoint real
    if (balance.ingresos_por_categoria) {
      if (Array.isArray(balance.ingresos_por_categoria)) {
        // Si es array
        balance.ingresos_por_categoria.forEach(cat => {
          categoriasCombinadas.push({
            categoria: cat.categoria || 'Sin categoría',
            total: Number(cat.total) || 0,
            tipo: 'ingreso'
          })
        })
      } else if (typeof balance.ingresos_por_categoria === 'object') {
        // Si es objeto (como en tu ejemplo)
        Object.entries(balance.ingresos_por_categoria).forEach(([categoria, total]) => {
          categoriasCombinadas.push({
            categoria: categoria,
            total: Number(total) || 0,
            tipo: 'ingreso'
          })
        })
      }
    }
    
    // Procesar egresos por categoría del endpoint real
    if (balance.egresos_por_categoria) {
      if (Array.isArray(balance.egresos_por_categoria)) {
        // Si es array
        balance.egresos_por_categoria.forEach(cat => {
          categoriasCombinadas.push({
            categoria: cat.categoria || 'Sin categoría',
            total: Number(cat.total) || 0,
            tipo: 'egreso'
          })
        })
      } else if (typeof balance.egresos_por_categoria === 'object') {
        // Si es objeto
        Object.entries(balance.egresos_por_categoria).forEach(([categoria, total]) => {
          categoriasCombinadas.push({
            categoria: categoria,
            total: Number(total) || 0,
            tipo: 'egreso'
          })
        })
      }
    }
    
    // Métodos de pago del endpoint real
    if (balance.por_metodo_pago) {
      if (Array.isArray(balance.por_metodo_pago)) {
        metodosPagoCombinados = balance.por_metodo_pago.map(mp => ({
          metodo_pago: mp.metodo_pago || mp.metodo || 'Sin método',
          total: Number(mp.total) || 0,
          tipo: mp.tipo || 'N/A'
        }))
      } else if (typeof balance.por_metodo_pago === 'object') {
        metodosPagoCombinados = Object.entries(balance.por_metodo_pago).map(([metodo, total]) => ({
          metodo_pago: metodo,
          total: Number(total) || 0,
          tipo: 'N/A'
        }))
      }
    }
    
    console.log('📊 ✅ Categorías REALES procesadas:', categoriasCombinadas)
    console.log('💳 ✅ Métodos de pago REALES:', metodosPagoCombinados)
    
  } else {
    console.log('⚠️ NO hay datos del endpoint /api/caja/balance - Arrays vacíos')
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
                <p className="stat-value">{formatearMoneda(ingresoHoy || 0)}</p>
              </div>
            </div>

            <div className="stat-card egresos">
              <div className="stat-icon">💸</div>
              <div className="stat-content">
                <h3>Egresos del Día</h3>
                <p className="stat-value">{formatearMoneda(egresoHoy || 0)}</p>
              </div>
            </div>

            <div className="stat-card balance">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Balance del Día</h3>
                <p className={`stat-value ${(balanceHoy || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {formatearMoneda(balanceHoy || 0)}
                </p>
              </div>
            </div>

            <div className="stat-card balance-mes">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3>Balance del Mes</h3>
                <p className={`stat-value ${(balanceMes || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {formatearMoneda(balanceMes || 0)}
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