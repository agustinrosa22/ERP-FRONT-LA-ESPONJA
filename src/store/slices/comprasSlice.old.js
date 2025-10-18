import { createSlice } from '@reduxjs/toolkit'
// import comprasService from '../../services/comprasService' // TODO: Habilitar cuando endpoints estén disponibles

// Estados iniciales
const initialState = {
  // Lista de compras
  compras: [],
  compraSeleccionada: null,
  
  // Paginación
  totalCompras: 0,
  paginaActual: 1,
  totalPaginas: 1,
  
  // Filtros
  filtrosCompras: {
    busqueda: '',
    proveedor_id: '',
    estado: 'todos', // todos, pendiente, confirmada, recibida, cancelada
    fechaDesde: '',
    fechaHasta: '',
    ordenarPor: 'fecha',
    orden: 'DESC',
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
  
  // Estadísticas de compras
  estadisticasCompras: null
}

// TODO: Los siguientes thunks están comentados porque los endpoints del backend no están disponibles
// Implementar cuando el backend tenga los endpoints de compras funcionando:
// - obtenerCompras
// - obtenerCompraPorId  
// - crearCompra
// - actualizarCompra
// - eliminarCompra
// - cambiarEstadoCompra
// - obtenerEstadisticasCompras
// - obtenerComprasPorProveedor

// Slice de compras
const comprasSlice = createSlice({
  name: 'compras',
  initialState,
  reducers: {
    // Limpiar errores
    clearError: (state) => {
      state.error = null
    },
    
    // Establecer filtros
    setFiltrosCompras: (state, action) => {
      state.filtrosCompras = { ...state.filtrosCompras, ...action.payload }
    },
    
    // Limpiar filtros
    clearFiltrosCompras: (state) => {
      state.filtrosCompras = initialState.filtrosCompras
    },
    
    // Seleccionar compra
    seleccionarCompra: (state, action) => {
      state.compraSeleccionada = action.payload
    },
    
    // Limpiar compra seleccionada
    clearCompraSeleccionada: (state) => {
      state.compraSeleccionada = null
    },
    
    // Limpiar estadísticas
    clearEstadisticasCompras: (state) => {
      state.estadisticasCompras = null
    }
  },
  extraReducers: (builder) => {
    // TODO: Agregar casos cuando se implementen los thunks del backend
    // TODO: Implementar casos cuando los thunks estén disponibles
    // Placeholder para evitar errores de sintaxis
        state.loadingDetalle = true
        state.error = null
      })
      .addCase(obtenerCompraPorId.fulfilled, (state, action) => {
        state.loadingDetalle = false
        if (action.payload.success) {
          state.compraSeleccionada = action.payload.data.compra
        }
      })
      .addCase(obtenerCompraPorId.rejected, (state, action) => {
        state.loadingDetalle = false
        state.error = action.payload
      })
      
      // Crear compra
      .addCase(crearCompra.pending, (state) => {
        state.loadingCrear = true
        state.error = null
      })
      .addCase(crearCompra.fulfilled, (state, action) => {
        state.loadingCrear = false
        if (action.payload.success) {
          state.compras.unshift(action.payload.data.compra)
        }
      })
      .addCase(crearCompra.rejected, (state, action) => {
        state.loadingCrear = false
        state.error = action.payload
      })
      
      // Actualizar compra
      .addCase(actualizarCompra.pending, (state) => {
        state.loadingActualizar = true
        state.error = null
      })
      .addCase(actualizarCompra.fulfilled, (state, action) => {
        state.loadingActualizar = false
        if (action.payload.success) {
          const index = state.compras.findIndex(c => c.id === action.payload.data.compra.id)
          if (index !== -1) {
            state.compras[index] = action.payload.data.compra
          }
          if (state.compraSeleccionada?.id === action.payload.data.compra.id) {
            state.compraSeleccionada = action.payload.data.compra
          }
        }
      })
      .addCase(actualizarCompra.rejected, (state, action) => {
        state.loadingActualizar = false
        state.error = action.payload
      })
      
      // Confirmar recepción
      .addCase(confirmarRecepcion.pending, (state) => {
        state.loadingActualizar = true
        state.error = null
      })
      .addCase(confirmarRecepcion.fulfilled, (state, action) => {
        state.loadingActualizar = false
        if (action.payload.success) {
          const index = state.compras.findIndex(c => c.id === action.payload.data.compra.id)
          if (index !== -1) {
            state.compras[index] = action.payload.data.compra
          }
          if (state.compraSeleccionada?.id === action.payload.data.compra.id) {
            state.compraSeleccionada = action.payload.data.compra
          }
        }
      })
      .addCase(confirmarRecepcion.rejected, (state, action) => {
        state.loadingActualizar = false
        state.error = action.payload
      })
      
      // TODO: Habilitar cuando el backend tenga el endpoint de estadísticas
      // // Obtener estadísticas de compras
      // .addCase(obtenerEstadisticasCompras.pending, (state) => {
      //   state.loadingEstadisticas = true
      //   state.error = null
      // })
      // .addCase(obtenerEstadisticasCompras.fulfilled, (state, action) => {
      //   state.loadingEstadisticas = false
      //   if (action.payload.success) {
      //     state.estadisticasCompras = action.payload.data.estadisticas
      //   }
      // })
      // .addCase(obtenerEstadisticasCompras.rejected, (state, action) => {
      //   state.loadingEstadisticas = false
      //   state.error = action.payload
      // })
  }
})

export const {
  clearError,
  setFiltrosCompras,
  clearFiltrosCompras,
  seleccionarCompra,
  clearCompraSeleccionada,
  clearEstadisticasCompras
} = comprasSlice.actions

export default comprasSlice.reducer