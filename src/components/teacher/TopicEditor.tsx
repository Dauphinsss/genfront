"use client";

import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Typography from "@tiptap/extension-typography";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Heading from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";
import { ResizableImage } from "@/lib/tiptap-extensions/resizable-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTopic, updateContent } from "@/services/topics";
import { useToast } from "@/hooks/use-toast";
import "@/styles/tiptap-editor.css";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  ImageIcon,
  LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Undo,
  Redo,
  Eye,
  Save,
  X,
  Video,
  Music,
  FileText,
  Loader2,
} from "lucide-react";
import type { Topic } from "@/types/topic";
import { EditorTutorial } from "./EditorTutorial";

interface TopicEditorProps {
  topic?: Topic;
  isNewTopic?: boolean;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

export function TopicEditor({ topic, isNewTopic = false, onSave, onCancel }: TopicEditorProps) {
  const [name, setName] = useState(topic?.name || "");
  const [description, setDescription] = useState(topic?.content?.description || "");
  const [showPreview, setShowPreview] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4],
      }),
      ResizableImage.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80 cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: 'Comienza a escribir tu contenido',
      }),
      Underline,
      Typography,
      Color,
      TextStyle,
    ],
    content: topic?.content?.htmlContent || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] px-8 py-6 dark:prose-invert',
      },
      handleDrop: (view, event, slice, moved) => {
        setIsDragging(false);
        
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          
          if (!file.type.startsWith('image/')) {
            return false;
          }

          if (file.size > 5 * 1024 * 1024) {
            toast({
              title: "Archivo demasiado grande",
              description: "Máximo 5MB para imágenes.",
              variant: "destructive",
            });
            return false;
          }

          event.preventDefault();

          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            const { schema } = view.state;
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            
            if (coordinates) {
              const node = schema.nodes.image.create({ src: base64 });
              const transaction = view.state.tr.insert(coordinates.pos, node);
              view.dispatch(transaction);
            }
          };
          reader.readAsDataURL(file);

          return true;
        }
        return false;
      },
      handleDOMEvents: {
        dragover: () => {
          setIsDragging(true);
          return false;
        },
        dragleave: () => {
          setIsDragging(false);
          return false;
        },
        drop: () => {
          setIsDragging(false);
          return false;
        },
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            
            const file = item.getAsFile();
            if (file) {
              if (file.size > 5 * 1024 * 1024) {
                toast({
                  title: "Archivo demasiado grande",
                  description: "Máximo 5MB para imágenes.",
                  variant: "destructive",
                });
                return true;
              }

              const reader = new FileReader();
              reader.onload = () => {
                const base64 = reader.result as string;
                const { schema } = view.state;
                const node = schema.nodes.image.create({ src: base64 });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              };
              reader.readAsDataURL(file);
            }
            return true;
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && topic?.content?.htmlContent) {
      const currentContent = editor.getHTML();
      const newContent = topic.content.htmlContent;
      
      if (currentContent !== newContent) {
        editor.commands.setContent(newContent);
      }
    }
  }, [editor, topic?.content?.htmlContent]);

  useEffect(() => {
    if (topic) {
      setName(topic.name || "");
      setDescription(topic.content?.description || "");
    }
  }, [topic]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "Máximo 5MB para imágenes.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Archivo inválido",
        description: "Por favor selecciona un archivo de imagen.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      insertImageWithOptions(base64);
    };
    reader.readAsDataURL(file);
  };

  const insertImageWithOptions = (src: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src }).run();
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) {
      toast({
        title: "URL requerida",
        description: "Por favor ingresa una URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = new URL(imageUrl.trim());
      console.log("URL valida:", url.href);
    } catch {
      toast({
        title: "URL inválida",
        description: "Asegúrate de incluir http:// o https://",
        variant: "destructive",
      });
      return;
    }

    if (editor) {
      const cleanUrl = imageUrl.trim();
      console.log("Insertando imagen con URL:", cleanUrl);
      
      editor.chain().focus().setImage({ 
        src: cleanUrl,
        alt: "Imagen desde URL"
      }).run();
      
      setImageUrl("");
      setShowImageDialog(false);
      
      console.log("Imagen insertada correctamente");
    } else {
      console.error("Editor no disponible");
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    alert("Subir videos como recursos no está disponible. Usa una URL externa.");
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    alert("Subir audio como recursos no está disponible. Usa una URL externa.");
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    alert("Subir documentos como recursos no está disponible. Usa una URL externa.");
  };

  const handleAddLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkDialog(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Título obligatorio",
        description: "El título es obligatorio.",
        variant: "destructive",
      });
      return;
    }

    if (!editor) {
      toast({
        title: "Editor no disponible",
        description: "El editor no está disponible.",
        variant: "destructive",
      });
      return;
    }

    if (!topic?.content?.id || !topic?.id) {
      toast({
        title: "Tópico inválido",
        description: "No se puede guardar sin un tópico válido.",
        variant: "destructive",
      });
      return;
    }

    const htmlContent = editor.getHTML();
    console.log("HTML guardado:", htmlContent);

    setIsSaving(true);
    try {
      await updateTopic(topic.id, {
        name: name.trim(),
      });

      await updateContent(topic.content.id, {
        htmlContent: htmlContent,
        description: description.trim(),
      });

      toast({
        title: isNewTopic ? "Tópico creado" : "Cambios guardados",
        description: isNewTopic ? "El tópico fue creado exitosamente." : "Cambios guardados exitosamente.",
        variant: "success",
      });
      await onSave();
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar el contenido",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!editor) {
    return <div className="flex items-center justify-center min-h-[400px]">Cargando editor...</div>;
  }

  if (!isNewTopic && !topic?.content?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-lg text-muted-foreground">Error: No se puede editar un tópico sin contenido</div>
        <Button onClick={handleCancel} variant="outline">Volver</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Editar' : 'Vista Previa'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
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

          {}
          {!showPreview && (
            <div className="flex items-center gap-1 flex-wrap pb-2">
              {}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Deshacer (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Rehacer (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </Button>
              
              <div className="w-px h-6 bg-border mx-1" />

              {}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-muted' : ''}
                title="Negrita (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-muted' : ''}
                title="Cursiva (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'bg-muted' : ''}
                title="Subrayado (Ctrl+U)"
              >
                <UnderlineIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={editor.isActive('strike') ? 'bg-muted' : ''}
                title="Tachado"
              >
                <Strikethrough className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={editor.isActive('code') ? 'bg-muted' : ''}
                title="Código"
              >
                <Code className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={editor.isActive('highlight') ? 'bg-muted' : ''}
                title="Resaltar"
              >
                <Highlighter className="w-4 h-4" />
              </Button>
              
              <div className="w-px h-6 bg-border mx-1" />

              {}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
                title="Título 1"
              >
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
                title="Título 2"
              >
                <Heading2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
                title="Título 3"
              >
                <Heading3 className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-border mx-1" />

              {}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-muted' : ''}
                title="Lista con viñetas"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-muted' : ''}
                title="Lista numerada"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'bg-muted' : ''}
                title="Cita"
              >
                <Quote className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-border mx-1" />

              {}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
                title="Alinear izquierda"
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
                title="Centrar"
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
                title="Alinear derecha"
              >
                <AlignRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={editor.isActive({ textAlign: 'justify' }) ? 'bg-muted' : ''}
                title="Justificar"
              >
                <AlignJustify className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-border mx-1" />

              {}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageDialog(!showImageDialog)}
                title="Insertar imagen (arrastra o pega imágenes directamente)"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkDialog(!showLinkDialog)}
                title="Insertar enlace"
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled
                title="Insertar video (próximamente)"
                className="opacity-50 cursor-not-allowed"
              >
                <Video className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled
                title="Insertar audio (próximamente)"
                className="opacity-50 cursor-not-allowed"
              >
                <Music className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled
                title="Insertar documento (próximamente)"
                className="opacity-50 cursor-not-allowed"
              >
                <FileText className="w-4 h-4" />
              </Button>
              
              {}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/avi"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/ogg"
                onChange={handleAudioUpload}
                className="hidden"
              />
              <input
                ref={documentInputRef}
                type="file"
                accept="application/pdf,.doc,.docx"
                onChange={handleDocumentUpload}
                className="hidden"
              />
            </div>
          )}
        </div>

        {}
        {showImageDialog && (
          <div className="border-t border-border bg-muted/30 px-6 py-3 space-y-3">
            <div className="max-w-7xl mx-auto">
              {}
              <div className="flex items-center gap-4 mb-3">
                {}
                <div className="flex-1 flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs mb-1 block">URL de la imagen</Label>
                    <Input
                      type="text"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddImageUrl()}
                    />
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleAddImageUrl}
                    className="shrink-0"
                  >
                    Insertar
                  </Button>
                </div>

                {}
                <div className="flex items-center justify-center px-3 text-muted-foreground font-semibold">
                  Ó
                </div>

                {}
                <div className="flex items-end gap-2">
                  <div className="min-w-[200px]">
                    <Label className="text-xs mb-1 block">Subir desde dispositivo</Label>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full whitespace-nowrap"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Subir archivo
                    </Button>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowImageDialog(false)}
                  className="ml-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image}
      <div className="mt-6 relative">
        {showPreview ? (
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <h1 className="text-3xl font-bold mb-4 text-foreground">{name || "Sin título"}</h1>
            {description && (
              <p className="text-muted-foreground mb-6 text-lg">{description}</p>
            )}
            <div 
              className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
            />
          </div>
        ) : (
          <div className={`bg-card border rounded-lg shadow-sm min-h-[500px] transition-all ${
            isDragging ? 'border-primary border-2 bg-primary/5' : 'border-border'
          }`}>
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-lg z-10 pointer-events-none">
                <div className="bg-card border-2 border-dashed border-primary rounded-lg p-8 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-semibold text-foreground">Suelta la imagen aquí</p>
                  <p className="text-sm text-muted-foreground mt-2">La imagen se subirá automáticamente</p>
                </div>
              </div>
            )}
            <EditorContent editor={editor} />
          </div>
        )}

        {}
        <EditorTutorial />
      </div>
    </div>
  );
}
