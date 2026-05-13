import { liderazgoQuestions, liderazgoDimensions, interpretacionLiderazgo } from '../data/liderazgoData';

export const calculateLiderazgoResults = (answers) => {
    const results = {
        totalScore: 0,
        dimensions: {
            personal: 0,
            estrategico: 0,
            relacional: 0,
            multiplicador: 0,
            trascendente: 0
        },
        controlAccuracy: 0, // Measure of consistency
        topStrengths: [],
        topRisks: [],
        level: null
    };

    // 1. Calculate Dimension Scores (Questions 1-50)
    liderazgoQuestions.forEach(q => {
        const val = parseInt(answers[q.id]) || 0;
        let score = val;

        if (q.type === 'inverse') {
            score = 6 - val; // 1->5, 2->4, 3->3, 4->2, 5->1
        }

        if (q.domain !== 'control') {
            results.dimensions[q.domain] += score;
        }
        
        results.totalScore += score;
    });

    // 2. Determine Level
    results.level = interpretacionLiderazgo.general.find(
        range => results.totalScore >= range.min && results.totalScore <= range.max
    ) || interpretacionLiderazgo.general[0];

    // 3. Identify Strengths and Risks
    const dimArray = Object.entries(results.dimensions).map(([key, score]) => ({
        id: key,
        name: liderazgoDimensions[key].name,
        subtext: liderazgoDimensions[key].subtext,
        score,
        percentage: (score / 50) * 100,
        interpretation: interpretacionLiderazgo.dimension.find(
            range => score >= range.min && score <= range.max
        )
    }));

    // Sort by score
    const sortedDims = [...dimArray].sort((a, b) => b.score - a.score);
    
    results.topStrengths = sortedDims.slice(0, 3);
    results.topRisks = sortedDims.slice(-2); // Usually bottom 2 or 3 are risks
    results.allDimensions = dimArray;

    return results;
};

export const getRecommendations = (results) => {
    // Basic recommendation logic based on bottom dimensions
    const recs = {
        personal: [
            "Establece una rutina de reflexión diaria de 10 minutos.",
            "Solicita feedback específico a 3 personas de confianza esta semana.",
            "Identifica tu 'disparador' emocional más común y define una pausa de 5 segundos."
        ],
        estrategico: [
            "Define tus 3 prioridades 'No Negociables' al inicio de cada semana.",
            "Bloquea tiempo en tu agenda para 'pensamiento estratégico' sin interrupciones.",
            "Evalúa tus proyectos actuales bajo la lente de 'Impacto vs. Esfuerzo'."
        ],
        relacional: [
            "Practica la escucha activa: no interrumpas y parafrasea lo que el otro dijo.",
            "Agenda una conversación 'difícil' pendiente aplicando empatía radical.",
            "Reconoce el trabajo de alguien de tu equipo de forma pública y específica."
        ],
        multiplicador: [
            "Delega una tarea completa, no solo pasos aislados, confiando en el proceso.",
            "Identifica una fortaleza en un colaborador y asígnale un reto que la potencie.",
            "Sustituye 'dar la respuesta' por 'hacer la pregunta correcta' en tu próxima reunión."
        ],
        trascendente: [
            "Conecta los objetivos del mes con el propósito mayor de la organización.",
            "Realiza un acto de servicio o apoyo que no te beneficie directamente.",
            "Escribe tu 'legado deseado' y revisa si tus decisiones de hoy te acercan a él."
        ]
    };

    const weakestDomain = [...results.allDimensions].sort((a, b) => a.score - b.score)[0].id;
    return recs[weakestDomain] || recs.personal;
};
