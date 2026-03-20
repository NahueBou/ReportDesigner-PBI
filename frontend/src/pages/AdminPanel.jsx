import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const BASE = 'http://localhost:8000';

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'hoy';
  if (d === 1) return 'ayer';
  return `hace ${d} días`;
}

export default function AdminPanel({ onClose }) {
  const { user } = useAuth();
  const token = localStorage.getItem('rd_token');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users'); // 'users' | 'create'
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/admin/users`, { headers });
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      toast.error('No se pudo cargar la lista de usuarios. ¿Está corriendo el backend?');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (username, newRole) => {
    try {
      const res = await fetch(`${BASE}/auth/admin/users/${username}/role`, {
        method: 'PUT', headers, body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
      setUsers(prev => prev.map(u => u.username === username ? { ...u, role: newRole } : u));
      toast.success(`Rol de ${username} cambiado a ${newRole}`);
    } catch (e) {
      toast.error(e.message || 'Error al cambiar rol');
    }
  };

  const handleStatusChange = async (username, isActive) => {
    try {
      const res = await fetch(`${BASE}/auth/admin/users/${username}/status`, {
        method: 'PUT', headers, body: JSON.stringify({ is_active: isActive }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
      setUsers(prev => prev.map(u => u.username === username ? { ...u, is_active: isActive } : u));
      toast.success(`Usuario ${username} ${isActive ? 'activado' : 'desactivado'}`);
    } catch (e) {
      toast.error(e.message || 'Error al cambiar estado');
    }
  };

  const handleDelete = async (username) => {
    try {
      const res = await fetch(`${BASE}/auth/admin/users/${username}`, { method: 'DELETE', headers });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
      setUsers(prev => prev.filter(u => u.username !== username));
      toast.success(`Usuario ${username} eliminado`);
    } catch (e) {
      toast.error(e.message || 'Error al eliminar');
    }
    setConfirmDelete(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch(`${BASE}/auth/admin/users`, {
        method: 'POST', headers, body: JSON.stringify(newUser),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail); }
      toast.success(`Usuario ${newUser.username} creado`);
      setNewUser({ username: '', password: '' });
      setTab('users');
      fetchUsers();
    } catch (e) {
      toast.error(e.message || 'Error al crear usuario');
    } finally {
      setCreating(false);
    }
  };

  const s = {
    overlay: { position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' },
    modal: { background: '#1e1e2e', border: '1px solid #3d3d4b', borderRadius: 16, width: 700, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' },
    header: { padding: '20px 24px', borderBottom: '1px solid #3d3d4b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    badge: (color) => ({ background: color + '22', border: `1px solid ${color}55`, color, fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }),
  };

  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0 }}>Panel de Administración</h2>
            <p style={{ color: '#8b8ba8', fontSize: 12, margin: '2px 0 0' }}>Gestión de usuarios del sistema</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={s.badge('#6366f1')}>Admin: {user}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b8ba8', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #3d3d4b', padding: '0 24px' }}>
          {[['users', `Usuarios (${users.length})`], ['create', '+ Crear usuario']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: 'none', border: 'none', borderBottom: `2px solid ${tab === key ? '#6366f1' : 'transparent'}`,
              color: tab === key ? '#fff' : '#8b8ba8', fontSize: 13, fontWeight: tab === key ? 600 : 400,
              padding: '12px 16px 10px', cursor: 'pointer', transition: 'color 0.15s',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>

          {/* Users tab */}
          {tab === 'users' && (
            loading ? (
              <p style={{ color: '#8b8ba8', textAlign: 'center', padding: '40px 0' }}>Cargando usuarios...</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #3d3d4b' }}>
                    {['Usuario', 'Rol', 'Estado', 'Registro', 'Acciones'].map(h => (
                      <th key={h} style={{ color: '#6b6b8a', fontSize: 11, fontWeight: 600, textAlign: 'left', padding: '8px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.username} style={{ borderBottom: '1px solid #2d2d3b' }}>
                      <td style={{ padding: '12px', color: '#fff', fontSize: 14, fontWeight: u.username === user ? 600 : 400 }}>
                        {u.username}
                        {u.username === user && <span style={{ color: '#6366f1', fontSize: 11, marginLeft: 6 }}>(vos)</span>}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {u.username === user ? (
                          <span style={s.badge('#6366f1')}>{u.role}</span>
                        ) : (
                          <select
                            value={u.role || 'user'}
                            onChange={e => handleRoleChange(u.username, e.target.value)}
                            style={{ background: '#2d2d3b', border: '1px solid #3d3d4b', borderRadius: 4, color: '#c4c4d4', fontSize: 12, padding: '3px 6px', cursor: 'pointer' }}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={s.badge(u.is_active !== false ? '#10b981' : '#ef4444')}>
                          {u.is_active !== false ? 'activo' : 'inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#8b8ba8', fontSize: 12 }}>
                        {timeAgo(u.created_at)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {u.username !== user && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => handleStatusChange(u.username, u.is_active === false)}
                              style={{ background: 'none', border: '1px solid #3d3d4b', borderRadius: 4, color: '#8b8ba8', fontSize: 11, padding: '3px 8px', cursor: 'pointer' }}
                            >
                              {u.is_active !== false ? 'Desactivar' : 'Activar'}
                            </button>
                            {confirmDelete === u.username ? (
                              <>
                                <button onClick={() => handleDelete(u.username)} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 4, color: '#f87171', fontSize: 11, padding: '3px 8px', cursor: 'pointer' }}>Confirmar</button>
                                <button onClick={() => setConfirmDelete(null)} style={{ background: 'none', border: '1px solid #3d3d4b', borderRadius: 4, color: '#8b8ba8', fontSize: 11, padding: '3px 6px', cursor: 'pointer' }}>×</button>
                              </>
                            ) : (
                              <button onClick={() => setConfirmDelete(u.username)} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 4, color: '#f87171', fontSize: 11, padding: '3px 8px', cursor: 'pointer' }}>Eliminar</button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {/* Create user tab */}
          {tab === 'create' && (
            <form onSubmit={handleCreate} style={{ maxWidth: 400, paddingTop: 8 }}>
              <p style={{ color: '#8b8ba8', fontSize: 13, marginBottom: 20 }}>
                Creá un usuario directamente sin que necesite registrarse. Todos los usuarios nuevos son <strong style={{ color: '#c4c4d4' }}>user</strong> por defecto; podés cambiar el rol desde la lista.
              </p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#c4c4d4', fontSize: 13, marginBottom: 6 }}>Nombre de usuario</label>
                <input
                  type="text" required autoFocus
                  value={newUser.username}
                  onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))}
                  placeholder="ej: juan.garcia"
                  style={{ width: '100%', padding: '9px 12px', background: '#2d2d3b', border: '1px solid #3d3d4b', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', color: '#c4c4d4', fontSize: 13, marginBottom: 6 }}>Contraseña inicial</label>
                <input
                  type="password" required
                  value={newUser.password}
                  onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  style={{ width: '100%', padding: '9px 12px', background: '#2d2d3b', border: '1px solid #3d3d4b', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button
                type="submit" disabled={creating || !newUser.username || !newUser.password}
                style={{ background: 'linear-gradient(135deg, #6366f1, #9333ea)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, padding: '10px 20px', cursor: creating ? 'not-allowed' : 'pointer', opacity: !newUser.username || !newUser.password ? 0.5 : 1 }}
              >
                {creating ? 'Creando...' : 'Crear usuario'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
