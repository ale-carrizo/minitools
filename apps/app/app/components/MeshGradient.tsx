"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Colores de los blobs (hex). */
  colors?: string[];
  /** Velocidad de deriva. */
  speed?: number;
  /** Desenfoque extra en px (el upscale ya funde; usar poco o nada). */
  blur?: number;
  className?: string;
};

const DEFAULT_COLORS = ["#5448EE", "#8880F5", "#3A2FB8", "#6E63FF", "#7C3AED", "#22D3EE"];

/**
 * Mesh gradient líquido animado (estilo Stripe/Linear).
 * Blobs de gradiente radial que derivan con ondas seno y se funden
 * con blend aditivo + desenfoque. Sin dependencias.
 * Reactivo al tamaño, se pausa fuera de viewport y respeta reduced-motion.
 */
export default function MeshGradient({
  colors = DEFAULT_COLORS,
  speed = 1,
  blur = 0,
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
    // Render a baja resolución y dejar que el navegador lo escale: el upscale
    // funde los blobs como un blur, pero gratis (sin filtro costoso por frame).
    const MAX_RES = 240;

    let w = 0;
    let h = 0;
    let scale = 1;
    let raf = 0;
    let visible = true;
    let t = Math.random() * 1000;

    type Blob = {
      cx: number; cy: number; r: number;
      rgb: [number, number, number];
      fx: number; fy: number; px: number; py: number; ax: number; ay: number;
    };
    let blobs: Blob[] = [];

    function hex2rgb(hex: string): [number, number, number] {
      const n = parseInt(hex.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function build() {
      blobs = colors.map((c) => ({
        cx: 0.2 + Math.random() * 0.6,
        cy: 0.2 + Math.random() * 0.6,
        r: 0.55 + Math.random() * 0.35,
        rgb: hex2rgb(c),
        fx: 0.25 + Math.random() * 0.5,
        fy: 0.25 + Math.random() * 0.5,
        px: Math.random() * Math.PI * 2,
        py: Math.random() * Math.PI * 2,
        ax: 0.16 + Math.random() * 0.14,
        ay: 0.16 + Math.random() * 0.14,
      }));
    }

    function resize() {
      const parent = cv.parentElement;
      w = parent ? parent.clientWidth : window.innerWidth;
      h = parent ? parent.clientHeight : window.innerHeight;
      scale = Math.min(1, MAX_RES / Math.max(w, h));
      cv.width = Math.max(1, Math.round(w * scale));
      cv.height = Math.max(1, Math.round(h * scale));
      cv.style.width = w + "px";
      cv.style.height = h + "px";
      // Coordenadas de dibujo en px CSS → backing de baja resolución.
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    }

    function draw() {
      t += 0.0016 * speed;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      const base = Math.max(w, h);
      for (const b of blobs) {
        const x = (b.cx + Math.sin(t * b.fx + b.px) * b.ax) * w;
        const y = (b.cy + Math.cos(t * b.fy + b.py) * b.ay) * h;
        const rad = b.r * base * 0.6;
        const [r, g, bl] = b.rgb;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
        grad.addColorStop(0, `rgba(${r},${g},${bl},0.45)`);
        grad.addColorStop(0.6, `rgba(${r},${g},${bl},0.12)`);
        grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    }

    // El loop siempre se reprograma; el IO solo pausa el dibujo cuando
    // el lienzo no está visible. Nunca puede quedar muerto por el IO.
    function loop() {
      raf = requestAnimationFrame(loop);
      if (visible) draw();
    }

    build();
    resize();
    window.addEventListener("resize", resize);

    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(cv);
    }

    if (reduce) {
      draw(); // un solo frame estático
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      io?.disconnect();
    };
  }, [colors, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 ${className}`}
      style={blur > 0 ? { filter: `blur(${blur}px)` } : undefined}
    />
  );
}
