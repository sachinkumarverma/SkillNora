-- Basic schema for Skillnora

-- users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  full_name text,
  role text default 'student', -- student, instructor, admin
  activity_heatmap jsonb default '{}'::jsonb, -- stores watch dates for heatmap
  created_at timestamptz default now()
);

-- courses
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references users(id),
  title text,
  slug text unique,
  description text,
  thumbnail_url text,
  category text,
  target_role text,
  primary_skill text,
  certificate_type text,
  price numeric default 0,
  discount_price numeric,
  is_published boolean default false,
  average_rating numeric(3,2) default null, -- e.g. 4.50
  total_reviews integer default 0,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- lectures (modules)
create table if not exists lectures (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text,
  video_url text,
  thumbnail_url text,
  position integer,
  mcqs jsonb default '[]'::jsonb, -- MCQ quiz questions for this module
  created_at timestamptz default now()
);

-- enrollments
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  course_id uuid references courses(id),
  enrolled_at timestamptz default now(),
  expires_at timestamptz, -- if null, it's lifetime access
  progress jsonb default '{}'::jsonb
);

-- certificates
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  course_id uuid references courses(id),
  issued_at timestamptz default now(),
  verification_code text unique
);

-- orders (payments)
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  razorpay_order_id text unique,
  user_id uuid references users(id),
  course_id uuid references courses(id),
  amount numeric,
  currency text default 'INR',
  status text default 'created', -- created, paid, failed
  receipt text,
  created_at timestamptz default now()
);

-- reviews
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  review_text text, -- optional written review
  created_at timestamptz default now(),
  unique(course_id, user_id) -- one review per user per course
);

-- Trigger to automatically calculate average rating on courses
create or replace function update_course_rating()
returns trigger as $$
begin
  update courses
  set 
    total_reviews = (select count(*) from reviews where course_id = coalesce(new.course_id, old.course_id)),
    average_rating = (select avg(rating)::numeric(3,2) from reviews where course_id = coalesce(new.course_id, old.course_id))
  where id = coalesce(new.course_id, old.course_id);
  
  return null;
end;
$$ language plpgsql;

create trigger trg_update_course_rating
after insert or update or delete on reviews
for each row execute function update_course_rating();

-- refunds
create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  course_id uuid references courses(id),
  amount numeric,
  reason text,
  status text default 'processed',
  created_at timestamptz default now()
);
