import { useSelector } from 'react-redux'
import './SucursalBadge.css'

const SucursalBadge = () => {
  const { usuario } = useSelector((state) => state.auth)
  const { items: sucursales, selectedSucursalId } = useSelector((state) => state.sucursales)

  const usuarioSucursalId = usuario?.sucursal_id || localStorage.getItem('usuarioSucursalId')
  const esAdmin = usuario?.rol === 'admin'

  const findNombre = (id) => {
    const s = (sucursales || []).find((x) => String(x.id) === String(id))
    return s?.nombre || (id ? `Sucursal ${id}` : 'Sucursal')
  }

  const mostrandoOverride = esAdmin && selectedSucursalId
  const etiqueta = mostrandoOverride
    ? `${findNombre(selectedSucursalId)} (ID ${selectedSucursalId})`
    : `${findNombre(usuarioSucursalId)} (ID ${usuarioSucursalId || '-'})`

  return (
    <div className={`sucursal-badge ${mostrandoOverride ? 'override' : ''}`} title={mostrandoOverride ? 'Operando como Admin sobre otra sucursal' : 'Operando en la sucursal de tu sesión'}>
      <span className="badge-icon">🏬</span>
      <span className="badge-label">Sucursal:</span>
      <span className="badge-value">{etiqueta}</span>
      {mostrandoOverride && <span className="badge-flag">Admin</span>}
    </div>
  )
}

export default SucursalBadge
