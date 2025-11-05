import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../../store/slices/usuariosSlice'
import { fetchSucursales } from '../../store/slices/sucursalesSlice'
import './RecursosHumanos.css'

const RecursosHumanos = () => {
  const dispatch = useDispatch()
  const { items: usuarios, loading: loadingUsuarios, error } = useSelector((s) => s.usuarios)
  const { items: sucursales } = useSelector((s) => s.sucursales)

  const [form, setForm] = useState({ id: null, nombre: '', email: '', password: '', sucursal_id: '' })

  useEffect(() => {
    dispatch(fetchUsuarios())
    dispatch(fetchSucursales())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.email.trim() || (!form.id && !form.password) || !form.sucursal_id) return

    const payload = {
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      rol: 'vendedor',
      sucursal_id: Number(form.sucursal_id)
    }
    if (!form.id) payload.password = form.password

    if (form.id) {
      await dispatch(actualizarUsuario({ id: form.id, payload })).unwrap()
    } else {
      await dispatch(crearUsuario(payload)).unwrap()
    }
  setForm({ id: null, nombre: '', email: '', password: '', sucursal_id: '' })
    dispatch(fetchUsuarios())
  }

  const handleEdit = (u) => {
  setForm({ id: u.id, nombre: u.nombre || '', email: u.email || '', password: '', sucursal_id: u.sucursal_id || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (u) => {
    if (window.confirm(`¿Eliminar al usuario ${u.nombre} (${u.email})?`)) {
      await dispatch(eliminarUsuario(u.id)).unwrap()
      dispatch(fetchUsuarios())
    }
  }

  return (
    <div className="page">
      <h1>Recursos Humanos</h1>
      <p>Gestión de empleados (solo Admin). Asigna sucursal principal y rol.</p>

      <div className="placeholder-content rrhh-form-card">
        <h3>{form.id ? 'Editar empleado' : 'Crear empleado'}</h3>
        <form onSubmit={handleSubmit} className="rrhh-form-grid">
          <div>
            <label>Nombre</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Juan Pérez" />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="empleado@laesponja.com" />
          </div>
          {!form.id && (
            <div>
              <label>Contraseña</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="********" />
            </div>
          )}
          <div>
            <label>Sucursal principal</label>
            <select value={form.sucursal_id} onChange={(e) => setForm({ ...form, sucursal_id: e.target.value })}>
              <option value="">Seleccione sucursal</option>
              {sucursales?.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre || `Sucursal ${s.id}`}</option>
              ))}
            </select>
          </div>
          <div className="rrhh-form-actions">
            <button type="submit" className="btn-primary" disabled={loadingUsuarios}>
              {form.id ? 'Guardar cambios' : 'Crear empleado'}
            </button>
            {form.id && (
              <button type="button" className="btn-secondary" onClick={() => setForm({ id: null, nombre: '', email: '', password: '', sucursal_id: '' })}>Cancelar</button>
            )}
            {error && <span style={{ color: '#d32f2f' }}>{error}</span>}
          </div>
        </form>
      </div>

      <h3>Empleados</h3>
      {loadingUsuarios ? (
        <p>Cargando...</p>
      ) : (
        <div className="rrhh-table-wrapper">
          <table className="rrhh-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Sucursal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios?.length ? usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.rol}</td>
                  <td>{(() => { const s = sucursales?.find(x => String(x.id) === String(u.sucursal_id)); return s?.nombre || u.sucursal_id })()}</td>
                  <td>
                    <div className="rrhh-actions">
                      <button className="btn-secondary btn-small" onClick={() => handleEdit(u)}>✏️ Editar</button>
                      <button className="btn-danger btn-small" onClick={() => handleDelete(u)}>🗑️ Eliminar</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="rrhh-empty">No hay usuarios</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default RecursosHumanos