import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { verificarToken } from '../store/slices/authSlice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { isAuthenticated, usuario, token, loading } = useSelector((state) => state.auth)

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token')
    
    // Si hay token pero no tenemos el objeto usuario en memoria, verificar token
    if (tokenGuardado && !usuario) {
      console.log('🔄 Verificando token al cargar aplicación...')
      dispatch(verificarToken())
    }
  }, [dispatch, usuario])

  return {
    isAuthenticated,
    usuario,
    token,
    loading
  }
}

export default useAuth