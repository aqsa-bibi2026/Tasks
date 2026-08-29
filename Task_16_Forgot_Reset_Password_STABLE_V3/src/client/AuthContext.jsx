import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { api } from './api.js';

const AuthContext = createContext(null);

function appError(data, fallback) {
  const error = new Error(data?.message || fallback);
  error.payload = data;
  return error;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/session')
      .then(({ data }) => {
        setUser(data.authenticated ? data.user : null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);

    if (!data.success) {
      throw appError(data, 'Registration failed.');
    }

    setUser(data.user);
    return data;
  }

  async function login(payload) {
    const { data } = await api.post('/auth/login', payload);

    if (!data.success) {
      throw appError(data, 'Login failed.');
    }

    setUser(data.user);
    return data;
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  }

  function clearLocalUser() {
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      register,
      login,
      logout,
      clearLocalUser
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return value;
}
