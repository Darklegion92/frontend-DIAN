import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { UserRole } from '../services/authService';

interface PermissionConfig {
  companies: UserRole[];
  users: UserRole[];
  documents: UserRole[];
  profile: UserRole[];
}

// Configuración de permisos por módulo
const PERMISSIONS: PermissionConfig = {
  companies: [UserRole.ADMIN, UserRole.DEALER],
  users: [UserRole.ADMIN],
  documents: [UserRole.ADMIN, UserRole.DEALER],
  profile: [UserRole.ADMIN, UserRole.DEALER, UserRole.USER],
};

export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const permissions = useMemo(() => {
    if (!isAuthenticated || !user?.role) {
      return {
        canAccessCompanies: false,
        canAccessUsers: false,
        canAccessDocuments: false,
        canAccessProfile: false,
        isAdmin: false,
        isDealer: false,
        isUser: false,
      };
    }

    const userRole = user.role;

    return {
      // Permisos específicos por módulo
      canAccessCompanies: PERMISSIONS.companies.includes(userRole),
      canAccessUsers: PERMISSIONS.users.includes(userRole),
      canAccessDocuments: PERMISSIONS.documents.includes(userRole),
      canAccessProfile: PERMISSIONS.profile.includes(userRole),
      
      // Verificadores de rol
      isAdmin: userRole === UserRole.ADMIN,
      isDealer: userRole === UserRole.DEALER,
      isUser: userRole === UserRole.USER,
      
      // Función helper para verificar roles personalizados
      hasRole: (requiredRoles: UserRole[]) => requiredRoles.includes(userRole),
      
      // Función helper para verificar acceso a cualquier módulo
      hasAccessTo: (module: keyof PermissionConfig) => PERMISSIONS[module].includes(userRole),
    };
  }, [user, isAuthenticated]);

  return permissions;
};

export default usePermissions; 