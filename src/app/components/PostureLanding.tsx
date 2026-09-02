import { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import baseImage from '../../imports/ChatGPT_Image_Jun_18__2026__12_33_46_PM.png';
import helmetImage from '../../imports/ChatGPT_Image_Jun_18__2026__12_41_58_PM.png';
import contactPuzzlesImage from '../../imports/contact-puzzles.png';
import gitGuideHtml from '../../content/git-guide.html?raw';
import gitGuideStyles from '../../../public/blog-assets/git-guide/styles.css?raw';
import gitGuideScript from '../../../public/blog-assets/git-guide/script.js?raw';
import apiGuideHtml from '../../content/api-guide.html?raw';
import apiGuideStyles from '../../../public/blog-assets/api-guide/styles.css?raw';
import apiGuideScript from '../../../public/blog-assets/api-guide/script.js?raw';
import databaseGuideHtml from '../../content/database-guide.html?raw';
import databaseGuideStyles from '../../../public/blog-assets/database-guide/styles.css?raw';
import databaseGuideScript from '../../../public/blog-assets/database-guide/script.js?raw';
import dockerGuideHtml from '../../content/docker-guide.html?raw';
import dockerGuideStyles from '../../../public/blog-assets/docker-guide/styles.css?raw';
import dockerGuideScript from '../../../public/blog-assets/docker-guide/script.js?raw';
import harnessGuideHtml from '../../content/harness-guide.html?raw';
import harnessGuideStyles from '../../../public/blog-assets/harness-guide/styles.css?raw';
import harnessGuideScript from '../../../public/blog-assets/harness-guide/script.js?raw';
import reactRoadmapGuideHtml from '../../content/react-roadmap-guide.html?raw';
import reactRoadmapGuideStyles from '../../../public/blog-assets/react-roadmap-guide/styles.css?raw';
import reactRoadmapGuideScript from '../../../public/blog-assets/react-roadmap-guide/script.js?raw';
import topClaudeSkillsGuideHtml from '../../content/top-claude-skills-guide.html?raw';
import topClaudeSkillsGuideStyles from '../../../public/blog-assets/top-claude-skills-guide/styles.css?raw';
import topClaudeSkillsGuideScript from '../../../public/blog-assets/top-claude-skills-guide/script.js?raw';
import landJobGuideHtml from '../../content/land-a-job-2026-guide.html?raw';
import landJobGuideStyles from '../../../public/blog-assets/land-a-job-2026-guide/styles.css?raw';
import landJobGuideScript from '../../../public/blog-assets/land-a-job-2026-guide/script.js?raw';
import reviewingAiCodeGuideHtml from '../../content/reviewing-ai-code-guide.html?raw';
import reviewingAiCodeGuideStyles from '../../../public/blog-assets/reviewing-ai-code-guide/styles.css?raw';
import reviewingAiCodeGuideScript from '../../../public/blog-assets/reviewing-ai-code-guide/script.js?raw';
import behavioralGuideHtml from '../../content/behavioral-interviews-guide.html?raw';
import behavioralGuideStyles from '../../../public/blog-assets/behavioral-interviews-guide/styles.css?raw';
import behavioralGuideScript from '../../../public/blog-assets/behavioral-interviews-guide/script.js?raw';

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface ClientLogo {
  name: string;
  src: string;
  fit?: 'contain' | 'cover';
  scale?: number;
  position?: string;
  inset?: string;
  tileBackground?: string;
  overlayOpacity?: number;
  filter?: string;
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
  iframeRef?: React.RefObject<HTMLIFrameElement>;
  onLoad?: () => void;
}

const GLOBE_URL = '/globe-morph.html';
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
        ref={props.iframeRef}
        src={src}
        title="Globe Morph"
        loading="lazy"
        onLoad={props.onLoad}
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
  { name: '4Geeks Academy', src: new URL('../../img/4geekacademy_logo.png', import.meta.url).href, fit: 'contain', scale: 1.2 },
  { name: 'Hostinger', src: new URL('../../img/Hostinger_logo.png', import.meta.url).href, fit: 'cover' },
  { name: 'Astraux', src: new URL('../../img/astraux)logo.webp', import.meta.url).href, fit: 'contain', scale: 1.22 },
  { name: 'DeepPocket', src: new URL('../../img/deeppocket_logo.png', import.meta.url).href, fit: 'cover' },
  { name: 'GameDev', src: new URL('../../img/gamedev_logo.jpg', import.meta.url).href, fit: 'cover', position: '50% 50%' },
  { name: 'HeyGen', src: new URL('../../img/heygen_logo_transparent.png', import.meta.url).href, fit: 'contain', scale: 0.9, inset: '12%', tileBackground: '#ffffff', overlayOpacity: 0, filter: 'none' },
  { name: 'HEADOUT', src: new URL('../../img/headout_logo.png', import.meta.url).href, fit: 'contain', scale: 1, inset: 0, tileBackground: '#7e00ff', overlayOpacity: 0, filter: 'none' },
  { name: 'IronHack', src: new URL('../../img/ironhack_logo.png', import.meta.url).href, fit: 'cover' },
  { name: 'Hinoter', src: new URL('../../img/hinoter_logo.png', import.meta.url).href, fit: 'cover' },
  { name: 'MiniMax', src: new URL('../../img/minimax_logo.png', import.meta.url).href, fit: 'contain', scale: 0.96, inset: '10%', tileBackground: '#ffffff', overlayOpacity: 0, filter: 'none' },
  { name: 'Higgsfield', src: new URL('../../img/higgsfield_logo.png', import.meta.url).href, fit: 'cover', tileBackground: '#d1fe17', overlayOpacity: 0, filter: 'none' },
  { name: 'Ledger', src: new URL('../../img/ledger_logo.png', import.meta.url).href, fit: 'contain', scale: 0.86, inset: '18%', tileBackground: '#000000', overlayOpacity: 0, filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.16))' },
  { name: 'Lovable', src: new URL('../../img/lovable_logo.png', import.meta.url).href, fit: 'contain', scale: 1.2 },
  { name: 'SheCodes', src: new URL('../../img/shecodes_logo_transparent.png', import.meta.url).href, fit: 'contain', scale: 1.04, inset: '13%', tileBackground: '#ffffff', overlayOpacity: 0, filter: 'none' },
  { name: 'Tangem', src: new URL('../../img/tangem.png', import.meta.url).href, fit: 'cover', position: '50% 50%' },
  { name: 'Verdent', src: new URL('../../img/verdent_logo.jpeg', import.meta.url).href, fit: 'cover', position: '50% 50%' },
  { name: 'Virtuals', src: new URL('../../img/virtuals_logo_transparent.png', import.meta.url).href, fit: 'contain', scale: 1.02, inset: '12%', tileBackground: '#dbf8e4', overlayOpacity: 0, filter: 'none' },
  { name: 'Bluedot', src: new URL('../../img/bluedot_logo_transparent.png', import.meta.url).href, fit: 'contain', scale: 1.04, inset: '11%', tileBackground: '#ffffff', overlayOpacity: 0, filter: 'none' },
];

