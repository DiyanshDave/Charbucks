import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: tk, user: usr } = res.data;
    localStorage.setItem('token', tk);
    localStorage.setItem('user', JSON.stringify(usr));
    setToken(tk);
    setUser(usr);
    return usr;
  };

  const signup = async (name, email, password) => {
    const res = await authAPI.signup({ name, email, password });
    const { token: tk, user: usr } = res.data;
    localStorage.setItem('token', tk);
    localStorage.setItem('user', JSON.stringify(usr));
    setToken(tk);
    setUser(usr);
    return usr;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};