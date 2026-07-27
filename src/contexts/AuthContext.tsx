import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as authApi from '../api/authApi';
import type { User } from '../api/authApi';
import { getAuthToken, setAuthToken, setUnauthorizedHandler } from '../api/axios';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // 저장된 토큰으로 사용자 복원이 끝나기 전까지는 로그인 여부를 단정할 수 없다
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  // 토큰이 서버에서 거부되면(만료·위조) 로그아웃 상태로 되돌린다
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  // 새로고침 시 저장된 토큰으로 사용자 복원
  useEffect(() => {
    if (!getAuthToken()) {
      setIsLoading(false);
      return;
    }

    authApi
      .fetchMe()
      .then(setUser)
      .catch(() => setAuthToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    setAuthToken(await authApi.login(email, password));
    setUser(await authApi.fetchMe());
  };

  const signup = async (email: string, password: string, nickname: string) => {
    setAuthToken(await authApi.signup(email, password, nickname));
    setUser(await authApi.fetchMe());
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
