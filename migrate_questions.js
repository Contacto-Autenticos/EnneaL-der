
import { createClient } from '@supabase/supabase-js';
import { questions } from './src/data/questions.js';
import { advancedQuestions } from './src/data/advancedQuestions.js';

const SUPABASE_URL = 'https://hwrlijzctnzbrkmurvjf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmxpanpjdG56YnJrbXVydmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDgxMjIsImV4cCI6MjA4NjMyNDEyMn0.99mI5dOmmjt73V65qVgj2j__G_iI7P_hegpR7nwTo0Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
    console.log('--- Inicia Migración ---');

    // 1. Crear tablas si no existen (vía RPC o directo si anon permite, 
    // pero mejor intentar INSERT y ver si falla por falta de tabla)

    console.log('Migrando preguntas iniciales...');
    for (const q of questions) {
        const { error } = await supabase
            .from('questions')
            .upsert({
                id: q.id,
                text: q.text,
                type: q.type,
                options: q.options || null,
                scoring: q.scoring || null
            });
        if (error) console.error(`Error en q ${q.id}:`, error.message);
    }

    console.log('Migrando preguntas avanzadas...');
    for (const q of advancedQuestions) {
        const { error } = await supabase
            .from('advanced_questions')
            .upsert({
                id: q.id,
                enneatype: q.enneatype,
                text: q.text,
                type: q.type
            });
        if (error) console.error(`Error en adv_q ${q.id}:`, error.message);
    }

    console.log('--- Migración Finalizada ---');
}

migrate();
