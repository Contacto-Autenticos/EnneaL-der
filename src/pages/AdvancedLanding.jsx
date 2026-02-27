import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Star,
    ShieldCheck,
    Zap,
    Target,
    Award,
    Lock,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Rocket,
    CreditCard,
    ChevronDown,
    HelpCircle,
    Plus,
    Minus
} from 'lucide-react';
import { getEnneagramInfo } from '../utils/calculator';
import './AdvancedLanding.css';

const AdvancedLanding = ({ result, setTestResult }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isScrolled, setIsScrolled] = useState(false);
    const [navHidden, setNavHidden] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    // Deep Linking: Recover state from URL if missing
    useEffect(() => {
        const typesParam = searchParams.get('t');
        if (typesParam && !result && setTestResult) {
            try {
                const types = typesParam.split(',').filter(t => t.length > 0);
                if (types.length >= 1) {
                    // Reconstruct a minimal result object
                    // We assign dummy descending scores to preserve the order in derived logic
                    const reconstructedScores = {};
                    types.forEach((t, i) => {
                        reconstructedScores[t] = 100 - i;
                    });

                    const reconstructedResult = {
                        enneatypeScores: reconstructedScores,
                        enneatypes: types.map(t => ({ type: t, score: 100 })),
                        enneatype: types[0]
                    };

                    setTestResult(reconstructedResult);
                    // Also save to localStorage to maintain session consistency
                    localStorage.setItem('enneagramResult', JSON.stringify(reconstructedResult));
                    console.log('State reconstructed from URL:', types);
                }
            } catch (e) {
                console.error('Error reconstructing state from URL:', e);
            }
        }
    }, [searchParams, result, setTestResult]);

    // Isolation and Reset Logic
    useEffect(() => {
        // Save original styles
        const originalBG = document.body.style.backgroundImage;
        const originalColor = document.body.style.color;
        const originalMargin = document.body.style.margin;
        const originalOverflow = document.body.style.overflow;

        // Apply isolation resets
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = '#002d44';
        document.body.style.color = '#ffffff';
        document.body.style.margin = '0';
        document.body.style.padding = '0';

        return () => {
            // Restore original styles
            document.body.style.backgroundImage = originalBG;
            document.body.style.color = originalColor;
            document.body.style.margin = originalMargin;
            document.body.style.overflow = originalOverflow;
        };
    }, []);


    const top3 = React.useMemo(() => {
        const currentResult = result;
        if (!currentResult || !currentResult.enneatypeScores) return [];
        const validTypes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        return Object.entries(currentResult.enneatypeScores)
            .filter(([type]) => validTypes.includes(type))
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([type, score], index) => {
                let affinity = "Media";
                if (index === 0) affinity = "Muy Alta";
                else if (index === 1) affinity = "Alta";
                else if (index === 2) affinity = "Media";
                const info = getEnneagramInfo(type) || { name: "Indeterminado" };
                return { type, affinity, title: info.name };
            });
    }, [result]);

    const faqs = [
        {
            q: "¿Vale la pena si ya vi mis resultados?",
            a: "Sí. El resultado básico identifica tu tendencia. El informe avanzado explica cómo funciona en profundidad y cómo aplicarlo estratégicamente."
        },
        {
            q: "¿Es realmente personalizado?",
            a: "Sí. El análisis se genera según tu combinación específica de eneatipos y niveles de intensidad."
        },
        {
            q: "¿Es muy técnico?",
            a: "No. Está diseñado para ser claro, directo y aplicable."
        },
        {
            q: "¿Cuánto tiempo tengo acceso?",
            a: "Acceso inmediato y sin límite de tiempo."
        }
    ];

    useEffect(() => {
        let lastScrollY = window.scrollY;
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsScrolled(currentScrollY > 20);
            // Hide nav when scrolling down, show when scrolling up
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                setNavHidden(true);
            } else {
                setNavHidden(false);
            }
            lastScrollY = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div id="inicio" className="advanced-landing-container">
            {/* Background Layer */}
            <div className="al-bg-glow"></div>

            {/* 1. Header Navigation */}
            <nav className={`al-nav ${isScrolled ? 'scrolled' : ''} ${navHidden ? 'nav-hidden' : ''}`}>
                <div className="al-nav-content">
                    <div className="al-logo-wrapper">
                        <img src="/Logo-Blanco.png" alt="Auténticos Logo" className="al-logo" />
                    </div>

                    <div className="al-nav-links">
                        <span onClick={() => navigate('/result')} className="al-nav-back-arrow" title="Volver al resultado">
                            <ArrowLeft size={16} />
                        </span>
                        <a href="#inicio" className="al-nav-link">Inicio</a>
                        <a href="#analisis-avanzado" className="al-nav-link">Análisis Avanzado</a>
                        <a href="#preguntas" className="al-nav-link">Preguntas</a>
                        <a href="#precios" className="al-nav-link">Inversión</a>
                    </div>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <section className="al-hero al-animate">
                <div className="al-tag">
                    <Rocket size={14} /> El Siguiente Nivel de Liderazgo
                </div>

                <h1 className="al-hero-title">
                    Ya conoces tu resultado <br />
                    <span className="al-gold-text">Ahora descifra el código</span>
                </h1>

                <p className="al-hero-subtitle">
                    Tu perfil no es un número, una etiqueta y mucho menos un defecto. Es un patrón de comportamiento. <br /><br />
                    Un mecanismo interno que influye en cómo decides, lideras y reaccionas bajo presión. <br /><br />
                    El test te mostró la estructura que lo describe. El <strong>informe avanzado</strong> revela la arquitectura interna que lo sostiene.
                </p>

                <div className="al-hero-actions">
                    <button onClick={() => navigate('/payment')} className="al-btn-main">
                        QUIERO MI ANÁLISIS AVANZADO
                        <ArrowRight size={22} />
                    </button>

                    <div className="al-social-proof-small">
                        <div className="al-author-role" style={{ marginTop: '20px', color: 'rgba(255,255,255,0.3)' }}>
                            Acceso inmediato. Análisis profundo. Aplicación práctica.
                        </div>
                    </div>
                </div>

                <div className="al-scroll-indicator">
                    <ChevronDown size={24} />
                </div>
            </section>

            {/* 2.5 Result Recap & Deep Questions */}
            <section className="al-result-recap al-animate">
                <div className="al-section-content">
                    <div className="al-recap-header">
                        <h2 className="al-recap-title">Este fue tu resultado</h2>
                        <div className="al-recap-grid">
                            {top3.length > 0 ? top3.map((item, i) => (
                                <div key={i} className="al-recap-item">
                                    <span className="al-recap-label">Eneatipo con Afinidad {item.affinity}:</span>
                                    <span className="al-recap-value">Tipo {item.type} — {item.title}</span>
                                </div>
                            )) : (
                                <div className="al-recap-item">
                                    <span className="al-recap-label">Cargando resultados...</span>
                                </div>
                            )}
                        </div>
                        <p className="al-recap-intro">Esto explica parte de tu comportamiento.</p>
                    </div>

                    <div className="al-deep-questions">
                        <h3 className="al-deep-title">Pero aún no responde:</h3>
                        <div className="al-questions-list">
                            {[
                                "¿Cuál es tu miedo raíz inconsciente?",
                                "¿Por qué reaccionas con intensidad bajo presión?",
                                "¿Cuál es tu mecanismo automático de defensa?",
                                "¿Cómo te saboteas sin darte cuenta?",
                                "¿Qué activa tu versión más equilibrada y estratégica?"
                            ].map((q, i) => (
                                <div key={i} className="al-question-item">
                                    <HelpCircle size={18} className="al-question-icon" />
                                    <p>{q}</p>
                                </div>
                            ))}
                        </div>
                        <p className="al-deep-footer">Ahí es donde comienza el verdadero trabajo.</p>
                    </div>
                </div>
            </section>

            {/* 4. Información del Producto */}
            <section id="analisis-avanzado" className="al-section">
                <div className="al-section-content">
                    <h2 className="al-section-title" style={{ textAlign: 'center', marginBottom: '80px', maxWidth: '900px', margin: '0 auto 80px' }}>
                        EL TEST BÁSICO IDENTIFICA <br />
                        <span className="al-gold-text">EL ANÁLISIS AVANZADO INTERPRETA</span>
                    </h2>

                    <div className="al-product-flex">
                        <div className="al-product-text al-animate">
                            <h3 className="al-product-subtitle" style={{ fontSize: '28px', fontWeight: '800', marginBottom: '40px', lineHeight: '1.2', color: '#ffffff' }}>
                                No es más teoría. <br />
                                <span className="al-gold-text">Es interpretación profunda aplicada a tu perfil específico.</span>
                            </h3>

                            <ul className="al-product-list">
                                {[
                                    { t: "Tu motivación inconsciente central", d: "Lo que realmente impulsa tus decisiones… incluso cuando no lo notas." },
                                    { t: "Tu patrón bajo estrés", d: "Cómo reaccionas cuando pierdes control y qué impacto tiene en tus relaciones y liderazgo." },
                                    { t: "Tu mecanismo de defensa automático", d: "La estrategia interna que usas para protegerte… y que muchas veces limita tu crecimiento." },

                                    { t: "Tu ruta de equilibrio", d: "Acciones prácticas y concretas para fortalecer tu liderazgo y reducir desgaste emocional." }
                                ].map((item, i) => (
                                    <li key={i} className="al-product-item">
                                        <div className="al-item-bullet">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <h4 className="al-item-title" style={{ textTransform: 'uppercase' }}>{item.t}</h4>
                                            {item.d && <p className="al-item-desc">{item.d}</p>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="al-product-img-container al-animate" style={{ animationDelay: '0.4s' }}>
                            <div className="al-img-glow"></div>
                            <img src="/Portada-Analisis Avanzado-2.png" alt="Análisis Avanzado" className="al-product-img" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 4.5 Impacto del Patrón */}
            <section className="al-impact-section al-animate">
                <div className="al-section-content">
                    <div className="al-impact-card">
                        <div className="al-impact-glow"></div>
                        <h2 className="al-impact-title">Cuando entiendes tu patrón, <br /><span className="al-gold-text">cambia esto:</span></h2>

                        <div className="al-impact-grid">
                            {[
                                "Tomas decisiones con mayor claridad",
                                "Reduces reacciones impulsivas",
                                "Actúas con intención, no por impulso",
                                "Comprendes conflictos repetitivos",
                                "Lideras con mayor estabilidad",
                                "Dejas de sabotear oportunidades"
                            ].map((item, i) => (
                                <div key={i} className="al-impact-item">
                                    <CheckCircle2 className="al-impact-check" size={20} />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="al-impact-footer">
                            <p>La diferencia no es información.</p>
                            <p className="al-gold-text">Es conciencia aplicada.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4.6 Puente de Conciencia */}
            <section className="al-bridge-section al-animate">
                <div className="al-section-content">
                    <div className="al-bridge-container">
                        <h2 className="al-section-title">No te quedes a <br /><span className="al-gold-text">mitad del camino</span></h2>

                        <div className="al-bridge-content">
                            <div className="al-bridge-box">
                                <p className="al-bridge-text">El test gratuito te mostró una <span className="al-white-text">puerta</span>.</p>
                                <p className="al-bridge-text highlight">El Informe Avanzado te muestra el <span className="al-gold-text">mapa completo</span>.</p>
                            </div>

                            <div className="al-bridge-divider"></div>

                            <div className="al-bridge-box">
                                <p className="al-bridge-text">Muchos usuarios creen que ya entendieron su perfil…</p>
                                <p className="al-bridge-text highlight">hasta que descubren su <span className="al-gold-text">patrón bajo presión</span>.</p>
                            </div>

                            <div className="al-bridge-final">
                                <p>Y ahí es donde <span className="al-gold-text">todo cobra sentido</span>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5.5 FAQ Section */}
            <section id="preguntas" className="al-faq-section al-animate">
                <div className="al-section-content">
                    <h2 className="al-section-title" style={{ textAlign: 'center', marginBottom: '60px' }}>Preguntas <span className="al-gold-text">frecuentes</span></h2>

                    <div className="al-faq-container">
                        {faqs.map((faq, i) => (
                            <div key={i} className={`al-faq-item ${openFaq === i ? 'active' : ''}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                <div className="al-faq-question">
                                    <span>{faq.q}</span>
                                    {openFaq === i ? <Minus size={20} /> : <Plus size={20} />}
                                </div>
                                <div className="al-faq-answer">
                                    <p>{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. Precios */}
            <section id="precios" className="al-section">
                <div className="al-section-content">
                    <div className="al-pricing-wrapper al-animate">
                        <div className="al-pricing-card">
                            <div className="al-pricing-glow"></div>
                            <div className="al-pricing-header">
                                <h3>Oferta de Lanzamiento</h3>
                            </div>

                            <div className="al-pricing-content">
                                <div className="al-price-box">
                                    <span className="al-old-price">$150.000 COP</span>
                                    <div className="al-current-price">
                                        $75.000 <span className="al-currency">COP</span>
                                    </div>
                                </div>

                                <div className="al-pricing-grid">
                                    {[
                                        'Detalles de tu personalidad',
                                        'Reconoce tus miedos y deseos',
                                        'Dinámicas de crecimiento',
                                        'Formas de tomar decisiones',
                                        'Entiende cómo actúas bajo presión',
                                        'Consejos para aprovechar tu tipo',
                                        'Pasiones y virtudes',
                                        'Y mucho más…'
                                    ].map((item, i) => (
                                        <div key={i} className="al-pricing-item">
                                            <CheckCircle2 size={16} /> {item}
                                        </div>
                                    ))}
                                </div>

                                <button onClick={() => navigate('/payment')} className="al-btn-buy">
                                    Acceder al Análisis <CreditCard size={24} />
                                </button>

                                <p className="al-footer-desc" style={{ color: 'rgba(255,255,255,0.3)', marginTop: '0' }}>
                                    Enlace de descarga instantáneo • Pago seguro vía Wompi
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7.5 Final Closure CTA */}
            <section className="al-closure-section al-animate">
                <div className="al-section-content">
                    <div className="al-closure-container">
                        <h2 className="al-closure-title">
                            <span className="al-white-text">Lo que no comprendes de ti,</span> <span className="al-gold-text">te controla.</span><br />
                            <span className="al-white-text">Lo que comprendes,</span> <span className="al-gold-text">lo puedes dirigir.</span>
                        </h2>

                        <div className="al-closure-text">
                            <p>Ya diste el primer paso.</p>
                            <p>Ahora decide si quieres profundidad… o solo una idea superficial.</p>
                        </div>

                        <button onClick={() => navigate('/payment')} className="al-btn-shimmer">
                            <span className="al-btn-label">
                                ACCEDER AHORA A <br className="al-mobile-br" /> MI ANÁLISIS AVANZADO
                            </span>
                            <ArrowRight size={24} className="al-btn-icon" />
                        </button>
                    </div>
                </div>
            </section>


            {/* Mobile FAB */}
            <div className="al-mobile-fab">
                <button onClick={() => navigate('/payment')} className="al-btn-fab">
                    Desbloquear Análisis Ahora
                </button>
            </div>
        </div>
    );
};

export default AdvancedLanding;
