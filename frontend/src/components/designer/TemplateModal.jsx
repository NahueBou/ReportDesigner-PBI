import { toast } from "sonner";
import {
  LayoutDashboard,
  TrendingUp,
  Settings,
  Activity,
  Users,
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
  sales: TrendingUp,
  operational: Settings,
  clinical: Activity,
  hr: Users,
  blank: FileStack
};

const TemplateModal = ({ open, onOpenChange }) => {
  const { loadTemplate } = useDesignerStore();

  const handleSelectTemplate = (templateId) => {
    loadTemplate(templateId);
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
          <DialogTitle className="text-2xl">Bienvenido al Report Designer</DialogTitle>
          <DialogDescription className="text-base">
            Elige un template prediseñado para comenzar rápidamente, o inicia con un canvas en blanco.
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
                  {/* Preview */}
                  <div className="aspect-video bg-white rounded-lg border mb-3 p-2 relative overflow-hidden">
                    {template.zones.length > 0 ? (
                      template.zones.slice(0, 8).map((zone, idx) => (
                        <div
                          key={idx}
                          className="absolute bg-primary/20 border border-primary/30 rounded-sm transition-colors group-hover:bg-primary/30"
                          style={{
                            left: `${(zone.x / 1280) * 100}%`,
                            top: `${(zone.y / 720) * 100}%`,
                            width: `${(zone.width / 1280) * 100}%`,
                            height: `${(zone.height / 720) * 100}%`,
                          }}
                        />
                      ))
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <FileStack className="w-8 h-8 text-gray-300" />
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
                          {template.zones.length} elementos
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
            Puedes cambiar de template en cualquier momento
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
