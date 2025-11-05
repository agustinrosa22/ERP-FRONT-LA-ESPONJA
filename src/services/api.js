import axios from 'axios'

// Configuración base de Axios
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos de timeout
})

// Interceptor para agregar token de autenticación y cabecera de sucursal (si corresponde)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Si el Admin seleccionó una sucursal, la enviamos (solo si el rol es admin)
    const usuarioRol = localStorage.getItem('usuarioRol')
    const selectedSucursalId = localStorage.getItem('selectedSucursalId')
    if (usuarioRol === 'admin' && selectedSucursalId) {
      config.headers['X-Sucursal-Id'] = selectedSucursalId
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Limpiar selección de sucursal al expirar sesión
      localStorage.removeItem('selectedSucursalId')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api