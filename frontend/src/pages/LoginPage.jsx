import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const BASE = 'http://localhost:8000';

export default function LoginPage() {
  const { login, loginOffline } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'offline'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'offline') {
      loginOffline(username.trim());
      return;
    }

    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';

    try {
      const res = await fetch(`${BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Ocurrió un error');
        return;
      }

      login(data.access_token, data.username);
    } catch {
      // Backend no disponible → ofrecer modo offline
      setMode('offline');
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const isOffline = mode === 'offline';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#1e1e2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          background: '#2d2d3b',
          border: '1px solid #3d3d4b',
          borderRadius: 16,
          padding: '40px 48px',
          width: 380,
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #9333ea)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: '#fff',
              fontSize: 15,
            }}
          >
            PBI
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Report Designer</div>
            <div style={{ color: '#8b8ba8', fontSize: 12 }}>Mockup de reportes Power BI</div>
          </div>
        </div>

        {/* Offline banner */}
        {isOffline && (
          <div
            style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#fbbf24',
              fontSize: 12,
              marginBottom: 20,
              lineHeight: 1.5,
            }}
          >
            El servidor no está disponible. Podés usar la herramienta sin conexión — ingresá tu nombre para continuar.
          </div>
        )}

        {/* Title */}
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 600, margin: '0 0 8px' }}>
          {isOffline ? 'Modo sin conexión' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </h2>
        <p style={{ color: '#8b8ba8', fontSize: 13, marginBottom: 28 }}>
          {isOffline
            ? 'Solo tu nombre para identificarte en los comentarios'
            : mode === 'login'
            ? 'Ingresá con tu usuario de la empresa'
            : 'Registrate para usar la herramienta'}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: isOffline ? 24 : 16 }}>
            <label style={{ display: 'block', color: '#c4c4d4', fontSize: 13, marginBottom: 6 }}>
              {isOffline ? 'Tu nombre' : 'Usuario'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isOffline ? 'Ej: Juan García' : 'tu.nombre'}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#1e1e2e',
                border: '1px solid #3d3d4b',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {!isOffline && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#c4c4d4', fontSize: 13, marginBottom: 6 }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#1e1e2e',
                  border: '1px solid #3d3d4b',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#f87171',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || (!isOffline && !password)}
            style={{
              width: '100%',
              padding: '11px',
              background: loading
                ? '#4b4b6b'
                : isOffline
                ? 'linear-gradient(135deg, #d97706, #b45309)'
                : 'linear-gradient(135deg, #6366f1, #9333ea)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: !username || (!isOffline && !password) ? 0.5 : 1,
            }}
          >
            {loading
              ? 'Cargando...'
              : isOffline
              ? 'Continuar sin servidor'
              : mode === 'login'
              ? 'Ingresar'
              : 'Crear cuenta'}
          </button>
        </form>

        {!isOffline && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#8b8bf0',
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {mode === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Ingresá'}
            </button>
          </div>
        )}

        {isOffline && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              onClick={() => { setMode('login'); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#8b8ba8',
                fontSize: 12,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Intentar con servidor nuevamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
