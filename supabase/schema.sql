-- Supabase schema for the current Career Connect data model.
-- Keep private verification files in Storage; never put document contents in table rows.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  name text not null default '',
  phone text not null default '',
  role text not null default 'jobseeker' check (role in ('jobseeker', 'employer', 'verifier', 'admin')),
  barangay text,
  course text,
  grad_year integer check (grad_year is null or grad_year between 1980 and 2100),
  is_resident_verified boolean not null default false,
  verification_status text not null default 'none' check (verification_status in ('none', 'pending', 'verified', 'rejected')),
  company_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid references auth.users(id) on delete set null,
  initial text not null default '', logo text not null default '',
  company text not null, title text not null, category text not null default '', location text not null,
  exact_address text, landmark text, distance_from_marabulig_1_km numeric,
  estimated_commute_minutes integer, commute_mode text, estimated_fare_php numeric, commute_tip text,
  proximity_level text check (proximity_level is null or proximity_level in ('very_near', 'near', 'moderate', 'far', 'remote')),
  arrangement text not null default 'On-site' check (arrangement in ('On-site', 'Hybrid', 'Remote')),
  type text not null default '', level text not null default 'entry_level' check (level in ('no_experience', 'entry_level', 'internship')),
  salary text not null default '', posted timestamptz not null default now(), description text not null,
  qualifications text not null default '', contact_email text not null default '',
  is_verified_employer boolean not null default false, is_featured boolean not null default false,
  status text not null default 'pending_review' check (status in ('pending_review', 'published', 'rejected', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id text not null references public.jobs(id), job_title text not null, company text not null,
  applicant_name text not null, applicant_email text not null, applicant_phone text not null,
  resume_file_name text not null default '', resume_storage_path text, cover_note text not null default '',
  status text not null default 'Submitted' check (status in ('Submitted', 'Under Review', 'Interview', 'Accepted', 'Declined')),
  created_at timestamptz not null default now()
);

create table if not exists public.resident_verification_requests (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  applicant_name text not null, email text not null, barangay text not null,
  valid_id_type text not null, id_number_masked text not null default '',
  document_file_name text not null default '', document_storage_path text,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  reviewer_notes text, reviewed_by uuid references auth.users(id) on delete set null,
  submitted_at timestamptz not null default now(), reviewed_at timestamptz
);

create table if not exists public.payment_transactions (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete restrict,
  job_id text references public.jobs(id) on delete set null, job_title text,
  payer_name text not null, payer_email text not null,
  amount_pesos numeric(12,2) not null check (amount_pesos >= 0),
  method text not null check (method in ('GCash', 'Maya', 'Card')),
  reference_number text not null unique,
  status text not null default 'Pending' check (status in ('Completed', 'Pending', 'Failed')),
  provider_reference text unique, created_at timestamptz not null default now()
);

create index if not exists jobs_status_created_idx on public.jobs(status, created_at desc);
create index if not exists jobs_owner_created_idx on public.jobs(owner_id, created_at desc);
create index if not exists applications_user_created_idx on public.applications(user_id, created_at desc);
create index if not exists applications_job_created_idx on public.applications(job_id, created_at desc);
create index if not exists verification_requests_user_created_idx on public.resident_verification_requests(user_id, submitted_at desc);
create index if not exists payments_user_created_idx on public.payment_transactions(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.resident_verification_requests enable row level security;
alter table public.payment_transactions enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (
  auth.uid() = id and role = coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'jobseeker')
);
drop policy if exists "Users update own profile fields" on public.profiles;
create policy "Users update own profile fields" on public.profiles for update to authenticated using (auth.uid() = id)
with check (auth.uid() = id and role = coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'jobseeker'));

drop policy if exists "Anyone reads published jobs" on public.jobs;
create policy "Anyone reads published jobs" on public.jobs for select using (status = 'published');
drop policy if exists "Employers create own jobs" on public.jobs;
create policy "Employers create own jobs" on public.jobs for insert to authenticated with check (
  auth.uid() = owner_id and (auth.jwt() -> 'app_metadata' ->> 'role') = 'employer'
);
drop policy if exists "Employers update own jobs" on public.jobs;
create policy "Employers update own jobs" on public.jobs for update to authenticated using (
  auth.uid() = owner_id and (auth.jwt() -> 'app_metadata' ->> 'role') = 'employer'
) with check (auth.uid() = owner_id and (auth.jwt() -> 'app_metadata' ->> 'role') = 'employer');

drop policy if exists "Users read own applications" on public.applications;
create policy "Users read own applications" on public.applications for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users submit own applications" on public.applications;
create policy "Users submit applications for published jobs" on public.applications for insert to authenticated with check (
  auth.uid() = user_id and exists (
    select 1 from public.jobs j where j.id = job_id and j.status = 'published'
  )
);

drop policy if exists "Users read own verification requests" on public.resident_verification_requests;
create policy "Users read own verification requests" on public.resident_verification_requests for select to authenticated using (
  auth.uid() = user_id or (auth.jwt() -> 'app_metadata' ->> 'role') in ('verifier', 'admin')
);
drop policy if exists "Users submit own verification requests" on public.resident_verification_requests;
create policy "Users submit own verification requests" on public.resident_verification_requests for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Authorized verifiers review requests" on public.resident_verification_requests;
create policy "Authorized verifiers review requests" on public.resident_verification_requests for update to authenticated using (
  (auth.jwt() -> 'app_metadata' ->> 'role') in ('verifier', 'admin')
) with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('verifier', 'admin'));

drop policy if exists "Users read own payment transactions" on public.payment_transactions;
create policy "Users read own payment transactions" on public.payment_transactions for select to authenticated using (auth.uid() = user_id);
-- Payment transaction inserts/status changes are intentionally server/webhook-only.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('verification-documents', 'verification-documents', false, 5242880, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users access own verification files" on storage.objects;
create policy "Users access own verification files" on storage.objects for select to authenticated using (
  bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text
);
drop policy if exists "Users upload own verification files" on storage.objects;
create policy "Users upload own verification files" on storage.objects for insert to authenticated with check (
  bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text
);
drop policy if exists "Users delete own verification files" on storage.objects;
create policy "Users delete own verification files" on storage.objects for delete to authenticated using (
  bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text
);
