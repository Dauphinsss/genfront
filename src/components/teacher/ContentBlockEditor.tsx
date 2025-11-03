'use client';

import { ContentBlock, BlockType, TextBlockData, MediaBlockData } from '@/types/content-blocks';
import { BlockTypeSelector } from './BlockTypeSelector';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

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
  disabled = false
}: ContentBlockEditorProps) {
  const { theme } = useTheme();

  const handleTypeChange = (newType: BlockType) => {
    if (newType === block.type) return;

    let newData;
    if (newType === 'text') {
      newData = { content: '' } as TextBlockData;
    } else {
      newData = { url: '', caption: '' } as MediaBlockData;
    }

    onChange({
      ...block,
      type: newType,
      data: newData
    });
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'text':
        return <TextEditor block={block} onChange={onChange} theme={theme} />;
      case 'image':
        return <ImageEditor block={block} onChange={onChange} disabled={disabled} />;
      case 'video':
        return <VideoEditor block={block} onChange={onChange} disabled={disabled} />;
      case 'audio':
        return <AudioEditor block={block} onChange={onChange} disabled={disabled} />;
      case 'document':
        return <DocumentEditor block={block} onChange={onChange} disabled={disabled} />;
      default:
        return <div className="p-4 text-muted-foreground">Tipo de bloque no soportado</div>;
    }
  };

  return (
    <Card className={cn(
      'p-5 space-y-4 relative group border-border/50 shadow-sm hover:shadow-md transition-shadow',
      disabled && 'opacity-60 pointer-events-none'
    )}>
      {onRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
          onClick={onRemove}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
      
      <BlockTypeSelector
        currentType={block.type}
        onSelect={handleTypeChange}
        disabled={disabled}
      />
      
      {renderBlockContent()}
    </Card>
  );
}

// Editor de texto con BlockNote adaptado a tema
function TextEditor({ 
  block, 
  onChange,
  theme 
}: { 
  block: ContentBlock; 
  onChange: (block: ContentBlock) => void;
  theme?: string;
}) {
  const data = block.data as TextBlockData;
  
  let initialContent;
  if (data.content && typeof data.content === 'string') {
    try {
      const parsed = JSON.parse(data.content);
      initialContent = Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined;
    } catch {
      initialContent = undefined;
    }
  }

  const editor = useCreateBlockNote({
    initialContent,
  });

  editor.onChange(() => {
    const blocks = editor.document;
    onChange({
      ...block,
      data: { content: JSON.stringify(blocks) } as TextBlockData
    });
  });

  const editorTheme = theme === 'dark' ? 'dark' : 'light';

  return (
    <div className={cn(
      'blocknote-editor-themed min-h-[250px] rounded-lg overflow-hidden',
      theme === 'dark' ? 'bg-[#1a1a1a] border border-gray-700/50' : 'bg-white border border-gray-200'
    )}>
      <div className="p-4">
        <BlockNoteView 
          editor={editor} 
          editable={true}
          theme={editorTheme}
          sideMenu={false}
          data-theme={editorTheme}
        />
      </div>
    </div>
  );
}

// Editor de imagenes
function ImageEditor({ 
  block, 
  onChange, 
  disabled 
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
          mimeType: file.type
        } as MediaBlockData
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {!data.url ? (
        <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Click para subir imagen</span>
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
          <img src={data.url} alt={data.caption || 'Imagen'} className="w-full rounded-lg" />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => onChange({
              ...block,
              data: { url: '', caption: '' } as MediaBlockData
            })}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

function VideoEditor({ disabled }: { block: ContentBlock; onChange: (block: ContentBlock) => void; disabled: boolean }) {
  return (
    <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg bg-muted/20">
      <span className="text-sm text-muted-foreground">Editor de video (pendiente)</span>
    </div>
  );
}

function AudioEditor({ disabled }: { block: ContentBlock; onChange: (block: ContentBlock) => void; disabled: boolean }) {
  return (
    <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg bg-muted/20">
      <span className="text-sm text-muted-foreground">Editor de audio (pendiente)</span>
    </div>
  );
}

function DocumentEditor({ disabled }: { block: ContentBlock; onChange: (block: ContentBlock) => void; disabled: boolean }) {
  return (
    <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg bg-muted/20">
      <span className="text-sm text-muted-foreground">Editor de documentos (pendiente)</span>
    </div>
  );
}
