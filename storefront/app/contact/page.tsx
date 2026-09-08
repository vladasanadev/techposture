import Link from "next/link";
import PolicyPage from "@/components/PolicyPage";
export const metadata = { title: "Contact & support — Vladasana" };
export default function Contact() {
  return (
    <PolicyPage
      title="Here to help."
      intro="A question about the playbook, your payment or your download?"
    >
      <a className="policy-button" href="mailto:support@vladasana.com">
        support@vladasana.com ↗
      </a>
      <h2>Product and download support</h2>
      <p>
        Include the email you used to buy and your order reference. For missing
        files, check spam and promotions first. For crypto, include the
        transaction hash and network. Never send passwords, full card details or
        wallet keys.
      </p>
      <h2>Seller details</h2>
      <p>
        Vladyslava Kandyba
        <br />
        Brand: Vladasana
        <br />
        Country: Ukraine
        <br />
        Email: <a href="mailto:support@vladasana.com">support@vladasana.com</a>
      </p>
      <h2>Payment and refund help</h2>
      <p>
        For Paddle purchases, you can also use{" "}
        <a href="https://www.paddle.net">Paddle buyer support</a> with your
        receipt. Crypto payments are handled separately. Read our{" "}
        <Link href="/refunds">7-day refund policy</Link>.
      </p>
    </PolicyPage>
  );
}
