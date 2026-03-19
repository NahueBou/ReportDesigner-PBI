import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Zone types configuration
export const ZONE_TYPES = {
  kpi_card: { label: 'KPI Card', icon: 'LayoutTemplate', defaultSize: { width: 200, height: 120 }, color: '#2563EB' },
  bar_chart: { label: 'Bar Chart', icon: 'BarChart3', defaultSize: { width: 300, height: 200 }, color: '#2563EB' },
  line_chart: { label: 'Line Chart', icon: 'LineChart', defaultSize: { width: 300, height: 200 }, color: '#10B981' },
  pie_chart: { label: 'Pie Chart', icon: 'PieChart', defaultSize: { width: 200, height: 200 }, color: '#8B5CF6' },
  donut_chart: { label: 'Donut Chart', icon: 'CircleDot', defaultSize: { width: 200, height: 200 }, color: '#EC4899' },
  table: { label: 'Table', icon: 'Table', defaultSize: { width: 350, height: 250 }, color: '#6B7280' },
  matrix: { label: 'Matrix', icon: 'Grid3X3', defaultSize: { width: 350, height: 250 }, color: '#4B5563' },
  slicer: { label: 'Slicer', icon: 'Filter', defaultSize: { width: 180, height: 300 }, color: '#9CA3AF' },
  map: { label: 'Map', icon: 'Map', defaultSize: { width: 300, height: 250 }, color: '#059669' },
  text_box: { label: 'Text Box', icon: 'Type', defaultSize: { width: 200, height: 80 }, color: '#374151' },
  image: { label: 'Image', icon: 'Image', defaultSize: { width: 200, height: 150 }, color: '#7C3AED' },
  shape: { label: 'Shape', icon: 'Square', defaultSize: { width: 100, height: 100 }, color: '#F59E0B' },
};

// Canvas size presets
export const CANVAS_SIZES = [
  { label: '1280 × 720 (Power BI Default)', width: 1280, height: 720 },
  { label: '1920 × 1080 (Full HD)', width: 1920, height: 1080 },
  { label: '1600 × 900', width: 1600, height: 900 },
];

// Background presets
export const BACKGROUND_PRESETS = [
  { id: 'dark_navy', label: 'Dark Navy', type: 'solid', color: '#1a2744' },
  { id: 'light_gray', label: 'Light Gray', type: 'solid', color: '#f3f4f6' },
  { id: 'white_clean', label: 'White Clean', type: 'solid', color: '#ffffff' },
  { id: 'dark_slate', label: 'Dark Slate', type: 'solid', color: '#1e293b' },
  { id: 'gradient_blue', label: 'Blue Gradient', type: 'gradient', colors: ['#1e3a5f', '#0f172a'], direction: 'vertical' },
  { id: 'gradient_purple', label: 'Purple Gradient', type: 'gradient', colors: ['#4c1d95', '#1e1b4b'], direction: 'diagonal' },
];

