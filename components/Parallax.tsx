"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll-velocity parallax: the layer drifts at a fraction of scroll speed,
 * so stacked layers move at different rates — the multi-plane 3D depth
 * effect from scroll-driven showcase sites.
 */
export default function Parallax({
  children,
  speed = 0.15,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = requestAnimationFrame(update);
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const offset = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-offset * speed).toFixed(1)}px, 0)`;
    };
    update();
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
