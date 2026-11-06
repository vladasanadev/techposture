// assistant.js · the desk computer's brain. Rule-based on purpose: every answer is real, in Vlada's voice, and most of
// them take you somewhere. answer(text) returns { reply, action } where action is
//   { type: 'go', id, params }  scroll to a section (and tell its device what to show)
//   { type: 'open', url, label } open a page in a new tab (needs the click or key press that triggered it)
//   { type: 'copy', text }      copy to the clipboard
// Copy rules: no em dashes, no exclamation points, no buzzwords. Never say where she lives.

const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9а-яіїєґ'.+#\s-]/gi, ' ').replace(/\s+/g, ' ').trim();
const has = (t, ...words) => words.some((w) => (w instanceof RegExp ? w.test(t) : new RegExp(`(^|\\b|\\s)${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\b|\\s|$)`, 'i').test(t)));
const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];
const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K' : String(n));

export function makeAssistant({ content, data }) {
  const { SITE, SOCIALS, AUDIENCE, CLIENTS, POSTS } = content;
  const collabs = data.collabs?.brands || CLIENTS.map((c) => ({ ...c, reel: null }));
  const products = (data.library?.items || []).filter((i) => i.kind === 'product');
  const eng = data.engagement || null;
  const docs = data.docs || { bundle: { name: 'The Developer Job Search Playbook', pages: 281, guides: 12, price: 19, url: SITE.jobBundle }, automations: { url: SITE.automations } };
  let turn = 0;

  // things you can name directly
  const brandIdx = collabs.map((b) => ({ b, keys: [norm(b.name), norm(b.name).replace(/\s+(ai|academy)$/, '')].filter((k, i, a) => k.length > 1 && a.indexOf(k) === i) }));
  const POSTKEYS = {
    'claude-dot-md': ['claude.md', 'claude md', 'claudemd'], 'gpt-6-astra': ['gpt-6', 'gpt 6', 'gpt6', 'astra'],
    '3-simple-ai-agents-that-run-my-content': ['agents that run', 'content agents', 'ai content team'], 'lazymaxxing-video-edit': ['lazymaxxing'],
    'everything-you-need-to-know-about-git': ['git'], 'everything-you-need-to-know-about-api': ['api', 'apis'],
    'everything-you-need-to-know-about-database-design': ['database', 'databases', 'db design', 'sql'], 'everything-you-need-to-know-about-docker': ['docker', 'containers'],
    'harness-101': ['harness'], 'react-2026-roadmap': ['react'], 'top-5-claude-skills': ['claude skills', 'skills'], 'land-a-job-in-2026': ['land a job'],
    'reviewing-ai-generated-code': ['code review', 'reviewing', 'ai generated code', 'ai-generated'], 'behavioral-interviews': ['behavioral', 'behavioural', 'star method'],
  };
  const postIdx = POSTS.map((p) => ({ p, keys: POSTKEYS[p.slug] || [norm(p.title)] }));
  // the things she built, by name: each one is a box on the Library's products shelf
  const PRODKEYS = { 'ledger-dmk': ['ledger dmk', 'dmk'], water: ['spider-man', 'spiderman', 'spider man', 'water reminder'], 'net-motion': ['net motion', 'net / motion', 'net/motion'], 'travel-agent': ['travel agent', 'travel bot'], womansplain: ['womansplain', 'farcaster'] };
  const prodIdx = products.map((p) => ({ p, keys: PRODKEYS[p.id] || [norm(p.name)] }));
  const social = (id) => SOCIALS.find((s) => s.id === id);

  const go = (id, params) => ({ type: 'go', id, params });
  const open = (url, label) => ({ type: 'open', url, label });

  function answer(raw) {
    turn++;
    const t = norm(raw || '');
    if (!t) return { reply: pick(["type something. anything. i won't judge.", 'the keyboard is right there.', 'try: brands, rates, guides.'], turn) };

    // never say where she lives
    if (has(t, /where.*(live|based|located|stay)/, 'location', 'based', 'bangkok', 'thailand', 'city', 'address', 'timezone', 'time zone')) {
      return { reply: pick(['on the internet, mostly. from Ukraine.', 'wherever the wifi is good. from Ukraine.'], turn) };
    }
    if (has(t, /where.*from/, 'ukraine', 'ukrainian', 'nationality')) return { reply: 'from Ukraine. Привіт.' };

    // little jokes first, they are short
    if (has(t, 'where is the error', 'wheres the error', 'error', 'bug', 'debug')) return { reply: pick(['line 42. it is always line 42.', 'who knows where is the error. debugging time.', 'have you tried console.log("here")?'], turn) };
    if (has(t, /^sudo\b/)) return { reply: 'nice try. permission denied.' };
    if (has(t, /rm -rf/, 'drop table', 'format c')) return { reply: 'not today.' };
    if (has(t, 'hello world')) return { reply: "Hello World, I'm Vlada." };
    if (has(t, 'joke', 'funny', 'make me laugh')) return { reply: pick(['why do devs prefer dark mode? light attracts bugs.', 'there are 10 kinds of people. you know the rest.', 'my code works. i have no idea why. same.'], turn) };
    if (has(t, 'coffee', 'tea', 'matcha')) return { reply: 'brb, refilling.' };
    if (has(t, 'date', 'single', 'love', 'marry', 'boyfriend', 'girlfriend', 'crush')) return { reply: 'the coding date invite has entered the chat. still, this is a work computer.' };
    if (has(t, 'are you real', 'are you a bot', 'are you ai', 'chatbot', 'who made you', 'are you human')) return { reply: '100% vintage hardware. 0% chatbot. ok, maybe 10%.' };
    if (has(t, 'claude', 'chatgpt', 'openai', 'llm', 'replace you', 'ai replace') && !has(t, 'claude.md', 'claude md', 'skills')) return { reply: 'Claude is working hard to replace me. so far, so good.' };
    if (has(t, 'thanks', 'thank you', 'thx', 'ty', 'дякую')) return { reply: 'anytime. free spirited dev, at your service.' };
    if (has(t, /^(hi+|hello|hey+|yo|sup|hola|privit|привіт|hallo|gm|good morning)\b/)) return { reply: "Привіт. I'm Vlada's computer. ask me about brands, rates, guides, or type help." };
    if (has(t, 'help', 'menu', 'commands', 'what can you do', 'options', '?')) return { reply: 'try: brands, collabs, audience, numbers, guides, skills, hire.' };

    // money and work
    if (has(t, 'price', 'prices', 'pricing', 'rate', 'rates', 'cost', 'how much', 'budget', 'fee', 'charge', 'quote', 'media kit')) {
      return { reply: 'rates depend on the project. they live in her inbox. picking up the phone.', action: go('contact', { action: 'email' }) };
    }
    if (has(t, 'email', 'e-mail', 'mail', 'gmail')) return { reply: `${SITE.workEmail}. copied.`, action: { type: 'copy', text: SITE.workEmail, then: go('contact', { action: 'email' }) } };
    if (has(t, 'form', 'consultation', 'call', 'book', 'meeting', 'calendly', 'schedule')) return { reply: 'the consultation form. opening it.', action: open(SITE.consultationForm, 'consultation form') };
    if (has(t, 'hire', 'work with', 'collab with', 'collaborate', 'sponsor', 'partnership', 'partner with', 'contact', 'reach', 'dm', 'campaign', 'ugc', 'promote', 'advertise', 'work together', 'lets work', "let's work")) {
      return { reply: "let's work. picking up the phone.", action: go('contact') };
    }

    // social accounts
    for (const [id, words] of [['instagram', ['instagram', 'insta', 'ig']], ['tiktok', ['tiktok', 'tik tok']], ['x', ['twitter', 'x.com', /^x$/]], ['linkedin', ['linkedin', 'linked in']]]) {
      if (has(t, ...words)) { const s = social(id); if (s) return { reply: `${s.label}: ${s.handle}. opening it.`, action: open(s.href, s.label) }; }
    }

    // named things: a brand, a product, a post
    for (const { p, keys } of prodIdx) {
      if (keys.some((k) => t.includes(k))) return { reply: `${p.name}: ${p.meta.toLowerCase()}. vending it.`, action: go('docs', { item: p.id }) };
    }
    for (const { b, keys } of brandIdx) {
      if (keys.some((k) => (k.length <= 3 ? new RegExp(`\\b${k}\\b`).test(t) : t.includes(k)))) {
        if (b.reel) return { reply: `${b.name}: ${fmt(b.reel.plays)} plays on one reel. rolling the tape.`, action: go('collabs', { brand: b.name }) };
        return { reply: `${b.name} is on the list, rank ${b.rank} of 40. spinning to it.`, action: go('brands', { brand: b.name }) };
      }
    }
    for (const { p, keys } of postIdx) {
      if (keys.some((k) => (k.length <= 4 ? new RegExp(`(^|\\s)${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`).test(t) : t.includes(k)))) return { reply: `${p.title}. ${p.minutes} min. opening it.`, action: open(p.href, p.title) };
    }

    // sections
    // the Library: guides, skills and products, all equal; the playbook only when asked for by name
    if (has(t, 'job bundle', 'bundle', 'playbook', 'job search')) {
      if (has(t, 'buy', 'purchase', 'checkout', 'order', 'get it')) return { reply: `${docs.bundle.pages} pages for $${docs.bundle.price}. opening the store.`, action: open(docs.bundle.url, 'the store') };
      return { reply: `${docs.bundle.guides} guides for the job hunt. opening the library.`, action: go('docs', { item: 'bundle' }) };
    }
    if (has(t, 'skill', 'skills', 'claude skill', 'claude skills', 'claude.md')) return { reply: 'skills for Claude, free to take. opening the library.', action: go('docs', { kind: 'skill' }) };
    if (has(t, 'guide', 'guides', 'interview', 'interviews', 'cv', 'resume', 'salary', 'ebook', 'pdf', 'get a job', 'land a job', 'job', 'docs', 'doc', 'blog', 'article', 'articles', 'posts', 'writing', 'read', 'learn', 'tutorial', 'tutorials', 'library')) return { reply: 'guides, skills and the things she built. opening the library.', action: go('docs', { kind: 'guide' }) };
    if (has(t, 'automation', 'automations', 'busy brain', 'n8n', 'workflow', 'workflows', 'agents', 'agent')) return { reply: '3 simple AI automations, free. the system remembers.', action: go('docs', { doc: 'automations' }) };
    if (has(t, 'brand', 'brands', 'client', 'clients', 'partners', 'worked with', 'companies', 'sponsors', 'logos', 'who have you worked')) return { reply: '40 brands, from SpaceX AI down to the builders to watch. spinning the wheel.', action: go('brands') };
    if (has(t, 'reel', 'reels', 'video', 'videos', 'collab', 'collabs', 'content', 'portfolio', 'examples', 'samples', 'work', 'case study')) return { reply: 'a tape for every brand. pick one.', action: go('collabs') };
    if (has(t, 'audience', 'followers', 'demographic', 'demographics', 'who watches', 'country', 'countries', 'reach', 'viewers')) {
      return { reply: `an audience of ${SOCIALS[0].followers} on Instagram. mostly ${AUDIENCE.countries.slice(0, 3).map((c) => c.name).join(', ')}.`, action: go('audience') };
    }
    if (has(t, 'numbers', 'stats', 'statistics', 'engagement', 'views', 'plays', 'analytics', 'performance', 'metrics', 'insights', 'results')) {
      return { reply: eng ? `${fmt(eng.totalPlays)} plays across ${eng.reels.toLocaleString('en-US')} reels. printing receipts.` : 'printing receipts.', action: go('engagement') };
    }
    if (has(t, 'product', 'products', 'built', 'build', 'projects', 'apps', 'app', 'websites', 'website', 'sites', 'side project', 'github', 'code')) return { reply: 'things she built, on the bottom shelf.', action: go('docs', { kind: 'product' }) };

    // about her
    if (has(t, 'yoga', 'posture', 'neck', 'stretch', 'back pain', 'tech neck')) return { reply: 'certified yoga instructor. sit up straight, your neck says thanks.' };
    if (has(t, 'university', 'degree', 'study', 'studied', 'education', 'school', 'college')) return { reply: 'studied software development at Taras Shevchenko University, Ukraine.' };
    if (has(t, 'experience', 'years', 'how long', 'since', 'senior')) return { reply: 'software developer for 12+ years. coding since 2014.' };
    if (has(t, 'who', 'about', 'bio', 'vlada', 'yourself', 'you')) return { reply: 'Vlada Kandyba. developer advocate and tech creator. 12+ years of code. free spirited dev.' };

    return { reply: pick(['where is the error? try brands, rates or guides.', 'my parser just shrugged. try help.', "not in my memory banks. try 'brands' or 'hire'."], turn) };
  }

  const suggestions = [
    { label: "Who's Vlada?", q: 'who is vlada' },
    { label: 'Brands', q: 'brands' },
    { label: 'Watch collabs', q: 'collabs' },
    { label: 'Rates', q: 'how much do you charge' },
    { label: 'Guides', q: 'guides and skills' },
    { label: 'Hire her', q: 'hire' },
  ];
  return { answer, suggestions };
}
