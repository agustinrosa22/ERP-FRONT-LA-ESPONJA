import React from 'react'
import './Ayuda.css'

const Anchor = ({ id }) => <span id={id} style={{ position: 'relative', top: '-80px' }} />

const Ayuda = () => {
  const updated = new Date().toLocaleDateString()
  return (
    <div className="ayuda-page">
      <div className="ayuda-header">
        <h1>📘 Guía de uso — ERP La Esponja</h1>
        <span className="ayuda-updated">Actualizado: {updated}</span>
      </div>

      <div className="ayuda-intro">
        <p>
          Esta guía te acompaña paso a paso para operar el sistema en el día a día, sin tecnicismos.
          Si ves un icono de sucursal 🏬, recuerda: todo sucede en la sucursal activa (la que ves arriba a la derecha).
        </p>
        <p className="ayuda-note">
          Admin puede cambiar de sucursal desde la barra lateral (selector "Sucursal"). Vendedores operan siempre en su sucursal.
        </p>
      </div>

      <div className="ayuda-index">
        <div className="ayuda-card"><a href="#sesion"><h3>🔑 Ingreso y sesión</h3><p>Cómo entrar y salir, recuperar acceso.</p></a></div>
        <div className="ayuda-card"><a href="#sucursal"><h3>🏬 Sucursal activa</h3><p>Cómo funciona el contexto de sucursal.</p></a></div>
        <div className="ayuda-card"><a href="#productos"><h3>🧪 Productos</h3><p>Catálogo estricto vs global, búsqueda, stock bajo.</p></a></div>
        <div className="ayuda-card"><a href="#inventario"><h3>📦 Inventario</h3><p>Ver stock, alertas y movimientos.</p></a></div>
        <div className="ayuda-card"><a href="#ventas"><h3>🛒 Ventas</h3><p>Armar ticket y descontar stock.</p></a></div>
        <div className="ayuda-card"><a href="#compras"><h3>🛍️ Compras</h3><p>Ingresar mercadería y sumar stock.</p></a></div>
        <div className="ayuda-card"><a href="#reportes"><h3>📈 Reportes</h3><p>Indicadores y consultas.</p></a></div>
        <div className="ayuda-card"><a href="#consejos"><h3>💡 Consejos rápidos</h3><p>Atajos y resolución de errores comunes.</p></a></div>
      </div>

      <div className="ayuda-section">
        <Anchor id="sesion" />
        <h2>🔑 Ingreso y sesión</h2>
        <ul className="ayuda-steps">
          <li>Desde la pantalla de inicio, accedé a <strong>Login</strong> e ingresá tu correo y contraseña.</li>
          <li>Si sos <strong>Admin</strong>, verás opciones extra (p. ej. Sucursales, RRHH, resúmenes globales).</li>
          <li>Para salir, usá el botón <strong>Cerrar Sesión</strong> en la barra lateral.</li>
        </ul>
        <div className="ayuda-tip">Si olvidaste tu contraseña, consultá con el administrador del sistema.</div>
      </div>

      <div className="ayuda-section">
        <Anchor id="sucursal" />
        <h2>🏬 Sucursal activa</h2>
        <p>
          La aplicación trabaja por sucursal. Eso significa que los listados, las ventas, compras y movimientos
          afectan solo a la sucursal que está seleccionada.
        </p>
        <ul className="ayuda-steps">
          <li><strong>Admin</strong>: elegí la sucursal desde el selector en la barra lateral. Todo se actualizará automáticamente.</li>
          <li><strong>Vendedor</strong>: trabajás siempre en tu sucursal asignada.</li>
          <li>En la parte superior verás tu sucursal actual junto al título de cada módulo.</li>
        </ul>
        <div className="ayuda-note">Si cambias de sucursal, la lista de productos y el stock se recargan para esa sucursal.</div>
      </div>

      <div className="ayuda-section">
        <Anchor id="productos" />
        <h2>🧪 Productos</h2>
        <p>El catálogo funciona con dos modos:</p>
        <ul className="ayuda-steps">
          <li><strong>Estricto (por defecto):</strong> muestra solo productos que existen en la sucursal actual (tienen stock o registro en esa sucursal).</li>
          <li><strong>Global:</strong> muestra el catálogo completo (incluso productos que todavía no existen en esta sucursal).</li>
        </ul>
        <div className="ayuda-tip">Podés alternar entre Estricto y Global desde el botón en la vista de Productos e Inventario.</div>
        <p>Acciones frecuentes:</p>
        <ul className="ayuda-steps">
          <li><strong>Buscar:</strong> por nombre, código o categoría. El resultado respeta el modo elegido (Estricto/Global).</li>
          <li><strong>Stock bajo:</strong> el botón "⚠️ Stock Bajo" muestra solo los productos en alerta (útil para reponer).</li>
          <li><strong>Nuevo producto:</strong> permite crear un producto global. Para "activarlo" en una sucursal, hacé una compra o ajustá el stock en esa sucursal.</li>
        </ul>
      </div>

      <div className="ayuda-section">
        <Anchor id="inventario" />
        <h2>📦 Inventario</h2>
        <p>Acá ves el stock por producto para la sucursal actual, alertas y el historial de movimientos.</p>
        <ul className="ayuda-steps">
          <li><strong>Stock:</strong> listado con filtros por producto, sucursal y estado (bajo, normal, alto, sin stock).</li>
          <li><strong>Alertas:</strong> muestra productos en cero o debajo del mínimo para actuar rápido.</li>
          <li><strong>Historial:</strong> consulta entradas, salidas y ajustes por producto.</li>
          <li><strong>Nuevo Stock / Actualizar:</strong> registra la existencia del producto en la sucursal o ajusta valores de stock.</li>
        </ul>
        <div className="ayuda-note">En modo Global podés explorar el catálogo completo, aunque el stock sea 0 en esta sucursal.</div>
      </div>

      <div className="ayuda-section">
        <Anchor id="ventas" />
        <h2>🛒 Ventas</h2>
        <p>Usá esta sección para registrar ventas y descontar stock automáticamente.</p>
        <ul className="ayuda-steps">
          <li>Elegí un cliente (o cargá el nombre manualmente si es venta rápida).</li>
          <li>Sumá productos con cantidad y precio. Solo aparecen productos con stock disponible en la sucursal.</li>
          <li>Seleccioná el método de pago y cargá descuentos si corresponde.</li>
          <li>Guardá la venta para que se descuente el stock y quede registrada.</li>
        </ul>
        <div className="ayuda-warning">Si no ves un producto, puede que no tenga stock en esta sucursal. Cambiá a modo Global en Productos para verificar si existe a nivel catálogo.</div>
      </div>

      <div className="ayuda-section">
        <Anchor id="compras" />
        <h2>🛍️ Compras</h2>
        <p>Registrá compras para ingresar mercadería y aumentar el stock en la sucursal.</p>
        <ul className="ayuda-steps">
          <li>Elegí el proveedor y la fecha (y números de factura/remito si los tenés).</li>
          <li>Agregá productos del catálogo. Podés ver el catálogo Global para incorporar productos nuevos a la sucursal.</li>
          <li>Cargá cantidades, precios y descuentos por ítem si aplica.</li>
          <li>Guardá la compra: el stock se actualiza automáticamente en la sucursal.</li>
        </ul>
        <div className="ayuda-tip">Para “activar” un producto sin stock inicial en esta sucursal, podés registrar una compra con cantidad 0 o usar la opción de Nuevo/Actualizar Stock en Inventario.</div>
      </div>

      <div className="ayuda-section">
        <Anchor id="reportes" />
        <h2>📈 Reportes</h2>
        <p>Consultá métricas clave de ventas, inventario y más. Los reportes se filtran por la sucursal activa (Admin puede cambiarla).</p>
        <ul className="ayuda-steps">
          <li>Elegí el periodo y los filtros que necesites.</li>
          <li>Exportá si necesitás compartir la información.</li>
        </ul>
        <div className="ayuda-note">Algunos resúmenes globales están disponibles solo para Admin.</div>
      </div>

      <div className="ayuda-section">
        <Anchor id="consejos" />
        <h2>💡 Consejos rápidos y errores comunes</h2>
        <ul className="ayuda-steps">
          <li>Si cambiás de sucursal, esperá un instante a que la lista de productos se recargue.</li>
          <li>Para encontrar rápido un producto, usá la búsqueda por código en Productos.</li>
          <li>¿No aparece un producto en Ventas? Revisá su stock en Inventario (vista Estricta).</li>
          <li>401 (sesión caducada): volvé a ingresar con tu usuario.</li>
          <li>403 (permisos): estás intentando operar en otra sucursal sin permisos.</li>
        </ul>
        <div className="ayuda-tip">Ante dudas, cambiá a modo Global en Productos para confirmar si el producto existe en el catálogo.</div>
      </div>
    </div>
  )
}

export default Ayuda
