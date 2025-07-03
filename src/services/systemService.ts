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
export interface VersionInfo {
  currentVersion: string;
  downloadUrl: string;
  changeLog: string[];
  forceUpdate: boolean;
  releaseDate: string;
  fileSize: number;
  checksum: string;
  fileName?: string;
  originalFileName?: string;
}

export interface AppVersion {
  id: number;
  version: string;
  downloadUrl: string;
  changeLog: string[];
  forceUpdate: boolean;
  releaseDate: string;
  fileSize: number;
  checksum: string;
  fileName?: string;
  originalFileName?: string;
  filePath?: string;
  isActive: boolean;
  isLatest: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVersionData {
  version: string;
  changeLog: string[];
  forceUpdate?: boolean;
  releaseDate: string;
  description?: string;
  isLatest?: boolean;
  downloadUrl?: string;
}

export interface SystemResponse<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
}

// Servicio de gestión de versiones del sistema
class SystemService {
  /**
   * Obtener la versión actual de la aplicación
   */
  async getCurrentVersion(): Promise<VersionInfo> {
    try {
      const response = await apiClient.get('/system/version');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener la versión actual');
    }
  }

  /**
   * Obtener todas las versiones activas
   */
  async getAllVersions(): Promise<AppVersion[]> {
    try {
      const response = await apiClient.get('/system/versions');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al obtener las versiones');
    }
  }

  /**
   * Subir nueva versión con archivo .exe
   */
  async uploadVersion(versionData: CreateVersionData, file: File): Promise<AppVersion> {
    try {
      console.log('=== FRONTEND uploadVersion ===');
      console.log('Original versionData:', versionData);
      console.log('forceUpdate original:', versionData.forceUpdate, typeof versionData.forceUpdate);
      console.log('isLatest original:', versionData.isLatest, typeof versionData.isLatest);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('version', versionData.version);
      formData.append('changeLog', JSON.stringify(versionData.changeLog));
      
      const forceUpdateString = String(Boolean(versionData.forceUpdate));
      const isLatestString = String(Boolean(versionData.isLatest));
      
      console.log('forceUpdate after Boolean():', Boolean(versionData.forceUpdate));
      console.log('forceUpdate as string:', forceUpdateString);
      console.log('isLatest after Boolean():', Boolean(versionData.isLatest));
      console.log('isLatest as string:', isLatestString);
      
      formData.append('forceUpdate', forceUpdateString);
      formData.append('releaseDate', versionData.releaseDate);
      
      if (versionData.description) {
        formData.append('description', versionData.description);
      }
      
      formData.append('isLatest', isLatestString);

      const response = await apiClient.post('/system/versions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al subir la nueva versión');
    }
  }

  /**
   * Marcar una versión como la más reciente
   */
  async setLatestVersion(version: string): Promise<void> {
    try {
      await apiClient.put(`/system/versions/${version}/latest`);
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al establecer la versión como más reciente');
    }
  }

  /**
   * Eliminar una versión (eliminación lógica)
   */
  async deleteVersion(id: number): Promise<void> {
    try {
      await apiClient.delete(`/system/versions/${id}`);
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al eliminar la versión');
    }
  }

  /**
   * Descargar archivo de una versión específica
   */
  async downloadVersion(version: string): Promise<void> {
    try {
      const response = await apiClient.get(`/system/download/${version}`, {
        responseType: 'blob',
      });

      // Crear URL temporal para el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `app-${version}.exe`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error al descargar la versión');
    }
  }

  /**
   * Validar archivo .exe
   */
  validateExeFile(file: File): { isValid: boolean; error?: string } {
    // Verificar extensión
    if (!file.name.toLowerCase().endsWith('.exe')) {
      return {
        isValid: false,
        error: 'El archivo debe tener extensión .exe'
      };
    }

    // Verificar tamaño (máximo 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo no puede superar los 500MB'
      };
    }

    // Verificar que no esté vacío
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'El archivo no puede estar vacío'
      };
    }

    return { isValid: true };
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const systemService = new SystemService();
export default systemService; 