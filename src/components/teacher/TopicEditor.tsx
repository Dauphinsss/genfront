"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateContent, updateTopic, createContent } from "@/services/topics";
import { useToast } from "@/hooks/use-toast";
import { Eye, Loader2, Save, X, ImagePlus, Trash2 } from "lucide-react";
import type { Topic } from "@/types/topic";

type TextStyle = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

interface TextInlineNode {
  type: "text";
  text: string;
  styles?: TextStyle;
}

interface ParagraphBlock {
  type: "paragraph";
  content: TextInlineNode[];
}

interface ImageBlock {
  type: "image";
  props: {
    url: string;
    caption?: string;
    previewWidth?: number;
  };
}

interface DualBlocks {
  left: ParagraphBlock[]; 
  right: ImageBlock[];   
}

//
function isParagraphBlock(b: unknown): b is ParagraphBlock {
  const x = b as ParagraphBlock;
  return (
    !!x &&
    x.type === "paragraph" &&
    Array.isArray(x.content) &&
    x.content.every((c) => c && c.type === "text" && typeof c.text === "string")
  );
}

function isImageBlock(b: unknown): b is ImageBlock {
  const x = b as ImageBlock;
  return !!x && x.type === "image" && !!x.props && typeof x.props.url === "string";
}

function sanitizeLeft(doc: unknown[]): ParagraphBlock[] {
  return (doc || []).filter(isParagraphBlock);
}

function sanitizeRight(doc: unknown[]): ImageBlock[] {
  return (doc || []).filter(isImageBlock);
}

