import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  empleados: [],
  loading: false,
  error: null
}

const recursosHumanosSlice = createSlice({
  name: 'recursosHumanos',
  initialState,
  reducers: {
    setEmpleados: (state, action) => {
      state.empleados = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const { setEmpleados, clearError } = recursosHumanosSlice.actions
export default recursosHumanosSlice.reducer