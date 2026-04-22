import { fascinantesQuestions, fascinantesDomains, fascinantesInterpretations } from '../data/fascinantesData';

export const DOMAIN_STYLES = {
    corporal: { color: '#cc0000', class: 'neon-corporal' },
    mental: { color: '#ff9100', class: 'neon-mental' },
    emocional: { color: '#DDBE3D', class: 'neon-emocional' },
    social: { color: '#00ff00', class: 'neon-social' },
    espiritual: { color: '#00e5ff', class: 'neon-espiritual' },
    financiero: { color: '#d500f9', class: 'neon-financiero' }
};

export const calculateDomainScores = (answers) => {
    return fascinantesDomains.map(domain => {
        const domainQuestions = fascinantesQuestions.filter(q => q.domain === domain.id);
        const totalScore = domainQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
        
        const interpretation = fascinantesInterpretations.find(interp => 
            totalScore >= interp.range[0] && totalScore <= interp.range[1]
        ) || fascinantesInterpretations[0];

        return {
            id: domain.id,
            domain: domain.name,
            score: totalScore,
            interpretation: interpretation.name,
            definition: interpretation.definition,
            full: 70,
            style: DOMAIN_STYLES[domain.id] || { color: '#ddbe3d', class: '' }
        };
    });
};

export const getExpertAnalysis = (scores) => {
    if (!scores || scores.length === 0) return null;

    const vals = scores.map(s => s.score);
    const promedio = vals.reduce((a, b) => a + b, 0) / vals.length;
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const diferencia = max - min;
    const lowestDomain = scores.find(s => s.score === min)?.domain.replace('Dominio ', '') || '';

    let profileKey = "";
    
    if (promedio < 35) {
        profileKey = "POTENCIAL_DORMIDO";
    } else if (diferencia > 14) {
        profileKey = "ESTRATEGA_BLOQUEADO";
    } else if (promedio > 49) {
        profileKey = "OPTIMIZADOR";
    } else if (diferencia <= 7) {
        profileKey = "EQUILIBRADOR";
    } else {
        profileKey = "CONSTANTE_SIN_DIRECCION";
    }

    const profiles = {
        POTENCIAL_DORMIDO: {
            name: "Energía en Reconstrucción",
            insight: "No es falta de capacidad, es un momento de reconstrucción de bases. Actualmente tu energía no está disponible en su máximo nivel.",
            critical: `Tu puntuación en el dominio ${lowestDomain} indica una fuga de energía significativa que afecta tu capacidad de respuesta global.`,
            explanation: "Este perfil describe un momento de pausa necesaria. Estás ajustando tus cimientos antes de poder proyectarte con fuerza hacia tus mayores ambiciones.",
            recommendations: [
                `Priorizar la recuperación de energía en el dominio ${lowestDomain}.`,
                "Establecer una rutina mínima viable de 15 minutos diarios.",
                "Eliminar un compromiso que te reste paz mental hoy mismo."
            ],
            bridge: "Ya identificamos exactamente qué está frenando tu crecimiento. El siguiente paso es trabajar un plan estructurado y personalizado para corregirlo."
        },
        ESTRATEGA_BLOQUEADO: {
            name: "Desbalance en Expansión",
            insight: "Refleja que hay crecimiento, pero no de forma integrada. Una parte de tu vida avanza mientras otra requiere atención inmediata.",
            critical: `El desbalance en el dominio ${lowestDomain} crea una fricción invisible: mientras más creces en tus fortalezas, más se siente el peso de esta desconexión.`,
            explanation: "Tienes la intención y la mentalidad de expansión, pero el ecosistema vital no está sincronizado. Es momento de unificar el ritmo de tus avances.",
            recommendations: [
                "Delegar o sistematizar tareas en tus dominios más fuertes.",
                `Realizar una "auditoría de fugas" en el dominio ${lowestDomain}.`,
                "Integrar una pausa activa obligatoria para evaluar prioridades."
            ],
            bridge: "Tu éxito actual es solo una fracción de lo que podrías lograr. Vamos a liberar el ancla con un plan de acción equilibrado."
        },
        OPTIMIZADOR: {
            name: "Alto Nivel en Evolución",
            insight: "Ya posees bases sólidas y una estructura coherente. Ahora entras en una etapa de refinamiento y mejora consciente de alto impacto.",
            critical: `Incluso en este nivel de solidez, el dominio ${lowestDomain} es el punto de ajuste fino que te separa de tu siguiente salto evolutivo.`,
            explanation: "Has construido una vida armónica y funcional. Tu patrón indica que estás listo para pasar de la eficiencia a la maestría total.",
            recommendations: [
                `Identificar el 1% de mejora incremental en el dominio ${lowestDomain}.`,
                "Buscar un mentor o entorno que desafíe tus estándares actuales.",
                "Documentar tus procesos para liberar espacio mental creativo."
            ],
            bridge: "Los resultados de elite requieren planes de elite. Vamos a diseñar esos ajustes milimétricos que te llevarán al siguiente nivel."
        },
        EQUILIBRADOR: {
            name: "Estabilidad Consciente",
            insight: "Reconoce una base armónica y equilibrada. Tienes la estabilidad necesaria para decidir conscientemente hacia dónde deseas expandirte.",
            critical: `Tu punto más bajo en ${lowestDomain} no es crítico, pero en un entorno de paz, es fácil ignorarlo hasta que se convierte en una limitación.`,
            explanation: "El patrón muestra una gestión saludable de tu energía. El reto ahora es elegir un propósito mayor que rompa la inercia de la estabilidad.",
            recommendations: [
                "Inyectar una meta ambiciosa y desafiante en tu dominio más fuerte.",
                `Fortalecer proactivamente el dominio ${lowestDomain} antes de que surja una crisis.`,
                "Explorar nuevas disciplinas fuera de tu zona de confort actual."
            ],
            bridge: "Tienes el barco estable y el mar en calma. Ahora es el momento de desplegar las velas hacia un destino más ambicioso."
        },
        CONSTANTE_SIN_DIRECCION: {
            name: "Movimiento en Búsqueda",
            insight: "Valoras la acción y el esfuerzo constante, pero tu patrón muestra que aún falta un eje claro que le dé dirección y propósito a todo ese movimiento.",
            critical: `El dominio ${lowestDomain} está absorbiendo recursos que, si se canalizaran correctamente, darían sentido y dirección a tus esfuerzos.`,
            explanation: "Eres una persona de acción, pero tu energía está dispersa en múltiples frentes. Necesitas unificar tu visión para que cada paso cuente.",
            recommendations: [
                "Definir una \"Prioridad Maestra\" para los próximos 90 días.",
                "Limitar tus frentes de batalla: enfócate solo en 2 dominios clave.",
                `Establecer indicadores claros de éxito para el dominio ${lowestDomain}.`
            ],
            bridge: "No es falta de esfuerzo, es falta de estrategia. Vamos a canalizar toda esa energía en un plan de acción con una sola dirección: arriba."
        }
    };

    return {
        ...profiles[profileKey],
        promedio: Math.round(promedio),
        diferencia: Math.round(diferencia),
        nivel: promedio < 35 ? "BAJO" : (promedio <= 49 ? "MEDIO" : "ALTO"),
        balance: diferencia <= 7 ? "EQUILIBRADO" : (diferencia <= 14 ? "MODERADO" : "DESEQUILIBRADO")
    };
};
