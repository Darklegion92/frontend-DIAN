import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface TestDocumentResult {
  index: number;
  number: string | number;
  accepted: boolean;
  cufe?: string;
  error?: string;
}

export interface GenerateTestInvoiceResult {
  allAccepted: boolean;
  totalDocuments: number;
  acceptedCount: number;
  invoices: TestDocumentResult[];
  creditNotes: TestDocumentResult[];
  message: string;
}

export const invoiceService = {
  /**
   * Envía 5 facturas y 5 notas crédito de prueba a apidian.
   * @param testId - Test id de la empresa
   */
  async generateTestInvoice(testId: string): Promise<GenerateTestInvoiceResult> {
    const response = await apiClient.post<GenerateTestInvoiceResult>('/invoice/generate-test-invoice', {
      testId: testId.trim(),
    });
    return response.data;
  },
};
