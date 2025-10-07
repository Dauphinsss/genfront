"use client";

import { Book, ChevronLeft, ChevronRight, X } from "lucide-react";

type LessonItem = {
  id: string;
  title: string;
  status: "available" | "completed" | "locked";
  isCurrent?: boolean;
};

type SidebarData = {
  courseTitle: string;
  unitBreadcrumb: string;
  lessons: LessonItem[];
};

type Props = {
  data: SidebarData;
  collapsed?: boolean;         
  onToggle?: () => void;
  onSelect?: (id: string) => void;
};

export default function SidebarKA({ data, collapsed = false, onToggle, onSelect }: Props) {
  const { lessons } = data;

  const navigables = lessons.filter((l) => l.status !== "locked");
  const currentLesson = lessons.find((l) => l.isCurrent) ?? navigables[0] ?? lessons[0];
  const navIndex = Math.max(0, navigables.findIndex((l) => l.id === currentLesson?.id));

  const prevId = navigables[navIndex - 1]?.id;
  const nextId = navigables[navIndex + 1]?.id;

  const goPrev = () => prevId && onSelect?.(prevId);
  const goNext = () => nextId && onSelect?.(nextId);

  const isOpen = !collapsed;

  return (
    <>
      {/* Overlay mobile*/}
      <div
        className={[ "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={onToggle}
      />

     <aside
        className={[
          isOpen ? "px-4 py-4" : "px-0 py-0", "relative", "transition-[transform,width] duration-300 will-change-transform","fixed inset-y-0 left-0 z-50 md:static",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isOpen ? "w-[clamp(260px,92vw,450px)] md:w-[clamp(260px,40vw,450px)]" : "w-0 md:w-0 overflow-hidden",
          isOpen ? "border-r border-neutral-200 dark:border-neutral-800" : "border-0", "bg-transparent",
        ].join(" ")}
      >

       {/* Panel */}
          <div className="h-[100dvh] md:h-[calc(100dvh-32px)] md:rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200 ring-1 ring-black/10 dark:ring-white/10 shadow-sm">

          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur px-3 sm:px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-md grid place-items-center bg-black dark:bg-neutral-100">
                <Book size={16} className="text-white dark:text-black" strokeWidth={2.3} />
              </div>
              <h2 className="text-base font-semibold leading-none truncate">
                {data.courseTitle}: {data.unitBreadcrumb}
              </h2>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800 mt-3 mb-2 mx-1" />

            {/* title */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={!prevId}
                aria-label="Lección anterior"
                className="h-9 w-9 grid place-items-center rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="px-2 text-sm font-semibold truncate flex-1 text-center">
                {currentLesson?.title ?? ""}
              </div>

              <button
                type="button"
                onClick={goNext}
                disabled={!nextId}
                aria-label="Siguiente lección"
                className="h-9 w-9 grid place-items-center rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-800 mt-3 mx-1" />
          </div>

          {/* List */}
          <div className="h-full overflow-y-auto overscroll-contain">
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {lessons.map((l) => {
                const disabled = l.status === "locked";
                const completed = l.status === "completed";
                const current = l.id === currentLesson?.id;

                return (
                  <li key={l.id}>
                    <button
                      onClick={() => !disabled && onSelect?.(l.id)}
                      disabled={disabled}
                      aria-current={current ? "page" : undefined}
                      className={[ "relative w-full text-left px-4 py-4 transition-colors", "text-[15px] md:text-[14px]", "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                        current ? "bg-blue-50/80 dark:bg-blue-950/30" : "hover:bg-neutral-50 dark:hover:bg-neutral-900",
                        disabled ? "text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
                        : completed ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-800 dark:text-neutral-200",
                      ].join(" ")}
                    >
                      {current && <span className="absolute left-0 top-0 h-full w-[3px] bg-blue-500 rounded-r" />}
                      <span className={current ? "font-semibold truncate" : "truncate"}>{l.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}
