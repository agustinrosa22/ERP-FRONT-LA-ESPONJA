import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cuentas: [],
  transacciones: [],
  loading: false,
  error: null
}

const contabilidadSlice = createSlice({
  name: 'contabilidad',
  initialState,
  reducers: {
    setCuentas: (state, action) => {
      state.cuentas = action.payload
    },
    setTransacciones: (state, action) => {
      state.transacciones = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const { setCuentas, setTransacciones, clearError } = contabilidadSlice.actions
export default contabilidadSlice.reducer