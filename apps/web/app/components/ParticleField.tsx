"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Densidad: px² por partícula. Más bajo = más partículas. */
  density?: number;
  /** Color base de los puntos y líneas (RGB sin alpha). */
  color?: string;
  className?: string;
};

/**
 * Campo de partículas tipo constelación dibujado en canvas.
 * Sin dependencias. Reactivo al mouse, se pausa fuera de viewport
 * y respeta prefers-reduced-motion.
 */
export default function ParticleField({
  density = 14000,
  color = "136,128,245",
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const cv: HTMLCanvasElement = canvas;
    const ctx: CanvasRenderingContext2D = context;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let dots: P[] = [];
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      const parent = cv.parentElement;
      w = parent ? parent.clientWidth : window.innerWidth;
      h = parent ? parent.clientHeight : window.innerHeight;
      cv.width = w * DPR;
      cv.height = h * DPR;
      cv.style.width = w + "px";
      cv.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const count = Math.max(28, Math.min(110, Math.floor((w * h) / density)));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.7,
      }));
    }

    const LINK = 130;

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      for (const p of dots) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Atracción suave hacia el cursor
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 150 * 150) {
          const f = (1 - Math.sqrt(d2) / 150) * 0.6;
          p.x += (dx / 150) * f;
          p.y += (dy / 150) * f;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},0.75)`;
        ctx.fill();
      }

      // Líneas entre puntos cercanos
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i];
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${color},${(1 - dist / LINK) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(frame);
    }

    function onMove(e: MouseEvent) {
      const rect = cv.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);

    // Pausa cuando no está visible (ahorro de batería)
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting && !reduce;
      if (running) raf = requestAnimationFrame(frame);
      else cancelAnimationFrame(raf);
    });
    io.observe(cv);

    if (reduce) {
      // Render estático de un frame
      frame();
      running = false;
      cancelAnimationFrame(raf);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      io.disconnect();
    };
  }, [density, color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 ${className}`}
    />
  );
}
