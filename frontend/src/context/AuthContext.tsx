import React, { createContext, useState, useEffect, useMemo } from 'react';
import { login as authServiceLogin, AuthRequest, AuthResponse } from '@/services/authService';

export interface AuthContextType {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: AuthRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: AuthRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authServiceLogin(credentials);
      setToken(response.token);
      setRole(response.role);
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  const isAuthenticated = useMemo(() => !!token, [token]);
  const isAdmin = useMemo(() => isAuthenticated && role === 'ADMIN', [isAuthenticated, role]);

  const value = useMemo(
    () => ({
      token,
      role,
      isAuthenticated,
      isAdmin,
      isLoading,
      login,
      logout,
    }),
    [token, role, isAuthenticated, isAdmin, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};