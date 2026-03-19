import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Download,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BarChart3,
  Copy,
  Clipboard,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useDesignerStore, { CANVAS_SIZES } from "@/store/designerStore";
import ExportDialog from "./ExportDialog";

const Toolbar = () => {
  const [exportOpen, setExportOpen] = useState(false);
  const {
    canvasSize,
    setCanvasSize,
    showGrid,
    setShowGrid,
    zoom,
    setZoom,
    previewMode,
    setPreviewMode,
    showVisualizations,
    setShowVisualizations,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedZoneId,
    clipboard,
    copyZone,
    pasteZone,
    deleteZone,
    alignZones
  } = useDesignerStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Copy: Ctrl+C
      if (e.ctrlKey && e.key === 'c' && selectedZoneId) {
        e.preventDefault();
        copyZone(selectedZoneId);
        toast.success('Elemento copiado');
      }
      
      // Paste: Ctrl+V
      if (e.ctrlKey && e.key === 'v' && clipboard) {
        e.preventDefault();
        pasteZone();
        toast.success('Elemento pegado');
      }
      
      // Delete: Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedZoneId) {
        e.preventDefault();
        deleteZone(selectedZoneId);
        toast.success('Elemento eliminado');
      }
      
      // Undo: Ctrl+Z
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedZoneId, clipboard, copyZone, pasteZone, deleteZone, undo, redo]);

  const handleCanvasSizeChange = (value) => {
    const preset = CANVAS_SIZES.find(s => `${s.width}x${s.height}` === value);
    if (preset) {
      setCanvasSize({ width: preset.width, height: preset.height });
      toast.success(`Canvas: ${preset.width} × ${preset.height}`);
    }
  };

  return (
    <TooltipProvider>
      <header className="h-14 bg-[#1e1e2e] border-b border-[#2d2d3b] flex items-center justify-between px-4 flex-shrink-0">
        {/* Left - Logo & Canvas Size */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">PBI</span>
            </div>
            <span className="text-white font-semibold hidden sm:block">
              Report Designer
            </span>
          </div>

          <div className="h-6 w-px bg-[#2d2d3b]" />

          <Select
            value={`${canvasSize.width}x${canvasSize.height}`}
            onValueChange={handleCanvasSizeChange}
          >
            <SelectTrigger 
              data-testid="canvas-size-select"
              className="w-[200px] bg-[#2d2d3b] border-[#3d3d4b] text-white text-sm"
            >
              <SelectValue placeholder="Canvas Size" />
            </SelectTrigger>
            <SelectContent>
              {CANVAS_SIZES.map((size) => (
                <SelectItem key={`${size.width}x${size.height}`} value={`${size.width}x${size.height}`}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Center - Controls */}
        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 bg-[#2d2d3b] rounded-lg p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="undo-btn"
                  onClick={undo}
                  disabled={!canUndo()}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Deshacer (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="redo-btn"
                  onClick={redo}
                  disabled={!canRedo()}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rehacer (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </div>

          {/* Copy/Paste/Delete */}
          <div className="flex items-center gap-1 bg-[#2d2d3b] rounded-lg p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="copy-btn"
                  onClick={() => {
                    if (selectedZoneId) {
                      copyZone(selectedZoneId);
                      toast.success('Elemento copiado');
                    }
                  }}
                  disabled={!selectedZoneId}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copiar (Ctrl+C)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="paste-btn"
                  onClick={() => {
                    if (clipboard) {
                      pasteZone();
                      toast.success('Elemento pegado');
                    }
                  }}
                  disabled={!clipboard}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30"
                >
                  <Clipboard className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pegar (Ctrl+V)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="delete-btn"
                  onClick={() => {
                    if (selectedZoneId) {
                      deleteZone(selectedZoneId);
                      toast.success('Elemento eliminado');
                    }
                  }}
                  disabled={!selectedZoneId}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Eliminar (Delete)</TooltipContent>
            </Tooltip>
          </div>

          {/* Alignment Tools */}
          <div className="flex items-center gap-1 bg-[#2d2d3b] rounded-lg p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="align-left-btn"
                  onClick={() => alignZones('left')}
                  disabled={!selectedZoneId}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alinear izquierda</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="align-center-btn"
                  onClick={() => alignZones('center')}
                  disabled={!selectedZoneId}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Centrar horizontalmente</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="align-right-btn"
                  onClick={() => alignZones('right')}
                  disabled={!selectedZoneId}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alinear derecha</TooltipContent>
            </Tooltip>

            <div className="w-px h-4 bg-[#3d3d4b]" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="align-top-btn"
                  onClick={() => alignZones('top')}
                  disabled={!selectedZoneId}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30"
                >
                  <AlignStartVertical className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alinear arriba</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="align-middle-btn"
                  onClick={() => alignZones('middle')}
                  disabled={!selectedZoneId}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30"
                >
                  <AlignCenterVertical className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Centrar verticalmente</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="align-bottom-btn"
                  onClick={() => alignZones('bottom')}
                  disabled={!selectedZoneId}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30"
                >
                  <AlignEndVertical className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alinear abajo</TooltipContent>
            </Tooltip>
          </div>

          {/* Grid Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid="grid-toggle"
                onClick={() => setShowGrid(!showGrid)}
                className={`h-8 w-8 ${showGrid ? 'bg-primary/20 text-primary' : 'text-white'} hover:bg-[#3d3d4b]`}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mostrar grilla</TooltipContent>
          </Tooltip>

          {/* Show Visualizations Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid="viz-toggle"
                onClick={() => setShowVisualizations(!showVisualizations)}
                className={`h-8 w-8 ${showVisualizations ? 'bg-green-500/20 text-green-400' : 'text-white'} hover:bg-[#3d3d4b]`}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{showVisualizations ? 'Ocultar gráficos de ejemplo' : 'Mostrar gráficos de ejemplo'}</TooltipContent>
          </Tooltip>

          {/* Preview Mode */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid="preview-toggle"
                onClick={() => setPreviewMode(!previewMode)}
                className={`h-8 w-8 ${previewMode ? 'bg-amber-500/20 text-amber-400' : 'text-white'} hover:bg-[#3d3d4b]`}
              >
                {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{previewMode ? 'Vista edición' : 'Vista exportación (sin etiquetas ni gráficos)'}</TooltipContent>
          </Tooltip>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-[#2d2d3b] rounded-lg p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="zoom-out"
                  onClick={() => setZoom(zoom - 0.1)}
                  disabled={zoom <= 0.25}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alejar</TooltipContent>
            </Tooltip>

            <span className="text-white text-xs w-12 text-center font-mono">
              {Math.round(zoom * 100)}%
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="zoom-in"
                  onClick={() => setZoom(zoom + 0.1)}
                  disabled={zoom >= 2}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Acercar</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="zoom-fit"
                  onClick={() => setZoom(1)}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b]"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>100%</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Right - Export */}
        <div className="flex items-center gap-2">
          <Button
            data-testid="export-btn"
            onClick={() => setExportOpen(true)}
            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </header>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </TooltipProvider>
  );
};

export default Toolbar;
