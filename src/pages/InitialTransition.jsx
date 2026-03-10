import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles,
    Target,
    Zap,
    Search,
    ArrowRight,
    CheckCircle2
} from 'lucide-react';
import './InitialTransition.css';

const InitialTransition = ({ result }) => {
    const navigate = useNavigate();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Get Top 3 Enneatypes from result
    const top3 = useMemo(() => {
        if (!result || !result.enneatypeScores) return [];
        return Object.entries(result.enneatypeScores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([type]) => type);
    }, [result]);

    // Dynamic patterns database (Expert-generated traits)
    const patternsData = {
        '1': 'Buscas la excelencia y tienes un fuerte sentido del deber en todo lo que haces.',
        '2': 'Priorizas las necesidades de los demás y te esfuerzas por crear conexiones significativas.',
        '3': 'Te enfocas en objetivos claros y buscas destacar por tu eficiencia y resultados.',
        '4': 'Valoras la autenticidad y buscas expresar tu identidad única de forma profunda.',
        '5': 'Analizas cada situación con detenimiento y valoras la autonomía y el conocimiento.',
        '6': 'Eres previsor, leal y valoras la seguridad y la claridad en tus entornos.',
        '7': 'Buscas nuevas experiencias y mantienes una perspectiva optimista y ágil ante la vida.',
        '8': 'Proteges tu independencia y ejerces un liderazgo directo y protector.',
        '9': 'Buscas la armonía y tienes una gran capacidad para mediar y entender otros puntos de vista.'
    };

    // Composite traits (expert-blended combinations)
    const getCompositeTraits = (types) => {
        const traits = [];

        // Strategy: 1 direct trait for each of the top 3, plus 1 blended trait
        types.forEach(type => {
            if (patternsData[type]) traits.push(patternsData[type]);
        });

        // Blended traits based on triads or specific pairs
        const blendedOptions = [
            "Combinas una gran capacidad de servicio con un enfoque riguroso en la calidad.",
            "Equilibras la intuición emocional con un análisis lógico de las situaciones.",
            "Mantienes un alto nivel de responsabilidad mientras buscas soluciones creativas.",
            "Tomas decisiones basadas en la lealtad a tus valores y el impacto en los demás."
        ];

        // Ensure we have 4 traits
        while (traits.length < 4) {
            const randomTrait = blendedOptions[Math.floor(Math.random() * blendedOptions.length)];
            if (!traits.includes(randomTrait)) traits.push(randomTrait);
        }

        return traits.slice(0, 4);
    };

    const displayPatterns = useMemo(() => getCompositeTraits(top3), [top3]);

    return (
        <div className="it-container">
            <div className="it-bg-glow"></div>

            <div className="it-content">
                {/* Section 1: Something interesting */}
                <header className="it-header">
                    <h1 className="it-title">
                        Algo interesante <span className="it-title-gold">aparece en tus respuestas</span>
                    </h1>
                    <p className="it-intro-text">
                        Al analizar tus respuestas encontramos patrones que suelen aparecer en personas que:
                    </p>
                </header>

                <div className="it-patterns-card">
                    <ul className="it-patterns-list">
                        {displayPatterns.map((pattern, index) => (
                            <li key={index} className="it-pattern-item" style={{ animationDelay: `${index * 0.1}s` }}>
                                <Sparkles size={20} className="it-pattern-icon" />
                                <p className="it-pattern-text">{pattern}</p>
                            </li>
                        ))}
                    </ul>

                    <div className="it-patterns-footer">
                        <p>Estos rasgos pueden aparecer en más de un eneatipo, aunque cada uno los experimenta por motivaciones internas diferentes.</p>
                        <p>Por eso tu resultado muestra varios perfiles cercanos.</p>
                    </div>
                </div>

                {/* Section 2: Beyond the first step */}
                <div className="it-cta-section">
                    <h2 className="it-cta-title">Tu resultado inicial es solo el primer paso</h2>

                    <div className="it-benefits-list">
                        {[
                            "Qué motiva realmente tus decisiones",
                            "Cómo reaccionas ante el estrés",
                            "Qué activa tus patrones automáticos",
                            "Cuál es tu camino natural de crecimiento"
                        ].map((benefit, i) => (
                            <div key={i} className="it-benefit-item">
                                <div className="it-benefit-dot"></div>
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>

                    <p className="it-intro-text" style={{ marginBottom: '40px' }}>
                        Para identificar estos elementos se necesita una evaluación más detallada.
                    </p>

                    <button
                        className="it-btn-main"
                        onClick={() => navigate('/advanced-landing')}
                    >
                        <span>Descubrir mi análisis completo</span>
                        <ArrowRight size={22} />
                    </button>

                    <div className="it-footer-logo">
                        <img src="/Logo-Blanco.png" alt="Auténticos" style={{ maxWidth: '195px', opacity: 1 }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InitialTransition;
