import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';
import MunicipalitySearchSelector from './MunicipalitySearchSelector';
import { companyService } from '../services/companyService';
import { catalogService, CatalogOption } from '../services/catalogService';

interface CreateCompanyForm {
  nit: string;
  digito: string;
  type_document_identification_id: number | '';
  type_organization_id: number | '';
  type_regime_id: number | '';
  type_liability_id: number | '';
  business_name: string;
  merchant_registration: string;
  municipality_id: number | '';
  address: string;
  phone: string;
  email: string;
}

const CreateCompany: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCompanyForm>({
    nit: '',
    digito: '',
    type_document_identification_id: '',
    type_organization_id: '',
    type_regime_id: '',
    type_liability_id: '',
    business_name: '',
    merchant_registration: '',
    municipality_id: '',
    address: '',
    phone: '',
    email: '',
  });

  // Estados para los catálogos
  const [typeDocumentOptions, setTypeDocumentOptions] = useState<CatalogOption[]>([]);
  const [typeOrganizationOptions, setTypeOrganizationOptions] = useState<CatalogOption[]>([]);
  const [typeRegimeOptions, setTypeRegimeOptions] = useState<CatalogOption[]>([]);
  const [typeLiabilityOptions, setTypeLiabilityOptions] = useState<CatalogOption[]>([]);

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        setLoadingCatalogs(true);
        const [documentTypes, organizationTypes, regimeTypes, liabilityTypes] = await Promise.all([
          catalogService.getDocumentTypes(),
          catalogService.getOrganizationTypes(),
          catalogService.getRegimeTypes(),
          catalogService.getLiabilityTypes(),
        ]);

        setTypeDocumentOptions(documentTypes);
        setTypeOrganizationOptions(organizationTypes);
        setTypeRegimeOptions(regimeTypes);
        setTypeLiabilityOptions(liabilityTypes);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los catálogos');
      } finally {
        setLoadingCatalogs(false);
      }
    };

    loadCatalogs();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Para campos numéricos, convertir a número o mantener como string vacía
    const numericFields = [
      'type_document_identification_id',
      'type_organization_id', 
      'type_regime_id',
      'type_liability_id',
      'municipality_id'
    ];
    
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleMunicipalityChange = (value: number | '') => {
    setFormData(prev => ({
      ...prev,
      municipality_id: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar que todos los campos estén completos
      const requiredFields = Object.keys(formData) as (keyof CreateCompanyForm)[];
      const emptyFields = requiredFields.filter(field => formData[field] === '' || formData[field] === null);
      
      if (emptyFields.length > 0) {
        throw new Error('Todos los campos son obligatorios');
      }

      // Crear la empresa
      await companyService.createCompany(formData as any);
      
      // Redirigir a la lista con mensaje de éxito
      navigate('/companies', { 
        state: { 
          message: 'Empresa creada exitosamente',
          type: 'success' 
        }
      });
    } catch (err: any) {
      setError(err.message || 'Error al crear la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/companies');
  };

  // Mostrar loading mientras se cargan los catálogos
  if (loadingCatalogs) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <LoadingSpinner size="xl" color="primary" />
          <p className="mt-4 text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-soltec-primary" />
            <span>Crear Nueva Empresa</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Registra una nueva empresa en el sistema DIAN
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800 text-sm sm:text-base">{error}</p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-1">
                <Input
                  label="NIT"
                  value={formData.nit}
                  onChange={handleInputChange}
                  placeholder="900123456"
                  helperText="Sin dígito de verificación"
                  required
                  {...{ name: "nit", maxLength: 15, pattern: "[0-9]*" }}
                />
              </div>
              
              <div>
                <Input
                  label="Dígito de Verificación"
                  value={formData.digito}
                  onChange={handleInputChange}
                  placeholder="7"
                  required
                  {...{ name: "digito", maxLength: 1, pattern: "[0-9]" }}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <Input
                  label="Razón Social"
                  value={formData.business_name}
                  onChange={handleInputChange}
                  placeholder="EMPRESA EJEMPLO S.A.S."
                  required
                  {...{ name: "business_name", maxLength: 255 }}
                />
              </div>
            </div>
          </div>

          {/* Selectores de catálogos DIAN */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración Tributaria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento *
                </label>
                <select
                  name="type_document_identification_id"
                  value={formData.type_document_identification_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary sm:text-sm"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {typeDocumentOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Organización *
                </label>
                <select
                  name="type_organization_id"
                  value={formData.type_organization_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary sm:text-sm"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {typeOrganizationOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Régimen Tributario *
                </label>
                <select
                  name="type_regime_id"
                  value={formData.type_regime_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary sm:text-sm"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {typeRegimeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsabilidad Tributaria *
                </label>
                <select
                  name="type_liability_id"
                  value={formData.type_liability_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary sm:text-sm"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {typeLiabilityOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Información de ubicación y contacto */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación y Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <MunicipalitySearchSelector
                  label="Municipio"
                  value={formData.municipality_id}
                  onChange={handleMunicipalityChange}
                  required
                />
              </div>

              <div>
                <Input
                  label="Matrícula Mercantil"
                  value={formData.merchant_registration}
                  onChange={handleInputChange}
                  placeholder="12345678"
                  required
                  {...{ name: "merchant_registration", maxLength: 20 }}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Dirección"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Carrera 15 #93-47, Oficina 501"
                  required
                  {...{ name: "address", maxLength: 255 }}
                />
              </div>

              <div>
                <Input
                  label="Teléfono"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+57 1 123 4567"
                  required
                  {...{ name: "phone", maxLength: 20 }}
                />
              </div>

              <div>
                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contacto@empresa.com"
                  required
                  {...{ name: "email", maxLength: 100 }}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Creando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Empresa
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCompany; 