# Frontend ERP La Esponja

Sistema de gestión empresarial (ERP) desarrollado con React y Redux para La Esponja, con soporte multi-sucursal end-to-end.

## 🚀 Tecnologías Utilizadas

- **Frontend Framework**: React
- **Gestión de Estado**: Redux Toolkit
- **Enrutamiento**: React Router DOM
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Lenguaje**: JavaScript (ES6+)

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── Navbar/         # Navegación principal
├── pages/              # Páginas principales del ERP
│   ├── Dashboard/      # Dashboard principal
│   ├── Inventario/     # Gestión de inventario
│   ├── RecursosHumanos/# Recursos humanos
│   ├── Contabilidad/   # Contabilidad y finanzas
│   ├── Ventas/         # Ventas y CRM
│   ├── Compras/        # Compras y proveedores
│   └── Reportes/       # Reportes y analytics
├── store/              # Configuración de Redux
│   ├── slices/         # Redux slices por módulo
│   └── store.js        # Configuración del store
├── services/           # Servicios para comunicación con API
├── utils/              # Utilidades y helpers
├── assets/             # Recursos estáticos
└── hooks/              # Custom hooks de React
```

## 🏗️ Módulos del ERP

1. **Dashboard** - Vista general y estadísticas
2. **Inventario** - Gestión de productos y stock
3. **Recursos Humanos** - Empleados, nóminas y asistencia
4. **Contabilidad** - Finanzas, cuentas y facturación
5. **Ventas** - CRM y gestión de ventas
6. **Compras** - Proveedores y órdenes de compra
7. **Reportes** - Analytics y reportes del negocio

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- npm o yarn

### Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd ERP-FRONT-LA-ESPONJA
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno (Vite):
   ```bash
   # Crea un archivo .env en la raíz del proyecto
   VITE_API_URL=http://localhost:8888/api
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

Vite expone la app en `http://localhost:5173` (por defecto).

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Genera la build de producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta ESLint para revisar el código

## 🔧 Configuración de Redux

El estado de la aplicación se gestiona con Redux Toolkit y está organizado en slices por módulo:

- `authSlice` - Autenticación y usuario
- `inventarioSlice` - Gestión de inventario
- `recursosHumanosSlice` - Recursos humanos
- `contabilidadSlice` - Contabilidad
- `ventasSlice` - Ventas
- `comprasSlice` - Compras

## 🌐 Comunicación con el Backend

La comunicación con el servidor se realiza a través de Axios con:

- Interceptor para autenticación automática (Authorization: Bearer <token>)
- Header `X-Sucursal-Id` automático cuando el usuario es Admin y eligió una sucursal en el selector del Navbar
- Manejo centralizado de errores
- Base URL configurable
- Timeout y retry automático

## 🎨 Estilo y Tema

- Variables CSS para consistencia visual
- Diseño responsive para móviles y escritorio
- Tema corporativo personalizable
- Componentes reutilizables

## 🏬 Multi-Sucursal (Front-End)

- El usuario inicia sesión y opera en su `sucursal_id` (del token JWT).
- Si es Admin, puede seleccionar otra sucursal desde el footer del Navbar; el front enviará `X-Sucursal-Id` en todas las requests.
- Se muestra una insignia (badge) de sucursal activa en el Navbar y en los encabezados de Dashboard, Inventario, Ventas y Compras.
- Los listados y creaciones se recargan automáticamente cuando cambia la sucursal activa.

Rutas protegidas por rol:
- `/sucursales`: solo Admin (gestiona altas/ediciones/eliminaciones de sucursales).

Gestión de sucursales (UI):
- Menú lateral → "Sucursales" (🏬)
- Form de alta/edición (Nombre, Descripción) + tabla con acciones por fila (✏️, 🗑️)

Permisos (resumen):
- Admin: acceso total y lectura de Caja/Estadísticas; puede cambiar sucursal.
- Vendedor: opera solo en su sucursal; no tiene lectura de Caja ni Estadísticas.

Contrato de API detallado: ver `API_CONTRACT.md`.

Credenciales demo (botón “Cargar credenciales demo” en login):
- Email: `admin@laesponja.com`
- Password: `admin123`

## 🔌 Integración con Insomnia (opcional)

Si usas Insomnia para probar la API:
- Importá `insomnia/ERP_LA_ESPONJA_Insomnia.json` (si está disponible en el repo)
- Configurá en el Environment: `base_url`, `jwt_token` y `sucursal_id`
- Para Admin, enviá `X-Sucursal-Id` para operar sobre otra sucursal

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollo Frontend**: Equipo La Esponja
- **Diseño UI/UX**: Equipo La Esponja
- **Backend**: Equipo La Esponja

---

Desarrollado con ❤️ por el equipo de La Esponja