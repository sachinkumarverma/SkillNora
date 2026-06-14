-- Basic schema for Skillnora

-- users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  full_name text,
  role text default 'student', -- student, instructor, admin
  created_at timestamptz default now()
);

-- courses
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references users(id),
  title text,
  slug text unique,
  description text,
  price numeric default 0,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- lectures
create table if not exists lectures (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text,
  content text,
  video_url text,
  duration integer,
  position integer,
  created_at timestamptz default now()
);

-- enrollments
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  course_id uuid references courses(id),
  enrolled_at timestamptz default now(),
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
