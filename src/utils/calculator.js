import { questions, options } from "../data/questions.js";

/**
 * Enneagram Info Map
 */
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
};

/**
 * Main calculation function — Direct Sum System
 */
export const calculateResults = (answers) => {
    // ──────────────────────────────────────────
    // 1. Calculate block totals (A, B, C, X, Y, Z)
    // ──────────────────────────────────────────
    const scores = { A: 0, B: 0, C: 0, X: 0, Y: 0, Z: 0 };

    Object.entries(answers).forEach(([questionId, answerValue]) => {
        const question = questions.find((q) => q.id === parseInt(questionId));
        const option = options.find((o) => o.value === answerValue);

        if (question && option) {
            scores[question.type] += option.points;
        }
    });

    // ──────────────────────────────────────────
    // 2. Calculate all 9 enneatypes by direct sum
    // ──────────────────────────────────────────
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

    // ──────────────────────────────────────────
    // 3. Sort all 9 from highest to lowest
    // ──────────────────────────────────────────
    const enneatypes = Object.entries(enneatypeScores)
        .map(([type, score]) => ({
            type,
            score,
            ...getEnneagramInfo(type),
        }))
        .sort((a, b) => b.score - a.score);

    // ──────────────────────────────────────────
    // 4. Identify first and second place
    // ──────────────────────────────────────────
    let dominant = enneatypes[0];
    let second = enneatypes[1];

    // ──────────────────────────────────────────
    // 5. Calculate difference
    // ──────────────────────────────────────────
    let difference = dominant.score - second.score;

    // ──────────────────────────────────────────
    // 6. Classify clarity
    // ──────────────────────────────────────────
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

    // ──────────────────────────────────────────
    // 7. Tiebreaker rules (when D = 0)
    // ──────────────────────────────────────────
    if (clarity === "tie") {
        // Which blocks compose each tied enneatype?
        const blockMap = {
            "7": ["A", "X"], "8": ["A", "Y"], "3": ["A", "Z"],
            "9": ["B", "X"], "4": ["B", "Y"], "5": ["B", "Z"],
            "2": ["C", "X"], "6": ["C", "Y"], "1": ["C", "Z"],
        };

        const [b1a, b1b] = blockMap[dominant.type];
        const [b2a, b2b] = blockMap[second.type];

        // Step 1: Compare internal block clarity
        // For each tied enneatype, find its blocks and see how "clear" they are
        // by comparing against the third option in the same group
        const getBlockClarity = (blockLetter) => {
            const group1 = ["A", "B", "C"];
            const group2 = ["X", "Y", "Z"];
            const group = group1.includes(blockLetter) ? group1 : group2;
            const others = group.filter(g => g !== blockLetter);
            // Clarity = how much this block stands out from the others
            const diff1 = scores[blockLetter] - scores[others[0]];
            const diff2 = scores[blockLetter] - scores[others[1]];
            return diff1 + diff2;
        };

        const clarity1 = getBlockClarity(b1a) + getBlockClarity(b1b);
        const clarity2 = getBlockClarity(b2a) + getBlockClarity(b2b);

        if (clarity1 !== clarity2) {
            // The enneatype with clearer blocks wins
            if (clarity2 > clarity1) {
                // Swap dominant and second
                [dominant, second] = [second, dominant];
            }
            // clarity stays "tie" but we have a preferred order
        } else {
            // Step 2: Compare absolute block scores
            const abs1 = scores[b1a] + scores[b1b];
            const abs2 = scores[b2a] + scores[b2b];

            if (abs1 !== abs2) {
                if (abs2 > abs1) {
                    [dominant, second] = [second, dominant];
                }
            }
            // Step 3: If still tied, show both (clarity remains "tie")
        }

        // Recalculate difference after possible swap
        difference = dominant.score - second.score;
    }

    // ──────────────────────────────────────────
    // 8. Generate clarity text
    // ──────────────────────────────────────────
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

    // ──────────────────────────────────────────
    // 9. Versatile profile detection
    // ──────────────────────────────────────────
    const allScores = enneatypes.map(e => e.score);
    const range = Math.max(...allScores) - Math.min(...allScores);
    const isVersatile = range <= 6;

    // ──────────────────────────────────────────
    // RETURN
    // ──────────────────────────────────────────
    return {
        scores,
        enneatypes,
        dominant,
        second,
        difference,
        clarity,
        clarityText,
        isVersatile,
        // Backward compatibility
        enneatype: dominant.type,
    };
};
