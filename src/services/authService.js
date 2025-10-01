import api from './api'

const authService = {
  login: async (credenciales) => {
    return await api.post('/auth/login', credenciales)
  },

  logout: async () => {
    return await api.post('/auth/logout')
  },

  register: async (datosUsuario) => {
    return await api.post('/auth/register', datosUsuario)
  },

  obtenerPerfil: async () => {
    return await api.get('/auth/profile')
  },

  verificarToken: async () => {
    return await api.get('/auth/verify')
  }
}

export default authService