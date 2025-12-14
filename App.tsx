

import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, NavLink, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import MainLayout from './pages/MainLayout';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import CategoriesPage from './pages/CategoriesPage';
import AboutPage from './pages/AboutPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LawyersPage from './pages/LawyersPage';
import PersonsPage from './pages/PersonsPage';
import QuestionsPage from './pages/QuestionsPage';
import MyQuestionsPage from './pages/MyQuestionsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import ReportsPage from './pages/ReportsPage';

const Logo = ({ className = 'h-6 w-6', color = '#4f46e5' }) => (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill={color} d="M24.2,2.3c-0.2,0-0.4,0-0.5,0c-0.3,0-0.5,0.1-0.8,0.2c-11.4,2.6-18.1,13.7-15.5,25.1c2,9,9.6,15.7,18.5,16.2c0.2,0,0.3,0,0.5,0c11.8-0.6,21.3-10.4,21.3-22.3C47.6,11.8,37.2,2.4,24.2,2.3z M24,43.3C14.7,43.3,7,35.5,7,26.3c0-8.2,5.9-15.1,13.9-16.5l15.8,15.8C35.6,33.5,29.9,34.2,24,43.3z M30.9,23.3L15.1,7.5c1.4-0.6,3-1,4.6-1.1c9.4-0.5,17.2,6.8,17.2,16.2C36.9,22.8,32,23.1,30.9,23.3z"/>
    </svg>
);


const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
        <Logo />
        <span>Binh An Law</span>
      </Link>
      <nav className="hidden md:flex items-center space-x-8">
        <NavLink to="/" className={({ isActive }) => `text-secondary hover:text-primary transition-colors ${isActive ? 'text-primary font-semibold' : ''}`}>About</NavLink>
      </nav>
      <div className="flex items-center gap-2">
        <Link to="/login" className="px-4 py-2 rounded-lg text-black bg-background border border-gray hover:secondary-accent-hover transition-colors duration-300 font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-px">
          Log in
        </Link>
        <Link to="/register" className="px-4 py-2 rounded-lg text-white bg-accent hover:bg-accent-hover transition-colors duration-300 font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-px">
          Register
        </Link>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-primary text-gray-300">
    <div className="container mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <div className="mb-6 lg:mb-0 col-span-1 md:col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-white">
            <Logo className="h-8 w-8" color="#FFFFFF" />
            <span>Binh An Law</span>
          </Link>
          <p className="mt-4">Văn phòng Luật sư Quốc tế Bình An</p>
        </div>
        <div>
          <h3 className="font-semibold text-white uppercase tracking-wider mb-4">Thông tin pháp lý</h3>
          <p className="mb-1"><strong className="font-medium text-gray-100">Ngày cấp phép:</strong> 20/04/2011</p>
          <p><strong className="font-medium text-gray-100">Cơ quan cấp:</strong> Sở Tư pháp TP. Hà Nội</p>
        </div>
        <div>
          <h3 className="font-semibold text-white uppercase tracking-wider mb-4">Địa chỉ</h3>
          <p className="mb-2"><strong className="font-medium text-gray-100">Trụ sở:</strong> 2/532 Ngọc Thụy, Tổ 19, phường Ngọc Thụy, Long Biên, TP. Hà Nội</p>
          <p><strong className="font-medium text-gray-100">VPGD:</strong> Số 13 ngõ Hàng Bột, phường Cát Linh, quận Đống Đa, TP. Hà Nội</p>
        </div>
        <div>
          <h3 className="font-semibold text-white uppercase tracking-wider mb-4">Liên hệ</h3>
          <p className="mb-1">Tel: 04 22404068</p>
          <p className="mb-1">Fax: 0437877913</p>
          <p>Email: luatbinhan@gmail.com</p>
        </div>
      </div>
      <div className="mt-10 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} Binh An Law. All rights reserved.</p>
      </div>
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
            <Route path="/" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
            <Route path="persons" element={<PersonsPage />} />
            <Route path="persons/:personId" element={<PersonsPage />} />
            <Route path="lawyers" element={<LawyersPage />} />
            <Route path="lawyers/:lawyerId" element={<LawyersPage />} />
            <Route path="questions" element={<QuestionsPage />} />
            <Route path="questions/:questionId" element={<QuestionsPage />} />
            <Route path="my-questions" element={<MyQuestionsPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="appointments/:appointmentId" element={<AppointmentsPage />} />
            <Route path="my-appointments" element={<MyAppointmentsPage />} />
            <Route path="reports" element={
                <ProtectedRoute adminOnly>
                    <ReportsPage />
                </ProtectedRoute>
            } />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
