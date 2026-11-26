import api from '../config/api';

export interface TestPayrollDocumentResult {
  index: number;
  number: string;
  accepted: boolean;
  cune?: string;
  zipKey?: string;
  predecessorNumber?: string;
  error?: string;
}

export interface GenerateTestPayrollResult {
  allAccepted: boolean;
  totalDocuments: number;
  acceptedCount: number;
  switchedToProduction: boolean;
  productionError?: string;
  payrolls: TestPayrollDocumentResult[];
  adjustNotes: TestPayrollDocumentResult[];
  message: string;
}

export const payrollService = {
  /**
   * Envía automáticamente 4 nóminas individuales y 4 notas de ajuste (eliminación)
   * al set de pruebas de la DIAN y pasa Nómina Electrónica a producción si todas son aceptadas.
   * Se asigna timeout de 15 minutos (900000 ms) para soportar el ciclo asíncrono de la DIAN sin desconexión.
   */
  async generateTestPayroll(
    nit: string,
    testId: string,
  ): Promise<GenerateTestPayrollResult> {
    const response = await api.post<GenerateTestPayrollResult>(
      '/payroll/generate-test-payroll',
      {
        nit: nit.trim(),
        testId: testId.trim(),
      },
      {
        timeout: 900000, // 15 minutos
      },
    );
    return response.data;
  },
};
