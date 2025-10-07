import api from './api'

const productosService = {
  // Obtener todos los productos
  obtenerTodos: () => {
    return api.get('/productos')
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

  // Buscar producto por código
  buscarPorCodigo: (codigo) => {
    return api.get(`/productos/buscar/${codigo}`)
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