const clientLogoRows = [
  clientLogos,
  [...clientLogos.slice(6), ...clientLogos.slice(0, 6)],
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
    title: 'Event Invitation',
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

const claudeMdUpdatedAt = 'August 3, 2026';
const lazymaxxingUpdatedAt = 'August 7, 2026';
const gitGuideUpdatedAt = 'August 10, 2026';
const apiGuideUpdatedAt = 'August 10, 2026';
const databaseGuideUpdatedAt = 'August 10, 2026';
const dockerGuideUpdatedAt = 'August 10, 2026';
const harnessGuideUpdatedAt = 'August 16, 2026';
const reactRoadmapGuideUpdatedAt = 'August 17, 2026';
const topClaudeSkillsGuideUpdatedAt = 'August 19, 2026';
const landJobGuideUpdatedAt = 'August 24, 2026';
const reviewingAiCodeGuideUpdatedAt = 'August 26, 2026';
const behavioralGuideUpdatedAt = 'September 1, 2026';
const embeddedGuidePaletteStyles = `
  :root {
    --bg: #3D3982;
    --bg-card: #d02e2e;
    --bg-code: rgba(0,0,0,0.18);
    --bg-tint: rgba(255,255,255,0.08);
    --bg-soft: rgba(255,255,255,0.1);
    --text: rgba(255,255,255,0.96);
    --text-muted: rgba(255,255,255,0.78);
    --text-soft: rgba(255,255,255,0.58);
    --rule: rgba(255,255,255,0.2);
    --rule-soft: rgba(255,255,255,0.14);
    --highlight: rgba(255,255,255,0.16);
    --accent: #ffffff;
    --accent-dark: #ffffff;
    --accent-soft: rgba(255,255,255,0.34);
    --link: #ffffff;
    --shadow: 0 24px 70px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.12);
  }

  html,
  body {
    background: #3D3982;
    color: var(--text);
    font-family: "Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    max-width: 100%;
    overflow-x: hidden;
  }

  .topbar {
    background: rgba(61,57,130,0.92);
    border-bottom: 1px solid rgba(255,255,255,0.16);
  }

  .topbar__inner,
  .page,
  .footer {
    max-width: 1040px;
    width: min(100% - 32px, 1040px);
  }

  .topbar__brand,
  .topbar__cta,
  .hero__byline a,
  strong,
  .toc__list a,
  .footer a {
    color: #ffffff;
  }

  .topbar__cta,
  .cta,
  .copybtn {
    background: #d02e2e;
    border: 1px solid rgba(255,255,255,0.22);
    border-radius: 999px;
    color: #ffffff;
  }

  .topbar__cta:hover,
  .cta:hover,
  .copybtn:hover {
    background: #bc2929;
  }

  .hero {
    padding-top: 64px;
  }

  .hero,
  .intro-block,
  .toc,
  .section,
  .takeaway,
  .closing,
  .footer {
    max-width: 760px;
    margin-left: auto;
    margin-right: auto;
  }

  .intro-block {
    width: 100%;
    padding-left: 0;
    padding-right: 0;
  }

  .hero__title,
  .toc__title,
  .need__title,
  .step__title,
  .closing__h {
    font-family: "Space Grotesk", "Inter", sans-serif;
    letter-spacing: 0.035em;
    color: #ffffff;
  }

  .hero__title {
    max-width: 11ch;
    font-size: clamp(3rem, 11vw, 8.8rem);
    line-height: 0.88;
  }

  .hero__title-accent,
  .eyebrow,
  .step__eyebrow,
  .need__num,
  .toc__num {
    color: rgba(255,255,255,0.74);
  }

  .hero__lede,
  .need__lede,
  .step__sub,
  p,
  li,
  .footer__consult,
  .footer__small {
    color: rgba(255,255,255,0.84);
  }

  .toc,
  .need,
  .step,
  .section,
  .closing,
  .footer,
  .callout,
  .need__card,
  .codeblock,
  .quickref,
  table {
    background: #d02e2e;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 18px;
    box-shadow: var(--shadow);
  }

  .toc,
  .need,
  .step,
  .section,
  .closing {
    padding: clamp(22px, 4vw, 42px);
    margin: 20px auto;
    width: 100%;
    max-width: 760px;
  }

  .need,
  .step,
  .section {
    border-top: 1px solid rgba(255,255,255,0.2);
  }

  .need__card,
  .callout,
  .callout--yellow,
  .callout--tip,
  .callout--blue,
  .codeblock,
  pre,
  table {
    background: rgba(0,0,0,0.16);
    border-color: rgba(255,255,255,0.2);
  }

  pre,
  code {
    color: rgba(255,255,255,0.94);
  }

  .codeblock,
  .tgrid {
    max-width: 100%;
    overflow-x: auto;
  }

  .step,
  .section,
  .need__card,
  .callout,
  .toc,
  .closing,
  .good-default {
    min-width: 0;
  }

  .codeblock__bar {
    background: rgba(0,0,0,0.18);
    border-bottom: 1px solid rgba(255,255,255,0.16);
  }

  .embedded-article-tag {
    display: inline-flex;
    width: fit-content;
    margin: 0 0 16px;
    padding: 0.38rem 0.66rem;
    border: 1px solid rgba(255,255,255,0.22);
    border-radius: 999px;
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.78);
    font-size: 0.62rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .toc__list,
  .section__body {
    max-width: 100%;
  }

  .takeaway {
    background: #d02e2e;
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow: var(--shadow);
  }

  .takeaway__eyebrow,
  .takeaway__h,
  .takeaway p,
  .takeaway strong,
  .takeaway code {
    color: #ffffff;
  }

  .takeaway__cell {
    background: rgba(0,0,0,0.16);
    border-color: rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.88);
  }

  .takeaway__grid[style] {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }

  .footer {
    text-align: center;
  }

  .footer__small {
    margin-left: auto;
    margin-right: auto;
  }

  .job-guide .page {
    max-width: 800px;
    width: min(100% - 32px, 800px);
  }

  .job-guide .hero {
    width: 100%;
    max-width: 800px;
  }

  .job-guide .steps {
    width: 100%;
    max-width: 800px;
  }

  .job-guide .hero__title {
    max-width: 100%;
    font-size: clamp(2.7rem, 8vw, 5.8rem);
  }

  .job-guide .footer--crea {
    width: 100%;
    max-width: 800px;
    background: #3D3982;
    padding: clamp(24px, 4vw, 34px);
    font-size: 16px;
    text-align: left;
  }

  .ai-code-guide .page {
    max-width: 860px;
    width: min(100% - 32px, 860px);
  }

  .ai-code-guide .hero,
  .ai-code-guide .intro-card,
  .ai-code-guide .checklist,
  .ai-code-guide .red-flags,
  .ai-code-guide .final-bar {
    width: 100%;
    max-width: 860px;
  }

  .ai-code-guide .hero__title {
    max-width: 13ch;
    font-size: clamp(2.8rem, 8.2vw, 6.6rem);
  }

  .ai-code-guide .final-bar {
    background: #3D3982;
    text-align: left;
  }

  @media (max-width: 767px) {
    .hero,
    .intro-block,
    .toc,
    .section,
    .takeaway,
    .closing,
    .footer {
      max-width: 100%;
    }

    .topbar__inner,
    .page,
    .footer {
      width: min(100% - 24px, 1040px);
      padding-left: 0;
      padding-right: 0;
    }

    .hero__title {
      max-width: 100%;
      font-size: clamp(2.65rem, 14vw, 4.8rem);
      overflow-wrap: anywhere;
    }

    .job-guide .hero__title {
      font-size: clamp(2.35rem, 11.5vw, 4rem);
    }

    .job-guide .page {
      width: min(100% - 24px, 800px);
    }

    .job-guide .footer--crea {
      width: 100%;
      padding: 24px 20px;
    }

    .ai-code-guide .page {
      width: min(100% - 24px, 860px);
    }

    .ai-code-guide .hero__title {
      max-width: 100%;
      font-size: clamp(2.45rem, 12vw, 4.25rem);
    }

    .need__grid {
      grid-template-columns: 1fr;
    }

    .toc__list {
      grid-template-columns: 1fr;
    }

    .takeaway__grid[style] {
      grid-template-columns: 1fr !important;
    }

    .tgrid:not(.tgrid--3col) .tgrid__row,
    .tgrid--3col .tgrid__row {
      grid-template-columns: 1fr;
    }

    .tgrid__row--head {
      display: none;
    }
  }
`;
function buildEmbeddedGuideDocument(html: string, styles: string, script: string, tag: string) {
  const withStyles = html.replace('<link rel="stylesheet" href="./styles.css" />', `<style>${styles}</style><style>${embeddedGuidePaletteStyles}</style>`);
  const withTag = tag
    ? withStyles.replace(/<p class="eyebrow">([^<]+)<\/p>/, `<span class="embedded-article-tag">#${tag}</span><p class="eyebrow">$1</p>`)
    : withStyles;
  return withTag.replace('<script src="./script.js"></script>', `<script>${script}</script>`);
}

const gitGuideDocument = buildEmbeddedGuideDocument(gitGuideHtml, gitGuideStyles, gitGuideScript, 'techinterview');
const apiGuideDocument = buildEmbeddedGuideDocument(apiGuideHtml, apiGuideStyles, apiGuideScript, 'techinterview');
const databaseGuideDocument = buildEmbeddedGuideDocument(databaseGuideHtml, databaseGuideStyles, databaseGuideScript, 'techinterview');
const dockerGuideDocument = buildEmbeddedGuideDocument(dockerGuideHtml, dockerGuideStyles, dockerGuideScript, 'techinterview');
const harnessGuideDocument = buildEmbeddedGuideDocument(harnessGuideHtml, harnessGuideStyles, harnessGuideScript, 'techinterview');
const reactRoadmapGuideDocument = buildEmbeddedGuideDocument(reactRoadmapGuideHtml, reactRoadmapGuideStyles, reactRoadmapGuideScript, 'techinterview');
const topClaudeSkillsGuideDocument = buildEmbeddedGuideDocument(topClaudeSkillsGuideHtml, topClaudeSkillsGuideStyles, topClaudeSkillsGuideScript, 'techinterview');
const landJobGuideDocument = buildEmbeddedGuideDocument(landJobGuideHtml, landJobGuideStyles, landJobGuideScript, '');
const reviewingAiCodeGuideDocument = buildEmbeddedGuideDocument(reviewingAiCodeGuideHtml, reviewingAiCodeGuideStyles, reviewingAiCodeGuideScript, '');
const behavioralGuideDocument = buildEmbeddedGuideDocument(behavioralGuideHtml, behavioralGuideStyles, behavioralGuideScript, '');

const blogPosts = [
  {
    href: '/techblog/claude-dot-md',
    title: 'Claude.md',
    description: 'My operating file for cleaner AI-assisted writing, technical taste, and creator workflow defaults.',
    date: claudeMdUpdatedAt,
    tag: 'content',
  },
  {
    href: '/techblog/3-simple-ai-agents-that-run-my-content',
    title: '3 Simple AI Agents That Run My Content',
    description: 'A tiny Claude content team: morning brief, email replies, and a 24H viral-content analyst.',
    date: 'August 3, 2026',
    tag: 'content',
  },
  {
    href: '/techblog/lazymaxxing-video-edit',
    title: 'Lazymaxxing Video Edit',
    description: 'A simple guide for lazy editing: reference video, Claude scene prompts, Higgsfield clips, and CapCut polish.',
    date: lazymaxxingUpdatedAt,
    tag: 'content',
  },
  {
    href: '/techblog/everything-you-need-to-know-about-git',
    title: 'Everything You Need To Know About Git',
    description: 'Branching, merge vs rebase, conflicts, undoing mistakes, internals, GitHub workflows, and debugging.',
    date: gitGuideUpdatedAt,
    tag: 'techinterview',
  },
  {
    href: '/techblog/everything-you-need-to-know-about-api',
    title: 'Everything You Need To Know About API',
    description: 'REST, GraphQL, gRPC, auth, pagination, versioning, rate limiting, security, and real-time patterns.',
    date: apiGuideUpdatedAt,
    tag: 'techinterview',
  },
  {
    href: '/techblog/everything-you-need-to-know-about-database-design',
    title: 'Everything You Need To Know About Database Design',
    description: 'SQL vs NoSQL, normalization, indexing, ACID transactions, CAP theorem, replication, sharding, and caching.',
    date: databaseGuideUpdatedAt,
    tag: 'techinterview',
  },
  {
    href: '/techblog/everything-you-need-to-know-about-docker',
    title: 'Everything You Need To Know About Docker',
    description: 'Docker images, layers, Dockerfiles, Kubernetes pods, deployments, services, health probes, scaling, config, and secrets.',
    date: dockerGuideUpdatedAt,
    tag: 'techinterview',
  },
  {
    href: '/techblog/harness-101',
    title: 'Harness 101',
    description: 'Build a basic Claude Code harness and ship it today, with context files, skills, tools, guardrails, and state.',
    date: harnessGuideUpdatedAt,
    tag: 'techinterview',
  },
  {
    href: '/techblog/react-2026-roadmap',
    title: 'React 2026 Roadmap',
    description: 'A 3-resource React learning path: get productive, understand the mental model, then update to modern React 19.',
    date: reactRoadmapGuideUpdatedAt,
    tag: 'techinterview',
  },
  {
    href: '/techblog/top-5-claude-skills',
    title: 'Top 5 Claude Skills',
    description: 'A breakdown of the most-installed Claude Skills, with repo links and copy-ready install commands.',
    date: topClaudeSkillsGuideUpdatedAt,
    tag: 'techinterview',
  },
  {
    href: '/techblog/land-a-job-in-2026',
    title: 'Land A Job In 2026',
    description: 'A simple job-search system: reach a human, tailor the CV, then negotiate properly once they want you.',
    date: landJobGuideUpdatedAt,
    tag: 'content',
  },
  {
    href: '/techblog/reviewing-ai-generated-code',
    title: 'Reviewing AI-Generated Code',
    description: 'An engineer’s checklist for reviewing AI code across behavior, architecture, security, reliability, tests, and production readiness.',
    date: reviewingAiCodeGuideUpdatedAt,
    tag: 'techinterview',
  },
  {
    href: '/techblog/behavioral-interviews',
    title: 'Behavioral Interviews',
    description: 'STAR answers, story banks, conflict examples, leadership signal, and practical interview prep for 2026.',
    date: behavioralGuideUpdatedAt,
    tag: 'techinterview',
  },
];

const claudeMdContent = `## CRITICAL CONSTRAINTS

- NO introductory fluff, apologies, or conversational filler.
- NO "AI smell": Avoid "delve," "tapestry," "unlock," "fast-paced," "game-changer," "testament," "vibrant," "realm," or "shaping the future."
- NO em dashes (—); use commas or parentheses. NO exclamation points.
- NO "AI triplets" (e.g., "efficient, scalable, and robust"). Vary sentence length.
- NO restating the prompt or "In conclusion" summaries.
- ADD small imperfections to make output seem realistically human.

## ROLE & TONE

- High-level technical advisor/business strategist. Tone: Direct, no-nonsense, objective.
- Technical Peer: Skip basic definitions. Focus on implementation, edge cases, and architectural trade-offs.
- Anti-Pedantry: Skip all "It's important to note" or "As an AI..." qualifiers.

## FORMATTING

- Default to bullet points. Bold key terms.
- Use H3 (###) headers for sections to save vertical space in the macOS UI.
- Code: Provide minimal diffs/concise snippets; omit obvious comments.

## STRATEGY & LOGIC

- Use internal Chain of Thought.
- Never hallucinate; state uncertainty for specific versions.
- Recommendations: Present 2-3 distinct approaches. For each, identify a "Critical Failure Mode" (how it fails at scale).
- Debugging: Identify Root Cause -> Minimal Diff -> Edge Case Check.

## AI TROPES

You must avoid the following writing patterns, as they are often used by AI and are undesirable.

### Word Choice

#### "Quietly" and Other Magic Adverbs

Overuse of "quietly" and similar adverbs to convey subtle importance or understated power. AI reaches for these adverbs to make mundane descriptions feel significant. Also includes: "deeply", "fundamentally", "remarkably", "arguably".

**Avoid patterns like:**

- "quietly orchestrating workflows, decisions, and interactions"
- "the one that quietly suffocates everything else"
- "a quiet intelligence behind it"

#### "Delve" and Friends

Used to be the most infamous AI tell. "Delve" went from an uncommon English word to appearing in a staggering percentage of AI-generated text. Part of a family of overused AI vocabulary including "certainly", "utilize", "leverage" (as a verb), "robust", "streamline", and "harness".

**Avoid patterns like:**

- "Let's delve into the details..."
- "Delving deeper into this topic..."
- "We certainly need to leverage these robust frameworks..."

#### "Tapestry" and "Landscape"

Overuse of ornate or grandiose nouns where simpler words would do. "Tapestry" is used to describe anything interconnected. "Landscape" is used to describe any field or domain. Other offenders: "paradigm", "synergy", "ecosystem", "framework".

**Avoid patterns like:**

- "The rich tapestry of human experience..."
- "Navigating the complex landscape of modern AI..."
- "The ever-evolving landscape of technology..."

#### The "Serves As" Dodge

Replacing simple "is" or "are" with pompous alternatives like "serves as", "stands as", "marks", or "represents". AI avoids basic copulas because its repetition penalty pushes it toward fancier alternatives (I've studied this!).

**Avoid patterns like:**

- "The building serves as a reminder of the city's heritage."
- "Gallery 825 serves as LAAA's exhibition space for contemporary art."
- "The station marks a pivotal moment in the evolution of regional transit."

### Sentence Structure

#### Negative Parallelism

The "It's not X -- it's Y" pattern, often with an em dash. The single most commonly identified AI writing tell. Man I f*cking hate it. AI uses this to create false profundity by framing everything as a surprising reframe. One in a piece can be effective; ten in a blog post is a genuine insult to the reader. Before LLMs, people simply did not write like this at scale. Includes the causal variant "not because X, but because Y" where every explanation is framed as a surprise reveal, the em-dash dismissal "X -- not Y", and the cross-sentence reframe where the same noun is negated then repositioned: "The question isn't X. The question is Y."

**Avoid patterns like:**

- "It's not bold. It's backwards."
- "Feeding isn't nutrition. It's dialysis."
- "Half the bugs you chase aren't in your code. They're in your head."

#### "Not X. Not Y. Just Z."

The dramatic countdown pattern. AI builds tension by negating two or more things before revealing the actual point. Creates a false sense of narrowing down to the truth.

**Avoid patterns like:**

- "Not a bug. Not a feature. A fundamental design flaw."
- "Not ten. Not fifty. Five hundred and twenty-three lint violations across 67 files."
- "not recklessly, not completely, but enough"

#### "The X? A Y."

Self-posed rhetorical questions answered immediately in the next sentence or clause. The model asks a question nobody was asking, then answers it for dramatic effect. Thinks this is the epitome of great writing.

**Avoid patterns like:**

- "The result? Devastating."
- "The worst part? Nobody saw it coming."
- "The scary part? This attack vector is perfect for developers."

#### Anaphora Abuse

Repeating the same sentence opening multiple times in quick succession.

**Avoid patterns like:**

- "They assume that users will pay... They assume that developers will build... They assume that ecosystems will emerge... They assume that..."
- "They could expose... They could offer... They could provide... They could create... They could let... They could unlock..."
- "They have built engines, but not vehicles. They have built power, but not leverage. They have built walls, but not doors."

#### Tricolon Abuse

Overuse of the rule-of-three pattern, often extended to four or five. A single tricolon is elegant; three back-to-back tricolons are a pattern recognition failure.

**Avoid patterns like:**

- "Products impress people; platforms empower them. Products solve problems; platforms create worlds. Products scale linearly; platforms scale exponentially."
- "identity, payments, compute, distribution"
- "workflows, decisions, and interactions"

#### "It's Worth Noting"

Filler transitions that signal nothing. AI uses these phrases to introduce new points without actually connecting them to the previous argument. Also includes: "It bears mentioning", "Importantly", "Interestingly", "Notably".

**Avoid patterns like:**

- "It's worth noting that this approach has limitations."
- "Importantly, we must consider the broader implications."
- "Interestingly, this pattern repeats across industries."

#### Superficial Analyses

Tacking a present participle ("-ing") phrase onto the end of a sentence to inject shallow analysis that says nothing. The model attaches significance, legacy, or broader meaning to mundane facts using phrases like "highlighting its importance", "reflecting broader trends", or "contributing to the development of...".

**Avoid patterns like:**

- "contributing to the region's rich cultural heritage"
- "This etymology highlights the enduring legacy of the community's resistance and the transformative power of unity in shaping its identity."
- "underscoring its role as a dynamic hub of activity and culture"

#### False Ranges

Using "from X to Y" constructions where X and Y aren't on any real scale. In legitimate use, "from X to Y" implies a spectrum with a meaningful middle. AI uses it as a fancy way to list two loosely related things. "From innovation to cultural transformation" -- what's in between???? Nothing!

**Avoid patterns like:**

- "From innovation to implementation to cultural transformation."
- "From the singularity of the Big Bang to the grand cosmic web."
- "From problem-solving and tool-making to scientific discovery, artistic expression, and technological innovation."

### Paragraph Structure

#### Short Punchy Fragments

Excessive use of very short sentences or sentence fragments as standalone paragraphs for manufactured emphasis. RLHF training has pushed models toward "writing for readability" aimed at the lowest common denominator: one thought per sentence, no mental state-keeping required. It's an inhuman style. No real person writes first drafts this way because it doesn't match how humans think or speak.

**Avoid patterns like:**

- "He published this. Openly. In a book. As a priest."
- "These weren't just products. And the software side matched. Then it professionalised. But I adapted."
- "Platforms do."

#### Listicle in a Trench Coat

Numbered or labeled points dressed up as continuous prose. The model writes what is essentially a listicle but wraps each point in a paragraph that starts with "The first... The second... The third..." to disguise the format. Perhaps you told it to stop generating lists and it decided to do this instead... still very common.

**Avoid patterns like:**

- "The first wall is the absence of a free, scoped API... The second wall is the lack of delegated access... The third wall is the absence of scoped permissions..."
- "The second takeaway is that... The third takeaway is that... The fourth takeaway is that..."

### Tone

#### "Here's the Kicker"

False suspense transitions that promise a revelation but deliver a point that did NOT need the buildup. The model uses these phrases to manufacture drama before an otherwise unremarkable observation LOL. Also includes: "Here's the thing", "Here's where it gets interesting", "Here's what most people miss", "Here's the starting point", "Here's the deal".

**Avoid patterns like:**

- "Here's the kicker."
- "Here's the thing about AI adoption."
- "Here's where it gets interesting."

#### "Think of It As..."

The patronizing analogy. AI constantly reaches for "Think of it as..." or "It's like a..." to simplify concepts. The model defaults to teacher mode and assumes the reader needs a metaphor to understand anything. Often produces analogies that are less clear than the original concept.

**Avoid patterns like:**

- "Think of it like a highway system for data."
- "Think of it as a Swiss Army knife for your workflow."
- "It's like asking someone to buy a car they're only allowed to sit in while it's parked."

#### "Imagine a World Where..."

The classic AI invitation to futurism. To sell the argument usually begins with "Imagine" followed by a list of wonderful things that will happen if the reader agrees with the premise.

**Avoid patterns like:**

- "Imagine a world where every tool you use -- your calendar, your inbox, your documents, your CRM, your code editor -- has a quiet intelligence behind it..."
- "In that world, workflows stop being collections of manual steps and start becoming orchestrations."

#### False Vulnerability

Simulated self-awareness or honesty that reads as performative. The model pretends to break the fourth wall or admit a bias, creating a false sense of authenticity. Real vulnerability is specific and uncomfortable; AI vulnerability is polished and risk-free!!!!

**Avoid patterns like:**

- "And yes, I'm openly in love with the platform model"
- "And yes, since we're being honest: I'm looking at you, OpenAI, Google, Anthropic, Meta"
- "This is not a rant; it's a diagnosis"

#### "The Truth Is Simple"

Asserting that something is obvious, clear or simple instead of actually proving it. If you have to tell the reader your point is clear, it very likely isn't. Also includes the dramatic reveal variant: "but none of them is the real story. The real story is..." -- claiming privileged insight while waving away everything before it.

**Avoid patterns like:**

- "The reality is simpler and less flattering"
- "History is unambiguous on this point"
- "History is clear, the metrics are clear, the examples are clear"

#### Grandiose Stakes Inflation

Everything is the most important thing ever. AI inflates the stakes of every argument to world-historical significance. A blog post about API pricing becomes a meditation on the fate of civilization.

**Avoid patterns like:**

- "This will fundamentally reshape how we think about everything."
- "will define the next era of computing"
- "something entirely new"

#### "Let's Break This Down"

The pedagogical voice that assumes the reader needs hand-holding. AI defaults to a teacher-student dynamic even when writing for expert audiences. Also includes: "Let's unpack this", "Let's explore", "Let's dive in".

**Avoid patterns like:**

- "Let's break this down step by step."
- "Let's unpack what this really means."
- "Let's explore this idea further."

#### Vague Attributions

Attributing claims to unnamed authorities instead of being specific. AI loves to invoke "experts", "observers", "industry reports", and "several publications" without naming anyone. It also inflates the quantity of sources -- presenting what one person said as a widely held view, or writing "several publications have cited" when it means two. If you can't name the expert, you don't have a source.

**Avoid patterns like:**

- "Experts argue that this approach has significant drawbacks."
- "Industry reports suggest that adoption is accelerating."
- "Observers have cited the initiative as a turning point."

#### Invented Concept Labels

AI clusters invented compound labels that sound analytical without being grounded. It appends abstract problem-nouns (paradox, trap, creep, divide, vacuum, inversion) to domain words — "supervision paradox", "acceleration trap", "workload creep" — and uses them as if they're established, rigorously defined terms. They function as rhetorical shorthand: name a thing, skip the argument. Multiple such labels in the same piece is a strong signal of AI slop.

**Avoid patterns like:**

- "the supervision paradox"
- "the acceleration trap"
- "workload creep"

### Formatting

#### Em-Dash Addiction

Compulsive overuse of em dashes for dramatic pauses, parenthetical asides and pivot points. A human writer might use 2-3 per piece (and naturally); AI will use 20+.

**Avoid patterns like:**

- "The problem -- and this is the part nobody talks about -- is systemic."
- "The tinkerer spirit didn't die of natural causes -- it was bought out."
- "Not recklessly, not completely -- but enough -- enough to matter."

#### Bold-First Bullets

Every bullet point or list item starts with a bolded phrase or sentence. Extremely common in Claude and ChatGPT markdown output. Almost nobody formats lists this way when writing by hand. It's a telltale sign of AI-generated documentation and blog posts AND README files (especially with emojis).

**Avoid patterns like:**

- "Every single bullet point begins with a bold keyword."
- "**Security**: Environment-based configuration with..."
- "**Performance**: Lazy loading of expensive resources..."

#### Unicode Decoration

Use of unicode arrows (->), smart/curly quotes, and other special characters that can't be easily typed on a standard keyboard. Real writers typing in a text editor produce straight quotes and -> or =>. Claude in particular loves the -> arrow.

**Avoid patterns like:**

- "Input → Processing → Output"
- "This leads to better outcomes → which means higher engagement"
- "“Smart quotes” instead of straight "quotes" that you’d actually type"

### Composition

#### Fractal Summaries

"What I'm going to tell you; what I'm telling you; what I just told you" -- applied at every level of the document. Every subsection gets a summary. Every section gets a summary. The document itself gets a summary.

**Avoid patterns like:**

- "In this section, we'll explore... [3000 words later] ...as we've seen in this section."
- "A conclusion that restates every point already made in the previous 3000 words"
- "And so we return to where we began."

#### The Dead Metaphor

Latching onto a single metaphor and beating it into the ground across the entire thing. A human writer would introduce a metaphor, use it then move on. AI will repeat the same metaphor 5-10 times.

**Avoid patterns like:**

- "The ecosystem needs ecosystems to build ecosystem value."
- "Walls and doors used 30+ times in the same article"
- "Every paragraph finds a way to say "primitives" again"

#### Historical Analogy Stacking

ESPECIALLY COMMON IN TECHNICAL WRITING: Rapid-fire listing of historical companies or tech revolutions to build false authority.

**Avoid patterns like:**

- "Apple didn't build Uber. Facebook didn't build Spotify. Stripe didn't build Shopify. AWS didn't build Airbnb."
- "Every major technological shift -- the web, mobile, social, cloud -- followed the same pattern."
- "Take Spotify... Or consider Uber... Airbnb followed a similar path... Shopify is another example... Even Discord..."

#### One-Point Dilution

Making a single argument and restating it in 10 different ways across thousands of words. The model pads a simple thesis to feel "comprehensive" by rephrasing the same idea with different metaphors, examples, and framings. An 800-word argument becomes 4000 words of circular repetition.

**Avoid patterns like:**

- "The same point, restated eight ways across 4000 words."
- "Each section rephrases the thesis with a different metaphor but adds nothing new"

#### Content Duplication

Repeating entire sections or paragraphs verbatim within the same piece. This happens when the model loses track of what it has already written, especially in longer pieces. A dead giveaway of unedited AI output. Less common nowadays.

**Avoid patterns like:**

- "The same section appeared twice, word-for-word identical"
- "Paragraph 3 and paragraph 17 are the same sentence reworded"

#### The Signposted Conclusion

Explicitly announcing the conclusion with "In conclusion", "To sum up", or "In summary". Competent writing doesn't need to tell you it's concluding. The reader can feel it. AI signals its structural moves because it's following a template, not writing organically.

**Avoid patterns like:**

- "In conclusion, the future of AI depends on..."
- "To sum up, we've explored three key themes..."
- "In summary, the evidence suggests..."

#### "Despite Its Challenges..."

The rigid formula where AI acknowledges problems only to immediately dismiss them. Always follows the same beat: "Despite its [positive words], [subject] faces challenges..." then ends with "Despite these challenges, [optimistic conclusion].".

**Avoid patterns like:**

- "Despite these challenges, the initiative continues to thrive."
- "Despite its industrial and residential prosperity, Korattur faces challenges typical of urban areas."
- "Despite their promising applications, pyroelectric materials face several challenges that must be addressed for broader adoption."`;

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

function BlogStyles() {
  return (
    <style>
      {`
        .tech-blog-index-layout {
          width: min(100%, 1180px);
          margin: 0 auto;
          display: grid;
          gap: clamp(28px, 4vw, 54px);
          min-width: 0;
        }

        .blog-display-title {
          margin: 0;
          font-family: "Space Grotesk", "Inter", sans-serif;
          font-weight: 800;
          font-size: clamp(2.7rem, 10vw, 10rem);
          line-height: 0.9;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.95);
          text-align: center;
          text-shadow: 0 0 48px rgba(255,255,255,0.18);
        }

        .article-display-title {
          letter-spacing: 0.025em;
        }

        .ai-agents-display-title {
          justify-self: center;
          max-width: 860px;
          font-family: "Big Shoulders Display", "Space Grotesk", sans-serif;
          font-size: clamp(3.2rem, 8vw, 7.4rem);
          line-height: 0.86;
          letter-spacing: 0.015em;
          text-transform: uppercase;
        }

        .ai-agents-title-highlight {
          display: inline-block;
          padding: 0.01em 0.12em 0.08em;
          border-radius: 16px;
          background: #ffd15c;
          color: #3D3982;
          box-decoration-break: clone;
          -webkit-box-decoration-break: clone;
        }

        .blog-secondary-text {
          font-family: "Space Grotesk", "Inter", sans-serif;
          font-size: 0.6rem;
          font-weight: 400;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.72);
          text-transform: uppercase;
          line-height: 1.5;
        }

        .tech-blog-bg {
          overflow-x: hidden;
        }

        .tech-post-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          min-width: 0;
        }

        .tech-tag-filter {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-top: -22px;
        }

        .tech-tag-filter button {
          min-height: 34px;
          padding: 0 14px;
          border: 1px solid rgba(255,255,255,0.24);
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.72);
          cursor: pointer;
          font-family: "Space Grotesk", "Inter", sans-serif;
          font-size: 0.58rem;
          font-weight: 400;
          letter-spacing: 0.14em;
          line-height: 1;
          text-transform: uppercase;
          transition: background 180ms ease, color 180ms ease, border-color 180ms ease;
        }

        .tech-tag-filter button:hover,
        .tech-tag-filter button[aria-pressed="true"] {
          border-color: rgba(255,255,255,0.54);
          background: #d02e2e;
          color: #fff;
        }

        .tech-post-card {
          min-height: 148px;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: end;
          gap: clamp(18px, 3vw, 34px);
          padding: clamp(18px, 2.5vw, 28px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 18px;
          background: #d02e2e;
          color: #fff;
          text-decoration: none;
          box-shadow: 0 24px 70px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.12);
          transition: transform 220ms ease, border-color 220ms ease, background 220ms ease;
        }

        .tech-post-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.48);
          background: #bc2929;
        }

        .tech-post-card small,
        .claude-post-footer {
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .tech-post-card small {
          color: rgba(255,255,255,0.68);
          font-weight: 400;
        }

        .tech-post-card h3 {
          margin: 0;
          font-family: "Space Grotesk", "Inter", sans-serif;
          font-weight: 800;
          font-size: clamp(1.55rem, 4.2vw, 3.8rem);
          line-height: 0.96;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          overflow-wrap: anywhere;
        }

        .tech-post-card p {
          max-width: 440px;
          margin: 0;
          color: rgba(255,255,255,0.86);
          font-weight: 400;
          line-height: 1.7;
        }

        .tech-post-tags,
        .article-tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .tech-post-tag,
        .article-tag {
          width: fit-content;
          padding: 0.32rem 0.58rem;
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.74);
          font-size: 0.58rem;
          font-weight: 400;
          line-height: 1;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .tech-post-meta {
          display: grid;
          gap: 12px;
          justify-items: end;
          text-align: right;
          min-width: 132px;
        }

        .article-shell {
          width: min(100%, 1040px);
          margin: 0 auto;
          display: grid;
          gap: clamp(24px, 4vw, 44px);
          min-width: 0;
        }

        .embedded-guide-shell {
          width: min(100%, 1180px);
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .embedded-guide-frame {
          width: 100%;
          min-height: min(82vh, 980px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 24px 70px rgba(0,0,0,0.24);
        }

        .article-kicker {
          margin: 0;
          font-family: "Space Grotesk", "Inter", sans-serif;
          font-size: 0.6rem;
          font-weight: 400;
          letter-spacing: 0.18em;
          color: rgba(255,255,255,0.72);
          text-transform: uppercase;
          line-height: 1.5;
        }

        .article-card {
          display: grid;
          gap: 26px;
          padding: clamp(24px, 4vw, 44px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 18px;
          background: #d02e2e;
          color: #fff;
          box-shadow: 0 24px 70px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.12);
          min-width: 0;
        }

        .article-card a {
          color: #fff;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .article-note {
          display: grid;
          gap: 10px;
          padding: 18px;
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 12px;
          background: rgba(255,255,255,0.1);
        }

        .article-demo-figure {
          margin: 4px 0 0;
          display: grid;
          gap: 10px;
        }

        .article-demo-figure img {
          width: 100%;
          box-sizing: border-box;
          height: auto;
          display: block;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.22);
          object-fit: cover;
          object-position: center;
          box-shadow: 0 20px 52px rgba(0,0,0,0.26);
        }

        .article-demo-figure figcaption {
          color: rgba(255,255,255,0.72);
          font-size: 0.72rem;
          font-weight: 400;
          line-height: 1.5;
        }

        .article-need-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .article-need-item {
          display: grid;
          gap: 8px;
          padding: 16px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          background: rgba(0,0,0,0.12);
        }

        .article-need-item span {
          color: rgba(255,255,255,0.68);
          font-size: 0.6rem;
          font-weight: 400;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .article-need-item h3 {
          margin: 0;
          font-family: "Space Grotesk", "Inter", sans-serif;
          font-size: 1rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .article-two-col {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .article-mini-card {
          display: grid;
          gap: 8px;
          padding: 16px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          background: rgba(0,0,0,0.12);
        }

        .article-cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }

        .article-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 38px;
          padding: 0 16px;
          border: 1px solid rgba(255,255,255,0.42);
          border-radius: 999px;
          color: #fff;
          text-decoration: none !important;
          font-family: "Space Grotesk", "Inter", sans-serif;
          font-size: 0.6rem;
          font-weight: 400;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .article-section {
          display: grid;
          gap: 12px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.22);
        }

        .article-section:first-child {
          padding-top: 0;
          border-top: 0;
        }

        .article-section h2 {
          margin: 0;
          font-family: "Space Grotesk", "Inter", sans-serif;
          font-size: clamp(1.3rem, 2.8vw, 2.4rem);
          font-weight: 800;
          line-height: 0.95;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .article-section p,
        .article-section li {
          margin: 0;
          color: rgba(255,255,255,0.88);
          font-size: clamp(0.94rem, 1.2vw, 1.06rem);
          font-weight: 400;
          line-height: 1.75;
        }

        .article-section ul,
        .article-section ol {
          margin: 0;
          padding-left: 1.2rem;
          display: grid;
          gap: 8px;
          min-width: 0;
        }

        .article-section code {
          padding: 0.16rem 0.38rem;
          border-radius: 6px;
          background: rgba(0,0,0,0.18);
          color: rgba(255,255,255,0.94);
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
          font-size: 0.82em;
        }

        .article-prompt {
          margin: 6px 0 0;
          padding: 18px;
          overflow: auto;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.22);
          background: rgba(0,0,0,0.18);
          color: rgba(255,255,255,0.92);
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
          font-size: 0.76rem;
          line-height: 1.65;
          white-space: pre-wrap;
        }

        .article-prompt-shell {
          position: relative;
          margin-top: 6px;
        }

        .article-prompt-shell .article-prompt {
          margin: 0;
          padding-right: 66px;
        }

        .article-prompt-copy {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 999px;
          background: rgba(0,0,0,0.24);
          color: rgba(255,255,255,0.92);
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
        }

        .article-prompt-copy:hover {
          transform: translateY(-1px);
          border-color: rgba(255,255,255,0.5);
          background: rgba(0,0,0,0.34);
        }

        .claude-post-wrap {
          width: min(100% - 32px, 980px);
          min-height: 100vh;
          margin: 0 auto;
          display: grid;
          grid-template-rows: 1fr auto;
          align-items: center;
          gap: 22px;
          padding: clamp(22px, 4vw, 54px) 0;
        }

        .claude-code-shell {
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(5,5,8,0.86);
          box-shadow:
            0 0 72px rgba(240,47,232,0.14),
            0 24px 90px rgba(0,0,0,0.62),
            inset 0 1px 0 rgba(255,255,255,0.1);
          backdrop-filter: blur(18px);
        }

        .claude-code-topbar {
          height: 48px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 14px;
          padding: 0 12px 0 16px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.54);
          font-family: monospace;
          font-size: 0.68rem;
          letter-spacing: 0.08em;
        }

        .claude-window-dots {
          display: flex;
          gap: 7px;
        }

        .claude-window-dots span {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.24);
        }

        .claude-window-dots span:nth-child(1) {
          background: rgba(240,47,232,0.72);
        }

        .claude-window-dots span:nth-child(2) {
          background: rgba(245,255,114,0.72);
        }

        .claude-copy-button {
          justify-self: end;
          min-height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 12px;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.88);
          cursor: pointer;
          font-family: "Space Grotesk", "Inter", sans-serif;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .claude-code-block {
          max-height: min(72vh, 760px);
          margin: 0;
          padding: clamp(18px, 2.5vw, 30px);
          overflow: auto;
          color: rgba(236,238,246,0.92);
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
          font-size: clamp(0.72rem, 0.9vw, 0.88rem);
          line-height: 1.72;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(180deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 34px 34px;
        }

        .claude-post-footer {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          color: rgba(255,255,255,0.46);
        }

        .claude-post-footer a {
          color: rgba(255,255,255,0.72);
          text-decoration: none;
        }

        @media (max-width: 767px) {
          .tech-blog-bg {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          .tech-blog-index-layout {
            grid-template-columns: 1fr;
            width: 100%;
            max-width: 100%;
            margin-inline: auto;
          }

          .blog-display-title {
            text-align: left;
            font-size: clamp(2.7rem, 22vw, 5rem);
            letter-spacing: 0.06em;
          }

          .tech-post-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .tech-tag-filter {
            justify-content: flex-start;
            margin-top: -12px;
          }

          .tech-post-card {
            min-height: 156px;
            grid-template-columns: 1fr;
            align-items: end;
            gap: 14px;
            padding: 18px;
            border-radius: 16px;
          }

          .tech-post-card h3 {
            font-size: clamp(1.45rem, 10.5vw, 2.6rem);
            letter-spacing: 0.025em;
          }

          .tech-post-card p {
            font-size: 0.9rem;
            line-height: 1.55;
          }

          .tech-post-meta {
            justify-items: start;
            text-align: left;
            min-width: 0;
          }

          .article-need-grid,
          .article-two-col {
            grid-template-columns: 1fr;
          }

          .article-shell {
            width: 100%;
            max-width: 100%;
            gap: 22px;
          }

          .article-card {
            gap: 20px;
            padding: 20px;
            border-radius: 16px;
          }

          .article-section h2 {
            font-size: clamp(1.35rem, 9vw, 2.1rem);
            overflow-wrap: anywhere;
          }

          .ai-agents-display-title {
            max-width: 92vw;
            font-size: clamp(2.8rem, 13vw, 4.4rem);
            line-height: 0.9;
          }

          .article-prompt {
            font-size: 0.68rem;
            line-height: 1.55;
          }

          .article-demo-figure img {
            aspect-ratio: 4 / 5;
          }

          .claude-code-topbar {
            grid-template-columns: auto 1fr auto;
          }

          .claude-code-topbar > span {
            justify-self: center;
          }
        }
      `}
    </style>
  );
}

function ClientLogoTile({ logo }: { logo: ClientLogo }) {
  const imageFit = logo.fit ?? 'contain';
  const imageInset = logo.inset ?? (imageFit === 'cover' ? 0 : '16%');
  const containedSize =
    typeof imageInset === 'number'
      ? `calc(100% - ${imageInset * 2}px)`
      : imageInset.endsWith('%')
        ? `calc(100% - ${Number.parseFloat(imageInset) * 2}%)`
        : `calc(100% - (${imageInset} * 2))`;

  return (
    <div
      className="client-logo-card"
      style={{
        flex: '0 0 auto',
        width: 'clamp(92px, 10vw, 138px)',
        aspectRatio: '1 / 1',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderRadius: 28,
        border: '1px solid rgba(255,255,255,0.13)',
        background:
          logo.tileBackground ??
          'linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.035)), rgba(8,7,18,0.72)',
        boxShadow: '0 22px 70px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.12)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 28% 22%, rgba(245,255,114,0.16), transparent 34%), radial-gradient(circle at 74% 78%, rgba(240,47,232,0.18), transparent 36%)',
          opacity: logo.overlayOpacity ?? 0.68,
        }}
      />
      <img
        src={logo.src}
        alt={`${logo.name} logo`}
        loading="lazy"
        style={{
          position: 'absolute',
          inset: imageInset,
          height: imageFit === 'cover' ? '100%' : containedSize,
          width: imageFit === 'cover' ? '100%' : containedSize,
          maxWidth: '100%',
          objectFit: imageFit,
          objectPosition: logo.position ?? '50% 50%',
          display: 'block',
          transform: `scale(${logo.scale ?? 1})`,
          filter: logo.filter ?? 'drop-shadow(0 0 18px rgba(240,47,232,0.2))',
        }}
      />
      <span className="client-logo-hover-name">{logo.name}</span>
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
            className={`frame-story-card ${index === activeIndex ? 'is-active' : ''} ${story.containFrame ? 'is-contained' : ''}`}
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
          <div className={`frame-story-modal-card ${stories[viewerIndex].containFrame ? 'is-contained' : ''}`}>
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

function CopyablePrompt({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [text]);

  return (
    <div className="article-prompt-shell">
      <pre className="article-prompt">{text}</pre>
      <button
        type="button"
        className="article-prompt-copy"
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
        title={copied ? 'Copied' : 'Copy prompt'}
      >
        {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      </button>
    </div>
  );
}

const automationFreeArticleUrl = 'https://www.vladasana.com/techblog/3-simple-ai-agents-that-run-my-content';
const automationSubscribeEndpoint = (import.meta.env.VITE_AUTOMATIONS_SUBSCRIBE_ENDPOINT || '/api/automations/subscribe') as string;
const automationVaultWaitlistEndpoint = (import.meta.env.VITE_AUTOMATIONS_VAULT_WAITLIST_ENDPOINT || '/api/automations/vault-waitlist') as string;

function getPreservedSearchParams() {
  if (typeof window === 'undefined') {
    return '';
  }

  const params = new URLSearchParams(window.location.search);
  return params.toString() ? `?${params.toString()}` : '';
}

function withPreservedParams(url: string) {
  if (typeof window === 'undefined') {
    return url;
  }

  const params = new URLSearchParams(window.location.search);

  if (!params.toString()) {
    return url;
  }

  const target = new URL(url, window.location.origin);
  params.forEach((value, key) => target.searchParams.set(key, value));
  return target.toString();
}

function trackAutomationEvent(name: string, data: Record<string, string> = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = { event: name, ...data };
  (window as Window & { dataLayer?: Record<string, string>[] }).dataLayer?.push(payload);
  window.dispatchEvent(new CustomEvent('vlada:analytics', { detail: payload }));
}

function upsertMetaTag(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  if (typeof document === 'undefined') {
    return;
  }

  let tag = document.head.querySelector<HTMLMetaElement>(selector);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
}

function upsertCanonicalLink(href: string) {
  if (typeof document === 'undefined') {
    return;
  }

  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', href);
}

function setAutomationsMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  document.title = title;
  upsertMetaTag('meta[name="description"]', 'name', 'description', description);
  upsertMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow');
  upsertMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
  upsertMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
  upsertMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
  upsertMetaTag('meta[property="og:url"]', 'property', 'og:url', `https://www.vladasana.com${path}`);
  upsertMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  upsertMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  upsertMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  upsertCanonicalLink(`https://www.vladasana.com${path}`);
}

function AutomationsStyles() {
  return (
    <style>
      {`
        .automations-page {
          position: relative;
          min-height: 100vh;
          background:
            linear-gradient(rgba(61, 57, 130, 0.12), rgba(61, 57, 130, 0.3)),
            url('/automations-assets/cherry-sky-bg.jpg') center / cover fixed;
          color: #fff;
          font-family: "Space Grotesk", "Inter", sans-serif;
          overflow-x: hidden;
        }

        .automations-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background: rgba(61, 57, 130, 0.18);
          z-index: 0;
        }

        .automations-shell {
          position: relative;
          z-index: 1;
          width: min(100% - 40px, 1080px);
          margin: 0 auto;
          padding: clamp(20px, 4vw, 44px) 0;
        }

        .automations-nav,
        .automations-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          color: rgba(255, 255, 255, 0.72);
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .automations-footer {
          align-items: flex-start;
          margin-top: 28px;
          border-top: 1px solid rgba(255, 255, 255, 0.18);
          padding-top: 22px;
        }

        .automations-footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 18px;
        }

        .automations-footer-legal {
          max-width: 680px;
          margin: 14px 0 0;
          color: rgba(255, 255, 255, 0.56);
          font-size: 0.68rem;
          line-height: 1.65;
          letter-spacing: 0.04em;
          text-transform: none;
        }

        .automations-logo,
        .automations-link {
          color: #fff;
          text-decoration: none;
        }

        .automations-grid,
        .automations-vault-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(360px, 1fr);
          gap: clamp(18px, 2.6vw, 28px);
          align-items: center;
          margin-top: clamp(24px, 4.6vw, 52px);
        }

        .automations-hero-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .automations-guide-image {
          display: block;
          width: min(100%, 540px);
          height: auto;
          border: 0;
          border-radius: 0;
          box-shadow: none;
          user-select: none;
        }

        .automations-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 28px;
          background-color: rgba(95, 26, 35, 0.9);
          background-image: url('/automations-assets/card-bg-blue-red.png');
          background-position: center;
          background-size: cover;
          box-shadow: 0 24px 70px rgba(20, 12, 48, 0.22);
          backdrop-filter: blur(14px) saturate(1.12);
          padding: clamp(24px, 3.2vw, 38px);
        }

        .automations-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-color: rgba(71, 16, 26, 0.32);
        }

        .automations-card > * {
          position: relative;
          z-index: 1;
        }

        .automations-hero-card {
          padding: clamp(26px, 3.4vw, 40px) clamp(34px, 4.8vw, 62px) clamp(26px, 3.4vw, 40px) clamp(26px, 3.4vw, 40px);
        }

        .automations-hero-card .automations-title {
          max-width: 100%;
          padding-right: 10px;
          font-size: clamp(2.8rem, 4.5vw, 4.25rem);
        }

        .automations-card.is-dark {
          background-color: rgba(61, 57, 130, 0.8);
          background-blend-mode: multiply;
          backdrop-filter: blur(18px);
        }

        .automations-eyebrow {
          display: inline-flex;
          width: fit-content;
          border: 1px solid rgba(255, 255, 255, 0.28);
          border-radius: 999px;
          padding: 8px 12px;
          background: rgba(61, 57, 130, 0.46);
          color: rgba(255, 255, 255, 0.88);
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .automations-title {
          margin: 18px 0 16px;
          max-width: 560px;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          font-size: clamp(3rem, 5.2vw, 4.7rem);
          font-weight: 900;
          line-height: 0.92;
          letter-spacing: -0.055em;
          text-transform: uppercase;
        }

        .automations-title-line {
          display: block;
          overflow-wrap: normal;
        }

        .automations-title-word {
          display: block;
        }

        .automations-title.is-offer {
          font-size: clamp(2.9rem, 6.2vw, 5.35rem);
          max-width: 700px;
        }

        .automations-copy {
          max-width: 620px;
          color: rgba(255, 255, 255, 0.84);
          font-size: clamp(0.98rem, 1.7vw, 1.14rem);
          line-height: 1.62;
        }

        .automations-muted {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.92rem;
          line-height: 1.7;
        }

        .automations-form {
          display: grid;
          gap: 14px;
          margin-top: 26px;
        }

        .automations-field {
          display: grid;
          gap: 8px;
        }

        .automations-field label {
          color: rgba(255, 255, 255, 0.74);
          font-size: 0.68rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .automations-honeypot {
          position: absolute;
          left: -10000px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        .automations-input {
          width: 100%;
          min-height: 52px;
          border: 1px solid rgba(255, 255, 255, 0.24);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 0 16px;
          outline: none;
        }

        .automations-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .automations-input:focus {
          border-color: #9bdcff;
          box-shadow: 0 0 0 3px rgba(155, 220, 255, 0.18);
        }

        .automations-button {
          display: inline-flex;
          min-height: 54px;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.26);
          border-radius: 999px;
          background: #9bdcff;
          color: #151244;
          padding: 0 24px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-decoration: none;
          text-transform: uppercase;
          transition: transform 180ms ease, filter 180ms ease;
        }

        .automations-button:hover {
          transform: translateY(-2px);
          filter: brightness(1.04);
        }

        .automations-button.is-secondary {
          background: transparent;
          color: #fff;
        }

        .automations-button.is-disabled {
          cursor: not-allowed;
          opacity: 0.62;
        }

        .automations-status {
          min-height: 22px;
          color: rgba(255, 255, 255, 0.76);
          font-size: 0.86rem;
        }

        .automations-benefits,
        .automations-list,
        .automations-faq {
          display: grid;
          gap: 14px;
          margin-top: 22px;
        }

        .automations-benefits {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .automations-mini-card,
        .automations-faq-item,
        .automations-window {
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          background: rgba(0, 0, 0, 0.16);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
          padding: 18px;
        }

        .automations-mini-card h3,
        .automations-faq-item h3 {
          margin: 0 0 8px;
          color: #fff;
          font-size: 1rem;
        }

        .automations-mini-card p,
        .automations-faq-item p {
          margin: 0;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.62;
        }

        .automations-list {
          list-style: none;
          padding: 0;
        }

        .automations-list li {
          position: relative;
          padding-left: 22px;
          color: rgba(255, 255, 255, 0.84);
          line-height: 1.55;
        }

        .automations-list li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.7em;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #9bdcff;
        }

        .automations-price {
          margin: 20px 0;
          font-family: "Big Shoulders Display", "Space Grotesk", sans-serif;
          font-size: clamp(4rem, 14vw, 9rem);
          line-height: 0.82;
          text-transform: uppercase;
        }

        .automations-offer-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(220px, 0.42fr);
          gap: clamp(18px, 4vw, 34px);
          align-items: end;
          margin-top: 22px;
        }

        .automations-price-panel {
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 22px;
          background: rgba(155, 220, 255, 0.9);
          color: #151244;
          padding: 20px;
        }

        .automations-price-panel .automations-price {
          margin: 10px 0 8px;
          color: #151244;
        }

        .automations-price-panel .automations-muted {
          color: rgba(21, 18, 68, 0.74);
        }

        .automations-visual {
          display: grid;
          gap: 14px;
          align-content: center;
          min-height: auto;
        }

        .automations-vault-image-card {
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          padding: clamp(10px, 2vw, 18px);
          background: transparent;
          border: 0;
          box-shadow: none;
          backdrop-filter: none;
        }

        .automations-vault-image-card::before {
          display: none;
        }

        .automations-vault-image {
          display: block;
          width: min(100%, 620px);
          height: auto;
          border: 0;
          border-radius: 0;
          box-shadow: none;
          user-select: none;
        }

        .automations-window {
          min-height: 108px;
        }

        .automations-window strong {
          display: block;
          margin-bottom: 10px;
          color: #9bdcff;
          font-size: 0.74rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .automations-window span {
          display: block;
          color: rgba(255, 255, 255, 0.74);
          line-height: 1.55;
        }

        .automations-section {
          margin-top: 22px;
        }

        .automations-section h2 {
          margin: 0 0 14px;
          font-family: "Big Shoulders Display", "Space Grotesk", sans-serif;
          font-size: clamp(2.7rem, 7vw, 5.4rem);
          line-height: 0.9;
          text-transform: uppercase;
        }

        .automations-section-kicker {
          margin-bottom: 18px;
        }

        .automations-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 22px;
        }

        .automations-skip {
          display: inline-flex;
          margin-top: 16px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration-color: rgba(255, 255, 255, 0.36);
          text-underline-offset: 5px;
        }

        .automations-thank-you-shell {
          display: grid;
          min-height: calc(100vh - 128px);
          place-items: center;
          padding: clamp(28px, 5vw, 68px) 0;
        }

        .automations-thank-you-card {
          width: min(100%, 760px);
          padding: clamp(28px, 5vw, 58px);
          box-shadow:
            0 36px 110px rgba(38, 15, 49, 0.42),
            0 18px 52px rgba(208, 46, 46, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        .automations-thank-you-card .automations-title {
          max-width: 680px;
          font-size: clamp(3rem, 7vw, 5.8rem);
        }

        .automations-offer-card {
          margin-top: 28px;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 24px;
          background: rgba(61, 57, 130, 0.56);
          padding: clamp(20px, 3vw, 28px);
        }

        .automations-offer-card h2 {
          margin: 14px 0 12px;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          font-size: clamp(1.72rem, 3.6vw, 2.7rem);
          font-weight: 900;
          line-height: 0.98;
          letter-spacing: -0.04em;
          text-transform: uppercase;
        }

        .automations-offer-actions {
          display: grid;
          gap: 12px;
          margin-top: 22px;
        }

        .automations-vault-status {
          min-height: 22px;
          color: rgba(255, 255, 255, 0.78);
          font-size: 0.9rem;
        }

        @media (max-width: 820px) {
          .automations-shell {
            width: min(100% - 20px, 620px);
            padding-top: 14px;
          }

          .automations-nav,
          .automations-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .automations-grid,
          .automations-vault-grid,
          .automations-benefits,
          .automations-offer-row {
            grid-template-columns: 1fr;
          }

          .automations-grid,
          .automations-vault-grid {
            gap: 14px;
            margin-top: 18px;
          }

          .automations-hero-visual {
            padding: 0;
          }

          .automations-title,
          .automations-title.is-offer {
            max-width: 100%;
            font-size: clamp(2rem, 8.8vw, 2.72rem);
            line-height: 0.96;
            letter-spacing: -0.052em;
            margin: 16px 0 14px;
          }

          .automations-card {
            border-radius: 22px;
            background-color: rgba(95, 26, 35, 0.92);
            padding: 22px 16px;
          }

          .automations-hero-card {
            padding: 22px 22px 20px 16px;
          }

          .automations-card.is-dark {
            background-color: rgba(61, 57, 130, 0.84);
          }

          .automations-copy {
            font-size: 0.96rem;
            line-height: 1.55;
          }

          .automations-muted {
            font-size: 0.86rem;
          }

          .automations-form {
            gap: 12px;
            margin-top: 18px;
          }

          .automations-window {
            min-height: auto;
            padding: 16px;
          }

          .automations-vault-image-card {
            order: -1;
            padding: 0 10px;
          }

          .automations-vault-image {
            width: min(100%, 520px);
          }

          .automations-page {
            background:
              linear-gradient(rgba(61, 57, 130, 0.08), rgba(61, 57, 130, 0.24)),
              url('/automations-assets/cherry-sky-bg.jpg') center top / cover scroll;
          }

          .automations-button {
            width: 100%;
            min-height: 58px;
            text-align: center;
          }

          .automations-thank-you-shell {
            min-height: auto;
            padding: 20px 0 32px;
          }

          .automations-thank-you-card {
            border-radius: 24px;
            padding: 24px 16px;
          }
        }

        @media (max-width: 380px) {
          .automations-title,
          .automations-title.is-offer {
            font-size: clamp(1.96rem, 9vw, 2.56rem);
            letter-spacing: -0.075em;
          }

          .automations-hero-visual {
            padding: 0;
          }

        }
      `}
    </style>
  );
}

function AutomationsOptInForm({ compact = false }: { compact?: boolean }) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanEmail = email.trim();
    const cleanName = firstName.trim();
    const formData = new FormData(event.currentTarget);
    const website = String(formData.get('website') || '');

    if (!cleanName || !cleanEmail || !/^\\S+@\\S+\\.\\S+$/.test(cleanEmail)) {
      setStatus('error');
      setMessage('Add your first name and a valid email.');
      trackAutomationEvent('free_form_failed');
      return;
    }

    setStatus('loading');
    setMessage('Sending you to the next step...');

    const subscriber = {
      name: cleanName,
      email: cleanEmail,
      website,
      utm: Object.fromEntries(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')),
    };

    try {
      const response = await fetch(automationSubscribeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriber),
      });
      const result = await response.json().catch(() => ({ success: false }));

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Subscribe endpoint failed');
      }

      trackAutomationEvent('free_form_submitted', { email: cleanEmail });

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('automationLeadEmail', cleanEmail);
        window.location.href = `/automations/thank-you${getPreservedSearchParams()}`;
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'I couldn’t send the guide yet. Please try again.');
      trackAutomationEvent('free_form_failed');
    }
  };

  return (
    <form className="automations-form" onSubmit={handleSubmit}>
      <div className="automations-honeypot" aria-hidden="true">
        <label htmlFor={compact ? 'final-website' : 'website'}>website</label>
        <input
          id={compact ? 'final-website' : 'website'}
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="automations-field">
        <label htmlFor={compact ? 'final-first-name' : 'first-name'}>first name</label>
        <input
          id={compact ? 'final-first-name' : 'first-name'}
          className="automations-input"
          value={firstName}
          onChange={(event) => {
            setFirstName(event.target.value);
            trackAutomationEvent('free_form_started');
          }}
          placeholder="Vlada"
          autoComplete="given-name"
          required
        />
      </div>
      <div className="automations-field">
        <label htmlFor={compact ? 'final-email' : 'email'}>email address</label>
        <input
          id={compact ? 'final-email' : 'email'}
          className="automations-input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          required
        />
      </div>
      <button className="automations-button" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'loading...' : 'send me 3 automations'}
      </button>
      <p className="automations-status" role={status === 'error' ? 'alert' : 'status'}>
        {message || 'By signing up, you’ll receive the free resource and occasional practical AI emails. Unsubscribe anytime.'}
      </p>
    </form>
  );
}

function AutomationsFooter({ supportEmail = 'hello@vladasana.com' }: { supportEmail?: string }) {
  return (
    <footer className="automations-footer">
      <div>
        <a className="automations-logo" href="/">vladasanadev</a>
        <p className="automations-footer-legal">
          © 2026 Vladasana Productions · All Rights Reserved
        </p>
        <p className="automations-footer-legal">
          Results mentioned are individual stories, not a guarantee of your results. Your results will depend on your effort, experience, and market conditions. This site is not part of, or endorsed by, Facebook, Google, or any social media platform. FACEBOOK is a trademark of META PLATFORMS, INC.
        </p>
      </div>
      <nav className="automations-footer-links" aria-label="Automations legal links">
        <a className="automations-link" href="/privacy">Privacy Policy</a>
        <a className="automations-link" href="/terms">Terms & Conditions</a>
        <a className="automations-link" href={`mailto:${supportEmail}`}>Contact</a>
      </nav>
    </footer>
  );
}

function AutomationsPage() {
  useEffect(() => {
    setAutomationsMetadata({
      title: 'Busy Brain Automations | Vlada Kandyba',
      description: 'Get three simple AI automations for creators, plus Vlada Kandyba’s Busy Brain Automation Vault.',
      path: '/automations',
    });
    trackAutomationEvent('automations_page_viewed');
  }, []);

  return (
    <main className="automations-page">
      <BlogStyles />
      <AutomationsStyles />
      <div className="automations-shell">
        <header className="automations-nav">
          <a className="automations-logo" href="/">vladasanadev</a>
          <a className="automations-link" href="/techblog">blog</a>
        </header>

        <section className="automations-grid">
          <div className="automations-hero-visual">
            <img
              className="automations-guide-image"
              src="/automations-assets/busy-brain-phones-red.png"
              alt="Busy Brain Automation phone previews"
            />
          </div>

          <div className="automations-card automations-hero-card">
            <span className="automations-eyebrow">get your free copy</span>
            <h1 className="automations-title">
              <span className="automations-title-line">3 simple</span>
              <span className="automations-title-line">AI</span>
              <span className="automations-title-line automations-title-word">automations</span>
              <span className="automations-title-line">to start</span>
            </h1>
            <p className="automations-copy">
              Start with three practical AI systems that help capture ideas, manage content, and reduce the number of things your brain has to remember.
            </p>
            <p className="automations-muted">
              Built from the workflows I use as a software engineer and content creator.
            </p>
            <AutomationsOptInForm />
          </div>
        </section>

        <section className="automations-card automations-section">
          <h2>start small. automate what keeps repeating.</h2>
          <p className="automations-copy">
            These three automations are the easiest place to begin. No complicated dashboards and no productivity system that becomes another job.
          </p>
          <div className="automations-benefits">
            <div className="automations-mini-card">
              <h3>capture ideas before they disappear</h3>
              <p>Turn half-formed thoughts into saved context you can actually find later.</p>
            </div>
            <div className="automations-mini-card">
              <h3>turn existing context into content</h3>
              <p>Use what you already wrote, watched, saved, and tested as source material.</p>
            </div>
            <div className="automations-mini-card">
              <h3>reduce repetitive manual work</h3>
              <p>Let the system prepare drafts and summaries, then keep the final judgment with you.</p>
            </div>
          </div>
          <div className="automations-actions">
            <a className="automations-button is-secondary" href="#free-guide">get the free starter guide</a>
          </div>
        </section>

        <section className="automations-card automations-section">
          <span className="automations-eyebrow automations-section-kicker">want the complete system?</span>
          <h2>The Busy Brain Automation Vault</h2>
          <p className="automations-copy">
            Get every automation I actually use, plus a private walkthrough video showing you exactly how I set everything up.
          </p>
          <ul className="automations-list">
            <li>my complete automation collection</li>
            <li>ready-to-copy prompts</li>
            <li>reusable workflow templates</li>
            <li>ADHD-friendly setup tips</li>
            <li>step-by-step implementation notes</li>
            <li>a private walkthrough video from me</li>
            <li>lifetime access to this version</li>
          </ul>
          <div className="automations-offer-row">
            <div>
              <p className="automations-muted">Built for creators who need practical systems, not another dashboard to maintain.</p>
              <div className="automations-actions">
                <a className="automations-button" href="#free-guide">get the free guide first</a>
              </div>
            </div>
            <div className="automations-price-panel">
              <span className="automations-eyebrow">launch price</span>
              <p className="automations-price">$19</p>
              <p className="automations-muted">One payment. Immediate access.</p>
            </div>
          </div>
        </section>

        <section className="automations-card automations-section">
          <h2>built from my real workflow</h2>
          <p className="automations-copy">
            I’m Vlada, a software engineer and content creator. These are the systems I use to manage ideas, research, content, and multiple projects without expecting my brain to remember everything.
          </p>
        </section>

        <section className="automations-card automations-section">
          <h2>FAQ</h2>
          <div className="automations-faq">
            <div className="automations-faq-item">
              <h3>Is this beginner-friendly?</h3>
              <p>Yes. Start with the free three automations. The paid Vault includes setup guidance, templates, and a walkthrough video.</p>
            </div>
            <div className="automations-faq-item">
              <h3>Which tools will I need?</h3>
              <p>Each workflow clearly lists the tools it uses and whether a free plan is available.</p>
            </div>
            <div className="automations-faq-item">
              <h3>Is this only for women?</h3>
              <p>No. The aesthetic is mine. The systems are for any busy brain.</p>
            </div>
            <div className="automations-faq-item">
              <h3>Is this a course?</h3>
              <p>No. It is a practical collection of automations, prompts, templates, and a walkthrough video.</p>
            </div>
            <div className="automations-faq-item">
              <h3>Will the price stay at $19?</h3>
              <p>No. This is the early launch price while I collect feedback and expand the Vault.</p>
            </div>
          </div>
        </section>

        <section id="free-guide" className="automations-card automations-section">
          <h2>your brain creates. the system remembers.</h2>
          <p className="automations-copy">Start with three free automations or get my complete system.</p>
          <AutomationsOptInForm compact />
        </section>

        <AutomationsFooter />
      </div>
    </main>
  );
}

function AutomationsThankYouPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'joined' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setAutomationsMetadata({
      title: 'Check Your Inbox | Vlada Kandyba',
      description: 'Your three Busy Brain automations are on the way. Join the Busy Brain Automation Vault waitlist for early access.',
      path: '/automations/thank-you',
    });
    trackAutomationEvent('automations_thank_you_viewed');
  }, []);

  const handleWaitlistClick = async () => {
    const storedEmail = typeof window !== 'undefined' ? window.sessionStorage.getItem('automationLeadEmail') || '' : '';
    trackAutomationEvent('vault_waitlist_cta_clicked');

    if (!storedEmail) {
      setStatus('error');
      setMessage('Add your email on the previous page first, then come back here.');
      return;
    }

    setStatus('loading');
    setMessage('Adding you to the presale list...');

    try {
      const response = await fetch(automationVaultWaitlistEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: storedEmail }),
      });
      const result = await response.json().catch(() => ({ success: false }));

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Waitlist endpoint failed');
      }

      setStatus('joined');
      setMessage('you’re on the list 🍒');
      trackAutomationEvent('vault_waitlist_joined');

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('automationVaultWaitlistJoined', 'true');
        window.location.href = `/automations/early-access-thanks${getPreservedSearchParams()}`;
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'I couldn’t add you yet. Please try again.');
      trackAutomationEvent('vault_waitlist_failed');
    }
  };

  return (
    <main className="automations-page">
      <BlogStyles />
      <AutomationsStyles />
      <div className="automations-shell">
        <header className="automations-nav">
          <a className="automations-logo" href="/">vladasanadev</a>
          <a className="automations-link" href="/automations">free guide</a>
        </header>

        <section className="automations-thank-you-shell">
          <div className="automations-card automations-thank-you-card">
            <h1 className="automations-title">check your inbox.</h1>
            <p className="automations-copy">
              Your 3 automations are on the way. Check spam in case the message got lost.
            </p>

            <div className="automations-offer-card">
              <span className="automations-eyebrow">limited presale</span>
              <h2>The Busy Brain Automation Vault</h2>
              <p className="automations-copy">
                Get every automation I actually use, including my prompts, templates, content systems, ADHD-friendly workflows, and a private setup walkthrough.
              </p>
              <div className="automations-offer-actions">
                {status === 'joined' ? (
                  <button className="automations-button is-disabled" type="button" disabled>
                    you’re on the list 🍒
                  </button>
                ) : (
                  <button className="automations-button" type="button" onClick={handleWaitlistClick} disabled={status === 'loading'}>
                    {status === 'loading' ? 'adding you...' : 'I want early access'}
                  </button>
                )}
                <p className="automations-vault-status" role={status === 'error' ? 'alert' : 'status'}>
                  {message}
                </p>
              </div>
            </div>
          </div>
        </section>

        <AutomationsFooter supportEmail="support@vladasana.com" />
      </div>
    </main>
  );
}

function AutomationsEarlyAccessThanksPage() {
  useEffect(() => {
    setAutomationsMetadata({
      title: 'Early Access Confirmed | Vlada Kandyba',
      description: 'You are on the Busy Brain Automation Vault early access list. Details are coming soon.',
      path: '/automations/early-access-thanks',
    });
    trackAutomationEvent('vault_waitlist_thanks_viewed');
  }, []);

  return (
    <main className="automations-page">
      <BlogStyles />
      <AutomationsStyles />
      <div className="automations-shell">
        <header className="automations-nav">
          <a className="automations-logo" href="/">vladasanadev</a>
          <a className="automations-link" href="/automations">free guide</a>
        </header>

        <section className="automations-thank-you-shell">
          <div className="automations-card automations-thank-you-card">
            <span className="automations-eyebrow">early access</span>
            <h1 className="automations-title">thanks, you’re on the list.</h1>
            <p className="automations-copy">
              I’ll share the Vault details soon. For now, check your inbox for the 3 free automations and keep an eye on spam.
            </p>
          </div>
        </section>

        <AutomationsFooter supportEmail="support@vladasana.com" />
      </div>
    </main>
  );
}

function AutomationVaultPage() {
  useEffect(() => {
    setAutomationsMetadata({
      title: 'Automation Vault | Vlada Kandyba',
      description: 'The Busy Brain Automation Vault, a complete $19 system of automations, prompts, templates, and setup notes by Vlada Kandyba.',
      path: '/automations/vault',
    });
    trackAutomationEvent('vault_offer_viewed');
  }, []);

  const skipHref = withPreservedParams(automationFreeArticleUrl);

  const handleCheckoutClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    trackAutomationEvent('vault_presale_cta_clicked');
    window.location.href = `/automations${getPreservedSearchParams()}#free-guide`;
  };

  const handleSkipClick = () => {
    trackAutomationEvent('vault_offer_skipped');
    trackAutomationEvent('free_article_opened');
  };

  return (
    <main className="automations-page">
      <BlogStyles />
      <AutomationsStyles />
      <div className="automations-shell">
        <header className="automations-nav">
          <a className="automations-logo" href="/">vladasanadev</a>
          <a className="automations-link" href="/automations">free guide</a>
        </header>

        <section className="automations-vault-grid">
          <div className="automations-card automations-hero-card">
            <span className="automations-eyebrow">one more thing before you go</span>
            <h1 className="automations-title is-offer">your brain is for ideas.</h1>
            <p className="automations-copy">
              The Vault is my full creator system for prompts, templates, content workflows, and the repetitive tasks I do not want to keep in my head.
            </p>
            <div className="automations-visual">
              <div className="automations-window">
                <strong>private walkthrough video</strong>
                <span>Placeholder for your walkthrough preview. Upload the real video screenshot when ready.</span>
              </div>
              <div className="automations-window">
                <strong>workflow screenshots</strong>
                <span>Placeholder for automation workflow screens, content-brain views, prompts, and templates.</span>
              </div>
              <div className="automations-window">
                <strong>Automation Vault</strong>
                <span>Everything grouped into one practical creator system, not another pile of tabs.</span>
              </div>
            </div>
          </div>

          <aside className="automations-vault-image-card" aria-label="Busy Brain Automation Vault preview">
            <img
              className="automations-vault-image"
              src="/automations-assets/busy-brain-vault-phones.png"
              alt="Busy Brain Automation Vault phone previews"
            />
          </aside>
        </section>

        <section className="automations-card automations-section">
          <span className="automations-eyebrow">special launch offer</span>
          <h2>The Busy Brain Automation Vault</h2>
          <p className="automations-copy">all my automations. one system. $19 full package with Vlada.</p>
          <p className="automations-muted">
            Get every automation I actually use, plus a private walkthrough video showing you how I set everything up.
          </p>
          <p className="automations-price">$19</p>
          <p className="automations-muted">presale price. No payment is open yet.</p>
          <div className="automations-actions">
            <a
              className="automations-button"
              href="/automations#free-guide"
              onClick={handleCheckoutClick}
            >
              get the free guide first
            </a>
          </div>
          <a className="automations-skip" href={skipHref} onClick={handleSkipClick}>
            no thanks, take me to the 3 free automations
          </a>
        </section>

        <AutomationsFooter supportEmail="support@vladasana.com" />
      </div>
    </main>
  );
}

