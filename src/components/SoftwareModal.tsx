import React, { useState } from 'react';
import { X, Settings, AlertCircle, Info } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';
import { Company } from '../types/company';
import { SoftwareFormData } from '../types/software';
import { softwareService } from '../services/softwareService';

interface SoftwareModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onSuccess: (message: string) => void;
}

const SoftwareModal: React.FC<SoftwareModalProps> = ({ 
  isOpen, 
  onClose, 
  company, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState<SoftwareFormData>({
    softwareId: '',
    pin: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !company) return null;

  // Verificar que la empresa tenga token
  const hasToken = !!company.tokenDian;

  const handleInputChange = (field: keyof SoftwareFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.softwareId.trim()) {
      setError('El ID del software es requerido');
      return;
    }

    if (!formData.pin || formData.pin <= 0) {
      setError('El PIN debe ser un número válido mayor a 0');
      return;
    }

    if (!hasToken) {
      setError('La empresa no tiene un token configurado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Preparar datos para envío
      const createSoftwareData = {
        id: formData.softwareId.trim(),
        pin: formData.pin,
        token: company.tokenDian!
      };

      // Llamar al servicio
      const response = await softwareService.createSoftware(createSoftwareData);
      
      // Notificar éxito
      onSuccess(response.message || 'Software creado exitosamente');
      
      // Cerrar modal
      handleClose();
      
    } catch (error: any) {
      setError(error.message || 'Error al crear el software');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      softwareId: '',
      pin: 0
    });
    setError(null);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Crear Software
              </h2>
              <p className="text-sm text-gray-600">
                {company.identificationNumber}-{company.dv}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Información del Software</p>
                <p>
                  Registre el software de facturación electrónica para esta empresa. 
                  Los datos del ID y PIN son proporcionados por la DIAN al momento de registro.
                </p>
              </div>
            </div>
          </div>

          {/* Verificación de token */}
          {!hasToken && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">¡Atención!</p>
                  <p>Esta empresa no tiene un token configurado. Necesita tener un token válido para poder crear el software.</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulario */}
          <div className="space-y-4">
            <Input
              label="ID del Software"
              placeholder="f46f2b97-dfce-4b0d-a0cb-2ebd67c72e6d"
              value={formData.softwareId}
              onChange={(e) => handleInputChange('softwareId', e.target.value)}
              disabled={loading || !hasToken}
              required
              helperText="Identificador único del software proporcionado por la DIAN"
            />

            <Input
              label="PIN del Software"
              type="number"
              placeholder="25656"
              value={formData.pin.toString()}
              onChange={(e) => handleInputChange('pin', parseInt(e.target.value) || 0)}
              disabled={loading || !hasToken}
              required
              helperText="PIN numérico del software proporcionado por la DIAN"
            />
          </div>

          {/* Mostrar error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Error</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !hasToken}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Creando...</span>
                </div>
              ) : (
                'Crear Software'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SoftwareModal; 