import React, { useState } from 'react';
import { X, ArrowUpCircle, FileText, Users, AlertCircle } from 'lucide-react';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { Company } from '../types/company';
import { companyService } from '../services/companyService';

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onSuccess: (updatedCompany: Company) => void;
}

interface EnvironmentOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  field: 'type_environment_id' | 'payroll_type_environment_id';
  currentValue: number;
}

const ProductionModal: React.FC<ProductionModalProps> = ({ 
  isOpen, 
  onClose, 
  company, 
  onSuccess 
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !company) return null;

  // Verificar que la empresa tenga token
  const hasToken = !!company.tokenDian;

  // Opciones de ambiente disponibles
  const environmentOptions: EnvironmentOption[] = [
    {
      id: 'facturacion',
      label: 'Facturación Electrónica',
      description: 'Pasar la facturación electrónica a ambiente de producción',
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      field: 'type_environment_id',
      currentValue: company.typeEnvironmentId
    },
    {
      id: 'nomina',
      label: 'Nómina Electrónica',
      description: 'Pasar la nómina electrónica a ambiente de producción',
      icon: <Users className="h-5 w-5 text-green-500" />,
      field: 'payroll_type_environment_id',
      currentValue: company.payrollTypeEnvironmentId || 2
    }
  ];

  // Filtrar opciones que no están ya en producción (valor = 1)
  const availableOptions = environmentOptions.filter(option => option.currentValue !== 1);

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedOptions.length === 0) {
      setError('Debe seleccionar al menos una opción');
      return;
    }

    if (!hasToken) {
      setError('La empresa no tiene un token configurado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Construir datos de actualización usando el token de la empresa
      const updateData: any = {
        token: company.tokenDian!, // Usar el token de la empresa
        eqdocs_type_environment_id: 2 // Siempre enviamos este valor fijo
      };

      // Agregar los campos seleccionados
      selectedOptions.forEach(optionId => {
        const option = environmentOptions.find(opt => opt.id === optionId);
        if (option) {
          updateData[option.field] = 1; // 1 = Producción
        }
      });

      // Llamar al servicio
      const response = await companyService.updateEnvironment(updateData);
      
      // Notificar éxito
      onSuccess(response.company);
      
      // Cerrar modal
      handleClose();
      
    } catch (error: any) {
      setError(error.message || 'Error al actualizar el ambiente');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedOptions([]);
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <ArrowUpCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Pasar a Producción
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
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">¡Atención!</p>
                <p>Esta acción pasará los servicios seleccionados a ambiente de producción. Asegúrese de que la empresa esté lista para facturar en el ambiente real de la DIAN.</p>
              </div>
            </div>
          </div>

          {/* Opciones de ambiente */}
          {availableOptions.length > 0 ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Seleccione los servicios a pasar a producción:
                </label>
                <div className="space-y-3">
                  {availableOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedOptions.includes(option.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleOptionToggle(option.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedOptions.includes(option.id)}
                          onChange={() => handleOptionToggle(option.id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {option.icon}
                            <span className="font-medium text-gray-900">
                              {option.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {option.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Estado actual: {option.currentValue === 2 ? 'Habilitación' : 'Producción'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información del token */}
              <div className={`border rounded-lg p-4 ${hasToken ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-start space-x-3">
                  <div className={`h-5 w-5 mt-0.5 flex-shrink-0 ${hasToken ? 'text-green-600' : 'text-red-600'}`}>
                    {hasToken ? (
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${hasToken ? 'text-green-900' : 'text-red-900'}`}>
                      {hasToken ? 'Token de empresa disponible' : 'Sin token configurado'}
                    </div>
                    <div className={`text-xs mt-1 ${hasToken ? 'text-green-700' : 'text-red-700'}`}>
                      {hasToken ? (
                        <>
                          Token: {company.tokenDian?.substring(0, 20)}...
                          <br />
                          Se usará este token para la autenticación con la DIAN
                        </>
                      ) : (
                        'Esta empresa necesita tener un token configurado antes de poder pasar a producción'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-green-100 rounded-lg p-6">
                <div className="flex items-center justify-center mb-3">
                  <ArrowUpCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  ¡Ya está en producción!
                </h3>
                <p className="text-sm text-green-700">
                  Todos los servicios de esta empresa ya están configurados en ambiente de producción.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          {availableOptions.length > 0 && (
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || selectedOptions.length === 0 || !hasToken}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Procesando...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Pasar a Producción
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProductionModal; 