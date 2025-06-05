import axios from 'axios';
import { Resolution, PaginatedResolutionResponse, ResolutionQuery } from '../types/resolution';

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

// Interfaces
export interface CreateResolutionData {
  type_document_id: number;
  prefix: string;
  resolution: string;
  bearerToken: string;
  company_id: number;
}

export interface ResolutionCreateResponse {
  success: boolean;
  message: string;
  resolution: {
    id: number;
    type_document_id: number;
    resolution: string;
    prefix: string;
    resolution_date: string;
    technical_key: string;
    from: number;
    to: number;
    date_from: string;
    date_to: string;
    number: number;
    next_consecutive: string;
    created_at: string;
    updated_at: string;
  };
}

class ResolutionService {
  /**
   * Crear o actualizar una resolución
   */
  async createResolution(data: CreateResolutionData): Promise<ResolutionCreateResponse> {
    try {
      const response = await apiClient.put('/resolution', data);
      
      // La respuesta viene directamente del servicio externo
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al guardar la resolución. Verifique su conexión a internet.');
    }
  }

  /**
   * Obtener resoluciones por empresa con paginación
   */
  async getResolutionsByCompany(params: ResolutionQuery): Promise<PaginatedResolutionResponse> {
    try {
      const queryParams = {
        companyId: params.companyId,
        page: params.page || 1,
        limit: params.limit || 10
      };

      const response = await apiClient.get('/resolution/company', { params: queryParams });
      
      // La respuesta viene envuelta en { success, statusCode, data: { data: [...], meta: {...} } }
      if (response.data && response.data.data && response.data.data.data && response.data.data.meta) {
        return {
          data: response.data.data.data,
          meta: response.data.data.meta
        };
      }
      
      // Si por alguna razón viene en formato directo
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener las resoluciones. Verifique su conexión a internet.');
    }
  }
}

// Exportar instancia única del servicio
export const resolutionService = new ResolutionService();
export default resolutionService; 