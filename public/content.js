// Shared, REAL content for every design direction. Do not invent clients, numbers, quotes or testimonials.
// Copy rules (Vlada's own voice rules): no em dashes, no exclamation points, no "it's not X, it's Y" reframes,
// no buzzwords (elevate, seamless, unleash, game-changer, delve, supercharge, cutting-edge).

export const SITE = {
  name: 'Vlada Kandyba',
  first: 'Vlada',
  brand: 'vladasana',
  handle: '@vlada.asana',
  role: 'Developer Advocate & Tech Creator',
  hello: "Hello World, I'm Vlada",
  // Her own bio copy from the current site (audience updated from 30K+ to 50K+):
  bio: "I'm a content creator, builder, and Developer Advocate creating videos and campaigns for a 50K+ audience of developers, AI users, founders, and tech professionals.",
  promise: 'I turn complex tools into practical stories, demos, and launches people actually understand.',
  status: 'Tech storytelling system active',
  workEmail: 'hello.vladasana@gmail.com',
  workEmailHref: 'mailto:hello.vladasana@gmail.com',
  supportEmail: 'support@vladasana.com',
  consultationForm: 'https://docs.google.com/forms/d/e/1FAIpQLSezqkTT8Htx6nAKedL4nRbl8qUwlBEd8C-SNsIqIGUQWhVWSA/viewform',
  jobBundle: 'https://vladasana.com/Job-bundle',
  blog: 'https://vladasana.com/techblog',
  automations: 'https://vladasana.com/automations',
};

export const SOCIALS = [
  { id: 'instagram', label: 'Instagram', handle: '@vlada.asana', href: 'https://www.instagram.com/vlada.asana/', followers: '58.3K' },
  { id: 'tiktok', label: 'TikTok', handle: '@vlada.asana', href: 'https://www.tiktok.com/@vlada.asana' },
  { id: 'x', label: 'X', handle: '@vladasanadev', href: 'https://x.com/vladasanadev' },
  { id: 'linkedin', label: 'LinkedIn', handle: 'Vlada Kandyba', href: 'https://www.linkedin.com/in/vlada-kandyba-3386a2227' },
];

export const STATS = [
  { value: 58.3, suffix: 'K', decimals: 1, label: 'followers on Instagram' },
  { value: 40, suffix: '', decimals: 0, label: 'brand partners' },
  { value: 326, suffix: 'K', decimals: 0, label: 'views on one Hostinger demo' },
  { value: 806, suffix: 'K+', decimals: 0, label: 'views across ten featured reels' },
];

export const AUDIENCE = {
  countries: [
    { name: 'India', code: 'IN', lat: 21.0, lon: 78.0 },
    { name: 'United States', code: 'US', lat: 39.5, lon: -98.35 },
    { name: 'Canada', code: 'CA', lat: 56.1, lon: -106.3 },
    { name: 'Brazil', code: 'BR', lat: -10.3, lon: -53.1 },
    { name: 'Germany', code: 'DE', lat: 51.2, lon: 10.4 },
  ],
  who: ['Developers', 'AI users', 'Founders', 'Tech professionals'],
};

export const TIERS = [
  { id: 1, label: 'Tier I', title: 'Household names', from: 1, to: 4 },
  { id: 2, label: 'Tier II', title: 'Category leaders', from: 5, to: 10 },
  { id: 3, label: 'Tier III', title: 'Breakout tools', from: 11, to: 22 },
  { id: 4, label: 'Tier IV', title: 'Builders to watch', from: 23, to: 40 },
];

