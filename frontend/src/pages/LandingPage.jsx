import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { 
  Plus, 
  FolderOpen, 
  Trash2, 
  LayoutDashboard,
  Clock,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { API, formatDate } from "@/lib/utils";

const LandingPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Error al cargar los proyectos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error("Por favor ingresa un nombre para el proyecto");
      return;
    }

    setCreating(true);
    try {
      const response = await axios.post(`${API}/projects`, {
        name: newProjectName,
        description: newProjectDescription,
      });
      toast.success("Proyecto creado exitosamente");
      setIsDialogOpen(false);
      setNewProjectName("");
      setNewProjectDescription("");
      navigate(`/editor/${response.data.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Error al crear el proyecto");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    try {
      await axios.delete(`${API}/projects/${projectId}`);
      toast.success(`Proyecto "${projectName}" eliminado`);
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Error al eliminar el proyecto");
    }
  };

  const handleOpenProject = (projectId) => {
    navigate(`/editor/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Power BI Mockup Tool
              </h1>
              <p className="text-xs text-muted-foreground">
                Diseña tus reportes visualmente
              </p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-project-btn" className="gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
                <DialogDescription>
                  Define los detalles básicos de tu nuevo mockup de Power BI
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Nombre del proyecto</Label>
                  <Input
                    id="project-name"
                    data-testid="project-name-input"
                    placeholder="Ej: Dashboard de Ventas Q1"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">Descripción (opcional)</Label>
                  <Input
                    id="project-description"
                    data-testid="project-description-input"
                    placeholder="Breve descripción del reporte"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  data-testid="confirm-create-btn"
                  onClick={handleCreateProject}
                  disabled={creating}
                >
                  {creating ? "Creando..." : "Crear Proyecto"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Diseña Reportes de Power BI
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Crea maquetas visuales de tus dashboards antes de desarrollarlos. 
            Arrastra componentes, define layouts y exporta especificaciones listas para tu equipo.
          </p>
        </section>

        {/* Projects Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground">
              Mis Proyectos
            </h3>
            <span className="text-sm text-muted-foreground">
              {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-medium text-foreground mb-2">
                  No hay proyectos aún
                </h4>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Comienza creando tu primer mockup de Power BI
                </p>
                <Button 
                  data-testid="empty-create-btn"
                  onClick={() => setIsDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear Proyecto
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="template-card group cursor-pointer"
                  data-testid={`project-card-${project.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {project.name}
                        </CardTitle>
                        {project.description && (
                          <CardDescription className="line-clamp-2 mt-1">
                            {project.description}
                          </CardDescription>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`delete-project-${project.id}`}
                            className="opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente 
                              el proyecto "{project.name}" y todas sus páginas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              data-testid={`confirm-delete-${project.id}`}
                              onClick={() => handleDeleteProject(project.id, project.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent onClick={() => handleOpenProject(project.id)}>
                    {/* Project Preview */}
                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center border overflow-hidden">
                      <div className="w-full h-full p-2 relative">
                        {/* Mini preview of components */}
                        <div className="absolute inset-2 flex flex-wrap gap-1">
                          {project.pages?.[0]?.components?.slice(0, 6).map((comp, idx) => (
                            <div 
                              key={idx}
                              className="bg-primary/10 border border-primary/20 rounded"
                              style={{
                                width: `${Math.min(30, 100 / 3)}%`,
                                height: '30%'
                              }}
                            />
                          ))}
                          {(!project.pages?.[0]?.components || project.pages[0].components.length === 0) && (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              Sin componentes
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(project.updated_at)}</span>
                      </div>
                      <span>{project.pages?.length || 0} página{project.pages?.length !== 1 ? 's' : ''}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-muted-foreground">
          Power BI Mockup Tool — Diseña reportes visualmente antes de desarrollarlos
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
