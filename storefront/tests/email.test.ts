import assert from "node:assert/strict";
import { test } from "vitest";
import {
  renderBundleEmail,
  renderBundleEmailPreview,
  renderBundleDeliveryTestEmail,
  type BundleEmailInput,
} from "../lib/commerce/email";

const input: BundleEmailInput = {
  siteUrl: "https://vladasana.example",
  downloadUrl: "https://vladasana.example/download?token=opaque&file=bundle",
  supportEmail: "hello@vladasana.example",
  productName: "Get a Job Bundle",
  orderReference: "order-opaque-1234abcd",
  amountDisplay: "$19.00",
  currency: "USD",
  files: [{ name: "Bundle.pdf", description: "Guides and preparation" }],
};

test("receipt escapes customer and file values, while preserving safe download URLs", () => {
  const email = renderBundleEmail({
    ...input,
    firstName: '<img src=x onerror="alert(1)">',
    productName:
      'Bundle <script>alert("bad")</script>\r\nBcc: evil@example.com',
    files: [
      {
        name: '<svg onload="alert(1)">.pdf',
        description: '" onmouseover="bad',
      },
    ],
  });
  assert.ok(!email.html.includes("<script>"));
  assert.ok(!email.html.includes("<img src=x"));
  assert.ok(email.html.includes("&lt;svg onload=&quot;alert(1)&quot;&gt;.pdf"));
  assert.ok(email.html.includes("?token=opaque&amp;file=bundle"));
  assert.ok(!/[\r\n]/.test(email.subject));
  assert.ok(email.text.includes(input.downloadUrl));
  assert.ok(!email.html.includes(input.orderReference));
});

test("receipt refuses executable URLs, credentials, and email header injection", () => {
  assert.throws(
    () => renderBundleEmail({ ...input, downloadUrl: "javascript:alert(1)" }),
    /HTTP\(S\)/,
  );
  assert.throws(
    () =>
      renderBundleEmail({
        ...input,
        siteUrl: "https://user:secret@host.example",
      }),
    /without credentials/,
  );
  assert.throws(
    () =>
      renderBundleEmail({
        ...input,
        supportEmail: "hello@example.com\r\nBcc:wrong@example.com",
      }),
    /valid address/,
  );
});

test("attachment claims only appear when the fulfillment worker includes attachments", () => {
  assert.ok(!renderBundleEmail(input).text.includes("attached to this email"));
  assert.ok(
    renderBundleEmail({ ...input, hasAttachments: true }).text.includes(
      "attached to this email",
    ),
  );
});

test("public sample has no active private download link or customer details", () => {
  const email = renderBundleEmailPreview();
  assert.ok(email.html.includes('aria-disabled="true"'));
  assert.ok(email.html.includes('src="/Job-bundle/images/quiet/hero.webp"'));
  assert.ok(!email.html.includes('href="'));
  assert.ok(!email.html.includes("https://example.invalid/sample-download"));
  assert.ok(email.text.includes("SAMPLE EMAIL"));
  assert.ok(email.text.includes("disabled"));
});

test("operator delivery test identifies actual attachments without claiming a purchase", () => {
  const email = renderBundleDeliveryTestEmail(input);
  assert.ok(email.subject.startsWith("[Delivery test]"));
  assert.ok(email.text.includes("NO PURCHASE OR CHARGE"));
  assert.ok(email.html.includes("are attached for this delivery test"));
  assert.ok(email.html.includes("not a purchase receipt"));
  for (const content of [email.html, email.text]) {
    assert.ok(!content.includes("Payment confirmed."));
    assert.ok(!content.includes("because you purchased"));
    assert.ok(!content.includes(input.downloadUrl));
    assert.ok(!content.includes("7 days"));
  }
});


test("receipt images and links stay inside the deployed Job-bundle path", () => {
  const email = renderBundleEmail({
    ...input,
    siteUrl: "https://vladasana.com/Job-bundle",
    downloadUrl: "https://vladasana.com/Job-bundle/api/download/signed-test-token",
    supportEmail: "Support@Vladasana.com",
  });
  assert.ok(email.html.includes('src="https://vladasana.com/Job-bundle/images/quiet/hero.webp"'));
  assert.ok(email.html.includes('href="https://vladasana.com/Job-bundle/api/download/signed-test-token"'));
  assert.ok(!email.html.includes('src="https://vladasana.com/images/'));
  assert.ok(email.text.includes("Support@Vladasana.com"));
});
