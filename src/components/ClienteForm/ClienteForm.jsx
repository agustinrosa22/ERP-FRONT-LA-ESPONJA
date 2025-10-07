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
    tipo_documento: 'DNI',
    telefono: '',
    email: '',
    // Dirección detallada
    calle: '',
    numero: '',
    piso_depto: '',
    barrio: '',
    codigo_postal: '',
    ciudad: '',
    fecha_nacimiento: '',
    limite_credito: '0.00',
    observaciones: '',
    activo: true
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (cliente) {
      // Procesar fecha de nacimiento para el input date
      let fechaNacimiento = ''
      if (cliente.fecha_nacimiento) {
        // Si viene en formato ISO, extraer solo la fecha
        const fecha = new Date(cliente.fecha_nacimiento)
        if (!isNaN(fecha.getTime())) {
          fechaNacimiento = fecha.toISOString().split('T')[0]
        }
      }

      setFormData({
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        documento: cliente.documento || '',
        tipo_documento: cliente.tipo_documento || 'DNI',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        // Dirección detallada
        calle: cliente.calle || '',
        numero: cliente.numero || '',
        piso_depto: cliente.piso_depto || '',
        barrio: cliente.barrio || '',
        codigo_postal: cliente.codigo_postal || '',
        ciudad: cliente.ciudad || '',
        fecha_nacimiento: fechaNacimiento,
        limite_credito: cliente.limite_credito || '0.00',
        observaciones: cliente.observaciones || '',
        activo: cliente.activo !== undefined ? cliente.activo : true
      })
    }
  }, [cliente])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Expresiones regulares para validación
  const regexPatterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    telefono: /^(\+54\s?)?(\(?\d{2,4}\)?[\s\-]?)?\d{4,8}$/,
    documento: {
      DNI: /^\d{7,8}$/,
      RUC: /^\d{11}$/,
      PASAPORTE: /^[A-Z]{1,3}\d{6,9}$/,
      CARNET_EXTRANJERIA: /^[A-Z0-9]{6,12}$/
    },
    codigo_postal: /^\d{4,8}$/,
    numero: /^[0-9]+[a-zA-Z]?$/,
    nombre: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'.-]{2,100}$/,
    apellido: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'.-]{2,100}$/,
    calle: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s0-9'.,\-\/]{2,200}$/,
    barrio: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s0-9'.,\-]{2,100}$/,
    ciudad: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'.-]{2,100}$/,
    piso_depto: /^[a-zA-Z0-9\s\-º°]{1,20}$/
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar nombre (obligatorio)
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (!regexPatterns.nombre.test(formData.nombre.trim())) {
      newErrors.nombre = 'El nombre solo puede contener letras, espacios, acentos y caracteres especiales como apostrofes y guiones (2-100 caracteres)'
    }

    // Validar apellido (opcional pero con formato)
    if (formData.apellido && !regexPatterns.apellido.test(formData.apellido.trim())) {
      newErrors.apellido = 'El apellido solo puede contener letras, espacios, acentos y caracteres especiales como apostrofes y guiones (2-100 caracteres)'
    }

    // Validar documento (obligatorio)
    if (!formData.documento.trim()) {
      newErrors.documento = 'El documento es obligatorio'
    } else {
      const tipoDoc = formData.tipo_documento
      const docPattern = regexPatterns.documento[tipoDoc]
      
      if (docPattern && !docPattern.test(formData.documento.trim())) {
        const mensajes = {
          DNI: 'El DNI debe tener 7 u 8 dígitos',
          RUC: 'El RUC debe tener exactamente 11 dígitos',
          PASAPORTE: 'El pasaporte debe tener formato: 1-3 letras seguidas de 6-9 números',
          CARNET_EXTRANJERIA: 'El carnet de extranjería debe tener 6-12 caracteres alfanuméricos'
        }
        newErrors.documento = mensajes[tipoDoc] || 'Formato de documento inválido'
      }
    }

    // Validar email (opcional pero con formato)
    if (formData.email && formData.email.trim()) {
      if (!regexPatterns.email.test(formData.email.trim())) {
        newErrors.email = 'Ingrese un email válido (ejemplo: usuario@dominio.com)'
      }
    }

    // Validar teléfono (opcional pero con formato)
    if (formData.telefono && formData.telefono.trim()) {
      if (!regexPatterns.telefono.test(formData.telefono.trim())) {
        newErrors.telefono = 'Ingrese un teléfono válido. Ejemplos: +54 11 1234-5678, (011) 1234-5678, 11-1234-5678'
      }
    }

    // Validar dirección
    if (formData.calle && formData.calle.trim() && !regexPatterns.calle.test(formData.calle.trim())) {
      newErrors.calle = 'La calle puede contener letras, números, espacios y caracteres especiales como comas, puntos y guiones (2-200 caracteres)'
    }

    if (formData.numero && formData.numero.trim() && !regexPatterns.numero.test(formData.numero.trim())) {
      newErrors.numero = 'El número debe contener solo dígitos, opcionalmente seguido de una letra (ej: 123, 123A)'
    }

    if (formData.piso_depto && formData.piso_depto.trim() && !regexPatterns.piso_depto.test(formData.piso_depto.trim())) {
      newErrors.piso_depto = 'Piso/Depto puede contener letras, números, espacios y símbolos como º o ° (máximo 20 caracteres)'
    }

    if (formData.barrio && formData.barrio.trim() && !regexPatterns.barrio.test(formData.barrio.trim())) {
      newErrors.barrio = 'El barrio puede contener letras, números, espacios y caracteres especiales (2-100 caracteres)'
    }

    if (formData.codigo_postal && formData.codigo_postal.trim() && !regexPatterns.codigo_postal.test(formData.codigo_postal.trim())) {
      newErrors.codigo_postal = 'El código postal debe tener entre 4 y 8 dígitos'
    }

    if (formData.ciudad && formData.ciudad.trim() && !regexPatterns.ciudad.test(formData.ciudad.trim())) {
      newErrors.ciudad = 'La ciudad puede contener letras, espacios, acentos y caracteres especiales como apostrofes y guiones (2-100 caracteres)'
    }

    // Validar fecha de nacimiento
    if (formData.fecha_nacimiento) {
      const fechaNac = new Date(formData.fecha_nacimiento)
      const hoy = new Date()
      const edad = hoy.getFullYear() - fechaNac.getFullYear()
      
      if (fechaNac > hoy) {
        newErrors.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura'
      } else if (edad > 120) {
        newErrors.fecha_nacimiento = 'La edad no puede ser mayor a 120 años'
      } else if (edad < 0) {
        newErrors.fecha_nacimiento = 'Fecha de nacimiento inválida'
      }
    }

    // Validar límite de crédito
    if (formData.limite_credito) {
      const credito = parseFloat(formData.limite_credito)
      if (isNaN(credito)) {
        newErrors.limite_credito = 'El límite de crédito debe ser un número válido'
      } else if (credito < 0) {
        newErrors.limite_credito = 'El límite de crédito no puede ser negativo'
      } else if (credito > 999999999.99) {
        newErrors.limite_credito = 'El límite de crédito es demasiado alto (máximo: $999,999,999.99)'
      }
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
    
    // Validación en tiempo real para ciertos campos
    if (errors[name]) {
      const fieldErrors = {}
      
      // Re-validar solo el campo que cambió
      switch (name) {
        case 'email':
          if (value && value.trim() && !regexPatterns.email.test(value.trim())) {
            fieldErrors.email = 'Ingrese un email válido (ejemplo: usuario@dominio.com)'
          }
          break
          
        case 'documento':
          if (value && value.trim()) {
            const tipoDoc = formData.tipo_documento
            const docPattern = regexPatterns.documento[tipoDoc]
            
            if (docPattern && !docPattern.test(value.trim())) {
              const mensajes = {
                DNI: 'El DNI debe tener 7 u 8 dígitos',
                RUC: 'El RUC debe tener exactamente 11 dígitos',
                PASAPORTE: 'El pasaporte debe tener formato: 1-3 letras seguidas de 6-9 números',
                CARNET_EXTRANJERIA: 'El carnet de extranjería debe tener 6-12 caracteres alfanuméricos'
              }
              fieldErrors.documento = mensajes[tipoDoc] || 'Formato de documento inválido'
            }
          }
          break
          
        case 'telefono':
          if (value && value.trim() && !regexPatterns.telefono.test(value.trim())) {
            fieldErrors.telefono = 'Ingrese un teléfono válido. Ejemplos: +54 11 1234-5678, (011) 1234-5678'
          }
          break
          
        case 'codigo_postal':
          if (value && value.trim() && !regexPatterns.codigo_postal.test(value.trim())) {
            fieldErrors.codigo_postal = 'El código postal debe tener entre 4 y 8 dígitos'
          }
          break
          
        case 'fecha_nacimiento':
          if (value) {
            const fechaNac = new Date(value)
            const hoy = new Date()
            const edad = hoy.getFullYear() - fechaNac.getFullYear()
            
            if (fechaNac > hoy) {
              fieldErrors.fecha_nacimiento = 'La fecha de nacimiento no puede ser futura'
            } else if (edad > 120) {
              fieldErrors.fecha_nacimiento = 'La edad no puede ser mayor a 120 años'
            } else if (edad < 0) {
              fieldErrors.fecha_nacimiento = 'Fecha de nacimiento inválida'
            }
          }
          break
          
        case 'nombre':
          if (value && value.trim() && !regexPatterns.nombre.test(value.trim())) {
            fieldErrors.nombre = 'El nombre solo puede contener letras, espacios, acentos y caracteres especiales como apostrofes y guiones (2-100 caracteres)'
          }
          break
          
        case 'apellido':
          if (value && value.trim() && !regexPatterns.apellido.test(value.trim())) {
            fieldErrors.apellido = 'El apellido solo puede contener letras, espacios, acentos y caracteres especiales como apostrofes y guiones (2-100 caracteres)'
          }
          break
          
        case 'calle':
          if (value && value.trim() && !regexPatterns.calle.test(value.trim())) {
            fieldErrors.calle = 'La calle puede contener letras, números, espacios y caracteres especiales como comas, puntos y guiones (2-200 caracteres)'
          }
          break
          
        case 'numero':
          if (value && value.trim() && !regexPatterns.numero.test(value.trim())) {
            fieldErrors.numero = 'El número debe contener solo dígitos, opcionalmente seguido de una letra (ej: 123, 123A)'
          }
          break
          
        case 'piso_depto':
          if (value && value.trim() && !regexPatterns.piso_depto.test(value.trim())) {
            fieldErrors.piso_depto = 'Piso/Depto puede contener letras, números, espacios y símbolos como º o ° (máximo 20 caracteres)'
          }
          break
          
        case 'barrio':
          if (value && value.trim() && !regexPatterns.barrio.test(value.trim())) {
            fieldErrors.barrio = 'El barrio puede contener letras, números, espacios y caracteres especiales (2-100 caracteres)'
          }
          break
          
        case 'ciudad':
          if (value && value.trim() && !regexPatterns.ciudad.test(value.trim())) {
            fieldErrors.ciudad = 'La ciudad puede contener letras, espacios, acentos y caracteres especiales como apostrofes y guiones (2-100 caracteres)'
          }
          break
      }
      
      // Actualizar errores
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name] || ''
      }))
    }
  }

  // Validación especial cuando cambia el tipo de documento
  const handleTipoDocumentoChange = (e) => {
    const nuevoTipo = e.target.value
    setFormData(prev => ({
      ...prev,
      tipo_documento: nuevoTipo
    }))
    
    // Re-validar documento con el nuevo tipo si hay documento ingresado
    if (formData.documento && formData.documento.trim()) {
      const docPattern = regexPatterns.documento[nuevoTipo]
      if (docPattern && !docPattern.test(formData.documento.trim())) {
        const mensajes = {
          DNI: 'El DNI debe tener 7 u 8 dígitos',
          RUC: 'El RUC debe tener exactamente 11 dígitos',
          PASAPORTE: 'El pasaporte debe tener formato: 1-3 letras seguidas de 6-9 números',
          CARNET_EXTRANJERIA: 'El carnet de extranjería debe tener 6-12 caracteres alfanuméricos'
        }
        setErrors(prev => ({
          ...prev,
          documento: mensajes[nuevoTipo] || 'Formato de documento inválido'
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          documento: ''
        }))
      }
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
                className={errors.apellido ? 'error' : ''}
                disabled={loading}
              />
              {errors.apellido && <span className="error-text">{errors.apellido}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="tipo_documento">Tipo de documento</label>
              <select
                id="tipo_documento"
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleTipoDocumentoChange}
                disabled={loading}
              >
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="CARNET_EXTRANJERIA">Carnet de Extranjería</option>
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
              <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                className={errors.fecha_nacimiento ? 'error' : ''}
                disabled={loading}
              />
              {errors.fecha_nacimiento && <span className="error-text">{errors.fecha_nacimiento}</span>}
            </div>
          </div>
        </div>

        {/* Dirección detallada */}
        <div className="form-section">
          <h3>📍 Dirección</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="calle">Calle</label>
              <input
                type="text"
                id="calle"
                name="calle"
                value={formData.calle}
                onChange={handleChange}
                className={errors.calle ? 'error' : ''}
                placeholder="Av. San Martin"
                disabled={loading}
              />
              {errors.calle && <span className="error-text">{errors.calle}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="numero">Número</label>
              <input
                type="text"
                id="numero"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                className={errors.numero ? 'error' : ''}
                placeholder="1234"
                disabled={loading}
              />
              {errors.numero && <span className="error-text">{errors.numero}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="piso_depto">Piso/Depto</label>
              <input
                type="text"
                id="piso_depto"
                name="piso_depto"
                value={formData.piso_depto}
                onChange={handleChange}
                className={errors.piso_depto ? 'error' : ''}
                placeholder="3º A"
                disabled={loading}
              />
              {errors.piso_depto && <span className="error-text">{errors.piso_depto}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="barrio">Barrio</label>
              <input
                type="text"
                id="barrio"
                name="barrio"
                value={formData.barrio}
                onChange={handleChange}
                className={errors.barrio ? 'error' : ''}
                placeholder="Dorrego"
                disabled={loading}
              />
              {errors.barrio && <span className="error-text">{errors.barrio}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="codigo_postal">Código Postal</label>
              <input
                type="text"
                id="codigo_postal"
                name="codigo_postal"
                value={formData.codigo_postal}
                onChange={handleChange}
                className={errors.codigo_postal ? 'error' : ''}
                placeholder="1414"
                disabled={loading}
              />
              {errors.codigo_postal && <span className="error-text">{errors.codigo_postal}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="ciudad">Ciudad</label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                className={errors.ciudad ? 'error' : ''}
                placeholder="Buenos Aires"
                disabled={loading}
              />
              {errors.ciudad && <span className="error-text">{errors.ciudad}</span>}
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="form-section">
          <h3>Observaciones</h3>
          <div className="form-group">
            <label htmlFor="observaciones">Notas y observaciones</label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
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