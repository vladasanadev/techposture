export type BundleEmailInput = {
  siteUrl: string;
  downloadUrl: string;
  supportEmail: string;
  productName: string;
  orderReference: string;
  /** A formatted value, for example "$19.00". */
  amountDisplay: string;
  /** The ISO currency code, for example "USD". */
  currency: string;
  files: readonly { name: string; description?: string }[];
  firstName?: string;
  /** Set only when the actual PDFs accompany this email. */
  hasAttachments?: boolean;
};

export type BundleEmail = { subject: string; html: string; text: string };

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

/** Header values never contain CR/LF, including names supplied by a customer. */
const singleLine = (value: string): string =>
  value.replace(/[\r\n\u0000-\u001f\u007f]/g, " ").trim();

function webUrl(value: string, field: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Email ${field} must be an absolute HTTP(S) URL.`);
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error(
      `Email ${field} must be an absolute HTTP(S) URL without credentials.`,
    );
  }
  return url.href;
}

function emailAddress(value: string): string {
  const address = value.trim();
  if (
    !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/.test(
      address,
    )
  ) {
    throw new Error("Email supportEmail must be a valid address.");
  }
  return address;
}

function render(
  input: BundleEmailInput,
  preview = false,
  previewImageUrl?: string,
): BundleEmail {
  const siteUrl = webUrl(input.siteUrl, "siteUrl");
  const downloadUrl = webUrl(input.downloadUrl, "downloadUrl");
  const supportEmail = emailAddress(input.supportEmail);
  const imageUrl =
    previewImageUrl ?? new URL("/images/quiet/hero.webp", siteUrl).href;
  const productName = singleLine(input.productName);
  const firstName = input.firstName
    ? singleLine(input.firstName).slice(0, 60)
    : "";
  const greeting = firstName ? `Hey ${firstName},` : "Hey you,";
  const orderReference =
    singleLine(input.orderReference)
      .replace(/[^a-zA-Z0-9-]/g, "")
      .slice(-12)
      .toUpperCase() || "ORDER";
  const payment =
    `${singleLine(input.amountDisplay)} ${singleLine(input.currency).toUpperCase()}`.trim();
  const files = input.files.map((file) => ({
    name: singleLine(file.name),
    description: file.description ? singleLine(file.description) : "",
  }));
  const preheader = preview
    ? "Sample email design. No order has been placed."
    : "Your payment is confirmed. Your next chapter is ready to download.";
  const attachmentCopy = input.hasAttachments
    ? input.files.length > 1
      ? "Your complete PDF and guide archive are attached. Start with 00-start-here.pdf inside the ZIP, and use the CSV worksheets to track your practice and applications. Your backup download link below works for 7 days; save the files to keep them."
      : "Your PDF is attached to this email. Your backup download link works for 7 days; save the file to keep it."
    : "Your bundle is ready. Use your secure download below to save the PDF and make it yours.";
  const subject = `Your ${productName || "bundle"} is here`;
  const fileRows = files
    .map(
      (file, index) => `<tr>
    <td width="38" valign="top" style="padding:18px 0;color:#831018;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:24px;border-top:1px solid #dfc9c4;">${String(index + 1).padStart(2, "0")}</td>
    <td style="padding:18px 0;border-top:1px solid #dfc9c4;"><p style="margin:0;color:#63111a;font-size:15px;line-height:23px;font-weight:700;">${escapeHtml(file.name)}</p>${file.description ? `<p style="margin:4px 0 0;color:#785b56;font-size:13px;line-height:21px;">${escapeHtml(file.description)}</p>` : ""}</td>
  </tr>`,
    )
    .join("");
  const cta = preview
    ? `<span aria-disabled="true" style="display:inline-block;min-width:214px;padding:18px 28px;border-radius:0;background:#54151c;color:#fff8ef;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;line-height:24px;text-align:center;">Download your bundle &nbsp;↗</span>`
    : `<a href="${escapeHtml(downloadUrl)}" style="display:inline-block;min-width:214px;padding:18px 28px;border:1px solid #54151c;border-radius:0;background:#54151c;color:#fff8ef;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;line-height:24px;text-align:center;text-decoration:none;mso-padding-alt:18px 28px;">Download your bundle &nbsp;↗</a>`;
  const fallback = preview
    ? `<p style="margin:0;color:#785b56;font-size:12px;line-height:19px;">Sample only. Your customer’s private download link will appear here.</p>`
    : `<p style="margin:0 0 7px;color:#785b56;font-size:12px;line-height:19px;">You can also copy this link into your browser:</p><a href="${escapeHtml(downloadUrl)}" style="color:#54151c;font-size:12px;line-height:20px;word-break:break-all;overflow-wrap:anywhere;text-decoration:underline;">${escapeHtml(downloadUrl)}</a>`;
  const support = preview
    ? `<span style="color:#54151c;text-decoration:underline;">Reply to this email</span>`
    : `<a href="mailto:${escapeHtml(encodeURIComponent(supportEmail))}" style="color:#54151c;text-decoration:underline;">Reply to this email</a>`;
  const brand = preview
    ? `<span style="color:#711018;text-decoration:none;">vladasana</span>`
    : `<a href="${escapeHtml(siteUrl)}" style="color:#711018;text-decoration:none;">vladasana</a>`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${escapeHtml(subject)}</title>
<style>body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0;mso-table-rspace:0}table{border-collapse:collapse!important}img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}body{margin:0!important;padding:0!important;width:100%!important}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}@media only screen and (max-width:600px){.email-shell{width:100%!important}.email-pad{padding-left:26px!important;padding-right:26px!important}.email-title{font-size:43px!important;line-height:43px!important}.email-brand{font-size:29px!important}.email-hero{height:auto!important}.email-page-pad{padding:0!important}.email-footer{padding-left:26px!important;padding-right:26px!important}}</style></head>
<body style="background:#e8eef0;color:#63111a;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;font-size:1px;line-height:1px;color:#e8eef0;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}&#847; &zwnj; &nbsp; &#847; &zwnj; &nbsp; &#847; &zwnj; &nbsp;</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#e8eef0;"><tr><td align="center" class="email-page-pad" style="padding:32px 16px;">
<table role="presentation" class="email-shell" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:600px;background:#fbf6ed;">
${preview ? `<tr><td style="padding:11px 24px;background:#54151c;color:#fff8ef;font-size:10px;line-height:17px;letter-spacing:1.8px;text-transform:uppercase;text-align:center;">Sample email &nbsp;·&nbsp; Design preview &nbsp;·&nbsp; No purchase</td></tr>` : ""}
<tr><td class="email-pad" style="padding:28px 44px 25px;border-bottom:1px solid #dec7c1;"><table role="presentation" width="100%"><tr><td class="email-brand" style="font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:38px;letter-spacing:-1.4px;">${brand}</td><td align="right" style="color:#831018;font-size:10px;line-height:16px;letter-spacing:1.5px;text-transform:uppercase;">GET A JOB<br>BUNDLE</td></tr></table></td></tr>
<tr><td style="background:#cee0e9;"><img class="email-hero" src="${escapeHtml(imageUrl)}" alt="The Get a Job Bundle in an oxblood folder on a powder blue surface." width="600" height="280" style="display:block;width:100%;max-width:600px;height:280px;object-fit:cover;background:#cee0e9;color:#711018;font-size:16px;line-height:26px;"></td></tr>
<tr><td class="email-pad" style="padding:34px 44px 0;"><p style="margin:0 0 15px;color:#8a2530;font-size:10px;line-height:18px;letter-spacing:2.2px;text-transform:uppercase;">${preview ? "A peek inside your inbox" : "Payment confirmed."}</p><h1 class="email-title" style="margin:0;color:#502024;font-family:Georgia,serif;font-size:48px;line-height:51px;font-weight:400;letter-spacing:-2px;">Your bundle<br>is ready.</h1></td></tr>
<tr><td class="email-pad" style="padding:25px 44px 0;"><p style="margin:0 0 13px;font-size:16px;line-height:26px;color:#63111a;">${escapeHtml(greeting)}</p><p style="margin:0 0 13px;color:#654e48;font-size:15px;line-height:26px;">Thank you for choosing <strong style="color:#502024;">${escapeHtml(productName)}</strong> to support your next move in tech.</p><p style="margin:0;color:#654e48;font-size:15px;line-height:26px;">${escapeHtml(attachmentCopy)}</p></td></tr>
<tr><td class="email-pad" style="padding:27px 44px 12px;">${cta}${preview ? `<p style="margin:10px 0 0;color:#785b56;font-size:11px;line-height:18px;">Preview button · downloading is disabled</p>` : ""}</td></tr>
<tr><td class="email-pad" style="padding:5px 44px 29px;">${fallback}</td></tr>
<tr><td class="email-pad" style="padding:0 44px;"><table role="presentation" width="100%" style="width:100%;"><tr><td colspan="2" style="padding:0 0 13px;color:#831018;font-size:10px;line-height:18px;letter-spacing:2px;text-transform:uppercase;">Inside your bundle</td></tr>${fileRows}</table></td></tr>
<tr><td class="email-pad" style="padding:8px 44px 26px;"><table role="presentation" width="100%" style="width:100%;background:#e3edf0;"><tr><td style="padding:18px 20px;color:#785b56;font-size:11px;line-height:20px;">${preview ? "SAMPLE ORDER" : "ORDER"}<br><strong style="color:#63111a;font-weight:600;letter-spacing:.5px;">${escapeHtml(orderReference)}</strong></td><td align="right" style="padding:18px 20px;color:#785b56;font-size:11px;line-height:20px;">${preview ? "EXAMPLE AMOUNT" : "PAID"}<br><strong style="color:#63111a;font-size:14px;font-weight:600;">${escapeHtml(payment)}</strong></td></tr></table></td></tr>
<tr><td class="email-pad" style="padding:0 44px 30px;"><p style="margin:0 0 9px;color:#654e48;font-size:15px;line-height:26px;">Start with the part you need most. You don’t have to have it all figured out today.</p><p style="margin:18px 0 2px;color:#54151c;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:34px;font-style:italic;">I’ve got you.</p><p style="margin:0;color:#54151c;font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:30px;">Vlada</p></td></tr>
<tr><td class="email-footer" style="padding:25px 44px 29px;border-top:1px solid #dfc9c4;"><p style="margin:0 0 8px;color:#785b56;font-size:12px;line-height:20px;">Need a hand with your download? ${support} and include your order reference. I’ll help you find your next step.</p><p style="margin:0;color:#957f76;font-size:10px;line-height:18px;">${preview ? "This is a sample email, using fictional order details. No payment was made and no product is delivered from this preview." : `You’re receiving this email because you purchased ${escapeHtml(productName)}. This is your delivery confirmation; please keep it for your records.`}</p></td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    preview ? "SAMPLE EMAIL — DESIGN PREVIEW — NO PURCHASE\n" : "",
    "YOUR BUNDLE IS READY.",
    greeting,
    `Thank you for choosing ${productName} to support your next move in tech.`,
    attachmentCopy,
    preview
      ? "Download your bundle: disabled in this sample email."
      : `Download your bundle:\n${downloadUrl}`,
    "INSIDE YOUR BUNDLE",
    ...files.map(
      (file) =>
        `• ${file.name}${file.description ? ` — ${file.description}` : ""}`,
    ),
    `${preview ? "Sample order" : "Order"}: ${orderReference}\n${preview ? "Example amount" : "Paid"}: ${payment}`,
    "Start with the part you need most. You don’t have to have it all figured out today.",
    "I’ve got you.\nVlada",
    preview
      ? "This is a sample email with fictional order details. No payment was made, and no download is available."
      : `Need a hand with your download? Reply to ${supportEmail} and include your order reference.`,
    preview
      ? ""
      : `You’re receiving this email because you purchased ${productName}. This is your delivery confirmation; please keep it for your records.`,
  ]
    .filter(Boolean)
    .join("\n\n");
  return { subject, html, text };
}

/** Build the transactional message only after the server has confirmed payment. */
export function renderBundleEmail(input: BundleEmailInput): BundleEmail {
  return render(input);
}

/** Public preview: fictional order, disabled CTA, no private URLs or customer data. */
export function renderBundleEmailPreview(siteUrl = ""): BundleEmail {
  const previewSiteUrl = siteUrl
    ? webUrl(siteUrl, "siteUrl")
    : "https://example.invalid";
  return render(
    {
      siteUrl: previewSiteUrl,
      downloadUrl: "https://example.invalid/sample-download",
      supportEmail: "hello@example.invalid",
      productName: "The Developer Job Search Playbook",
      orderReference: "SAMPLE-019",
      amountDisplay: "$19.00",
      currency: "USD",
      files: [
        {
          name: "developer-job-search-playbook.pdf",
          description: "Your complete 281-page playbook.",
        },
        {
          name: "developer-job-search-playbook.zip",
          description:
            "12 individual guides, a roadmap and two CSV worksheets.",
        },
      ],
      hasAttachments: true,
    },
    true,
    siteUrl
      ? new URL("/images/quiet/hero.webp", previewSiteUrl).href
      : "/images/quiet/hero.webp",
  );
}
