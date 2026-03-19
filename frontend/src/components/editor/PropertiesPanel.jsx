import { Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";

const PropertiesPanel = ({ 
  component, 
  onUpdateComponent, 
  onDeleteComponent, 
  onDuplicateComponent 
}) => {
  if (!component) {
    return (
      <aside className="w-64 border-l bg-background flex flex-col flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            Propiedades
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Selecciona un componente para ver sus propiedades
          </p>
        </div>
      </aside>
    );
  }

  const handlePositionChange = (key, value) => {
    onUpdateComponent({
      position: {
        ...component.position,
        [key]: parseFloat(value) || 0
      }
    });
  };

  const handleStyleChange = (key, value) => {
    onUpdateComponent({
      style: {
        ...component.style,
        [key]: value
      }
    });
  };

  const handleLabelChange = (value) => {
    onUpdateComponent({ label: value });
  };

  return (
    <aside className="w-64 border-l bg-background flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Propiedades
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Component Info */}
          <div className="property-group">
            <Label className="property-label">Etiqueta</Label>
            <Input
              data-testid="component-label-input"
              value={component.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          {/* Position */}
          <div className="property-group">
            <Label className="property-label">Posición</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">X</Label>
                <Input
                  data-testid="position-x-input"
                  type="number"
                  value={Math.round(component.position.x)}
                  onChange={(e) => handlePositionChange('x', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Y</Label>
                <Input
                  data-testid="position-y-input"
                  type="number"
                  value={Math.round(component.position.y)}
                  onChange={(e) => handlePositionChange('y', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Size */}
          <div className="property-group">
            <Label className="property-label">Tamaño</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">Ancho</Label>
                <Input
                  data-testid="size-width-input"
                  type="number"
                  value={Math.round(component.position.width)}
                  onChange={(e) => handlePositionChange('width', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Alto</Label>
                <Input
                  data-testid="size-height-input"
                  type="number"
                  value={Math.round(component.position.height)}
                  onChange={(e) => handlePositionChange('height', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Style */}
          <div className="property-group">
            <Label className="property-label">Estilo</Label>
            
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] text-muted-foreground">Color de fondo</Label>
                <div className="flex gap-2 items-center">
                  <input
                    data-testid="bg-color-input"
                    type="color"
                    value={component.style?.backgroundColor || '#FFFFFF'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={component.style?.backgroundColor || '#FFFFFF'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="h-8 text-sm flex-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[10px] text-muted-foreground">Color de borde</Label>
                <div className="flex gap-2 items-center">
                  <input
                    data-testid="border-color-input"
                    type="color"
                    value={component.style?.borderColor || '#E5E7EB'}
                    onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <Input
                    value={component.style?.borderColor || '#E5E7EB'}
                    onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                    className="h-8 text-sm flex-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[10px] text-muted-foreground">
                  Grosor de borde: {component.style?.borderWidth || 1}px
                </Label>
                <Slider
                  data-testid="border-width-slider"
                  value={[component.style?.borderWidth || 1]}
                  onValueChange={([value]) => handleStyleChange('borderWidth', value)}
                  min={0}
                  max={5}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-[10px] text-muted-foreground">
                  Radio de borde: {component.style?.borderRadius || 4}px
                </Label>
                <Slider
                  data-testid="border-radius-slider"
                  value={[component.style?.borderRadius || 4]}
                  onValueChange={([value]) => handleStyleChange('borderRadius', value)}
                  min={0}
                  max={20}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        <Button
          variant="outline"
          size="sm"
          data-testid="duplicate-component-btn"
          onClick={onDuplicateComponent}
          className="w-full gap-2"
        >
          <Copy className="w-4 h-4" />
          Duplicar
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-testid="delete-component-btn"
          onClick={onDeleteComponent}
          className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar
        </Button>
      </div>
    </aside>
  );
};

export default PropertiesPanel;
