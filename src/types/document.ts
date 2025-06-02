export interface Document {
  id: number;
  identificationNumber: string;
  stateDocumentId: number;
  typeDocumentId: number;
  customer: string;
  prefix: string;
  number: string;
  xml: string;
  cufe: string;
  typeInvoiceId: number | null;
  clientId: string;
  client: {
    dv: number;
    name: string;
    email: string;
    phone: string;
    tax_id: number;
    address: string;
    type_regime_id: number;
    municipality_id: number;
    type_liability_id: number;
    type_organization_id: number;
    identification_number: string;
    merchant_registration: string;
    type_document_identification_id: number;
  };
  currencyId: number;
  dateIssue: string;
  referenceId: number | null;
  noteConceptId: number | null;
  sale: number;
  totalDiscount: number;
  taxes: Array<{
    tax_id: number;
    percent: number;
    tax_amount: number;
    taxable_amount: number;
  }>;
  totalTax: number;
  subtotal: number;
  total: number;
  versionUblId: number;
  ambientId: number;
  requestApi: any;
  responseApi: any;
  responseDian: any;
  pdf: string;
  aceptacion: number;
  sendEmailSuccess: number;
  sendEmailDateTime: string | null;
  cudeAceptacion: string | null;
  payloadAceptacion: any;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface DocumentPaginationMeta {
  current_page: number;
  documents: Document[];
  first_page_url?: string;
  from: number;
  last_page: number;
  last_page_url?: string;
  links?: PaginationLink[];
  next_page_url?: string | null;
  path?: string;
  per_page: number;
  prev_page_url?: string | null;
  to: number;
  total: number;
}

export interface DocumentResponse {
  success: boolean;
  message: string;
  data: DocumentPaginationMeta;
}

export interface DocumentQuery {
  created_at_from?: string;
  created_at_to?: string;
  prefix?: string;
  number?: string;
  identification_number?: string;
  type_document_id?: number;
  page?: number;
  per_page?: number;
} 