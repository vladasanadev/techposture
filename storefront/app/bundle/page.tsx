import Link from "next/link";
import PolicyPage from "@/components/PolicyPage";
import CheckoutDialog from "@/components/CheckoutDialog";
import { GUIDES, PRODUCT } from "@/lib/product";
export const metadata = {
  title: "What’s included — The Developer Job Search Playbook",
};
export default function Bundle() {
  return (
    <PolicyPage
      title="Your preparation, in one place."
      intro="The Developer Job Search Playbook. English-language, self-guided preparation for developers with coding foundations — especially JavaScript, React, backend and full-stack candidates."
    >
      <CheckoutDialog price={PRODUCT.price} />
      <p>
        $19 USD · one-time payment · no subscription ·{" "}
        <Link href="/refunds">7-day refunds</Link>
      </p>
      <h2>One complete PDF. A practical library.</h2>
      <p>
        A 281-page combined playbook brings the 22-page start-here roadmap and
        all 12 guides together, with clickable navigation. You also receive the
        same roadmap and guides as separate PDFs, plus two editable CSV
        worksheets, in a ZIP archive.
      </p>
      <p>
        The roadmap connects role targeting, outreach, CV tailoring, behavioral
        answers, technical practice and interview preparation. A 14-day practice
        schedule helps you turn reading into work you can use.
      </p>
      <ol className="guide-list">
        {GUIDES.map((guide) => (
          <li key={guide.slug}>
            <strong>{guide.title}</strong>
            <span>{guide.pages} pages</span>
          </li>
        ))}
      </ol>
      <h2>Two worksheets to keep you moving</h2>
      <p>
        Track applications with application-tracker.csv and record interview
        practice with practice-log.csv. Open them in a spreadsheet app such as
        Excel, Numbers or Google Sheets, and adapt them to your search.
      </p>
      <h2>What to expect</h2>
      <p>
        The guides are reference and practice material, with exercises at the
        end of each guide. The 281 pages are unique across the combined
        playbook; the individual PDFs repeat that content in a convenient
        format. There is no separate salary course, personal coaching,
        certification, recruitment service or guaranteed hiring outcome.
      </p>
      <h2>Delivered to your inbox</h2>
      <p>
        After confirmed payment, your email includes the complete PDF and a ZIP
        of the entire collection. A backup download link is valid for 7 days.
        Save the files to keep them. You need a PDF reader, a ZIP extractor and
        a spreadsheet app for the CSVs; there is no required paid software,
        physical delivery or storefront account.
      </p>
      <p>
        <Link href="/#inside">Browse real sample pages →</Link>
      </p>
    </PolicyPage>
  );
}
