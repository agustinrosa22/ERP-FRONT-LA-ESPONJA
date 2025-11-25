import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { actualizarStockSucursal, crearStockSucursal } from '../../store/slices/stockSucursalSlice'
import { crearMovimiento } from '../../store/slices/inventarioSlice'
import './StockModal.css'

const StockModal = ({ stock, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const { loading } = useSelector(state => state.stockSucursal)
  const { usuario } = useSelector(state => state.auth)
  const { productos = [] } = useSelector(state => state.productos)
  const { items: sucursales = [] } = useSelector(state => state.sucursales || {})
  
  const [formData, setFormData] = useState({
    producto_id: '',
    sucursal_id: '',
    cantidad: '',
    stock_minimo: '',
    stock_maximo: '',
    ubicacion: '',
    motivo: '',
    tipo_movimiento: 'entrada'
  })

  const [errors, setErrors] = useState({})

  const esAdmin = (usuario?.rol || '').toLowerCase() === 'admin'

  const getSucursalesDisponibles = () => {
    if (esAdmin) {
      return sucursales
    } else {
      // Si no es admin, solo mostrar su sucursal
      const userSucursal = sucursales.find(s => s.id === usuario?.sucursal_id)
      return userSucursal ? [userSucursal] : []
    }
  }

  useEffect(() => {
    // Si es edición, cargar datos del stock
    if (stock) {
      setFormData({
        producto_id: stock.producto_id || '',
        sucursal_id: stock.sucursal_id || usuario?.sucursal_id || '',
        cantidad: '',
        stock_minimo: stock.stock_minimo || '',
        stock_maximo: stock.stock_maximo || '',
        ubicacion: stock.ubicacion || '',
        motivo: '',
        tipo_movimiento: 'entrada'
      })
    } else {
      // Para nuevo stock, preseleccionar sucursal del usuario si no es admin
      setFormData(prev => ({
        ...prev,
        sucursal_id: esAdmin ? '' : (usuario?.sucursal_id || '')
      }))
    }
  }, [stock, usuario, esAdmin])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.producto_id) {
      newErrors.producto_id = 'Seleccione un producto'
    }

    if (!formData.sucursal_id) {
      newErrors.sucursal_id = 'Seleccione una sucursal'
    }

    if (!formData.cantidad || isNaN(formData.cantidad) || parseFloat(formData.cantidad) < 0) {
      newErrors.cantidad = 'Ingrese una cantidad válida'
    }

    if (formData.stock_minimo && (isNaN(formData.stock_minimo) || parseFloat(formData.stock_minimo) < 0)) {
      newErrors.stock_minimo = 'El stock mínimo debe ser un número válido'
    }

    if (formData.stock_maximo && (isNaN(formData.stock_maximo) || parseFloat(formData.stock_maximo) < 0)) {
      newErrors.stock_maximo = 'El stock máximo debe ser un número válido'
    }

    if (!formData.motivo.trim()) {
      newErrors.motivo = 'Ingrese el motivo del movimiento'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const stockData = {
        ...formData,
        cantidad: parseFloat(formData.cantidad),
        stock_minimo: formData.stock_minimo ? parseFloat(formData.stock_minimo) : null,
        stock_maximo: formData.stock_maximo ? parseFloat(formData.stock_maximo) : null,
        usuario_id: usuario?.id
      }

      let result
      if (stock?.id) {
        // Actualizar stock existente
        result = await dispatch(actualizarStockSucursal({
          id: stock.id,
          ...stockData
        }))
      } else {
        // Crear nuevo stock
        result = await dispatch(crearStockSucursal(stockData))
      }

      if (result.type.endsWith('/fulfilled')) {
        onSuccess?.()
        onClose()
      }
    } catch (error) {
      console.error('Error al guardar stock:', error)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content stock-modal">
        <div className="modal-header">
          <h2>
            {stock?.id ? '📝 Actualizar Stock' : '➕ Nuevo Stock'}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="stock-form">
          <div className="form-row">
            <div className="form-group">
              <label>Producto *</label>
              <select
                name="producto_id"
                value={formData.producto_id}
                onChange={handleInputChange}
                disabled={stock?.id} // No cambiar producto en edición
                className={errors.producto_id ? 'error' : ''}
              >
                <option value="">Seleccionar producto</option>
                {productos.map(producto => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} ({producto.codigo_producto})
                  </option>
                ))}
              </select>
              {errors.producto_id && <span className="error-message">{errors.producto_id}</span>}
            </div>

            <div className="form-group">
              <label>Sucursal *</label>
              <select
                name="sucursal_id"
                value={formData.sucursal_id}
                onChange={handleInputChange}
                disabled={stock?.id || !esAdmin} // No cambiar sucursal en edición o si no es admin
                className={errors.sucursal_id ? 'error' : ''}
              >
                <option value="">Seleccionar sucursal</option>
                {getSucursalesDisponibles().map(sucursal => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
                  </option>
                ))}
              </select>
              {errors.sucursal_id && <span className="error-message">{errors.sucursal_id}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Movimiento *</label>
              <select
                name="tipo_movimiento"
                value={formData.tipo_movimiento}
                onChange={handleInputChange}
              >
                <option value="entrada">➕ Entrada (Agregar stock)</option>
                <option value="salida">➖ Salida (Quitar stock)</option>
                <option value="ajuste">🔄 Ajuste (Corregir stock)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Cantidad *</label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleInputChange}
                placeholder="0"
                step="0.01"
                min="0"
                className={errors.cantidad ? 'error' : ''}
              />
              {errors.cantidad && <span className="error-message">{errors.cantidad}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Stock Mínimo</label>
              <input
                type="number"
                name="stock_minimo"
                value={formData.stock_minimo}
                onChange={handleInputChange}
                placeholder="0"
                step="0.01"
                min="0"
                className={errors.stock_minimo ? 'error' : ''}
              />
              {errors.stock_minimo && <span className="error-message">{errors.stock_minimo}</span>}
            </div>

            <div className="form-group">
              <label>Stock Máximo</label>
              <input
                type="number"
                name="stock_maximo"
                value={formData.stock_maximo}
                onChange={handleInputChange}
                placeholder="0"
                step="0.01"
                min="0"
                className={errors.stock_maximo ? 'error' : ''}
              />
              {errors.stock_maximo && <span className="error-message">{errors.stock_maximo}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Ubicación</label>
            <input
              type="text"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleInputChange}
              placeholder="Ej: Estante A-1, Depósito Norte..."
            />
          </div>

          <div className="form-group">
            <label>Motivo *</label>
            <textarea
              name="motivo"
              value={formData.motivo}
              onChange={handleInputChange}
              placeholder="Describa el motivo del movimiento..."
              rows="3"
              className={errors.motivo ? 'error' : ''}
            />
            {errors.motivo && <span className="error-message">{errors.motivo}</span>}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (stock?.id ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StockModal