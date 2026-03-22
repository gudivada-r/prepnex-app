import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwqikdtwmtwwcmahlpsg.supabase.co';
const supabaseKey = 'sb_publishable_wuFm7OKw9K2flFYVjMCHlQ_qSeR6OHq'; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPublicSchema() {
    const { data, error } = await supabase
        .from('students')
        .select('id, full_name')
        .ilike('full_name', 'Ram (Admin)')
        .single();

    if (error) {
        console.error("Public Schema Check Failed:", error);
    } else {
        console.log("Found in Public Schema:", JSON.stringify(data, null, 2));
    }
}

verifyPublicSchema();
