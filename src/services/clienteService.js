import api from './api'

const clienteService = {
  // Obtener todos los clientes
  obtenerTodos: async () => {
    return await api.get('/clientes')
  },

  // Obtener cliente por ID
  obtenerPorId: async (id) => {
    return await api.get(`/clientes/${id}`)
  },

  // Buscar cliente por documento
  buscarPorDocumento: async (documento) => {
    return await api.get(`/clientes/documento/${documento}`)
  },

  // Obtener estadísticas del cliente
  obtenerEstadisticas: async (id, params = {}) => {
    return await api.get(`/clientes/${id}/estadisticas`, { params })
  },

  // Obtener transacciones del cliente
  obtenerTransacciones: async (id, params = {}) => {
    return await api.get(`/clientes/${id}/transacciones`, { params })
  },

  // Crear nuevo cliente
  crear: async (clienteData) => {
    return await api.post('/clientes', clienteData)
  },

  // Actualizar cliente
  actualizar: async (id, clienteData) => {
    return await api.put(`/clientes/${id}`, clienteData)
  }
}

export default clienteService