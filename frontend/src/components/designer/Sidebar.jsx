import { useState } from "react";
import {
  Square,
  BarChart3,
  LineChart,
  AreaChart,
  PieChart,
  CircleDot,
  BarChart,
  BarChartHorizontal,
  Hash,
  Table,
  Filter,
  PanelTop,
  LayoutList,
  Type,
  Search,
  Layers,
  LayoutTemplate,
  ChevronDown,
  ChevronRight,
  Wand2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import useDesignerStore, { ZONE_TYPES, LAYOUT_TEMPLATES } from "@/store/designerStore";
import { toast } from "sonner";

const iconMap = {
  Square,
  BarChart3,
  LineChart,
  AreaChart,
  PieChart,
  CircleDot,
  BarChart,
  BarChartHorizontal,
  Hash,
  Table,
  Filter,
  PanelTop,
  LayoutList,
  Type
};

const FRECUENTES = ['bar_chart', 'line_chart', 'kpi_card', 'table', 'filter_dropdown'];

const categoryOrder = [
  { key: 'charts', label: 'Más gráficos', types: ['area_chart', 'stacked_bar', 'horizontal_bar', 'pie_chart', 'donut_chart'] },
  { key: 'layout', label: 'Layout y texto', types: ['header', 'nav_tabs', 'text_box', 'card'] },
];

const Sidebar = ({ onOpenTemplates, onOpenWizard }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const { addZone } = useDesignerStore();

  const toggleCollapse = (key) => setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));

  const handleAddZone = (type) => {
    addZone(type);
    toast.success(`${ZONE_TYPES[type].label} agregado`);
  };

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData("zoneType", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  const filteredBySearch = (types) => {
    if (!searchQuery) return types;
    return types.filter(type => 
      ZONE_TYPES[type]?.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <aside className="w-64 bg-[#1e1e2e] border-r border-[#2d2d3b] flex flex-col flex-shrink-0">
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
          {/* Wizard shortcut */}
          {onOpenWizard && (
            <div className="px-3 pt-3 pb-1">
              <button
                onClick={onOpenWizard}
                className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 hover:border-indigo-400/60 transition-colors group"
              >
                <Wand2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span className="text-xs font-medium text-indigo-300 group-hover:text-indigo-200">
                  Generar layout automático
                </span>
              </button>
            </div>
          )}

          <div className="px-3 pt-2 pb-2">
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

          <ScrollArea className="flex-1 sidebar-scroll">
            <div className="px-3 pb-3 space-y-3">
              {/* Frequently used — always visible */}
              {!searchQuery && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#6b7280] mb-2">
                    Más usados
                  </div>
                  <div className="space-y-1">
                    {FRECUENTES.map(type => {
                      const config = ZONE_TYPES[type];
                      if (!config) return null;
                      const IconComponent = iconMap[config.icon] || Square;
                      return (
                        <ElementItem
                          key={type}
                          type={type}
                          config={config}
                          IconComponent={IconComponent}
                          onDragStart={handleDragStart}
                          onAdd={handleAddZone}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Collapsible categories */}
              {categoryOrder.map(category => {
                const types = filteredBySearch(category.types);
                if (types.length === 0) return null;
                const isOpen = searchQuery ? true : !collapsed[category.key];

                return (
                  <div key={category.key}>
                    <button
                      onClick={() => toggleCollapse(category.key)}
                      className="w-full flex items-center justify-between mb-2 group"
                    >
                      <span className="text-[10px] uppercase tracking-wider text-[#6b7280] group-hover:text-[#a1a1aa] transition-colors">
                        {category.label}
                      </span>
                      {searchQuery ? null : isOpen
                        ? <ChevronDown className="w-3 h-3 text-[#6b7280]" />
                        : <ChevronRight className="w-3 h-3 text-[#6b7280]" />
                      }
                    </button>
                    {isOpen && (
                      <div className="space-y-1">
                        {types.map(type => {
                          const config = ZONE_TYPES[type];
                          if (!config) return null;
                          const IconComponent = iconMap[config.icon] || Square;
                          return (
                            <ElementItem
                              key={type}
                              type={type}
                              config={config}
                              IconComponent={IconComponent}
                              onDragStart={handleDragStart}
                              onAdd={handleAddZone}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-[#2d2d3b]">
            <p className="text-[10px] text-[#a1a1aa] text-center">
              Arrastrá o hacé clic para agregar
            </p>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="flex-1 flex flex-col mt-0">
          <ScrollArea className="flex-1 sidebar-scroll">
            <div className="p-3 space-y-2">
              {LAYOUT_TEMPLATES.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
};

const ElementItem = ({ type, config, IconComponent, onDragStart, onAdd }) => (
  <div
    data-testid={`element-${type}`}
    draggable
    onDragStart={(e) => onDragStart(e, type)}
    onClick={() => onAdd(type)}
    className="flex items-center gap-3 p-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-[#2d2d3b] transition-colors group"
  >
    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#3d3d4b] flex-shrink-0">
      <IconComponent className="w-4 h-4 text-[#a1a1aa]" />
    </div>
    <span className="text-sm text-[#e2e2e2] group-hover:text-white transition-colors">
      {config.label}
    </span>
  </div>
);

const TemplateCard = ({ template }) => {
  const { loadTemplate, setBackground } = useDesignerStore();

  const handleClick = () => {
    loadTemplate(template.id);
    if (template.id !== 'blank') {
      setBackground({ type: 'solid', color: '#f0f0f0' });
    }
    toast.success(`Template "${template.name}" cargado`);
  };

  return (
    <div
      data-testid={`template-${template.id}`}
      onClick={handleClick}
      className="p-3 rounded-lg bg-[#2d2d3b] hover:bg-[#3d3d4b] cursor-pointer transition-colors"
    >
      <div className="aspect-video bg-[#e8e8e8] rounded mb-2 p-1 relative overflow-hidden">
        {template.zones.slice(0, 14).map((zone, idx) => (
          <div
            key={idx}
            className="absolute rounded-sm"
            style={{
              left: `${(zone.x / 1280) * 100}%`,
              top: `${(zone.y / 720) * 100}%`,
              width: `${(zone.width / 1280) * 100}%`,
              height: `${(zone.height / 720) * 100}%`,
              backgroundColor: zone.style?.fillColor || '#ffffff',
              boxShadow: zone.style?.shadowEnabled !== false ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}
          />
        ))}
        {template.zones.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] text-[#6b7280]">Canvas vacío</span>
          </div>
        )}
      </div>
      <h4 className="text-sm font-medium text-white mb-0.5">{template.name}</h4>
      <p className="text-[11px] text-[#a1a1aa]">{template.description}</p>
    </div>
  );
};

export default Sidebar;
