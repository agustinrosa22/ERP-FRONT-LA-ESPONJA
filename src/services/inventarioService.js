import api from './api'

const inventarioService = {
  // ========== PRODUCTOS ==========
  obtenerProductos: async (params = {}) => {
    // Por defecto incluir stock por sucursal; soporta global=true, search, etc.
    const {
      page,
      limit,
      search,
      categoria,
      activo,
      incluir_stock_sucursal = true,
      stock_bajo,
      global,
    } = params

    const query = {
      incluir_stock_sucursal,
      ...(page ? { page } : {}),
      ...(limit ? { limit } : {}),
      ...(search ? { search } : {}),
      ...(categoria ? { categoria } : {}),
      ...(typeof activo !== 'undefined' && activo !== null && activo !== '' && activo !== 'todos' ? { activo } : {}),
      ...(typeof stock_bajo !== 'undefined' ? { stock_bajo } : {}),
      ...(typeof global !== 'undefined' ? { global } : {}),
    }
    try {
      const response = await api.get('/productos', { params: query })
      return response
    } catch (error) {
      throw error
    }
  },

  obtenerProducto: async (id) => {
    return await api.get(`/productos/${id}`)
  },

  crearProducto: async (producto) => {
    return await api.post('/productos', producto)
  },

  actualizarProducto: async (id, producto) => {
    return await api.put(`/productos/${id}`, producto)
  },

  eliminarProducto: async (id) => {
    return await api.delete(`/productos/${id}`)
  },

  obtenerProductosStockBajo: async () => {
    return await api.get('/productos/stock-bajo')
  },

  // ========== MOVIMIENTOS DE INVENTARIO ==========
  obtenerMovimientos: async (filtros = {}) => {
    const params = new URLSearchParams()
    
    if (filtros.fechaInicio) params.append('fecha_inicio', filtros.fechaInicio)
    if (filtros.fechaFin) params.append('fecha_fin', filtros.fechaFin)
    if (filtros.tipo) params.append('tipo', filtros.tipo)
    if (filtros.producto_id) params.append('producto_id', filtros.producto_id)
    
    const queryString = params.toString()
    const url = queryString ? `/inventario?${queryString}` : '/inventario'
    
    try {
      const response = await api.get(url)
      return response
    } catch (error) {
      throw error
    }
  },

  obtenerMovimiento: async (id) => {
    return await api.get(`/inventario/${id}`)
  },

  crearMovimiento: async (movimiento) => {
    // Nuevo contrato: POST /inventario con producto_id incluido en el body
    const dataToSend = {
      producto_id: movimiento.producto_id,
      tipo: movimiento.tipo,
      cantidad: parseFloat(movimiento.cantidad),
      motivo: movimiento.motivo || 'Movimiento de inventario',
      precio_unitario: movimiento.precio_unitario ? parseFloat(movimiento.precio_unitario) : null,
      observaciones: movimiento.observaciones || null
    }
    try {
      const response = await api.post(`/inventario`, dataToSend)
      return response
    } catch (error) {
      throw error
    }
  },

  // ========== HISTORIAL POR PRODUCTO ==========
  obtenerHistorialProducto: async (productoId, filtros = {}) => {
    const params = new URLSearchParams()
    
    if (filtros.fechaInicio) params.append('fecha_inicio', filtros.fechaInicio)
    if (filtros.fechaFin) params.append('fecha_fin', filtros.fechaFin)
    if (filtros.tipo) params.append('tipo', filtros.tipo)
    
    const queryString = params.toString()
    const url = queryString 
      ? `/inventario/producto/${productoId}?${queryString}` 
      : `/inventario/producto/${productoId}`
    
    return await api.get(url)
  },

  // ========== ESTADÍSTICAS Y REPORTES ==========
  obtenerEstadisticasInventario: async () => {
    return await api.get('/inventario/estadisticas')
  },

  obtenerResumenStock: async () => {
    return await api.get('/productos/estadisticas/resumen')
  },

  obtenerProductosReposicion: async () => {
    return await api.get('/inventario/reposicion')
  },

  // ========== ALERTAS Y NOTIFICACIONES ==========
  obtenerAlertas: async () => {
    return await api.get('/inventario/alertas')
  },

  marcarAlertaComoVista: async (alertaId) => {
    return await api.put(`/inventario/alertas/${alertaId}/vista`)
  },

  // ========== UTILIDADES ==========
  obtenerCategorias: async () => {
    return await api.get('/productos/categorias/lista')
  },

  obtenerUnidadesMedida: async () => {
    return await api.get('/productos/unidades-medida')
  },

  // ========== VALIDACIONES ==========
  validarStock: async (productoId, cantidadSalida) => {
    return await api.post('/inventario/validar-stock', {
      producto_id: productoId,
      cantidad: cantidadSalida
    })
  }
}

export default inventarioService