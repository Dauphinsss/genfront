'use client';

import { Card } from '@/components/ui/card';
import { ContentDocument, ContentBlock, TextBlockData, MediaBlockData } from '@/types/content-blocks';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { useTheme } from 'next-themes';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

interface ContentPreviewProps {
  document: ContentDocument;
}

export function ContentPreview({ document }: ContentPreviewProps) {
  return (
    <div 
      className="grid gap-2"
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
            <BlockPreview block={block} />
          </div>
        );
      })}
    </div>
  );
}

function BlockPreview({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'text':
      return <TextBlockPreview block={block} />;
    case 'image':
      return <ImageBlockPreview block={block} />;
    case 'video':
      return <VideoBlockPreview block={block} />;
    case 'audio':
      return <AudioBlockPreview block={block} />;
    case 'document':
      return <DocumentBlockPreview block={block} />;
    default:
      return null;
  }
}

function TextBlockPreview({ block }: { block: ContentBlock }) {
  const { theme } = useTheme();
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

  if (!initialContent) {
    return (
      <Card className="p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground italic">Sin contenido de texto</p>
      </Card>
    );
  }

  const editorTheme = theme === 'dark' ? 'dark' : 'light';

  return (
    <Card className="p-0 overflow-hidden">
      <div className="blocknote-editor-themed" data-theme={editorTheme}>
        <BlockNoteView 
          editor={editor} 
          editable={false}
          theme={editorTheme}
        />
      </div>
    </Card>
  );
}

function ImageBlockPreview({ block }: { block: ContentBlock }) {
  const data = block.data as MediaBlockData;
  
  if (!data.url) {
    return (
      <Card className="p-8 bg-muted/30 flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-muted-foreground italic">Sin imagen</p>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={data.url} 
        alt={data.caption || 'Imagen'} 
        className="w-full h-full object-cover"
      />
      {data.caption && (
        <div className="p-3 bg-muted/50">
          <p className="text-sm text-muted-foreground">{data.caption}</p>
        </div>
      )}
    </Card>
  );
}

function VideoBlockPreview({ block }: { block: ContentBlock }) {
  const data = block.data as MediaBlockData;
  
  if (!data.url) {
    return (
      <Card className="p-8 bg-muted/30 flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-muted-foreground italic">Sin video</p>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <video 
        src={data.url} 
        controls 
        className="w-full h-full"
      >
        Tu navegador no soporta el elemento de video.
      </video>
      {data.caption && (
        <div className="p-3 bg-muted/50">
          <p className="text-sm text-muted-foreground">{data.caption}</p>
        </div>
      )}
    </Card>
  );
}

function AudioBlockPreview({ block }: { block: ContentBlock }) {
  const data = block.data as MediaBlockData;
  
  if (!data.url) {
    return (
      <Card className="p-8 bg-muted/30 flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-muted-foreground italic">Sin audio</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <audio 
        src={data.url} 
        controls 
        className="w-full"
      >
        Tu navegador no soporta el elemento de audio.
      </audio>
      {data.caption && (
        <p className="text-sm text-muted-foreground mt-3">{data.caption}</p>
      )}
    </Card>
  );
}

function DocumentBlockPreview({ block }: { block: ContentBlock }) {
  const data = block.data as MediaBlockData;
  
  if (!data.url) {
    return (
      <Card className="p-8 bg-muted/30 flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-muted-foreground italic">Sin documento</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-sm">{data.filename || 'Documento'}</p>
          {data.caption && (
            <p className="text-sm text-muted-foreground mt-1">{data.caption}</p>
          )}
        </div>
        <a 
          href={data.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
        >
          Ver
        </a>
      </div>
    </Card>
  );
}
