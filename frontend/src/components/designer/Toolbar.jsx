import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Undo2, Redo2, Eye, EyeOff, Download, Grid3X3,
  ZoomIn, ZoomOut, Maximize2, BarChart3, Copy, Clipboard, Trash2,
  AlignLeft, AlignCenter, AlignRight, AlignStartVertical,
  AlignCenterVertical, AlignEndVertical, MoreHorizontal,
  MessageSquare, AlignHorizontalSpaceAround, AlignVerticalSpaceAround,
  LogOut, Save, FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import useDesignerStore, { CANVAS_SIZES } from "@/store/designerStore";
import ExportDialog from "./ExportDialog";
import ProjectsModal from "./ProjectsModal";
import { useAuth } from "@/context/AuthContext";

const Toolbar = () => {
  const [exportOpen, setExportOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const { logout, user } = useAuth();

  const {
    canvasSize, setCanvasSize,
    showGrid, setShowGrid,
    zoom, setZoom,
    previewMode, setPreviewMode,
    showVisualizations, setShowVisualizations,
    undo, redo, canUndo, canRedo,
    selectedZoneIds, selectedZoneId,
    clipboard,
    copyZone, pasteZone, deleteZone, deleteSelectedZones,
    alignZones, distributeZones,
    commentMode, setCommentMode,
    showAnnotations, setShowAnnotations,
    projectName, setProjectName,
    isSaving, lastSaved, hasUnsavedChanges, saveProject,
  } = useDesignerStore();

  const hasSelection = selectedZoneIds.length > 0;
  const hasMulti = selectedZoneIds.length > 1;
  const canDistribute = selectedZoneIds.length >= 3;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.ctrlKey && e.key === 'c' && selectedZoneId) {
        e.preventDefault();
        copyZone(selectedZoneId);
        toast.success('Elemento copiado');
      }
      if (e.ctrlKey && e.key === 'v' && clipboard) {
        e.preventDefault();
        pasteZone();
        toast.success('Elemento pegado');
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && hasSelection) {
        e.preventDefault();
        if (selectedZoneIds.length > 1) {
          deleteSelectedZones();
          toast.success(`${selectedZoneIds.length} elementos eliminados`);
        } else {
          deleteZone(selectedZoneId);
          toast.success('Elemento eliminado');
        }
      }
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Escape') {
        setCommentMode(false);
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveProject().then(() => toast.success('Proyecto guardado')).catch(() => toast.error('Error al guardar'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedZoneId, selectedZoneIds, hasSelection, clipboard, copyZone, pasteZone, deleteZone, deleteSelectedZones, undo, redo, setCommentMode, saveProject]);

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
            <span className="text-white font-semibold hidden sm:block">Report Designer</span>
          </div>

          <div className="h-6 w-px bg-[#2d2d3b]" />

          {/* Projects button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => setProjectsOpen(true)}
                className="text-[#8b8ba8] hover:text-white hover:bg-[#3d3d4b] gap-1.5 h-8 px-2">
                <FolderOpen className="w-4 h-4" />
                <span className="text-xs hidden sm:block">Proyectos</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mis proyectos</TooltipContent>
          </Tooltip>

          {/* Project name */}
          <div className="flex items-center gap-1">
            {editingName ? (
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingName(false); }}
                autoFocus
                style={{
                  background: '#2d2d3b', border: '1px solid #6366f1',
                  borderRadius: 6, color: '#fff', fontSize: 13,
                  padding: '3px 8px', outline: 'none', width: 180,
                }}
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                style={{
                  background: 'none', border: 'none', color: '#c4c4d4',
                  fontSize: 13, fontWeight: 500, cursor: 'text', padding: '3px 8px',
                  borderRadius: 6, maxWidth: 200, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
                title="Hacer clic para renombrar"
              >
                {projectName}
              </button>
            )}
            {hasUnsavedChanges && (
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', flexShrink: 0, display: 'inline-block' }} title="Cambios sin guardar" />
            )}
          </div>

          <div className="h-6 w-px bg-[#2d2d3b]" />

          <Select value={`${canvasSize.width}x${canvasSize.height}`} onValueChange={handleCanvasSizeChange}>
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
                <Button variant="ghost" size="icon" data-testid="undo-btn" onClick={undo} disabled={!canUndo()} className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30">
                  <Undo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Deshacer (Ctrl+Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="redo-btn" onClick={redo} disabled={!canRedo()} className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30">
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
                <Button variant="ghost" size="icon" data-testid="copy-btn"
                  onClick={() => { if (selectedZoneId) { copyZone(selectedZoneId); toast.success('Elemento copiado'); } }}
                  disabled={!selectedZoneId}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30">
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copiar (Ctrl+C)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="paste-btn"
                  onClick={() => { if (clipboard) { pasteZone(); toast.success('Elemento pegado'); } }}
                  disabled={!clipboard}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30">
                  <Clipboard className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pegar (Ctrl+V)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="delete-btn"
                  onClick={() => {
                    if (hasMulti) {
                      deleteSelectedZones();
                      toast.success(`${selectedZoneIds.length} elementos eliminados`);
                    } else if (selectedZoneId) {
                      deleteZone(selectedZoneId);
                      toast.success('Elemento eliminado');
                    }
                  }}
                  disabled={!hasSelection}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Eliminar (Delete)</TooltipContent>
            </Tooltip>
          </div>

          {/* Multi-select badge */}
          {hasMulti && (
            <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium">
              {selectedZoneIds.length} sel.
            </span>
          )}

          {/* Alignment & Distribute Tools */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost" size="icon"
                    disabled={!hasSelection}
                    className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Alinear{hasMulti ? ' / Distribuir' : ''}</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-auto p-2 bg-[#2d2d3b] border-[#3d3d4b]" side="bottom">
              <div className="flex flex-col gap-2">
                {/* Alignment row */}
                <div className="flex gap-1">
                  {[
                    { id: 'align-left-btn', fn: 'left', Icon: AlignLeft, tip: hasMulti ? 'Alinear a la izquierda del grupo' : 'Alinear al borde izquierdo' },
                    { id: 'align-center-btn', fn: 'center', Icon: AlignCenter, tip: 'Centrar horizontalmente' },
                    { id: 'align-right-btn', fn: 'right', Icon: AlignRight, tip: hasMulti ? 'Alinear a la derecha del grupo' : 'Alinear al borde derecho' },
                    { id: 'align-top-btn', fn: 'top', Icon: AlignStartVertical, tip: hasMulti ? 'Alinear al tope del grupo' : 'Alinear al borde superior' },
                    { id: 'align-middle-btn', fn: 'middle', Icon: AlignCenterVertical, tip: 'Centrar verticalmente' },
                    { id: 'align-bottom-btn', fn: 'bottom', Icon: AlignEndVertical, tip: hasMulti ? 'Alinear al fondo del grupo' : 'Alinear al borde inferior' },
                  ].map(({ id, fn, Icon, tip }) => (
                    <Tooltip key={fn}>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={id}
                          onClick={() => alignZones(fn)}
                          disabled={!hasSelection}
                          className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30">
                          <Icon className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{tip}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>

                {/* Distribute row (only shown with ≥3 selected) */}
                {canDistribute && (
                  <>
                    <div className="h-px bg-[#3d3d4b]" />
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon"
                            onClick={() => { distributeZones('horizontal'); toast.success('Distribuido horizontalmente'); }}
                            className="h-8 w-8 text-white hover:bg-[#3d3d4b]">
                            <AlignHorizontalSpaceAround className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Distribuir espacio horizontal</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon"
                            onClick={() => { distributeZones('vertical'); toast.success('Distribuido verticalmente'); }}
                            className="h-8 w-8 text-white hover:bg-[#3d3d4b]">
                            <AlignVerticalSpaceAround className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Distribuir espacio vertical</TooltipContent>
                      </Tooltip>
                      <span className="text-[10px] text-gray-400 self-center ml-1">Distribuir</span>
                    </div>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Grid Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="grid-toggle"
                onClick={() => setShowGrid(!showGrid)}
                className={`h-8 w-8 ${showGrid ? 'bg-primary/20 text-primary' : 'text-white'} hover:bg-[#3d3d4b]`}>
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mostrar grilla</TooltipContent>
          </Tooltip>

          {/* Visualizations Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="viz-toggle"
                onClick={() => setShowVisualizations(!showVisualizations)}
                className={`h-8 w-8 ${showVisualizations ? 'bg-green-500/20 text-green-400' : 'text-white'} hover:bg-[#3d3d4b]`}>
                <BarChart3 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{showVisualizations ? 'Ocultar gráficos de ejemplo' : 'Mostrar gráficos de ejemplo'}</TooltipContent>
          </Tooltip>

          {/* Comment Mode */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="comment-mode-toggle"
                onClick={() => setCommentMode(!commentMode)}
                className={`h-8 w-8 ${commentMode ? 'bg-yellow-500/20 text-yellow-400' : 'text-white'} hover:bg-[#3d3d4b]`}>
                <MessageSquare className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{commentMode ? 'Salir modo comentario (Esc)' : 'Agregar comentario'}</TooltipContent>
          </Tooltip>

          {/* Show/Hide Annotations */}
          {!commentMode && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="annotations-toggle"
                  onClick={() => setShowAnnotations(!showAnnotations)}
                  className={`h-8 w-8 ${showAnnotations ? 'text-yellow-300' : 'text-white opacity-40'} hover:bg-[#3d3d4b]`}>
                  <MessageSquare className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showAnnotations ? 'Ocultar comentarios' : 'Mostrar comentarios'}</TooltipContent>
            </Tooltip>
          )}

          {/* Preview Mode */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="preview-toggle"
                onClick={() => setPreviewMode(!previewMode)}
                className={`h-8 w-8 ${previewMode ? 'bg-amber-500/20 text-amber-400' : 'text-white'} hover:bg-[#3d3d4b]`}>
                {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{previewMode ? 'Vista edición' : 'Vista exportación'}</TooltipContent>
          </Tooltip>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-[#2d2d3b] rounded-lg p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="zoom-out"
                  onClick={() => setZoom(zoom - 0.1)} disabled={zoom <= 0.25}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30">
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alejar</TooltipContent>
            </Tooltip>

            <span className="text-white text-xs w-12 text-center font-mono">{Math.round(zoom * 100)}%</span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="zoom-in"
                  onClick={() => setZoom(zoom + 0.1)} disabled={zoom >= 2}
                  className="h-8 w-8 text-white hover:bg-[#3d3d4b] disabled:opacity-30">
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Acercar</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="zoom-fit"
                  onClick={() => setZoom(1)} className="h-8 w-8 text-white hover:bg-[#3d3d4b]">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>100%</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Right - User + Export */}
        <div className="flex items-center gap-2">
          {/* User info + logout */}
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-[#8b8ba8] text-xs hidden sm:block">{user}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon"
                    onClick={logout}
                    className="h-8 w-8 text-[#8b8ba8] hover:text-white hover:bg-[#3d3d4b]">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cerrar sesión</TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Save button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => saveProject().then(() => toast.success('Proyecto guardado')).catch(() => toast.error('Error al guardar'))}
                disabled={isSaving}
                className={`gap-1.5 h-8 px-3 ${hasUnsavedChanges ? 'text-amber-400 hover:text-amber-300' : 'text-[#8b8ba8] hover:text-white'} hover:bg-[#3d3d4b]`}
              >
                <Save className="w-4 h-4" />
                <span className="text-xs hidden sm:block">{isSaving ? 'Guardando...' : 'Guardar'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {lastSaved
                ? `Guardado ${new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(-Math.round((Date.now() - lastSaved.getTime()) / 60000), 'minutes')}`
                : 'Guardar proyecto (Ctrl+S)'}
            </TooltipContent>
          </Tooltip>

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
      <ProjectsModal open={projectsOpen} onClose={() => setProjectsOpen(false)} />
    </TooltipProvider>
  );
};

export default Toolbar;
