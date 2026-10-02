"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { storefrontPath } from "@/lib/site-path";
export default function PaddleCheckout({
  transactionId,
  orderToken,
  email,
  token,
  environment,
}: {
  transactionId: string;
  orderToken: string;
  email: string;
  token: string;
  environment: "sandbox" | "production";
}) {
  const router = useRouter();
  const paddle = useRef<Paddle | undefined>(undefined);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    // The explicit, server-resolved transaction takes precedence over Paddle's automatic _ptxn launcher.
    window.history.replaceState(null, "", storefrontPath(`/pay?order=${orderToken}`));
    initializePaddle({
      token,
      environment,
      eventCallback(event) {
        if (!active) return;
        if (event.name === "checkout.completed")
          router.push(`/Success?order=${orderToken}`);
        if (event.name === "checkout.error")
          setError(
            "Checkout could not load. Please try again or contact support.",
          );
      },
    })
      .then((instance) => {
        if (!active || !instance) return;
        paddle.current = instance;
        setReady(true);
        instance.Checkout.open({
          transactionId,
          customer: { email },
          settings: {
            displayMode: "overlay",
            theme: "light",
            locale: "en",
            allowLogout: false,
            showAddDiscounts: false,
            allowDiscountRemoval: false,
            successUrl: `${window.location.origin}${storefrontPath(`/Success?order=${orderToken}`)}`,
          },
        });
      })
      .catch(() => {
        if (active)
          setError(
            "Checkout could not load. Check your connection and try again.",
          );
      });
    return () => {
      active = false;
      paddle.current?.Checkout.close();
    };
  }, [transactionId, orderToken, email, token, environment, router]);
  return (
    <div>
      {environment === "sandbox" && <p>Test checkout — no real charges.</p>}
      <button
        className="policy-button"
        disabled={!ready}
        onClick={() => {
          setError("");
          paddle.current?.Checkout.open({
            transactionId,
            customer: { email },
            settings: {
              displayMode: "overlay",
              theme: "light",
              allowLogout: false,
              showAddDiscounts: false,
            },
          });
        }}
      >
        {ready ? "Open secure checkout →" : "Preparing secure checkout…"}
      </button>
      {error && <p role="alert">{error}</p>}
      <p className="policy-small">
        Your bundle will be sent to {email}.{" "}
        <Link href="/">Start again to change this address.</Link>
      </p>
    </div>
  );
}
