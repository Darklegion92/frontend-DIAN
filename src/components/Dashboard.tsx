import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, Settings, FileText, BarChart3 } from 'lucide-react';
import Button from './Button';
import Logo from './Logo';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo size="sm" variant="full" />
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button className="text-gray-600 hover:text-soltec-primary transition-colors">
                Dashboard
              </button>
              <button className="text-gray-600 hover:text-soltec-primary transition-colors">
                Documentos
              </button>
              <button className="text-gray-600 hover:text-soltec-primary transition-colors">
                Reportes
              </button>
              <button className="text-gray-600 hover:text-soltec-primary transition-colors">
                Configuración
              </button>
            </nav>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome section */}
          <div className="bg-gradient-to-r from-soltec-primary to-soltec-accent rounded-2xl p-8 mb-8 text-white">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold mb-2">
                ¡Bienvenido, {user?.name}!
              </h1>
              <p className="text-soltec-light text-lg mb-6">
                Gestione sus documentos electrónicos y consulte el estado de sus facturas de manera fácil y segura.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" size="md">
                  <FileText className="h-5 w-5 mr-2" />
                  Nuevo Documento
                </Button>
                <Button variant="outline" size="md" className="text-white border-white hover:bg-white/10">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Ver Reportes
                </Button>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-soltec-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Documentos Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-soltec-secondary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Mes</p>
                  <p className="text-2xl font-bold text-gray-900">1,423</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-soltec-accent" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Estado Sistema</p>
                  <p className="text-2xl font-bold text-green-600">Activo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actividad Reciente
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Factura #001-234 enviada exitosamente</p>
                    <p className="text-xs text-gray-500">Hace 5 minutos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Nuevo cliente registrado: ABC Corp</p>
                    <p className="text-xs text-gray-500">Hace 1 hora</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Certificado próximo a vencer</p>
                    <p className="text-xs text-gray-500">Hace 2 horas</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Accesos Rápidos
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <FileText className="h-5 w-5 text-soltec-primary" />
                  <span className="text-left">Crear Factura Electrónica</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <BarChart3 className="h-5 w-5 text-soltec-secondary" />
                  <span className="text-left">Consultar Estado DIAN</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Settings className="h-5 w-5 text-soltec-accent" />
                  <span className="text-left">Configurar Empresa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 