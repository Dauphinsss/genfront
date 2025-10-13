"use client";
// cspell:ignore gsap círculo rodea queda centro
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function TextCircleFollower() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // El círculo rodea al mouse, el mouse queda en el centro
    const moveCircle = (e: MouseEvent) => {
      const el = wrapperRef.current;
      if (!el) return;

      const { width, height } = el.getBoundingClientRect();
      gsap.to(el, {
      x: e.clientX - width / 2,
      y: e.clientY - height / 2,
      duration: 1.2,
      ease: "power3.out",
      });
    };

    window.addEventListener("mousemove", moveCircle);
    return () => window.removeEventListener("mousemove", moveCircle);
  }, []);

  const text = " PYTHON • PYTHON • PYTHON • PYTHON • ";

  return (
    <div
      ref={wrapperRef}
      className="fixed top-0 left-0 w-[150px] h-[150px] pointer-events-none z-50 flex items-center justify-center"
    >
      <div className="animate-spin-slow">

        {Array.from(text).map((ch, i) => (
          <span
            key={i}
            className="absolute text-xs font-bold text-primary dark:text-primary "
            style={{
              transform: `rotate(${
                i * (360 / text.length)
              }deg) translate(65px) rotate(${90}deg)`,
            }}
          >
            {ch}
          </span>
        ))}
    </div>
 
    </div>
  );
}
