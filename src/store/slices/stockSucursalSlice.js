import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import stockSucursalService from '../../services/stockSucursalService'

// Thunks asíncronos
export const obtenerStockSucursal = createAsyncThunk(
  'stockSucursal/obtenerStock',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await stockSucursalService.obtenerStockSucursal(params)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const obtenerResumenGlobal = createAsyncThunk(
  'stockSucursal/obtenerResumenGlobal',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await stockSucursalService.obtenerResumenGlobal(params)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const crearStockSucursal = createAsyncThunk(
  'stockSucursal/crear',
  async (stockData, { rejectWithValue }) => {
    try {
      const response = await stockSucursalService.crearStockSucursal(stockData)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const actualizarStockSucursal = createAsyncThunk(
  'stockSucursal/actualizar',
  async (stockData, { rejectWithValue }) => {
    try {
      const response = await stockSucursalService.actualizarStockSucursal(stockData)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const obtenerHistorialProducto = createAsyncThunk(
  'stockSucursal/obtenerHistorial',
  async ({ productoId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await stockSucursalService.obtenerHistorialProducto(productoId, params)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

const initialState = {
  // Stock por sucursal
  stockItems: [],
  estadisticas: null,
  pagination: null,
  sucursal_id: null,
  
  // Resumen global (solo admin)
  resumenGlobal: [],
  
  // Historial de producto
  historialProducto: [],
  
  // Filtros
  filtros: {
    page: 1,
    limit: 10,
    search: '',
    stock_bajo: false
  },
  
  // Estados de carga
  loading: false,
  loadingResumen: false,
  loadingHistorial: false,
  loadingActualizar: false,
  
  // Errores
  error: null
}

const stockSucursalSlice = createSlice({
  name: 'stockSucursal',
  initialState,
  reducers: {
    setFiltros: (state, action) => {
      state.filtros = { ...state.filtros, ...action.payload }
    },
    clearFiltros: (state) => {
      state.filtros = {
        page: 1,
        limit: 10,
        search: '',
        stock_bajo: false
      }
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Obtener stock de sucursal
      .addCase(obtenerStockSucursal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(obtenerStockSucursal.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.success) {
          state.stockItems = action.payload.data || []
          state.estadisticas = action.payload.estadisticas || null
          state.pagination = action.payload.pagination || null
          state.sucursal_id = action.payload.sucursal_id || null
        }
      })
      .addCase(obtenerStockSucursal.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al obtener stock'
        state.stockItems = []
      })
      
      // Obtener resumen global
      .addCase(obtenerResumenGlobal.pending, (state) => {
        state.loadingResumen = true
        state.error = null
      })
      .addCase(obtenerResumenGlobal.fulfilled, (state, action) => {
        state.loadingResumen = false
        if (action.payload?.success) {
          state.resumenGlobal = action.payload.data || []
        }
      })
      .addCase(obtenerResumenGlobal.rejected, (state, action) => {
        state.loadingResumen = false
        state.error = action.payload || 'Error al obtener resumen global'
      })
      
      // Crear stock
      .addCase(crearStockSucursal.pending, (state) => {
        state.loadingActualizar = true
        state.error = null
      })
      .addCase(crearStockSucursal.fulfilled, (state, action) => {
        state.loadingActualizar = false
        if (action.payload?.success && action.payload?.data) {
          // Agregar el nuevo item a la lista
          state.stockItems.push(action.payload.data)
        }
      })
      .addCase(crearStockSucursal.rejected, (state, action) => {
        state.loadingActualizar = false
        state.error = action.payload || 'Error al crear stock'
      })
      
      // Actualizar stock
      .addCase(actualizarStockSucursal.pending, (state) => {
        state.loadingActualizar = true
        state.error = null
      })
      .addCase(actualizarStockSucursal.fulfilled, (state, action) => {
        state.loadingActualizar = false
        if (action.payload?.success && action.payload?.data) {
          // Actualizar el item en la lista
          const updatedItem = action.payload.data
          const index = state.stockItems.findIndex(
            item => item.producto_id === updatedItem.producto_id
          )
          if (index !== -1) {
            state.stockItems[index] = updatedItem
          }
        }
      })
      .addCase(actualizarStockSucursal.rejected, (state, action) => {
        state.loadingActualizar = false
        state.error = action.payload || 'Error al actualizar stock'
      })
      
      // Obtener historial de producto
      .addCase(obtenerHistorialProducto.pending, (state) => {
        state.loadingHistorial = true
        state.error = null
      })
      .addCase(obtenerHistorialProducto.fulfilled, (state, action) => {
        state.loadingHistorial = false
        if (action.payload?.success) {
          state.historialProducto = action.payload.data || []
        }
      })
      .addCase(obtenerHistorialProducto.rejected, (state, action) => {
        state.loadingHistorial = false
        state.error = action.payload || 'Error al obtener historial'
      })
  }
})

export const { setFiltros, clearFiltros, clearError } = stockSucursalSlice.actions
export default stockSucursalSlice.reducer