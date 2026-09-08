import { Suspense } from "react";
import OrderStatus from "@/components/OrderStatus";
export const metadata = {
  title: "Your next chapter — Vladasana",
  robots: { index: false, follow: false },
};
export default function Success() {
  return (
    <Suspense
      fallback={
        <main className="order-page">
          <p>Opening your order…</p>
        </main>
      }
    >
      <OrderStatus />
    </Suspense>
  );
}
