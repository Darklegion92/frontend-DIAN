// Tipos para Software
export interface Software {
  id: number;
  identifier: string;
  pin: string;
  identifier_payroll: string;
  pin_payroll: string;
  identifier_eqdocs: string;
  pin_eqdocs: string;
  url: string;
  url_payroll: string;
  url_eqdocs: string;
  created_at: string;
  updated_at: string;
}

// DTO para crear software
export interface CreateSoftwareDto {
  id: string;
  pin: number;
  token: string;
}

// Respuesta del servicio de software
export interface SoftwareResponse {
  success: boolean;
  message: string;
  software: Software;
}

// Datos del formulario de creación de software
export interface SoftwareFormData {
  softwareId: string;
  pin: number;
} 