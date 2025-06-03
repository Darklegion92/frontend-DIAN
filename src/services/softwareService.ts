import axios from 'axios';
import { CreateSoftwareDto, SoftwareResponse } from '../types/software';

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

class SoftwareService {
  /**
   * Crear software para una empresa
   */
  async createSoftware(createSoftwareData: CreateSoftwareDto): Promise<SoftwareResponse> {
    try {
      const response = await apiClient.post('/software', createSoftwareData);
      
      // La respuesta puede venir envuelta: { success, data: {...} }
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      // Si viene en formato directo
      return response.data;
    } catch (error: any) {
      // Extraer mensaje de error específico
      let errorMessage = 'Error al crear el software. Verifique su conexión a internet.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }
}

// Exportar instancia única del servicio
export const softwareService = new SoftwareService();
export default softwareService; 