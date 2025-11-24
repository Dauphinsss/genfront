'use client';

import { ContentDocument, ContentBlock, TextBlockData, MediaBlockData } from '@/types/content-blocks';
import { CustomRichTextEditor } from '@/components/teacher/CustomRichTextEditor';

interface ContentPreviewProps {
  document: ContentDocument;
}

export function ContentPreview({ document }: ContentPreviewProps) {
  return (
    <div
      className="grid gap-3 w-full h-full"
      style={{
        gridTemplateColumns: `repeat(${document.layout.columns}, 1fr)`,
        gridTemplateRows: `repeat(${document.layout.rows}, minmax(0, 1fr))`,
      }}
    >
      {document.layout.areas.map((area) => {
        const block = document.blocks.find(b => b.id === area.blockId);
        if (!block) return null;

        return (
          <div
            key={area.id}
            className="rounded-lg overflow-hidden shadow-sm dark:bg-[#1e1e1e] bg-white min-h-0"
            style={{
              gridColumn: area.gridColumn,
              gridRow: area.gridRow,
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
  const data = block.data as TextBlockData;

  if (!data.content) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[200px] h-full">
        <p className="text-sm text-muted-foreground italic">Sin contenido de texto</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <CustomRichTextEditor
        initialContent={data.content}
        editable={false}
      />
    </div>
  );
}

function ImageBlockPreview({ block }: { block: ContentBlock }) {
  const data = block.data as MediaBlockData;
  
  if (!data.url) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[200px] h-full">
        <p className="text-sm text-muted-foreground italic">Sin imagen</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={data.url} 
        alt={data.caption || 'Imagen'} 
        className="flex-1 w-full h-full object-cover"
      />
      {data.caption && (
        <div className="p-3 bg-muted/50 border-t border-border">
          <p className="text-sm text-muted-foreground">{data.caption}</p>
        </div>
      )}
    </div>
  );
}

function VideoBlockPreview({ block }: { block: ContentBlock }) {
  const data = block.data as MediaBlockData;
  
  if (!data.url) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[200px] h-full">
        <p className="text-sm text-muted-foreground italic">Sin video</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <video 
        src={data.url} 
        controls 
        className="flex-1 w-full h-full"
      >
        Tu navegador no soporta el elemento de video.
      </video>
      {data.caption && (
        <div className="p-3 bg-muted/50 border-t border-border">
          <p className="text-sm text-muted-foreground">{data.caption}</p>
        </div>
      )}
    </div>
  );
}

function AudioBlockPreview({ block }: { block: ContentBlock }) {
  const data = block.data as MediaBlockData;
  
  if (!data.url) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[200px] h-full">
        <p className="text-sm text-muted-foreground italic">Sin audio</p>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col justify-center h-full">
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
    </div>
  );
}

function DocumentBlockPreview({ block }: { block: ContentBlock }) {
  const data = block.data as MediaBlockData;
  
  if (!data.url) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[200px] h-full">
        <p className="text-sm text-muted-foreground italic">Sin documento</p>
      </div>
    );
  }

  return (
    <div className="p-6 flex items-center justify-center h-full">
      <div className="flex items-center justify-between w-full">
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
    </div>
  );
}
