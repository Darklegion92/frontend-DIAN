# APIDIAN Frontend

Frontend moderno para el sistema APIDIAN de SolTec, desarrollado con React, TypeScript y TailwindCSS.

## 🚀 Características

- **React 19** con TypeScript para un desarrollo robusto
- **TailwindCSS** para estilos modernos y responsive
- **React Hook Form** con validación Zod
- **Axios** para comunicación con la API
- **React Router** para navegación
- **Lucide React** para iconos
- **Autenticación JWT** integrada
- **Diseño responsive** y moderno
- **Tema personalizado** con colores corporativos de SolTec

## 🎨 Diseño

El frontend utiliza una paleta de colores inspirada en la identidad corporativa de SolTec:
- **Primario**: Naranja (#f67615)
- **Secundario**: Amarillo dorado (#fcb971)
- **Acento**: Naranja oscuro (#e75c0b)

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test
```

## 🔧 Configuración

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ENV=development
REACT_APP_NAME=APIDIAN Frontend
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=true
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── Button.tsx      # Componente de botón reutilizable
│   ├── Input.tsx       # Componente de input con validación
│   ├── Logo.tsx        # Logo de SolTec
│   ├── LoginPage.tsx   # Página de login
│   ├── Dashboard.tsx   # Dashboard principal
│   └── LoadingSpinner.tsx # Spinner de carga
├── hooks/              # Hooks personalizados
│   └── useAuth.tsx     # Hook de autenticación
├── services/           # Servicios de API
│   └── authService.ts  # Servicio de autenticación
├── types/              # Tipos TypeScript
├── utils/              # Utilidades
└── assets/             # Recursos estáticos
```

## 🔐 Autenticación

El sistema utiliza autenticación JWT con las siguientes características:
- Login con email y contraseña
- Almacenamiento seguro del token
- Verificación automática de sesión
- Redirección automática según estado de autenticación
- Logout con limpieza de datos

## 📱 Responsive Design

El frontend está optimizado para:
- **Desktop**: Experiencia completa con todas las funcionalidades
- **Tablet**: Adaptación de layout y navegación
- **Mobile**: Interfaz optimizada para pantallas pequeñas

## 🎯 Funcionalidades

### Página de Login
- Formulario con validación en tiempo real
- Mensajes de error y éxito
- Opción "Recordarme"
- Recuperación de contraseña
- Animaciones suaves

### Dashboard
- Resumen de actividad
- Estadísticas en tiempo real
- Accesos rápidos
- Navegación intuitiva
- Perfil de usuario

## 🛠️ Tecnologías Utilizadas

- **React 19** - Framework principal
- **TypeScript** - Tipado estático
- **TailwindCSS** - Framework de CSS
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Axios** - Cliente HTTP
- **React Router** - Enrutamiento
- **Lucide React** - Iconos

## 🚀 Despliegue

Para desplegar en producción:

```bash
# Construir la aplicación
npm run build

# Los archivos estáticos estarán en la carpeta 'build'
```

## 📄 Licencia

© 2025 SolTec - Tecnología y Desarrollo. Todos los derechos reservados.

## 🤝 Contribución

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico, contacta al equipo de desarrollo de SolTec.
