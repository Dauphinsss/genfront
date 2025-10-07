"use client";

import { Book, ChevronLeft, ChevronRight, X } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  status: "available" | "completed" | "locked";
  isCurrent?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  lessons: Lesson[];
  currentTitle: string;       
  onSelect: (id: string) => void;
};

function computeNav(lessons: Lesson[]) {
  const navigables = lessons.filter((l) => l.status !== "locked");
  const current = lessons.find((l) => l.isCurrent) ?? navigables[0] ?? lessons[0];
  const idx = Math.max(0, navigables.findIndex((l) => l?.id === current?.id));
  return { prevId: navigables[idx - 1]?.id, nextId: navigables[idx + 1]?.id };
}

export default function MobileLesson({ open, onClose, lessons, currentTitle, onSelect }: Props) {
  const { prevId, nextId } = computeNav(lessons);

  return (
    <>
      {/* Overlay */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100 visible" : "opacity-0 invisible",
        ].join(" ")}
        onClick={onClose}
      />

      {/* botton shet */}
      <section
        role="dialog"
        aria-modal="true"
        className={[ "fixed inset-x-0 bottom-0 z-50 md:hidden", open ? "translate-y-0" : "translate-y-full",
                      "transition-transform duration-300", "w-full max-h-[85vh] rounded-t-2xl", "bg-white dark:bg-neutral-900 shadow-2xl","border-t border-neutral-200 dark:border-neutral-800","flex flex-col",
        ].join(" ")}
      >
        {/* Handle */}
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700" />

        {/* button */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="h-7 w-7 rounded-md grid place-items-center bg-black dark:bg-neutral-100">
              <Book size={16} className="text-white dark:text-black" />
            </div>
            <button
                onClick={onClose}
                aria-label="Cerrar"
                className="relative h-10 w-10 grid place-items-center"
              >
                <span className="h-7 w-7 grid place-items-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
                  <X size={14} />
                </span>
            </button>
          </div>
        </div>

        {/* ------- */}
        <div className="border-t border-neutral-200 dark:border-neutral-800" />

        {/*  */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => prevId && onSelect(prevId)}
              disabled={!prevId}
              aria-label="Anterior"
              className="h-11 w-11 grid place-items-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Si algún día quieres mostrar el título al centro, descomenta: */}
            {/* <div className="text-sm font-medium truncate max-w-[60%] text-center">{currentTitle}</div> */}

            <button
              onClick={() => nextId && onSelect(nextId)}
              disabled={!nextId}
              aria-label="Siguiente"
              className="h-11 w-11 grid place-items-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* --------- */}
        <div className="border-t border-neutral-200 dark:border-neutral-800" />

        {/* List */}
        <div className="flex-1 overflow-y-auto px-1">
          {lessons.length === 0 ? (
            <div className="py-10" aria-hidden="true" />
          ) : (
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {lessons.map((l) => {
                const disabled = l.status === "locked";
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => !disabled && onSelect(l.id)}
                      disabled={disabled}
                      className={[ "w-full text-left px-4 py-3 text-[15px] transition-colors", "hover:bg-neutral-50 dark:hover:bg-neutral-900",
                        disabled
                          ? "text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
                          : "text-neutral-800 dark:text-neutral-200",
                      ].join(" ")}
                    >
                      {l.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ----- */}
        <div className="border-t border-neutral-200 dark:border-neutral-800" />
        <div className="px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">

          <div className="h-6" aria-hidden="true" />
        </div>
      </section>
    </>
  );
}
