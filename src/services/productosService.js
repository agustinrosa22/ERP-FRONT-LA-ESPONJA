import api from './api'

const productosService = {
  // Obtener todos los productos (parametrizable según contrato multi-sucursal)
  // params soportados: page, limit, search, categoria, activo, incluir_stock_sucursal,
  // stock_bajo, global. Por defecto incluir_stock_sucursal=true.
  obtenerTodos: (params = {}) => {
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
    return api.get('/productos', { params: query })
  },

  // Obtener producto por ID
  obtenerPorId: (id) => {
    return api.get(`/productos/${id}`)
  },

  // Crear nuevo producto
  crear: (producto) => {
    return api.post('/productos', producto)
  },

  // Actualizar producto
  actualizar: (id, producto) => {
    return api.put(`/productos/${id}`, producto)
  },

  // Eliminar producto
  eliminar: (id) => {
    return api.delete(`/productos/${id}`)
  },

  // Buscar producto por código (ajustado a /productos/codigo/:codigo) con params opcionales (ej: global=true)
  buscarPorCodigo: (codigo, params = {}) => {
    return api.get(`/productos/codigo/${codigo}`, { params })
  },

  // Obtener productos con stock bajo
  obtenerStockBajo: () => {
    return api.get('/productos/stock-bajo')
  },

  // Buscar productos por término
  buscar: (termino) => {
    return api.get(`/productos/buscar?q=${termino}`)
  },

  // Obtener por categoría
  obtenerPorCategoria: (categoria) => {
    return api.get(`/productos/categoria/${categoria}`)
  },

  // Actualizar stock
  actualizarStock: (id, cantidad, tipo, motivo) => {
    return api.post(`/productos/${id}/stock`, {
      cantidad,
      tipo,
      motivo
    })
  },

  // Obtener historial de inventario
  obtenerHistorialInventario: (id) => {
    return api.get(`/inventario/producto/${id}`)
  }
}

export default productosService