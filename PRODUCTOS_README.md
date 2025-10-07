# Módulo de Productos - ERP La Esponja

## Descripción
Módulo completo para la gestión de productos químicos de la empresa "Doble A". Incluye funcionalidades CRUD, búsqueda avanzada, gestión de stock y categorización específica para productos químicos.

## Funcionalidades Implementadas

### ✅ Componentes Principales
- **Productos.jsx** - Página principal del módulo
- **ProductoCard.jsx** - Tarjeta de producto con información química
- **ProductoForm.jsx** - Formulario para crear/editar productos

### ✅ Gestión de Estado (Redux)
- **productosSlice.js** - Slice de Redux con todas las acciones
- **productosService.js** - Servicio para comunicación con API

### ✅ Funcionalidades
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Búsqueda por código, nombre o categoría
- ✅ Filtros por categoría química
- ✅ Alertas de stock bajo
- ✅ Vista grid y lista
- ✅ Responsive design (móvil y desktop)
- ✅ Formulario modal para edición
- ✅ Validación de campos

### ✅ Categorías Químicas Soportadas
- Ácidos
- Bases
- Sales
- Solventes
- Oxidantes
- Reductores
- Catalizadores
- Reactivos Orgánicos
- Reactivos Inorgánicos
- Material de Vidrio
- Equipamiento
- Otros

### ✅ Campos del Producto
- Código del producto (único)
- Nombre comercial
- Categoría química
- Descripción técnica
- Precio de costo
- Precio de venta
- Stock actual
- Stock mínimo
- ID del proveedor
- Ubicación en almacén
- Estado activo/inactivo

## Integración Completada

### ✅ Navegación
- Ruta agregada al navbar principal
- Acceso desde `/productos`
- Icono químico (🧪)

### ✅ Routing
- Ruta protegida configurada en App.jsx
- Redirección automática si no autenticado

### ✅ Store Redux
- Slice integrado al store principal
- Estado global disponible

## Uso del Módulo

1. **Acceder al módulo**: Click en "Productos" en el navbar
2. **Crear producto**: Click en botón "Nuevo Producto"
3. **Buscar productos**: Usar barra de búsqueda con filtros
4. **Editar producto**: Click en tarjeta de producto
5. **Ver stock bajo**: Toggle "Stock Bajo" para alertas
6. **Cambiar vista**: Alternar entre grid y lista

## APIs Backend Requeridas

```javascript
// Endpoints esperados por el servicio
GET    /api/productos              // Obtener todos
POST   /api/productos              // Crear nuevo
PUT    /api/productos/:id          // Actualizar
DELETE /api/productos/:id          // Eliminar
GET    /api/productos/buscar/:codigo // Buscar por código
GET    /api/productos/stock-bajo    // Productos con stock bajo
```

## Responsive Design

### Desktop (>768px)
- Vista grid con 3-4 columnas
- Formulario modal centrado
- Navegación completa

### Mobile (≤768px)
- Vista lista automática
- Formulario a pantalla completa
- Navegación colapsible
- Campos optimizados para touch

## Próximas Mejoras Sugeridas

- [ ] Importación masiva desde Excel
- [ ] Códigos de barras/QR
- [ ] Historial de precios
- [ ] Integración con proveedores
- [ ] Reportes de productos más vendidos
- [ ] Sistema de alertas automáticas
- [ ] Fotos de productos
- [ ] Gestión de lotes y vencimientos

## Tecnologías Utilizadas

- React 18+
- Redux Toolkit
- CSS Modules
- React Router DOM
- Axios (para API calls)

---

**Estado**: ✅ COMPLETADO Y LISTO PARA USO

El módulo está completamente funcional y listo para producción con la empresa química "Doble A".