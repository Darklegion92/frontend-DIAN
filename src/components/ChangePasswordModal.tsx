import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { ChangePasswordData, authService } from '../services/authService';
import Button from './Button';
import Input from './Input';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose
}) => {
  const [formData, setFormData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones
      if (!formData.currentPassword.trim()) {
        throw new Error('La contraseña actual es requerida');
      }
      if (!formData.newPassword.trim()) {
        throw new Error('La nueva contraseña es requerida');
      }
      if (formData.newPassword.length < 8) {
        throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
      }
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error('Las contraseñas nuevas no coinciden');
      }
      if (formData.currentPassword === formData.newPassword) {
        throw new Error('La nueva contraseña debe ser diferente a la actual');
      }

      await authService.changePassword(formData);
      
      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ChangePasswordData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error cuando el usuario modifica el formulario
    if (error) setError(null);
  };

  const toggleShowPassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Lock className="h-5 w-5 text-soltec-primary mr-2" />
                Cambiar Contraseña
              </h3>
              <button
                onClick={handleClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soltec-primary"
                disabled={loading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">¡Contraseña actualizada!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Tu contraseña ha sido cambiada exitosamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

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

            {!success && (
              <>
                <p className="text-sm text-gray-600 mb-6">
                  Para cambiar tu contraseña, ingresa tu contraseña actual y la nueva contraseña que deseas usar.
                </p>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Contraseña Actual */}
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Contraseña actual *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => handleChange('currentPassword', e.target.value)}
                        placeholder="Ingresa tu contraseña actual"
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl transition-all duration-200 bg-white/90 backdrop-blur-sm focus:outline-none focus:border-soltec-primary focus:ring-2 focus:ring-soltec-primary/20"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => toggleShowPassword('current')}
                        disabled={loading}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Nueva Contraseña */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      Nueva contraseña *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => handleChange('newPassword', e.target.value)}
                        placeholder="Ingresa tu nueva contraseña"
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl transition-all duration-200 bg-white/90 backdrop-blur-sm focus:outline-none focus:border-soltec-primary focus:ring-2 focus:ring-soltec-primary/20"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => toggleShowPassword('new')}
                        disabled={loading}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Debe tener al menos 8 caracteres
                    </p>
                  </div>

                  {/* Confirmar Nueva Contraseña */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirmar nueva contraseña *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        placeholder="Confirma tu nueva contraseña"
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl transition-all duration-200 bg-white/90 backdrop-blur-sm focus:outline-none focus:border-soltec-primary focus:ring-2 focus:ring-soltec-primary/20"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => toggleShowPassword('confirm')}
                        disabled={loading}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">
                        Las contraseñas no coinciden
                      </p>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <Button
                      type="submit"
                      disabled={loading || formData.newPassword !== formData.confirmPassword}
                      className="w-full justify-center sm:col-start-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Cambiando...
                        </>
                      ) : (
                        'Cambiar Contraseña'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="mt-3 w-full justify-center sm:mt-0 sm:col-start-1"
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal; 