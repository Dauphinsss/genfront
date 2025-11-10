'use client';

import { ContentDocument } from '@/types/content-blocks';
import { ContentPreview } from '@/components/teacher/ContentPreview';

interface StudentTopicViewProps {
  title: string;
  description?: string;
  content?: ContentDocument;
}

export function StudentTopicView({ description, content }: StudentTopicViewProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Descripción del tópico (opcional) */}
      {description && (
        <div className="px-6 py-4 border-b border-border flex-shrink-0">
          <p className="text-muted-foreground">{description}</p>
        </div>
      )}

      {/* Contenido del tópico */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {content ? (
          <ContentPreview document={content} />
        ) : (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground text-lg">
                Este tópico aún no tiene contenido
              </p>
              <p className="text-muted-foreground text-sm">
                El contenido estará disponible próximamente
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
