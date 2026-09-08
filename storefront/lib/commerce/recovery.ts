import {
  getPaddleTransaction,
  retrievePaddle,
  validatePaddleTransaction,
} from "./providers/paddle";
import { config, CommerceError } from "./config";
import { db, getOrder, markPaid } from "./db";
import { retrieveCrypto } from "./providers/crypto";
export async function recoverCryptoPayment(orderId: string, paymentId: string) {
  const c = config();
  if (c.mode !== "live" || !c.cryptoKey)
    throw new CommerceError("Crypto recovery is not configured.", 503);
  const order = await getOrder(orderId);
  if (
    !order ||
    order.provider !== "crypto" ||
    order.mode !== "live" ||
    !order.provider_checkout_id
  )
    throw new CommerceError("Crypto order not found.", 404);
  const verified = await retrieveCrypto(
    order,
    c,
    paymentId,
    `recovery-${paymentId}`,
  );
  // Retrieval validates merchant API access, invoice, order, fiat price and selected network even while pending.
  const [updated] =
    await db()`UPDATE commerce_orders SET provider_payment_id=COALESCE(provider_payment_id,${paymentId}),updated_at=NOW() WHERE id=${order.id} AND (provider_payment_id IS NULL OR provider_payment_id=${paymentId}) RETURNING id`;
  if (!updated)
    throw new CommerceError(
      "This order already has a different payment reference. Review it in the provider dashboard.",
      409,
    );
  if (verified) await markPaid(verified);
  return { recovered: true, settled: !!verified };
}

/** Attach a provider-retrieved transaction after an ambiguous create; never create a replacement charge. */
export async function recoverPaddlePayment(
  orderId: string,
  transactionId: string,
) {
  const c = config();
  if (c.mode === "preview" || !c.paddleKey)
    throw new CommerceError("Paddle recovery is not configured.", 503);
  const order = await getOrder(orderId);
  if (
    !order ||
    order.provider !== "paddle" ||
    order.mode !== c.mode ||
    order.risk_status ||
    (order.provider_checkout_id && order.provider_checkout_id !== transactionId)
  )
    throw new CommerceError(
      "Paddle order cannot be recovered with this reference.",
      409,
    );
  const candidate = { ...order, provider_checkout_id: transactionId };
  const transaction = await getPaddleTransaction(transactionId, c);
  validatePaddleTransaction(transaction, candidate, c);
  const [updated] =
    await db()`UPDATE commerce_orders SET provider_checkout_id=${transactionId},checkout_url=${`${c.siteUrl}/pay?order=${order.public_token}`},create_state='ready',create_lease=NULL,status=CASE WHEN status='paid' THEN status ELSE 'pending' END,updated_at=NOW() WHERE id=${orderId} AND (provider_checkout_id IS NULL OR provider_checkout_id=${transactionId}) RETURNING id`;
  if (!updated) throw new CommerceError("Paddle recovery conflict.", 409);
  const verified = await retrievePaddle(
    candidate,
    c,
    `recovery-${transactionId}`,
  );
  if (verified) await markPaid(verified);
  return { recovered: true, settled: !!verified };
}
