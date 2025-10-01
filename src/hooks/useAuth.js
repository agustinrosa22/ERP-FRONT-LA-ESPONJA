import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCredentials, clearCredentials } from '../store/slices/authSlice'
import authService from '../services/authService'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { isAuthenticated, usuario, token, loading } = useSelector((state) => state.auth)

  useEffect(() => {
    const verificarTokenAlCargar = async () => {
      const tokenGuardado = localStorage.getItem('token')
      
      if (tokenGuardado && !isAuthenticated) {
        try {
          // Verificar si el token es válido
          const response = await authService.verificarToken()
          if (response.data.success) {
            dispatch(setCredentials({
              token: tokenGuardado,
              usuario: response.data.data.usuario
            }))
          } else {
            // Token inválido, limpiar
            dispatch(clearCredentials())
          }
        } catch (error) {
          // Token inválido o error de red
          dispatch(clearCredentials())
        }
      }
    }

    verificarTokenAlCargar()
  }, [dispatch, isAuthenticated])

  return {
    isAuthenticated,
    usuario,
    token,
    loading
  }
}

export default useAuth