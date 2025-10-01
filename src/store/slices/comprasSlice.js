import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  compras: [],
  proveedores: [],
  loading: false,
  error: null
}

const comprasSlice = createSlice({
  name: 'compras',
  initialState,
  reducers: {
    setCompras: (state, action) => {
      state.compras = action.payload
    },
    setProveedores: (state, action) => {
      state.proveedores = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const { setCompras, setProveedores, clearError } = comprasSlice.actions
export default comprasSlice.reducer