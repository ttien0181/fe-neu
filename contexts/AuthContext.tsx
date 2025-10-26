
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/apiService';
import { AuthRequest, DecodedToken } from '../types';

interface AuthContextType {
  token: string | null;
  user: { username: string; roles: string[]; userId: number; } | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: AuthRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeJwt(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [user, setUser] = useState<{ username: string; roles: string[]; userId: number; } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser({ username: decoded.sub, roles: decoded.roles || [], userId: decoded.userId });
      } else {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, [token]);

  const login = useCallback(async (credentials: AuthRequest) => {
    const response = await api.login(credentials);
    const newToken = response.token;
    localStorage.setItem('authToken', newToken);
    const decoded = decodeJwt(newToken);
    if (decoded) {
      setUser({ username: decoded.sub, roles: decoded.roles || [], userId: decoded.userId });
    }
    setToken(newToken);
    navigate('/');
  }, [navigate]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    navigate('/login');
  }, [navigate]);

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token && !!user,
    // Fix: Wrapped logical OR in parentheses to resolve mixed operator error ('||' and '??').
    isAdmin: (user?.roles.includes('ADMIN') || user?.roles.includes('ROLE_ADMIN')) ?? false,
    login,
    logout,
    isLoading
  }), [token, user, login, logout, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
