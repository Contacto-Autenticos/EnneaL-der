import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkDups() {
    console.log('--- Advanced Test Responses ---');
    const { data: adv } = await supabase.from('advanced_test_responses').select('id, user_email, created_at, user_name');
    if (!adv) {
        console.log('No advanced data found.');
    } else {
        const advMap = {};
        adv.forEach(d => {
            const e = (d.user_email || '').toLowerCase().trim();
            if (e) {
                if (!advMap[e]) advMap[e] = [];
                advMap[e].push(d);
            }
        });

        const advDups = Object.entries(advMap).filter(c => c[1].length > 1);
        console.log(`Found ${advDups.length} duplicate emails.`);
        advDups.forEach(([email, records]) => {
            console.log(`Email: ${email}, IDs: ${records.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(r => r.id).join(', ')}`);
        });
    }

    console.log('\n--- Initial Test Responses (Basic) ---');
    const { data: basic } = await supabase.from('basic_test_responses').select('id, session_id, question_id, answer, created_at');
    if (!basic) {
        console.log('No basic data found.');
    } else {
        const sessionData = {};
        basic.forEach(r => {
            if (!sessionData[r.session_id]) sessionData[r.session_id] = { answers: [], date: r.created_at };
            sessionData[r.session_id].answers.push({ q: r.question_id, a: r.answer });
        });

        const fingerPrints = {};
        Object.entries(sessionData).forEach(([sid, data]) => {
            if (data.answers.length >= 18) {
                const fp = data.answers.sort((a, b) => a.q - b.q).map(a => `${a.q}:${a.a}`).join('|');
                if (!fingerPrints[fp]) fingerPrints[fp] = [];
                fingerPrints[fp].push({ sid, date: data.date });
            }
        });

        const basicDups = Object.entries(fingerPrints).filter(f => f[1].length > 1);
        console.log(`Found ${basicDups.length} duplicate session fingerprints.`);
        basicDups.forEach(([fp, sessions]) => {
            const sorted = sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
            console.log(`Identical sessions (User fingerprint): ${sorted.map(s => s.sid).join(', ')}`);
        });
    }
}

checkDups();
