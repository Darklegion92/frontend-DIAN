import React, { useState, useEffect } from 'react';
import { Inbox, Filter, X, Search, Calendar, User, Hash, Check, XCircle } from 'lucide-react';
import api from '../../config/api';
import LoadingSpinner from '../LoadingSpinner';
import Button from '../Button';
import { useAuth } from '../../hooks/useAuth';

// Interfaz de radianes
interface Radian {
  id: number;
  identification_number: string;
  name_seller: string;
  type_document_id: string;
  prefix: string;
  number: string;
  date_issue: string;
  state_document_id: number;
  customer: string;
  customer_name: string | null;
  total: number;
  total_tax: number;
  total_discount: number;
  aceptacion: boolean;
  rec_bienes: boolean;
  acu_recibo: boolean;
  rechazo: boolean;
  cufe: string;
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
  aceptacion?: number;
}

interface ApiResponse {
  success: boolean;
  statusCode: number;
  data: {
    items: Radian[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
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
    aceptacion: undefined,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [fetchingEmails, setFetchingEmails] = useState(false);
  const [fetchEmailsMsg, setFetchEmailsMsg] = useState<string | null>(null);
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [fetchStartDate, setFetchStartDate] = useState('');
  const [fetchEndDate, setFetchEndDate] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [processingAction, setProcessingAction] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    loadRadianes();
    // eslint-disable-next-line
  }, [filters.page]);

