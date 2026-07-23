-- ====================================================================
-- PAISA BLUEPRINT - CONSOLIDATED SUPABASE / POSTGRESQL DATABASE SCHEMA
-- This file contains all 13 database tables upgraded for production best practices.
-- ====================================================================

-- -------------------------------------------------------------
-- SECTION A: ORIGINAL / EXISTING PRODUCTION TABLES
-- -------------------------------------------------------------

-- 1. Create teacher_hub_data table for unstructured/global module payloads
CREATE TABLE IF NOT EXISTS public.teacher_hub_data (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Initialize global state row for Teacher Hub
INSERT INTO public.teacher_hub_data (id, payload)
VALUES ('global_state', '{"teachers":[],"requests":[],"notifications":[],"successStories":[],"auditLogs":[]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Teachers Table
CREATE TABLE IF NOT EXISTS public.teachers (
  id TEXT PRIMARY KEY,
  name TEXT,
  gender TEXT,
  mobile TEXT UNIQUE,
  email TEXT,
  photo_url TEXT,
  employee_id TEXT,
  teacher_type TEXT,
  subject TEXT,
  class_category TEXT,
  years_of_service INT,
  joining_date TEXT,
  current_district TEXT,
  current_block TEXT,
  current_school TEXT,
  udise_code TEXT,
  desired_district TEXT,
  desired_block TEXT,
  preferred_schools TEXT,
  additional_notes TEXT,
  is_verified BOOLEAN DEFAULT true,
  is_online BOOLEAN DEFAULT false,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Requests Table
CREATE TABLE IF NOT EXISTS public.requests (
  id TEXT PRIMARY KEY,
  from_teacher_id TEXT REFERENCES public.teachers(id) ON DELETE CASCADE,
  to_teacher_id TEXT REFERENCES public.teachers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Pending',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  teacher_id TEXT REFERENCES public.teachers(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT,
  type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create Success Stories Table
CREATE TABLE IF NOT EXISTS public.success_stories (
  id TEXT PRIMARY KEY,
  teacher_a_name TEXT,
  teacher_b_name TEXT,
  teacher_a_photo TEXT,
  teacher_b_photo TEXT,
  teacher_a_subject TEXT,
  teacher_b_subject TEXT,
  district_a TEXT,
  district_b TEXT,
  transfer_date TEXT
);

-- 6. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  actor TEXT,
  action TEXT,
  ip_address TEXT
);


-- -------------------------------------------------------------
-- SECTION B: ADVOCACY & USER PROFILE PERSISTENCE TABLES
-- -------------------------------------------------------------

-- 7. Create paisa_user_data table (Linking profile id directly to auth.users(id))
CREATE TABLE IF NOT EXISTS public.paisa_user_data (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'user',
  profile_photo TEXT DEFAULT '🧑‍💼',
  profiles_list JSONB DEFAULT '[]'::jsonb,
  active_profile_id TEXT DEFAULT 'profile-main',
  saved_calculations JSONB DEFAULT '[]'::jsonb,
  bookmarked_tools JSONB DEFAULT '[]'::jsonb,
  notifications JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_paisa_user_data_email ON public.paisa_user_data(email);

-- Add foreign key constraint to link teachers.email to paisa_user_data.email if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_teachers_user_email'
    ) THEN
        ALTER TABLE public.teachers ADD CONSTRAINT fk_teachers_user_email FOREIGN KEY (email) REFERENCES public.paisa_user_data(email) ON DELETE CASCADE;
    END IF;
END $$;

-- 8. Create petitions table
CREATE TABLE IF NOT EXISTS public.petitions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  full_description TEXT,
  category TEXT,
  banner_image TEXT,
  featured_image TEXT,
  gov_department TEXT,
  petition_goal INT DEFAULT 5000,
  current_signatures INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  start_date TEXT,
  end_date TEXT,
  seo_title TEXT,
  seo_description TEXT,
  featured BOOLEAN DEFAULT false,
  created_by TEXT REFERENCES public.paisa_user_data(email) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_petitions_slug ON public.petitions(slug);
CREATE INDEX IF NOT EXISTS idx_petitions_is_deleted ON public.petitions(is_deleted);

-- 9. Create petition_signatures table
CREATE TABLE IF NOT EXISTS public.petition_signatures (
  id TEXT PRIMARY KEY,
  petition_id TEXT REFERENCES public.petitions(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL REFERENCES public.paisa_user_data(email) ON DELETE CASCADE,
  name TEXT,
  district TEXT,
  block TEXT,
  school TEXT,
  teacher_category TEXT,
  phone TEXT,
  consent BOOLEAN DEFAULT true,
  signature_number INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add unique constraint to prevent double signing on database level
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_petition_user_signature'
    ) THEN
        ALTER TABLE public.petition_signatures ADD CONSTRAINT unique_petition_user_signature UNIQUE (petition_id, user_email);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_petition_signatures_petition_id ON public.petition_signatures(petition_id);
CREATE INDEX IF NOT EXISTS idx_petition_signatures_user_email ON public.petition_signatures(user_email);

-- 10. Create petition_comments table
CREATE TABLE IF NOT EXISTS public.petition_comments (
  id TEXT PRIMARY KEY,
  petition_id TEXT REFERENCES public.petitions(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL REFERENCES public.paisa_user_data(email) ON DELETE CASCADE,
  user_name TEXT,
  content TEXT,
  status TEXT DEFAULT 'approved',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_petition_comments_petition_id ON public.petition_comments(petition_id);

-- 11. Create petition_updates table
CREATE TABLE IF NOT EXISTS public.petition_updates (
  id TEXT PRIMARY KEY,
  petition_id TEXT REFERENCES public.petitions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_by TEXT REFERENCES public.paisa_user_data(email) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_petition_updates_petition_id ON public.petition_updates(petition_id);

-- 12. Create petition_categories table
CREATE TABLE IF NOT EXISTS public.petition_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_petition_categories_slug ON public.petition_categories(slug);

-- 13. Create petition_documents table
CREATE TABLE IF NOT EXISTS public.petition_documents (
  id TEXT PRIMARY KEY,
  petition_id TEXT REFERENCES public.petitions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'pdf'
);

CREATE INDEX IF NOT EXISTS idx_petition_documents_petition_id ON public.petition_documents(petition_id);


-- -------------------------------------------------------------
-- SECTION C: HIGH-FIDELITY DATABASE SEED DATA
-- -------------------------------------------------------------

-- Seed Categories
INSERT INTO public.petition_categories (id, name, slug) VALUES
  ('cat-1', 'Education', 'education'),
  ('cat-2', 'Transfer Policy', 'transfer-policy'),
  ('cat-3', 'Service Conditions', 'service-conditions'),
  ('cat-4', 'Salary & Allowances', 'salary-allowances')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug;

-- Seed First Petition
INSERT INTO public.petitions (
  id, title, slug, short_description, full_description, category, 
  banner_image, featured_image, gov_department, petition_goal, 
  current_signatures, status, start_date, end_date, seo_title, 
  seo_description, featured, created_by, is_deleted, created_at, updated_at
) VALUES (
  'pet-bpsc-transfer-2026',
  'Request to Release Bihar BPSC Teacher Mutual Transfer Schedule',
  'request-to-release-bihar-bpsc-teacher-mutual-transfer-schedule',
  'Urging the Education Department, Government of Bihar to immediately announce the complete official schedule and guidelines for Bihar BPSC teacher mutual transfers.',
  '<p>We, the BPSC Teachers of Bihar, respectfully request the Education Department and Government of Bihar to immediately release the official schedule, portal link, and guidelines for <strong>Mutual Transfer (आपसी स्थानांतरण)</strong>.</p>
   <p>Currently, thousands of newly appointed BPSC teachers (under TRE-1, TRE-2, and TRE-3) are posted in remote villages and far-off districts, hundreds of kilometers away from their homes and families. Many of these teachers are women, physically challenged individuals, or have elderly parents dependent on them. Staying away from families under strenuous conditions is causing immense mental strain and affecting overall instructional delivery in schools.</p>
   <p>A mutual transfer scheme was promised and is legally sanctioned under Bihar State Teacher Rules. However, in the absence of a defined timeline or an online application schedule, teachers remain stranded. A structured mutual transfer process carries zero financial burden for the exchequer, yet brings life-changing relief to teachers.</p>
   <p><strong>Our Core Demands:</strong></p>
   <ol>
     <li>Immediate launch of an online Mutual Transfer Application Portal.</li>
     <li>Simple, transparent criteria for eligibility and processing.</li>
     <li>Defined turnaround times for matches and transfers.</li>
   </ol>
   <p><em>Disclaimer: This petition represents a collective community appeal showing public support and does not guarantee automatic government action.</em></p>',
  'Education',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
  'Education Department, Government of Bihar',
  5000,
  1245,
  'published',
  '2026-07-07T00:00:00.000Z',
  '2026-09-07T00:00:00.000Z',
  'Bihar BPSC Teacher Mutual Transfer Schedule Petition | Paisa Blueprint',
  'Join the Bihar BPSC Teacher movement. Sign the petition urging the Education Department to release the official Mutual Transfer schedule.',
  true,
  NULL, -- Initially unassociated since user hasn't registered yet
  false,
  timezone('utc'::text, '2026-07-07T00:00:00.000Z'::timestamp),
  timezone('utc'::text, now())
)
ON CONFLICT (id) DO NOTHING;

-- Seed First Document
INSERT INTO public.petition_documents (
  id, petition_id, title, file_url, file_type
) VALUES (
  'doc-seed-1',
  'pet-bpsc-transfer-2026',
  'Bihar State Teacher Cadre Rules (Transfer Policy Excerpt)',
  '#',
  'pdf'
)
ON CONFLICT (id) DO NOTHING;


-- -------------------------------------------------------------
-- SECTION D: POLL MANAGEMENT SYSTEM TABLES
-- -------------------------------------------------------------

-- 14. Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  allow_multiple BOOLEAN DEFAULT false,
  show_results_before_vote BOOLEAN DEFAULT false,
  allow_vote_edit BOOLEAN DEFAULT true,
  require_login BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Published',
  priority TEXT DEFAULT 'Medium',
  target_audience TEXT DEFAULT 'Everyone',
  image_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  end_date TIMESTAMP WITH TIME ZONE,
  total_votes INT DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_polls_category ON public.polls(category);
CREATE INDEX IF NOT EXISTS idx_polls_status ON public.polls(status);
CREATE INDEX IF NOT EXISTS idx_polls_featured ON public.polls(featured);

-- 15. Create poll_options table
CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  display_order INT DEFAULT 0,
  vote_count INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);

-- 16. Create poll_votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Unique constraint preventing duplicate vote for the same option by the same user
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_poll_option_user_vote'
    ) THEN
        ALTER TABLE public.poll_votes ADD CONSTRAINT unique_poll_option_user_vote UNIQUE (poll_id, option_id, user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON public.poll_votes(user_id);

-- Seed Initial High-Priority Opinion Polls
INSERT INTO public.polls (
  id, question, description, category, allow_multiple, 
  show_results_before_vote, allow_vote_edit, require_login, featured, 
  status, priority, target_audience, image_url, start_date, end_date, total_votes
) VALUES (
  'a1010101-1111-4444-8888-111111111111'::uuid,
  'Which Bihar BPSC Teacher Mutual Transfer Rule improvement is most critical?',
  'Cast your official vote on the top structural policy reform needed for the 2026 Bihar Teacher Mutual Transfer schedule.',
  'Teacher Hub',
  true,
  false,
  true,
  true,
  true,
  'Published',
  'High',
  'Teachers',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
  timezone('utc'::text, now()),
  timezone('utc'::text, now() + interval '60 days'),
  1420
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.poll_options (id, poll_id, option_text, display_order, vote_count) VALUES
  ('b1010101-1111-4444-8888-111111111111'::uuid, 'a1010101-1111-4444-8888-111111111111'::uuid, 'Instant Online Verification & Auto Match', 1, 620),
  ('b2020202-2222-4444-8888-222222222222'::uuid, 'a1010101-1111-4444-8888-111111111111'::uuid, 'Home District Choice Preference', 2, 450),
  ('b3030303-3333-4444-8888-333333333333'::uuid, 'a1010101-1111-4444-8888-333333333333'::uuid, 'Transparent Point-Based Seniority Ranks', 3, 230),
  ('b4040404-4444-4444-8888-444444444444'::uuid, 'a1010101-1111-4444-8888-111111111111'::uuid, 'Special Consideration for Medical & Women Teachers', 4, 120)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.polls (
  id, question, description, category, allow_multiple, 
  show_results_before_vote, allow_vote_edit, require_login, featured, 
  status, priority, target_audience, image_url, start_date, end_date, total_votes
) VALUES (
  'a2020202-2222-4444-8888-222222222222'::uuid,
  'What Fitment Factor do you support for the upcoming 8th Pay Commission?',
  'Share your opinion on the projected salary scale fitment multiplier for central and state government employees.',
  'Homepage',
  false,
  false,
  true,
  true,
  true,
  'Published',
  'High',
  'Government Employees',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
  timezone('utc'::text, now()),
  timezone('utc'::text, now() + interval '90 days'),
  2840
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.poll_options (id, poll_id, option_text, display_order, vote_count) VALUES
  ('c1010101-1111-4444-8888-111111111111'::uuid, 'a2020202-2222-4444-8888-222222222222'::uuid, '2.57 Fitment Factor (Standard 7th CPC baseline)', 1, 410),
  ('c2020202-2222-4444-8888-222222222222'::uuid, 'a2020202-2222-4444-8888-222222222222'::uuid, '2.86 Fitment Factor (Recommended Inflation Benchmark)', 2, 1720),
  ('c3030303-3333-4444-8888-333333333333'::uuid, 'a2020202-2222-4444-8888-222222222222'::uuid, '3.00 Fitment Factor (Maximum Demand Benchmark)', 3, 710)
ON CONFLICT (id) DO NOTHING;

