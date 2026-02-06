import { questions, options } from "../data/questions.js";

export const calculateResults = (answers) => {
    // Initialize scores
    const scores = {
        A: 0, B: 0, C: 0,
        X: 0, Y: 0, Z: 0
    };

    // Calculate scores
    Object.entries(answers).forEach(([questionId, answerValue]) => {
        const question = questions.find((q) => q.id === parseInt(questionId));
        const option = options.find((o) => o.value === answerValue);

        if (question && option) {
            scores[question.type] += option.points;
        }
    });

    // Helper to find dominant type in a group with advanced rules
    const analyzeGroup = (group) => {
        // group is like { A: 5, B: 3, C: 2 }
        const sorted = Object.entries(group).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
        const [d1, d2, d3] = sorted;

        // Extract values for clarity
        const type1 = d1[0]; const score1 = d1[1];
        const type2 = d2[0]; const score2 = d2[1];
        const type3 = d3[0]; const score3 = d3[1];

        let result = {
            primary: type1,
            secondary: null,
            status: 'clear', // clear, tie, flexible, nuance
            text: ''
        };

        // 4. Regla de dispersión · Perfil flexible
        // Si los tres puntajes del bloque están muy cercanos (diferencia máxima de 1 punto entre todos)
        if ((score1 - score3) <= 1) {
            result.status = 'flexible';
            result.text = "Tu resultado muestra una alta capacidad de adaptación. Es posible que ajustes tu forma de actuar según el contexto y el momento.";
            return result;
        }

        // 3. Regla de empate técnico
        // Si dos tipos del mismo bloque tienen exactamente el mismo puntaje
        if (score1 === score2) {
            result.status = 'tie';
            result.secondary = type2;
            result.text = `Tu forma de actuar combina rasgos de ${type1} y ${type2}.`;
            return result;
        }

        // 2. Regla de cercanía · Matiz secundario
        // Si el segundo puntaje más alto del bloque está a 2 puntos o menos del predominante
        if ((score1 - score2) <= 2) {
            result.status = 'nuance';
            result.secondary = type2;
            result.text = `Predomina el estilo ${type1}, con rasgos de ${type2}.`;
            return result;
        }

        // 1. Regla principal (Default - High Clarity)
        result.text = `Tu estilo predominante en este bloque es ${type1}.`;

        return result;
    };

    const group1 = { A: scores.A, B: scores.B, C: scores.C };
    const group2 = { X: scores.X, Y: scores.Y, Z: scores.Z };

    const result1 = analyzeGroup(group1);
    const result2 = analyzeGroup(group2);

    const enneatypeMap = {
        "AX": "7", "AY": "8", "AZ": "3",
        "BX": "9", "BY": "4", "BZ": "5",
        "CX": "2", "CY": "6", "CZ": "1"
    };

    const combination = result1.primary + result2.primary;
    const enneatype = enneatypeMap[combination];

    // Determine ambiguity/flexibility for the final flag based on group status
    let isAmbiguous = false;
    if (result1.status === 'flexible' || result2.status === 'flexible') {
        isAmbiguous = true;
    }

    return {
        scores,
        group1: result1,
        group2: result2,
        enneatype,
        isAmbiguous
    };
};

export const getEnneagramInfo = (type) => {
    const info = {
        "1": { name: "El Reformador", role: "Idealista, ético, perfeccionista" },
        "2": { name: "El Servicial", role: "Cálido, generoso, complaciente" },
        "3": { name: "El Competitivo", role: "Eficiente, realizador, orientado al éxito" },
        "4": { name: "El Creativo", role: "Sensible, profundo, diferente" },
        "5": { name: "El Analitico", role: "Investigador, reservado, observador" },
        "6": { name: "El Leal", role: "Comprometido, precavido, confiable" },
        "7": { name: "El Entusiasta", role: "Optimista, espontáneo, inquieto" },
        "8": { name: "El Lider", role: "Intenso, firme, protector" },
        "9": { name: "El Conciliador", role: "Tranquilo, pacificador, adaptable" },
    };
    return info[type] || { name: "Indeterminado", role: "Explorador" };
}
