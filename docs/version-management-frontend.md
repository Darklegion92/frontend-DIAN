# Frontend - Sistema de Gestión de Versiones

## Descripción General

Se ha implementado un sistema completo de gestión de versiones para el frontend que permite a los administradores subir, gestionar y distribuir archivos .exe de la aplicación.

## Funcionalidades Implementadas

### 🔐 Control de Acceso
- **Solo usuarios ADMIN** pueden acceder a la gestión de versiones
- Ruta protegida: `/admin/versions`
- Integrada con el sistema de autenticación JWT existente

### 📁 Gestión de Archivos
- **Subida de archivos .exe** con drag & drop
- **Validación automática** de archivos (extensión .exe, tamaño máximo 500MB)
- **Cálculo automático de checksum** para verificación de integridad
- **Descarga directa** de archivos desde el navegador

### 📋 Gestión de Versiones
- **Lista completa** de todas las versiones disponibles
- **Información detallada**: versión, fecha, tamaño, descripción, changelog
- **Estados visuales**: Actual, Crítica, Disponible
- **Marcar como versión actual** con un clic
- **Eliminación lógica** de versiones obsoletas

### 🎨 Interfaz de Usuario
- **Diseño consistente** con el resto de la aplicación
- **Iconos intuitivos** usando Lucide React
- **Tabla responsiva** con información organizada
- **Modal moderno** para subir nuevas versiones
- **Estados de carga** y manejo de errores

## Archivos Creados

### Servicios
- `frontend/src/services/systemService.ts` - Servicio para comunicación con la API

### Componentes
- `frontend/src/components/VersionManagement.tsx` - Componente principal
- `frontend/src/components/UploadVersionModal.tsx` - Modal para subir versiones

### Configuración
- Ruta agregada en `frontend/src/App.tsx`
- Enlace agregado en `frontend/src/components/Sidebar.tsx`

## Cómo Usar el Sistema

### Para Administradores:

1. **Acceder al Sistema**
   - Iniciar sesión con una cuenta ADMIN
   - Navegar a "Versiones" en el sidebar

2. **Subir Nueva Versión**
   - Hacer clic en "Subir Nueva Versión"
   - Arrastrar archivo .exe o seleccionar manualmente
   - Completar información:
     - Número de versión (ej: 1.0.1)
     - Fecha de lanzamiento
     - Descripción (opcional)
     - Lista de cambios
     - Marcar como versión actual (opcional)
     - Marcar como crítica (opcional)

3. **Gestionar Versiones Existentes**
   - Ver lista completa de versiones
   - Descargar archivos .exe
   - Marcar versión como actual
   - Eliminar versiones obsoletas

## Características Técnicas

### Validaciones
- Solo archivos .exe son aceptados
- Tamaño máximo: 500MB
- Validación de campos obligatorios
- Verificación de integridad con checksum

### Experiencia de Usuario
- **Drag & Drop**: Arrastrar archivos directamente
- **Auto-completado**: Extrae versión del nombre del archivo
- **Confirmaciones**: Diálogos antes de eliminar
- **Feedback visual**: Indicadores de carga y estado
- **Manejo de errores**: Mensajes claros y útiles

### Integración
- **JWT Authentication**: Protección de rutas
- **Role-based Access**: Solo ADMIN puede acceder
- **Responsive Design**: Funciona en desktop y móvil
- **Consistent Styling**: Usa los mismos colores y componentes

## API Endpoints Utilizados

### Principales:
- `GET /system/version` - Obtener versión actual
- `GET /system/versions` - Listar todas las versiones
- `POST /system/versions` - Subir nueva versión
- `PUT /system/versions/:version/latest` - Marcar como actual
- `DELETE /system/versions/:id` - Eliminar versión
- `GET /system/download/:version` - Descargar archivo

## Estructura de Datos

### Información de Versión:
```typescript
interface AppVersion {
  id: number;
  version: string;           // ej: "1.0.1"
  downloadUrl: string;       // URL de descarga
  changeLog: string[];       // Lista de cambios
  forceUpdate: boolean;      // Si es actualización crítica
  releaseDate: string;       // Fecha de lanzamiento
  fileSize: number;          // Tamaño en bytes
  checksum: string;          // Hash SHA-256
  fileName: string;          // Nombre del archivo
  isActive: boolean;         // Si está activa
  isLatest: boolean;         // Si es la más reciente
  description: string;       // Descripción opcional
  createdAt: string;         // Fecha de creación
  updatedAt: string;         // Fecha de actualización
}
```

## Estados Visuales

### Badges de Estado:
- 🟢 **Actual** - Versión marcada como la más reciente
- 🔴 **Crítica** - Actualización forzosa requerida
- 🔵 **Disponible** - Versión normal disponible

### Iconos de Acción:
- ⭐ **Marcar como actual** - Establecer como versión principal
- 📥 **Descargar** - Descargar archivo .exe
- 🗑️ **Eliminar** - Desactivar versión

## Seguridad

### Validaciones Frontend:
- Verificación de extensión de archivo
- Límite de tamaño de archivo
- Validación de campos requeridos
- Sanitización de inputs

### Autenticación:
- Token JWT requerido para todas las operaciones
- Verificación de rol ADMIN
- Manejo automático de sesiones expiradas

## Manejo de Errores

### Tipos de Error:
- **Archivo inválido**: Extensión incorrecta o tamaño excesivo
- **Campos requeridos**: Validación de formulario
- **Errores de red**: Problemas de conexión
- **Errores del servidor**: Respuestas de error de la API

### Experiencia de Usuario:
- Mensajes de error claros y específicos
- Indicadores visuales de estado
- Recuperación automática cuando es posible
- Feedback inmediato en todas las acciones

## Próximas Mejoras Sugeridas

1. **Histórico de Versiones**: Gráfico de línea de tiempo
2. **Notificaciones**: Alertas para nuevas versiones
3. **Estadísticas**: Métricas de descarga y uso
4. **Backup**: Respaldo automático de versiones
5. **Rollback**: Reversión rápida a versiones anteriores

## Soporte

Para cualquier problema o pregunta sobre el sistema de gestión de versiones, contactar al equipo de desarrollo o revisar la documentación de la API backend. 