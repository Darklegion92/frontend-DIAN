import React, { useState, useEffect } from 'react';
import { X, FileText, Save, AlertCircle } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';
import { resolutionService, CreateResolutionData } from '../services/resolutionService';
import { typeDocumentService, TypeDocumentOption } from '../services/typeDocumentService';
import { Resolution } from '../types/resolution';

interface ResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  companyName: string;
  bearerToken: string;
  onSuccess?: () => void;
  initialData?: Resolution | null; // Para edición
}

const ResolutionModal: React.FC<ResolutionModalProps> = ({
  isOpen,
  onClose,
  companyId,
  companyName,
  bearerToken,
  onSuccess,
  initialData
}) => {
  const [formData, setFormData] = useState<Omit<CreateResolutionData, 'company_id' | 'bearerToken'>>({
    type_document_id: 1,
    prefix: '',
    resolution: '1',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeDocuments, setTypeDocuments] = useState<TypeDocumentOption[]>([]);
  const [loadingTypeDocuments, setLoadingTypeDocuments] = useState(true);

  // Cargar tipos de documentos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadTypeDocuments();
    }
  }, [isOpen]);

  const loadTypeDocuments = async () => {
    try {
      setLoadingTypeDocuments(true);
      const types = await typeDocumentService.getActiveTypeDocuments();
      setTypeDocuments(types);
      
      // Si hay tipos disponibles y no hay datos iniciales, usar el primer tipo como default
      if (types.length > 0 && !initialData) {
        setFormData(prev => ({
          ...prev,
          type_document_id: types[0].id
        }));
      }
    } catch (err: any) {
      console.error('Error loading type documents:', err);
      setError('Error al cargar los tipos de documentos');
    } finally {
      setLoadingTypeDocuments(false);
    }
  };

  // Cargar datos iniciales para edición
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Modo edición - cargar datos existentes
        setFormData({
          type_document_id: initialData.typeDocumentId,
          prefix: initialData.prefix || '',
          resolution: initialData.resolution || '1',
        });
      } else {

        setFormData({
          type_document_id: 1,
          prefix: '',
          resolution: '1',
        });
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.type_document_id || formData.type_document_id <= 0) return 'Seleccione un tipo de documento válido';
    if (!formData.prefix.trim()) return 'El prefijo es requerido';
    if (!formData.resolution.trim()) return 'El número de resolución es requerido';  
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dataToSend: CreateResolutionData = {
        ...formData,
        company_id: companyId,
        bearerToken
      };

      await resolutionService.createResolution(dataToSend);
      
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la resolución');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-soltec-primary" />
              <h3 className="text-lg font-medium text-gray-900">
                {isEditMode ? 'Actualizar Resolución' : 'Nueva Resolución'}
              </h3>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información de empresa */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Empresa:</p>
                <p className="font-medium text-gray-900 truncate">{companyName}</p>
                <p className="text-xs text-gray-500">ID: {companyId}</p>
              </div>

              {/* Formulario en grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo de documento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Documento *
                  </label>
                  <select
                    value={formData.type_document_id}
                    onChange={(e) => handleInputChange('type_document_id', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                    disabled={loading || loadingTypeDocuments}
                    required
                  >
                    {loadingTypeDocuments ? (
                      <option value="">Cargando tipos de documentos...</option>
                    ) : typeDocuments.length === 0 ? (
                      <option value="">No hay tipos de documentos disponibles</option>
                    ) : (
                      typeDocuments.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* Prefijo */}
                <div>
                  <Input
                    label="Prefijo"
                    type="text"
                    value={formData.prefix}
                    onChange={(e) => handleInputChange('prefix', e.target.value)}
                    placeholder="Ej: SETP"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Número de resolución */}
                <div>
                  <Input
                    label="Número de Resolución"
                    type="text"
                    value={formData.resolution}
                    onChange={(e) => handleInputChange('resolution', e.target.value)}
                    placeholder="Ej: 18760000001"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading || loadingTypeDocuments || typeDocuments.length === 0}
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Guardando...</span>
                    </>
                  ) : loadingTypeDocuments ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">Cargando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditMode ? 'Actualizar' : 'Crear'} Resolución
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolutionModal; 