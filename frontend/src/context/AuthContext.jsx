import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext(null);

function parseUsernameFromToken(token) {
  if (token === 'offline') return localStorage.getItem('rd_username');
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('rd_token');
    if (!token) return null;
    return parseUsernameFromToken(token);
  });

  const login = (token, username) => {
    localStorage.setItem('rd_token', token);
    localStorage.setItem('rd_username', username);
    setUser(username);
  };

  const loginOffline = (username) => {
    localStorage.setItem('rd_token', 'offline');
    localStorage.setItem('rd_username', username);
    setUser(username);
  };

  const logout = () => {
    localStorage.removeItem('rd_token');
    localStorage.removeItem('rd_username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginOffline, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
