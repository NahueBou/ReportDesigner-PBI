import { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Rect, Text, Group, Transformer, Line, Circle, Arc } from "react-konva";
import useDesignerStore, { ZONE_TYPES, CHART_PALETTES } from "@/store/designerStore";
import AnnotationOverlay from "./AnnotationOverlay";

const Canvas = () => {
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const transformerRef = useRef(null);
  const selectionStartRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartPositions = useRef({});
  const [selectionBox, setSelectionBox] = useState(null);

  const {
    canvasSize,
    getBackground,
    getZones,
    showGrid,
    zoom,
    selectedZoneIds,
    selectedZoneId,
    previewMode,
    showVisualizations,
    showAnnotations,
    commentMode,
    chartPalette,
    alignmentGuides,
    showAlignmentGuides,
    selectZone,
    toggleZoneSelection,
    setSelectedZoneIds,
    clearSelection,
    updateZone,
    addZone,
    addAnnotation,
    clearAnnotationSelection,
    calculateAlignmentGuides,
    setAlignmentGuides,
  } = useDesignerStore();

  const zones = getZones();
  const background = getBackground();

  // Store ref for export
  useEffect(() => {
    if (stageRef.current) {
      window.konvaStage = stageRef.current;
    }
  }, []);

  // Sync Transformer with selectedZoneIds
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    const nodes = selectedZoneIds
      .map(id => stageRef.current.findOne(`#zone-${id}`))
      .filter(Boolean);
    transformerRef.current.nodes(nodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedZoneIds]);

  // Handle transform end (resize via transformer handles)
  const handleTransformEnd = useCallback(() => {
    if (!transformerRef.current) return;
    transformerRef.current.nodes().forEach(node => {
      const zoneId = node.id().replace('zone-', '');
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      updateZone(zoneId, {
        x: node.x(),
        y: node.y(),
        width: Math.max(50, node.width() * scaleX),
        height: Math.max(30, node.height() * scaleY),
      });
    });
  }, [updateZone]);

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

  // Zone click (handles ctrl+click for multi-select)
  const handleZoneClick = useCallback((zoneId, e) => {
    if (commentMode) return; // Don't change selection in comment mode
    if (e.evt.ctrlKey || e.evt.metaKey) {
      toggleZoneSelection(zoneId);
    } else {
      selectZone(zoneId);
    }
  }, [commentMode, toggleZoneSelection, selectZone]);

  // Stage click (empty canvas)
  const handleStageClick = (e) => {
    if (e.target === e.target.getStage() || e.target.name() === 'background') {
      if (isDraggingRef.current) return; // Was a marquee drag, not a click
      if (commentMode) {
        const pos = e.target.getStage().getPointerPosition();
        addAnnotation(pos.x, pos.y);
      } else {
        clearSelection();
        clearAnnotationSelection();
      }
    }
  };

  // Marquee selection — mouse down on empty canvas
  const handleMouseDown = (e) => {
    if (e.target !== e.target.getStage() && e.target.name() !== 'background') return;
    if (commentMode) return;
    const pos = e.target.getStage().getPointerPosition();
    selectionStartRef.current = pos;
    isDraggingRef.current = false;
    setSelectionBox(null);
  };

  const handleMouseMove = (e) => {
    if (!selectionStartRef.current) return;
    const pos = e.target.getStage().getPointerPosition();
    const start = selectionStartRef.current;
    const dx = pos.x - start.x;
    const dy = pos.y - start.y;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      isDraggingRef.current = true;
      setSelectionBox({
        x: Math.min(start.x, pos.x),
        y: Math.min(start.y, pos.y),
        width: Math.abs(dx),
        height: Math.abs(dy),
      });
    }
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current && selectionBox) {
      const matching = zones.filter(zone =>
        zone.x < selectionBox.x + selectionBox.width &&
        zone.x + zone.width > selectionBox.x &&
        zone.y < selectionBox.y + selectionBox.height &&
        zone.y + zone.height > selectionBox.y
      );
      if (matching.length > 0) {
        setSelectedZoneIds(matching.map(z => z.id));
      } else {
        clearSelection();
      }
    }
    selectionStartRef.current = null;
    setTimeout(() => { isDraggingRef.current = false; }, 0);
    setSelectionBox(null);
  };

  // Group drag: when a selected zone is dragged, all others follow
  const handleZoneDragStart = useCallback((zoneId) => {
    if (selectedZoneIds.includes(zoneId) && selectedZoneIds.length > 1) {
      selectedZoneIds.forEach(id => {
        const node = stageRef.current?.findOne(`#zone-${id}`);
        if (node) dragStartPositions.current[id] = { x: node.x(), y: node.y() };
      });
    }
  }, [selectedZoneIds]);

  const handleZoneDragMove = useCallback((zoneId, newX, newY) => {
    if (selectedZoneIds.includes(zoneId) && selectedZoneIds.length > 1) {
      const startPos = dragStartPositions.current[zoneId];
      if (startPos) {
        const deltaX = newX - startPos.x;
        const deltaY = newY - startPos.y;
        selectedZoneIds.filter(id => id !== zoneId).forEach(id => {
          const node = stageRef.current?.findOne(`#zone-${id}`);
          const sp = dragStartPositions.current[id];
          if (node && sp) {
            node.x(sp.x + deltaX);
            node.y(sp.y + deltaY);
          }
        });
        stageRef.current?.batchDraw();
      }
    } else {
      const zone = zones.find(z => z.id === zoneId);
      if (zone) {
        const guides = calculateAlignmentGuides(zoneId, newX, newY, zone.width, zone.height);
        setAlignmentGuides(guides);
      }
    }
  }, [selectedZoneIds, zones, calculateAlignmentGuides, setAlignmentGuides]);

  const handleZoneDragEnd = useCallback((zoneId, newX, newY) => {
    if (selectedZoneIds.includes(zoneId) && selectedZoneIds.length > 1) {
      const startPos = dragStartPositions.current[zoneId];
      if (startPos) {
        const deltaX = newX - startPos.x;
        const deltaY = newY - startPos.y;
        selectedZoneIds.forEach(id => {
          const sp = dragStartPositions.current[id];
          if (sp) updateZone(id, { x: sp.x + deltaX, y: sp.y + deltaY });
        });
      }
      dragStartPositions.current = {};
    } else {
      updateZone(zoneId, { x: newX, y: newY });
    }
    setAlignmentGuides([]);
  }, [selectedZoneIds, updateZone, setAlignmentGuides]);

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
      lines.push(<Rect key={`v-${x}`} x={x} y={0} width={1} height={canvasSize.height} fill="rgba(0,0,0,0.03)" />);
    }
    for (let y = 0; y <= canvasSize.height; y += gridSize) {
      lines.push(<Rect key={`h-${y}`} x={0} y={y} width={canvasSize.width} height={1} fill="rgba(0,0,0,0.03)" />);
    }
    return lines;
  };

  const colors = CHART_PALETTES[chartPalette] || CHART_PALETTES.default;

  const renderAlignmentGuides = () => {
    if (!showAlignmentGuides || previewMode || alignmentGuides.length === 0) return null;
    return alignmentGuides.map((guide, i) => {
      if (guide.type === 'vertical') {
        return <Line key={`guide-v-${i}`} points={[guide.x, guide.y1 - 10, guide.x, guide.y2 + 10]} stroke="#f43f5e" strokeWidth={1} dash={[4, 4]} />;
      }
      return <Line key={`guide-h-${i}`} points={[guide.x1 - 10, guide.y, guide.x2 + 10, guide.y]} stroke="#f43f5e" strokeWidth={1} dash={[4, 4]} />;
    });
  };

  const isEmpty = zones.length === 0;

  return (
    <div
      ref={containerRef}
      className="canvas-container w-full h-full flex items-center justify-center p-8"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div
        className="shadow-2xl rounded-lg overflow-hidden"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          position: 'relative',
          cursor: commentMode ? 'crosshair' : 'default',
        }}
      >
        {/* Empty state overlay */}
        {isEmpty && !previewMode && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', gap: 12,
          }}>
            <div style={{ fontSize: 40, lineHeight: 1 }}>📊</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', margin: 0 }}>Tu reporte está vacío</p>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0, textAlign: 'center', maxWidth: 340 }}>
              Seleccioná un componente del panel izquierdo para agregarlo,<br />
              o usá el botón <strong>Templates</strong> para generar un layout automático.
            </p>
          </div>
        )}

        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
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
                  isSelected={selectedZoneIds.includes(zone.id) && !previewMode}
                  onSelect={(e) => handleZoneClick(zone.id, e)}
                  onUpdate={(updates) => updateZone(zone.id, updates)}
                  onDragStart={() => handleZoneDragStart(zone.id)}
                  onDragMove={(newX, newY) => handleZoneDragMove(zone.id, newX, newY)}
                  onDragEnd={(newX, newY) => handleZoneDragEnd(zone.id, newX, newY)}
                  previewMode={previewMode}
                  showVisualizations={showVisualizations && !previewMode}
                  colors={colors}
                />
              ))}

            {/* Marquee selection box */}
            {selectionBox && (
              <Rect
                x={selectionBox.x}
                y={selectionBox.y}
                width={selectionBox.width}
                height={selectionBox.height}
                stroke="#2563eb"
                strokeWidth={1}
                fill="rgba(37, 99, 235, 0.08)"
                dash={[4, 4]}
              />
            )}

            {renderAlignmentGuides()}

            {/* Single shared Transformer for all selected zones */}
            {!previewMode && (
              <Transformer
                ref={transformerRef}
                onTransformEnd={handleTransformEnd}
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
          </Layer>
        </Stage>

        {/* Annotation overlay (HTML over canvas) */}
        {showAnnotations && !previewMode && <AnnotationOverlay />}
      </div>
    </div>
  );
};

