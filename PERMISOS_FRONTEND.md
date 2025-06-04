# Sistema de Permisos - Frontend

Este documento describe el sistema de control de acceso basado en roles implementado en el frontend de la aplicación.

## Configuración de Permisos por Módulo

### Empresas
- **Roles permitidos:** ADMIN, DEALER
- **Rutas protegidas:**
  - `/companies` - Lista de empresas
  - `/companies/create` - Crear nueva empresa
  - `/companies/:id` - Editar empresa
  - `/companies/:companyId/resolutions` - Resoluciones de empresa

### Usuarios
- **Roles permitidos:** ADMIN (únicamente)
- **Rutas protegidas:**
  - `/admin/users` - Gestión de usuarios

### Documentos
- **Roles permitidos:** ADMIN, DEALER
- **Rutas protegidas:**
  - `/documents` - Lista de documentos electrónicos

### Perfil
- **Roles permitidos:** ADMIN, DEALER, USER (todos)
- **Rutas protegidas:**
  - `/profile` - Perfil del usuario

## Componentes Implementados

### 1. usePermissions Hook
Ubicación: `src/hooks/usePermissions.tsx`

Hook personalizado que proporciona verificación de permisos basada en el rol del usuario:

```typescript
const permissions = usePermissions();

// Verificaciones disponibles
permissions.canAccessCompanies  // boolean
permissions.canAccessUsers     // boolean  
permissions.canAccessDocuments // boolean
permissions.canAccessProfile   // boolean

// Verificadores de rol
permissions.isAdmin   // boolean
permissions.isDealer  // boolean
permissions.isUser    // boolean

// Funciones helper
permissions.hasRole([UserRole.ADMIN, UserRole.DEALER])
permissions.hasAccessTo('companies')
```

### 2. RoleBasedRoute Component
Ubicación: `src/components/RoleBasedRoute.tsx`

Componente que protege rutas basado en roles permitidos:

```typescript
<RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.DEALER]}>
  <ComponenteProtegido />
</RoleBasedRoute>
```

**Comportamiento:**
- Si el usuario no está autenticado → redirije a `/login`
- Si el usuario no tiene permisos → redirije a `/profile`
- Si el usuario tiene permisos → renderiza el componente hijo

### 3. AccessDenied Component
Ubicación: `src/components/AccessDenied.tsx`

Componente para mostrar mensajes de acceso denegado (actualmente no utilizado, mantenido para casos especiales):

```typescript
<AccessDenied 
  requiredRoles={[UserRole.ADMIN]}
  message="Mensaje personalizado"
  showBackButton={true}
  showHomeButton={true}
/>
```

### 4. Sidebar Actualizado
Ubicación: `src/components/Sidebar.tsx`

El sidebar ahora usa el hook `usePermissions` para mostrar solo las opciones de navegación que el usuario puede acceder:

- **ADMIN**: Ve todas las opciones (Empresas, Usuarios, Documentos, Perfil)
- **DEALER**: Ve Empresas, Documentos y Perfil
- **USER**: Ve solo Perfil

## Estructura de Rutas

### Ruta Raíz
- `/` → Redirije a `/profile` (accesible para todos)

### Rutas de Autenticación
- `/login` → Solo accesible sin autenticación

### Rutas Protegidas
Todas las rutas están protegidas por:
1. `ProtectedRoute` - Verificación de autenticación
2. `RoleBasedRoute` - Verificación de permisos por rol

## Roles y Jerarquía

```
ADMIN (Administrador)
├── Acceso completo a todas las funcionalidades
├── Puede gestionar usuarios
├── Puede gestionar empresas
├── Puede gestionar documentos
└── Puede acceder a su perfil

DEALER (Distribuidor)  
├── Puede gestionar empresas (limitado a las asignadas)
├── Puede gestionar documentos
├── Puede acceder a su perfil
└── NO puede gestionar usuarios

USER (Usuario)
├── Puede acceder a su perfil
├── NO puede gestionar empresas
├── NO puede gestionar documentos  
└── NO puede gestionar usuarios
```

## Flujo de Redirección

1. **Usuario no autenticado:**
   - Cualquier ruta → `/login`

2. **Usuario autenticado sin permisos:**
   - Cualquier ruta restringida → `/profile`

3. **Login exitoso:**
   - `/login` → `/profile`

4. **Ruta raíz:**
   - `/` → `/profile`

## Implementación en App.tsx

```typescript
// Ejemplo de ruta protegida
<Route 
  path="/companies" 
  element={
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={[UserRole.ADMIN, UserRole.DEALER]}>
        <Layout>
          <CompanyList />
        </Layout>
      </RoleBasedRoute>
    </ProtectedRoute>
  } 
/>
```

## Ventajas del Sistema

1. **Seguridad**: Control granular de acceso por rol
2. **UX Mejorada**: Redirección automática en lugar de mensajes de error
3. **Mantenibilidad**: Configuración centralizada de permisos
4. **Escalabilidad**: Fácil agregar nuevos roles o permisos
5. **Consistencia**: Navegación adaptada al rol del usuario

## Consideraciones de Seguridad

- ⚠️ **Importante**: Este sistema de permisos es solo para UX del frontend
- ✅ **Backend**: Todas las validaciones críticas deben estar en el backend
- ✅ **API**: Cada endpoint debe validar permisos en el servidor
- ✅ **Tokens**: El JWT debe incluir información de roles actualizada

## Casos de Uso Comunes

### Verificar permisos antes de mostrar un botón
```typescript
const permissions = usePermissions();

return (
  <div>
    {permissions.canAccessUsers && (
      <button onClick={openUserModal}>Gestionar Usuarios</button>
    )}
  </div>
);
```

### Redirección condicional
```typescript
const permissions = usePermissions();

useEffect(() => {
  if (!permissions.canAccessCompanies) {
    navigate('/profile');
  }
}, [permissions, navigate]);
```

### Navegación programática
```typescript
const permissions = usePermissions();

const handleNavigation = () => {
  if (permissions.canAccessCompanies) {
    navigate('/companies');
  } else {
    navigate('/profile');
  }
};
``` 