import { useState } from "react";
import {
  LayoutTemplate,
  BarChart3,
  LineChart,
  PieChart,
  CircleDot,
  Table,
  Grid3X3,
  Filter,
  Map,
  Type,
  Image,
  Square,
  Layers,
  Palette,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useDesignerStore, { ZONE_TYPES, LAYOUT_TEMPLATES } from "@/store/designerStore";
import { toast } from "sonner";

const iconMap = {
  LayoutTemplate,
  BarChart3,
  LineChart,
  PieChart,
  CircleDot,
  Table,
  Grid3X3,
  Filter,
  Map,
  Type,
  Image,
  Square
};

const Sidebar = ({ onOpenTemplates }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { addZone } = useDesignerStore();

  const filteredZoneTypes = Object.entries(ZONE_TYPES).filter(([key, type]) =>
    type.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddZone = (type) => {
    addZone(type);
    toast.success(`${ZONE_TYPES[type].label} agregado`);
  };

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData("zoneType", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <aside className="w-64 bg-[#1e1e2e] border-r border-[#2d2d3b] flex flex-col flex-shrink-0">
      {/* Tabs */}
      <Tabs defaultValue="elements" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 bg-[#2d2d3b] m-3 mb-0">
          <TabsTrigger 
            value="elements" 
            className="text-xs data-[state=active]:bg-[#3d3d4b] data-[state=active]:text-white text-[#a1a1aa]"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Elementos
          </TabsTrigger>
          <TabsTrigger 
            value="templates"
            className="text-xs data-[state=active]:bg-[#3d3d4b] data-[state=active]:text-white text-[#a1a1aa]"
          >
            <LayoutTemplate className="w-3.5 h-3.5 mr-1.5" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Elements Tab */}
        <TabsContent value="elements" className="flex-1 flex flex-col mt-0">
          {/* Search */}
          <div className="p-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a1a1aa]" />
              <Input
                data-testid="element-search"
                placeholder="Buscar elementos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm bg-[#2d2d3b] border-[#3d3d4b] text-white placeholder:text-[#a1a1aa]"
              />
            </div>
          </div>

          {/* Elements List */}
          <ScrollArea className="flex-1 sidebar-scroll">
            <div className="p-3 pt-0 space-y-1">
              {filteredZoneTypes.map(([type, config]) => {
                const IconComponent = iconMap[config.icon] || Square;
                return (
                  <div
                    key={type}
                    data-testid={`element-${type}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, type)}
                    onClick={() => handleAddZone(type)}
                    className="flex items-center gap-3 p-2.5 rounded-lg cursor-grab active:cursor-grabbing hover:bg-[#2d2d3b] transition-colors group"
                  >
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${config.color}20` }}
                    >
                      <IconComponent 
                        className="w-4.5 h-4.5" 
                        style={{ color: config.color }}
                      />
                    </div>
                    <span className="text-sm text-[#e2e2e2] group-hover:text-white transition-colors">
                      {config.label}
                    </span>
                  </div>
                );
              })}

              {filteredZoneTypes.length === 0 && (
                <div className="text-center py-8 text-[#a1a1aa] text-sm">
                  No se encontraron elementos
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Help text */}
          <div className="p-3 border-t border-[#2d2d3b]">
            <p className="text-[10px] text-[#a1a1aa] text-center">
              Arrastra o haz clic para agregar al canvas
            </p>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="flex-1 flex flex-col mt-0">
          <ScrollArea className="flex-1 sidebar-scroll">
            <div className="p-3 space-y-2">
              {LAYOUT_TEMPLATES.map((template) => (
                <TemplateCard 
                  key={template.id} 
                  template={template}
                  onClick={onOpenTemplates}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
};

const TemplateCard = ({ template, onClick }) => {
  const { loadTemplate } = useDesignerStore();

  const handleClick = () => {
    loadTemplate(template.id);
    toast.success(`Template "${template.name}" cargado`);
  };

  return (
    <div
      data-testid={`template-${template.id}`}
      onClick={handleClick}
      className="p-3 rounded-lg bg-[#2d2d3b] hover:bg-[#3d3d4b] cursor-pointer transition-colors group"
    >
      {/* Mini preview */}
      <div className="aspect-video bg-[#1e1e2e] rounded mb-2 p-1.5 relative overflow-hidden">
        {template.zones.slice(0, 6).map((zone, idx) => (
          <div
            key={idx}
            className="absolute bg-primary/30 border border-primary/40 rounded-sm"
            style={{
              left: `${(zone.x / 1280) * 100}%`,
              top: `${(zone.y / 720) * 100}%`,
              width: `${(zone.width / 1280) * 100}%`,
              height: `${(zone.height / 720) * 100}%`,
            }}
          />
        ))}
        {template.zones.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-[#a1a1aa]">Canvas vacío</span>
          </div>
        )}
      </div>
      <h4 className="text-sm font-medium text-white mb-0.5">{template.name}</h4>
      <p className="text-[11px] text-[#a1a1aa]">{template.description}</p>
    </div>
  );
};

export default Sidebar;