// Zone Element Component — no longer has its own Transformer (shared at Canvas level)
const ZoneElement = ({ zone, isSelected, onSelect, onUpdate, onDragStart, onDragMove, onDragEnd: onDragEndCallback, previewMode, showVisualizations, colors }) => {
  const shapeRef = useRef();
  const typeConfig = ZONE_TYPES[zone.type];

  const handleDragMove = (e) => {
    if (onDragMove) onDragMove(e.target.x(), e.target.y());
  };

  const handleDragEnd = (e) => {
    if (onDragEndCallback) onDragEndCallback(e.target.x(), e.target.y());
  };

  const fillColor = zone.style?.fillColor || '#ffffff';
  const fillOpacity = zone.style?.fillOpacity ?? 1;
  const borderColor = zone.style?.borderColor || '#e5e7eb';
  const borderWidth = zone.style?.borderWidth || 0;
  const cornerRadius = zone.style?.cornerRadius || 8;
  const shadowEnabled = zone.style?.shadowEnabled ?? true;

  return (
    <Group
      ref={shapeRef}
      id={`zone-${zone.id}`}
      x={zone.x}
      y={zone.y}
      width={zone.width}
      height={zone.height}
      draggable={!previewMode}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
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
            x={6} y={6}
            width={Math.min(zone.width - 12, zone.label.length * 6.5 + 12)}
            height={18}
            fill="rgba(0,0,0,0.6)"
            cornerRadius={3}
          />
          <Text
            x={10} y={9}
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
  );
};

