import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
import Input from './Input';
import Logo from './Logo';

// Schema de validación con Zod
const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'El nombre de usuario es requerido')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const watchedFields = watch();

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data);
      setShowSuccessMessage(true);
      
      // Redirigir después de mostrar mensaje de éxito
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soltec-50 via-white to-soltec-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-soltec-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-8 -right-8 w-96 h-96 bg-soltec-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-soltec-accent/10 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card principal */}
        <div className="card p-8 space-y-8 animate-slide-up">
          {/* Header con logo */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Logo size="lg" variant="full" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenido
              </h1>
              <p className="text-gray-600">
                Ingrese sus credenciales para acceder al sistema APIDIAN
              </p>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {showSuccessMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 text-sm">
                  ¡Inicio de sesión exitoso! Redirigiendo...
                </p>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Campo de usuario */}
              <div>
                <Input
                  {...register('username')}
                  type="text"
                  label="Nombre de usuario"
                  placeholder="Ingrese su nombre de usuario"
                  error={errors.username?.message}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Campo de contraseña */}
              <div>
                <Input
                  {...register('password')}
                  type="password"
                  label="Contraseña"
                  placeholder="Ingrese su contraseña"
                  error={errors.password?.message}
                  required
                  disabled={isLoading}
                  showPasswordToggle
                />
              </div>
            </div>

            {/* Opciones adicionales */}
            <div className="flex items-center justify-start text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-soltec-primary border-gray-300 rounded focus:ring-soltec-primary focus:ring-2"
                />
                <span className="text-gray-600">Recordarme</span>
              </label>
            </div>

            {/* Botón de submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={!isValid || isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              ¿Necesita ayuda?{' '}
              <button 
                className="text-soltec-primary hover:text-soltec-600 hover:underline transition-colors"
                onClick={() => window.open('https://wa.me/573123943160?text=Hola,%20necesito%20ayuda%20con%20el%20sistema%20APIDIAN', '_blank')}
              >
                Contacte soporte técnico
              </button>
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2025 SolTec - Tecnología y Desarrollo. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Indicadores de características */}
      <div className="absolute bottom-8 left-8 hidden lg:block">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-soltec-primary rounded-full"></div>
            <span>Seguridad avanzada</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-soltec-secondary rounded-full"></div>
            <span>Acceso 24/7</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-600">
            <div className="w-2 h-2 bg-soltec-accent rounded-full"></div>
            <span>Soporte técnico</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 