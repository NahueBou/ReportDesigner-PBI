const BASE = 'http://localhost:8000';

export function getToken() {
  return localStorage.getItem('rd_token');
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('rd_token');
    localStorage.removeItem('rd_username');
    window.location.reload();
    return null;
  }

  return res.json();
}
