"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, LoaderCircle, LockKeyhole } from "lucide-react";
import { PAYPAL_HOSTED, PAYPAL_SDK_URL } from "@/lib/paypal-hosted";

declare global {
  interface Window {
    paypal?: {
      HostedButtons: (options: { hostedButtonId: string }) => {
        render: (selector: string) => Promise<unknown> | void;
      };
    };
  }
}

export default function PayPalHostedCheckout({
  available,
}: {
  available: boolean;
}) {
  const id = `paypal-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const container = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!available || loaded || !PAYPAL_SDK_URL) return;
    const timeout = setTimeout(() => setFailed(true), 15000);
    return () => clearTimeout(timeout);
  }, [available, loaded]);

  useEffect(() => {
    const element = container.current;
    if (!available || !sdkReady || !element) return;
    let active = true;
    Promise.resolve()
      .then(() => {
        if (!active) return;
        if (!window.paypal?.HostedButtons) throw new Error("PayPal unavailable");
        // HostedButtons owns capture. It has no documented payment-success
        // callback: never mark an order paid or dispatch files from this embed.
        return window.paypal
          .HostedButtons({ hostedButtonId: PAYPAL_HOSTED.buttonId })
          .render(`#${id}`);
      })
      .then(() => { if (active) setLoaded(true); })
      .catch(() => { if (active) setFailed(true); });
    return () => {
      active = false;
      element.replaceChildren();
    };
  }, [available, sdkReady, id]);

  return (
    <section className="paypal-checkout" aria-label="Pay with PayPal">
      <p className="wallet-note">
        Secure PayPal checkout. Review the final total and available card options there.
      </p>
      <p className="hosted-delivery" id="paypal-delivery">
        <strong>Personal email delivery.</strong> After payment, send your PayPal
        receipt to <a href="mailto:Support@Vladasana.com">Support@Vladasana.com</a>.
        Vlada will verify your payment and email your bundle. Delivery isn’t instant.
      </p>
      {available ? (
        <>
          {PAYPAL_SDK_URL && <Script
            id="paypal-hosted-sdk"
            src={PAYPAL_SDK_URL}
            strategy="afterInteractive"
            onReady={() => setSdkReady(true)}
            onError={() => setFailed(true)}
          />}
          {PAYPAL_SDK_URL && !loaded && (
            <p className="paypal-loading" role="status">
              {failed ? (
                "Use the secure PayPal link below if the buttons don’t load."
              ) : (
                <><LoaderCircle className="spin" size={18} /> Loading PayPal…</>
              )}
            </p>
          )}
          <div
            ref={container}
            id={id}
            className="paypal-button-container"
            aria-describedby="paypal-delivery"
          />
          <a
            className={loaded ? "paypal-fallback" : "paypal-pay-button"}
            href={PAYPAL_HOSTED.url}
            aria-describedby="paypal-delivery"
          >
            {loaded ? "Open secure PayPal checkout" : "Pay with PayPal"} <ArrowUpRight size={19} />
          </a>
          <p className="secure-note">
            <LockKeyhole size={14} /> Payment details stay with PayPal.
          </p>
        </>
      ) : (
        <p className="form-note">PayPal payments aren’t open in this checkout.</p>
      )}
    </section>
  );
}
