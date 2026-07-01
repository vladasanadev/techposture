import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import baseImage from '../../imports/ChatGPT_Image_Jun_18__2026__12_33_46_PM.png';
import helmetImage from '../../imports/ChatGPT_Image_Jun_18__2026__12_41_58_PM.png';
import contactPuzzlesImage from '../../imports/contact-puzzles.png';

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface AudienceMetric {
  label: string;
  value: number;
  display: string;
  color?: string;
}

interface ClientLogo {
  name: string;
  src: string;
}

interface ShowcaseWork {
  title: string;
  brand: string;
  views: string;
  src: string;
  link: string;
  containFrame?: boolean;
}

interface GlobeMorphProps {
  hex?: string;
  ocean?: string;
  bg?: string;
  landOpacity?: number;
  globeOpacity?: number;
  density?: number;
  style?: React.CSSProperties;
}

const GLOBE_URL = 'https://tkartik.com/globe-to-flat-map/van-der-grinten-map.html';
const GLOBE_DEFAULTS = {
  hex: '#ffffff',
  ocean: '#000000',
  bg: '#000000',
  landOpacity: 1,
  globeOpacity: 0.5,
  density: 500,
};

function toGlobeHex(color?: string) {
  if (!color) return '';
  if (color.startsWith('#')) return color.slice(1);
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return '';
  const red = parseInt(match[1], 10).toString(16).padStart(2, '0');
  const green = parseInt(match[2], 10).toString(16).padStart(2, '0');
  const blue = parseInt(match[3], 10).toString(16).padStart(2, '0');
  return `${red}${green}${blue}`;
}

function buildGlobeUrl(props: GlobeMorphProps) {
  const hex = props.hex != null ? toGlobeHex(props.hex) : GLOBE_DEFAULTS.hex.slice(1);
  const ocean = props.ocean != null ? toGlobeHex(props.ocean) : GLOBE_DEFAULTS.ocean.slice(1);
  const bg = props.bg != null ? toGlobeHex(props.bg) : GLOBE_DEFAULTS.bg.slice(1);
  const params = new URLSearchParams({
    hex,
    ocean,
    bg,
    landOpacity: String(props.landOpacity ?? GLOBE_DEFAULTS.landOpacity),
    globeOpacity: String(props.globeOpacity ?? GLOBE_DEFAULTS.globeOpacity),
    density: String(Math.round(Number(props.density) || GLOBE_DEFAULTS.density)),
  });
  return `${GLOBE_URL}?${params.toString()}`;
}

function GlobeMorph(props: GlobeMorphProps) {
  const settings = { ...GLOBE_DEFAULTS, ...props };
  const src = buildGlobeUrl(settings);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minWidth: 320,
        minHeight: 180,
        position: 'relative',
        backgroundColor: '#0a0a0a',
        ...props.style,
      }}
    >
      <iframe
        src={src}
        title="Globe Morph"
        loading="lazy"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          pointerEvents: 'auto',
          touchAction: 'auto',
        }}
      />
    </div>
  );
}

const socialLinks = [
  { label: 'X', href: 'https://x.com/vladasanadev', ariaLabel: 'Open Vlada on X' },
  { label: 'IG', href: 'https://www.instagram.com/vlada.asana/', ariaLabel: 'Open Vlada on Instagram' },
  { label: 'TT', href: 'https://www.tiktok.com/@vlada.asana', ariaLabel: 'Open Vlada on TikTok' },
  { label: 'IN', href: 'https://www.linkedin.com/in/vlada-kandyba-3386a2227', ariaLabel: 'Open Vlada on LinkedIn' },
];

const clientLogos: ClientLogo[] = [
  { name: '4Geeks Academy', src: new URL('../../img/4geekacademy_logo.png', import.meta.url).href },
  { name: 'Hostinger', src: new URL('../../img/Hostinger_logo.png', import.meta.url).href },
  { name: 'Astraux', src: new URL('../../img/astraux)logo.webp', import.meta.url).href },
  { name: 'DeepPocket', src: new URL('../../img/deeppocket_logo.png', import.meta.url).href },
  { name: 'GameDev', src: new URL('../../img/gamedev_logo.jpg', import.meta.url).href },
  { name: 'HeyGen', src: new URL('../../img/heygenai.jpg', import.meta.url).href },
  { name: 'Ledger', src: new URL('../../img/ledger_logo.png', import.meta.url).href },
  { name: 'Lovable', src: new URL('../../img/lovable_logo.png', import.meta.url).href },
  { name: 'SheCodes', src: new URL('../../img/shecodes_logo.png', import.meta.url).href },
  { name: 'Tangem', src: new URL('../../img/tangem.png', import.meta.url).href },
  { name: 'Verdent', src: new URL('../../img/verdent_logo.jpeg', import.meta.url).href },
  { name: 'Virtuals', src: new URL('../../img/virtuals.png', import.meta.url).href },
  { name: 'Client mark', src: new URL('../../img/images.png', import.meta.url).href },
];

const showcaseWorks: ShowcaseWork[] = [
  {
    title: 'Software Demo',
    brand: '@Hostinger',
    views: '326k views',
    src: 'https://www.instagram.com/reel/DUDhxE9EaN3/embed',
    link: 'https://www.instagram.com/reel/DUDhxE9EaN3/?igsh=cm1reWEwNTJtZHF3',
  },
  {
    title: 'Brand Awareness',
    brand: '@Lovable',
    views: '27k views',
    src: 'https://www.instagram.com/reel/DNYOZi-t4Do/embed',
    link: 'https://www.instagram.com/reel/DNYOZi-t4Do/?igsh=cXdtdXJyemx3MDl2',
  },
  {
    title: 'Product Sale',
    brand: '@Emergent',
    views: '72.3k views',
    src: 'https://www.instagram.com/reel/DWjGdZQkce2/embed',
    link: 'https://www.instagram.com/reel/DWjGdZQkce2/?igsh=MXlrZjc3Z3FmMmJ0',
  },
  {
    title: 'Protocol Demo',
    brand: '@Virtuals',
    views: '63k views',
    src: 'https://www.instagram.com/reel/DXto6dkkdd5/embed',
    link: 'https://www.instagram.com/reel/DXto6dkkdd5/?igsh=OGRvMWpsMWpua25t',
  },
];

const financeWorks: ShowcaseWork[] = [
  {
    title: 'Finance Explainer',
    brand: '@DeepPocket',
    views: '28k views',
    src: 'https://www.instagram.com/reel/DYCML8RAD3M/embed',
    link: 'https://www.instagram.com/reel/DYCML8RAD3M/?igsh=M3V5aW43MTVsdWg4',
  },
  {
    title: 'Payment Demo',
    brand: '@VPay',
    views: 'Finance reel',
    src: 'https://www.instagram.com/reel/DTcppaDkbG6/embed',
    link: 'https://www.instagram.com/reel/DTcppaDkbG6/?igsh=MTRpYnFlYXdkMGFlNg==',
  },
  {
    title: 'UX Breakdown',
    brand: 'AstraUX',
    views: '15k views',
    src: 'https://www.instagram.com/reel/DOGrEdnjYfT/embed',
    link: 'https://www.instagram.com/reel/DOGrEdnjYfT/?igsh=MXJ0ZG1mMnh3empxbw==',
    containFrame: true,
  },
  {
    title: 'Research Signal',
    brand: '@IdeaBrowser',
    views: '111k views',
    src: 'https://www.instagram.com/reel/DVvqeSXCSD1/embed',
    link: 'https://www.instagram.com/reel/DVvqeSXCSD1/?igsh=MWdkNDhzOXJmdGVpOQ==',
  },
];

const eventsWorks: ShowcaseWork[] = [
  {
    title: 'Event Recap',
    brand: '@DLCGroup',
    views: '126k views',
    src: 'https://www.instagram.com/reel/DQ81BMvEXTC/embed',
    link: 'https://www.instagram.com/reel/DQ81BMvEXTC/?igsh=N3d5cTVoY3phbHho',
  },
  {
    title: 'Live Activation',
    brand: '@AstraUX',
    views: 'Event reel',
    src: 'https://www.instagram.com/reel/DOOzvMEgA8D/embed',
    link: 'https://www.instagram.com/reel/DOOzvMEgA8D/?igsh=ZTFvd3Z0cGdtd3U4',
  },
  {
    title: 'Event Coverage',
    brand: '@EigenLayer',
    views: '10k views',
    src: 'https://www.instagram.com/reel/DK_6ljXNl0I/embed',
    link: 'https://www.instagram.com/reel/DK_6ljXNl0I/?igsh=MXh3bDZyajhqb2toNQ==',
    containFrame: true,
  },
  {
    title: 'Community Event',
    brand: '@Bluedot',
    views: '28k views',
    src: 'https://www.instagram.com/reel/DZcbH9TJ9WY/embed',
    link: 'https://www.instagram.com/reel/DZcbH9TJ9WY/?igsh=bXNsbHIxeWVvY25v',
  },
];

function GhostSectionTitle({
  text,
  align = 'left',
  style,
}: {
  text: string;
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
}) {
  const titleStyle: React.CSSProperties = {
    fontFamily: '"Space Grotesk", "Inter", sans-serif',
    fontWeight: 700,
    fontSize: 'clamp(2.6rem, 8.8vw, 9rem)',
    lineHeight: 0.9,
    letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.95)',
    textAlign: align,
    textShadow: '0 0 58px rgba(255,255,255,0.22), 0 0 116px rgba(255,255,255,0.1)',
  };

  return (
    <div className="relative" style={{ width: '100%', ...style }}>
      <h2
        aria-hidden="true"
        className="showcase-heading absolute tracking-wider select-none"
        style={{
          ...titleStyle,
          inset: 0,
          color: 'rgba(255,255,255,0.7)',
          filter: 'blur(18px)',
        }}
      >
        {text}
      </h2>
      <h2 className="showcase-heading tracking-wider select-none" style={titleStyle}>
        {text}
      </h2>
    </div>
  );
}

function AudienceBar({ metric }: { metric: AudienceMetric }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline' }}>
        <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.86rem' }}>{metric.label}</span>
        <span style={{ color: 'rgba(255,255,255,0.86)', fontSize: '0.8rem', fontWeight: 700 }}>{metric.display}</span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.13)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(metric.value, 100)}%`,
            height: '100%',
            borderRadius: 999,
            background: metric.color ?? 'linear-gradient(90deg, #f02fe8, #b44cff)',
            boxShadow: '0 0 18px rgba(240,47,232,0.32)',
          }}
        />
      </div>
    </div>
  );
}

function ClientLogoTile({ logo }: { logo: ClientLogo }) {
  return (
    <div
      style={{
        flex: '0 0 auto',
        height: 'clamp(70px, 9vw, 112px)',
        width: 'clamp(145px, 15vw, 230px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 clamp(10px, 1.5vw, 20px)',
      }}
    >
      <img
        src={logo.src}
        alt={`${logo.name} logo`}
        loading="lazy"
        style={{
          height: '100%',
          width: '100%',
          maxWidth: '100%',
          objectFit: 'contain',
          display: 'block',
          filter: 'drop-shadow(0 0 18px rgba(240,47,232,0.16))',
        }}
      />
    </div>
  );
}

function PhoneShowcase({ work }: { work: ShowcaseWork }) {
  const iframeStyle: React.CSSProperties = work.containFrame
    ? {
        position: 'absolute',
        left: 0,
        top: '50%',
        width: '100%',
        height: '87%',
        transform: 'translateY(-50%)',
        border: 0,
        background: '#000',
        display: 'block',
      }
    : {
        width: '100%',
        height: '100%',
        border: 0,
        background: '#000',
        display: 'block',
      };

  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 18 }}>
      <a
        href={work.link}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${work.title} ${work.brand} on Instagram`}
        style={{
          position: 'relative',
          width: 'min(100%, clamp(210px, 18vw, 255px))',
          aspectRatio: '9 / 18.4',
          borderRadius: 38,
          padding: 8,
          background: 'linear-gradient(145deg, #f7f7ff 0%, #7b7d88 14%, #0a0b10 38%, #020205 62%, #d7d9e2 100%)',
          boxShadow: '0 0 42px rgba(124,60,255,0.18), 0 20px 70px rgba(0,0,0,0.62), inset 0 0 12px rgba(255,255,255,0.38)',
          display: 'block',
          textDecoration: 'none',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: -3,
            top: '26%',
            width: 3,
            height: 54,
            borderRadius: '6px 0 0 6px',
            background: 'linear-gradient(180deg, #e6e8ee, #3a3c46)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            right: -3,
            top: '34%',
            width: 3,
            height: 72,
            borderRadius: '0 6px 6px 0',
            background: 'linear-gradient(180deg, #e6e8ee, #3a3c46)',
          }}
        />

        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 31,
            overflow: 'hidden',
            background: '#050507',
            border: '1px solid rgba(255,255,255,0.16)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '35%',
              height: 18,
              borderRadius: 999,
              background: '#020204',
              zIndex: 3,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          />

          <iframe
            src={work.src}
            title={`${work.title} ${work.brand}`}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            style={iframeStyle}
          />
        </div>
      </a>

      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            fontSize: 'clamp(1rem, 1.6vw, 1.35rem)',
            lineHeight: 1.15,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 6,
          }}
        >
          {work.title},<br />{work.brand}
        </p>
        <p style={{ fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)' }}>
          {work.views}
        </p>
      </div>
    </div>
  );
}

function FrameStoryShowcase({ stories, label }: { stories: ShowcaseWork[]; label: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const activeStory = stories[activeIndex];

  const goToStory = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex(index => (index + 1) % stories.length);
    setViewerIndex(index => index == null ? index : (index + 1) % stories.length);
  }, [stories.length]);

  const goPrevious = useCallback(() => {
    setActiveIndex(index => (index - 1 + stories.length) % stories.length);
    setViewerIndex(index => index == null ? index : (index - 1 + stories.length) % stories.length);
  }, [stories.length]);

  useEffect(() => {
    if (isPaused) return undefined;
    const timeout = window.setTimeout(goNext, 6500);
    return () => window.clearTimeout(timeout);
  }, [activeIndex, goNext, isPaused]);

  return (
    <div
      className="frame-story-shell"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'ArrowRight') goNext();
        if (event.key === 'ArrowLeft') goPrevious();
        if (event.key === 'Escape') setViewerIndex(null);
        if (event.key === ' ') setIsPaused(paused => !paused);
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="frame-story-stage" aria-label={`${label} story cards`}>
        {stories.map((story, index) => (
          <button
            key={`${story.brand}-${story.title}-card`}
            type="button"
            className={`frame-story-card ${index === activeIndex ? 'is-active' : ''}`}
            onMouseEnter={() => goToStory(index)}
            onFocus={() => goToStory(index)}
            onClick={() => {
              goToStory(index);
              setViewerIndex(index);
            }}
          >
            <iframe
              src={story.src}
              title={`${story.title} ${story.brand}`}
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              className="frame-story-iframe"
            />

            <div className="frame-story-description">
              <p>{story.title}</p>
              <span>{story.views}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="frame-story-caption">
        <p className="frame-story-kicker">{label}</p>
        <h3>{activeStory.brand}</h3>
        <p>{activeStory.title} · {activeStory.views}</p>
      </div>

      {viewerIndex !== null && (
        <div
          className="frame-story-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${stories[viewerIndex].brand} fullscreen story`}
          tabIndex={-1}
          onKeyDown={event => {
            if (event.key === 'Escape') setViewerIndex(null);
            if (event.key === 'ArrowRight') goNext();
            if (event.key === 'ArrowLeft') goPrevious();
          }}
        >
          <button
            type="button"
            className="frame-story-modal-close"
            aria-label="Close story"
            onClick={() => setViewerIndex(null)}
          >
            ×
          </button>
          <button
            type="button"
            aria-label="Previous story"
            className="frame-story-modal-nav frame-story-modal-prev"
            onClick={goPrevious}
          >
            ‹
          </button>
          <div className="frame-story-modal-card">
            <iframe
              key={stories[viewerIndex].src}
              src={stories[viewerIndex].src}
              title={`${stories[viewerIndex].title} ${stories[viewerIndex].brand}`}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              className="frame-story-modal-iframe"
            />
            <div className="frame-story-description">
              <p>{stories[viewerIndex].title}</p>
              <span>{stories[viewerIndex].views}</span>
              <a href={stories[viewerIndex].link} target="_blank" rel="noreferrer">
                open reel ↗
              </a>
            </div>
          </div>
          <button
            type="button"
            aria-label="Next story"
            className="frame-story-modal-nav frame-story-modal-next"
            onClick={goNext}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export function PostureLanding() {
  const [mousePosition, setMousePosition] = useState({ x: -9999, y: -9999 });
  const [torchPosition, setTorchPosition] = useState({ x: -9999, y: -9999 });
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
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setTorchPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

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
  const TRAIL_RADIUS = 2.6 * CM_TO_PX;

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

  const primaryGeo = [
    'US: 38%',
    'Thailand: 9.7%',
    'India: 4%',
    'Canada: 4.3%',
    'Europe: 3.4% (Germany, UK, Netherlands, Nordics)',
    'LATAM: 2.8%',
  ];

  const interests = ['AI tools', 'Startups & SaaS', 'Developers', 'Tech', 'Coding'];

  const topCountries: AudienceMetric[] = [
    { label: 'United States', value: 38.8, display: '38.8%' },
    { label: 'Thailand', value: 9.7, display: '9.7%' },
    { label: 'Canada', value: 4.3, display: '4.3%' },
    { label: 'India', value: 4, display: '4.0%' },
    { label: 'Germany', value: 3.4, display: '3.4%' },
  ];

  const ageRanges: AudienceMetric[] = [
    { label: '18-24', value: 59.6, display: '59.6%' },
    { label: '25-34', value: 28, display: '28.0%' },
    { label: '35-44', value: 6.7, display: '6.7%' },
    { label: '45-54', value: 2.7, display: '2.7%' },
  ];

  const genderSplit: AudienceMetric[] = [
    { label: 'Men', value: 67.3, display: '67.3%' },
    { label: 'Women', value: 32.7, display: '32.7%', color: 'linear-gradient(90deg, #7c3cff, #9b63ff)' },
  ];

  const panelStyle: React.CSSProperties = {
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(4,7,13,0.54)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    padding: 24,
  };

  return (
    <main className="w-full bg-black text-white">
      <style>
        {`
          .audience-mobile-stack {
            min-height: 100vh;
          }

          .audience-globe-layout {
            display: grid;
            grid-template-columns: minmax(220px, 0.7fr) minmax(360px, 1.6fr);
            align-items: center;
            gap: clamp(28px, 5vw, 84px);
          }

          .audience-globe-frame {
            height: min(58vh, 560px);
            min-height: 360px;
          }

          .audience-country-grid {
            display: grid;
            gap: 14px;
          }

          .audience-map-caption {
            max-width: min(410px, 48%);
            line-height: 1.7;
          }

          .frame-story-shell {
            width: min(100%, 1280px);
            margin: 0 auto;
            display: grid;
            gap: clamp(10px, 1.8vw, 22px);
            outline: none;
          }

          .frame-story-stage {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: clamp(10px, 1.4vw, 20px);
            min-height: clamp(500px, 60vh, 720px);
            overflow: visible;
            perspective: 1400px;
          }

          .frame-story-kicker,
          .frame-story-description span,
          .frame-story-description a {
            font-family: "Space Grotesk", "Inter", sans-serif;
            font-size: 0.56rem;
            line-height: 1.5;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }

          .frame-story-caption {
            display: flex;
            align-items: baseline;
            justify-content: center;
            gap: 14px;
            min-height: 34px;
            text-align: center;
          }

          .frame-story-caption h3 {
            margin: 0;
            font-size: clamp(1.1rem, 2.2vw, 2rem);
            line-height: 0.95;
            font-weight: 700;
            letter-spacing: 0.02em;
            color: rgba(255,255,255,0.94);
            text-shadow: 0 0 48px rgba(255,255,255,0.16);
          }

          .frame-story-caption p {
            margin: 0;
            color: rgba(255,255,255,0.44);
          }

          .frame-story-kicker {
            color: rgba(255,255,255,0.38) !important;
          }

          .frame-story-card {
            position: relative;
            width: clamp(190px, 20vw, 310px);
            aspect-ratio: 9 / 16;
            flex: 0 0 auto;
            overflow: hidden;
            justify-self: center;
            border-radius: 28px;
            background: #030305;
            border: 1px solid rgba(255,255,255,0.14);
            box-shadow:
              0 0 44px rgba(255,255,255,0.06),
              0 20px 70px rgba(0,0,0,0.68),
              inset 0 1px 0 rgba(255,255,255,0.16);
            transform: scale(0.92);
            opacity: 0.58;
            cursor: pointer;
            appearance: none;
            padding: 0;
            transition:
              transform 320ms cubic-bezier(0.22, 1, 0.36, 1),
              opacity 220ms ease,
              border-color 220ms ease,
              box-shadow 320ms ease;
          }

          .frame-story-card.is-active {
            transform: scale(1.08);
            opacity: 1;
            border-color: rgba(255,255,255,0.36);
            box-shadow:
              0 0 86px rgba(255,255,255,0.12),
              0 34px 100px rgba(0,0,0,0.78),
              inset 0 1px 0 rgba(255,255,255,0.2);
            z-index: 2;
          }

          .frame-story-card::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            background:
              linear-gradient(180deg, rgba(0,0,0,0.68), transparent 24%, transparent 62%, rgba(0,0,0,0.84)),
              radial-gradient(circle at 50% 0%, rgba(255,255,255,0.14), transparent 36%);
            z-index: 2;
          }

          .frame-story-iframe {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border: 0;
            background: #000;
            pointer-events: none;
          }

          .frame-story-description p {
            margin: 0;
            font-weight: 700;
            line-height: 1;
          }

          .frame-story-hotspot {
            display: none;
          }

          .frame-story-hotspot-left {
            left: 0;
          }

          .frame-story-hotspot-right {
            right: 0;
          }

          .frame-story-description {
            position: absolute;
            z-index: 6;
            left: 16px;
            right: 16px;
            bottom: 16px;
            display: grid;
            gap: 8px;
            color: rgba(255,255,255,0.92);
          }

          .frame-story-description span {
            color: rgba(255,255,255,0.48);
          }

          .frame-story-description a {
            width: fit-content;
            color: rgba(255,255,255,0.76);
            text-decoration: none;
            border-bottom: 1px solid rgba(255,255,255,0.26);
            pointer-events: auto;
          }

          .frame-story-modal {
            position: fixed;
            inset: 0;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: clamp(12px, 3vw, 34px);
            padding: 26px;
            background:
              radial-gradient(circle at 50% 50%, rgba(124,60,255,0.18), transparent 36%),
              rgba(0,0,0,0.9);
            backdrop-filter: blur(20px);
          }

          .frame-story-modal-card {
            position: relative;
            width: min(92vw, 480px);
            height: min(88vh, 860px);
            overflow: hidden;
            border-radius: 34px;
            background: #030305;
            border: 1px solid rgba(255,255,255,0.22);
            box-shadow: 0 0 120px rgba(255,255,255,0.12), 0 28px 100px rgba(0,0,0,0.85);
          }

          .frame-story-modal-card::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            background:
              linear-gradient(180deg, rgba(0,0,0,0.72), transparent 24%, transparent 62%, rgba(0,0,0,0.86));
            z-index: 2;
          }

          .frame-story-modal-iframe {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border: 0;
            background: #000;
          }

          .frame-story-modal-close,
          .frame-story-modal-nav {
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 999px;
            background: rgba(255,255,255,0.08);
            color: rgba(255,255,255,0.86);
            cursor: pointer;
            backdrop-filter: blur(10px);
          }

          .frame-story-modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 102;
            width: 42px;
            height: 42px;
            font-size: 1.6rem;
            line-height: 1;
          }

          .frame-story-modal-nav {
            width: 46px;
            height: 46px;
            font-size: 2rem;
            line-height: 1;
            z-index: 101;
          }

          @media (max-width: 900px) {
            .audience-globe-layout {
              grid-template-columns: 1fr;
              gap: 28px;
            }

            .audience-globe-frame {
              height: 360px;
              min-height: 280px;
            }

            .audience-topline {
              display: grid !important;
              gap: 16px;
            }

            .audience-topline p {
              text-align: left !important;
            }

            .frame-story-shell {
              gap: 24px;
            }

            .frame-story-stage {
              display: grid;
              grid-template-columns: repeat(4, minmax(150px, 1fr));
              overflow-x: auto;
              overflow-y: visible;
              padding: 18px 10px;
              scroll-snap-type: x mandatory;
              min-height: 390px;
            }

            .frame-story-card {
              width: 100%;
              height: auto;
              scroll-snap-align: center;
            }

            .frame-story-card.is-active {
              transform: scale(1.06);
            }

            .frame-story-caption {
              flex-direction: column;
              align-items: center;
              gap: 6px;
            }

            .frame-story-modal {
              gap: 10px;
              padding: 16px;
            }

            .frame-story-modal-nav {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
            }

            .frame-story-modal-prev {
              left: 14px;
            }

            .frame-story-modal-next {
              right: 14px;
            }
          }

          @media (max-width: 767px) {
            .audience-mobile-stack {
              display: grid;
              gap: 24px;
              min-height: auto;
              padding: 28px 24px 36px;
            }

            .audience-mobile-block,
            .audience-mobile-title {
              position: relative !important;
              inset: auto !important;
              top: auto !important;
              right: auto !important;
              bottom: auto !important;
              left: auto !important;
              transform: none !important;
              width: 100% !important;
              max-width: none !important;
              text-align: left !important;
            }

            .audience-mobile-title {
              min-height: 38vh;
              display: flex !important;
              align-items: center;
              justify-content: center;
              order: -1;
            }

            .audience-mobile-title h2 {
              font-size: clamp(2.2rem, 13vw, 4rem) !important;
              letter-spacing: 0.06em !important;
            }

            .audience-mobile-block p,
            .audience-mobile-block span {
              text-align: left !important;
            }

            .showcase-phone-grid {
              grid-template-columns: 1fr !important;
              justify-items: center;
            }

            .showcase-heading {
              font-size: clamp(2.35rem, 14vw, 4.6rem) !important;
              letter-spacing: 0.06em !important;
            }

            .audience-globe-frame {
              height: 320px;
              min-height: 260px;
            }
          }

          .shiny-title {
            color: transparent !important;
            background:
              linear-gradient(
                105deg,
                rgba(255,255,255,0.98) 0%,
                rgba(198,206,218,0.94) 18%,
                rgba(255,255,255,1) 36%,
                rgba(255,255,255,1) 50%,
                rgba(176,185,200,0.96) 68%,
                rgba(255,255,255,0.9) 100%
              );
            background-size: 220% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            text-shadow:
              0 0 26px rgba(255,255,255,0.26),
              0 0 72px rgba(255,255,255,0.18),
              0 0 130px rgba(255,255,255,0.1);
            animation: titleShine 6s linear infinite;
          }

          .shiny-footer-word {
            color: transparent !important;
            background:
              linear-gradient(
                105deg,
                rgba(255,255,255,0.94),
                rgba(255,255,255,1),
                rgba(196,204,216,0.92),
                rgba(255,255,255,0.96)
              );
            background-size: 220% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            text-shadow: 0 0 18px rgba(255,255,255,0.3);
            animation: titleShine 6s linear infinite;
          }

          .contact-script {
            font-family: "Brush Script MT", "Snell Roundhand", "Apple Chancery", cursive;
            color: rgba(255,255,255,0.86);
            font-size: clamp(2.2rem, 6.4vw, 6.8rem);
            font-weight: 200;
            letter-spacing: -0.06em;
            line-height: 0.88;
            text-shadow:
              0 0 8px rgba(255,255,255,0.52),
              0 0 24px rgba(255,255,255,0.24);
            transform: rotate(-3deg);
          }

          .email-button {
            border: 1px solid rgba(255,255,255,0.84);
            border-radius: 999px;
            color: rgba(255,255,255,0.92);
            background: rgba(255,255,255,0.035);
            box-shadow:
              inset 0 0 0 1px rgba(255,255,255,0.12),
              0 0 28px rgba(255,255,255,0.12);
            transition:
              background 220ms ease,
              box-shadow 220ms ease,
              transform 220ms ease;
          }

          .email-button:hover {
            background: rgba(255,255,255,0.1);
            box-shadow:
              inset 0 0 0 1px rgba(255,255,255,0.18),
              0 0 34px rgba(255,255,255,0.24),
              0 0 80px rgba(240,47,232,0.22);
            transform: translateY(-2px);
          }

          .hero-social-icon {
            width: 34px;
            height: 34px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255,255,255,0.42);
            border-radius: 999px;
            color: rgba(255,255,255,0.88);
            background: rgba(255,255,255,0.045);
            text-decoration: none;
            font-family: "Space Grotesk", "Inter", sans-serif;
            font-size: 0.58rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            box-shadow:
              inset 0 0 0 1px rgba(255,255,255,0.08),
              0 0 26px rgba(255,255,255,0.08);
            backdrop-filter: blur(10px);
            transition:
              background 180ms ease,
              border-color 180ms ease,
              box-shadow 180ms ease,
              transform 180ms ease;
          }

          .hero-social-icon:hover {
            transform: translateY(-2px);
            border-color: rgba(255,255,255,0.78);
            background: rgba(255,255,255,0.12);
            box-shadow:
              inset 0 0 0 1px rgba(255,255,255,0.12),
              0 0 30px rgba(255,255,255,0.2);
          }

          @keyframes titleShine {
            from { background-position: 0% 50%; }
            to { background-position: 220% 50%; }
          }

          @media (prefers-reduced-motion: reduce) {
            .shiny-title,
            .shiny-footer-word {
              animation: none;
            }
          }
        `}
      </style>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 90px at ${torchPosition.x}px ${torchPosition.y}px,
            transparent 0%,
            rgba(0,0,0,0.18) 50%,
            rgba(0,0,0,0.52) 100%)`,
          zIndex: 20,
        }}
      />
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
            <feGaussianBlur stdDeviation="7" />
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

      {/* Base image */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <ImageWithFallback
          src={baseImage}
          alt="Girl base"
          className="w-full h-full object-cover"
          style={{ objectPosition: '50% 0%' }}
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
          style={{
            objectPosition: '50% 0%',
            transform: 'translate3d(-0.9vw, -0.42vw, 0)',
            willChange: 'transform',
          }}
        />
      </div>

      {/* ── TYPOGRAPHY LAYER ── */}

      {/* TOP LEFT — small label */}
      <div
        className="absolute pointer-events-none"
        style={{ top: 28, left: 32, zIndex: 40 }}
      >
        <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.38)', fontSize: '0.58rem' }}>
          Craft tech content that<br />turns complex into<br />engaging
        </p>
      </div>

      {/* TOP RIGHT — work with me link */}
      <div
        className="absolute pointer-events-auto"
        style={{ top: 24, right: 32, zIndex: 40 }}
      >
        <a
          href="#contact"
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
          Work with me ↗
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
          Content signal online +91.4%
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
            Tech storytelling<br />system active
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
            letterSpacing: '0',
          }}
        >
          Hello, I&apos;m Vlada
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
          Tech creator and strategist who uses a<br />
          software developer background to help<br />
          brands grow their presence online.
        </p>
        <a
          href="#contact"
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
            display: 'inline-block',
            textDecoration: 'none',
          }}
        >
          Build the system
        </a>
      </div>

      {/* BOTTOM RIGHT — social links */}
      <div
        className="absolute pointer-events-auto"
        style={{ bottom: 44, right: 32, zIndex: 40, textAlign: 'right' }}
      >
        <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.58)', marginBottom: 12 }}>
          Socials
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          {socialLinks.map(social => (
            <a
              key={social.label}
              className="hero-social-icon"
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.ariaLabel}
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── PORTFOLIO HERO TEXT ── */}
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
            fontSize: 'clamp(2.7rem, 10vw, 10rem)',
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.1em',
            filter: 'blur(22px)',
          }}
        >
          PORTFOLIO
        </h1>

        {/* Sharp layer */}
        <h1
          className="tracking-wider select-none"
          style={{
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            fontWeight: 800,
            fontSize: 'clamp(2.7rem, 10vw, 10rem)',
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '0.1em',
            textShadow: '0 0 60px rgba(255,255,255,0.25), 0 0 120px rgba(255,255,255,0.12)',
            filter: `blur(${textBlur}px)`,
          }}
        >
          PORTFOLIO
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
          ·─────·  ◈  VLADA.TECH  ◈  ·─────·
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

      <section
        className="relative min-h-screen overflow-hidden bg-black"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontFamily: '"Space Grotesk", "Inter", sans-serif',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 66% 42%, rgba(255,255,255,0.12), transparent 32%), radial-gradient(circle at 18% 76%, rgba(124,60,255,0.14), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.035), transparent 42%)',
          }}
        />

        <div
          className="audience-mobile-stack relative z-40 flex min-h-screen flex-col gap-8 px-8 py-10"
          style={{ color: 'rgba(255,255,255,0.94)' }}
        >
          <div className="audience-topline flex items-start justify-between gap-6">
            <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.42)' }}>
              Globe morph<br />country density
            </p>
            <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.58)', textAlign: 'right' }}>
              Actual audience data<br />top geographies
            </p>
          </div>

          <GhostSectionTitle text="AUDIENCE" style={{ maxWidth: 900 }} />

          <div className="audience-globe-layout" style={{ flex: 1 }}>
            <div style={{ display: 'grid', gap: 26 }}>
              <div>
                <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.68)', marginBottom: 18 }}>
                  Top countries
                </p>
                <div className="audience-country-grid">
                  {topCountries.map((metric, index) => (
                    <div
                      key={metric.label}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '32px 1fr auto',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <span style={{ ...labelStyle, color: 'rgba(255,255,255,0.26)', fontSize: '0.52rem' }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: 'clamp(0.98rem, 1.7vw, 1.42rem)', lineHeight: 1 }}>
                        {metric.label}
                      </span>
                      <span style={{ ...labelStyle, color: 'rgba(255,255,255,0.72)', fontSize: '0.58rem' }}>
                        {metric.display}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.68)' }}>
                  Primary geo
                </p>
                {primaryGeo.map(item => (
                  <p
                    key={item}
                    style={{
                      ...labelStyle,
                      color: 'rgba(255,255,255,0.38)',
                      fontSize: '0.54rem',
                      letterSpacing: '0.13em',
                    }}
                  >
                    <span style={{ ...dotStyle, width: 4, height: 4, marginRight: 8 }} />
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div
              className="audience-globe-frame"
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: '#0a0a0a',
                boxShadow: '0 0 90px rgba(255,255,255,0.08)',
              }}
            >
              <GlobeMorph
                hex="#ffffff"
                ocean="#000000"
                bg="#000000"
                landOpacity={1}
                globeOpacity={0.5}
                density={500}
              />
              <div
                className="audience-map-caption pointer-events-none absolute left-5 top-5"
                style={{ ...labelStyle, color: 'rgba(255,255,255,0.3)', fontSize: '0.5rem' }}
              >
                United States 38.8% / Thailand 9.7% / Canada 4.3% / India 4.0% / Germany 3.4% / Ukraine
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.5rem',
                letterSpacing: '0.3em',
                color: 'rgba(255,255,255,0.18)',
              }}
            >
              ·─────·  ◈  CONTENT.SYSTEM  ◈  ·─────·
            </span>
          </div>
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-black"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontFamily: '"Space Grotesk", "Inter", sans-serif',
          minHeight: 'clamp(260px, 36vh, 420px)',
        }}
      >
        <style>
          {`
            @keyframes clientMarquee {
              from { transform: translateX(0); }
              to { transform: translateX(-33.333%); }
            }

          `}
        </style>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 24% 22%, rgba(240,47,232,0.16), transparent 32%), radial-gradient(circle at 72% 72%, rgba(118,74,255,0.13), transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.04), transparent 44%)',
          }}
        />

        <div
          className="relative z-40 flex flex-col justify-center gap-9 px-0 py-14 sm:py-16"
          style={{ color: 'rgba(255,255,255,0.94)' }}
        >
          <div style={{ overflow: 'hidden', width: '100%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                width: 'max-content',
                animation: 'clientMarquee 28s linear infinite',
              }}
            >
              {[...clientLogos, ...clientLogos, ...clientLogos].map((logo, index) => (
                <ClientLogoTile key={`${logo.name}-${index}`} logo={logo} />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.5rem',
                letterSpacing: '0.3em',
                color: 'rgba(255,255,255,0.18)',
              }}
            >
              ─────·  ◈  <span className="shiny-footer-word">CLIENTS</span>◈  ·─────·
            </span>
          </div>
        </div>
      </section>

      <section
        className="relative min-h-screen overflow-hidden bg-black"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontFamily: '"Space Grotesk", "Inter", sans-serif',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 18%, rgba(240,47,232,0.2), transparent 34%), radial-gradient(circle at 72% 72%, rgba(124,60,255,0.2), transparent 36%), linear-gradient(180deg, rgba(14,4,28,0.96), #000 52%, #000 100%)',
          }}
        />

        <div
          className="relative z-40 flex min-h-screen flex-col justify-between gap-10 px-8 py-10"
          style={{ color: 'rgba(255,255,255,0.94)' }}
        >
          <div className="flex items-start justify-between gap-6">
            <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.42)' }}>
              Reel performance<br />software + AI campaigns
            </p>
            <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.58)', textAlign: 'right' }}>
              tap any story to open
            </p>
          </div>

          <div>
            <GhostSectionTitle text="TECH + AI" style={{ maxWidth: 1080 }} />
          </div>

          <FrameStoryShowcase stories={showcaseWorks} label="software + AI campaigns" />

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.5rem',
                letterSpacing: '0.3em',
                color: 'rgba(255,255,255,0.18)',
              }}
            >
              ·─────·  ◈  REEL.PROOF  ◈  ·─────·
            </span>
          </div>
        </div>
      </section>

      <section
        className="relative min-h-screen overflow-hidden bg-black"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontFamily: '"Space Grotesk", "Inter", sans-serif',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 46% 18%, rgba(240,47,232,0.18), transparent 34%), radial-gradient(circle at 18% 72%, rgba(124,60,255,0.18), transparent 34%), linear-gradient(180deg, rgba(18,5,32,0.96), #000 54%, #000 100%)',
          }}
        />

        <div
          className="relative z-40 flex min-h-screen flex-col justify-between gap-10 px-8 py-10"
          style={{ color: 'rgba(255,255,255,0.94)' }}
        >
          <div className="flex items-start justify-between gap-6">
            <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.42)' }}>
              Reel performance<br />finance + fintech systems
            </p>
            <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.58)', textAlign: 'right' }}>
              tap any story to open
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <GhostSectionTitle text="FINANCE" align="right" style={{ maxWidth: 960 }} />
          </div>

          <FrameStoryShowcase stories={financeWorks} label="finance + fintech systems" />

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.5rem',
                letterSpacing: '0.3em',
                color: 'rgba(255,255,255,0.18)',
              }}
            >
              ·─────·  ◈  FINANCE.PROOF  ◈  ·─────·
            </span>
          </div>
        </div>
      </section>

      <section
        className="relative min-h-screen overflow-hidden bg-black"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontFamily: '"Space Grotesk", "Inter", sans-serif',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 54% 18%, rgba(255,255,255,0.16), transparent 32%), radial-gradient(circle at 76% 76%, rgba(240,47,232,0.14), transparent 34%), radial-gradient(circle at 18% 66%, rgba(124,60,255,0.16), transparent 34%), linear-gradient(180deg, rgba(16,5,34,0.96), #000 54%, #000 100%)',
          }}
        />

        <div
          className="relative z-40 flex min-h-screen flex-col justify-between gap-10 px-8 py-10"
          style={{ color: 'rgba(255,255,255,0.94)' }}
        >
          <div className="flex items-start justify-between gap-6">
            <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.42)' }}>
              Reel performance<br />events + live activations
            </p>
            <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.58)', textAlign: 'right' }}>
              tap any story to open
            </p>
          </div>

          <div>
            <GhostSectionTitle text="EVENTS" style={{ maxWidth: 960 }} />
          </div>

          <FrameStoryShowcase stories={eventsWorks} label="events + live activations" />

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: '0.5rem',
                letterSpacing: '0.3em',
                color: 'rgba(255,255,255,0.18)',
              }}
            >
              ·─────·  ◈  EVENTS.PROOF  ◈  ·─────·
            </span>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="contact-puzzle-section relative min-h-screen overflow-hidden"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontFamily: '"Space Grotesk", "Inter", sans-serif',
          backgroundImage: `linear-gradient(180deg, rgba(124,60,255,0.06), rgba(0,0,0,0.08)), url(${contactPuzzlesImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.06), transparent 30%, transparent 66%, rgba(0,0,0,0.12))',
          }}
        />

        <div
          className="absolute left-1/2 z-40 w-full -translate-x-1/2 px-6 text-center"
          style={{
            top: 'clamp(70px, 16vh, 160px)',
            color: 'rgba(255,255,255,0.94)',
          }}
        >
          <GhostSectionTitle text="LET'S WORK" align="center" style={{ margin: '0 auto', maxWidth: 1120 }} />
        </div>

        <div
          className="absolute left-1/2 z-40 flex -translate-x-1/2 flex-col items-center px-6 text-center"
          style={{
            top: '68%',
            color: 'rgba(255,255,255,0.94)',
          }}
        >
          <a
            className="email-button inline-flex h-10 items-center justify-center px-10 text-[0.58rem] uppercase tracking-[0.42em] sm:h-11 sm:px-12"
            href="https://mail.google.com/mail/?view=cm&fs=1&to=hello.vladasana@gmail.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Email Vlada at hello.vladasana@gmail.com"
          >
            email me
          </a>
        </div>
      </section>
    </main>
  );
}
