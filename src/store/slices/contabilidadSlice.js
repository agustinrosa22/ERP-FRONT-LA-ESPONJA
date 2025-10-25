import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import contabilidadService from '../../services/contabilidadService'

// Thunks para operaciones asíncronas
export const obtenerMovimientos = createAsyncThunk(
  'contabilidad/obtenerMovimientos',
  async (filtros, { rejectWithValue }) => {
    try {
      const response = await contabilidadService.obtenerMovimientos(filtros)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const obtenerMovimiento = createAsyncThunk(
  'contabilidad/obtenerMovimiento',
  async (id, { rejectWithValue }) => {
    try {
      const response = await contabilidadService.obtenerMovimiento(id)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const crearMovimiento = createAsyncThunk(
  'contabilidad/crearMovimiento',
  async (movimientoData, { rejectWithValue }) => {
    try {
      const response = await contabilidadService.crearMovimiento(movimientoData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const obtenerBalance = createAsyncThunk(
  'contabilidad/obtenerBalance',
  async ({ fechaDesde, fechaHasta }, { rejectWithValue }) => {
    try {
      const response = await contabilidadService.obtenerBalance(fechaDesde, fechaHasta)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const obtenerEstadisticas = createAsyncThunk(
  'contabilidad/obtenerEstadisticas',
  async (periodo, { rejectWithValue }) => {
    try {
      const response = await contabilidadService.obtenerEstadisticas(periodo)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const obtenerResumen = createAsyncThunk(
  'contabilidad/obtenerResumen',
  async ({ fechaDesde, fechaHasta }, { rejectWithValue }) => {
    try {
      const response = await contabilidadService.obtenerResumen(fechaDesde, fechaHasta)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const obtenerFlujoPorCategoria = createAsyncThunk(
  'contabilidad/obtenerFlujoPorCategoria',
  async ({ fechaDesde, fechaHasta }, { rejectWithValue }) => {
    try {
      const response = await contabilidadService.obtenerFlujoPorCategoria(fechaDesde, fechaHasta)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const actualizarMovimiento = createAsyncThunk(
  'contabilidad/actualizarMovimiento',
  async ({ id, movimientoData }, { rejectWithValue }) => {
    try {
      const response = await contabilidadService.actualizarMovimiento(id, movimientoData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const eliminarMovimiento = createAsyncThunk(
  'contabilidad/eliminarMovimiento',
  async (id, { rejectWithValue }) => {
    try {
      await contabilidadService.eliminarMovimiento(id)
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const contabilidadSlice = createSlice({
  name: 'contabilidad',
  initialState: {
    movimientos: [],
    movimientoActual: null,
    balance: {
      total_ingresos: 0,
      total_egresos: 0,
      balance_neto: 0,
      movimientos_count: 0
    },
    estadisticas: {
      ingresos_hoy: 0,
      egresos_hoy: 0,
      balance_hoy: 0,
      ingresos_mes: 0,
      egresos_mes: 0,
      balance_mes: 0,
      por_categoria: [],
      por_metodo_pago: []
    },
    resumen: {
      periodo: null,
      total_ingresos: 0,
      total_egresos: 0,
      balance: 0,
      ingresos_por_dia: [],
      egresos_por_dia: []
    },
    flujoPorCategoria: [],
    filtros: {
      tipo: '',
      categoria: '',
      fechaDesde: '',
      fechaHasta: '',
      metodo_pago: ''
    },
    paginacion: {
      total: 0,
      limite: 10,
      offset: 0,
      totalPaginas: 0
    },
    cargando: false,
    error: null
  },
  reducers: {
    limpiarError: (state) => {
      state.error = null
    },
    establecerFiltros: (state, action) => {
      state.filtros = { ...state.filtros, ...action.payload }
    },
    limpiarFiltros: (state) => {
      state.filtros = {
        tipo: '',
        categoria: '',
        fechaDesde: '',
        fechaHasta: '',
        metodo_pago: ''
      }
    },
    establecerPaginacion: (state, action) => {
      state.paginacion = { ...state.paginacion, ...action.payload }
    },
    limpiarMovimientoActual: (state) => {
      state.movimientoActual = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Obtener movimientos
      .addCase(obtenerMovimientos.pending, (state) => {
        state.cargando = true
        state.error = null
      })
      .addCase(obtenerMovimientos.fulfilled, (state, action) => {
        state.cargando = false
        console.log('Datos recibidos en slice:', action.payload)
        
        // Manejar estructura de respuesta de la API
        if (action.payload.success && action.payload.data) {
          state.movimientos = action.payload.data.movimientos || []
          console.log('Movimientos establecidos:', state.movimientos)
          
          if (action.payload.data.pagination) {
            state.paginacion = {
              ...state.paginacion,
              total: action.payload.data.pagination.total,
              totalPaginas: action.payload.data.pagination.totalPages
            }
          }
          // Si hay resumen en la respuesta, actualizarlo
          if (action.payload.data.resumen) {
            state.balance = {
              total_ingresos: action.payload.data.resumen.total_ingresos,
              total_egresos: action.payload.data.resumen.total_egresos,
              balance_neto: action.payload.data.resumen.balance,
              movimientos_count: action.payload.data.pagination?.total || 0
            }
          }
        } else {
          state.movimientos = action.payload.movimientos || action.payload || []
        }
      })
      .addCase(obtenerMovimientos.rejected, (state, action) => {
        state.cargando = false
        // Solo mostrar error si no es un problema de filtros
        if (action.payload && !action.payload.includes('filtro')) {
          state.error = action.payload
        }
        state.movimientos = []
        console.warn('Error al obtener movimientos, mostrando lista vacía:', action.payload)
      })

      // Obtener movimiento específico
      .addCase(obtenerMovimiento.pending, (state) => {
        state.cargando = true
        state.error = null
      })
      .addCase(obtenerMovimiento.fulfilled, (state, action) => {
        state.cargando = false
        state.movimientoActual = action.payload.movimiento || action.payload
      })
      .addCase(obtenerMovimiento.rejected, (state, action) => {
        state.cargando = false
        state.error = action.payload
      })

      // Crear movimiento
      .addCase(crearMovimiento.pending, (state) => {
        state.cargando = true
        state.error = null
      })
      .addCase(crearMovimiento.fulfilled, (state, action) => {
        state.cargando = false
        if (action.payload.success && action.payload.data) {
          state.movimientos.unshift(action.payload.data)
        } else if (action.payload.movimiento) {
          state.movimientos.unshift(action.payload.movimiento)
        }
      })
      .addCase(crearMovimiento.rejected, (state, action) => {
        state.cargando = false
        state.error = action.payload
      })

      // Obtener balance
      .addCase(obtenerBalance.pending, (state) => {
        state.cargando = true
        state.error = null
      })
      .addCase(obtenerBalance.fulfilled, (state, action) => {
        state.cargando = false
        if (action.payload.success && action.payload.data) {
          state.balance = action.payload.data
        } else {
          state.balance = action.payload.balance || action.payload
        }
      })
      .addCase(obtenerBalance.rejected, (state, action) => {
        state.cargando = false
        console.warn('Error al obtener balance:', action.payload)
        // No mostrar error crítico por balance
      })

      // Obtener estadísticas
      .addCase(obtenerEstadisticas.pending, (state) => {
        state.cargando = true
        state.error = null
      })
      .addCase(obtenerEstadisticas.fulfilled, (state, action) => {
        state.cargando = false
        if (action.payload.success && action.payload.data) {
          state.estadisticas = action.payload.data
        } else {
          state.estadisticas = action.payload.estadisticas || action.payload
        }
      })
      .addCase(obtenerEstadisticas.rejected, (state, action) => {
        state.cargando = false
        console.warn('Error al obtener estadísticas:', action.payload)
        // No mostrar error crítico por estadísticas
      })

      // Obtener resumen
      .addCase(obtenerResumen.pending, (state) => {
        state.cargando = true
        state.error = null
      })
      .addCase(obtenerResumen.fulfilled, (state, action) => {
        state.cargando = false
        state.resumen = action.payload.resumen || action.payload
      })
      .addCase(obtenerResumen.rejected, (state, action) => {
        state.cargando = false
        state.error = action.payload
      })

      // Obtener flujo por categoría
      .addCase(obtenerFlujoPorCategoria.pending, (state) => {
        state.cargando = true
        state.error = null
      })
      .addCase(obtenerFlujoPorCategoria.fulfilled, (state, action) => {
        state.cargando = false
        state.flujoPorCategoria = action.payload.flujo || action.payload
      })
      .addCase(obtenerFlujoPorCategoria.rejected, (state, action) => {
        state.cargando = false
        state.error = action.payload
      })

      // Actualizar movimiento
      .addCase(actualizarMovimiento.pending, (state) => {
        state.cargando = true
        state.error = null
      })
      .addCase(actualizarMovimiento.fulfilled, (state, action) => {
        state.cargando = false
        const movimientoActualizado = action.payload.movimiento || action.payload
        const index = state.movimientos.findIndex(m => m.id === movimientoActualizado.id)
        if (index !== -1) {
          state.movimientos[index] = movimientoActualizado
        }
        state.movimientoActual = movimientoActualizado
      })
      .addCase(actualizarMovimiento.rejected, (state, action) => {
        state.cargando = false
        state.error = action.payload
      })

      // Eliminar movimiento
      .addCase(eliminarMovimiento.pending, (state) => {
        state.cargando = true
        state.error = null
      })
      .addCase(eliminarMovimiento.fulfilled, (state, action) => {
        state.cargando = false
        state.movimientos = state.movimientos.filter(m => m.id !== action.payload)
      })
      .addCase(eliminarMovimiento.rejected, (state, action) => {
        state.cargando = false
        state.error = action.payload
      })
  }
})

export const {
  limpiarError,
  establecerFiltros,
  limpiarFiltros,
  establecerPaginacion,
  limpiarMovimientoActual
} = contabilidadSlice.actions

// Selectores
export const selectMovimientos = (state) => state.contabilidad.movimientos
export const selectMovimientoActual = (state) => state.contabilidad.movimientoActual
export const selectBalance = (state) => state.contabilidad.balance
export const selectEstadisticas = (state) => state.contabilidad.estadisticas
export const selectResumen = (state) => state.contabilidad.resumen
export const selectFlujoPorCategoria = (state) => state.contabilidad.flujoPorCategoria
export const selectFiltros = (state) => state.contabilidad.filtros
export const selectPaginacion = (state) => state.contabilidad.paginacion
export const selectCargando = (state) => state.contabilidad.cargando
export const selectError = (state) => state.contabilidad.error

export default contabilidadSlice.reducer