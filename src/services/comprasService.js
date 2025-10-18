import api from './api'

// Servicio completo para gestión de compras según backend actualizado
const comprasService = {
  // Obtener todas las compras con filtros avanzados (proveedor, estado, fechas)
  obtenerCompras: async (filtros = {}) => {
    try {
      const response = await api.get('/compras', { params: filtros })
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar compras'
    }
  },

  // Obtener compra específica con todos los detalles y productos
  obtenerCompraPorId: async (id) => {
    try {
      const response = await api.get(`/compras/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar compra'
    }
  },

  // Crear nueva compra con actualización automática de stock y costos
  crearCompra: async (compraData) => {
    try {
      const response = await api.post('/compras', compraData)
      return response
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Error al crear compra'
    }
  },

  // Actualizar orden de compra
  actualizarCompra: async (id, compraData) => {
    try {
      const response = await api.put(`/compras/${id}`, compraData)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al actualizar compra'
    }
  },

  // Confirmar recepción de mercancía
  confirmarRecepcion: async (id, detallesRecepcion) => {
    try {
      const response = await api.put(`/compras/${id}/recibir`, detallesRecepcion)
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al confirmar recepción'
    }
  },

  // Cancelar orden de compra
  cancelarCompra: async (id, motivo) => {
    try {
      const response = await api.put(`/compras/${id}/cancelar`, { motivo })
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al cancelar compra'
    }
  },

  // Actualizar estado de compra (pendiente/recibida/pagada)
  cambiarEstadoCompra: async (id, nuevoEstado, observaciones = '') => {
    try {
      const response = await api.put(`/compras/${id}/estado`, { 
        estado: nuevoEstado,
        observaciones 
      })
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al cambiar estado'
    }
  },

  // Obtener estadísticas de compras y proveedores más utilizados
  obtenerEstadisticasCompras: async (filtros = {}) => {
    try {
      const response = await api.get('/compras/estadisticas/resumen', { 
        params: filtros 
      })
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar estadísticas'
    }
  },

  // Obtener compras por proveedor
  obtenerComprasPorProveedor: async (proveedorId, filtros = {}) => {
    try {
      const response = await api.get(`/compras/proveedor/${proveedorId}`, { 
        params: filtros 
      })
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al cargar compras del proveedor'
    }
  },

  // Generar orden de compra PDF
  generarOrdenCompraPDF: async (id) => {
    try {
      const response = await api.get(`/compras/${id}/pdf`, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      throw error.response?.data?.message || 'Error al generar PDF'
    }
  }
}

export default comprasService