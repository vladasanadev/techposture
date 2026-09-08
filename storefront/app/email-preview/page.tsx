import type { Metadata } from "next";
import Link from "next/link";
import { renderBundleEmailPreview } from "../../lib/commerce/email";

export const metadata: Metadata = {
  title: "Your bundle, delivered · Vladasana",
  description:
    "A preview of the email that brings your next chapter to your inbox.",
  robots: { index: false, follow: false },
};

export default function EmailPreviewPage() {
  const email = renderBundleEmailPreview();
  return (
    <main
      className="inbox-preview"
      style={{
        minHeight: "100vh",
        background: "#e8eef0",
        color: "#74111b",
        padding: "28px 20px 70px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <style>{`
        .inbox-preview * { box-sizing: border-box; }
        .inbox-preview-nav { max-width: 1080px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .inbox-preview-badge { border: 1px solid #bc9599; border-radius: 999px; padding: 8px 13px; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
        .inbox-preview-heading { font-size: clamp(43px, 7vw, 76px); line-height: .97; letter-spacing: -.065em; font-weight: 700; margin: 15px 0 18px; }
        .inbox-preview-frame { width: 100%; height: 1620px; display: block; border: 0; background: #e8eef0; }
        @media (max-width: 600px) {
          .inbox-preview { padding: 22px 0 40px !important; }
          .inbox-preview-nav { padding: 0 22px; }
          .inbox-preview-badge { max-width: 110px; font-size: 9px; line-height: 1.4; text-align: center; }
          .inbox-preview-frame { height: 1740px; }
          .inbox-preview-envelope { border-radius: 0 !important; box-shadow: none !important; }
        }
        @media (max-width: 380px) { .inbox-preview-frame { height: 1870px; } }
      `}</style>
      <nav className="inbox-preview-nav" aria-label="Preview navigation">
        <Link
          href="/"
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 30,
            letterSpacing: "-1.2px",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          vladasana
        </Link>
        <span className="inbox-preview-badge">Email design preview</span>
      </nav>
      <header
        style={{
          textAlign: "center",
          maxWidth: 640,
          margin: "70px auto 32px",
          padding: "0 24px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 10,
            letterSpacing: "2.2px",
            textTransform: "uppercase",
          }}
        >
          Your Get a Job Bundle
        </p>
        <h1 className="inbox-preview-heading">
          Your bundle,
          <br />
          delivered.
        </h1>
        <p
          style={{
            maxWidth: 390,
            margin: "0 auto",
            color: "#76565b",
            fontSize: 15,
            lineHeight: 1.65,
          }}
        >
          Your next chapter, beautifully delivered. Here’s a peek at the email
          that comes after checkout.
        </p>
      </header>
      <section
        className="inbox-preview-envelope"
        aria-label="Sample order email"
        style={{
          maxWidth: 668,
          margin: "0 auto",
          border: "1px solid #d5dfe2",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 22px 70px #4a354118",
        }}
      >
        <div
          style={{
            padding: "20px 25px",
            background: "#fffaf3",
            borderBottom: "1px solid #e3d4ca",
            fontSize: 12,
            lineHeight: 1.8,
          }}
        >
          <div>
            <span
              style={{ color: "#927c74", display: "inline-block", width: 58 }}
            >
              From
            </span>
            Vlada
          </div>
          <div>
            <span
              style={{ color: "#927c74", display: "inline-block", width: 58 }}
            >
              Subject
            </span>
            Your Get a Job Bundle is here
          </div>
        </div>
        <iframe
          className="inbox-preview-frame"
          title="Sample bundle delivery email. Downloading is disabled."
          srcDoc={email.html}
          sandbox=""
        />
      </section>
      <p
        style={{
          margin: "28px auto 0",
          maxWidth: 510,
          padding: "0 24px",
          textAlign: "center",
          fontSize: 12,
          lineHeight: 1.7,
          color: "#80676b",
        }}
      >
        This is a design preview with sample order details. No payment has been
        made, and the download button is disabled.
      </p>
      <p style={{ margin: "22px auto 0", textAlign: "center", fontSize: 14 }}>
        <Link href="/" style={{ color: "#74111b", textUnderlineOffset: 5 }}>
          ← Back to the bundle
        </Link>
      </p>
    </main>
  );
}