  const loadRadianes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        customer: user?.company_document,
        documentType: filters.documentType,
        identification_number: filters.sender,
        status: filters.status,
        issueDateFrom: filters.issueDateFrom,
        page: filters.page,
        perPage: filters.perPage,
      };

      // Solo agregar el parámetro aceptacion si está definido
      if (filters.aceptacion !== undefined) {
        params.aceptacion = filters.aceptacion;
      }

      const response = await api.get<ApiResponse>('/received-documents', { params });
      if (response.data.success && Array.isArray(response.data.data.items)) {
        setRadianes(response.data.data.items);
        setPagination({
          currentPage: response.data.data.page,
          totalPages: response.data.data.totalPages,
          totalItems: response.data.data.total,
          itemsPerPage: response.data.data.limit,
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

  const handleFilterChange = (field: keyof RadianQuery, value: string | number | undefined) => {
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
      page: 1,
      perPage: 10,
      aceptacion: undefined,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Helper para obtener la fecha actual en formato YYYY-MM-DD
  const getToday = () => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  };

  const openFetchModal = () => {
    const today = getToday();
    setFetchStartDate(today);
    setFetchEndDate(today);
    setShowFetchModal(true);
  };

  const handleFetchEmails = async () => {
    setFetchingEmails(true);
    setFetchEmailsMsg(null);
    try {
      // Sumar un día a la fecha final
      const endDate = new Date(fetchEndDate);
      endDate.setDate(endDate.getDate() + 1);
      const formattedEndDate = endDate.toISOString().split('T')[0];

      const response = await api.post('/received-documents/fetch-invoices-email', {
        start_date: fetchStartDate,
        end_date: formattedEndDate,
      });
      setFetchEmailsMsg("Se encontraron " + response.data.data.length + " facturas.");
      await loadRadianes();
      setShowFetchModal(false);
    } catch (err: any) {
      setFetchEmailsMsg(err.response?.data?.message || 'Error al consultar correos.');
    } finally {
      setFetchingEmails(false);
    }
  };

  const getStatusInfo = (doc: Radian) => {
    if (doc.aceptacion) {
      return { text: 'Aceptado', color: 'bg-green-100 text-green-800' };
    }
    if (doc.rec_bienes) {
      return { text: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (doc.acu_recibo) {
      return { text: 'Recibida', color: 'bg-blue-100 text-blue-800' };
    }
    if (doc.rechazo) {
      return { text: 'Rechazada', color: 'bg-red-100 text-red-800' };
    }
    return { text: 'Sin Procesar', color: 'bg-gray-100 text-gray-800' };
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const selectableItems = radianes
        .filter(item => !item.aceptacion && !item.rechazo && item.state_document_id === 1)
        .map(item => item.id);
      setSelectedItems(selectableItems);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number) => {
    const document = radianes.find(doc => doc.id === id);
    if (!document || document.state_document_id !== 1) return;

    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleAcceptSelected = async () => {
    if (selectedItems.length === 0) return;
    
    setProcessingAction(true);
    try {
      // Obtener los CUFEs de los documentos seleccionados
      const selectedDocuments = radianes.filter(doc => selectedItems.includes(doc.id));
      const cufes = selectedDocuments.map(doc => doc.cufe);

      await api.post('/received-documents/send-event',  cufes );
      setFetchEmailsMsg(`${selectedItems.length} documentos aceptados correctamente.`);
      setSelectedItems([]);
      await loadRadianes();
    } catch (err: any) {
      setFetchEmailsMsg(err.response?.data?.message || 'Error al aceptar documentos.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectItem = async (id: number) => {
    setProcessingAction(true);
    try {
      const document = radianes.find(doc => doc.id === id);
      if (!document) throw new Error('Documento no encontrado');

      await api.post('/received-documents/reject-document', { cufe: document.cufe });
      setFetchEmailsMsg('Documento rechazado correctamente.');
      await loadRadianes();
    } catch (err: any) {
      setFetchEmailsMsg(err.response?.data?.message || 'Error al rechazar documento.');
    } finally {
      setProcessingAction(false);
    }
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
    <div className="space-y-6 p-4 sm:p-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2 truncate">
            <Inbox className="h-6 w-6 sm:h-8 sm:w-8 text-soltec-primary flex-shrink-0" />
            <span className="truncate">Radianes</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
            Consulta y gestiona todos los radianes recibidos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button
            variant="primary"
            onClick={openFetchModal}
            disabled={fetchingEmails}
            className="flex items-center"
          >
            <Inbox className="h-4 w-4 mr-2 flex-shrink-0" />
            Consultar Correos
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
        </div>
      </div>

      {fetchEmailsMsg && (
        <div className={`mt-2 p-3 rounded-lg text-sm ${fetchEmailsMsg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>{fetchEmailsMsg}</div>
      )}

      {/* Acciones en lote */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-blue-700 font-medium truncate">
            {selectedItems.length} documento(s) seleccionado(s)
          </span>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="primary"
              onClick={handleAcceptSelected}
              disabled={processingAction}
              className="flex items-center"
            >
              <Check className="h-4 w-4 mr-2 flex-shrink-0" />
              Aceptar Seleccionados
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedItems([])}
              disabled={processingAction}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Remitente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doc. Cliente</label>
                <input
                  type="text"
                  value={filters.sender}
                  onChange={(e) => handleFilterChange('sender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  disabled={loading}
                />
              </div>
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={filters.issueDateFrom}
                  onChange={(e) => handleFilterChange('issueDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  disabled={loading}
                />
              </div>
              {/* Filtro de No Aceptados */}
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={filters.aceptacion === 0}
                    onChange={(e) => handleFilterChange('aceptacion', e.target.checked ? 0 : undefined)}
                    disabled={loading}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-soltec-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-soltec-primary"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Solo No Aceptados</span>
                </label>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button type="submit" variant="primary" disabled={loading}>
                <Search className="h-4 w-4 mr-2 flex-shrink-0" />Buscar
              </Button>
              <Button type="button" variant="outline" onClick={clearFilters} disabled={loading}>
                <X className="h-4 w-4 mr-2 flex-shrink-0" />Limpiar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:-mx-6">
          <div className="inline-block min-w-full align-middle px-4 sm:px-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-soltec-primary focus:ring-soltec-primary"
                      checked={selectedItems.length > 0 && selectedItems.length === radianes.filter(item => !item.aceptacion && !item.rechazo && item.state_document_id === 1).length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remitente</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IVA</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {radianes.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <Inbox className="w-12 h-12 mb-2 text-gray-300" />
                        <span className="font-semibold text-lg">No hay radianes</span>
                        <span className="text-sm text-gray-400">No se encontraron radianes con los filtros aplicados</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  radianes.map((doc) => {
                    const statusInfo = getStatusInfo(doc);
                    const canAccept = !doc.aceptacion && !doc.rechazo && doc.state_document_id === 1;
                    return (
                      <tr key={doc.id}>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-soltec-primary focus:ring-soltec-primary"
                            checked={selectedItems.includes(doc.id)}
                            onChange={() => handleSelectItem(doc.id)}
                          />
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">{doc.number}</td>
                        <td className="px-3 py-4 whitespace-nowrap">{doc.type_document_id}</td>
                        <td className="px-3 py-4 whitespace-nowrap">{new Date(doc.date_issue).toLocaleDateString()}</td>
                        <td className="px-3 py-4 whitespace-nowrap truncate max-w-[200px]">{doc.name_seller}</td>
                        <td className="px-3 py-4 whitespace-nowrap">${doc.total.toLocaleString('es-CO')}</td>
                        <td className="px-3 py-4 whitespace-nowrap">${doc.total_tax.toLocaleString('es-CO')}</td>
                        <td className="px-3 py-4 whitespace-nowrap">${doc.total_discount.toLocaleString('es-CO')}</td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          {canAccept && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectItem(doc.id)}
                              disabled={processingAction || doc.aceptacion || doc.rechazo || doc.state_document_id === 0}
                              className={`text-red-600 hover:text-red-700 ${(doc.aceptacion || doc.rechazo || doc.state_document_id === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => handlePageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
            >
              Anterior
            </button>
            <span className="px-4 py-1 border-t border-b border-gray-300 bg-white text-gray-700">
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
            <button
              className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              onClick={() => handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Siguiente
            </button>
          </nav>
        </div>
      )}

      {/* Modal de Consultar Correos */}
      {showFetchModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Consultar Correos</h3>
              <button
                onClick={() => setShowFetchModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Inicial
                </label>
                <input
                  type="date"
                  value={fetchStartDate}
                  onChange={(e) => setFetchStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Final
                </label>
                <input
                  type="date"
                  value={fetchEndDate}
                  onChange={(e) => setFetchEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowFetchModal(false)}
                disabled={fetchingEmails}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleFetchEmails}
                disabled={fetchingEmails}
                className="flex items-center"
              >
                {fetchingEmails ? (
                  <>
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Inbox className="h-4 w-4 mr-2" />
                    Consultar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 