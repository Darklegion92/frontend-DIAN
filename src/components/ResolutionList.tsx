import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Calendar, Hash, Key, Building2, Plus, Edit } from 'lucide-react';
import { Resolution, PaginatedResolutionResponse } from '../types/resolution';
import { resolutionService } from '../services/resolutionService';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';
import ResolutionModal from './ResolutionModal';

const ResolutionList: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  });

  // Estado del modal de resoluciones
  const [resolutionModal, setResolutionModal] = useState<{
    isOpen: boolean;
    editingResolution: Resolution | null;
    bearerToken: string;
  }>({
    isOpen: false,
    editingResolution: null,
    bearerToken: ''
  });

  // Cargar resoluciones
  const loadResolutions = async (page?: number) => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response: PaginatedResolutionResponse = await resolutionService.getResolutionsByCompany({
        companyId: Number(companyId),
        page: page || pagination.currentPage,
        limit: 10
      });
      
      // Verificar que la respuesta tenga la estructura correcta
      if (response && response.data && Array.isArray(response.data) && response.meta) {
        setResolutions(response.data);
        setPagination({
          currentPage: response.meta.currentPage,
          itemsPerPage: response.meta.itemsPerPage,
          totalItems: response.meta.totalItems,
          totalPages: response.meta.totalPages,
          hasPreviousPage: response.meta.hasPreviousPage,
          hasNextPage: response.meta.hasNextPage
        });
      } else {
        setError('La respuesta del servidor no tiene el formato esperado');
        setResolutions([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las resoluciones');
      setResolutions([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar resoluciones al montar el componente
  useEffect(() => {
    loadResolutions();
  }, [companyId]);

  // Manejar cambio de página
  const handlePageChange = async (newPage: number) => {
    await loadResolutions(newPage);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Volver a la lista de empresas
  const handleBack = () => {
    navigate('/companies');
  };

  // Abrir modal para crear nueva resolución
  const handleCreateResolution = () => {
    // Obtener el bearer token (aquí deberías obtenerlo del contexto de auth o localStorage)
    const bearerToken = localStorage.getItem('auth_token') || '';
    
    setResolutionModal({
      isOpen: true,
      editingResolution: null,
      bearerToken
    });
  };

  // Abrir modal para editar resolución
  const handleEditResolution = (resolution: Resolution) => {
    // Obtener el bearer token
    const bearerToken = localStorage.getItem('auth_token') || '';
    
    setResolutionModal({
      isOpen: true,
      editingResolution: resolution,
      bearerToken
    });
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setResolutionModal({
      isOpen: false,
      editingResolution: null,
      bearerToken: ''
    });
  };

  // Manejar éxito del modal
  const handleModalSuccess = () => {
    // Recargar la lista de resoluciones
    loadResolutions();
  };

  // Mostrar loading
  if (loading && resolutions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <LoadingSpinner size="xl" color="primary" />
          <p className="mt-4 text-gray-600">Cargando resoluciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-soltec-primary" />
              <span>Resoluciones</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Resoluciones de la empresa ID: {companyId}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleCreateResolution}
          disabled={loading}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Resolución
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Lista de resoluciones */}
      <div className="bg-white rounded-lg shadow-sm">
        {!Array.isArray(resolutions) || resolutions.length === 0 && !loading ? (
          <div className="text-center py-12 px-4">
            <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No hay resoluciones</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Esta empresa no tiene resoluciones registradas
            </p>
          </div>
        ) : (
          <>
            {/* Tabla de resoluciones */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[768px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[120px]">
                      Tipo Documento
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[150px]">
                      Resolución
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[120px]">
                      Rango
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[160px]">
                      Vigencia
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[200px]">
                      Clave Técnica
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase min-w-[100px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.isArray(resolutions) && resolutions.map((resolution) => (
                    <tr key={resolution.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium text-sm sm:text-base text-gray-900">
                              {resolution.typeDocument.name}
                            </p>
                            {resolution.typeDocument.code && (
                              <p className="text-xs sm:text-sm text-gray-500">
                                Código: {resolution.typeDocument.code}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div>
                          <p className="font-medium text-sm sm:text-base text-gray-900">
                            {resolution.prefix ? `${resolution.prefix} - ` : ''}{resolution.resolution}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(resolution.resolutionDate)}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <Hash className="h-3 w-3 mr-1" />
                          <span>{resolution.from.toLocaleString()} - {resolution.to.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="text-xs sm:text-sm text-gray-600">
                          <p>Desde: {formatDate(resolution.dateFrom)}</p>
                          <p>Hasta: {formatDate(resolution.dateTo)}</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        {resolution.technicalKey ? (
                          <div className="flex items-start">
                            <Key className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-xs font-mono text-gray-600 break-all">
                              {resolution.technicalKey}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-400">Sin clave técnica</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditResolution(resolution)}
                            disabled={loading}
                            className="text-xs px-2 py-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Mostrando {((pagination.currentPage - 1) * 10) + 1} - {Math.min(pagination.currentPage * 10, pagination.totalItems)} de {pagination.totalItems} resoluciones
                  <span className="block sm:inline sm:ml-2 text-gray-400">({pagination.itemsPerPage} por página)</span>
                </div>
                <div className="flex justify-center sm:justify-end space-x-1 sm:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPreviousPage || loading}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className="text-xs px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Anterior</span>
                    <span className="sm:hidden">‹</span>
                  </Button>
                  
                  {/* Números de página */}
                  {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(
                      pagination.totalPages - 2,
                      pagination.currentPage - 1
                    )) + i;
                    
                    if (pageNum <= pagination.totalPages) {
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.currentPage ? "primary" : "outline"}
                          size="sm"
                          disabled={loading}
                          onClick={() => handlePageChange(pageNum)}
                          className="text-xs px-2 sm:px-3 min-w-[32px]"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                    return null;
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage || loading}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className="text-xs px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <span className="sm:hidden">›</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modal de Resoluciones */}
      <ResolutionModal
        isOpen={resolutionModal.isOpen}
        onClose={handleCloseModal}
        companyId={Number(companyId)}
        companyName={`Empresa ID: ${companyId}`}
        bearerToken={resolutionModal.bearerToken}
        onSuccess={handleModalSuccess}
        initialData={resolutionModal.editingResolution}
      />
    </div>
  );
};

export default ResolutionList; 