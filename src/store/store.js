import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import inventarioSlice from './slices/inventarioSlice'
import recursosHumanosSlice from './slices/recursosHumanosSlice'
import contabilidadSlice from './slices/contabilidadSlice'
import ventasSlice from './slices/ventasSlice'
import comprasSlice from './slices/comprasSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    inventario: inventarioSlice,
    recursosHumanos: recursosHumanosSlice,
    contabilidad: contabilidadSlice,
    ventas: ventasSlice,
    compras: comprasSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})