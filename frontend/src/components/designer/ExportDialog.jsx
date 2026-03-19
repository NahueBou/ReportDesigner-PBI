import { useState } from "react";
import { toast } from "sonner";
import {
  Download,
  Image,
  FileJson,
  FileCode,
  Copy,
  Check,
  Loader2,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useDesignerStore from "@/store/designerStore";

const ExportDialog = ({ open, onOpenChange }) => {
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { canvasSize, getExportJSON, zones, setPreviewMode, previewMode } = useDesignerStore();

  const exportAsPNG = async () => {
    setExporting(true);
    
    try {
      // Set preview mode to hide labels
      setPreviewMode(true);
      
      // Wait for re-render
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get the Konva stage
      const stage = window.konvaStage;
      if (!stage) {
        throw new Error('Canvas not found');
      }
      
      // Export with high quality
      const dataURL = stage.toDataURL({
        pixelRatio: 2, // 2x resolution for high quality
        mimeType: 'image/png'
      });
      
      const link = document.createElement('a');
      link.download = `powerbi-background-${canvasSize.width}x${canvasSize.height}.png`;
      link.href = dataURL;
      link.click();
      
      toast.success("Imagen PNG exportada - lista para usar en Power BI");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Error al exportar PNG");
    } finally {
      setPreviewMode(false);
      setExporting(false);
    }
  };

  const exportAsSVG = async () => {
    setExporting(true);
    
    try {
      // Set preview mode
      setPreviewMode(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Generate SVG content
      const svgContent = generateSVG();
      
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `powerbi-background-${canvasSize.width}x${canvasSize.height}.svg`;
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success("SVG exportado exitosamente");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Error al exportar SVG");
    } finally {
      setPreviewMode(false);
      setExporting(false);
    }
  };

  const generateSVG = () => {
    const state = useDesignerStore.getState();
    const { background, zones, canvasSize } = state;
    
    const bgColor = background.color || '#f0f0f0';

    // Generate zones SVG - clean cards without labels
    const zonesSVG = zones.map(zone => {
      const fillColor = zone.style?.fillColor || '#ffffff';
      const fillOpacity = zone.style?.fillOpacity ?? 1;
      const cornerRadius = zone.style?.cornerRadius || 8;
      const shadowEnabled = zone.style?.shadowEnabled ?? true;
      const borderWidth = zone.style?.borderWidth || 0;
      const borderColor = zone.style?.borderColor || '#e5e7eb';
      
      // Shadow filter if enabled
      const filterId = shadowEnabled ? `shadow-${zone.id}` : '';
      
      return `${shadowEnabled ? `<filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="rgba(0,0,0,0.1)"/>
      </filter>` : ''}
      <rect 
        x="${zone.x}" 
        y="${zone.y}" 
        width="${zone.width}" 
        height="${zone.height}" 
        fill="${fillColor}" 
        fill-opacity="${fillOpacity}"
        rx="${cornerRadius}"
        ${shadowEnabled ? `filter="url(#${filterId})"` : ''}
        ${borderWidth > 0 ? `stroke="${borderColor}" stroke-width="${borderWidth}"` : ''}
      />`;
    }).join('\n    ');

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize.width}" height="${canvasSize.height}" viewBox="0 0 ${canvasSize.width} ${canvasSize.height}">
  <defs>
    ${zones.filter(z => z.style?.shadowEnabled !== false).map(zone => `
    <filter id="shadow-${zone.id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="rgba(0,0,0,0.1)"/>
    </filter>`).join('')}
  </defs>
  <rect width="${canvasSize.width}" height="${canvasSize.height}" fill="${bgColor}"/>
  ${zones.map(zone => {
    const fillColor = zone.style?.fillColor || '#ffffff';
    const fillOpacity = zone.style?.fillOpacity ?? 1;
    const cornerRadius = zone.style?.cornerRadius || 8;
    const shadowEnabled = zone.style?.shadowEnabled !== false;
    const borderWidth = zone.style?.borderWidth || 0;
    const borderColor = zone.style?.borderColor || '#e5e7eb';
    
    return `<rect 
      x="${zone.x}" 
      y="${zone.y}" 
      width="${zone.width}" 
      height="${zone.height}" 
      fill="${fillColor}" 
      fill-opacity="${fillOpacity}"
      rx="${cornerRadius}"
      ${shadowEnabled ? `filter="url(#shadow-${zone.id})"` : ''}
      ${borderWidth > 0 ? `stroke="${borderColor}" stroke-width="${borderWidth}"` : ''}
    />`;
  }).join('\n  ')}
</svg>`;
  };

  const exportAsJSON = async () => {
    setExporting(true);
    
    try {
      const spec = getExportJSON();
      const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `powerbi-spec-${canvasSize.width}x${canvasSize.height}.json`;
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success("Especificación JSON exportada");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Error al exportar JSON");
    } finally {
      setExporting(false);
    }
  };

  const copyShareableLink = () => {
    const spec = getExportJSON();
    const encoded = btoa(JSON.stringify(spec));
    const url = `${window.location.origin}?spec=${encoded}`;
    
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const exportOptions = [
    {
      id: 'png',
      icon: Image,
      title: 'Imagen PNG',
      description: 'Fondo limpio de alta resolución (2x) para usar directamente en Power BI Desktop',
      action: exportAsPNG,
      badge: 'Recomendado'
    },
    {
      id: 'svg',
      icon: FileCode,
      title: 'Vector SVG',
      description: 'Escalable sin pérdida de calidad',
      action: exportAsSVG,
    },
    {
      id: 'json',
      icon: FileJson,
      title: 'Especificación JSON',
      description: 'Posiciones y dimensiones de cada área para el equipo de desarrollo',
      action: exportAsJSON,
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Exportar Diseño</DialogTitle>
          <DialogDescription>
            La imagen exportada contendrá solo el fondo y los recuadros (sin etiquetas), lista para usar en Power BI
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Info Alert */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              La imagen PNG exportada será el fondo limpio. En Power BI Desktop, agrégala como imagen de fondo del reporte y luego coloca los visuales encima siguiendo las posiciones definidas.
            </AlertDescription>
          </Alert>

          {/* Canvas Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Canvas: {canvasSize.width} × {canvasSize.height} px</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {zones.length} recuadro{zones.length !== 1 ? 's' : ''} definido{zones.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={copyShareableLink}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado' : 'Copiar link'}
              </Button>
            </div>
          </div>

          {/* Export Options */}
          <div className="grid gap-3">
            {exportOptions.map((option) => (
              <Card 
                key={option.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={option.action}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <option.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{option.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {option.description}
                        </CardDescription>
                      </div>
                    </div>
                    {option.badge && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {option.badge}
                      </span>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>

        {/* Loading overlay */}
        {exporting && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Exportando...</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
