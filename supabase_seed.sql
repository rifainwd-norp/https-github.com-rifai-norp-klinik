-- ================================================================
-- SEED DATA - Jalankan di Supabase SQL Editor
-- ================================================================

-- ── SERVICES ─────────────────────────────────────────────────────
insert into services (name, category, price, description, duration_minutes, materials_used) values
  ('Facial Treatment',   'Facial',      '250000', 'Deep cleaning facial for glowing skin',                   60,  null),
  ('Chemical Peeling',   'Peeling',     '450000', 'Skin rejuvenation through gentle exfoliation',            90,  'Tidak disarankan untuk kulit sensitif dan ibu hamil'),
  ('Laser Hair Removal', 'Hair Removal','750000', 'Permanent hair reduction treatment',                      45,  'Hindari paparan sinar matahari 48 jam sebelum & sesudah treatment'),
  ('Body Spa Package',   'Body Spa',    '550000', 'Full body relaxation and skin care',                     120,  null),
  ('Hydrafacial',        'Facial',      '650000', 'Advanced hydration and deep cleansing facial',            75,  null),
  ('Microneedling',      'Skincare',    '850000', 'Collagen induction therapy for skin rejuvenation',        60,  'Tidak untuk kulit yang sedang meradang atau jerawat aktif parah')
on conflict do nothing;

-- ── SPECIALISTS ───────────────────────────────────────────────────
insert into specialists (name, role, bio) values
  ('Dr. Sarah Amelia',   'Dermatologist',    'Expert in medical skin treatments with 8 years experience'),
  ('Siska Putri',        'Senior Beautician','Certified beautician specializing in facial and body care'),
  ('Dr. Kevin Hartanto', 'Aesthetic Doctor', 'Specialist in non-surgical aesthetic procedures'),
  ('Rania Dewi',         'Spa Therapist',    'Licensed therapist with expertise in body treatments and relaxation')
on conflict do nothing;

-- ── INVENTORY ─────────────────────────────────────────────────────
insert into inventory (name, category, stock_quantity, min_threshold, unit, price_per_unit) values
  -- Skincare
  ('Hyaluronic Acid Serum',          'Skincare',     48,  10,  'botol',  85000),
  ('Vitamin C Brightening Serum',    'Skincare',     36,   8,  'botol',  95000),
  ('Chemical Peel Solution (AHA 30%)','Skincare',    12,   3,  'botol', 320000),
  ('Hydrating Gel Mask',             'Skincare',     60,  15, 'sachet',  25000),
  ('Retinol Night Cream',            'Skincare',     24,   5,   'tube', 135000),
  ('SPF 50 Sunblock',                'Skincare',     30,   8,   'tube',  65000),
  -- Consumables
  ('Disposable Face Mask',           'Consumables', 200,  50,   'pcs',   2500),
  ('Cotton Pad',                     'Consumables', 500, 100,   'pcs',    500),
  ('Sterile Gloves (M)',             'Consumables', 100,  20, 'pasang',  3500),
  ('Microneedle Cartridge (0.5mm)', 'Consumables',  20,   5,   'pcs',  75000),
  ('Alcohol Swab',                   'Consumables', 300,  50,   'pcs',    800),
  -- Tools
  ('Ultrasonic Facial Device',       'Tools',         3,   1,  'unit', 2500000),
  ('LED Light Therapy Panel',        'Tools',         2,   1,  'unit', 4500000),
  ('Steamer Machine',                'Tools',         4,   1,  'unit', 1200000),
  -- Supplies
  ('Massage Oil (Lavender)',         'Supplies',     15,   3, 'botol',  120000),
  ('Body Scrub (Coffee)',            'Supplies',     20,   5,   'jar',   85000),
  ('Hot Towel Set',                  'Supplies',     40,  10,   'set',   45000)
on conflict do nothing;
