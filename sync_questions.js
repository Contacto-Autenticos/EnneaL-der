import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const questions = [
    { id: 1, text: "Cuando tengo un objetivo claro, me cuesta esperar y prefiero actuar de inmediato.", type: "A" },
    { id: 2, text: "Me resulta incómodo quedarme sin avanzar mientras otros dudan o postergan.", type: "A" },
    { id: 3, text: "Me siento más tranquilo cuando estoy haciendo que algo suceda.", type: "A" },
    { id: 4, text: "Necesito tiempo a solas para recuperar energía cuando hay demasiada actividad.", type: "B" },
    { id: 5, text: "Prefiero observar en silencio antes que exponerme o llamar la atención.", type: "B" },
    { id: 6, text: "Los espacios tranquilos me ayudan a ordenar lo que siento o pienso.", type: "B" },
    { id: 7, text: "Me cuesta estar tranquilo si siento que no cumplí con lo que debía.", type: "C" },
    { id: 8, text: "Suelo exigirme responder a lo que otros esperan de mí, incluso si me cansa.", type: "C" },
    { id: 9, text: "Me juzgo internamente cuando siento que no hice lo correcto.", type: "C" },
    { id: 10, text: "Cuando algo me hace sentir mal, busco rápidamente distraerme o pensar en algo más agradable.", type: "X" },
    { id: 11, text: "Evito quedarme mucho tiempo en emociones dolorosas o limitantes.", type: "X" },
    { id: 12, text: "Prefiero enfocarme en nuevas posibilidades antes que permanecer en lo que no salió bien.", type: "X" },
    { id: 13, text: "Vivo mis emociones con intensidad y suele notarse cuando algo me afecta.", type: "Y" },
    { id: 14, text: "Necesito claridad en las relaciones para sentirme tranquilo.", type: "Y" },
    { id: 15, text: "Cuando algo me molesta, me cuesta no reaccionar.", type: "Y" },
    { id: 16, text: "Me siento más seguro cuando puedo mantener el control emocional y pensar con lógica.", type: "Z" },
    { id: 17, text: "Prefiero manejar las cosas por mi cuenta antes que depender emocionalmente de otros.", type: "Z" },
    { id: 18, text: "Cuando hay conflicto, tiendo a tomar distancia emocional para no involucrarme demasiado.", type: "Z" },
    {
        id: 19,
        text: "Cuando estoy en un entorno nuevo o bajo presión, mi reacción más automática es:",
        type: "special",
        options: [
            { value: 1, label: "Me activo claramente hacia afuera: actúo, hablo o intervengo de inmediato." },
            { value: 2, label: "Me inclino más hacia actuar y mover la situación que hacia quedarme procesando." },
            { value: 3, label: "Depende mucho del contexto; puedo actuar o procesar según la situación." },
            { value: 4, label: "Me inclino más hacia pensar o sentir internamente antes de actuar." },
            { value: 5, label: "Voy claramente hacia adentro: necesito procesar internamente antes de moverme." }
        ]
    },
    {
        id: 20,
        text: "Cuando hay tensión o desacuerdo, tiendo a:",
        type: "special",
        options: [
            { value: 1, label: "Defender mi posición o confrontar directamente, aunque haya fricción." },
            { value: 2, label: "Inclinarme más por resolver el asunto que por preservar la armonía." },
            { value: 3, label: "Depende del contexto; puedo confrontar o armonizar según la situación." },
            { value: 4, label: "Inclinarme más por mantener la armonía que por confrontar." },
            { value: 5, label: "Priorizar claramente el vínculo y la estabilidad, incluso si algo queda pendiente." }
        ]
    }
];

async function syncQuestions() {
    console.log("Syncing 20 questions to Supabase...");
    for (const q of questions) {
        const { error } = await supabase
            .from('questions')
            .upsert(q, { onConflict: 'id' });

        if (error) {
            console.error(`Error syncing question ${q.id}:`, error.message);
        } else {
            console.log(`Question ${q.id} synced successfully.`);
        }
    }
    console.log("Done.");
}

syncQuestions();
