import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Tipos de datos
export interface LoginData {
  username: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DEALER = 'DEALER',
  USER = 'USER',
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: number;
    identification_number: string;
    name: string;
  };
}

export interface CreateUserData {
  username: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    meta: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
      hasPreviousPage: boolean;
      hasNextPage: boolean;
    };
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

// Servicio de autenticación
class AuthService {
  /**
   * Realizar login
   */
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      console.log(response.data.data);
      if (response.data.success && response.data.data) {
        const { access_token } = response.data.data;
        
        // Guardar token y datos del usuario en localStorage
        localStorage.setItem('auth_token', access_token);
        
        return response.data;
      }
      
      throw new Error(response.data.message || 'Error en el login');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error de conexión. Verifique su conexión a internet.');
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar datos locales independientemente del resultado
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!(token);
  }
  /**
   * Obtener token de autorización
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Verificar estado de la sesión con el servidor
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get('/users/currentUser',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );
      return response.data.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Cambiar contraseña del usuario actual
   */
  async changePassword(passwordData: ChangePasswordData): Promise<void> {
    try {
      const response = await apiClient.put('/users/change-password', {
        oldPassword: passwordData.currentPassword,
        password: passwordData.newPassword
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al cambiar la contraseña');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al cambiar la contraseña');
    }
  }

  /**
   * Obtener lista paginada de usuarios (Solo ADMIN)
   */
  async getUsers(params: PaginationQuery = {}): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
    }
  }

  /**
   * Obtener usuario por ID (Solo ADMIN)
   */
  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuario');
    }
  }

  /**
   * Crear nuevo usuario (Solo ADMIN)
   */
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear usuario');
    }
  }

  /**
   * Actualizar usuario (Solo ADMIN)
   */
  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  }
}

// Exportar instancia única del servicio
export const authService = new AuthService();
export default authService; 