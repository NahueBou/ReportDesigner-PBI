import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import useDesignerStore from "@/store/designerStore";
import Toolbar from "@/components/designer/Toolbar";
import Sidebar from "@/components/designer/Sidebar";
import Canvas from "@/components/designer/Canvas";
import PropertiesPanel from "@/components/designer/PropertiesPanel";
import TemplateWizard from "@/components/designer/TemplateWizard";
import PageTabs from "@/components/designer/PageTabs";
import { useState } from "react";

const Designer = () => {
  const [showTemplateModal, setShowTemplateModal] = useState(true);
  const { 
    selectedZoneId, 
    deleteZone, 
    duplicateZone, 
    undo, 
    redo,
    clearSelection 
  } = useDesignerStore();

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedZoneId) {
        deleteZone(selectedZoneId);
        toast.success("Zona eliminada");
      }
    }

    if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (selectedZoneId) {
        duplicateZone(selectedZoneId);
        toast.success("Zona duplicada");
      }
    }

    if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      undo();
    }

    if ((e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) || 
        (e.key === 'y' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      redo();
    }

    if (e.key === 'Escape') {
      clearSelection();
    }
  }, [selectedZoneId, deleteZone, duplicateZone, undo, redo, clearSelection]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* Toolbar */}
      <Toolbar />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          onOpenTemplates={() => setShowTemplateModal(true)}
          onOpenWizard={() => setShowTemplateModal(true)}
        />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <Canvas />
          </div>
          {/* Page Tabs at bottom */}
          <PageTabs />
        </div>

        {/* Right Properties Panel */}
        <PropertiesPanel />
      </div>

      {/* Template Wizard */}
      <TemplateWizard
        open={showTemplateModal}
        onOpenChange={setShowTemplateModal}
      />
    </div>
  );
};

export default Designer;
