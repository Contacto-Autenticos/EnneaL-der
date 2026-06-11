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
    Minus,
    Sparkles,
    PlayCircle,
    Pause,
    UserPlus,
    Mail,
    Globe,
    Instagram,
    Facebook,
    Youtube,
    Linkedin
} from 'lucide-react';
import { getEnneagramInfo } from '../utils/calculator';
import EneagramaBook3D from '../components/EneagramaBook3D';
import './AdvancedLanding.css';

// Dynamic patterns database (Expert-generated traits)
const patternsData = {
    '1': 'Buscan la excelencia y tienen un fuerte sentido del deber en todo lo que hacen.',
    '2': 'Priorizan las necesidades de los demás y se esfuerzan por crear conexiones significativas.',
    '3': 'Se enfocan en objetivos claros y buscan destacar por su eficiencia y resultados.',
    '4': 'Valoran la autenticidad y buscan expresar su identidad única de forma profunda.',
    '5': 'Analizan cada situación con detenimiento y valoran la autonomía y el conocimiento.',
    '6': 'Son previsores, leales y valoran la seguridad y la claridad en sus entornos.',
    '7': 'Buscan nuevas experiencias y mantienen una perspectiva optimista y ágil ante la vida.',
    '8': 'Protegen su independencia y ejercen un liderazgo directo y protector.',
    '9': 'Buscan la armonía y tienen una gran capacidad para mediar y entender otros puntos de vista.'
};

// Composite traits (expert-blended combinations)
const getCompositeTraits = (types) => {
    const traits = [];
    if (Array.isArray(types)) {
        types.forEach(type => {
            if (patternsData[type]) traits.push(patternsData[type]);
        });
    }
    const blendedOptions = [
        "Combinan una gran capacidad de servicio con un enfoque riguroso en la calidad.",
        "Equilibran la intuición emocional con un análisis lógico de las situaciones.",
        "Mantienen un alto nivel de responsabilidad mientras buscan soluciones creativas.",
        "Toman decisiones basadas en la lealtad a tus valores y el impacto en los demás."
    ];
    for (let i = 0; i < blendedOptions.length && traits.length < 4; i++) {
        const option = blendedOptions[i];
        if (!traits.includes(option)) {
            traits.push(option);
        }
    }
    return traits.slice(0, 4);
};

