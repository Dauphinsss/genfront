"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";

function Particles() {
  const ref = useRef<THREE.Points>(null!);
  const mouse = useRef<[number, number]>([0, 0]);

  const particles = useMemo(() => {
    const arr = new Float32Array(700 * 3);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.05 + mouse.current[0] * 0.3;
      ref.current.rotation.x = t * 0.02 + mouse.current[1] * 0.3;
    }
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouse.current = [x, y];
  };

  return (
    <group onPointerMove={handleMouseMove}>
      <Points ref={ref} positions={particles} stride={3} frustumCulled>
        <PointMaterial
          transparent
          color={getComputedStyle(document.documentElement)
            .getPropertyValue("--primary")
            .trim()}
          size={0.03}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export default function ParticleBackground() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5] }}
      style={{
        position: "fixed", // 🔑 hace que se quede fijo sobre la pantalla
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 10, // 🔑 controla qué tan arriba se muestra
        pointerEvents: "none", // 🔑 deja pasar clicks al contenido debajo
      }}
    >
      <Particles />
    </Canvas>
  );
}
