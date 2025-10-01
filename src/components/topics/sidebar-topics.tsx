"use client";

import { useEffect, useState } from "react";

export type Topic = {
  id: string;
  courseId: string;
  title: string;
  kind: "TEXT" | "IMAGE";
  text?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

interface SidebarTopicsProps {
  courseId: string;
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

export default function SidebarTopics({ courseId, activeId, onSelect }: SidebarTopicsProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchTopics() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/courses/${courseId}/topics`, { cache: "no-store" });
      if (!res.ok) throw new Error("Error al cargar los topics");

      const data: Topic[] = await res.json();
      setTopics(data);
    } catch (e: any) {
      console.error("Error fetching topics:", e);
      setTopics([]);
      setError(e?.message ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (courseId) fetchTopics();
  }, [courseId]);

  return (
    <aside
      className="w-64 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground/90 @container"
      aria-label="Lista de lecciones"
    >
      {/* barra */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-sidebar-border bg-sidebar/80 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60">
        <h2 className="text-sm font-semibold tracking-tight">Lecciones</h2>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="inline-flex items-center gap-1 rounded-md border border-input bg-secondary px-2 py-1 text-xs font-medium text-foreground shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden>+</span>
          Nuevo
        </button>
      </div>

      {/* contenido */}
      <div className="p-3">
        {loading ? (
          <ul className="space-y-1" role="status" aria-live="polite">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="h-9 animate-pulse rounded-md bg-muted" />
            ))}
          </ul>
        ) : error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
            <p className="font-medium">No se pudieron cargar las lecciones.</p>
            <p className="text-muted-foreground">{error}</p>
            <button
              onClick={fetchTopics}
              className="mt-2 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:opacity-90"
            >
              Reintentar
            </button>
          </div>
        ) : topics.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            Aún no hay lecciones. Crea la primera con <span className="font-medium">Nuevo</span>.
          </div>
        ) : (
          <ul className="space-y-1" role="list">
            {topics.map((t) => {
              const isActive = t.id === activeId;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => onSelect(t.id)}
                    className={[
                      "group block w-full rounded-md border px-2 py-2 text-left text-sm transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "border-ring bg-secondary/70 text-foreground"
                        : "border-transparent hover:bg-accent/60",
                    ].join(" ")}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-medium">{t.title}</span>
                      <Badge kind={t.kind} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

function Badge({ kind }: { kind: Topic["kind"] }) {
  const label = kind === "IMAGE" ? "Imagen" : "Texto";
  const icon = kind === "IMAGE" ? " " : " ";
  return (
    <span
      className="inline-flex min-w-[4.5rem] items-center justify-center gap-1 rounded-full border border-input bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/90 group-data-[active=true]:border-ring"
    >
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}
