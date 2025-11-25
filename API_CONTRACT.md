# API Contract - ERP LA ESPONJA (Multi-sucursal)

Esta guía resume el contrato para el front-end: endpoints clave, headers, payloads y respuestas esperadas, con selección de sucursal para administradores.

## Autenticación

- POST /api/auth/login
  - Body
    {
      "email": "admin@laesponja.com",
      "password": "admin123"
    }
  - Respuesta (200)
    {
      "success": true,
      "data": {
        "token": "<JWT>",
        "usuario": {
          "id": 1,
          "nombre": "Admin",
          "email": "admin@laesponja.com",
          "rol": "admin",
          "sucursal_id": 1
        }
      }
    }
  - Errores: 400 credenciales inválidas, 401/403 según caso

Headers comunes:
- Authorization: Bearer <token>
- Content-Type: application/json

## Selección de sucursal (solo Admin)
- Admin puede operar sobre cualquier sucursal enviando UNO de los siguientes:
  - Header: X-Sucursal-Id: <id>
  - Query: ?sucursal_id=<id>
  - Body: { "sucursal_id": <id> }
- No-Admin: ignora cualquier sucursal enviada y se usa su propia. Si intenta otra, 403.

## Ventas
- POST /api/ventas
  - Headers: Authorization, (opcional Admin) X-Sucursal-Id
  - Body
    {
      "cliente_id": 12,
      "cliente_nombre": "Cliente General",
      "metodo_pago": "efectivo" | "tarjeta" | "transferencia" | "credito",
      "descuento": 0,
      "observaciones": "",
      "detalles": [
        { "producto_id": 5, "cantidad": 2, "precio_unitario": 300 }
      ]
    }
  - Respuesta (201)
    {
      "success": true,
      "message": "Venta registrada exitosamente",
      "data": {
        "id": 101,
        "total": 600,
        "estado": "completada",
        "sucursal_id": 3,
        "items": [ { "producto_id": 5, "cantidad": 2, "precio_unitario": 300 } ],
        "vendedor": { "id": 2, "nombre": "Empleado" }
      }
    }
  - Errores: 400 validación, 404 producto/cliente no encontrado, 400 stock insuficiente

- GET /api/ventas?pagina=1&limit=10&estado=completada
  - Filtra por sucursal del contexto (ver selección).

- PUT /api/ventas/:id/cancelar
  - Reintegra stock, registra egreso en caja. Usa sucursal del contexto.

## Compras
- POST /api/compras
  - Body
    {
      "proveedor_id": 5,
      "numero_factura": "A-0001",
      "fecha_compra": "2025-11-05",
      "descuento": 0,
      "impuestos": 0,
      "metodo_pago": "transferencia",
      "estado": "pendiente",
      "detalles": [
        { "producto_id": 5, "cantidad": 10, "precio_unitario": 150, "descuento_item": 0 }
      ],
      "observaciones": ""
    }
  - Respuesta (201) con compra + detalles.
  - Notas: crea movimientos de inventario (entrada) y actualiza costo promedio. Siempre en sucursal del contexto.

- PUT /api/compras/:id/estado
  - Cambios relevantes:
    - pendiente -> recibida: incrementa stock
    - -> cancelada: revierte stock (si correspondía)
    - -> pagada: crea egreso en caja

## Productos
- GET /api/productos
  - Query: page, limit, search, categoria, activo, incluir_stock_sucursal, stock_bajo, global
  - Headers: Authorization, (opcional Admin) X-Sucursal-Id
  - Respuesta (200)
    {
      "success": true,
      "data": [
        {
          "id": 5,
          "nombre": "Detergente Líquido",
          "codigo_producto": "DET-001",
          "categoria": "Limpieza",
          "precio_venta": 1500,
          "unidad_medida": "Litros",
          "activo": true,
          "stock_actual": 25,
          "stock_minimo": 10
        }
      ]
    }
  - Notas: Si admin usa X-Sucursal-Id, filtra por esa sucursal. Si global=true, muestra todos los productos.

- GET /api/productos/:id
  - Respuesta con detalles del producto específico

## Sucursales
- GET /api/sucursales
  - Headers: Authorization
  - Respuesta (200)
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "nombre": "Sucursal Centro",
          "direccion": "Calle 123",
          "telefono": "123456789",
          "activa": true
        }
      ]
    }
  - Notas: Admin ve todas las sucursales. Vendedor ve solo la suya.

## Stock por Sucursal
- GET /api/stock-sucursal
  - Query: page, limit, producto_id, stock_bajo
  - Headers: Authorization, (opcional Admin) X-Sucursal-Id
  - Respuesta (200) con stock actual por producto en la sucursal del contexto

- POST /api/stock-sucursal
  - Body
    {
      "producto_id": 5,
      "stock_actual": 50,
      "stock_minimo": 10,
      "stock_maximo": 100,
      "ubicacion": "Estante A1"
    }
  - Crea/actualiza registro de stock para producto en sucursal del contexto

## Inventario
- POST /api/inventario
  - Body
    {
      "producto_id": 5,
      "tipo": "entrada" | "salida" | "ajuste",
      "cantidad": 5,
      "motivo": "Reposición",
      "precio_unitario": 100,
      "observaciones": "opcional"
    }
  - Respuesta (201) con movimiento y datos relacionados.

- GET /api/inventario
  - Query: page, limit, producto_id, tipo, usuario_id, fecha_desde, fecha_hasta

## Caja (Solo Admin en lectura)
- POST /api/caja
  - Body
    {
      "tipo": "ingreso" | "egreso",
      "monto": 500,
      "descripcion": "Ingreso extra",
      "categoria": "otro",
      "metodo_pago": "efectivo",
      "observaciones": ""
    }
  - Respuesta (201) con movimiento y usuario. Usa sucursal del contexto.

- GET /api/caja
  - Query: page, limit, tipo, categoria, metodo_pago, estado, fecha_desde, fecha_hasta, busqueda
  - Filtra por sucursal del contexto.

- GET /api/caja/:id
- GET /api/caja/balance | /estadisticas | /resumen
  - Requieren rol admin. Limitados a la sucursal del contexto.

## Estadísticas y métricas (Solo Admin)
- GET /api/ventas/estadisticas/resumen
- GET /api/compras/estadisticas/resumen
- GET /api/inventario/estadisticas
- GET /api/productos/estadisticas/resumen
- GET /api/clientes/:id/estadisticas
- GET /api/proveedores/:id/estadisticas

## Reglas de Roles
- Admin: puede elegir sucursal (header/query/body). Acceso completo.
- Vendedor: opera solo en su sucursal. Puede crear: clientes, ventas, compras y movimientos de inventario. No puede acceder a: caja (lectura), balances, resúmenes ni endpoints de estadísticas.

## Errores comunes
- 401: Falta token o token inválido
- 403: Intento de operar otra sucursal sin permisos
- 400: Validación (datos incompletos, tipos inválidos)
- 404: Recurso no encontrado (producto/cliente/proveedor/sucursal)

## Notas de integración
- Guardar el JWT tras login y enviarlo en todas las requests protegidas.
- Si el usuario es Admin y el front permite “cambiar sucursal”, enviar `X-Sucursal-Id` con el ID destino.
- Todos los listados y creaciones registran/filtran por sucursal según contexto.
