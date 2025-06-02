export interface Company {
  id: number;
  identificationNumber: string;
  dv: string;
  typeDocumentIdentificationId: number;
  typeOrganizationId: number;
  languageId: number;
  taxId: number;
  typeOperationId: number;
  typeRegimeId: number;
  typeLiabilityId: number;
  municipalityId: number;
  typeEnvironmentId: number;
  payrollTypeEnvironmentId?: number;
  eqdocsTypeEnvironmentId?: number;
  address: string;
  phone: string;
  merchantRegistration: string;
  state: boolean;
  password?: string;
  allowSellerLogin: boolean;
  imapServer?: string;
  imapPort?: string;
  imapUser?: string;
  imapPassword?: string;
  imapEncryption?: string;
  soltecUserId: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
  certificateExpirationDate?: string;
  certificateId?: number;
  certificateName?: string;
  tokenDian?: string;
}

export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  dato?: string;
} 