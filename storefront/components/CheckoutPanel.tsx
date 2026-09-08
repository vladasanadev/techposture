"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Check,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  Wallet,
} from "lucide-react";

type Provider = "paddle" | "crypto";
type Storefront = {
  mode: "preview" | "sandbox" | "live";
  price: number;
  currency: string;
  methods: {
    id: Provider;
    label: string;
    available: boolean;
    reason?: string;
  }[];
  cryptoTokens?: { id: string; label: string }[];
};
const defaultMethods = [
  { id: "paddle" as const, label: "Card / PayPal", available: false },
  { id: "crypto" as const, label: "Crypto", available: false },
];

export default function CheckoutPanel() {
  const [store, setStore] = useState<Storefront | null>(null);
  const [provider, setProvider] = useState<Provider>("paddle");
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const requestKey = useRef<string | null>(null);
  const requestFields = useRef("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/storefront", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Store unavailable");
        return r.json();
      })
      .then((value: Storefront) => {
        setStore(value);
        setProvider(value.methods.find((m) => m.available)?.id ?? "paddle");
        setToken(value.cryptoTokens?.[0]?.id ?? "");
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError("Checkout is unavailable. Please try again soon.");
      });
    return () => controller.abort();
  }, []);
  const preview = !store || store.mode === "preview";
  const available =
    store?.methods.find((m) => m.id === provider)?.available === true;
  const methods = store?.methods ?? defaultMethods;
  const amount = store?.price ?? 19;
  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!available || sending) return;
    setSending(true);
    setError("");
    const fields = JSON.stringify({
      provider,
      email: email.trim(),
      token: provider === "crypto" ? token : undefined,
    });
    if (!requestKey.current || requestFields.current !== fields) {
      requestKey.current = crypto.randomUUID();
      requestFields.current = fields;
    }
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": requestKey.current,
        },
        body: fields,
      });
      const data = await response.json();
      if (!response.ok || !data.url)
        throw new Error(
          data.error ?? "We couldn’t open checkout. Please try again.",
        );
      const url = new URL(data.url);
      if (url.protocol !== "https:")
        throw new Error("Checkout could not be opened safely.");
      window.location.assign(url.href);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
      setSending(false);
    }
  }
  return (
    <div className="checkout-card">
      <h3 className="checkout-heading">Developer Job Search Playbook</h3>
      <div className="checkout-price">
        <span className="price-currency">$</span>
        <strong>{amount}</strong>
        <div>
          <span>{store?.currency ?? "USD"}</span>
          <p>
            One payment.
            <br />
            12 guides + worksheets.
          </p>
        </div>
      </div>
      <form onSubmit={checkout}>
        {store?.mode === "sandbox" && (
          <p className="sandbox-note">
            Test checkout · no real charges. Use test payment details only.
          </p>
        )}
        <fieldset disabled={sending} className="payment-methods">
          <legend>Choose your way to pay</legend>
          <div role="radiogroup" aria-label="Payment method">
            {methods.map((method) => (
              <button
                key={method.id}
                type="button"
                role="radio"
                aria-checked={provider === method.id}
                tabIndex={provider === method.id ? 0 : -1}
                onKeyDown={(event) => {
                  const index = methods.findIndex(
                    (item) => item.id === method.id,
                  );
                  const next =
                    event.key === "ArrowRight" || event.key === "ArrowDown"
                      ? (index + 1) % methods.length
                      : event.key === "ArrowLeft" || event.key === "ArrowUp"
                        ? (index + methods.length - 1) % methods.length
                        : event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? methods.length - 1
                            : null;
                  if (next === null) return;
                  event.preventDefault();
                  setProvider(methods[next].id);
                  setError("");
                  event.currentTarget.parentElement
                    ?.querySelectorAll<HTMLButtonElement>("button")
                    [next]?.focus();
                }}
                onClick={() => {
                  setProvider(method.id);
                  setError("");
                }}
                className={provider === method.id ? "payment-selected" : ""}
              >
                {method.id === "paddle" ? (
                  <CreditCard size={19} />
                ) : (
                  <Wallet size={19} />
                )}
                <span>
                  {method.id === "paddle" ? "Card / PayPal" : "Crypto"}
                </span>
                {provider === method.id && (
                  <Check size={12} className="method-check" />
                )}
              </button>
            ))}
          </div>
        </fieldset>
        <p className="wallet-note">
          {provider === "paddle"
            ? "Secure checkout by Paddle. PayPal, Apple Pay and Google Pay appear when available."
            : "USDT & USDC · select the exact token and network."}
        </p>
        {provider === "crypto" && (
          <label className="field-label">
            Token & network
            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={!available}
            >
              <option value="">
                {preview
                  ? "Available networks will appear at launch"
                  : "Choose a token & network"}
              </option>
              {store?.cryptoTokens?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="field-label" htmlFor="delivery-email">
          Where should we send your bundle?
          <input
            id="delivery-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            disabled={!available || sending}
            maxLength={254}
          />
        </label>
        <button
          className="checkout-submit"
          type="submit"
          disabled={!available || sending}
        >
          {sending ? (
            <>
              <LoaderCircle className="spin" size={18} />
              Opening secure checkout…
            </>
          ) : available ? (
            <>
              Get my bundle · ${amount}
              <ArrowUpRight size={20} />
            </>
          ) : (
            <>
              {store ? "Checkout opens soon" : "Preparing checkout…"}
              <ArrowUpRight size={20} />
            </>
          )}
        </button>
        {preview && store ? (
          <div className="launch-note">
            <span className="launch-dot" />
            <p>
              You’re viewing a preview.
              <br />
              <span>
                The playbook is ready. Purchases open after payment setup.
              </span>
            </p>
          </div>
        ) : !available && store ? (
          <p className="form-note">
            This payment method isn’t available yet. Please choose another.
          </p>
        ) : (
          <p className="secure-note">
            <LockKeyhole size={12} /> Secure payment. Your bundle follows by
            email.
          </p>
        )}
        {error && (
          <p className="checkout-error" role="alert">
            {error}
          </p>
        )}
        <p className="checkout-terms">
          By purchasing, you accept our <a href="/terms">terms</a>. Read our{" "}
          <a href="/privacy">privacy policy</a> and{" "}
          <a href="/refunds">7-day refund policy</a>.
        </p>
      </form>
    </div>
  );
}
