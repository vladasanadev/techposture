
import { storefrontPath } from "@/lib/site-path";
import { GUIDES } from "@/lib/product";
export type MagazinePage = { src: string; title: string; alt: string };
export const RESOURCES = [
  {
    slug: "00-start-here",
    title: "Start-here roadmap",
    benefit: "Know what to work on next.",
    description:
      "A 22-page roadmap connects your applications, outreach and interview practice with a 14-day plan.",
  },
  ...GUIDES,
] as const;
const makePage = (slug: string, title: string): MagazinePage => ({
  src: storefrontPath(`/images/guides/${slug}.webp`),
  title,
  alt: `${title}. Actual page from The Developer Job Search Playbook.`,
});
/** Public covers and contents pages only. All complete PDFs and worksheets stay private. */
export const MAGAZINE_PAGES: MagazinePage[] = [
  makePage("00-start-here-1", "Playbook cover"),
  ...RESOURCES.flatMap(({ slug, title }) => [
    makePage(`${slug}-1`, `${title}: cover`),
    makePage(`${slug}-2`, `${title}: contents`),
  ]),
  makePage("00-start-here-1", "Playbook cover"),
];
export const LEAF_COUNT = MAGAZINE_PAGES.length / 2;
export const FIRST_RESOURCE = 1;
export const LAST_RESOURCE = RESOURCES.length;
export function visiblePages(spread: number): MagazinePage[] {
  if (spread === 0) return [MAGAZINE_PAGES[0]];
  if (spread === LEAF_COUNT) return [MAGAZINE_PAGES[MAGAZINE_PAGES.length - 1]];
  return [MAGAZINE_PAGES[spread * 2 - 1], MAGAZINE_PAGES[spread * 2]];
}
export function spreadName(spread: number): string {
  return RESOURCES[spread - 1]?.title ?? "Cover";
}
