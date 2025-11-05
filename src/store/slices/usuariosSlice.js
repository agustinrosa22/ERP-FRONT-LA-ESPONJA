import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import usuariosService from '../../services/usuariosService'

export const fetchUsuarios = createAsyncThunk('usuarios/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await usuariosService.listar()
    return data.data || data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error al cargar usuarios')
  }
})

export const crearUsuario = createAsyncThunk('usuarios/crear', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await usuariosService.crear(payload)
    return data.data || data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error al crear usuario')
  }
})

export const actualizarUsuario = createAsyncThunk('usuarios/actualizar', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await usuariosService.actualizar(id, payload)
    return data.data || data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error al actualizar usuario')
  }
})

export const eliminarUsuario = createAsyncThunk('usuarios/eliminar', async (id, { rejectWithValue }) => {
  try {
    await usuariosService.eliminar(id)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Error al eliminar usuario')
  }
})

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const usuariosSlice = createSlice({
  name: 'usuarios',
  initialState,
  reducers: {
    clearUsuariosError: (state) => { state.error = null }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsuarios.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchUsuarios.fulfilled, (state, action) => { state.loading = false; state.items = action.payload })
      .addCase(fetchUsuarios.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(crearUsuario.fulfilled, (state, action) => { if (action.payload) state.items = [action.payload, ...state.items] })
      .addCase(actualizarUsuario.fulfilled, (state, action) => { state.items = state.items.map(u => String(u.id) === String(action.payload.id) ? action.payload : u) })
      .addCase(eliminarUsuario.fulfilled, (state, action) => { state.items = state.items.filter(u => String(u.id) !== String(action.payload)) })
  }
})

export const { clearUsuariosError } = usuariosSlice.actions
export default usuariosSlice.reducer
