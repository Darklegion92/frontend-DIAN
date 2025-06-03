# 🔐 Interfaz de Administración de Usuarios

Esta interfaz proporciona una gestión completa de usuarios que **solo es accesible por usuarios con rol ADMIN**.

## 🎯 Características Principales

### ✅ **Control de Acceso**
- **Verificación automática de rol**: Solo usuarios ADMIN pueden acceder
- **Página de acceso denegado**: Usuarios sin permisos ven un mensaje informativo
- **Protección a nivel de ruta**: La ruta `/admin/users` está protegida por `AdminRoute`

### 📊 **Dashboard de Usuarios**
- **Vista general**: Estadísticas de usuarios por rol
- **Lista paginada**: Tabla con todos los usuarios del sistema
- **Búsqueda en tiempo real**: Filtro por nombre, email o username
- **Filtro por rol**: Ver solo usuarios de un rol específico

### 👥 **Gestión de Usuarios**
- **Crear usuarios**: Formulario completo para nuevos usuarios
- **Editar usuarios**: Modificar información existente
- **Cambio de roles**: Promover/degradar usuarios entre roles
- **Validaciones**: Verificación de datos en tiempo real

## 🚀 Funcionalidades

### 🔍 **Lista de Usuarios**
- Muestra información completa de cada usuario:
  - Nombre completo y username
  - Email de contacto
  - Rol con badge colorizado
  - Fecha de registro
- Paginación para manejar grandes volúmenes de datos
- Ordenamiento por fecha de creación (más recientes primero)

### ➕ **Crear Usuario**
**Campos del formulario:**
- **Nombre completo** (requerido)
- **Nombre de usuario** (requerido, único)
- **Email** (requerido, único)
- **Contraseña** (requerido para usuarios nuevos)
- **Rol** (USER, DEALER, ADMIN)

**Validaciones:**
- Email formato válido
- Username único en el sistema
- Contraseña mínimo 8 caracteres
- Todos los campos requeridos

### ✏️ **Editar Usuario**
- Mismos campos que crear usuario
- Contraseña opcional (mantiene la actual si se deja vacía)
- Pre-carga los datos existentes del usuario
- Validaciones igual que en creación

### 🎨 **Sistema de Badges por Rol**
- **🔴 ADMIN**: Badge rojo - "Administrador" 
- **🟡 DEALER**: Badge amarillo - "Distribuidor"
- **🟢 USER**: Badge verde - "Usuario"

## 🛡️ Seguridad

### 🔒 **Niveles de Protección**
1. **Autenticación JWT**: Token válido requerido
2. **Verificación de rol**: Solo usuarios ADMIN
3. **Validación de datos**: Tanto frontend como backend
4. **Rutas protegidas**: `AdminRoute` component

### 🚫 **Control de Acceso**
```tsx
// Solo usuarios ADMIN pueden ver esta opción en el sidebar
if (user?.role === UserRole.ADMIN) {
  // Mostrar "Gestión de Usuarios"
}

// Protección de ruta
<AdminRoute>
  <UserManagement />
</AdminRoute>
```

## 📱 Interfaz de Usuario

### 🎛️ **Sidebar Inteligente**
- **Para ADMIN**: Muestra opción "Usuarios" en el menú
- **Para otros roles**: No muestra la opción de gestión de usuarios
- **Indicador de rol**: Badge con el rol actual del usuario

### 📊 **Estadísticas**
Tarjetas con métricas en tiempo real:
- Total de usuarios en el sistema
- Cantidad de administradores
- Cantidad de distribuidores  
- Cantidad de usuarios regulares

### 🔍 **Filtros y Búsqueda**
- **Búsqueda**: Campo de texto que busca en nombre, email y username
- **Filtro por rol**: Dropdown para filtrar por tipo de usuario
- **Búsqueda en tiempo real**: Los resultados se actualizan al escribir

### 📄 **Paginación**
- **Navegación**: Botones anterior/siguiente
- **Información**: "Mostrando página X de Y"
- **Responsive**: Se adapta a diferentes tamaños de pantalla

