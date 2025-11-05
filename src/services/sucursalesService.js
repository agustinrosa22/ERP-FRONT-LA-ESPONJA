import api from './api'

const sucursalesService = {
  listar: async () => {
    return await api.get('/sucursales')
  },
  crear: async (payload) => {
    return await api.post('/sucursales', payload)
  },
  actualizar: async (id, payload) => {
    return await api.put(`/sucursales/${id}`, payload)
  },
  eliminar: async (id) => {
    return await api.delete(`/sucursales/${id}`)
  }
}

export default sucursalesService
