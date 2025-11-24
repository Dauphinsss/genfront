"use client";

import { useEffect, useRef } from "react";
import { Monitor } from "lucide-react";
import { gsap } from "gsap";

export function DesktopOnlyScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    if (!containerRef.current || !iconRef.current) return;

    gsap.fromTo(
      iconRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
    );

    gsap.to(iconRef.current, {
      y: -10,
      duration: 2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: 0.5,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex min-h-screen items-center justify-center bg-background px-6"
    >
      <div className="flex flex-col items-center text-center max-w-md space-y-6">
        <div
          ref={iconRef}
          className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-border bg-secondary shadow-lg"
        >
          <Monitor className="h-12 w-12 text-foreground" strokeWidth={1.5} />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Solo disponible en PC
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Esta plataforma está optimizada para computadoras de escritorio
          </p>
        </div>

        <div className="pt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
          <span>Plataforma de Aprendizaje Pyson</span>
        </div>
      </div>
    </div>
  );
}
