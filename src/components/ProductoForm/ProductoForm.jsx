import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { crearProducto, actualizarProducto } from '../../store/slices/productosSlice'
import './ProductoForm.css'

const ProductoForm = ({ producto = null, onClose, onSubmit }) => {

  
  const dispatch = useDispatch()
  
  const [formData, setFormData] = useState({
    codigo_producto: '',
    nombre: '',
    categoria: '',
    descripcion: '',
    precio: '', // Cambiado de precio_venta a precio (como espera el backend)
    costo: '', // Cambiado de precio_costo a costo (como espera el backend)
    stock: '', // Cambiado de stock_actual a stock (como espera el backend)
    stock_minimo: '',
    unidad_medida: 'unidades', // Campo que faltaba - requerido por el backend
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
        precio: producto.precio || '', // Actualizado para coincidir con el backend
        costo: producto.costo || '', // Actualizado para coincidir con el backend
        stock: producto.stock || '', // Actualizado para coincidir con el backend
        stock_minimo: producto.stock_minimo || '',
        unidad_medida: producto.unidad_medida || 'unidades', // Campo agregado
        activo: producto.activo ?? true
      })
    }
  }, [producto])

  // Expresiones regulares para validación de productos químicos
  const regexPatterns = {
    codigo_producto: /^[A-Z0-9\-]{3,20}$/,
    nombre: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s0-9%°\-.,()]{2,200}$/,
    descripcion: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s0-9%°\-.,()\/\n]{0,1000}$/,
    ubicacion_almacen: /^[a-zA-Z0-9\s\-.,()]{0,100}$/,
    precio: /^\d+(\.\d{1,2})?$/,
    stock: /^\d+(\.\d{1,3})?$/,
    proveedor_id: /^\d+$/
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Validación en tiempo real para ciertos campos
    if (errors[name]) {
      const fieldErrors = {}
      
      switch (name) {
        case 'codigo_producto':
          if (value && value.trim() && !regexPatterns.codigo_producto.test(value.trim().toUpperCase())) {
            fieldErrors.codigo_producto = 'El código debe tener 3-20 caracteres (letras mayúsculas, números y guiones). Ej: QUI-001, ACID-H2SO4'
          }
          break
          
        case 'precio':
        case 'costo':
          if (value && !regexPatterns.precio.test(value)) {
            fieldErrors[name] = 'Ingrese un precio válido (máximo 2 decimales). Ej: 150.50'
          } else if (value && parseFloat(value) <= 0) {
            fieldErrors[name] = 'El precio debe ser mayor a 0'
          }
          break
          
        case 'stock':
        case 'stock_minimo':
          if (value && !regexPatterns.stock.test(value)) {
            fieldErrors[name] = 'Ingrese una cantidad válida (máximo 3 decimales). Ej: 25.750'
          } else if (value && parseFloat(value) < 0) {
            fieldErrors[name] = 'La cantidad no puede ser negativa'
          }
          break
          
        case 'proveedor_id':
          if (value && !regexPatterns.proveedor_id.test(value)) {
            fieldErrors.proveedor_id = 'El ID del proveedor debe ser un número entero'
          }
          break
      }
      
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name] || ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar código de producto (obligatorio)
    if (!formData.codigo_producto.trim()) {
      newErrors.codigo_producto = 'El código del producto es requerido'
    } else if (!regexPatterns.codigo_producto.test(formData.codigo_producto.trim().toUpperCase())) {
      newErrors.codigo_producto = 'El código debe tener 3-20 caracteres (letras mayúsculas, números y guiones). Ej: QUI-001, ACID-H2SO4'
    }

    // Validar nombre (obligatorio)
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es requerido'
    } else if (!regexPatterns.nombre.test(formData.nombre.trim())) {
      newErrors.nombre = 'El nombre puede contener letras, números, espacios y símbolos químicos (%, °, -, ., (, )) - 2 a 200 caracteres'
    }

    // Validar categoría (obligatorio)
    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es requerida'
    }

    // Validar descripción (opcional)
    if (formData.descripcion && formData.descripcion.trim() && !regexPatterns.descripcion.test(formData.descripcion.trim())) {
      newErrors.descripcion = 'La descripción contiene caracteres no válidos (máximo 1000 caracteres)'
    }

    // Validar precio (obligatorio)
    if (!formData.precio) {
      newErrors.precio = 'El precio es requerido'
    } else if (!regexPatterns.precio.test(formData.precio)) {
      newErrors.precio = 'Ingrese un precio válido (máximo 2 decimales). Ej: 150.50'
    } else if (parseFloat(formData.precio) <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0'
    } else if (parseFloat(formData.precio) > 999999999.99) {
      newErrors.precio = 'El precio es demasiado alto (máximo: $999,999,999.99)'
    }

    // Validar costo (obligatorio)
    if (!formData.costo) {
      newErrors.costo = 'El costo es requerido'
    } else if (!regexPatterns.precio.test(formData.costo)) {
      newErrors.costo = 'Ingrese un costo válido (máximo 2 decimales). Ej: 120.25'
    } else if (parseFloat(formData.costo) <= 0) {
      newErrors.costo = 'El costo debe ser mayor a 0'
    } else if (parseFloat(formData.costo) > 999999999.99) {
      newErrors.costo = 'El costo es demasiado alto (máximo: $999,999,999.99)'
    }

    // Validar que precio sea mayor al costo
    if (formData.precio && formData.costo && 
        parseFloat(formData.precio) <= parseFloat(formData.costo)) {
      newErrors.precio = 'El precio debe ser mayor al costo'
    }

    // Validar stock (opcional)
    if (formData.stock && formData.stock.trim()) {
      if (!regexPatterns.stock.test(formData.stock)) {
        newErrors.stock = 'Ingrese una cantidad válida (máximo 3 decimales). Ej: 25.750'
      } else if (parseFloat(formData.stock) < 0) {
        newErrors.stock = 'El stock no puede ser negativo'
      }
    }

    // Validar stock mínimo (opcional)
    if (formData.stock_minimo && formData.stock_minimo.trim()) {
      if (!regexPatterns.stock.test(formData.stock_minimo)) {
        newErrors.stock_minimo = 'Ingrese una cantidad válida (máximo 3 decimales). Ej: 5.000'
      } else if (parseFloat(formData.stock_minimo) < 0) {
        newErrors.stock_minimo = 'El stock mínimo no puede ser negativo'
      }
    }

    // Validar que stock mínimo no sea mayor al stock inicial (si ambos están presentes)
    if (formData.stock && formData.stock_minimo && 
        parseFloat(formData.stock_minimo) > parseFloat(formData.stock)) {
      newErrors.stock_minimo = 'El stock mínimo no puede ser mayor al stock inicial'
    }

    // Validar unidad de medida (obligatorio)
    if (!formData.unidad_medida || !formData.unidad_medida.trim()) {
      newErrors.unidad_medida = 'La unidad de medida es requerida'
    }

    // Validar proveedor ID (opcional)
    if (formData.proveedor_id && formData.proveedor_id.trim()) {
      if (!regexPatterns.proveedor_id.test(formData.proveedor_id.trim())) {
        newErrors.proveedor_id = 'El ID del proveedor debe ser un número entero'
      }
    }

    // Validar ubicación de almacén (opcional)
    if (formData.ubicacion_almacen && formData.ubicacion_almacen.trim() && 
        !regexPatterns.ubicacion_almacen.test(formData.ubicacion_almacen.trim())) {
      newErrors.ubicacion_almacen = 'La ubicación puede contener letras, números, espacios y caracteres especiales básicos (máximo 100 caracteres)'
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
        precio: parseFloat(formData.precio),
        costo: parseFloat(formData.costo),
        stock: formData.stock ? parseFloat(formData.stock) : 0,
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
                onChange={(e) => {
                  const upperValue = e.target.value.toUpperCase()
                  handleChange({
                    target: {
                      name: 'codigo_producto',
                      value: upperValue
                    }
                  })
                }}
                className={errors.codigo_producto ? 'error' : ''}
                placeholder="Ej: QUI-001, ACID-H2SO4"
                maxLength="20"
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
              placeholder="Ej: Ácido Sulfúrico 98%, Hidróxido de Sodio"
              maxLength="200"
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
              className={errors.descripcion ? 'error' : ''}
              rows="3"
              placeholder="Descripción detallada del producto químico, fórmula molecular, aplicaciones, etc."
              maxLength="1000"
            />
            {errors.descripcion && (
              <span className="error-message">{errors.descripcion}</span>
            )}
          </div>

          {/* Precios */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="costo">Precio Costo * ($)</label>
              <input
                type="number"
                id="costo"
                name="costo"
                value={formData.costo}
                onChange={handleChange}
                className={errors.costo ? 'error' : ''}
                step="0.01"
                min="0"
                max="999999999.99"
                placeholder="Ej: 120.50"
              />
              {errors.costo && (
                <span className="error-message">{errors.costo}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="precio">Precio Venta * ($)</label>
              <input
                type="number"
                id="precio"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                className={errors.precio ? 'error' : ''}
                step="0.01"
                min="0"
                max="999999999.99"
                placeholder="Ej: 150.75"
              />
              {errors.precio && (
                <span className="error-message">{errors.precio}</span>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stock">Stock Actual</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className={errors.stock ? 'error' : ''}
                step="0.001"
                min="0"
                placeholder="Ej: 25.750 (kg, L, unidades)"
              />
              {errors.stock && (
                <span className="error-message">{errors.stock}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="stock_minimo">Stock Mínimo</label>
              <input
                type="number"
                id="stock_minimo"
                name="stock_minimo"
                value={formData.stock_minimo}
                onChange={handleChange}
                className={errors.stock_minimo ? 'error' : ''}
                step="0.001"
                min="0"
                placeholder="Ej: 5.000 (alerta de reposición)"
              />
              {errors.stock_minimo && (
                <span className="error-message">{errors.stock_minimo}</span>
              )}
            </div>
          </div>

          {/* Unidad de Medida */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="unidad_medida">Unidad de Medida *</label>
              <select
                id="unidad_medida"
                name="unidad_medida"
                value={formData.unidad_medida}
                onChange={handleChange}
                className={errors.unidad_medida ? 'error' : ''}
              >
                <option value="">Seleccionar unidad</option>
                <option value="unidades">Unidades</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="gramos">Gramos (g)</option>
                <option value="litros">Litros (L)</option>
                <option value="metros">Metros (m)</option>
              </select>
              {errors.unidad_medida && (
                <span className="error-message">{errors.unidad_medida}</span>
              )}
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
                className={errors.proveedor_id ? 'error' : ''}
                placeholder="Ej: 123 (ID del proveedor)"
              />
              {errors.proveedor_id && (
                <span className="error-message">{errors.proveedor_id}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="ubicacion_almacen">Ubicación en Almacén</label>
              <input
                type="text"
                id="ubicacion_almacen"
                name="ubicacion_almacen"
                value={formData.ubicacion_almacen}
                onChange={handleChange}
                className={errors.ubicacion_almacen ? 'error' : ''}
                placeholder="Ej: Estante A-1, Nivel 2, Sector Químicos"
                maxLength="100"
              />
              {errors.ubicacion_almacen && (
                <span className="error-message">{errors.ubicacion_almacen}</span>
              )}
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