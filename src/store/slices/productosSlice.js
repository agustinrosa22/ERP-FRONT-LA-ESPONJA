import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import productosService from '../../services/productosService'

// Async thunks para productos
export const obtenerTodosProductos = createAsyncThunk(
  'productos/obtenerTodos',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productosService.obtenerTodos(params)
      // Manejar diferentes estructuras de respuesta del backend
      if (response.data?.success) {
        // El backend puede devolver { success, data: { productos: [], pagination: {...} } } o un array directo
        if (Array.isArray(response.data.data)) return response.data.data
        if (Array.isArray(response.data.data?.productos)) return response.data.data.productos
        return response.data.data || []
      }
      // Si devuelve directamente un array
      if (Array.isArray(response.data)) return response.data
      // Si devuelve objeto con productos
      if (Array.isArray(response.data?.productos)) return response.data.productos
      return []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener productos')
    }
  }
)

export const obtenerProductoPorId = createAsyncThunk(
  'productos/obtenerPorId',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productosService.obtenerPorId(id)
      // Manejar diferentes estructuras de respuesta del backend
      if (response.data?.success) {
        return response.data.data
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener producto')
    }
  }
)

export const crearProducto = createAsyncThunk(
  'productos/crear',
  async (producto, { rejectWithValue }) => {
    try {
      const response = await productosService.crear(producto)
      // Manejar diferentes estructuras de respuesta del backend
      if (response.data?.success) {
        return response.data.data
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear producto')
    }
  }
)

export const actualizarProducto = createAsyncThunk(
  'productos/actualizar',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await productosService.actualizar(id, data)
      // Manejar diferentes estructuras de respuesta del backend
      if (response.data?.success) {
        return response.data.data
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar producto')
    }
  }
)

export const eliminarProducto = createAsyncThunk(
  'productos/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      await productosService.eliminar(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar producto')
    }
  }
)

export const buscarProductoPorCodigo = createAsyncThunk(
  'productos/buscarPorCodigo',
  async (payload, { rejectWithValue }) => {
    try {
      const codigo = typeof payload === 'string' ? payload : payload?.codigo
      const params = typeof payload === 'object' && payload ? (payload.params || {}) : {}
      const response = await productosService.buscarPorCodigo(codigo, params)
      // Manejar diferentes estructuras de respuesta del backend
      if (response.data?.success) {
        return response.data.data
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al buscar producto')
    }
  }
)

export const obtenerProductosStockBajo = createAsyncThunk(
  'productos/stockBajo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productosService.obtenerStockBajo()
      // Manejar diferentes estructuras de respuesta del backend
      if (response.data?.success) {
        return Array.isArray(response.data.data) ? response.data.data : []
      }
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al obtener productos con stock bajo')
    }
  }
)

const productosSlice = createSlice({
  name: 'productos',
  initialState: {
    productos: [],
    productosStockBajo: [],
    productoActual: null,
    searchResults: [],
    loading: false,
    error: null,
    filtros: {
      categoria: '',
      activo: 'todos',
      stockBajo: false
    },
    categorias: [
      'Ácidos',
      'Bases',
      'Sales',
      'Solventes',
      'Reactivos',
      'Materiales de Laboratorio',
      'Equipamiento',
      'Otros'
    ],
    unidadesMedida: [
      'kg',
      'g',
      'L',
      'mL',
      'unidad',
      'caja',
      'paquete',
      'm²',
      'm³'
    ]
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSearchResults: (state) => {
      state.searchResults = []
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload
    },
    setFiltros: (state, action) => {
      state.filtros = { ...state.filtros, ...action.payload }
    },
    clearProductoActual: (state) => {
      state.productoActual = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Obtener todos los productos
      .addCase(obtenerTodosProductos.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(obtenerTodosProductos.fulfilled, (state, action) => {
        state.loading = false
        state.productos = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(obtenerTodosProductos.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Obtener producto por ID
      .addCase(obtenerProductoPorId.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(obtenerProductoPorId.fulfilled, (state, action) => {
        state.loading = false
        state.productoActual = action.payload
      })
      .addCase(obtenerProductoPorId.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Crear producto
      .addCase(crearProducto.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(crearProducto.fulfilled, (state, action) => {
        state.loading = false
        // Asegurar que productos sea un array antes de hacer push
        if (!Array.isArray(state.productos)) {
          state.productos = []
        }
        state.productos.push(action.payload)
      })
      .addCase(crearProducto.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Actualizar producto
      .addCase(actualizarProducto.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(actualizarProducto.fulfilled, (state, action) => {
        state.loading = false
        // Asegurar que productos sea un array antes de buscar
        if (!Array.isArray(state.productos)) {
          state.productos = []
        }
        const index = state.productos.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.productos[index] = action.payload
        }
        state.productoActual = action.payload
      })
      .addCase(actualizarProducto.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Eliminar producto
      .addCase(eliminarProducto.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(eliminarProducto.fulfilled, (state, action) => {
        state.loading = false
        // Asegurar que productos sea un array antes de filtrar
        if (!Array.isArray(state.productos)) {
          state.productos = []
        }
        state.productos = state.productos.filter(p => p.id !== action.payload)
      })
      .addCase(eliminarProducto.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Buscar producto por código
      .addCase(buscarProductoPorCodigo.fulfilled, (state, action) => {
        state.searchResults = [action.payload]
      })
      .addCase(buscarProductoPorCodigo.rejected, (state, action) => {
        state.error = action.payload
      })

      // Productos con stock bajo
      .addCase(obtenerProductosStockBajo.fulfilled, (state, action) => {
        // Asegurar que siempre sea un array
        state.productosStockBajo = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(obtenerProductosStockBajo.rejected, (state, action) => {
        state.error = action.payload
      })
  }
})

export const {
  clearError,
  clearSearchResults,
  setSearchResults,
  setFiltros,
  clearProductoActual
} = productosSlice.actions

export default productosSlice.reducer