"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Mail } from "lucide-react";
type Status = { status: string; delivery: string; message: string };
export default function OrderStatus() {
  const params = useSearchParams();
  const token = params.get("order");
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!token) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    let attempts = 0;
    async function update() {
      try {
        const result = await fetch(
          `/api/orders/${encodeURIComponent(token!)}`,
          { signal: controller.signal, cache: "no-store" },
        );
        const value = await result.json();
        if (!result.ok)
          throw new Error(
            value.error ??
              "We couldn’t find that order. Please check the link in your email.",
          );
        if (stopped) return;
        setStatus(value);
        attempts++;
        if (
          !["sent", "attention", "expired"].includes(value.status) &&
          attempts < 120
        )
          timer = setTimeout(update, 5000);
      } catch (e) {
        if (!stopped)
          setError(
            e instanceof Error
              ? e.message
              : "We couldn’t Check your order. Please try again.",
          );
      }
    }
    update();
    return () => {
      stopped = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [token]);
  const delivered = status?.status === "sent";
  const paid = ["paid", "delivering", "sent"].includes(status?.status ?? "");
  return (
    <main className="order-page">
      <Link href="/" className="wordmark">
        vladasana
      </Link>
      <section className="order-card">
        <img
          className="order-banner"
          src="/images/quiet/hero.webp"
          alt="The Get a Job Bundle in an oxblood folder"
          width="900"
          height="300"
        />
        <div className="order-body">
          <p className="eyebrow">YOUR GET A JOB BUNDLE</p>
          <h1>
            {delivered ? (
              <>
                Check your
                <br />
                <em>inbox.</em>
              </>
            ) : paid ? (
              <>
                Your bundle.
                <br />
                <em>On its way.</em>
              </>
            ) : (
              <>
                One
                <br />
                <em>moment.</em>
              </>
            )}
          </h1>
          <p role="status">
            {!token
              ? "This page needs your private order link. You’ll receive one when you check out."
              : error ||
                status?.message ||
                "We’re checking your payment securely. You don’t need to pay again."}
          </p>
          {status && (
            <div className="order-progress">
              <span className={paid ? "complete" : ""}>
                <Check size={15} />
                Payment {paid ? "confirmed" : "pending"}
              </span>
              <span className={delivered ? "complete" : ""}>
                <Mail size={15} />
                {delivered ? "Email sent" : "Email delivery pending"}
              </span>
            </div>
          )}
          <p className="order-help">
            Need a hand?{" "}
            <a href="mailto:hello.vladasana@gmail.com">Say hello to Vlada.</a>
          </p>
          <Link href="/" className="text-link">
            <ArrowLeft size={16} /> Back to the bundle
          </Link>
        </div>
      </section>
    </main>
  );
}
