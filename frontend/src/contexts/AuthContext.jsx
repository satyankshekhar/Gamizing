import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logout as logoutService } from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (localStorage.getItem('accessToken')) {
          const data = await getMe();
          setUser(data.user);
        }
      } catch (error) {
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const loginContext = (userData, token) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginContext, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);\n