import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { crearMovimiento } from '../../store/slices/inventarioSlice'
import './MovimientoForm.css'

const MovimientoForm = ({ onClose, onSuccess, productoPreseleccionado }) => {
  const dispatch = useDispatch()
  const { productos, loading } = useSelector(state => state.inventario)

  const [formData, setFormData] = useState({
    producto_id: productoPreseleccionado?.producto?.id || '',
    tipo: productoPreseleccionado?.tipoMovimiento || 'entrada',
    cantidad: '',
    motivo: '',
    precio_unitario: '',
    observaciones: ''
  })

  const [errors, setErrors] = useState({})
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)

  useEffect(() => {
    if (productos.length === 0) {
      dispatch(obtenerProductos())
    }
  }, [dispatch, productos.length])

  useEffect(() => {
    if (formData.producto_id) {
      const producto = productos.find(p => p.id === parseInt(formData.producto_id))
      setProductoSeleccionado(producto)
    } else {
      setProductoSeleccionado(null)
    }
  }, [formData.producto_id, productos])

  const tiposMovimiento = [
    { value: 'entrada', label: 'Entrada', description: 'Ingreso de mercadería' },
    { value: 'salida', label: 'Salida', description: 'Egreso de mercadería' },
    { value: 'ajuste', label: 'Ajuste', description: 'Corrección de inventario' }
  ]

  const motivosComunes = {
    entrada: [
      'Compra de mercadería',
      'Devolución de cliente',
      'Producción interna',
      'Transferencia de sucursal',
      'Otros'
    ],
    salida: [
      'Venta',
      'Pérdida',
      'Rotura',
      'Vencimiento',
      'Uso interno',
      'Transferencia a sucursal',
      'Otros'
    ],
    ajuste: [
      'Diferencia de inventario',
      'Error de registro',
      'Corrección de sistema',
      'Otros'
    ]
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.producto_id) {
      newErrors.producto_id = 'Debe seleccionar un producto'
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Debe seleccionar un tipo de movimiento'
    }

    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0'
    }

    // Validar stock disponible para salidas
    if (formData.tipo === 'salida' && productoSeleccionado) {
      const cantidadSalida = parseFloat(formData.cantidad)
      if (cantidadSalida > productoSeleccionado.stock) {
        newErrors.cantidad = `Stock insuficiente. Disponible: ${productoSeleccionado.stock}`
      }
    }

    if (!formData.motivo.trim()) {
      newErrors.motivo = 'El motivo es requerido'
    }

    if (formData.precio_unitario && parseFloat(formData.precio_unitario) < 0) {
      newErrors.precio_unitario = 'El precio debe ser mayor o igual a 0'
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
      await dispatch(crearMovimiento(formData)).unwrap()
      
      alert(`Movimiento de ${formData.tipo} registrado correctamente`)
      
      setFormData({
        producto_id: '',
        tipo: 'entrada',
        cantidad: '',
        motivo: '',
        precio_unitario: '',
        observaciones: ''
      })
      
      if (onSuccess) onSuccess()
      if (onClose) onClose()
      
    } catch (error) {
      alert(`Error al registrar movimiento: ${error}`)
    }
  }

  const handleCancel = () => {
    setFormData({
      producto_id: '',
      tipo: 'entrada',
      cantidad: '',
      motivo: '',
      precio_unitario: '',
      observaciones: ''
    })
    setErrors({})
    if (onClose) onClose()
  }

  return (
    <div className="movimiento-form-overlay">
      <div className="movimiento-form-container">
        <div className="movimiento-form-header">
          <h2>Registrar Movimiento de Inventario</h2>
          <button 
            className="close-btn"
            onClick={handleCancel}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="movimiento-form">
          {/* Selección de Producto */}
          <div className="form-group">
            <label htmlFor="producto_id">
              Producto <span className="required">*</span>
            </label>
            <select
              id="producto_id"
              name="producto_id"
              value={formData.producto_id}
              onChange={handleChange}
              className={errors.producto_id ? 'error' : ''}
              required
            >
              <option value="">Seleccione un producto</option>
              {productos.map(producto => (
                <option key={producto.id} value={producto.id}>
                  {producto.codigo_producto} - {producto.nombre} (Stock: {producto.stock})
                </option>
              ))}
            </select>
            {errors.producto_id && <span className="error-text">{errors.producto_id}</span>}
            
            {/* Información del producto seleccionado */}
            {productoSeleccionado && (
              <div className="producto-info">
                <p><strong>Descripción:</strong> {productoSeleccionado.descripcion}</p>
                <p><strong>Stock Actual:</strong> {productoSeleccionado.stock} {productoSeleccionado.unidad_medida}</p>
                <p><strong>Precio:</strong> ${productoSeleccionado.precio}</p>
              </div>
            )}
          </div>

          {/* Tipo de Movimiento */}
          <div className="form-group">
            <label htmlFor="tipo">
              Tipo de Movimiento <span className="required">*</span>
            </label>
            <div className="tipo-options">
              {tiposMovimiento.map(tipo => (
                <div key={tipo.value} className="radio-option">
                  <input
                    type="radio"
                    id={tipo.value}
                    name="tipo"
                    value={tipo.value}
                    checked={formData.tipo === tipo.value}
                    onChange={handleChange}
                  />
                  <label htmlFor={tipo.value}>
                    <strong>{tipo.label}</strong>
                    <small>{tipo.description}</small>
                  </label>
                </div>
              ))}
            </div>
            {errors.tipo && <span className="error-text">{errors.tipo}</span>}
          </div>

          {/* Cantidad */}
          <div className="form-group">
            <label htmlFor="cantidad">
              Cantidad <span className="required">*</span>
            </label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              className={errors.cantidad ? 'error' : ''}
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
            {errors.cantidad && <span className="error-text">{errors.cantidad}</span>}
          </div>

          {/* Motivo */}
          <div className="form-group">
            <label htmlFor="motivo">
              Motivo <span className="required">*</span>
            </label>
            <select
              id="motivo"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              className={errors.motivo ? 'error' : ''}
              required
            >
              <option value="">Seleccione un motivo</option>
              {motivosComunes[formData.tipo]?.map(motivo => (
                <option key={motivo} value={motivo}>{motivo}</option>
              ))}
            </select>
            {errors.motivo && <span className="error-text">{errors.motivo}</span>}
          </div>

          {/* Precio Unitario (opcional) */}
          <div className="form-group">
            <label htmlFor="precio_unitario">
              Precio Unitario (opcional)
            </label>
            <input
              type="number"
              id="precio_unitario"
              name="precio_unitario"
              value={formData.precio_unitario}
              onChange={handleChange}
              className={errors.precio_unitario ? 'error' : ''}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
            {errors.precio_unitario && <span className="error-text">{errors.precio_unitario}</span>}
          </div>

          {/* Observaciones */}
          <div className="form-group">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows="3"
              placeholder="Observaciones adicionales..."
            />
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MovimientoForm