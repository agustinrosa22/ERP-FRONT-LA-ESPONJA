import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import proveedorService from '../../services/proveedorService'

// Estados iniciales
const initialState = {
  // Lista de proveedores
  proveedores: [],
  proveedorSeleccionado: null,
  
  // Paginación
  totalProveedores: 0,
  paginaActual: 1,
  totalPaginas: 1,
  
  // Filtros
  filtrosProveedores: {
    busqueda: '',
    estado: 'todos', // todos, activo, inactivo
    ordenarPor: 'nombre',
    orden: 'ASC',
    limite: 10,
    pagina: 1
  },
  
  // Estados de carga
  loading: false,
  loadingDetalle: false,
  loadingCrear: false,
  loadingActualizar: false,
  loadingEstadisticas: false,
  
  // Errores
  error: null,
  
  // Estadísticas del proveedor
  estadisticasProveedor: null
}

// Thunks asíncronos para las operaciones

// Obtener proveedores con filtros
export const obtenerProveedores = createAsyncThunk(
  'proveedores/obtenerProveedores',
  async (filtros = {}, { rejectWithValue }) => {
    try {
      const response = await proveedorService.obtenerProveedores(filtros)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// Obtener proveedor por ID
export const obtenerProveedorPorId = createAsyncThunk(
  'proveedores/obtenerProveedorPorId',
  async (id, { rejectWithValue }) => {
    try {
      const response = await proveedorService.obtenerProveedorPorId(id)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// Buscar proveedor por CUIT
export const buscarProveedorPorCuit = createAsyncThunk(
  'proveedores/buscarProveedorPorCuit',
  async (cuit, { rejectWithValue }) => {
    try {
      const response = await proveedorService.buscarPorCuit(cuit)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// Crear nuevo proveedor
export const crearProveedor = createAsyncThunk(
  'proveedores/crearProveedor',
  async (proveedorData, { rejectWithValue }) => {
    try {
      const response = await proveedorService.crearProveedor(proveedorData)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// Actualizar proveedor
export const actualizarProveedor = createAsyncThunk(
  'proveedores/actualizarProveedor',
  async ({ id, proveedorData }, { rejectWithValue }) => {
    try {
      const response = await proveedorService.actualizarProveedor(id, proveedorData)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// Obtener estadísticas del proveedor
export const obtenerEstadisticasProveedor = createAsyncThunk(
  'proveedores/obtenerEstadisticasProveedor',
  async (id, { rejectWithValue }) => {
    try {
      const response = await proveedorService.obtenerEstadisticasProveedor(id)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// Cambiar estado del proveedor
export const cambiarEstadoProveedor = createAsyncThunk(
  'proveedores/cambiarEstadoProveedor',
  async ({ id, proveedorData }, { rejectWithValue }) => {
    try {
      const response = await proveedorService.cambiarEstado(id, proveedorData)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// Slice de proveedores
const proveedoresSlice = createSlice({
  name: 'proveedores',
  initialState,
  reducers: {
    // Limpiar errores
    clearError: (state) => {
      state.error = null
    },
    
    // Establecer filtros
    setFiltrosProveedores: (state, action) => {
      state.filtrosProveedores = { ...state.filtrosProveedores, ...action.payload }
    },
    
    // Limpiar filtros
    clearFiltrosProveedores: (state) => {
      state.filtrosProveedores = initialState.filtrosProveedores
    },
    
    // Seleccionar proveedor
    seleccionarProveedor: (state, action) => {
      state.proveedorSeleccionado = action.payload
    },
    
    // Limpiar proveedor seleccionado
    clearProveedorSeleccionado: (state) => {
      state.proveedorSeleccionado = null
      state.estadisticasProveedor = null
    },
    
    // Limpiar estadísticas
    clearEstadisticasProveedor: (state) => {
      state.estadisticasProveedor = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Obtener proveedores
      .addCase(obtenerProveedores.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(obtenerProveedores.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload && action.payload.success) {
          // Filtrar elementos válidos para evitar undefined/null en el array
          const proveedoresRaw = action.payload.data?.proveedores || []
          state.proveedores = proveedoresRaw.filter(p => p && p.id)
          state.totalProveedores = action.payload.data?.pagination?.total || 0
          state.paginaActual = action.payload.data?.pagination?.page || 1
          state.totalPaginas = action.payload.data?.pagination?.totalPages || 1
        } else {
          // Si no hay success o payload, mantener array vacío
          state.proveedores = []
          state.totalProveedores = 0
          state.paginaActual = 1
          state.totalPaginas = 1
        }
      })
      .addCase(obtenerProveedores.rejected, (state, action) => {
        state.loading = false
        // En caso de error, asegurar que proveedores sea array vacío
        state.proveedores = []
        state.totalProveedores = 0
        state.error = action.payload
      })
      
      // Obtener proveedor por ID
      .addCase(obtenerProveedorPorId.pending, (state) => {
        state.loadingDetalle = true
        state.error = null
      })
      .addCase(obtenerProveedorPorId.fulfilled, (state, action) => {
        state.loadingDetalle = false
        if (action.payload?.success) {
          state.proveedorSeleccionado = action.payload?.data?.proveedor
        }
      })
      .addCase(obtenerProveedorPorId.rejected, (state, action) => {
        state.loadingDetalle = false
        state.error = action.payload
      })
      
      // Crear proveedor
      .addCase(crearProveedor.pending, (state) => {
        state.loadingCrear = true
        state.error = null
      })
      .addCase(crearProveedor.fulfilled, (state, action) => {
        state.loadingCrear = false
        // NO agregamos el proveedor localmente aquí
        // La lista se actualizará cuando el componente recargue con obtenerProveedores()
        // Esto evita inconsistencias entre el estado local y los filtros del servidor
      })
      .addCase(crearProveedor.rejected, (state, action) => {
        state.loadingCrear = false
        state.error = action.payload
      })
      
      // Actualizar proveedor
      .addCase(actualizarProveedor.pending, (state) => {
        state.loadingActualizar = true
        state.error = null
      })
      .addCase(actualizarProveedor.fulfilled, (state, action) => {
        state.loadingActualizar = false
        if (action.payload?.success && action.payload?.data?.proveedor) {
          const proveedorActualizado = action.payload.data.proveedor
          const index = state.proveedores.findIndex(p => p && p.id === proveedorActualizado.id)
          if (index !== -1) {
            state.proveedores[index] = proveedorActualizado
          }
          if (state.proveedorSeleccionado?.id === proveedorActualizado.id) {
            state.proveedorSeleccionado = proveedorActualizado
          }
        }
      })
      .addCase(actualizarProveedor.rejected, (state, action) => {
        state.loadingActualizar = false
        state.error = action.payload
      })
      
      // Obtener estadísticas del proveedor
      .addCase(obtenerEstadisticasProveedor.pending, (state) => {
        state.loadingEstadisticas = true
        state.error = null
      })
      .addCase(obtenerEstadisticasProveedor.fulfilled, (state, action) => {
        state.loadingEstadisticas = false
        if (action.payload?.success) {
          state.estadisticasProveedor = action.payload?.data?.estadisticas
        }
      })
      .addCase(obtenerEstadisticasProveedor.rejected, (state, action) => {
        state.loadingEstadisticas = false
        state.error = action.payload
      })
      
      // Cambiar estado del proveedor
      .addCase(cambiarEstadoProveedor.fulfilled, (state, action) => {
        if (action.payload?.success) {
          const index = state.proveedores.findIndex(p => p.id === action.payload?.data?.proveedor?.id)
          if (index !== -1) {
            state.proveedores[index] = action.payload?.data?.proveedor
          }
        }
      })
  }
})

export const {
  clearError,
  setFiltrosProveedores,
  clearFiltrosProveedores,
  seleccionarProveedor,
  clearProveedorSeleccionado,
  clearEstadisticasProveedor
} = proveedoresSlice.actions

export default proveedoresSlice.reducer