import { useState } from "react";
import { toast } from "sonner";
import { Plus, X, Copy, Pencil, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import useDesignerStore from "@/store/designerStore";

const PageTabs = () => {
  const {
    pages,
    currentPageId,
    setCurrentPage,
    addPage,
    deletePage,
    duplicatePage,
    renamePage
  } = useDesignerStore();

  const [editingPageId, setEditingPageId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const handleAddPage = () => {
    addPage();
    toast.success("Nueva página creada");
  };

  const handleDeletePage = (pageId, e) => {
    if (e) e.stopPropagation();
    if (pages.length <= 1) {
      toast.error("No puedes eliminar la última página");
      return;
    }
    deletePage(pageId);
    toast.success("Página eliminada");
  };

  const handleDuplicatePage = (pageId) => {
    duplicatePage(pageId);
    toast.success("Página duplicada");
  };

  const startEditing = (pageId, currentName) => {
    setEditingPageId(pageId);
    setEditingName(currentName);
  };

  const finishEditing = () => {
    if (editingPageId && editingName.trim()) {
      renamePage(editingPageId, editingName.trim());
    }
    setEditingPageId(null);
    setEditingName("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      finishEditing();
    } else if (e.key === "Escape") {
      setEditingPageId(null);
      setEditingName("");
    }
  };

  return (
    <TooltipProvider>
      <div className="h-10 bg-[#1e1e2e] border-t border-[#2d2d3b] flex items-center px-2 gap-1 overflow-x-auto flex-shrink-0">
        {/* Page tabs */}
        {pages.map((page, index) => (
          <ContextMenu key={page.id}>
            <ContextMenuTrigger>
              <div
                onClick={() => setCurrentPage(page.id)}
                className={`
                  group flex items-center gap-2 px-3 py-1.5 rounded-t-md cursor-pointer
                  transition-all min-w-[100px] max-w-[180px]
                  ${currentPageId === page.id 
                    ? 'bg-gray-100 text-gray-800' 
                    : 'bg-[#2d2d3b] text-gray-400 hover:bg-[#3d3d4b] hover:text-gray-300'
                  }
                `}
                data-testid={`page-tab-${index}`}
              >
                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                
                {editingPageId === page.id ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={finishEditing}
                    onKeyDown={handleKeyDown}
                    className="h-5 px-1 py-0 text-xs bg-white border-0 focus-visible:ring-1"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-xs font-medium truncate">{page.name}</span>
                )}

                {/* Close button - only show if more than 1 page */}
                {pages.length > 1 && currentPageId === page.id && !editingPageId && (
                  <button
                    onClick={(e) => handleDeletePage(page.id, e)}
                    className="ml-auto opacity-60 hover:opacity-100 transition-opacity"
                    data-testid={`delete-page-${index}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => startEditing(page.id, page.name)}>
                <Pencil className="w-4 h-4 mr-2" />
                Renombrar
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleDuplicatePage(page.id)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar página
              </ContextMenuItem>
              {pages.length > 1 && (
                <ContextMenuItem 
                  onClick={() => handleDeletePage(page.id)}
                  className="text-red-500 focus:text-red-500"
                >
                  <X className="w-4 h-4 mr-2" />
                  Eliminar página
                </ContextMenuItem>
              )}
            </ContextMenuContent>
          </ContextMenu>
        ))}

        {/* Add page button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddPage}
              className="h-7 w-7 text-gray-400 hover:text-white hover:bg-[#3d3d4b] flex-shrink-0"
              data-testid="add-page-btn"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Agregar página</TooltipContent>
        </Tooltip>

        {/* Page counter */}
        <div className="ml-auto text-xs text-gray-500 px-2">
          {pages.findIndex(p => p.id === currentPageId) + 1} / {pages.length}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PageTabs;
