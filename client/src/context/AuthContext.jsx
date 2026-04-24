import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (_error) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  function saveSession(token, nextUser) {
    localStorage.setItem('token', token);
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, saveSession, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
