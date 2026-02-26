import { questions, options } from "../data/questions.js";
import { advancedQuestions, advancedOptions } from "../data/advancedQuestions.js";

/**
 * Enneagram Info Map
 */
export const getEnneagramInfo = (type) => {
    const info = {
        "1": {
            name: "El Reformador",
            role: "Idealista, ético, perfeccionista",
            description: "Lideras desde principios claros y un fuerte sentido de lo correcto.\nTienes una capacidad natural para ordenar, mejorar y elevar estándares.\nBuscas coherencia entre lo que piensas, sientes y haces.\nCuando confías en tu criterio, inspiras respeto y credibilidad.",
            image: "/eneatipo-1.jpg"
        },
        "2": {
            name: "El Servicial",
            role: "Cálido, generoso, complaciente",
            description: "Tu liderazgo nace del cuidado genuino por las personas.\nDetectas necesidades con facilidad y sabes crear vínculos de confianza.\nAportas calidez, apoyo y sentido humano a cualquier equipo.\nCuando lideras desde la conciencia, generas compromiso real.",
            image: "/eneatipo-2.jpg"
        },
        "3": {
            name: "El Competitivo",
            role: "Eficiente, realizador, orientado al éxito",
            description: "Te mueves con enfoque, energía y orientación a resultados.\nSabes adaptarte y mostrar lo mejor de ti en cada contexto.\nTu liderazgo impulsa el logro y motiva al alto desempeño.\nCuando actúas desde la autenticidad, tu impacto se multiplica.",
            image: "/eneatipo-3.jpg"
        },
        "4": {
            name: "El Creativo",
            role: "Sensible, profundo, diferente",
            description: "Lideras desde la sensibilidad, la intuición y la profundidad emocional.\nAportas visión, significado y una mirada auténtica al entorno.\nTienes facilidad para conectar con lo que otros sienten.\nCuando expresas tu singularidad, inspiras desde lo genuino.",
            image: "/eneatipo-4.jpg"
        },
        "5": {
            name: "El Analítico",
            role: "Investigador, reservado, observador",
            description: "Tu liderazgo se apoya en la observación, la claridad y el conocimiento.\nProcesas la información con profundidad y objetividad.\nAportas perspectiva, estrategia y pensamiento independiente.\nCuando compartes lo que sabes, fortaleces decisiones colectivas.",
            image: "/eneatipo-5.jpg"
        },
        "6": {
            name: "El Leal",
            role: "Comprometido, precavido, confiable",
            description: "Lideras desde el compromiso, la responsabilidad y la previsión.\nAnticipas riesgos y cuidas la estabilidad del grupo.\nGeneras confianza cuando actúas con coherencia y presencia.\nTu fortaleza crece al confiar en tu criterio interno.",
            image: "/eneatipo-6.jpg"
        },
        "7": {
            name: "El Entusiasta",
            role: "Optimista, espontáneo, inquieto",
            description: "Tu liderazgo se expresa con energía, optimismo y visión de futuro.\nTe mueves hacia nuevas posibilidades con creatividad y entusiasmo.\nAportas dinamismo y motivación al entorno.\nCuando enfocas tu energía, tu impacto se vuelve transformador.",
            image: "/eneatipo-7.jpg"
        },
        "8": {
            name: "El Líder",
            role: "Intenso, firme, protector",
            description: "Lideras con presencia, determinación y fuerza interior.\nTe resulta natural tomar decisiones y asumir el control.\nProteges lo que consideras importante y actúas con firmeza.\nCuando lideras desde la conciencia, empoderas a otros. ",
            image: "/eneatipo-8.jpg"
        },
        "9": {
            name: "El Conciliador",
            role: "Tranquilo, pacificador, adaptable",
            description: "Tu liderazgo nace de la calma, la escucha y la integración.\nFacilitas acuerdos y generas ambientes de armonía.\nAportas estabilidad y una visión amplia del conjunto. \nCuando afirmas tu voz, tu influencia se fortalece. ",
            image: "/eneatipo-9.jpg"
        },
    };
    return info[type] || { name: "Indeterminado", role: "Explorador", description: "" };
};

/**
 * Enneagram Email Image Map (Google Drive Direct Links)
 */
export const getEnneagramEmailImage = (type) => {
    const links = {
        "1": "https://lh3.googleusercontent.com/d/13HqdsIB_zooWe-fR3O3-FU5aF_czYQAb",
        "2": "https://lh3.googleusercontent.com/d/15bLGn4HaUKjTqmhjQ1QYfQrTNATsIbr3",
        "3": "https://lh3.googleusercontent.com/d/1zw8nhJqZ5XJAQlClpQJufV5g54i7UpUc",
        "4": "https://lh3.googleusercontent.com/d/1v4tb36sEpXjZ77TCsBGB1loRzwxXy9xe",
        "5": "https://lh3.googleusercontent.com/d/1lA2m6N6w2MzAM77FN9KHs66j3jimNaZn",
        "6": "https://lh3.googleusercontent.com/d/1_94KbfSfKr_B-dNnhzzRD6PwNmUsjkqY",
        "7": "https://lh3.googleusercontent.com/d/1HhmckigiHCT5TPkNjZ5EF4rL1XQQfgKK",
        "8": "https://lh3.googleusercontent.com/d/1IgdoEgwQN8yVAWUI4BqMcHvvrdvLoLZs",
        "9": "https://lh3.googleusercontent.com/d/1JlII1sRooMxr-Qr7IzW_wuLbQmf14ad2"
    };
    // Default to a generic coin if type not found, or use T1
    return links[String(type)] || links["1"];
};

/**
 * Main calculation function — Direct Sum System
 */
