import { useRef, useEffect } from 'react';
import useDesignerStore from '@/store/designerStore';

const COLORS = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'];

export default function AnnotationOverlay() {
  const {
    getAnnotations,
    selectedAnnotationId,
    selectAnnotation,
    clearAnnotationSelection,
    updateAnnotation,
    deleteAnnotation,
  } = useDesignerStore();

  const annotations = getAnnotations();

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      {annotations.map((ann) => (
        <AnnotationBubble
          key={ann.id}
          annotation={ann}
          isOpen={selectedAnnotationId === ann.id}
          onOpen={() => selectAnnotation(ann.id)}
          onClose={() => clearAnnotationSelection()}
          onUpdate={(updates) => updateAnnotation(ann.id, updates)}
          onDelete={() => deleteAnnotation(ann.id)}
        />
      ))}
    </div>
  );
}

function AnnotationBubble({ annotation, isOpen, onOpen, onClose, onUpdate, onDelete }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const preview = annotation.text
    ? annotation.text.slice(0, 20) + (annotation.text.length > 20 ? '…' : '')
    : null;

  return (
    <div
      style={{
        position: 'absolute',
        left: annotation.x,
        top: annotation.y,
        pointerEvents: 'auto',
        zIndex: 30,
      }}
    >
      {/* Bubble icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          isOpen ? onClose() : onOpen();
        }}
        title={annotation.text || 'Sin comentario'}
        style={{
          background: annotation.color || '#F59E0B',
          border: 'none',
          borderRadius: '50% 50% 50% 0',
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          transform: 'rotate(-45deg)',
          flexShrink: 0,
        }}
      >
        <span style={{ transform: 'rotate(45deg)', fontSize: 13 }}>💬</span>
      </button>

      {/* Preview text label */}
      {preview && !isOpen && (
        <div style={{
          position: 'absolute',
          top: 30,
          left: 0,
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          fontSize: 10,
          padding: '2px 6px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          {preview}
        </div>
      )}

      {/* Expanded popover */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 32,
            left: 0,
            width: 240,
            background: '#2d2d3b',
            border: '1px solid #3d3d4b',
            borderRadius: 10,
            padding: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 50,
          }}
        >
          <textarea
            ref={textareaRef}
            value={annotation.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Escribí tu comentario para el desarrollador..."
            rows={3}
            style={{
              width: '100%',
              background: '#1e1e2e',
              border: '1px solid #3d3d4b',
              borderRadius: 6,
              color: '#e0e0f0',
              fontSize: 12,
              padding: '8px',
              resize: 'vertical',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {/* Color picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <span style={{ color: '#8b8ba8', fontSize: 11 }}>Color:</span>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onUpdate({ color: c })}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  background: c,
                  border: annotation.color === c ? '2px solid #fff' : '2px solid transparent',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Author + date + delete */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <span style={{ color: '#6b6b8a', fontSize: 10 }}>
              {annotation.author} · {annotation.createdAt}
            </span>
            <button
              onClick={() => { onDelete(); onClose(); }}
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 4,
                color: '#f87171',
                fontSize: 10,
                padding: '2px 8px',
                cursor: 'pointer',
              }}
            >
              Eliminar
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 6,
              right: 8,
              background: 'none',
              border: 'none',
              color: '#8b8ba8',
              fontSize: 16,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
