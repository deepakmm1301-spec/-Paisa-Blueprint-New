-- ====================================================================
-- PAISA BLUEPRINT - DATABASE MIGRATION SCRIPT
-- This script contains the upgraded production-ready tables, relationships,
-- and seed data for the Advocacy (Petitions) and User Profile syncing systems.
-- Run this script in your Supabase SQL Editor.
-- ====================================================================

-- -------------------------------------------------------------
-- SECTION A: USER PROFILE & ADVOCACY TABLES WITH INTEGRITY
-- -------------------------------------------------------------

-- 1. Create paisa_user_data table (Linking profile id directly to auth.users(id))
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
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teachers') THEN
            ALTER TABLE public.teachers ADD CONSTRAINT fk_teachers_user_email FOREIGN KEY (email) REFERENCES public.paisa_user_data(email) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 2. Create petitions table
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

-- 3. Create petition_signatures table
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

-- 4. Create petition_comments table
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

-- 5. Create petition_updates table
CREATE TABLE IF NOT EXISTS public.petition_updates (
  id TEXT PRIMARY KEY,
  petition_id TEXT REFERENCES public.petitions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_by TEXT REFERENCES public.paisa_user_data(email) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_petition_updates_petition_id ON public.petition_updates(petition_id);

-- 6. Create petition_categories table
CREATE TABLE IF NOT EXISTS public.petition_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_petition_categories_slug ON public.petition_categories(slug);

-- 7. Create petition_documents table
CREATE TABLE IF NOT EXISTS public.petition_documents (
  id TEXT PRIMARY KEY,
  petition_id TEXT REFERENCES public.petitions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'pdf'
);

CREATE INDEX IF NOT EXISTS idx_petition_documents_petition_id ON public.petition_documents(petition_id);


-- -------------------------------------------------------------
-- SECTION B: HIGH-FIDELITY DATABASE SEED DATA
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
