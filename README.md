# Frontend ERP La Esponja

Sistema de gestión empresarial (ERP) desarrollado con React y Redux para La Esponja.

## 🚀 Tecnologías Utilizadas

- **Frontend Framework**: React 19
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
   cd FRONT-END-ERP-LA-ESPONJA
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```bash
   # Crea un archivo .env en la raíz del proyecto
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

La aplicación estará disponible en `http://localhost:3000`

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

- Interceptores para autenticación automática
- Manejo centralizado de errores
- Base URL configurable
- Timeout y retry automático

## 🎨 Estilo y Tema

- Variables CSS para consistencia visual
- Diseño responsive para móviles y escritorio
- Tema corporativo personalizable
- Componentes reutilizables

## 🚧 Estado del Desarrollo

- ✅ Estructura base del proyecto
- ✅ Configuración de Redux
- ✅ Navegación y rutas
- ✅ Dashboard principal
- 🚧 Módulos del ERP (en desarrollo)
- ❌ Autenticación completa
- ❌ Conexión con backend

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