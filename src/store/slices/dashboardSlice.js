import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import dashboardService from '../../services/dashboardService'

// Thunks asíncronos
export const obtenerEstadisticasDashboard = createAsyncThunk(
  'dashboard/obtenerEstadisticas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.obtenerEstadisticasDashboard()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const obtenerActividadReciente = createAsyncThunk(
  'dashboard/obtenerActividadReciente',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.obtenerActividadReciente()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const obtenerProductosBajoStock = createAsyncThunk(
  'dashboard/obtenerProductosBajoStock',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.obtenerProductosBajoStock()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Estado inicial
const initialState = {
  estadisticas: {
    productos_stock: 0,
    ventas_mes: 0,
    empleados_activos: 0,
    pedidos_pendientes: 0,
    balance_dia: 0,
    balance_mes: 0
  },
  resumenFinanciero: {
    ingresos_hoy: 0,
    egresos_hoy: 0,
    balance_hoy: 0,
    total_productos: 0,
    productos_bajo_stock: 0
  },
  actividadReciente: [],
  productosBajoStock: [],
  cargando: false,
  error: null
}

// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    limpiarError: (state) => {
      state.error = null
    },
    actualizarEstadistica: (state, action) => {
      const { campo, valor } = action.payload
      if (state.estadisticas.hasOwnProperty(campo)) {
        state.estadisticas[campo] = valor
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Obtener estadísticas
      .addCase(obtenerEstadisticasDashboard.pending, (state) => {
        state.cargando = true
        state.error = null
      })
      .addCase(obtenerEstadisticasDashboard.fulfilled, (state, action) => {
        state.cargando = false
        console.log('📊 Dashboard slice - datos recibidos:', action.payload)
        if (action.payload.success && action.payload.data) {
          state.estadisticas = action.payload.data.estadisticas || initialState.estadisticas
          state.resumenFinanciero = action.payload.data.resumen_financiero || initialState.resumenFinanciero
          state.actividadReciente = action.payload.data.actividad_reciente || []
          console.log('📊 Dashboard slice - datos procesados:', {
            estadisticas: state.estadisticas,
            resumenFinanciero: state.resumenFinanciero,
            actividadReciente: state.actividadReciente
          })
        }
      })
      .addCase(obtenerEstadisticasDashboard.rejected, (state, action) => {
        state.cargando = false
        state.error = action.payload
      })

      // Obtener actividad reciente
      .addCase(obtenerActividadReciente.pending, (state) => {
        state.cargando = true
      })
      .addCase(obtenerActividadReciente.fulfilled, (state, action) => {
        state.cargando = false
        if (action.payload.success && action.payload.data) {
          state.actividadReciente = action.payload.data
        }
      })
      .addCase(obtenerActividadReciente.rejected, (state, action) => {
        state.cargando = false
        state.error = action.payload
      })

      // Obtener productos bajo stock
      .addCase(obtenerProductosBajoStock.pending, (state) => {
        state.cargando = true
      })
      .addCase(obtenerProductosBajoStock.fulfilled, (state, action) => {
        state.cargando = false
        console.log('📦 Productos bajo stock - respuesta:', action.payload)
        if (action.payload.success && action.payload.data) {
          state.productosBajoStock = action.payload.data.productos || []
          console.log('📦 Productos bajo stock establecidos:', state.productosBajoStock.length)
        }
      })
      .addCase(obtenerProductosBajoStock.rejected, (state, action) => {
        state.cargando = false
        state.error = action.payload
      })
  }
})

// Acciones
export const { limpiarError, actualizarEstadistica } = dashboardSlice.actions

// Selectores
export const selectEstadisticas = (state) => state.dashboard.estadisticas
export const selectResumenFinanciero = (state) => state.dashboard.resumenFinanciero
export const selectActividadReciente = (state) => state.dashboard.actividadReciente
export const selectProductosBajoStock = (state) => state.dashboard.productosBajoStock
export const selectCargando = (state) => state.dashboard.cargando
export const selectError = (state) => state.dashboard.error

export default dashboardSlice.reducer