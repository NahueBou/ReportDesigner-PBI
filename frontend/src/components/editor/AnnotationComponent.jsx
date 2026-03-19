import { useState, useRef, useEffect } from "react";
import { X, GripVertical } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const AnnotationComponent = ({ annotation, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [text, setText] = useState(annotation.text);
  const textareaRef = useRef(null);

  const { position, color } = annotation;

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        onUpdate({
          position: {
            ...position,
            x: Math.max(0, position.x + dx),
            y: Math.max(0, position.y + dy)
          }
        });
        
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, position, onUpdate]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'TEXTAREA') return;
    
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (text !== annotation.text) {
      onUpdate({ text });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setText(annotation.text);
      setIsEditing(false);
    }
  };

  return (
    <div
      data-testid={`annotation-${annotation.id}`}
      className="annotation group"
      style={{
        left: position.x,
        top: position.y,
        width: position.width,
        minHeight: position.height,
        borderColor: color,
        backgroundColor: `${color}15`
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <GripVertical 
          className="w-3 h-3 cursor-grab active:cursor-grabbing" 
          style={{ color }}
        />
        <button
          data-testid={`delete-annotation-${annotation.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-black/10 rounded"
        >
          <X className="w-3 h-3" style={{ color }} />
        </button>
      </div>

      {/* Content */}
      {isEditing ? (
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="min-h-[40px] text-xs resize-none border-none bg-transparent p-0 focus-visible:ring-0"
          style={{ color: '#374151' }}
        />
      ) : (
        <p 
          className="text-xs whitespace-pre-wrap cursor-text"
          style={{ color: '#374151' }}
        >
          {annotation.text || 'Haz doble clic para editar'}
        </p>
      )}
    </div>
  );
};

export default AnnotationComponent;