// ============== Visualization Previews (unchanged) ==============

const VisualizationPreview = ({ type, width, height, label, config, colors }) => {
  const padding = 35;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding - 20;
  const startY = 30;

  switch (type) {
    case 'bar': return <BarChartPreview x={padding} y={startY} width={chartWidth} height={chartHeight} colors={colors} />;
    case 'stacked_bar': return <StackedBarPreview x={padding} y={startY} width={chartWidth} height={chartHeight} colors={colors} />;
    case 'horizontal_bar': return <HorizontalBarPreview x={padding} y={startY} width={chartWidth} height={chartHeight} colors={colors} />;
    case 'line': return <LineChartPreview x={padding} y={startY} width={chartWidth} height={chartHeight} colors={colors} />;
    case 'area': return <AreaChartPreview x={padding} y={startY} width={chartWidth} height={chartHeight} colors={colors} />;
    case 'pie': return <PieChartPreview cx={width / 2} cy={height / 2 + 5} radius={Math.min(width, height) / 2 - 30} colors={colors} />;
    case 'donut': return <DonutChartPreview cx={width / 2} cy={height / 2 + 5} radius={Math.min(width, height) / 2 - 30} colors={colors} />;
    case 'kpi': return <KPIPreview width={width} height={height} config={config} />;
    case 'table': return <TablePreview x={15} y={30} width={width - 30} height={height - 45} />;
    case 'filter': return <FilterPreview width={width} height={height} label={label} />;
    case 'header': return <HeaderPreview width={width} height={height} label={label} config={config} />;
    case 'tabs': return <TabsPreview width={width} height={height} label={label} config={config} />;
    case 'text': return <TextPreview width={width} height={height} label={label} />;
    default: return null;
  }
};

