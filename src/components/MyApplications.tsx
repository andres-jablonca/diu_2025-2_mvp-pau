import { useApplications } from "@/contexts/ApplicationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, X, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { es, hr } from "date-fns/locale";
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
        <h3 className="text-xl font-semibold text-foreground mb-1">
          No tienes postulaciones activas
        </h3>
        <p className="text-muted-foreground">
          Comienza a postular a las ayudantías disponibles
        </p>
      </div>
    );
  }

  return (
    
    <div className="space-y-4 pb-4">
      <hr className="border-border/100 mx-6" />
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold text-foreground ml-6">Mis Postulaciones</h2>
        <Badge variant="outline" className="text-base mr-6">
          {activeApplications.length} {activeApplications.length === 1 ? 'postulación' : 'postulaciones'}
        </Badge>
      </div>
      
      <div className="overflow-x-auto bg-card border-2 border-border rounded-xl shadow-lg max-w-6xl mx-auto px">
        <table className="w-full border-collapse border border-border/40">
          <thead className="bg-green-600 text-white border-b-2 border-green-800 ">
            <tr>
              <th className="text-center p-3 border border-green-700 font-semibold text-white">Prioridad</th>
              <th className="text-center p-2 border border-green-700 font-semibold text-white">Asignatura</th>
              <th className="text-center p-2 border border-green-700 font-semibold text-white">Departamento</th>
              <th className="text-center p-2 border border-green-700 font-semibold text-white">Categoría</th>
              <th className="text-center p-2 border border-green-700 font-semibold text-white">Fecha de postulación</th>
              <th className="text-center p-2 border border-green-700 font-semibold text-white">Estado</th>
              <th className="text-center p-2 border border-green-700 px-4 font-semibold text-white">Cancelar/Renunciar</th>
            </tr>
          </thead>
          <tbody>
            {activeApplications.map((application, index) => (
              <tr
                key={application.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`border-b border-border transition-all duration-200 ${
                  draggedIndex === index 
                    ? 'opacity-50 bg-muted' 
                    : 'hover:bg-muted/30 cursor-move'
                } ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
              >
                <td className="p-2 border border-border/100 bg-background text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveApplicationUp(application.id);
                        }}
                        disabled={index === 0}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <GripVertical className="w-6 h-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveApplicationDown(application.id);
                        }}
                        disabled={index === activeApplications.length - 1}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <Badge variant="secondary" className="font-bold text-sm">
                      #{application.priority}
                    </Badge>
                  </div>
                </td>
                <td className="p-4 border border-border/100 bg-background text-center">
                  <h3 className="font-semibold text-foreground">{application.positionTitle}</h3>
                </td>
                <td className="p-4 border border-border/100 bg-background text-center">
                  <span className="text-sm text-foreground">{application.department}</span>
                </td>
                <td className="p-4 border border-border/100 bg-background text-center">
                  {application.category ? (
                    <Badge variant="outline" className="capitalize text-xs">
                      {application.category}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
                
                <td className="p-4 border border-border/100 bg-background text-center">
                  <span className="text-sm text-foreground">
                    {format(application.submittedAt, "dd/MM/yyyy", { locale: es })}
                  </span>
                </td>
                <td className="p-4 border border-border/100 bg-background text-center">
                  <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">
                    Pendiente
                  </Badge>
                </td>
                <td className="p-4 border border-border/100 bg-background text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelClick(application.id, application.positionTitle);
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 transition-colors"
                  >
                    <X className="w-3 h-3 mr-2" />
                    Cancelar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
