import api from './api'

const inventarioService = {
  obtenerProductos: async () => {
    return await api.get('/inventario/productos')
  },

  obtenerProducto: async (id) => {
    return await api.get(`/inventario/productos/${id}`)
  },

  crearProducto: async (producto) => {
    return await api.post('/inventario/productos', producto)
  },

  actualizarProducto: async (id, producto) => {
    return await api.put(`/inventario/productos/${id}`, producto)
  },

  eliminarProducto: async (id) => {
    return await api.delete(`/inventario/productos/${id}`)
  },

  obtenerCategorias: async () => {
    return await api.get('/inventario/categorias')
  }
}

export default inventarioService