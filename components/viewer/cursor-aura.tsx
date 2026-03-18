"use client";

import { useEffect } from "react";

export function CursorAura() {
  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return <div aria-hidden="true" className="pointer-aura pointer-events-none fixed inset-0 z-[1]" />;
}
