-- ========================================================
-- PREPNEX DATA SEED SCRIPT (100 Sample Students)
-- Generates varied profiles across Grade levels and Majors
-- ========================================================

DO $$
DECLARE 
    i INT;
    v_student_id UUID;
    v_majors TEXT[] := ARRAY['Computer Science', 'Biology', 'MicroBiology', 'Mechanical Engineering', 'Aero Engineering', 'Business', 'Economics', 'Philosophy', 'Physics'];
    v_unis TEXT[] := ARRAY['Stanford', 'MIT', 'Harvard', 'Caltech', 'Yale', 'Princeton', 'Carnegie Mellon', 'UC Berkeley'];
    v_full_name TEXT;
    v_grade INT;
    v_major TEXT;
    v_uni TEXT;
BEGIN
    FOR i IN 1..100 LOOP
        v_full_name := 'Student_' || i;
        v_grade := floor(random() * (12 - 6 + 1) + 6)::int; -- 6 to 12
        v_major := v_majors[floor(random() * array_length(v_majors, 1) + 1)];
        v_uni := v_unis[floor(random() * array_length(v_unis, 1) + 1)];

        -- Insert Student
        INSERT INTO public.students (full_name, current_grade, target_major, target_universities, alignment_score)
        VALUES (v_full_name, v_grade, ARRAY[v_major], ARRAY[v_uni], floor(random() * (98 - 70 + 1) + 70))
        RETURNING id INTO v_student_id;

        -- Insert Mock Academic Roadmap for 9th Grade (Example)
        INSERT INTO public.academic_roadmaps (student_id, grade_level, course_type, course_name, status, grade)
        VALUES 
            (v_student_id, 9, 'Math', 'Algebra II / Trig', 'active', 'A'),
            (v_student_id, 9, 'Science', (CASE WHEN v_major LIKE '%Bio%' THEN 'Advanced Biology' ELSE 'Physics Honors' END), 'active', 'A-');

        -- Insert Mock Activities
        INSERT INTO public.profile_activities (student_id, activity_name, activity_type, his_score, status)
        VALUES 
            (v_student_id, (CASE WHEN v_major = 'Computer Science' THEN 'USACO Silver Contest' ELSE 'MUN Debate' END), 'Olympiad', floor(random() * (9 - 6 + 1) + 6), 'active'),
            (v_student_id, 'Varsity Soccer', 'Sport', 4.5, 'active');

        -- Insert Test Forecast
        INSERT INTO public.test_history (student_id, test_type, score, is_actual)
        VALUES (v_student_id, 'PSAT', floor(random() * (1520 - 1000 + 1) + 1000), TRUE);

        -- Initialize Vesta Context
        INSERT INTO public.ai_context (student_id, conversation_summary, last_strategy_nudge)
        VALUES (v_student_id, 'Vesta is guiding ' || v_full_name || ' toward ' || v_uni, 'Focus on your upcoming ' || v_major || ' project.');

    END LOOP;
END $$;
