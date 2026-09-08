"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import CheckoutDialog from "./CheckoutDialog";
import { ArrowLeft, ArrowRight, ChevronDown, X } from "lucide-react";
import {
  FIRST_RESOURCE,
  LAST_RESOURCE,
  RESOURCES,
  spreadName,
  visiblePages,
} from "./magazine/data";
import styles from "./magazine/Magazine.module.css";

const Scene = dynamic(() => import("./magazine/Scene"), { ssr: false });
function subscribeToMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
function getViewerCapability() {
  if (typeof window.WebGL2RenderingContext === "undefined") return 0;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 2;
}
function getServerCapability() {
  return 0;
}
class ViewerBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Magazine({
  initialPage = 1,
  price,
}: {
  initialPage?: number;
  price: number;
}) {
  const [page, setPage] = useState(
    Math.max(FIRST_RESOURCE, Math.min(LAST_RESOURCE, initialPage)),
  );
  const [nearViewport, setNearViewport] = useState(false);
  const [active, setActive] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [contextChecked, setContextChecked] = useState(false);
  const [ready, setReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const capability = useSyncExternalStore(
    subscribeToMotion,
    getViewerCapability,
    getServerCapability,
  );
  const staticView = capability < 2 || unavailable;
  const viewer = useRef<HTMLDivElement>(null);
  const reader = useRef<HTMLDialogElement>(null);
  const pages = visiblePages(page);

  useEffect(() => {
    const element = viewer.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNearViewport(true);
        setActive(entry.isIntersecting);
      },
      { rootMargin: "150px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!nearViewport || staticView || contextChecked) return;
    const frame = requestAnimationFrame(() => {
      try {
        const probe = document.createElement("canvas").getContext("webgl2");
        if (!probe) {
          setUnavailable(true);
          return;
        }
        probe.getExtension("WEBGL_lose_context")?.loseContext();
        setContextChecked(true);
      } catch {
        setUnavailable(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [nearViewport, staticView, contextChecked]);

  const onTurn = useCallback(
    (next: number) =>
      setPage(Math.max(FIRST_RESOURCE, Math.min(LAST_RESOURCE, next))),
    [],
  );
  const onReady = useCallback(() => setReady(true), []);
  const onUnavailable = useCallback(() => setUnavailable(true), []);
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (
      event.target instanceof HTMLElement &&
      event.target.closest("button, a, select")
    )
      return;
    const next =
      event.key === "ArrowRight"
        ? page + 1
        : event.key === "ArrowLeft"
          ? page - 1
          : event.key === "Home"
            ? FIRST_RESOURCE
            : event.key === "End"
              ? LAST_RESOURCE
              : null;
    if (next !== null) {
      event.preventDefault();
      onTurn(next);
    }
  }

  return (
    <div className={styles.magazine}>
      <div className={styles.heading}>
        <h2 id="inside-title">
          Less guesswork.
          <br /> <em>More ready.</em>
        </h2>
        <p>
          281 pages. 12 guides. A clear roadmap. Everything in one download.
        </p>
        <label className={styles.selector}>
          <select
            aria-label="Choose a resource preview"
            value={page}
            onChange={(event) => onTurn(Number(event.target.value))}
          >
            {RESOURCES.map((resource, index) => (
              <option value={index + 1} key={resource.slug}>
                {resource.title}
              </option>
            ))}
          </select>
          <ChevronDown size={20} aria-hidden="true" />
        </label>
        <div className={styles.benefit} aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={page}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
              transition={{ duration: 0.18 }}
            >
              <h3>{RESOURCES[page - 1].benefit}</h3>
              <p>{RESOURCES[page - 1].description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className={styles.purchase}>
          <CheckoutDialog price={price} />
        </div>
      </div>
      <motion.div
        className={styles.preview}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          ref={viewer}
          className={styles.viewer}
          role="region"
          aria-roledescription="interactive magazine"
          aria-label="Browse the Developer Job Search Playbook preview"
          aria-describedby="magazine-instructions"
          tabIndex={0}
          onKeyDown={onKeyDown}
          data-view={staticView ? "flat" : "3d"}
          data-ready={ready}
          data-spread={page}
        >
          {(staticView || !ready) && (
            <div className={styles.flatSpread}>
              {pages.map((item) => (
                <button
                  key={item.src}
                  onClick={() => reader.current?.showModal()}
                  aria-label={`Read ${item.title} at full size`}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    width="990"
                    height="1400"
                  />
                </button>
              ))}
            </div>
          )}
          {!staticView && nearViewport && contextChecked && (
            <div className={styles.canvas} aria-hidden="true">
              <ViewerBoundary onError={onUnavailable}>
                <Scene
                  page={page}
                  active={active}
                  onTurn={onTurn}
                  onReady={onReady}
                  onUnavailable={onUnavailable}
                />
              </ViewerBoundary>
            </div>
          )}
        </div>
        <div className={styles.bottom}>
          <div className={styles.tools}>
            <button onClick={() => reader.current?.showModal()}>
              Read sample pages
            </button>
          </div>
          <div className={styles.controls}>
            <button
              className={styles.arrow}
              onClick={() => onTurn(page - 1)}
              disabled={page === FIRST_RESOURCE}
              aria-label="Previous magazine spread"
            >
              <ArrowLeft size={19} strokeWidth={1.1} />
            </button>
            <p aria-live="polite" aria-atomic="true">
              <span className="sr-only">{spreadName(page)}. Preview </span>
              {String(page).padStart(2, "0")}
              <span className={styles.divider}>/</span>
              {LAST_RESOURCE}
            </p>
            <button
              className={styles.arrow}
              onClick={() => onTurn(page + 1)}
              disabled={page === LAST_RESOURCE}
              aria-label="Next magazine spread"
            >
              <ArrowRight size={19} strokeWidth={1.1} />
            </button>
          </div>
        </div>
        <p className={styles.sampleNote}>
          Actual covers & contents · 12 guides + roadmap
        </p>
      </motion.div>
      <p id="magazine-instructions" className="sr-only">
        Choose a resource or use the arrow buttons. Arrow keys also turn pages.
        Drag the 3D magazine to adjust your view. Read a sample opens larger,
        flat pages. These are actual covers and contents pages from the supplied
        guides.
      </p>
      <dialog
        ref={reader}
        className={styles.reader}
        aria-labelledby="reader-title"
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            reader.current?.close();
        }}
      >
        <div className={styles.readerHeader}>
          <div>
            <h3 id="reader-title">{spreadName(page)}</h3>
            <p>
              Actual cover and contents. Full guides included with purchase.
            </p>
          </div>
          <button
            aria-label="Close sample reader"
            onClick={() => reader.current?.close()}
            autoFocus
          >
            <X size={20} />
          </button>
        </div>
        <div className={styles.readerPages}>
          {pages.map((item) => (
            <figure key={item.src}>
              <img src={item.src} alt={item.alt} width="990" height="1400" />
              <figcaption>
                <a href={item.src} target="_blank" rel="noreferrer">
                  Open full-size page ↗
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </dialog>
    </div>
  );
}
