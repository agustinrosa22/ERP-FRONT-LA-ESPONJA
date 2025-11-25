/**
 * Utilidad global para renderizado seguro de valores
 * Previene errores "Objects are not valid as a React child"
 */
import React from 'react'

// Función principal para renderizado seguro
export const safeRender = (value, fallback = '') => {
  // Valores nulos o undefined
  if (value === null || value === undefined) {
    return fallback
  }

  // Si es un objeto, extraer valor renderizable
  if (typeof value === 'object') {
    // Arrays
    if (Array.isArray(value)) {
      return value.length > 0 ? String(value[0]) : fallback
    }

    // Objetos con propiedades específicas
    if (value.nombre) return String(value.nombre)
    if (value.username) return String(value.username) 
    if (value.name) return String(value.name)
    if (value.id) return String(value.id)
    
    // Como último recurso, intentar JSON.stringify
    try {
      return JSON.stringify(value)
    } catch {
      return fallback
    }
  }

  // Valores primitivos (string, number, boolean)
  return String(value)
}

// Wrapper para sanitizar objetos completos
export const sanitizeForRender = (obj) => {
  if (!obj || typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForRender(item))
  }

  const sanitized = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      // Campos conocidos que deben ser strings
      if (['usuario', 'sucursal', 'cliente', 'proveedor'].includes(key)) {
        sanitized[key] = safeRender(value)
        // También mantener el objeto original con un sufijo
        sanitized[`${key}_obj`] = value
      } else {
        sanitized[key] = sanitizeForRender(value)
      }
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

// Hook personalizado para datos sanitizados
export const useSafeData = (data) => {
  return React.useMemo(() => {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeForRender(item))
    }
    return sanitizeForRender(data)
  }, [data])
}

// Componente wrapper para renderizado ultra-seguro
export const SafeText = ({ children, fallback = '' }) => {
  try {
    const safeValue = safeRender(children, fallback)
    return safeValue
  } catch (error) {
    console.warn('SafeText caught error:', error, 'value:', children)
    return String(fallback)
  }
}

export default safeRender