function AutomationsSuccessPage() {
  useEffect(() => {
    setAutomationsMetadata({
      title: 'Automation Vault Confirmed | Vlada Kandyba',
      description: 'Your Busy Brain Automation Vault purchase is confirmed. Access details have been sent by email.',
      path: '/automations/success',
    });
    trackAutomationEvent('purchase_success');
    trackAutomationEvent('vault_purchase_completed');
  }, []);

  return (
    <main className="automations-page">
      <BlogStyles />
      <AutomationsStyles />
      <div className="automations-shell">
        <section className="automations-card">
          <span className="automations-eyebrow">purchase confirmed</span>
          <h1 className="automations-title is-offer">you are in the Vault</h1>
          <p className="automations-copy">
            Access has been sent to your email. If it does not arrive, check spam first, then email support@vladasana.com.
          </p>
          <div className="automations-actions">
            <a className="automations-button" href={automationFreeArticleUrl}>open the free automations guide</a>
            <a className="automations-button is-secondary" href="/">back to portfolio</a>
          </div>
        </section>
      </div>
    </main>
  );
}

function TechBlogIndexPage() {
  const [activeTag, setActiveTag] = useState<'all' | 'content' | 'techinterview'>('all');
  const visiblePosts = activeTag === 'all' ? blogPosts : blogPosts.filter(post => post.tag === activeTag);

  return (
    <main
      className="tech-blog-page min-h-screen bg-black text-white"
      style={{ fontFamily: '"Space Grotesk", "Inter", sans-serif' }}
    >
      <BlogStyles />
      <div
        className="tech-blog-bg relative min-h-screen overflow-hidden px-8 py-10"
        style={{ background: '#3D3982' }}
      >
        <div className="relative z-10 grid min-h-[calc(100vh-80px)] grid-rows-[auto_1fr_auto] gap-10">
          <div className="flex items-start justify-between gap-6">
            <a
              href="/"
              style={{
                fontSize: '0.6rem',
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.58)',
                textTransform: 'uppercase',
                textDecoration: 'none',
                lineHeight: 1.5,
              }}
            >
              vladasanadev
            </a>
            <p className="blog-secondary-text" style={{ textAlign: 'right' }}>
              Portfolio<br />blog
            </p>
          </div>

          <div className="tech-blog-index-layout">
            <h1 className="blog-display-title">BLOG</h1>
          <div className="tech-tag-filter" aria-label="Filter blog articles by tag">
              {[
                { label: 'all', value: 'all' },
                { label: '#content', value: 'content' },
                { label: '#techinterview', value: 'techinterview' },
              ].map(filter => (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={activeTag === filter.value}
                  onClick={() => setActiveTag(filter.value as 'all' | 'content' | 'techinterview')}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="tech-post-grid">
              {visiblePosts.map(post => (
                <a className="tech-post-card" href={post.href} data-tags={post.tag} key={post.href}>
                  <div>
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                    <div className="tech-post-tags" aria-label="Article tags">
                      <span className="tech-post-tag">#{post.tag}</span>
                    </div>
                  </div>
                  <div className="tech-post-meta">
                    <small>{post.date}</small>
                    <small>Read article</small>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AiAgentsPostPage() {
  return (
    <main
      className="tech-blog-page min-h-screen bg-black text-white"
      style={{ fontFamily: '"Space Grotesk", "Inter", sans-serif' }}
    >
      <BlogStyles />
      <div
        className="tech-blog-bg relative min-h-screen overflow-hidden px-8 py-10"
        style={{ background: '#3D3982' }}
      >
        <div className="relative z-10 grid min-h-[calc(100vh-80px)] grid-rows-[auto_1fr_auto] gap-10">
          <div className="flex items-start justify-between gap-6">
            <a className="blog-secondary-text" href="/techblog" style={{ color: 'rgba(255,255,255,0.58)', textDecoration: 'none' }}>
              back to blog
            </a>
            <a className="blog-secondary-text" href="https://claude.ai/" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.72)', textAlign: 'right', textDecoration: 'none' }}>
              start today
            </a>
          </div>

          <article className="article-shell">
            <h1 className="blog-display-title ai-agents-display-title">
              3 Simple AI Agents That Run My <span className="ai-agents-title-highlight">Content</span>
            </h1>
            <div className="article-card">
              <section className="article-section">
                <h2>A tiny AI content team</h2>
                <p>
                  A tiny AI content team you can set up without becoming an automation engineer. Three copy-paste Claude
                  agents for the morning brief, email replies, and a 24-hour viral content report.
                </p>
              </section>

              <section className="article-section">
                <h2>What you actually need</h2>
                <p>Four things. Nothing fancy.</p>
                <div className="article-need-grid">
                  <div className="article-need-item">
                    <span>01</span>
                    <h3>A Claude account</h3>
                    <p>Free to start. Connectors work on any plan.</p>
                  </div>
                  <div className="article-need-item">
                    <span>02</span>
                    <h3>Gmail, Calendar and Drive</h3>
                    <p>All three connected to Claude from Settings {'→'} Connectors.</p>
                  </div>
                  <div className="article-need-item">
                    <span>03</span>
                    <h3>A paid Claude plan</h3>
                    <p>Only if you want the agents to run on a schedule. Pro, Max, Team or Enterprise.</p>
                  </div>
                  <div className="article-need-item">
                    <span>04</span>
                    <h3>A free Apify account</h3>
                    <p>For agent 3 (the viral content scout). Usage can cost extra.</p>
                  </div>
                </div>
                <div className="article-note">
                  <p>
                    Google Workspace connectors are available to all Claude users, but Cowork scheduled tasks require
                    a paid Claude plan: Pro, Max, Team or Enterprise.
                  </p>
                </div>
              </section>

              <section className="article-section">
                <p className="article-kicker">01 · Agent 01</p>
                <h2>Morning Brief</h2>
                <p>Wake up to one calm page instead of five apps shouting your name.</p>
                <ol>
                  <li>Connect your tools. In Claude, open Settings {'→'} Connectors. Connect Gmail and Google Calendar.</li>
                  <li>Paste the prompt. Use it manually whenever you need a brief. No technical setup required.</li>
                  <li>Optional: schedule it. In Cowork, type /schedule, or open Scheduled {'→'} New task. Set it for weekdays at your preferred morning time.</li>
                </ol>
                <p className="article-kicker">Copy-paste prompt</p>
                <CopyablePrompt
                  label="morning brief prompt"
                  text={`Use my connected Gmail and Google Calendar to create my morning brief for today.

Include:
- today's meetings in chronological order, with times, attendees and any preparation I should do
- emails that are urgent, need a reply, contain approvals, deadlines or collaboration updates
- the three most important actions for today
- anything important I may have missed during the last 24 hours

Keep it concise and easy to scan. Do not send emails, edit calendar events or take any external action without my explicit approval.`}
                />
                <div className="article-two-col">
                  <div className="article-mini-card">
                    <p className="article-kicker">Input</p>
                    <p>Gmail + Google Calendar</p>
                  </div>
                  <div className="article-mini-card">
                    <p className="article-kicker">Output</p>
                    <p>Meetings, urgent messages and your top three priorities</p>
                  </div>
                </div>
                <p>Best first move: run this manually tomorrow morning. Schedule it only after you like the format.</p>
              </section>

              <section className="article-section">
                <p className="article-kicker">02 · Agent 02</p>
                <h2>Email Answer Agent</h2>
                <p>Claude handles the blank-page part. You remain the final boss of Send.</p>
                <div className="article-note">
                  <p>Recommended cadence. Run at 08:00 and again at 15:00. Create two daily scheduled tasks using the same prompt, one for each time.</p>
                </div>
                <p className="article-kicker">Copy-paste prompt</p>
                <CopyablePrompt
                  label="email answer prompt"
                  text={`Use my connected Gmail. Check new emails and active threads that need a reply.

For each email:
- summarize the context in one sentence
- tell me exactly what the sender needs
- draft a concise reply in my natural tone
- flag missing information, deadlines, money, contracts or anything sensitive

Never send, archive, delete, label or modify any email. Prepare draft text only and wait for my approval.`}
                />
                <div className="article-note">
                  <p>
                    The safety rule. Keep the scheduled task draft-only. A useful email agent removes typing, not judgment.
                    Review names, numbers, deadlines and attachments before sending anything.
                  </p>
                </div>
                <div className="article-two-col">
                  <div className="article-mini-card">
                    <p className="article-kicker">What Claude does</p>
                    <ul>
                      <li>Reads the thread</li>
                      <li>Explains the ask</li>
                      <li>Writes the reply</li>
                    </ul>
                  </div>
                  <div className="article-mini-card">
                    <p className="article-kicker">What you do</p>
                    <ul>
                      <li>Check the context</li>
                      <li>Add missing facts</li>
                      <li>Approve and send</li>
                    </ul>
                  </div>
                </div>
                <div className="article-note">
                  <p>
                    Little win for today: Connect Gmail and Google Calendar, paste the Morning Brief prompt,
                    and run it once manually. That gives you a useful win before you touch the more technical setup.
                  </p>
                  <div className="article-cta-row">
                    <a className="article-button" href="https://claude.ai/" target="_blank" rel="noreferrer">Start today</a>
                  </div>
                </div>
              </section>

              <section className="article-section">
                <p className="article-kicker">03 · Agent 03</p>
                <h2>24H Viral Content Agent</h2>
                <p>
                  This one needs two pipes. A prompt cannot see your industry by telepathy, so we connect it to real
                  sources and real performance data.
                </p>
                <p>What it does:</p>
                <ul>
                  <li>Scan public content in your niche from the last 24 hours or seven days.</li>
                  <li>Find breakout posts and explain the hook, format, topic and visual pattern.</li>
                  <li>Compare market patterns with your own content performance.</li>
                  <li>Suggest original ideas instead of copying somebody else's script.</li>
                </ul>
              </section>

              <section className="article-section">
                <h2>Pipe 1: connect Apify (powers the scout)</h2>
                <ol>
                  <li>Create an account. Open <a href="https://apify.com" target="_blank" rel="noreferrer">apify.com</a> and create a free account. Apify is a platform full of ready-made web scrapers called Actors. MCP simply means a connector Claude can use as a tool.</li>
                  <li>Connect it to Claude. In Claude Desktop, go to Settings {'→'} Connectors {'→'} Add custom connector and use https://mcp.apify.com. Sign in when the browser opens.</li>
                  <li>Use it in Claude Code. Run /plugins, add the Apify Claude Code plugin marketplace, install the Apify plugin, then run /mcp to enable and authenticate it.</li>
                </ol>
                <p>Apify plugin marketplace: <a href="https://github.com/apify/apify-claude-code-plugin" target="_blank" rel="noreferrer">github.com/apify/apify-claude-code-plugin</a></p>
                <p>
                  What the scout can use: Ask Claude to choose the right Apify Actor for each source, a website crawler
                  for newsletters and industry sites, an X scraper for expert voices, and Instagram or TikTok scrapers
                  for public post metrics. Scraper availability, platform rules and pricing can change, so review the Actor before running it.
                </p>
              </section>

              <section className="article-section">
                <h2>Pipe 2: build a performance sheet</h2>
                <p>
                  The analyst needs memory. Your Google Sheet becomes the boring-but-brilliant record it can study across months.
                </p>
                <p>
                  One row per post: date · platform · creator · post URL · hook · format · topic · views · likes · comments · shares / saves · notes
                </p>
                <ol>
                  <li>Start with public metrics. Schedule an Apify Instagram or TikTok profile scraper to run daily and capture new posts, views, likes and comments. TikTok may expose shares; Instagram public fields can be more limited.</li>
                  <li>Send the data to Google Sheets. Use an Apify integration, Make or Albato to append each result as a new row. Begin simple. Add platform APIs later if you need private account metrics.</li>
                  <li>Connect Google Drive. In Claude, connect Google Drive so the analyst can read the Sheet every time it runs.</li>
                </ol>
              </section>

              <section className="article-section">
                <p className="article-kicker">Claude Code / Cowork prompt</p>
                <CopyablePrompt
                  label="viral content analyst prompt"
                  text={`You are my 24H Viral Content Analyst.

Use Apify to collect top-performing public content from [YOUR NICHE] from the last 24 hours. Expand to seven days if the sample is too small.

Use my connected Google Drive to read [SHEET NAME], which contains my own post history and metrics.

Create a report with:
1. ten breakout posts, including creator, link, views and engagement signals
2. the hook, format, topic and visual pattern behind each post
3. repeated patterns across the market
4. which patterns match or contradict my own performance
5. five original ideas for me, each with a hook, format, angle and reason it could work

Do not copy scripts. Clearly separate evidence from your guesses. Save the report as [FOLDER]/viral-report-YYYY-MM-DD.md.`}
                />
              </section>

              <section className="article-section">
                <p className="article-kicker">Make it run without you</p>
                <h2>Schedule, costs and the honest version</h2>
                <p>
                  The sleep magic comes from the schedule plus the connections. The prompt alone is only a very polite instruction sitting on a chair.
                </p>
                <p>Where to schedule:</p>
                <ul>
                  <li>Cowork: open Scheduled {'→'} New task, or type /schedule inside a Cowork task.</li>
                  <li>Claude Code: create a cloud routine from the web, Desktop app, or /schedule in the CLI.</li>
                  <li>Remote Cowork tasks and Claude Code cloud routines can run while your laptop is closed.</li>
                  <li>No schedule yet? Run the same prompts manually. The output is the same, you press go.</li>
                </ul>
              </section>

              <section id="start" className="article-section">
                <h2>Start today</h2>
                <p>
                  Connect Gmail and Google Calendar, paste the Morning Brief prompt, and run it once manually.
                  That gives you a useful win before you touch the more technical setup.
                </p>
                <div className="article-cta-row">
                  <a className="article-button" href="https://claude.ai/" target="_blank" rel="noreferrer">Done, I&apos;m starting</a>
                  <a className="article-button" href="https://www.instagram.com/vlada.asana/" target="_blank" rel="noreferrer">Instagram: @vlada.asana</a>
                  <a className="article-button" href="https://docs.google.com/forms/d/e/1FAIpQLSezqkTT8Htx6nAKedL4nRbl8qUwlBEd8C-SNsIqIGUQWhVWSA/viewform" target="_blank" rel="noreferrer">Request a consultation</a>
                </div>
                <p className="article-kicker">Built by @vlada.asana · 3 simple agents that run my content</p>
              </section>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}

function LazymaxxingVideoEditPostPage() {
  const consultationFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSezqkTT8Htx6nAKedL4nRbl8qUwlBEd8C-SNsIqIGUQWhVWSA/viewform';
  const instagramUrl = 'https://www.instagram.com/vlada.asana/';
  const higgsfieldDemoUrl = 'https://higgsfield.ai/s/higgsfield-app-builder-x-fable-5-vlada.asana-vIRDqG';

  return (
    <main
      className="tech-blog-page min-h-screen bg-black text-white"
      style={{ fontFamily: '"Space Grotesk", "Inter", sans-serif' }}
    >
      <BlogStyles />
      <div
        className="tech-blog-bg relative min-h-screen overflow-hidden px-8 py-10"
        style={{ background: '#3D3982' }}
      >
        <div className="relative z-10 grid min-h-[calc(100vh-80px)] grid-rows-[auto_1fr_auto] gap-10">
          <div className="flex items-start justify-between gap-6">
            <a className="blog-secondary-text" href="/techblog" style={{ color: 'rgba(255,255,255,0.58)', textDecoration: 'none' }}>
              back to blog
            </a>
            <a className="blog-secondary-text" href="#start" style={{ color: 'rgba(255,255,255,0.72)', textAlign: 'right', textDecoration: 'none' }}>
              start now
            </a>
          </div>

          <article className="article-shell">
            <h1 className="blog-display-title article-display-title">Lazymaxxing Video Edit</h1>
            <div className="article-card">
              <section className="article-section">
                <div className="article-note">
                  <p>
                    <strong>Heads up.</strong> This is a free guide. I make tech video campaigns for brands and
                    clients (cinematic product films, UGC ads, brand identity, the whole thing). Want a custom
                    creative direction or a campaign built for your brand? Request a consultation from me through{' '}
                    <a href={consultationFormUrl} target="_blank" rel="noreferrer">this short form</a> and I will get back to you.
                  </p>
                </div>
              </section>

              <section className="article-section">
                <p>
                  A free guide by{' '}
                  <a href={instagramUrl} target="_blank" rel="noreferrer">@vlada.asana</a>
                </p>
                <p className="article-kicker">For creators</p>
                <h2>My simple guide for lazy editing</h2>
                <p>
                  A free, no-fluff guide for shipping a Higgsfield video without becoming a video editor.
                </p>
              </section>

              <section className="article-section">
                <h2>What you will need</h2>
                <p>Four things. Nothing fancy.</p>
                <div className="article-need-grid">
                  <div className="article-need-item">
                    <span>01</span>
                    <h3>Claude</h3>
                    <p>To analyze the reference and break your script into scenes.</p>
                  </div>
                  <div className="article-need-item">
                    <span>02</span>
                    <h3>Higgsfield Seedance</h3>
                    <p>To generate each scene as an 8 to 10 second video clip.</p>
                  </div>
                  <div className="article-need-item">
                    <span>03</span>
                    <h3>A reference video</h3>
                    <p>Any clip whose style you want to steal. From Reels, YouTube, anywhere.</p>
                  </div>
                  <div className="article-need-item">
                    <span>04</span>
                    <h3>Your script</h3>
                    <p>The words you want in the final video.</p>
                  </div>
                </div>
              </section>

              <section className="article-section">
                <p className="article-kicker">01 · Step 01</p>
                <h2>Find your reference video</h2>
                <p>Start with the look you love.</p>
                <ul>
                  <li>Go to Instagram Reels or YouTube.</li>
                  <li>Search: <code>kinetic typography reel</code>, <code>motion design short</code>, or <code>AI video edit style</code>.</li>
                  <li>Find 1 or 2 videos with the energy you want. Screen-record or save the file.</li>
                </ul>
              </section>

              <section className="article-section">
                <p className="article-kicker">02 · Step 02</p>
                <h2>Open Claude and upload your reference</h2>
                <p>Let AI read the style for you.</p>
                <p>Open Claude. Upload your reference video (or screenshots from it). Paste your script too. Then paste this prompt:</p>
                <p className="article-kicker">Copy-paste prompt</p>
                <CopyablePrompt
                  label="Higgsfield reference analysis prompt"
                  text={`I'm attaching a reference video and my script. I want to recreate this video's STYLE for my own script using Higgsfield.

Step 1: Analyze the reference video. Describe:
- Animation style (2D, 3D, kinetic typography, flat design)
- How things move (speed, easing, bounce, snappy or smooth)
- Transitions (cuts, wipes, morphs, zooms)
- Color palette and background
- Typography style and where text appears
- Camera behavior (static, zoom, pan, shake)
- Overall mood and pacing
- Sound feel (whooshes, bass hits, music style)

Step 2: Break my script into scenes of 8 to 10 seconds each.

Step 3: For EACH scene, write one prompt that includes:
- What appears on screen and how it animates
- Exact text shown on screen (max 5 to 6 words)
- Colors, background, and typography matching the reference
- Camera movement and transition into the next scene
- Sound effects and music mood

Here is my script:

[PASTE YOUR SCRIPT HERE]`}
                />
              </section>

              <section className="article-section">
                <p className="article-kicker">03 · Step 03</p>
                <h2>Copy your scene prompts</h2>
                <p>Adjust here.</p>
                <p>
                  Claude will give you one prompt per scene. Each scene is 8 to 10 seconds, the max Higgsfield
                  generates per clip. You will get something like:
                </p>
                <div className="article-note">
                  <p><strong>Scene 1.</strong> Hook 0 to 8 sec. Bold text slams in. Bass hit. Dark background.</p>
                  <p><strong>Scene 2.</strong> Proof 8 to 17 sec. Glitch transition. Zoom punch on key word.</p>
                  <p><strong>Scene 3.</strong> Breakdown 17 to 25 sec. Sticker icons pop in. Paper slap sound.</p>
                  <p><strong>Scene 4.</strong> CTA 25 to 35 sec. Spin FX. Text bounces. Crowd cheer.</p>
                </div>
                <p>Copy each prompt. You will paste them one at a time into Higgsfield.</p>
              </section>

              <section className="article-section">
                <p className="article-kicker">04 · Step 04</p>
                <h2>Generate in Higgsfield</h2>
                <p>One scene at a time.</p>
                <ul>
                  <li>Open Higgsfield. Select the video model, Seedance.</li>
                  <li>Paste Scene 1 prompt. Attach your reference video. Hit generate. Repeat for every scene.</li>
                </ul>
                <div className="article-note">
                  <p><strong>Always attach your reference video to every generation.</strong></p>
                </div>
                <figure className="article-demo-figure">
                  <img
                    src="/blog-assets/lazymaxxing-higgsfield-demo.jpg"
                    alt="Higgsfield Seedance generation interface showing Vlada's generated vertical video clip"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption>
                    My Step 04 demo inside Higgsfield Seedance, scene prompt on the side, generated 9:16 video in the preview.
                  </figcaption>
                </figure>
              </section>

              <section className="article-section">
                <p className="article-kicker">05 · Step 05</p>
                <h2>Fix anything in plain language</h2>
                <p>Talk to it like a friend.</p>
                <p>If a scene looks wrong, just tell Higgsfield in chat. It will redo it.</p>
                <ul>
                  <li>Make the text bigger</li>
                  <li>Slow down the animation</li>
                  <li>Change the background to red</li>
                  <li>Add more glitch on the transition</li>
                </ul>
                <p>Keep the best version of each clip.</p>
              </section>

              <section className="article-section">
                <p className="article-kicker">06 · Step 06</p>
                <h2>Assemble in CapCut</h2>
                <p>Final polish.</p>
                <p>Drop all clips into CapCut. Arrange in order. Add music or voiceover. Export.</p>
                <div className="article-note">
                  <p>
                    <strong>If any text looks messy or wrong, fix it directly in CapCut.</strong> AI still struggles
                    with clean text sometimes. Always check before posting.
                  </p>
                </div>
              </section>

              <section id="start" className="article-section">
                <h2>That&apos;s it.</h2>
                <p>Save this and try it with your next video.</p>
                <div className="article-cta-row">
                  <a className="article-button" href={higgsfieldDemoUrl} target="_blank" rel="noreferrer">Done, I&apos;m starting</a>
                  <a className="article-button" href={instagramUrl} target="_blank" rel="noreferrer">Instagram: @vlada.asana</a>
                  <a className="article-button" href={consultationFormUrl} target="_blank" rel="noreferrer">Request a consultation</a>
                </div>
                <p className="article-kicker">Built by @vlada.asana · Lazymaxxing Video Edit</p>
              </section>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}

function EmbeddedGuidePostPage({ document, title }: { document: string; title: string }) {
  return (
    <iframe
      srcDoc={document}
      title={title}
      style={{
        width: '100%',
        maxWidth: '100%',
        height: '100dvh',
        display: 'block',
        border: 0,
        background: '#3D3982',
        overflow: 'hidden',
      }}
    />
  );
}

function GitGuidePostPage() {
  return (
    <EmbeddedGuidePostPage
      document={gitGuideDocument}
      title="Everything you need to know about Git"
    />
  );
}

function ApiGuidePostPage() {
  return (
    <EmbeddedGuidePostPage
      document={apiGuideDocument}
      title="Everything you need to know about API"
    />
  );
}

function DatabaseGuidePostPage() {
  return (
    <EmbeddedGuidePostPage
      document={databaseGuideDocument}
      title="Everything you need to know about Database Design"
    />
  );
}

function DockerGuidePostPage() {
  return (
    <EmbeddedGuidePostPage
      document={dockerGuideDocument}
      title="Everything you need to know about Docker"
    />
  );
}

function HarnessGuidePostPage() {
  return (
    <EmbeddedGuidePostPage
      document={harnessGuideDocument}
      title="Harness 101"
    />
  );
}

function ReactRoadmapGuidePostPage() {
  return (
    <EmbeddedGuidePostPage
      document={reactRoadmapGuideDocument}
      title="React 2026 Roadmap"
    />
  );
}

function TopClaudeSkillsGuidePostPage() {
  return (
    <EmbeddedGuidePostPage
      document={topClaudeSkillsGuideDocument}
      title="Top 5 Claude Skills"
    />
  );
}

function LandJobGuidePostPage() {
  return (
    <EmbeddedGuidePostPage
      document={landJobGuideDocument}
      title="Land a Job in 2026"
    />
  );
}

function ReviewingAiCodeGuidePostPage() {
  return (
    <EmbeddedGuidePostPage
      document={reviewingAiCodeGuideDocument}
      title="Reviewing AI-Generated Code"
    />
  );
}

function BehavioralGuidePostPage() {
  return (
    <EmbeddedGuidePostPage
      document={behavioralGuideDocument}
      title="Behavioral Interviews"
    />
  );
}

function ClaudeMdPostPage({
  copied,
  onCopy,
}: {
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <main
      className="claude-md-post min-h-screen bg-black text-white"
      style={{
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
        background: '#3D3982',
      }}
    >
      <BlogStyles />
      <div className="claude-post-wrap">
        <div className="claude-code-shell">
            <div className="claude-code-topbar">
              <div className="claude-window-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span>CLAUDE.md</span>
              <button
                type="button"
                className="claude-copy-button"
                onClick={onCopy}
                aria-label="Copy Claude.md"
              >
                {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="claude-code-block">
              <code>{claudeMdContent}</code>
            </pre>
        </div>

        <footer className="claude-post-footer">
          <a href="/">vladasanadev</a>
          <span>{claudeMdUpdatedAt}</span>
        </footer>
      </div>
    </main>
  );
}

export function PostureLanding() {
  const [mousePosition, setMousePosition] = useState({ x: -9999, y: -9999 });
  const [torchPosition, setTorchPosition] = useState({ x: -9999, y: -9999 });
  const [mouseTrail, setMouseTrail] = useState<TrailPoint[]>([]);
  const [audienceProjection, setAudienceProjection] = useState<'globe' | 'flat'>('globe');
  const [isClaudeCopied, setIsClaudeCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audienceGlobeRef = useRef<HTMLIFrameElement>(null);
  const rafRef = useRef<number>(0);
  const pendingPos = useRef({ x: -9999, y: -9999 });

  const sendAudienceProjection = useCallback((mode: 'globe' | 'flat') => {
    audienceGlobeRef.current?.contentWindow?.postMessage({ type: 'globe-mode', mode }, '*');
  }, []);

  const toggleAudienceProjection = useCallback(() => {
    setAudienceProjection(current => {
      const next = current === 'globe' ? 'flat' : 'globe';
      sendAudienceProjection(next);
      return next;
    });
  }, [sendAudienceProjection]);

  const handleCopyClaudeMd = useCallback(async () => {
    await navigator.clipboard.writeText(claudeMdContent);
    setIsClaudeCopied(true);
    window.setTimeout(() => setIsClaudeCopied(false), 1800);
  }, []);

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

  const currentPath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') || '/' : '/';

  if (currentPath === '/techblog/claude-dot-md') {
    return <ClaudeMdPostPage copied={isClaudeCopied} onCopy={handleCopyClaudeMd} />;
  }

  if (currentPath === '/techblog/3-simple-ai-agents-that-run-my-content') {
    return <AiAgentsPostPage />;
  }

  if (currentPath === '/techblog/lazymaxxing-video-edit') {
    return <LazymaxxingVideoEditPostPage />;
  }

  if (currentPath === '/techblog/everything-you-need-to-know-about-git') {
    return <GitGuidePostPage />;
  }

  if (currentPath === '/techblog/everything-you-need-to-know-about-api') {
    return <ApiGuidePostPage />;
  }

  if (currentPath === '/techblog/everything-you-need-to-know-about-database-design') {
    return <DatabaseGuidePostPage />;
  }

  if (currentPath === '/techblog/everything-you-need-to-know-about-docker') {
    return <DockerGuidePostPage />;
  }

  if (currentPath === '/techblog/harness-101') {
    return <HarnessGuidePostPage />;
  }

  if (currentPath === '/techblog/react-2026-roadmap') {
    return <ReactRoadmapGuidePostPage />;
  }

  if (currentPath === '/techblog/top-5-claude-skills') {
    return <TopClaudeSkillsGuidePostPage />;
  }

  if (currentPath === '/techblog/land-a-job-in-2026') {
    return <LandJobGuidePostPage />;
  }

  if (currentPath === '/techblog/reviewing-ai-generated-code') {
    return <ReviewingAiCodeGuidePostPage />;
  }

  if (currentPath === '/techblog/behavioral-interviews') {
    return <BehavioralGuidePostPage />;
  }

  if (currentPath === '/techblog') {
    return <TechBlogIndexPage />;
  }

  if (currentPath === '/automations') {
    return <AutomationsPage />;
  }

  if (currentPath === '/automations/vault') {
    return <AutomationVaultPage />;
  }

  if (currentPath === '/automations/thank-you') {
    return <AutomationsThankYouPage />;
  }

  if (currentPath === '/automations/early-access-thanks') {
    return <AutomationsEarlyAccessThanksPage />;
  }

  if (currentPath === '/automations/success') {
    return <AutomationsSuccessPage />;
  }

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

          .frame-story-card.is-contained .frame-story-iframe {
            top: 50%;
            bottom: auto;
            height: 84%;
            transform: translateY(-50%);
            background: #000;
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

          .frame-story-modal-card.is-contained .frame-story-modal-iframe {
            top: 50%;
            bottom: auto;
            height: 84%;
            transform: translateY(-50%);
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
image in broken on my main side          }

          .email-button:hover {
            background: rgba(255,255,255,0.1);
            box-shadow:
              inset 0 0 0 1px rgba(255,255,255,0.18),
              0 0 34px rgba(255,255,255,0.24),
              0 0 80px rgba(240,47,232,0.22);
            transform: translateY(-2px);
          }

          .work-options {
            width: min(100%, 860px);
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px 18px;
            margin-bottom: 22px;
          }

          .work-options span {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 24px;
            padding: 0;
            border: 0;
            border-radius: 0;
            background: transparent;
            color: rgba(255,255,255,0.84);
            backdrop-filter: none;
            font-family: "Space Grotesk", "Inter", sans-serif;
            font-size: clamp(0.72rem, 1.2vw, 1rem);
            font-weight: 400;
            letter-spacing: 0.04em;
            line-height: 1.2;
            text-transform: lowercase;
            text-shadow: 0 0 16px rgba(0,0,0,0.38);
            box-shadow: none;
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

          .portfolio-nav-tabs {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 5px;
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 999px;
            background: rgba(0,0,0,0.42);
            backdrop-filter: blur(14px);
            box-shadow: 0 0 28px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08);
          }

          .portfolio-nav-tabs a {
            min-height: 30px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 13px;
            border-radius: 999px;
            color: rgba(255,255,255,0.74);
            text-decoration: none;
            font-family: "Space Grotesk", "Inter", sans-serif;
            font-size: 0.56rem;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            transition: background 180ms ease, color 180ms ease, transform 180ms ease;
          }

          .portfolio-nav-tabs a:hover {
            color: rgba(0,0,0,0.9);
            background: rgba(255,255,255,0.9);
            transform: translateY(-1px);
          }

          .portfolio-hero-title-wrap {
            transform: translateY(-4vh);
            padding-left: 10px;
          }

          .portfolio-top-link {
            top: 66px !important;
            right: 50% !important;
            transform: translateX(50%);
            white-space: nowrap;
          }

          .claude-md-inner {
            grid-template-rows: auto 1fr auto;
          }

          .claude-md-layout {
            display: grid;
            grid-template-columns: minmax(240px, 0.72fr) minmax(420px, 1.28fr);
            align-items: center;
            gap: clamp(28px, 5vw, 78px);
            width: min(100%, 1280px);
            margin: 0 auto;
          }

          .claude-md-heading {
            display: grid;
            gap: 22px;
          }

          .claude-md-heading p {
            max-width: 440px;
            margin: 0;
            color: rgba(255,255,255,0.58);
            font-size: clamp(0.9rem, 1.2vw, 1.05rem);
            line-height: 1.8;
          }

          .claude-code-shell {
            overflow: hidden;
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,0.14);
            background: rgba(5,5,8,0.86);
            box-shadow:
              0 0 72px rgba(240,47,232,0.14),
              0 24px 90px rgba(0,0,0,0.62),
              inset 0 1px 0 rgba(255,255,255,0.1);
            backdrop-filter: blur(18px);
          }

          .claude-code-topbar {
            height: 48px;
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            gap: 14px;
            padding: 0 12px 0 16px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.54);
            font-family: monospace;
            font-size: 0.68rem;
            letter-spacing: 0.08em;
          }

          .claude-window-dots {
            display: flex;
            gap: 7px;
          }

          .claude-window-dots span {
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: rgba(255,255,255,0.24);
          }

          .claude-window-dots span:nth-child(1) {
            background: rgba(240,47,232,0.72);
          }

          .claude-window-dots span:nth-child(2) {
            background: rgba(245,255,114,0.72);
          }

          .claude-copy-button {
            justify-self: end;
            min-height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            padding: 0 12px;
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 999px;
            background: rgba(255,255,255,0.08);
            color: rgba(255,255,255,0.88);
            cursor: pointer;
            font-family: "Space Grotesk", "Inter", sans-serif;
            font-size: 0.62rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
          }

          .claude-copy-button:hover {
            transform: translateY(-1px);
            border-color: rgba(245,255,114,0.42);
            background: rgba(255,255,255,0.14);
          }

          .claude-code-block {
            max-height: min(62vh, 680px);
            margin: 0;
            padding: clamp(18px, 2.5vw, 30px);
            overflow: auto;
            color: rgba(236,238,246,0.92);
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
            font-size: clamp(0.72rem, 0.9vw, 0.88rem);
            line-height: 1.72;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            background:
              linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px),
              linear-gradient(180deg, rgba(255,255,255,0.035) 1px, transparent 1px);
            background-size: 34px 34px;
          }

          @media (max-width: 767px) {
            .hero-mobile-hide {
              display: none !important;
            }

            .portfolio-hero-title-wrap {
              transform: translateY(-8vh);
              padding-left: 0;
            }

            .portfolio-hero-title {
              font-size: clamp(2.35rem, 17vw, 4.85rem) !important;
              letter-spacing: 0.055em !important;
              text-align: center;
              width: min-content;
              max-width: calc(100vw - 28px);
              overflow-wrap: normal;
            }

            .portfolio-top-link {
              top: 70px !important;
              right: 50% !important;
              transform: translateX(50%);
              font-size: 0.52rem !important;
              letter-spacing: 0.14em !important;
            }

            .portfolio-nav-tabs {
              gap: 4px;
              max-width: calc(100vw - 24px);
            }

            .portfolio-nav-tabs a {
              min-height: 28px;
              padding: 0 9px;
              font-size: 0.48rem;
              letter-spacing: 0.1em;
            }

            .claude-md-inner {
              min-height: auto;
              padding: 28px 24px 36px;
            }

            .claude-md-layout {
              grid-template-columns: 1fr;
              gap: 28px;
            }

            .claude-code-topbar {
              grid-template-columns: auto 1fr auto;
            }

            .claude-code-topbar > span {
              justify-self: center;
            }

            .claude-code-block {
              max-height: 68vh;
            }

            .work-options {
              width: min(100%, 360px);
              flex-direction: column;
              align-items: center;
              gap: 8px;
              margin-bottom: 18px;
            }

            .work-options span {
              font-size: 0.7rem;
            }
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
        className="hero-mobile-hide absolute pointer-events-none"
        style={{ top: 28, left: 32, zIndex: 40 }}
      >
        <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.38)', fontSize: '0.58rem' }}>
          Craft tech content that<br />turns complex into<br />engaging
        </p>
      </div>

      {/* TOP RIGHT — work with me link */}
      <div
        className="portfolio-top-link absolute pointer-events-auto"
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

      <nav
        className="portfolio-nav-tabs absolute pointer-events-auto"
        aria-label="Portfolio sections"
        style={{ top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 45 }}
      >
        <a href="#tech-ai">Social Media</a>
        <a href="/techblog">Blog</a>
        <a href="#contact">Contact</a>
      </nav>

      {/* LEFT MIDDLE — vertical ASCII rule + label */}
      <div
        className="hero-mobile-hide absolute pointer-events-none"
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
        style={{ bottom: 44, left: 32, zIndex: 40, maxWidth: 420 }}
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
          Hello World, I&apos;m Vlada
        </h2>
        <p
          style={{
            fontFamily: '"Space Grotesk", "Inter", sans-serif',
            fontSize: '0.66rem',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.62,
            letterSpacing: '0.02em',
            marginBottom: 20,
          }}
        >
          I&apos;m a content creator, builder, and Developer Advocate creating videos and campaigns
          for a 30K+ audience of developers, AI users, founders, and tech professionals.
          I turn complex tools into practical stories, demos, and launches people actually understand.
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
        className="portfolio-hero-title-wrap absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 30 }}
      >
        {/* Blurred ghost layer */}
        <h1
          aria-hidden="true"
          className="portfolio-hero-title absolute tracking-wider select-none"
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
          className="portfolio-hero-title tracking-wider select-none"
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
        className="hero-mobile-hide absolute pointer-events-none"
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
        className="hero-mobile-hide absolute pointer-events-none"
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
        id="audience"
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
          className="audience-globe-frame absolute inset-0 z-10"
          style={{
            position: 'absolute',
            inset: 0,
            height: '100%',
            minHeight: '100vh',
            overflow: 'hidden',
            background: '#0a0a0a',
            boxShadow: '0 0 120px rgba(255,255,255,0.08)',
          }}
        >
          <GlobeMorph
            iframeRef={audienceGlobeRef}
            hex="#ffffff"
            ocean="#000000"
            bg="#000000"
            landOpacity={1}
            globeOpacity={0.5}
            density={500}
            onLoad={() => sendAudienceProjection(audienceProjection)}
          />
        </div>

        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 42%, transparent 0%, transparent 42%, rgba(0,0,0,0.22) 78%), linear-gradient(180deg, rgba(0,0,0,0.44), transparent 24%, transparent 68%, rgba(0,0,0,0.54))',
          }}
        />

        <div
          className="audience-mobile-stack relative z-40 flex min-h-screen flex-col justify-between gap-8 px-8 py-10"
          style={{ color: 'rgba(255,255,255,0.94)', pointerEvents: 'none' }}
        >
          <div className="audience-topline flex items-start justify-between gap-6">
            <span aria-hidden="true" />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', gap: 14 }}>
              <p style={{ ...labelStyle, color: 'rgba(255,255,255,0.58)', textAlign: 'right' }}>
                Actual audience data<br />top geographies
              </p>
              <button
                type="button"
                onClick={toggleAudienceProjection}
                aria-label={`Switch audience map to ${audienceProjection === 'globe' ? 'flat map' : 'globe'}`}
                style={{
                  pointerEvents: 'auto',
                  width: 46,
                  height: 46,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(0,0,0,0.48)',
                  color: 'rgba(255,255,255,0.92)',
                  cursor: 'pointer',
                  backdropFilter: 'blur(14px)',
                  boxShadow: '0 0 28px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
                  transition: 'transform 180ms ease, border-color 180ms ease, background 180ms ease',
                }}
              >
                {audienceProjection === 'globe' ? (
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a1 1 0 0 1-1.52.85l-2.82-1.73-3.14 1.76a1 1 0 0 1-.98 0L8.4 17.62l-2.88 1.74A1 1 0 0 1 4 18.5v-13Zm4.1.05-2.1 1.27v9.9l1.9-1.14a1 1 0 0 1 1.01-.01l2.1 1.18V6.86L8.92 5.7a1 1 0 0 0-.82-.15Zm4.9 1.3v9.9l2.08-1.16a1 1 0 0 1 1.01.02L18 16.77V6.82L15.9 5.55a1 1 0 0 0-.82.15L13 6.85Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 17.93A8.01 8.01 0 0 1 4.21 10.2L9 15v1a2 2 0 0 0 2 2v1.93Zm6.9-2.54A1.99 1.99 0 0 0 16 16h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2v-.41A8 8 0 0 1 17.9 17.39Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <GhostSectionTitle text="AUDIENCE" style={{ maxWidth: 900 }} />

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
        id="brands"
        className="relative overflow-hidden bg-black"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontFamily: '"Space Grotesk", "Inter", sans-serif',
          minHeight: 'clamp(360px, 48vh, 560px)',
        }}
      >
        <style>
          {`
            @keyframes clientMarquee {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }

            .client-marquee-window {
              width: 100%;
              overflow: hidden;
              -webkit-mask-image: linear-gradient(90deg, transparent, #000 11%, #000 89%, transparent);
              mask-image: linear-gradient(90deg, transparent, #000 11%, #000 89%, transparent);
            }

            .client-marquee-track {
              display: flex;
              align-items: center;
              gap: clamp(14px, 2vw, 26px);
              width: max-content;
              will-change: transform;
            }

            .client-marquee-window:hover .client-marquee-track {
              animation-play-state: paused;
            }

            .client-logo-card {
              transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1), border-color 420ms ease, box-shadow 420ms ease;
            }

            .client-logo-card:hover {
              transform: translateY(-6px) scale(1.04);
              border-color: rgba(245,255,114,0.38) !important;
              box-shadow: 0 28px 86px rgba(0,0,0,0.4), 0 0 42px rgba(245,255,114,0.12), inset 0 1px 0 rgba(255,255,255,0.16) !important;
            }

            .client-logo-hover-name {
              position: absolute;
              left: 10px;
              right: 10px;
              bottom: 10px;
              z-index: 4;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 24px;
              border-radius: 999px;
              background: rgba(0,0,0,0.72);
              color: rgba(255,255,255,0.92);
              opacity: 0;
              transform: translateY(5px);
              pointer-events: none;
              font-family: "Space Grotesk", "Inter", sans-serif;
              font-size: 0.52rem;
              font-weight: 700;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              transition: opacity 180ms ease, transform 180ms ease;
            }

            .client-logo-card:hover .client-logo-hover-name {
              opacity: 1;
              transform: translateY(0);
            }

            @media (max-width: 767px) {
              .client-marquee-track {
                gap: 12px;
              }
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
          className="relative z-40 flex flex-col justify-center gap-7 px-0 py-14 sm:py-16"
          style={{ color: 'rgba(255,255,255,0.94)' }}
        >
          <div style={{ display: 'grid', gap: 'clamp(14px, 2vw, 24px)' }}>
            {clientLogoRows.map((row, rowIndex) => (
              <div key={rowIndex} className="client-marquee-window">
                <div
                  className="client-marquee-track"
                  style={{
                    animation: `clientMarquee ${rowIndex === 0 ? 34 : 39}s linear infinite`,
                    animationDirection: rowIndex === 0 ? 'normal' : 'reverse',
                  }}
                >
                  {[...row, ...row].map((logo, index) => (
                    <ClientLogoTile key={`${logo.name}-${rowIndex}-${index}`} logo={logo} />
                  ))}
                </div>
              </div>
            ))}
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
        id="tech-ai"
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
            top: '70%',
            color: 'rgba(255,255,255,0.94)',
          }}
        >
          <div className="work-options">
            <span>#technology</span>
            <span>#developeradvocacy</span>
            <span>#videocampaigns</span>
          </div>
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
