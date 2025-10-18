import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { crearCompra, selectLoadingCrearCompra } from '../../store/slices/comprasSlice'
import './CompraForm.css'

const CompraForm = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const { proveedores = [], loading: loadingProveedores = false } = useSelector(state => state.proveedores || {})
  const { productos = [] } = useSelector(state => state.inventario || {})
  const loadingCrearCompra = useSelector(selectLoadingCrearCompra)

  // Estados del formulario
  const [formData, setFormData] = useState({
    proveedor_id: '',
    numero_factura: '',
    numero_remito: '',
    fecha_compra: new Date().toISOString().split('T')[0],
    fecha_vencimiento: '',
    descuento: 0,
    impuestos: 0,
    metodo_pago: 'transferencia',
    observaciones: '',
    detalles: []
  })

  // Estados para el detalle de productos
  const [detalleActual, setDetalleActual] = useState({
    producto_id: '',
    cantidad: 1,
    precio_unitario: 0,
    descuento_item: 0
  })

  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const handleDetalleChange = (e) => {
    const { name, value } = e.target
    setDetalleActual(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const agregarDetalle = () => {
    if (!detalleActual.producto_id || !detalleActual.cantidad || !detalleActual.precio_unitario) {
      alert('Por favor, complete todos los campos del producto')
      return
    }

    const producto = productos.find(p => p.id === parseInt(detalleActual.producto_id))
    const nuevoDetalle = {
      ...detalleActual,
      producto_id: parseInt(detalleActual.producto_id),
      cantidad: parseFloat(detalleActual.cantidad),
      precio_unitario: parseFloat(detalleActual.precio_unitario),
      descuento_item: parseFloat(detalleActual.descuento_item) || 0,
      producto_nombre: producto?.nombre || 'Producto desconocido',
      subtotal: (parseFloat(detalleActual.cantidad) * parseFloat(detalleActual.precio_unitario)) - (parseFloat(detalleActual.descuento_item) || 0)
    }

    setFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, nuevoDetalle]
    }))

    // Limpiar el detalle actual
    setDetalleActual({
      producto_id: '',
      cantidad: 1,
      precio_unitario: 0,
      descuento_item: 0
    })
  }

  const eliminarDetalle = (index) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }))
  }

  const calcularTotal = () => {
    const subtotal = formData.detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0)
    const descuento = parseFloat(formData.descuento) || 0
    const impuestos = parseFloat(formData.impuestos) || 0
    return subtotal - descuento + impuestos
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.proveedor_id) newErrors.proveedor_id = 'Proveedor es obligatorio'
    if (formData.detalles.length === 0) newErrors.detalles = 'Debe agregar al menos un producto'
    if (!formData.fecha_compra) newErrors.fecha_compra = 'Fecha de compra es obligatoria'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const compraData = {
      ...formData,
      proveedor_id: parseInt(formData.proveedor_id),
      descuento: parseFloat(formData.descuento) || 0,
      impuestos: parseFloat(formData.impuestos) || 0
    }

    try {
      await dispatch(crearCompra(compraData)).unwrap()
      
      alert('Compra creada exitosamente. El stock se ha actualizado automáticamente.')
      onSuccess()
      onClose()
    } catch (error) {
      alert(`Error al crear compra: ${error}`)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content compra-form-modal">
        <div className="modal-header">
          <h2>🛒 Nueva Orden de Compra</h2>
          <button 
            onClick={onClose}
            className="close-button"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="compra-form">
          {/* Información básica */}
          <div className="form-section">
            <h3>📋 Información General</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Proveedor *</label>
                <select
                  name="proveedor_id"
                  value={formData.proveedor_id}
                  onChange={handleInputChange}
                  className={errors.proveedor_id ? 'error' : ''}
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map(proveedor => (
                    <option key={proveedor.id} value={proveedor.id}>
                      {proveedor.nombre}
                    </option>
                  ))}
                </select>
                {errors.proveedor_id && <span className="error-text">{errors.proveedor_id}</span>}
              </div>

              <div className="form-group">
                <label>Fecha de Compra *</label>
                <input
                  type="date"
                  name="fecha_compra"
                  value={formData.fecha_compra}
                  onChange={handleInputChange}
                  className={errors.fecha_compra ? 'error' : ''}
                  required
                />
                {errors.fecha_compra && <span className="error-text">{errors.fecha_compra}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Número de Factura</label>
                <input
                  type="text"
                  name="numero_factura"
                  value={formData.numero_factura}
                  onChange={handleInputChange}
                  placeholder="Opcional"
                />
              </div>

              <div className="form-group">
                <label>Número de Remito</label>
                <input
                  type="text"
                  name="numero_remito"
                  value={formData.numero_remito}
                  onChange={handleInputChange}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Método de Pago</label>
                <select
                  name="metodo_pago"
                  value={formData.metodo_pago}
                  onChange={handleInputChange}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fecha de Vencimiento</label>
                <input
                  type="date"
                  name="fecha_vencimiento"
                  value={formData.fecha_vencimiento}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Observaciones</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                placeholder="Notas adicionales..."
                rows="3"
              />
            </div>
          </div>

          {/* Productos */}
          <div className="form-section">
            <h3>📦 Productos</h3>
            <div className="info-banner">
              <span className="info-icon">ℹ️</span>
              <p><strong>Nota:</strong> Al crear la compra, el stock de los productos se actualizará automáticamente.</p>
            </div>
            
            {/* Agregar producto */}
            <div className="add-product-section">
              <h4>➕ Agregar Producto</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Producto *</label>
                  <select
                    name="producto_id"
                    value={detalleActual.producto_id}
                    onChange={handleDetalleChange}
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map(producto => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre} - {producto.codigo_producto || 'Sin código'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cantidad *</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={detalleActual.cantidad}
                    onChange={handleDetalleChange}
                    placeholder="Ej: 5"
                    min="1"
                    step="1"
                  />
                </div>
                <div className="form-group">
                  <label>Precio Unitario *</label>
                  <input
                    type="number"
                    name="precio_unitario"
                    value={detalleActual.precio_unitario}
                    onChange={handleDetalleChange}
                    placeholder="Ej: 100.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Descuento (opcional)</label>
                  <input
                    type="number"
                    name="descuento_item"
                    value={detalleActual.descuento_item}
                    onChange={handleDetalleChange}
                    placeholder="Ej: 10.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>&nbsp;</label>
                  <button
                    type="button"
                    onClick={agregarDetalle}
                    className="btn-primary btn-small"
                    disabled={!detalleActual.producto_id || !detalleActual.cantidad || !detalleActual.precio_unitario}
                  >
                    ➕ Agregar
                  </button>
                  {detalleActual.cantidad && detalleActual.precio_unitario && (
                    <div className="subtotal-preview">
                      Subtotal: ${((parseFloat(detalleActual.cantidad) || 0) * (parseFloat(detalleActual.precio_unitario) || 0) - (parseFloat(detalleActual.descuento_item) || 0)).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de productos agregados */}
            {formData.detalles.length > 0 && (
              <div className="productos-list">
                <table className="productos-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Descuento</th>
                      <th>Subtotal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.detalles.map((detalle, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{detalle.producto_nombre}</strong>
                        </td>
                        <td className="text-center">{detalle.cantidad}</td>
                        <td className="text-right">${parseFloat(detalle.precio_unitario).toFixed(2)}</td>
                        <td className="text-right">${parseFloat(detalle.descuento_item).toFixed(2)}</td>
                        <td className="text-right total-cell">
                          <strong>${detalle.subtotal.toFixed(2)}</strong>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => eliminarDetalle(index)}
                            className="btn-danger btn-small"
                            title="Eliminar producto"
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {errors.detalles && <span className="error-text">{errors.detalles}</span>}
          </div>

          {/* Totales */}
          {formData.detalles.length > 0 && (
            <div className="form-section">
              <h3>💰 Totales</h3>
              <div className="totales-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>Descuento General</label>
                    <input
                      type="number"
                      name="descuento"
                      value={formData.descuento}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Impuestos</label>
                    <input
                      type="number"
                      name="impuestos"
                      value={formData.impuestos}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="total-final">
                  <h3>Total: ${calcularTotal().toFixed(2)}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loadingCrearCompra}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loadingCrearCompra || formData.detalles.length === 0}
            >
              {loadingCrearCompra ? '⏳ Creando...' : '💾 Crear Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompraForm