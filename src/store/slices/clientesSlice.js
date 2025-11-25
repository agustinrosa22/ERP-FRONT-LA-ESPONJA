import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import clienteService from '../../services/clienteService'

// Thunks para operaciones de clientes
export const obtenerTodosClientes = createAsyncThunk(
  'clientes/obtenerTodos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clienteService.obtenerTodos()
      if (response.data.success) {
        return response.data.data // Retorna { clientes: [...], pagination: {...} }
      } else {
        return rejectWithValue(response.data.message)
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener clientes')
    }
  }
)

export const obtenerClientePorId = createAsyncThunk(
  'clientes/obtenerPorId',
  async (id, { rejectWithValue }) => {
    try {
      const response = await clienteService.obtenerPorId(id)
      if (response.data.success) {
        return response.data.data
      } else {
        return rejectWithValue(response.data.message)
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener cliente')
    }
  }
)

export const buscarClientePorDocumento = createAsyncThunk(
  'clientes/buscarPorDocumento',
  async (documento, { rejectWithValue }) => {
    try {
      const response = await clienteService.buscarPorDocumento(documento)
      if (response.data.success) {
        return response.data.data
      } else {
        return rejectWithValue(response.data.message || 'Cliente no encontrado')
      }
    } catch (error) {
      // Si el error es 404 (no encontrado), no es realmente un error
      if (error.response?.status === 404) {
        return rejectWithValue('No se encontró ningún cliente con ese documento')
      }
      return rejectWithValue(error.response?.data?.message || 'Error al buscar cliente')
    }
  }
)

export const obtenerEstadisticasCliente = createAsyncThunk(
  'clientes/obtenerEstadisticas',
  async ({ id, params = {} }, { rejectWithValue }) => {
    try {
      const response = await clienteService.obtenerEstadisticas(id, params)
      if (response.data.success) {
        return { id, estadisticas: response.data.data }
      } else {
        return rejectWithValue(response.data.message)
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener estadísticas')
    }
  }
)

export const obtenerTransaccionesCliente = createAsyncThunk(
  'clientes/obtenerTransacciones',
  async ({ id, params = {} }, { rejectWithValue }) => {
    try {
      const response = await clienteService.obtenerTransacciones(id, params)
      if (response.data.success) {
        return { id, transacciones: response.data.data }
      } else {
        return rejectWithValue(response.data.message)
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener transacciones')
    }
  }
)

export const crearCliente = createAsyncThunk(
  'clientes/crear',
  async (clienteData, { rejectWithValue }) => {
    try {
      const response = await clienteService.crear(clienteData)
      if (response.data.success) {
        return response.data.data
      } else {
        return rejectWithValue(response.data.message)
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear cliente')
    }
  }
)

export const actualizarCliente = createAsyncThunk(
  'clientes/actualizar',
  async ({ id, clienteData }, { rejectWithValue }) => {
    try {
      const response = await clienteService.actualizar(id, clienteData)
      if (response.data.success) {
        return response.data.data
      } else {
        return rejectWithValue(response.data.message)
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar cliente')
    }
  }
)

const initialState = {
  clientes: [],
  clienteSeleccionado: null,
  estadisticas: {},
  transacciones: {},
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  },
  loading: false,
  loadingEstadisticas: false,
  loadingTransacciones: false,
  error: null,
  searchResults: []
}

const clientesSlice = createSlice({
  name: 'clientes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setClienteSeleccionado: (state, action) => {
      state.clienteSeleccionado = action.payload
    },
    clearClienteSeleccionado: (state) => {
      state.clienteSeleccionado = null
    },
    clearSearchResults: (state) => {
      state.searchResults = []
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Obtener todos los clientes
      .addCase(obtenerTodosClientes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(obtenerTodosClientes.fulfilled, (state, action) => {
        state.loading = false
        state.clientes = action.payload.clientes || []
        state.pagination = action.payload.pagination || state.pagination
      })
      .addCase(obtenerTodosClientes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Obtener cliente por ID
      .addCase(obtenerClientePorId.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(obtenerClientePorId.fulfilled, (state, action) => {
        state.loading = false
        state.clienteSeleccionado = action.payload
      })
      .addCase(obtenerClientePorId.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Buscar cliente por documento
      .addCase(buscarClientePorDocumento.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(buscarClientePorDocumento.fulfilled, (state, action) => {
        state.loading = false
        state.searchResults = Array.isArray(action.payload) ? action.payload : [action.payload]
      })
      .addCase(buscarClientePorDocumento.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.searchResults = []
      })
      
      // Obtener estadísticas del cliente
      .addCase(obtenerEstadisticasCliente.pending, (state) => {
        state.loadingEstadisticas = true
      })
      .addCase(obtenerEstadisticasCliente.fulfilled, (state, action) => {
        state.loadingEstadisticas = false
        state.estadisticas[action.payload.id] = action.payload.estadisticas
      })
      .addCase(obtenerEstadisticasCliente.rejected, (state, action) => {
        state.loadingEstadisticas = false
        state.error = action.payload
      })
      
      // Obtener transacciones del cliente
      .addCase(obtenerTransaccionesCliente.pending, (state) => {
        state.loadingTransacciones = true
      })
      .addCase(obtenerTransaccionesCliente.fulfilled, (state, action) => {
        state.loadingTransacciones = false
        state.transacciones[action.payload.id] = action.payload.transacciones
      })
      .addCase(obtenerTransaccionesCliente.rejected, (state, action) => {
        state.loadingTransacciones = false
        state.error = action.payload
      })
      
      // Crear cliente
      .addCase(crearCliente.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(crearCliente.fulfilled, (state, action) => {
        state.loading = false
        state.clientes.push(action.payload)
      })
      .addCase(crearCliente.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Actualizar cliente
      .addCase(actualizarCliente.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(actualizarCliente.fulfilled, (state, action) => {
        state.loading = false
        const index = state.clientes.findIndex(cliente => cliente.id === action.payload.id)
        if (index !== -1) {
          state.clientes[index] = action.payload
        }
        if (state.clienteSeleccionado?.id === action.payload.id) {
          state.clienteSeleccionado = action.payload
        }
      })
      .addCase(actualizarCliente.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { 
  clearError, 
  setClienteSeleccionado, 
  clearClienteSeleccionado,
  clearSearchResults,
  setSearchResults 
} = clientesSlice.actions

export default clientesSlice.reducer