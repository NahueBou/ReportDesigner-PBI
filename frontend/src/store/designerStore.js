import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Zone types with visualization previews
export const ZONE_TYPES = {
  card: { label: 'Recuadro Vacío', icon: 'Square', defaultSize: { width: 300, height: 200 }, visualization: 'none' },
  bar_chart: { label: 'Gráfico de Barras', icon: 'BarChart3', defaultSize: { width: 350, height: 250 }, visualization: 'bar' },
  line_chart: { label: 'Gráfico de Líneas', icon: 'LineChart', defaultSize: { width: 350, height: 250 }, visualization: 'line' },
  area_chart: { label: 'Gráfico de Área', icon: 'AreaChart', defaultSize: { width: 350, height: 250 }, visualization: 'area' },
  pie_chart: { label: 'Gráfico Circular', icon: 'PieChart', defaultSize: { width: 250, height: 250 }, visualization: 'pie' },
  donut_chart: { label: 'Gráfico de Dona', icon: 'CircleDot', defaultSize: { width: 250, height: 250 }, visualization: 'donut' },
  stacked_bar: { label: 'Barras Apiladas', icon: 'BarChart', defaultSize: { width: 350, height: 280 }, visualization: 'stacked_bar' },
  horizontal_bar: { label: 'Barras Horizontales', icon: 'BarChartHorizontal', defaultSize: { width: 300, height: 280 }, visualization: 'horizontal_bar' },
  kpi_card: { label: 'Tarjeta KPI', icon: 'Hash', defaultSize: { width: 200, height: 120 }, visualization: 'kpi' },
  table: { label: 'Tabla', icon: 'Table', defaultSize: { width: 400, height: 280 }, visualization: 'table' },
  filter_dropdown: { label: 'Filtro/Dropdown', icon: 'Filter', defaultSize: { width: 150, height: 50 }, visualization: 'filter' },
  header: { label: 'Header/Título', icon: 'PanelTop', defaultSize: { width: 800, height: 50 }, visualization: 'header' },
  nav_tabs: { label: 'Tabs de Navegación', icon: 'LayoutList', defaultSize: { width: 600, height: 40 }, visualization: 'tabs' },
  text_box: { label: 'Texto', icon: 'Type', defaultSize: { width: 200, height: 40 }, visualization: 'text' },
};

// Canvas size presets
export const CANVAS_SIZES = [
  { label: '1280 × 720 (Power BI Default)', width: 1280, height: 720 },
  { label: '1920 × 1080 (Full HD)', width: 1920, height: 1080 },
  { label: '1600 × 900', width: 1600, height: 900 },
];

// Background presets
export const BACKGROUND_PRESETS = [
  { id: 'light_gray', label: 'Gris Claro', type: 'solid', color: '#f0f0f0' },
  { id: 'white', label: 'Blanco', type: 'solid', color: '#ffffff' },
  { id: 'soft_gray', label: 'Gris Suave', type: 'solid', color: '#e8e8e8' },
  { id: 'cream', label: 'Crema', type: 'solid', color: '#f5f5f0' },
  { id: 'light_blue', label: 'Azul Claro', type: 'solid', color: '#f0f4f8' },
  { id: 'dark_navy', label: 'Azul Oscuro', type: 'solid', color: '#1a2744' },
];

// Card color presets
export const CARD_COLOR_PRESETS = [
  { id: 'white', label: 'Blanco', color: '#ffffff' },
  { id: 'light_gray', label: 'Gris Claro', color: '#f8f9fa' },
  { id: 'navy', label: 'Azul Marino', color: '#1a365d' },
  { id: 'blue', label: 'Azul', color: '#2563eb' },
  { id: 'teal', label: 'Verde Azulado', color: '#0d9488' },
  { id: 'orange', label: 'Naranja', color: '#ea580c' },
];

// Chart color palettes
export const CHART_PALETTES = {
  default: ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'],
  elea: ['#003366', '#0066cc', '#00a1e4', '#f7941d', '#808080', '#333333'],
  corporate: ['#1a365d', '#2563eb', '#0d9488', '#f59e0b', '#dc2626', '#7c3aed'],
  pastel: ['#93c5fd', '#fcd34d', '#86efac', '#fca5a5', '#c4b5fd', '#f9a8d4'],
};

