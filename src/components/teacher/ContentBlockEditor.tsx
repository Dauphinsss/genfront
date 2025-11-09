"use client";

import {
  ContentBlock,
  TextBlockData,
  MediaBlockData,
} from "@/types/content-blocks";
import { CustomRichTextEditor } from "./CustomRichTextEditor";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentBlockEditorProps {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export function ContentBlockEditor({
  block,
  onChange,
  onRemove,
  disabled = false,
}: ContentBlockEditorProps) {
  const renderBlockContent = () => {
    switch (block.type) {
      case "text":
        return <TextEditor block={block} onChange={onChange} />;
      case "image":
        return (
          <ImageEditor block={block} onChange={onChange} disabled={disabled} />
        );
      case "video":
        return (
          <VideoEditor block={block} onChange={onChange} disabled={disabled} />
        );
      case "audio":
        return (
          <AudioEditor block={block} onChange={onChange} disabled={disabled} />
        );
      case "document":
        return (
          <DocumentEditor
            block={block}
            onChange={onChange}
            disabled={disabled}
          />
        );
      default:
        return (
          <div className="p-4 text-muted-foreground">
            Tipo de bloque no soportado
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        "h-full relative group flex flex-col",
        disabled && "opacity-60 pointer-events-none"
      )}
    >
      {onRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10"
          onClick={onRemove}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}

      <div className="flex-1 overflow-hidden">{renderBlockContent()}</div>
    </div>
  );
}

// Editor de texto personalizado
function TextEditor({
  block,
  onChange,
}: {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
}) {
  const data = block.data as TextBlockData;

  const handleChange = (html: string) => {
    onChange({
      ...block,
      data: { content: html } as TextBlockData,
    });
  };

  return (
    <CustomRichTextEditor
      initialContent={data.content || ""}
      onChange={handleChange}
      editable={true}
      placeholder='Escribe "/" para ver comandos...'
    />
  );
}

// Editor de imagenes
function ImageEditor({
  block,
  onChange,
  disabled,
}: {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  disabled: boolean;
}) {
  const data = block.data as MediaBlockData;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        ...block,
        data: {
          url: reader.result as string,
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        } as MediaBlockData,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {!data.url ? (
        <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">
            Click para subir imagen
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled}
          />
        </label>
      ) : (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.url}
            alt={data.caption || "Imagen"}
            className="w-full rounded-lg"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() =>
              onChange({
                ...block,
                data: { url: "", caption: "" } as MediaBlockData,
              })
            }
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

function VideoEditor({}: {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg bg-muted/20">
      <span className="text-sm text-muted-foreground">
        Editor de video (pendiente)
      </span>
    </div>
  );
}

function AudioEditor({}: {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg bg-muted/20">
      <span className="text-sm text-muted-foreground">
        Editor de audio (pendiente)
      </span>
    </div>
  );
}

function DocumentEditor({}: {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg bg-muted/20">
      <span className="text-sm text-muted-foreground">
        Editor de documentos (pendiente)
      </span>
    </div>
  );
}
