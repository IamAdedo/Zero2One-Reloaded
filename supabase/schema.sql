-- Zero2One LMS — Enterprise Relational Schema
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql/new

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'admin',
  'teacher',
  'learner'
);

CREATE TYPE track_type AS ENUM (
  'language',
  'role_frontend',
  'role_backend',
  'role_fullstack',
  'vibe_coding'
);

CREATE TYPE drill_type AS ENUM (
  'multiple_choice',
  'code_execution',
  'text_submission',
  'manual_review'
);

CREATE TYPE submission_status AS ENUM (
  'pending',
  'graded',
  'passed',
  'failed',
  'revision_requested'
);

CREATE TYPE enrollment_status AS ENUM (
  'active',
  'completed',
  'paused',
  'dropped'
);

CREATE TYPE certification_status AS ENUM (
  'issued',
  'revoked',
  'expired'
);

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    xp_total INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    max_streak INT DEFAULT 0,
    freeze_tokens INT DEFAULT 0 CHECK (freeze_tokens BETWEEN 0 AND 2),
    last_active_day DATE,
    timezone_offset VARCHAR(50) DEFAULT 'UTC',
    is_suspended BOOLEAN DEFAULT FALSE,
    suspended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ============================================================
-- 2. ROLES TABLE
-- ============================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name user_role UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- ============================================================
-- 3. TRACKS TABLE
-- ============================================================
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    type track_type NOT NULL,
    primary_language VARCHAR(50) NOT NULL,
    description TEXT,
    estimated_hours INT DEFAULT 40,
    stack TEXT[],
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tracks_slug ON tracks(slug);

-- ============================================================
-- 4. COURSES TABLE
-- ============================================================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    technology VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    long_description TEXT,
    estimated_minutes INT DEFAULT 180,
    price_cents INT DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course ↔ Track junction
CREATE TABLE course_tracks (
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (course_id, track_id)
);

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_category ON courses(category);

-- ============================================================
-- 5. COURSE AUTHORS (Teacher ↔ Course)
-- ============================================================
CREATE TABLE course_authors (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, course_id)
);

CREATE INDEX idx_course_authors_user ON course_authors(user_id);
CREATE INDEX idx_course_authors_course ON course_authors(course_id);

-- ============================================================
-- 6. MODULES TABLE
-- ============================================================
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_capstone BOOLEAN DEFAULT FALSE,
    is_drill BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, sequence_order)
);

CREATE INDEX idx_modules_course ON modules(course_id);

-- ============================================================
-- 7. LESSONS TABLE
-- ============================================================
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_md TEXT NOT NULL,
    video_url TEXT,
    starter_code TEXT,
    language VARCHAR(50),
    test_runner_type VARCHAR(50),
    test_suite_json JSONB,
    xp_reward INT DEFAULT 50,
    estimated_minutes INT DEFAULT 10,
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(module_id, sequence_order)
);

CREATE INDEX idx_lessons_module ON lessons(module_id);

-- ============================================================
-- 8. DRILLS TABLE
-- ============================================================
CREATE TABLE drills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    drill_type drill_type NOT NULL,
    questions_json JSONB NOT NULL,
    passing_score INT DEFAULT 70,
    max_attempts INT DEFAULT 3,
    time_limit_seconds INT,
    xp_reward INT DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (lesson_id IS NOT NULL OR module_id IS NOT NULL)
);

CREATE INDEX idx_drills_lesson ON drills(lesson_id);
CREATE INDEX idx_drills_module ON drills(module_id);

-- ============================================================
-- 9. ENROLLMENTS TABLE
-- ============================================================
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status enrollment_status DEFAULT 'active',
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress_percent INT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- ============================================================
-- 10. USER PROGRESS (Lesson Completion)
-- ============================================================
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    passed_by_placement BOOLEAN DEFAULT FALSE,
    score INT,
    attempts INT DEFAULT 0,
    last_code TEXT,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson ON user_progress(lesson_id);

-- ============================================================
-- 11. DRILL SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE drill_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    drill_id UUID NOT NULL REFERENCES drills(id) ON DELETE CASCADE,
    submission_data JSONB NOT NULL,
    score INT,
    status submission_status DEFAULT 'pending',
    feedback TEXT,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    attempt_number INT DEFAULT 1
);

CREATE INDEX idx_drill_submissions_user ON drill_submissions(user_id);
CREATE INDEX idx_drill_submissions_drill ON drill_submissions(drill_id);

-- ============================================================
-- 12. COURSE REVIEWS TABLE
-- ============================================================
CREATE TABLE course_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    body TEXT,
    is_moderated BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_course_reviews_user ON course_reviews(user_id);
CREATE INDEX idx_course_reviews_course ON course_reviews(course_id);

-- ============================================================
-- 13. CERTIFICATIONS TABLE
-- ============================================================
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status certification_status DEFAULT 'issued',
    certificate_url TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT
);

CREATE INDEX idx_certifications_user ON certifications(user_id);

-- ============================================================
-- 14. PLACEMENT TESTS TABLE
-- ============================================================
CREATE TABLE user_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('beginner', 'test_out')),
    score INT,
    cleared_lesson_ids UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, track_id, course_id)
);

-- ============================================================
-- 15. BOOKMARKS TABLE
-- ============================================================
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

-- ============================================================
-- 16. ACHIEVEMENTS TABLE
-- ============================================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_name VARCHAR(100) NOT NULL,
    xp_reward INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Users
CREATE POLICY "Users are publicly readable" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own record" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Roles
CREATE POLICY "Roles are publicly readable" ON roles FOR SELECT USING (true);

-- User Roles
CREATE POLICY "User roles are readable" ON user_roles FOR SELECT USING (true);

-- Tracks
CREATE POLICY "Published tracks are public" ON tracks FOR SELECT USING (is_published = true OR is_published IS NULL);

-- Courses
CREATE POLICY "Published courses are public" ON courses FOR SELECT USING (is_published = true OR is_published IS NULL);

-- Course Tracks
CREATE POLICY "Course tracks are public" ON course_tracks FOR SELECT USING (true);

-- Course Authors
CREATE POLICY "Course authors are public" ON course_authors FOR SELECT USING (true);

-- Modules
CREATE POLICY "Modules are public" ON modules FOR SELECT USING (true);

-- Lessons
CREATE POLICY "Lessons are public" ON lessons FOR SELECT USING (true);
CREATE POLICY "Teachers can manage own lessons" ON lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM course_authors ca
      JOIN modules m ON m.course_id = ca.course_id
      WHERE m.id = module_id AND ca.user_id = auth.uid()
    )
  );

-- Drills
CREATE POLICY "Drills are public" ON drills FOR SELECT USING (true);

-- Enrollments
CREATE POLICY "Users can read own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll" ON enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON enrollments FOR UPDATE USING (auth.uid() = user_id);

-- User Progress
CREATE POLICY "Users can read own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Drill Submissions
CREATE POLICY "Users can read own submissions" ON drill_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can submit" ON drill_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Course Reviews
CREATE POLICY "Public reviews are readable" ON course_reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Users can write own reviews" ON course_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON course_reviews FOR UPDATE USING (auth.uid() = user_id);

-- Certifications
CREATE POLICY "Users can read own certifications" ON certifications FOR SELECT USING (auth.uid() = user_id);

-- Bookmarks
CREATE POLICY "Users can manage own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Achievements are public" ON achievements FOR SELECT USING (true);
CREATE POLICY "User achievements are readable" ON user_achievements FOR SELECT USING (true);

-- ============================================================
-- SEED ROLES
-- ============================================================
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'System Director — full platform control'),
  ('admin', 'Operations & Student Success — user and content management'),
  ('teacher', 'Author — course creation and student grading'),
  ('learner', 'Student — learning, drills, and certification');
