
import { APIResponse, AuthRequest, RegisterRequest, AuthResponse, CaseRequest, CaseResponse, CategoryRequest, CategoryResponse, PersonRequest, PersonResponse, CaseTagRequest, CaseTagResponse, CaseFileRequest, CaseFileResponse, AuditLogResponse } from '../types';

const BASE_URL = 'http://localhost:8080/legal-case-management/api';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('authToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (response.status === 204) {
    return null as T;
  }
  
  const data = await response.json();

  if (!response.ok) {
    const errorResponse = data as APIResponse<null>;
    const errorMessage = errorResponse.errors?.map(e => e.errorMessage).join(', ') || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }
  
  // Login response is not wrapped in APIResponse
  if (endpoint === '/auth/login') {
    return data as T;
  }

  const apiResponse = data as APIResponse<T>;
  if (apiResponse.status === 'SUCCESS' || apiResponse.status === 'OK') {
      return apiResponse.result;
  } else {
      const errorMessage = apiResponse.errors?.map(e => e.errorMessage).join(', ') || 'An unknown API error occurred.';
      throw new Error(errorMessage);
  }
}

// Auth
export const login = (credentials: AuthRequest): Promise<AuthResponse> => fetchApi<AuthResponse>('/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
});

export const register = (userData: RegisterRequest): Promise<string> => fetchApi<string>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
});

// Categories
export const getCategories = (): Promise<CategoryResponse[]> => fetchApi<CategoryResponse[]>('/categories');
export const getCategoryById = (id: number): Promise<CategoryResponse> => fetchApi<CategoryResponse>(`/categories/${id}`);
export const createCategory = (data: CategoryRequest): Promise<CategoryResponse> => fetchApi<CategoryResponse>('/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateCategory = (id: number, data: CategoryRequest): Promise<CategoryResponse> => fetchApi<CategoryResponse>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCategory = (id: number): Promise<null> => fetchApi<null>(`/categories/${id}`, { method: 'DELETE' });

// Cases
export const getCases = (): Promise<CaseResponse[]> => fetchApi<CaseResponse[]>('/cases');
export const getCaseById = (id: number): Promise<CaseResponse> => fetchApi<CaseResponse>(`/cases/${id}`);
export const createCase = (data: CaseRequest): Promise<CaseResponse> => fetchApi<CaseResponse>('/cases', { method: 'POST', body: JSON.stringify(data) });
export const updateCase = (id: number, data: CaseRequest): Promise<CaseResponse> => fetchApi<CaseResponse>(`/cases/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCase = (id: number): Promise<null> => fetchApi<null>(`/cases/${id}`, { method: 'DELETE' });

// Persons
export const getPersons = (): Promise<PersonResponse[]> => fetchApi<PersonResponse[]>('/persons');
export const getPersonById = (id: number): Promise<PersonResponse> => fetchApi<PersonResponse>(`/persons/${id}`);
export const createPerson = (data: PersonRequest): Promise<PersonResponse> => fetchApi<PersonResponse>('/persons', { method: 'POST', body: JSON.stringify(data) });
export const updatePerson = (id: number, data: PersonRequest): Promise<PersonResponse> => fetchApi<PersonResponse>(`/persons/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePerson = (id: number): Promise<null> => fetchApi<null>(`/persons/${id}`, { method: 'DELETE' });

// Case Tags
export const getCaseTags = (): Promise<CaseTagResponse[]> => fetchApi<CaseTagResponse[]>('/case-tags');
export const createCaseTag = (data: CaseTagRequest): Promise<CaseTagResponse> => fetchApi<CaseTagResponse>('/case-tags', { method: 'POST', body: JSON.stringify(data) });
export const updateCaseTag = (id: number, data: CaseTagRequest): Promise<CaseTagResponse> => fetchApi<CaseTagResponse>(`/case-tags/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCaseTag = (id: number): Promise<null> => fetchApi<null>(`/case-tags/${id}`, { method: 'DELETE' });

// Case Files
export const getCaseFiles = (): Promise<CaseFileResponse[]> => fetchApi<CaseFileResponse[]>('/casefiles');
export const createCaseFile = (data: CaseFileRequest): Promise<CaseFileResponse> => fetchApi<CaseFileResponse>('/casefiles', { method: 'POST', body: JSON.stringify(data) });
export const deleteCaseFile = (id: number): Promise<null> => fetchApi<null>(`/casefiles/${id}`, { method: 'DELETE' });

// Audit Logs
export const getAuditLogs = (): Promise<AuditLogResponse[]> => fetchApi<AuditLogResponse[]>('/auditlogs');
