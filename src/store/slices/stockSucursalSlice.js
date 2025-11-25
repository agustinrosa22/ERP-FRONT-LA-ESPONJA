import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import stockSucursalService from '../../services/stockSucursalService'

// Función para sanitizar objetos anidados y convertirlos a strings seguros
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }
  
  console.log('🧹 SANITIZANDO OBJETO:', obj)
  
  // Crear una copia del objeto
  const sanitized = { ...obj }
  
  // Convertir campos problemáticos conocidos
  if (sanitized.usuario && typeof sanitized.usuario === 'object') {
    console.log('👤 SANITIZANDO USUARIO:', sanitized.usuario)
    const usuarioTexto = sanitized.usuario.nombre || sanitized.usuario.username || `Usuario ${sanitized.usuario.id}` || 'Usuario'
    console.log('👤 USUARIO CONVERTIDO A:', usuarioTexto)
    sanitized.usuario = usuarioTexto
  }
  
  if (sanitized.sucursal && typeof sanitized.sucursal === 'object') {
    console.log('🏢 SANITIZANDO SUCURSAL:', sanitized.sucursal)
    const sucursalTexto = sanitized.sucursal.nombre || `Sucursal ${sanitized.sucursal.id}` || 'Sucursal'
    console.log('🏢 SUCURSAL CONVERTIDA A:', sucursalTexto)
    sanitized.sucursal_nombre = sucursalTexto
    // Mantenemos el objeto sucursal pero agregamos el nombre como string
  }
  
  if (sanitized.producto && typeof sanitized.producto === 'object') {
    console.log('🛍️ SANITIZANDO PRODUCTO:', sanitized.producto)
    // Para productos, mantenemos el objeto ya que lo necesitamos
    sanitized.producto = {
      ...sanitized.producto,
      nombre: String(sanitized.producto.nombre || 'Producto'),
      codigo_producto: String(sanitized.producto.codigo_producto || ''),
      unidad_medida: String(sanitized.producto.unidad_medida || '')
    }
    console.log('🛍️ PRODUCTO SANITIZADO:', sanitized.producto)
  }
  
  console.log('🧹 OBJETO SANITIZADO FINAL:', sanitized)
  return sanitized
}

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
          console.log('📦 STOCK RAW DATA:', action.payload.data)
          const sanitizedItems = (action.payload.data || []).map(item => {
            console.log('📦 Stock item before sanitization:', item)
            const sanitized = sanitizeObject(item)
            console.log('📦 Stock item after sanitization:', sanitized)
            return sanitized
          })
          state.stockItems = sanitizedItems
          state.estadisticas = action.payload.estadisticas || null
          state.pagination = action.payload.pagination || null
          state.sucursal_id = action.payload.sucursal_id || null
          console.log('📦 FINAL STOCK STATE:', { items: sanitizedItems.length, estadisticas: state.estadisticas })
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
          console.log('📋 HISTORIAL RAW DATA:', action.payload.data)
          const sanitizedHistorial = (action.payload.data || []).map(item => {
            console.log('📋 Historial item before sanitization:', item)
            const sanitized = sanitizeObject(item)
            console.log('📋 Historial item after sanitization:', sanitized)
            return sanitized
          })
          state.historialProducto = sanitizedHistorial
          console.log('📋 FINAL HISTORIAL STATE:', sanitizedHistorial.length, 'items')
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