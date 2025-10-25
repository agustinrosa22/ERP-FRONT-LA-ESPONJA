import api from './api'
import contabilidadService from './contabilidadService'

// Servicio para datos del dashboard
const dashboardService = {
  // Obtener estadísticas generales del dashboard
  obtenerEstadisticasDashboard: async () => {
    try {
      const response = await api.get('/dashboard/estadisticas')
      return response.data
    } catch (error) {
      // Si no existe endpoint específico, construir datos desde otros endpoints
      console.warn('Endpoint /dashboard/estadisticas no encontrado, construyendo datos...')
      return await dashboardService.construirEstadisticas()
    }
  },

  // Construir estadísticas desde diferentes endpoints
  construirEstadisticas: async () => {
    try {
      console.log('🏗️ Construyendo estadísticas del dashboard...')
      
      const [productos, ventas, movimientosCaja, stockBajo] = await Promise.all([
        api.get('/productos').catch(() => ({ data: { data: { productos: [] } } })),
        api.get('/ventas').catch(() => ({ data: { data: { ventas: [] } } })),
        contabilidadService.obtenerMovimientos({ limite: 20 }).catch(() => ({ success: false, data: { movimientos: [] } })),
        api.get('/productos/stock-bajo').catch(() => ({ data: { success: true, data: { productos: [], total: 0 } } }))
      ])

      const productosData = productos.data?.data?.productos || []
      const ventasData = ventas.data?.data?.ventas || []
      const movimientosData = movimientosCaja.success ? movimientosCaja.data.movimientos : []
      const stockBajoData = stockBajo.data?.data?.productos || []
      
      console.log('📊 Datos obtenidos:', {
        productos: productosData.length,
        ventas: ventasData.length, 
        movimientos: movimientosData.length,
        productosBajoStock: stockBajoData.length
      })

      // Calcular stock total
      const stockTotal = productosData.reduce((total, producto) => {
        return total + (parseInt(producto.stock) || 0)
      }, 0)

      // Calcular estadísticas financieras desde movimientos de caja
      const ingresos = movimientosData.filter(m => m.tipo === 'ingreso')
      const egresos = movimientosData.filter(m => m.tipo === 'egreso')
      
      const totalIngresos = ingresos.reduce((sum, m) => sum + (parseFloat(m.monto) || 0), 0)
      const totalEgresos = egresos.reduce((sum, m) => sum + (parseFloat(m.monto) || 0), 0)
      const balanceTotal = totalIngresos - totalEgresos

      // Movimientos de hoy
      const hoy = new Date().toISOString().split('T')[0]
      const movimientosHoy = movimientosData.filter(m => m.fecha.startsWith(hoy))
      const ingresosHoy = movimientosHoy.filter(m => m.tipo === 'ingreso').reduce((sum, m) => sum + (parseFloat(m.monto) || 0), 0)
      const egresosHoy = movimientosHoy.filter(m => m.tipo === 'egreso').reduce((sum, m) => sum + (parseFloat(m.monto) || 0), 0)
      const balanceHoy = ingresosHoy - egresosHoy

      // Calcular actividad reciente
      const actividadReciente = movimientosData.slice(0, 5).map(movimiento => ({
        tipo: movimiento.tipo === 'ingreso' ? 'venta' : 'compra',
        descripcion: movimiento.descripcion,
        monto: movimiento.monto,
        fecha: movimiento.fecha,
        icon: movimiento.tipo === 'ingreso' ? '💰' : '🛒'
      }))

      // Calcular productos con bajo stock (más preciso)
      const productosBajoStockData = productosData.filter(p => {
        const stock = parseInt(p.stock) || 0
        const stockMinimo = parseInt(p.stock_minimo) || 0
        
        // Solo considerar bajo stock si:
        // 1. El stock_minimo está definido y es mayor a 0
        // 2. El stock actual es menor al stock mínimo
        const esBajoStock = stockMinimo > 0 && stock < stockMinimo
        
        if (esBajoStock) {
          console.log(`📦 Producto bajo stock: ${p.nombre}, Stock: ${stock}, Mínimo: ${stockMinimo}`)
        }
        
        return esBajoStock
      })
      
      console.log('� Análisis de stock:', {
        totalProductos: productosData.length,
        productosBajoStock: productosBajoStockData.length,
        productosConStockMinimo: productosData.filter(p => (parseInt(p.stock_minimo) || 0) > 0).length
      })

      console.log('�💰 Estadísticas calculadas:', {
        totalIngresos,
        totalEgresos, 
        balanceTotal,
        ingresosHoy,
        egresosHoy,
        balanceHoy
      })

      return {
        success: true,
        data: {
          estadisticas: {
            productos_stock: stockTotal,
            ventas_mes: totalIngresos, // Usando total de ingresos como ventas del mes
            empleados_activos: 1, // Por ahora fijo
            pedidos_pendientes: ventasData.filter(v => v.estado === 'pendiente').length,
            balance_dia: balanceHoy,
            balance_mes: balanceTotal
          },
          actividad_reciente: actividadReciente,
          resumen_financiero: {
            ingresos_hoy: ingresosHoy,
            egresos_hoy: egresosHoy,
            balance_hoy: balanceHoy,
            ingresos_mes: totalIngresos,
            egresos_mes: totalEgresos,
            balance_mes: balanceTotal,
            total_productos: productosData.length,
            productos_bajo_stock: stockBajoData.length
          }
        }
      }
    } catch (error) {
      console.error('Error construyendo estadísticas:', error)
      throw new Error('Error al obtener datos del dashboard')
    }
  },

  // Obtener actividad reciente
  obtenerActividadReciente: async () => {
    try {
      const response = await api.get('/dashboard/actividad')
      return response.data
    } catch (error) {
      // Fallback: obtener de movimientos de caja
      const estadisticas = await contabilidadService.obtenerEstadisticas('semana')
      if (estadisticas.success && estadisticas.data.movimientos_recientes) {
        return {
          success: true,
          data: estadisticas.data.movimientos_recientes.slice(0, 10)
        }
      }
      throw new Error('Error al obtener actividad reciente')
    }
  },

  // Obtener productos con bajo stock
  obtenerProductosBajoStock: async () => {
    try {
      console.log('📦 Consultando productos con stock bajo...')
      const response = await api.get('/productos/stock-bajo')
      console.log('📦 Respuesta stock bajo:', response.data)
      return response.data
    } catch (error) {
      console.error('Error al obtener productos bajo stock:', error)
      // Fallback: obtener todos los productos y filtrar
      const productos = await api.get('/productos')
      const productosBajoStock = productos.data?.data?.productos?.filter(p => {
        const stock = parseInt(p.stock) || 0
        const stockMinimo = parseInt(p.stock_minimo) || 0
        
        // Solo considerar bajo stock si el stock_minimo está definido y es mayor a 0
        return stockMinimo > 0 && stock < stockMinimo
      }) || []
      
      console.log('📦 Productos bajo stock encontrados (fallback):', productosBajoStock.length)
      
      return {
        success: true,
        data: { productos: productosBajoStock }
      }
    }
  }
}

export default dashboardService