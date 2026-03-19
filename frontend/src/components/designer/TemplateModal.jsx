import { toast } from "sonner";
import {
  LayoutDashboard,
  TrendingUp,
  Settings,
  Activity,
  Grid3X3,
  FileStack
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import useDesignerStore, { LAYOUT_TEMPLATES } from "@/store/designerStore";

const templateIcons = {
  executive: LayoutDashboard,
  elea_seleccion: Activity,
  sales: TrendingUp,
  operational: Settings,
  simple: Grid3X3,
  blank: FileStack
};

const TemplateModal = ({ open, onOpenChange }) => {
  const { loadTemplate, setBackground } = useDesignerStore();

  const handleSelectTemplate = (templateId) => {
    loadTemplate(templateId);
    // Set default gray background for templates
    if (templateId !== 'blank') {
      setBackground({ type: 'solid', color: '#f0f0f0' });
    }
    onOpenChange(false);
    if (templateId !== 'blank') {
      toast.success(`Template "${LAYOUT_TEMPLATES.find(t => t.id === templateId)?.name}" cargado`);
    } else {
      toast.success("Canvas en blanco listo");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Power BI Report Designer</DialogTitle>
          <DialogDescription className="text-base">
            Diseña el fondo de tu reporte. Los recuadros blancos serán las áreas donde colocarás los visuales en Power BI Desktop.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] pr-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {LAYOUT_TEMPLATES.map((template) => {
              const IconComponent = templateIcons[template.id] || FileStack;
              
              return (
                <button
                  key={template.id}
                  data-testid={`modal-template-${template.id}`}
                  onClick={() => handleSelectTemplate(template.id)}
                  className="template-card group p-4 rounded-xl border-2 border-transparent hover:border-primary/50 bg-gray-50 hover:bg-white text-left transition-all"
                >
                  {/* Preview - shows actual card layout */}
                  <div className="aspect-video bg-[#f0f0f0] rounded-lg border mb-3 p-1.5 relative overflow-hidden">
                    {template.zones.length > 0 ? (
                      template.zones.slice(0, 14).map((zone, idx) => (
                        <div
                          key={idx}
                          className="absolute rounded-sm transition-colors"
                          style={{
                            left: `${(zone.x / 1280) * 100}%`,
                            top: `${(zone.y / 720) * 100}%`,
                            width: `${(zone.width / 1280) * 100}%`,
                            height: `${(zone.height / 720) * 100}%`,
                            backgroundColor: zone.style?.fillColor || '#ffffff',
                            boxShadow: zone.style?.shadowEnabled !== false ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                          }}
                        />
                      ))
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <FileStack className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {template.description}
                      </p>
                      {template.zones.length > 0 && (
                        <span className="text-xs text-primary font-medium mt-1 inline-block">
                          {template.zones.length} recuadros
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Puedes modificar cualquier template después de cargarlo
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateModal;