// Layout templates with visualizations
export const LAYOUT_TEMPLATES = [
  {
    id: 'elea_seleccion',
    name: 'Elea Selección',
    description: 'Layout similar al mockup de referencia con gráficos',
    zones: [
      { type: 'header', label: 'Elea Selección', x: 0, y: 0, width: 1280, height: 55, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: false, borderWidth: 0 }, visualConfig: { title: 'Elea', subtitle: 'Selección', logoColor: '#003366' } },
      { type: 'nav_tabs', label: 'KPIs Búsquedas Cerradas', x: 0, y: 55, width: 560, height: 35, style: { fillColor: '#003366', fillOpacity: 1, shadowEnabled: false, borderWidth: 0 }, visualConfig: { active: true } },
      { type: 'nav_tabs', label: 'Detalle Búsquedas', x: 560, y: 55, width: 720, height: 35, style: { fillColor: '#e0e0e0', fillOpacity: 1, shadowEnabled: false, borderWidth: 0 }, visualConfig: { active: false } },
      { type: 'filter_dropdown', label: 'Dirección', x: 40, y: 105, width: 130, height: 45, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'filter_dropdown', label: 'Gerencia', x: 180, y: 105, width: 130, height: 45, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'filter_dropdown', label: 'Área', x: 320, y: 105, width: 130, height: 45, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'stacked_bar', label: 'Estado de Búsquedas', x: 25, y: 165, width: 295, height: 290, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'stacked_bar', label: 'Tiempo Promedio de Cierre', x: 330, y: 165, width: 240, height: 290, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'horizontal_bar', label: 'Ranking Tiempo Promedio', x: 580, y: 165, width: 250, height: 290, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'horizontal_bar', label: 'Ranking Cantidad', x: 840, y: 165, width: 250, height: 290, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'bar_chart', label: 'Tiempo Promedio por Etapa', x: 25, y: 470, width: 295, height: 220, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'stacked_bar', label: 'Fuente de Búsquedas Cerradas', x: 330, y: 470, width: 240, height: 220, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'stacked_bar', label: 'Motivo de Búsquedas', x: 580, y: 470, width: 250, height: 220, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'horizontal_bar', label: 'Motivo de Reemplazo', x: 840, y: 470, width: 250, height: 220, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
    ]
  },
  {
    id: 'executive',
    name: 'Dashboard Ejecutivo',
    description: '4 KPIs + gráficos principales',
    zones: [
      { type: 'header', label: 'Dashboard Ejecutivo', x: 0, y: 0, width: 1280, height: 50, style: { fillColor: '#1a365d', fillOpacity: 1, shadowEnabled: false, borderWidth: 0 } },
      { type: 'kpi_card', label: 'Ventas Totales', x: 40, y: 70, width: 200, height: 100, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true }, visualConfig: { value: '$1.2M', trend: '+12%', trendUp: true } },
      { type: 'kpi_card', label: 'Órdenes', x: 260, y: 70, width: 200, height: 100, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true }, visualConfig: { value: '3,456', trend: '+8%', trendUp: true } },
      { type: 'kpi_card', label: 'Clientes', x: 480, y: 70, width: 200, height: 100, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true }, visualConfig: { value: '892', trend: '+15%', trendUp: true } },
      { type: 'kpi_card', label: 'Ticket Promedio', x: 700, y: 70, width: 200, height: 100, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true }, visualConfig: { value: '$347', trend: '-2%', trendUp: false } },
      { type: 'bar_chart', label: 'Ventas por Región', x: 40, y: 190, width: 420, height: 280, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'line_chart', label: 'Tendencia Mensual', x: 480, y: 190, width: 420, height: 280, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'donut_chart', label: 'Por Categoría', x: 920, y: 190, width: 320, height: 280, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'table', label: 'Top Productos', x: 40, y: 490, width: 600, height: 200, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'horizontal_bar', label: 'Por Vendedor', x: 660, y: 490, width: 580, height: 200, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
    ]
  },
  {
    id: 'sales',
    name: 'Dashboard de Ventas',
    description: 'Panel de filtros lateral + métricas',
    zones: [
      { type: 'header', label: 'Análisis de Ventas', x: 0, y: 0, width: 1280, height: 55, style: { fillColor: '#1a365d', fillOpacity: 1, shadowEnabled: false, borderWidth: 0 } },
      { type: 'card', label: 'Filtros', x: 25, y: 75, width: 180, height: 400, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'kpi_card', label: 'Revenue', x: 225, y: 75, width: 200, height: 95, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true }, visualConfig: { value: '$2.4M', trend: '+18%', trendUp: true } },
      { type: 'kpi_card', label: 'Orders', x: 445, y: 75, width: 200, height: 95, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true }, visualConfig: { value: '5,672', trend: '+12%', trendUp: true } },
      { type: 'kpi_card', label: 'Customers', x: 665, y: 75, width: 200, height: 95, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true }, visualConfig: { value: '1,234', trend: '+25%', trendUp: true } },
      { type: 'line_chart', label: 'Sales Trend', x: 225, y: 190, width: 520, height: 285, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'pie_chart', label: 'By Region', x: 765, y: 190, width: 250, height: 285, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'table', label: 'Sales Details', x: 225, y: 495, width: 790, height: 195, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
    ]
  },
  {
    id: 'operational',
    name: 'Dashboard Operacional',
    description: '6 KPIs + gráficos de seguimiento',
    zones: [
      { type: 'text_box', label: 'Dashboard Operacional', x: 30, y: 15, width: 350, height: 35, style: { fillColor: '#1a365d', fillOpacity: 1, shadowEnabled: false, borderWidth: 0 } },
      { type: 'kpi_card', label: 'Producción', x: 30, y: 65, width: 195, height: 90, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true }, visualConfig: { value: '12,450', trend: '+5%', trendUp: true } },
      { type: 'kpi_card', label: 'Eficiencia', x: 240, y: 65, width: 195, height: 90, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true }, visualConfig: { value: '94.2%', trend: '+2%', trendUp: true } },
      { type: 'kpi_card', label: 'Defectos', x: 450, y: 65, width: 195, height: 90, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true }, visualConfig: { value: '23', trend: '-15%', trendUp: true } },
      { type: 'kpi_card', label: 'Tiempo Ciclo', x: 660, y: 65, width: 195, height: 90, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true }, visualConfig: { value: '4.2h', trend: '-8%', trendUp: true } },
      { type: 'kpi_card', label: 'OEE', x: 870, y: 65, width: 195, height: 90, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true }, visualConfig: { value: '87%', trend: '+3%', trendUp: true } },
      { type: 'kpi_card', label: 'Uptime', x: 1080, y: 65, width: 170, height: 90, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true }, visualConfig: { value: '99.1%', trend: '+0.5%', trendUp: true } },
      { type: 'area_chart', label: 'Producción Diaria', x: 30, y: 175, width: 610, height: 250, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'bar_chart', label: 'Por Línea', x: 660, y: 175, width: 590, height: 250, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'table', label: 'Detalle de Órdenes', x: 30, y: 445, width: 1220, height: 245, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
    ]
  },
  {
    id: 'simple',
    name: 'Layout Simple',
    description: '4 áreas grandes para personalizar',
    zones: [
      { type: 'card', label: 'Área 1', x: 40, y: 40, width: 590, height: 310, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'card', label: 'Área 2', x: 650, y: 40, width: 590, height: 310, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'card', label: 'Área 3', x: 40, y: 370, width: 590, height: 310, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
      { type: 'card', label: 'Área 4', x: 650, y: 370, width: 590, height: 310, style: { fillColor: '#ffffff', fillOpacity: 1, shadowEnabled: true } },
    ]
  },
  {
    id: 'blank',
    name: 'Canvas en Blanco',
    description: 'Comenzar desde cero',
    zones: []
  }
];

