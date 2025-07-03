import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Download, 
  Trash2, 
  Settings, 
  FileCode, 
  Calendar,
  Upload,
  Star,
  StarOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { AppVersion, systemService } from '../services/systemService';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import UploadVersionModal from './UploadVersionModal';

const VersionManagement: React.FC = () => {
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<AppVersion | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await systemService.getAllVersions();
      setVersions(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    loadVersions();
  };

  const handleSetLatest = async (version: string) => {
    try {
      setActionLoading({ ...actionLoading, [version]: true });
      await systemService.setLatestVersion(version);
      await loadVersions();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setActionLoading({ ...actionLoading, [version]: false });
    }
  };

  const handleDelete = async (id: number, version: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la versión ${version}?`)) {
      return;
    }

    try {
      setActionLoading({ ...actionLoading, [`delete-${id}`]: true });
      await systemService.deleteVersion(id);
      await loadVersions();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setActionLoading({ ...actionLoading, [`delete-${id}`]: false });
    }
  };

  const handleDownload = async (version: string) => {
    try {
      setActionLoading({ ...actionLoading, [`download-${version}`]: true });
      await systemService.downloadVersion(version);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setActionLoading({ ...actionLoading, [`download-${version}`]: false });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (version: AppVersion) => {
    if (version.isLatest) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Star className="h-3 w-3 mr-1" />
          Actual
        </span>
      );
    }
    
    if (version.forceUpdate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Crítica
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Disponible
      </span>
    );
  };

  if (loading && versions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" color="primary" />
          <p className="mt-4 text-gray-600">Cargando versiones del sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="h-8 w-8 text-soltec-primary mr-3" />
              Gestión de Versiones del Sistema
            </h1>
            <p className="text-gray-600 mt-1">
              Administra las versiones de la aplicación y archivos .exe
            </p>
          </div>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Subir Nueva Versión</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Versions List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {versions.length === 0 ? (
          <div className="text-center py-12">
            <FileCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay versiones registradas
            </h3>
            <p className="text-gray-600 mb-4">
              Comienza subiendo la primera versión de la aplicación
            </p>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              Subir Primera Versión
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Versión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Lanzamiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {versions.map((version) => (
                  <tr key={version.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileCode className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            v{version.version}
                          </div>
                          <div className="text-sm text-gray-500">
                            {version.originalFileName || version.fileName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(version)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {formatDate(version.releaseDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {systemService.formatFileSize(version.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {version.description || 'Sin descripción'}
                      </div>
                      {version.changeLog.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {version.changeLog.length} cambio{version.changeLog.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {!version.isLatest && (
                          <button
                            onClick={() => handleSetLatest(version.version)}
                            disabled={actionLoading[version.version]}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                            title="Marcar como versión actual"
                          >
                            {actionLoading[version.version] ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDownload(version.version)}
                          disabled={actionLoading[`download-${version.version}`]}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Descargar archivo"
                        >
                          {actionLoading[`download-${version.version}`] ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDelete(version.id, version.version)}
                          disabled={actionLoading[`delete-${version.id}`]}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Eliminar versión"
                        >
                          {actionLoading[`delete-${version.id}`] ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <UploadVersionModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default VersionManagement; 