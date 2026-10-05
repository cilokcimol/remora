"use client";

import { useEffect, useRef } from "react";

/**
 * The 3D mascot: gentle idle drift + mouse-follow tilt, giving the
 * "alive character" feel of mascot-led 3D studio sites.
 */
export default function Mascot({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const tilt = tiltRef.current;
    if (!wrap || !tilt) return;
    let raf = 0;
    const tx = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      tx.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      tx.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      cur.x += (tx.x - cur.x) * 0.06;
      cur.y += (tx.y - cur.y) * 0.06;
      tilt.style.transform = `perspective(900px) rotateY(${cur.x * 7}deg) rotateX(${-cur.y * 5}deg) translate3d(${cur.x * 14}px, ${cur.y * 10}px, 0)`;
    };
    window.addEventListener("mousemove", onMove);
    loop();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div
        ref={tiltRef}
        className="h-full w-full will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="h-full w-full animate-[mascot-drift_7s_ease-in-out_infinite]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot.jpg"
            alt="Remora, the friendly 3D fish mascot"
            className="h-full w-full object-cover object-top"
            draggable={false}
          />
        </div>
      </div>
      {/* feather the seam into the page background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_62%,#c8102e_100%)]" />
    </div>
  );
}
