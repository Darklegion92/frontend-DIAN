import React, { useState, useEffect } from 'react';
import { Inbox, Filter, X, Search, Calendar, User, Hash, Check, XCircle, ExternalLink } from 'lucide-react';
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
  identification_number?: string;
  customer?: string;
  customer_name?: string;
  prefix?: string;
  number?: string;
  cufe?: string;
  min_total?: number;
  max_total?: number;
  startDate?: string;
  endDate?: string;
  ambient_id?: number;
  acu_recibo?: boolean;
  rec_bienes?: boolean;
  aceptacion?: number;
  rechazo?: boolean;
  page?: number;
  limit?: number;
}

interface ApiResponse {
    items: Radian[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const ReceivedDocumentsList: React.FC = () => {
  const [radianes, setRadianes] = useState<Radian[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<RadianQuery>({
    identification_number: '',
    customer: '',
    customer_name: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10,
    aceptacion: undefined
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
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvProcessing, setCsvProcessing] = useState(false);
  const [csvResults, setCsvResults] = useState<{success: number, errors: string[]} | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    loadRadianes();
    // eslint-disable-next-line
  }, [filters.page, filters.limit]);

  const loadRadianes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: RadianQuery = {
        customer: user?.role !== 'ADMIN' ? user?.company_document : '',
        identification_number: filters.identification_number,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: filters.page,
        limit: filters.limit,
        aceptacion: filters.aceptacion
      };

      console.log('Cargando con parámetros:', params);

      const response = await api.get<ApiResponse>('/received-documents', { params });
      if (Array.isArray(response.data.items)) {
        setRadianes(response.data.items);
        setPagination({
          currentPage: response.data.page,
          totalPages: response.data.totalPages,
          totalItems: response.data.total,
          itemsPerPage: response.data.limit,
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
      identification_number: '',
      customer: '',
      customer_name: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10,
      aceptacion: undefined
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

      if (response.data.data?.length > 0) {
        setFetchEmailsMsg("Se encontraron " + response.data.data?.length + " facturas.");
      } else {
        setFetchEmailsMsg(response.data?.message);
      }
      await loadRadianes();
      setShowFetchModal(false);
    } catch (err: any) {
      console.log(err);
      setFetchEmailsMsg(err.response?.message || 'Error al consultar correos.');
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

  const handleGoToDIAN = (cufe: string) => {
    const dianUrl = `https://catalogo-vpfe.dian.gov.co/document/searchqr?documentkey=${cufe}`;
    window.open(dianUrl, '_blank');
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Math.min(500, Math.max(10, parseInt(e.target.value)));
    setFilters(prev => ({ ...prev, limit: value, page: 1 }));
    loadRadianes();
  };

  // Función para procesar archivo CSV y extraer datos de una columna
  const processCsvFile = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const lines = csvText.split('\n');
          const dataArray: string[] = [];
          
          // Procesar cada línea del CSV
          lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
              // Dividir por comas y tomar el primer elemento (primera columna)
              const columns = trimmedLine.split(',');
              const firstColumn = columns[0]?.trim();
              
              if (firstColumn && firstColumn.length > 10 && /^[A-Za-z0-9]+$/.test(firstColumn)) {
                dataArray.push(firstColumn);
              }
            }
          });
          
          resolve(dataArray);
        } catch (error) {
          reject(new Error('Error al procesar el archivo CSV: ' + error));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  };

  // Función para manejar la carga del archivo CSV
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };

  // Función para procesar CUFEs del CSV y ejecutar aceptación
  const handleProcessCsvFile = async () => {
    if (!csvFile) return;
    
    setCsvProcessing(true);
    setCsvResults(null);
    
    try {
      const cufes = await processCsvFile(csvFile);
      
      if (cufes.length === 0) {
        setCsvResults({
          success: 0,
          errors: ['No se encontraron CUFEs válidos en el archivo CSV']
        });
        return;
      }

      // Ejecutar el mismo proceso que handleAcceptSelected pero con los CUFEs del CSV
      await api.post('/received-documents/send-event', cufes);
      
      setCsvResults({
        success: cufes.length,
        errors: []
      });
      
      setFetchEmailsMsg(`${cufes.length} documentos procesados correctamente desde el archivo CSV.`);
      await loadRadianes();
      
    } catch (err: any) {
      setCsvResults({
        success: 0,
        errors: [err.response?.data?.message || 'Error al procesar el archivo CSV']
      });
    } finally {
      setCsvProcessing(false);
    }
  };

  // Función para abrir el modal de carga CSV
  const openCsvModal = () => {
    setCsvFile(null);
    setCsvResults(null);
    setShowCsvModal(true);
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
            variant="secondary"
            onClick={openCsvModal}
            disabled={csvProcessing}
            className="flex items-center"
          >
            <Hash className="h-4 w-4 mr-2 flex-shrink-0" />
            Cargar CSV
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
              {/* NIT Vendedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIT Vendedor</label>
                <input
                  type="text"
                  value={filters.identification_number}
                  onChange={(e) => handleFilterChange('identification_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  disabled={loading}
                />
              </div>
              {/* Fecha Desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  disabled={loading}
                />
              </div>
              {/* Fecha Hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
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
                          <div className="flex space-x-2">
                            <div title="Ver en DIAN">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGoToDIAN(doc.cufe)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                            {canAccept && (
                              <div title="Rechazar documento">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejectItem(doc.id)}
                                  disabled={processingAction || doc.aceptacion || doc.rechazo || doc.state_document_id === 0}
                                  className={`text-red-600 hover:text-red-700 ${(doc.aceptacion || doc.rechazo || doc.state_document_id === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
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
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
          <div className="flex items-center space-x-2">
            <label htmlFor="perPage" className="text-sm text-gray-700">
              Registros por página:
            </label>
            <select
              id="perPage"
              value={filters.limit}
              onChange={handlePerPageChange}
              className="rounded-md border-gray-300 text-sm focus:ring-soltec-primary focus:border-soltec-primary"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="500">500</option>
            </select>
          </div>
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

      {/* Modal de Cargar CSV */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Cargar Archivo CSV</h3>
              <button
                onClick={() => setShowCsvModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar archivo CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-soltec-primary focus:border-soltec-primary"
                  disabled={csvProcessing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  El archivo debe contener CUFEs en la primera columna
                </p>
              </div>
              
              {csvFile && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Archivo seleccionado:</strong> {csvFile.name}
                  </p>
                </div>
              )}

              {csvResults && (
                <div className={`p-3 rounded-md ${csvResults.success > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className={`text-sm font-medium ${csvResults.success > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {csvResults.success > 0 
                      ? `✅ ${csvResults.success} documentos procesados correctamente`
                      : '❌ Error al procesar el archivo'
                    }
                  </p>
                  {csvResults.errors.length > 0 && (
                    <ul className="mt-2 text-xs text-red-600">
                      {csvResults.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCsvModal(false)}
                disabled={csvProcessing}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleProcessCsvFile}
                disabled={csvProcessing || !csvFile}
                className="flex items-center"
              >
                {csvProcessing ? (
                  <>
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Hash className="h-4 w-4 mr-2" />
                    Procesar CSV
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