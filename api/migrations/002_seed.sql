-- ════════════════════════════════════════════════════════════════════
-- GroowFuse — seed data
-- ════════════════════════════════════════════════════════════════════
-- Idempotent: safe to re-run. Uses INSERT IGNORE so existing rows
-- aren't touched; updating an existing post requires the admin UI.
--
-- Default admin password: admin101
-- The bcrypt hash below was generated with:
--   php -r "echo password_hash('admin101', PASSWORD_BCRYPT);"
--
-- After first login, change the password from the admin panel
-- (or via a one-off script) and rotate this hash.

-- ─── Default admin user ────────────────────────────────────────────
INSERT IGNORE INTO admin_users (email, password_hash, name, role) VALUES
  ('dev@groowfuse.com',
   '$2y$10$oIT7c.r513X5gB9EiHsxo.cwDRzYihBv57EZB6wmZXWXnh2rxKUgq',
   'Admin', 'admin');

-- ─── Categories ────────────────────────────────────────────────────
INSERT IGNORE INTO categories (slug, label) VALUES
  ('procurement',     'Procurement'),
  ('process',         'Process'),
  ('software',        'Software'),
  ('automation',      'Automation'),
  ('transformation',  'Transformation'),
  ('strategy',        'Strategy');

-- ─── Tags ──────────────────────────────────────────────────────────
INSERT IGNORE INTO tags (slug, label) VALUES
  ('sme',                'SME'),
  ('procurement',        'Procurement'),
  ('cost-optimisation',  'Cost Optimisation'),
  ('vendor-management',  'Vendor Management'),
  ('process-mapping',    'Process Mapping'),
  ('workshops',          'Workshops'),
  ('discovery',          'Discovery'),
  ('open-source',        'Open Source'),
  ('tco',                'TCO'),
  ('budgeting',          'Budgeting'),
  ('automation',         'Automation'),
  ('low-code',           'Low Code'),
  ('zapier',             'Zapier'),
  ('strategy',           'Strategy'),
  ('digital-strategy',   'Digital Strategy'),
  ('roadmap',            'Roadmap'),
  ('change-management',  'Change Management');

-- ─── Posts (the original 5 from src/data/posts.js) ─────────────────
INSERT IGNORE INTO posts
  (slug, title, excerpt, body,
   category_id, author_name, author_role,
   cover_image, cover_alt,
   status, read_minutes, published_at, created_at)
VALUES
  ('modernizing-sme-procurement',
   'Modernizing SME Procurement Without Breaking the Bank',
   'How to upgrade procurement processes for small and medium businesses using practical, affordable tools rather than enterprise overkill.',
   '<p>Most SME procurement guides are written for enterprises with seven-figure software budgets. The advice doesn''t translate. We outline a practical, phased approach that uses the tools you already have.</p><h2>Start with mapping, not buying</h2><p>Before evaluating any procurement platform, map your current workflow. Where do requests originate? Who approves what? Where does the process stall?</p><p>This typically takes a half-day workshop. The output isn''t pretty diagrams — it''s a list of specific delays and decision points.</p><h2>Audit your existing tooling</h2><p>You already own more than you think. Microsoft 365 includes SharePoint and Power Automate. Google Workspace bundles AppSheet. Both can handle a surprising amount of procurement workflow without new contracts.</p>',
   (SELECT id FROM categories WHERE slug = 'procurement'),
   'GroowFuse Editorial', 'Practice Team',
   'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&w=1600&q=80',
   'Office desk with laptop and procurement documents',
   'published', 8, '2026-04-15', '2026-04-15'),

  ('90-minute-process-map',
   'The 90-Minute Process Map That Saved Our Client 14 Hours a Week',
   'A short, focused workshop format we use to surface the exact delays and rework that drain operational capacity in growing businesses.',
   '<p>Process mapping has a reputation for being long, laborious, and abstract. We run a tight 90-minute version that produces actionable findings every time.</p><h2>The setup</h2><p>Five to seven people max. The actual people who do the work, not their managers. One whiteboard or shared digital canvas. No slides.</p><h2>The format</h2><p>First 30 minutes: walk through the process step by step. Each person describes their part. We capture every step on sticky notes — physical or digital.</p>',
   (SELECT id FROM categories WHERE slug = 'process'),
   'GroowFuse Editorial', 'Practice Team',
   'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80',
   'Team gathered around a whiteboard mapping a process',
   'published', 6, '2026-04-08', '2026-04-08'),

  ('real-cost-of-free-software',
   'The Real Cost of "Free" Software for SMEs',
   'Open-source and freemium tools can be excellent — or they can quietly drain more time and money than the paid alternatives. Here''s how to tell the difference.',
   '<p>"Free" software has real costs. They''re just not on the invoice. Time spent configuring, debugging, and integrating adds up fast for a growing business.</p><h2>The honest TCO calculation</h2><p>Total cost of ownership for any tool includes: licensing (zero for free options), implementation hours, ongoing maintenance, training, and the opportunity cost of using something less suitable.</p>',
   (SELECT id FROM categories WHERE slug = 'software'),
   'GroowFuse Editorial', 'Practice Team',
   'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
   'Spreadsheet showing TCO calculations',
   'published', 7, '2026-03-28', '2026-03-28'),

  ('automate-without-developers',
   'How to Automate Three Processes This Quarter — Without Hiring Developers',
   'Practical automation wins available to non-technical SME teams using the tools you already have. No-code and low-code platforms have gotten good enough.',
   '<p>You don''t need a software team to automate meaningful work. The current generation of low-code and no-code tools — Power Automate, Zapier, Make, n8n — handles 80% of internal automation needs.</p><h2>Start with one repetitive task</h2><p>Pick something you do at least three times a week that involves moving information between systems. Email to spreadsheet. Form to CRM. Calendar invite to project tool. These are automation gold.</p>',
   (SELECT id FROM categories WHERE slug = 'automation'),
   'GroowFuse Editorial', 'Practice Team',
   'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80',
   'Laptop with automation workflow on screen',
   'published', 5, '2026-03-20', '2026-03-20'),

  ('digital-transformation-roadmap',
   'A Digital Transformation Roadmap That Actually Survives Year One',
   'Most transformation programs run out of momentum in months 6–9. Here''s the planning structure we use to keep them on track for the long haul.',
   '<p>Transformation programs fail in predictable ways. Teams lose momentum, executive attention drifts to the next priority, and the roadmap becomes shelfware.</p><h2>Build for endurance, not announcement</h2><p>The first quarter of any transformation should produce visible wins — small ones. People need to see the program shipping things, even if they''re not the biggest things.</p>',
   (SELECT id FROM categories WHERE slug = 'transformation'),
   'GroowFuse Editorial', 'Practice Team',
   'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
   'Team in a strategy meeting reviewing a roadmap',
   'published', 9, '2026-03-12', '2026-03-12');

