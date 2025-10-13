"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type UiUnit = {
  id: number;
  name: string;
  index: number;
  logo: React.ElementType<{ className?: string }>;
};

export type UiLesson = {
  id: number;
  title: string;
  index: number;
  unitId: number;
};

type Props = {
  // Unidades
  units: UiUnit[];
  current: UiUnit | null;
  isMobile?: boolean;

  // Control del dropdown
  dropdownOpen: boolean;
  onDropdownOpenChange: (open: boolean) => void;

  // Callbacks unidades
  onSelect: (unit: UiUnit) => void;
  onAddUnitClick: () => void;
  onDeleteCurrentClick: () => void;

  // Lecciones
  lessons?: UiLesson[];
  currentLesson?: UiLesson | null;
  onSelectLesson?: (lesson: UiLesson) => void;

  // Crear lección  ✅ ahora recibe unitId
  onAddLessonClick?: (unitId?: number) => void;
  canAddLesson?: boolean;

  // Eliminar lección
  onDeleteLessonClick?: () => void;
  canDeleteLesson?: boolean;
};

export default function SidebarUnitsMenu({
  units,
  current,
  isMobile = false,
  dropdownOpen,
  onDropdownOpenChange,
  onSelect,
  onAddUnitClick,
  onDeleteCurrentClick,

  lessons = [],
  currentLesson = null,
  onSelectLesson,

  onAddLessonClick,
  canAddLesson = true,

  onDeleteLessonClick,
  canDeleteLesson = true,
}: Props) {
  const active = current ?? units[0] ?? null;

  const filteredLessons = React.useMemo(() => {
    if (!active) return [];
    return lessons
      .filter((lesson) => lesson.unitId === active.id)
      .slice()
      .sort((a, b) => a.index - b.index);
  }, [active?.id, lessons]);

  const ActiveLogo =
    (active?.logo as React.ElementType<{ className?: string }>) || null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu
          open={dropdownOpen}
          onOpenChange={onDropdownOpenChange}
          {...(!isMobile && { modal: false })}
        >
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label="Selector de unidad y lecciones"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                {ActiveLogo ? <ActiveLogo className="size-4" /> : null}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {active?.name ?? "—"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {/* Unidades */}
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Unidades
            </DropdownMenuLabel>

            {units.map((team) => {
              const TeamLogo =
                team.logo as React.ElementType<{ className?: string }>;
              return (
                <DropdownMenuItem
                  key={`${team.id}-${team.index}`}
                  onClick={() => onSelect(team)}
                  className="gap-2 p-2"
                  aria-label={`Seleccionar ${team.name}`}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <TeamLogo className="size-3.5 shrink-0" />
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{team.name}</span>
                    <span className="text-xs text-muted-foreground">
                      #{team.index}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator />

            {/* Lecciones de unidad activa */}
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {active ? `Lecciones de ${active.name}` : "Lecciones"}
            </DropdownMenuLabel>

            {filteredLessons.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                {active
                  ? "No hay lecciones en esta unidad."
                  : "Selecciona una unidad para ver sus lecciones."}
              </div>
            ) : (
              filteredLessons.map((lesson) => (
                <DropdownMenuItem
                  key={`lesson-${lesson.id}-${lesson.index}`}
                  className="gap-2 p-2"
                  onClick={() => onSelectLesson?.(lesson)}
                  aria-label={`Abrir lección ${lesson.title}`}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <span className="text-[10px]">{lesson.index}</span>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">
                      {lesson.title}
                      {currentLesson && currentLesson.id === lesson.id ? (
                        <span className="ml-2 text-[10px] text-muted-foreground">
                          (actual)
                        </span>
                      ) : null}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
            )}

            <DropdownMenuSeparator />

            {/* Acciones */}
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={onAddUnitClick}
              aria-label="Agregar unidad"
              title="Agregar una nueva unidad"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Agregar unidad
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={onDeleteCurrentClick}
              aria-label="Eliminar unidad actual"
              title="Eliminar la unidad actual"
              disabled={!active}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Trash2 className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Eliminar unidad actual
              </div>
            </DropdownMenuItem>

            {onAddLessonClick && (
              <DropdownMenuItem
                className="gap-2 p-2"
                disabled={!canAddLesson}
                onClick={() => onAddLessonClick?.(active?.id)}
                aria-label="Agregar lección"
                title={
                  canAddLesson ? "Agregar una nueva lección" : "Acción no disponible"
                }
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Agregar lección
                </div>
              </DropdownMenuItem>
            )}

            {onDeleteLessonClick && (
              <DropdownMenuItem
                className="gap-2 p-2"
                disabled={!currentLesson || !canDeleteLesson}
                onClick={() => currentLesson && onDeleteLessonClick?.()}
                aria-label="Eliminar lección actual"
                title={
                  !currentLesson
                    ? "No hay lección seleccionada"
                    : canDeleteLesson
                    ? "Eliminar la lección actual"
                    : "No se puede eliminar esta lección"
                }
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Trash2 className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">
                  Eliminar lección actual
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
