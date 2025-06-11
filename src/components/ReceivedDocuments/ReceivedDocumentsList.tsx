import React, { useState, useEffect } from 'react';
import { Inbox, Filter, X, Search, Calendar, User, Hash } from 'lucide-react';
import api from '../../config/api';
import LoadingSpinner from '../LoadingSpinner';
import Button from '../Button';

// Interfaz de radianes
interface Radian {
  id: string;
  documentNumber: string;
  documentType: string;
  issueDate: string;
  sender: string;
  status: string;
}

interface RadianQuery {
  documentNumber?: string;
  documentType?: string;
  sender?: string;
  status?: string;
  issueDateFrom?: string;
  issueDateTo?: string;
  page?: number;
  perPage?: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: Radian[];
    meta: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
    };
  };
}

export const ReceivedDocumentsList: React.FC = () => {
  const [radianes, setRadianes] = useState<Radian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<RadianQuery>({
    documentNumber: '',
    documentType: '',
    sender: '',
    status: '',
    issueDateFrom: '',
    issueDateTo: '',
    page: 1,
    perPage: 10,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  useEffect(() => {
    loadRadianes();
    // eslint-disable-next-line
  }, [filters.page]);

  const loadRadianes = async () => {
    try {
      setLoading(true);
      setError(null);
      // Adaptar los filtros al backend si es necesario
      const params = {
        documentNumber: filters.documentNumber,
        documentType: filters.documentType,
        sender: filters.sender,
        status: filters.status,
        issueDateFrom: filters.issueDateFrom,
        issueDateTo: filters.issueDateTo,
        page: filters.page,
        perPage: filters.perPage,
      };
      const response = await api.get<ApiResponse>('/received-documents', { params });
      if (response.data.success && Array.isArray(response.data.data.data)) {
        setRadianes(response.data.data.data);
        setPagination({
          currentPage: response.data.data.meta.currentPage,
          totalPages: response.data.data.meta.totalPages,
          totalItems: response.data.data.meta.totalItems,
          itemsPerPage: response.data.data.meta.itemsPerPage,
        });
      } else {
        setRadianes([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar los radianes');
      setRadianes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof RadianQuery, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadRadianes();
  };

  const clearFilters = () => {
    setFilters({
      documentNumber: '',
      documentType: '',
      sender: '',
      status: '',
      issueDateFrom: '',
      issueDateTo: '',
      page: 1,
      perPage: 10,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Render loading
  if (loading && radianes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <LoadingSpinner size="xl" color="primary" />
          <p className="mt-4 text-gray-600">Cargando radianes...</p>
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
            <Inbox className="h-6 w-6 sm:h-8 sm:w-8 text-soltec-primary" />
            <span>Radianes</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Consulta y gestiona todos los radianes recibidos
          </p>
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
              {/* Número de documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Documento</label>
                <input
                  type="text"
                  value={filters.documentNumber}
                  onChange={(e) => handleFilterChange('documentNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  disabled={loading}
                />
              </div>
              {/* Tipo de documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <input
                  type="text"
                  value={filters.documentType}
                  onChange={(e) => handleFilterChange('documentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  disabled={loading}
                />
              </div>
              {/* Remitente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remitente</label>
                <input
                  type="text"
                  value={filters.sender}
                  onChange={(e) => handleFilterChange('sender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  disabled={loading}
                />
              </div>
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <input
                  type="text"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  disabled={loading}
                />
              </div>
              {/* Fecha desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
                <input
                  type="date"
                  value={filters.issueDateFrom}
                  onChange={(e) => handleFilterChange('issueDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  disabled={loading}
                />
              </div>
              {/* Fecha hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
                <input
                  type="date"
                  value={filters.issueDateTo}
                  onChange={(e) => handleFilterChange('issueDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button type="submit" variant="primary" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />Buscar
              </Button>
              <Button type="button" variant="outline" onClick={clearFilters} disabled={loading}>
                <X className="h-4 w-4 mr-2" />Limpiar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla y mensaje vacío */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número de Documento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remitente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {radianes.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox className="w-12 h-12 mb-2 text-gray-300" />
                    <span className="font-semibold text-lg">No hay radianes</span>
                    <span className="text-sm text-gray-400">No se encontraron radianes con los filtros aplicados</span>
                  </div>
                </td>
              </tr>
            ) : (
              radianes.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{doc.documentNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doc.documentType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(doc.issueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doc.sender}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      doc.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
              onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
            >
              Anterior
            </button>
            <span className="px-4 py-1 border-t border-b border-gray-300 bg-white text-gray-700">
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
            <button
              className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
              onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Siguiente
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}; 