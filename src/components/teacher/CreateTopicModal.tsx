"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { CreateTopicDto } from "@/types/topic";
import { X, Loader2 } from "lucide-react";

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTopicDto & { description?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function CreateTopicModal({ isOpen, onClose, onSubmit, isLoading: externalLoading }: CreateTopicModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type] = useState<"content" | "evaluation">("content");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const actualLoading = externalLoading || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("El título es obligatorio");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onSubmit({ name: name.trim(), type, description: description.trim() });
      // Resetear form
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el tópico");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!actualLoading) {
      setName("");
      setDescription("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Tópico</DialogTitle>
          <DialogDescription>
            Los tópicos son unidades modulares de contenido que puedes reutilizar en diferentes cursos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ej: Introducción a Python"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={actualLoading}
              autoFocus
              autoComplete="off"
              name="topic-name-unique"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción <span className="text-muted-foreground text-xs">(opcional)</span>
            </Label>
            <textarea
              id="description"
              placeholder="Breve descripción del contenido..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={actualLoading}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              autoComplete="off"
              name="topic-description-unique"
            />
          </div>

          {/* Tipo (por ahora solo content) */}
          <div className="space-y-2">
            <Label>Tipo de Tópico</Label>
            <div className="flex gap-3">
              <div className="flex-1 border-2 border-primary rounded-lg p-3 bg-primary/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">Contenido</span>
                  <Badge variant="default" className="text-xs">Seleccionado</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Material educativo, lecturas, videos y recursos de aprendizaje
                </p>
              </div>

              <div className="flex-1 border border-border rounded-lg p-3 bg-muted/30 opacity-60 cursor-not-allowed">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">Evaluación</span>
                  <Badge variant="secondary" className="text-xs">Próximamente</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Exámenes, cuestionarios y tareas evaluativas
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-start gap-2">
              <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={actualLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={actualLoading || !name.trim()}>
              {actualLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear y Editar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
