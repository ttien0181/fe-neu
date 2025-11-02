import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardIcon, CasesIcon, CategoriesIcon, FolderIcon, LogoutIcon } from '../components/ui';

const Logo = () => (
    <svg height="32" width="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#14b8a6" d="M24.2,2.3c-0.2,0-0.4,0-0.5,0c-0.3,0-0.5,0.1-0.8,0.2c-11.4,2.6-18.1,13.7-15.5,25.1c2,9,9.6,15.7,18.5,16.2c0.2,0,0.3,0,0.5,0c11.8-0.6,21.3-10.4,21.3-22.3C47.6,11.8,37.2,2.4,24.2,2.3z M24,43.3C14.7,43.3,7,35.5,7,26.3c0-8.2,5.9-15.1,13.9-16.5l15.8,15.8C35.6,33.5,29.9,34.2,24,43.3z M30.9,23.3L15.1,7.5c1.4-0.6,3-1,4.6-1.1c9.4-0.5,17.2,6.8,17.2,16.2C36.9,22.8,32,23.1,30.9,23.3z"/>
    </svg>
);

const Sidebar: React.FC = () => {
    const { user, isAdmin, logout } = useAuth();
    
    const navLinkClasses = "flex items-center gap-4 px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors";
    const activeNavLinkClasses = "bg-accent text-white";

    const navItems = [
        { to: "/app/dashboard", icon: <DashboardIcon />, label: "Dashboard" },
        { to: "/app/cases", icon: <CasesIcon />, label: "Cases" },
        { to: "/app/categories", icon: <CategoriesIcon />, label: "Categories" },
        { to: "/app/files", icon: <FolderIcon />, label: "Files" },
    ];

    return (
        <aside className="w-64 bg-primary text-white flex flex-col flex-shrink-0">
            <div className="h-20 flex items-center justify-center px-6 border-b border-gray-700">
                <Link to="/app/dashboard" className="flex items-center gap-3">
                    <Logo />
                    <span className="text-2xl font-bold">LegalFlow</span>
                </Link>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="px-4 py-6 border-t border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold">
                        {user?.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold">{user?.username}</p>
                        <p className="text-xs text-gray-400">{isAdmin ? 'Admin' : 'User'}</p>
                    </div>
                </div>
                <button 
                    onClick={logout} 
                    className="w-full flex items-center justify-center gap-3 px-4 py-2 text-gray-300 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                >
                    <LogoutIcon />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-background text-primary overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;