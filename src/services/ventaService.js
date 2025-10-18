import api from './api'

// Servicio completo para gestión de ventas
const ventaService = {
  // Obtener todas las ventas con filtros y paginación
  obtenerVentas: async (filtros = {}) => {
    try {
      const response = await api.get('/ventas', { params: filtros })
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar ventas'
    }
  },

  // Obtener venta por ID con todos los detalles
  obtenerVentaPorId: async (id) => {
    try {
      const response = await api.get(`/ventas/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar venta'
    }
  },

  // Crear nueva venta
  crearVenta: async (ventaData) => {
    try {
      const response = await api.post('/ventas', ventaData)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al crear venta'
    }
  },

  // Cancelar venta
  cancelarVenta: async (id) => {
    try {
      const response = await api.put(`/ventas/${id}/cancelar`)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al cancelar venta'
    }
  },

  // Obtener estadísticas de ventas
  obtenerEstadisticas: async () => {
    try {
      const response = await api.get('/ventas/estadisticas/resumen')
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al obtener estadísticas'
    }
  }
}

export default ventaService