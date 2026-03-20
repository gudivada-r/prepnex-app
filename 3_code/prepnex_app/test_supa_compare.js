const { createClient } = require('@supabase/supabase-js');

// Current logic values
const URL1 = 'https://gwqikdtwmtwwcmahlpsg.supabase.co';
const KEY1 = 'sb_publishable_wuFm7OKw9K2flFYVjMCHlQ_qSeR6OHq';

// Seeder script values
const URL2 = 'https://rfkoylpcuptzkakmqotq.supabase.co';
const KEY2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJma295bHBjdXB0emtha21xb3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzY0MDYsImV4cCI6MjA4ODQxMjQwNn0.kcUD2GGSmMJLcG0tyJZtbCd9h9gB2S8jFYDz9RJKMe8';

async function test(url, key, schema) {
    console.log(`Testing ${url} with schema ${schema}...`);
    const supabase = createClient(url, key, { db: { schema } });
    try {
        const { data, error } = await supabase.from('students').select('*').limit(1);
        if (error) {
            console.error(`  Error: ${error.message} (${error.code})`);
        } else {
            console.log(`  Success! Found ${data.length} students.`);
        }
    } catch (err) {
        console.error(`  Exception: ${err.message}`);
    }
}

async function run() {
    await test(URL1, KEY1, 'prepnex');
    await test(URL1, KEY1, 'public');
    await test(URL2, KEY2, 'prepnex');
    await test(URL2, KEY2, 'public');
}

run();
