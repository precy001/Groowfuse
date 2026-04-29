/**
 * Hardcoded blog posts.
 * Replace with a CMS / API call once the backend is ready.
 *
 * Content blocks supported by BlogPost.jsx:
 *   - { type: 'paragraph', text }
 *   - { type: 'heading',   text, level (2 | 3) }
 *   - { type: 'list',      items, style ('bulleted' | 'numbered') }
 *   - { type: 'quote',     text, cite (optional) }
 */

export const CATEGORIES = [
  { id: 'all',            label: 'All Posts' },
  { id: 'procurement',    label: 'IT Procurement' },
  { id: 'process',        label: 'Process Improvement' },
  { id: 'transformation', label: 'Digital Transformation' },
  { id: 'automation',     label: 'Workflow Automation' },
];

export const POSTS = [
  {
    slug: 'modernizing-sme-procurement',
    category: { id: 'procurement', label: 'IT Procurement' },
    title: 'Modernizing SME Procurement: A Practical Playbook',
    excerpt: "Most growing businesses overspend on software because procurement is treated as a transaction, not a strategy. Here's the framework we use to fix that.",
    author: {
      name: 'GroowFuse Editorial',
      role: 'Practice Team',
    },
    date: '2026-04-22',
    readMinutes: 8,
    coverImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80',
    coverAlt: 'Team reviewing procurement documents on a laptop',
    tags: ['SME', 'Procurement', 'Cost Optimisation'],
    content: [
      { type: 'paragraph', text: "For most growing businesses, software procurement happens reactively. A manager hits a wall, asks around, signs up for whatever surfaces first. Six months later, three teams have three tools that solve the same problem in three slightly different ways — and nobody can remember why." },
      { type: 'paragraph', text: "Multiply that across a typical SME tech stack and the bill quietly compounds: redundant licenses, untouched seats, point solutions that should have been part of something larger. Procurement is rarely the most exciting line item to fix, but in our experience it's where the cleanest savings live." },
      { type: 'heading', level: 2, text: 'Why SMEs overspend' },
      { type: 'paragraph', text: "Three patterns show up again and again. First, decisions get made under deadline pressure with no requirements document — vendors win on demos, not fit. Second, contracts auto-renew on terms negotiated when the business was a third its current size. Third, nobody owns the overall stack, so adjacent tools get bought without anyone noticing the overlap." },
      { type: 'paragraph', text: "None of this is anyone's fault individually. It's what happens when procurement is treated as a per-purchase event rather than a portfolio decision." },
      { type: 'heading', level: 2, text: 'The framework, in five steps' },
      { type: 'list', style: 'numbered', items: [
        "Inventory every tool in active use, including who pays and who actually logs in.",
        "Map each tool to a business capability — not a department, a capability.",
        "For every capability with overlap, identify the consolidation candidate.",
        "Re-negotiate. Most vendors will discount aggressively to avoid losing an account.",
        "Document a procurement standard so the next ten purchases stay aligned.",
      ]},
      { type: 'paragraph', text: "Steps one and two take a single workshop. Steps three through five typically run over a quarter. The savings, in the engagements we run, average between fifteen and thirty percent of annual software spend — recovered in the first year, not gradually." },
      { type: 'quote', text: "Procurement done well isn't about saying no. It's about making the yes easier and more confident.", cite: null },
      { type: 'heading', level: 2, text: 'Where to start tomorrow' },
      { type: 'paragraph', text: "If you only do one thing this week, run the inventory. Pull the last twelve months of card statements and SaaS subscription emails. Put every tool on a single sheet with cost, owner, and primary use. The exercise alone tends to surface enough redundancy to pay for the time it took to do it." },
      { type: 'paragraph', text: "From there, the rest of the framework is a conversation worth having — with your finance lead, your operations lead, and ideally an outside set of eyes who has seen the patterns before." },
    ],
  },

  {
    slug: '90-minute-process-map',
    category: { id: 'process', label: 'Process Improvement' },
    title: 'The 90-Minute Process Map: A Workshop That Pays for Itself',
    excerpt: "You don't need a six-week consulting engagement to find out where your business is losing time. You need a whiteboard, three people who actually do the work, and 90 minutes.",
    author: {
      name: 'GroowFuse Editorial',
      role: 'Practice Team',
    },
    date: '2026-04-15',
    readMinutes: 6,
    coverImage: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1600&q=80',
    coverAlt: 'Team mapping a process on a whiteboard with sticky notes',
    tags: ['Process Mapping', 'Workshops', 'Operations'],
    content: [
      { type: 'paragraph', text: "Most process improvement projects start too late and aim too high. By the time leadership notices a workflow is broken, three months of slow bleed have already happened, and the proposed fix is usually a software purchase." },
      { type: 'paragraph', text: "There's a smaller, faster version of this work that almost always pays for itself the same week. We call it the 90-minute process map." },
      { type: 'heading', level: 2, text: 'What you need in the room' },
      { type: 'list', style: 'bulleted', items: [
        "Three people who actually do the work — not their managers.",
        "A whiteboard or a long roll of butcher paper. Sticky notes in two colors.",
        "A facilitator whose only job is to ask 'and then what happens?'",
        "No laptops open. No phones on the table.",
      ]},
      { type: 'heading', level: 2, text: 'The structure' },
      { type: 'paragraph', text: "Spend the first ten minutes agreeing on a starting trigger — the moment the process kicks off. Then walk through every step until the process completes. One sticky note per step, one color for actions, the other for waiting periods. Don't edit. Don't argue about what should happen. Just record what does happen." },
      { type: 'paragraph', text: "By minute sixty you'll have a wall of stickies that almost nobody in the room has ever seen drawn out before. The waiting-period stickies are usually where the surprises live: handoffs that take three days because nobody owns them, approvals that loop, work that gets re-done because the right context didn't travel with it." },
      { type: 'heading', level: 2, text: 'The last 30 minutes' },
      { type: 'paragraph', text: "Use the remaining time to circle the three biggest friction points. Don't try to fix them yet. Just name them. Pick one — the smallest one — and assign an owner with a deadline of two weeks." },
      { type: 'paragraph', text: "Two weeks is the magic number. Long enough to ship something real. Short enough that the room is still bought into the work when the result lands." },
      { type: 'quote', text: "The point of the workshop isn't the map. It's the shared reality the map produces." },
      { type: 'paragraph', text: "We've run this format dozens of times. The best outcomes come from teams that resist the urge to design the perfect future-state on day one. Map the present clearly, fix one thing, then come back next month and fix the next one. Compounding small wins beats the big-bang transformation almost every time." },
    ],
  },

  {
    slug: 'real-cost-of-free-software',
    category: { id: 'procurement', label: 'IT Procurement' },
    title: "The Real Cost of \"Free\" Software (And When to Pay)",
    excerpt: "Every free tier you adopt becomes part of your operating environment — taking cognitive load, support time, and integration effort whether or not it shows up on an invoice.",
    author: {
      name: 'GroowFuse Editorial',
      role: 'Practice Team',
    },
    date: '2026-04-08',
    readMinutes: 7,
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
    coverAlt: 'Developer working on a laptop showing code',
    tags: ['SaaS', 'Hidden Costs', 'Decision Frameworks'],
    content: [
      { type: 'paragraph', text: "There is no such thing as free software. There are tools that don't show up on a credit card statement, but every one of them is paid for somewhere — in attention, in integration time, in the slow erosion of a team's willingness to add anything else to the stack." },
      { type: 'paragraph', text: "This isn't an argument against free tools. It's an argument for being deliberate about which ones you commit to." },
      { type: 'heading', level: 2, text: 'Where the costs hide' },
      { type: 'paragraph', text: "When a free tier graduates to being mission-critical, the bill arrives in three forms. The first is the upgrade demand — the feature you suddenly need is on the paid plan, and migrating off is harder than just paying. The second is integration debt — the tool doesn't connect cleanly with anything else, so somebody on your team becomes its unofficial ETL pipeline. The third is the learning tax — every new hire has to learn it, and your documentation never quite caught up." },
      { type: 'heading', level: 2, text: 'A simple decision rule' },
      { type: 'paragraph', text: "Before adding a free tool to your stack, ask whether it's solving a problem you'd happily pay for if it had a price tag. If yes, find the version that fits your needs and pay for it. If no, you probably don't need the tool yet — and using the free version will quietly couple you to it before you've decided whether you should be." },
      { type: 'list', style: 'bulleted', items: [
        "If a tool will store more than a week's worth of decisions, treat it as core. Pay.",
        "If a tool will integrate with your finance, customer, or HR data, treat it as core. Pay.",
        "If a tool is a personal experiment by one person, free is fine — keep it personal.",
        "If a tool has no clear successor when you outgrow it, free is dangerous. Choose differently.",
      ]},
      { type: 'heading', level: 2, text: 'When free is the right answer' },
      { type: 'paragraph', text: "We're not anti-free. Plenty of category-leading tools have generous free tiers that make sense for SMEs at a particular stage. The question isn't free versus paid — it's whether the tool deserves the operational gravity it will accumulate. Some do. Most don't." },
      { type: 'quote', text: "The cheapest tool is rarely the one with the lowest price. It's the one that fits cleanly enough that nobody has to think about it next quarter." },
      { type: 'paragraph', text: "If you're staring at a stack with a dozen free tools and you can't quite name what each one does anymore, that's a procurement decision waiting to happen. We can help you sort through it — but the first audit costs nothing more than a spreadsheet and an honest hour." },
    ],
  },

  {
    slug: 'automate-without-developers',
    category: { id: 'automation', label: 'Workflow Automation' },
    title: "Automating Internal Workflows Without Hiring a Developer",
    excerpt: "You have a clear repetitive workflow that wastes hours every week. You don't have a developer to spare. The good news: in 2026, you don't need one.",
    author: {
      name: 'GroowFuse Editorial',
      role: 'Practice Team',
    },
    date: '2026-04-01',
    readMinutes: 5,
    coverImage: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=1600&q=80',
    coverAlt: 'Abstract circuit board pattern in dark green',
    tags: ['Automation', 'No-Code', 'Tooling'],
    content: [
      { type: 'paragraph', text: "Automation used to be expensive. You'd identify a process, scope a project, hire a developer, wait two months, and hope nothing changed in the meantime. For SMEs, the math rarely worked — the cost of building usually exceeded the cost of just doing the thing manually." },
      { type: 'paragraph', text: "That equation has changed. The current generation of automation platforms — workflow tools, integration platforms, AI-assisted scripting — has put real automation in reach of operators who don't write code. The question is no longer whether you can automate a workflow. It's whether you should, and which tool to reach for." },
      { type: 'heading', level: 2, text: 'What to automate first' },
      { type: 'paragraph', text: "The candidates to look at first share three traits: high frequency, low judgment required, and clear data flowing in and out. Anything that involves copying data between two systems on a schedule is a near-perfect fit. Anything that requires nuanced human judgment is not." },
      { type: 'paragraph', text: "Specific examples we see often:" },
      { type: 'list', style: 'bulleted', items: [
        "Lead routing — taking inbound form submissions and assigning them to the right person.",
        "Invoice intake — pulling line items from PDFs and dropping them into accounting.",
        "Report assembly — pulling numbers from three systems each Monday for the same dashboard.",
        "Onboarding checklists — provisioning accounts when a new hire's start date arrives.",
        "Status notifications — pinging the right channel when a long-running process completes.",
      ]},
      { type: 'heading', level: 2, text: 'How to choose a tool' },
      { type: 'paragraph', text: "Don't pick the tool first. Pick the workflow. Then look at the systems it touches and find the tool that already speaks to all of them. The marketplace has converged enough that for most common workflows, there's a clear right answer once you know what you're connecting." },
      { type: 'paragraph', text: "Be wary of tools that promise to automate everything. The ones that work tend to be opinionated about the kinds of workflows they're best at. That's a feature, not a limitation." },
      { type: 'quote', text: "Automate the second instance, not the first. Your first run-through teaches you what the workflow actually is — automation locks in whatever you knew at the time." },
      { type: 'paragraph', text: "If you're sitting on a list of repetitive tasks and want a sanity check on what to tackle first, that's a forty-five minute conversation we're happy to have." },
    ],
  },

  {
    slug: 'digital-transformation-roadmap',
    category: { id: 'transformation', label: 'Digital Transformation' },
    title: "The Digital Transformation Roadmap: Five Phases We Use With Every Client",
    excerpt: "Most digital transformation programs fail not because the technology was wrong, but because they tried to do everything at once. Here's the staged approach we run.",
    author: {
      name: 'GroowFuse Editorial',
      role: 'Practice Team',
    },
    date: '2026-03-25',
    readMinutes: 10,
    coverImage: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=80',
    coverAlt: 'A long road stretching toward a horizon',
    tags: ['Transformation', 'Strategy', 'Methodology'],
    content: [
      { type: 'paragraph', text: "Digital transformation is one of those phrases that has been worn so smooth by overuse that it's almost lost its meaning. We use it the way our clients do — as shorthand for the work of bringing the operations of a growing business in line with how the business actually wants to run." },
      { type: 'paragraph', text: "Every engagement is different. The starting points, the appetites for change, the specific tools and constraints — these vary. The shape of the work, though, doesn't. Five phases, run in order, every time." },
      { type: 'heading', level: 2, text: 'Phase one — Discovery' },
      { type: 'paragraph', text: "Two to three weeks. Interviews with leaders, observation of teams, a thorough audit of the existing systems and the workflows that touch them. The output of this phase is a single document that names the friction in the business in language the leadership team agrees with." },
      { type: 'paragraph', text: "If we get phase one wrong, nothing downstream lands. So we spend more time here than most engagements do." },
      { type: 'heading', level: 2, text: 'Phase two — Diagnosis' },
      { type: 'paragraph', text: "One to two weeks. Take the friction list from phase one and rank it. The ranking dimensions are simple: cost of inaction, cost to fix, dependencies on other fixes. The output is a sequenced list of initiatives, each with rough scope, rough timeline, and the specific outcome that signals success." },
      { type: 'heading', level: 2, text: 'Phase three — Design' },
      { type: 'paragraph', text: "Variable, depending on scope. For each initiative, we design the future state — the systems involved, the workflows, the ownership structure, the data model where relevant. Designs are reviewed with the people who will live in them, not just the people who sponsored the project." },
      { type: 'paragraph', text: "This is where most transformation programs go wrong. Designs that survive contact with the people doing the work are dramatically rarer than designs that don't. We over-invest in this step on purpose." },
      { type: 'heading', level: 2, text: 'Phase four — Deployment' },
      { type: 'paragraph', text: "We deploy in the smallest possible increments that each deliver real value. The unit of progress is a working change in production, not a milestone in a plan. Every deployment is followed by a one-week settle period where we watch for unintended consequences and adjust." },
      { type: 'list', style: 'bulleted', items: [
        "Migrations are run in parallel with the existing system for at least one full cycle.",
        "Documentation is written by the people doing the work, not the consultants.",
        "Training is hands-on in the production tool, not classroom-based on slides.",
        "Each deployment has an owner from the client team, not from us.",
      ]},
      { type: 'heading', level: 2, text: 'Phase five — Stewardship' },
      { type: 'paragraph', text: "Three to six months after the last deployment. We check back in, measure against the success criteria from phase two, and identify what the next round of work should be. Most businesses that have been through one transformation round are ready to start a smaller, sharper second round about six months later." },
      { type: 'quote', text: "The goal of a transformation program isn't to be done. It's to leave the business in a position where it can keep transforming itself without us." },
      { type: 'paragraph', text: "If your business is somewhere between phase zero and phase one and you're not sure what it would take to get the next phase moving, that's the conversation we'd love to have." },
    ],
  },
];

export function getPostBySlug(slug) {
  return POSTS.find((p) => p.slug === slug) || null;
}

export function getRelatedPosts(currentSlug, limit = 3) {
  const current = getPostBySlug(currentSlug);
  if (!current) return [];

  // Same-category posts first, then fill with the most recent others
  const sameCategory = POSTS.filter(
    (p) => p.slug !== currentSlug && p.category.id === current.category.id
  );
  const others = POSTS.filter(
    (p) => p.slug !== currentSlug && p.category.id !== current.category.id
  );

  return [...sameCategory, ...others].slice(0, limit);
}

/* Format helpers */
export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}