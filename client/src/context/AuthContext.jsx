import { createContext, useContext, useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page load
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminUser');
    if (token && storedAdmin && storedAdmin !== 'undefined') {
      try {
        setAdmin(JSON.parse(storedAdmin));
        // Verify/refresh admin info from server to sync database updates
        adminAPI.getMe()
          .then((res) => {
            const freshAdmin = res.data.admin;
            if (freshAdmin) {
              localStorage.setItem('adminUser', JSON.stringify(freshAdmin));
              setAdmin(freshAdmin);
            }
          })
          .catch(() => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            setAdmin(null);
          });
      } catch (e) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setAdmin(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await adminAPI.login({ email, password });
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminUser', JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
