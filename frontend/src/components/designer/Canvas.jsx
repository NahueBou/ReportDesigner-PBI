import { useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Text, Group, Transformer } from "react-konva";
import useDesignerStore, { ZONE_TYPES } from "@/store/designerStore";

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
    selectZone,
    clearSelection,
    updateZone,
    addZone
  } = useDesignerStore();

  // Handle drop from sidebar
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("zoneType");
    if (!type || !ZONE_TYPES[type]) return;

    const stage = stageRef.current;
    if (!stage) return;

    // Get position relative to stage
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
    // Click on empty space deselects
    if (e.target === e.target.getStage() || e.target.name() === 'background') {
      clearSelection();
    }
  };

  // Render background based on type
  const renderBackground = () => {
    if (background.type === 'solid') {
      return (
        <Rect
          name="background"
          x={0}
          y={0}
          width={canvasSize.width}
          height={canvasSize.height}
          fill={background.color}
        />
      );
    }
    
    if (background.type === 'gradient') {
      const isVertical = background.direction === 'vertical';
      const isDiagonal = background.direction === 'diagonal';
      
      return (
        <Rect
          name="background"
          x={0}
          y={0}
          width={canvasSize.width}
          height={canvasSize.height}
          fillLinearGradientStartPoint={isDiagonal ? { x: 0, y: 0 } : { x: 0, y: 0 }}
          fillLinearGradientEndPoint={
            isDiagonal 
              ? { x: canvasSize.width, y: canvasSize.height }
              : isVertical 
                ? { x: 0, y: canvasSize.height }
                : { x: canvasSize.width, y: 0 }
          }
          fillLinearGradientColorStops={[0, background.colors[0], 1, background.colors[1]]}
        />
      );
    }

    return (
      <Rect
        name="background"
        x={0}
        y={0}
        width={canvasSize.width}
        height={canvasSize.height}
        fill="#ffffff"
      />
    );
  };

  // Render grid overlay
  const renderGrid = () => {
    if (!showGrid || previewMode) return null;
    
    const gridSize = 20;
    const lines = [];
    
    // Vertical lines
    for (let x = 0; x <= canvasSize.width; x += gridSize) {
      lines.push(
        <Rect
          key={`v-${x}`}
          x={x}
          y={0}
          width={1}
          height={canvasSize.height}
          fill="rgba(0,0,0,0.05)"
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvasSize.height; y += gridSize) {
      lines.push(
        <Rect
          key={`h-${y}`}
          x={0}
          y={y}
          width={canvasSize.width}
          height={1}
          fill="rgba(0,0,0,0.05)"
        />
      );
    }
    
    return lines;
  };

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
          transformOrigin: 'center center'
        }}
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
            {/* Background */}
            {renderBackground()}
            
            {/* Grid */}
            {renderGrid()}

            {/* Zones */}
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
                />
              ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

// Zone Element Component
const ZoneElement = ({ zone, isSelected, onSelect, onUpdate, previewMode }) => {
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
    onUpdate({
      x: e.target.x(),
      y: e.target.y()
    });
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

  const fillColor = zone.style?.fillColor || '#ffffff';
  const fillOpacity = zone.style?.fillOpacity ?? 0.1;
  const borderColor = zone.style?.borderColor || '#e5e7eb';
  const borderWidth = zone.style?.borderWidth || 2;
  const cornerRadius = zone.style?.cornerRadius || 8;
  const borderStyle = zone.style?.borderStyle || 'dashed';

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
        {/* Zone background */}
        <Rect
          width={zone.width}
          height={zone.height}
          fill={fillColor}
          opacity={fillOpacity}
          cornerRadius={cornerRadius}
        />

        {/* Zone border */}
        <Rect
          width={zone.width}
          height={zone.height}
          stroke={borderColor}
          strokeWidth={borderWidth}
          cornerRadius={cornerRadius}
          dash={borderStyle === 'dashed' ? [8, 4] : undefined}
        />

        {/* Zone label (hidden in preview mode) */}
        {!previewMode && (
          <>
            {/* Type badge background */}
            <Rect
              x={8}
              y={8}
              width={zone.label.length * 7 + 24}
              height={22}
              fill="rgba(0,0,0,0.6)"
              cornerRadius={4}
            />
            
            {/* Type badge text */}
            <Text
              x={12}
              y={12}
              text={zone.label.toUpperCase()}
              fontSize={10}
              fontFamily="Inter"
              fontStyle="600"
              fill="#ffffff"
              letterSpacing={0.5}
            />

            {/* Center icon placeholder */}
            <Rect
              x={zone.width / 2 - 20}
              y={zone.height / 2 - 20}
              width={40}
              height={40}
              fill={typeConfig?.color || '#6B7280'}
              opacity={0.2}
              cornerRadius={8}
            />
          </>
        )}
      </Group>

      {/* Transformer for selected element */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 50 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
          anchorSize={8}
          anchorCornerRadius={2}
          borderStroke="#4F46E5"
          borderStrokeWidth={2}
          anchorStroke="#4F46E5"
          anchorFill="#ffffff"
        />
      )}
    </>
  );
};

export default Canvas;
