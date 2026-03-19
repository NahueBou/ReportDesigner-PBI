import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Power BI Component Types
export const COMPONENT_TYPES = [
  { type: 'bar_chart', label: 'Gráfico de Barras', icon: 'BarChart3', category: 'charts' },
  { type: 'line_chart', label: 'Gráfico de Líneas', icon: 'LineChart', category: 'charts' },
  { type: 'pie_chart', label: 'Gráfico Circular', icon: 'PieChart', category: 'charts' },
  { type: 'donut_chart', label: 'Gráfico de Dona', icon: 'CircleDot', category: 'charts' },
  { type: 'area_chart', label: 'Gráfico de Área', icon: 'AreaChart', category: 'charts' },
  { type: 'scatter', label: 'Dispersión', icon: 'ScatterChart', category: 'charts' },
  { type: 'treemap', label: 'Treemap', icon: 'LayoutGrid', category: 'charts' },
  { type: 'gauge', label: 'Gauge', icon: 'Gauge', category: 'charts' },
  { type: 'kpi_card', label: 'Tarjeta KPI', icon: 'LayoutTemplate', category: 'cards' },
  { type: 'table', label: 'Tabla', icon: 'Table', category: 'tables' },
  { type: 'matrix', label: 'Matriz', icon: 'Grid3X3', category: 'tables' },
  { type: 'slicer', label: 'Segmentador', icon: 'Filter', category: 'filters' },
  { type: 'map', label: 'Mapa', icon: 'Map', category: 'maps' },
];

export const COMPONENT_CATEGORIES = {
  charts: 'Gráficos',
  cards: 'Tarjetas',
  tables: 'Tablas',
  filters: 'Filtros',
  maps: 'Mapas',
};

// Generate unique ID
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
