import { useState } from "react";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  CircleDot,
  AreaChart,
  ScatterChart,
  LayoutGrid,
  Gauge,
  LayoutTemplate,
  Table,
  Grid3X3,
  Filter,
  Map,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { COMPONENT_TYPES, COMPONENT_CATEGORIES } from "@/lib/utils";

const iconMap = {
  BarChart3: BarChart3,
  LineChart: LineChart,
  PieChart: PieChart,
  CircleDot: CircleDot,
  AreaChart: AreaChart,
  ScatterChart: ScatterChart,
  LayoutGrid: LayoutGrid,
  Gauge: Gauge,
  LayoutTemplate: LayoutTemplate,
  Table: Table,
  Grid3X3: Grid3X3,
  Filter: Filter,
  Map: Map,
};

const ComponentsSidebar = ({ onAddComponent }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedType, setDraggedType] = useState(null);

  const filteredComponents = COMPONENT_TYPES.filter(comp =>
    comp.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedComponents = Object.entries(COMPONENT_CATEGORIES).reduce((acc, [key, label]) => {
    const components = filteredComponents.filter(c => c.category === key);
    if (components.length > 0) {
      acc[key] = { label, components };
    }
    return acc;
  }, {});

  const handleDragStart = (e, componentType) => {
    setDraggedType(componentType);
    e.dataTransfer.setData("componentType", componentType);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = () => {
    setDraggedType(null);
  };

  return (
    <aside className="w-60 border-r bg-background flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
          Componentes
        </h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="component-search"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Components List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {Object.entries(groupedComponents).map(([category, { label, components }]) => (
            <div key={category}>
              <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
                {label}
              </h3>
              <div className="space-y-1.5">
                {components.map((comp) => {
                  const IconComponent = iconMap[comp.icon] || LayoutTemplate;
                  return (
                    <div
                      key={comp.type}
                      data-testid={`component-${comp.type}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, comp.type)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onAddComponent(comp.type)}
                      className={`sidebar-component-item ${
                        draggedType === comp.type ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center bg-primary/5`}>
                        <IconComponent className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground truncate">
                        {comp.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {Object.keys(groupedComponents).length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No se encontraron componentes
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Help text */}
      <div className="p-4 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Arrastra o haz clic para agregar
        </p>
      </div>
    </aside>
  );
};

export default ComponentsSidebar;
