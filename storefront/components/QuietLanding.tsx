"use client";

import { storefrontPath } from "@/lib/site-path";

import { useEffect, type PointerEvent } from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
} from "motion/react";
import PolicyNav from "./PolicyNav";
import Magazine from "./Magazine";
import CheckoutDialog from "./CheckoutDialog";

export default function QuietLanding({ price }: { price: number }) {
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 65, damping: 25 });
  const y = useSpring(pointerY, { stiffness: 65, damping: 25 });
  const lightX = useMotionValue(50);
  const lightY = useMotionValue(35);
  const light = useMotionTemplate`radial-gradient(ellipse at ${lightX}% ${lightY}%, #fff9e74d, transparent 55%)`;

  useEffect(() => {
    document.documentElement.classList.add("landing-scroll");
    return () => document.documentElement.classList.remove("landing-scroll");
  }, []);

  function followPointer(event: PointerEvent<HTMLElement>) {
    if (reducedMotion || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width;
    const py = (event.clientY - bounds.top) / bounds.height;
    pointerX.set((px - 0.5) * 22);
    pointerY.set((py - 0.5) * 12);
    lightX.set(px * 100);
    lightY.set(py * 100);
  }

  return (
    <div className="quiet-site">
      <a className="skip-link" href="#inside">
        Skip to the bundle preview
      </a>
      <main>
        <section
          id="buy"
          className="quiet-hero"
          aria-labelledby="hero-title"
          onPointerMove={followPointer}
          onPointerLeave={() => {
            pointerX.set(0);
            pointerY.set(0);
            lightX.set(50);
            lightY.set(35);
          }}
        >
          <motion.div className="quiet-art" aria-hidden="true" style={{ x, y }}>
            <img
              src={storefrontPath("/images/quiet/hero.webp")}
              alt=""
              width="1866"
              height="843"
              fetchPriority="high"
            />
          </motion.div>
          <motion.div
            className="quiet-light"
            aria-hidden="true"
            style={{ background: light }}
          />
          <header className="quiet-header">
            <Link
              href="/"
              className="quiet-wordmark"
              aria-label="Vladasana home"
            >
              vladasana
            </Link>
            <PolicyNav />
          </header>
          <motion.div
            className="quiet-hero-copy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 id="hero-title">
              Get noticed.
              <br />
              <em>Get prepared.</em>
            </h1>
            <p className="quiet-description">
              The Developer Job Search Playbook.
              <br />
              12 practical guides to sharpen your CV and prepare for tech
              interviews.
            </p>
            <CheckoutDialog price={price} />
            <p className="quiet-payment-note">
              PDFs + worksheets. One payment. 7-day refunds.
            </p>
          </motion.div>
          <a
            className="quiet-explore"
            href="#inside"
            aria-label="Explore the playbook and twelve guides"
          >
            <ArrowDown size={22} />
          </a>
        </section>
        <section
          id="inside"
          className="quiet-inside"
          aria-labelledby="inside-title"
        >
          <Magazine initialPage={1} price={price} />
          <footer className="quiet-footer">
            <Link href="/bundle">What’s included</Link>
            <nav aria-label="Legal and support">
              <Link href="/terms">Terms</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/refunds">Refunds</Link>
              <Link href="/contact">Support</Link>
            </nav>
          </footer>
        </section>
      </main>
    </div>
  );
}