/** Ranked by how big and well-known each brand is. Rank 1 is the biggest. This order is the point: visualise it. */
export const CLIENTS = [
  { rank: 1, name: 'SpaceX AI', icon: 'spacex' },
  { rank: 2, name: 'Grok' },
  { rank: 3, name: 'CapCut' },
  { rank: 4, name: 'Cursor', icon: 'cursor' },
  { rank: 5, name: 'Hostinger', icon: 'hostinger', tile: 'hostinger' },
  { rank: 6, name: 'Ledger', tile: 'ledger', bg: '#000000' },
  { rank: 7, name: 'Replit', icon: 'replit' },
  { rank: 8, name: 'Lovable', tile: 'lovable', bg: '#14122e' },
  { rank: 9, name: 'HeyGen', tile: 'heygen', bg: '#ffffff' },
  { rank: 10, name: 'MiniMax', icon: 'minimax', tile: 'minimax', bg: '#ffffff' },
  { rank: 11, name: 'n8n', icon: 'n8n' },
  { rank: 12, name: 'Higgsfield AI', tile: 'higgsfield', bg: '#d1fe17' },
  { rank: 13, name: 'Genspark' },
  { rank: 14, name: 'Meshy AI' },
  { rank: 15, name: 'Dreamina' },
  { rank: 16, name: 'Tangem', tile: 'tangem' },
  { rank: 17, name: 'Emergent' },
  { rank: 18, name: 'Jupiter Lend' },
  { rank: 19, name: 'Headout', tile: 'headout', bg: '#7e00ff' },
  { rank: 20, name: 'Ironhack', tile: 'ironhack' },
  { rank: 21, name: 'SheCodes', tile: 'shecodes', bg: '#ffffff' },
  { rank: 22, name: '4Geeks Academy', tile: '4geeks', bg: '#14122e' },
  { rank: 23, name: 'Virtuals', tile: 'virtuals', bg: '#dbf8e4' },
  { rank: 24, name: 'Cloaked' },
  { rank: 25, name: 'Greptile' },
  { rank: 26, name: 'Fish Audio', icon: 'fishaudio' },
  { rank: 27, name: 'Bluedot', tile: 'bluedot', bg: '#ffffff' },
  { rank: 28, name: 'Fhenix' },
  { rank: 29, name: 'Verdent', tile: 'verdent' },
  { rank: 30, name: 'CREAO' },
  { rank: 31, name: 'ChatCut' },
  { rank: 32, name: 'HiNoter', tile: 'hinoter' },
  { rank: 33, name: 'VidMuse' },
  { rank: 34, name: 'SuperProfile' },
  { rank: 35, name: 'DeepPocket', tile: 'deeppocket' },
  { rank: 36, name: 'GameDev', tile: 'gamedev' },
  { rank: 37, name: 'Astraux', tile: 'astraux', bg: '#0b0b10' },
  { rank: 38, name: 'Tesana AI' },
  { rank: 39, name: 'UTell AI' },
  { rank: 40, name: 'Privara', note: 'by Fhenix' },
];
export const tierOf = (rank) => TIERS.find((t) => rank >= t.from && rank <= t.to);
/** Logo tile URL relative to a direction folder (tiles are 192x192 WebP, some need their bg colour). */
export const tileUrl = (slug) => '../shared/media/logos/' + slug + '.webp';

/** Instagram reels. embed = iframe src (9:16, loads Instagram's player), link = open on Instagram. */
export const REEL_GROUPS = [
  { id: 'tech-ai', label: 'Tech + AI', reels: [
    { title: 'Software Demo', brand: 'Hostinger', views: '326K', viewsN: 326, embed: 'https://www.instagram.com/reel/DUDhxE9EaN3/embed', link: 'https://www.instagram.com/reel/DUDhxE9EaN3/' },
    { title: 'Brand Awareness', brand: 'Lovable', views: '27K', viewsN: 27, embed: 'https://www.instagram.com/reel/DNYOZi-t4Do/embed', link: 'https://www.instagram.com/reel/DNYOZi-t4Do/' },
    { title: 'Product Sale', brand: 'Emergent', views: '72.3K', viewsN: 72.3, embed: 'https://www.instagram.com/reel/DWjGdZQkce2/embed', link: 'https://www.instagram.com/reel/DWjGdZQkce2/' },
    { title: 'Protocol Demo', brand: 'Virtuals', views: '63K', viewsN: 63, embed: 'https://www.instagram.com/reel/DXto6dkkdd5/embed', link: 'https://www.instagram.com/reel/DXto6dkkdd5/' },
  ] },
  { id: 'finance', label: 'Finance', reels: [
    { title: 'Finance Explainer', brand: 'DeepPocket', views: '28K', viewsN: 28, embed: 'https://www.instagram.com/reel/DYCML8RAD3M/embed', link: 'https://www.instagram.com/reel/DYCML8RAD3M/' },
    { title: 'Payment Demo', brand: 'VPay', views: null, embed: 'https://www.instagram.com/reel/DTcppaDkbG6/embed', link: 'https://www.instagram.com/reel/DTcppaDkbG6/' },
    { title: 'Event Invitation', brand: 'AstraUX', views: '15K', viewsN: 15, embed: 'https://www.instagram.com/reel/DOGrEdnjYfT/embed', link: 'https://www.instagram.com/reel/DOGrEdnjYfT/' },
    { title: 'Research Signal', brand: 'IdeaBrowser', views: '111K', viewsN: 111, embed: 'https://www.instagram.com/reel/DVvqeSXCSD1/embed', link: 'https://www.instagram.com/reel/DVvqeSXCSD1/' },
  ] },
  { id: 'events', label: 'Events', reels: [
    { title: 'Event Recap', brand: 'DLC Group', views: '126K', viewsN: 126, embed: 'https://www.instagram.com/reel/DQ81BMvEXTC/embed', link: 'https://www.instagram.com/reel/DQ81BMvEXTC/' },
    { title: 'Live Activation', brand: 'AstraUX', views: null, embed: 'https://www.instagram.com/reel/DOOzvMEgA8D/embed', link: 'https://www.instagram.com/reel/DOOzvMEgA8D/' },
    { title: 'Event Coverage', brand: 'EigenLayer', views: '10K', viewsN: 10, embed: 'https://www.instagram.com/reel/DK_6ljXNl0I/embed', link: 'https://www.instagram.com/reel/DK_6ljXNl0I/' },
    { title: 'Community Event', brand: 'Bluedot', views: '28K', viewsN: 28, embed: 'https://www.instagram.com/reel/DZcbH9TJ9WY/embed', link: 'https://www.instagram.com/reel/DZcbH9TJ9WY/' },
  ] },
];
export const REELS = REEL_GROUPS.flatMap((g) => g.reels.map((r) => ({ ...r, group: g.label })));

