"use client";

import * as React from "react";
import { SidebarGroup, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import type { LucideIcon } from "lucide-react";

type LessonItem = { title: string; url: string };
type Item = {
  title: string;        
  url: string;          
  icon?: LucideIcon;
  isActive?: boolean;   
  items?: LessonItem[];
};

export function NavMain({
  items,
  onUnitChange,  
  onLessonChange, 
}: {
  items: Item[];
  onUnitChange?: (unitTitle: string) => void;
  onLessonChange?: (unitTitle: string, lessonTitle: string) => void;
}) {
  // Determinar unidad activa
  const activeUnitIdx = React.useMemo(() => {
    const idx = items.findIndex((u) => u.isActive);
    return idx >= 0 ? idx : 0;
  }, [items]);

  const activeUnit = items[activeUnitIdx];
  const lessons = activeUnit?.items ?? [];
  const totalLessons = lessons.length;

  // indice local
  const [lessonIdx, setLessonIdx] = React.useState(0);
  const prevUnitKeyRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    const key = (activeUnit?.url || activeUnit?.title) ?? "";
    if (prevUnitKeyRef.current !== key) {
      setLessonIdx(0);
      if (activeUnit) onUnitChange?.(activeUnit.title);
      prevUnitKeyRef.current = key;
    }
  }, [activeUnit, onUnitChange]);

  
  React.useEffect(() => {
    if (!activeUnit || totalLessons === 0) return;
    const lessonTitle = lessons[lessonIdx]?.title ?? "";
    onLessonChange?.(activeUnit.title, lessonTitle);
  }, [lessonIdx, activeUnitIdx, totalLessons]);

  // Navegacion 
  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    if (lessonIdx > 0) setLessonIdx((i) => i - 1);
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (lessonIdx < totalLessons - 1) setLessonIdx((i) => i + 1);
  };

  const textRef = React.useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = React.useState(false);
  React.useEffect(() => {
    const check = () =>
      setOverflow(!!textRef.current && textRef.current.scrollWidth > textRef.current.clientWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [lessonIdx, activeUnitIdx, totalLessons]);

  if (!items.length || !activeUnit || totalLessons === 0) return null;

  const unitTitle = activeUnit.title;
  const lessonTitle = lessons[lessonIdx]?.title ?? "—";
  const atStart = lessonIdx <= 0;
  const atEnd = lessonIdx >= totalLessons - 1;

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <Pagination className="w-full">
            <PaginationContent className="w-full items-center">
              <PaginationItem>
                <PaginationPrevious href="#" onClick={goPrev} aria-disabled={atStart} />
              </PaginationItem>

              <li className="list-none flex-1 px-2">
                <div className="px-3 py-1.5 bg-transparent border-0 shadow-none">
                  <span
                    ref={textRef}
                    className={`block text-center font-semibold ${overflow ? "scrolling-text" : ""}`}
                    title={`${unitTitle} • ${lessonTitle}`}
                  >
                    {lessonTitle}
                  </span>
                </div>
              </li>

              <PaginationItem>
                <PaginationNext href="#" onClick={goNext} aria-disabled={atEnd} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
