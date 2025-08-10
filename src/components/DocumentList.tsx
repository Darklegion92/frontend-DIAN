import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Search, Calendar, Hash, User, DollarSign, Filter, X, Building2, Copy, Check, Mail } from 'lucide-react';
import { Document, DocumentQuery, DocumentPaginationMeta } from '../types/document';
import { TypeDocumentOption, typeDocumentService } from '../services/typeDocumentService';
import { documentService } from '../services/documentService';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';
import Input from './Input';

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeDocuments, setTypeDocuments] = useState<TypeDocumentOption[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [copiedCufe, setCopiedCufe] = useState<string | null>(null);
  
  // Estados para el modal de email
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailData, setEmailData] = useState<{number: string, prefix: string} | null>(null);
  const [emailAddress, setEmailAddress] = useState('');
  
  // Estados de paginación
  const [pagination, setPagination] = useState<DocumentPaginationMeta>({
    current_page: 1,
    documents: [],
    from: 0,
    last_page: 1,
    per_page: 10,
    to: 0,
    total: 0
  });

  // Estados de filtros
  const [filters, setFilters] = useState<DocumentQuery>({
    created_at_from: '',
    created_at_to: '',
    prefix: '',
    number: '',
    identification_number: '',
    type_document_id: undefined,
    page: 1,
    per_page: 10
  });

  // Cargar tipos de documentos al montar
  useEffect(() => {
    loadTypeDocuments();
    
    // Leer query parameters para pre-filtrar
    const companyFilter = searchParams.get('company');
    if (companyFilter) {
      setFilters(prev => ({
        ...prev,
        identification_number: companyFilter
      }));
    }
  }, [searchParams]);

  // Cargar documentos inicialmente después de cargar tipos
  useEffect(() => {
    if (typeDocuments.length > 0) {
      console.log('✅ Tipos cargados, recargando documentos para actualizar etiquetas');
      loadDocuments();
    }
  }, [typeDocuments]);

  const loadTypeDocuments = async () => {
    try {
      const types = await typeDocumentService.getActiveTypeDocuments();
      console.log('🏷️ Tipos de documentos cargados:', types);
      setTypeDocuments(types);
    } catch (err) {
      console.error('Error loading type documents:', err);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await documentService.getDocuments(filters);
      setPagination(result);
      setDocuments(result.documents || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los documentos');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof DocumentQuery, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadDocuments();
  };

  const clearFilters = async () => {
    setFilters({
      created_at_from: '',
      created_at_to: '',
      prefix: '',
      number: '',
      identification_number: '',
      type_document_id: undefined,
      page: 1,
      per_page: 10
    });
    // Recargar documentos después de limpiar filtros
    await loadDocuments();
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getDocumentTypeLabel = (typeId: number) => {
    console.log('🔍 Buscando tipo:', typeId, 'en lista:', typeDocuments);
    
    // Buscar en la lista cargada desde el API
    const type = typeDocuments.find(t => t.id === typeId);
    if (type?.name) {
      console.log('🏷️ Tipo encontrado en API:', type.name);
      return type.name;
    }
    
    // Fallback con tipos comunes conocidos
    const commonTypes: { [key: number]: string } = {
      1: 'Factura Electrónica',
      2: 'Nota Crédito',
      3: 'Nota Débito',
      4: 'Documento Soporte',
      5: 'Nota de Ajuste'
    };
    
    const fallbackLabel = commonTypes[typeId] || `Tipo ${typeId}`;
    console.log('🏷️ Usando fallback:', fallbackLabel);
    return fallbackLabel;
  };

  // Función para copiar CUFE al portapapeles
  const handleCopyCufe = async (cufe: string) => {
    try {
      await navigator.clipboard.writeText(cufe);
      setCopiedCufe(cufe);
      // Limpiar el estado después de 2 segundos
      setTimeout(() => setCopiedCufe(null), 2000);
    } catch (err) {
      console.error('Error al copiar CUFE:', err);
    }
  };

  const handleSendToEmail = async (number: string, prefix: string) => {
    setEmailData({ number, prefix });
    setEmailAddress('');
    setEmailError(null);
    setEmailSuccess(null);
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailData || !emailAddress.trim()) {
      setEmailError('Por favor ingrese un correo electrónico válido');
      return;
    }

    // Validación más robusta de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailAddress.trim())) {
      setEmailError('Por favor ingrese un correo electrónico válido');
      return;
    }

    try {
      setEmailLoading(true);
      setEmailError(null);
      setEmailSuccess(null);

      const response = await documentService.sendEmail(
        emailData.number,
        emailData.prefix,
        emailAddress.trim()
      );

      if (response.codigo === 200) {
        setEmailSuccess(`Documento ${emailData.prefix}${emailData.number} enviado correctamente a ${emailAddress.trim()}`);
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailSuccess(null);
        }, 3000);
      } else {
        setEmailError(response.mensaje || 'Error al enviar el documento');
      }
    } catch (err: any) {
      setEmailError(err.message || 'Error al enviar el documento por email');
    } finally {
      setEmailLoading(false);
    }
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setEmailData(null);
    setEmailAddress('');
    setEmailError(null);
    setEmailSuccess(null);
  };

  // Mostrar loading
  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <LoadingSpinner size="xl" color="primary" />
          <p className="mt-4 text-gray-600">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-soltec-primary" />
            <span>Documentos Electrónicos</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {searchParams.get('company') 
              ? `Documentos de la compañía ${searchParams.get('company')} autorizados por la DIAN`
              : 'Consulta y gestiona todos los documentos autorizados por la DIAN'
            }
          </p>
          {/* Indicador de filtro de compañía */}
          {searchParams.get('company') && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Building2 className="h-3 w-3 mr-1" />
              Filtro activo: {searchParams.get('company')}
              <button
                onClick={() => {
                  navigate('/documents');
                  setFilters(prev => ({ ...prev, identification_number: '' }));
                }}
                className="ml-2 hover:bg-blue-200 rounded-full p-0.5"
                title="Ver todos los documentos"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Fecha desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filters.created_at_from}
                  onChange={(e) => handleFilterChange('created_at_from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  disabled={loading}
                />
              </div>

              {/* Fecha hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filters.created_at_to}
                  onChange={(e) => handleFilterChange('created_at_to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  disabled={loading}
                />
              </div>

              {/* Tipo de documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  value={filters.type_document_id || ''}
                  onChange={(e) => handleFilterChange('type_document_id', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  disabled={loading}
                >
                  <option value="">Todos los tipos</option>
                  {typeDocuments.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              {/* Prefijo */}
              <div>
                <Input
                  label="Prefijo"
                  type="text"
                  value={filters.prefix}
                  onChange={(e) => handleFilterChange('prefix', e.target.value)}
                  placeholder="Ej: FE, NC, ND"
                  disabled={loading}
                />
              </div>

              {/* Número */}
              <div>
                <Input
                  label="Número de Documento"
                  type="text"
                  value={filters.number}
                  onChange={(e) => handleFilterChange('number', e.target.value)}
                  placeholder="Ej: 001"
                  disabled={loading}
                />
              </div>

              {/* Identificación de la compañía */}
              <div>
                <Input
                  label="Identificación de Compañía"
                  type="text"
                  value={filters.identification_number}
                  onChange={(e) => handleFilterChange('identification_number', e.target.value)}
                  placeholder="Ej: 12345678"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 pt-4">
              <Button type="submit" variant="primary" size="md" disabled={loading} className="w-full sm:w-auto">
                {loading ? <LoadingSpinner size="sm" color="white" /> : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="md" 
                onClick={clearFilters}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Lista de documentos */}
      <div className="bg-white rounded-lg shadow-sm">
        {documents.length === 0 && !loading ? (
          <div className="text-center py-12 px-4">
            <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
            <p className="text-sm sm:text-base text-gray-600">
              No se encontraron documentos con los filtros aplicados
            </p>
          </div>
        ) : documents.length > 0 ? (
          <>
            {/* Tabla de documentos */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[120px]">
                      Documento
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[120px]">
                      Tipo
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[200px]">
                      Cliente
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[120px]">
                      Valor Total
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[120px]">
                      Fecha
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[200px]">
                      OPCIONES
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {documents.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium text-sm sm:text-base text-gray-900">
                              {document.prefix}{document.number}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              ID: {document.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">
                          {getDocumentTypeLabel(document.typeDocumentId)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium text-sm sm:text-base text-gray-900">
                              {document.client.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {document.client.identification_number}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="font-medium text-sm sm:text-base text-gray-900">
                            {formatCurrency(document.total)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(document.dateIssue)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(document.dateIssue).toLocaleTimeString('es-ES')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyCufe(document.cufe)}
                            className="flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Copiar CUFE"
                          >
                            {copiedCufe === document.cufe ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                          <button
                            onClick={() => handleSendToEmail(document.number, document.prefix)}
                            className="flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors"
                            title={`Enviar documento ${document.prefix}${document.number} por email`}
                          >
                            <Mail className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.last_page > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Mostrando {pagination.from} - {pagination.to} de {pagination.total} documentos
                  <span className="block sm:inline sm:ml-2 text-gray-400">({pagination.per_page} por página)</span>
                </div>
                <div className="flex justify-center sm:justify-end space-x-1 sm:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.current_page <= 1 || loading}
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    className="text-xs px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Anterior</span>
                    <span className="sm:hidden">‹</span>
                  </Button>
                  
                  {/* Números de página */}
                  {Array.from({ length: Math.min(3, pagination.last_page) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(
                      pagination.last_page - 2,
                      pagination.current_page - 1
                    )) + i;
                    
                    if (pageNum <= pagination.last_page) {
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.current_page ? "primary" : "outline"}
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
                    disabled={pagination.current_page >= pagination.last_page || loading}
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    className="text-xs px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <span className="sm:hidden">›</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : loading ? (
          <div className="text-center py-12 px-4">
            <LoadingSpinner size="xl" color="primary" />
            <p className="mt-4 text-gray-600">Cargando documentos...</p>
          </div>
        ) : null}
      </div>

      {/* Modal de envío de email */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow">
              <div className="flex justify-between items-start p-4 rounded-t border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Enviar Documento por Email
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                  onClick={closeEmailModal}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Documento a enviar:
                  </p>
                  <p className="text-lg font-bold text-blue-900">
                    {emailData?.prefix}{emailData?.number}
                  </p>
                </div>
                <p className="text-base leading-relaxed text-gray-500">
                  Ingresa el correo electrónico al cual deseas enviar el documento.
                </p>
                <form onSubmit={handleEmailSubmit}>
                  <div className="grid gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary sm:text-sm"
                        placeholder="ejemplo@ejemplo.com"
                        required
                        autoFocus
                      />
                    </div>
                    {emailError && (
                      <p className="text-red-500 text-sm">{emailError}</p>
                    )}
                    {emailSuccess && (
                      <p className="text-green-600 text-sm">{emailSuccess}</p>
                    )}
                  </div>
                  <div className="flex items-center p-6 space-x-2 rounded-b border-t border-gray-200">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={emailLoading}
                      className="w-full sm:w-auto"
                    >
                      {emailLoading ? <LoadingSpinner size="sm" color="white" /> : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={closeEmailModal}
                      className="w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList; 