"use client";

import { useEffect, useState } from "react";

export function PointerGlow() {
  const [position, setPosition] = useState({ x: 50, y: 35 });

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      setPosition({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] transition-transform duration-300"
      style={{
        background: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(94, 234, 212, 0.16), rgba(96, 165, 250, 0.1) 16%, transparent 34%)`,
      }}
    />
  );
}
