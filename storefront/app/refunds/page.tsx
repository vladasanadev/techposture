import PolicyPage from "@/components/PolicyPage";
export const metadata = { title: "Refund policy — Vladasana" };
export default function Refunds() {
  return (
    <PolicyPage
      title="Refund policy"
      intro="A 7-day refund window. Effective 12 September 2026."
    >
      <h2>Request within 7 days</h2>
      <p>
        If the Developer Job Search Playbook is not right for you, request a
        refund within 7 days of purchase. Email{" "}
        <a href="mailto:support@vladasana.com">support@vladasana.com</a> using
        your purchase email and include your order reference. You may share what
        did not work for you, but a reason is not required for a request within
        this window.
      </p>
      <h2>Payments through Paddle</h2>
      <p>
        Paddle is the merchant of record for non-crypto purchases. You can also
        request payment help or a refund through{" "}
        <a href="https://www.paddle.net">Paddle buyer support</a>, using your
        receipt. We will assist with qualifying requests; Paddle processes the
        refund to the original payment method, subject to its processing and
        approval procedures. The time for funds to appear depends on Paddle, the
        payment method and your bank.
      </p>
      <h2>Crypto payments</h2>
      <p>
        The same 7-day request window applies to a confirmed crypto purchase.
        This includes NOWPayments and vLink. Contact us with your order
        reference or vLink receipt and transaction hash. We will verify the
        purchase and agree the return token, network, address and any network
        cost with you before sending a refund. Crypto refunds are handled
        manually, separately from Paddle. Never send another payment to “unlock”
        a refund, and never share a seed phrase or private key.
      </p>
      <h2>Missing or faulty downloads</h2>
      <p>
        If a file is missing, corrupted, materially different from its
        description, or never arrives, contact us so we can provide the correct
        files or resolve the purchase. The 7-day voluntary window does not
        restrict any remedy you have under applicable law.
      </p>
      <h2>Mandatory consumer rights</h2>
      <p>
        This policy is in addition to statutory rights. Some customers have
        longer cancellation or withdrawal rights. Those rights are not reduced
        to 7 days. The terms shown by Paddle at checkout, including any legally
        required consent to immediate digital delivery and any resulting effect
        on a withdrawal right, also apply. See{" "}
        <a href="https://www.paddle.com/legal/buyer-terms">
          Paddle’s Buyer Terms
        </a>
        .
      </p>
      <h2>After a refund</h2>
      <p>
        After a full refund, your licence to use the bundle ends. Please delete
        the downloaded files and any copies you made. We may disable the private
        download link. For a partial refund, we will explain any effect on
        access when resolving the request.
      </p>
    </PolicyPage>
  );
}
