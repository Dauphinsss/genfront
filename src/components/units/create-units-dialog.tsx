"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value: string;                          
  onChange: (v: string) => void;          
  onSubmit: () => void;                   
  loading?: boolean;                      
};

type DeleteUnitDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  unitName?: string | null;
  onConfirm: () => void;
  loading?: boolean; 
};

export function CreateUnitDialog({
  open,
  onOpenChange,
  value,
  onChange,
  onSubmit,
  loading = false,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva unidad</DialogTitle>
          <DialogDescription>Crea una unidad.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm">Nombre</label>
          <Input
            placeholder="Ej. Unidad 1: Introducción…"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
          />
        </div>

        <DialogFooter className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}> Cancelar </Button>
          </DialogClose>
          <Button onClick={onSubmit} disabled={loading || !value.trim()}>
            {loading ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteUnitDialog({
  open,
  onOpenChange,
  unitName,
  onConfirm,
  loading = false,
}: DeleteUnitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar unidad</DialogTitle>
          <DialogDescription>
            Se eliminará <b>{unitName ?? "esta unidad"}</b> del sistema. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}