import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwqikdtwmtwwcmahlpsg.supabase.co';
const supabaseKey = 'sb_publishable_wuFm7OKw9K2flFYVjMCHlQ_qSeR6OHq'; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudents() {
    const { data, error } = await supabase
        .from('students')
        .select('id, full_name')
        .limit(10);

    if (error) {
        console.error("Error querying students:", error);
    } else {
        console.log("Students found:", JSON.stringify(data, null, 2));
    }
}

checkStudents();
