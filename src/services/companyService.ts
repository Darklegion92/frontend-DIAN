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

// Interfaces para los datos de actualización de ambiente
interface UpdateEnvironmentData {
  type_environment_id?: number;
  payroll_type_environment_id?: number;
  eqdocs_type_environment_id?: number;
  token: string;
}

interface UpdateEnvironmentResponse {
  message: string;
  company: Company;
}

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

  /**
   * Actualizar ambiente de una empresa (pasar a producción)
   */
  async updateEnvironment(updateData: UpdateEnvironmentData): Promise<UpdateEnvironmentResponse> {
    try {
      const response = await apiClient.put('/companies/environment', updateData);
      
      // La respuesta puede venir envuelta: { success, data: {...} }
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      // Si viene en formato directo
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al actualizar el ambiente de la empresa. Verifique su conexión a internet.');
    }
  }

  /**
   * Subir logo de la compañía
   */
  async uploadCompanyLogo(companyId: number, iconBase64: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`/companies/${companyId}/icon`, { iconBase64 });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al subir el logo de la empresa. Verifique su conexión a internet.');
    }
  }

  /**
   * Obtener logo de la compañía
   * Solo permite imágenes en formato JPG
   * @returns Blob de la imagen o null si no existe o no es JPG
   */
  async getCompanyLogo(companyId: number): Promise<Blob | null> {
    try {
      const response = await apiClient.get(`/companies/${companyId}/logo`, {
        responseType: 'blob',
      });
      
      // Verificar que el Content-Type sea image/jpeg
      const contentType = response.headers['content-type'] || response.headers['Content-Type'];
      
      if (!contentType || !contentType.includes('image/jpeg')) {
        // Si no es JPG, retornar null
        return null;
      }
      
      // Verificar que el blob sea una imagen válida
      const blob = response.data;
      if (!blob || blob.size === 0) {
        return null;
      }
      
      return blob;
    } catch (error: any) {
      // Si el error es 404 o similar, retornar null en lugar de lanzar error
      if (error.response?.status === 404 || error.response?.status === 400) {
        return null;
      }
      // Para otros errores, también retornar null
      return null;
    }
  }
}

// Exportar instancia única del servicio
export const companyService = new CompanyService();
export default companyService; 