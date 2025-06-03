import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { User, UserRole, CreateUserData, UpdateUserData } from '../services/authService';
import Button from './Button';
import Input from './Input';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: CreateUserData | UpdateUserData) => Promise<void>;
  user?: User | null;
  title: string;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
  title
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
    role: UserRole.USER
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Modo edición - cargar datos del usuario
      setFormData({
        username: user.username,
        email: user.email,
        name: user.name,
        password: '', // No mostramos la contraseña actual
        role: user.role
      });
    } else {
      // Modo creación - reset del formulario
      setFormData({
        username: '',
        email: '',
        name: '',
        password: '',
        role: UserRole.USER
      });
    }
    setError(null);
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!formData.name.trim()) {
        throw new Error('El nombre es requerido');
      }
      if (!formData.email.trim()) {
        throw new Error('El email es requerido');
      }
      if (!formData.username.trim()) {
        throw new Error('El nombre de usuario es requerido');
      }
      
      if (!user && !formData.password.trim()) {
        throw new Error('La contraseña es requerida para nuevos usuarios');
      }

      // Preparar datos para envío
      const userData: CreateUserData | UpdateUserData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        name: formData.name.trim(),
        role: formData.role
      };

      // Solo incluir contraseña si se proporcionó
      if (formData.password.trim()) {
        (userData as CreateUserData).password = formData.password;
      }

      await onSubmit(userData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | UserRole) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error cuando el usuario modifica el formulario
    if (error) setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soltec-primary"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nombre completo"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ingresa el nombre completo"
                required
              />

              <Input
                label="Nombre de usuario"
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="Ingresa el nombre de usuario"
                required
              />

              <Input
                label="Correo electrónico"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Ingresa el correo electrónico"
                required
              />

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña {!user && '*'}
                  {user && (
                    <span className="text-gray-500 text-xs ml-1">
                      (Dejar vacío para mantener la actual)
                    </span>
                  )}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder={user ? 'Nueva contraseña (opcional)' : 'Ingresa la contraseña'}
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl transition-all duration-200 bg-white/90 backdrop-blur-sm focus:outline-none focus:border-soltec-primary focus:ring-2 focus:ring-soltec-primary/20"
                    required={!user}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Rol *
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value as UserRole)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  required
                >
                  <option value={UserRole.USER}>Usuario</option>
                  <option value={UserRole.DEALER}>Distribuidor</option>
                  <option value={UserRole.ADMIN}>Administrador</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.role === UserRole.ADMIN && 'Acceso completo al sistema'}
                  {formData.role === UserRole.DEALER && 'Acceso para distribuidores'}
                  {formData.role === UserRole.USER && 'Acceso básico de usuario'}
                </p>
              </div>

              {/* Botones */}
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full justify-center sm:col-start-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {user ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    user ? 'Actualizar Usuario' : 'Crear Usuario'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="mt-3 w-full justify-center sm:mt-0 sm:col-start-1"
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal; 