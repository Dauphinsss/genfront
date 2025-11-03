'use client';

import { TemplateType } from '@/types/content-blocks';
import { TEMPLATES } from '@/lib/templates';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  selected?: TemplateType;
  onSelect: (template: TemplateType) => void;
}

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Selecciona una plantilla</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(TEMPLATES).map(([type, template]) => {
          if (!template) {
            // Plantilla custom no disponible todavia
            return (
              <Card
                key={type}
                className={cn(
                  'p-4 cursor-not-allowed opacity-50',
                  'bg-muted border-2 border-dashed'
                )}
              >
                <div className="aspect-video bg-muted-foreground/10 rounded mb-2 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Próximamente</span>
                </div>
                <h4 className="font-medium text-sm">Plantillas personalizables</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Función en desarrollo
                </p>
              </Card>
            );
          }

          const isSelected = selected === type;
          
          return (
            <Card
              key={type}
              onClick={() => onSelect(type as TemplateType)}
              className={cn(
                'p-4 cursor-pointer transition-all hover:shadow-md',
                isSelected 
                  ? 'border-2 border-primary bg-primary/5' 
                  : 'border-2 border-transparent hover:border-primary/50'
              )}
            >
              <div className="aspect-video bg-card border rounded mb-2 p-2">
                {renderTemplatePreview(type as TemplateType)}
              </div>
              <h4 className="font-medium text-sm">{template.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {template.description}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Renderiza preview visual de cada plantilla
function renderTemplatePreview(type: TemplateType) {
  const baseClass = 'bg-muted-foreground/20 rounded border border-muted-foreground/30';
  
  switch (type) {
    case 'single':
      return (
        <div className="w-full h-full">
          <div className={cn(baseClass, 'w-full h-full')} />
        </div>
      );
      
    case 'two-col':
      return (
        <div className="grid grid-cols-2 gap-1 h-full">
          <div className={baseClass} />
          <div className={baseClass} />
        </div>
      );
      
    case 'two-row':
      return (
        <div className="grid grid-rows-2 gap-1 h-full">
          <div className={baseClass} />
          <div className={baseClass} />
        </div>
      );
      
    case 'triple':
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
          <div className={baseClass} />
          <div className={baseClass} />
          <div className={cn(baseClass, 'col-span-2')} />
        </div>
      );
      
    case 'quad':
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
          <div className={baseClass} />
          <div className={baseClass} />
          <div className={baseClass} />
          <div className={baseClass} />
        </div>
      );
      
    default:
      return null;
  }
}
