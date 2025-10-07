import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { crearProducto, actualizarProducto } from '../../store/slices/productosSlice'
import './ProductoForm.css'

const ProductoForm = ({ producto = null, onClose, onSubmit }) => {
  console.log('ProductoForm renderizando con props:', { producto, onClose, onSubmit })
  
  const dispatch = useDispatch()
  
  const [formData, setFormData] = useState({
    codigo_producto: '',
    nombre: '',
    categoria: '',
    descripcion: '',
    precio_venta: '',
    precio_costo: '',
    stock_actual: '',
    stock_minimo: '',
    proveedor_id: '',
    ubicacion_almacen: '',
    activo: true
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categorias = [
    'Ácidos',
    'Bases', 
    'Sales',
    'Solventes',
    'Oxidantes',
    'Reductores',
    'Catalizadores',
    'Reactivos Orgánicos',
    'Reactivos Inorgánicos',
    'Material de Vidrio',
    'Equipamiento',
    'Otros'
  ]

  useEffect(() => {
    if (producto) {
      setFormData({
        codigo_producto: producto.codigo_producto || '',
        nombre: producto.nombre || '',
        categoria: producto.categoria || '',
        descripcion: producto.descripcion || '',
        precio_venta: producto.precio_venta || '',
        precio_costo: producto.precio_costo || '',
        stock_actual: producto.stock_actual || '',
        stock_minimo: producto.stock_minimo || '',
        proveedor_id: producto.proveedor_id || '',
        ubicacion_almacen: producto.ubicacion_almacen || '',
        activo: producto.activo ?? true
      })
    }
  }, [producto])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.codigo_producto.trim()) {
      newErrors.codigo_producto = 'El código del producto es requerido'
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es requerido'
    }

    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es requerida'
    }

    if (!formData.precio_venta || parseFloat(formData.precio_venta) <= 0) {
      newErrors.precio_venta = 'El precio de venta debe ser mayor a 0'
    }

    if (!formData.precio_costo || parseFloat(formData.precio_costo) <= 0) {
      newErrors.precio_costo = 'El precio de costo debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const dataToSubmit = {
        ...formData,
        precio_venta: parseFloat(formData.precio_venta),
        precio_costo: parseFloat(formData.precio_costo),
        stock_actual: formData.stock_actual ? parseFloat(formData.stock_actual) : 0,
        stock_minimo: formData.stock_minimo ? parseFloat(formData.stock_minimo) : 0,
        proveedor_id: formData.proveedor_id ? parseInt(formData.proveedor_id) : null
      }

      if (producto?.id) {
        await dispatch(actualizarProducto({ id: producto.id, data: dataToSubmit })).unwrap()
      } else {
        await dispatch(crearProducto(dataToSubmit)).unwrap()
      }

      if (onSubmit) {
        onSubmit()
      }
      onClose()
    } catch (error) {
      console.error('Error al guardar producto:', error)
      setErrors({ submit: 'Error al guardar el producto. Inténtalo de nuevo.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="producto-form-overlay">
      <div className="producto-form-container">
        <div className="producto-form-header">
          <h3>{producto ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button 
            type="button" 
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="producto-form">
          {/* Código y Categoría */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="codigo_producto">Código del Producto *</label>
              <input
                type="text"
                id="codigo_producto"
                name="codigo_producto"
                value={formData.codigo_producto}
                onChange={handleChange}
                className={errors.codigo_producto ? 'error' : ''}
                placeholder="Ej: QUI-001"
              />
              {errors.codigo_producto && (
                <span className="error-message">{errors.codigo_producto}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="categoria">Categoría *</label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className={errors.categoria ? 'error' : ''}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.categoria && (
                <span className="error-message">{errors.categoria}</span>
              )}
            </div>
          </div>

          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Producto *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={errors.nombre ? 'error' : ''}
              placeholder="Ej: Ácido Sulfúrico 98%"
            />
            {errors.nombre && (
              <span className="error-message">{errors.nombre}</span>
            )}
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              placeholder="Descripción detallada del producto químico..."
            />
          </div>

          {/* Precios */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="precio_costo">Precio Costo * ($)</label>
              <input
                type="number"
                id="precio_costo"
                name="precio_costo"
                value={formData.precio_costo}
                onChange={handleChange}
                className={errors.precio_costo ? 'error' : ''}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              {errors.precio_costo && (
                <span className="error-message">{errors.precio_costo}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="precio_venta">Precio Venta * ($)</label>
              <input
                type="number"
                id="precio_venta"
                name="precio_venta"
                value={formData.precio_venta}
                onChange={handleChange}
                className={errors.precio_venta ? 'error' : ''}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              {errors.precio_venta && (
                <span className="error-message">{errors.precio_venta}</span>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stock_actual">Stock Actual</label>
              <input
                type="number"
                id="stock_actual"
                name="stock_actual"
                value={formData.stock_actual}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock_minimo">Stock Mínimo</label>
              <input
                type="number"
                id="stock_minimo"
                name="stock_minimo"
                value={formData.stock_minimo}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          {/* Otros campos */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="proveedor_id">ID Proveedor</label>
              <input
                type="number"
                id="proveedor_id"
                name="proveedor_id"
                value={formData.proveedor_id}
                onChange={handleChange}
                placeholder="ID del proveedor"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ubicacion_almacen">Ubicación en Almacén</label>
              <input
                type="text"
                id="ubicacion_almacen"
                name="ubicacion_almacen"
                value={formData.ubicacion_almacen}
                onChange={handleChange}
                placeholder="Ej: Estante A-1, Nivel 2"
              />
            </div>
          </div>

          {/* Checkbox activo */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Producto activo
            </label>
          </div>

          {/* Error de envío */}
          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          {/* Botones */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : (producto ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductoForm