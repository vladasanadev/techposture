import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import baseImage from '../../imports/ChatGPT_Image_Jun_18__2026__12_33_46_PM.png';
import helmetImage from '../../imports/ChatGPT_Image_Jun_18__2026__12_41_58_PM.png';

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
}

// Tiny waveform SVG for the data panel
function Waveform() {
  return (
    <svg width="120" height="36" viewBox="0 0 120 36" fill="none" style={{ opacity: 0.7 }}>
      <polyline
        points="0,28 8,22 14,10 20,26 28,18 36,30 42,14 50,24 58,8 64,20 72,28 80,12 88,22 96,30 104,16 112,24 120,20"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function PostureLanding() {
  const [mousePosition, setMousePosition] = useState({ x: -9999, y: -9999 });
  const [mouseTrail, setMouseTrail] = useState<TrailPoint[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const pendingPos = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const loop = () => {
      setMousePosition(prev => {
        const dx = pendingPos.current.x - prev.x;
        const dy = pendingPos.current.y - prev.y;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return prev;
        return { x: prev.x + dx * 0.18, y: prev.y + dy * 0.18 };
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pendingPos.current = { x, y };
    setMouseTrail(prev => {
      const now = Date.now();
      const filtered = prev.filter(p => now - p.timestamp < 900);
      const last = filtered[filtered.length - 1];
      if (last && Math.hypot(x - last.x, y - last.y) < 6) return filtered;
      return [...filtered, { x, y, timestamp: now }];
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const id = setInterval(() => {
      setMouseTrail(prev => {
        const now = Date.now();
        return prev.filter(p => now - p.timestamp < 900);
      });
    }, 80);
    return () => clearInterval(id);
  }, []);

  const now = Date.now();
  const TRAIL_LIFETIME = 900;
  const CM_TO_PX = 96 / 2.54;
  const TRAIL_RADIUS = 1.5 * CM_TO_PX; // ~57px — tight reveal

  const cx = containerRef.current?.offsetWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1440);
  const cy = containerRef.current?.offsetHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 900);
  const dist = Math.hypot(mousePosition.x - cx / 2, mousePosition.y - cy / 2);
  const maxDist = Math.hypot(cx / 2, cy / 2);
  const textBlur = Math.max(0, 14 * (1 - dist / (maxDist * 0.7)));

  const labelStyle: React.CSSProperties = {
    fontFamily: '"Space Grotesk", "Inter", sans-serif',
    fontSize: '0.6rem',
    letterSpacing: '0.18em',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase' as const,
    lineHeight: 1.5,
  };

  const dotStyle: React.CSSProperties = {
    display: 'inline-block',
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.6)',
    marginRight: 6,
    verticalAlign: 'middle',
    flexShrink: 0,
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      {/* SVG filters & masks */}
      <svg
        className="absolute inset-0"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
      >
        <defs>
          <filter id="trailBlur" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <mask id="trailMask">
            <rect width="100%" height="100%" fill="black" />
            <g filter="url(#trailBlur)">
              {mouseTrail.map((point, index) => {
                const age = now - point.timestamp;
                const t = age / TRAIL_LIFETIME;
                const opacity = Math.max(0, 1 - t * t);
                const r = TRAIL_RADIUS * (1 + t * 0.4);
                return (
                  <circle
                    key={`${point.timestamp}-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r={r}
                    fill="white"
                    opacity={opacity}
                  />
                );
              })}
            </g>
          </mask>
        </defs>
      </svg>

      {/* Base image — objectPosition tuned so the nose aligns with the helmet image */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <ImageWithFallback
          src={baseImage}
          alt="Girl base"
          className="w-full h-full object-cover"
          style={{ objectPosition: '50% 8%' }}
        />
      </div>

      {/* Helmet image revealed by trail — reference anchor */}
      <div
        className="absolute inset-0"
        style={{ mask: 'url(#trailMask)', WebkitMask: 'url(#trailMask)', zIndex: 2 }}
      >
        <ImageWithFallback
          src={helmetImage}
          alt="Girl with helmet"
          className="w-full h-full object-cover"
          style={{ objectPosition: '50% 0%' }}
        />
      </div>

      {/* Vignette / spotlight darken */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 380px at ${mousePosition.x}px ${mousePosition.y}px,
            transparent 0%,
            rgba(0,0,0,0.18) 50%,
            rgba(0,0,0,0.52) 100%)`,
          zIndex: 10,
        }}
      />

      {/* ── TYPOGRAPHY LAYER ── */}

      {/* TOP LEFT — small label */}
      <div
        className="absolute pointer-events-none"
        style={{ top: 28, left: 32, zIndex: 40 }}
      >
        <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.38)', fontSize: '0.58rem' }}>
          Every movement shapes<br />the architecture of your body
        </p>
      </div>

      {/* TOP RIGHT — book session link */}
      <div
        className="absolute pointer-events-auto"
        style={{ top: 24, right: 32, zIndex: 40 }}
      >
        <a
          href="#"
          style={{
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            fontSize: '0.62rem',
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.25)',
            paddingBottom: 2,
          }}
        >
          Book a session ↗
        </a>
      </div>

      {/* RIGHT MIDDLE — status indicator */}
      <div
        className="absolute pointer-events-none"
        style={{ top: '42%', right: 32, zIndex: 40, textAlign: 'right' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginBottom: 4 }}>
          <span style={{ ...labelStyle, color: 'rgba(255,255,255,0.65)' }}>Status</span>
          <span style={{ ...dotStyle, background: '#7fff9a' }} />
        </div>
        <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.38)', textAlign: 'right' }}>
          Spinal alignment index +91.4%
        </p>
      </div>

      {/* LEFT MIDDLE — vertical ASCII rule + label */}
      <div
        className="absolute pointer-events-none"
        style={{ top: '50%', left: 28, transform: 'translateY(-50%)', zIndex: 40 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ ...dotStyle }} />
          <p style={{ ...labelStyle, maxWidth: 110 }}>
            Biometric posture<br />calibration active
          </p>
        </div>
      </div>

      {/* BOTTOM LEFT — headline + body + CTA */}
      <div
        className="absolute pointer-events-none"
        style={{ bottom: 44, left: 32, zIndex: 40, maxWidth: 280 }}
      >
        <h2
          style={{
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(1.4rem, 2.8vw, 2rem)',
            color: 'rgba(255,255,255,0.95)',
            lineHeight: 1.2,
            marginBottom: 10,
            letterSpacing: '-0.01em',
          }}
        >
          Align with<br />your potential
        </h2>
        <p
          style={{
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.65,
            letterSpacing: '0.02em',
            marginBottom: 20,
          }}
        >
          A precision platform dedicated to mapping,<br />
          correcting, and reinforcing the hidden signals<br />
          that hold your body upright.
        </p>
        <button
          className="pointer-events-auto"
          style={{
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            fontSize: '0.62rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#000',
            background: 'rgba(255,255,255,0.92)',
            border: 'none',
            padding: '10px 22px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Begin the journey
        </button>
      </div>

      {/* BOTTOM RIGHT — recent metrics panel */}
      <div
        className="absolute pointer-events-none"
        style={{ bottom: 44, right: 32, zIndex: 40, textAlign: 'right', maxWidth: 200 }}
      >
        <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.65)', marginBottom: 10 }}>
          Recent metrics
        </p>

        <div style={{ marginBottom: 8 }}>
          <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.75)', marginBottom: 2 }}>
            Cervical study 08.21
          </p>
          <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.35)', fontSize: '0.54rem' }}>
            Detected micro-compressions between<br />C3–C5 under sustained screen load
          </p>
        </div>

        <div style={{ marginBottom: 12 }}>
          <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.75)', marginBottom: 2 }}>
            Lumbar model 14.03
          </p>
          <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.35)', fontSize: '0.54rem' }}>
            Predictive correction trained on<br />biomechanics data from 3,200+ sessions
          </p>
        </div>

        <Waveform />
      </div>

      {/* ── POSTURE HERO TEXT ── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 30 }}
      >
        {/* Blurred ghost layer */}
        <h1
          aria-hidden="true"
          className="absolute tracking-wider select-none"
          style={{
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(4rem, 12vw, 12rem)',
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.15em',
            filter: 'blur(22px)',
          }}
        >
          POSTURE
        </h1>

        {/* Sharp layer */}
        <h1
          className="tracking-wider select-none"
          style={{
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(4rem, 12vw, 12rem)',
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '0.15em',
            textShadow: '0 0 60px rgba(255,255,255,0.25), 0 0 120px rgba(255,255,255,0.12)',
            filter: `blur(${textBlur}px)`,
          }}
        >
          POSTURE
        </h1>
      </div>

      {/* Bottom center — ASCII decorative rule */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '0.5rem',
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.18)',
          }}
        >
          ·─────·  ◈  POSTURE.TECH  ◈  ·─────·
        </span>
      </div>

      {/* Top center — ASCII decorative line */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '0.5rem',
            letterSpacing: '0.25em',
            color: 'rgba(255,255,255,0.14)',
          }}
        >
          ┌──────────────── ◦ ────────────────┐
        </span>
      </div>
    </div>
  );
}
