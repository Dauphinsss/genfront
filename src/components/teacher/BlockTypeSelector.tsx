'use client';

import { BlockType } from '@/types/content-blocks';
import { FileText, Image, Video, Music, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlockTypeSelectorProps {
  currentType: BlockType;
  onSelect: (type: BlockType) => void;
  disabled?: boolean;
}

export function BlockTypeSelector({ 
  currentType, 
  onSelect, 
  disabled = false 
}: BlockTypeSelectorProps) {
  const blockTypes: Array<{ 
    type: BlockType; 
    icon: React.ComponentType<{ className?: string }>; 
    label: string;
    disabled?: boolean;
  }> = [
    { type: 'text', icon: FileText, label: 'Texto' },
    { type: 'image', icon: Image, label: 'Imagen', disabled: true },
    { type: 'audio', icon: Music, label: 'Audio', disabled: true },
    { type: 'video', icon: Video, label: 'Video', disabled: true },
    { type: 'document', icon: FileIcon, label: 'Documento', disabled: true }
  ];

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
      <span className="text-xs font-medium text-muted-foreground self-center mr-2">
        Tipo de contenido:
      </span>
      {blockTypes.map(({ type, icon: Icon, label, disabled: typeDisabled }) => (
        <Button
          key={type}
          variant={currentType === type ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(type)}
          disabled={disabled || typeDisabled}
          className={cn(
            'h-8 transition-all',
            currentType === type && 'bg-primary text-primary-foreground shadow-sm',
            typeDisabled && 'opacity-40 cursor-not-allowed'
          )}
        >
          <Icon className="w-3 h-3 mr-1.5" />
          {label}
        </Button>
      ))}
    </div>
  );
}
