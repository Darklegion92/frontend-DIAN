import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, UserCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../services/authService';
import Button from './Button';
import ChangePasswordModal from './ChangePasswordModal';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800 border-red-200';
      case UserRole.DEALER:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case UserRole.USER:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-soltec-primary/10 rounded-full flex items-center justify-center">
              <UserCircle className="h-8 w-8 text-soltec-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
            </div>
          </div>
        </div>

        {/* Información Personal */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 text-soltec-primary mr-2" />
            Información Personal
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{user.name}</p>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Usuario
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">@{user.username}</p>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol en el Sistema
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            </div>

            {/* Fecha de Registro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Registro
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Última Actualización */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Última Actualización
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Información de Empresa (si existe) */}
          {user.company && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-3">Información de Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Empresa
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900">{user.company.name}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Identificación
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-900">{user.company.identification_number}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Configuración de Seguridad */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lock className="h-5 w-5 text-soltec-primary mr-2" />
            Configuración de Seguridad
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Contraseña</h3>
                <p className="text-sm text-gray-600">Actualiza tu contraseña para mantener tu cuenta segura</p>
              </div>
              <Button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <Lock className="h-4 w-4" />
                <span>Cambiar Contraseña</span>
              </Button>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Lock className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-900">Recomendaciones de Seguridad</h3>
                  <ul className="mt-2 text-sm text-blue-800 list-disc list-inside space-y-1">
                    <li>Usa una contraseña de al menos 8 caracteres</li>
                    <li>Incluye letras mayúsculas, minúsculas, números y símbolos</li>
                    <li>No reutilices contraseñas de otras cuentas</li>
                    <li>Cambia tu contraseña regularmente</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para cambiar contraseña */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </>
  );
};

export default UserProfile; 