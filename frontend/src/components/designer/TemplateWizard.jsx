import { useState } from "react";
import { toast } from "sonner";
import {
  TrendingUp,
  DollarSign,
  Users,
  Settings,
  ChevronRight,
  ChevronLeft,
  Check,
  LayoutDashboard,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import useDesignerStore from "@/store/designerStore";
import { WIZARD_AREAS, WIZARD_METRICS, generateLayout } from "@/lib/templateLayouts";

const areaIcons = {
  TrendingUp,
  DollarSign,
  Users,
  Settings,
};

const BACKGROUND_BY_AREA = {
  sales: '#f0f4f8',
  finance: '#f5f5f0',
  hr: '#f0f0f0',
  operations: '#f0f4f8',
};

const TemplateWizard = ({ open, onOpenChange }) => {
  const [step, setStep] = useState(1);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedMetrics, setSelectedMetrics] = useState([]);

  const { seedZones, setBackground, loadTemplate } = useDesignerStore();

  const resetWizard = () => {
    setStep(1);
    setSelectedArea(null);
    setSelectedMetrics([]);
  };

  const handleClose = (open) => {
    if (!open) resetWizard();
    onOpenChange(open);
  };

  const handleAreaSelect = (areaId) => {
    setSelectedArea(areaId);
    setSelectedMetrics([]);
  };

  const handleMetricToggle = (metricId) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId)
        ? prev.filter((m) => m !== metricId)
        : [...prev, metricId]
    );
  };

  const handleGenerate = () => {
    const zones = generateLayout(selectedArea, selectedMetrics);
    seedZones(zones);
    setBackground({ type: 'solid', color: BACKGROUND_BY_AREA[selectedArea] || '#f0f0f0' });
    toast.success("Reporte generado — empezá a personalizar");
    handleClose(false);
  };

  const handleBlankCanvas = () => {
    loadTemplate('blank');
    toast.success("Canvas en blanco listo");
    handleClose(false);
  };

  const currentAreaData = WIZARD_AREAS.find((a) => a.id === selectedArea);
  const availableMetrics = selectedArea ? WIZARD_METRICS[selectedArea] : [];
  const previewZones = step === 3 && selectedArea
    ? generateLayout(selectedArea, selectedMetrics)
    : [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Crear Nuevo Reporte</DialogTitle>
              <DialogDescription>
                Te ayudamos a armar el layout en 3 pasos simples
              </DialogDescription>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    step > s
                      ? 'bg-primary text-white'
                      : step === s
                      ? 'bg-primary text-white ring-2 ring-primary/30'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                <span className={`text-sm ${step === s ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {s === 1 ? 'Área' : s === 2 ? 'Métricas' : 'Confirmar'}
                </span>
                {s < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto py-2">

          {/* Step 1: Area selection */}
          {step === 1 && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                ¿Para qué área es este reporte?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {WIZARD_AREAS.map((area) => {
                  const IconComponent = areaIcons[area.icon] || LayoutDashboard;
                  const isSelected = selectedArea === area.id;
                  return (
                    <button
                      key={area.id}
                      onClick={() => handleAreaSelect(area.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-primary text-white' : 'bg-muted'
                          }`}
                        >
                          <IconComponent className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{area.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{area.description}</p>
                          <ul className="mt-2 space-y-0.5">
                            {area.bullets.map((b) => (
                              <li key={b} className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Metric selection */}
          {step === 2 && currentAreaData && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                ¿Qué querés mostrar en el reporte de <strong>{currentAreaData.label}</strong>?
              </p>
              <p className="text-xs text-muted-foreground mb-4">Seleccioná las métricas que te interesan (mínimo 1)</p>
              <div className="space-y-2">
                {availableMetrics.map((metric) => {
                  const isSelected = selectedMetrics.includes(metric.id);
                  return (
                    <button
                      key={metric.id}
                      onClick={() => handleMetricToggle(metric.id)}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40 hover:bg-muted/30'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                          isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm text-foreground">{metric.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Preview and confirm */}
          {step === 3 && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Tu reporte va a incluir <strong>{previewZones.length} componentes</strong>. Podés editar todo después de generarlo.
              </p>

              {/* Mini wireframe preview */}
              <div
                className="w-full rounded-xl border bg-muted/30 overflow-hidden mb-4"
                style={{ aspectRatio: '16/9', position: 'relative' }}
              >
                {previewZones.map((z, idx) => (
                  <div
                    key={idx}
                    className="absolute rounded-sm"
                    style={{
                      left: `${(z.x / 1280) * 100}%`,
                      top: `${(z.y / 720) * 100}%`,
                      width: `${(z.width / 1280) * 100}%`,
                      height: `${(z.height / 720) * 100}%`,
                      backgroundColor:
                        z.style?.fillColor === '#1a2744' ? '#1a2744' : '#ffffff',
                      boxShadow: z.style?.shadowEnabled ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                      border: z.style?.fillColor === '#1a2744' ? 'none' : '1px solid #e5e7eb',
                    }}
                  />
                ))}
              </div>

              {/* Selected metrics summary */}
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-sm font-medium mb-2">Componentes incluidos:</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMetrics.map((mId) => {
                    const metric = availableMetrics.find((m) => m.id === mId);
                    return metric ? (
                      <span
                        key={mId}
                        className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                      >
                        {metric.label.split('(')[0].trim()}
                      </span>
                    ) : null;
                  })}
                  {selectedMetrics.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      Solo estructura básica (header)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with navigation */}
        <div className="border-t pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Atrás
              </Button>
            )}
            {step === 1 && (
              <Button variant="ghost" onClick={handleBlankCanvas} className="text-muted-foreground text-sm">
                Empezar con canvas en blanco
              </Button>
            )}
          </div>

          <div>
            {step < 3 && (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !selectedArea : step === 2 ? selectedMetrics.length === 0 : false}
                className="gap-2"
              >
                {step === 2 ? 'Ver vista previa' : 'Siguiente'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {step === 3 && (
              <Button onClick={handleGenerate} className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                <Wand2 className="w-4 h-4" />
                Generar reporte
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateWizard;
