import PolicyPage from "@/components/PolicyPage";
export const metadata = { title: "Privacy policy — Vladasana" };
export default function Privacy() {
  return (
    <PolicyPage
      title="Privacy policy"
      intro="Effective 12 September 2026. How information is used when you browse, buy or ask for help."
    >
      <h2>Who is responsible</h2>
      <p>
        Vladyslava Kandyba, trading as Vladasana, Ukraine, is responsible for
        the personal information processed by this storefront. Contact{" "}
        <a href="mailto:support@vladasana.com">support@vladasana.com</a> for
        privacy questions or requests.
      </p>
      <h2>Information we use</h2>
      <p>
        When you order, we use your delivery email, selected payment method,
        order reference, purchase amount and currency, payment-provider
        identifiers, payment status, and delivery or refund status. Crypto
        invoices may include a network and public transaction reference. A
        hashed IP address and hashed email are used to limit repeated checkout
        requests. Our hosting and service providers may process technical
        information such as IP address, browser details, timestamps and error
        logs to serve and secure the site.
      </p>
      <p>
        Messages you send to support may contain your name, email, order details
        and the information you choose to share. Do not email card details,
        passwords or wallet keys. Card and wallet credentials are entered with
        the payment provider; this storefront does not receive or store full
        payment-card details.
      </p>
      <h2>Why we use it</h2>
      <p>
        We use order information to perform our purchase agreement, confirm
        payment, deliver files, handle refunds and provide support. We use
        proportionate technical information for our legitimate interests in
        security, fraud prevention and reliability. We keep information required
        for accounting or other legal obligations. We do not add buyers to a
        marketing list merely because they purchased the bundle.
      </p>
      <h2>Services involved</h2>
      <p>
        Vercel hosts the website and private files; a PostgreSQL database stores
        order records; Resend sends delivery emails and reports delivery
        failures. Upstash QStash, when enabled, schedules delivery retries.
        These providers process information needed to provide those services.
      </p>
      <p>
        Paddle handles non-crypto checkout as merchant of record, including
        payment, tax, receipts and payment disputes, under its{" "}
        <a href="https://www.paddle.com/legal/privacy">Privacy Notice</a>.
        NOWPayments handles crypto invoices and settlement under its{" "}
        <a href="https://nowpayments.io/doc/privacy-policy.pdf">
          Privacy Policy
        </a>
        . Their processing and any legally required retention are separate from
        ours. We do not sell personal information.
      </p>
      <h2>Cookies and international processing</h2>
      <p>
        If you choose vLink and open its checkout, your browser connects to vPay
        and its wallet services inside an embedded payment page or a new tab.
        They process the connection and payment information you provide. We do
        not send them your delivery email or access your wallet keys. For vLink
        delivery, we use the receipt and email you send to support to verify
        payment and provide your bundle. See the{" "}
        <a href="https://vlink.id/vladasanadev/kQX9ME">vLink checkout</a> for
        the provider’s payment interface.
      </p>
      <p>
        This storefront does not set advertising or analytics cookies. Necessary
        browser features and payment-provider cookies or similar technologies
        may be used when you open checkout. Third-party payment scripts load
        only on the payment page for a valid checkout. Service providers may
        process information outside Ukraine or your country; applicable
        safeguards and provider terms govern those transfers.
      </p>
      <h2>Retention and security</h2>
      <p>
        We retain order and support information for as long as needed for
        delivery, refunds, disputes and applicable record-keeping duties.
        Rate-limit records are scheduled for deletion after two days. Access to
        private files is checked against the order and protected by expiring
        links. HTTPS protects information in transit. No system can guarantee
        absolute security.
      </p>
      <h2>Your choices and rights</h2>
      <p>
        Depending on applicable law, you may request access, correction,
        deletion, restriction or portability of your information, and object to
        certain processing. Email support from the address associated with your
        order; we may need to verify your identity. Some records must be
        retained to comply with legal duties or resolve disputes. You may also
        complain to your local data-protection authority.
      </p>
      <p>
        These materials are intended for adults preparing for professional
        roles. We do not knowingly collect information from children under 16.
        Contact us if you believe a child has supplied personal information.
        Updates to this policy will be dated on this page.
      </p>
    </PolicyPage>
  );
}