## 🎯 Componentes Principales

### 1. **AdminRoute** (`/components/AdminRoute.tsx`)
```tsx
// Protege rutas que requieren rol ADMIN
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (user?.role !== UserRole.ADMIN) {
    return <AccessDeniedPage />;
  }
  
  return <>{children}</>;
};
```

### 2. **UserManagement** (`/components/UserManagement.tsx`)
- Componente principal de gestión
- Maneja estado de usuarios, paginación, filtros
- Integra con `authService` para operaciones CRUD

### 3. **UserModal** (`/components/UserModal.tsx`)
- Modal para crear/editar usuarios
- Formulario con validaciones
- Manejo de errores en tiempo real

### 4. **Sidebar** actualizado
- Detecta rol del usuario
- Muestra opción de gestión solo para ADMIN
- Badge de rol en información del usuario

## 📋 Flujo de Usuario

### 🚀 **Para Administradores**
1. Login como usuario ADMIN
2. Ver opción "Usuarios" en sidebar
3. Acceder a `/admin/users`
4. Ver dashboard con estadísticas
5. Listar, filtrar y buscar usuarios
6. Crear nuevos usuarios con botón "Nuevo Usuario"
7. Editar usuarios existentes con botón "Editar"

### 🚫 **Para Otros Roles**
1. Login como USER o DEALER
2. **NO** ven opción "Usuarios" en sidebar
3. Si intentan acceder a `/admin/users` directamente:
   - Ven página de "Acceso Denegado"
   - Mensaje explicativo del error
   - Botón para volver atrás

## 🎨 Estilos y UX

### 🎭 **Design System**
- **Colores primarios**: Azul soltec (`soltec-primary`)
- **Estados de hover**: Efectos suaves de transición
- **Responsive**: Mobile-first design
- **Accessibility**: Labels, ARIA y navegación por teclado

### 💫 **Animaciones**
- **Loading spinners**: Durante operaciones async
- **Transiciones**: Hover states suaves
- **Feedback visual**: Colores de estado (success, error, warning)

### 📱 **Responsive Design**
- **Desktop**: Tabla completa con todas las columnas
- **Tablet**: Navegación adaptada
- **Mobile**: Diseño vertical optimizado

## 🔧 Configuración Técnica

### 📦 **Dependencias**
- **React Router**: Navegación y rutas protegidas
- **Lucide React**: Iconografía consistente
- **Tailwind CSS**: Styling y responsive design
- **TypeScript**: Type safety completo

### 🌐 **Servicios**
- **authService**: CRUD de usuarios y autenticación
- **useAuth hook**: Manejo de estado de autenticación
- **Local Storage**: Persistencia de configuraciones UI

### 🎛️ **Configuración API**
```typescript
// authService endpoints usados:
- GET /users - Lista paginada
- GET /users/:id - Usuario específico  
- POST /users - Crear usuario
- PUT /users/:id - Actualizar usuario
```

## 🚀 Uso Rápido

### 1. **Acceso como Admin**
```bash
# Login con usuario ADMIN
Email: admin@example.com
Password: admin123
```

### 2. **Navegar a Gestión**
- Click en "Usuarios" en el sidebar
- O navegar directamente a `/admin/users`

### 3. **Crear Usuario**
- Click en "Nuevo Usuario"
- Llenar formulario completo
- Seleccionar rol apropiado
- Click en "Crear Usuario"

### 4. **Editar Usuario**
- Click en "Editar" en la fila del usuario
- Modificar campos necesarios
- Click en "Actualizar Usuario"

## 💡 Notas de Implementación

- **Reutilización**: Usa componentes existentes (Button, Input, LoadingSpinner)
- **Consistencia**: Sigue el mismo patrón de diseño del resto de la app
- **Performance**: Paginación para manejar grandes cantidades de usuarios
- **Seguridad**: Doble validación (frontend + backend)
- **UX**: Feedback inmediato y mensajes de error claros 