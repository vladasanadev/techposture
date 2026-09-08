import Link from "next/link";
import PolicyPage from "@/components/PolicyPage";
export const metadata = { title: "Terms & conditions — Vladasana" };
export default function Terms() {
  return (
    <PolicyPage
      title="Terms & conditions"
      intro="Effective 8 September 2026. These terms cover the use of the Vladasana website and the Developer Job Search Playbook."
    >
      <h2>Who supplies the product</h2>
      <p>
        Vladasana is the brand of Vladyslava Kandyba, based in Ukraine. Product
        and customer support:{" "}
        <a href="mailto:support@vladasana.com">support@vladasana.com</a>.
      </p>
      <h2>Your purchase</h2>
      <p>
        The Developer Job Search Playbook is an English-language digital
        download for software developers with coding foundations, especially
        JavaScript, React, backend and full-stack candidates. It costs $19 USD
        as a one-time purchase, with no subscription or physical shipment.
      </p>
      <p>
        You receive a 281-page combined PDF, a separate 22-page start-here
        roadmap, 12 individual guide PDFs, and application-tracker and
        practice-log CSV worksheets. The combined PDF contains the roadmap and
        the same 12 guides; these are alternative formats, not additional unique
        pages. See the{" "}
        <Link href="/bundle">full contents and device requirements</Link>.
      </p>
      <h2>Payment</h2>
      <p>
        When you choose a non-crypto method, Paddle is the merchant of record
        and authorised reseller handling payment, applicable sales tax and
        payment support. Its{" "}
        <a href="https://www.paddle.com/legal/buyer-terms">Buyer Terms</a> also
        apply to that transaction. The Paddle price is configured as
        tax-inclusive; the final currency, taxes and total are displayed before
        payment.
      </p>
      <p>
        Crypto payments, when available, use NOWPayments separately from Paddle.
        The invoice specifies the accepted token, network, amount and expiry.
        Use exactly those details. Network fees may apply. Do not send a payment
        to an expired invoice or use a different network; contact support if a
        payment needs review.
      </p>
      <h2>Delivery and access</h2>
      <p>
        After the payment provider confirms successful payment, we automatically
        email the complete PDF and the ZIP archive to the delivery address you
        provide. Confirmation may take longer for crypto. Please check spam and
        promotions folders. If delivery fails or you enter an incorrect address,
        contact support with your order reference so we can verify the order and
        help.
      </p>
      <p>
        The backup download link expires after 7 days. Download and keep your
        own copy; the files do not expire. Contact support if you need help with
        an expired link. No account or paid software is required to read the
        PDFs.
      </p>
      <h2>Personal use</h2>
      <p>
        Your purchase gives you a non-exclusive, non-transferable licence to
        download, store and print the supplied materials for your own learning
        and job search. You may adapt the worksheets for your personal use. Do
        not resell, redistribute, publicly upload or share the bundle as a
        downloadable product. Rights in third-party material remain with their
        respective owners.
      </p>
      <h2>Scope and outcomes</h2>
      <p>
        This is self-guided educational material, not personal coaching,
        recruitment, certification or a job-placement service. Exercises require
        your own work. We do not promise a job offer, interview, salary,
        response rate or hiring timeline. The 14-day roadmap is a practice
        schedule. Future updates are not included as an ongoing service.
      </p>
      <h2>Refunds and your rights</h2>
      <p>
        Our <Link href="/refunds">7-day refund policy</Link> explains how to
        request a refund. Nothing in these terms or that policy limits mandatory
        consumer rights, including remedies for faulty, misdescribed or
        undelivered digital content. Paddle’s mandatory buyer protections
        continue to apply to Paddle purchases.
      </p>
      <h2>Privacy and changes</h2>
      <p>
        Our <Link href="/privacy">Privacy Policy</Link> explains how order and
        delivery information is used. Changes to these terms will be dated on
        this page and will not retrospectively reduce rights attached to an
        existing purchase. For questions or a complaint,{" "}
        <Link href="/contact">contact us</Link>.
      </p>
    </PolicyPage>
  );
}
