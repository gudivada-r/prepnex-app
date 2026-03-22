// PREPNEX_VESTA_LOGIC.js - BROWSER SAFE VERSION
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Definitive Supabase Configuration (Sync with gwqikdtwmtwwcmahlpsg)
const supabaseUrl = 'https://gwqikdtwmtwwcmahlpsg.supabase.co';
const supabaseKey = 'sb_publishable_wuFm7OKw9K2flFYVjMCHlQ_qSeR6OHq'; 

// SCHEMA CALIBRATION: Falling back to default 'public' for demo reliability
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 1. GET FULL STUDENT CONTEXT
 * Fetches the entire 7-year profile from the 'prepnex' schema.
 */
export async function getVestaContext(studentId) {
    console.log("Vesta: Fetching context for Student", studentId);
    
    const { data: profile, error } = await supabase
        .from('students')
        .select(`
            *,
            academic_roadmaps (*),
            profile_activities (*),
            test_history (*),
            ai_context (*)
        `)
        .eq('id', studentId)
        .single();

    if (error) {
        console.error("Vesta Intelligence: Context retrieval failed:", error);
        throw error;
    }
    return profile;
}

/**
 * 2. PERSIST VESTA NUDGE
 * Writes a strategic update back to the DB.
 */
export async function persistVestaNudge(studentId, nudgeContent) {
    const { data, error } = await supabase
        .from('ai_context')
        .upsert({
            student_id: studentId,
            last_strategy_nudge: nudgeContent,
            updated_at: new Date().toISOString()
        });

    if (error) console.error("Vesta: Failed to persist nudge:", error);
    return data;
}

/**
 * 3. CORE MODULE HELPERS
 */
export async function getAcademicRoadmap(studentId) {
    const { data, error } = await supabase.from('academic_roadmaps').select('*').eq('student_id', studentId);
    if (error) throw error;
    return data;
}

export async function getTestHistory(studentId) {
    const { data, error } = await supabase.from('test_history').select('*').eq('student_id', studentId);
    if (error) throw error;
    return data;
}

export async function getProfileImpact(studentId) {
    const { data, error } = await supabase.from('profile_activities').select('*').eq('student_id', studentId);
    if (error) throw error;
    return data;
}

/**
 * 4. PATHWAY SYNC (AUDIT ENGINE)
 * Simulates a Vesta Audit by updating the alignment score.
 */
export async function performPathwaySync(studentId) {
    console.log("Vesta: Running Pathway Sync Audit...");
    const newScore = Math.floor(Math.random() * (99 - 90 + 1) + 90);
    
    const { error } = await supabase
        .from('students')
        .update({ alignment_score: newScore })
        .eq('id', studentId);

    if (error) throw error;
    return newScore;
}

/**
 * 5. AI CHAT HANDLER (VESTA PERSONA)
 */
export async function vestaChat(studentId, message) {
    const context = await getVestaContext(studentId);
    
    // Simulating Vesta Persona Intelligence
    const replyText = `Vesta here. I see your top target is ${context.target_universities[0]}. Based on your ${context.academic_roadmaps[0] ? context.academic_roadmaps[0].course_name : 'Algebra II'} performance, I've updated your roadmap.`;
    
    const response = {
        reply: replyText,
        suggestedAction: "Strategic Alignment: SECURED"
    };

    await persistVestaNudge(studentId, response.reply);
    return response;
}
