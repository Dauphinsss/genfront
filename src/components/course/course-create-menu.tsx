"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

type Props = {
  onCreateSection: () => void;
  onCreateLesson: () => void;
  className?: string;
  align?: "left" | "right";
  buttonClass?: string;
  ariaLabel?: string;
  size?: number;
};

export default function CourseCreateMenu({
  onCreateSection,
  onCreateLesson,
  className = "",
  align = "right",
  buttonClass = "",
  ariaLabel = "Abrir menu de creacion",
  size = 18,
}: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const side = align === "left" ? "left-0" : "right-0";

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel}
        className={buttonClass}
      >
        <Plus size={size} />
      </button>

      {/* Menu */}
      {open && (
        <div
          aria-label="Menú de creación"
          className={`absolute ${side} mt-2 w-56 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg ring-1 ring-black/5 p-2 z-50`}
        >
          <button
            onClick={() => {
              setOpen(false);
              onCreateSection();
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Crear sección
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onCreateLesson();
            }}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Crear lección
          </button>
        </div>
      )}
    </div>
  );
}
