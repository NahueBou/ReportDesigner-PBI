# Power BI Mockup Tool - PRD

## Original Problem Statement
App web donde el usuario de negocio arma su propia maqueta del reporte de Power BI y la entrega lista para desarrollar. El usuario trabaja con Power BI y necesita poder armar bocetos de páginas para sus reportes, incluyendo todos los componentes de Power BI.

## User Personas
- **Usuarios de negocio**: Analistas y equipos que necesitan comunicar requerimientos de reportes visualmente
- **Equipos de BI/Data**: Desarrolladores que recibirán las especificaciones para implementar en Power BI

## Core Requirements
- Drag & drop de componentes Power BI al canvas
- 13+ tipos de componentes (gráficos, tablas, filtros, mapas, KPIs)
- 4 layouts prediseñados + canvas libre
- Múltiples páginas por reporte
- Sistema de anotaciones/comentarios
- Guardar y cargar proyectos
- Exportación a PNG/PDF/JSON

## Architecture
- **Frontend**: React 19 + Shadcn UI + Tailwind CSS
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB (proyectos, páginas, componentes)
- **Export**: html2canvas + jsPDF

## What's Been Implemented (Jan 2026)
✅ Landing page con lista de proyectos
✅ Creación/eliminación de proyectos
✅ Editor visual con canvas drag & drop
✅ 13 componentes Power BI (barras, líneas, pie, donut, área, scatter, treemap, gauge, KPI, tabla, matriz, slicer, mapa)
✅ Panel de propiedades (posición, tamaño, estilos)
✅ 4 templates prediseñados (Ejecutivo, Operacional, Detallado, Analítico)
✅ Sistema de múltiples páginas
✅ Sistema de anotaciones editables
✅ Exportación PNG, PDF, JSON
✅ Auto-guardado

## P0 Features Remaining
- Ninguno (MVP completo)

## P1 Features (Backlog)
- Drag & drop desde sidebar al canvas en posición específica
- Undo/Redo
- Copiar/pegar entre páginas
- Grid snapping
- Zoom canvas

## P2 Features (Future)
- Integraciones (Teams, SharePoint, Email)
- Colaboración en tiempo real
- Historial de versiones
- Exportar a PowerPoint
- Temas de color predefinidos

## Next Tasks
1. Mejorar UX del drag & drop con posición de destino
2. Añadir keyboard shortcuts (Delete, Ctrl+C/V, Ctrl+Z)
3. Implementar grid snapping opcional
