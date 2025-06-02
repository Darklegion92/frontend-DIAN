import axios from 'axios';
import { Company, PaginatedResponse, PaginationQuery } from '../types/company';

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

class CompanyService {
  /**
   * Obtener lista de companies con paginación
   */
  async getCompanies(params?: PaginationQuery): Promise<PaginatedResponse<Company>> {
    try {
      const response = await apiClient.get('/companies', { params });
      
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
      throw new Error('Error al obtener las empresas. Verifique su conexión a internet.');
    }
  }

  /**
   * Obtener una company específica por ID
   */
  async getCompanyById(id: number): Promise<Company> {
    try {
      const response = await apiClient.get(`/companies/${id}`);
      
      // La respuesta puede venir envuelta: { success, data: company }
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      // Si viene en formato directo
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener la empresa. Verifique su conexión a internet.');
    }
  }

  /**
   * Crear una nueva company
   */
  async createCompany(companyData: any): Promise<Company> {
    try {
      const response = await apiClient.post('/companies', companyData);
      
      // La respuesta puede venir envuelta: { success, data: company }
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      // Si viene en formato directo
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al crear la empresa. Verifique su conexión a internet.');
    }
  }
}

// Exportar instancia única del servicio
export const companyService = new CompanyService();
export default companyService; 