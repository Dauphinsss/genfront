"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Topic } from "@/types/topic";
import "@/styles/tiptap-editor.css";

interface TopicPreviewProps {
  topic: Topic;
  onClose: () => void;
  hideFooter?: boolean;
}

export function TopicPreview({ topic, onClose, hideFooter }: TopicPreviewProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header fijo con botón volver */}
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

      {/* Contenido completo - estilo página */}
      <article className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Título principal */}
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
              {new Date(topic.createdAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>

        {/* Contenido HTML completo */}
        <div
          className="prose prose-base sm:prose-lg lg:prose-xl max-w-none dark:prose-invert
                     prose-headings:scroll-mt-20 
                     prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:font-bold prose-h1:mb-6 prose-h1:mt-12
                     prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:font-semibold prose-h2:mb-4 prose-h2:mt-10
                     prose-h3:text-xl prose-h3:md:text-2xl prose-h3:font-semibold prose-h3:mb-3 prose-h3:mt-8
                     prose-p:leading-relaxed prose-p:mb-4
                     prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                     prose-img:rounded-lg prose-img:shadow-md
                     prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                     prose-pre:bg-muted prose-pre:border prose-pre:border-border
                     prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/30
                     prose-ul:my-4 prose-ol:my-4
                     prose-li:my-2"
          dangerouslySetInnerHTML={{
            __html:
              topic.content?.htmlContent || "<p>Sin contenido disponible</p>",
          }}
        />
      </article>

      {/* Footer solo si no se oculta */}
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
