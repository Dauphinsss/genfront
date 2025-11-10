"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateContent, updateTopic, createContent } from "@/services/topics";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Info, LayoutGrid, Moon, Sun, Eye, Edit } from "lucide-react";
import type { Topic, BlockNoteContent } from "@/types/topic";
import {
  ContentBlock,
  TemplateType,
  ContentDocument,
} from "@/types/content-blocks";
import { ContentBlockEditor } from "./ContentBlockEditor";
import { TemplateSelector } from "./TemplateSelector";
import { ContentPreview } from "./ContentPreview";
import { createDocumentFromTemplate } from "@/lib/templates";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface TopicEditorResizableProps {
  topic?: Topic;
  isNewTopic?: boolean;
  initialDescription?: string;
  initialTemplate?: TemplateType;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onToggleTheme?: () => void;
  isDark?: boolean;
}

export function TopicEditorResizable({
  topic,
  isNewTopic = false,
  initialDescription = "",
  initialTemplate,
  onSave,
  onCancel,
  onToggleTheme,
  isDark = false,
}: TopicEditorResizableProps) {
  const { toast } = useToast();
  const [name, setName] = useState<string>(topic?.name || "");
  const [description, setDescription] = useState<string>(
    initialDescription || topic?.content?.description || ""
  );
  const [document, setDocument] = useState<ContentDocument | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(
    !initialTemplate
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    if (!topic) {
      // Si hay una plantilla inicial, aplicarla
      if (initialTemplate) {
        const newDoc = createDocumentFromTemplate(initialTemplate);
        if (newDoc) {
          setDocument(newDoc);
          setShowTemplateSelector(false);
        }
      }
      return;
    }

    setName(topic.name || "");
    setDescription(topic.content?.description || initialDescription || "");

    // Cargar documento existente
    if (topic.content?.blocksJson) {
      try {
        const doc = topic.content.blocksJson as unknown as ContentDocument;
        setDocument(doc);
        setShowTemplateSelector(false);
      } catch {
        // Si hay error, verificar si hay plantilla inicial
        if (initialTemplate) {
          const newDoc = createDocumentFromTemplate(initialTemplate);
          if (newDoc) {
            setDocument(newDoc);
            setShowTemplateSelector(false);
          }
        } else {
          setShowTemplateSelector(true);
        }
      }
    } else if (initialTemplate) {
      // Si no hay contenido pero hay plantilla inicial, aplicarla
      const newDoc = createDocumentFromTemplate(initialTemplate);
      if (newDoc) {
        setDocument(newDoc);
        setShowTemplateSelector(false);
      }
    }
  }, [topic, initialDescription, initialTemplate]);

  const handleBlockChange = (blockId: string, updatedBlock: ContentBlock) => {
    if (!document) return;

    setDocument({
      ...document,
      blocks: document.blocks.map((block) =>
        block.id === blockId ? updatedBlock : block
      ),
    });
  };

  const handleTemplateSelect = (templateType: TemplateType) => {
    const newDoc = createDocumentFromTemplate(templateType);
    if (newDoc) {
      setDocument(newDoc);
      setShowTemplateSelector(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del tópico es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!document) {
      toast({
        title: "Error",
        description: "Debes seleccionar una plantilla",
        variant: "destructive",
      });
      return;
    }

    if (!topic?.id) {
      toast({
        title: "Error",
        description: "Tópico inválido",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateTopic(topic.id, { name: name.trim() });

      const contentData = document as unknown as BlockNoteContent;

      if (!topic.content?.id) {
        await createContent(topic.id, {
          blocksJson: contentData,
          description: description.trim(),
        });
      } else {
        await updateContent(topic.content.id, {
          blocksJson: contentData,
          description: description.trim(),
        });
      }

      toast({
        title: "Éxito",
        description: isNewTopic
          ? "Tópico creado correctamente"
          : "Cambios guardados correctamente",
        variant: "success",
      });

      await onSave();
    } catch (error: unknown) {
      console.error("Error al guardar:", error);
      const message =
        error instanceof Error ? error.message : "Error al guardar";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!topic?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-lg text-muted-foreground">
          Error: Tópico inválido
        </div>
        <Button onClick={onCancel} variant="outline">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col pt-12 pb-6">
      {/* Logo Pyson en la esquina superior izquierda */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/"
          className="text-2xl font-bold text-foreground hover:text-foreground/80 transition-colors"
        >
          Pyson
        </Link>
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full">
          {showTemplateSelector ? (
            <TemplateSelector
              selected={document?.template}
              onSelect={handleTemplateSelect}
            />
          ) : document ? (
            isPreviewMode ? (
              <div className="h-full overflow-y-auto">
                <ContentPreview document={document} />
              </div>
            ) : (
              <div
                className="grid gap-3 h-full"
                style={{
                  gridTemplateColumns: `repeat(${document.layout.columns}, 1fr)`,
                  gridTemplateRows: `repeat(${document.layout.rows}, 1fr)`,
                }}
              >
                {document.layout.areas.map((area) => {
                  const block = document.blocks.find(
                    (b) => b.id === area.blockId
                  );
                  if (!block) return null;

                  return (
                    <div
                      key={area.id}
                      className="border border-border rounded-lg overflow-hidden relative group shadow-sm flex flex-col dark:bg-[#1e1e1e] bg-white"
                      style={{
                        gridColumn: area.gridColumn,
                        gridRow: area.gridRow,
                      }}
                    >
                      <div className="flex-1 overflow-hidden">
                        <ContentBlockEditor
                          block={block}
                          onChange={(updatedBlock) =>
                            handleBlockChange(block.id, updatedBlock)
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : null}
        </div>
      </div>

      {/* Dialog de información flotante */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Información del Tópico</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topic-name">Nombre del tópico *</Label>
              <Input
                id="topic-name"
                type="text"
                placeholder="Nombre del tópico..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic-description">Descripción (opcional)</Label>
              <Input
                id="topic-description"
                type="text"
                placeholder="Descripción breve"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInfoDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Botones flotantes en la esquina */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
        {onToggleTheme && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            title={isDark ? "Modo claro" : "Modo oscuro"}
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        )}
        {!showTemplateSelector && document && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            title={isPreviewMode ? "Modo edición" : "Vista de estudiante"}
          >
            {isPreviewMode ? (
              <Edit className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowInfoDialog(true)}
        >
          <Info className="w-4 h-4" />
        </Button>
        {!showTemplateSelector && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowTemplateSelector(true)}
            title="Cambiar Plantilla"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !document}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar"
          )}
        </Button>
      </div>

      {/* Mensaje de recordatorio inferior */}
      <div className="fixed bottom-0 left-0 right-0   py-3 px-4 z-40">
        <p className="text-center text-xs text-muted-foreground">
          Recuerda siempre guardar los cambios antes de salir
        </p>
      </div>
    </div>
  );
}
