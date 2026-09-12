/** Owner-supplied hosted payment link. This is not a verified-payment adapter. */
export const VLINK = {
  url: "https://vlink.id/vladasanadev/kQX9ME",
  amount: 19,
  currency: "USDC",
  supportEmail: "Support@Vladasana.com",
} as const;

export const VLINK_RECEIPT_EMAIL = `mailto:${VLINK.supportEmail}?${new URLSearchParams(
  {
    subject: "Job bundle — vLink payment receipt",
    body: "Hi Vlada,\n\nI paid for the Developer Job Search Playbook through vLink.\n\nPayment receipt / transaction reference:\nPayment date:\nEmail for my bundle:\n\nPlease verify my payment and send my bundle. Thank you!",
  },
).toString().replace(/\+/g, "%20")}`;
