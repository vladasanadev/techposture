"use client";

import { useState } from "react";
import { ArrowUpRight, LoaderCircle, Mail } from "lucide-react";
import { VLINK, VLINK_RECEIPT_EMAIL } from "@/lib/vlink";

export default function VLinkCheckout({ available }: { available: boolean }) {
  const [opened, setOpened] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <section className="vlink-checkout" aria-label="Pay with vLink">
      <div className="vlink-intro">
        <span className="vlink-monogram" aria-hidden="true">
          v
        </span>
        <div>
          <h4>Your wallet. Your next chapter.</h4>
          <p>
            {VLINK.amount} {VLINK.currency} · Pay Vlada through vLink
          </p>
        </div>
      </div>
      <p className="vlink-delivery" id="vlink-delivery">
        <strong>Personal email delivery.</strong> After paying, email your
        receipt to{" "}
        <a href={`mailto:${VLINK.supportEmail}`}>{VLINK.supportEmail}</a>. We’ll
        verify your payment and send your bundle. Delivery isn’t instant.
      </p>
      {!available ? (
        <p className="form-note">
          vLink payments aren’t open in this checkout.
        </p>
      ) : !opened ? (
        <>
          <button
            className="checkout-submit vlink-open"
            type="button"
            aria-describedby="vlink-delivery"
            onClick={() => setOpened(true)}
          >
            Pay {VLINK.amount} USDC with vLink <ArrowUpRight size={20} />
          </button>
          <p className="vlink-provider-note">
            Opens vPay’s wallet checkout here. Review the network and final
            total there.
          </p>
        </>
      ) : (
        <>
          <div className="vlink-frame-heading">
            <span>vLink checkout</span>
            <a href={VLINK.url} target="_blank" rel="noopener noreferrer">
              Open in new tab <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="vlink-frame-wrap">
            {!loaded && (
              <p className="vlink-loading" role="status">
                <LoaderCircle className="spin" size={18} /> Loading vLink…
              </p>
            )}
            <iframe
              className="vlink-frame"
              src={VLINK.url}
              title="vLink: pay Vlada 19 USDC"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              allow="clipboard-write"
              referrerPolicy="no-referrer"
              onLoad={() => setLoaded(true)}
            />
          </div>
          <p className="vlink-provider-note">
            Wallet not appearing? Use “Open in new tab” above.
          </p>
          <a className="vlink-receipt" href={VLINK_RECEIPT_EMAIL}>
            <Mail size={18} /> Email my receipt for delivery{" "}
            <ArrowUpRight size={17} />
          </a>
        </>
      )}
    </section>
  );
}