// Color palette presets
export const PALETTE_PRESETS = [
  { id: 'corporate', label: 'Corporate', colors: ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'] },
  { id: 'accessible', label: 'Accessible', colors: ['#0077B6', '#00B4D8', '#90BE6D', '#F9C74F', '#F8961E', '#F94144'] },
  { id: 'pastel', label: 'Pastel', colors: ['#A8DADC', '#F1FAEE', '#E63946', '#457B9D', '#1D3557', '#FFB4A2'] },
  { id: 'dark', label: 'Dark Mode', colors: ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#F472B6'] },
  { id: 'monochrome', label: 'Monochrome Blue', colors: ['#1e3a5f', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'] },
];

// Layout templates
export const LAYOUT_TEMPLATES = [
  {
    id: 'executive',
    name: 'Executive Summary',
    description: '4 KPI cards + 1 chart + 1 table',
    zones: [
      { type: 'kpi_card', label: 'KPI 1', x: 40, y: 40, width: 220, height: 100 },
      { type: 'kpi_card', label: 'KPI 2', x: 280, y: 40, width: 220, height: 100 },
      { type: 'kpi_card', label: 'KPI 3', x: 520, y: 40, width: 220, height: 100 },
      { type: 'kpi_card', label: 'KPI 4', x: 760, y: 40, width: 220, height: 100 },
      { type: 'bar_chart', label: 'Main Chart', x: 40, y: 160, width: 580, height: 280 },
      { type: 'table', label: 'Data Table', x: 640, y: 160, width: 340, height: 280 },
    ]
  },
  {
    id: 'sales',
    name: 'Sales Dashboard',
    description: '3 KPIs + 2 charts + slicer panel',
    zones: [
      { type: 'slicer', label: 'Filters', x: 40, y: 40, width: 160, height: 400 },
      { type: 'kpi_card', label: 'Revenue', x: 220, y: 40, width: 200, height: 100 },
      { type: 'kpi_card', label: 'Orders', x: 440, y: 40, width: 200, height: 100 },
      { type: 'kpi_card', label: 'Avg Ticket', x: 660, y: 40, width: 200, height: 100 },
      { type: 'bar_chart', label: 'Sales by Region', x: 220, y: 160, width: 320, height: 280 },
      { type: 'line_chart', label: 'Trend', x: 560, y: 160, width: 320, height: 280 },
    ]
  },
  {
    id: 'operational',
    name: 'Operational',
    description: 'Header + 6 KPIs + 2 charts',
    zones: [
      { type: 'text_box', label: 'Report Title', x: 40, y: 20, width: 400, height: 50 },
      { type: 'kpi_card', label: 'Metric 1', x: 40, y: 90, width: 180, height: 90 },
      { type: 'kpi_card', label: 'Metric 2', x: 240, y: 90, width: 180, height: 90 },
      { type: 'kpi_card', label: 'Metric 3', x: 440, y: 90, width: 180, height: 90 },
      { type: 'kpi_card', label: 'Metric 4', x: 640, y: 90, width: 180, height: 90 },
      { type: 'kpi_card', label: 'Metric 5', x: 840, y: 90, width: 180, height: 90 },
      { type: 'bar_chart', label: 'Chart 1', x: 40, y: 200, width: 480, height: 240 },
      { type: 'line_chart', label: 'Chart 2', x: 540, y: 200, width: 480, height: 240 },
    ]
  },
  {
    id: 'clinical',
    name: 'Clinical Tracking',
    description: 'Filter panel + 3 charts + table',
    zones: [
      { type: 'slicer', label: 'Date Range', x: 40, y: 40, width: 180, height: 180 },
      { type: 'slicer', label: 'Department', x: 40, y: 240, width: 180, height: 180 },
      { type: 'pie_chart', label: 'Distribution', x: 240, y: 40, width: 260, height: 200 },
      { type: 'line_chart', label: 'Trends', x: 520, y: 40, width: 460, height: 200 },
      { type: 'table', label: 'Patient Data', x: 240, y: 260, width: 740, height: 180 },
    ]
  },
  {
    id: 'hr',
    name: 'HR / Recruitment',
    description: 'Timeline + funnels + KPIs',
    zones: [
      { type: 'line_chart', label: 'Hiring Timeline', x: 40, y: 40, width: 700, height: 180 },
      { type: 'kpi_card', label: 'Open Positions', x: 760, y: 40, width: 200, height: 80 },
      { type: 'kpi_card', label: 'Hires MTD', x: 760, y: 140, width: 200, height: 80 },
      { type: 'bar_chart', label: 'By Department', x: 40, y: 240, width: 300, height: 200 },
      { type: 'donut_chart', label: 'Sources', x: 360, y: 240, width: 200, height: 200 },
      { type: 'table', label: 'Recent Hires', x: 580, y: 240, width: 380, height: 200 },
    ]
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch',
    zones: []
  }
];

// Generate unique ID
const generateId = () => `zone_${uuidv4().slice(0, 8)}`;

// Create the store
const useDesignerStore = create((set, get) => ({
  // Canvas settings
  canvasSize: { width: 1280, height: 720 },
  background: { type: 'solid', color: '#ffffff' },
  showGrid: true,
  zoom: 1,
  
  // Elements
  zones: [],
  selectedZoneId: null,
  
  // Header/Footer
  header: null,
  footer: null,
  
  // Theme settings
  palette: PALETTE_PRESETS[0].colors,
  typography: {
    fontFamily: 'Segoe UI',
    titleSize: 18,
    bodySize: 12,
    fontColor: '#111827'
  },
  defaultZoneStyle: {
    borderColor: '#e5e7eb',
    borderWidth: 2,
    borderStyle: 'dashed',
    fillColor: '#ffffff',
    fillOpacity: 0.1,
    cornerRadius: 8
  },
  
  // History for undo/redo
  history: [],
  historyIndex: -1,
  
  // Preview mode
  previewMode: false,
  
  // Actions
  setCanvasSize: (size) => set({ canvasSize: size }),
  
  setBackground: (bg) => set({ background: bg }),
  
  setShowGrid: (show) => set({ showGrid: show }),
  
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),
  
  setPreviewMode: (mode) => set({ previewMode: mode }),
  
  setPalette: (palette) => set({ palette }),
  
  setTypography: (typography) => set((state) => ({ 
    typography: { ...state.typography, ...typography } 
  })),
  
  setDefaultZoneStyle: (style) => set((state) => ({
    defaultZoneStyle: { ...state.defaultZoneStyle, ...style }
  })),
  
  // Zone management
  addZone: (type, position = null) => {
    const state = get();
    const typeConfig = ZONE_TYPES[type];
    if (!typeConfig) return;
    
    const newZone = {
      id: generateId(),
      type,
      label: typeConfig.label,
      x: position?.x ?? (state.canvasSize.width / 2 - typeConfig.defaultSize.width / 2),
      y: position?.y ?? (state.canvasSize.height / 2 - typeConfig.defaultSize.height / 2),
      width: typeConfig.defaultSize.width,
      height: typeConfig.defaultSize.height,
      style: { ...state.defaultZoneStyle },
      zIndex: state.zones.length
    };
    
    set((state) => {
      const newZones = [...state.zones, newZone];
      return {
        zones: newZones,
        selectedZoneId: newZone.id,
        ...get().saveHistory(newZones)
      };
    });
    
    return newZone.id;
  },
  
  updateZone: (id, updates) => {
    set((state) => {
      const newZones = state.zones.map(zone =>
        zone.id === id ? { ...zone, ...updates } : zone
      );
      return { zones: newZones };
    });
  },
  
  deleteZone: (id) => {
    set((state) => {
      const newZones = state.zones.filter(z => z.id !== id);
      return {
        zones: newZones,
        selectedZoneId: state.selectedZoneId === id ? null : state.selectedZoneId,
        ...get().saveHistory(newZones)
      };
    });
  },
  
  duplicateZone: (id) => {
    const state = get();
    const zone = state.zones.find(z => z.id === id);
    if (!zone) return;
    
    const newZone = {
      ...zone,
      id: generateId(),
      x: zone.x + 20,
      y: zone.y + 20,
      zIndex: state.zones.length
    };
    
    set((state) => {
      const newZones = [...state.zones, newZone];
      return {
        zones: newZones,
        selectedZoneId: newZone.id,
        ...get().saveHistory(newZones)
      };
    });
  },
  
  selectZone: (id) => set({ selectedZoneId: id }),
  
  clearSelection: () => set({ selectedZoneId: null }),
  
  // Z-order
  bringForward: (id) => {
    set((state) => {
      const zones = [...state.zones];
      const index = zones.findIndex(z => z.id === id);
      if (index < zones.length - 1) {
        [zones[index], zones[index + 1]] = [zones[index + 1], zones[index]];
        zones.forEach((z, i) => z.zIndex = i);
      }
      return { zones };
    });
  },
  
  sendBackward: (id) => {
    set((state) => {
      const zones = [...state.zones];
      const index = zones.findIndex(z => z.id === id);
      if (index > 0) {
        [zones[index], zones[index - 1]] = [zones[index - 1], zones[index]];
        zones.forEach((z, i) => z.zIndex = i);
      }
      return { zones };
    });
  },
  
  // Alignment
  alignZones: (alignment) => {
    const state = get();
    if (!state.selectedZoneId) return;
    
    const zone = state.zones.find(z => z.id === state.selectedZoneId);
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
  
  // Templates
  loadTemplate: (templateId) => {
    const template = LAYOUT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    
    const newZones = template.zones.map((z, i) => ({
      id: generateId(),
      ...z,
      style: { ...get().defaultZoneStyle },
      zIndex: i
    }));
    
    set((state) => ({
      zones: newZones,
      selectedZoneId: null,
      ...get().saveHistory(newZones)
    }));
  },
  
  // Header/Footer
  setHeader: (header) => set({ header }),
  setFooter: (footer) => set({ footer }),
  
  // History management
  saveHistory: (zones) => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.stringify(zones));
    
    // Keep only last 10 states
    if (newHistory.length > 10) {
      newHistory.shift();
    }
    
    return {
      history: newHistory,
      historyIndex: newHistory.length - 1
    };
  },
  
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const zones = JSON.parse(state.history[newIndex]);
      set({ zones, historyIndex: newIndex, selectedZoneId: null });
    }
  },
  
  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const zones = JSON.parse(state.history[newIndex]);
      set({ zones, historyIndex: newIndex, selectedZoneId: null });
    }
  },
  
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
  
  // Export
  getExportJSON: () => {
    const state = get();
    return {
      canvasSize: state.canvasSize,
      theme: {
        background: state.background,
        palette: state.palette
      },
      fonts: state.typography,
      zones: state.zones.map(z => ({
        id: z.id,
        type: z.type,
        label: z.label,
        x: Math.round(z.x),
        y: Math.round(z.y),
        width: Math.round(z.width),
        height: Math.round(z.height),
        style: z.style
      })),
      header: state.header,
      footer: state.footer,
      generatedAt: new Date().toISOString()
    };
  },
  
  // Clear all
  clearCanvas: () => {
    set({
      zones: [],
      selectedZoneId: null,
      header: null,
      footer: null,
      history: [],
      historyIndex: -1
    });
  }
}));

export default useDesignerStore;
