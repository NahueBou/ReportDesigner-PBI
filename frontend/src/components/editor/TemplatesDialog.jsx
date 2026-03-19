import { useState, useEffect } from "react";
import axios from "axios";
import { 
  LayoutDashboard, 
  Settings2, 
  FileSearch, 
  FlaskConical,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { API } from "@/lib/utils";

const templateIcons = {
  executive: LayoutDashboard,
  operational: Settings2,
  detailed: FileSearch,
  analytical: FlaskConical,
};

const TemplatesDialog = ({ open, onOpenChange, onApplyTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API}/templates`);
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (selectedTemplate) {
      onApplyTemplate(selectedTemplate);
      setSelectedTemplate(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Seleccionar Template</DialogTitle>
          <DialogDescription>
            Elige un layout prediseñado para tu página. Esto reemplazará los componentes actuales.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-5 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {templates.map((template) => {
                const IconComponent = templateIcons[template.id] || LayoutDashboard;
                const isSelected = selectedTemplate?.id === template.id;
                
                return (
                  <Card
                    key={template.id}
                    data-testid={`template-${template.id}`}
                    className={`cursor-pointer transition-all ${
                      isSelected 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <IconComponent className="w-4 h-4 text-primary" />
                          </div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <CardDescription className="text-xs mt-2">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Template Preview */}
                      <div className="aspect-video bg-muted rounded-lg border p-2 relative overflow-hidden">
                        {template.components.map((comp, idx) => (
                          <div
                            key={idx}
                            className="absolute bg-primary/10 border border-primary/20 rounded-sm"
                            style={{
                              left: `${(comp.position.x / 900) * 100}%`,
                              top: `${(comp.position.y / 660) * 100}%`,
                              width: `${(comp.position.width / 900) * 100}%`,
                              height: `${(comp.position.height / 660) * 100}%`,
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        {template.components.length} componentes
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            data-testid="apply-template-btn"
            onClick={handleApply}
            disabled={!selectedTemplate}
          >
            Aplicar Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatesDialog;
