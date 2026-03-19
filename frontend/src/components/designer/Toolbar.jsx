import { useState, useRef } from "react";
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
  Settings2
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    undo,
    redo,
    canUndo,
    canRedo
  } = useDesignerStore();

  const handleCanvasSizeChange = (value) => {
    if (value === 'custom') {
      // Could open a dialog for custom size
      return;
    }
    const preset = CANVAS_SIZES.find(s => `${s.width}x${s.height}` === value);
    if (preset) {
      setCanvasSize({ width: preset.width, height: preset.height });
      toast.success(`Canvas: ${preset.width} × ${preset.height}`);
    }
  };

  const handleZoomIn = () => setZoom(zoom + 0.1);
  const handleZoomOut = () => setZoom(zoom - 0.1);
  const handleZoomFit = () => setZoom(1);

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

        {/* Center - Undo/Redo & View Controls */}
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

          {/* Preview Mode */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid="preview-toggle"
                onClick={() => setPreviewMode(!previewMode)}
                className={`h-8 w-8 ${previewMode ? 'bg-primary/20 text-primary' : 'text-white'} hover:bg-[#3d3d4b]`}
              >
                {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{previewMode ? 'Modo edición' : 'Vista previa'}</TooltipContent>
          </Tooltip>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-[#2d2d3b] rounded-lg p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="zoom-out"
                  onClick={handleZoomOut}
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
                  onClick={handleZoomIn}
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
                  onClick={handleZoomFit}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b]"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ajustar (100%)</TooltipContent>
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
