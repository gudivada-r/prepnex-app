-- ==========================================
-- PREPNEX SCHEMA (College PrepAI Segment)
-- ==========================================

-- 1. Use the standard 'public' schema
-- CREATE SCHEMA IF NOT EXISTS prepnex;

-- 2. Students Profile Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id), -- Link to Supabase Auth
    full_name TEXT NOT NULL,
    current_grade INT CHECK (current_grade >= 6 AND current_grade <= 12),
    target_major TEXT[],
    target_universities TEXT[],
    alignment_score NUMERIC DEFAULT 0, -- 0-100 calculation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Academic Roadmap (Courses)
CREATE TABLE IF NOT EXISTS public.academic_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    school_year INT, -- e.g., 2026
    grade_level INT, -- 6 to 12
    course_type TEXT, -- 'Math', 'Science', 'English', etc.
    course_name TEXT NOT NULL,
    status TEXT DEFAULT 'planned', -- 'planned', 'active', 'completed'
    grade TEXT, -- 'A+', 'B', etc.
    ai_accelerated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Holistic Profile Activities (HIS Scores)
CREATE TABLE IF NOT EXISTS public.profile_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    activity_name TEXT NOT NULL,
    activity_type TEXT, -- 'Sport', 'Olympiad', 'Robotics', 'Volunteer'
    his_score NUMERIC, -- High Impact Score (1-10)
    leadership_tier INT DEFAULT 0,
    status TEXT DEFAULT 'active',
    ai_nexus_suggestion BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Testing and Forecasts (SAT/ACT)
CREATE TABLE IF NOT EXISTS public.test_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    test_type TEXT, -- 'SAT', 'ACT', 'PSAT', 'AMC'
    test_date DATE,
    score INT,
    forecasted_score INT,
    is_actual BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Vesta AI Conversations & Context
CREATE TABLE IF NOT EXISTS public.ai_context (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    conversation_summary TEXT, -- Persistent context for Vesta
    last_strategy_nudge TEXT, -- The "Aura Nudge" historical record
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Coaching Directives
CREATE TABLE IF NOT EXISTS public.coaching_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    coach_id UUID, -- Placeholder for coach profile
    session_date TIMESTAMP WITH TIME ZONE,
    strategic_directive TEXT, -- High-level instruction from human coach
    status TEXT DEFAULT 'scheduled'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prepnex_student_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_prepnex_roadmaps_student ON public.academic_roadmaps(student_id);
CREATE INDEX IF NOT EXISTS idx_prepnex_activities_student ON public.profile_activities(student_id);
