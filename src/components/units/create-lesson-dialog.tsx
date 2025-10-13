"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitName?: string | null;
  title: string;
  onTitleChange: (v: string) => void;
  onSubmit: () => void;
};

// Dialog crear unidad
export default function CreateLessonDialog({
  open,
  onOpenChange,
  unitName,
  title,
  onTitleChange,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva lección</DialogTitle>
          <DialogDescription>
            Se creará dentro de <b>{unitName ?? "—"}</b>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm">Título</label>
          <Input
            placeholder="Ej. Leccion 4: Expresiones Aritmeticas"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
          />
        </div>

        <DialogFooter className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={onSubmit}>Guardar lección</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Dialog eliminar lecciones
type DeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonTitle?: string | null;
  onConfirm: () => void;
  loading?: boolean;
};

export function DeleteLessonDialog({
  open,
  onOpenChange,
  lessonTitle,
  onConfirm,
  loading = false,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar lección</DialogTitle>
          <DialogDescription>
            ¿Seguro que deseas eliminar{" "}
            <b>{lessonTitle ?? "esta lección"}</b>? Esta acción no se puede
            deshacer.
          </DialogDescription>
        </DialogHeader> 
        <DialogFooter className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
