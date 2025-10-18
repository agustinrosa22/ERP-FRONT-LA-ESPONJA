import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import comprasService from '../../services/comprasService'

// ========== THUNKS PARA COMPRAS ==========

// Obtener todas las compras
export const obtenerCompras = createAsyncThunk(
  'compras/obtenerCompras',
  async (filtros = {}, { rejectWithValue }) => {
    try {
      const response = await comprasService.obtenerCompras(filtros)
      
      if (response.data?.success) {
        return response.data.data
      }
      
      return response.data || { compras: [], pagination: {} }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Obtener compra por ID
export const obtenerCompraPorId = createAsyncThunk(
  'compras/obtenerCompraPorId',
  async (id, { rejectWithValue }) => {
    try {
      const response = await comprasService.obtenerCompraPorId(id)
      
      if (response.data?.success) {
        return response.data.data
      }
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Crear nueva compra
export const crearCompra = createAsyncThunk(
  'compras/crearCompra',
  async (compraData, { rejectWithValue }) => {
    try {
      const response = await comprasService.crearCompra(compraData)
      
      if (response.data?.success) {
        return response.data.data
      }
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Actualizar estado de compra
export const actualizarEstadoCompra = createAsyncThunk(
  'compras/actualizarEstadoCompra',
  async ({ id, estado, observaciones }, { rejectWithValue }) => {
    try {
      const response = await comprasService.cambiarEstadoCompra(id, estado, observaciones)
      
      if (response.data?.success) {
        return response.data.data
      }
      
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Obtener estadísticas de compras
export const obtenerEstadisticasCompras = createAsyncThunk(
  'compras/obtenerEstadisticasCompras',
  async (filtros = {}, { rejectWithValue }) => {
    try {
      // Cuando implementemos este endpoint en el servicio
      const response = await comprasService.obtenerEstadisticasCompras?.(filtros) || { data: null }
      
      if (response.data?.success) {
        return response.data.data
      }
      
      return response.data || {}
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ========== ESTADO INICIAL ==========
const initialState = {
  // Lista de compras
  compras: [],
  compraSeleccionada: null,
  totalCompras: 0,
  paginaActual: 1,
  totalPaginas: 1,
  filtrosCompras: {
    busqueda: '',
    proveedor_id: '',
    estado: 'todos',
    fechaDesde: '',
    fechaHasta: '',
    ordenarPor: 'fecha',
    orden: 'DESC',
    limite: 10,
    pagina: 1
  },
  loading: false,
  loadingDetalle: false,
  loadingCrear: false,
  loadingActualizar: false,
  loadingEliminar: false,
  loadingEstadisticas: false,
  error: null,
  estadisticasCompras: {
    totalComprasHoy: 0,
    totalComprasSemana: 0,
    totalComprasMes: 0,
    montoTotalMes: 0,
    proveedorMasFrecuente: null,
    comprasPendientes: 0
  }
}

const comprasSlice = createSlice({
  name: 'compras',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setFiltrosCompras: (state, action) => {
      state.filtrosCompras = {
        ...state.filtrosCompras,
        ...action.payload
      }
    },
    clearFiltrosCompras: (state) => {
      state.filtrosCompras = initialState.filtrosCompras
    },
    seleccionarCompra: (state, action) => {
      state.compraSeleccionada = action.payload
    },
    clearCompraSeleccionada: (state) => {
      state.compraSeleccionada = null
    },
    clearEstadisticasCompras: (state) => {
      state.estadisticasCompras = initialState.estadisticasCompras
    },
    actualizarCompraEnLista: (state, action) => {
      const { id, datosActualizados } = action.payload
      const index = state.compras.findIndex(compra => compra.id === id)
      if (index !== -1) {
        state.compras[index] = { ...state.compras[index], ...datosActualizados }
      }
    }
  },
  
  extraReducers: (builder) => {
    // ========== OBTENER COMPRAS ==========
    builder
      .addCase(obtenerCompras.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(obtenerCompras.fulfilled, (state, action) => {
        state.loading = false
        state.compras = action.payload?.compras || []
        
        // Manejar paginación
        if (action.payload?.pagination) {
          state.totalCompras = action.payload.pagination.total || 0
          state.paginaActual = action.payload.pagination.page || 1
          state.totalPaginas = action.payload.pagination.totalPages || 1
        }
      })
      .addCase(obtenerCompras.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Error al obtener compras'
      })
      
      // ========== OBTENER COMPRA POR ID ==========
      .addCase(obtenerCompraPorId.pending, (state) => {
        state.loadingDetalle = true
        state.error = null
      })
      .addCase(obtenerCompraPorId.fulfilled, (state, action) => {
        state.loadingDetalle = false
        state.compraSeleccionada = action.payload
      })
      .addCase(obtenerCompraPorId.rejected, (state, action) => {
        state.loadingDetalle = false
        state.error = action.payload?.message || 'Error al obtener detalles de la compra'
      })
      
      // ========== CREAR COMPRA ==========
      .addCase(crearCompra.pending, (state) => {
        state.loadingCrear = true
        state.error = null
      })
      .addCase(crearCompra.fulfilled, (state, action) => {
        state.loadingCrear = false
        // Agregar la nueva compra al inicio de la lista
        state.compras.unshift(action.payload)
        state.totalCompras += 1
      })
      .addCase(crearCompra.rejected, (state, action) => {
        state.loadingCrear = false
        state.error = action.payload?.message || 'Error al crear compra'
      })
      
      // ========== ACTUALIZAR ESTADO DE COMPRA ==========
      .addCase(actualizarEstadoCompra.pending, (state) => {
        state.loadingActualizar = true
        state.error = null
      })
      .addCase(actualizarEstadoCompra.fulfilled, (state, action) => {
        state.loadingActualizar = false
        
        // Actualizar en la lista de compras
        const compraActualizada = action.payload
        const index = state.compras.findIndex(compra => compra.id === compraActualizada.id)
        if (index !== -1) {
          state.compras[index] = { ...state.compras[index], ...compraActualizada }
        }
        
        // Actualizar compra seleccionada si coincide
        if (state.compraSeleccionada?.id === compraActualizada.id) {
          state.compraSeleccionada = { ...state.compraSeleccionada, ...compraActualizada }
        }
      })
      .addCase(actualizarEstadoCompra.rejected, (state, action) => {
        state.loadingActualizar = false
        state.error = action.payload?.message || 'Error al actualizar estado de compra'
      })
      
      // ========== ESTADÍSTICAS ==========
      .addCase(obtenerEstadisticasCompras.pending, (state) => {
        state.loadingEstadisticas = true
        state.error = null
      })
      .addCase(obtenerEstadisticasCompras.fulfilled, (state, action) => {
        state.loadingEstadisticas = false
        state.estadisticasCompras = action.payload || initialState.estadisticasCompras
      })
      .addCase(obtenerEstadisticasCompras.rejected, (state, action) => {
        state.loadingEstadisticas = false
        state.error = action.payload?.message || 'Error al obtener estadísticas de compras'
      })
  }
})

export const {
  clearError,
  setFiltrosCompras,
  clearFiltrosCompras,
  seleccionarCompra,
  clearCompraSeleccionada,
  clearEstadisticasCompras,
  actualizarCompraEnLista
} = comprasSlice.actions

export default comprasSlice.reducer

// ========== SELECTORES ==========
export const selectCompras = (state) => state.compras.compras
export const selectCompraSeleccionada = (state) => state.compras.compraSeleccionada
export const selectTotalCompras = (state) => state.compras.totalCompras
export const selectPaginaActual = (state) => state.compras.paginaActual
export const selectTotalPaginas = (state) => state.compras.totalPaginas
export const selectFiltrosCompras = (state) => state.compras.filtrosCompras
export const selectLoadingCompras = (state) => state.compras.loading
export const selectLoadingDetalleCompra = (state) => state.compras.loadingDetalle
export const selectLoadingCrearCompra = (state) => state.compras.loadingCrear
export const selectLoadingActualizarCompra = (state) => state.compras.loadingActualizar
export const selectLoadingEstadisticasCompras = (state) => state.compras.loadingEstadisticas
export const selectErrorCompras = (state) => state.compras.error
export const selectEstadisticasCompras = (state) => state.compras.estadisticasCompras

// Selectores computados
export const selectComprasPorEstado = (estado) => (state) => 
  state.compras.compras.filter(compra => compra.estado === estado)

export const selectComprasPendientes = (state) => 
  state.compras.compras.filter(compra => compra.estado === 'pendiente')

export const selectComprasRecibidas = (state) => 
  state.compras.compras.filter(compra => compra.estado === 'recibida')

export const selectComprasFacturadas = (state) => 
  state.compras.compras.filter(compra => compra.estado === 'facturada')

export const selectComprasPagadas = (state) => 
  state.compras.compras.filter(compra => compra.estado === 'pagada')

export const selectComprasCanceladas = (state) => 
  state.compras.compras.filter(compra => compra.estado === 'cancelada')

export const selectMontoTotalCompras = (state) => 
  state.compras.compras.reduce((total, compra) => total + (compra.total || 0), 0)