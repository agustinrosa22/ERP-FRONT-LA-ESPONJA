import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import inventarioService from '../../services/inventarioService'

// ========== THUNKS PARA PRODUCTOS ==========
export const obtenerProductos = createAsyncThunk(
  'inventario/obtenerProductos',
  async (params = {}, { rejectWithValue }) => {
    try {
      const mergedParams = { incluir_stock_sucursal: true, ...params }
      const response = await inventarioService.obtenerProductos(mergedParams)
      
      // Manejar la estructura específica del backend  
      if (response.data?.success) {
        const data = response.data.data
        
        // Para productos: probablemente data.productos (siguiendo el patrón)
        if (data?.productos && Array.isArray(data.productos)) {
          return data.productos
        }
        
        // Si data es directamente un array
        if (Array.isArray(data)) {
          return data
        }
        
        // Fallback: devolver array vacío
        return []
      }
      
      return response.data || []
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const obtenerProductosStockBajo = createAsyncThunk(
  'inventario/obtenerProductosStockBajo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventarioService.obtenerProductosStockBajo()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
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
      return rejectWithValue(error.response?.data || error.message)
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
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ========== THUNKS PARA MOVIMIENTOS ==========
export const obtenerMovimientos = createAsyncThunk(
  'inventario/obtenerMovimientos',
  async (filtros = {}, { rejectWithValue }) => {
    try {
      const response = await inventarioService.obtenerMovimientos(filtros)

      
      // Manejar la estructura específica del backend
      if (response.data?.success) {
        const data = response.data.data
        
        // Para movimientos: data.movimientos (estructura confirmada)
        if (data?.movimientos && Array.isArray(data.movimientos)) {

          return data.movimientos
        }
        
        // Si data es directamente un array
        if (Array.isArray(data)) {

          return data
        }
        
        // Fallback: devolver array vacío

        return []
      }
      
      return response.data || []
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const crearMovimiento = createAsyncThunk(
  'inventario/crearMovimiento',
  async (movimiento, { rejectWithValue }) => {
    try {
      const response = await inventarioService.crearMovimiento(movimiento)
      // El backend devuelve {success: true, data: {...}}, necesitamos extraer data.data  
      if (response.data?.success) {
        return response.data.data
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const obtenerHistorialProducto = createAsyncThunk(
  'inventario/obtenerHistorialProducto',
  async ({ productoId, filtros = {} }, { rejectWithValue }) => {
    try {
      const response = await inventarioService.obtenerHistorialProducto(productoId, filtros)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// ========== THUNKS PARA ALERTAS Y ESTADÍSTICAS ==========
export const obtenerAlertas = createAsyncThunk(
  'inventario/obtenerAlertas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventarioService.obtenerAlertas()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const obtenerEstadisticasInventario = createAsyncThunk(
  'inventario/obtenerEstadisticasInventario',
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventarioService.obtenerEstadisticasInventario()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const validarStock = createAsyncThunk(
  'inventario/validarStock',
  async ({ productoId, cantidadSalida }, { rejectWithValue }) => {
    try {
      const response = await inventarioService.validarStock(productoId, cantidadSalida)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const initialState = {
  // Productos
  productos: [],
  productosStockBajo: [],
  producto: null,
  
  // Movimientos
  movimientos: [],
  movimiento: null,
  historialProducto: [],
  
  // Paginación
  paginacionMovimientos: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  
  // Alertas y estadísticas
  alertas: [],
  estadisticas: null,
  
  // Estados de carga
  loading: false,
  loadingMovimientos: false,
  loadingAlertas: false,
  loadingEstadisticas: false,
  
  // Errores
  error: null,
  errorMovimientos: null,
  
  // Filtros
  filtrosMovimientos: {
    tipo: '',
    productoId: '',
    fechaInicio: '',
    fechaFin: '',
    usuario: ''
  }
}

const inventarioSlice = createSlice({
  name: 'inventario',
  initialState,
  reducers: {
    // Limpiar errores
    clearError: (state) => {
      state.error = null
      state.errorMovimientos = null
    },
    
    // Seleccionar producto
    setProducto: (state, action) => {
      state.producto = action.payload
    },
    
    // Gestionar filtros
    setFiltrosMovimientos: (state, action) => {
      state.filtrosMovimientos = { ...state.filtrosMovimientos, ...action.payload }
    },
    
    clearFiltrosMovimientos: (state) => {
      state.filtrosMovimientos = initialState.filtrosMovimientos
    },
    
    // Limpiar datos
    clearMovimientos: (state) => {
      state.movimientos = []
    },
    
    clearHistorialProducto: (state) => {
      state.historialProducto = []
    }
  },
  extraReducers: (builder) => {
    builder
      // ========== PRODUCTOS ==========
      .addCase(obtenerProductos.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(obtenerProductos.fulfilled, (state, action) => {
        state.loading = false

        
        // El thunk ya procesó la respuesta y devolvió el array correcto
        const productos = Array.isArray(action.payload) ? action.payload : []
        state.productos = productos
        

      })
      .addCase(obtenerProductos.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Error al obtener productos'
        state.productos = [] // Asegurar que productos sea siempre un array
      })
      
      // Productos con stock bajo
      .addCase(obtenerProductosStockBajo.fulfilled, (state, action) => {
        // Manejar la estructura: { data: { productos: [...] } }
        state.productosStockBajo = action.payload?.data?.productos || action.payload?.productos || action.payload || []
      })
      
      // Crear producto
      .addCase(crearProducto.fulfilled, (state, action) => {
        state.productos.push(action.payload)
      })
      .addCase(crearProducto.rejected, (state, action) => {
        state.error = action.payload?.message || 'Error al crear producto'
      })
      
      // Actualizar producto
      .addCase(actualizarProducto.fulfilled, (state, action) => {
        const index = state.productos.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.productos[index] = action.payload
        }
      })
      
      // ========== MOVIMIENTOS ==========
      .addCase(obtenerMovimientos.pending, (state) => {
        state.loadingMovimientos = true
        state.errorMovimientos = null
      })
      .addCase(obtenerMovimientos.fulfilled, (state, action) => {
        state.loadingMovimientos = false

        
        // El thunk ya procesó la respuesta y devolvió el array correcto
        const movimientos = Array.isArray(action.payload) ? action.payload : []
        state.movimientos = movimientos
        

      })
      .addCase(obtenerMovimientos.rejected, (state, action) => {
        state.loadingMovimientos = false
        state.errorMovimientos = action.payload?.message || 'Error al obtener movimientos'
        state.movimientos = [] // Asegurar que movimientos sea siempre un array
      })
      
      // Crear movimiento
      .addCase(crearMovimiento.pending, (state) => {
        state.loading = true
      })
      .addCase(crearMovimiento.fulfilled, (state, action) => {
        state.loading = false
        
        // La respuesta del ajuste de stock incluye información del producto
        const responseData = action.payload?.data || action.payload
        
        // Actualizar stock del producto en la lista si existe
        if (responseData?.producto_id) {
          const productoIndex = state.productos.findIndex(p => p.id === responseData.producto_id)
          if (productoIndex !== -1) {
            // Actualizamos stock_actual según el nuevo contrato
            if (typeof responseData.stock_nuevo !== 'undefined') {
              state.productos[productoIndex].stock_actual = responseData.stock_nuevo
            }
          }
        }
      })
      .addCase(crearMovimiento.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Error al crear movimiento'
      })
      
      // Historial por producto
      .addCase(obtenerHistorialProducto.fulfilled, (state, action) => {
        state.historialProducto = action.payload?.data || action.payload || []
      })
      
      // ========== ALERTAS ==========
      .addCase(obtenerAlertas.pending, (state) => {
        state.loadingAlertas = true
      })
      .addCase(obtenerAlertas.fulfilled, (state, action) => {
        state.loadingAlertas = false
        state.alertas = action.payload
      })
      .addCase(obtenerAlertas.rejected, (state, action) => {
        state.loadingAlertas = false
        state.error = action.payload?.message || 'Error al obtener alertas'
      })
      
      // ========== ESTADÍSTICAS ==========
      .addCase(obtenerEstadisticasInventario.pending, (state) => {
        state.loadingEstadisticas = true
      })
      .addCase(obtenerEstadisticasInventario.fulfilled, (state, action) => {
        state.loadingEstadisticas = false
        state.estadisticas = action.payload
      })
      .addCase(obtenerEstadisticasInventario.rejected, (state, action) => {
        state.loadingEstadisticas = false
        state.error = action.payload?.message || 'Error al obtener estadísticas'
      })
  }
})

export const { 
  clearError, 
  setProducto,
  setFiltrosMovimientos,
  clearFiltrosMovimientos,
  clearMovimientos,
  clearHistorialProducto
} = inventarioSlice.actions

export default inventarioSlice.reducer