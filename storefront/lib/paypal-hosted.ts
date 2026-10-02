import { SELLER } from "./product";

/** Public embed identifiers supplied by the seller, not REST API credentials. */
export const PAYPAL_HOSTED = {
  buttonId: "59VY3T3WTU4G4",
  // Leave unset until the exact Part 1 snippet is supplied as text. The
  // screenshot's ambiguous characters failed PayPal's SDK validation.
  clientId: "",
  url: "https://www.paypal.com/ncp/payment/59VY3T3WTU4G4",
  amount: 19,
  currency: "USD",
} as const;

export const PAYPAL_RECEIPT_EMAIL = `mailto:${SELLER.supportEmail}?${new URLSearchParams({
  subject: "My Job Bundle — PayPal receipt",
  body: "Hi Vlada,\n\nI paid for the Developer Job Search Playbook through PayPal.\n\nPayPal transaction ID:\nPayment date:\nEmail address for my bundle:\n\nI have attached my PayPal receipt. Please verify my payment and send my bundle.\n\nThank you!",
}).toString()}`;

export const PAYPAL_SDK_URL = PAYPAL_HOSTED.clientId ? `https://www.paypal.com/sdk/js?${new URLSearchParams({
  "client-id": PAYPAL_HOSTED.clientId,
  components: "hosted-buttons",
  "disable-funding": "venmo",
  currency: PAYPAL_HOSTED.currency,
})}` : null;
