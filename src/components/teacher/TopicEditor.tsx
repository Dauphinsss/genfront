"use client";

import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { ResizableImage } from "@/lib/tiptap-extensions/resizable-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateContent, uploadResource } from "@/services/topics";
import "@/styles/tiptap-editor.css";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  ImageIcon,
  LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
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

interface TopicEditorProps {
  topic?: Topic;
  onSave: () => Promise<void>;
  onCancel: () => void;
}

export function TopicEditor({ topic, onSave, onCancel }: TopicEditorProps) {
  const [name, setName] = useState(topic?.name || "");
  const [description, setDescription] = useState(topic?.content?.description || "");
  const [showPreview, setShowPreview] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageWidth, setImageWidth] = useState("400");
  const [imageAlign, setImageAlign] = useState<"left" | "center" | "right">("left");
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
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
          class: 'text-primary underline hover:text-primary/80',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: topic?.content?.htmlContent || '<p>Comienza a escribir tu contenido...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] px-4 py-3 dark:prose-invert',
      },
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    // Validar tamaño (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert("El archivo es demasiado grande. Máximo 50MB");
      return;
    }

    try {
      // Subir archivo al backend y obtener URL
      const resourceUrl = await uploadFileToBackend(file);
      
      // Insertar imagen con la URL del backend
      insertImageWithOptions(resourceUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error al subir la imagen");
    }
  };

  const insertImageWithOptions = (src: string) => {
    if (!editor) return;

    const width = parseInt(imageWidth) || 400;
    let style = `width: ${width}px; height: auto;`;
    
    // Agregar alineación según la opción seleccionada
    if (imageAlign === "left") {
      style += " float: left; margin-right: 1rem; margin-bottom: 0.5rem;";
    } else if (imageAlign === "right") {
      style += " float: right; margin-left: 1rem; margin-bottom: 0.5rem;";
    } else if (imageAlign === "center") {
      style += " display: block; margin-left: auto; margin-right: auto;";
    }

    editor.chain().focus().setImage({ 
      src
    }).run();

    // Aplicar estilos después de insertar
    const { state } = editor;
    const { selection } = state;
    const node = state.doc.nodeAt(selection.from - 1);
    
    if (node && node.type.name === 'image') {
      editor.commands.updateAttributes('image', {
        style,
        width: width.toString(),
      });
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrl && editor) {
      insertImageWithOptions(imageUrl);
      setImageUrl("");
      setShowImageDialog(false);
    }
  };

  // Handlers para otros tipos de archivos
  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("El archivo es demasiado grande. Máximo 50MB");
      return;
    }

    try {
      const resourceUrl = await uploadFileToBackend(file);
      editor.chain().focus().insertContent(`<video src="${resourceUrl}" controls style="max-width: 100%; border-radius: 0.5rem;"></video>`).run();
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Error al subir el video");
    }
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("El archivo es demasiado grande. Máximo 50MB");
      return;
    }

    try {
      const resourceUrl = await uploadFileToBackend(file);
      editor.chain().focus().insertContent(`<audio src="${resourceUrl}" controls style="width: 100%;"></audio>`).run();
    } catch (error) {
      console.error("Error uploading audio:", error);
      alert("Error al subir el audio");
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("El archivo es demasiado grande. Máximo 50MB");
      return;
    }

    try {
      const resourceUrl = await uploadFileToBackend(file);
      editor.chain().focus().insertContent(`<a href="${resourceUrl}" download class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>${file.name}</a>`).run();
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Error al subir el documento");
    }
  };

  const handleAddLink = () => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkDialog(false);
    }
  };

  const handleSave = async () => {
    if (!topic?.content?.id) {
      alert("Error: No se puede guardar sin un content válido");
      return;
    }

    setIsSaving(true);
    try {
      // Actualizar el contenido en el backend
      await updateContent(topic.content.id, {
        htmlContent: editor?.getHTML() || "",
        description: description.trim(),
      });

      // Llamar a onSave para recargar la lista
      await onSave();
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Error al guardar el contenido");
    } finally {
      setIsSaving(false);
    }
  };

  // Subir archivo y obtener URL del backend
  const uploadFileToBackend = async (file: File): Promise<string> => {
    if (!topic?.content?.id) {
      throw new Error("No content ID available");
    }

    const response = await uploadResource(topic.content.id, file, (progress) => {
      setUploadProgress(progress);
    });

    setUploadProgress(0);
    return response.data.resourceUrl;
  };

  if (!editor) {
    return <div className="flex items-center justify-center min-h-[400px]">Cargando editor...</div>;
  }

  if (!topic?.content?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-lg text-muted-foreground">Error: No se puede editar un tópico sin contenido</div>
        <Button onClick={onCancel} variant="outline">Volver</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header del editor */}
      <div className="border-b border-border bg-card mb-6 rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 mr-4">
              <Input
                type="text"
                placeholder="Nombre del tópico..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-2xl font-bold border-0 px-0 focus-visible:ring-0 bg-transparent margint-1 text-foreground"
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
                onClick={onCancel}
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
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Indicador de progreso de subida */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-4 px-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Subiendo archivo... {uploadProgress}%</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <Input
              type="text"
              placeholder="Descripción breve (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm border-0 px-0 focus-visible:ring-0 bg-transparent text-muted-foreground"
            />
          </div>

          {/* Toolbar */}
          {!showPreview && (
            <div className="flex items-center gap-1 flex-wrap pb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-muted' : ''}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-muted' : ''}
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={editor.isActive('highlight') ? 'bg-muted' : ''}
              >
                <Highlighter className="w-4 h-4" />
              </Button>
              
              <div className="w-px h-6 bg-border mx-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
              >
                <Heading2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
              >
                <Heading3 className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-border mx-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-muted' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-muted' : ''}
              >
                <ListOrdered className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-border mx-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
              >
                <AlignRight className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-border mx-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageDialog(!showImageDialog)}
                title="Insertar imagen"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                title="Insertar video"
              >
                <Video className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => audioInputRef.current?.click()}
                title="Insertar audio"
              >
                <Music className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => documentInputRef.current?.click()}
                title="Insertar documento (PDF)"
              >
                <FileText className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkDialog(!showLinkDialog)}
                title="Insertar enlace"
              >
                <LinkIcon className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-border mx-1" />
              
              {/* Inputs ocultos para subir archivos */}
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

              <div className="w-px h-6 bg-border mx-1" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Diálogos inline para imagen y link */}
        {showImageDialog && (
          <div className="border-t border-border bg-muted/30 px-6 py-3 space-y-3">
            <div className="max-w-7xl mx-auto">
              {/* URL de imagen */}
              <div className="flex items-end gap-4 mb-3">
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
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Subir archivo
                </Button>
              </div>

              {/* Controles de tamaño y alineación */}
              <div className="flex items-center gap-4 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap">Ancho (px):</Label>
                  <Input
                    type="number"
                    min="100"
                    max="1200"
                    value={imageWidth}
                    onChange={(e) => setImageWidth(e.target.value)}
                    className="w-24 h-8 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap">Alineación:</Label>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={imageAlign === "left" ? "default" : "outline"}
                      onClick={() => setImageAlign("left")}
                      className="h-8 px-2"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={imageAlign === "center" ? "default" : "outline"}
                      onClick={() => setImageAlign("center")}
                      className="h-8 px-2"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={imageAlign === "right" ? "default" : "outline"}
                      onClick={() => setImageAlign("right")}
                      className="h-8 px-2"
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button size="sm" onClick={handleAddImageUrl} className="ml-auto">
                  Insertar
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowImageDialog(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {showLinkDialog && (
          <div className="border-t border-border bg-muted/30 px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-end gap-4">
              <div className="flex-1">
                <Label className="text-xs mb-1 block">URL del enlace</Label>
                <Input
                  type="text"
                  placeholder="https://ejemplo.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleAddLink}>
                  Insertar
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowLinkDialog(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Área del editor */}
      <div className="mt-6">
        {showPreview ? (
          // Vista previa del contenido
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
          // Editor activo
          <div className="bg-card border border-border rounded-lg shadow-sm min-h-[500px]">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
    </div>
  );
}
