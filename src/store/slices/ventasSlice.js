import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import ventaService from '../../services/ventaService'

// Thunks para operaciones asíncronas
export const obtenerVentas = createAsyncThunk(
  'ventas/obtenerVentas',
  async (filtros = {}, { rejectWithValue }) => {
    try {
      const response = await ventaService.obtenerVentas(filtros)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const obtenerVentaPorId = createAsyncThunk(
  'ventas/obtenerVentaPorId',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ventaService.obtenerVentaPorId(id)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const crearVenta = createAsyncThunk(
  'ventas/crearVenta',
  async (ventaData, { rejectWithValue }) => {
    try {
      const response = await ventaService.crearVenta(ventaData)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const cancelarVenta = createAsyncThunk(
  'ventas/cancelarVenta',
  async (id, { rejectWithValue }) => {
    try {
      const response = await ventaService.cancelarVenta(id)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const obtenerEstadisticasVentas = createAsyncThunk(
  'ventas/obtenerEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ventaService.obtenerEstadisticas()
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// Estado inicial
const initialState = {
  ventas: [],
  ventaActual: null,
  estadisticas: {},
  filtros: {
    search: '',
    cliente_id: '',
    metodo_pago: '',
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    pagina: 1,
    limite: 10
  },
  loading: false,
  loadingCrear: false,
  loadingCancelar: false,
  error: null,
  totalVentas: 0,
  paginaActual: 1,
  totalPaginas: 1
}

const ventasSlice = createSlice({
  name: 'ventas',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFiltros: (state, action) => {
      state.filtros = { ...state.filtros, ...action.payload }
    },
    clearFiltros: (state) => {
      state.filtros = {
        search: '',
        cliente_id: '',
        metodo_pago: '',
        estado: '',
        fecha_desde: '',
        fecha_hasta: '',
        pagina: 1,
        limite: 10
      }
    },
    resetVentaActual: (state) => {
      state.ventaActual = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Obtener ventas
      .addCase(obtenerVentas.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(obtenerVentas.fulfilled, (state, action) => {
        state.loading = false
        state.ventas = action.payload.data?.ventas || []
        state.totalVentas = action.payload.data?.pagination?.total || 0
        state.paginaActual = action.payload.data?.pagination?.page || 1
        state.totalPaginas = action.payload.data?.pagination?.totalPages || 1
      })
      .addCase(obtenerVentas.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al cargar ventas'
      })

      // Obtener venta por ID
      .addCase(obtenerVentaPorId.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(obtenerVentaPorId.fulfilled, (state, action) => {
        state.loading = false
        state.ventaActual = action.payload.data
      })
      .addCase(obtenerVentaPorId.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al cargar venta'
      })

      // Crear venta
      .addCase(crearVenta.pending, (state) => {
        state.loadingCrear = true
        state.error = null
      })
      .addCase(crearVenta.fulfilled, (state, action) => {
        state.loadingCrear = false
        // Agregar la nueva venta al inicio de la lista
        if (action.payload.data) {
          state.ventas.unshift(action.payload.data)
          state.totalVentas += 1
        }
      })
      .addCase(crearVenta.rejected, (state, action) => {
        state.loadingCrear = false
        state.error = action.payload || 'Error al crear venta'
      })

      // Cancelar venta
      .addCase(cancelarVenta.pending, (state) => {
        state.loadingCancelar = true
        state.error = null
      })
      .addCase(cancelarVenta.fulfilled, (state, action) => {
        state.loadingCancelar = false
        // Actualizar venta en la lista
        const index = state.ventas.findIndex(v => v.id === action.payload.data?.id)
        if (index !== -1) {
          state.ventas[index] = action.payload.data
        }
        // Actualizar venta actual si coincide
        if (state.ventaActual?.id === action.payload.data?.id) {
          state.ventaActual = action.payload.data
        }
      })
      .addCase(cancelarVenta.rejected, (state, action) => {
        state.loadingCancelar = false
        state.error = action.payload || 'Error al cancelar venta'
      })

      // Obtener estadísticas
      .addCase(obtenerEstadisticasVentas.fulfilled, (state, action) => {
        state.estadisticas = action.payload.data || {}
      })
      .addCase(obtenerEstadisticasVentas.rejected, (state, action) => {
        state.error = action.payload || 'Error al cargar estadísticas'
      })
  }
})

// Selectores
export const selectVentas = (state) => state.ventas?.ventas || []
export const selectVentaActual = (state) => state.ventas?.ventaActual
export const selectLoadingVentas = (state) => state.ventas?.loading || false
export const selectLoadingCrear = (state) => state.ventas?.loadingCrear || false
export const selectLoadingCancelar = (state) => state.ventas?.loadingCancelar || false
export const selectFiltrosVentas = (state) => state.ventas?.filtros || {}
export const selectEstadisticasVentas = (state) => state.ventas?.estadisticas || {}
export const selectErrorVentas = (state) => state.ventas?.error
export const selectTotalVentas = (state) => state.ventas?.totalVentas || 0
export const selectPaginacionVentas = (state) => ({
  paginaActual: state.ventas?.paginaActual || 1,
  totalPaginas: state.ventas?.totalPaginas || 1,
  total: state.ventas?.totalVentas || 0
})

export const { clearError, setFiltros, clearFiltros, resetVentaActual } = ventasSlice.actions

export default ventasSlice.reducer