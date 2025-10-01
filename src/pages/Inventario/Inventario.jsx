import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { obtenerProductos } from '../../store/slices/inventarioSlice'

const Inventario = () => {
  const dispatch = useDispatch()
  const { productos, loading, error } = useSelector((state) => state.inventario)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(obtenerProductos())
  }, [dispatch])

  const filteredProducts = productos.filter(producto =>
    producto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="inventario-page">
      <div className="page-header">
        <h1>Gestión de Inventario</h1>
        <button className="btn-primary">+ Agregar Producto</button>
      </div>

      <div className="filters-section">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="products-grid">
        {loading ? (
          <p>Cargando productos...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((producto) => (
            <div key={producto.id} className="product-card">
              <h3>{producto.nombre}</h3>
              <p>Código: {producto.codigo}</p>
              <p>Stock: {producto.stock}</p>
              <p>Precio: ${producto.precio}</p>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <h3>No hay productos disponibles</h3>
            <p>Comienza agregando tu primer producto al inventario</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Inventario