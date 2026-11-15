-- Supabase schema for profiles, published jobs, applications, and private verification documents.
-- The Express server uses the service-role key only on the server. Keep RLS enabled regardless.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  name text not null default '',
  role text not null default 'jobseeker' check (role in ('jobseeker', 'employer')),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company text not null,
  location text not null,
  description text not null,
  category text not null default '',
  salary text not null default '',
  arrangement text not null default 'On-site' check (arrangement in ('On-site', 'Hybrid', 'Remote')),
  status text not null default 'pending_review' check (status in ('pending_review', 'published', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id text not null references public.jobs(id),
  job_title text not null,
  company text not null,
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text not null,
  cover_note text not null default '',
  status text not null default 'Submitted',
  created_at timestamptz not null default now()
);

create index if not exists applications_user_created_idx on public.applications(user_id, created_at desc);
create index if not exists jobs_status_created_idx on public.jobs(status, created_at desc);

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

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
create policy "Users submit own applications" on public.applications for insert to authenticated with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('verification-documents', 'verification-documents', false)
on conflict (id) do update set public = false;

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
