import { useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Text, Group, Transformer, Line, Circle, Arc } from "react-konva";
import useDesignerStore, { ZONE_TYPES, CHART_PALETTES } from "@/store/designerStore";

const Canvas = () => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  
  const {
    canvasSize,
    background,
    showGrid,
    zoom,
    zones,
    selectedZoneId,
    previewMode,
    showVisualizations,
    chartPalette,
    selectZone,
    clearSelection,
    updateZone,
    addZone
  } = useDesignerStore();

  // Store ref for export
  useEffect(() => {
    if (stageRef.current) {
      window.konvaStage = stageRef.current;
    }
  }, []);

  // Handle drop from sidebar
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("zoneType");
    if (!type || !ZONE_TYPES[type]) return;

    const stage = stageRef.current;
    if (!stage) return;

    const stageBox = stage.container().getBoundingClientRect();
    const x = (e.clientX - stageBox.left) / zoom - ZONE_TYPES[type].defaultSize.width / 2;
    const y = (e.clientY - stageBox.top) / zoom - ZONE_TYPES[type].defaultSize.height / 2;

    addZone(type, { x: Math.max(0, x), y: Math.max(0, y) });
  }, [zoom, addZone]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleStageClick = (e) => {
    if (e.target === e.target.getStage() || e.target.name() === 'background') {
      clearSelection();
    }
  };

  // Render background
  const renderBackground = () => {
    const bgColor = background.type === 'solid' ? background.color : '#f0f0f0';
    return (
      <Rect
        name="background"
        x={0}
        y={0}
        width={canvasSize.width}
        height={canvasSize.height}
        fill={bgColor}
      />
    );
  };

  // Render grid (only in edit mode)
  const renderGrid = () => {
    if (!showGrid || previewMode) return null;
    
    const gridSize = 20;
    const lines = [];
    
    for (let x = 0; x <= canvasSize.width; x += gridSize) {
      lines.push(
        <Rect key={`v-${x}`} x={x} y={0} width={1} height={canvasSize.height} fill="rgba(0,0,0,0.03)" />
      );
    }
    for (let y = 0; y <= canvasSize.height; y += gridSize) {
      lines.push(
        <Rect key={`h-${y}`} x={0} y={y} width={canvasSize.width} height={1} fill="rgba(0,0,0,0.03)" />
      );
    }
    return lines;
  };

  const colors = CHART_PALETTES[chartPalette] || CHART_PALETTES.default;

  return (
    <div 
      ref={containerRef}
      className="canvas-container w-full h-full flex items-center justify-center p-8"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div 
        className="shadow-2xl rounded-lg overflow-hidden"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
      >
        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleStageClick}
          onTap={handleStageClick}
          data-testid="canvas-stage"
        >
          <Layer>
            {renderBackground()}
            {renderGrid()}

            {zones
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((zone) => (
                <ZoneElement
                  key={zone.id}
                  zone={zone}
                  isSelected={selectedZoneId === zone.id && !previewMode}
                  onSelect={() => selectZone(zone.id)}
                  onUpdate={(updates) => updateZone(zone.id, updates)}
                  previewMode={previewMode}
                  showVisualizations={showVisualizations && !previewMode}
                  colors={colors}
                />
              ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

// Zone Element Component
const ZoneElement = ({ zone, isSelected, onSelect, onUpdate, previewMode, showVisualizations, colors }) => {
  const shapeRef = useRef();
  const transformerRef = useRef();
  const typeConfig = ZONE_TYPES[zone.type];

  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    onUpdate({ x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onUpdate({
      x: node.x(),
      y: node.y(),
      width: Math.max(50, node.width() * scaleX),
      height: Math.max(30, node.height() * scaleY)
    });
  };

  // Style
  const fillColor = zone.style?.fillColor || '#ffffff';
  const fillOpacity = zone.style?.fillOpacity ?? 1;
  const borderColor = zone.style?.borderColor || '#e5e7eb';
  const borderWidth = zone.style?.borderWidth || 0;
  const cornerRadius = zone.style?.cornerRadius || 8;
  const shadowEnabled = zone.style?.shadowEnabled ?? true;

  return (
    <>
      <Group
        ref={shapeRef}
        x={zone.x}
        y={zone.y}
        width={zone.width}
        height={zone.height}
        draggable={!previewMode}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {/* Card background */}
        <Rect
          width={zone.width}
          height={zone.height}
          fill={fillColor}
          opacity={fillOpacity}
          cornerRadius={cornerRadius}
          shadowColor={shadowEnabled ? 'rgba(0,0,0,0.12)' : 'transparent'}
          shadowBlur={shadowEnabled ? 12 : 0}
          shadowOffsetX={0}
          shadowOffsetY={shadowEnabled ? 4 : 0}
          stroke={borderWidth > 0 ? borderColor : 'transparent'}
          strokeWidth={borderWidth}
        />

        {/* Visualization preview */}
        {showVisualizations && typeConfig?.visualization !== 'none' && (
          <VisualizationPreview 
            type={typeConfig.visualization} 
            width={zone.width} 
            height={zone.height}
            label={zone.label}
            config={zone.visualConfig}
            colors={colors}
          />
        )}

        {/* Label (hidden in preview/export mode) */}
        {!previewMode && (
          <>
            <Rect
              x={6}
              y={6}
              width={Math.min(zone.width - 12, zone.label.length * 6.5 + 12)}
              height={18}
              fill="rgba(0,0,0,0.6)"
              cornerRadius={3}
            />
            <Text
              x={10}
              y={9}
              text={zone.label}
              fontSize={9}
              fontFamily="Inter, sans-serif"
              fontStyle="600"
              fill="#ffffff"
              width={zone.width - 20}
              ellipsis={true}
            />
          </>
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 30) return oldBox;
            return newBox;
          }}
          anchorSize={8}
          anchorCornerRadius={2}
          borderStroke="#2563eb"
          borderStrokeWidth={2}
          anchorStroke="#2563eb"
          anchorFill="#ffffff"
          rotateEnabled={false}
        />
      )}
    </>
  );
};

// Visualization Preview Component - renders mock charts
const VisualizationPreview = ({ type, width, height, label, config, colors }) => {
  const padding = 35;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding - 20;
  const startY = 30;

  switch (type) {
    case 'bar':
      return <BarChartPreview x={padding} y={startY} width={chartWidth} height={chartHeight} colors={colors} />;
    
    case 'stacked_bar':
      return <StackedBarPreview x={padding} y={startY} width={chartWidth} height={chartHeight} colors={colors} />;
    
    case 'horizontal_bar':
      return <HorizontalBarPreview x={padding} y={startY} width={chartWidth} height={chartHeight} colors={colors} />;
    
    case 'line':
      return <LineChartPreview x={padding} y={startY} width={chartWidth} height={chartHeight} colors={colors} />;
    
    case 'area':
      return <AreaChartPreview x={padding} y={startY} width={chartWidth} height={chartHeight} colors={colors} />;
    
    case 'pie':
      return <PieChartPreview cx={width/2} cy={height/2 + 5} radius={Math.min(width, height) / 2 - 30} colors={colors} />;
    
    case 'donut':
      return <DonutChartPreview cx={width/2} cy={height/2 + 5} radius={Math.min(width, height) / 2 - 30} colors={colors} />;
    
    case 'kpi':
      return <KPIPreview width={width} height={height} config={config} />;
    
    case 'table':
      return <TablePreview x={15} y={30} width={width - 30} height={height - 45} />;
    
    case 'filter':
      return <FilterPreview width={width} height={height} label={label} />;
    
    case 'header':
      return <HeaderPreview width={width} height={height} label={label} config={config} />;
    
    case 'tabs':
      return <TabsPreview width={width} height={height} label={label} config={config} />;
    
    case 'text':
      return <TextPreview width={width} height={height} label={label} />;
    
    default:
      return null;
  }
};

// Bar Chart
const BarChartPreview = ({ x, y, width, height, colors }) => {
  const bars = [0.65, 0.85, 0.45, 0.75, 0.55];
  const barWidth = width / bars.length - 8;
  
  return (
    <Group x={x} y={y}>
      {bars.map((h, i) => (
        <Rect
          key={i}
          x={i * (barWidth + 8) + 4}
          y={height * (1 - h)}
          width={barWidth}
          height={height * h}
          fill={colors[i % colors.length]}
          cornerRadius={[2, 2, 0, 0]}
        />
      ))}
      <Line points={[0, height, width, height]} stroke="#e5e7eb" strokeWidth={1} />
    </Group>
  );
};

// Stacked Bar Chart
const StackedBarPreview = ({ x, y, width, height, colors }) => {
  const data = [
    [0.4, 0.3, 0.2],
    [0.35, 0.35, 0.25],
    [0.45, 0.25, 0.2]
  ];
  const barWidth = width / data.length - 12;
  
  return (
    <Group x={x} y={y}>
      {data.map((stack, i) => {
        let currentY = height;
        return stack.map((h, j) => {
          const segmentHeight = height * h;
          currentY -= segmentHeight;
          return (
            <Rect
              key={`${i}-${j}`}
              x={i * (barWidth + 12) + 6}
              y={currentY}
              width={barWidth}
              height={segmentHeight}
              fill={colors[j % colors.length]}
            />
          );
        });
      })}
      <Line points={[0, height, width, height]} stroke="#e5e7eb" strokeWidth={1} />
    </Group>
  );
};

// Horizontal Bar Chart
const HorizontalBarPreview = ({ x, y, width, height, colors }) => {
  const bars = [0.9, 0.75, 0.6, 0.5, 0.4, 0.35, 0.25];
  const barHeight = Math.min(20, (height - 20) / bars.length);
  const gap = 4;
  
  return (
    <Group x={x} y={y}>
      {bars.map((w, i) => (
        <Group key={i} y={i * (barHeight + gap)}>
          <Rect
            x={0}
            y={0}
            width={width * w * 0.7}
            height={barHeight}
            fill={colors[0]}
            cornerRadius={[0, 2, 2, 0]}
          />
          <Text
            x={width * w * 0.7 + 5}
            y={barHeight / 2 - 5}
            text={`${Math.round(w * 100)}`}
            fontSize={9}
            fill="#6b7280"
          />
        </Group>
      ))}
    </Group>
  );
};

// Line Chart
const LineChartPreview = ({ x, y, width, height, colors }) => {
  const points1 = [0, height * 0.7, width * 0.25, height * 0.4, width * 0.5, height * 0.5, width * 0.75, height * 0.25, width, height * 0.35];
  const points2 = [0, height * 0.85, width * 0.25, height * 0.65, width * 0.5, height * 0.7, width * 0.75, height * 0.5, width, height * 0.55];
  
  return (
    <Group x={x} y={y}>
      <Line points={[0, height, width, height]} stroke="#e5e7eb" strokeWidth={1} />
      <Line points={[0, 0, 0, height]} stroke="#e5e7eb" strokeWidth={1} />
      <Line points={points2} stroke={colors[1]} strokeWidth={2} tension={0.3} />
      <Line points={points1} stroke={colors[0]} strokeWidth={2} tension={0.3} />
    </Group>
  );
};

// Area Chart
const AreaChartPreview = ({ x, y, width, height, colors }) => {
  const points = [0, height, 0, height * 0.7, width * 0.2, height * 0.5, width * 0.4, height * 0.6, width * 0.6, height * 0.3, width * 0.8, height * 0.4, width, height * 0.2, width, height];
  
  return (
    <Group x={x} y={y}>
      <Line points={points} fill={colors[0]} opacity={0.3} closed={true} />
      <Line 
        points={[0, height * 0.7, width * 0.2, height * 0.5, width * 0.4, height * 0.6, width * 0.6, height * 0.3, width * 0.8, height * 0.4, width, height * 0.2]} 
        stroke={colors[0]} 
        strokeWidth={2} 
        tension={0.3} 
      />
      <Line points={[0, height, width, height]} stroke="#e5e7eb" strokeWidth={1} />
    </Group>
  );
};

// Pie Chart
const PieChartPreview = ({ cx, cy, radius, colors }) => {
  const data = [0.35, 0.25, 0.2, 0.12, 0.08];
  let startAngle = -90;
  
  return (
    <Group>
      {data.map((value, i) => {
        const angle = value * 360;
        const segment = (
          <Arc
            key={i}
            x={cx}
            y={cy}
            innerRadius={0}
            outerRadius={radius}
            angle={angle}
            rotation={startAngle}
            fill={colors[i % colors.length]}
          />
        );
        startAngle += angle;
        return segment;
      })}
    </Group>
  );
};

// Donut Chart
const DonutChartPreview = ({ cx, cy, radius, colors }) => {
  const data = [0.4, 0.3, 0.2, 0.1];
  let startAngle = -90;
  const innerRadius = radius * 0.55;
  
  return (
    <Group>
      {data.map((value, i) => {
        const angle = value * 360;
        const segment = (
          <Arc
            key={i}
            x={cx}
            y={cy}
            innerRadius={innerRadius}
            outerRadius={radius}
            angle={angle}
            rotation={startAngle}
            fill={colors[i % colors.length]}
          />
        );
        startAngle += angle;
        return segment;
      })}
      <Text
        x={cx - 20}
        y={cy - 8}
        text="65%"
        fontSize={16}
        fontStyle="bold"
        fill="#374151"
      />
    </Group>
  );
};

// KPI Card
const KPIPreview = ({ width, height, config }) => {
  const value = config?.value || '$1.2M';
  const trend = config?.trend || '+12%';
  const trendUp = config?.trendUp !== false;
  
  return (
    <Group>
      <Text
        x={15}
        y={height * 0.35}
        text={value}
        fontSize={Math.min(28, width / 5)}
        fontStyle="bold"
        fill="#1f2937"
      />
      <Text
        x={15}
        y={height * 0.65}
        text={trend}
        fontSize={12}
        fill={trendUp ? '#10b981' : '#ef4444'}
      />
    </Group>
  );
};

// Table
const TablePreview = ({ x, y, width, height }) => {
  const rows = Math.floor(height / 22);
  const cols = 4;
  const colWidth = width / cols;
  
  return (
    <Group x={x} y={y}>
      {/* Header */}
      <Rect x={0} y={0} width={width} height={20} fill="#f3f4f6" />
      {Array.from({ length: cols }).map((_, i) => (
        <Rect key={`h-${i}`} x={i * colWidth + 5} y={5} width={colWidth - 15} height={10} fill="#d1d5db" cornerRadius={2} />
      ))}
      {/* Rows */}
      {Array.from({ length: rows - 1 }).map((_, row) => (
        <Group key={row} y={(row + 1) * 22}>
          <Line points={[0, 0, width, 0]} stroke="#e5e7eb" strokeWidth={1} />
          {Array.from({ length: cols }).map((_, col) => (
            <Rect
              key={`${row}-${col}`}
              x={col * colWidth + 5}
              y={5}
              width={colWidth * (0.4 + Math.random() * 0.4)}
              height={10}
              fill="#e5e7eb"
              cornerRadius={2}
            />
          ))}
        </Group>
      ))}
    </Group>
  );
};

// Filter Dropdown
const FilterPreview = ({ width, height, label }) => {
  return (
    <Group>
      <Text x={10} y={10} text={label} fontSize={10} fill="#6b7280" />
      <Text x={10} y={height - 20} text="(Todas)" fontSize={11} fill="#374151" />
      <Text x={width - 20} y={height - 20} text="▼" fontSize={8} fill="#9ca3af" />
    </Group>
  );
};

// Header
const HeaderPreview = ({ width, height, label, config }) => {
  const isDark = config?.logoColor === '#003366' || label.includes('Elea');
  return (
    <Group>
      <Text
        x={20}
        y={height / 2 - 10}
        text={isDark ? '≡ Elea' : label}
        fontSize={18}
        fontStyle="bold"
        fill={isDark ? '#003366' : '#ffffff'}
      />
      {isDark && (
        <Text x={80} y={height / 2 - 8} text="Selección" fontSize={14} fill="#003366" />
      )}
    </Group>
  );
};

// Tabs
const TabsPreview = ({ width, height, label, config }) => {
  const isActive = config?.active !== false;
  return (
    <Group>
      <Text
        x={20}
        y={height / 2 - 6}
        text={label}
        fontSize={11}
        fontStyle={isActive ? 'bold' : 'normal'}
        fill={isActive ? '#ffffff' : '#374151'}
      />
    </Group>
  );
};

// Text Box
const TextPreview = ({ width, height, label }) => {
  return (
    <Group>
      <Text
        x={10}
        y={height / 2 - 8}
        text={label}
        fontSize={14}
        fontStyle="bold"
        fill="#ffffff"
      />
    </Group>
  );
};

export default Canvas;
