import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
const assets = [
  {
    name: "hero-scene",
    source:
      "/Users/amir/.codex/generated_images/01a07215-f82e-7a91-a236-7423c69287a9/exec-0d79d375-06dd-4e21-a4ce-2809e00dcea4.png",
  },
  {
    name: "cherry-pair",
    source:
      "/Users/amir/.codex/generated_images/01a07215-f82e-7a91-a236-7423c69287a9/exec-d9f32138-1f86-4e91-a2ee-5a3b6167dbe6.png",
  },
  {
    name: "magazine-cover",
    source:
      "/Users/amir/.codex/generated_images/01a07215-f82e-7a91-a236-7423c69287a9/exec-02f52652-973a-4285-91d9-5ab3fd3201af.png",
  },
  {
    name: "magazine-guide",
    source:
      "/Users/amir/.codex/generated_images/01a07215-f82e-7a91-a236-7423c69287a9/exec-bbf0a3d2-bb22-4550-bf44-058c0db62966.png",
  },
  {
    name: "magazine-interview",
    source:
      "/Users/amir/.codex/generated_images/01a07215-f82e-7a91-a236-7423c69287a9/exec-cc88b7b3-57a3-4524-9fb5-bde9de6c0409.png",
  },
  {
    name: "magazine-technical",
    source:
      "/Users/amir/.codex/generated_images/01a07215-f82e-7a91-a236-7423c69287a9/exec-05a5e97d-7b33-41a3-babf-2639a60f8dee.png",
  },
  {
    name: "magazine-outreach",
    source:
      "/Users/amir/.codex/generated_images/01a07215-f82e-7a91-a236-7423c69287a9/exec-8583ef35-c9c0-4143-ad7c-30d9c1c17f4a.png",
  },
  {
    name: "magazine-tracker",
    source:
      "/Users/amir/.codex/generated_images/01a07215-f82e-7a91-a236-7423c69287a9/exec-02ef085f-a64e-4133-b35e-af8749c670d7.png",
  },
  {
    name: "magazine-salary",
    source:
      "/Users/amir/.codex/generated_images/01a07215-f82e-7a91-a236-7423c69287a9/exec-acd2be74-cb8e-4370-ab42-1883f785f5d7.png",
  },
  {
    name: "magazine-back",
    source:
      "/Users/amir/.codex/generated_images/01a07215-f82e-7a91-a236-7423c69287a9/exec-ce8fcdb0-ed6f-40bf-bcd6-b2fbed876ef5.png",
  },
  {
    name: "email-banner",
    source:
      "/Users/amir/.codex/generated_images/01a07215-f82e-7a91-a236-7423c69287a9/exec-6b502612-f7cd-4462-8d35-4b8b093d1c93.png",
  },
];
await mkdir("public/images", { recursive: true });
const manifest = [];
for (const asset of assets) {
  const isHero = asset.name === "hero-scene";
  const target = "public/images/" + asset.name + ".webp";
  const info = await sharp(asset.source)
    .resize({
      width: isHero ? 1920 : asset.name === "cherry-pair" ? 400 : 1100,
      withoutEnlargement: true,
    })
    .webp({ quality: isHero ? 87 : 86, effort: 6 })
    .toFile(target);
  manifest.push({
    name: asset.name,
    path: target,
    width: info.width,
    height: info.height,
    bytes: info.size,
    provenance:
      "Original artwork generated with built-in image_gen; magazine pages are visual placeholders.",
  });
  console.log(
    asset.name,
    info.width + "x" + info.height,
    Math.round(info.size / 1024) + "KB",
  );
}
await writeFile(
  "docs/ASSET_MANIFEST.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
