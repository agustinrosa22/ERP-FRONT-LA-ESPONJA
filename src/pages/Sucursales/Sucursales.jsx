import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSucursales, crearSucursal, actualizarSucursal, eliminarSucursal } from '../../store/slices/sucursalesSlice'
import './Sucursales.css'

const Sucursales = () => {
  const dispatch = useDispatch()
  const { items, loading, error } = useSelector((state) => state.sucursales)
  const { usuario } = useSelector((state) => state.auth)

  const [form, setForm] = useState({ id: null, nombre: '', descripcion: '' })

  useEffect(() => {
    // Cargar listado al entrar
    dispatch(fetchSucursales())
  }, [dispatch])

  if (usuario?.rol !== 'admin') {
    return (
      <div className="sucursales-page">
        <h2>No autorizado</h2>
        <p>Esta sección es solo para administradores.</p>
      </div>
    )
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    if (form.id) {
      await dispatch(actualizarSucursal({ id: form.id, payload: { nombre: form.nombre.trim(), descripcion: form.descripcion.trim() || undefined } }))
    } else {
      await dispatch(crearSucursal({ nombre: form.nombre.trim(), descripcion: form.descripcion.trim() || undefined }))
    }
    setForm({ id: null, nombre: '', descripcion: '' })
    // refrescar listado (por si el backend no devuelve la entidad creada completa)
    dispatch(fetchSucursales())
  }

  const handleEditar = (s) => {
    setForm({ id: s.id, nombre: s.nombre || '', descripcion: s.descripcion || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEliminar = async (s) => {
    if (window.confirm(`¿Eliminar la sucursal "${s.nombre}" (ID ${s.id})?`)) {
      await dispatch(eliminarSucursal(s.id))
      dispatch(fetchSucursales())
    }
  }

  return (
    <div className="sucursales-page">
      <div className="sucursales-header">
        <h1>Gestión de Sucursales</h1>
        <p>Administra las sucursales del sistema. Cada sucursal es independiente en stock, caja, ventas y compras.</p>
      </div>

      <div className="sucursales-grid">
        <section className="sucursal-form-card">
          <h2>{form.id ? 'Editar sucursal' : 'Crear nueva sucursal'}</h2>
          <form onSubmit={handleSubmit} className="sucursal-form">
            <div className="form-group">
              <label>Nombre</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Sucursal Centro" />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Opcional" />
            </div>
            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={loading}>
                {form.id ? 'Guardar cambios' : 'Crear sucursal'}
              </button>
              {form.id && (
                <button type="button" className="btn-secondary" onClick={() => setForm({ id: null, nombre: '', descripcion: '' })}>Cancelar</button>
              )}
            </div>
            {error && <div className="error">{error}</div>}
          </form>
        </section>

        <section className="sucursales-list-card">
          <h2>Listado de sucursales</h2>
          {loading && <div className="loading">Cargando...</div>}
          <table className="sucursales-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th style={{ width: 160 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items?.length ? (
                items.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.nombre}</td>
                    <td>{s.descripcion || '-'}</td>
                    <td>
                      <div className="actions">
                        <button className="btn-small btn-secondary" onClick={() => handleEditar(s)}>✏️ Editar</button>
                        <button className="btn-small btn-danger" onClick={() => handleEliminar(s)}>🗑️ Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty">No hay sucursales registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}

export default Sucursales
