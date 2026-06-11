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
    Brain,
    HeartPulse,
    User,
    Handshake,
    Eye,
    TrendingUp,
    Instagram,
    Facebook,
    Youtube,
    Linkedin,
    UserPlus,
    PlayCircle,
    Pause,
    Mail,
    Globe
} from 'lucide-react';
import { getEnneagramInfo } from '../utils/calculator';
import FascinantesRadar from '../components/FascinantesRadar';
import PremiumBook3D from '../components/PremiumBook3D';
import './DominiosLanding.css';

const radarData = [
    { domain: 'Dominio Corporal', score: 49 }, // 70%
    { domain: 'Dominio Mental', score: 57.4 }, // 82%
    { domain: 'Dominio Emocional', score: 44.1 }, // 63%
    { domain: 'Dominio Social', score: 38.5 }, // 55%
    { domain: 'Dominio Espiritual', score: 54.6 }, // 78%
    { domain: 'Dominio Financiero', score: 35 }, // 50%
];

const DominiosLanding = ({ result, setTestResult }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isScrolled, setIsScrolled] = useState(false);
    const [navHidden, setNavHidden] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const [showMainVideo, setShowMainVideo] = useState(false);
    const [playingVideoIndex, setPlayingVideoIndex] = useState(null);

    const testimonials = [
        { 
            text: "Increíble la precisión del reporte. Me ayudó a ponerle palabras a cosas que sentía pero no sabía explicar. Ahora tengo un mapa claro de por dónde empezar.",
            author: "Liliana García",
            stars: 5
        },
        { 
            youtubeId: "tTUPAh8Uah0",
            author: "Viviana Colorado",
            stars: 5
        },
        { 
            text: "Por fin entiendo por qué me sentía tan agotada a pesar de que todo 'parecía estar bien'. El autodiagnóstico me dio el lenguaje que me faltaba.",
            author: "Paula Sánchez",
            stars: 5
        },
        { 
            youtubeId: "F52giTsYzaE",
            author: "María Fernanda Carvajal",
            stars: 5
        },
        { 
            text: "Es una conversación honesta con uno mismo. Sin etiquetas, solo claridad pura sobre lo que hoy está influyendo en mi vida personal y profesional.",
            author: "Mateo Rodríguez",
            stars: 5
        },
        { 
            youtubeId: "uaSALZis2FM",
            author: "Alex Cerón",
            stars: 5
        },
        { 
            text: "Pensaba que solo era estrés laboral, pero el reporte me mostró que el desequilibrio venía de mi área espiritual. Esa claridad cambió mi enfoque por completo.",
            author: "Juan Carlos Ruiz",
            stars: 5
        }
    ];

    // Carousel Logic
    useEffect(() => {
        let interval;
        if (isPlaying) {
            // Smooth linear movement: move one card every 5 seconds
            interval = setInterval(() => {
                handleNext();
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, testimonialIndex]);

    const handlePrev = () => {
        setIsPlaying(false); // Stop auto-play on manual interaction
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
            }, isPlaying ? 5000 : 600); // Wait for current transition to finish
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
                    localStorage.setItem('enneagramResult', JSON.stringify(reconstructedResult));
                }
            } catch (e) {
                console.error('Error reconstructing state from URL:', e);
            }
        }
    }, [searchParams, result, setTestResult]);

    // Isolation and Reset Logic
    useEffect(() => {
        const originalBG = document.body.style.backgroundImage;
        const originalColor = document.body.style.color;
        const originalMargin = document.body.style.margin;
        const originalOverflow = document.body.style.overflow;

        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = '#002d44';
        document.body.style.color = '#ffffff';
        document.body.style.margin = '0';
        document.body.style.padding = '0';

        return () => {
            document.body.style.backgroundImage = originalBG;
            document.body.style.color = originalColor;
            document.body.style.margin = originalMargin;
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    const faqs = [
        {
            q: "¿Qué es exactamente este análisis?",
            a: "Es una experiencia de autoobservación diseñada para ayudarte a entender con más claridad cómo se encuentran las áreas más importantes de tu vida: mental, emocional, corporal, social, espiritual y financiera."
        },
        {
            q: "¿Cuánto tiempo toma completarlo?",
            a: "La experiencia completa toma aproximadamente entre 30 y 45 minutos, dependiendo del ritmo con el que respondas."
        },
        {
            q: "¿Cómo recibo mis resultados?",
            a: "Al finalizar, recibirás un reporte personalizado con el análisis de tus 6 dominios, interpretaciones y recomendaciones prácticas."
        },
        {
            q: "¿Mis respuestas son privadas?",
            a: "Sí. Tu información y tus respuestas son completamente confidenciales y no se comparten con terceros."
        },
        {
            q: "¿Puedo repetir el análisis más adelante?",
            a: "Sí. Muchas personas vuelven a realizarlo después de un tiempo para observar cambios en su proceso personal."
        },
        {
            q: "¿Qué pasa si no hago el análisis ahora?",
            a: "Seguirás operando con el mismo nivel de energía y los mismos 'puntos ciegos' que tienes hoy. Este mapa es la inversión más pequeña de tiempo y dinero que puedes hacer para ganar años de claridad y equilibrio en tu vida personal y profesional."
        }
    ];


    // Scroll listener removed to prevent performance issues and white screen crashes

    const handleAction = () => {
        navigate('/dominios-payment');
    };

    return (
        <div id="inicio" className="dominios-landing-container">
            {/* Background Layer */}
            <div className="dl-bg-glow"></div>

            {/* 1. Header Navigation */}
            <nav className={`dl-nav ${isScrolled ? 'scrolled' : ''} ${navHidden ? 'nav-hidden' : ''}`}>
                <div className="dl-nav-content">
                    <div className="dl-logo-wrapper">
                        <img src="/Logo-Blanco.png" alt="Auténticos Logo" className="dl-logo" />
                    </div>

                    <div className="dl-nav-links">
                        <a href="#inicio" className="dl-nav-link">Inicio</a>
                        <a href="#dominios" className="dl-nav-link">Dominios</a>
                        <a href="#preguntas" className="dl-nav-link">Preguntas</a>
                        <a href="#precios" className="dl-nav-link">Inversión</a>
                    </div>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <section className="dl-hero dl-animate">
                <div className="dl-section-content dl-hero-container">
                    <div className="dl-hero-inner">
                        {/* 1. Text Column */}
                        <div className="dl-hero-text">
                            <h1 className="dl-hero-title">
                                <span className="dl-hero-title-top">Puedes seguir funcionando…</span>
                                <span className="dl-gold-text">y aun así sentirte completamente perdido por dentro.</span>
                            </h1>

                            <p className="dl-hero-subtitle">
                                Descubre qué áreas de tu vida están <br />
                                drenando tu energía, bloqueando <br />
                                tu claridad y alejándote de la persona <br />
                                que realmente quieres ser.
                            </p>
                        </div>

                        {/* 2. Radar Chart Column */}
                        <div className="dl-hero-chart">
                            <div className="dl-radar-wrapper" style={{ marginTop: '-40px' }}>
                                <FascinantesRadar 
                                    data={radarData} 
                                    height={window.innerWidth < 600 ? 450 : 700} 
                                    radius={window.innerWidth < 600 ? "90%" : "50%"} 
                                    transparent={true}
                                    isDark={true}
                                />
                            </div>
                        </div>

                        {/* 3. Actions Column (Now separate to control order) */}
                        <div className="dl-hero-actions">
                            <button onClick={handleAction} className="dl-btn-main">
                                QUIERO MI MAPA DE CLARIDAD
                                <ArrowRight size={22} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="dl-scroll-indicator">
                    <ChevronDown size={24} />
                </div>
            </section>

            {/* 3. Empathy Section */}
            <section className="dl-section dl-animate" style={{ background: '#ffffff', color: '#002d44', padding: '100px 24px' }}>
                <div className="dl-section-content dl-empathy-container">
                    <h2 className="dl-section-title" style={{ 
                        fontWeight: '900', 
                        textAlign: 'center', 
                        marginBottom: '60px',
                        color: '#002d44'
                    }}>
                        ¿Te has sentido <span style={{ color: '#ddbe3d' }}>así últimamente?</span>
                    </h2>

                    <div className="dl-empathy-grid">
                        {[
                            "Sabes que algo no está bien, pero no logras explicar qué es exactamente.",
                            "Te sientes agotado físicamente, pero intuyes que el cansancio es más profundo.",
                            "Funcionas en automático, cumpliendo con todo pero desconectado de ti.",
                            "Hay áreas de tu vida que has normalizado, aunque sabes que te están drenando.",
                            "Te cuesta identificar qué emoción está dominando tus decisiones hoy.",
                            "Buscas avanzar, pero sientes que hay un freno invisible que no sabes nombrar."
                        ].map((text, i) => (
                            <div key={i} className="dl-empathy-item">
                                <div className="dl-empathy-bullet"></div>
                                <p className="dl-empathy-text">{text}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button onClick={handleAction} className="dl-btn-main">
                            Iniciar mi análisis
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 4. 6 Pilares Section */}
            <section id="dominios" className="dl-section dl-animate">
                <div className="dl-section-content">
                    <h2 className="dl-section-title" style={{ textAlign: 'center', marginBottom: '20px' }}>
                        Tu vida <span className="dl-gold-text" style={{ display: 'inline' }}>no se rompe en un solo lugar</span>
                    </h2>
                    <p style={{ 
                        textAlign: 'center', 
                        fontSize: '1.1rem', 
                        lineHeight: '1.8',
                        color: 'rgba(255,255,255,0.7)', 
                        marginBottom: '60px',
                        maxWidth: '900px',
                        margin: '0 auto 60px'
                    }}>
                        El autodiagnóstico no te etiqueta, te proporciona una conversación honesta <br />
                        contigo mismo para que obtengas una lectura profunda de los patrones <br />
                        que hoy están influyendo en tu bienestar a través de estas 6 dimensiones:
                    </p>
                    
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                        gap: '30px',
                        maxWidth: '1000px',
                        margin: '0 auto'
                    }}>
                        {[
                            { icon: <Brain size={32} />, t: "Mental", d: "Identifica tus pensamientos, saturación y falta de enfoque.", color: "#ff9100" },
                            { icon: <HeartPulse size={32} />, t: "Emocional", d: "Entiende tu regulación emocional y el origen de tu agotamiento.", color: "#ffee00" },
                            { icon: <User size={32} />, t: "Corporal", d: "Identifica tu nivel real de energía y la relación con tu descanso.", color: "#cc0000" },
                            { icon: <Handshake size={32} />, t: "Social", d: "Analiza tus vínculos y dónde estás perdiendo tu autenticidad.", color: "#00ff00" },
                            { icon: <Eye size={32} />, t: "Espiritual", d: "Recupera la dirección y la coherencia con tu propósito personal.", color: "#00e5ff" },
                            { icon: <TrendingUp size={32} />, t: "Financiero", d: "Observa tu relación con el dinero sin la presión del sistema.", color: "#d500f9" }
                        ].map((item, i) => (
                            <div key={i} style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                padding: '30px', 
                                borderRadius: '24px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                                transition: 'all 0.3s ease',
                                cursor: 'default'
                            }}>
                                <div style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    borderRadius: '16px', 
                                    background: `rgba(${parseInt(item.color.slice(1,3),16)}, ${parseInt(item.color.slice(3,5),16)}, ${parseInt(item.color.slice(5,7),16)}, 0.1)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: item.color
                                }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>{item.t}</h4>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>{item.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button onClick={handleAction} className="dl-btn-main">
                            QUIERO ENTENDERME
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 5. Minimalist Reflection Section */}
            <section className="dl-section dl-animate" style={{ background: '#ffffff', color: '#002d44', padding: '120px 24px' }}>
                <div className="dl-section-content" style={{ maxWidth: '800px', textAlign: 'center' }}>
                    <p style={{ 
                        fontSize: 'clamp(18px, 2.5vw, 22px)', 
                        lineHeight: '1.6', 
                        fontWeight: '400',
                        marginBottom: '40px',
                        color: 'rgba(0, 45, 68, 0.7)'
                    }}>
                        Muchas personas aprenden a seguir adelante <br />
                        mientras internamente se sienten desconectadas.
                    </p>

                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '20px', 
                        marginBottom: '60px' 
                    }}>
                        {["Funcionan.", "Cumplen.", "Responden."].map((text, i) => (
                            <div key={i} style={{
                                padding: '15px 30px',
                                border: '2px solid rgba(0, 45, 68, 0.1)',
                                borderRadius: '12px',
                                background: 'rgba(0, 45, 68, 0.02)',
                                minWidth: '160px'
                            }}>
                                <p style={{ 
                                    fontSize: 'clamp(18px, 2.5vw, 22px)', 
                                    fontWeight: '900', 
                                    margin: 0,
                                    letterSpacing: '-0.01em',
                                    color: '#002d44'
                                }}>
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>

                    <p style={{ 
                        fontSize: 'clamp(24px, 3vw, 28px)', 
                        lineHeight: '1.2', 
                        fontWeight: '700',
                        color: '#ddbe3d'
                    }}>
                        Pero algo dentro de ellas lleva tiempo pidiendo atención.
                    </p>

                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button onClick={handleAction} className="dl-btn-main">
                            Descubrir qué me pasa
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 6. Información del Producto */}
            <section id="detalles-producto" className="dl-product-section">
                <div className="dl-section-content">
                    <h2 className="dl-section-title dl-reveal" style={{ textAlign: 'center', marginBottom: '40px' }}>
                        Al finalizar el <span className="dl-gold-text" style={{ display: 'inline' }}>autodiagnóstico recibirás:</span>
                    </h2>

                    {/* Video Explicativo Centrado Arriba (Facade Alta Resolución) */}
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '60px' }}>
                        <div 
                            style={{
                                width: '100%',
                                maxWidth: '650px',
                                aspectRatio: '16/9',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                                border: '1px solid rgba(221, 190, 61, 0.3)',
                                position: 'relative',
                                cursor: showMainVideo ? 'default' : 'pointer',
                                background: '#000'
                            }}
                            onClick={() => !showMainVideo && setShowMainVideo(true)}
                        >
                            {!showMainVideo ? (
                                <>
                                    <img 
                                        src="https://img.youtube.com/vi/53UUW4i7fsk/maxresdefault.jpg" 
                                        alt="Thumbnail Autodiagnóstico" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        background: 'rgba(0,0,0,0.1)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <div style={{
                                            width: '68px',
                                            height: '48px',
                                            backgroundColor: 'rgba(255, 0, 0, 0.9)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                                        }}>
                                            <svg viewBox="0 0 68 48" width="40" height="40">
                                                <path d="M45 24L27 14v20z" fill="#ffffff" />
                                            </svg>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <iframe 
                                    width="100%" 
                                    height="100%" 
                                    src="https://www.youtube.com/embed/53UUW4i7fsk?rel=0&autoplay=1" 
                                    title="¿Qué obtendrás en el autodiagnóstico?" 
                                    frameBorder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                    allowFullScreen>
                                </iframe>
                            )}
                        </div>
                    </div>

                    <div className="dl-product-flex">
                        {/* 1. Book on the LEFT */}
                        <div className="dl-product-img-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {/* Libro Dinámico (Tamaño reducido) */}
                            <div style={{ width: '80%', maxWidth: '350px' }}>
                                <PremiumBook3D />
                            </div>
                        </div>

                        {/* 2. Text on the RIGHT */}
                        <div className="dl-product-text">
                            <ul className="dl-product-list">
                                {[
                                    { t: "Análisis de 6 Dominios", d: "Un estudio profundo de tu estado actual en las dimensiones mental, emocional, corporal, social, espiritual y financiera." },
                                    { t: "Áreas Críticas", d: "Identificación de los desequilibrios y 'puntos ciegos' que bloquean tu capacidad de influir en otros y en ti mismo." },
                                    { t: "Reporte Personalizado", d: "Un documento visual, detallado y 100% único con el mapa de tu ecosistema de vida y rutas de mejora." },
                                    { t: "Hoja de Ruta de 8 Pasos", d: "Un plan de acción estructurado paso a paso para elevar específicamente aquellos dominios que hoy se encuentran en niveles bajos." }
                                ].map((item, i) => (
                                    <li key={i} className="dl-product-item dl-reveal">
                                        <div className="dl-item-bullet">
                                            <CheckCircle2 size={24} color="#ddbe3d" />
                                        </div>
                                        <div>
                                            <h4 className="dl-item-title">{item.t}</h4>
                                            <p className="dl-item-desc">{item.d}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <button onClick={handleAction} className="dl-btn-main">
                                    Sí, lo necesito
                                    <ArrowRight size={22} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Testimonials Section */}
            <section className="dl-section dl-animate" style={{ background: '#ffffff', color: '#002d44', padding: '100px 24px' }}>
                <div className="dl-section-content">
                    <h2 className="dl-section-title" style={{ textAlign: 'center', marginBottom: '20px', color: '#002d44' }}>
                        Lo que dicen <span style={{ color: '#ddbe3d' }}>las personas</span>
                    </h2>
                    <p style={{ 
                        textAlign: 'center', 
                        fontSize: '1.1rem', 
                        color: 'rgba(0, 45, 68, 0.6)', 
                        marginBottom: '60px',
                        maxWidth: '600px',
                        margin: '0 auto 60px'
                    }}>
                        Historias reales de personas que obtuvieron el lenguaje para entender su propio proceso.
                    </p>

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
                                <div key={i} className="dl-testimonial-card" style={t.youtubeId ? { padding: '0', overflow: 'hidden' } : {}}>
                                    {t.youtubeId ? (
                                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <div 
                                                style={{ width: '100%', height: '240px', background: '#000', position: 'relative', cursor: playingVideoIndex === i ? 'default' : 'pointer' }}
                                                onClick={() => {
                                                    if (playingVideoIndex !== i) {
                                                        setPlayingVideoIndex(i);
                                                        setIsPlaying(false);
                                                    }
                                                }}
                                            >
                                                {playingVideoIndex !== i ? (
                                                    <>
                                                        <img 
                                                            src={`https://img.youtube.com/vi/${t.youtubeId}/hqdefault.jpg`} 
                                                            alt={`Testimonio de ${t.author}`} 
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                        />
                                                        <div style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            background: 'rgba(0,0,0,0.1)',
                                                            transition: 'all 0.3s ease'
                                                        }}>
                                                            <div style={{
                                                                width: '50px',
                                                                height: '35px',
                                                                backgroundColor: 'rgba(255, 0, 0, 0.9)',
                                                                borderRadius: '8px',
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                                                            }}>
                                                                <svg viewBox="0 0 68 48" width="28" height="28">
                                                                    <path d="M45 24L27 14v20z" fill="#ffffff" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <iframe 
                                                        width="100%" 
                                                        height="100%" 
                                                        src={`https://www.youtube.com/embed/${t.youtubeId}?rel=0&autoplay=1`} 
                                                        title={`Testimonio de ${t.author}`} 
                                                        frameBorder="0" 
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                                        allowFullScreen>
                                                    </iframe>
                                                )}
                                            </div>
                                            <div className="dl-testimonial-footer" style={{ padding: '10px 25px 20px', borderTop: 'none', background: '#f8f9fa', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div className="dl-stars">
                                                    {[...Array(t.stars)].map((_, si) => (
                                                        <Star key={si} size={16} fill="#ddbe3d" color="#ddbe3d" />
                                                    ))}
                                                </div>
                                                <span className="dl-testimonial-author">- {t.author}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
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
                                        </>
                                    )}
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
                        <button onClick={handleAction} className="dl-btn-main">
                            Obtener mi diagnóstico
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 8. Precios */}
            <section id="precios" className="dl-section">
                <div className="dl-section-content">
                    <div className="dl-pricing-wrapper-single dl-animate">
                        <div className="dl-pricing-card">
                            <div className="dl-pricing-glow"></div>
                            
                            <div className="dl-pricing-header">
                                <h3>Acceso a tu Claridad</h3>
                            </div>

                            <div className="dl-pricing-content">
                                <div className="dl-price-box">
                                    {/* Etiqueta de Lanzamiento Central */}
                                    <div style={{
                                        background: '#ddbe3d',
                                        color: '#002d44',
                                        padding: '6px 18px',
                                        borderRadius: '6px',
                                        fontWeight: '900',
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.12em',
                                        marginBottom: '20px',
                                        display: 'inline-block',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        Aprovecha el precio de lanzamiento
                                    </div>
                                    <br />
                                    <span className="dl-old-price">$150.000 COP</span>
                                    <div className="dl-current-price">
                                        $75.000 <span className="dl-currency">COP</span>
                                    </div>
                                </div>

                                <div className="dl-pricing-grid">
                                    {[
                                        'Análisis profundo de 6 Dimensiones',
                                        'Identificación de áreas críticas',
                                        <span>Tiempo estimado de duración <br /> entre 30 y 45 minutos</span>,
                                        'Hoja de Ruta de 8 Pasos',
                                        'Acceso inmediato e ilimitado',
                                        'Reporte descargable en PDF'
                                    ].map((item, i) => (
                                        <div key={i} className="dl-pricing-item">
                                            <CheckCircle2 size={16} color="#ddbe3d" /> {item}
                                        </div>
                                    ))}
                                </div>

                                <div className="dl-btn-buy-wrapper">
                                    <button onClick={handleAction} className="dl-btn-buy">
                                        QUIERO MI MAPA DE CLARIDAD <Lock size={24} />
                                    </button>
                                    
                                    {/* Iconos de Pago */}
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center', 
                                        gap: '20px', 
                                        marginTop: '25px',
                                        opacity: '0.9'
                                    }}>
                                        <img src="/Icono - Visa.png" alt="Visa" style={{ height: '28px', width: 'auto' }} />
                                        <img src="/Icono - Mastercard.png" alt="Mastercard" style={{ height: '24px', width: 'auto' }} />
                                        <img src="/Icono - Mercado pago.png" alt="Mercado Pago" style={{ height: '28px', width: 'auto' }} />
                                        <img src="/Icono - Wompi.png" alt="Wompi" style={{ height: '24px', width: 'auto' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secuencia "Cómo funciona" */}
                    <div style={{ marginTop: '100px' }}>
                        <h3 className="dl-section-title" style={{ 
                            textAlign: 'center', 
                            color: '#ffffff', 
                            fontSize: 'clamp(30px, 5vw, 36px)', 
                            fontWeight: '800',
                            marginBottom: '60px',
                            letterSpacing: '0.05em'
                        }}>
                            ¿Cómo <span style={{ color: '#ddbe3d' }}>funciona?</span>
                        </h3>

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '30px',
                            maxWidth: '1000px',
                            margin: '0 auto'
                        }}>
                            {[
                                { icon: <CreditCard size={32} />, title: "1. Compra segura", desc: "Realizas el pago de forma segura a través de nuestra plataforma." },
                                { icon: <UserPlus size={32} />, title: "2. Registro rápido", desc: "Creas tu perfil básico para que podamos personalizar tus resultados." },
                                { icon: <PlayCircle size={32} />, title: "3. Autodiagnóstico", desc: "Inicias la experiencia de reflexión profunda (toma 30-45 min)." },
                                { icon: <Mail size={32} />, title: "4. Reporte al instante", desc: "Recibes tu análisis por correo o lo descargas en el momento." }
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
                                        <h4 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', marginBottom: '12px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {step.title.replace(/^\d+\.\s/, '')}
                                        </h4>
                                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.6' }}>{step.desc}</p>
                                    </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. Garantía */}
            <section className="dl-section" style={{ background: '#ffffff', color: '#002d44', padding: '100px 24px' }}>
                <div className="dl-section-content" style={{ textAlign: 'center', maxWidth: '800px' }}>
                    <img 
                        src="/Garantia Autodiagnostico.png" 
                        alt="Garantía Auténticos" 
                        className="dl-guarantee-img"
                    />
                    <h2 className="dl-section-title" style={{ color: '#002d44', marginBottom: '30px' }}>
                        Nuestra <span style={{ color: '#ddbe3d' }}>Garantía</span>
                    </h2>
                    <p className="dl-guarantee-text">
                        Si al finalizar el análisis sientes que no te aportó claridad o reflexión real sobre tu situación actual, puedes solicitar la devolución de tu dinero dentro de las primeras 24 horas.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button onClick={handleAction} className="dl-btn-main">
                            Iniciar mi proceso
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 10. FAQ */}
            <section id="preguntas" className="dl-faq-section dl-animate" style={{ 
                background: 'linear-gradient(to bottom, #002d44 0%, #001a29 100%)', 
                color: '#ffffff' 
            }}>
                <div className="dl-section-content">
                    <h2 className="dl-section-title" style={{ textAlign: 'center', marginBottom: '60px', color: '#ffffff' }}>
                        Preguntas <br className="dl-mobile-br" /> <span style={{ color: '#ddbe3d' }}>frecuentes</span>
                    </h2>

                    <div className="dl-faq-container">
                        {faqs.map((faq, i) => (
                            <div key={i} 
                                className={`dl-faq-item ${openFaq === i ? 'active' : ''}`} 
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)'
                                }}
                            >
                                <div className="dl-faq-question" style={{ color: '#ffffff' }}>
                                    <span>{faq.q}</span>
                                    {openFaq === i ? <Minus size={20} /> : <Plus size={20} />}
                                </div>
                                <div className="dl-faq-answer" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                    <p>{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center' }}>
                        <button onClick={handleAction} className="dl-btn-main">
                            Empezar ahora
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 11. Footer */}
            <footer className="dl-footer">
                <div className="dl-footer-content">
                    <a href="https://www.autenticos.co/" target="_blank" rel="noopener noreferrer">
                        <img src="/logo-azul.png" alt="Auténticos" className="dl-footer-logo" />
                    </a>
                    <div className="dl-footer-social">
                        <a href="https://www.autenticos.co/" target="_blank" rel="noopener noreferrer"><Globe size={18} /></a>
                        <a href="https://www.instagram.com/autenticos.co/" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
                        <a href="https://www.facebook.com/clubautenticos" target="_blank" rel="noopener noreferrer"><Facebook size={18} /></a>
                        <a href="https://www.youtube.com/@AutenticosTV" target="_blank" rel="noopener noreferrer"><Youtube size={18} /></a>
                        <a href="https://www.linkedin.com/company/autenticos/?viewAsMember=true" target="_blank" rel="noopener noreferrer"><Linkedin size={18} /></a>
                    </div>
                </div>
            </footer>

            {/* Mobile FAB */}
            <div className="dl-mobile-fab">
                <button onClick={handleAction} className="dl-btn-fab">
                    Quiero mi Mapa de Claridad
                </button>
            </div>
            {/* Botón Flotante WhatsApp */}
            <a 
                href="https://wa.me/573164287586?text=Hola,%20quiero%20mayor%20informaci%C3%B3n%20sobre%20el%20autodiagn%C3%B3stico%20de%20los%206%20dominios"
                target="_blank"
                rel="noopener noreferrer"
                className="dl-whatsapp-float"
            >
                <svg viewBox="0 0 24 24" width="35" height="35" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.123.553 4.197 1.604 6.013L0 24l6.135-1.61a11.782 11.782 0 005.912 1.583h.005c6.635 0 12.032-5.397 12.035-12.031a11.792 11.792 0 00-3.493-8.504z"/>
                </svg>
            </a>
        </div>
    );
};

export default DominiosLanding;
