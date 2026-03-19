import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { toast } from "sonner";
import {
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Type,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useDesignerStore, { 
  ZONE_TYPES, 
  BACKGROUND_PRESETS, 
  CARD_COLOR_PRESETS
} from "@/store/designerStore";

const PropertiesPanel = () => {
  const {
    selectedZoneId,
    zones,
    updateZone,
    deleteZone,
    duplicateZone,
    bringForward,
    sendBackward,
    alignZones,
    background,
    setBackground,
    defaultZoneStyle,
    setDefaultZoneStyle
  } = useDesignerStore();

  const selectedZone = zones.find(z => z.id === selectedZoneId);

  return (
    <TooltipProvider>
      <aside className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
        <Tabs defaultValue="properties" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 bg-gray-100 m-3 mb-0">
            <TabsTrigger value="properties" className="text-xs">
              Propiedades
            </TabsTrigger>
            <TabsTrigger value="theme" className="text-xs">
              Tema
            </TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties" className="flex-1 flex flex-col mt-0 overflow-hidden">
            {selectedZone ? (
              <ZoneProperties
                zone={selectedZone}
                onUpdate={(updates) => updateZone(selectedZoneId, updates)}
                onDelete={() => {
                  deleteZone(selectedZoneId);
                  toast.success("Elemento eliminado");
                }}
                onDuplicate={() => {
                  duplicateZone(selectedZoneId);
                  toast.success("Elemento duplicado");
                }}
                onBringForward={() => bringForward(selectedZoneId)}
                onSendBackward={() => sendBackward(selectedZoneId)}
                onAlign={alignZones}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Type className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Selecciona un elemento para editar sus propiedades
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="flex-1 flex flex-col mt-0 overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Background Section */}
                <BackgroundSection
                  background={background}
                  onUpdate={setBackground}
                />

                <Separator />

                {/* Default Card Style */}
                <DefaultStyleSection
                  style={defaultZoneStyle}
                  onUpdate={setDefaultZoneStyle}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </aside>
    </TooltipProvider>
  );
};

// Zone Properties Component
const ZoneProperties = ({ zone, onUpdate, onDelete, onDuplicate, onBringForward, onSendBackward, onAlign }) => {
  const typeConfig = ZONE_TYPES[zone.type];
  const { copyZone } = useDesignerStore();

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-6">
        {/* Zone Title - Prominent */}
        <div className="property-group bg-gradient-to-r from-indigo-50 to-purple-50 -mx-4 -mt-4 px-4 py-4 border-b">
          <Label className="property-label text-indigo-700 font-semibold flex items-center gap-2">
            <Type className="w-4 h-4" />
            Título del Elemento
          </Label>
          <Input
            data-testid="zone-label-input"
            value={zone.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="h-10 text-base font-medium mt-2 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400"
            placeholder="Escribe el título..."
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Este título aparece en el modo de edición
          </p>
        </div>

        {/* Zone Info */}
        <div className="property-group">
          <div className="flex items-center justify-between">
            <span className="property-label">Tipo de elemento</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700">
              {typeConfig?.label}
            </span>
          </div>
        </div>

        {/* Position */}
        <div className="property-group">
          <Label className="property-label">Posición</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">X</Label>
              <Input
                type="number"
                value={Math.round(zone.x)}
                onChange={(e) => onUpdate({ x: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Y</Label>
              <Input
                type="number"
                value={Math.round(zone.y)}
                onChange={(e) => onUpdate({ y: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="property-group">
          <Label className="property-label">Tamaño</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">Ancho</Label>
              <Input
                type="number"
                value={Math.round(zone.width)}
                onChange={(e) => onUpdate({ width: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Alto</Label>
              <Input
                type="number"
                value={Math.round(zone.height)}
                onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Style */}
        <div className="property-group">
          <Label className="property-label">Estilo del Recuadro</Label>
          <div className="space-y-3 mt-2">
            {/* Fill Color */}
            <div>
              <Label className="text-[10px] text-muted-foreground">Color de fondo</Label>
              <div className="flex gap-1 mt-1 mb-2">
                {CARD_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onUpdate({ style: { ...zone.style, fillColor: preset.color } })}
                    className={`w-6 h-6 rounded border-2 transition-all ${
                      zone.style?.fillColor === preset.color 
                        ? 'border-primary scale-110' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.label}
                  />
                ))}
              </div>
              <ColorPickerInput
                value={zone.style?.fillColor || '#ffffff'}
                onChange={(color) => onUpdate({ style: { ...zone.style, fillColor: color } })}
              />
            </div>

            {/* Fill Opacity */}
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Opacidad: {Math.round((zone.style?.fillOpacity ?? 1) * 100)}%
              </Label>
              <Slider
                value={[(zone.style?.fillOpacity ?? 1) * 100]}
                onValueChange={([value]) => onUpdate({ 
                  style: { ...zone.style, fillOpacity: value / 100 } 
                })}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            {/* Corner Radius */}
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Radio de esquinas: {zone.style?.cornerRadius || 8}px
              </Label>
              <Slider
                value={[zone.style?.cornerRadius || 8]}
                onValueChange={([value]) => onUpdate({ 
                  style: { ...zone.style, cornerRadius: value } 
                })}
                min={0}
                max={24}
                step={2}
                className="mt-2"
              />
            </div>

            {/* Shadow Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Sombra</Label>
              <Switch
                checked={zone.style?.shadowEnabled ?? true}
                onCheckedChange={(checked) => onUpdate({ 
                  style: { ...zone.style, shadowEnabled: checked } 
                })}
              />
            </div>

            {/* Border Width */}
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Borde: {zone.style?.borderWidth || 0}px
              </Label>
              <Slider
                value={[zone.style?.borderWidth || 0]}
                onValueChange={([value]) => onUpdate({ 
                  style: { ...zone.style, borderWidth: value } 
                })}
                min={0}
                max={4}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Border Color (only if border > 0) */}
            {(zone.style?.borderWidth || 0) > 0 && (
              <div>
                <Label className="text-[10px] text-muted-foreground">Color de borde</Label>
                <ColorPickerInput
                  value={zone.style?.borderColor || '#e5e7eb'}
                  onChange={(color) => onUpdate({ 
                    style: { ...zone.style, borderColor: color } 
                  })}
                />
              </div>
            )}
          </div>
        </div>

        {/* Alignment */}
        <div className="property-group">
          <Label className="property-label">Alineación</Label>
          <div className="flex gap-1 mt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onAlign('left')}>
                  <AlignLeft className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Izquierda</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onAlign('center')}>
                  <AlignCenter className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Centro</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onAlign('right')}>
                  <AlignRight className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Derecha</TooltipContent>
            </Tooltip>
            <div className="w-px bg-border mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onAlign('top')}>
                  <AlignStartVertical className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Arriba</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onAlign('middle')}>
                  <AlignCenterVertical className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Medio</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onAlign('bottom')}>
                  <AlignEndVertical className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Abajo</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Z-Order */}
        <div className="property-group">
          <Label className="property-label">Orden de Capas</Label>
          <div className="flex gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-1"
              onClick={onBringForward}
            >
              <ChevronUp className="w-3.5 h-3.5" />
              Adelante
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-1"
              onClick={onSendBackward}
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Atrás
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            data-testid="copy-zone-btn"
            onClick={() => {
              copyZone(zone.id);
              toast.success("Elemento copiado al portapapeles");
            }}
          >
            <Copy className="w-4 h-4" />
            Copiar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            data-testid="duplicate-zone-btn"
            onClick={onDuplicate}
          >
            <Copy className="w-4 h-4" />
            Duplicar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            data-testid="delete-zone-btn"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

// Color Picker Input Component
const ColorPickerInput = ({ value, onChange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex gap-2 items-center mt-1 cursor-pointer">
          <div 
            className="w-8 h-8 rounded border"
            style={{ backgroundColor: value }}
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-sm flex-1 font-mono"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="color-picker-wrapper">
          <HexColorPicker color={value} onChange={onChange} />
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Background Section Component
const BackgroundSection = ({ background, onUpdate }) => {
  return (
    <div>
      <Label className="property-label">Color de Fondo del Canvas</Label>
      
      {/* Presets */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {BACKGROUND_PRESETS.map((preset) => (
          <button
            key={preset.id}
            data-testid={`bg-preset-${preset.id}`}
            onClick={() => onUpdate(preset)}
            className={`p-2 rounded-lg border-2 transition-all ${
              background.color === preset.color 
                ? 'border-primary' 
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <div 
              className="w-full aspect-video rounded"
              style={{ backgroundColor: preset.color }}
            />
            <span className="text-[10px] text-muted-foreground mt-1 block truncate">
              {preset.label}
            </span>
          </button>
        ))}
      </div>

      {/* Custom Color */}
      <div className="mt-4">
        <Label className="text-[10px] text-muted-foreground">Color personalizado</Label>
        <ColorPickerInput
          value={background.color || '#f0f0f0'}
          onChange={(color) => onUpdate({ type: 'solid', color })}
        />
      </div>
    </div>
  );
};

// Default Style Section Component
const DefaultStyleSection = ({ style, onUpdate }) => {
  return (
    <div>
      <Label className="property-label">Estilo por Defecto de Cards</Label>
      <p className="text-[10px] text-muted-foreground mb-3">
        Aplica a nuevos elementos agregados
      </p>
      <div className="space-y-3">
        <div>
          <Label className="text-[10px] text-muted-foreground">Color de fondo</Label>
          <ColorPickerInput
            value={style.fillColor}
            onChange={(color) => onUpdate({ fillColor: color })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-[10px] text-muted-foreground">Sombra habilitada</Label>
          <Switch
            checked={style.shadowEnabled}
            onCheckedChange={(checked) => onUpdate({ shadowEnabled: checked })}
          />
        </div>

        <div>
          <Label className="text-[10px] text-muted-foreground">
            Radio de esquinas: {style.cornerRadius}px
          </Label>
          <Slider
            value={[style.cornerRadius]}
            onValueChange={([value]) => onUpdate({ cornerRadius: value })}
            min={0}
            max={24}
            step={2}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
