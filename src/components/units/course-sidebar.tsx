"use client";

import * as React from "react";
import { Command, SquareTerminal, type LucideIcon } from "lucide-react";
import { NavMain } from "@/components/units/lessons-section";
import { TeamSwitcher } from "@/components/units/units-section";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const DefaultIcon = Command;

type UnitVM = { name: string; logo: React.ElementType<{ className?: string }> };
type LessonVM = { id: number; title: string; index: number; unitId: number };

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [units, setUnits] = React.useState<UnitVM[]>([]);
  const [lessons, setLessons] = React.useState<LessonVM[]>([]);

  const [activeUnitName, setActiveUnitName] = React.useState<string | null>(null);
  const [forcedUnitName, setForcedUnitName] = React.useState<string | null>(null);
  const [lessonsByUnit, setLessonsByUnit] = React.useState<Record<string, LessonVM[]>>({});

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("activeUnitName");
      if (saved) setActiveUnitName(saved);
    } catch {}
  }, []);

  const handleUnitCreated = (newUnit: { title: string; index: number; published: boolean }) => {
    const newItem: UnitVM = { name: newUnit.title, logo: DefaultIcon };
    setUnits((prev) => [...prev, newItem]);
    setActiveUnitName(newUnit.title);
    try { localStorage.setItem("activeUnitName", newUnit.title); } catch {}
  };

  const handleLessonsLoaded = (
    lessonsArr: LessonVM[],
    unit?: { id: number; name: string }
  ) => {
    const ordered = lessonsArr.slice().sort((a, b) => a.index - b.index);
    setLessons(ordered);

    const key = unit?.name ?? activeUnitName ?? null;
    if (key) {
      setLessonsByUnit((prev) => ({ ...prev, [key]: ordered }));
    }
  };

  const handleUnitsLoaded = (loaded: UnitVM[]) => {
    setUnits(loaded);
    const first = loaded[0]?.name ?? null;
    setActiveUnitName(first);
    setForcedUnitName(null);
    try { localStorage.setItem("activeUnitName", first ?? ""); } catch {}
  };

  const effectiveActiveName =
    forcedUnitName ?? activeUnitName ?? units[0]?.name ?? null;

  const navMain = React.useMemo(() => {
    if (!units.length) return [];

    const activeIdx = effectiveActiveName
      ? Math.max(0, units.findIndex((u) => u.name === effectiveActiveName))
      : 0;

    return units.map((u, idx) => {
      const iconAsLucide = (u.logo as unknown) as LucideIcon;
      const unitLessons =
        lessonsByUnit[u.name] ?? (idx === activeIdx ? lessons : []);

      return {
        title: u.name,
        url: `#unit-${idx + 1}`,
        icon: iconAsLucide ?? SquareTerminal,
        isActive: idx === activeIdx,
        items: unitLessons.map((l) => ({ title: l.title, url: `#lesson-${l.id}` })),
      };
    });
  }, [units, lessons, lessonsByUnit, effectiveActiveName]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          Units={units}
          onUnitCreated={handleUnitCreated}
          onLessonsLoaded={handleLessonsLoaded}
          onUnitsLoaded={handleUnitsLoaded}
          forceActiveUnitName={forcedUnitName ?? undefined}
        />
      </SidebarHeader>

      <SidebarContent>
        <Separator className="mb-0" />
        <NavMain
          items={navMain}
          onUnitChange={(unitTitle) => {
            setForcedUnitName(unitTitle);
            setActiveUnitName(unitTitle);
            try { localStorage.setItem("activeUnitName", unitTitle); } catch {}
          }}
        />
        <Separator className="mt-0" />
      </SidebarContent>

      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
