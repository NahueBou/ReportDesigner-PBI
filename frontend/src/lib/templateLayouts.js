import { v4 as uuidv4 } from 'uuid';

const generateId = () => `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const defaultStyle = {
  fillColor: '#ffffff',
  fillOpacity: 1,
  shadowEnabled: true,
  cornerRadius: 8,
  borderWidth: 0,
  borderColor: '#e5e7eb',
};

const headerStyle = {
  fillColor: '#1a2744',
  fillOpacity: 1,
  shadowEnabled: false,
  cornerRadius: 0,
  borderWidth: 0,
};

// Helper: create a zone with a generated id
const zone = (type, label, x, y, w, h, style = {}, visualConfig = {}) => ({
  id: generateId(),
  type,
  label,
  x,
  y,
  width: w,
  height: h,
  style: { ...defaultStyle, ...style },
  visualConfig,
  zIndex: 0,
});

// Re-index zIndex after building
const indexed = (zones) => zones.map((z, i) => ({ ...z, zIndex: i }));

// ─── METRIC DEFINITIONS PER AREA ────────────────────────────────────────────

export const WIZARD_AREAS = [
  {
    id: 'sales',
    label: 'Ventas y Revenue',
    icon: 'TrendingUp',
    description: 'Ingresos, unidades vendidas, tendencias y performance comercial',
    bullets: ['Evolución de ventas', 'Ranking de productos', 'KPIs de revenue'],
  },
  {
    id: 'finance',
    label: 'Finanzas',
    icon: 'DollarSign',
    description: 'P&L, márgenes, costos, flujo de caja y rentabilidad',
    bullets: ['Resultados financieros', 'Márgenes y costos', 'Comparación presupuesto'],
  },
  {
    id: 'hr',
    label: 'Recursos Humanos',
    icon: 'Users',
    description: 'Headcount, rotación, ausentismo, desempeño y reclutamiento',
    bullets: ['Dotación y variaciones', 'Indicadores de reclutamiento', 'Ausentismo'],
  },
  {
    id: 'operations',
    label: 'Operaciones y Logística',
    icon: 'Settings',
    description: 'Producción, calidad, tiempos, eficiencia y cumplimiento',
    bullets: ['Productividad por área', 'Tiempos de proceso', 'Indicadores de calidad'],
  },
];

export const WIZARD_METRICS = {
  sales: [
    { id: 'kpi_cards', label: 'KPIs resumen (Revenue, Unidades, Margen, Crecimiento)' },
    { id: 'revenue_trend', label: 'Tendencia mensual de ingresos' },
    { id: 'sales_by_region', label: 'Ventas por región / canal' },
    { id: 'top_products', label: 'Ranking de productos / clientes' },
    { id: 'yoy_comparison', label: 'Comparación año anterior' },
    { id: 'filters', label: 'Filtros de período, región y producto' },
  ],
  finance: [
    { id: 'kpi_cards', label: 'KPIs financieros (Revenue, EBITDA, Margen, Costos)' },
    { id: 'pnl_trend', label: 'Evolución de P&L mensual' },
    { id: 'cost_breakdown', label: 'Desglose de costos por categoría' },
    { id: 'budget_vs_actual', label: 'Presupuesto vs Real' },
    { id: 'cashflow', label: 'Flujo de caja' },
    { id: 'filters', label: 'Filtros de período, unidad de negocio y centro de costo' },
  ],
  hr: [
    { id: 'kpi_cards', label: 'KPIs de RRHH (Headcount, Rotación, Ausentismo, Tiempo promedio de cierre)' },
    { id: 'headcount_trend', label: 'Evolución de dotación' },
    { id: 'recruitment', label: 'Indicadores de reclutamiento (búsquedas, tiempos)' },
    { id: 'turnover', label: 'Rotación y motivos de egreso' },
    { id: 'absence', label: 'Ausentismo por área o motivo' },
    { id: 'filters', label: 'Filtros de período, área y gerencia' },
  ],
  operations: [
    { id: 'kpi_cards', label: 'KPIs operativos (Producción, Calidad, OEE, Eficiencia)' },
    { id: 'production_trend', label: 'Tendencia de producción' },
    { id: 'quality', label: 'Indicadores de calidad (defectos, rechazos)' },
    { id: 'efficiency', label: 'Eficiencia por línea / planta' },
    { id: 'lead_time', label: 'Tiempos de proceso y lead times' },
    { id: 'filters', label: 'Filtros de período, planta y turno' },
  ],
};

// ─── LAYOUT GENERATORS ────────────────────────────────────────────────────────

const CANVAS_W = 1280;
const GAP = 16;
const EDGE = 16;

export function generateSalesLayout(metrics) {
  const zones = [];
  let y = 0;

  // Always: header
  zones.push(zone('header', 'Dashboard de Ventas', 0, y, CANVAS_W, 50, headerStyle));
  y += 50;

  // Filters row (optional)
  if (metrics.includes('filters')) {
    y += GAP;
    const fw = 180;
    zones.push(zone('filter_dropdown', 'Período', EDGE, y, fw, 40));
    zones.push(zone('filter_dropdown', 'Región', EDGE + fw + GAP, y, fw, 40));
    zones.push(zone('filter_dropdown', 'Producto', EDGE + (fw + GAP) * 2, y, fw, 40));
    y += 40;
  }

  // KPI row (optional)
  if (metrics.includes('kpi_cards')) {
    y += GAP;
    const kpiW = (CANVAS_W - EDGE * 2 - GAP * 3) / 4;
    ['Total Revenue', 'Unidades Vendidas', 'Margen Bruto', 'Crecimiento YoY'].forEach((label, i) => {
      zones.push(zone('kpi_card', label, EDGE + i * (kpiW + GAP), y, kpiW, 110));
    });
    y += 110;
  }

  // Revenue trend + donut
  if (metrics.includes('revenue_trend')) {
    y += GAP;
    const hasDonut = metrics.includes('sales_by_region');
    const lineW = hasDonut ? CANVAS_W - EDGE * 2 - GAP - 300 : CANVAS_W - EDGE * 2;
    zones.push(zone('line_chart', 'Tendencia de Revenue', EDGE, y, lineW, 260));
    if (hasDonut) {
      zones.push(zone('pie_chart', 'Ventas por Región', EDGE + lineW + GAP, y, 300, 260));
    }
    y += 260;
  } else if (metrics.includes('sales_by_region')) {
    y += GAP;
    zones.push(zone('bar_chart', 'Ventas por Región', EDGE, y, CANVAS_W - EDGE * 2, 260));
    y += 260;
  }

  // Bottom row: top products + yoy
  const bottomMetrics = [];
  if (metrics.includes('top_products')) bottomMetrics.push('top_products');
  if (metrics.includes('yoy_comparison')) bottomMetrics.push('yoy_comparison');

  if (bottomMetrics.length > 0) {
    y += GAP;
    const bW = (CANVAS_W - EDGE * 2 - GAP * (bottomMetrics.length - 1)) / bottomMetrics.length;
    bottomMetrics.forEach((m, i) => {
      if (m === 'top_products') {
        zones.push(zone('horizontal_bar', 'Top Productos', EDGE + i * (bW + GAP), y, bW, 220));
      } else {
        zones.push(zone('stacked_bar', 'Comparación Año Anterior', EDGE + i * (bW + GAP), y, bW, 220));
      }
    });
    y += 220;
  }

  return indexed(zones);
}

export function generateFinanceLayout(metrics) {
  const zones = [];
  let y = 0;

  zones.push(zone('header', 'Dashboard Financiero', 0, y, CANVAS_W, 50, headerStyle));
  y += 50;

  if (metrics.includes('filters')) {
    y += GAP;
    const fw = 200;
    zones.push(zone('filter_dropdown', 'Período', EDGE, y, fw, 40));
    zones.push(zone('filter_dropdown', 'Unidad de Negocio', EDGE + fw + GAP, y, fw, 40));
    zones.push(zone('filter_dropdown', 'Centro de Costo', EDGE + (fw + GAP) * 2, y, fw, 40));
    y += 40;
  }

  if (metrics.includes('kpi_cards')) {
    y += GAP;
    const kpiW = (CANVAS_W - EDGE * 2 - GAP * 3) / 4;
    ['Revenue', 'EBITDA', 'Margen %', 'Costos Totales'].forEach((label, i) => {
      zones.push(zone('kpi_card', label, EDGE + i * (kpiW + GAP), y, kpiW, 110));
    });
    y += 110;
  }

  if (metrics.includes('pnl_trend')) {
    y += GAP;
    const hasCost = metrics.includes('cost_breakdown');
    const lineW = hasCost ? CANVAS_W - EDGE * 2 - GAP - 340 : CANVAS_W - EDGE * 2;
    zones.push(zone('area_chart', 'Evolución P&L Mensual', EDGE, y, lineW, 260));
    if (hasCost) {
      zones.push(zone('donut_chart', 'Desglose de Costos', EDGE + lineW + GAP, y, 340, 260));
    }
    y += 260;
  } else if (metrics.includes('cost_breakdown')) {
    y += GAP;
    zones.push(zone('donut_chart', 'Desglose de Costos', EDGE, y, 340, 260));
    y += 260;
  }

  const bottomMetrics = [];
  if (metrics.includes('budget_vs_actual')) bottomMetrics.push('budget_vs_actual');
  if (metrics.includes('cashflow')) bottomMetrics.push('cashflow');

  if (bottomMetrics.length > 0) {
    y += GAP;
    const bW = (CANVAS_W - EDGE * 2 - GAP * (bottomMetrics.length - 1)) / bottomMetrics.length;
    bottomMetrics.forEach((m, i) => {
      if (m === 'budget_vs_actual') {
        zones.push(zone('stacked_bar', 'Presupuesto vs Real', EDGE + i * (bW + GAP), y, bW, 220));
      } else {
        zones.push(zone('bar_chart', 'Flujo de Caja', EDGE + i * (bW + GAP), y, bW, 220));
      }
    });
    y += 220;
  }

  return indexed(zones);
}

export function generateHRLayout(metrics) {
  const zones = [];
  let y = 0;

  zones.push(zone('header', 'Dashboard de Recursos Humanos', 0, y, CANVAS_W, 50, headerStyle));
  y += 50;

  if (metrics.includes('filters')) {
    y += GAP;
    const fw = 180;
    zones.push(zone('filter_dropdown', 'Período', EDGE, y, fw, 40));
    zones.push(zone('filter_dropdown', 'Área', EDGE + fw + GAP, y, fw, 40));
    zones.push(zone('filter_dropdown', 'Gerencia', EDGE + (fw + GAP) * 2, y, fw, 40));
    y += 40;
  }

  if (metrics.includes('kpi_cards')) {
    y += GAP;
    const kpiW = (CANVAS_W - EDGE * 2 - GAP * 3) / 4;
    ['Headcount', 'Rotación', 'Ausentismo', 'Tiempo Prom. Cierre'].forEach((label, i) => {
      zones.push(zone('kpi_card', label, EDGE + i * (kpiW + GAP), y, kpiW, 110));
    });
    y += 110;
  }

  // Main charts row
  const mainMetrics = [];
  if (metrics.includes('headcount_trend')) mainMetrics.push('headcount_trend');
  if (metrics.includes('recruitment')) mainMetrics.push('recruitment');

  if (mainMetrics.length > 0) {
    y += GAP;
    const mW = (CANVAS_W - EDGE * 2 - GAP * (mainMetrics.length - 1)) / mainMetrics.length;
    mainMetrics.forEach((m, i) => {
      if (m === 'headcount_trend') {
        zones.push(zone('line_chart', 'Evolución de Dotación', EDGE + i * (mW + GAP), y, mW, 250));
      } else {
        zones.push(zone('stacked_bar', 'Indicadores de Reclutamiento', EDGE + i * (mW + GAP), y, mW, 250));
      }
    });
    y += 250;
  }

  const bottomMetrics = [];
  if (metrics.includes('turnover')) bottomMetrics.push('turnover');
  if (metrics.includes('absence')) bottomMetrics.push('absence');

  if (bottomMetrics.length > 0) {
    y += GAP;
    const bW = (CANVAS_W - EDGE * 2 - GAP * (bottomMetrics.length - 1)) / bottomMetrics.length;
    bottomMetrics.forEach((m, i) => {
      if (m === 'turnover') {
        zones.push(zone('horizontal_bar', 'Rotación por Motivo', EDGE + i * (bW + GAP), y, bW, 210));
      } else {
        zones.push(zone('bar_chart', 'Ausentismo por Área', EDGE + i * (bW + GAP), y, bW, 210));
      }
    });
    y += 210;
  }

  return indexed(zones);
}

export function generateOperationsLayout(metrics) {
  const zones = [];
  let y = 0;

  zones.push(zone('header', 'Dashboard Operaciones', 0, y, CANVAS_W, 50, headerStyle));
  y += 50;

  if (metrics.includes('filters')) {
    y += GAP;
    const fw = 180;
    zones.push(zone('filter_dropdown', 'Período', EDGE, y, fw, 40));
    zones.push(zone('filter_dropdown', 'Planta', EDGE + fw + GAP, y, fw, 40));
    zones.push(zone('filter_dropdown', 'Turno', EDGE + (fw + GAP) * 2, y, fw, 40));
    y += 40;
  }

  if (metrics.includes('kpi_cards')) {
    y += GAP;
    const kpiW = (CANVAS_W - EDGE * 2 - GAP * 3) / 4;
    ['Producción Total', 'OEE', 'Calidad %', 'Eficiencia'].forEach((label, i) => {
      zones.push(zone('kpi_card', label, EDGE + i * (kpiW + GAP), y, kpiW, 110));
    });
    y += 110;
  }

  if (metrics.includes('production_trend')) {
    y += GAP;
    const hasQuality = metrics.includes('quality');
    const lineW = hasQuality ? CANVAS_W - EDGE * 2 - GAP - 300 : CANVAS_W - EDGE * 2;
    zones.push(zone('area_chart', 'Tendencia de Producción', EDGE, y, lineW, 260));
    if (hasQuality) {
      zones.push(zone('donut_chart', 'Indicadores de Calidad', EDGE + lineW + GAP, y, 300, 260));
    }
    y += 260;
  } else if (metrics.includes('quality')) {
    y += GAP;
    zones.push(zone('bar_chart', 'Indicadores de Calidad', EDGE, y, CANVAS_W - EDGE * 2, 260));
    y += 260;
  }

  const bottomMetrics = [];
  if (metrics.includes('efficiency')) bottomMetrics.push('efficiency');
  if (metrics.includes('lead_time')) bottomMetrics.push('lead_time');

  if (bottomMetrics.length > 0) {
    y += GAP;
    const bW = (CANVAS_W - EDGE * 2 - GAP * (bottomMetrics.length - 1)) / bottomMetrics.length;
    bottomMetrics.forEach((m, i) => {
      if (m === 'efficiency') {
        zones.push(zone('horizontal_bar', 'Eficiencia por Línea', EDGE + i * (bW + GAP), y, bW, 220));
      } else {
        zones.push(zone('bar_chart', 'Lead Times por Proceso', EDGE + i * (bW + GAP), y, bW, 220));
      }
    });
    y += 220;
  }

  return indexed(zones);
}

// ─── MAIN GENERATOR ──────────────────────────────────────────────────────────

const generators = {
  sales: generateSalesLayout,
  finance: generateFinanceLayout,
  hr: generateHRLayout,
  operations: generateOperationsLayout,
};

export function generateLayout(areaId, selectedMetrics) {
  const generator = generators[areaId];
  if (!generator) return [];
  return generator(selectedMetrics);
}
