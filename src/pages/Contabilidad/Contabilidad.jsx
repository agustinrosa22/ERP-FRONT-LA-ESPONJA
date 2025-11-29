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
import MovimientoForm from '../../components/MovimientoForm/MovimientoForm'
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

  // Estados locales y fechas (DECLARAR PRIMERO)
  const [vistaActual, setVistaActual] = useState('dashboard')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [movimientoEditando, setMovimientoEditando] = useState(null)
  const [periodoEstadisticas, setPeriodoEstadisticas] = useState('mes')
  const [balanceDelMes, setBalanceDelMes] = useState(null)

  // Fechas por defecto (DECLARAR ANTES DE USAR)
  const fechaHoy = new Date().toISOString().split('T')[0]
  const fechaHaceUnMes = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Debug: Verificar datos REALES del endpoint
  console.log('🔍 Datos Redux en Contabilidad (SOLO DATOS REALES):', {
    movimientos: movimientos,
    movimientosLength: Array.isArray(movimientos) ? movimientos.length : 'No es array',
    balance: balance,
    estadisticas: estadisticas,
    resumen: resumen,
    balanceCompleto: balance // Ver estructura completa
  })

  // Extraer ÚNICAMENTE datos reales del endpoint /api/caja/balance SOLO DEL DÍA DE HOY
  let ingresoHoy = 0, egresoHoy = 0, balanceHoy = 0, balanceMes = 0
  
  console.log('🔍 Estado del balance DEL DÍA desde Redux:', {
    balance,
    tieneBalance: !!balance,
    tieneData: !!(balance && balance.data),
    tieneBalanceGeneral: !!(balance && balance.data && balance.data.balance_general),
    keys: balance ? Object.keys(balance) : null
  })
  
  // PROCESAR datos del DÍA DE HOY y del MES por separado
  
  // 1. DATOS DEL DÍA DE HOY (balance contiene solo datos del día)
  // IMPORTANTE: La API devuelve { success: true, data: {...} }
  const datosDelDia = balance?.data || balance
  if (datosDelDia && datosDelDia.balance_general) {
    console.log('📊 ✅ PROCESANDO DATOS DEL DÍA DE HOY:', datosDelDia.balance_general)
    
    ingresoHoy = Number(datosDelDia.balance_general.total_ingresos) || 0
    egresoHoy = Number(datosDelDia.balance_general.total_egresos) || 0
    balanceHoy = Number(datosDelDia.balance_general.balance_neto) || 0
    
    console.log('💰 ✅ VALORES DEL DÍA DE HOY:', {
      ingresoHoy,
      egresoHoy,
      balanceHoy,
      fechaConsultada: fechaHoy,
      estructuraOriginal: balance
    })
  } else {
    console.log('⚠️ NO HAY DATOS del día de hoy del endpoint /api/caja/balance')
    console.log('❌ Balance del día recibido:', balance)
  }
  
  // 2. DATOS DEL MES COMPLETO (balanceDelMes contiene datos acumulados del mes)
  // IMPORTANTE: La API devuelve { success: true, data: {...} }
  const datosDelMes = balanceDelMes?.data || balanceDelMes
  if (datosDelMes && datosDelMes.balance_general) {
    console.log('📈 ✅ PROCESANDO DATOS DEL MES COMPLETO:', datosDelMes.balance_general)
    
    balanceMes = Number(datosDelMes.balance_general.balance_neto) || 0
    
    console.log('📊 ✅ VALORES DEL MES COMPLETO:', {
      ingresosMes: Number(datosDelMes.balance_general.total_ingresos) || 0,
      egresosMes: Number(datosDelMes.balance_general.total_egresos) || 0,
      balanceMes,
      fechaDesde: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      fechaHasta: fechaHoy,
      estructuraOriginal: balanceDelMes
    })
  } else {
    // Si no hay datos del mes, usar los del día como fallback
    balanceMes = balanceHoy
    console.log('⚠️ NO HAY DATOS del mes - usando balance del día como fallback:', balanceMes)
    console.log('🔍 Estructura recibida del mes:', balanceDelMes)
  }

  // Procesar ÚNICAMENTE datos reales del endpoint /api/caja/balance
  let categoriasCombinadas = []
  let metodosPagoCombinados = []
  let movimientosRecientes = []
  
  // PROCESAR movimientos recientes desde Redux (para el dashboard)
  if (Array.isArray(movimientos) && movimientos.length > 0) {
    // Tomar los primeros 5 movimientos para mostrar como "recientes"
    movimientosRecientes = movimientos.slice(0, 5)
    console.log('📝 ✅ MOVIMIENTOS RECIENTES procesados:', {
      totalMovimientos: movimientos.length,
      movimientosRecientes: movimientosRecientes.length,
      movimientosData: movimientosRecientes
    })
  } else {
    console.log('⚠️ NO hay movimientos disponibles en Redux')
  }
  
  // SOLO usar datos reales del endpoint /api/caja/balance según documentación oficial
  // IMPORTANTE: La API devuelve { success: true, data: {...} }
  const datosBalance = balance?.data || balance
  if (datosBalance) {
    console.log('📊 ✅ Procesando datos REALES del endpoint /api/caja/balance:', datosBalance)
    
    // Procesar ingresos_por_categoria (ARRAY según documentación)
    if (datosBalance.ingresos_por_categoria && Array.isArray(datosBalance.ingresos_por_categoria)) {
      datosBalance.ingresos_por_categoria.forEach(item => {
        categoriasCombinadas.push({
          categoria: item.categoria || 'Sin categoría',
          total: Number(item.total) || 0,
          tipo: 'ingreso'
        })
      })
      console.log('📈 ✅ INGRESOS por categoría procesados:', datosBalance.ingresos_por_categoria)
    }
    
    // Procesar egresos_por_categoria (ARRAY según documentación) 
    if (datosBalance.egresos_por_categoria && Array.isArray(datosBalance.egresos_por_categoria)) {
      datosBalance.egresos_por_categoria.forEach(item => {
        categoriasCombinadas.push({
          categoria: item.categoria || 'Sin categoría',
          total: Number(item.total) || 0,
          tipo: 'egreso'
        })
      })
      console.log('📉 ✅ EGRESOS por categoría procesados:', datosBalance.egresos_por_categoria)
    }
    
    // Procesar por_metodo_pago (ARRAY según documentación)
    if (datosBalance.por_metodo_pago && Array.isArray(datosBalance.por_metodo_pago)) {
      metodosPagoCombinados = datosBalance.por_metodo_pago.map(item => ({
        metodo_pago: item.metodo_pago || 'Sin método',
        total: Number(item.total) || 0,
        tipo: item.tipo || 'N/A'
      }))
      console.log('💳 ✅ MÉTODOS de pago procesados:', datosBalance.por_metodo_pago)
    }
    
    console.log('🏷️ ✅ CATEGORÍAS FINALES (arrays reales):', categoriasCombinadas)
    console.log('💳 ✅ MÉTODOS FINALES (arrays reales):', metodosPagoCombinados)
    
  } else {
    console.log('⚠️ NO hay datos del endpoint /api/caja/balance - Arrays vacíos')
    console.log('🔍 Estructura recibida del balance:', balance)
  }



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
      console.log('🔄 Iniciando carga de datos de contabilidad...')
      console.log('📅 Parámetros de fecha:', { 
        fechaHaceUnMes, 
        fechaHoy,
        formatoEsperado: 'YYYY-MM-DD'
      })
      
      // Obtener primer día del mes actual
      const primerDiaDelMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      
      console.log('🔗 ENDPOINTS QUE SE VAN A LLAMAR:')
      console.log(`1. Balance del día: GET /api/caja/balance?fecha_desde=${fechaHoy}&fecha_hasta=${fechaHoy}`)
      console.log(`2. Balance del mes: GET /api/caja/balance?fecha_desde=${primerDiaDelMes}&fecha_hasta=${fechaHoy}`)
      console.log(`3. Estadísticas: GET /api/caja/estadisticas?periodo=mes`)
      console.log(`4. Movimientos: GET /api/caja?limit=10&page=1&fecha_desde=${fechaHaceUnMes}&fecha_hasta=${fechaHoy}`)
      
      const resultados = await Promise.all([
        // Balance SOLO DEL DÍA DE HOY (para ingresos/egresos/balance del día)
        dispatch(obtenerBalance({ fechaDesde: fechaHoy, fechaHasta: fechaHoy })),
        // Balance DEL MES ACTUAL (del primer día del mes hasta hoy)  
        dispatch(obtenerBalance({ fechaDesde: primerDiaDelMes, fechaHasta: fechaHoy })),
        dispatch(obtenerEstadisticas('mes')),
        dispatch(obtenerMovimientos({
          limite: 10,
          offset: 0,
          fechaDesde: fechaHaceUnMes,
          fechaHasta: fechaHoy
        }))
      ])
      
      console.log('✅ Resultados cargados del dispatch:', {
        balanceDelDia: resultados[0], // Balance SOLO del día de hoy
        balanceDelMes: resultados[1], // Balance del mes actual
        estadisticasMes: resultados[2], 
        movimientosUltimoMes: resultados[3]
      })
      
      // Guardar el balance del mes en el estado local
      if (resultados[1] && resultados[1].payload) {
        setBalanceDelMes(resultados[1].payload)
        console.log('📊 Balance del mes actual guardado:', resultados[1].payload)
      }
      
      // Verificar específicamente el payload del balance DEL DÍA
      if (resultados[0] && resultados[0].payload) {
        console.log('🔍 Balance DEL DÍA DE HOY:', resultados[0].payload)
        console.log('💰 Ingresos de hoy específicamente:', resultados[0].payload?.balance_general?.total_ingresos || 0)
      }
      
      // Verificar específicamente el payload de movimientos
      if (resultados[3] && resultados[3].payload) {
        console.log('🔍 Payload de movimientos detallado:', resultados[3].payload)
        console.log('📝 Cantidad de movimientos:', Array.isArray(resultados[3].payload) ? resultados[3].payload.length : 'No es array')
      }
      
    } catch (error) {
      console.error('❌ Error al cargar datos:', error)
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
                {(() => {
                  const datosMes = balanceDelMes?.data || balanceDelMes
                  return datosMes && datosMes.balance_general && (
                    <small style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      Ingresos: {formatearMoneda(datosMes.balance_general.total_ingresos || 0)} |
                      Egresos: {formatearMoneda(datosMes.balance_general.total_egresos || 0)}
                    </small>
                  )
                })()}
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
            <h3>Últimos Movimientos ({movimientosRecientes.length})</h3>
            <div className="movements-list">
              {console.log('🔍 DEBUG Renderizando movimientos recientes:', {
                movimientosRecientes,
                length: movimientosRecientes.length,
                isArray: Array.isArray(movimientosRecientes)
              })}
              {Array.isArray(movimientosRecientes) && movimientosRecientes.length > 0 ? (
                movimientosRecientes.map((movimiento) => (
                  <CajaMovimientoCard 
                    key={movimiento.id} 
                    movimiento={movimiento}
                    onEdit={setMovimientoEditando}
                  />
                ))
              ) : cargando ? (
                <div className="loading">
                  <div className="loading-spinner"></div>
                  Cargando movimientos recientes...
                </div>
              ) : (
                <div className="no-data">
                  <p>No hay movimientos recientes</p>
                  <small>
                    {Array.isArray(movimientos) ? 
                      `Total de movimientos en sistema: ${movimientos.length}` :
                      'No hay movimientos cargados desde el backend'
                    }
                  </small>
                  <button 
                    onClick={cargarDatos}
                    className="btn-outline"
                    style={{ marginTop: '10px' }}
                  >
                    🔄 Recargar Datos
                  </button>
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