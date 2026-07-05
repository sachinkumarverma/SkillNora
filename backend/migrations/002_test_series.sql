-- Test Series
create table if not exists test_series (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references users(id),
  title text not null,
  description text,
  category text,
  thumbnail_url text,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tests within a Series
create table if not exists tests (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references test_series(id) on delete cascade,
  title text not null,
  duration_minutes integer default 20,
  total_marks numeric default 100,
  instructions text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Questions for a Test
create table if not exists test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references tests(id) on delete cascade,
  section_name text default 'General',
  question_text text not null,
  options jsonb not null, -- e.g., ["A", "B", "C", "D"]
  correct_option_index integer not null,
  positive_marks numeric default 1,
  negative_marks numeric default 0.33,
  created_at timestamptz default now()
);

-- Student Test Attempts (Tracks progress and final score)
create table if not exists test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  test_id uuid references tests(id) on delete cascade,
  status text default 'in_progress', -- in_progress, completed
  start_time timestamptz default now(),
  end_time timestamptz,
  time_spent_seconds integer default 0,
  score numeric default 0,
  correctness_stats jsonb default '{}'::jsonb, -- { correct: 10, incorrect: 5, unattempted: 5 }
  saved_state jsonb default '{}'::jsonb, -- stores answers, marked_for_review, current_question
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS Policies
alter table if exists test_series enable row level security;
alter table if exists tests enable row level security;
alter table if exists test_questions enable row level security;
alter table if exists test_attempts enable row level security;

-- Test Series RLS
drop policy if exists public_read_test_series on test_series;
create policy public_read_test_series on test_series
  for select using (is_published = true or auth.uid() = instructor_id);

drop policy if exists instructor_manage_test_series on test_series;
create policy instructor_manage_test_series on test_series
  for all using (auth.uid() = instructor_id) with check (auth.uid() = instructor_id);

-- Tests RLS
drop policy if exists public_read_tests on tests;
create policy public_read_tests on tests
  for select using (
    exists (select 1 from test_series ts where ts.id = tests.series_id and (ts.is_published = true or ts.instructor_id = auth.uid()))
  );

drop policy if exists instructor_manage_tests on tests;
create policy instructor_manage_tests on tests
  for all using (
    exists (select 1 from test_series ts where ts.id = tests.series_id and ts.instructor_id = auth.uid())
  ) with check (
    exists (select 1 from test_series ts where ts.id = tests.series_id and ts.instructor_id = auth.uid())
  );

-- Test Questions RLS
drop policy if exists public_read_test_questions on test_questions;
create policy public_read_test_questions on test_questions
  for select using (
    exists (
      select 1 from tests t
      join test_series ts on ts.id = t.series_id
      where t.id = test_questions.test_id and (ts.is_published = true or ts.instructor_id = auth.uid())
    )
  );

drop policy if exists instructor_manage_test_questions on test_questions;
create policy instructor_manage_test_questions on test_questions
  for all using (
    exists (
      select 1 from tests t
      join test_series ts on ts.id = t.series_id
      where t.id = test_questions.test_id and ts.instructor_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from tests t
      join test_series ts on ts.id = t.series_id
      where t.id = test_questions.test_id and ts.instructor_id = auth.uid()
    )
  );

-- Test Attempts RLS
drop policy if exists user_manage_own_attempts on test_attempts;
create policy user_manage_own_attempts on test_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
