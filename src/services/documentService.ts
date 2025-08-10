import axios from 'axios';
import { Document, DocumentResponse, DocumentQuery, DocumentPaginationMeta } from '../types/document';

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

class DocumentService {
  /**
   * Obtener documentos con filtros y paginación
   */
  async getDocuments(params: DocumentQuery = {}): Promise<DocumentPaginationMeta> {
    try {
      // Filtrar parámetros vacíos
      const queryParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => 
          value !== undefined && value !== null && value !== ''
        )
      );

      const response = await apiClient.get('/documents', { params: queryParams });
      
      // La respuesta viene envuelta en { success, message, data: { current_page, documents: [...], ... } }
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      // Manejar caso donde la estructura sea directa (sin wrapper)
      if (response.data && Array.isArray(response.data.documents)) {
        return {
          current_page: 1,
          documents: response.data.documents,
          from: 1,
          last_page: 1,
          per_page: response.data.documents.length,
          to: response.data.documents.length,
          total: response.data.documents.length
        };
      }
      
      // Fallback con estructura vacía
      return {
        current_page: 1,
        documents: [],
        from: 0,
        last_page: 1,
        per_page: 10,
        to: 0,
        total: 0
      };
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener los documentos. Verifique su conexión a internet.');
    }
  }

  /**
   * Enviar documento por email
   */
  async sendEmail(number: string, prefix: string, correo: string): Promise<any> {
    try {
      const response = await apiClient.post('/documents/send-email', {
        number,
        prefix,
        correo
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al enviar el documento por email. Verifique su conexión a internet.');
    }
  }
}

// Exportar instancia única del servicio
export const documentService = new DocumentService();
export default documentService; 