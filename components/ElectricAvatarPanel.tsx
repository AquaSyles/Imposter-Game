"use client";

import React, { useEffect, useMemo, useRef } from "react";
import styled from "styled-components";

type ElectricTheme = "blue" | "pink" | "red" | "green" | "purple" | "white";
type ElectricAvatarPanelProps = {
  className?: string;
  children: React.ReactNode;

  /** Match din PlayerContainer */
  width?: number;  // default 300
  height?: number; // default 200
  radius?: number; // default 60

  /** Fargegruppe */
  theme?: ElectricTheme;

  /** Finjustering */
  emberCount?: number;     // default 110
  speed?: number;          // default 1.2
  chaos?: number;          // default 0.14
  lineWidth?: number;      // default 1.2
};


const THEMES: Record<
  ElectricTheme,
  {
    stroke: string;
    glowA: string;
    glowB: string;
    glowC: string;
    emberCore: string;
    emberMid: string;
    emberOuter: string;
    bgGlowA: string;
    bgGlowB: string;
  }
> = {
  blue: {
    stroke: "#9CD6FF",
    glowA: "rgba(11, 89, 206, 0.45)",
    glowB: "rgba(3, 115, 194, 0.16)",
    glowC: "rgba(1, 86, 147, 0.00)",
    emberCore: "rgba(190, 207, 255, 0.90)",
    emberMid: "rgba(89, 70, 255, 0.55)",
    emberOuter: "rgba(119, 40, 255, 0.18)",
    bgGlowA: "rgba(33, 127, 194, 0.35)",
    bgGlowB: "rgba(0, 0, 174, 0.22)",
  },

  pink: {
    stroke: "#FFB3E6",
    glowA: "rgba(255, 76, 189, 0.42)",
    glowB: "rgba(255, 76, 189, 0.16)",
    glowC: "rgba(255, 76, 189, 0.00)",
    emberCore: "rgba(255, 220, 245, 0.92)",
    emberMid: "rgba(255, 120, 210, 0.55)",
    emberOuter: "rgba(255, 80, 180, 0.18)",
    bgGlowA: "rgba(255, 76, 189, 0.26)",
    bgGlowB: "rgba(255, 140, 220, 0.18)",
  },

  // 2) ✅ gjør red mer blodrød
  red: {
    stroke: "#FF3B3B",                // blodrød “core line”
    glowA: "rgba(255, 0, 43, 0.46)",  // sterk rødglød
    glowB: "rgba(255, 0, 43, 0.18)",  // medium
    glowC: "rgba(255, 0, 43, 0.00)",  // falloff
    emberCore: "rgba(255, 235, 235, 0.92)",
    emberMid: "rgba(255, 28, 86, 0.62)",   // hot pinkish blood
    emberOuter: "rgba(160, 0, 20, 0.22)",  // mørk blodkant
    bgGlowA: "rgba(255, 0, 43, 0.22)",
    bgGlowB: "rgba(120, 0, 18, 0.16)",
  },

  green: {
    stroke: "#B6FFD8",
    glowA: "rgba(40, 255, 180, 0.34)",
    glowB: "rgba(40, 255, 180, 0.14)",
    glowC: "rgba(40, 255, 180, 0.00)",
    emberCore: "rgba(220, 255, 240, 0.90)",
    emberMid: "rgba(80, 255, 180, 0.50)",
    emberOuter: "rgba(60, 220, 160, 0.16)",
    bgGlowA: "rgba(40, 255, 180, 0.18)",
    bgGlowB: "rgba(90, 255, 210, 0.12)",
  },

  purple: {
    stroke: "#D7B3FF",
    glowA: "rgba(155, 90, 255, 0.36)",
    glowB: "rgba(155, 90, 255, 0.14)",
    glowC: "rgba(155, 90, 255, 0.00)",
    emberCore: "rgba(240, 230, 255, 0.92)",
    emberMid: "rgba(175, 120, 255, 0.55)",
    emberOuter: "rgba(120, 80, 255, 0.18)",
    bgGlowA: "rgba(155, 90, 255, 0.20)",
    bgGlowB: "rgba(90, 140, 255, 0.12)",
  },

  // 3) ✅ ny white theme (kald hvit / blålig “electric”)
  white: {
    stroke: "#FFFFFF",
    glowA: "rgba(255, 255, 255, 0.34)",
    glowB: "rgba(180, 210, 255, 0.14)",  // litt icy tint
    glowC: "rgba(255, 255, 255, 0.00)",
    emberCore: "rgba(255, 255, 255, 0.95)",
    emberMid: "rgba(210, 235, 255, 0.55)",
    emberOuter: "rgba(160, 200, 255, 0.18)",
    bgGlowA: "rgba(255, 255, 255, 0.18)",
    bgGlowB: "rgba(160, 200, 255, 0.10)",
  },
};

