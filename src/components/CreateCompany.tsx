import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';
import MunicipalitySearchSelector from './MunicipalitySearchSelector';
import { companyService } from '../services/companyService';
import { catalogService, CatalogOption } from '../services/catalogService';
import Tabs from './Tabs';

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
  // Campos de buzón de correo
  mail_host: string | null;
  mail_port: string | null;
  mail_username: string | null;
  mail_password: string | null;
  mail_encryption: string | null;
  mail_from_address: string | null;
  mail_from_name: string | null;
  // Campos de correo Radianes
  imap_server: string | null;
  imap_user: string | null;
  imap_password: string | null;
  imap_port: string | null;
  imap_encryption: string | null;
}

const TABS = [
  { id: 'basic', label: 'Información Básica' },
  { id: 'tax', label: 'Configuración Tributaria' },
  { id: 'location', label: 'Ubicación y Contacto' },
  { id: 'mailbox', label: 'Buzón de Correo' },
  { id: 'radianes', label: 'Correo Radianes' },
];

// Mapeo de campos a pestañas
const FIELD_TO_TAB_MAP: Record<keyof CreateCompanyForm, string> = {
  // Pestaña básica
  nit: 'basic',
  digito: 'basic',
  business_name: 'basic',
  
  // Pestaña tributaria
  type_document_identification_id: 'tax',
  type_organization_id: 'tax',
  type_regime_id: 'tax',
  type_liability_id: 'tax',
  
  // Pestaña de ubicación y contacto
  municipality_id: 'location',
  merchant_registration: 'location',
  address: 'location',
  phone: 'location',
  email: 'location',
  
  // Pestaña de buzón de correo
  mail_host: 'mailbox',
  mail_port: 'mailbox',
  mail_username: 'mailbox',
  mail_password: 'mailbox',
  mail_encryption: 'mailbox',
  mail_from_address: 'mailbox',
  mail_from_name: 'mailbox',
  
  // Pestaña de Radianes
  imap_server: 'radianes',
  imap_user: 'radianes',
  imap_password: 'radianes',
  imap_port: 'radianes',
  imap_encryption: 'radianes'
};

