import { APIResponse, AuthRequest, RegisterRequest, AuthResponse, CaseRequest, CaseResponse, CategoryRequest, CategoryResponse, PersonRequest, PersonResponse, CaseTagRequest, CaseTagResponse, CaseFileRequest, CaseFileResponse, AuditLogRequest, AuditLogResponse, SendVerificationCodeRequest, UserResponse, ForgotPasswordRequest, ResetPasswordRequest, QuestionRequest, QuestionResponse, CasePersonRequest, CasePersonResponse, AppointmentRequest, AppointmentResponse } from '../types';

export const BASE_URL = 'http://localhost:8080/legal-case-management/api';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('authToken');
  const headers: HeadersInit = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type for FormData, browser does it automatically with boundary
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  
  console.log("DEBUG upload endpoint:", endpoint);
  console.log("DEBUG upload headers:", headers);
  console.log("DEBUG upload body type:", options.body instanceof FormData ? 'FormData' : typeof options.body);


  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body,
  });

  if (response.status === 204) {
    return null as T;
  }
  
  const data = await response.json();

  if (!response.ok) {
    const errorResponse = data as APIResponse<null>;
    const errorMessage = errorResponse.errors?.map(e => e.errorMessage).join(', ') || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
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

export const sendVerificationCode = (data: SendVerificationCodeRequest): Promise<string> => 
    fetchApi<string>('/auth/send-verification-code', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const register = (userData: RegisterRequest): Promise<UserResponse> => 
    fetchApi<UserResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });

export const sendPasswordResetCode = (data: ForgotPasswordRequest): Promise<string> => 
    fetchApi<string>('/auth/forgot-password/send-code', {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const resetPassword = (data: ResetPasswordRequest): Promise<string> =>
    fetchApi<string>('/auth/forgot-password/reset', {
        method: 'POST',
        body: JSON.stringify(data),
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
export const createCaseFile = (data: FormData): Promise<CaseFileResponse> => fetchApi<CaseFileResponse>('/casefiles', { method: 'POST', body: data });
export const updateCaseFile = (id: number, data: Partial<CaseFileRequest>): Promise<CaseFileResponse> => fetchApi<CaseFileResponse>(`/casefiles/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCaseFile = (id: number): Promise<null> => fetchApi<null>(`/casefiles/${id}`, { method: 'DELETE' });

// Audit Logs
export const getAuditLogs = (): Promise<AuditLogResponse[]> => fetchApi<AuditLogResponse[]>('/auditlogs');
export const createAuditLog = (data: AuditLogRequest): Promise<AuditLogResponse> => fetchApi<AuditLogResponse>('/auditlogs', { method: 'POST', body: JSON.stringify(data) });

// Questions
export const createQuestion = (data: QuestionRequest): Promise<QuestionResponse> => fetchApi<QuestionResponse>('/questions', { method: 'POST', body: JSON.stringify(data) });
export const answerQuestion = (id: number, answer: string): Promise<QuestionResponse> => fetchApi<QuestionResponse>(`/questions/${id}/answer?answer=${encodeURIComponent(answer)}`, { method: 'PUT' });
export const getAllQuestions = (): Promise<QuestionResponse[]> => fetchApi<QuestionResponse[]>('/questions');
export const getQuestionsByUser = (userId: number): Promise<QuestionResponse[]> => fetchApi<QuestionResponse[]>(`/questions/user/${userId}`);

// Case Persons
export const getCasePersons = (): Promise<CasePersonResponse[]> => fetchApi<CasePersonResponse[]>('/case-persons');
export const createCasePerson = (data: CasePersonRequest): Promise<CasePersonResponse> => fetchApi<CasePersonResponse>('/case-persons', { method: 'POST', body: JSON.stringify(data) });
export const deleteCasePerson = (caseId: number, personId: number): Promise<null> => fetchApi<null>(`/case-persons/${caseId}/${personId}`, { method: 'DELETE' });

// Appointments
export const createAppointment = (data: AppointmentRequest): Promise<AppointmentResponse> => fetchApi<AppointmentResponse>('/appointments', { method: 'POST', body: JSON.stringify(data) });
export const getAllAppointments = (): Promise<AppointmentResponse[]> => fetchApi<AppointmentResponse[]>('/appointments');
export const updateAppointmentStatus = (id: number, status: string): Promise<AppointmentResponse> => fetchApi<AppointmentResponse>(`/appointments/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PUT' });
