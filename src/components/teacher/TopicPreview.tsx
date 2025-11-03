'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Topic } from '@/types/topic';
import { ContentPreview } from './ContentPreview';
import { ContentDocument } from '@/types/content-blocks';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

interface TopicPreviewProps {
  topic: Topic;
  onClose: () => void;
  hideFooter?: boolean;
}

export function TopicPreview({ topic, onClose, hideFooter }: TopicPreviewProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Tópicos
          </Button>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Topic Header */}
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            {topic.name}
          </h1>

          {topic.content?.description && (
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              {topic.content.description}
            </p>
          )}

          <div className="mt-6 pt-6 border-t border-border">
            <time className="text-sm text-muted-foreground">
              {new Date(topic.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </header>

        {/* Content Preview */}
        {topic.content?.blocksJson ? (
          <ContentPreview document={topic.content.blocksJson as unknown as ContentDocument} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Sin contenido disponible</p>
          </div>
        )}
      </article>

      {/* Footer */}
      {!hideFooter && (
        <footer className="max-w-7xl mx-auto px-6 py-8 mt-12 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Plataforma de Aprendizaje Pyson
            </p>
            <Button variant="outline" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}
