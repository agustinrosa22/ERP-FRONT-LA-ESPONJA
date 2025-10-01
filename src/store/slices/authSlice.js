import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/authService'

// Thunk para login
export const loginUsuario = createAsyncThunk(
  'auth/login',
  async (credenciales, { rejectWithValue }) => {
    try {
      const response = await authService.login(credenciales)
      // El endpoint responde con { success, message, data: { token, usuario } }
      if (response.data.success) {
        return response.data.data // Retornamos solo { token, usuario }
      } else {
        return rejectWithValue(response.data.message)
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al iniciar sesión')
    }
  }
)

// Thunk para logout
export const logoutUsuario = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      return true
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  usuario: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'), // Verificar si existe token
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action) => {
      const { usuario, token } = action.payload
      state.usuario = usuario
      state.token = token
      state.isAuthenticated = true
      localStorage.setItem('token', token)
    },
    clearCredentials: (state) => {
      state.usuario = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUsuario.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUsuario.fulfilled, (state, action) => {
        state.loading = false
        state.usuario = action.payload.usuario
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(loginUsuario.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Error al iniciar sesión'
      })
      // Logout
      .addCase(logoutUsuario.fulfilled, (state) => {
        state.usuario = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem('token')
      })
  }
})

export const { clearError, setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer