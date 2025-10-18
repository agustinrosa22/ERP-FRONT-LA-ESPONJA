import api from './api'

const inventarioService = {
  // ========== PRODUCTOS ==========
  obtenerProductos: async () => {
    console.log('📋 Obteniendo productos...')
    try {
      const response = await api.get('/productos')
      console.log('✅ Productos obtenidos:', response.data)
      console.log('🔍 Estructura de data:', response.data.data)
      
      // Verificar si tiene productos anidados
      if (response.data.data?.productos) {
        console.log('📦 Encontrado data.productos:', response.data.data.productos)
        console.log('📏 Longitud de productos:', response.data.data.productos.length)
      }
      
      return response
    } catch (error) {
      console.error('❌ Error al obtener productos:', error.response?.status, error.response?.data)
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
    console.log('🔍 Obteniendo movimientos con filtros:', filtros)
    
    const params = new URLSearchParams()
    
    if (filtros.fechaInicio) params.append('fecha_inicio', filtros.fechaInicio)
    if (filtros.fechaFin) params.append('fecha_fin', filtros.fechaFin)
    if (filtros.tipo) params.append('tipo', filtros.tipo)
    if (filtros.producto_id) params.append('producto_id', filtros.producto_id)
    
    const queryString = params.toString()
    const url = queryString ? `/inventario?${queryString}` : '/inventario'
    
    console.log('📡 URL final:', url)
    
    try {
      const response = await api.get(url)
      console.log('✅ Movimientos obtenidos:', response.data)
      console.log('🔍 Estructura de data:', response.data.data)
      console.log('🔢 Tipo de data:', typeof response.data.data, Array.isArray(response.data.data))
      
      // Verificar si tiene productos anidados
      if (response.data.data?.productos) {
        console.log('📦 Encontrado data.productos:', response.data.data.productos)
        console.log('📏 Longitud de productos:', response.data.data.productos.length)
      }
      
      // Verificar si tiene movimientos anidados (estructura confirmada del backend)
      if (response.data.data?.movimientos) {
        console.log('🔄 Encontrado data.movimientos:', response.data.data.movimientos)
        console.log('📏 Longitud de movimientos:', response.data.data.movimientos.length)
        console.log('📄 Paginación:', response.data.data.pagination)
      }
      
      return response
    } catch (error) {
      console.error('❌ Error al obtener movimientos:', error.response?.status, error.response?.data)
      throw error
    }
  },

  obtenerMovimiento: async (id) => {
    return await api.get(`/inventario/${id}`)
  },

  crearMovimiento: async (movimiento) => {
    console.log('📦 Creando movimiento:', movimiento)
    
    const dataToSend = {
      tipo: movimiento.tipo,
      cantidad: parseInt(movimiento.cantidad),
      motivo: movimiento.motivo || 'Movimiento de inventario',
      precio_unitario: movimiento.precio_unitario ? parseFloat(movimiento.precio_unitario) : null,
      observaciones: movimiento.observaciones || null
    }
    
    console.log('📤 Datos a enviar:', dataToSend)
    console.log('🎯 Endpoint:', `/productos/${movimiento.producto_id}/ajustar-stock`)
    
    try {
      const response = await api.post(`/productos/${movimiento.producto_id}/ajustar-stock`, dataToSend)
      console.log('✅ Respuesta del ajuste de stock:', response.data)
      return response
    } catch (error) {
      console.error('❌ Error al ajustar stock:', error.response?.status, error.response?.data)
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