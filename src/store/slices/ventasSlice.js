import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  ventas: [],
  clientes: [],
  loading: false,
  error: null
}

const ventasSlice = createSlice({
  name: 'ventas',
  initialState,
  reducers: {
    setVentas: (state, action) => {
      state.ventas = action.payload
    },
    setClientes: (state, action) => {
      state.clientes = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const { setVentas, setClientes, clearError } = ventasSlice.actions
export default ventasSlice.reducer