'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateContent, updateTopic, createContent } from '@/services/topics';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, X, LayoutGrid, Eye, AlertTriangle } from 'lucide-react';
import type { Topic, BlockNoteContent } from '@/types/topic';
import { ContentDocument, TemplateType, ContentBlock } from '@/types/content-blocks';
import { createDocumentFromTemplate } from '@/lib/templates';
import { TemplateSelector } from './TemplateSelector';
import { ContentBlockEditor } from './ContentBlockEditor';
import { ContentPreview } from './ContentPreview';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TopicEditorNewProps {
  topic?: Topic;
  isNewTopic?: boolean;
  initialDescription?: string; 
  onSave: () => Promise<void>;
  onCancel: () => void;
}

export function TopicEditorNew({
  topic,
  isNewTopic = false,
  initialDescription = '',
  onSave,
  onCancel,
}: TopicEditorNewProps) {
  const { toast } = useToast();
  const [name, setName] = useState<string>(topic?.name || '');
  const [description, setDescription] = useState<string>(initialDescription || topic?.content?.description || '');
  const [document, setDocument] = useState<ContentDocument | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!topic) return;
    setName(topic.name || '');
    setDescription(topic.content?.description || initialDescription || '');
    
    // Cargar documento existente o mostrar selector de plantillas
    if (topic.content?.blocksJson) {
      try {
        const doc = topic.content.blocksJson as unknown as ContentDocument;
        setDocument(doc);
        setShowTemplateSelector(false);
      } catch {
        setShowTemplateSelector(true);
      }
    } else {
      setShowTemplateSelector(true);
    }
  }, [topic, initialDescription]);

  const handleTemplateSelect = (templateType: TemplateType) => {
    const newDoc = createDocumentFromTemplate(templateType);
    if (newDoc) {
      setDocument(newDoc);
      setShowTemplateSelector(false);
      setShowConfirmDialog(false);
    }
  };

  const handleChangeTemplateClick = () => {
    if (document) {
      setShowConfirmDialog(true);
    } else {
      setShowTemplateSelector(!showTemplateSelector);
    }
  };

  const handleConfirmTemplateChange = () => {
    setShowTemplateSelector(true);
    setShowConfirmDialog(false);
  };

  const handleBlockChange = (blockId: string, updatedBlock: ContentBlock) => {
    if (!document) return;
    
    setDocument({
      ...document,
      blocks: document.blocks.map(block => 
        block.id === blockId ? updatedBlock : block
      )
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ 
        title: 'Error', 
        description: 'El nombre del tópico es obligatorio',
        variant: 'destructive' 
      });
      return;
    }

    if (!document) {
      toast({ 
        title: 'Error', 
        description: 'Debes seleccionar una plantilla',
        variant: 'destructive' 
      });
      return;
    }

    if (!topic?.id) {
      toast({ 
        title: 'Error', 
        description: 'Tópico inválido', 
        variant: 'destructive' 
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
        title: 'Éxito',
        description: isNewTopic ? 'Tópico creado correctamente' : 'Cambios guardados correctamente',
        variant: 'success',
      });

      await onSave();
    } catch (error: unknown) {
      console.error('Error al guardar:', error);
      const message = error instanceof Error ? error.message : 'Error al guardar';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!topic?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-lg text-muted-foreground">Error: Tópico inválido</div>
        <Button onClick={onCancel} variant="outline">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-border bg-card mb-6 rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 mr-4">
              <Input
                type="text"
                placeholder="Nombre del tópico..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                className="text-2xl font-bold border-0 px-4 focus-visible:ring-0 bg-transparent text-foreground"
              />
            </div>
            <div className="flex items-center gap-2">
              {document && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleChangeTemplateClick}
                  >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    {showTemplateSelector ? 'Ocultar' : 'Cambiar'} Plantilla
                  </Button>
                  <Button 
                    variant={showPreview ? "default" : "outline"}
                    size="sm" 
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? 'Editar' : 'Vista Previa'}
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
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
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <Input
              type="text"
              placeholder="Descripción breve (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoComplete="off"
              className="text-sm border-0 px-4 focus-visible:ring-0 bg-transparent text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Template Selector, Preview o Editor */}
      {showTemplateSelector ? (
        <div className="mt-6">
          <TemplateSelector
            selected={document?.template}
            onSelect={handleTemplateSelect}
          />
        </div>
      ) : showPreview && document ? (
        <div className="mt-6">
          <ContentPreview document={document} />
        </div>
      ) : document ? (
        <div className="mt-6">
          <div 
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${document.layout.columns}, 1fr)`,
              gridTemplateRows: `repeat(${document.layout.rows}, minmax(200px, auto))`
            }}
          >
            {document.layout.areas.map((area) => {
              const block = document.blocks.find(b => b.id === area.blockId);
              if (!block) return null;

              return (
                <div
                  key={area.id}
                  style={{
                    gridColumn: area.gridColumn,
                    gridRow: area.gridRow
                  }}
                >
                  <ContentBlockEditor
                    block={block}
                    onChange={(updatedBlock) => handleBlockChange(block.id, updatedBlock)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Diálogo de confirmación para cambiar plantilla */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-muted">
                <AlertTriangle className="h-6 w-6 text-foreground" />
              </div>
              <DialogTitle className="text-xl">Cambiar Plantilla</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              Al cambiar la plantilla se eliminará todo el contenido actual. Esta acción no se puede deshacer.
              <br />
              <br />
              <span className="font-medium text-foreground">¿Estás seguro de que deseas continuar?</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-3 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1 sm:flex-none"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmTemplateChange}
              className="flex-1 sm:flex-none"
            >
              Sí, cambiar plantilla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
