import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import inventarioSlice from './slices/inventarioSlice'
import recursosHumanosSlice from './slices/recursosHumanosSlice'
import contabilidadSlice from './slices/contabilidadSlice'
import ventasSlice from './slices/ventasSlice'
import comprasSlice from './slices/comprasSlice'
import proveedoresSlice from './slices/proveedoresSlice'
import clientesSlice from './slices/clientesSlice'
import productosSlice from './slices/productosSlice'
import dashboardSlice from './slices/dashboardSlice'
import sucursalesSlice from './slices/sucursalesSlice'
import usuariosSlice from './slices/usuariosSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    inventario: inventarioSlice,
    recursosHumanos: recursosHumanosSlice,
    contabilidad: contabilidadSlice,
    ventas: ventasSlice,
    compras: comprasSlice,
    proveedores: proveedoresSlice,
    clientes: clientesSlice,
    productos: productosSlice,
    dashboard: dashboardSlice,
    sucursales: sucursalesSlice,
    usuarios: usuariosSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})