
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
