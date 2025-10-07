"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SidebarKA from "./course-sidebar-sections";
import MobileLesson from "./course-mobile-lesson";
import PullTab from "./course-pull-tab";
import { Book } from "lucide-react";
import CourseCreateMenu from "./course-create-menu";

type Lesson = {
  id: string;
  title: string;
  status: "available" | "completed" | "locked";
  isCurrent?: boolean;
};

type CourseDTO = {
  id: string;
  title: string;
  unitBreadcrumb?: string;
  currentLessonId?: string;
  lessons: Lesson[];
};

type SidebarData = { courseTitle: string; unitBreadcrumb: string; lessons: Lesson[] };
type Props = { courseId: string };

export default function CourseView({ courseId }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const urlLessonId = params.get("lessonId") ?? undefined;

  const [data, setData] = useState<CourseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 
  const iconBtn = [ "inline-flex items-center justify-center rounded-full", "border border-black/60 dark:border-white/60", "bg-black text-white dark:bg-white dark:text-black","hover:bg-neutral-900 dark:hover:bg-neutral-100","shadow-sm active:scale-95 transition",
  ].join(" ");

  // carga real
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/courses/${courseId}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`API /api/courses/${courseId} → ${res.status}`);
        const json: CourseDTO = await res.json();
        if (alive) setData(json);
      } catch (e) {
        console.error(e);
        if (alive) setData({ id: courseId, title: "-", unitBreadcrumb: "-", lessons: [] });
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [courseId]);

  // bloquea scroll
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheetOpen]);

  // marca la lección
  const lessons = useMemo(() => {
    if (!data) return [];
    const currentId = urlLessonId ?? data.currentLessonId;
    return data.lessons.map(l => ({ ...l, isCurrent: l.id === currentId }));
  }, [data, urlLessonId]);

  const currentLessonTitle =
    lessons.find(l => l.isCurrent)?.title ?? (lessons[0]?.title ?? "");

  const sidebarData: SidebarData = {
    courseTitle: data?.title ?? "-",
    unitBreadcrumb: data?.unitBreadcrumb ?? "-",
    lessons,
  };

  const handleSelect = (lessonId: string) => {
    router.push(`/courses/${courseId}?lessonId=${lessonId}`);
    setSheetOpen(false);
  };

  const handleCreateSection = () => {
    router.push(`/courses/${courseId}/sections/new`);
  };

  const handleCreateLesson = () => {
    router.push(`/courses/${courseId}/lessons/new`);
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-neutral-500">
        Cargando…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-200">
      {/* Sidebar */}
      <div className="hidden md:block">
        <SidebarKA
          data={sidebarData}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(v => !v)}
          onSelect={handleSelect}
        />
      </div>

      {/* Main */}
      <main className="relative flex-1 min-w-0">
        {/* Pull-tab */}
        <PullTab collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />

        {/* Top bar mobile */}
        <div className="sticky top-0 z-30 md:hidden bg-white/90 dark:bg-neutral-950/90 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 px-3 py-2">
            <button
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 flex-1 min-w-0 rounded-md border border-black/60 dark:border-white/60 px-2.5 py-2"
              aria-label="Abrir lecciones"
            >
              <div className="h-6 w-6 rounded grid place-items-center bg-black dark:bg-neutral-100 flex-shrink-0">
                <Book size={14} className="text-white dark:text-black" />
              </div>
              <span className="text-sm font-medium truncate">{currentLessonTitle}</span>
            </button>

            {/* menu mobile */}
            <CourseCreateMenu
              onCreateSection={handleCreateSection}
              onCreateLesson={handleCreateLesson}
              buttonClass={`${iconBtn} h-9 w-9`}
              size={16}
            />
          </div>
        </div>

        {/* Header desktop */}
        <header className="hidden md:flex items-center justify-between px-6 pb-3 mt-2 mb-6 border-b border-neutral-200 dark:border-neutral-800">
          <h1 className="text-xl font-bold">{currentLessonTitle}</h1>

          {/* (+) menu desktop */}
          <CourseCreateMenu
            onCreateSection={handleCreateSection}
            onCreateLesson={handleCreateLesson}
            buttonClass={`${iconBtn} h-10 w-10`}
            size={18}
          />
        </header>

        {/* contenido */}
        <div className="px-4 md:px-6 pb-24 md:pb-10 text-[15px] leading-6 text-neutral-700 dark:text-neutral-300">
          {/* contenido */}
        </div>

        {/* Sheet mobile */}
        <MobileLesson
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          lessons={lessons}
          currentTitle={currentLessonTitle}
          onSelect={handleSelect}
        />       
      </main>
    </div>
  );
}
