import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardIcon, CasesIcon, CategoriesIcon, FolderIcon, LogoutIcon, HamburgerIcon, ChevronDownIcon } from '../components/ui';

const Logo = () => (
    <svg height="32" width="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#14b8a6" d="M24.2,2.3c-0.2,0-0.4,0-0.5,0c-0.3,0-0.5,0.1-0.8,0.2c-11.4,2.6-18.1,13.7-15.5,25.1c2,9,9.6,15.7,18.5,16.2c0.2,0,0.3,0,0.5,0c11.8-0.6,21.3-10.4,21.3-22.3C47.6,11.8,37.2,2.4,24.2,2.3z M24,43.3C14.7,43.3,7,35.5,7,26.3c0-8.2,5.9-15.1,13.9-16.5l15.8,15.8C35.6,33.5,29.9,34.2,24,43.3z M30.9,23.3L15.1,7.5c1.4-0.6,3-1,4.6-1.1c9.4-0.5,17.2,6.8,17.2,16.2C36.9,22.8,32,23.1,30.9,23.3z"/>
    </svg>
);

const navItems = [
    { to: "/app/dashboard", icon: <DashboardIcon />, label: "Dashboard" },
    { to: "/app/cases", icon: <CasesIcon />, label: "Cases" },
    { to: "/app/categories", icon: <CategoriesIcon />, label: "Categories" },
    { to: "/app/files", icon: <FolderIcon />, label: "Files" },
];

const MainLayout: React.FC = () => {
    const { user, isAdmin, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const navLinkClasses = "flex items-center gap-2 px-3 py-2 text-secondary rounded-md hover:bg-background hover:text-primary transition-colors font-medium";
    const activeNavLinkClasses = "bg-teal-50 text-accent";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const UserMenu = () => (
      <div className="relative" ref={profileMenuRef}>
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-2 text-left p-2 rounded-lg hover:bg-background"
        >
          <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="font-semibold text-sm">{user?.username}</p>
            <p className="text-xs text-secondary">{isAdmin ? 'Admin' : 'User'}</p>
          </div>
          <ChevronDownIcon />
        </button>
        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg border border-border z-50">
            <div className="py-1">
              <button
                onClick={logout}
                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-background"
              >
                <LogoutIcon />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link to="/app/dashboard" className="flex items-center gap-3">
                <Logo />
                <span className="hidden sm:block text-xl font-bold text-primary">Binh An Law</span>
              </Link>
              <nav className="hidden lg:flex lg:ml-10 lg:space-x-4">
                {navItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-2">
                <UserMenu />
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 rounded-md text-secondary hover:bg-background"
                >
                    <HamburgerIcon />
                </button>
            </div>
          </div>
        </div>
        
        {isMobileMenuOpen && (
            <div className="lg:hidden bg-surface border-t border-border">
                <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) => `block ${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                        >
                           {item.icon} <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        )}
      </header>
      
      <main className="pt-20">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;