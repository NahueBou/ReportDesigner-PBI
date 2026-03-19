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
  Palette,
  Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  PALETTE_PRESETS 
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
    palette,
    setPalette,
    typography,
    setTypography,
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
                  toast.success("Zona eliminada");
                }}
                onDuplicate={() => {
                  duplicateZone(selectedZoneId);
                  toast.success("Zona duplicada");
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

                {/* Color Palette Section */}
                <PaletteSection
                  palette={palette}
                  onUpdate={setPalette}
                />

                <Separator />

                {/* Typography Section */}
                <TypographySection
                  typography={typography}
                  onUpdate={setTypography}
                />

                <Separator />

                {/* Default Zone Style */}
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

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-6">
        {/* Zone Info */}
        <div className="property-group">
          <div className="flex items-center justify-between mb-3">
            <span className="property-label">Tipo</span>
            <span 
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ backgroundColor: `${typeConfig?.color}20`, color: typeConfig?.color }}
            >
              {typeConfig?.label}
            </span>
          </div>
          
          <Label className="property-label">Etiqueta</Label>
          <Input
            data-testid="zone-label-input"
            value={zone.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="h-8 text-sm"
          />
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
          <Label className="property-label">Estilo</Label>
          <div className="space-y-3 mt-2">
            {/* Border Style */}
            <div>
              <Label className="text-[10px] text-muted-foreground">Tipo de borde</Label>
              <Select
                value={zone.style?.borderStyle || 'dashed'}
                onValueChange={(value) => onUpdate({ 
                  style: { ...zone.style, borderStyle: value } 
                })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Sólido</SelectItem>
                  <SelectItem value="dashed">Discontinuo</SelectItem>
                  <SelectItem value="none">Sin borde</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Border Color */}
            <div>
              <Label className="text-[10px] text-muted-foreground">Color de borde</Label>
              <ColorPickerInput
                value={zone.style?.borderColor || '#e5e7eb'}
                onChange={(color) => onUpdate({ 
                  style: { ...zone.style, borderColor: color } 
                })}
              />
            </div>

            {/* Border Width */}
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Grosor: {zone.style?.borderWidth || 2}px
              </Label>
              <Slider
                value={[zone.style?.borderWidth || 2]}
                onValueChange={([value]) => onUpdate({ 
                  style: { ...zone.style, borderWidth: value } 
                })}
                min={0}
                max={6}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Fill Color */}
            <div>
              <Label className="text-[10px] text-muted-foreground">Color de relleno</Label>
              <ColorPickerInput
                value={zone.style?.fillColor || '#ffffff'}
                onChange={(color) => onUpdate({ 
                  style: { ...zone.style, fillColor: color } 
                })}
              />
            </div>

            {/* Fill Opacity */}
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Opacidad: {Math.round((zone.style?.fillOpacity ?? 0.1) * 100)}%
              </Label>
              <Slider
                value={[(zone.style?.fillOpacity ?? 0.1) * 100]}
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
                Radio: {zone.style?.cornerRadius || 8}px
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
          <Label className="property-label">Orden Z</Label>
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
      <Label className="property-label">Fondo del Canvas</Label>
      
      {/* Presets */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {BACKGROUND_PRESETS.map((preset) => (
          <button
            key={preset.id}
            data-testid={`bg-preset-${preset.id}`}
            onClick={() => onUpdate(preset)}
            className={`p-2 rounded-lg border-2 transition-all ${
              background.id === preset.id 
                ? 'border-primary' 
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <div 
              className="w-full aspect-video rounded"
              style={{ 
                background: preset.type === 'gradient' 
                  ? `linear-gradient(${preset.direction === 'vertical' ? 'to bottom' : preset.direction === 'diagonal' ? 'to bottom right' : 'to right'}, ${preset.colors[0]}, ${preset.colors[1]})`
                  : preset.color 
              }}
            />
            <span className="text-[10px] text-muted-foreground mt-1 block truncate">
              {preset.label}
            </span>
          </button>
        ))}
      </div>

      {/* Custom Color */}
      {background.type === 'solid' && (
        <div className="mt-3">
          <Label className="text-[10px] text-muted-foreground">Color personalizado</Label>
          <ColorPickerInput
            value={background.color}
            onChange={(color) => onUpdate({ ...background, color })}
          />
        </div>
      )}
    </div>
  );
};

// Palette Section Component
const PaletteSection = ({ palette, onUpdate }) => {
  return (
    <div>
      <Label className="property-label">Paleta de Colores</Label>
      
      {/* Current palette */}
      <div className="flex gap-1 mt-3">
        {palette.map((color, idx) => (
          <Popover key={idx}>
            <PopoverTrigger asChild>
              <button
                className="palette-swatch flex-1 aspect-square"
                style={{ backgroundColor: color }}
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <div className="color-picker-wrapper">
                <HexColorPicker 
                  color={color} 
                  onChange={(newColor) => {
                    const newPalette = [...palette];
                    newPalette[idx] = newColor;
                    onUpdate(newPalette);
                  }} 
                />
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>

      {/* Preset palettes */}
      <div className="mt-3 space-y-2">
        <Label className="text-[10px] text-muted-foreground">Presets</Label>
        {PALETTE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            data-testid={`palette-${preset.id}`}
            onClick={() => onUpdate(preset.colors)}
            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex gap-0.5">
              {preset.colors.slice(0, 6).map((color, idx) => (
                <div 
                  key={idx}
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Typography Section Component
const TypographySection = ({ typography, onUpdate }) => {
  return (
    <div>
      <Label className="property-label">Tipografía</Label>
      <div className="space-y-3 mt-3">
        <div>
          <Label className="text-[10px] text-muted-foreground">Fuente</Label>
          <Select
            value={typography.fontFamily}
            onValueChange={(value) => onUpdate({ fontFamily: value })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Segoe UI">Segoe UI</SelectItem>
              <SelectItem value="Calibri">Calibri</SelectItem>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="DM Sans">DM Sans</SelectItem>
              <SelectItem value="Inter">Inter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[10px] text-muted-foreground">
            Título: {typography.titleSize}px
          </Label>
          <Slider
            value={[typography.titleSize]}
            onValueChange={([value]) => onUpdate({ titleSize: value })}
            min={10}
            max={36}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-[10px] text-muted-foreground">
            Cuerpo: {typography.bodySize}px
          </Label>
          <Slider
            value={[typography.bodySize]}
            onValueChange={([value]) => onUpdate({ bodySize: value })}
            min={8}
            max={24}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-[10px] text-muted-foreground">Color de texto</Label>
          <ColorPickerInput
            value={typography.fontColor}
            onChange={(color) => onUpdate({ fontColor: color })}
          />
        </div>
      </div>
    </div>
  );
};

// Default Style Section Component
const DefaultStyleSection = ({ style, onUpdate }) => {
  return (
    <div>
      <Label className="property-label">Estilo por Defecto</Label>
      <div className="space-y-3 mt-3">
        <div>
          <Label className="text-[10px] text-muted-foreground">Color de borde</Label>
          <ColorPickerInput
            value={style.borderColor}
            onChange={(color) => onUpdate({ borderColor: color })}
          />
        </div>

        <div>
          <Label className="text-[10px] text-muted-foreground">
            Opacidad de relleno: {Math.round(style.fillOpacity * 100)}%
          </Label>
          <Slider
            value={[style.fillOpacity * 100]}
            onValueChange={([value]) => onUpdate({ fillOpacity: value / 100 })}
            min={0}
            max={100}
            step={5}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