export default function ElectricAvatarPanel({
  className,
  children,

  width = 300,
  height = 200,
  radius = 60,

  theme = "blue",

  emberCount = 110,
  speed = 1.2,
  chaos = 0.14,
  lineWidth = 1.2,
}: ElectricAvatarPanelProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const embersRef = useRef<HTMLDivElement | null>(null);

  const t = THEMES[theme];

  const cssVars = useMemo(
    () =>
      ({
        "--stroke": t.stroke,
        "--glowA": t.glowA,
        "--glowB": t.glowB,
        "--glowC": t.glowC,
        "--emberCore": t.emberCore,
        "--emberMid": t.emberMid,
        "--emberOuter": t.emberOuter,
        "--bgGlowA": t.bgGlowA,
        "--bgGlowB": t.bgGlowB,
      }) as React.CSSProperties,
    [t]
  );

  // ---------- Embers ----------
  useEffect(() => {
    const embersEl = embersRef.current;
    if (!embersEl) return;

    embersEl.innerHTML = "";

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    // Spawn langs LEFT, ARC og BOTTOM for bedre “fyll”
    const W = width;
    const H = height;
    const R = Math.min(radius, Math.min(W, H) - 2);

    function spawnPoint() {
      const pick = Math.random();

      // 45% left, 25% arc, 30% bottom
      if (pick < 0.45) {
        // left edge (litt unna topp)
        return { x: -2, y: rand(10, H - (R + 8)) };
      }

      if (pick < 0.70) {
        // arc bottom-left (90 -> 180 deg i skjermkoordinater, men vi bruker parametrisering)
        // Center = (R, H-R)
        const cx = R;
        const cy = H - R;

        // angle går fra PI (venstre) til PI/2 (bunn)
        const ang = Math.PI - rand(0, 1) * (Math.PI / 2);

        // på selve buen (litt utenfor kanten for "spawning")
        const px = cx + R * Math.cos(ang);
        const py = cy + R * Math.sin(ang);
        return { x: px, y: py };
      }

      // bottom edge
      return { x: rand(R + 6, W - 10), y: H + 2 };
    }

    for (let i = 0; i < emberCount; i++) {
      const e = document.createElement("div");
      e.className = "ember";

      const { x, y } = spawnPoint();

      const size = rand(3.2, 9.8);
      const duration = rand(1250, 2900);
      const delay = rand(0, 1800);

      // flyr ned + venstre (variasjon)
      const dx = rand(-90, -320);
      const dy = rand(70, 280);
      const drift = rand(-40, 55);

      e.style.setProperty("--x", `${x}px`);
      e.style.setProperty("--y", `${y}px`);
      e.style.setProperty("--s", `${size}px`);
      e.style.setProperty("--t", `${duration}ms`);
      e.style.setProperty("--d", `${delay}ms`);
      e.style.setProperty("--dx", `${dx + drift}px`);
      e.style.setProperty("--dy", `${dy}px`);

      embersEl.appendChild(e);
    }
  }, [emberCount, width, height, radius, theme]);

  // ---------- Electric border (canvas) ----------
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PAD = 60;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let time = 0;
    let last = performance.now();
    let raf = 0;

    const random1 = (x: number) => (Math.sin(x * 12.9898) * 43758.5453) % 1;

    const noise2D = (x: number, y: number) => {
      const i = Math.floor(x);
      const j = Math.floor(y);
      const fx = x - i;
      const fy = y - j;

      const a = random1(i + j * 57);
      const b = random1(i + 1 + j * 57);
      const c = random1(i + (j + 1) * 57);
      const d = random1(i + 1 + (j + 1) * 57);

      const ux = fx * fx * (3.0 - 2.0 * fx);
      const uy = fy * fy * (3.0 - 2.0 * fy);

      return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
    };

    const octavedNoise = (
      x: number,
      octaves: number,
      lacunarity: number,
      gain: number,
      baseAmplitude: number,
      baseFrequency: number,
      t0: number,
      seed: number
    ) => {
      let y = 0;
      let amplitude = baseAmplitude;
      let frequency = baseFrequency;

      for (let i = 0; i < octaves; i++) {
        y += amplitude * noise2D(frequency * x + seed * 100, t0 * frequency * 0.32);
        frequency *= lacunarity;
        amplitude *= gain;
      }
      return y;
    };

    const getLeftBottomPoints = (w: number, h: number, r: number, samples: number) => {
      const pts: Array<{ x: number; y: number }> = [];
      const rad = Math.max(0, Math.min(r, Math.min(w, h) - 2));

      // left edge: (0,0) -> (0, h-rad)
      const leftStraight = h - rad;
      const leftSamples = Math.max(18, Math.floor(samples * (leftStraight / (w + h))));
      for (let i = 0; i < leftSamples; i++) {
        const tt = i / leftSamples;
        pts.push({ x: 0, y: tt * leftStraight });
      }

      // arc bottom-left: center (rad, h-rad), angle PI -> PI/2  ✅ (riktig retning)
      const arcSamples = Math.max(28, Math.floor(samples * 0.22));
      const cx = rad;
      const cy = h - rad;
      for (let i = 0; i <= arcSamples; i++) {
        const tt = i / arcSamples;
        const ang = Math.PI - tt * (Math.PI / 2);
        pts.push({ x: cx + rad * Math.cos(ang), y: cy + rad * Math.sin(ang) });
      }

      // bottom edge: (rad, h) -> (w, h)
      const bottomStraight = w - rad;
      const bottomSamples = Math.max(18, Math.floor(samples * (bottomStraight / (w + h))));
      for (let i = 0; i <= bottomSamples; i++) {
        const tt = i / bottomSamples;
        pts.push({ x: rad + tt * bottomStraight, y: h });
      }

      return pts;
    };

    const resizeCanvas = () => {
      const rect = wrap.getBoundingClientRect();
      const w = rect.width + PAD * 2;
      const h = rect.height + PAD * 2;

      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      return { w, h };
    };

    let size = resizeCanvas();

    const ro = new ResizeObserver(() => {
      size = resizeCanvas();
    });
    ro.observe(wrap);

    const drawPass = (
      points: Array<{ x: number; y: number }>,
      stroke: string,
      lw: number,
      alpha: number,
      blurPx: number,
      innerW: number,
      innerH: number,
      rad: number
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.filter = blurPx > 0 ? `blur(${blurPx}px)` : "none";

      // 🔧 Finjustering (kan expose som props senere)
      const displacement = 18;   // hvor langt ut fra kanten
      const noiseScale = 7.5;    // hvor “hakkete”
      const cornerDampen = 0.55; // demp i buen

      ctx.beginPath();

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const progress = i / (points.length - 1);

        const n = octavedNoise(progress * noiseScale, 7, 1.7, 0.62, chaos, 9, time, 0);

        // normal (utover) – kun left + arc + bottom
        let nx = 0;
        let ny = 0;

        if (p.x <= 0.0001 && p.y <= innerH - rad - 0.0001) {
          nx = -1;
          ny = 0;
        } else if (p.y >= innerH - 0.0001 && p.x >= rad + 0.0001) {
          nx = 0;
          ny = 1;
        } else {
          const cx = rad;
          const cy = innerH - rad;
          const vx = p.x - cx;
          const vy = p.y - cy;
          const len = Math.max(0.0001, Math.hypot(vx, vy));
          nx = vx / len;
          ny = vy / len;
        }

        let damp = 1;
        if (p.x < rad + 0.001 && p.y > innerH - rad - 0.001) damp = cornerDampen;

        const x = PAD + p.x + nx * n * displacement * damp;
        const y = PAD + p.y + ny * n * displacement * damp;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.restore();
    };

    const animate = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      time += dt * speed;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const innerW = size.w - PAD * 2;
      const innerH = size.h - PAD * 2;

      const approx = innerW + innerH;
      const samples = Math.floor(approx / 2.2);

      const rad = Math.min(radius, Math.min(innerW, innerH) - 2);
      const points = getLeftBottomPoints(innerW, innerH, rad, samples);

      // glow + crisp
      drawPass(points, t.stroke, lineWidth + 1.6, 0.40, 6.5, innerW, innerH, rad);
      drawPass(points, t.stroke, lineWidth, 0.90, 0, innerW, innerH, rad);

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [theme, width, height, radius, speed, chaos, lineWidth, t.stroke]);

  return (
    <Wrap
      ref={wrapRef}
      className={className}
      style={{
        ...cssVars,
        width,
        height,
        borderRadius: `0 0 0 ${radius}px`,
      }}
    >
      <CanvasLayer aria-hidden="true">
        <canvas ref={canvasRef} />
      </CanvasLayer>

      <GlowLayers aria-hidden="true">
        <GlowLeft />
        <GlowBottom />
        <BgGlow />
      </GlowLayers>

      <Panel>
        <Embers ref={embersRef} aria-hidden="true" />
        {children}
      </Panel>
    </Wrap>
  );
}

