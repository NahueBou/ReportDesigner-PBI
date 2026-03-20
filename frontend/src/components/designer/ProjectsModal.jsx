import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import useDesignerStore from '@/store/designerStore';

const BASE = 'http://localhost:8000';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return 'justo ahora';
  if (m < 60) return `hace ${m} min`;
  if (h < 24) return `hace ${h}h`;
  return `hace ${d}d`;
}

export default function ProjectsModal({ open, onClose }) {
  const { loadProjectData, newProject, getOfflineProjects, deleteOfflineProject, projectId } = useDesignerStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const token = localStorage.getItem('rd_token');
  const isOffline = !token || token === 'offline';

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      if (isOffline) {
        setProjects(getOfflineProjects());
      } else {
        const res = await fetch(`${BASE}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      }
    } catch {
      setProjects(getOfflineProjects());
    } finally {
      setLoading(false);
    }
  }, [isOffline, token, getOfflineProjects]);

  useEffect(() => {
    if (open) fetchProjects();
  }, [open, fetchProjects]);

  const handleLoad = (project) => {
    loadProjectData(project);
    toast.success(`Proyecto "${project.name}" cargado`);
    onClose();
  };

  const handleDelete = async (project) => {
    try {
      if (isOffline) {
        deleteOfflineProject(project.id);
      } else {
        await fetch(`${BASE}/api/projects/${project.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setProjects(prev => prev.filter(p => p.id !== project.id));
      toast.success('Proyecto eliminado');
    } catch {
      toast.error('No se pudo eliminar');
    }
    setConfirmDelete(null);
  };

  const handleCreateNew = () => {
    newProject();
    toast.success('Nuevo proyecto creado');
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#1e1e2e', border: '1px solid #3d3d4b',
          borderRadius: 16, width: 640, maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #3d3d4b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 600, margin: 0 }}>Mis proyectos</h2>
            {isOffline && (
              <span style={{ color: '#f59e0b', fontSize: 11 }}>Modo offline — guardados en este navegador</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setCreating(!creating)}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                border: 'none', borderRadius: 8,
                color: '#fff', fontSize: 13, fontWeight: 600,
                padding: '7px 14px', cursor: 'pointer',
              }}
            >
              + Nuevo proyecto
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#8b8ba8', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Create new form */}
        {creating && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #3d3d4b', background: '#2d2d3b' }}>
            <p style={{ color: '#c4c4d4', fontSize: 13, margin: '0 0 12px' }}>Nombre del nuevo proyecto:</p>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Ej: Dashboard de Ventas Q1"
              autoFocus
              style={{
                width: '100%', padding: '9px 12px',
                background: '#1e1e2e', border: '1px solid #3d3d4b',
                borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none',
                boxSizing: 'border-box', marginBottom: 8,
              }}
            />
            <input
              type="text"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Descripción (opcional)"
              style={{
                width: '100%', padding: '9px 12px',
                background: '#1e1e2e', border: '1px solid #3d3d4b',
                borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none',
                boxSizing: 'border-box', marginBottom: 12,
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCreateNew}
                disabled={!newName.trim()}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #9333ea)',
                  border: 'none', borderRadius: 8,
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  padding: '7px 16px', cursor: !newName.trim() ? 'not-allowed' : 'pointer',
                  opacity: !newName.trim() ? 0.5 : 1,
                }}
              >
                Crear y abrir
              </button>
              <button
                onClick={() => setCreating(false)}
                style={{
                  background: 'none', border: '1px solid #3d3d4b',
                  borderRadius: 8, color: '#8b8ba8', fontSize: 13,
                  padding: '7px 14px', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Projects list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px' }}>
          {loading ? (
            <p style={{ color: '#8b8ba8', textAlign: 'center', padding: '40px 0' }}>Cargando...</p>
          ) : projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p style={{ color: '#8b8ba8', fontSize: 14 }}>No hay proyectos guardados todavía.</p>
              <p style={{ color: '#6b6b8a', fontSize: 12, marginTop: 4 }}>Creá uno con el botón de arriba.</p>
            </div>
          ) : (
            projects.map(project => (
              <div
                key={project.id}
                style={{
                  background: project.id === projectId ? '#2d2d4b' : '#2d2d3b',
                  border: `1px solid ${project.id === projectId ? '#6366f1' : '#3d3d4b'}`,
                  borderRadius: 10, padding: '14px 16px', marginBottom: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onClick={() => handleLoad(project)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#fff', fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {project.name}
                    </span>
                    {project.id === projectId && (
                      <span style={{ background: '#6366f1', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>
                        actual
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p style={{ color: '#8b8ba8', fontSize: 12, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {project.description}
                    </p>
                  )}
                  <p style={{ color: '#6b6b8a', fontSize: 11, margin: '4px 0 0' }}>
                    {project.pages?.length || 0} página{project.pages?.length !== 1 ? 's' : ''} · {timeAgo(project.updatedAt || project.updated_at)}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 6, marginLeft: 12 }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleLoad(project)}
                    style={{
                      background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                      borderRadius: 6, color: '#8b8bf0', fontSize: 12, fontWeight: 500,
                      padding: '4px 10px', cursor: 'pointer',
                    }}
                  >
                    Abrir
                  </button>
                  {confirmDelete === project.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(project)}
                        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 6, color: '#f87171', fontSize: 12, padding: '4px 10px', cursor: 'pointer' }}
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        style={{ background: 'none', border: '1px solid #3d3d4b', borderRadius: 6, color: '#8b8ba8', fontSize: 12, padding: '4px 8px', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(project.id)}
                      style={{ background: 'none', border: '1px solid #3d3d4b', borderRadius: 6, color: '#6b6b8a', fontSize: 12, padding: '4px 8px', cursor: 'pointer' }}
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
