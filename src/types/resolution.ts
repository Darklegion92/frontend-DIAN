export interface TypeDocument {
  id: number;
  name: string;
  code?: string;
}

export interface Resolution {
  id: number;
  companyId: number;
  typeDocumentId: number;
  prefix: string;
  resolution: string;
  resolutionDate: string;
  technicalKey: string;
  from: number;
  to: number;
  dateFrom: string;
  dateTo: string;
  createdAt: string;
  updatedAt: string;
  typeDocument: TypeDocument;
}

export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResolutionResponse {
  data: Resolution[];
  meta: PaginationMeta;
}

export interface ResolutionQuery {
  companyId: number;
  page?: number;
  limit?: number;
} 