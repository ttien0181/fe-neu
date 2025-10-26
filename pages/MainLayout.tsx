
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();
  const navLinkClasses = "flex items-center px-4 py-2.5 text-gray-400 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200";
  const activeNavLinkClasses = "bg-gray-700 text-white";

  return (
    <aside className="w-64 bg-gray-800 flex flex-col p-4 border-r border-gray-700">
      <div className="text-2xl font-bold text-white mb-8">LegalSys</div>
      <nav className="flex-1 flex flex-col gap-2">
        <NavLink to="/dashboard" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Dashboard</NavLink>
        <NavLink to="/cases" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Cases</NavLink>
        <NavLink to="/categories" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Categories</NavLink>
        <NavLink to="/persons" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Persons</NavLink>
      </nav>
      <div className="mt-auto">
        <div className="text-sm text-gray-400">Signed in as</div>
        <div className="font-semibold text-white">{user?.username} ({isAdmin ? 'Admin' : 'User'})</div>
      </div>
    </aside>
  );
}

const Header = () => {
  const { logout } = useAuth();
  return (
    <header className="bg-gray-800 p-4 flex justify-end items-center border-b border-gray-700">
        <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
            Logout
        </button>
    </header>
  );
}

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
