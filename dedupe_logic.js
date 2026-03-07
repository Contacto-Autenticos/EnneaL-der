import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function analyze() {
    console.log('--- Advanced Test Responses ---');
    const { data: adv } = await supabase.from('advanced_test_responses').select('*');
    const advMap = {};
    adv.forEach(d => {
        const e = (d.user_email || '').toLowerCase().trim();
        if (e) {
            if (!advMap[e]) advMap[e] = [];
            advMap[e].push(d);
        }
    });
    Object.entries(advMap).forEach(([email, records]) => {
        if (records.length > 1) {
            console.log(`Duplicate Email: ${email}, Count: ${records.length}, IDs: ${records.map(r => r.id).join(', ')}`);
        }
    });

    console.log('\n--- Initial Test Responses (Basic) ---');
    const { data: basic } = await supabase.from('basic_test_responses').select('*');
    const sessions = {};
    basic.forEach(r => {
        if (!sessions[r.session_id]) sessions[r.session_id] = { rows: [], date: r.created_at };
        sessions[r.session_id].rows.push(r);
    });

    console.log(`Total sessions recorded: ${Object.keys(sessions).length}`);

    // 1. Check for sessions with duplicate question IDs (database bug)
    Object.entries(sessions).forEach(([sid, s]) => {
        const qIds = s.rows.map(r => r.question_id);
        const uniqueQIds = new Set(qIds);
        if (uniqueQIds.size !== qIds.length) {
            console.log(`Session ${sid} has duplicate rows for some questions!`);
        }
    });

    // 2. Check for identical answer sets
    const fingerprints = {};
    Object.entries(sessions).forEach(([sid, s]) => {
        if (s.rows.length >= 18) {
            const fp = s.rows.sort((a, b) => a.question_id - b.question_id).map(r => `${r.question_id}:${r.answer}`).join('|');
            if (!fingerprints[fp]) fingerprints[fp] = [];
            fingerprints[fp].push({ sid, date: s.date });
        }
    });
    Object.entries(fingerprints).forEach(([fp, list]) => {
        if (list.length > 1) {
            console.log(`Duplicate Session CONTENT found: ${list.map(l => l.sid).join(', ')}`);
        }
    });

    // 3. Check for incomplete sessions (< 18 questions)
    const incomplete = Object.entries(sessions).filter(([sid, s]) => s.rows.length < 18);
    console.log(`Incomplete sessions (<18 rows): ${incomplete.length}`);
    incomplete.forEach(([sid, s]) => {
        console.log(`Incomplete Session: ${sid}, Rows: ${s.rows.length}, Date: ${s.date}`);
    });
}

analyze();
