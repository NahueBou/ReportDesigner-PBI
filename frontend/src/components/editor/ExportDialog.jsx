import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  Image, 
  FileText, 
  FileJson, 
  Download,
  Loader2
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API } from "@/lib/utils";

const ExportDialog = ({ open, onOpenChange, project, canvasRef }) => {
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("image");

  const exportAsImage = async () => {
    setExporting(true);
    try {
      // Use html2canvas to capture the canvas
      const html2canvas = (await import('html2canvas')).default;
      
      if (canvasRef.current) {
        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: '#FFFFFF',
          scale: 2,
          useCORS: true,
        });
        
        const link = document.createElement('a');
        link.download = `${project.name.replace(/\s+/g, '_')}_mockup.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast.success("Imagen exportada exitosamente");
      }
    } catch (error) {
      console.error("Error exporting image:", error);
      toast.error("Error al exportar imagen");
    } finally {
      setExporting(false);
    }
  };

  const exportAsPDF = async () => {
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      if (canvasRef.current) {
        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: '#FFFFFF',
          scale: 2,
          useCORS: true,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [canvas.width / 2, canvas.height / 2]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`${project.name.replace(/\s+/g, '_')}_mockup.pdf`);
        
        toast.success("PDF exportado exitosamente");
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Error al exportar PDF");
    } finally {
      setExporting(false);
    }
  };

  const exportAsJSON = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API}/projects/${project.id}/export`);
      
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `${project.name.replace(/\s+/g, '_')}_spec.json`;
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success("JSON exportado exitosamente");
    } catch (error) {
      console.error("Error exporting JSON:", error);
      toast.error("Error al exportar JSON");
    } finally {
      setExporting(false);
    }
  };

  const exportOptions = [
    {
      id: 'image',
      icon: Image,
      title: 'Imagen PNG',
      description: 'Exporta el canvas actual como imagen de alta resolución',
      action: exportAsImage,
    },
    {
      id: 'pdf',
      icon: FileText,
      title: 'Documento PDF',
      description: 'Genera un PDF con la maqueta para compartir',
      action: exportAsPDF,
    },
    {
      id: 'json',
      icon: FileJson,
      title: 'Especificación JSON',
      description: 'Descarga las especificaciones técnicas del diseño',
      action: exportAsJSON,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Exportar Proyecto</DialogTitle>
          <DialogDescription>
            Elige el formato de exportación para tu maqueta
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            {exportOptions.map((option) => (
              <TabsTrigger 
                key={option.id} 
                value={option.id}
                data-testid={`export-tab-${option.id}`}
                className="gap-2"
              >
                <option.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{option.title.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {exportOptions.map((option) => (
            <TabsContent key={option.id} value={option.id} className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <option.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {option.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Preview info */}
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Proyecto:</span>
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Páginas:</span>
                      <span className="font-medium">{project.pages?.length || 0}</span>
                    </div>
                    {option.id === 'image' && (
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Resolución:</span>
                        <span className="font-medium">1920 x 1080 px (2x)</span>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full gap-2"
                    data-testid={`export-${option.id}-btn`}
                    onClick={option.action}
                    disabled={exporting}
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Exportando...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Descargar {option.title}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