export const SERVICES = [
  { n: '01', title: 'Video campaigns', short: 'Reels that launch products.', body: 'Short-form campaigns for Instagram, TikTok and Shorts, built around the one thing you want a viewer to do next. I handle the idea, the shoot and the edit.', deliverables: ['Concept + script', 'Filming + edit', 'Posting + boosting plan', 'Performance recap'] },
  { n: '02', title: 'Developer advocacy', short: 'A developer’s voice for your product.', body: 'I use your tool like an engineer would, then explain it like a friend would. Ongoing content, community answers and honest product feedback for your team.', deliverables: ['Monthly content series', 'Community presence', 'Docs + DX feedback', 'Launch support'] },
  { n: '03', title: 'Technical demos', short: 'Watch it work, live on camera.', body: 'Walkthroughs that build something real in a few minutes, so viewers see why it matters before they lose interest. Software, AI agents, APIs and protocols.', deliverables: ['Build-along demos', 'Screen + face recordings', 'Code samples', 'Repurposed cuts'] },
  { n: '04', title: 'Launch education', short: 'A new launch, explained the same day.', body: 'Explainers, cheat sheets and guides that turn a launch into something people can use the same day. Written and filmed with technical accuracy.', deliverables: ['Explainer videos', 'Guides + cheat sheets', 'Carousel posts', 'Newsletter features'] },
  { n: '05', title: 'Workshops + live events', short: 'Coverage that outlives the event.', body: 'Hackathons, conferences and community nights: coverage, recaps and live activations that keep working long after the event ends.', deliverables: ['Event coverage', 'Recap reels', 'Workshops + talks', 'Community activations'] },
  { n: '06', title: 'Creator-led brand films', short: 'Cinematic product films and UGC ads.', body: 'Creative direction for brands that want something more crafted: cinematic product films, UGC ads and brand identity pieces made with AI video tools and taste.', deliverables: ['Creative direction', 'AI-assisted production', 'UGC ad variants', 'Brand identity pieces'] },
];

