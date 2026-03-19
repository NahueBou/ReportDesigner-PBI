# Power BI Report Designer - PRD

## Original Problem Statement
Professional web application for business users to design Power BI report background images. Output is high-resolution PNG/SVG (1280x720 or 1920x1080) ready to use as canvas background in Power BI Desktop. Business users design layouts → download background image + JSON spec → hand off to Data team.

## User Personas
- **Business Users**: Non-technical users who need to communicate report layouts visually
- **Data Teams**: Developers who receive specs to build actual Power BI reports

## Core Requirements (Static)
- Canvas size configuration (1280×720, 1920×1080, 1600×900, custom)
- Background styles (solid, gradient, presets)
- Drag-drop zones for Power BI elements
- Zone operations (resize, move, duplicate, delete, z-order, align)
- 6 preset layout templates
- Color palette builder
- Typography settings
- Export PNG/SVG/JSON
- Undo/redo (10 steps)
- Keyboard shortcuts

## Architecture
- **Frontend**: React 19 + Konva.js (canvas) + Zustand (state) + Tailwind CSS
- **No Backend Required**: All state is client-side
- **Export**: Canvas toDataURL for PNG, SVG generation, JSON spec

## What's Been Implemented (Jan 2026)
✅ Template modal with 6 layouts (Executive, Sales, Operational, Clinical, HR, Blank)
✅ Konva.js canvas with drag/drop/resize zones
✅ 12 zone types (KPI Card, Bar/Line/Pie/Donut Chart, Table, Matrix, Slicer, Map, Text Box, Image, Shape)
✅ Properties panel (label, position, size, style)
✅ Theme panel (background presets, color palettes, typography)
✅ Export dialog (PNG 2x, SVG, JSON spec)
✅ Toolbar (canvas size, undo/redo, zoom, grid, preview)
✅ Keyboard shortcuts (Delete, Ctrl+D, Ctrl+Z, Ctrl+Y, Escape)
✅ Dark sidebar (#1e1e2e) / light canvas aesthetic
✅ React-colorful for color pickers

## P0 Features Remaining
- None (MVP complete)

## P1 Features (Backlog)
- Header/Footer builder
- Snap-to-grid functionality
- Alignment guides between elements
- Custom canvas size input
- Image upload for zones

## P2 Features (Future)
- State encoded in URL for sharing
- Multiple pages support
- Import JSON to restore design
- Export to PowerPoint
- Collaboration features

## Next Tasks
1. Add header/footer builder panel
2. Implement snap-to-grid toggle
3. Add alignment guides when dragging