const AdvancedLanding = ({ result, setTestResult }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isScrolled, setIsScrolled] = useState(false);
    const [navHidden, setNavHidden] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const testimonials = [
        { 
            text: "Siempre me enfoqué en el éxito y los resultados, pero sentía un vacío constante. El reporte avanzado me mostró cómo mi Eneatipo 3 opera bajo presión y cómo mi ala 4 me ayuda a conectar con mi verdadera autenticidad. Fue revelador.",
            author: "Sofía Valenzuela (Eneatipo 3)",
            stars: 5
        },
        { 
            text: "Creía que mi nivel de autoexigencia era simplemente 'ser responsable'. El análisis avanzado me ayudó a ver el código invisible de mi Eneatipo 1 y me dio herramientas prácticas para soltar el control y liderar desde la serenidad.",
            author: "Alejandro Gómez (Eneatipo 1)",
            stars: 5
        },
        { 
            text: "Hacer el test gratuito me dio curiosidad, pero el informe avanzado fue a otro nivel. Descubrir mis dinámicas de estrés del Eneatipo 6 bajo presión y cómo trabajar mi integración al 9 ha cambiado mi forma de tomar decisiones.",
            author: "Valeria Rojas (Eneatipo 6)",
            stars: 5
        },
        { 
            text: "Como Eneatipo 5, tiendo a sobreanalizar todo y aislarme. Este análisis no me dio descripciones genéricas; me entregó un mapa exacto de mi energía mental y cómo conectar con la acción sin sentirme agotado.",
            author: "Daniel Castro (Eneatipo 5)",
            stars: 5
        },
        { 
            text: "Siempre ponía las necesidades de todos por encima de las mías. Ver la radiografía de mi Eneatipo 2 en el reporte avanzado me permitió entender el origen de mi cansancio extremo y aprender a poner límites sanos.",
            author: "Natalia Herrera (Eneatipo 2)",
            stars: 5
        },
        { 
            text: "Pensaba que mi estilo de liderazgo fuerte era la única forma de protegerme. El reporte me confrontó de manera muy honesta pero constructiva, enseñándome a integrar mi vulnerabilidad como Eneatipo 8.",
            author: "Ricardo Espinoza (Eneatipo 8)",
            stars: 5
        },
        { 
            text: "Evitaba el conflicto a toda costa para mantener la paz laboral, hasta que el reporte avanzado del Eneagrama me mostró cómo ese silencio me estaba apagando. Ahora sé cómo expresar mi verdad sin miedo.",
            author: "Camila Ortega (Eneatipo 9)",
            stars: 5
        }
    ];

    // Carousel Logic
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                handleNext();
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, testimonialIndex]);

    const handlePrev = () => {
        setIsPlaying(false);
        if (testimonialIndex === 0) {
            setTransitionEnabled(false);
            setTestimonialIndex(testimonials.length);
            setTimeout(() => {
                setTransitionEnabled(true);
                setTestimonialIndex(testimonials.length - 1);
            }, 20);
        } else {
            setTransitionEnabled(true);
            setTestimonialIndex((prev) => prev - 1);
        }
    };

    const handleNext = (isManual = false) => {
        if (isManual) setIsPlaying(false);

        if (testimonialIndex === testimonials.length) {
            setTransitionEnabled(false);
            setTestimonialIndex(0);
            setTimeout(() => {
                setTransitionEnabled(true);
                setTestimonialIndex(1);
            }, 20);
        } else if (testimonialIndex === testimonials.length - 1) {
            setTestimonialIndex(testimonials.length);
            setTimeout(() => {
                setTransitionEnabled(false);
                setTestimonialIndex(0);
                setTimeout(() => setTransitionEnabled(true), 20);
            }, isPlaying ? 5000 : 600);
        } else {
            setTransitionEnabled(true);
            setTestimonialIndex((prev) => prev + 1);
        }
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

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

    // Isolation and Reset Logic — use CSS class instead of inline styles
    useEffect(() => {
        document.body.classList.add('advanced-landing-active');
        // Enforce scroll to top instantly
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        
        return () => {
            document.body.classList.remove('advanced-landing-active');
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

    const displayPatterns = React.useMemo(() => {
        const types = top3.map(t => t.type);
        return getCompositeTraits(types);
    }, [top3]);

    const faqs = [
        {
            q: "¿Vale la pena si ya vi mis resultados?",
            a: "Sí. El resultado básico identifica tu tendencia. El informe avanzado explica cómo funciona en profundidad y cómo aplicarlo estratégicamente."
        },
        {
            q: "¿Es realmente personalizado?",
            a: "Absolutamente. Cada informe se genera a partir de tus respuestas. Mientras más honesto seas, más preciso y revelador será tu análisis. No estás recibiendo información estándar. Estás accediendo a tu propia arquitectura interna."
        },
        {
            q: "¿Es muy técnico?",
            a: "No. Está diseñado para ser claro, directo y aplicable."
        },
        {
            q: "¿En cuánto tiempo tengo acceso?",
            a: "Acceso inmediato y sin límite de tiempo."
        },
        {
            q: "¿Mi información es confidencial?",
            a: "Sí. Tu información es completamente confidencial. Tus respuestas no se comparten, no se publican y no se utilizan para ningún fin distinto a la generación de tu informe. Este proceso es personal. Y así se trata."
        },
        {
            q: "¿Qué métodos de pago están disponibles?",
            a: "Aceptamos tarjetas de crédito (Visa, Mastercard, Amex), PSE, y todos los medios de pago seguros y autorizados a través de la pasarela Wompi."
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
                        <span onClick={() => navigate('/eneagrama-result')} className="al-nav-back-arrow" title="Volver al resultado">
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
                <div className="al-hero-content-wrapper">
                    <div className="al-hero-text-col">
                        <div className="al-tag">
                            <Rocket size={14} /> El Siguiente Nivel de Liderazgo
                        </div>

                        <h1 className="al-hero-title">
                            <span className="al-hero-title-top">Ya conoces tu resultado</span>
                            <span className="al-gold-text">Ahora descifra el código</span>
                        </h1>

                        <p className="al-hero-subtitle">
                            El test basico te mostró la estructura que lo describe. <br />
                            <strong>El informe avanzado revela la arquitectura interna que lo sostiene.</strong>
                        </p>

                        <div className="al-hero-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                            <button onClick={() => navigate('/eneagrama-payment')} className="al-btn-main">
                                QUIERO MI ANÁLISIS AVANZADO
                                <ArrowRight size={22} />
                            </button>

                            <div className="al-author-role" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', fontWeight: '400' }}>
                                Entender el código es solo información, es poder.
                            </div>
                        </div>
                    </div>
                    <div className="al-hero-video-col">
                        <div className="al-hero-video-container" style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                            {!isVideoLoaded && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="dl-pulse-icon" style={{ color: '#ddbe3d' }}><Sparkles size={32} /></div>
                                </div>
                            )}
                            <img 
                                src="/eneagrama_new.png" 
                                alt="Eneagrama"
                                onLoad={() => setIsVideoLoaded(true)}
                                className="al-hero-video"
                                style={{ opacity: isVideoLoaded ? 1 : 0, transition: 'opacity 0.8s ease', width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="al-scroll-indicator">
                    <ChevronDown size={24} />
                </div>
            </section>

            {/* 3. New White Quote Section */}
            <section className="al-white-quote-section al-animate">
                <div className="al-section-content">
                    <h2 className="al-quote-text">
                        <span className="al-quote-blue">Tu perfil no es un número, no es una etiqueta y mucho menos un defecto.</span><br/>
                        <span className="al-quote-yellow">Es un patrón de comportamiento que influye en cómo decides, lideras y reaccionas bajo presión.</span>
                    </h2>
                </div>
            </section>

            {/* 3.5 Dynamic Patterns Section */}
            <section className="al-patterns-section al-animate">
                <div className="al-section-content">
                    <header className="al-patterns-header">
                        <h2 className="al-patterns-title">
                            Algo interesante <span className="al-gold-text" style={{display: 'inline'}}>aparece en tus respuestas</span>
                        </h2>
                        <p className="al-patterns-intro">
                            Al analizar tus respuestas encontramos patrones que suelen aparecer en personas que:
                        </p>
                    </header>

                    <ul className="al-patterns-list">
                        {displayPatterns.map((pattern, index) => (
                            <li key={index} className="al-pattern-item" style={{ animationDelay: `${index * 0.1}s` }}>
                                <Sparkles size={20} className="al-pattern-icon" />
                                <p className="al-pattern-text">{pattern}</p>
                            </li>
                        ))}
                    </ul>

                    <div className="al-patterns-footer" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                        <p>Estos rasgos pueden aparecer en más de un eneatipo, aunque cada uno los experimenta por motivaciones internas diferentes.</p>
                        <p>Por eso tu resultado muestra varios perfiles cercanos.</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '35px' }}>
                        <button 
                            className="al-btn-main"
                            onClick={() => navigate('/eneagrama-payment')}
                        >
                            DESCUBRIR MI PATRON
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </section>



            {/* 3.6 Next Steps Section (White Background) */}
            <section className="al-next-steps-section al-animate">
                <div className="al-section-content">
                    <div className="al-next-steps-container">
                        <h2 className="al-next-steps-title">Tu resultado inicial es solo el primer paso</h2>

                        <div className="al-benefits-list">
                            {[
                                "¿Qué motiva realmente tus decisiones?",
                                "¿Cómo reaccionas ante el estrés?",
                                "¿Qué activa tus patrones automáticos?",
                                "¿Cuál es tu camino natural de crecimiento?"
                            ].map((benefit, i) => (
                                <div key={i} className="al-benefit-item">
                                    <div className="al-benefit-dot"></div>
                                    <span>{benefit}</span>
                                </div>
                            ))}
                        </div>

                        <p className="al-next-steps-text">
                            Para identificar estos elementos se necesita una evaluación más detallada.
                        </p>

                        <button
                            className="al-btn-main"
                            onClick={() => navigate('/eneagrama-payment')}
                            style={{ margin: '0 auto', fontSize: '16px', padding: '16px 36px', whiteSpace: 'nowrap', display: 'flex', justifyContent: 'center' }}
                        >
                            <span>QUIERO MI ANÁLISIS AVANZADO</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 4. Información del Producto */}
            <section id="analisis-avanzado" className="al-section">
                <div className="al-section-content">
                    <h2 className="al-section-title" style={{ textAlign: 'center', marginBottom: '80px', maxWidth: '1000px', margin: '0 auto 80px' }}>
                        <span className="al-section-title-top">El test básico identifica</span>
                        <span className="al-gold-text">El análisis avanzado interpreta</span>
                    </h2>

                    <div className="al-product-flex">
                        <div className="al-product-text al-animate">
                            <h3 className="al-product-subtitle" style={{ fontSize: '28px', fontWeight: '800', marginBottom: '40px', lineHeight: '1.2', color: '#ffffff' }}>
                                No es más teoría. <br />
                                <span className="al-gold-text">Es interpretación profunda aplicada a tu perfil específico.</span>
                            </h3>

                            <ul className="al-product-list">
                                {[
                                    { t: "Identificación de tu eneatipo principal", d: "Aquí te explicamos por qué NO eres los otros tipos que estuvieron cerca en tu puntaje." },
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

                            <p className="al-product-detail-note" style={{ marginTop: '30px', color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '90%' }}>
                                El análisis avanzado utiliza <span style={{ color: '#ffffff', fontWeight: 'bold' }}>45 preguntas adicionales</span> diseñadas para diferenciar con mayor precisión entre los eneatipos que aparecen cercanos en el resultado inicial.
                                <span style={{ display: 'block', marginTop: '8px', color: '#ffffff', fontWeight: 'bold' }}>(toma 10-15 min).</span>
                            </p>
                        </div>

                        <div className="al-product-img-container al-animate" style={{ animationDelay: '0.4s', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
                            <EneagramaBook3D />
                            <button
                                className="al-btn-main"
                                onClick={() => navigate('/eneagrama-payment')}
                                style={{ fontSize: '15px', padding: '14px 28px' }}
                            >
                                DESBLOQUEAR MI RESULTADO AVANZADO
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>



            {/* 4.6 Testimonios */}
            <section className="al-animate" style={{ background: '#ffffff', color: '#002d44', padding: '100px 24px' }}>
                <div className="al-section-content">
                    <h2 className="al-testimonials-title">
                        Muchos usuarios creen que con el perfil es suficiente. <br />
                        <span className="al-testimonials-title-yellow">hasta que descubren el código que surge bajo presión y cómo trabajarlo.</span>
                    </h2>

                    <div className="dl-testimonials-container">
                        <div 
                            className="dl-testimonials-track"
                            style={{ 
                                transform: `translateX(calc(-${testimonialIndex * 380}px))`,
                                transition: transitionEnabled 
                                    ? (isPlaying ? 'transform 5s linear' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)') 
                                    : 'none',
                                animation: 'none'
                            }}
                        >
                            {[...testimonials, ...testimonials.slice(0, 5)].map((t, i) => (
                                <div key={i} className="dl-testimonial-card">
                                    <div>
                                        <span className="dl-quote-icon">“</span>
                                        <p className="dl-testimonial-text">{t.text}</p>
                                    </div>
                                    <div className="dl-testimonial-footer">
                                        <div className="dl-stars">
                                            {[...Array(t.stars)].map((_, si) => (
                                                <Star key={si} size={16} fill="#ddbe3d" color="#ddbe3d" />
                                            ))}
                                        </div>
                                        <span className="dl-testimonial-author">- {t.author}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonials Controls */}
                    <div className="dl-testimonials-controls">
                        <button onClick={handlePrev} className="dl-testimonial-btn" aria-label="Anterior">
                            <ArrowLeft size={24} />
                        </button>
                        <button onClick={togglePlay} className="dl-testimonial-btn dl-play-pause" aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
                            {isPlaying ? <Pause size={24} /> : <PlayCircle size={24} />}
                        </button>
                        <button onClick={() => handleNext(true)} className="dl-testimonial-btn" aria-label="Siguiente">
                            <ArrowRight size={24} />
                        </button>
                    </div>

                    <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button onClick={() => navigate('/eneagrama-payment')} className="al-btn-main">
                            Obtener mi analisis avanzado
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 7. Precios */}
            <section id="precios" className="al-section">
                <div className="al-section-content">
                    <div className="al-pricing-wrapper-single al-animate">
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

                                <button onClick={() => navigate('/eneagrama-payment')} className="al-btn-buy">
                                    Desbloquear análisis completo <Lock size={24} />
                                </button>

                                <p style={{
                                    fontSize: '0.85rem',
                                    color: 'rgba(255, 255, 255, 0.75)',
                                    marginTop: '10px',
                                    marginBottom: '0px',
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}>
                                    <ShieldCheck size={15} style={{ color: '#2ECC71' }} />
                                    Transacción segura y protegida con cifrado SSL
                                </p>

                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    gap: '15px', 
                                    marginTop: '8px', 
                                    marginBottom: '10px' 
                                }}>
                                    <img 
                                        src="/Icono - Visa.png" 
                                        alt="Visa" 
                                        style={{ height: '24px', width: 'auto', objectFit: 'contain' }} 
                                    />
                                    <img 
                                        src="/Icono - Mastercard.png" 
                                        alt="Mastercard" 
                                        style={{ height: '24px', width: 'auto', objectFit: 'contain' }} 
                                    />
                                    <img 
                                        src="/Icono - Wompi.png" 
                                        alt="Wompi" 
                                        style={{ height: '20px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
                                    />
                                </div>

                                <p className="al-footer-desc" style={{ color: 'rgba(255,255,255,0.3)', marginTop: '0' }}>
                                    Enlace de descarga instantáneo • Pago seguro vía Wompi
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Secuencia "Cómo funciona" */}
                    <div style={{ marginTop: '100px' }}>
                        <h3 className="al-section-title" style={{ 
                            textAlign: 'center', 
                            color: '#ffffff', 
                            fontSize: 'clamp(26px, 4vw, 36px)', 
                            fontWeight: '800',
                            marginBottom: '60px',
                            letterSpacing: '0.05em',
                            whiteSpace: 'nowrap'
                        }}>
                            ¿Cómo <span className="al-gold-text" style={{ display: 'inline', whiteSpace: 'nowrap' }}>funciona?</span>
                        </h3>

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '30px',
                            maxWidth: '1000px',
                            margin: '0 auto'
                        }}>
                            {[
                                { icon: <CreditCard size={32} />, title: "1. Compra segura", desc: "Realizas el pago de forma 100% segura para habilitar tu diagnóstico completo." },
                                { icon: <Target size={32} />, title: "2. Preguntas de precisión", desc: "Respondes las 45 preguntas adicionales diseñadas para perfilar tus eneatipos cercanos." },
                                { icon: <Sparkles size={32} />, title: "3. Análisis dinámico", desc: "Nuestro sistema procesa tus respuestas, analizando patrones y calculando dinámicas de reacción." },
                                { icon: <Award size={32} />, title: "4. Reporte premium", desc: "Recibes y descargas al instante tus resultados del análisis avanzado de forma digital en PDF." }
                            ].map((step, i) => (
                                <div key={i} style={{ 
                                    textAlign: 'center', 
                                    padding: '40px 20px 30px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '24px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    position: 'relative',
                                    minHeight: '230px',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    {/* Número en la esquina */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '20px',
                                        left: '20px',
                                        fontSize: '22px',
                                        fontWeight: '900',
                                        color: '#ffffff',
                                        fontFamily: 'monospace',
                                        opacity: 0.8
                                    }}>
                                        0{i + 1}
                                    </div>

                                    <div style={{ color: '#ddbe3d', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                                        {step.icon}
                                    </div>
                                    <h4 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', marginBottom: '12px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'none', fontStyle: 'normal' }}>
                                        {step.title.replace(/^\d+\.\s/, '')}
                                    </h4>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.6', margin: '0' }}>{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. Garantía */}
            <section className="al-guarantee-section">
                <div className="al-guarantee-content al-animate">
                    <img 
                        src="/Garantia eneagrama.png" 
                        alt="Garantía Auténticos" 
                        className="al-guarantee-img"
                    />
                    <h2 className="al-guarantee-title">
                        Nuestra <span style={{ color: '#ddbe3d' }}>garantía</span>
                    </h2>
                    <p className="al-guarantee-text">
                        Si el resultado no te aporta claridad real sobre tu personalidad, te devolvemos tu dinero.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '35px' }}>
                        <button 
                            className="al-btn-main"
                            onClick={() => navigate('/eneagrama-payment')}
                        >
                            CONTINUAR CON MI ANALISIS AVANZADO
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 5.5 FAQ & Closure Section */}
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

                    <div className="al-closure-container" style={{ marginTop: '80px', textAlign: 'center' }}>
                        <h2 className="al-closure-title" style={{ fontSize: 'clamp(1.1rem, 3.2vw, 1.6rem)', lineHeight: '1.6', marginBottom: '40px' }}>
                            <div className="al-white-text">Lo que no comprendes de ti, te domina.</div>
                            <div className="al-gold-text">Lo que comprendes, se convierte en liderazgo.</div>
                        </h2>

                        <button onClick={() => navigate('/eneagrama-payment')} className="al-btn-shimmer" style={{ margin: '0 auto' }}>
                            <span className="al-btn-label">
                                ACCEDER AHORA A MI ANÁLISIS AVANZADO
                            </span>
                            <ArrowRight size={24} className="al-btn-icon" />
                        </button>
                    </div>
                </div>
            </section>

            {/* 11. Footer */}
            <footer className="al-footer">
                <div className="al-footer-content">
                    <a href="https://www.autenticos.co/" target="_blank" rel="noopener noreferrer">
                        <img src="/logo-azul.png" alt="Auténticos" className="al-footer-logo" />
                    </a>
                    <div className="al-footer-social">
                        <a href="https://www.autenticos.co/" target="_blank" rel="noopener noreferrer"><Globe size={18} /></a>
                        <a href="https://www.instagram.com/autenticos.co/" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
                        <a href="https://www.facebook.com/clubautenticos" target="_blank" rel="noopener noreferrer"><Facebook size={18} /></a>
                        <a href="https://www.youtube.com/@AutenticosTV" target="_blank" rel="noopener noreferrer"><Youtube size={18} /></a>
                        <a href="https://www.linkedin.com/company/autenticos/?viewAsMember=true" target="_blank" rel="noopener noreferrer"><Linkedin size={18} /></a>
                    </div>
                </div>
            </footer>

            {/* Mobile FAB */}
            <div className="al-mobile-fab">
                <button onClick={() => navigate('/eneagrama-payment')} className="al-btn-fab">
                    Desbloquear Análisis Ahora
                </button>
            </div>

            {/* Botón Flotante WhatsApp */}
            <a 
                href="https://wa.me/573164287586?text=Hola,%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20an%C3%A1lisis%20avanzado%20de%20Eneagrama"
                target="_blank"
                rel="noopener noreferrer"
                className="al-whatsapp-float"
            >
                <svg viewBox="0 0 24 24" width="35" height="35" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.123.553 4.197 1.604 6.013L0 24l6.135-1.61a11.782 11.782 0 005.912 1.583h.005c6.635 0 12.032-5.397 12.035-12.031a11.792 11.792 0 00-3.493-8.504z"/>
                </svg>
            </a>
        </div>
    );
};

export default AdvancedLanding;
