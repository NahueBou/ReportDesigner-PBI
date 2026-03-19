import { useState, useCallback, forwardRef } from "react";
import { Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import PowerBIComponent from "./PowerBIComponent";
import AnnotationComponent from "./AnnotationComponent";

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

const Canvas = forwardRef(({
  components = [],
  annotations = [],
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  isAddingAnnotation
}, ref) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const componentType = e.dataTransfer.getData("componentType");
    if (componentType) {
      // Calculate drop position relative to canvas
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - 125; // Center the component
      const y = e.clientY - rect.top - 90;
      
      // This will be handled by the parent via onAddComponent
      // For now, just add at default position
    }
  };

  const handleCanvasClick = (e) => {
    // Only deselect if clicking directly on canvas background
    if (e.target === e.currentTarget || e.target.classList.contains('canvas-grid')) {
      if (isAddingAnnotation) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        onAddAnnotation({ x, y });
      } else {
        onSelectComponent(null);
      }
    }
  };

  const handleComponentMove = useCallback((componentId, newPosition) => {
    // Clamp position within canvas bounds
    const clampedPosition = {
      ...newPosition,
      x: Math.max(0, Math.min(newPosition.x, CANVAS_WIDTH - newPosition.width)),
      y: Math.max(0, Math.min(newPosition.y, CANVAS_HEIGHT - newPosition.height))
    };
    
    onUpdateComponent(componentId, { position: clampedPosition });
  }, [onUpdateComponent]);

  const handleComponentResize = useCallback((componentId, newPosition) => {
    // Ensure minimum size and clamp within bounds
    const clampedPosition = {
      ...newPosition,
      width: Math.max(80, Math.min(newPosition.width, CANVAS_WIDTH - newPosition.x)),
      height: Math.max(60, Math.min(newPosition.height, CANVAS_HEIGHT - newPosition.y))
    };
    
    onUpdateComponent(componentId, { position: clampedPosition });
  }, [onUpdateComponent]);

  return (
    <div
      ref={ref}
      data-testid="canvas"
      className={`canvas-wrapper relative ${isAddingAnnotation ? 'cursor-crosshair' : ''}`}
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      {/* Grid Background */}
      <div 
        className={`absolute inset-0 canvas-grid transition-colors ${
          isDragOver ? 'bg-primary/5' : ''
        }`}
      />

      {/* Drop zone indicator */}
      {isDragOver && (
        <div className="absolute inset-4 border-2 border-dashed border-primary/40 rounded-lg pointer-events-none z-10 flex items-center justify-center">
          <span className="text-sm font-medium text-primary/60 bg-white/80 px-3 py-1 rounded">
            Soltar aquí
          </span>
        </div>
      )}

      {/* Adding annotation indicator */}
      {isAddingAnnotation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-secondary/90 text-secondary-foreground px-3 py-1.5 rounded-full text-xs font-medium z-20">
          Haz clic para agregar una nota
        </div>
      )}

      {/* Components */}
      {components.map((component) => (
        <ContextMenu key={component.id}>
          <ContextMenuTrigger asChild>
            <div>
              <PowerBIComponent
                component={component}
                isSelected={selectedComponentId === component.id}
                onSelect={() => onSelectComponent(component.id)}
                onMove={(newPos) => handleComponentMove(component.id, newPos)}
                onResize={(newPos) => handleComponentResize(component.id, newPos)}
              />
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              data-testid={`duplicate-${component.id}`}
              onClick={() => onDuplicateComponent(component.id)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicar
            </ContextMenuItem>
            <ContextMenuItem
              data-testid={`delete-${component.id}`}
              onClick={() => onDeleteComponent(component.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}

      {/* Annotations */}
      {annotations.map((annotation) => (
        <AnnotationComponent
          key={annotation.id}
          annotation={annotation}
          onUpdate={(updates) => onUpdateAnnotation(annotation.id, updates)}
          onDelete={() => onDeleteAnnotation(annotation.id)}
        />
      ))}

      {/* Empty state */}
      {components.length === 0 && annotations.length === 0 && !isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-1">
              Canvas vacío
            </p>
            <p className="text-muted-foreground/60 text-xs">
              Arrastra componentes desde el panel izquierdo o usa un template
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

Canvas.displayName = "Canvas";

export default Canvas;
