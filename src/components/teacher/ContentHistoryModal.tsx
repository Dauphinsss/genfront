"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getContentHistory, restoreContentVersion } from "@/services/topics";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/context/AuthContext";
import type { HistoricContent, Content } from "@/types/topic";
import { ContentDocument } from "@/types/content-blocks";
import { ContentPreview } from "./ContentPreview";
import { Loader2, Clock, User, RotateCcw, X } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale/es";

interface ContentHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: number | null;
  onRestore?: (content: Content) => void;
}

export function ContentHistoryModal({
  open,
  onOpenChange,
  contentId,
  onRestore,
}: ContentHistoryModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoricContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<HistoricContent | null>(null);
  const [restoring, setRestoring] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!contentId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getContentHistory(contentId);
      setHistory(data);
    } catch (err) {
      console.error("Error cargando historial:", err);
      setError("No se pudo cargar el historial de cambios");
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de cambios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [contentId, toast]);

  useEffect(() => {
    if (open && contentId) {
      loadHistory();
    } else {
      setHistory([]);
      setSelectedEntry(null);
      setError(null);
    }
  }, [open, contentId, loadHistory]);

  const handleRestore = async () => {
    if (!selectedEntry || !contentId || !user) return;

    setRestoring(true);
    try {
      const restoredContent = await restoreContentVersion(
        contentId,
        selectedEntry.id,
        user.name || "Usuario",
        "Restauró una versión anterior"
      );

      toast({
        title: "Éxito",
        description: "Versión restaurada correctamente",
        variant: "success",
      });

      // Recargar historial para incluir la nueva entrada de restauración
      await loadHistory();

      // Cerrar preview
      setSelectedEntry(null);

      // Notificar al componente padre para que actualice el contenido
      if (onRestore) {
        onRestore(restoredContent);
      }

      // Cerrar el modal
      onOpenChange(false);
    } catch (err) {
      console.error("Error restaurando versión:", err);
      toast({
        title: "Error",
        description: "No se pudo restaurar la versión",
        variant: "destructive",
      });
    } finally {
      setRestoring(false);
    }
  };

  const formatTimestamp = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      // Si es hace menos de 24 horas, mostrar "Hace X horas/minutos"
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true, locale: es });
      }

      // Si es ayer
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
      ) {
        return `Ayer a las ${format(date, "HH:mm", { locale: es })}`;
      }

      // Si es hace menos de 7 días, mostrar día y hora
      if (diffInHours < 168) {
        return format(date, "EEEE 'a las' HH:mm", { locale: es });
      }

      // Para fechas más antiguas, mostrar fecha completa
      return format(date, "d 'de' MMMM yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  const getPreviewDocument = (entry: HistoricContent): ContentDocument | null => {
    if (!entry.snapshotBlocksJson) return null;
    try {
      return entry.snapshotBlocksJson as unknown as ContentDocument;
    } catch {
      return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Historial de Cambios</DialogTitle>
          <DialogDescription>
            Visualiza y restaura versiones anteriores del contenido
          </DialogDescription>
        </DialogHeader>

        {selectedEntry ? (
          // Vista de preview
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="mb-4 pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{selectedEntry.performedBy}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(selectedEntry.createdAt)}</span>
                  </div>
                  {selectedEntry.changeSummary && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedEntry.changeSummary}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedEntry(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto border border-border rounded-lg p-4 bg-muted/30">
              {getPreviewDocument(selectedEntry) ? (
                <ContentPreview document={getPreviewDocument(selectedEntry)!} />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                  <p className="text-sm text-muted-foreground">
                    No hay vista previa disponible para esta versión
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedEntry(null)}
                disabled={restoring}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRestore}
                disabled={restoring}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {restoring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Restaurando...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restaurar esta versión
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // Lista de historial
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" onClick={loadHistory}>
                  Reintentar
                </Button>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  No hay historial de cambios disponible
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="w-full text-left p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate">
                            {entry.performedBy}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>{formatTimestamp(entry.createdAt)}</span>
                        </div>
                        {entry.changeSummary && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {entry.changeSummary}
                          </p>
                        )}
                      </div>
                      <RotateCcw className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

