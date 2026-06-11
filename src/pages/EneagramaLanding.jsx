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
import PremiumBook3D from '../components/PremiumBook3D';
import './EneagramaLanding.css';

const EneagramaLanding = ({ result, setTestResult }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isScrolled, setIsScrolled] = useState(false);
    const [navHidden, setNavHidden] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [transitionEnabled, setTransitionEnabled] = useState(true);

    const testimonials = [
        { 
            text: "Increíble que un test tan rápido sea tan preciso. Me ayudó a entender por qué siempre reacciono de la misma manera ante el estrés. ¡Muy recomendado!",
            author: "Andrea Rivas",
            stars: 5
        },
        { 
            text: "Me encantó descubrir mi eneatipo base. La descripción que recibí al final me dio mucha claridad sobre mis motivaciones ocultas. Un excelente punto de partida.",
            author: "Carlos Méndez",
            stars: 5
        },
        { 
            text: "Siempre tuve curiosidad sobre el Eneagrama y este test gratuito fue la puerta de entrada perfecta. Es sencillo, intuitivo y los resultados son reveladores.",
            author: "Elena Torres",
            stars: 5
        },
        { 
            text: "Lo hice en 5 minutos y me sorprendió lo mucho que se parece a mi realidad. Ver mis 3 eneatipos más cercanos me hizo mucho sentido.",
            author: "Javier López",
            stars: 5
        },
        { 
            text: "Una herramienta muy útil para quienes buscamos autoconocimiento sin complicaciones. La precisión es impresionante para ser una versión gratuita.",
            author: "Sofia Castro",
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
            q: "¿Es realmente gratuito?",
            a: "Sí, este test es una herramienta de acceso libre diseñada para ayudarte a dar el primer paso en tu proceso de autoconocimiento sin costo alguno."
        },
        {
            q: "¿Cuánto tiempo toma realizarlo?",
            a: "Te tomará entre 3 y 5 minutos. Es una versión optimizada para darte resultados precisos y profundos en poco tiempo."
        },
        {
            q: "¿Qué obtengo al finalizar el test?",
            a: "Recibirás los 3 eneatipos más cercanos a tu personalidad. Si deseas una mayor precisión y un análisis profundo de tu perfil completo, podrás optar por realizar nuestro autodiagnóstico avanzado."
        },
        {
            q: "¿Qué tan preciso es el resultado?",
            a: "El test es altamente efectivo si respondes con total honestidad desde quién eres realmente, y no desde quién te gustaría ser o quién crees que deberías ser."
        },
        {
            q: "¿Necesito conocimientos previos del Eneagrama?",
            a: "Para nada. El test está diseñado para guiarte paso a paso de forma intuitiva. Solo necesitas disposición para observarte con sinceridad."
        },
        {
            q: "¿Qué pasa si me identifico con más de un eneatipo?",
            a: "Es normal, todos tenemos rasgos de varios tipos. El test te ayudará a identificar tu 'esencia' o eneatipo base, que es el punto de partida para tu crecimiento."
        }
    ];


    useEffect(() => {
        let lastScrollY = window.scrollY;
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsScrolled(currentScrollY > 20);
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

    const handleAction = () => {
        navigate('/eneagrama-test-intro');
    };

    return (
        <div id="inicio" className="eneagrama-landing-container">
            {/* Background Layer */}
            <div className="el-bg-glow"></div>

            {/* 1. Header Navigation */}
            <nav className={`el-nav ${isScrolled ? 'scrolled' : ''} ${navHidden ? 'nav-hidden' : ''}`}>
                <div className="el-nav-content">
                    <div className="el-logo-wrapper">
                        <img src="/Logo-Blanco.png" alt="Auténticos Logo" className="el-logo" />
                    </div>

                    <div className="el-nav-links">
                        <a href="#inicio" className="el-nav-link">Inicio</a>
                        <a href="#dominios" className="el-nav-link">Eneatipos</a>
                        <a href="#testimonios" className="el-nav-link">Testimonios</a>
                        <a href="#preguntas" className="el-nav-link">Preguntas</a>
                    </div>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <section className="el-hero el-animate">
                <div className="el-section-content el-hero-container">
                    <div className="el-hero-inner">
                        {/* 1. Text Column */}
                        <div className="el-hero-text">
                            <h1 className="el-hero-title">
                                <span className="el-hero-title-top">Deja de vivir en automático…</span>
                                <span className="el-gold-text">y descubre tus patrones internos.</span>
                            </h1>

                            <p className="el-hero-subtitle">
                                Tu personalidad tiene un código oculto que dicta cómo reaccionas, cómo amas y por qué te bloqueas. <br />
                                Realiza nuestro test gratuito y obtén el mapa exacto de tu esencia en menos de 5 minutos.
                            </p>
                        </div>

                        {/* 2. Radar Chart Column */}
                        <div className="el-hero-video-section">
                            <div className="el-video-square-wrapper">
                                <video 
                                    src="/Videos/Eneagrama-Autenticos-landing.mp4" 
                                    className="el-hero-video"
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline
                                    preload="metadata"
                                />
                                <div className="el-video-overlay-glow"></div>
                            </div>
                        </div>

                        {/* 3. Actions Column (Now separate to control order) */}
                        <div className="el-hero-actions">
                            <button onClick={handleAction} className="el-btn-main">
                                INICIAR MI TEST GRATUITO
                                <ArrowRight size={22} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="el-scroll-indicator">
                    <ChevronDown size={24} />
                </div>
            </section>

            {/* 3. Empathy Section */}
            <section className="el-section el-animate" style={{ background: '#ffffff', color: '#002d44', padding: '100px 24px' }}>
                <div className="el-section-content el-empathy-container">
                    <h2 className="el-section-title" style={{ 
                        fontWeight: '900', 
                        textAlign: 'center', 
                        marginBottom: '60px',
                        color: '#002d44'
                    }}>
                        ¿Te cuesta entender el <span style={{ color: '#ddbe3d' }}>"por qué" de tus acciones?</span>
                    </h2>

                    <div className="el-empathy-grid">
                        {[
                            "Sabes lo que haces, pero no logras ver la motivación real que hay detrás.",
                            "Te sientes desconectado de tus emociones, operando casi siempre desde la lógica.",
                            "A menudo te sientes incomprendido, como si hablaras un lenguaje diferente al resto.",
                            "Notas que evitas el conflicto a toda costa, sacrificando tu propia paz interior.",
                            "Te exiges resultados constantes, pero el éxito no te trae la satisfacción esperada.",
                            "Sientes que hay una versión de ti más auténtica que aún no logras liberar."
                        ].map((text, i) => (
                            <div key={i} className="el-empathy-item">
                                <div className="el-empathy-bullet"></div>
                                <p className="el-empathy-text">{text}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button onClick={handleAction} className="el-btn-main">
                            CONOCER MI ENEATIPO GRATIS
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 4. 9 Eneatipos Section */}
            <section id="dominios" className="el-section el-animate">
                <div className="el-section-content">
                    <h2 className="el-section-title" style={{ textAlign: 'center', marginBottom: '20px' }}>
                        Explora los <span className="el-gold-text" style={{ display: 'inline' }}>9 Eneatipos</span>
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
                        El Eneagrama no te encasilla, te libera al mostrarte los patrones inconscientes <br />
                        que hoy están dirigiendo tu vida. Descubre las 9 formas de ver el mundo:
                    </p>
                    
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                        gap: '30px',
                        maxWidth: '1200px',
                        margin: '0 auto'
                    }}>
                        {[
                            { n: 1, t: "Eneatipo 1", d: "Ordenado, íntegro y responsable. Busca la mejora constante y vivir en coherencia ética." },
                            { n: 2, t: "Eneatipo 2", d: "Cálido, generoso y servicial. Busca sentirse amado y necesario a través de la conexión." },
                            { n: 3, t: "Eneatipo 3", d: "Eficiente, exitoso y motivado. Busca destacar y alcanzar resultados para ser admirado." },
                            { n: 4, t: "Eneatipo 4", d: "Profundo, sensible y auténtico. Busca su identidad única y expresar su verdad emocional." },
                            { n: 5, t: "Eneatipo 5", d: "Analítico, observador y autónomo. Busca comprender el mundo para sentirse preparado." },
                            { n: 6, t: "Eneatipo 6", d: "Leal, responsable y preventivo. Busca seguridad y apoyo anticipando riesgos." },
                            { n: 7, t: "Eneatipo 7", d: "Entusiasta, optimista y libre. Busca experiencias y nuevas posibilidades evitando el dolor." },
                            { n: 8, t: "Eneatipo 8", d: "Intenso, directo y protector. Busca el control de su destino y justicia ante la vulnerabilidad." },
                            { n: 9, t: "Eneatipo 9", d: "Calmado, conciliador y estable. Busca armonía y paz interior evitando el conflicto directo." }
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
                                cursor: 'default',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                                <div style={{ 
                                    width: '100px', 
                                    height: '100px', 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    <img 
                                        src={`/eneatipo-${item.n}.png`} 
                                        alt={item.t} 
                                        style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'contain',
                                            filter: 'drop-shadow(0 0 15px rgba(221, 190, 61, 0.3))'
                                        }} 
                                    />
                                </div>
                                <div>
                                    <h4 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>{item.t}</h4>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>{item.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button onClick={handleAction} className="el-btn-main">
                            DESCUBRIR MI ENEATIPO
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>



            {/* 7. Testimonials Section */}
            <section id="testimonios" className="el-section el-animate" style={{ background: '#ffffff', color: '#002d44', padding: '100px 24px' }}>
                <div className="el-section-content">
                    <h2 className="el-section-title" style={{ textAlign: 'center', marginBottom: '20px', color: '#002d44' }}>
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

                    <div className="el-testimonials-container">
                        <div 
                            className="el-testimonials-track"
                            style={{ 
                                transform: `translateX(calc(-${testimonialIndex * 380}px))`,
                                transition: transitionEnabled 
                                    ? (isPlaying ? 'transform 5s linear' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)') 
                                    : 'none',
                                animation: 'none'
                            }}
                        >
                            {[...testimonials, ...testimonials.slice(0, 5)].map((t, i) => (
                                <div key={i} className="el-testimonial-card" style={t.video ? { padding: '0', overflow: 'hidden' } : {}}>
                                    {t.video ? (
                                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ width: '100%', height: '240px', background: '#000' }}>
                                                <video 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    controls
                                                    preload="none"
                                                    playsInline
                                                >
                                                    <source src={t.video} type="video/mp4" />
                                                    Tu navegador no soporta la reproducción de video.
                                                </video>
                                            </div>
                                            <div className="el-testimonial-footer" style={{ padding: '10px 25px 20px', borderTop: 'none', background: '#f8f9fa', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div className="el-stars">
                                                    {[...Array(t.stars)].map((_, si) => (
                                                        <Star key={si} size={16} fill="#ddbe3d" color="#ddbe3d" />
                                                    ))}
                                                </div>
                                                <span className="el-testimonial-author">- {t.author}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <span className="el-quote-icon">“</span>
                                                <p className="el-testimonial-text">{t.text}</p>
                                            </div>
                                            <div className="el-testimonial-footer">
                                                <div className="el-stars">
                                                    {[...Array(t.stars)].map((_, si) => (
                                                        <Star key={si} size={16} fill="#ddbe3d" color="#ddbe3d" />
                                                    ))}
                                                </div>
                                                <span className="el-testimonial-author">- {t.author}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonials Controls */}
                    <div className="el-testimonials-controls">
                        <button onClick={handlePrev} className="el-testimonial-btn" aria-label="Anterior">
                            <ArrowLeft size={24} />
                        </button>
                        <button onClick={togglePlay} className="el-testimonial-btn el-play-pause" aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
                            {isPlaying ? <Pause size={24} /> : <PlayCircle size={24} />}
                        </button>
                        <button onClick={() => handleNext(true)} className="el-testimonial-btn" aria-label="Siguiente">
                            <ArrowRight size={24} />
                        </button>
                    </div>

                    <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button onClick={handleAction} className="el-btn-main">
                            Obtener mi diagnóstico
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>



            {/* 10. FAQ */}
            <section id="preguntas" className="el-faq-section el-animate" style={{ 
                background: 'linear-gradient(to bottom, #002d44 0%, #001a29 100%)', 
                color: '#ffffff' 
            }}>
                <div className="el-section-content">
                    <h2 className="el-section-title" style={{ textAlign: 'center', marginBottom: '60px', color: '#ffffff' }}>
                        Preguntas <br className="el-mobile-br" /> <span style={{ color: '#ddbe3d' }}>frecuentes</span>
                    </h2>

                    <div className="el-faq-container">
                        {faqs.map((faq, i) => (
                            <div key={i} 
                                className={`el-faq-item ${openFaq === i ? 'active' : ''}`} 
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)'
                                }}
                            >
                                <div className="el-faq-question" style={{ color: '#ffffff' }}>
                                    <span>{faq.q}</span>
                                    {openFaq === i ? <Minus size={20} /> : <Plus size={20} />}
                                </div>
                                <div className="el-faq-answer" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                    <p>{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center' }}>
                        <button onClick={handleAction} className="el-btn-main">
                            Empezar ahora
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 11. Footer */}
            <footer className="el-footer">
                <div className="el-footer-content">
                    <a href="https://www.autenticos.co/" target="_blank" rel="noopener noreferrer">
                        <img src="/logo-azul.png" alt="Auténticos" className="el-footer-logo" />
                    </a>
                    <div className="el-footer-social">
                        <a href="https://www.autenticos.co/" target="_blank" rel="noopener noreferrer"><Globe size={18} /></a>
                        <a href="https://www.instagram.com/autenticos.co/" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
                        <a href="https://www.facebook.com/clubautenticos" target="_blank" rel="noopener noreferrer"><Facebook size={18} /></a>
                        <a href="https://www.youtube.com/@AutenticosTV" target="_blank" rel="noopener noreferrer"><Youtube size={18} /></a>
                        <a href="https://www.linkedin.com/company/autenticos/?viewAsMember=true" target="_blank" rel="noopener noreferrer"><Linkedin size={18} /></a>
                    </div>
                </div>
            </footer>

            {/* Mobile FAB */}
            <div className="el-mobile-fab">
                <button onClick={handleAction} className="el-btn-fab">
                    Quiero mi Test Gratuito
                </button>
            </div>
            {/* Botón Flotante WhatsApp */}
            <a 
                href="https://wa.me/573164287586?text=Hola,%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20test%20gratuito%20de%20Eneagrama"
                target="_blank"
                rel="noopener noreferrer"
                className="el-whatsapp-float"
            >
                <svg viewBox="0 0 24 24" width="35" height="35" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.123.553 4.197 1.604 6.013L0 24l6.135-1.61a11.782 11.782 0 005.912 1.583h.005c6.635 0 12.032-5.397 12.035-12.031a11.792 11.792 0 00-3.493-8.504z"/>
                </svg>
            </a>
        </div>
    );
};

export default EneagramaLanding;
