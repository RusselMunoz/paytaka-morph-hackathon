import { createContext, useContext, useMemo, useState } from 'react';
import { authApi, setAuthToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const applySession = (session) => {
    setUser(session.user);
    setToken(session.token);
    setAuthToken(session.token);
    return session;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      register: async (input) => {
        setIsLoading(true);
        try {
          return applySession(await authApi.register(input));
        } finally {
          setIsLoading(false);
        }
      },
      login: async (input) => {
        setIsLoading(true);
        try {
          return applySession(await authApi.login(input));
        } finally {
          setIsLoading(false);
        }
      },
      logout: () => {
        setUser(null);
        setToken(null);
        setAuthToken(undefined);
      },
    }),
    [isLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
