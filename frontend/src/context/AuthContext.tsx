import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { apiClient } from '../api/axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  signup: (payload: { username: string; name: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('craftly_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('craftly_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (credentials: { username: string; password: string }) => {
    const res = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    const { token: jwt, user: u } = res.data;
    setToken(jwt);
    setUser(u);
    localStorage.setItem('craftly_token', jwt);
    localStorage.setItem('craftly_user', JSON.stringify(u));
  };

  const signup = async (payload: { username: string; name: string; password: string }) => {
    const res = await apiClient.post<AuthResponse>('/api/auth/signup', payload);
    const { token: jwt, user: u } = res.data;
    setToken(jwt);
    setUser(u);
    localStorage.setItem('craftly_token', jwt);
    localStorage.setItem('craftly_user', JSON.stringify(u));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('craftly_token');
    localStorage.removeItem('craftly_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
