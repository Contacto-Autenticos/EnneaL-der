import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function cleanup() {
    console.log('--- Cleaning Advanced Test Responses ---');
    // 1. Deduplicate Carlos (Email Duplicate)
    const email = 'carlose.orozcob@gmail.com';
    const { data: adv } = await supabase.from('advanced_test_responses').select('id, created_at').eq('user_email', email).order('created_at', { ascending: true });
    if (adv && adv.length > 1) {
        const toDelete = adv.slice(0, -1); // Delete all but the last
        for (const r of toDelete) {
            console.log(`Deleting Advanced ID: ${r.id} for email ${email}`);
            await supabase.from('advanced_test_responses').delete().eq('id', r.id);
        }
    }

    console.log('\n--- Cleaning Initial Test Responses (Basic) ---');
    const { data: basic } = await supabase.from('basic_test_responses').select('*');

    // Group by session and question to find duplicates
    const grouped = {};
    const incompleteSessions = new Set();
    const sessionCounts = {};

    basic.forEach(r => {
        const key = `${r.session_id}-${r.question_id}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(r);

        sessionCounts[r.session_id] = (sessionCounts[r.session_id] || 0) + 1;
    });

    // 2. Delete duplicate rows (same session, same question)
    for (const [key, rows] of Object.entries(grouped)) {
        if (rows.length > 1) {
            const sorted = rows.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            const toDelete = sorted.slice(0, -1);
            for (const r of toDelete) {
                console.log(`Deleting Duplicate Row in Session: ${r.session_id}, Question: ${r.question_id}, ID: ${r.id}`);
                await supabase.from('basic_test_responses').delete().eq('id', r.id);
            }
        }
    }

    // 3. Delete incomplete sessions (< 18 questions)
    for (const [sid, count] of Object.entries(sessionCounts)) {
        if (count < 18) {
            console.log(`Deleting Incomplete Session: ${sid} (${count} questions)`);
            await supabase.from('basic_test_responses').delete().eq('session_id', sid);
        }
    }

    console.log('Done.');
}

cleanup();
