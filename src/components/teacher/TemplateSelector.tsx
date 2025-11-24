"use client";

import { TemplateType } from "@/types/content-blocks";
import { TEMPLATES } from "@/lib/templates";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  selected?: TemplateType;
  onSelect: (template: TemplateType) => void;
}

export function TemplateSelector({
  selected,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="max-w-6xl w-full px-8 -mt-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2 ">
            Selecciona una plantilla
          </h2>
          <p className="text-muted-foreground">
            Elige el diseño que mejor se adapte a tu contenido
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(TEMPLATES).map(([type, template]) => {
            if (!template) return null;

            const isSelected = selected === type;

            return (
              <Card
                key={type}
                onClick={() => onSelect(type as TemplateType)}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105",
                  isSelected
                    ? "ring-2 ring-foreground shadow-lg scale-105"
                    : "hover:ring-1 hover:ring-foreground/50"
                )}
              >
                <div className="aspect-video bg-muted rounded-md mb-3 p-2 border border-border">
                  {renderTemplatePreview(type as TemplateType)}
                </div>
                <h4 className="font-medium text-sm text-center">
                  {template.name}
                </h4>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Renderiza preview visual de cada plantilla
function renderTemplatePreview(type: TemplateType) {
  const baseClass =
    "bg-muted-foreground/20 rounded border border-muted-foreground/30";

  switch (type) {
    case "single":
      return (
        <div className="w-full h-full">
          <div className={cn(baseClass, "w-full h-full")} />
        </div>
      );

    case "two-col":
      return (
        <div className="grid grid-cols-2 gap-1 h-full">
          <div className={baseClass} />
          <div className={baseClass} />
        </div>
      );

    case "two-row":
      return (
        <div className="grid grid-rows-2 gap-1 h-full">
          <div className={baseClass} />
          <div className={baseClass} />
        </div>
      );

    case "triple":
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
          <div className={baseClass} />
          <div className={baseClass} />
          <div className={cn(baseClass, "col-span-2")} />
        </div>
      );

    case "quad":
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
          <div className={baseClass} />
          <div className={baseClass} />
          <div className={baseClass} />
          <div className={baseClass} />
        </div>
      );

    case "sidebar-left":
      return (
        <div className="grid grid-cols-3 gap-1 h-full">
          <div className={baseClass} />
          <div className={cn(baseClass, "col-span-2")} />
        </div>
      );

    case "sidebar-right":
      return (
        <div className="grid grid-cols-3 gap-1 h-full">
          <div className={cn(baseClass, "col-span-2")} />
          <div className={baseClass} />
        </div>
      );

    case "header-content":
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
          <div className={cn(baseClass, "col-span-2")} />
          <div className={baseClass} />
          <div className={baseClass} />
        </div>
      );

    case "focus-left":
      return (
        <div className="flex gap-1 h-full">
          <div className={cn(baseClass, "flex-7")} />
          <div className={cn(baseClass, "flex-3")} />
        </div>
      );

    case "focus-right":
      return (
        <div className="flex gap-1 h-full">
          <div className={cn(baseClass, "flex-3")} />
          <div className={cn(baseClass, "flex-7")} />
        </div>
      );

    default:
      return null;
  }
}
