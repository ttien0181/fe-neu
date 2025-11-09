

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
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface AuthRequest {
  email?: string;
  password?: string;
}

export interface AuthResponse extends User {
  token: string;
}


export interface RegisterRequest {
  username?: string;
  email?: string;
  password?: string;
  verificationCode?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface SendVerificationCodeRequest {
  email: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    newPassword: string;
    verificationCode: string;
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
  createdAt: string;
  updatedAt: string;
}

// Person
export interface PersonRequest {
  name: string;
  role: string;
  contactInfo?: string;
}

export interface PersonResponse {
  id: number;
  name: string;
  role: string;
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

// Question
export interface QuestionRequest {
  idQuestioner: number;
  idLawyerPerson: number;
  caseId?: number | null;
  content: string;
}

export interface QuestionResponse {
  id: number;
  content: string;
  answer: string | null;
  questionerId: number;
  questionerName: string;
  lawyerId: number;
  lawyerName: string;
  lawyerEmail: string;
  caseName: string | null;
  createdAt: string;
  updatedAt: string;
}

// CasePerson
export interface CasePersonRequest {
  caseId: number;
  personId: number;
}

export interface CasePersonResponse {
  caseId: number;
  personId: number;
}

// Appointment
export interface AppointmentRequest {
  userId: number;
  lawyerId: number;
  appointmentTime: string; // Format "YYYY-MM-DDTHH:mm" for datetime-local input
  notes?: string;
}

export interface AppointmentResponse {
  id: number;
  userName: string;
  lawyerName: string;
  lawyerRole: string;
  lawyerEmail: string;
  appointmentTime: string; // Format "yyyy-MM-dd HH:mm:ss" from backend
  notes: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}