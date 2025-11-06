



import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardIcon, CasesIcon, CategoriesIcon, PeopleIcon, LogoutIcon, HamburgerIcon, ChevronDownIcon, UsersIcon, BellIcon, ChatBubbleIcon } from '../components/ui';
import * as api from '../services/apiService';
import { QuestionResponse } from '../types';

const Logo = () => (
    <svg height="32" width="32" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4f46e5" d="M24.2,2.3c-0.2,0-0.4,0-0.5,0c-0.3,0-0.5,0.1-0.8,0.2c-11.4,2.6-18.1,13.7-15.5,25.1c2,9,9.6,15.7,18.5,16.2c0.2,0,0.3,0,0.5,0c11.8-0.6,21.3-10.4,21.3-22.3C47.6,11.8,37.2,2.4,24.2,2.3z M24,43.3C14.7,43.3,7,35.5,7,26.3c0-8.2,5.9-15.1,13.9-16.5l15.8,15.8C35.6,33.5,29.9,34.2,24,43.3z M30.9,23.3L15.1,7.5c1.4-0.6,3-1,4.6-1.1c9.4-0.5,17.2,6.8,17.2,16.2C36.9,22.8,32,23.1,30.9,23.3z"/>
    </svg>
);



const NotificationBell = () => {
    const { user, isLawyer, lawyerPersonId } = useAuth();
    const [notifications, setNotifications] = useState<QuestionResponse[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                if (isLawyer && lawyerPersonId) {
                    const allQuestions = await api.getAllQuestions();
                    const lawyerQuestions = allQuestions.filter(q => q.lawyerId === lawyerPersonId && q.answer === null);
                    setNotifications(lawyerQuestions);
                } else {
                    const userQuestions = await api.getQuestionsByUser(user.id);
                    // Simple notification: just show answered questions
                    const answered = userQuestions.filter(q => q.answer !== null);
                    setNotifications(answered);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);

    }, [user, isLawyer, lawyerPersonId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationLink = (q: QuestionResponse) => {
      return isLawyer ? `/app/questions/${q.id}` : '/app/my-questions';
    }
    
    const getNotificationText = (q: QuestionResponse) => {
        return isLawyer ? `New question from ${q.questionerName}` : `Your question to ${q.lawyerName} has been answered.`;
    }

    return (
        <div className="relative" ref={bellRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 rounded-full text-secondary hover:bg-background hover:text-primary">
                <BellIcon />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-surface"></span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface rounded-xl shadow-lg border border-border z-50">
                    <div className="p-3 font-semibold border-b border-border text-primary">Notifications</div>
                    <div className="py-1 max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(q => (
                                <Link
                                    key={q.id}
                                    to={getNotificationLink(q)}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-3 text-sm text-primary hover:bg-background"
                                >
                                    <p className="font-medium">{getNotificationText(q)}</p>
                                    <p className="text-xs text-secondary truncate mt-1">{q.content}</p>
                                </Link>
                            ))
                        ) : (
                            <p className="px-4 py-3 text-sm text-secondary">No new notifications.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const UserMenu: React.FC = () => {
  const { user, isAdmin, isLawyer, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Fix: Corrected a typo from `profileMenu-ref` to `profileMenuRef`.
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={profileMenuRef}>
      <button
        onClick={() => setIsProfileOpen(!isProfileOpen)}
        className="flex items-center gap-3 text-left p-2 rounded-lg hover:bg-background"
      >
        <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold">
          {user?.username.charAt(0).toUpperCase()}
        </div>
        <div className="hidden md:block">
          <p className="font-semibold text-sm text-primary">{user?.username}</p>
          <p className="text-xs text-secondary">{isAdmin ? 'Admin' : (isLawyer ? 'Lawyer' : 'User')}</p>
        </div>
        <ChevronDownIcon />
      </button>
      {isProfileOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-lg border border-border z-50 py-2">
          {!isLawyer && (
            <Link to="/app/my-questions" onClick={() => setIsProfileOpen(false)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-primary hover:bg-background">
              <ChatBubbleIcon />
              <span>My Questions</span>
            </Link>
          )}
          <button
            onClick={logout}
            className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-background"
          >
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};


const NavItems: React.FC<{onLinkClick?: () => void}> = ({ onLinkClick }) => {
    const { isLawyer } = useAuth();
    const navItems = [
        { to: "/app/dashboard", icon: <DashboardIcon />, label: "Dashboard", show: true },
        { to: "/app/cases", icon: <CasesIcon />, label: "Cases", show: true },
        { to: "/app/categories", icon: <CategoriesIcon />, label: "Categories", show: true },
        { to: "/app/persons", icon: <PeopleIcon />, label: "Persons", show: true },
        { to: "/app/lawyers", icon: <UsersIcon />, label: "Lawyers", show: true },
        { to: "/app/questions", icon: <ChatBubbleIcon />, label: "Questions", show: isLawyer },
    ];
    const navLinkClasses = "flex items-center gap-3 px-4 py-2.5 text-secondary rounded-lg hover:bg-background hover:text-primary transition-colors font-medium";
    const activeNavLinkClasses = "bg-accent/10 text-accent font-semibold";

    return (
         <nav className="flex-1 space-y-2 px-4">
            {navItems.filter(item => item.show).map(item => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onLinkClick}
                    className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    )
}

const MainLayout: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
    return (
      <div className="flex h-screen bg-background text-primary overflow-hidden">
        {/* Static Sidebar for Desktop */}
        <aside className="w-64 flex-col flex-shrink-0 hidden lg:flex border-r border-border bg-surface py-6">
          <Link to="/app/dashboard" className="flex items-center gap-3 px-6 mb-8">
            <Logo />
            <span className="text-xl font-bold text-primary">Binh An Law</span>
          </Link>
          <NavItems />
        </aside>
  
        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/40" onClick={() => setIsMobileMenuOpen(false)}></div>
            <aside className="w-64 flex flex-col flex-shrink-0 fixed top-0 left-0 h-full border-r border-border bg-surface py-6 z-10">
              <Link to="/app/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-6 mb-8">
                <Logo />
                <span className="text-xl font-bold text-primary">Binh An Law</span>
              </Link>
              <NavItems onLinkClick={() => setIsMobileMenuOpen(false)} />
            </aside>
          </div>
        )}
  
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-20 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-border bg-surface/80 backdrop-blur-md">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-secondary hover:bg-background"
            >
              <HamburgerIcon />
            </button>
            <div className="flex-1"></div> {/* Spacer */}
            <div className="flex items-center gap-4">
              <NotificationBell />
              <UserMenu />
            </div>
          </header>
  
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    );
};
  
export default MainLayout;