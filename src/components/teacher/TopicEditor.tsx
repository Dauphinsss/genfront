'use client';

import { useEffect, useState } from 'react';
import { PartialBlock } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateContent, updateTopic, createContent } from '@/services/topics';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, X } from 'lucide-react';
import type { Topic } from '@/types/topic';
import { BlockNoteEditorComponent } from './BlockNoteEditor';

interface TopicEditorProps {
  topic?: Topic;
  isNewTopic?: boolean;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

export function TopicEditor({
  topic,
  isNewTopic = false,
  onSave,
  onCancel,
}: TopicEditorProps) {
  const { toast } = useToast();
  const [name, setName] = useState<string>(topic?.name || '');
  const [description, setDescription] = useState<string>(topic?.content?.description || '');
  // Inicializar blocks como undefined si no hay contenido
  const [blocks, setBlocks] = useState<PartialBlock[]>(() => {
    const content = topic?.content?.blocksJson;
    if (!content || (Array.isArray(content) && content.length === 0)) {
      return [];
    }
    return content;
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!topic) return;
    setName(topic.name || '');
    setDescription(topic.content?.description || '');
    
    const content = topic.content?.blocksJson;
    if (!content || (Array.isArray(content) && content.length === 0)) {
      setBlocks([]);
    } else {
      setBlocks(content);
    }
  }, [topic]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ 
        title: 'Error', 
        description: 'El nombre del tópico es obligatorio',
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
      // Actualizar el nombre del tópico
      await updateTopic(topic.id, { name: name.trim() });

      // Crear o actualizar contenido
      if (!topic.content?.id) {
        await createContent(topic.id, {
          blocksJson: blocks,
          description: description.trim(),
        });
      } else {
        await updateContent(topic.content.id, {
          blocksJson: blocks,
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
    <div className="max-w-5xl mx-auto">
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
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
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

      {/* Editor */}
      <div className="mt-6">
        <BlockNoteEditorComponent
          initialContent={blocks}
          onChange={setBlocks}
          editable={true}
        />
      </div>
    </div>
  );
}