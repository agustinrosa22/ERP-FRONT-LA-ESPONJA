import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { crearCliente, actualizarCliente, clearError } from '../../store/slices/clientesSlice'
import './ClienteForm.css'

const ClienteForm = ({ cliente, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.clientes)
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    email: '',
    telefono: '',
    ciudad: '',
    tipo_documento: 'DNI', // DNI, CUIT, CUIL, PASAPORTE
    activo: true,
    limite_credito: '0.00',
    notas: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        documento: cliente.documento || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        ciudad: cliente.ciudad || '',
        tipo_documento: cliente.tipo_documento || 'DNI',
        activo: cliente.activo !== undefined ? cliente.activo : true,
        limite_credito: cliente.limite_credito || '0.00',
        notas: cliente.notas || ''
      })
    }
  }, [cliente])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!formData.documento.trim()) {
      newErrors.documento = 'El documento es obligatorio'
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    if (formData.telefono && !/^\+?[\d\s\-\(\)]{8,}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono no es válido'
    }

    if (formData.limite_credito && isNaN(parseFloat(formData.limite_credito))) {
      newErrors.limite_credito = 'El límite de crédito debe ser un número válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      let result
      if (cliente) {
        result = await dispatch(actualizarCliente({ 
          id: cliente.id, 
          clienteData: formData 
        }))
      } else {
        result = await dispatch(crearCliente(formData))
      }

      if (crearCliente.fulfilled.match(result) || actualizarCliente.fulfilled.match(result)) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error al guardar cliente:', err)
    }
  }

  return (
    <div className="cliente-form">
      <div className="form-header">
        <h2>{cliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* Información básica */}
        <div className="form-section">
          <h3>Información Básica</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={errors.nombre ? 'error' : ''}
                disabled={loading}
              />
              {errors.nombre && <span className="error-text">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo_documento">Tipo de documento</label>
              <select
                id="tipo_documento"
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="DNI">DNI</option>
                <option value="CUIT">CUIT</option>
                <option value="CUIL">CUIL</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="documento">Número de documento *</label>
              <input
                type="text"
                id="documento"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                className={errors.documento ? 'error' : ''}
                disabled={loading}
              />
              {errors.documento && <span className="error-text">{errors.documento}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="activo">Estado</label>
              <select
                id="activo"
                name="activo"
                value={formData.activo}
                onChange={(e) => setFormData(prev => ({...prev, activo: e.target.value === 'true'}))}
                disabled={loading}
              >
                <option value={true}>Activo</option>
                <option value={false}>Inactivo</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="limite_credito">Límite de Crédito</label>
              <input
                type="number"
                step="0.01"
                min="0"
                id="limite_credito"
                name="limite_credito"
                value={formData.limite_credito}
                onChange={handleChange}
                className={errors.limite_credito ? 'error' : ''}
                disabled={loading}
              />
              {errors.limite_credito && <span className="error-text">{errors.limite_credito}</span>}
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="form-section">
          <h3>Información de Contacto</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                disabled={loading}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={errors.telefono ? 'error' : ''}
                placeholder="+54 11 1234-5678"
                disabled={loading}
              />
              {errors.telefono && <span className="error-text">{errors.telefono}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="ciudad">Ciudad</label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Notas adicionales */}
        <div className="form-section">
          <h3>Notas Adicionales</h3>
          <div className="form-group">
            <label htmlFor="notas">Notas</label>
            <textarea
              id="notas"
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              rows="3"
              placeholder="Información adicional sobre el cliente..."
              disabled={loading}
            />
          </div>
        </div>

        {/* Error general */}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {/* Botones de acción */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onClose}
            className="btn-cancel"
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>⏳ {cliente ? 'Actualizando...' : 'Creando...'}</>
            ) : (
              <>{cliente ? '✓ Actualizar' : '✓ Crear'} Cliente</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ClienteForm