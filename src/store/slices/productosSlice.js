import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import productosService from '../../services/productosService'

// Async thunks para productos
export const obtenerTodosProductos = createAsyncThunk(
  'productos/obtenerTodos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productosService.obtenerTodos()
      return response.data
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
      // Simular creación local sin backend
      const nuevoProducto = {
        id: Date.now(), // ID temporal usando timestamp
        ...producto,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      }
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return nuevoProducto
    } catch (error) {
      return rejectWithValue('Error al crear producto localmente')
    }
  }
)

export const actualizarProducto = createAsyncThunk(
  'productos/actualizar',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Simular actualización local sin backend
      const productoActualizado = {
        id,
        ...data,
        fecha_actualizacion: new Date().toISOString()
      }
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return productoActualizado
    } catch (error) {
      return rejectWithValue('Error al actualizar producto localmente')
    }
  }
)

export const eliminarProducto = createAsyncThunk(
  'productos/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      // Simular eliminación local sin backend
      await new Promise(resolve => setTimeout(resolve, 300))
      return id
    } catch (error) {
      return rejectWithValue('Error al eliminar producto localmente')
    }
  }
)

export const buscarProductoPorCodigo = createAsyncThunk(
  'productos/buscarPorCodigo',
  async (codigo, { rejectWithValue }) => {
    try {
      const response = await productosService.buscarPorCodigo(codigo)
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
      return response.data
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
        state.productos = action.payload
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
        state.productosStockBajo = action.payload
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