"use client";

import * as React from "react";
import { Command } from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";
import { CreateUnitDialog, DeleteUnitDialog } from "./create-units-dialog";

import SidebarUnitsMenu, {
  UiUnit as UiUnitType,
  UiLesson as UiLessonType,
} from "./sidebar-menu";
import CreateLessonDialog, { DeleteLessonDialog } from "./create-lesson-dialog";

type UiUnit = UiUnitType;
type UiLesson = UiLessonType;

type BackendUnit = {
  id: number;
  title: string;
  index: number;
  published: boolean;
  createdAt?: string;
};

type BackendLesson = {
  id: number;
  title: string;
  index: number;
  published: boolean;
  unitId: number;
};

const API = {
  base: "http://localhost:4000",
  units: (id?: number) =>
    id ? `http://localhost:4000/units/${id}` : `http://localhost:4000/units`,
  lessons: (q?: string) => `http://localhost:4000/lessons${q ? `?${q}` : ""}`,
  lesson: (id: number) => `http://localhost:4000/lessons/${id}`,
};

export function TeamSwitcher({
  Units = [],
  onUnitCreated,
  onLessonsLoaded,
  forceActiveUnitName,    
  onUnitsLoaded,
}: {
  Units?: { name: string; logo: React.ElementType<{ className?: string }> }[];
  onUnitCreated?: (unit: { title: string; index: number; published: boolean }) => void;
  onLessonsLoaded?: (lessons: { id: number; title: string; index: number; unitId: number }[]) => void;
  forceActiveUnitName?: string;  
  onUnitsLoaded?: (units: { name: string; logo: React.ElementType<{ className?: string }> }[]) => void; // ✅ NUEVO
}) {
  const { isMobile } = useSidebar();
  const DefaultIcon = Command;

  // Estado unidades
  const [units, setUnits] = React.useState<UiUnit[]>([]);
  const [activeTeam, setActiveTeam] = React.useState<UiUnit | null>(null);
  const [targetUnitId, setTargetUnitId] = React.useState<number | null>(null);
  const [unitError, setUnitError] = React.useState<string | null>(null);

  // Dialogo crear unidad
  const [openDialog, setOpenDialog] = React.useState(false);
  const [unitName, setUnitName] = React.useState("");
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [savingUnit, setSavingUnit] = React.useState(false);

  // Diálogo eliminar unidad
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Lecciones de la unidad activa
  const [lessons, setLessons] = React.useState<UiLesson[]>([]);
  const [activeLesson, setActiveLesson] = React.useState<UiLesson | null>(null);

  // Diálogo crear lección
  const [openLessonDialog, setOpenLessonDialog] = React.useState(false);
  const [lessonTitle, setLessonTitle] = React.useState("");

  // Diálogo eliminar lección
  const [openDeleteLessonDialog, setOpenDeleteLessonDialog] = React.useState(false);
  const [isDeletingLesson, setIsDeletingLesson] = React.useState(false);

  // Helpers
  const mapBackendToUi = (arr: BackendUnit[]): UiUnit[] =>
    arr
      .slice()
      .sort((a, b) => a.index - b.index)
      .map((u) => ({
        id: u.id,
        name: u.title,
        index: u.index,
        logo: DefaultIcon as React.ElementType<{ className?: string }>,
      }));

  const loadUnits = async () => {
    try {
      const res = await fetch(API.units(), { cache: "no-store" });
      if (!res.ok) throw new Error(`GET /units failed: ${res.status}`);
      const data: BackendUnit[] = await res.json();

      const mapped = mapBackendToUi(data);
      setUnits(mapped);
      onUnitsLoaded?.(mapped.map(u => ({ name: u.name, logo: u.logo })));
    
      if (mapped.length === 0) {
      try { localStorage.removeItem("activeUnitName"); } catch {}
      setOpenDialog(true);       
      setLessons([]);           
      setActiveLesson(null);
      setActiveTeam(null);
      return;
    }

      const savedName = localStorage.getItem("activeUnitName");
      const saved = savedName ? mapped.find((u) => u.name === savedName) : null;
      const nextActive = saved ?? mapped[0] ?? null;
      setActiveTeam(nextActive);
    } catch (err) {
      console.error("Error al cargar unidades:", err);

      if (!activeTeam && Units.length > 0) {
        const fallback: UiUnit[] = Units.map((u, i) => ({
          id: -(i + 1), 
          name: u.name,
          logo: u.logo,
          index: i + 1,
        }));
        setUnits(fallback);
        setActiveTeam(fallback[0] ?? null);
        onUnitsLoaded?.(fallback.map(u => ({ name: u.name, logo: u.logo })));
      }
    }
  };

  // Carga lecciones de la unidad activa
  const loadLessonsForUnit = async (unitId: number) => {
    try {
      const res = await fetch(API.lessons(`unitId=${unitId}`), { cache: "no-store" });
      if (!res.ok) throw new Error(`GET /lessons?unitId=${unitId} failed: ${res.status}`);
      const list: BackendLesson[] | { items: BackendLesson[] } = await res.json();

      const raw = Array.isArray(list) ? list : (list?.items ?? []);
      const mapped: UiLesson[] = raw
        .slice()
        .sort((a, b) => Number(a.index) - Number(b.index))
        .map((l) => ({
          id: Number(l.id ?? 0),
          title: String(l.title ?? ""),
          index: Number(l.index ?? 0),
          unitId: Number(l.unitId ?? 0),
        }));

      onLessonsLoaded?.(mapped);
      setLessons(mapped);
      setActiveLesson((prev) =>
        prev && mapped.some((m) => m.id === prev.id) ? prev : mapped[0] ?? null
      );
    } catch (e) {
      console.error("Error al cargar lecciones:", e);
      setLessons([]);
      setActiveLesson(null);
    }
  };

  React.useEffect(() => {
    loadUnits();
  }, []);

  React.useEffect(() => {
    if (!activeTeam) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("activeUnitName", activeTeam.name);
    }
    if (activeTeam.id > 0) {
      loadLessonsForUnit(activeTeam.id);
    } else {
      setLessons([]);
      setActiveLesson(null);
    }
  }, [activeTeam]);

  React.useEffect(() => {
    if (!forceActiveUnitName || !units.length) return;
    const match = units.find((u) => u.name === forceActiveUnitName);
    if (match && (!activeTeam || activeTeam.id !== match.id)) {
      setActiveTeam(match);          
      setDropdownOpen(false);       
    }
  }, [forceActiveUnitName, units]); 

  const getNextUnitIndex = () =>
    !units.length ? 1 : Math.max(...units.map((u) => u.index)) + 1;

  // Lecciones 
  async function getNextLessonIndex(unitId: number) {
    try {
      const res = await fetch(API.lessons(`unitId=${unitId}`), { cache: "no-store" });
      if (!res.ok) throw new Error(`GET /lessons?unitId=${unitId} failed: ${res.status}`);
      const list: BackendLesson[] | { items: BackendLesson[] } = await res.json();
      const raw = Array.isArray(list) ? list : (list?.items ?? []);
      const indices = raw
        .map((l) => Number(l.index))
        .filter((n) => Number.isFinite(n));
      return indices.length ? Math.max(...indices) + 1 : 1;
    } catch {
      return 1;
    }
  }

  const handleSubmitLesson = async () => {
  const unitId = targetUnitId ?? activeTeam?.id; 
  if (!unitId || unitId < 1) return;
  if (!lessonTitle.trim()) return;

  let idx = await getNextLessonIndex(unitId);
  const basePayload = {
    title: lessonTitle.trim(),
    published: true,
    unitId,
  };

  for (let tries = 0; tries < 6; tries++) {
    const payload = { ...basePayload, index: idx };
    try {
      const res = await fetch(API.lessons(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setLessonTitle("");
        setOpenLessonDialog(false);
        await loadLessonsForUnit(unitId);
        setTargetUnitId(null);
        return;
      }

      if (res.status === 409) { idx++; continue; }
      console.error("Error creando lección:", await res.text());
      return;
    } catch (e) {
      console.error("Error de red al crear lección:", e);
      return;
    }
  }

  console.error("No se pudo crear la lección: demasiados conflictos de índice.");
};


  const handleAddLessonClick = () => {
    if (!activeTeam || activeTeam.id < 1) {
      console.warn("Primero crea y guarda una unidad.");
      return;
    }
    setTargetUnitId(activeTeam.id); 
    setOpenLessonDialog(true);
    setDropdownOpen(false);
  };


  const handleRemoveLessonClick = () => {
    if (!activeLesson) return;
    setOpenDeleteLessonDialog(true);
    setDropdownOpen(false);
  };

  const confirmDeleteLesson = async () => {
    if (!activeLesson) return;

    if (activeLesson.id < 1) {
      setLessons((prev) => prev.filter((l) => l.id !== activeLesson.id));
      setActiveLesson(null);
      setOpenDeleteLessonDialog(false);
      return;
    }

    try {
      setIsDeletingLesson(true);

      const res = await fetch(API.lesson(activeLesson.id), { method: "DELETE" });
      if (!res.ok) {
        console.error("Error eliminando lección:", res.status, await res.text());
        return;
      }

      if (activeTeam?.id) {
        await loadLessonsForUnit(activeTeam.id);
      } else {
        setLessons((prev) => prev.filter((l) => l.id !== activeLesson.id));
        setActiveLesson(null);
      }

      setOpenDeleteLessonDialog(false);
    } catch (e) {
      console.error("Error de red al eliminar lección:", e);
    } finally {
      setIsDeletingLesson(false);
    }
  };

  // Unidades 
  const handleSubmit = async () => {
    if (!unitName.trim()) return;

    const nextIndex = getNextUnitIndex();
    const newUnitPayload = {
      title: unitName.trim(),
      index: nextIndex,
      published: true,
    };

    try {
      setSavingUnit(true);

      const response = await fetch(API.units(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUnitPayload),
      });

      if (!response.ok) {
        console.error("Error al crear unidad:", response.statusText);
        return;
      }

      const created: BackendUnit = await response.json();
      const uiUnit: UiUnit = {
        id: created.id,
        name: created.title,
        index: created.index,
        logo: Command as React.ElementType<{ className?: string }>,
      };

      setUnits((prev) => [...prev, uiUnit].sort((a, b) => a.index - b.index));
      setActiveTeam(uiUnit);
      setTargetUnitId(uiUnit.id);

      if (typeof window !== "undefined") {
            try { localStorage.setItem("activeUnitName", uiUnit.name); } catch {}
      }

      setUnitName("");
      setOpenDialog(false);
      setDropdownOpen(false);

      setOpenLessonDialog(true);

      onUnitCreated?.(newUnitPayload);
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setSavingUnit(false);
    }
  };

  const handleRemoveUnitClick = () => {
    if (!activeTeam) return;
    setOpenDeleteDialog(true);
    setDropdownOpen(false);
  };

  const confirmDelete = async () => {
    if (!activeTeam) return;

    if (activeTeam.id < 0) {
      setUnits((prev) => {
        const next = prev.filter((u) => u.id !== activeTeam.id).sort((a, b) => a.index - b.index);
        setActiveTeam(next[0] ?? null);
        return next;
      });
      setOpenDeleteDialog(false);
      return;
    }

    try {
      setIsDeleting(true);

      const res = await fetch(API.units(activeTeam.id), { method: "DELETE" });
      if (!res.ok) {
        console.error("Error eliminando unidad:", res.status, await res.text());
        return;
      }

      if (typeof window !== "undefined") {
        const savedName = localStorage.getItem("activeUnitName");
        if (savedName && savedName === activeTeam.name) {
          localStorage.removeItem("activeUnitName");
        }
      }

      await loadUnits();

      setLessons([]);
      setActiveLesson(null);
      setOpenDeleteDialog(false);
    } catch (e) {
      console.error("Error de red al eliminar:", e);
    } finally {
      setIsDeleting(false);
    }
  };

  const current = activeTeam ?? units[0] ?? null;
  const canAddLesson = !!activeTeam && activeTeam.id > 0;
  const canDeleteLesson = !!activeLesson;

  return (
    <>
      <SidebarUnitsMenu
        units={units}
        current={current}
        isMobile={isMobile}
        dropdownOpen={dropdownOpen}
        onDropdownOpenChange={setDropdownOpen}
        onSelect={(u) => {
          setActiveTeam(u);
          setDropdownOpen(false);
        }}
        onAddUnitClick={() => {
          setOpenDialog(true);
          setDropdownOpen(false);
        }}
        onDeleteCurrentClick={handleRemoveUnitClick}
        onAddLessonClick={handleAddLessonClick}
        canAddLesson={canAddLesson}
        onDeleteLessonClick={handleRemoveLessonClick}
        canDeleteLesson={canDeleteLesson}
        lessons={lessons}
        currentLesson={activeLesson}
        onSelectLesson={(l) => {
          setActiveLesson(l);
          setDropdownOpen(false);
        }}
      />

      {/* Dialog crear unidad */}
      <CreateUnitDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        value={unitName}
        onChange={setUnitName}
        onSubmit={handleSubmit}
        loading={savingUnit}
      />

      {/* Dialog eliminar unidad */}
      <DeleteUnitDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        unitName={current?.name}
        onConfirm={confirmDelete}
        loading={isDeleting}
      />

      {/* Dialog crear lección */}
      <CreateLessonDialog
        open={openLessonDialog}
        onOpenChange={setOpenLessonDialog}
        unitName={activeTeam?.name}
        title={lessonTitle}
        onTitleChange={setLessonTitle}
        onSubmit={handleSubmitLesson}
      />

      {/* Dialog eliminar lección */}
      <DeleteLessonDialog
        open={openDeleteLessonDialog}
        onOpenChange={setOpenDeleteLessonDialog}
        lessonTitle={activeLesson?.title}
        onConfirm={confirmDeleteLesson}
        loading={isDeletingLesson}
      />
    </>
  );
}
