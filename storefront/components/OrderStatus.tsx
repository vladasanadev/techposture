"use client";

import { storefrontPath } from "@/lib/site-path";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Mail } from "lucide-react";
import { PAYPAL_RECEIPT_EMAIL } from "@/lib/paypal-hosted";
type Status = { status: string; delivery: string; message: string };
export default function OrderStatus() {
  const params = useSearchParams();
  const token = params.get("order");
  const [result, setResult] = useState<{ token: string; value: Status } | null>(null);
  const [failure, setFailure] = useState<{ token: string; message: string } | null>(null);
  const status = result?.token === token ? result.value : null;
  const error = failure?.token === token ? failure.message : "";
  useEffect(() => {
    if (!token) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    let attempts = 0;
    async function update() {
      try {
        const result = await fetch(
          storefrontPath(`/api/orders/${encodeURIComponent(token!)}`),
          { signal: controller.signal, cache: "no-store" },
        );
        const value = await result.json();
        if (!result.ok)
          throw new Error(
            value.error ??
              "We couldn’t find that order. Please check the link in your email.",
          );
        if (stopped) return;
        setResult({ token: token!, value });
        attempts++;
        if (
          !["sent", "attention", "expired"].includes(value.status) &&
          attempts < 120
        )
          timer = setTimeout(update, 5000);
      } catch (e) {
        if (!stopped)
          setFailure({ token: token!, message: e instanceof Error
              ? e.message
              : "We couldn’t check your order. Please try again.",
          });
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
          src={storefrontPath("/images/quiet/hero.webp")}
          alt="The Developer Job Search Playbook in an oxblood folder"
          width="900"
          height="300"
        />
        <div className="order-body">
          <p className="eyebrow">YOUR NEXT MOVE IN TECH</p>
          <h1>
            {!token ? (
              <>Your next chapter.<br /><em>Let’s begin.</em></>
            ) : delivered ? (
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
            ) : error || ["attention", "expired"].includes(status?.status ?? "") ? (
              <>Let’s find<br /><em>your order.</em></>
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
              ? "Finished your PayPal checkout? Your payment receipt is your order reference. One more step gets your playbook to the right inbox."
              : error ||
                status?.message ||
                "We’re checking your payment securely. You don’t need to pay again."}
          </p>
          {!token && (
            <div className="order-next-step">
              <h2>Get your bundle by email</h2>
              <p>Send your PayPal receipt and preferred delivery email to <a href="mailto:Support@Vladasana.com">Support@Vladasana.com</a>. Vlada will check the payment and send your complete playbook, guides and worksheets.</p>
              <a className="order-receipt-button" href={PAYPAL_RECEIPT_EMAIL}>
                <Mail size={19} /> Send my PayPal receipt <ArrowUpRight size={18} />
              </a>
              <p className="order-verification-note">PayPal delivery is personally verified and isn’t instant. Returning to this page alone does not confirm payment.</p>
              <p className="order-verification-note">Paid with crypto? Use the private order link from your checkout to follow automatic delivery. For vLink, email your receipt to support.</p>
            </div>
          )}
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
          {delivered && <p>Look for an email from Support@Vladasana.com with your PDF and worksheets. Check spam or promotions if it hasn’t appeared yet.</p>}
          <p className="order-help">
            Need a hand?{" "}
            <a href="mailto:Support@Vladasana.com">Say hello to Vlada.</a>
          </p>
          <Link href="/" className="text-link">
            <ArrowLeft size={16} /> Back to the bundle
          </Link>
        </div>
      </section>
    </main>
  );
}
