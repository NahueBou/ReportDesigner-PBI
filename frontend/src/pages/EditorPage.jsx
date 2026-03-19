import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Download,
  Plus,
  Trash2,
  Copy,
  LayoutTemplate,
  FileText,
  Image,
  FileJson,
  X,
  GripVertical,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { API, COMPONENT_TYPES, COMPONENT_CATEGORIES, generateId } from "@/lib/utils";
import ComponentsSidebar from "@/components/editor/ComponentsSidebar";
import Canvas from "@/components/editor/Canvas";
import PropertiesPanel from "@/components/editor/PropertiesPanel";
import TemplatesDialog from "@/components/editor/TemplatesDialog";
import ExportDialog from "@/components/editor/ExportDialog";

const EditorPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Error al cargar el proyecto");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async (updatedProject = project) => {
    if (!updatedProject) return;
    
    setSaving(true);
    try {
      await axios.put(`${API}/projects/${projectId}`, {
        name: updatedProject.name,
        description: updatedProject.description,
        pages: updatedProject.pages,
      });
      toast.success("Proyecto guardado");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const currentPage = project?.pages?.[currentPageIndex];

  const handleAddPage = async () => {
    try {
      const response = await axios.post(`${API}/projects/${projectId}/pages`, {
        name: `Página ${project.pages.length + 1}`,
        layout: "free"
      });
      setProject(response.data);
      setCurrentPageIndex(response.data.pages.length - 1);
      toast.success("Página agregada");
    } catch (error) {
      console.error("Error adding page:", error);
      toast.error("Error al agregar página");
    }
  };

  const handleDeletePage = async (pageId) => {
    if (project.pages.length <= 1) {
      toast.error("No puedes eliminar la última página");
      return;
    }
    
    try {
      const response = await axios.delete(`${API}/projects/${projectId}/pages/${pageId}`);
      setProject(response.data);
      if (currentPageIndex >= response.data.pages.length) {
        setCurrentPageIndex(response.data.pages.length - 1);
      }
      toast.success("Página eliminada");
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error("Error al eliminar página");
    }
  };

  const handleUpdatePage = useCallback((updates) => {
    if (!project || !currentPage) return;
    
    const updatedPages = [...project.pages];
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      ...updates
    };
    
    const updatedProject = { ...project, pages: updatedPages };
    setProject(updatedProject);
    
    // Debounce save
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(() => saveProject(updatedProject), 1000);
  }, [project, currentPageIndex, currentPage]);

  const handleAddComponent = useCallback((componentType) => {
    if (!currentPage) return;
    
    const typeInfo = COMPONENT_TYPES.find(t => t.type === componentType);
    const newComponent = {
      id: generateId(),
      type: componentType,
      label: typeInfo?.label || componentType,
      position: {
        x: 50 + Math.random() * 100,
        y: 50 + Math.random() * 100,
        width: 250,
        height: 180
      },
      style: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        borderRadius: 4
      },
      data: {}
    };

    handleUpdatePage({
      components: [...(currentPage.components || []), newComponent]
    });
    setSelectedComponentId(newComponent.id);
  }, [currentPage, handleUpdatePage]);

  const handleUpdateComponent = useCallback((componentId, updates) => {
    if (!currentPage) return;
    
    const updatedComponents = currentPage.components.map(comp =>
      comp.id === componentId ? { ...comp, ...updates } : comp
    );
    
    handleUpdatePage({ components: updatedComponents });
  }, [currentPage, handleUpdatePage]);

  const handleDeleteComponent = useCallback((componentId) => {
    if (!currentPage) return;
    
    const updatedComponents = currentPage.components.filter(c => c.id !== componentId);
    handleUpdatePage({ components: updatedComponents });
    
    if (selectedComponentId === componentId) {
      setSelectedComponentId(null);
    }
  }, [currentPage, handleUpdatePage, selectedComponentId]);

  const handleDuplicateComponent = useCallback((componentId) => {
    if (!currentPage) return;
    
    const component = currentPage.components.find(c => c.id === componentId);
    if (!component) return;
    
    const newComponent = {
      ...component,
      id: generateId(),
      position: {
        ...component.position,
        x: component.position.x + 20,
        y: component.position.y + 20
      }
    };
    
    handleUpdatePage({
      components: [...currentPage.components, newComponent]
    });
    setSelectedComponentId(newComponent.id);
  }, [currentPage, handleUpdatePage]);

  const handleAddAnnotation = useCallback((position) => {
    if (!currentPage) return;
    
    const newAnnotation = {
      id: generateId(),
      text: "Nueva nota",
      position: {
        x: position.x,
        y: position.y,
        width: 150,
        height: 60
      },
      color: "#F59E0B"
    };

    handleUpdatePage({
      annotations: [...(currentPage.annotations || []), newAnnotation]
    });
    setIsAddingAnnotation(false);
  }, [currentPage, handleUpdatePage]);

  const handleUpdateAnnotation = useCallback((annotationId, updates) => {
    if (!currentPage) return;
    
    const updatedAnnotations = (currentPage.annotations || []).map(ann =>
      ann.id === annotationId ? { ...ann, ...updates } : ann
    );
    
    handleUpdatePage({ annotations: updatedAnnotations });
  }, [currentPage, handleUpdatePage]);

  const handleDeleteAnnotation = useCallback((annotationId) => {
    if (!currentPage) return;
    
    const updatedAnnotations = (currentPage.annotations || []).filter(a => a.id !== annotationId);
    handleUpdatePage({ annotations: updatedAnnotations });
  }, [currentPage, handleUpdatePage]);

  const handleApplyTemplate = useCallback((template) => {
    if (!currentPage) return;
    
    const templateComponents = template.components.map(comp => ({
      ...comp,
      id: generateId(),
      style: {
        backgroundColor: "#FFFFFF",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        borderRadius: 4
      },
      data: {}
    }));

    handleUpdatePage({
      components: templateComponents,
      layout: template.id
    });
    setIsTemplatesOpen(false);
    toast.success(`Template "${template.name}" aplicado`);
  }, [currentPage, handleUpdatePage]);

  const selectedComponent = currentPage?.components?.find(c => c.id === selectedComponentId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Proyecto no encontrado</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b bg-background flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  data-testid="back-btn"
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Volver a proyectos</TooltipContent>
            </Tooltip>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div>
              <h1 className="text-sm font-semibold">{project.name}</h1>
              <p className="text-xs text-muted-foreground">
                {project.pages?.length || 0} página{project.pages?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="templates-btn"
                  onClick={() => setIsTemplatesOpen(true)}
                  className="gap-2"
                >
                  <LayoutTemplate className="w-4 h-4" />
                  <span className="hidden sm:inline">Templates</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aplicar template prediseñado</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="annotation-btn"
                  onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
                  className={`gap-2 ${isAddingAnnotation ? 'bg-secondary/20 border-secondary' : ''}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Nota</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Agregar anotación</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="save-btn"
                  onClick={() => saveProject()}
                  disabled={saving}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">{saving ? 'Guardando...' : 'Guardar'}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Guardar proyecto</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  data-testid="export-btn"
                  onClick={() => setIsExportOpen(true)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar proyecto</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Page Tabs */}
        <div className="h-10 border-b bg-muted/30 flex items-center px-4 gap-2 flex-shrink-0">
          <ScrollArea className="flex-1" orientation="horizontal">
            <div className="flex items-center gap-1">
              {project.pages?.map((page, index) => (
                <div 
                  key={page.id}
                  className={`flex items-center group ${
                    currentPageIndex === index 
                      ? 'bg-background border border-border rounded-t-md -mb-px' 
                      : ''
                  }`}
                >
                  <button
                    data-testid={`page-tab-${index}`}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                      currentPageIndex === index 
                        ? 'text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setCurrentPageIndex(index)}
                  >
                    {page.name}
                  </button>
                  {project.pages.length > 1 && (
                    <button
                      data-testid={`delete-page-${index}`}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
                      onClick={() => handleDeletePage(page.id)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                data-testid="add-page-btn"
                onClick={handleAddPage}
                className="h-7 px-2"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Agregar página</TooltipContent>
          </Tooltip>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Components */}
          <ComponentsSidebar 
            onAddComponent={handleAddComponent}
          />

          {/* Canvas Area */}
          <div className="flex-1 bg-gray-100/50 p-6 overflow-auto flex justify-center items-start">
            <Canvas
              ref={canvasRef}
              components={currentPage?.components || []}
              annotations={currentPage?.annotations || []}
              selectedComponentId={selectedComponentId}
              onSelectComponent={setSelectedComponentId}
              onUpdateComponent={handleUpdateComponent}
              onDeleteComponent={handleDeleteComponent}
              onDuplicateComponent={handleDuplicateComponent}
              onAddAnnotation={handleAddAnnotation}
              onUpdateAnnotation={handleUpdateAnnotation}
              onDeleteAnnotation={handleDeleteAnnotation}
              isAddingAnnotation={isAddingAnnotation}
            />
          </div>

          {/* Right Sidebar - Properties */}
          <PropertiesPanel
            component={selectedComponent}
            onUpdateComponent={(updates) => handleUpdateComponent(selectedComponentId, updates)}
            onDeleteComponent={() => handleDeleteComponent(selectedComponentId)}
            onDuplicateComponent={() => handleDuplicateComponent(selectedComponentId)}
          />
        </div>

        {/* Dialogs */}
        <TemplatesDialog
          open={isTemplatesOpen}
          onOpenChange={setIsTemplatesOpen}
          onApplyTemplate={handleApplyTemplate}
        />

        <ExportDialog
          open={isExportOpen}
          onOpenChange={setIsExportOpen}
          project={project}
          canvasRef={canvasRef}
        />
      </div>
    </TooltipProvider>
  );
};

export default EditorPage;
