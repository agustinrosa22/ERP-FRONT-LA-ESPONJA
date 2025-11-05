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
      
      // Si hay token pero no tenemos el objeto usuario en memoria, recuperar el perfil
      if (tokenGuardado && !usuario) {
        try {
          // Verificar si el token es válido y obtener usuario
          const response = await authService.verificarToken()
          if (response.data?.success && response.data?.data?.usuario) {
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
  }, [dispatch, usuario])

  return {
    isAuthenticated,
    usuario,
    token,
    loading
  }
}

export default useAuth