-- ─── Tag the seed posts ────────────────────────────────────────────
INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES
  ((SELECT id FROM posts WHERE slug = 'modernizing-sme-procurement'),    (SELECT id FROM tags WHERE slug = 'sme')),
  ((SELECT id FROM posts WHERE slug = 'modernizing-sme-procurement'),    (SELECT id FROM tags WHERE slug = 'procurement')),
  ((SELECT id FROM posts WHERE slug = 'modernizing-sme-procurement'),    (SELECT id FROM tags WHERE slug = 'cost-optimisation')),
  ((SELECT id FROM posts WHERE slug = 'modernizing-sme-procurement'),    (SELECT id FROM tags WHERE slug = 'vendor-management')),
  ((SELECT id FROM posts WHERE slug = '90-minute-process-map'),          (SELECT id FROM tags WHERE slug = 'process-mapping')),
  ((SELECT id FROM posts WHERE slug = '90-minute-process-map'),          (SELECT id FROM tags WHERE slug = 'workshops')),
  ((SELECT id FROM posts WHERE slug = '90-minute-process-map'),          (SELECT id FROM tags WHERE slug = 'discovery')),
  ((SELECT id FROM posts WHERE slug = 'real-cost-of-free-software'),     (SELECT id FROM tags WHERE slug = 'open-source')),
  ((SELECT id FROM posts WHERE slug = 'real-cost-of-free-software'),     (SELECT id FROM tags WHERE slug = 'tco')),
  ((SELECT id FROM posts WHERE slug = 'real-cost-of-free-software'),     (SELECT id FROM tags WHERE slug = 'budgeting')),
  ((SELECT id FROM posts WHERE slug = 'automate-without-developers'),    (SELECT id FROM tags WHERE slug = 'automation')),
  ((SELECT id FROM posts WHERE slug = 'automate-without-developers'),    (SELECT id FROM tags WHERE slug = 'low-code')),
  ((SELECT id FROM posts WHERE slug = 'automate-without-developers'),    (SELECT id FROM tags WHERE slug = 'zapier')),
  ((SELECT id FROM posts WHERE slug = 'digital-transformation-roadmap'), (SELECT id FROM tags WHERE slug = 'strategy')),
  ((SELECT id FROM posts WHERE slug = 'digital-transformation-roadmap'), (SELECT id FROM tags WHERE slug = 'digital-strategy')),
  ((SELECT id FROM posts WHERE slug = 'digital-transformation-roadmap'), (SELECT id FROM tags WHERE slug = 'roadmap')),
  ((SELECT id FROM posts WHERE slug = 'digital-transformation-roadmap'), (SELECT id FROM tags WHERE slug = 'change-management'));
