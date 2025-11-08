import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { crearProveedor, actualizarProveedor } from '../../store/slices/proveedoresSlice'
import './ProveedorForm.css'

const ProveedorForm = ({ onClose, onSuccess, proveedorEditar = null }) => {
  const dispatch = useDispatch()
  const { loadingCrear, loadingActualizar } = useSelector(state => state.proveedores)

  const [formData, setFormData] = useState({
    nombre: '',
    cuit: '',
    telefono: '',
    email: '',
    direccion: '',
    contacto_nombre: '',
    contacto_telefono: '',
    condiciones_pago: 'contado',
    observaciones: '',
    activo: true
  })

  const [errors, setErrors] = useState({})

  // Cargar datos del proveedor si estamos editando
  useEffect(() => {
    if (proveedorEditar) {
      setFormData({
        nombre: proveedorEditar.nombre || '',
        cuit: proveedorEditar.cuit || '',
        telefono: proveedorEditar.telefono || '',
        email: proveedorEditar.email || '',
        direccion: proveedorEditar.direccion || '',
        contacto_nombre: proveedorEditar.contacto_nombre || '',
        contacto_telefono: proveedorEditar.contacto_telefono || '',
        condiciones_pago: proveedorEditar.condiciones_pago || 'contado',
        observaciones: proveedorEditar.observaciones || '',
        activo: proveedorEditar.activo !== undefined ? proveedorEditar.activo : true
      })
    }
  }, [proveedorEditar])

  const validateForm = () => {
    const newErrors = {}

    // Validación Nombre (empresa)
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la empresa es obligatorio'
    }

    // Validación CUIT
    if (!formData.cuit.trim()) {
      newErrors.cuit = 'El CUIT es obligatorio'
    } else if (!/^\d{2}-\d{8}-\d{1}$/.test(formData.cuit)) {
      newErrors.cuit = 'El CUIT debe tener formato XX-XXXXXXXX-X'
    }

    // Validación email
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    // Validación teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio'
    }

    // Validación dirección
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const formatCuit = (value) => {
    // Remover todos los caracteres que no sean números
    const numbers = value.replace(/\D/g, '')
    
    // Formatear como XX-XXXXXXXX-X
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`
    } else {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10, 11)}`
    }
  }

  const handleCuitChange = (e) => {
    const formattedCuit = formatCuit(e.target.value)
    setFormData(prev => ({
      ...prev,
      cuit: formattedCuit
    }))
    
    if (errors.cuit) {
      setErrors(prev => ({
        ...prev,
        cuit: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      if (proveedorEditar) {
        await dispatch(actualizarProveedor({ 
          id: proveedorEditar.id, 
          proveedorData: formData 
        })).unwrap()
      } else {
        await dispatch(crearProveedor(formData)).unwrap()
      }
      
      // Llamar onSuccess primero para manejar el estado del componente padre
      if (onSuccess) onSuccess()
      if (onClose) onClose()
      
    } catch (error) {
      // Mantener alert solo para errores
      alert(`Error: ${error}`)
    }
  }

  const handleCancel = () => {
    setFormData({
      nombre: '',
      cuit: '',
      telefono: '',
      email: '',
      direccion: '',
      contacto_nombre: '',
      contacto_telefono: '',
      condiciones_pago: 'contado',
      observaciones: '',
      activo: true
    })
    setErrors({})
    if (onClose) onClose()
  }

  const isLoading = loadingCrear || loadingActualizar

  return (
    <div className="modal-overlay">
      <div className="modal-content proveedor-form-modal">
        <div className="modal-header">
          <h2>
            {proveedorEditar ? '📝 Editar Proveedor' : '➕ Nuevo Proveedor'}
          </h2>
          <button 
            onClick={handleCancel}
            className="close-button"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="proveedor-form">
          {/* Información Básica */}
          <div className="form-section">
            <h3>📋 Información Básica</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombre">Nombre de la Empresa *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Productos Químicos SA"
                  className={errors.nombre ? 'error' : ''}
                />
                {errors.nombre && <span className="error-text">{errors.nombre}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="cuit">CUIT *</label>
                <input
                  type="text"
                  id="cuit"
                  name="cuit"
                  value={formData.cuit}
                  onChange={handleCuitChange}
                  placeholder="XX-XXXXXXXX-X"
                  maxLength={13}
                  className={errors.cuit ? 'error' : ''}
                />
                {errors.cuit && <span className="error-text">{errors.cuit}</span>}
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="form-section">
            <h3>📞 Información de Contacto</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="contacto_nombre">Persona de Contacto</label>
                <input
                  type="text"
                  id="contacto_nombre"
                  name="contacto_nombre"
                  value={formData.contacto_nombre}
                  onChange={handleChange}
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono Principal *</label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: (011) 4000-0000"
                  className={errors.telefono ? 'error' : ''}
                />
                {errors.telefono && <span className="error-text">{errors.telefono}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="contacto_telefono">Teléfono de Contacto</label>
                <input
                  type="text"
                  id="contacto_telefono"
                  name="contacto_telefono"
                  value={formData.contacto_telefono}
                  onChange={handleChange}
                  placeholder="Ej: (011) 4555-5555"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="proveedor@email.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="form-section">
            <h3>🏠 Dirección</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="direccion">Dirección *</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Ej: Av. Corrientes 1234, Piso 5"
                  className={errors.direccion ? 'error' : ''}
                />
                {errors.direccion && <span className="error-text">{errors.direccion}</span>}
              </div>


            </div>
          </div>

          {/* Condiciones Comerciales */}
          <div className="form-section">
            <h3>💰 Condiciones Comerciales</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="condiciones_pago">Condiciones de Pago</label>
                <select
                  id="condiciones_pago"
                  name="condiciones_pago"
                  value={formData.condiciones_pago}
                  onChange={handleChange}
                >
                  <option value="contado">Contado</option>
                  <option value="30_dias">30 días</option>
                  <option value="60_dias">60 días</option>
                  <option value="90_dias">90 días</option>
                </select>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="form-section">
            <h3>📝 Observaciones</h3>
            <div className="form-group full-width">
              <label htmlFor="observaciones">Observaciones</label>
              <textarea
                id="observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                rows={3}
                placeholder="Observaciones adicionales sobre el proveedor..."
              />
            </div>
          </div>

          {/* Estado */}
          {proveedorEditar && (
            <div className="form-section">
              <h3>📊 Estado</h3>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                  />
                  Proveedor activo
                </label>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="form-buttons">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                proveedorEditar ? 'Actualizando...' : 'Guardando...'
              ) : (
                proveedorEditar ? 'Actualizar Proveedor' : 'Guardar Proveedor'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProveedorForm