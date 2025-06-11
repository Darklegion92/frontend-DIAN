import { useAuth } from './useAuth';
import { UserRole } from '../services/authService';

export const usePermissions = () => {
  const { user } = useAuth();

  return {
    canAccessCompanies: user?.role === UserRole.ADMIN || user?.role === UserRole.DEALER,
    canAccessUsers: user?.role === UserRole.ADMIN,
    canAccessDocuments: true, // Todos los roles pueden ver Documentos/Radianes
    canAccessProfile: true, // Todos los usuarios pueden acceder a su perfil
  };
}; 