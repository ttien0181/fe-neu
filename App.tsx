import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, NavLink, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import MainLayout from './pages/MainLayout';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import CategoriesPage from './pages/CategoriesPage';
import PersonsPage from './pages/PersonsPage';
import LandingPage from './pages/AuditLogsPage'; // Repurposed as LandingPage
import RegisterPage from './pages/CaseTagsPage'; // Repurposed as RegisterPage
import CaseFilesPage from './pages/CaseFilesPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

const Logo = () => (
  <svg height="24" width="24" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#14b8a6" d="M24.2,2.3c-0.2,0-0.4,0-0.5,0c-0.3,0-0.5,0.1-0.8,0.2c-11.4,2.6-18.1,13.7-15.5,25.1c2,9,9.6,15.7,18.5,16.2c0.2,0,0.3,0,0.5,0c11.8-0.6,21.3-10.4,21.3-22.3C47.6,11.8,37.2,2.4,24.2,2.3z M24,43.3C14.7,43.3,7,35.5,7,26.3c0-8.2,5.9-15.1,13.9-16.5l15.8,15.8C35.6,33.5,29.9,34.2,24,43.3z M30.9,23.3L15.1,7.5c1.4-0.6,3-1,4.6-1.1c9.4-0.5,17.2,6.8,17.2,16.2C36.9,22.8,32,23.1,30.9,23.3z"/>
  </svg>
);


const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
        <Logo />
        <span>LegalFlow</span>
      </Link>
      <nav className="hidden md:flex items-center space-x-8">
        <NavLink to="/" className={({ isActive }) => `text-secondary hover:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}>Home</NavLink>
        <NavLink to="/about" className={({ isActive }) => `text-secondary hover:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}>About</NavLink>
      </nav>
      <div className="flex items-center gap-2">
        <Link to="/login" className="px-4 py-2 rounded-lg text-primary hover:bg-background transition-colors duration-300">
          Log in
        </Link>
        <Link to="/register" className="px-4 py-2 rounded-lg text-white bg-accent hover:bg-accent-hover transition-colors duration-300">
          Register
        </Link>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-surface border-t border-border">
    <div className="container mx-auto px-6 py-8 text-center text-secondary">
      <p>&copy; {new Date().getFullYear()} LegalFlow. All rights reserved.</p>
      <p className="mt-2 text-sm">Modernizing Legal Case Management.</p>
    </div>
  </footer>
);

const PublicLayout = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);


function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<PersonsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="cases" element={<CasesPage />} />
            <Route path="cases/:caseId" element={<CasesPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="categories/:categoryId" element={<CategoriesPage />} />
            <Route path="files" element={<CaseFilesPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;