import api from './api'

// Servicio para gestión de caja y contabilidad
const contabilidadService = {
  // Obtener todos los movimientos de caja
  obtenerMovimientos: async (filtros = {}) => {
    try {
      const params = new URLSearchParams()
      
      // Validar y limpiar filtros antes de enviar
      if (filtros.tipo && ['ingreso', 'egreso'].includes(filtros.tipo)) {
        params.append('tipo', filtros.tipo)
      }
      if (filtros.categoria && ['venta', 'compra', 'gasto_operativo', 'gasto_administrativo', 'inversion', 'otro'].includes(filtros.categoria)) {
        params.append('categoria', filtros.categoria)
      }
      if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde)
      if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta)
      if (filtros.metodo_pago && ['efectivo', 'tarjeta', 'transferencia', 'cheque'].includes(filtros.metodo_pago)) {
        params.append('metodo_pago', filtros.metodo_pago)
      }
      if (filtros.limite) params.append('limit', filtros.limite)
      if (filtros.offset) params.append('page', Math.floor(filtros.offset / (filtros.limite || 10)) + 1)

      console.log('Consultando movimientos con filtros:', filtros)
      console.log('URL generada:', `/caja?${params.toString()}`)

      const response = await api.get(`/caja?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error en obtenerMovimientos:', error)
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 500) {
        console.warn('Error 500 - probablemente filtro inválido, devolviendo lista vacía')
        return {
          success: true,
          data: {
            movimientos: [],
            pagination: { total: 0, totalPages: 0 }
          }
        }
      }
      
      if (error.response?.status === 404) {
        console.warn('No se encontraron movimientos con estos filtros')
        return {
          success: true,
          data: {
            movimientos: [],
            pagination: { total: 0, totalPages: 0 }
          }
        }
      }
      
      throw new Error(error.response?.data?.mensaje || error.response?.data?.message || 'Error al obtener movimientos de caja')
    }
  },

  // Obtener movimiento específico por ID
  obtenerMovimiento: async (id) => {
    try {
      const response = await api.get(`/caja/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || error.response?.data?.message || 'Error al obtener el movimiento')
    }
  },

  // Crear nuevo movimiento de caja
  crearMovimiento: async (movimientoData) => {
    try {
      const response = await api.post('/caja', movimientoData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || error.response?.data?.message || 'Error al crear movimiento de caja')
    }
  },

  // Obtener balance de caja
  obtenerBalance: async (fechaDesde, fechaHasta) => {
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.append('fechaDesde', fechaDesde)
      if (fechaHasta) params.append('fechaHasta', fechaHasta)

      const response = await api.get(`/caja/balance?${params.toString()}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || error.response?.data?.message || 'Error al obtener balance')
    }
  },

  // Obtener estadísticas de caja
  obtenerEstadisticas: async (periodo = 'mes') => {
    try {
      const response = await api.get(`/caja/estadisticas?periodo=${periodo}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || error.response?.data?.message || 'Error al obtener estadísticas')
    }
  },

  // Obtener resumen de ingresos y egresos
  obtenerResumen: async (fechaDesde, fechaHasta) => {
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.append('fechaDesde', fechaDesde)
      if (fechaHasta) params.append('fechaHasta', fechaHasta)

      const response = await api.get(`/caja/resumen?${params.toString()}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || error.response?.data?.message || 'Error al obtener resumen')
    }
  },

  // Actualizar movimiento de caja
  actualizarMovimiento: async (id, movimientoData) => {
    try {
      const response = await api.put(`/caja/${id}`, movimientoData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || error.response?.data?.message || 'Error al actualizar movimiento')
    }
  },

  // Eliminar movimiento de caja
  eliminarMovimiento: async (id) => {
    try {
      const response = await api.delete(`/caja/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || error.response?.data?.message || 'Error al eliminar movimiento')
    }
  }
}

export default contabilidadService