const CreateCompany: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loadingCompany, setLoadingCompany] = useState(isEditing);
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
    // Inicializar campos de buzón de correo
    mail_host: null,
    mail_port: null,
    mail_username: null,
    mail_password: null,
    mail_encryption: null,
    mail_from_address: null,
    mail_from_name: null,
    // Inicializar campos de correo Radianes
    imap_server: null,
    imap_user: null,
    imap_password: null,
    imap_port: null,
    imap_encryption: null,
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

  // Cargar datos de la empresa si estamos editando
  useEffect(() => {
    const loadCompany = async () => {
      if (!isEditing || !id) return;

      try {
        setLoadingCompany(true);
        const company = await companyService.getCompanyById(Number(id));
        
        // Mapear los datos de la empresa al formato del formulario
        const newFormData: CreateCompanyForm = {
          nit: company.identificationNumber || '',
          digito: company.dv || '',
          type_document_identification_id: company.typeDocumentIdentificationId ? Number(company.typeDocumentIdentificationId) : '',
          type_organization_id: company.typeOrganizationId ? Number(company.typeOrganizationId) : '',
          type_regime_id: company.typeRegimeId ? Number(company.typeRegimeId) : '',
          type_liability_id: company.typeLiabilityId ? Number(company.typeLiabilityId) : '',
          business_name: company.usuarioDian || '',
          merchant_registration: company.merchantRegistration || '',
          municipality_id: company.municipalityId ? Number(company.municipalityId) : '',
          address: company.address || '',
          phone: company.phone || '',
          email: company.userEmail || '',
          // Datos de buzón de correo
          mail_host: company.mailHost || null,
          mail_port: company.mailPort?.toString() || null,
          mail_username: company.mailUsername || null,
          mail_password: company.mailPassword || null,
          mail_encryption: company.mailEncryption || null,
          mail_from_address: company.mailFromAddress || null,
          mail_from_name: company.mailFromName || null,
          // Datos de correo Radianes
          imap_server: company.imapServer || null,
          imap_user: company.imapUser || null,
          imap_password: company.imapPassword || null,
          imap_port: company.imapPort?.toString() || null,
          imap_encryption: company.imapEncryption || null,
        };
        
        setFormData(newFormData);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos de la empresa');
      } finally {
        setLoadingCompany(false);
      }
    };

    loadCompany();
  }, [isEditing, id]);

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
      // Eliminar campos que no sean obligatorios
      requiredFields.splice(requiredFields.indexOf('imap_server'), 1);
      requiredFields.splice(requiredFields.indexOf('imap_user'), 1);
      requiredFields.splice(requiredFields.indexOf('imap_password'), 1);
      requiredFields.splice(requiredFields.indexOf('imap_port'), 1);
      requiredFields.splice(requiredFields.indexOf('imap_encryption'), 1);

      const emptyFields = requiredFields.filter(field => formData[field] === '' || formData[field] === null);
      
      if (emptyFields.length > 0) {
        // Encontrar la primera pestaña que contiene un campo vacío
        const firstEmptyField = emptyFields[0];
        const tabWithError = FIELD_TO_TAB_MAP[firstEmptyField];
        
        // Cambiar a la pestaña que contiene el error
        setActiveTab(tabWithError);
        
        throw new Error(`Por favor complete todos los campos obligatorios en la pestaña "${TABS.find(tab => tab.id === tabWithError)?.label}"`);
      }

      // Usar el método correcto según el modo
      await companyService.createCompany(formData as any);
      
      // Redirigir a la lista con mensaje de éxito
      navigate('/companies', { 
        state: { 
          message: isEditing ? 'Empresa actualizada exitosamente' : 'Empresa creada exitosamente',
          type: 'success' 
        }
      });
    } catch (err: any) {
      setError(err.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la empresa`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/companies');
  };

  const renderBasicInfo = () => (
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
            {...{ name: "business_name", maxLength: 255 }}
          />
        </div>
      </div>
    </div>
  );

  const renderTaxConfig = () => (
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
  );

  const renderLocationContact = () => (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación y Contacto</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <MunicipalitySearchSelector
            label="Municipio"
            value={formData.municipality_id}
            onChange={handleMunicipalityChange}
            required
            disabled={loading}
          />
        </div>

        <div>
          <Input
            label="Matrícula Mercantil"
            value={formData.merchant_registration}
            onChange={handleInputChange}
            placeholder="12345678"
            required
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
            {...{ name: "email", maxLength: 100 }}
          />
        </div>
      </div>
    </div>
  );

  const renderMailbox = () => (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Datos de Buzón de Correo</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Servidor de Correo"
          value={formData.mail_host || ''}
          onChange={handleInputChange}
          placeholder="smtp.ejemplo.com"
          disabled={loading}
          {...{name:"mail_host"}}
        />
        <Input
          label="Puerto SMTP"
          type="number"
          value={formData.mail_port !== null ? String(formData.mail_port) : ''}
          onChange={handleInputChange}
          placeholder="587"
          disabled={loading}
          {...{name:"mail_port"}}
        />
        <Input
          label="Usuario"
          value={formData.mail_username || ''}
          onChange={handleInputChange}
          placeholder="usuario@ejemplo.com"
          disabled={loading}
          {...{name:"mail_username"}}
        />
        <Input
          label="Contraseña"
          type="password"
          value={formData.mail_password || ''}
          onChange={handleInputChange}
          placeholder="********"
          disabled={loading}
          {...{name:"mail_password"}}
        />
        <Input
          label="Encriptación"
          value={formData.mail_encryption || ''}
          onChange={handleInputChange}
          placeholder="tls"
          disabled={loading}
          {...{name:"mail_encryption"}}
        />
        <Input
          label="Dirección de Envío"
          value={formData.mail_from_address || ''}
          onChange={handleInputChange}
          placeholder="noreply@ejemplo.com"
          disabled={loading}
          {...{name:"mail_from_address"}}
        />
        <Input
          label="Nombre de Envío"
          value={formData.mail_from_name || ''}
          onChange={handleInputChange}
          placeholder="Empresa Ejemplo S.A.S."
          disabled={loading}
          {...{name:"mail_from_name"}}
        />
      </div>
    </div>
  );

  const renderRadianes = () => (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Datos de correo Radianes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Servidor IMAP"
          value={formData.imap_server || ''}
          onChange={handleInputChange}
          placeholder="mail.ejemplo.com"
          disabled={loading}
          {...{name:"imap_server"}}
        />
        <Input
          label="Usuario IMAP"
          value={formData.imap_user || ''}
          onChange={handleInputChange}
          placeholder="usuario@ejemplo.com"
          disabled={loading}
          {...{name:"imap_user"}}
        />
        <Input
          label="Contraseña IMAP"
          type="password"
          value={formData.imap_password || ''}
          onChange={handleInputChange}
          placeholder="********"
          disabled={loading}
          {...{name:"imap_password"}}
        />
        <Input
          label="Puerto IMAP"
          type="number"
          value={formData.imap_port !== null ? String(formData.imap_port) : ''}
          onChange={handleInputChange}
          placeholder="993"
          disabled={loading}
          {...{name:"imap_port"}}
        />
        <Input
          label="Encriptación IMAP"
          value={formData.imap_encryption || ''}
          onChange={handleInputChange}
          placeholder="ssl/tls"
          disabled={loading}
          {...{name:"imap_encryption"}}
        />
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicInfo();
      case 'tax':
        return renderTaxConfig();
      case 'location':
        return renderLocationContact();
      case 'mailbox':
        return renderMailbox();
      case 'radianes':
        return renderRadianes();
      default:
        return null;
    }
  };

  // Mostrar loading mientras se cargan los catálogos o la empresa
  if (loadingCatalogs || loadingCompany) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <LoadingSpinner size="xl" color="primary" />
          <p className="mt-4 text-gray-600">
            {loadingCatalogs ? 'Cargando formulario...' : 'Cargando datos de la empresa...'}
          </p>
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
            <span>{isEditing ? 'Editar Empresa' : 'Crear Nueva Empresa'}</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {isEditing ? 'Modifica la información de la empresa' : 'Registra una nueva empresa en el sistema DIAN'}
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
        <div className="px-6 pt-6">
          <Tabs
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {renderActiveTab()}
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4 p-6 border-t border-gray-200">
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
                  <span className="ml-2">Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Actualizar Empresa' : 'Crear Empresa'}
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