export const calculateResults = (answers) => {
    // -----------------------------------------
    // 1. Calculate block totals (A, B, C, X, Y, Z)
    // -----------------------------------------
    const scores = { A: 0, B: 0, C: 0, X: 0, Y: 0, Z: 0 };

    Object.entries(answers).forEach(([questionId, answerValue]) => {
        const question = questions.find((q) => q.id === parseInt(questionId));
        const option = options.find((o) => o.value === answerValue);

        // Only process standard Likert questions (not special ones)
        if (question && option && question.type !== "special") {
            scores[question.type] += option.points;
        }
    });

    // -----------------------------------------
    // 2. Calculate all 9 enneatypes by direct sum
    // -----------------------------------------
    const enneatypeScores = {
        "7": scores.A + scores.X,
        "8": scores.A + scores.Y,
        "3": scores.A + scores.Z,
        "9": scores.B + scores.X,
        "4": scores.B + scores.Y,
        "5": scores.B + scores.Z,
        "2": scores.C + scores.X,
        "6": scores.C + scores.Y,
        "1": scores.C + scores.Z,
    };

    // -----------------------------------------
    // 2.5. Apply bonus points from special questions
    // -----------------------------------------
    const specialQuestions = questions.filter((q) => q.type === "special");
    specialQuestions.forEach((sq) => {
        const answerValue = answers[sq.id];
        if (answerValue && sq.scoring && sq.scoring[answerValue]) {
            const { types, points } = sq.scoring[answerValue];
            types.forEach((type) => {
                if (enneatypeScores[type] !== undefined) {
                    enneatypeScores[type] += points;
                }
            });
        }
    });

    // -----------------------------------------
    // 3. Sort all 9 from highest to lowest
    // -----------------------------------------
    const enneatypes = Object.entries(enneatypeScores)
        .map(([type, score]) => ({
            type,
            score,
            ...getEnneagramInfo(type),
        }))
        .sort((a, b) => b.score - a.score);

    // -----------------------------------------
    // 4. Identify first and second place
    // -----------------------------------------
    let dominant = enneatypes[0] || { type: "9", score: 0, ...getEnneagramInfo("9") };
    let second = enneatypes[1] || { type: "1", score: 0, ...getEnneagramInfo("1") };

    // -----------------------------------------
    // 5. Calculate difference
    // -----------------------------------------
    let difference = (dominant.score || 0) - (second.score || 0);

    // -----------------------------------------
    // 6. Classify clarity
    // -----------------------------------------
    let clarity;
    if (difference >= 4) {
        clarity = "clear";
    } else if (difference >= 2) {
        clarity = "nuanced";
    } else if (difference === 1) {
        clarity = "low";
    } else {
        clarity = "tie";
    }

    // -----------------------------------------
    // 7. Tiebreaker rules (when D = 0)
    // -----------------------------------------
    if (clarity === "tie") {
        // Which blocks compose each tied enneatype?
        const blockMap = {
            "7": ["A", "X"], "8": ["A", "Y"], "3": ["A", "Z"],
            "9": ["B", "X"], "4": ["B", "Y"], "5": ["B", "Z"],
            "2": ["C", "X"], "6": ["C", "Y"], "1": ["C", "Z"],
        };

        try {
            const [b1a, b1b] = blockMap[dominant.type] || ["A", "X"];
            const [b2a, b2b] = blockMap[second.type] || ["B", "Y"];

            // Step 1: Compare internal block clarity
            const getBlockClarity = (blockLetter) => {
                const group1 = ["A", "B", "C"];
                const group2 = ["X", "Y", "Z"];
                const group = group1.includes(blockLetter) ? group1 : group2;
                const others = group.filter(g => g !== blockLetter);
                const diff1 = (scores[blockLetter] || 0) - (scores[others[0]] || 0);
                const diff2 = (scores[blockLetter] || 0) - (scores[others[1]] || 0);
                return diff1 + diff2;
            };

            const clarity1 = getBlockClarity(b1a) + getBlockClarity(b1b);
            const clarity2 = getBlockClarity(b2a) + getBlockClarity(b2b);

            if (clarity1 !== clarity2) {
                if (clarity2 > clarity1) {
                    [dominant, second] = [second, dominant];
                }
            } else {
                // Step 2: Compare absolute block scores
                const abs1 = (scores[b1a] || 0) + (scores[b1b] || 0);
                const abs2 = (scores[b2a] || 0) + (scores[b2b] || 0);

                if (abs1 !== abs2) {
                    if (abs2 > abs1) {
                        [dominant, second] = [second, dominant];
                    }
                }
            }
        } catch (e) {
            console.warn("Tiebreaker error:", e);
        }

        // Recalculate difference after possible swap
        difference = (dominant.score || 0) - (second.score || 0);
    }

    // -----------------------------------------
    // 8. Generate clarity text
    // -----------------------------------------
    let clarityText;
    switch (clarity) {
        case "clear":
            clarityText = `Tu estilo de liderazgo predominante es Eneatipo ${dominant.type} - ${dominant.name}.`;
            break;
        case "nuanced":
            clarityText = `Eneatipo ${dominant.type} predominante, con influencia del Eneatipo ${second.type} - ${second.name}.`;
            break;
        case "low":
            clarityText = `Eneatipo ${dominant.type} predominante, con fuerte influencia del Eneatipo ${second.type} - ${second.name}.`;
            break;
        case "tie":
            clarityText = `Tu perfil oscila entre Eneatipo ${dominant.type} - ${dominant.name} y Eneatipo ${second.type} - ${second.name}.`;
            break;
        default:
            clarityText = "";
    }

    // -----------------------------------------
    // 9. Versatile profile detection
    // -----------------------------------------
    const allScores = enneatypes.map(e => e.score || 0);
    const range = allScores.length > 0 ? (Math.max(...allScores) - Math.min(...allScores)) : 0;
    const isVersatile = range <= 6;

    // -----------------------------------------
    // RETURN
    // -----------------------------------------
    return {
        scores,
        enneatypeScores,
        enneatypes,
        dominant,
        second,
        difference,
        clarity,
        clarityText,
        isVersatile,
        enneatype: dominant.type,
        answers // Added to access raw answers in result page
    };
};

/**
 * Calculate Advanced Results
 * Focuses only on the types being tested in the advanced phase
 */
export const calculateAdvancedResults = (answers) => {
    const scores = {};

    Object.entries(answers).forEach(([questionId, answerValue]) => {
        const question = advancedQuestions.find((q) => q.id === parseInt(questionId));
        if (question) {
            const type = question.enneatype;
            if (!scores[type]) scores[type] = 0;
            scores[type] += answerValue; // Value is 1-4
        }
    });

    // Sort to find the winner among the tested types
    const results = Object.entries(scores)
        .map(([type, score]) => ({
            type,
            score,
            ...getEnneagramInfo(type)
        }))
        .sort((a, b) => b.score - a.score);

    return {
        scores,
        results,
        confirmedType: results[0] ? results[0].type : null,
        winner: results[0]
    };
};