const BarChartPreview = ({ x, y, width, height, colors }) => {
  const bars = [0.65, 0.85, 0.45, 0.75, 0.55];
  const barWidth = width / bars.length - 8;
  return (
    <Group x={x} y={y}>
      {bars.map((h, i) => (
        <Rect key={i} x={i * (barWidth + 8) + 4} y={height * (1 - h)} width={barWidth} height={height * h} fill={colors[i % colors.length]} cornerRadius={[2, 2, 0, 0]} />
      ))}
      <Line points={[0, height, width, height]} stroke="#e5e7eb" strokeWidth={1} />
    </Group>
  );
};

const StackedBarPreview = ({ x, y, width, height, colors }) => {
  const data = [[0.4, 0.3, 0.2], [0.35, 0.35, 0.25], [0.45, 0.25, 0.2]];
  const barWidth = width / data.length - 12;
  return (
    <Group x={x} y={y}>
      {data.map((stack, i) => {
        let currentY = height;
        return stack.map((h, j) => {
          const segH = height * h;
          currentY -= segH;
          return <Rect key={`${i}-${j}`} x={i * (barWidth + 12) + 6} y={currentY} width={barWidth} height={segH} fill={colors[j % colors.length]} />;
        });
      })}
      <Line points={[0, height, width, height]} stroke="#e5e7eb" strokeWidth={1} />
    </Group>
  );
};

const HorizontalBarPreview = ({ x, y, width, height, colors }) => {
  const bars = [0.9, 0.75, 0.6, 0.5, 0.4, 0.35, 0.25];
  const barHeight = Math.min(20, (height - 20) / bars.length);
  const gap = 4;
  return (
    <Group x={x} y={y}>
      {bars.map((w, i) => (
        <Group key={i} y={i * (barHeight + gap)}>
          <Rect x={0} y={0} width={width * w * 0.7} height={barHeight} fill={colors[0]} cornerRadius={[0, 2, 2, 0]} />
          <Text x={width * w * 0.7 + 5} y={barHeight / 2 - 5} text={`${Math.round(w * 100)}`} fontSize={9} fill="#6b7280" />
        </Group>
      ))}
    </Group>
  );
};

const LineChartPreview = ({ x, y, width, height, colors }) => {
  const pts1 = [0, height * 0.7, width * 0.25, height * 0.4, width * 0.5, height * 0.5, width * 0.75, height * 0.25, width, height * 0.35];
  const pts2 = [0, height * 0.85, width * 0.25, height * 0.65, width * 0.5, height * 0.7, width * 0.75, height * 0.5, width, height * 0.55];
  return (
    <Group x={x} y={y}>
      <Line points={[0, height, width, height]} stroke="#e5e7eb" strokeWidth={1} />
      <Line points={[0, 0, 0, height]} stroke="#e5e7eb" strokeWidth={1} />
      <Line points={pts2} stroke={colors[1]} strokeWidth={2} tension={0.3} />
      <Line points={pts1} stroke={colors[0]} strokeWidth={2} tension={0.3} />
    </Group>
  );
};

const AreaChartPreview = ({ x, y, width, height, colors }) => {
  const pts = [0, height, 0, height * 0.7, width * 0.2, height * 0.5, width * 0.4, height * 0.6, width * 0.6, height * 0.3, width * 0.8, height * 0.4, width, height * 0.2, width, height];
  return (
    <Group x={x} y={y}>
      <Line points={pts} fill={colors[0]} opacity={0.3} closed={true} />
      <Line points={[0, height * 0.7, width * 0.2, height * 0.5, width * 0.4, height * 0.6, width * 0.6, height * 0.3, width * 0.8, height * 0.4, width, height * 0.2]} stroke={colors[0]} strokeWidth={2} tension={0.3} />
      <Line points={[0, height, width, height]} stroke="#e5e7eb" strokeWidth={1} />
    </Group>
  );
};

