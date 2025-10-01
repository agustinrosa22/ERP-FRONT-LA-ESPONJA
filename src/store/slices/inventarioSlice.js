import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import inventarioService from '../../services/inventarioService'

// Thunks para operaciones de inventario
export const obtenerProductos = createAsyncThunk(
  'inventario/obtenerProductos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventarioService.obtenerProductos()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const crearProducto = createAsyncThunk(
  'inventario/crearProducto',
  async (producto, { rejectWithValue }) => {
    try {
      const response = await inventarioService.crearProducto(producto)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const actualizarProducto = createAsyncThunk(
  'inventario/actualizarProducto',
  async ({ id, producto }, { rejectWithValue }) => {
    try {
      const response = await inventarioService.actualizarProducto(id, producto)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  productos: [],
  producto: null,
  loading: false,
  error: null
}

const inventarioSlice = createSlice({
  name: 'inventario',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setProducto: (state, action) => {
      state.producto = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Obtener productos
      .addCase(obtenerProductos.pending, (state) => {
        state.loading = true
      })
      .addCase(obtenerProductos.fulfilled, (state, action) => {
        state.loading = false
        state.productos = action.payload
      })
      .addCase(obtenerProductos.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message
      })
      // Crear producto
      .addCase(crearProducto.fulfilled, (state, action) => {
        state.productos.push(action.payload)
      })
      // Actualizar producto
      .addCase(actualizarProducto.fulfilled, (state, action) => {
        const index = state.productos.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.productos[index] = action.payload
        }
      })
  }
})

export const { clearError, setProducto } = inventarioSlice.actions
export default inventarioSlice.reducer