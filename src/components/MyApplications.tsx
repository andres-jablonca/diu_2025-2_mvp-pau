import { useApplications } from "@/contexts/ApplicationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, FileText, X, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MyApplications = () => {
  const { applications, cancelApplication, reorderApplications, moveApplicationUp, moveApplicationDown } = useApplications();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [applicationToCancel, setApplicationToCancel] = useState<{ id: string; title: string } | null>(null);

  const activeApplications = applications
    .filter((app) => app.status === "pending")
    .sort((a, b) => a.priority - b.priority);

  const handleCancelClick = (id: string, title: string) => {
    setApplicationToCancel({ id, title });
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (applicationToCancel) {
      cancelApplication(applicationToCancel.id);
      toast.success(`Postulación a ${applicationToCancel.title} cancelada`);
      setApplicationToCancel(null);
    }
    setCancelDialogOpen(false);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newApplications = [...activeApplications];
    const draggedItem = newApplications[draggedIndex];
    
    newApplications.splice(draggedIndex, 1);
    newApplications.splice(index, 0, draggedItem);
    
    reorderApplications(newApplications);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (activeApplications.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No tienes postulaciones activas
        </h3>
        <p className="text-muted-foreground">
          Comienza a postular a las ayudantías disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Mis Postulaciones</h2>
        <Badge variant="outline" className="text-base">
          {activeApplications.length} {activeApplications.length === 1 ? 'postulación' : 'postulaciones'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {activeApplications.map((application, index) => (
          <div
            key={application.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-gradient-to-br from-card to-card/80 border border-border rounded-lg p-4 transition-all duration-300 ${
              draggedIndex === index 
                ? 'opacity-50 scale-95' 
                : 'hover:shadow-lg hover:-translate-y-1 cursor-move'
            }`}
          >
            <div className="flex items-start gap-2 mb-3">
              <div className="flex flex-col gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveApplicationUp(application.id)}
                  disabled={index === 0}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveApplicationDown(application.id)}
                  disabled={index === activeApplications.length - 1}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Prioridad de postulación:</span>
                  <Badge variant="secondary" className="font-bold text-sm">
                    #{application.priority}
                  </Badge>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-1">
                  {application.positionTitle}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Building2 className="w-3 h-3" />
                  <span>{application.department}</span>
                </div>
              </div>
              
              <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20 shrink-0">
                Pendiente
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground mb-3 text-xs">
              <Calendar className="w-3 h-3" />
              <span>
                {format(application.submittedAt, "d 'de' MMM, yyyy", { locale: es })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {application.category && (
                <div className="bg-accent/10 rounded px-2 py-1">
                  <p className="text-xs text-muted-foreground">Categoría</p>
                  <p className="text-sm font-medium text-foreground capitalize">{application.category}</p>
                </div>
              )}
              <div className="bg-primary/10 rounded px-2 py-1">
                <p className="text-xs text-muted-foreground">Paralelo</p>
                <p className="text-sm font-medium text-foreground">{application.section}</p>
              </div>
            </div>

            <div className="mb-3 bg-muted/50 rounded p-2">
              <p className="text-xs font-medium text-foreground mb-1">Motivo:</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{application.reason}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCancelClick(application.id, application.positionTitle)}
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 transition-colors"
            >
              <X className="w-3 h-3 mr-2" />
              Cancelar Postulación
            </Button>
          </div>
        ))}
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará tu postulación a{" "}
              <span className="font-semibold text-foreground">{applicationToCancel?.title}</span>.
              No podrás deshacer esta acción.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener postulación</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Sí, cancelar postulación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyApplications;
