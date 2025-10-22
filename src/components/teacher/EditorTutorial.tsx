"use client";

import { useState } from "react";
import { X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditorTutorial() {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Info className="w-4 h-4 mr-2" />
        Ver Tutorial
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md bg-card border border-border rounded-lg shadow-2xl p-6 animate-in slide-in-from-bottom-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Tutorial del Editor</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <h4 className="font-semibold mb-2 text-primary">Imágenes con Texto</h4>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Inserta una imagen usando el botón de la toolbar</li>
            <li>Haz clic en la imagen para ver los controles</li>
            <li>Usa los botones para alinear: Izquierda, Centro o Derecha</li>
            <li>Arrastra el círculo azul para redimensionar</li>
            <li>Escribe texto y fluirá alrededor de la imagen</li>
          </ol>
        </div>

        <div className="border-t border-border pt-3">
          <h4 className="font-semibold mb-2 text-primary">Atajos de Teclado</h4>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Negrita</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">Ctrl+B</code>
            </div>
            <div className="flex justify-between">
              <span>Cursiva</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">Ctrl+I</code>
            </div>
            <div className="flex justify-between">
              <span>Subrayado</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">Ctrl+U</code>
            </div>
            <div className="flex justify-between">
              <span>Deshacer</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">Ctrl+Z</code>
            </div>
            <div className="flex justify-between">
              <span>Rehacer</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">Ctrl+Y</code>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <h4 className="font-semibold mb-2 text-primary">Funcionalidades</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Arrastra y suelta imágenes directamente</li>
            <li>Pega imágenes desde el portapapeles</li>
            <li>H1, H2, H3 para títulos</li>
            <li>Listas con viñetas y numeradas</li>
            <li>Citas, código y resaltado</li>
            <li>Enlaces y multimedia</li>
          </ul>
        </div>

        <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Para crear el layout de texto con imagen al costado,
            inserta la imagen, alinéala a la izquierda o derecha, redimensiónala y escribe el texto. 
            El texto fluirá automáticamente alrededor de la imagen.
          </p>
        </div>
      </div>
    </div>
  );
}
