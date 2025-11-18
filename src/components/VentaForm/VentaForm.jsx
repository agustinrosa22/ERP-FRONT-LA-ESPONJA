import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { crearVenta, selectLoadingCrear } from '../../store/slices/ventasSlice'
import { obtenerTodosClientes } from '../../store/slices/clientesSlice'
import { obtenerProductos } from '../../store/slices/inventarioSlice'
import './VentaForm.css'

const VentaForm = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch()
  
  // Estados de Redux
  const loadingCrear = useSelector(selectLoadingCrear)
  const { clientes = [] } = useSelector(state => state.clientes || {})
  const { productos = [] } = useSelector(state => state.inventario || {})

  // Estados locales del formulario
  const [formData, setFormData] = useState({
    cliente_id: '',
    cliente_nombre: '',
    metodo_pago: 'efectivo',
    descuento: 0,
    observaciones: ''
  })

  const [detalles, setDetalles] = useState([])
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [precioUnitario, setPrecioUnitario] = useState(0)
  const [errors, setErrors] = useState({})

  // Cargar datos iniciales
  useEffect(() => {
    dispatch(obtenerTodosClientes())
    // Cargar productos en modo estricto (por defecto) con stock por sucursal
    dispatch(obtenerProductos({ incluir_stock_sucursal: true }))
  }, [dispatch])

  // Manejar cambios en el formulario principal
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpiar errores al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  // Agregar producto al detalle
  const handleAgregarProducto = () => {
    const producto = productos.find(p => p.id === parseInt(productoSeleccionado))
    
    if (!producto) {
      alert('Seleccione un producto válido')
      return
    }

    if (cantidad <= 0) {
      alert('La cantidad debe ser mayor a 0')
      return
    }

    if (precioUnitario <= 0) {
      alert('El precio unitario debe ser mayor a 0')
      return
    }

    const stockDisponible = Number(producto.stock_actual ?? 0)
    if (cantidad > stockDisponible) {
      alert(`Stock insuficiente. Disponible: ${stockDisponible}`)
      return
    }

    // Verificar si el producto ya está en la lista
    const existe = detalles.find(d => d.producto_id === producto.id)
    if (existe) {
      alert('El producto ya está en la lista')
      return
    }

    const nuevoDetalle = {
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      cantidad: parseInt(cantidad),
      precio_unitario: parseFloat(precioUnitario),
      subtotal: parseInt(cantidad) * parseFloat(precioUnitario),
      stock_disponible: Number(producto.stock_actual ?? 0)
    }

    setDetalles(prev => [...prev, nuevoDetalle])
    
    // Limpiar campos
    setProductoSeleccionado('')
    setCantidad(1)
    setPrecioUnitario(0)
  }

  // Eliminar producto del detalle
  const handleEliminarProducto = (index) => {
    setDetalles(prev => prev.filter((_, i) => i !== index))
  }

  // Actualizar cantidad de un producto
  const handleActualizarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad <= 0) return

    const detalle = detalles[index]
    if (nuevaCantidad > detalle.stock_disponible) {
      alert(`Stock insuficiente. Disponible: ${detalle.stock_disponible}`)
      return
    }

    setDetalles(prev => prev.map((item, i) => 
      i === index 
        ? { 
            ...item, 
            cantidad: parseInt(nuevaCantidad),
            subtotal: parseInt(nuevaCantidad) * item.precio_unitario
          }
        : item
    ))
  }

  // Calcular totales
  const calcularTotales = () => {
    const subtotal = detalles.reduce((sum, item) => sum + item.subtotal, 0)
    const descuentoMonto = (subtotal * formData.descuento) / 100
    const total = subtotal - descuentoMonto
    
    return { subtotal, descuentoMonto, total }
  }

  // Validar formulario
  const validarFormulario = () => {
    const newErrors = {}

    if (detalles.length === 0) {
      newErrors.detalles = 'Debe agregar al menos un producto'
    }

    if (!formData.cliente_id && !formData.cliente_nombre.trim()) {
      newErrors.cliente = 'Seleccione un cliente o ingrese un nombre'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      return
    }

    const { total } = calcularTotales()

    const ventaData = {
      cliente_id: formData.cliente_id || null,
      cliente_nombre: formData.cliente_nombre || null,
      total,
      descuento: formData.descuento,
      metodo_pago: formData.metodo_pago,
      observaciones: formData.observaciones,
      detalles: detalles.map(detalle => ({
        producto_id: detalle.producto_id,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario,
        subtotal: detalle.subtotal
      }))
    }

    try {
      await dispatch(crearVenta(ventaData)).unwrap()
      alert('Venta creada exitosamente')
      onSuccess()
    } catch (error) {
      alert(`Error al crear venta: ${error}`)
    }
  }

  // Manejar selección de cliente
  const handleClienteChange = (e) => {
    const clienteId = e.target.value
    if (clienteId) {
      const cliente = clientes.find(c => c.id === parseInt(clienteId))
      setFormData(prev => ({
        ...prev,
        cliente_id: clienteId,
        cliente_nombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        cliente_id: '',
        cliente_nombre: ''
      }))
    }
  }

  // Manejar selección de producto
  const handleProductoChange = (e) => {
    const productoId = e.target.value
    setProductoSeleccionado(productoId)
    
    if (productoId) {
      const producto = productos.find(p => p.id === parseInt(productoId))
      if (producto) {
        setPrecioUnitario(producto.precio)
      }
    }
  }

  const { subtotal, descuentoMonto, total } = calcularTotales()

  return (
    <div className="modal-overlay">
      <div className="modal-content venta-form-modal">
        <div className="modal-header">
          <h2>🛒 Nueva Venta</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="venta-form">
            
            {/* Información del Cliente */}
            <div className="form-section">
              <h3>👤 Cliente</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Cliente Registrado</label>
                  <select
                    value={formData.cliente_id}
                    onChange={handleClienteChange}
                    className="form-input"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} {cliente.apellido} - {cliente.documento}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>O Nombre del Cliente</label>
                  <input
                    type="text"
                    name="cliente_nombre"
                    value={formData.cliente_nombre}
                    onChange={handleFormChange}
                    placeholder="Nombre del cliente..."
                    className="form-input"
                    disabled={!!formData.cliente_id}
                  />
                  {errors.cliente && <span className="error-message">{errors.cliente}</span>}
                </div>
              </div>
            </div>

            {/* Agregar Productos */}
            <div className="form-section">
              <h3>📦 Agregar Productos</h3>
              <div className="producto-selector">
                <div className="selector-grid">
                  <select
                    value={productoSeleccionado}
                    onChange={handleProductoChange}
                    className="form-input"
                  >
                    <option value="">Seleccionar producto...</option>
                    {productos.filter(p => Number(p.stock_actual ?? 0) > 0).map(producto => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre} - Stock: {Number(producto.stock_actual ?? 0)} - ${producto.precio}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Cantidad"
                    min="1"
                    className="form-input"
                  />

                  <input
                    type="number"
                    value={precioUnitario}
                    onChange={(e) => setPrecioUnitario(e.target.value)}
                    placeholder="Precio unitario"
                    min="0"
                    step="0.01"
                    className="form-input"
                  />

                  <button
                    type="button"
                    onClick={handleAgregarProducto}
                    className="btn-primary"
                    disabled={!productoSeleccionado}
                  >
                    ➕ Agregar
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Productos */}
            {detalles.length > 0 && (
              <div className="form-section">
                <h3>📋 Productos en la Venta</h3>
                <div className="productos-table">
                  <div className="table-header">
                    <span>Producto</span>
                    <span>Cantidad</span>
                    <span>Precio</span>
                    <span>Subtotal</span>
                    <span>Acciones</span>
                  </div>
                  {detalles.map((detalle, index) => (
                    <div key={index} className="table-row">
                      <span>{detalle.producto_nombre}</span>
                      <input
                        type="number"
                        value={detalle.cantidad}
                        onChange={(e) => handleActualizarCantidad(index, e.target.value)}
                        min="1"
                        max={detalle.stock_disponible}
                        className="cantidad-input"
                      />
                      <span>${detalle.precio_unitario.toLocaleString()}</span>
                      <span>${detalle.subtotal.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => handleEliminarProducto(index)}
                        className="btn-danger btn-small"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
                {errors.detalles && <span className="error-message">{errors.detalles}</span>}
              </div>
            )}

            {/* Información de Pago */}
            <div className="form-section">
              <h3>💳 Información de Pago</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Método de Pago</label>
                  <select
                    name="metodo_pago"
                    value={formData.metodo_pago}
                    onChange={handleFormChange}
                    className="form-input"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta_credito">Tarjeta de Crédito</option>
                    <option value="tarjeta_debito">Tarjeta de Débito</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Descuento (%)</label>
                  <input
                    type="number"
                    name="descuento"
                    value={formData.descuento}
                    onChange={handleFormChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Observaciones</label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleFormChange}
                  placeholder="Observaciones adicionales..."
                  rows="3"
                  className="form-input"
                />
              </div>
            </div>

            {/* Resumen de Totales */}
            {detalles.length > 0 && (
              <div className="form-section totales-section">
                <h3>💰 Resumen</h3>
                <div className="totales-grid">
                  <div className="total-item">
                    <span>Subtotal:</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="total-item">
                    <span>Descuento ({formData.descuento}%):</span>
                    <span>-${descuentoMonto.toLocaleString()}</span>
                  </div>
                  <div className="total-item total-final">
                    <span>Total:</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={loadingCrear}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn-primary"
            disabled={loadingCrear || detalles.length === 0}
          >
            {loadingCrear ? 'Creando...' : '🛒 Crear Venta'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VentaForm