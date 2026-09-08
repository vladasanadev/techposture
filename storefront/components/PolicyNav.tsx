import Link from "next/link";
export default function PolicyNav() {
  return (
    <nav aria-label="Product and policies" className="policy-nav">
      <details>
        <summary>Info & policies</summary>
        <div>
          <Link href="/bundle">What’s included</Link>
          <Link href="/terms">Terms & conditions</Link>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/refunds">Refund policy</Link>
          <Link href="/contact">Contact & support</Link>
        </div>
      </details>
    </nav>
  );
}
