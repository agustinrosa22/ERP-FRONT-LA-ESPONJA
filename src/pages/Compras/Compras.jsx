import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  obtenerProveedores,
  setFiltrosProveedores,
  clearFiltrosProveedores,
  crearProveedor,
  cambiarEstadoProveedor,
  obtenerEstadisticasProveedor
} from '../../store/slices/proveedoresSlice'
import {
  obtenerCompras,
  obtenerCompraPorId,
  actualizarEstadoCompra,
  setFiltrosCompras,
  clearFiltrosCompras,
  obtenerEstadisticasCompras,
  selectCompras,
  selectLoadingCompras,
  selectFiltrosCompras,
  selectEstadisticasCompras
} from '../../store/slices/comprasSlice'
import { obtenerProductos } from '../../store/slices/inventarioSlice'
import ProveedorForm from '../../components/ProveedorForm/ProveedorForm'
import ProveedorCard from '../../components/ProveedorCard/ProveedorCard'
import CompraForm from '../../components/CompraForm/CompraForm'
import './Compras.css'
import SucursalBadge from '../../components/SucursalBadge/SucursalBadge'

const Compras = () => {
  const dispatch = useDispatch()
  const { selectedSucursalId } = useSelector((state) => state.sucursales)
  
  // Estados de Redux con valores por defecto seguros
  const { 
    proveedores: proveedoresRaw = [], 
    loading: loadingProveedores = false, 
    filtrosProveedores = {},
    totalProveedores = 0,
    paginaActual = 1,
    totalPaginas = 1,
    estadisticasProveedor = null
  } = useSelector(state => state.proveedores || {})

  // Filtrar proveedores válidos para evitar errores de renderizado
  const proveedores = Array.isArray(proveedoresRaw) 
    ? proveedoresRaw.filter(p => p && p.id) 
    : []

  const compras = useSelector(selectCompras) || []
  const loadingCompras = useSelector(selectLoadingCompras) || false
  const filtrosCompras = useSelector(selectFiltrosCompras) || {}
  const estadisticasCompras = useSelector(selectEstadisticasCompras) || {}

  const { productos = [] } = useSelector(state => state.inventario || {})

  // Estados locales
  const [vistaActiva, setVistaActiva] = useState('proveedores')
  const [mostrarFormularioProveedor, setMostrarFormularioProveedor] = useState(false)
  const [mostrarFormularioCompra, setMostrarFormularioCompra] = useState(false)
  const [proveedorEditar, setProveedorEditar] = useState(null)
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null)
  const [compraSeleccionada, setCompraSeleccionada] = useState(null)
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false)
  const [mostrarDetalleCompra, setMostrarDetalleCompra] = useState(false)

  // Estados para búsquedas y filtros
  const [busquedaProveedor, setBusquedaProveedor] = useState('')
  const [filtroEstadoProveedor, setFiltroEstadoProveedor] = useState('todos')
  
  // Flag para evitar actualizaciones en bucle
  const [filtrosInicializados, setFiltrosInicializados] = useState(false)

  // Cargar datos iniciales con manejo de errores y al cambiar sucursal
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        await dispatch(obtenerProveedores())
      } catch (error) {
        console.error('Error al cargar proveedores:', error)
      }
      
      try {
        await dispatch(obtenerCompras(filtrosCompras))
      } catch (error) {
        console.error('Error al cargar compras:', error)
      }
      
      try {
        await dispatch(obtenerProductos())
      } catch (error) {
        console.error('Error al cargar productos:', error)
      }
      
      try {
        await dispatch(obtenerEstadisticasCompras())
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      }
    }
    
    cargarDatosIniciales()
  }, [dispatch, selectedSucursalId])

  // Actualizar filtros de proveedores cuando cambia la búsqueda
  useEffect(() => {
    if (!filtrosInicializados) {
      setFiltrosInicializados(true)
      return
    }
    
    // Solo hacer la petición si realmente cambiaron los filtros de búsqueda
    const filtros = {
      busqueda: busquedaProveedor,
      estado: filtroEstadoProveedor,
      pagina: 1,
      limite: 10
    }
    
    // Comparar con filtros actuales para evitar peticiones innecesarias
    const filtrosActuales = filtrosProveedores || {}
    const hayCambios = filtros.busqueda !== filtrosActuales.busqueda || 
                      filtros.estado !== filtrosActuales.estado
    
    if (hayCambios) {
      dispatch(setFiltrosProveedores(filtros))
      // Manejo de errores en la carga de proveedores
      dispatch(obtenerProveedores(filtros)).catch(error => {
        console.error('Error al filtrar proveedores:', error)
      })
    }
  }, [busquedaProveedor, filtroEstadoProveedor, dispatch, filtrosInicializados, filtrosProveedores])

  // Actualizar compras cuando cambian los filtros
  useEffect(() => {
    if (!filtrosInicializados) return
    
    dispatch(obtenerCompras(filtrosCompras)).catch(error => {
      console.error('Error al filtrar compras:', error)
    })
  }, [filtrosCompras, dispatch, filtrosInicializados])

  // Handlers para proveedores
  const handleNuevoProveedor = () => {
    setProveedorEditar(null)
    setMostrarFormularioProveedor(true)
  }

  const handleEditarProveedor = (proveedor) => {
    setProveedorEditar(proveedor)
    setMostrarFormularioProveedor(true)
  }

  const handleVerDetallesProveedor = (proveedor) => {
    setProveedorSeleccionado(proveedor)
    dispatch(obtenerEstadisticasProveedor(proveedor.id))
    setMostrarEstadisticas(true)
  }

  const handleCambiarEstadoProveedor = async (proveedor) => {
    const nuevoEstado = !proveedor.activo
    const accion = nuevoEstado ? 'activar' : 'desactivar'
    
    if (window.confirm(`¿Está seguro de ${accion} el proveedor "${proveedor.nombre}"?`)) {
      try {
        // Crear datos completos del proveedor con el nuevo estado
        const proveedorActualizado = {
          ...proveedor,
          activo: nuevoEstado
        }
        
        await dispatch(cambiarEstadoProveedor({ 
          id: proveedor.id, 
          proveedorData: proveedorActualizado 
        })).unwrap()
        
        // Recargar la lista
        dispatch(obtenerProveedores(filtrosProveedores))
        
        alert(`Proveedor ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`)
      } catch (error) {
        alert(`Error al ${accion} proveedor: ${error}`)
      }
    }
  }

  const handleProveedorSuccess = () => {
    setMostrarFormularioProveedor(false)
    setProveedorEditar(null)
    
    // Si estamos editando, mantener filtros. Si es nuevo, limpiar filtros para que sea visible
    if (!proveedorEditar) {
      // Limpiar filtros para mostrar el nuevo proveedor
      setBusquedaProveedor('')
      setFiltroEstadoProveedor('todos')
      dispatch(clearFiltrosProveedores())
      // Recargar sin filtros
      dispatch(obtenerProveedores())
    } else {
      // Si es edición, recargar con filtros actuales
      const filtrosActuales = {
        busqueda: busquedaProveedor,
        estado: filtroEstadoProveedor,
        pagina: 1,
        limite: 10
      }
      dispatch(obtenerProveedores(filtrosActuales))
    }
  }

  // Handlers para paginación
  const handleCambiarPagina = (nuevaPagina) => {
    const filtros = { ...filtrosProveedores, pagina: nuevaPagina }
    dispatch(setFiltrosProveedores(filtros))
    dispatch(obtenerProveedores(filtros))
  }

  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setBusquedaProveedor('')
    setFiltroEstadoProveedor('todos')
    dispatch(clearFiltrosProveedores())
  }

  // ========== HANDLERS PARA COMPRAS ==========
  
  const handleVerDetalleCompra = async (compra) => {
    try {
      console.log('🔍 Obteniendo detalles completos de la compra:', compra.id)
      
      // Obtener datos completos de la compra con todos los detalles
      const resultado = await dispatch(obtenerCompraPorId(compra.id)).unwrap()
      
      console.log('📦 ✅ Datos completos de la compra obtenidos:', resultado)
      
      setCompraSeleccionada(resultado)
      setMostrarDetalleCompra(true)
    } catch (error) {
      console.error('❌ Error al obtener detalles:', error)
      
      // Si falla la carga completa, usar los datos básicos disponibles
      console.log('⚠️ Usando datos básicos de la compra')
      setCompraSeleccionada(compra)
      setMostrarDetalleCompra(true)
      
      alert(`Advertencia: No se pudieron cargar todos los detalles. Error: ${error}`)
    }
  }

  const handleCambiarEstado = async (compraId, nuevoEstado) => {
    const estadosTexto = {
      recibida: 'marcar como recibida',
      facturada: 'marcar como facturada',
      pagada: 'marcar como pagada',
      cancelada: 'cancelar'
    }

    if (window.confirm(`¿Está seguro de ${estadosTexto[nuevoEstado]} esta compra?`)) {
      try {
        await dispatch(actualizarEstadoCompra({ 
          id: compraId, 
          estado: nuevoEstado 
        })).unwrap()
        
        // Recargar la lista de compras
        dispatch(obtenerCompras(filtrosCompras))
        
        alert(`Compra ${estadosTexto[nuevoEstado]} correctamente`)
      } catch (error) {
        alert(`Error al cambiar estado: ${error}`)
      }
    }
  }

  const handleNuevaCompra = () => {
    setMostrarFormularioCompra(true)
  }

  const handleCompraSuccess = () => {
    setMostrarFormularioCompra(false)
    // Recargar lista de compras
    dispatch(obtenerCompras(filtrosCompras))
  }

  // Renderizar filtros de proveedores
  const renderFiltrosProveedores = () => (
    <div className="filtros-container">
      <h3>🔍 Filtros de Proveedores</h3>
      <div className="filtros-grid">
        <div className="filtro-group">
          <label>Búsqueda</label>
          <input
            type="text"
            value={busquedaProveedor}
            onChange={(e) => setBusquedaProveedor(e.target.value)}
            placeholder="Buscar por razón social, CUIT..."
            className="filtro-input"
          />
        </div>

        <div className="filtro-group">
          <label>Estado</label>
          <select
            value={filtroEstadoProveedor}
            onChange={(e) => setFiltroEstadoProveedor(e.target.value)}
            className="filtro-select"
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        <div className="filtro-actions">
          <button 
            onClick={handleLimpiarFiltros}
            className="btn-secondary"
          >
            🔄 Limpiar
          </button>
        </div>
      </div>
    </div>
  )

  // Renderizar estadísticas generales
  const renderEstadisticasGenerales = () => (
    <div className="estadisticas-generales">
      <h3>📊 Resumen de Compras</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-number">{totalProveedores}</span>
            <span className="stat-label">Proveedores Totales</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-number">
              {(proveedores || []).filter(p => p && p.activo).length}
            </span>
            <span className="stat-label">Proveedores Activos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <span className="stat-number">
              {estadisticasCompras?.totalCompras || 0}
            </span>
            <span className="stat-label">Compras Este Mes</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-number">
              ${estadisticasCompras?.montoTotal?.toLocaleString('es-AR') || '0'}
            </span>
            <span className="stat-label">Total Gastado</span>
          </div>
        </div>
      </div>
    </div>
  )

  // Renderizar lista de proveedores
  const renderProveedores = () => (
    <div className="proveedores-section">
      {renderFiltrosProveedores()}
      
      <div className="section-header">
        <h2>👥 Proveedores ({totalProveedores})</h2>
        <button 
          onClick={handleNuevoProveedor}
          className="btn-primary"
        >
          ➕ Nuevo Proveedor
        </button>
      </div>

      {loadingProveedores ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Cargando proveedores...</span>
        </div>
      ) : proveedores.length > 0 ? (
        <>
          <div className="proveedores-grid">
            {proveedores
              .filter(proveedor => proveedor && proveedor.id) // Filtrar elementos válidos
              .map(proveedor => (
                <ProveedorCard
                  key={proveedor.id}
                  proveedor={proveedor}
                  onEdit={handleEditarProveedor}
                  onViewDetails={handleVerDetallesProveedor}
                  onToggleStatus={handleCambiarEstadoProveedor}
                />
              ))
            }
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="pagination">
              <button
                onClick={() => handleCambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="pagination-btn"
              >
                ← Anterior
              </button>
              
              <span className="pagination-info">
                Página {paginaActual} de {totalPaginas}
              </span>
              
              <button
                onClick={() => handleCambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="pagination-btn"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No hay proveedores</h3>
          <p>Comience agregando su primer proveedor</p>
          <button 
            onClick={handleNuevoProveedor}
            className="btn-primary"
          >
            ➕ Agregar Proveedor
          </button>
        </div>
      )}
    </div>
  )

  // Renderizar sección de compras
  const renderCompras = () => (
    <div className="compras-section">
      <div className="section-header">
        <h2>🛒 Órdenes de Compra</h2>
        <button 
          className="btn-primary"
          onClick={() => setMostrarFormularioCompra(true)}
        >
          ➕ Nueva Orden de Compra
        </button>
      </div>

      {/* Filtros de búsqueda para compras */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="🔍 Buscar por factura, remito o proveedor..."
            value={filtrosCompras.search || ''}
            onChange={(e) => dispatch(setFiltrosCompras({ search: e.target.value }))}
            className="search-input"
          />
          
          <select
            value={filtrosCompras.estado || ''}
            onChange={(e) => dispatch(setFiltrosCompras({ estado: e.target.value }))}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="recibida">Recibida</option>
            <option value="facturada">Facturada</option>
            <option value="pagada">Pagada</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <select
            value={filtrosCompras.proveedor_id || ''}
            onChange={(e) => dispatch(setFiltrosCompras({ proveedor_id: e.target.value }))}
            className="filter-select"
          >
            <option value="">Todos los proveedores</option>
            {proveedores.map(proveedor => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.nombre}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filtrosCompras.fecha_desde || ''}
            onChange={(e) => dispatch(setFiltrosCompras({ fecha_desde: e.target.value }))}
            className="filter-input"
            placeholder="Desde"
          />

          <input
            type="date"
            value={filtrosCompras.fecha_hasta || ''}
            onChange={(e) => dispatch(setFiltrosCompras({ fecha_hasta: e.target.value }))}
            className="filter-input"
            placeholder="Hasta"
          />

          <button 
            onClick={() => dispatch(clearFiltrosCompras())}
            className="btn-secondary"
          >
            🧹 Limpiar
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {estadisticasCompras.resumen && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{estadisticasCompras.resumen.total_compras || 0}</h3>
              <p>Total Compras</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>${(estadisticasCompras.resumen.monto_total || 0).toLocaleString()}</h3>
              <p>Monto Total</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{estadisticasCompras.resumen.compras_pendientes || 0}</h3>
              <p>Pendientes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{estadisticasCompras.resumen.compras_recibidas || 0}</h3>
              <p>Recibidas</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3>{estadisticasCompras.resumen.compras_facturadas || 0}</h3>
              <p>Facturadas</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{estadisticasCompras.resumen.compras_pagadas || 0}</h3>
              <p>Pagadas</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de compras */}
      {loadingCompras ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando compras...</p>
        </div>
      ) : compras.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No hay compras registradas</h3>
          <p>Comienza creando tu primera orden de compra</p>
          <button 
            className="btn-primary"
            onClick={() => setMostrarFormularioCompra(true)}
          >
            ➕ Crear Primera Compra
          </button>
        </div>
      ) : (
        <div className="compras-grid">
          {compras.map(compra => (
            <div key={compra.id} className="compra-card">
              <div className="card-header">
                <div className="compra-info">
                  <h3>Compra #{compra.id}</h3>
                  {compra.numero_factura && (
                    <p className="factura">📄 {compra.numero_factura}</p>
                  )}
                </div>
                <span className={`status-badge status-${compra.estado}`}>
                  {compra.estado}
                </span>
              </div>

              <div className="card-content">
                <div className="compra-details">
                  <p><strong>Proveedor:</strong> {compra.proveedor?.nombre || 'N/A'}</p>
                  <p><strong>Fecha:</strong> {new Date(compra.fecha_compra).toLocaleDateString()}</p>
                  <p><strong>Total:</strong> ${(compra.total || 0).toLocaleString()}</p>
                  {compra.observaciones && (
                    <p><strong>Obs:</strong> {compra.observaciones}</p>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-secondary btn-small"
                  onClick={() => handleVerDetalleCompra(compra)}
                >
                  👁️ Ver
                </button>
                {compra.estado === 'pendiente' && (
                  <>
                    <button 
                      className="btn-success btn-small"
                      onClick={() => handleCambiarEstado(compra.id, 'recibida')}
                    >
                      📦 Recibir
                    </button>
                    <button 
                      className="btn-danger btn-small"
                      onClick={() => handleCambiarEstado(compra.id, 'cancelada')}
                    >
                      ❌ Cancelar
                    </button>
                  </>
                )}
                {compra.estado === 'recibida' && (
                  <button 
                    className="btn-warning btn-small"
                    onClick={() => handleCambiarEstado(compra.id, 'facturada')}
                  >
                    � Facturar
                  </button>
                )}
                {compra.estado === 'facturada' && (
                  <button 
                    className="btn-primary btn-small"
                    onClick={() => handleCambiarEstado(compra.id, 'pagada')}
                  >
                    💰 Marcar Pagada
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Modal de estadísticas del proveedor
  const renderModalEstadisticas = () => (
    mostrarEstadisticas && proveedorSeleccionado && (
      <div className="modal-overlay">
        <div className="modal-content estadisticas-modal">
          <div className="modal-header">
            <h2>📊 Estadísticas - {proveedorSeleccionado.razon_social}</h2>
            <button 
              onClick={() => setMostrarEstadisticas(false)}
              className="close-button"
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            {estadisticasProveedor ? (
              <div className="estadisticas-detalle">
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total de Compras:</span>
                    <span className="stat-value">{estadisticasProveedor.totalCompras || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Monto Total:</span>
                    <span className="stat-value">
                      ${(estadisticasProveedor.montoTotal || 0).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Última Compra:</span>
                    <span className="stat-value">
                      {estadisticasProveedor.ultimaCompra 
                        ? new Date(estadisticasProveedor.ultimaCompra).toLocaleDateString('es-AR')
                        : 'Ninguna'
                      }
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Promedio por Compra:</span>
                    <span className="stat-value">
                      ${(estadisticasProveedor.promedioCompra || 0).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Cargando estadísticas...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  )

  // Modal de detalles de compra COMPLETO con todos los campos
  const renderModalDetalleCompra = () => (
    mostrarDetalleCompra && compraSeleccionada && (
      <div className="modal-overlay">
        <div className="modal-content compra-detalle-modal">
          <div className="modal-header">
            <h2>📦 Detalles Completos de Compra #{compraSeleccionada.id}</h2>
            <button 
              onClick={() => setMostrarDetalleCompra(false)}
              className="close-button"
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="compra-detalle-content">
              
              {/* INFORMACIÓN GENERAL */}
              <div className="detalle-section">
                <h3>📋 Información General</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">ID Compra:</span>
                    <span className="detalle-value">{compraSeleccionada.id}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Estado:</span>
                    <span className={`status-badge status-${compraSeleccionada.estado}`}>
                      {compraSeleccionada.estado}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Fecha de Compra:</span>
                    <span className="detalle-value">
                      {new Date(compraSeleccionada.fecha_compra).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Fecha de Vencimiento:</span>
                    <span className="detalle-value">
                      {compraSeleccionada.fecha_vencimiento 
                        ? new Date(compraSeleccionada.fecha_vencimiento).toLocaleDateString('es-AR')
                        : 'No especificada'
                      }
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Número de Factura:</span>
                    <span className="detalle-value">{compraSeleccionada.numero_factura || 'No asignado'}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Número de Remito:</span>
                    <span className="detalle-value">{compraSeleccionada.numero_remito || 'No asignado'}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Método de Pago:</span>
                    <span className="detalle-value">{compraSeleccionada.metodo_pago || 'No especificado'}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Fecha de Creación:</span>
                    <span className="detalle-value">
                      {new Date(compraSeleccionada.fecha_creacion).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Última Actualización:</span>
                    <span className="detalle-value">
                      {new Date(compraSeleccionada.fecha_actualizacion).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN DEL PROVEEDOR */}
              {compraSeleccionada.proveedor && (
                <div className="detalle-section">
                  <h3>🏪 Información del Proveedor</h3>
                  <div className="detalle-grid">
                    <div className="detalle-item">
                      <span className="detalle-label">ID Proveedor:</span>
                      <span className="detalle-value">{compraSeleccionada.proveedor.id}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Nombre/Razón Social:</span>
                      <span className="detalle-value">
                        {compraSeleccionada.proveedor.razon_social || compraSeleccionada.proveedor.nombre}
                      </span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">CUIT:</span>
                      <span className="detalle-value">{compraSeleccionada.proveedor.cuit}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Teléfono:</span>
                      <span className="detalle-value">{compraSeleccionada.proveedor.telefono}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Email:</span>
                      <span className="detalle-value">{compraSeleccionada.proveedor.email}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Dirección:</span>
                      <span className="detalle-value">{compraSeleccionada.proveedor.direccion}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Contacto:</span>
                      <span className="detalle-value">
                        {compraSeleccionada.proveedor.contacto_nombre} 
                        {compraSeleccionada.proveedor.contacto_telefono && 
                          ` - ${compraSeleccionada.proveedor.contacto_telefono}`
                        }
                      </span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Condiciones de Pago:</span>
                      <span className="detalle-value">{compraSeleccionada.proveedor.condiciones_pago}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* INFORMACIÓN DEL USUARIO */}
              {/* {compraSeleccionada.usuario && (
                <div className="detalle-section">
                  <h3>👤 Usuario que Registró la Compra</h3>
                  <div className="detalle-grid">
                    <div className="detalle-item">
                      <span className="detalle-label">ID Usuario:</span>
                      <span className="detalle-value">{compraSeleccionada.usuario.id}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Nombre:</span>
                      <span className="detalle-value">{compraSeleccionada.usuario.nombre}</span>
                    </div>
                  </div>
                </div>
              )} */}

              {/* TOTALES Y CÁLCULOS */}
              <div className="detalle-section">
                <h3>💰 Resumen Financiero</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">Subtotal:</span>
                    <span className="detalle-value">${(compraSeleccionada.subtotal || 0).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Descuento:</span>
                    <span className="detalle-value">${(compraSeleccionada.descuento || 0).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Impuestos:</span>
                    <span className="detalle-value">${(compraSeleccionada.impuestos || 0).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Total Final:</span>
                    <span className="detalle-value detalle-total">
                      ${(compraSeleccionada.total || 0).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* PRODUCTOS DETALLADOS */}
              {compraSeleccionada.detalles && compraSeleccionada.detalles.length > 0 && (
                <div className="detalle-section">
                  <h3>📦 Productos Comprados</h3>
                  <div className="productos-table">
                    <div className="table-header">
                      <span>ID Detalle</span>
                      <span>Producto</span>
                      <span>Código</span>
                      <span>Unidad</span>
                      <span>Cantidad</span>
                      <span>Precio Unit.</span>
                      <span>Descuento Item</span>
                      <span>Subtotal</span>
                    </div>
                    {compraSeleccionada.detalles.map((detalle) => (
                      <div key={detalle.id} className="table-row">
                        <span>{detalle.id}</span>
                        <span>{detalle.producto?.nombre || 'Producto eliminado'}</span>
                        <span>{detalle.producto?.codigo_producto || 'N/A'}</span>
                        <span>{detalle.producto?.unidad_medida || 'N/A'}</span>
                        <span>{detalle.cantidad}</span>
                        <span>${(detalle.precio_unitario || 0).toLocaleString('es-AR')}</span>
                        <span>${(detalle.descuento_item || 0).toLocaleString('es-AR')}</span>
                        <span>${(detalle.subtotal || 0).toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REGISTRO DE CAJA */}
              {compraSeleccionada.registro_caja && (
                <div className="detalle-section">
                  <h3>💳 Registro de Caja</h3>
                  <div className="detalle-grid">
                    <div className="detalle-item">
                      <span className="detalle-label">ID Registro:</span>
                      <span className="detalle-value">{compraSeleccionada.registro_caja.id}</span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Monto:</span>
                      <span className="detalle-value">
                        ${(compraSeleccionada.registro_caja.monto || 0).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Fecha de Registro:</span>
                      <span className="detalle-value">
                        {new Date(compraSeleccionada.registro_caja.fecha).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <div className="detalle-item">
                      <span className="detalle-label">Estado del Registro:</span>
                      <span className={`status-badge status-${compraSeleccionada.registro_caja.estado}`}>
                        {compraSeleccionada.registro_caja.estado}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* OBSERVACIONES */}
              {compraSeleccionada.observaciones && (
                <div className="detalle-section">
                  <h3>📝 Observaciones</h3>
                  <p className="observaciones-text">{compraSeleccionada.observaciones}</p>
                </div>
              )}

              {/* INFORMACIÓN ADICIONAL */}
              {/* <div className="detalle-section">
                <h3>🏢 Información Adicional</h3>
                <div className="detalle-grid">
                  <div className="detalle-item">
                    <span className="detalle-label">ID Sucursal:</span>
                    <span className="detalle-value">{compraSeleccionada.sucursal_id}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">ID Usuario:</span>
                    <span className="detalle-value">{compraSeleccionada.usuario_id}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">ID Proveedor:</span>
                    <span className="detalle-value">{compraSeleccionada.proveedor_id}</span>
                  </div>
                </div>
              </div> */}

              {/* Solo mostrar acciones si hay botones disponibles */}
              {(compraSeleccionada.estado === 'pendiente' || 
                compraSeleccionada.estado === 'recibida' || 
                compraSeleccionada.estado === 'facturada') && (
                <div className="detalle-section">
                  <h3>🔄 Acciones</h3>
                  <div className="acciones-buttons">
                    {compraSeleccionada.estado === 'pendiente' && (
                      <>
                        <button 
                          className="btn-success"
                          onClick={() => {
                            setMostrarDetalleCompra(false)
                            handleCambiarEstado(compraSeleccionada.id, 'recibida')
                          }}
                        >
                          📦 Marcar como Recibida
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => {
                            setMostrarDetalleCompra(false)
                            handleCambiarEstado(compraSeleccionada.id, 'cancelada')
                          }}
                        >
                          ❌ Cancelar Compra
                        </button>
                      </>
                    )}
                    {compraSeleccionada.estado === 'recibida' && (
                      <button 
                        className="btn-warning"
                        onClick={() => {
                          setMostrarDetalleCompra(false)
                          handleCambiarEstado(compraSeleccionada.id, 'facturada')
                        }}
                      >
                        📄 Marcar como Facturada
                      </button>
                    )}
                    {compraSeleccionada.estado === 'facturada' && (
                      <button 
                        className="btn-primary"
                        onClick={() => {
                          setMostrarDetalleCompra(false)
                          handleCambiarEstado(compraSeleccionada.id, 'pagada')
                        }}
                      >
                        💰 Marcar como Pagada
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  )

  return (
    <div className="compras-page">
      <div className="page-header">
        <h1>🏭 Módulo de Compras</h1>
        <p>Gestión integral de proveedores y órdenes de compra</p>
        <SucursalBadge />
      </div>



      {/* Estadísticas Generales */}
      {renderEstadisticasGenerales()}

      {/* Navegación entre secciones */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${vistaActiva === 'proveedores' ? 'active' : ''}`}
          onClick={() => setVistaActiva('proveedores')}
        >
          👥 Proveedores
        </button>
        <button 
          className={`nav-tab ${vistaActiva === 'compras' ? 'active' : ''}`}
          onClick={() => setVistaActiva('compras')}
        >
          🛒 Órdenes de Compra
        </button>
      </div>

      {/* Contenido principal */}
      <div className="compras-content">
        {vistaActiva === 'proveedores' && renderProveedores()}
        {vistaActiva === 'compras' && renderCompras()}
      </div>

      {/* Modales */}
      {mostrarFormularioProveedor && (
        <ProveedorForm
          onClose={() => setMostrarFormularioProveedor(false)}
          onSuccess={handleProveedorSuccess}
          proveedorEditar={proveedorEditar}
        />
      )}

      {mostrarFormularioCompra && (
        <CompraForm
          onClose={() => setMostrarFormularioCompra(false)}
          onSuccess={handleCompraSuccess}
        />
      )}

      {renderModalEstadisticas()}
      {renderModalDetalleCompra()}
    </div>
  )
}

export default Compras