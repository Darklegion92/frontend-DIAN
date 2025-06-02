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

export interface TypeDocumentOption {
  id: number;
  name: string;
}

export interface TypeDocumentResponse {
  success: boolean;
  statusCode: number;
  data: TypeDocumentOption[];
}

class TypeDocumentService {
  /**
   * Obtener tipos de documentos activos
   */
  async getActiveTypeDocuments(): Promise<TypeDocumentOption[]> {
    try {
      const response = await apiClient.get('/type-documents');
      
      // La respuesta viene envuelta en { success, statusCode, data: [...] }
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return [];
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener los tipos de documentos. Verifique su conexión a internet.');
    }
  }
}

// Exportar instancia única del servicio
export const typeDocumentService = new TypeDocumentService();
export default typeDocumentService; 