/* ---------------- styled ---------------- */
const Wrap = styled.div`
  position: relative;
  isolation: isolate;
`;

const Panel = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: #1e293b;
  z-index: 2;
  overflow: visible;
`;

const CanvasLayer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 4;

  canvas {
    display: block;
  }
`;

const GlowLayers = styled.div`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
`;

const GlowLeft = styled.div`
  position: absolute;
  pointer-events: none;
  filter: blur(20px);
  opacity: 0.55;

  left: -60px;
  top: -18px;
  width: 80px;
  height: calc(100% + 36px);
  border-radius: 0 0 0 80px;

  background: linear-gradient(90deg, var(--glowA) 0%, var(--glowB) 35%, var(--glowC) 100%);
`;

const GlowBottom = styled.div`
  position: absolute;
  pointer-events: none;
  filter: blur(20px);
  opacity: 0.55;

  left: -18px;
  bottom: -60px;
  width: calc(100% + 36px);
  height: 80px;
  border-radius: 0 0 0 80px;

  background: linear-gradient(0deg, var(--glowA) 0%, var(--glowB) 35%, var(--glowC) 100%);
`;

const BgGlow = styled.div`
  position: absolute;
  inset: -36px;
  border-radius: inherit;
  z-index: -1;
  background: linear-gradient(-30deg, var(--bgGlowA), transparent, var(--bgGlowB));
  filter: blur(52px);
  opacity: 0.2;
`;

const Embers = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;

  .ember {
    position: absolute;
    width: var(--s, 6px);
    height: var(--s, 6px);
    border-radius: 999px;
    left: var(--x, 0px);
    top: var(--y, 0px);
    opacity: 0;

    background: radial-gradient(
      circle,
      var(--emberCore) 0%,
      var(--emberMid) 40%,
      var(--emberOuter) 62%,
      rgba(0, 0, 0, 0) 78%
    );

    filter: blur(0.15px);
    animation: emberFly var(--t, 1600ms) ease-out infinite;
    animation-delay: var(--d, 0ms);
  }

  @keyframes emberFly {
    0% {
      transform: translate(0, 0) scale(0.9);
      opacity: 0;
    }
    10% {
      opacity: 0.95;
    }
    60% {
      opacity: 0.35;
    }
    100% {
      transform: translate(var(--dx, -160px), var(--dy, 190px)) scale(0.1);
      opacity: 0;
    }
  }
`;
