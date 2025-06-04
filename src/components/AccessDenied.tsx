import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../services/authService';

interface AccessDeniedProps {
  requiredRoles: UserRole[];
  message?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRoles,
  message = "No tienes permisos suficientes para acceder a esta sección.",
  showBackButton = true,
  showHomeButton = true,
}) => {
  const { user } = useAuth();

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrador';
      case UserRole.DEALER:
        return 'Distribuidor';
      case UserRole.USER:
        return 'Usuario';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Acceso Denegado
        </h2>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        <div className="space-y-3 text-sm text-gray-500 mb-6">
          <div className="bg-gray-50 p-3 rounded-md">
            <p><strong>Tu rol actual:</strong></p>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
              user?.role === UserRole.ADMIN ? 'bg-red-100 text-red-800' :
              user?.role === UserRole.DEALER ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user?.role ? getRoleDisplayName(user.role) : 'No definido'}
            </span>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p><strong>Roles permitidos:</strong></p>
            <div className="flex flex-wrap gap-1 mt-1">
              {requiredRoles.map((role) => (
                <span key={role} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getRoleDisplayName(role)}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {(showBackButton || showHomeButton) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showBackButton && (
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soltec-primary transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>
            )}
            
            {showHomeButton && (
              <button
                onClick={() => window.location.href = '/profile'}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-soltec-primary hover:bg-soltec-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soltec-primary transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Mi Perfil
              </button>
            )}
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Si crees que deberías tener acceso a esta sección, contacta a un administrador.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied; 