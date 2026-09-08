import Link from "next/link";
import type { ReactNode } from "react";
import PolicyNav from "./PolicyNav";
export default function PolicyPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="policy-page">
      <header className="policy-header">
        <Link href="/" className="quiet-wordmark">
          vladasana
        </Link>
        <PolicyNav />
      </header>
      <main className="policy-content">
        <Link className="policy-back" href="/">
          ← Back to the playbook
        </Link>
        <h1>{title}</h1>
        <p className="policy-intro">{intro}</p>
        {children}
      </main>
      <footer className="policy-footer">
        <p>Vladyslava Kandyba · Vladasana · Ukraine</p>
        <nav aria-label="Legal and support">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refunds">Refunds</Link>
          <Link href="/contact">Support</Link>
        </nav>
      </footer>
    </div>
  );
}
