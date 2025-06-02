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
export interface CertificateUploadData {
  certificate: string; // Base64
  password: string;
  bearerToken: string;
}

export interface CertificateData {
  id: number;
  name: string;
  password: string;
  expiration_date: string;
  updated_at: string;
  created_at: string;
}

export interface CertificateResponse {
  success: boolean;
  message: string;
  certificado: CertificateData;
}

class CertificateService {
  /**
   * Subir un certificado para una empresa
   */
  async uploadCertificate(certificateData: CertificateUploadData): Promise<CertificateResponse> {
    try {
      const response = await apiClient.put('/certificate', certificateData);
      
      // El backend devuelve directamente la respuesta del servicio externo
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al cargar el certificado. Verifique su conexión a internet.');
    }
  }

  /**
   * Obtener información del certificado de una empresa
   */
  async getCertificateByCompany(companyId: number): Promise<CertificateResponse | null> {
    try {
      const response = await apiClient.get(`/certificate/company/${companyId}`);
      
      // La respuesta puede venir envuelta: { success, data: certificate }
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      // Si viene en formato directo
      return response.data;
    } catch (error: any) {
      // Si no se encuentra el certificado, retornar null
      if (error.response?.status === 404) {
        return null;
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener el certificado. Verifique su conexión a internet.');
    }
  }
}

// Exportar instancia única del servicio
export const certificateService = new CertificateService();
export default certificateService; 