import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, LogOut, Menu, X, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';
import Button from './Button';

interface SidebarProps {
  className?: string;
  onToggle?: (isCollapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '', onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Recuperar estado guardado de localStorage
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Efecto para notificar al padre cuando cambia el estado
  useEffect(() => {
    if (onToggle) {
      onToggle(isCollapsed);
    }
  }, [isCollapsed, onToggle]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    
    // Guardar estado en localStorage
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsedState));
    
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  const menuItems = [
    {
      name: 'Empresas',
      path: '/companies',
      icon: Building2,
      description: 'Gestión de empresas'
    },
    {
      name: 'Documentos',
      path: '/documents',
      icon: FileText,
      description: 'Documentos electrónicos'
    }
  ];

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${className}`}>
      {/* Header con logo y botón toggle */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex-1">
            <Logo size="sm" variant="full" />
          </div>
        )}
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-soltec-primary/20"
          title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Información del usuario */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="text-sm">
            <p className="font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      )}

      {/* Logo colapsado con favicon */}
      {isCollapsed && (
        <div className="p-3 border-b border-gray-200 flex justify-center">
          <div className="w-8 h-8 flex items-center justify-center">
            <img 
              src="/favicon.ico" 
              alt="Logo" 
              className="w-6 h-6"
              onError={(e) => {
                // Fallback si no se puede cargar el favicon
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'space-x-3 px-4'} py-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-soltec-primary/20
                    ${isActive 
                      ? 'bg-soltec-primary text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  title={isCollapsed ? item.name : undefined}
                  aria-label={isCollapsed ? `${item.name} - ${item.description}` : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className={`text-xs truncate ${isActive ? 'text-soltec-light' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Botón de cerrar sesión */}
      <div className="p-4 border-t border-gray-200">
        {isCollapsed ? (
          <button
            onClick={handleLogout}
            className="w-full p-2 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700 focus:outline-none focus:ring-2 focus:ring-soltec-primary/20"
            title="Cerrar Sesión"
            aria-label="Cerrar Sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 