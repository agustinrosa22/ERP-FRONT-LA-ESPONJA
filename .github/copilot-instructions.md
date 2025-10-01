<!-- Instrucciones específicas del workspace para el Frontend ERP -->

## Proyecto Frontend ERP - La Esponja

### Stack Tecnológico
- **Framework**: React con JavaScript
- **Gestión de Estado**: Redux Toolkit
- **Enrutamiento**: React Router DOM
- **Build Tool**: Vite
- **Estilos**: CSS Modules / Styled Components
- **HTTP Client**: Axios
- **UI Framework**: A definir (Material-UI, Ant Design, etc.)

### Estructura del Proyecto
- `/src/components` - Componentes reutilizables
- `/src/pages` - Páginas principales del ERP
- `/src/store` - Configuración de Redux (slices, store)
- `/src/services` - Servicios para comunicación con API
- `/src/utils` - Utilidades y helpers
- `/src/assets` - Recursos estáticos
- `/src/hooks` - Custom hooks de React

### Módulos del ERP
- Dashboard principal
- Gestión de inventario
- Recursos humanos
- Contabilidad/Finanzas
- Ventas y CRM
- Compras y proveedores
- Reportes y analytics

### Guías de Desarrollo
- Usar functional components con hooks
- Implementar Redux Toolkit para estado global
- Seguir convenciones de naming en español para el dominio
- Implementar autenticación con JWT
- Usar componentes reutilizables y modulares