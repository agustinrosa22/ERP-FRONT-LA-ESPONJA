import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import sucursalesService from '../../services/sucursalesService'

export const fetchSucursales = createAsyncThunk(
  'sucursales/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await sucursalesService.listar()
      // backend puede responder { success, data }
      return data.data || data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al cargar sucursales')
    }
  }
)

export const crearSucursal = createAsyncThunk(
  'sucursales/crear',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await sucursalesService.crear(payload)
      return data.data || data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al crear sucursal')
    }
  }
)

export const actualizarSucursal = createAsyncThunk(
  'sucursales/actualizar',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await sucursalesService.actualizar(id, payload)
      return data.data || data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al actualizar sucursal')
    }
  }
)

export const eliminarSucursal = createAsyncThunk(
  'sucursales/eliminar',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await sucursalesService.eliminar(id)
      return { id, data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Error al eliminar sucursal')
    }
  }
)

const initialState = {
  items: [],
  loading: false,
  error: null,
  selectedSucursalId: localStorage.getItem('selectedSucursalId') || null,
}

const sucursalesSlice = createSlice({
  name: 'sucursales',
  initialState,
  reducers: {
    setSelectedSucursalId: (state, action) => {
      state.selectedSucursalId = action.payload
      if (action.payload) {
        localStorage.setItem('selectedSucursalId', action.payload)
      } else {
        localStorage.removeItem('selectedSucursalId')
      }
    },
    clearSucursalesError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSucursales.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSucursales.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchSucursales.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al cargar sucursales'
      })
      .addCase(crearSucursal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(crearSucursal.fulfilled, (state, action) => {
        state.loading = false
        // si backend devuelve la entidad creada, la agregamos
        if (action.payload) {
          state.items = [action.payload, ...state.items]
        }
      })
      .addCase(crearSucursal.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al crear sucursal'
      })
      .addCase(actualizarSucursal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(actualizarSucursal.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.items = state.items.map((s) => (String(s.id) === String(action.payload.id) ? action.payload : s))
        }
      })
      .addCase(actualizarSucursal.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al actualizar sucursal'
      })
      .addCase(eliminarSucursal.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(eliminarSucursal.fulfilled, (state, action) => {
        state.loading = false
        const id = action.payload?.id
        if (id !== undefined) {
          state.items = state.items.filter((s) => String(s.id) !== String(id))
          // si se elimina la sucursal seleccionada, limpiarla
          if (String(state.selectedSucursalId) === String(id)) {
            state.selectedSucursalId = null
            localStorage.removeItem('selectedSucursalId')
          }
        }
      })
      .addCase(eliminarSucursal.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al eliminar sucursal'
      })
  }
})

export const { setSelectedSucursalId, clearSucursalesError } = sucursalesSlice.actions
export default sucursalesSlice.reducer
