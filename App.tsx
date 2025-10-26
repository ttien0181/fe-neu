
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import MainLayout from './pages/MainLayout';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import CategoriesPage from './pages/CategoriesPage';
import PersonsPage from './pages/PersonsPage';
import CaseTagsPage from './pages/CaseTagsPage';
import CaseFilesPage from './pages/CaseFilesPage';
import AuditLogsPage from './pages/AuditLogsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="cases" element={<CasesPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="persons" element={<PersonsPage />} />
            <Route path="case-tags" element={<CaseTagsPage />} />
            <Route path="case-files" element={<CaseFilesPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
