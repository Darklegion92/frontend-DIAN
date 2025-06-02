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

// Interfaces
export interface CatalogOption {
  id: number;
  name: string;
  code: string;
}

export interface MunicipalityOption extends CatalogOption {
  displayName: string;
  department: {
    id: number;
    name: string;
    code: string;
  } | null;
}

class CatalogService {
  /**
   * Obtener tipos de documento de identificación
   */
  async getDocumentTypes(): Promise<CatalogOption[]> {
    try {
      const response = await apiClient.get('/catalogs/document-types');
      
      // Verificar si la respuesta viene envuelta
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Si viene en formato directo
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Si no es array, devolver array vacío
      return [];
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener los tipos de documento. Verifique su conexión a internet.');
    }
  }

  /**
   * Obtener tipos de organización
   */
  async getOrganizationTypes(): Promise<CatalogOption[]> {
    try {
      const response = await apiClient.get('/catalogs/organization-types');
      
      // Verificar si la respuesta viene envuelta
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Si viene en formato directo
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Si no es array, devolver array vacío
      return [];
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener los tipos de organización. Verifique su conexión a internet.');
    }
  }

  /**
   * Obtener tipos de régimen tributario
   */
  async getRegimeTypes(): Promise<CatalogOption[]> {
    try {
      const response = await apiClient.get('/catalogs/regime-types');
      
      // Verificar si la respuesta viene envuelta
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Si viene en formato directo
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Si no es array, devolver array vacío
      return [];
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener los tipos de régimen. Verifique su conexión a internet.');
    }
  }

  /**
   * Obtener tipos de responsabilidad tributaria
   */
  async getLiabilityTypes(): Promise<CatalogOption[]> {
    try {
      const response = await apiClient.get('/catalogs/liability-types');
      
      // Verificar si la respuesta viene envuelta
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Si viene en formato directo
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Si no es array, devolver array vacío
      return [];
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener los tipos de responsabilidad. Verifique su conexión a internet.');
    }
  }

  /**
   * Buscar municipios
   */
  async searchMunicipalities(search?: string, limit: number = 20): Promise<MunicipalityOption[]> {
    try {
      const params: any = {};
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (limit) {
        params.limit = limit;
      }

      const response = await apiClient.get('/catalogs/municipalities', { params });
      
      // Verificar si la respuesta viene envuelta
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Si viene en formato directo
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Si no es array, devolver array vacío
      return [];
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al buscar municipios. Verifique su conexión a internet.');
    }
  }

  /**
   * Obtener un municipio específico por ID
   */
  async getMunicipalityById(id: number): Promise<MunicipalityOption | null> {
    try {
      const response = await apiClient.get(`/catalogs/municipalities/${id}`);
      
      // Verificar si la respuesta viene envuelta
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      // Si viene en formato directo
      return response.data;
    } catch (error: any) {
      // Si no se encuentra el municipio, retornar null
      if (error.response?.status === 404) {
        return null;
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener el municipio. Verifique su conexión a internet.');
    }
  }
}

// Exportar instancia única del servicio
export const catalogService = new CatalogService();
export default catalogService; 