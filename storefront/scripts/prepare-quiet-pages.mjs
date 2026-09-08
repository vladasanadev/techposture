import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

// Original public sample layouts, authored as editable SVG. These are not paid PDF pages.
const destination = new URL("../public/images/quiet/", import.meta.url);
await mkdir(destination, { recursive: true });
const ink = "#512126",
  paper = "#eeeae2";
const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
const text = (s, x, y, size = 24, extra = "") =>
  `<text x="${x}" y="${y}" fill="${ink}" font-family="Georgia,serif" font-size="${size}" ${extra}>${esc(s)}</text>`;
const sans = (s, x, y, size = 20, extra = "") =>
  `<text x="${x}" y="${y}" fill="${ink}" font-family="Arial,sans-serif" font-size="${size}" ${extra}>${esc(s)}</text>`;
const line = (y, x = 195, w = 720) =>
  `<path d="M${x} ${y}h${w}" stroke="#bfb1a4" stroke-width=".9"/>`;
const lines = (y, n = 4) =>
  Array.from({ length: n }, (_, i) => line(y + i * 27)).join("");
const resourceData = [
  {
    slug: "guide",
    label: "Job-search guide",
    title: ["A more focused", "job search."],
    intro: [
      "Choose where to put your time,",
      "then make each application intentional.",
    ],
    prompts: [
      ["Choose your roles.", "Which work fits your strengths and interests?"],
      [
        "Find your evidence.",
        "What have you done that is relevant to this role?",
      ],
      [
        "Plan the next step.",
        "What will you prepare, send or follow up this week?",
      ],
    ],
  },
  {
    slug: "interview",
    label: "Behavioral answers",
    title: ["Tell a story", "worth remembering."],
    intro: [
      "Build a clear answer around one real example.",
      "Use your own words and specific details.",
    ],
    prompts: [
      [
        "Set the scene.",
        "What was the situation, and what was your responsibility?",
      ],
      [
        "Describe your contribution.",
        "What did you do? Why did you choose that approach?",
      ],
      ["Show the outcome.", "What changed, and what did you learn?"],
    ],
  },
  {
    slug: "technical",
    label: "Technical prep",
    title: ["Know the", "essentials."],
    intro: [
      "You don’t need to know everything.",
      "Focus on fundamentals you can explain clearly.",
    ],
    prompts: [
      [
        "Git & APIs",
        "Commits, branches, pull requests. Requests, responses, HTTP.",
      ],
      ["Docker", "Images, containers, volumes and reproducible environments."],
      ["Databases", "Relationships, indexes, joins and transactions."],
    ],
  },
  {
    slug: "outreach",
    label: "CV + outreach",
    title: ["Make your", "experience relevant."],
    intro: [
      "Use these prompts to reframe your work and connect it",
      "to the role you want next.",
    ],
    prompts: [
      [
        "What was the context or challenge?",
        "What was happening? Who was affected?",
      ],
      ["What did you do?", "What actions did you take and why?"],
      ["What was the impact?", "What changed as a result? Be specific."],
    ],
  },
  {
    slug: "tracker",
    label: "Application tracker",
    title: ["Keep your", "next step clear."],
    intro: [
      "Give every application a place.",
      "Keep the next action close to the opportunity.",
    ],
    prompts: [
      [
        "The opportunity",
        "Company, role, link and the reason it interests you.",
      ],
      [
        "The conversation",
        "Your contact, the current stage and your last interaction.",
      ],
      ["The next step", "What needs to happen next? When will you follow up?"],
    ],
  },
  {
    slug: "salary",
    label: "Salary scripts",
    title: ["Prepare for the", "money conversation."],
    intro: [
      "Know what matters to you.",
      "Make room for a thoughtful conversation.",
    ],
    prompts: [
      [
        "Understand the range.",
        "Could you share the compensation range for this role?",
      ],
      [
        "Explain your expectations.",
        "Based on the scope and my experience, I’m targeting…",
      ],
      [
        "Consider the whole offer.",
        "Could we discuss the package and the flexibility on…",
      ],
    ],
  },
];
function svg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1020" height="660" viewBox="0 0 1020 660"><defs><filter id="grain"><feTurbulence baseFrequency=".7" numOctaves="3" stitchTiles="stitch"/></filter></defs><rect width="1020" height="660" fill="${paper}"/><rect width="1020" height="660" filter="url(#grain)" opacity=".022"/>${body}</svg>`;
}
async function save(name, body) {
  const gutter = name.endsWith("-left") ? "left" : "right";
  const stops =
    gutter === "left"
      ? '<stop stop-color="#584235" stop-opacity=".12"/><stop offset=".06" stop-color="#584235" stop-opacity="0"/><stop offset=".84" stop-color="#584235" stop-opacity="0"/><stop offset="1" stop-color="#584235" stop-opacity=".18"/>'
      : '<stop stop-color="#584235" stop-opacity=".18"/><stop offset=".09" stop-color="#584235" stop-opacity="0"/><stop offset=".94" stop-color="#584235" stop-opacity="0"/><stop offset="1" stop-color="#584235" stop-opacity=".09"/>';
  const source = svg(
    body +
      `<defs><linearGradient id="gutter">${stops}</linearGradient></defs><rect width="1020" height="660" fill="url(#gutter)"/>`,
  );
  await writeFile(new URL(`${name}.svg`, destination), source);
  await sharp(Buffer.from(source))
    .webp({ quality: 93 })
    .toFile(new URL(`${name}.webp`, destination).pathname);
}
for (const [index, resource] of resourceData.entries()) {
  const label = resource.label.toUpperCase();
  const left =
    `<rect x="50" width="70" height="660" fill="#754047"/>${sans(label, 0, 0, 18, 'fill="#faf4e9" transform="translate(95 240) rotate(-90)" letter-spacing="2"').replace(`fill="${ink}"`, "")}` +
    resource.title
      .map((t, i) => text(t, 178, 120 + i * 61, 59, 'letter-spacing="-2"'))
      .join("") +
    resource.intro.map((t, i) => text(t, 182, 242 + i * 26, 21)).join("") +
    sans("01", 180, 365, 20) +
    text(resource.prompts[0][0], 229, 365, 25) +
    text(
      resource.prompts[0][1],
      229,
      407,
      21,
      'font-style="italic" opacity=".68"',
    ) +
    lines(449, 5) +
    sans("VLADASANA / GET A JOB BUNDLE", 180, 625, 12, 'letter-spacing="2"');
  const right =
    sans("SAMPLE PREVIEW", 758, 48, 12, 'letter-spacing="2.5"') +
    resource.prompts
      .slice(1)
      .map((p, i) => {
        const y = 132 + i * 267;
        return (
          sans(`0${i + 2}`, 100, y, 20) +
          text(p[0], 147, y, 26) +
          text(p[1], 147, y + 42, 21, 'font-style="italic" opacity=".68"') +
          Array.from({ length: 4 }, (_, j) =>
            line(y + 79 + j * 27, 148, 725),
          ).join("")
        );
      })
      .join("") +
    sans(`0${index + 1} / 06`, 824, 625, 14, 'letter-spacing="3"');
  await save(`${resource.slug}-left`, left);
  await save(`${resource.slug}-right`, right);
}
await save(
  "cover",
  text("GET A JOB", 155, 290, 85) +
    text("BUNDLE", 155, 378, 85) +
    line(415, 160, 650) +
    text("vladasana", 155, 535, 35),
);
await save(
  "back",
  text("Your next step,", 155, 285, 72) +
    text("a little clearer.", 155, 367, 72, 'font-style="italic"') +
    text("vladasana", 155, 535, 35),
);
console.log(
  "Prepared 14 public sample-page textures and editable SVG sources.",
);
