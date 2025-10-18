import api from './api'

// Servicio completo para gestión de proveedores
const proveedorService = {
  // Obtener todos los proveedores con filtros y paginación
  obtenerProveedores: async (filtros = {}) => {
    try {
      const response = await api.get('/proveedores', { params: filtros })
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar proveedores'
    }
  },

  // Obtener proveedor por ID con historial de compras
  obtenerProveedorPorId: async (id) => {
    try {
      const response = await api.get(`/proveedores/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar proveedor'
    }
  },

  // Buscar proveedor por CUIT único
  buscarPorCuit: async (cuit) => {
    try {
      const response = await api.get(`/proveedores/cuit/${cuit}`)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al buscar proveedor'
    }
  },

  // Crear nuevo proveedor
  crearProveedor: async (proveedorData) => {
    try {
      const response = await api.post('/proveedores', proveedorData)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al crear proveedor'
    }
  },

  // Actualizar proveedor existente
  actualizarProveedor: async (id, proveedorData) => {
    try {
      const response = await api.put(`/proveedores/${id}`, proveedorData)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al actualizar proveedor'
    }
  },

  // Obtener estadísticas completas del proveedor
  obtenerEstadisticas: async (id) => {
    try {
      const response = await api.get(`/proveedores/${id}/estadisticas`)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al obtener estadísticas'
    }
  },

  // Activar/Desactivar proveedor (usando PUT estándar)
  cambiarEstado: async (id, proveedorData) => {
    try {
      const response = await api.put(`/proveedores/${id}`, proveedorData)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al cambiar estado'
    }
  }
}

export default proveedorService