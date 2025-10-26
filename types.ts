
export interface APIResponse<T> {
  status: 'SUCCESS' | 'FAILURE' | string;
  result: T;
  errors?: ErrorDetail[];
}

export interface ErrorDetail {
  field: string;
  errorMessage: string;
  timestamp: string;
}

// Auth
export interface AuthRequest {
  username?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
}

export interface RegisterRequest {
  username?: string;
  password?: string;
}

export interface DecodedToken {
  sub: string;
  roles: string[];
  iat: number;
  exp: number;
  userId: number; // Added userId
}


// Category
export interface CategoryRequest {
  name: string;
  description?: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
}

// Case
export interface CaseRequest {
  caseName: string;
  caseDescription?: string;
  status?: string;
  courtName?: string;
  location?: string;
  categoryId?: number;
}

export interface CaseResponse {
  id: number;
  caseName: string;
  caseDescription: string;
  status: string;
  courtName: string;
  location: string;
  categoryId: number;
}

// Person
export enum PersonRole {
  PLAINTIFF = 'plaintiff',
  DEFENDANT = 'defendant',
  LAWYER = 'lawyer',
}

export interface PersonRequest {
  name: string;
  role: PersonRole;
  contactInfo?: string;
}

export interface PersonResponse {
  id: number;
  name: string;
  role: PersonRole;
  contactInfo: string;
}

// CaseTag
export interface CaseTagRequest {
  tagName: string;
}

export interface CaseTagResponse {
  id: number;
  tagName: string;
}

// CaseFile
export interface CaseFileRequest {
  caseId: number;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedBy?: number; // Optional as backend might infer from token
}

export interface CaseFileResponse {
  id: number;
  caseId: number;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedBy: number;
}

// AuditLog
export interface AuditLogRequest {
  userId: number;
  action: string;
  caseId?: number;
  fileId?: number;
}

export interface AuditLogResponse {
  id: number;
  userId: number;
  action: string;
  caseId: number | null;
  fileId: number | null;
  createdAt: string; // Timestamp string
}