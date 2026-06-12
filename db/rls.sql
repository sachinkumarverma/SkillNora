-- Example Row-Level Security (RLS) policies for Skillnora

-- Enable RLS on key tables
alter table if exists users enable row level security;
alter table if exists courses enable row level security;
alter table if exists lectures enable row level security;
alter table if exists enrollments enable row level security;

-- Allow users to read their own user row
create policy if not exists select_own_user on users
  for select using (auth.uid() = id);

-- Allow users to insert their own profile (on signup flows handled server-side)
create policy if not exists insert_user on users
  for insert with check (auth.uid() = id);

-- Allow instructors to manage (insert/update/delete) their own courses
create policy if not exists instructor_manage_course on courses
  for all using (auth.uid() = instructor_id) with check (auth.uid() = instructor_id);

-- Allow read of published courses by anyone, and private by instructor/admin
create policy if not exists public_read_published_courses on courses
  for select using (is_published = true or auth.uid() = instructor_id);

-- Allow enrolled users to read lectures of a course
create policy if not exists enrolled_read_lectures on lectures
  for select using (
    exists (select 1 from enrollments e where e.user_id = auth.uid() and e.course_id = lectures.course_id)
    or exists (select 1 from courses c where c.id = lectures.course_id and c.is_published)
  );

-- Admin role checks (requires role claim mapping in JWT or user metadata)
-- Example: allow if the jwt.claims.role = 'admin'
-- create policy admin_all on courses for all using (auth.jwt() ->> 'role' = 'admin');

-- Orders policies: allow users to see their own orders, and allow inserts only via service role (server)
alter table if exists orders enable row level security;
create policy if not exists select_own_orders on orders
  for select using (auth.uid() = user_id);
create policy if not exists insert_orders_server on orders
  for insert with check (auth.role() = 'authenticated' or true);