const PieChartPreview = ({ cx, cy, radius, colors }) => {
  const data = [0.35, 0.25, 0.2, 0.12, 0.08];
  let startAngle = -90;
  return (
    <Group>
      {data.map((value, i) => {
        const angle = value * 360;
        const seg = <Arc key={i} x={cx} y={cy} innerRadius={0} outerRadius={radius} angle={angle} rotation={startAngle} fill={colors[i % colors.length]} />;
        startAngle += angle;
        return seg;
      })}
    </Group>
  );
};

const DonutChartPreview = ({ cx, cy, radius, colors }) => {
  const data = [0.4, 0.3, 0.2, 0.1];
  let startAngle = -90;
  const innerRadius = radius * 0.55;
  return (
    <Group>
      {data.map((value, i) => {
        const angle = value * 360;
        const seg = <Arc key={i} x={cx} y={cy} innerRadius={innerRadius} outerRadius={radius} angle={angle} rotation={startAngle} fill={colors[i % colors.length]} />;
        startAngle += angle;
        return seg;
      })}
      <Text x={cx - 20} y={cy - 8} text="65%" fontSize={16} fontStyle="bold" fill="#374151" />
    </Group>
  );
};

const KPIPreview = ({ width, height, config }) => {
  const value = config?.value || '$1.2M';
  const trend = config?.trend || '+12%';
  const trendUp = config?.trendUp !== false;
  return (
    <Group>
      <Text x={15} y={height * 0.35} text={value} fontSize={Math.min(28, width / 5)} fontStyle="bold" fill="#1f2937" />
      <Text x={15} y={height * 0.65} text={trend} fontSize={12} fill={trendUp ? '#10b981' : '#ef4444'} />
    </Group>
  );
};

const TablePreview = ({ x, y, width, height }) => {
  const rows = Math.floor(height / 22);
  const cols = 4;
  const colWidth = width / cols;
  return (
    <Group x={x} y={y}>
      <Rect x={0} y={0} width={width} height={20} fill="#f3f4f6" />
      {Array.from({ length: cols }).map((_, i) => (
        <Rect key={`h-${i}`} x={i * colWidth + 5} y={5} width={colWidth - 15} height={10} fill="#d1d5db" cornerRadius={2} />
      ))}
      {Array.from({ length: rows - 1 }).map((_, row) => (
        <Group key={row} y={(row + 1) * 22}>
          <Line points={[0, 0, width, 0]} stroke="#e5e7eb" strokeWidth={1} />
          {Array.from({ length: cols }).map((_, col) => (
            <Rect key={`${row}-${col}`} x={col * colWidth + 5} y={5} width={colWidth * (0.4 + Math.random() * 0.4)} height={10} fill="#e5e7eb" cornerRadius={2} />
          ))}
        </Group>
      ))}
    </Group>
  );
};

const FilterPreview = ({ width, height, label }) => (
  <Group>
    <Text x={10} y={10} text={label} fontSize={10} fill="#6b7280" />
    <Text x={10} y={height - 20} text="(Todas)" fontSize={11} fill="#374151" />
    <Text x={width - 20} y={height - 20} text="▼" fontSize={8} fill="#9ca3af" />
  </Group>
);

const HeaderPreview = ({ width, height, label, config }) => {
  const isDark = config?.logoColor === '#003366' || label.includes('Elea');
  return (
    <Group>
      <Text x={20} y={height / 2 - 10} text={isDark ? '≡ Elea' : label} fontSize={18} fontStyle="bold" fill={isDark ? '#003366' : '#ffffff'} />
      {isDark && <Text x={80} y={height / 2 - 8} text="Selección" fontSize={14} fill="#003366" />}
    </Group>
  );
};

const TabsPreview = ({ width, height, label, config }) => {
  const isActive = config?.active !== false;
  return (
    <Group>
      <Text x={20} y={height / 2 - 6} text={label} fontSize={11} fontStyle={isActive ? 'bold' : 'normal'} fill={isActive ? '#ffffff' : '#374151'} />
    </Group>
  );
};

const TextPreview = ({ width, height, label }) => (
  <Group>
    <Text x={10} y={height / 2 - 8} text={label} fontSize={14} fontStyle="bold" fill="#ffffff" />
  </Group>
);

export default Canvas;
