import Link from "next/link";
import { config, providerAvailable } from "@/lib/commerce/config";
import { db, type Order } from "@/lib/commerce/db";
import PaddleCheckout from "@/components/PaddleCheckout";
import PolicyNav from "@/components/PolicyNav";
export const dynamic = "force-dynamic";
export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; _ptxn?: string }>;
}) {
  const c = config();
  const params = await searchParams;
  let order: Order | undefined;
  if (providerAvailable("paddle", c)) {
    if (params.order && /^[A-Za-z0-9_-]{43}$/.test(params.order))
      [order] = await db()<
        Order[]
      >`SELECT * FROM commerce_orders WHERE public_token=${params.order} AND provider='paddle'`;
    else if (params._ptxn && /^txn_[a-z0-9]{26}$/.test(params._ptxn))
      [order] = await db()<
        Order[]
      >`SELECT * FROM commerce_orders WHERE provider_checkout_id=${params._ptxn} AND provider='paddle'`;
  }
  const ready =
    order &&
    order.mode === c.mode &&
    order.status === "pending" &&
    !order.risk_status &&
    order.create_state === "ready" &&
    order.provider_checkout_id;
  return (
    <div className="policy-page">
      <header className="policy-header">
        <Link href="/" className="quiet-wordmark">
          vladasana
        </Link>
        <PolicyNav />
      </header>
      <main className="policy-content">
        <p className="policy-kicker">Your next move in tech</p>
        <h1>
          One playbook.
          <br />
          <em>A clearer next step.</em>
        </h1>
        <p>
          The Developer Job Search Playbook · $19 USD, one-time. Complete PDF,
          12 individual guides, roadmap and worksheets, delivered by email after
          payment confirmation.
        </p>
        {ready ? (
          <PaddleCheckout
            transactionId={order!.provider_checkout_id!}
            orderToken={order!.public_token}
            email={order!.email}
            token={c.paddleClientToken}
            environment={order!.mode === "live" ? "production" : "sandbox"}
          />
        ) : order?.status === "paid" ? (
          <Link
            className="policy-button"
            href={`/Success?order=${order.public_token}`}
          >
            Check your delivery →
          </Link>
        ) : (
          <p>
            Checkout is not available for this link.{" "}
            <Link href="/">Return to the bundle</Link> or{" "}
            <Link href="/contact">contact support</Link>.
          </p>
        )}
        <p className="policy-small">
          Non-crypto purchases are processed by Paddle as merchant of record.
          Available payment methods appear in checkout.{" "}
          <Link href="/refunds">7-day refunds</Link>; mandatory consumer rights
          are unaffected.
        </p>
      </main>
    </div>
  );
}