// Generate unique ID
const generateId = () => `zone_${uuidv4().slice(0, 8)}`;
const generatePageId = () => `page_${uuidv4().slice(0, 8)}`;

// Create default page
const createDefaultPage = (id, name = 'Página 1') => ({
  id,
  name,
  zones: [],
  background: { type: 'solid', color: '#f0f0f0' },
});

// Create the store
const useDesignerStore = create((set, get) => ({
  // Canvas settings
  canvasSize: { width: 1280, height: 720 },
  showGrid: true,
  zoom: 1,
  chartPalette: 'default',
  
  // Multi-page support
  pages: [createDefaultPage('page_default', 'Página 1')],
  currentPageId: 'page_default',
  
  // Get current page helper
  getCurrentPage: () => {
    const state = get();
    return state.pages.find(p => p.id === state.currentPageId) || state.pages[0];
  },
  
  // Elements (computed from current page)
  get zones() {
    return get().getCurrentPage()?.zones || [];
  },
  selectedZoneId: null,
  
  // Alignment guides
  alignmentGuides: [],
  showAlignmentGuides: true,
  
  // Theme settings
  defaultZoneStyle: {
    fillColor: '#ffffff',
    fillOpacity: 1,
    borderColor: '#e5e7eb',
    borderWidth: 0,
    cornerRadius: 8,
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowBlur: 10,
    shadowOffsetX: 0,
    shadowOffsetY: 4
  },
  
  // History for undo/redo
  history: [],
  historyIndex: -1,
  
  // Clipboard for copy/paste
  clipboard: null,
  
  // Preview/Export mode - hides labels and visualization previews
  previewMode: false,
  // Show visualizations toggle
  showVisualizations: true,
  
  // Page management
  addPage: (name = null) => {
    const state = get();
    const pageNum = state.pages.length + 1;
    const newPage = createDefaultPage(generatePageId(), name || `Página ${pageNum}`);
    set({
      pages: [...state.pages, newPage],
      currentPageId: newPage.id,
      selectedZoneId: null
    });
    return newPage.id;
  },
  
  deletePage: (pageId) => {
    const state = get();
    if (state.pages.length <= 1) return; // Can't delete last page
    
    const newPages = state.pages.filter(p => p.id !== pageId);
    const newCurrentId = pageId === state.currentPageId 
      ? newPages[0].id 
      : state.currentPageId;
    
    set({
      pages: newPages,
      currentPageId: newCurrentId,
      selectedZoneId: null
    });
  },
  
  duplicatePage: (pageId) => {
    const state = get();
    const page = state.pages.find(p => p.id === pageId);
    if (!page) return;
    
    const newPage = {
      ...page,
      id: generatePageId(),
      name: `${page.name} (copia)`,
      zones: page.zones.map(z => ({ ...z, id: generateId() }))
    };
    
    set({
      pages: [...state.pages, newPage],
      currentPageId: newPage.id,
      selectedZoneId: null
    });
    return newPage.id;
  },
  
  renamePage: (pageId, name) => {
    set((state) => ({
      pages: state.pages.map(p => 
        p.id === pageId ? { ...p, name } : p
      )
    }));
  },
  
  setCurrentPage: (pageId) => {
    set({ currentPageId: pageId, selectedZoneId: null });
  },
  
  // Get zones for current page
  getZones: () => {
    const state = get();
    const page = state.pages.find(p => p.id === state.currentPageId);
    return page?.zones || [];
  },
  
  // Get background for current page
  getBackground: () => {
    const state = get();
    const page = state.pages.find(p => p.id === state.currentPageId);
    return page?.background || { type: 'solid', color: '#f0f0f0' };
  },
  
  // Actions
  setCanvasSize: (size) => set({ canvasSize: size }),
  setBackground: (bg) => {
    set((state) => ({
      pages: state.pages.map(p => 
        p.id === state.currentPageId ? { ...p, background: bg } : p
      )
    }));
  },
  setShowGrid: (show) => set({ showGrid: show }),
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  setShowVisualizations: (show) => set({ showVisualizations: show }),
  setChartPalette: (palette) => set({ chartPalette: palette }),
  setShowAlignmentGuides: (show) => set({ showAlignmentGuides: show }),
  setAlignmentGuides: (guides) => set({ alignmentGuides: guides }),
  setDefaultZoneStyle: (style) => set((state) => ({
    defaultZoneStyle: { ...state.defaultZoneStyle, ...style }
  })),
  
  // Zone management
  addZone: (type, position = null) => {
    const state = get();
    const typeConfig = ZONE_TYPES[type];
    if (!typeConfig) return;
    
    const currentPage = state.pages.find(p => p.id === state.currentPageId);
    const currentZones = currentPage?.zones || [];
    
    const newZone = {
      id: generateId(),
      type,
      label: typeConfig.label,
      x: position?.x ?? (state.canvasSize.width / 2 - typeConfig.defaultSize.width / 2),
      y: position?.y ?? (state.canvasSize.height / 2 - typeConfig.defaultSize.height / 2),
      width: typeConfig.defaultSize.width,
      height: typeConfig.defaultSize.height,
      style: { ...state.defaultZoneStyle },
      visualConfig: {},
      zIndex: currentZones.length
    };
    
    const newZones = [...currentZones, newZone];
    
    set((state) => ({
      pages: state.pages.map(p => 
        p.id === state.currentPageId ? { ...p, zones: newZones } : p
      ),
      selectedZoneId: newZone.id,
      ...get().saveHistory(newZones)
    }));
    
    return newZone.id;
  },
  
  updateZone: (id, updates) => {
    set((state) => {
      const currentPage = state.pages.find(p => p.id === state.currentPageId);
      const newZones = (currentPage?.zones || []).map(zone =>
        zone.id === id ? { ...zone, ...updates } : zone
      );
      return {
        pages: state.pages.map(p => 
          p.id === state.currentPageId ? { ...p, zones: newZones } : p
        )
      };
    });
  },
  
  deleteZone: (id) => {
    set((state) => {
      const currentPage = state.pages.find(p => p.id === state.currentPageId);
      const newZones = (currentPage?.zones || []).filter(z => z.id !== id);
      return {
        pages: state.pages.map(p => 
          p.id === state.currentPageId ? { ...p, zones: newZones } : p
        ),
        selectedZoneId: state.selectedZoneId === id ? null : state.selectedZoneId,
        ...get().saveHistory(newZones)
      };
    });
  },
  
  duplicateZone: (id) => {
    const state = get();
    const currentPage = state.pages.find(p => p.id === state.currentPageId);
    const zones = currentPage?.zones || [];
    const zone = zones.find(z => z.id === id);
    if (!zone) return;
    
    const newZone = {
      ...zone,
      id: generateId(),
      x: zone.x + 20,
      y: zone.y + 20,
      zIndex: zones.length
    };
    
    const newZones = [...zones, newZone];
    
    set((state) => ({
      pages: state.pages.map(p => 
        p.id === state.currentPageId ? { ...p, zones: newZones } : p
      ),
      selectedZoneId: newZone.id,
      ...get().saveHistory(newZones)
    }));
  },
  
  // Copy zone to clipboard
  copyZone: (id) => {
    const state = get();
    const currentPage = state.pages.find(p => p.id === state.currentPageId);
    const zone = (currentPage?.zones || []).find(z => z.id === id);
    if (!zone) return;
    set({ clipboard: { ...zone } });
  },
  
  // Paste zone from clipboard
  pasteZone: () => {
    const state = get();
    if (!state.clipboard) return;
    
    const currentPage = state.pages.find(p => p.id === state.currentPageId);
    const zones = currentPage?.zones || [];
    
    const newZone = {
      ...state.clipboard,
      id: generateId(),
      label: `${state.clipboard.label} (copia)`,
      x: state.clipboard.x + 30,
      y: state.clipboard.y + 30,
      zIndex: zones.length
    };
    
    const newZones = [...zones, newZone];
    
    set((state) => ({
      pages: state.pages.map(p => 
        p.id === state.currentPageId ? { ...p, zones: newZones } : p
      ),
      selectedZoneId: newZone.id,
      clipboard: { ...newZone, x: newZone.x, y: newZone.y },
      ...get().saveHistory(newZones)
    }));
  },
  
  selectZone: (id) => set({ selectedZoneId: id }),
  clearSelection: () => set({ selectedZoneId: null, alignmentGuides: [] }),
  
  // Z-order
  bringForward: (id) => {
    set((state) => {
      const currentPage = state.pages.find(p => p.id === state.currentPageId);
      const zones = [...(currentPage?.zones || [])];
      const index = zones.findIndex(z => z.id === id);
      if (index < zones.length - 1) {
        [zones[index], zones[index + 1]] = [zones[index + 1], zones[index]];
        zones.forEach((z, i) => z.zIndex = i);
      }
      return {
        pages: state.pages.map(p => 
          p.id === state.currentPageId ? { ...p, zones } : p
        )
      };
    });
  },
  
  sendBackward: (id) => {
    set((state) => {
      const currentPage = state.pages.find(p => p.id === state.currentPageId);
      const zones = [...(currentPage?.zones || [])];
      const index = zones.findIndex(z => z.id === id);
      if (index > 0) {
        [zones[index], zones[index - 1]] = [zones[index - 1], zones[index]];
        zones.forEach((z, i) => z.zIndex = i);
      }
      return {
        pages: state.pages.map(p => 
          p.id === state.currentPageId ? { ...p, zones } : p
        )
      };
    });
  },
  
  // Alignment
  alignZones: (alignment) => {
    const state = get();
    if (!state.selectedZoneId) return;
    
    const currentPage = state.pages.find(p => p.id === state.currentPageId);
    const zones = currentPage?.zones || [];
    const zone = zones.find(z => z.id === state.selectedZoneId);
    if (!zone) return;
    
    let updates = {};
    switch (alignment) {
      case 'left': updates.x = 40; break;
      case 'center': updates.x = (state.canvasSize.width - zone.width) / 2; break;
      case 'right': updates.x = state.canvasSize.width - zone.width - 40; break;
      case 'top': updates.y = 40; break;
      case 'middle': updates.y = (state.canvasSize.height - zone.height) / 2; break;
      case 'bottom': updates.y = state.canvasSize.height - zone.height - 40; break;
      default: break;
    }
    
    get().updateZone(state.selectedZoneId, updates);
  },
  
  // Calculate alignment guides
  calculateAlignmentGuides: (movingZoneId, newX, newY, newWidth, newHeight) => {
    const state = get();
    if (!state.showAlignmentGuides) return [];
    
    const currentPage = state.pages.find(p => p.id === state.currentPageId);
    const zones = currentPage?.zones || [];
    const otherZones = zones.filter(z => z.id !== movingZoneId);
    
    const guides = [];
    const threshold = 8; // Snap threshold in pixels
    
    // Moving zone edges
    const movingLeft = newX;
    const movingRight = newX + newWidth;
    const movingTop = newY;
    const movingBottom = newY + newHeight;
    const movingCenterX = newX + newWidth / 2;
    const movingCenterY = newY + newHeight / 2;
    
    otherZones.forEach(zone => {
      const zoneLeft = zone.x;
      const zoneRight = zone.x + zone.width;
      const zoneTop = zone.y;
      const zoneBottom = zone.y + zone.height;
      const zoneCenterX = zone.x + zone.width / 2;
      const zoneCenterY = zone.y + zone.height / 2;
      
      // Vertical guides (for horizontal alignment)
      // Left-to-left
      if (Math.abs(movingLeft - zoneLeft) < threshold) {
        guides.push({ type: 'vertical', x: zoneLeft, y1: Math.min(movingTop, zoneTop), y2: Math.max(movingBottom, zoneBottom) });
      }
      // Right-to-right
      if (Math.abs(movingRight - zoneRight) < threshold) {
        guides.push({ type: 'vertical', x: zoneRight, y1: Math.min(movingTop, zoneTop), y2: Math.max(movingBottom, zoneBottom) });
      }
      // Left-to-right
      if (Math.abs(movingLeft - zoneRight) < threshold) {
        guides.push({ type: 'vertical', x: zoneRight, y1: Math.min(movingTop, zoneTop), y2: Math.max(movingBottom, zoneBottom) });
      }
      // Right-to-left
      if (Math.abs(movingRight - zoneLeft) < threshold) {
        guides.push({ type: 'vertical', x: zoneLeft, y1: Math.min(movingTop, zoneTop), y2: Math.max(movingBottom, zoneBottom) });
      }
      // Center-to-center (vertical line)
      if (Math.abs(movingCenterX - zoneCenterX) < threshold) {
        guides.push({ type: 'vertical', x: zoneCenterX, y1: Math.min(movingTop, zoneTop), y2: Math.max(movingBottom, zoneBottom) });
      }
      
      // Horizontal guides (for vertical alignment)
      // Top-to-top
      if (Math.abs(movingTop - zoneTop) < threshold) {
        guides.push({ type: 'horizontal', y: zoneTop, x1: Math.min(movingLeft, zoneLeft), x2: Math.max(movingRight, zoneRight) });
      }
      // Bottom-to-bottom
      if (Math.abs(movingBottom - zoneBottom) < threshold) {
        guides.push({ type: 'horizontal', y: zoneBottom, x1: Math.min(movingLeft, zoneLeft), x2: Math.max(movingRight, zoneRight) });
      }
      // Top-to-bottom
      if (Math.abs(movingTop - zoneBottom) < threshold) {
        guides.push({ type: 'horizontal', y: zoneBottom, x1: Math.min(movingLeft, zoneLeft), x2: Math.max(movingRight, zoneRight) });
      }
      // Bottom-to-top
      if (Math.abs(movingBottom - zoneTop) < threshold) {
        guides.push({ type: 'horizontal', y: zoneTop, x1: Math.min(movingLeft, zoneLeft), x2: Math.max(movingRight, zoneRight) });
      }
      // Center-to-center (horizontal line)
      if (Math.abs(movingCenterY - zoneCenterY) < threshold) {
        guides.push({ type: 'horizontal', y: zoneCenterY, x1: Math.min(movingLeft, zoneLeft), x2: Math.max(movingRight, zoneRight) });
      }
    });
    
    return guides;
  },
  
  // Templates
  loadTemplate: (templateId) => {
    const template = LAYOUT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    const newZones = template.zones.map((z, i) => ({
      id: generateId(),
      ...z,
      style: z.style || { ...get().defaultZoneStyle },
      visualConfig: z.visualConfig || {},
      zIndex: i
    }));
    
    set((state) => ({
      pages: state.pages.map(p => 
        p.id === state.currentPageId ? { ...p, zones: newZones } : p
      ),
      selectedZoneId: null,
      ...get().saveHistory(newZones)
    }));
  },
  
  // History
  saveHistory: (zones) => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.stringify(zones));
    if (newHistory.length > 10) newHistory.shift();
    return { history: newHistory, historyIndex: newHistory.length - 1 };
  },
  
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const zones = JSON.parse(state.history[newIndex]);
      set((state) => ({
        pages: state.pages.map(p => 
          p.id === state.currentPageId ? { ...p, zones } : p
        ),
        historyIndex: newIndex,
        selectedZoneId: null
      }));
    }
  },
  
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const zones = JSON.parse(state.history[newIndex]);
      set((state) => ({
        pages: state.pages.map(p => 
          p.id === state.currentPageId ? { ...p, zones } : p
        ),
        historyIndex: newIndex,
        selectedZoneId: null
      }));
    }
  },
  
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
  
  // Export
  getExportJSON: () => {
    const state = get();
    const currentPage = state.pages.find(p => p.id === state.currentPageId);
    const zones = currentPage?.zones || [];
    const background = currentPage?.background || { type: 'solid', color: '#f0f0f0' };
    
    return {
      canvasSize: state.canvasSize,
      theme: { background },
      zones: zones.map(z => ({
        id: z.id,
        type: z.type,
        label: z.label,
        x: Math.round(z.x),
        y: Math.round(z.y),
        width: Math.round(z.width),
        height: Math.round(z.height),
        style: z.style
      })),
      generatedAt: new Date().toISOString()
    };
  },
  
  // Export all pages
  getExportAllPagesJSON: () => {
    const state = get();
    return {
      canvasSize: state.canvasSize,
      pages: state.pages.map(page => ({
        id: page.id,
        name: page.name,
        background: page.background,
        zones: page.zones.map(z => ({
          id: z.id,
          type: z.type,
          label: z.label,
          x: Math.round(z.x),
          y: Math.round(z.y),
          width: Math.round(z.width),
          height: Math.round(z.height),
          style: z.style
        }))
      })),
      generatedAt: new Date().toISOString()
    };
  },
  
  clearCanvas: () => {
    set((state) => ({
      pages: state.pages.map(p => 
        p.id === state.currentPageId ? { ...p, zones: [] } : p
      ),
      selectedZoneId: null,
      history: [],
      historyIndex: -1
    }));
  }
}));

export default useDesignerStore;
