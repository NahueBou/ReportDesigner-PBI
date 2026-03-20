import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext(null);

function parsePayloadFromToken(token) {
  if (token === 'offline') return { username: localStorage.getItem('rd_username'), role: 'user' };
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { username: payload.sub || null, role: payload.role || 'user' };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('rd_token');
    if (!token) return null;
    return parsePayloadFromToken(token);
  });

  const login = (token, username, role = 'user') => {
    localStorage.setItem('rd_token', token);
    localStorage.setItem('rd_username', username);
    setAuth({ username, role });
  };

  const loginOffline = (username) => {
    localStorage.setItem('rd_token', 'offline');
    localStorage.setItem('rd_username', username);
    setAuth({ username, role: 'user' });
  };

  const logout = () => {
    localStorage.removeItem('rd_token');
    localStorage.removeItem('rd_username');
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{
      user: auth?.username ?? null,
      role: auth?.role ?? null,
      isAdmin: auth?.role === 'admin',
      login,
      loginOffline,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
