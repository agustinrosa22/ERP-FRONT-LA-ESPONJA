import api from './api'

const usuariosService = {
  listar: async () => api.get('/usuarios'),
  crear: async (payload) => api.post('/usuarios', payload),
  actualizar: async (id, payload) => api.put(`/usuarios/${id}`, payload),
  eliminar: async (id) => api.delete(`/usuarios/${id}`)
}

export default usuariosService
