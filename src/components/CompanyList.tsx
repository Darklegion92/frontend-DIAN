import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Plus, Eye, Calendar, MapPin, Phone, Mail, MoreVertical, FileText, Shield, FolderOpen, ChevronDown } from 'lucide-react';
import { Company, PaginatedResponse, PaginationQuery } from '../types/company';
import { companyService } from '../services/companyService';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';
import Input from './Input';

const CompanyList: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  // Cargar empresas
  const loadCompanies = async (params?: PaginationQuery) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = {
        page: params?.page || pagination.currentPage,
        limit: params?.limit || 10,
        dato: params?.dato !== undefined ? params.dato : searchTerm || undefined
      };

      // Remover parámetros vacíos o undefined
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key as keyof typeof queryParams] === '' || queryParams[key as keyof typeof queryParams] === undefined) {
          delete queryParams[key as keyof typeof queryParams];
        }
      });

      const response: PaginatedResponse<Company> = await companyService.getCompanies(queryParams);
      
      // Verificar que la respuesta tenga la estructura correcta
      if (response && response.data && Array.isArray(response.data) && response.meta) {
        setCompanies(response.data);
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
        setCompanies([]); // Asegurar que companies sea un array
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las empresas');
      setCompanies([]); // Asegurar que companies sea un array en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar empresas al montar el componente
  useEffect(() => {
    loadCompanies();
  }, []);

  // Efecto para cerrar dropdown al hacer scroll o presionar Escape
  useEffect(() => {
    const handleScroll = () => {
      setOpenDropdown(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      window.addEventListener('scroll', handleScroll, true);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdown]);

  // Manejar búsqueda
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadCompanies({ page: 1, dato: searchTerm });
  };

  // Limpiar filtros
  const handleClearFilters = async () => {
    setSearchTerm('');
    await loadCompanies({ page: 1, dato: '' });
  };

  // Manejar cambio de página
  const handlePageChange = async (newPage: number) => {
    await loadCompanies({ page: newPage });
  };

  // Manejar acciones de empresa
  const handleAction = (action: string, company: Company) => {
    console.log(`Ejecutando acción: ${action} para empresa ${company.id}`);
    
    // Cerrar dropdown si está abierto
    setOpenDropdown(null);
    
    // Placeholder para futuras implementaciones
    switch (action) {
      case 'ver-empresa':
        // Navegar a vista detallada de empresa
        break;
      case 'agregar-certificado':
        // Abrir modal/página para agregar certificado
        break;
      case 'ver-resoluciones':
        // Navegar a lista de resoluciones
        break;
      case 'ver-documentos':
        // Navegar a documentos de la empresa
        break;
      default:
        break;
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Componente ActionDropdown
  const ActionDropdown: React.FC<{ company: Company }> = ({ company }) => {
    const isOpen = openDropdown === company.id;
    const hasCertificate = !!company.certificateId;

    const toggleDropdown = () => {
      setOpenDropdown(isOpen ? null : company.id);
    };

    const closeDropdown = () => {
      setOpenDropdown(null);
    };

    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDropdown}
          className={`text-xs px-2 sm:px-3 ${isOpen ? 'bg-gray-100' : ''}`}
        >
          <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
          <ChevronDown className={`h-3 w-3 ml-1 hidden sm:block transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        {isOpen && (
          <>
            {/* Overlay para cerrar el dropdown */}
            <div
              className="fixed inset-0 z-10"
              onClick={closeDropdown}
            />
            
            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg border border-gray-200 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="py-1">
                {/* Información de la empresa */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-900">
                    {company.identificationNumber}-{company.dv}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {company.id}
                  </p>
                </div>

                {/* Acciones principales */}
                <button
                  onClick={() => handleAction('ver-empresa', company)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-blue-500" />
                  Ver Empresa
                </button>
                
                {/* Separador */}
                <div className="border-t border-gray-100 my-1" />
                
                {/* Acciones de certificado */}
                <button
                  onClick={() => handleAction('agregar-certificado', company)}
                  className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                    hasCertificate 
                      ? 'text-gray-700 hover:bg-yellow-50 hover:text-yellow-700' 
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  <Shield className={`h-4 w-4 mr-3 ${hasCertificate ? 'text-yellow-500' : 'text-green-500'}`} />
                  {hasCertificate ? 'Actualizar Certificado' : 'Agregar Certificado'}
                  {!hasCertificate && (
                    <span className="ml-auto text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                      Requerido
                    </span>
                  )}
                </button>
                
                {/* Separador */}
                <div className="border-t border-gray-100 my-1" />
                
                {/* Acciones de documentos */}
                <button
                  onClick={() => handleAction('ver-resoluciones', company)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-3 text-purple-500" />
                  Ver Resoluciones
                </button>
                
                <button
                  onClick={() => handleAction('ver-documentos', company)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                >
                  <FolderOpen className="h-4 w-4 mr-3 text-orange-500" />
                  Ver Documentos
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // Mostrar loading
  if (loading && companies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <LoadingSpinner size="xl" color="primary" />
          <p className="mt-4 text-gray-600">Cargando empresas...</p>
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
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-soltec-primary" />
            <span>Gestión de Empresas</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Administra y consulta la información de las empresas registradas (10 por página)
          </p>
        </div>
        <Button variant="primary" size="md" className="w-full sm:w-auto" onClick={() => navigate('/companies/create')}>
          <Plus className="h-5 w-5 mr-2" />
          Nueva Empresa
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <Input
              type="text"
              label="Buscar"
              placeholder="NIT o nombre de la empresa"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              helperText="Busca por número de documento (NIT) o razón social"
            />
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
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
              onClick={handleClearFilters}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Limpiar
            </Button>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Lista de empresas */}
      <div className="bg-white rounded-lg shadow-sm">
        {!Array.isArray(companies) || companies.length === 0 && !loading ? (
          <div className="text-center py-12 px-4">
            <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No hay empresas registradas</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchTerm 
                ? 'No se encontraron resultados para la búsqueda realizada' 
                : 'Comienza agregando tu primera empresa'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Tabla de empresas */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[768px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[140px]">
                      Identificación
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[200px]">
                      Contacto
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[100px]">
                      Estado
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[120px]">
                      Certificado
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase min-w-[160px]">
                      Fechas
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase min-w-[100px] sm:min-w-[300px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Array.isArray(companies) && companies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-3">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">
                            ID: {company.id}
                          </p>
                          <p className="font-medium text-sm sm:text-base text-gray-900">
                            {company.identificationNumber}-{company.dv}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {company.merchantRegistration}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-start text-xs sm:text-sm text-gray-600">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="break-words line-clamp-2">{company.address}</span>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                            <span>{company.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          company.state 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {company.state ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        {company.certificateExpirationDate ? (
                          <div className="text-xs sm:text-sm">
                            <p className="text-gray-900">
                              {formatDate(company.certificateExpirationDate)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Vencimiento
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs sm:text-sm text-gray-400">Sin certificado</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-start">
                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                            <div>
                              <p>Creado: {formatDate(company.createdAt)}</p>
                              <p>Actualizado: {formatDate(company.updatedAt)}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        {/* Dropdown para móviles */}
                        <div className="sm:hidden flex justify-center">
                          <ActionDropdown company={company} />
                        </div>
                        
                        {/* Botones visibles para desktop */}
                        <div className="hidden sm:flex sm:flex-wrap sm:gap-1 sm:justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('ver-empresa', company)}
                            className="text-xs px-2 py-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          
                          <Button
                            variant={company.certificateId ? "outline" : "primary"}
                            size="sm"
                            onClick={() => handleAction('agregar-certificado', company)}
                            className={`text-xs px-2 py-1 ${
                              company.certificateId 
                                ? 'hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200' 
                                : 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                            }`}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {company.certificateId ? 'Cert.' : 'Cert.'}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('ver-resoluciones', company)}
                            className="text-xs px-2 py-1 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Res.
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('ver-documentos', company)}
                            className="text-xs px-2 py-1 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
                          >
                            <FolderOpen className="h-3 w-3 mr-1" />
                            Docs.
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
                  Mostrando {((pagination.currentPage - 1) * 10) + 1} - {Math.min(pagination.currentPage * 10, pagination.totalItems)} de {pagination.totalItems} empresas
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
    </div>
  );
};

export default CompanyList; 