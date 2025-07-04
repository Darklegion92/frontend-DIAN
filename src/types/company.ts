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
  imapServer?: string | null;
  imapPort?: string | null;
  imapUser?: string | null;
  imapPassword?: string | null;
  imapEncryption?: string | null;
  soltecUserId: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
  certificateExpirationDate?: string;
  certificateId?: number;
  certificateName?: string;
  tokenDian?: string;
  usuarioDian?: string;
  userEmail?: string;
  mailHost?: string;
  mailPort?: string;
  mailUsername?: string;
  mailPassword?: string;
  mailEncryption?: string;
  mailFromAddress?: string;
  mailFromName?: string;
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