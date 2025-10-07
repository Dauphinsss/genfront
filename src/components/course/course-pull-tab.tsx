"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = { collapsed: boolean; onToggle: () => void };

export default function PullTab({ collapsed, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      aria-label={collapsed ? "Mostrar panel" : "Ocultar panel"}
      className={["hidden md:flex items-center justify-center z-40","absolute left-0 top-1/2 -translate-y-1/2 translate-x-[3px]", "h-14 w-7 rounded-r-full rounded-l-none", "border border-neutral-300 dark:border-neutral-700 border-l-0","bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200", "shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2", "focus-visible:ring-black dark:focus-visible:ring-white transition",
      ].join(" ")}
    >
      {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
    </button>
  );
}
