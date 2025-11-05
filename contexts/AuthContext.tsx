

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/apiService';
import { AuthRequest, DecodedToken, User } from '../types';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLawyer: boolean;
  lawyerPersonId: number | null;
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
  const [user, setUser] = useState<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [isLawyer, setIsLawyer] = useState<boolean>(JSON.parse(localStorage.getItem('isLawyer') || 'false'));
  const [lawyerPersonId, setLawyerPersonId] = useState<number | null>(JSON.parse(localStorage.getItem('lawyerPersonId') || 'null'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkTokenValidity = useCallback(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      const decoded = decodeJwt(storedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setToken(storedToken);
        setUser(JSON.parse(localStorage.getItem('user') || 'null'));
        setIsLawyer(JSON.parse(localStorage.getItem('isLawyer') || 'false'));
        setLawyerPersonId(JSON.parse(localStorage.getItem('lawyerPersonId') || 'null'));
      } else {
        // Clear all auth state if token is expired
        logout(true); // pass true to avoid navigation if already on public page
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkTokenValidity();
  }, [checkTokenValidity]);

  const clearAuthData = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isLawyer');
      localStorage.removeItem('lawyerPersonId');
      setToken(null);
      setUser(null);
      setIsLawyer(false);
      setLawyerPersonId(null);
  }

  const login = useCallback(async (credentials: AuthRequest) => {
    const response = await api.login(credentials);
    const { token: newToken, ...userData } = response;
    
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    // Check if the user is a lawyer
    try {
        const persons = await api.getPersons();
        const lawyerPerson = persons.find(p => p.role.toLowerCase() === 'lawyer' && p.contactInfo === userData.email);
        if (lawyerPerson) {
            localStorage.setItem('isLawyer', 'true');
            localStorage.setItem('lawyerPersonId', JSON.stringify(lawyerPerson.id));
            setIsLawyer(true);
            setLawyerPersonId(lawyerPerson.id);
        } else {
            localStorage.setItem('isLawyer', 'false');
            localStorage.removeItem('lawyerPersonId');
            setIsLawyer(false);
            setLawyerPersonId(null);
        }
    } catch (e) {
        console.error("Could not verify lawyer status:", e);
        // Default to not a lawyer on error
        localStorage.setItem('isLawyer', 'false');
        localStorage.removeItem('lawyerPersonId');
        setIsLawyer(false);
        setLawyerPersonId(null);
    }
    
    navigate('/app/dashboard');
  }, [navigate]);

  const logout = useCallback((isTokenExpired = false) => {
    clearAuthData();
    if (!isTokenExpired) {
        navigate('/');
    }
  }, [navigate]);

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN',
    isLawyer,
    lawyerPersonId,
    login,
    logout,
    isLoading
  }), [token, user, isLawyer, lawyerPersonId, login, logout, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};