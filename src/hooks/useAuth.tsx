import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { authService, User, LoginData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
         
            if (userData) {
              setUser(userData);
            } else {
              // Sesión inválida, limpiar datos
              await authService.logout();
            }
          
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        await authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 