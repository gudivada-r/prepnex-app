// PREPNEX_AUTH_LOGIC.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Definitive Supabase Configuration (Sync with gwqikdtwmtwwcmahlpsg)
const supabaseUrl = 'https://gwqikdtwmtwwcmahlpsg.supabase.co';
const supabaseKey = 'sb_publishable_wuFm7OKw9K2flFYVjMCHlQ_qSeR6OHq'; 

// SCHEMA CALIBRATION: Falling back to default 'public' for demo reliability
const supabase = createClient(supabaseUrl, supabaseKey);

export async function authenticateStudent(email, password) {
    console.log("PrepNex Auth: Validating credentials for", email);

    // MOCK PASSWORD FOR DEMO (Seeded Students)
    const DEMO_PASSWORD = 'prepnex2026';

    try {
        if (password !== DEMO_PASSWORD) {
            return { success: false, message: "Invalid Pathfinder password." };
        }

        // IDENTITY MAPPING: Mapping email to a seeded student name for the demo
        // We assume 'alex.davis@example.com' maps to 'Student_1' (Our elite test profile)
        const targetName = email === 'alex.davis@example.com' ? 'Student_1' : email;

        const { data, error } = await supabase
            .from('students')
            .select('id, full_name')
            .ilike('full_name', targetName) 
            .single();

        if (error || !data) {
            return { success: false, message: "Student record not found in Prepnex schema." };
        }

        console.log("PrepNex Auth: Successfully verified Student", data.full_name);
        return { success: true, studentId: data.id };

    } catch (err) {
        console.error("PrepNex Auth: Error during validation", err);
        return { success: false, message: "Connection to Vesta Intelligence failed." };
    }
}

// Attach listener to Login UI
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    if (!loginBtn) return;

    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('auth-error');

        if (!email || !password) {
            errorDiv.innerText = "Please provide your admissions email.";
            errorDiv.style.display = 'block';
            return;
        }

        errorDiv.style.display = 'none';
        loginBtn.innerText = "Authenticating Pathways...";
        loginBtn.disabled = true;

        const result = await authenticateStudent(email, password);

        if (result.success) {
            // SUCCESS: Redirect to Dashboard with Context
            window.location.href = `/dashboard?id=${result.studentId}`;
        } else {
            errorDiv.innerText = result.message;
            errorDiv.style.display = 'block';
            loginBtn.innerText = "Log in to Pathfinder";
            loginBtn.disabled = false;
        }
    });
});
