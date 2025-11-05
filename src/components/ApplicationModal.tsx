import { useState, useMemo } from "react";
import { Position, PositionCategory, Section } from "@/types/position";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApplications } from "@/contexts/ApplicationContext";
import { toast } from "sonner";

interface ApplicationModalProps {
  position: Position | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ApplicationModal = ({ position, isOpen, onClose, onSuccess }: ApplicationModalProps) => {
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState<PositionCategory | "">("");
  const [section, setSection] = useState<Section>("200");
  const { addApplication, getAppliedCategories } = useApplications();

  const hasCategories = position?.categories && position.categories.length > 0;
  
  const availableCategories = useMemo(() => {
    if (!position || !hasCategories) return [];
    const appliedCategories = getAppliedCategories(position.id);
    return position.categories!.filter(cat => !appliedCategories.includes(cat));
  }, [position, hasCategories, getAppliedCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!position) return;

    if (!reason.trim()) {
      toast.error("Por favor ingresa un motivo de postulación");
      return;
    }

    if (position.categories && position.categories.length > 0 && !category) {
      toast.error("Por favor selecciona una categoría");
      return;
    }

    if (hasCategories && availableCategories.length === 0) {
      toast.error("Ya has postulado a todas las categorías disponibles");
      return;
    }

    addApplication({
      positionId: position.id,
      positionTitle: position.title,
      department: position.department,
      category: category || undefined,
      section,
      reason: reason.trim(),
    });

    toast.success("Postulación enviada exitosamente");
    setReason("");
    setCategory("");
    setSection("200");
    onSuccess?.();
    onClose();
  };

  if (!position) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Postular a {position.title}</DialogTitle>
          <DialogDescription>{position.department}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Motivo de Postulación <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Explica por qué deseas postular a esta ayudantía..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
              required
            />
          </div>

          {position.categories && position.categories.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="category">
                Categoría <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={(value) => setCategory(value as PositionCategory)} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableCategories.length === 0 && (
                <p className="text-sm text-destructive">Ya has postulado a todas las categorías disponibles</p>
              )}
            </div>
          )}

          

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Enviar Postulación
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;