/** The Job Bundle store (lives at /Job-bundle). Price is real: $19, one payment. */
export const BUNDLE = {
  name: 'The Developer Job Search Playbook',
  short: 'The Job Bundle',
  price: 19,
  href: 'https://vladasana.com/Job-bundle',
  pitch: 'The exact system: find humans, tailor the CV, interview cleanly, and negotiate without sounding desperate.',
  totalPages: 259,
  guides: [
    { n: '01', title: 'CV preparation', pages: 10, benefit: 'Make your experience relevant.' },
    { n: '02', title: 'Behavioral interviews', pages: 23, benefit: 'Turn experience into answers.' },
    { n: '03', title: 'Questions for interviewers', pages: 15, benefit: 'Make it a real conversation.' },
    { n: '04', title: 'JavaScript', pages: 24, benefit: 'Explain the fundamentals.' },
    { n: '05', title: 'React', pages: 24, benefit: 'Go beyond memorised answers.' },
    { n: '06', title: 'Big O & complexity', pages: 23, benefit: 'Explain your trade-offs.' },
    { n: '07', title: 'APIs', pages: 20, benefit: 'Connect the pieces.' },
    { n: '08', title: 'Databases', pages: 24, benefit: 'Make better data decisions.' },
    { n: '09', title: 'SQL', pages: 25, benefit: 'Turn knowledge into queries.' },
    { n: '10', title: 'Git', pages: 25, benefit: 'Talk through your workflow.' },
    { n: '11', title: 'Docker', pages: 24, benefit: 'Understand what you ship.' },
    { n: '12', title: 'System design', pages: 22, benefit: 'Show how you think.' },
  ],
  // Cover art (portrait 1086x1448 or 1024x1536) in ../shared/media/bundle/
  covers: ['magazine-cover', 'magazine-technical', 'magazine-interview', 'magazine-guide', 'magazine-outreach', 'magazine-salary', 'magazine-tracker', 'magazine-back'],
};

export const AUTOMATIONS = {
  name: 'Busy Brain Automations',
  headline: '3 simple AI automations to start',
  line: 'your brain creates. the system remembers.',
  href: 'https://vladasana.com/automations',
  free: [
    { title: 'Capture ideas before they disappear', body: 'Turn half-formed thoughts into saved context you can actually find later.' },
    { title: 'Turn existing context into content', body: 'Use what you already wrote, watched, saved, and tested as source material.' },
    { title: 'Reduce repetitive manual work', body: 'Let the system prepare drafts and summaries, then keep the final judgment with you.' },
  ],
};

export const POSTS = [
  { title: 'Claude.md', slug: 'claude-dot-md', tag: 'content', minutes: 9 },
  { title: 'GPT-6 Astra', slug: 'gpt-6-astra', tag: 'tech interview', minutes: 4 },
  { title: '3 Simple AI Agents That Run My Content', slug: '3-simple-ai-agents-that-run-my-content', tag: 'content', minutes: 3 },
  { title: 'Lazymaxxing Video Edit', slug: 'lazymaxxing-video-edit', tag: 'content', minutes: 2 },
  { title: 'Everything You Need To Know About Git', slug: 'everything-you-need-to-know-about-git', tag: 'tech interview', minutes: 19 },
  { title: 'Everything You Need To Know About API', slug: 'everything-you-need-to-know-about-api', tag: 'tech interview', minutes: 19 },
  { title: 'Everything You Need To Know About Database Design', slug: 'everything-you-need-to-know-about-database-design', tag: 'tech interview', minutes: 19 },
  { title: 'Everything You Need To Know About Docker', slug: 'everything-you-need-to-know-about-docker', tag: 'tech interview', minutes: 18 },
  { title: 'Harness 101', slug: 'harness-101', tag: 'tech interview', minutes: 8 },
  { title: 'React 2026 Roadmap', slug: 'react-2026-roadmap', tag: 'tech interview', minutes: 1 },
  { title: 'Top 5 Claude Skills', slug: 'top-5-claude-skills', tag: 'tech interview', minutes: 1 },
  { title: 'Land A Job In 2026', slug: 'land-a-job-in-2026', tag: 'content', minutes: 1 },
  { title: 'Reviewing AI-Generated Code', slug: 'reviewing-ai-generated-code', tag: 'tech interview', minutes: 3 },
  { title: 'Behavioral Interviews', slug: 'behavioral-interviews', tag: 'tech interview', minutes: 16 },
].map((p) => ({ ...p, href: 'https://vladasana.com/techblog/' + p.slug }));