// Props del componente
interface TopicEditorProps {
  topic?: Topic;
  isNewTopic?: boolean;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

// Esquema BlockNote para editor de texto 
const textSchema = BlockNoteSchema.create({
  blockSpecs: { paragraph: defaultBlockSpecs.paragraph },
  inlineContentSpecs: {
    text: defaultInlineContentSpecs.text,
    link: defaultInlineContentSpecs.link,
  },
  styleSpecs: {
    bold: defaultStyleSpecs.bold,
    italic: defaultStyleSpecs.italic,
    underline: defaultStyleSpecs.underline,
    textColor: defaultStyleSpecs.textColor,
    backgroundColor: defaultStyleSpecs.backgroundColor,
  },
});


const EMPTY_PARAGRAPH: ParagraphBlock = {
  type: "paragraph",
  content: [{ type: "text", text: "" }],
};

const EMPTY_TEXT_DOC: ParagraphBlock[] = [EMPTY_PARAGRAPH];

function getInitialDual(jsonFileUrl?: string): DualBlocks {
  // Si no hay contenido o está vacío, retornar valores por defecto
  if (!jsonFileUrl || jsonFileUrl.trim() === "") {
    return { left: EMPTY_TEXT_DOC, right: [] };
  }
  
  try {
    const parsed = JSON.parse(jsonFileUrl) as unknown;

    if (Array.isArray(parsed)) {
      const left = sanitizeLeft(parsed);
      return { left: left.length ? left : EMPTY_TEXT_DOC, right: [] };
    }

    if (parsed && typeof parsed === "object" && ("left" in parsed || "right" in parsed)) {
      const p = parsed as { left?: unknown[]; right?: unknown[] };
      const left = p.left ? sanitizeLeft(p.left) : EMPTY_TEXT_DOC;
      const right = p.right ? sanitizeRight(p.right) : [];
      return {
        left: left.length ? left : EMPTY_TEXT_DOC,
        right: right.slice(0, 1), // máximo 1 imagen
      };
    }
  } catch (err) {
    console.error("Error parsing jsonFileUrl:", err);
  }
  return { left: EMPTY_TEXT_DOC, right: [] };
}

// Componente 
export function TopicEditor({
  topic,
  isNewTopic = false,
  onSave,
  onCancel,
}: TopicEditorProps) {
  const { toast } = useToast();
  const [name, setName] = useState<string>(topic?.name || "");
  const [description, setDescription] = useState<string>(topic?.content?.description || "");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const initialDual = useMemo(
    () => getInitialDual(topic?.content?.jsonFileUrl),
    [topic?.content?.jsonFileUrl]
  );

  // Editor de texto 
  const leftEditor = useCreateBlockNote({
    schema: textSchema,
    initialContent: initialDual.left,
    placeholders: {
      default: "Añadir texto",
    },
  });

  // Estado de imagen 
  const [images, setImages] = useState<ImageBlock[]>(
    Array.isArray(initialDual.right) ? initialDual.right.slice(0, 1) : []
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    if (images.length >= 1) return;
    fileInputRef.current?.click();
  };

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const validateImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) throw new Error("Solo se permiten imágenes.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Máximo 5MB.");
  };

  const addSingleImage = async (file: File) => {
    validateImageFile(file);
    const base64 = await readFileAsBase64(file);

    const imgBlock: ImageBlock = {
      type: "image",
      props: { url: base64, caption: "", previewWidth: 512 }, 
    };

    setImages([imgBlock]); 
    toast({ title: "Imagen añadida", variant: "success" });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || images.length >= 1) return;
    try {
      await addSingleImage(file);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al cargar imagen";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const onRightDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (images.length >= 1) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const onRightDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (images.length >= 1) return;
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      await addSingleImage(file);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al cargar imagen";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const removeImage = () => {
    setImages([]);
    toast({ title: "Imagen eliminada", variant: "success" });
  };

  useEffect(() => {
    if (!topic) return;
    setName(topic.name || "");
    setDescription(topic.content?.description || "");
  }, [topic]);

  // Guardar cambios

  const handleSave = async () => {
  if (!name.trim()) {
    toast({ title: "Título obligatorio", variant: "destructive" });
    return;
  }
  if (!leftEditor) {
    toast({ title: "Editor no disponible", variant: "destructive" });
    return;
  }

  if (!topic?.id) {
    toast({ title: "Tópico inválido (sin ID)", variant: "destructive" });
    return;
  }

  const leftDoc = sanitizeLeft((leftEditor.document as unknown[]) || []);
  const payload: DualBlocks = {
    left: leftDoc.length ? leftDoc : EMPTY_TEXT_DOC,
    right: images.slice(0, 1),
  };

  setIsSaving(true);
  try {
    await updateTopic(topic.id, { name: name.trim() });

    if (!topic.content?.id) {
      await createContent(topic.id, {
        description: description.trim(),
        jsonFileUrl: JSON.stringify(payload),
      });
    } else {
      await updateContent(topic.content.id, {
        description: description.trim(),
        jsonFileUrl: JSON.stringify(payload),
      });
    }

    toast({
      title: isNewTopic ? "Tópico creado" : "Cambios guardados",
      variant: "success",
    });

    await onSave(); 
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error al guardar";
    toast({
      title: "Error al guardar",
      description: message,
      variant: "destructive",
    });
  } finally {
    setIsSaving(false);
  }
};


  // Vista previa 
  const renderPreview = () => {
    const leftBlocks = sanitizeLeft((leftEditor?.document as unknown[]) || []);

    const textHTML = leftBlocks
      .map((block) => {
        const inner =
          block.content
            ?.map((c) => {
              let t = c.text ?? "";
              if (c.styles?.bold) t = `<strong>${t}</strong>`;
              if (c.styles?.italic) t = `<em>${t}</em>`;
              if (c.styles?.underline) t = `<u>${t}</u>`;
              return t;
            })
            .join("") ?? "";
        return `<p class="mb-3">${inner}</p>`;
      })
      .join("");

    const imgsHTML =
      images.length === 0
        ? ""
        : images
            .map((img) => {
              const src = img.props.url;
              const w = img.props.previewWidth ?? 512;
              return `
              <div class="rounded-md p-0 mb-3">
                <img src="${src}" style="max-width:${w}px;width:100%;height:auto" class="rounded border border-transparent" />
              </div>`;
            })
            .join("");

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium mb-2 text-foreground/80">Texto</h3>
          <div
            className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: textHTML }}
          />
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium mb-2 text-foreground/80">Imágenes</h3>
          {images.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No hay imágenes añadidas
            </div>
          ) : (
            <div className="space-y-3" dangerouslySetInnerHTML={{ __html: imgsHTML }} />
          )}
        </div>
      </div>
    );
  };

  if (!leftEditor) {
    return <div className="flex items-center justify-center min-h-[400px]">Cargando editor...</div>;
  }

  if (!topic?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-lg text-muted-foreground">Error: Tópico inválido</div>
        <Button onClick={onCancel} variant="outline">Volver</Button>
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
              <Button variant="ghost" size="sm" onClick={() => setShowPreview((v) => !v)}>
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? "Editar" : "Vista Previa"}
              </Button>
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
                    Guardar y Salir
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

      {/* Editor / Preview */}
      {showPreview ? (
        renderPreview()
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
          {/* Columna de texto */}
          <div className="bg-card border border-border rounded-lg shadow-sm min-h-[500px]">
            <div className="px-4 py-2 text-sm font-medium text-foreground/80 border-b border-border">
              Texto
            </div>
            <style jsx global>{`
              .bn-container .bn-editor {
                background-color: transparent !important;
              }
              .bn-container {
                background-color: transparent !important;
              }
              .dark .bn-editor .bn-block-content,
              .dark .bn-editor .bn-inline-content,
              .dark .bn-editor p,
              .dark .bn-editor [data-content-type="text"] {
                color: #ffffff !important;
              }
              .dark .bn-editor .bn-block-content[data-is-empty-and-focused="true"]::before {
                color: #9ca3af !important;
              }
              .bn-editor .bn-block-content[data-text-alignment="left"] {
                text-align: left;
              }
              .bn-editor .bn-block-content[data-text-alignment="center"] {
                text-align: center;
              }
              .bn-editor .bn-block-content[data-text-alignment="right"] {
                text-align: right;
              }
              .bn-editor .bn-block-content[data-text-alignment="justify"] {
                text-align: justify;
              }
            `}</style>
            <BlockNoteView editor={leftEditor} theme="light" formattingToolbar={true} />
          </div>

          {/* Columna de imagen */}
          <div className="bg-card border border-border rounded-lg shadow-sm min-h-[500px] overflow-hidden">
            <div className="px-4 py-2 text-sm font-medium text-foreground/80 border-b border-border">
              Imágenes
            </div>

            <div className="p-4 h-[calc(100%-48px)] overflow-y-auto">
              {images.length === 0 && (
                <div
                  onDragOver={onRightDragOver}
                  onDrop={onRightDrop}
                  onClick={openFilePicker}
                  className="rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/10 p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <ImagePlus className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm mb-2 text-foreground font-medium">Añadir imagen</p>
                  <p className="text-xs text-muted-foreground">
                    Arrastra una imagen aquí o haz clic para seleccionar
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* Imagen única */}
              {images.length > 0 && (
                <div className="space-y-3 mt-0">
                  <div className="relative group bg-transparent border border-transparent rounded-lg p-0">
                    <img
                      src={images[0].props.url}  alt="Imagen" className="w-full h-auto rounded max-h-[360px] object-contain border border-transparent"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-3 right-3 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              {images.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No hay imágenes añadidas
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}