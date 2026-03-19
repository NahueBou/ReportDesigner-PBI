import { useState, useRef, useEffect } from "react";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  CircleDot,
  AreaChart,
  ScatterChart,
  LayoutGrid,
  Gauge,
  LayoutTemplate,
  Table,
  Grid3X3,
  Filter,
  Map,
  GripVertical
} from "lucide-react";

const iconMap = {
  bar_chart: BarChart3,
  line_chart: LineChart,
  pie_chart: PieChart,
  donut_chart: CircleDot,
  area_chart: AreaChart,
  scatter: ScatterChart,
  treemap: LayoutGrid,
  gauge: Gauge,
  kpi_card: LayoutTemplate,
  table: Table,
  matrix: Grid3X3,
  slicer: Filter,
  map: Map,
};

const componentColors = {
  bar_chart: '#2563EB',
  line_chart: '#10B981',
  pie_chart: '#8B5CF6',
  donut_chart: '#EC4899',
  area_chart: '#14B8A6',
  scatter: '#F59E0B',
  treemap: '#6366F1',
  gauge: '#EF4444',
  kpi_card: '#2563EB',
  table: '#6B7280',
  matrix: '#4B5563',
  slicer: '#9CA3AF',
  map: '#059669',
};

const PowerBIComponent = ({ 
  component, 
  isSelected, 
  onSelect, 
  onMove, 
  onResize 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const componentRef = useRef(null);

  const IconComponent = iconMap[component.type] || LayoutTemplate;
  const accentColor = componentColors[component.type] || '#6B7280';

  const { position } = component;

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        onMove({
          ...position,
          x: position.x + dx,
          y: position.y + dy
        });
        
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isResizing && resizeHandle) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        let newPosition = { ...position };
        
        switch (resizeHandle) {
          case 'se':
            newPosition.width = Math.max(80, position.width + dx);
            newPosition.height = Math.max(60, position.height + dy);
            break;
          case 'sw':
            newPosition.x = position.x + dx;
            newPosition.width = Math.max(80, position.width - dx);
            newPosition.height = Math.max(60, position.height + dy);
            break;
          case 'ne':
            newPosition.y = position.y + dy;
            newPosition.width = Math.max(80, position.width + dx);
            newPosition.height = Math.max(60, position.height - dy);
            break;
          case 'nw':
            newPosition.x = position.x + dx;
            newPosition.y = position.y + dy;
            newPosition.width = Math.max(80, position.width - dx);
            newPosition.height = Math.max(60, position.height - dy);
            break;
          case 'e':
            newPosition.width = Math.max(80, position.width + dx);
            break;
          case 'w':
            newPosition.x = position.x + dx;
            newPosition.width = Math.max(80, position.width - dx);
            break;
          case 'n':
            newPosition.y = position.y + dy;
            newPosition.height = Math.max(60, position.height - dy);
            break;
          case 's':
            newPosition.height = Math.max(60, position.height + dy);
            break;
          default:
            break;
        }
        
        onResize(newPosition);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, position, resizeHandle, onMove, onResize]);

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) return;
    
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleResizeStart = (e, handle) => {
    e.stopPropagation();
    onSelect();
    setIsResizing(true);
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      ref={componentRef}
      data-testid={`canvas-component-${component.id}`}
      className={`canvas-component ${isSelected ? 'selected' : ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: position.x,
        top: position.y,
        width: position.width,
        height: position.height,
        zIndex: isSelected ? 5 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Component Header */}
      <div 
        className="pbi-component-header flex items-center gap-2"
        style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
      >
        <GripVertical className="w-3 h-3 text-muted-foreground/50" />
        <span className="truncate flex-1">{component.label}</span>
      </div>

      {/* Component Body - Mockup visualization */}
      <div className="pbi-component-body">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <IconComponent 
            className="w-12 h-12 opacity-20" 
            style={{ color: accentColor }}
          />
          <span className="text-xs text-muted-foreground/50 max-w-[80%] truncate">
            {component.label}
          </span>
        </div>
      </div>

      {/* Resize Handles (only visible when selected) */}
      {isSelected && (
        <>
          <div 
            className="resize-handle nw" 
            onMouseDown={(e) => handleResizeStart(e, 'nw')} 
          />
          <div 
            className="resize-handle n" 
            onMouseDown={(e) => handleResizeStart(e, 'n')} 
          />
          <div 
            className="resize-handle ne" 
            onMouseDown={(e) => handleResizeStart(e, 'ne')} 
          />
          <div 
            className="resize-handle e" 
            onMouseDown={(e) => handleResizeStart(e, 'e')} 
          />
          <div 
            className="resize-handle se" 
            onMouseDown={(e) => handleResizeStart(e, 'se')} 
          />
          <div 
            className="resize-handle s" 
            onMouseDown={(e) => handleResizeStart(e, 's')} 
          />
          <div 
            className="resize-handle sw" 
            onMouseDown={(e) => handleResizeStart(e, 'sw')} 
          />
          <div 
            className="resize-handle w" 
            onMouseDown={(e) => handleResizeStart(e, 'w')} 
          />
        </>
      )}
    </div>
  );
};

export default PowerBIComponent;