/** Portraits (stylised 3D renders of Vlada, profile facing left, indigo studio background). */
export const MEDIA = {
  profile: '../shared/media/vlada-profile.webp',        // 1465x1073, circuit collar, indigo bg
  profileCut: '../shared/media/vlada-profile-cut.webp', // 797x952 transparent cutout
  clean: '../shared/media/vlada-clean.webp',            // 1466x1073, clean collar, periwinkle bg
  cleanCut: '../shared/media/vlada-clean-cut.webp',     // 854x971 transparent cutout
  helmet: '../shared/media/vlada-helmet.webp',          // 1466x1073, glass helmet full of circuits + plants
  helmetCut: '../shared/media/vlada-helmet-cut.webp',   // 888x1029 transparent cutout
  playbook: '../shared/media/playbook-scene.webp',      // 1536x1024 Job Bundle product scene
  automations: '../shared/media/busy-brain-phones.webp',// 1100x825 automations phones render
  globePoints: '../shared/data/globe-points.json',      // {stride:3, points:[lat,lon,flag,...]} land dots, flag=1 for audience countries
};

/** SVG paths (24x24 viewBox) for brand + social marks. */
export const ICONS = {"spacex":{"title":"SpaceX","hex":"#000000","path":"M24 7.417C8.882 8.287 1.89 14.75.321 16.28L0 16.583h2.797C10.356 9.005 21.222 7.663 24 7.417zm-17.046 6.35c-.472.321-.945.68-1.398 1.02l2.457 1.796h2.778zM2.948 10.8H.189l3.25 2.381c.473-.321 1.02-.661 1.512-.945Z"},"cursor":{"title":"Cursor","hex":"#000000","path":"M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"},"hostinger":{"title":"Hostinger","hex":"#673DE6","path":"M16.415 0v7.16l5.785 3.384V2.949L16.415 0ZM1.8 0v11.237h18.815L14.89 8.09l-7.457-.003V3.024L1.8 0Zm14.615 20.894v-5.019l-7.514-.005c.007.033-5.82-3.197-5.82-3.197l19.119.091V24l-5.785-3.106ZM1.8 13.551v7.343l5.633 2.949v-6.988L1.8 13.551Z"},"replit":{"title":"Replit","hex":"#F26207","path":"M2 1.5A1.5 1.5 0 0 1 3.5 0h7A1.5 1.5 0 0 1 12 1.5V8H3.5A1.5 1.5 0 0 1 2 6.5ZM12 8h8.5A1.5 1.5 0 0 1 22 9.5v5a1.5 1.5 0 0 1-1.5 1.5H12ZM2 17.5A1.5 1.5 0 0 1 3.5 16H12v6.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 2 22.5Z"},"minimax":{"title":"MiniMax","hex":"#E73562","path":"M11.43 3.92a.86.86 0 1 0-1.718 0v14.236a1.999 1.999 0 0 1-3.997 0V9.022a.86.86 0 1 0-1.718 0v3.87a1.999 1.999 0 0 1-3.997 0V11.49a.57.57 0 0 1 1.139 0v1.404a.86.86 0 0 0 1.719 0V9.022a1.999 1.999 0 0 1 3.997 0v9.134a.86.86 0 0 0 1.719 0V3.92a1.998 1.998 0 1 1 3.996 0v11.788a.57.57 0 1 1-1.139 0zm10.572 3.105a2 2 0 0 0-1.999 1.997v7.63a.86.86 0 0 1-1.718 0V3.923a1.999 1.999 0 0 0-3.997 0v16.16a.86.86 0 0 1-1.719 0V18.08a.57.57 0 1 0-1.138 0v2a1.998 1.998 0 0 0 3.996 0V3.92a.86.86 0 0 1 1.719 0v12.73a1.999 1.999 0 0 0 3.996 0V9.023a.86.86 0 1 1 1.72 0v6.686a.57.57 0 0 0 1.138 0V9.022a2 2 0 0 0-1.998-1.997"},"n8n":{"title":"n8n","hex":"#EA4B71","path":"M21.4737 5.6842c-1.1772 0-2.1663.8051-2.4468 1.8947h-2.8955c-1.235 0-2.289.893-2.492 2.111l-.1038.623a1.263 1.263 0 0 1-1.246 1.0555H11.289c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947s-2.1663.8051-2.4467 1.8947H4.973c-.2805-1.0896-1.2696-1.8947-2.4468-1.8947C1.1311 9.4737 0 10.6047 0 12s1.131 2.5263 2.5263 2.5263c1.1772 0 2.1663-.8051 2.4468-1.8947h1.4223c.2804 1.0896 1.2696 1.8947 2.4467 1.8947 1.1772 0 2.1663-.8051 2.4468-1.8947h1.0008a1.263 1.263 0 0 1 1.2459 1.0555l.1038.623c.203 1.218 1.257 2.111 2.492 2.111h.3692c.2804 1.0895 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263c-1.1772 0-2.1664.805-2.4468 1.8947h-.3692a1.263 1.263 0 0 1-1.246-1.0555l-.1037-.623A2.52 2.52 0 0 0 13.9607 12a2.52 2.52 0 0 0 .821-1.4794l.1038-.623a1.263 1.263 0 0 1 1.2459-1.0555h2.8955c.2805 1.0896 1.2696 1.8947 2.4468 1.8947 1.3952 0 2.5263-1.131 2.5263-2.5263s-1.131-2.5263-2.5263-2.5263m0 1.2632a1.263 1.263 0 0 1 1.2631 1.2631 1.263 1.263 0 0 1-1.2631 1.2632 1.263 1.263 0 0 1-1.2632-1.2632 1.263 1.263 0 0 1 1.2632-1.2631M2.5263 10.7368A1.263 1.263 0 0 1 3.7895 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 1.2632 12a1.263 1.263 0 0 1 1.2631-1.2632m6.3158 0A1.263 1.263 0 0 1 10.1053 12a1.263 1.263 0 0 1-1.2632 1.2632A1.263 1.263 0 0 1 7.579 12a1.263 1.263 0 0 1 1.2632-1.2632m10.1053 3.7895a1.263 1.263 0 0 1 1.2631 1.2632 1.263 1.263 0 0 1-1.2631 1.2631 1.263 1.263 0 0 1-1.2632-1.2631 1.263 1.263 0 0 1 1.2632-1.2632"},"fishaudio":{"title":"Fish Audio","hex":"#9B90E8","path":"M23.12 12.13v.62c0 .24.19.44.44.44.24 0 .44-.2.44-.44v-.62c0-.24-.2-.44-.44-.44-.25 0-.44.2-.44.44m-1.77.37v1.74c0 .24.2.44.44.44.25 0 .44-.2.44-.44V12.5c0-.24-.19-.44-.44-.44-.24 0-.44.2-.44.44m-1.76.43v1.99q0 .09.03.17.04.08.1.14.07.07.15.1t.17.03c.24 0 .44-.19.44-.44v-1.99c0-.25-.2-.44-.44-.44q-.09 0-.17.03t-.15.1q-.06.06-.1.14-.03.08-.03.17m-1.76.35v1.97c0 .24.19.44.44.44.24 0 .44-.2.44-.44v-1.97c0-.24-.2-.44-.44-.44-.25 0-.44.2-.44.44m-1.77.32v1.65c0 .25.2.45.44.45s.44-.2.44-.45V13.6c0-.25-.2-.45-.44-.45s-.44.2-.44.45m-1.76 1.26v.3q.01.17.14.3.13.11.3.12.18-.01.31-.12.13-.13.14-.3v-.3q-.01-.17-.14-.3-.13-.11-.31-.12-.17.01-.3.12-.13.13-.14.3M0 9.38v.19c0 .24.2.44.44.44.25 0 .44-.2.44-.44v-.19c0-.25-.19-.44-.44-.44-.24 0-.44.19-.44.44m1.82.15v.81c0 .24.19.44.44.44.24 0 .44-.2.44-.44v-.81q0-.18-.13-.31t-.31-.13-.31.13-.13.31m1.81-.24v3.39q.01.17.14.3.13.11.3.12.18-.01.31-.12.13-.13.14-.3V9.29q-.01-.17-.14-.3-.13-.11-.31-.12-.17.01-.3.12-.13.13-.14.3m1.83-.35v.22c0 .24.19.44.44.44.24 0 .44-.2.44-.44v-.22q0-.18-.13-.31T5.9 8.5t-.31.13-.13.31m0 2.94v2.34c0 .25.19.44.44.44.24 0 .44-.19.44-.44v-2.34c0-.24-.2-.44-.44-.44-.25 0-.44.2-.44.44m15.89-3.32V11c0 .25.2.44.44.44.25 0 .44-.19.44-.44V8.56c0-.24-.19-.44-.44-.44-.24 0-.44.2-.44.44m-1.76-.39v3.28q.01.17.14.3.13.11.3.12.18-.01.31-.12.13-.13.14-.3V8.17c0-.25-.2-.44-.44-.44q-.09 0-.17.03t-.15.1q-.06.06-.1.14-.03.08-.03.17M17.83 8v3.9c0 .24.19.44.44.44.24 0 .44-.2.44-.44V8c0-.25-.2-.44-.44-.44-.25 0-.44.19-.44.44m-1.77.11v3.96c0 .25.2.44.44.44s.44-.19.44-.44V8.11c0-.25-.2-.44-.44-.44s-.44.19-.44.44m-1.76.27v5.03q.01.17.14.3.13.11.3.12.18-.01.31-.12.13-.13.14-.3V8.38c0-.25-.2-.44-.45-.44-.24 0-.44.19-.44.44m-1.8.46v5.75q.01.17.14.3.13.11.3.12.18-.01.31-.12.13-.13.14-.3V8.84c0-.25-.2-.44-.45-.44-.24 0-.44.19-.44.44m-1.76.76v5.52c0 .24.2.44.44.44.25 0 .44-.2.44-.44V9.6c0-.24-.19-.44-.44-.44-.24 0-.44.2-.44.44m-1.77 1.01v4.77q.01.17.14.3.13.11.3.12.18-.01.31-.12.13-.13.14-.3v-4.77q-.01-.17-.14-.3-.13-.11-.31-.12-.17.01-.3.12-.13.13-.14.3M23.12 9.6v1.22c0 .24.19.44.44.44.24 0 .44-.2.44-.44V9.6c0-.24-.2-.44-.44-.44-.25 0-.44.2-.44.44M7.21 11.32V16c0 .24.19.44.44.44.24 0 .44-.2.44-.44v-4.68q0-.18-.13-.31t-.31-.13-.31.13-.13.31"},"instagram":{"title":"Instagram","hex":"#FF0069","path":"M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"},"tiktok":{"title":"TikTok","hex":"#000000","path":"M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"},"x":{"title":"X","hex":"#000000","path":"M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"}};
ICONS.linkedin = { title: 'LinkedIn', hex: '#0A66C2', path: 'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z' };

