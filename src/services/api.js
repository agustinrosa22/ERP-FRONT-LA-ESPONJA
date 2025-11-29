import axios from 'axios'

// Configuración base de Axios
const API_URL = import.meta.env.VITE_API_URL || 'https://erp.redbyraices.com/api'

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

    // Enviar sucursal ID según el rol del usuario
    const usuarioRol = localStorage.getItem('usuarioRol')
    const selectedSucursalId = localStorage.getItem('selectedSucursalId') // Para admin: sucursal seleccionada
    const usuarioSucursalId = localStorage.getItem('usuarioSucursalId')   // Para no-admin: su sucursal propia
    
    if (usuarioRol === 'admin' && selectedSucursalId) {
      // Admin con sucursal seleccionada
      config.headers['X-Sucursal-Id'] = selectedSucursalId
    } else if (usuarioRol !== 'admin' && usuarioSucursalId) {
      // Usuario no-admin usa su propia sucursal
      config.headers['X-Sucursal-Id'] = usuarioSucursalId
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
      localStorage.removeItem('usuario')
      localStorage.removeItem('usuarioRol')
      localStorage.removeItem('usuarioSucursalId')
      localStorage.removeItem('selectedSucursalId')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api