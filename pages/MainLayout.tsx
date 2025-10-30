import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AppHeader = () => {
  const { user, isAdmin, logout } = useAuth();
  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-secondary hover:bg-background hover:text-primary transition-colors";
  const activeNavLinkClasses = "bg-background text-primary";

  const Logo = () => (
    <svg height="24" width="24" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#14b8a6" d="M24.2,2.3c-0.2,0-0.4,0-0.5,0c-0.3,0-0.5,0.1-0.8,0.2c-11.4,2.6-18.1,13.7-15.5,25.1c2,9,9.6,15.7,18.5,16.2c0.2,0,0.3,0,0.5,0c11.8-0.6,21.3-10.4,21.3-22.3C47.6,11.8,37.2,2.4,24.2,2.3z M24,43.3C14.7,43.3,7,35.5,7,26.3c0-8.2,5.9-15.1,13.9-16.5l15.8,15.8C35.6,33.5,29.9,34.2,24,43.3z M30.9,23.3L15.1,7.5c1.4-0.6,3-1,4.6-1.1c9.4-0.5,17.2,6.8,17.2,16.2C36.9,22.8,32,23.1,30.9,23.3z"/>
    </svg>
  );

  return (
    <header className="bg-surface border-b border-border">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-xl font-bold text-primary">
            <Logo />
            <span>LegalFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-4">
            <NavLink to="/app/dashboard" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Dashboard</NavLink>
            <NavLink to="/app/cases" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Cases</NavLink>
            <NavLink to="/app/categories" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Categories</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold text-primary">{user?.username}</div>
            <div className="text-xs text-secondary">{isAdmin ? 'Admin' : 'User'}</div>
          </div>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="container mx-auto px-6 py-4 text-center text-sm text-secondary">
        &copy; {new Date().getFullYear()} LegalFlow App.
      </div>
    </footer>
);


const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-background text-primary">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="container mx-auto">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;