/** About Vlada, confirmed by Amir (2026-10-03). Use as SUBTLE personal details, never as a CV dump. */
export const PERSON = {
  from: 'Ukraine',
  helloUk: 'Привіт, світе', // "Hello, world" in Ukrainian (no exclamation point, per her voice rules)
  studied: 'Studied software development',
  engineer: 'Computer engineer',
  yoga: 'Certified yoga instructor',
  creator: 'Creates tech and AI content',
  brands: 'Works with top tech brands',
  events: 'Runs events for top tech brands',
};

/** Extra geo data: Natural Earth countries (178, coords rounded to 0.01°) and Ukraine on its own. */
MEDIA.world = '../shared/data/world.geo.json';
MEDIA.ukraine = '../shared/data/ukraine.geo.json';

/* More facts from Amir (2026-10-03, round 2). */
PERSON.education = 'Studied software development at Taras Shevchenko University, Ukraine';
PERSON.experience = 'Software developer for 12+ years';
/** How she wants the site to feel. Every direction needs moments of whimsy and surprise. */
PERSON.feel = ['Inspired', 'Whimsical', 'Creative', 'Unique'];
// Do NOT mention where she lives now. "From Ukraine" is fine.
// Yoga stays a subtle detail for now.

/** Events she has run. */
export const EVENTS = {
  ranFor: ['Lovable', 'Solana Superteam'],
  line: 'Events and creator experiences for tech brands',
};

/* Her own voice and look, from her Instagram (@vlada.asana, display name "Vlada Tech Bro"). */
PERSON.bio = 'free spirited dev';                                // her IG bio (with a 💿 emoji)
PERSON.phrase = 'ambitious, delusional, multipassionate';        // from one of her posts
PERSON.voice = 'Funny, self-aware dev humour: POV memes, "unhinged things I did this week", "where is the error?"';
PERSON.look = {
  hair: 'long, straight, copper-red (her signature)',
  extras: ['glasses (thin frames)', 'big over-ear headphones (white, sometimes yellow)', 'navy pinstripe vest over a white tee', 'red hoodie', 'laptop with code on screen'],
  palette: ['copper red', 'cherry red', 'white', 'black', 'sky blue'],
};
