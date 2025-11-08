import api from './api'

const stockSucursalService = {
  // Obtener stock de productos en sucursal específica
  obtenerStockSucursal: async (params = {}) => {
    try {
      const response = await api.get('/stock-sucursal', { params })
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al obtener stock de sucursal'
    }
  },

  // Obtener resumen global de stock (Solo Admin)
  obtenerResumenGlobal: async (params = {}) => {
    try {
      const response = await api.get('/stock-sucursal/resumen-global', { params })
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al obtener resumen global'
    }
  },

  // Crear nuevo stock de producto en sucursal
  crearStockSucursal: async (stockData) => {
    try {
      const response = await api.post('/stock-sucursal', stockData)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al crear stock'
    }
  },

  // Actualizar stock de producto en sucursal
  actualizarStockSucursal: async (stockData) => {
    try {
      const response = await api.put('/stock-sucursal', stockData)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al actualizar stock'
    }
  },

  // Obtener historial de movimientos de producto en sucursal
  obtenerHistorialProducto: async (productoId, params = {}) => {
    try {
      const response = await api.get(`/stock-sucursal/producto/${productoId}/historial`, { params })
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al obtener historial'
    }
  }
}

export default stockSucursalService