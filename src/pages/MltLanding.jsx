import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
    Star,
    ShieldCheck,
    Settings,
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
    ChevronUp,
    ArrowUp,
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
    Globe,
    Loader2,
    X
} from 'lucide-react';
import { getEnneagramInfo } from '../utils/calculator';
import MltInteractiveModel from '../components/MltInteractiveModel';
import FascinantesRadar from '../components/FascinantesRadar';
import PremiumBook3D from '../components/PremiumBook3D';
import './MltLanding.css';

const radarData = [
    { domain: 'Dominio Corporal', score: 49 }, // 70%
    { domain: 'Dominio Mental', score: 57.4 }, // 82%
    { domain: 'Dominio Emocional', score: 44.1 }, // 63%
    { domain: 'Dominio Social', score: 38.5 }, // 55%
    { domain: 'Dominio Espiritual', score: 54.6 }, // 78%
    { domain: 'Dominio Financiero', score: 35 }, // 50%
];

const MltLanding = ({ result, setTestResult }) => {
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

    // Form and Payment state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        city: ''
    });

    const mltConfig = {
        title: "Mapa de Claridad",
        price: 75000,
        name: "Mapa de Claridad MLT"
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: insertError } = await supabase
                .from('workshop_registrations')
                .insert([{
                    full_name: formData.full_name,
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone,
                    city: formData.city,
                    workshop_name: mltConfig.name,
                    amount: mltConfig.price,
                    payment_status: 'PENDING',
                    raw_data: {
                        source: 'MLT Landing'
                    }
                }])
                .select();

            if (insertError) throw insertError;

            const registrationId = data[0].id;

            localStorage.setItem('mlt_email', formData.email.trim().toLowerCase());
            localStorage.setItem('mlt_name', formData.full_name);

            const reference = `mlt-${registrationId}-${Date.now()}`;
            
            const { data: mpData, error: mpError } = await supabase.functions.invoke('create-mp-preference', {
                body: {
                    reference,
                    unit_price: mltConfig.price,
                    title: mltConfig.name,
                    user_email: formData.email,
                    back_url_custom: `${window.location.origin}/dominios-payment-status`
                }
            });

            if (mpError) throw mpError;
            if (mpData?.error) throw new Error(mpData.error);

            if (mpData?.init_point) {
                window.location.href = mpData.init_point;
            } else {
                throw new Error("No se pudo generar el link de pago.");
            }

        } catch (err) {
            console.error("Error en el registro:", err);
            setError("Hubo un problema al procesar tu registro. Por favor intenta de nuevo.");
            setLoading(false);
        }
    };

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
            q: "¿Master Live Training es un programa de liderazgo?",
            a: <>Sí y no.<br/><br/>Desarrollarás habilidades que fortalecerán tu liderazgo, pero Master Live Training va mucho más allá. Ha sido diseñado para desarrollar de manera integral a la persona que sostiene al líder, porque creemos que el liderazgo es una consecuencia de quién eres y no únicamente de lo que sabes.</>
        },
        {
            q: "¿Necesito ser empresario o dirigir un equipo para participar?",
            a: <>No.<br/><br/>Aunque muchos participantes son empresarios, directivos o líderes de equipos, la experiencia está dirigida a cualquier persona comprometida con su crecimiento personal y profesional que desee desarrollar una vida con mayor claridad, dirección, coherencia e impacto.</>
        },
        {
            q: "¿Cuánto tiempo debo dedicar al programa?",
            a: <>Hemos diseñado una experiencia exigente pero compatible con la vida profesional de personas ocupadas.<br/><br/>Además de las sesiones programadas, recomendamos destinar algunas horas semanales para la reflexión, las prácticas y la aplicación de los aprendizajes en tu vida personal y profesional.</>
        },
        {
            q: "¿Qué sucede si no puedo asistir a alguna sesión?",
            a: <>Las sesiones serán grabadas y estarán disponibles para los participantes, de manera que puedas mantener la continuidad del proceso.<br/><br/>Sin embargo, recomendamos participar en vivo siempre que sea posible, ya que gran parte del valor de la experiencia surge de la interacción con el grupo y de las conversaciones compartidas.</>
        },
        {
            q: "¿Es un proceso de coaching o terapia?",
            a: <>No.<br/><br/>Master Live Training es una experiencia de entrenamiento integral y desarrollo humano. Aunque promueve la reflexión profunda y el autoconocimiento, no reemplaza procesos terapéuticos ni intervenciones clínicas especializadas.</>
        },
        {
            q: "¿Qué ocurre después de los 90 días?",
            a: <>Los 90 días representan el inicio del camino, no el final.<br/><br/>Quienes lo deseen podrán continuar profundizando en su desarrollo a través de nuevas experiencias, espacios de acompañamiento y una comunidad diseñada para seguir creciendo y evolucionando en el tiempo.</>
        },
        {
            q: "¿Por qué existe un proceso de aplicación?",
            a: <>Porque queremos construir un grupo comprometido y alineado con el propósito de la experiencia.<br/><br/>La aplicación nos permite conocerte mejor, comprender tus expectativas y asegurarnos de que Master Live Training sea el camino adecuado para ti en este momento de tu vida.</>
        },
        {
            q: "¿La inversión incluye todos los materiales y recursos?",
            a: <>Sí.<br/><br/>La inversión incluye el acceso a las experiencias, conversatorios, diagnósticos, materiales de trabajo, recursos descargables, grabaciones, certificado de participación y la Colección Legacy de Auténticos que recibirás al finalizar el proceso.</>
        }
    ];


    // Scroll listener removed to prevent performance issues and white screen crashes

    const handleAction = () => {
        setIsModalOpen(true);
    };

    return (
        <div id="inicio" className="dominios-landing-container">
            {/* Background Layer */}
            <div className="mlt-bg-glow"></div>

            {/* 1. Header Navigation */}
            <nav className={`mlt-nav ${isScrolled ? 'scrolled' : ''} ${navHidden ? 'nav-hidden' : ''}`}>
                <div className="mlt-nav-content">
                    <div className="mlt-logo-wrapper">
                        <img src="/Logo-Blanco.png" alt="Auténticos Logo" className="mlt-logo" />
                    </div>

                    <div className="mlt-nav-links">
                        <a href="#inicio" className="mlt-nav-link">Inicio</a>
                        <a href="#desarrollo-humano" className="mlt-nav-link">Desarrollo humano</a>
                        <a href="#preguntas" className="mlt-nav-link">Preguntas</a>
                        <a href="#precios" className="mlt-nav-link">Inversión</a>
                    </div>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <section className="mlt-hero mlt-animate">
                <div className="mlt-section-content mlt-hero-container">
                    <div>
                        {/* 1. Full width header */}
                        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                            <h1 className="mlt-hero-title" style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', lineHeight: '1.3', marginBottom: '20px', textAlign: 'center', maxWidth: '900px', margin: '0 auto 20px auto' }}>
                                Recupera la claridad, la confianza y la dirección necesarias para liderar mejor <span style={{ color: '#ddbe3d' }}>tu vida, tu equipo y tu futuro.</span>
                            </h1>
                            <h2 style={{ color: '#ddbe3d', fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: '600', letterSpacing: '0.02em', margin: '0' }}>
                                Desarrolla a la persona que sostiene al líder.
                            </h2>
                        </div>

                        {/* 2. Video placeholder */}
                        <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto 60px auto', background: '#000000', aspectRatio: '16/9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <p style={{ color: '#ffffff', opacity: 0.5, fontSize: '18px', fontWeight: '500', letterSpacing: '2px' }}>[ ESPACIO PARA VIDEO ]</p>
                        </div>

                        {/* 3. Content Grid (Text + Image) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px', alignItems: 'center', marginBottom: '60px', textAlign: 'left' }}>
                            {/* Left: Text & List */}
                            <div>
                                <p style={{ fontSize: '20px', lineHeight: '1.6', marginBottom: '35px', color: 'rgba(255,255,255,0.9)' }}>
                                    Has crecido profesionalmente, asumido mayores responsabilidades y hoy tomas decisiones que impactan a otras personas. Sin embargo, sabes que el siguiente nivel de liderazgo no depende únicamente de nuevas herramientas, sino de quién eres y de quién estás llamado a convertirte.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                    {[
                                        "90 días de entrenamiento intensivo",
                                        "5 experiencias inmersivas",
                                        "6 conversatorios en vivo",
                                        "Comunidad exclusiva",
                                        "Acompañamiento continuo",
                                        "Solo 20 participantes"
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', fontWeight: '600' }}>
                                            <CheckCircle2 size={22} color="#ddbe3d" style={{ flexShrink: 0 }} />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Image */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <img 
                                    src="/MLT-2.png" 
                                    alt="Master Live Training" 
                                    style={{ 
                                        width: '100%', 
                                        maxWidth: '450px', 
                                        height: 'auto', 
                                        borderRadius: '24px', 
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }} 
                                />
                            </div>
                        </div>

                        {/* 4. Centered CTA */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button onClick={handleAction} className="mlt-btn-main" style={{ padding: '20px 45px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                Aplicar a la Primera Generación
                                <ArrowRight size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mlt-scroll-indicator">
                    <ChevronDown size={24} />
                </div>
            </section>

            {/* 3. Empathy Section */}
            <section className="mlt-section mlt-animate" style={{ background: '#ffffff', color: '#002d44', padding: '100px 24px' }}>
                <div className="mlt-section-content mlt-empathy-container">
                    <h2 className="mlt-section-title" style={{ 
                        fontWeight: '900', 
                        textAlign: 'center', 
                        marginBottom: '60px',
                        color: '#002d44'
                    }}>
                        ¿Te resulta <span style={{ color: '#ddbe3d' }}>familiar?</span>
                    </h2>

                    <div className="mlt-empathy-grid">
                        {[
                            "Has crecido profesionalmente y asumido mayores responsabilidades.",
                            "Cada vez más personas dependen de tus decisiones.",
                            "Te cuesta delegar algunas responsabilidades importantes.",
                            "Existen conversaciones y conflictos que consumen más energía de la necesaria.",
                            "El tiempo parece insuficiente para todo lo que quieres lograr.",
                            "Aunque sigues avanzando, a veces te preguntas si realmente estás construyendo la vida que deseas."
                        ].map((text, i) => (
                            <div key={i} className="mlt-empathy-item">
                                <div className="mlt-empathy-bullet"></div>
                                <p className="mlt-empathy-text">{text}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '60px', maxWidth: '800px', margin: '60px auto 0 auto', textAlign: 'left' }}>
                        <p style={{ fontSize: '20px', lineHeight: '1.6', marginBottom: '20px', color: '#002d44' }}>
                            Tal vez no te faltan más conocimientos, herramientas o capacidades.<br />
                            Lo que quizás estás buscando es algo más profundo: <strong style={{ color: '#ddbe3d' }}>claridad, dirección y fortaleza personal</strong> para sostener el nivel de impacto que deseas generar.
                        </p>
                        <p style={{ fontSize: '20px', lineHeight: '1.6', marginBottom: '30px', color: '#002d44' }}>
                            La mayoría de las personas intenta resolver los desafíos de su vida incorporando más herramientas, más información o nuevas estrategias.<br />
                            Y aunque todo eso puede ayudar, llega un momento en el que deja de ser suficiente.
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
                            {[
                                "Porque el problema no siempre está en lo que haces.",
                                "Muchas veces está en quién eres mientras lo haces.",
                                "Puedes aprender nuevas técnicas de liderazgo y seguir sintiéndote confundido.",
                                "Puedes mejorar tu productividad y continuar agotado.",
                                "Puedes alcanzar nuevas metas y aun así sentir que algo importante falta.",
                                "Puedes generar más resultados sin experimentar una mayor sensación de plenitud."
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', fontSize: '18px', color: '#002d44' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ddbe3d', marginTop: '10px', flexShrink: 0 }}></div>
                                    <span style={{ fontWeight: '500' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button onClick={handleAction} className="mlt-btn-main">
                            Aplicar al Master Live Training
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 3.5. Why this happens Section */}
            <section className="mlt-section mlt-animate" style={{ padding: '100px 24px', position: 'relative' }}>
                <div className="mlt-section-content mlt-why-grid" style={{ padding: 0 }}>
                    
                    {/* Left: Text */}
                    <div className="mlt-why-left" style={{ textAlign: 'left' }}>
                        <h2 className="mlt-section-title" style={{ color: '#ddbe3d', marginBottom: '30px', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800' }}>
                            ¿Por qué ocurre esto?
                        </h2>
                        <div style={{ fontSize: '18px', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <p>
                                La mayoría de las personas dedica buena parte de su vida a desarrollar capacidades, adquirir conocimientos, construir relaciones, alcanzar metas y generar resultados. Todo eso es importante. De hecho, gran parte de lo que hoy eres existe gracias a ese esfuerzo.
                            </p>
                            <p>Sin embargo, llega un momento en el que algo cambia.</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginLeft: '10px' }}>
                                {[
                                    "Las responsabilidades aumentan.",
                                    "Los desafíos se vuelven más complejos.",
                                    "Las decisiones tienen mayores consecuencias.",
                                    "Aquello que antes parecía suficiente deja de serlo."
                                ].map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                                        <CheckCircle2 size={18} color="#ddbe3d" style={{ flexShrink: 0 }} />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <p>
                                No es porque hayas hecho algo mal ni porque te falten herramientas. Lo que realmente sucede es que la vida que quieres construir requiere una versión más grande de ti.
                            </p>
                        </div>
                    </div>

                    {/* Right: Image (Logo) */}
                    <div className="mlt-why-image">
                        <img 
                            src="/Logo-Diagnostico-empresarial-01.png" 
                            alt="Diagnóstico Empresarial" 
                            style={{ 
                                width: '100%', 
                                maxWidth: '450px', 
                                height: 'auto', 
                                objectFit: 'contain',
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                display: 'block'
                            }} 
                        />
                    </div>
                    
                    {/* Left: Image (Water Glass) */}
                    <div className="mlt-why-left-image" style={{ marginTop: '40px' }}>
                        <img 
                            src="/Baso de agua.jpg" 
                            alt="Capacidad y Agua" 
                            style={{ 
                                width: '100%', 
                                maxWidth: '100%', 
                                height: 'auto', 
                                borderRadius: '24px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                objectFit: 'cover'
                            }} 
                        />
                    </div>
                    
                    {/* Right: Extra Text (Continuation) */}
                    <div className="mlt-why-right-text" style={{ fontSize: '18px', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', textAlign: 'left', width: '100%', marginTop: '40px' }}>
                        <p style={{ marginBottom: '20px' }}>
                            Muchas personas intentan responder a ese llamado trabajando más, haciendo cursos o esforzándose cada vez más. Pero pocas se detienen a preguntarse si han desarrollado la capacidad necesaria para sostener aquello que desean recibir.
                        </p>
                        <p style={{ marginBottom: '30px' }}>
                            Es como intentar llenar un recipiente pequeño con una cantidad cada vez mayor de agua. No importa cuánto llegue desde afuera si la capacidad para contenerlo sigue siendo la misma.
                        </p>
                        <p style={{ marginBottom: '20px', fontWeight: 'bold', color: '#ddbe3d' }}>
                            No puedes recibir más si el envase sigue siendo pequeño.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px', marginLeft: '10px' }}>
                            {[
                                "No puedes sostener una empresa más grande con la misma mentalidad que te permitió construirla.",
                                "No puedes liderar más personas sin expandir tu capacidad para comprenderlas, inspirarlas y acompañarlas.",
                                "No puedes aspirar a una vida más plena sin desarrollar primero a la persona que habrá de vivirla."
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                    <CheckCircle2 size={18} color="#ddbe3d" style={{ flexShrink: 0, marginTop: '3px' }} />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                        <p style={{ marginBottom: '15px' }}>
                            Porque tarde o temprano toda construcción encuentra un límite. Y ese límite siempre es la estructura que la sostiene. La pregunta no es únicamente cuánto más quieres lograr, la pregunta es:
                        </p>
                        <p style={{ fontWeight: 'bold', color: '#ddbe3d', fontSize: '20px' }}>
                            ¿Quién necesitas llegar a ser para sostener la vida, el liderazgo y el impacto que deseas construir?
                        </p>
                    </div>

                </div>
            </section>

            {/* 4. Why changes don't last Section */}
            <section className="mlt-section mlt-animate" style={{ background: '#ffffff', padding: '100px 24px', position: 'relative' }}>
                <div className="mlt-section-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 className="mlt-section-title" style={{ color: '#002d44', marginBottom: '40px', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800' }}>
                        ¿Por qué la mayoría de los cambios no duran?
                    </h2>
                    <div style={{ fontSize: '18px', lineHeight: '1.6', color: 'rgba(0, 45, 68, 0.9)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <p>
                            Muchas personas han leído libros, asistido a conferencias, tomado cursos o participado en procesos de desarrollo personal y profesional. Aunque suelen obtener aprendizajes valiosos, con frecuencia descubren que, después de algunas semanas o meses, vuelven a los mismos hábitos, las mismas dinámicas y los mismos resultados.
                        </p>
                        <p>
                            Esto no ocurre porque les falte disciplina o buenas intenciones. Ocurre porque la mayoría de estos procesos trabajan aspectos aislados de la persona.
                        </p>
                        <p>
                            Algunos se enfocan en liderazgo. Otros en productividad, comunicación, bienestar o habilidades específicas. El problema es que la vida no funciona por partes.
                        </p>
                        <p>
                            Tus resultados son el reflejo de tus acciones. Tus acciones son el reflejo de tus pensamientos y emociones. Y tus pensamientos y emociones son, en gran medida, una manifestación de tus creencias, paradigmas y la forma en que te comprendes a ti mismo.
                        </p>
                        <p>
                            Por eso los cambios superficiales rara vez generan resultados sostenibles. Puedes modificar una conducta durante un tiempo, pero si no transformas aquello que la origina, tarde o temprano volverás al mismo lugar.
                        </p>
                        <p>
                            Cuando comprendes que tu forma de pensar, sentir, relacionarte, liderar y actuar están profundamente conectadas, dejas de verte como un conjunto de piezas separadas y empiezas a comprenderte como un sistema.
                        </p>
                        <p>
                            Por eso Master Live Training fue diseñado como un sistema integral de desarrollo humano. No trabajamos únicamente sobre lo que haces. Trabajamos sobre quién eres, cómo piensas, qué te inspira, cómo te relacionas, cómo lideras y cómo construyes una vida más coherente con aquello que realmente importa.
                        </p>
                        <p style={{ fontWeight: 'bold' }}>
                            Porque creemos que los cambios más profundos y sostenibles ocurren cuando la persona se desarrolla de manera integral y no cuando intenta mejorar una sola parte de su vida mientras descuida las demás.
                        </p>
                    </div>
                </div>
            </section>

            {/* 4.5. Modelo de Formación (Ported) */}
            <section id="desarrollo-humano" className="mlt-section mlt-animate" style={{ padding: '100px 24px', position: 'relative' }}>
                <div className="mlt-section-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="mlt-section-title" style={{ marginBottom: '20px' }}>
                            Las cinco dimensiones del <span style={{ color: '#ddbe3d' }}>desarrollo humano</span>
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', maxWidth: '900px', margin: '0 auto', lineHeight: '1.6' }}>
                            A lo largo de nuestra experiencia hemos descubierto que las personas no transforman su vida trabajando un único aspecto de sí mismas. La verdadera evolución ocurre cuando desarrollan de manera consciente las dimensiones fundamentales que dan forma a quienes son, a cómo viven y al impacto que generan.
                            <br /><br />
                            Por eso Master Live Training está construido sobre cinco dimensiones que se complementan entre sí y que, juntas, conforman una ruta integral de desarrollo humano.
                        </p>
                    </div>
                    
                    <MltInteractiveModel />
                </div>
            </section>

            {/* 5. 6 Pilares Section (White version) */}
            <section className="mlt-section mlt-animate" style={{ background: '#ffffff', color: '#002d44', padding: '100px 24px' }}>
                <div className="mlt-section-content">
                    <h2 className="mlt-section-title" style={{ textAlign: 'center', marginBottom: '20px', color: '#002d44' }}>
                        Lo que podrás llevarte <span className="mlt-gold-text" style={{ display: 'inline' }}>de esta experiencia</span>
                    </h2>
                    <p style={{ 
                        textAlign: 'center', 
                        fontSize: '1.1rem', 
                        lineHeight: '1.8',
                        color: 'rgba(0, 45, 68, 0.7)', 
                        marginBottom: '60px',
                        maxWidth: '900px',
                        margin: '0 auto 60px'
                    }}>
                        Cada persona llega a Master Live Training con una historia, unos desafíos y unos objetivos diferentes. Sin embargo, existe algo que suele repetirse en quienes recorren un proceso profundo de desarrollo humano: comienzan a verse a sí mismos, a sus relaciones y a su vida desde una perspectiva completamente diferente.<br /><br />
                        Al finalizar este proceso tendrás:
                    </p>
                    
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                        gap: '30px',
                        maxWidth: '1000px',
                        margin: '0 auto'
                    }}>
                        {[
                            { icon: <Eye size={32} />, t: "Claridad Personal", d: "Una comprensión mucho más clara de quién eres, cuáles son los patrones que impulsan o limitan tu crecimiento y qué aspectos de tu vida requieren mayor atención para alcanzar el siguiente nivel de desarrollo.", color: "#0097a7" },
                            { icon: <Target size={32} />, t: "Dirección y Enfoque", d: "Contarás con una hoja de ruta personal y profesional que te permitirá tomar decisiones con mayor intención, enfocar tu energía en lo que realmente importa y avanzar con una dirección más clara durante los próximos años.", color: "#e65100" },
                            { icon: <Zap size={32} />, t: "Liderazgo Consciente", d: "Habrás fortalecido tu capacidad para liderar, comunicarte, relacionarte y generar impacto de una forma más consciente y coherente con la persona que deseas llegar a ser.", color: "#f5b041" },
                            { icon: <Settings size={32} />, t: "Herramientas Prácticas", d: "Tendrás herramientas prácticas para continuar desarrollando tu cuerpo, tu mente, tus emociones, tus relaciones y tu liderazgo mucho después de haber terminado el programa.", color: "#2e7d32" },
                            { icon: <UserPlus size={32} />, t: "Comunidad de Crecimiento", d: "Formarás parte de una comunidad de personas comprometidas con su crecimiento, con quienes podrás compartir aprendizajes, desafíos y experiencias a lo largo del camino.", color: "#c62828" },
                            { icon: <Star size={32} />, t: "Coherencia de Vida", d: "Pero quizás el resultado más importante no sea algo que puedas medir fácilmente. Es la tranquilidad que surge cuando existe una mayor coherencia entre lo que piensas, lo que sientes, lo que haces y la vida que realmente quieres construir.", color: "#aa00ff" }
                        ].map((item, i) => (
                            <div key={i} className="mlt-white-card" style={{ 
                                background: '#e8ecef', 
                                padding: '30px', 
                                borderRadius: '24px',
                                border: '1px solid rgba(0, 45, 68, 0.08)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
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
                                    <h4 style={{ color: '#002d44', fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px' }}>{item.t}</h4>
                                    <p style={{ color: 'rgba(0, 45, 68, 0.6)', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>{item.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button onClick={handleAction} className="mlt-btn-main">
                            QUIERO ENTENDERME
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 6. ¿Cómo vivirás la experiencia? */}
            <section className="mlt-section mlt-animate">
                <div className="mlt-section-content">
                    <h2 className="mlt-section-title" style={{ textAlign: 'center', marginBottom: '40px' }}>
                        ¿Cómo vivirás <span className="mlt-gold-text" style={{ display: 'inline' }}>la experiencia?</span>
                    </h2>
                    
                    <div style={{ maxWidth: '900px', margin: '0 auto 50px', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.9)', marginBottom: '20px' }}>
                            Master Live Training ha sido diseñado para que el desarrollo no se quede en una buena conversación, una reflexión inspiradora o una idea interesante. <strong>Nuestro propósito es ayudarte a transformar el conocimiento en consciencia, la consciencia en acción y la acción en resultados sostenibles.</strong>
                        </p>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.7)', marginBottom: '40px' }}>
                            Durante 90 días recorrerás un proceso estructurado de entrenamiento integral que combina aprendizaje, reflexión, práctica, acompañamiento y comunidad. A lo largo de este recorrido participarás en:
                        </p>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                        gap: '24px',
                        maxWidth: '1000px',
                        margin: '0 auto 50px'
                    }}>
                        {[
                            { icon: <Rocket size={24} />, text: "5 experiencias inmersivas diseñadas para profundizar en las dimensiones fundamentales del desarrollo humano.", color: "#ddbe3d" },
                            { icon: <Handshake size={24} />, text: "6 conversatorios en vivo para reflexionar, compartir aprendizajes y resolver inquietudes junto a otros participantes.", color: "#00e5ff" },
                            { icon: <Target size={24} />, text: "Contenidos y recursos prácticos que te permitirán continuar trabajando entre cada encuentro.", color: "#ff9100" },
                            { icon: <Zap size={24} />, text: "Ejercicios de aplicación personal y profesional para llevar cada aprendizaje a tu realidad cotidiana.", color: "#ffee00" },
                            { icon: <UserPlus size={24} />, text: "Una comunidad exclusiva de líderes y empresarios comprometidos con su crecimiento y evolución.", color: "#00ff00" },
                            { icon: <CheckCircle2 size={24} />, text: "Acompañamiento permanente durante todo el proceso.", color: "#d500f9" }
                        ].map((item, i) => (
                            <div key={i} style={{ 
                                background: 'rgba(255,255,255,0.04)', 
                                padding: '24px', 
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                transition: 'all 0.3s ease',
                                cursor: 'default'
                            }} className="mlt-dark-hover-card">
                                <div style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    borderRadius: '14px', 
                                    background: `rgba(${parseInt(item.color.slice(1,3),16)}, ${parseInt(item.color.slice(3,5),16)}, ${parseInt(item.color.slice(5,7),16)}, 0.1)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: item.color,
                                    flexShrink: 0
                                }}>
                                    {item.icon}
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', lineHeight: '1.5', margin: 0 }}>
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '40px', background: 'rgba(221, 190, 61, 0.05)', borderRadius: '24px', border: '1px solid rgba(221, 190, 61, 0.2)' }}>
                        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.9)', marginBottom: '15px' }}>
                            La experiencia ha sido diseñada para generar un equilibrio entre reflexión y acción, entre desarrollo personal y aplicación práctica, entre crecimiento individual y aprendizaje colectivo.
                        </p>
                        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: '#ddbe3d', fontWeight: '700', margin: 0 }}>
                            No se trata únicamente de comprender nuevas ideas. Se trata de vivirlas, ponerlas en práctica y convertirlas en parte de la persona que estás llegando a ser.
                        </p>
                    </div>
                    
                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button onClick={handleAction} className="mlt-btn-main">
                            QUIERO ENTENDERME
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* NEW SECTION: En 90 días podrás llevarte */}
            <section className="mlt-section mlt-animate" style={{ background: '#ffffff', color: '#002d44', padding: '100px 24px' }}>
                <div className="mlt-section-content" style={{ maxWidth: '1200px' }}>
                    <h2 className="mlt-section-title" style={{ textAlign: 'center', marginBottom: '60px', color: '#002d44' }}>
                        En 90 días <span className="mlt-gold-text" style={{ display: 'inline' }}>podrás llevarte:</span>
                    </h2>
                    
                    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            "Mayor claridad sobre quién eres y hacia dónde quieres dirigir tu vida.",
                            "Identificación de los patrones que limitan tu crecimiento.",
                            "Una hoja de ruta personal y profesional para los próximos tres años.",
                            "Herramientas para fortalecer tu liderazgo y aumentar tu impacto.",
                            "Un plan de desarrollo integral para continuar creciendo.",
                            "Una comunidad de líderes y empresarios comprometidos con su evolución.",
                            "Una mayor sensación de coherencia entre la vida que vives y la vida que deseas construir."
                        ].map((text, i) => (
                            <div key={i} className="mlt-list-item-futuristic" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '24px',
                                padding: '16px 40px',
                                background: '#f0f4f8',
                                borderRadius: '16px',
                                borderLeft: '4px solid #ddbe3d',
                                cursor: 'default'
                            }}>
                                <div style={{
                                    fontSize: '3rem',
                                    fontWeight: '900',
                                    color: '#ddbe3d',
                                    opacity: 0.9,
                                    width: '70px',
                                    flexShrink: 0,
                                    fontFamily: 'monospace'
                                }}>
                                    0{i + 1}
                                </div>
                                <p style={{ color: '#002d44', fontSize: '1.15rem', lineHeight: '1.5', margin: 0, fontWeight: '500' }}>
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. ¿Para quién es? Section */}
            <section className="mlt-section mlt-animate">
                <div className="mlt-section-content" style={{ maxWidth: '1200px' }}>
                    <h2 className="mlt-section-title" style={{ textAlign: 'center', marginBottom: '20px' }}>
                        ¿Para quién es <span className="mlt-gold-text" style={{ display: 'inline' }}>Master Live Training?</span>
                    </h2>
                    <p style={{ 
                        textAlign: 'center', 
                        fontSize: '1.2rem', 
                        lineHeight: '1.8',
                        color: 'rgba(255,255,255,0.8)', 
                        marginBottom: '60px',
                        maxWidth: '900px',
                        margin: '0 auto 60px'
                    }}>
                        Este programa ha sido diseñado para empresarios, directivos, gerentes, líderes y profesionales que sienten un compromiso genuino con su crecimiento y están dispuestos a asumir la responsabilidad de su propio desarrollo.
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '40px',
                        marginBottom: '60px'
                    }}>
                        {/* Es para */}
                        <div style={{
                            background: 'rgba(0, 229, 255, 0.03)',
                            border: '1px solid rgba(0, 229, 255, 0.2)',
                            borderRadius: '24px',
                            padding: '40px',
                            boxShadow: '0 0 40px rgba(0, 229, 255, 0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }} className="mlt-dark-hover-card">
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '4px',
                                background: 'linear-gradient(90deg, transparent, #00e5ff, transparent)'
                            }} />
                            <h3 style={{ color: '#00e5ff', fontSize: '1.5rem', fontWeight: '800', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CheckCircle2 size={28} /> Es para personas que:
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {[
                                    "Han alcanzado logros importantes, pero sienten que existe un siguiente nivel de desarrollo personal y profesional por descubrir.",
                                    "Buscan mayor claridad sobre quiénes son, qué quieren construir y hacia dónde desean dirigir su vida.",
                                    "Desean fortalecer su liderazgo, aumentar su impacto y tomar decisiones más conscientes.",
                                    "Reconocen que el crecimiento sostenible requiere trabajar tanto en el ser como en el hacer.",
                                    "Están dispuestas a cuestionar creencias, revisar patrones y explorar nuevas posibilidades de desarrollo.",
                                    "Comprenden que las herramientas son importantes, pero saben que la verdadera transformación ocurre cuando la persona cambia.",
                                    "Valoran el aprendizaje, la reflexión y el intercambio con otras personas comprometidas con su evolución."
                                ].map((text, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                                        <div style={{ color: '#00e5ff', flexShrink: 0, marginTop: '2px' }}><CheckCircle2 size={20} /></div>
                                        <span>{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* NO es para */}
                        <div style={{
                            background: 'rgba(255, 50, 50, 0.03)',
                            border: '1px solid rgba(255, 50, 50, 0.2)',
                            borderRadius: '24px',
                            padding: '40px',
                            boxShadow: '0 0 40px rgba(255, 50, 50, 0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }} className="mlt-dark-hover-card">
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '4px',
                                background: 'linear-gradient(90deg, transparent, #ff3232, transparent)'
                            }} />
                            <h3 style={{ color: '#ff3232', fontSize: '1.5rem', fontWeight: '800', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <X size={28} /> ¿Para quién NO es?
                            </h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', marginBottom: '25px' }}>
                                Master Live Training probablemente no sea para ti si:
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {[
                                    "Buscas soluciones rápidas o resultados inmediatos sin un trabajo personal profundo.",
                                    "Esperas que alguien más resuelva por ti los desafíos que hoy enfrentas.",
                                    "No estás dispuesto a dedicar tiempo a reflexionar, practicar y aplicar lo que aprendas.",
                                    "Consideras que ya no tienes nada nuevo por aprender sobre ti mismo.",
                                    "Buscas únicamente herramientas de liderazgo, ventas, productividad o gestión sin trabajar sobre la persona que las utiliza.",
                                    "No estás dispuesto a cuestionar algunas de las ideas, hábitos o creencias que te han traído hasta aquí."
                                ].map((text, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                                        <div style={{ color: '#ff3232', flexShrink: 0, marginTop: '2px' }}><X size={20} /></div>
                                        <span>{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div style={{ 
                        maxWidth: '1000px', 
                        margin: '0 auto', 
                        textAlign: 'center', 
                        padding: '40px', 
                        background: 'linear-gradient(135deg, rgba(221, 190, 61, 0.1) 0%, rgba(221, 190, 61, 0.02) 100%)', 
                        borderRadius: '24px', 
                        border: '1px solid rgba(221, 190, 61, 0.3)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }}>
                        <p style={{ fontSize: '1.25rem', lineHeight: '1.7', color: '#ddbe3d', fontWeight: '800', margin: 0 }}>
                            Este no es un programa para quienes quieren hacer más, es un programa para quienes están dispuestos a convertirse en una mejor versión de sí mismos para sostener una vida, un liderazgo y un impacto mayor.
                        </p>
                    </div>

                </div>
            </section>

            {/* NEW SECTION: Por qué creamos Master Live Training? */}
            <section className="mlt-section mlt-animate" style={{ background: '#ffffff', color: '#002d44', padding: '120px 24px' }}>
                <div className="mlt-section-content" style={{ maxWidth: '1000px', textAlign: 'center' }}>
                    <h2 className="mlt-section-title" style={{ color: '#002d44', marginBottom: '40px' }}>
                        ¿Por qué creamos <span className="mlt-gold-text" style={{ display: 'inline' }}>Master Live Training?</span>
                    </h2>
                    
                    <p style={{ fontSize: '1.25rem', lineHeight: '1.8', color: 'rgba(0, 45, 68, 0.8)', marginBottom: '20px', fontWeight: '500' }}>
                        Durante más de dos décadas hemos acompañado a miles de personas, líderes, empresarios, emprendedores y equipos en procesos de desarrollo humano, liderazgo y transformación organizacional.
                    </p>
                    <p style={{ fontSize: '1.25rem', lineHeight: '1.8', color: 'rgba(0, 45, 68, 0.8)', marginBottom: '80px', fontWeight: '500' }}>
                        A lo largo de ese camino hemos observado algo que se repite una y otra vez. Personas brillantes, talentosas y comprometidas que, aun habiendo alcanzado importantes logros profesionales, continúan sintiendo preguntas que ninguna posición, reconocimiento o resultado parece responder completamente.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
                        {[
                            "¿Cómo encontrar una mayor claridad sobre mi vida?",
                            "¿Cómo ejercer un liderazgo más consciente?",
                            "¿Cómo sostener mayores responsabilidades sin perder el equilibrio?",
                            "¿Cómo crecer profesionalmente sin desconectarme de mí mismo?",
                            "¿Cómo construir una vida más coherente con aquello que realmente considero importante?"
                        ].map((q, i) => (
                            <div key={i} className="mlt-white-card" style={{
                                background: '#f8f9fa',
                                padding: '30px 40px',
                                borderRadius: '24px',
                                border: '1px solid rgba(0,45,68,0.05)',
                                borderLeft: '4px solid #ddbe3d',
                                maxWidth: '750px',
                                width: '90%',
                                alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '24px',
                                cursor: 'default'
                            }}>
                                <div style={{
                                    fontSize: '3rem',
                                    fontWeight: '900',
                                    color: 'transparent',
                                    WebkitTextStroke: '2px #ddbe3d',
                                    fontFamily: 'monospace',
                                    flexShrink: 0
                                }}>
                                    ?
                                </div>
                                <p style={{ fontSize: '1.25rem', margin: 0, fontWeight: '600', color: '#002d44', textAlign: 'left', lineHeight: '1.5' }}>
                                    {q}
                                </p>
                            </div>
                        ))}
                    </div>
                    
                    <p style={{ fontSize: '1.25rem', lineHeight: '1.8', color: '#002d44', marginTop: '60px', fontWeight: '600' }}>
                        Estas preguntas no suelen resolverse con más información. Requieren un proceso más profundo de autoconocimiento, reflexión, desarrollo y acción.
                    </p>
                </div>
            </section>

            {/* 6. Nosotros / Origen Section */}
            <section className="mlt-section mlt-animate" style={{ color: '#ffffff', padding: '120px 24px' }}>
                <div className="mlt-section-content" style={{ maxWidth: '1200px' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '60px',
                        alignItems: 'center'
                    }}>
                        {/* Text Column */}
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px', color: '#ffffff', lineHeight: '1.2' }}>
                                Master Live Training nace precisamente <span className="mlt-gold-text">de esa búsqueda.</span>
                            </h2>
                            <p style={{ fontSize: '1.25rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.85)', marginBottom: '20px' }}>
                                Es el resultado de años de experiencia acompañando personas, estudiando el comportamiento humano y desarrollando metodologías que permitan integrar crecimiento personal, liderazgo, propósito y consciencia en una sola experiencia. No creemos que exista una fórmula única para el éxito.
                            </p>
                            <p style={{ fontSize: '1.25rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.85)' }}>
                                Tampoco creemos que todas las personas deban recorrer el mismo camino. Lo que sí creemos es que cada ser humano posee un potencial mucho mayor del que normalmente expresa y que, cuando aprende a conocerse mejor, desarrollar sus capacidades y actuar de manera coherente con aquello que realmente importa, su vida comienza a transformarse de una manera mucho más profunda y sostenible. Ese es el propósito que da origen a Master Live Training.
                            </p>
                        </div>

                        {/* Image Column */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                                width: '100%',
                                maxWidth: '500px',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <img 
                                    src="/Bombillo-2.gif" 
                                    alt="Origen Master Live Training" 
                                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6.5. Trayectoria Section */}
            <section className="mlt-section mlt-animate" style={{ background: '#ffffff', color: '#002d44', padding: '120px 24px' }}>
                <div className="mlt-section-content" style={{ maxWidth: '1200px' }}>
                    <h2 className="mlt-section-title" style={{ textAlign: 'center', marginBottom: '80px', color: '#002d44' }}>
                        Algunos datos de <span className="mlt-gold-text">esta trayectoria:</span>
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '30px',
                        marginBottom: '80px'
                    }}>
                        {[
                            { 
                                value: "+25", 
                                label: "Años de experiencia", 
                                text: "En procesos de desarrollo humano, liderazgo y emprendimiento." 
                            },
                            { 
                                value: "+18", 
                                label: "Años de trayectoria", 
                                text: "Como conferencista y facilitador a nivel nacional e internacional." 
                            },
                            { 
                                value: "+58k", 
                                label: "Personas impactadas", 
                                text: "A través de conferencias, seminarios y programas de entrenamiento." 
                            },
                            { 
                                value: "32+", 
                                label: "Ciudades y 6 países", 
                                text: "Llevando el mensaje y expandiendo metodologías por el mundo." 
                            },
                            { 
                                icon: <Zap size={56} color="#ddbe3d" strokeWidth={1.5} />, 
                                label: "Metodologías Propias", 
                                text: "Creador de herramientas exclusivas de autoconocimiento, liderazgo y desarrollo integral." 
                            },
                            { 
                                icon: <UserPlus size={56} color="#ddbe3d" strokeWidth={1.5} />, 
                                label: "Acompañamiento", 
                                text: "Experiencia guiando líderes, empresarios, equipos y organizaciones en procesos de transformación." 
                            }
                        ].map((item, i) => (
                            <div key={i} className="mlt-white-card" style={{
                                background: '#f8f9fa',
                                padding: '40px 30px',
                                borderRadius: '24px',
                                border: '1px solid rgba(0,45,68,0.05)',
                                borderTop: '4px solid #ddbe3d',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                transition: 'all 0.4s ease',
                                cursor: 'default',
                                position: 'relative'
                            }}>
                                <div style={{
                                    fontSize: item.value ? '4rem' : '1rem',
                                    fontWeight: '900',
                                    color: 'transparent',
                                    WebkitTextStroke: '2px #002d44',
                                    marginBottom: '15px',
                                    fontFamily: 'monospace',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '80px'
                                }}>
                                    {item.value || item.icon}
                                </div>
                                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#002d44', marginBottom: '15px' }}>
                                    {item.label}
                                </h4>
                                <p style={{ fontSize: '1rem', color: 'rgba(0,45,68,0.7)', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, #002d44 0%, #001a29 100%)',
                        padding: '60px',
                        borderRadius: '30px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(221, 190, 61, 0.2)'
                    }}>
                        <p style={{ 
                            fontSize: '1.4rem', 
                            lineHeight: '1.8', 
                            color: 'rgba(255,255,255,0.95)', 
                            margin: 0, 
                            fontWeight: '500',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            Más que cifras, estos años han dejado una convicción profunda: <span style={{ color: '#ddbe3d', fontWeight: '800' }}>las personas no necesitan únicamente solo información.</span><br/><br/>
                            Necesitan espacios, conversaciones, experiencias y caminos que les ayuden a integrar lo que saben, reconocer quiénes son y convertirse en personas más conscientes, sólidas y coherentes con la vida que desean construir.
                        </p>
                    </div>
                </div>
            </section>

            {/* 6.6. 20 Cupos Section */}
            <section className="mlt-section mlt-animate" style={{ padding: '120px 24px' }}>
                <div className="mlt-section-content" style={{ maxWidth: '900px', textAlign: 'center' }}>
                    <h2 className="mlt-section-title" style={{ marginBottom: '50px' }}>
                        Por esta razón hemos decidido abrir únicamente <span className="mlt-gold-text">20 cupos.</span>
                    </h2>
                    
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                        fontSize: '1.25rem',
                        lineHeight: '1.8',
                        color: 'rgba(255,255,255,0.85)',
                        textAlign: 'left'
                    }}>
                        <p style={{ margin: 0 }}>
                            Queremos construir una experiencia cercana, profunda y significativa, en la que cada participante tenga la oportunidad de ser escuchado, acompañado y retado en su proceso de desarrollo.
                        </p>
                        <p style={{ margin: 0 }}>
                            No buscamos reunir a la mayor cantidad posible de personas, <strong style={{ color: '#ffffff' }}>buscamos identificar a las personas correctas.</strong>
                        </p>
                        <p style={{ margin: 0 }}>
                            Aquellas que sienten que ha llegado el momento de invertir en sí mismas, fortalecer la persona en la que se están convirtiendo y construir una vida más coherente con aquello que realmente consideran importante.
                        </p>
                        <p style={{ margin: 0 }}>
                            Los integrantes de esta <span style={{ color: '#ddbe3d', fontWeight: '600' }}>Primera Generación</span> no solo recorrerán el proceso completo de Master Live Training. También tendrán la oportunidad de convertirse en los miembros fundadores de una comunidad que seguirá creciendo y evolucionando durante los próximos años.
                        </p>
                        <p style={{ margin: 0 }}>
                            Por eso el ingreso se realiza mediante un proceso de aplicación. No porque sea un programa exclusivo para unos pocos, solo queremos asegurarnos de que las personas que ingresen estén preparadas para aprovechar plenamente esta experiencia y aportar valor al camino que recorrerán junto a otros participantes.
                        </p>
                    </div>

                    <div style={{ marginTop: '50px', padding: '30px', background: 'rgba(221, 190, 61, 0.1)', borderRadius: '16px', border: '1px solid rgba(221, 190, 61, 0.3)' }}>
                        <p style={{ fontSize: '1.4rem', color: '#ddbe3d', fontWeight: '700', margin: 0 }}>
                            Si sientes que este es tu momento, estaremos encantados de conocerte.
                        </p>
                    </div>
                </div>
            </section>

            {/* 7. Testimonials Section */}
            <section className="mlt-section mlt-animate" style={{ background: '#ffffff', color: '#002d44', padding: '100px 24px' }}>
                <div className="mlt-section-content">
                    <h2 className="mlt-section-title" style={{ textAlign: 'center', marginBottom: '20px', color: '#002d44' }}>
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

                    <div className="mlt-testimonials-container">
                        <div 
                            className="mlt-testimonials-track"
                            style={{ 
                                transform: `translateX(calc(-${testimonialIndex * 380}px))`,
                                transition: transitionEnabled 
                                    ? (isPlaying ? 'transform 5s linear' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)') 
                                    : 'none',
                                animation: 'none'
                            }}
                        >
                            {[...testimonials, ...testimonials.slice(0, 5)].map((t, i) => (
                                <div key={i} className="mlt-testimonial-card" style={t.youtubeId ? { padding: '0', overflow: 'hidden' } : {}}>
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
                                            <div className="mlt-testimonial-footer" style={{ padding: '10px 25px 20px', borderTop: 'none', background: '#f8f9fa', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div className="mlt-stars">
                                                    {[...Array(t.stars)].map((_, si) => (
                                                        <Star key={si} size={16} fill="#ddbe3d" color="#ddbe3d" />
                                                    ))}
                                                </div>
                                                <span className="mlt-testimonial-author">- {t.author}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <span className="mlt-quote-icon">“</span>
                                                <p className="mlt-testimonial-text">{t.text}</p>
                                            </div>
                                            <div className="mlt-testimonial-footer">
                                                <div className="mlt-stars">
                                                    {[...Array(t.stars)].map((_, si) => (
                                                        <Star key={si} size={16} fill="#ddbe3d" color="#ddbe3d" />
                                                    ))}
                                                </div>
                                                <span className="mlt-testimonial-author">- {t.author}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonials Controls */}
                    <div className="mlt-testimonials-controls">
                        <button onClick={handlePrev} className="mlt-testimonial-btn" aria-label="Anterior">
                            <ArrowLeft size={24} />
                        </button>
                        <button onClick={togglePlay} className="mlt-testimonial-btn mlt-play-pause" aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
                            {isPlaying ? <Pause size={24} /> : <PlayCircle size={24} />}
                        </button>
                        <button onClick={() => handleNext(true)} className="mlt-testimonial-btn" aria-label="Siguiente">
                            <ArrowRight size={24} />
                        </button>
                    </div>

                    <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button onClick={handleAction} className="mlt-btn-main">
                            Obtener mi diagnóstico
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 8. Precios */}
            <section id="precios" className="mlt-section">
                <div className="mlt-section-content">
                    <div className="mlt-pricing-wrapper-single mlt-animate">
                        <div className="mlt-pricing-card">
                            <div className="mlt-pricing-glow"></div>
                            
                            <div className="mlt-pricing-header">
                                <h3>Únete a la Primera Generación</h3>
                            </div>

                            <div className="mlt-pricing-content">
                                <div className="mlt-price-box">
                                    <span className="mlt-old-price" style={{ fontSize: '18px' }}>Valor de la experiencia: 3.800 <span style={{ fontSize: '0.8em', color: '#ddbe3d' }}>USD</span></span>
                                    
                                    <div style={{
                                        background: '#ddbe3d',
                                        color: '#002d44',
                                        padding: '8px 20px',
                                        borderRadius: '8px',
                                        fontWeight: '800',
                                        fontSize: '15px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginTop: '20px',
                                        marginBottom: '15px',
                                        display: 'inline-block',
                                        boxShadow: '0 0 20px rgba(221, 190, 61, 0.6)'
                                    }}>
                                        Valor especial Primera Generación
                                    </div>

                                    <div className="mlt-current-price" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', marginTop: '0' }}>
                                        2.900 <span style={{ color: '#ddbe3d', fontSize: '0.5em', fontWeight: '900' }}>USD</span>
                                    </div>
                                    <p style={{ fontSize: '15px', lineHeight: '1.5', color: '#002d44', opacity: 0.8, maxWidth: '600px', margin: '15px auto 30px' }}>
                                        La Primera Generación tendrá acceso a una condición preferencial de lanzamiento como reconocimiento a quienes decidan recorrer este camino desde el comienzo.
                                    </p>
                                </div>

                                <p style={{ fontWeight: 'bold', color: '#002d44', textAlign: 'left', marginBottom: '20px', fontSize: '18px' }}>Tu inscripción incluye:</p>
                                
                                <div className="mlt-pricing-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                                    {[
                                        "90 días de entrenamiento integral.",
                                        "6 conversatorios en vivo.",
                                        "5 experiencias inmersivas de desarrollo humano.",
                                        "Acompañamiento durante todo el proceso.",
                                        "Materiales de trabajo y recursos descargables.",
                                        "Acceso a las grabaciones de las sesiones.",
                                        "Comunidad exclusiva de participantes.",
                                        "Certificado de participación.",
                                        "Diagnósticos y herramientas de autoconocimiento.",
                                        "Colección Legacy de Auténticos y reconocimiento de graduación."
                                    ].map((item, i) => (
                                        <div key={i} className="mlt-pricing-item" style={{ textAlign: 'left', alignItems: 'center' }}>
                                            <CheckCircle2 size={18} color="#ddbe3d" style={{ flexShrink: 0, marginTop: '2px' }} /> 
                                            <span style={{ fontSize: '16px' }}>{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#002d44', marginTop: '30px', marginBottom: '30px', textAlign: 'center', fontStyle: 'italic', fontWeight: '500' }}>
                                    Más que una inversión en un programa, esta es una inversión en la persona que sostendrá todas las decisiones, relaciones, proyectos y resultados que construirás durante los próximos años.
                                </p>

                                <div className="mlt-btn-buy-wrapper">
                                    <button onClick={handleAction} className="mlt-btn-buy" style={{ fontSize: '18px', padding: '20px 40px' }}>
                                        APLICAR A LA PRIMERA GENERACIÓN <Lock size={22} />
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
                        <h3 className="mlt-section-title" style={{ 
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
            <section className="mlt-section" style={{ background: '#ffffff', color: '#002d44', padding: '100px 24px' }}>
                <div className="mlt-section-content" style={{ textAlign: 'center', maxWidth: '800px' }}>
                    <img 
                        src="/Nuestro Compromiso.png" 
                        alt="Nuestro Compromiso Auténticos" 
                        className="mlt-guarantee-img"
                    />
                    <h2 className="mlt-section-title" style={{ color: '#002d44', marginBottom: '30px' }}>
                        Nuestro <span style={{ color: '#ddbe3d' }}>compromiso contigo</span>
                    </h2>
                    <div style={{ textAlign: 'left', color: '#002d44', fontSize: '18px', lineHeight: '1.6', marginBottom: '40px' }}>
                        <p style={{ marginBottom: '15px' }}>
                            Sabemos que decidir invertir tiempo, energía y recursos en un proceso de desarrollo personal no es una decisión menor.
                        </p>
                        <p style={{ marginBottom: '15px' }}>
                            Por eso queremos ser claros sobre lo que puedes esperar de nosotros.
                        </p>
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '15px' }}>
                                <CheckCircle2 size={24} color="#ddbe3d" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <p style={{ margin: 0 }}>Nos comprometemos a poner a tu disposición toda nuestra experiencia, conocimiento, acompañamiento y dedicación para ayudarte a aprovechar al máximo esta experiencia.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '15px' }}>
                                <CheckCircle2 size={24} color="#ddbe3d" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <p style={{ margin: 0 }}>Nos comprometemos a crear un espacio seguro para la reflexión, el aprendizaje y el crecimiento. Entregándote herramientas, conversaciones, experiencias y recursos diseñados para generar cambios profundos y sostenibles.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '15px' }}>
                                <CheckCircle2 size={24} color="#ddbe3d" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <p style={{ margin: 0 }}>Nos comprometemos a acompañarte con honestidad, respeto y cercanía durante todo el proceso.</p>
                            </div>
                        </div>

                        <p style={{ marginBottom: '15px', fontStyle: 'italic', color: '#666' }}>
                            Sin embargo, hay algo que no podemos hacer por ti...
                        </p>
                        
                        <div style={{ background: 'rgba(221, 190, 61, 0.1)', padding: '25px', borderRadius: '12px', borderLeft: '5px solid #ddbe3d', marginBottom: '40px' }}>
                            <p style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#002d44' }}>
                                <strong>No podemos recorrer el camino en tu lugar.</strong>
                            </p>
                            <p style={{ margin: 0 }}>
                                No podemos tomar tus decisiones, realizar las prácticas que te corresponden, ni convertirnos en la persona que tú estás llamado a ser. La transformación siempre será el resultado del encuentro entre una experiencia significativa y una persona dispuesta a aprovecharla. Nosotros nos comprometemos con la experiencia.
                            </p>
                        </div>

                        <h3 style={{ fontWeight: '900', fontSize: 'clamp(24px, 4vw, 32px)', textAlign: 'center', marginTop: '40px', marginBottom: '50px', color: '#002d44', lineHeight: '1.3' }}>
                            La pregunta es: <br/>
                            <span style={{ color: '#ddbe3d' }}>¿Estás dispuesto a comprometerte contigo mismo?</span>
                        </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                        <button onClick={handleAction} className="mlt-btn-main" style={{ width: '100%', maxWidth: '400px', justifyContent: 'center' }}>
                            SÍ, ME COMPROMETO
                            <ArrowRight size={22} />
                        </button>
                        
                        <a href="#preguntas" style={{ 
                            width: '100%', 
                            maxWidth: '400px', 
                            padding: '18px', 
                            textAlign: 'center',
                            background: 'transparent',
                            color: '#002d44',
                            border: '2px solid #002d44',
                            borderRadius: '12px',
                            fontWeight: '800',
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#002d44';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#002d44';
                        }}
                        >
                            Aún tengo dudas
                        </a>
                    </div>
                </div>
            </section>

            {/* 10. FAQ */}
            <section id="preguntas" className="mlt-faq-section mlt-animate" style={{ 
                background: 'linear-gradient(to bottom, #002d44 0%, #001a29 100%)', 
                color: '#ffffff' 
            }}>
                <div className="mlt-section-content">
                    <h2 className="mlt-section-title" style={{ textAlign: 'center', marginBottom: '60px', color: '#ffffff' }}>
                        Preguntas <br className="mlt-mobile-br" /> <span style={{ color: '#ddbe3d' }}>frecuentes</span>
                    </h2>

                    <div className="mlt-faq-container">
                        {faqs.map((faq, i) => (
                            <div key={i} 
                                className={`mlt-faq-item ${openFaq === i ? 'active' : ''}`} 
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)'
                                }}
                            >
                                <div className="mlt-faq-question" style={{ color: '#ffffff' }}>
                                    <span>{faq.q}</span>
                                    {openFaq === i ? <Minus size={20} /> : <Plus size={20} />}
                                </div>
                                <div className="mlt-faq-answer" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                    <p>{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center' }}>
                        <button onClick={handleAction} className="mlt-btn-main">
                            Empezar ahora
                            <ArrowRight size={22} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 10.5 Final Call to Action */}
            <section className="mlt-section mlt-animate" style={{ background: '#ffffff', color: '#002d44', padding: '120px 24px' }}>
                <div className="mlt-section-content" style={{ maxWidth: '800px', textAlign: 'center' }}>
                    <h2 className="mlt-section-title" style={{ color: '#002d44', marginBottom: '50px' }}>
                        La vida que deseas construir ya te <span className="mlt-gold-text">está llamando.</span>
                    </h2>
                    
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        fontSize: '1.25rem',
                        lineHeight: '1.8',
                        color: 'rgba(0,45,68,0.85)',
                        textAlign: 'center',
                        marginBottom: '60px'
                    }}>
                        <p style={{ margin: 0 }}>
                            Quizás por eso llegaste hasta aquí. Tal vez porque una parte de ti sabe que ha llegado el momento de dedicar menos energía a intentar hacerlo todo mejor y más energía a desarrollar a la persona que sostiene todo aquello que has construido.
                        </p>
                        <div style={{ fontWeight: '600', color: '#002d44', margin: '20px 0' }}>
                            Has dedicado años a tu carrera.<br/>
                            A tu empresa.<br/>
                            A tu familia.<br/>
                            A tus responsabilidades.
                        </div>
                        <p style={{ margin: 0, fontWeight: '700', color: '#ddbe3d', fontSize: '1.4rem' }}>
                            Ahora es momento de dedicar tiempo a quien hace posible todo lo demás.
                        </p>
                        <p style={{ margin: 0 }}>
                            No porque estés roto.<br/>
                            No porque estés perdido.<br/>
                            No porque hayas fracasado.
                        </p>
                        <p style={{ margin: 0, fontWeight: '700', color: '#002d44', fontSize: '1.5rem', marginTop: '20px' }}>
                            Sino porque estás creciendo.
                        </p>
                        <p style={{ margin: 0, marginTop: '20px' }}>
                            Y cada nueva etapa de la vida exige una nueva versión de nosotros mismos.
                        </p>
                        <p style={{ margin: 0 }}>
                            La pregunta no es si tienes potencial para crecer.
                        </p>
                        <p style={{ margin: 0, fontWeight: '700', color: '#002d44' }}>
                            La pregunta es si estás dispuesto a invertir en la persona que sostendrá la vida, el liderazgo y el impacto que deseas construir durante los próximos años.
                        </p>
                        <p style={{ margin: 0, marginTop: '20px', fontStyle: 'italic' }}>
                            Si sientes que este es tu momento, estaremos encantados de recorrer este camino contigo.
                        </p>
                    </div>

                    <div style={{
                        background: '#f8f9fa',
                        padding: '40px',
                        borderRadius: '24px',
                        border: '1px solid rgba(0,45,68,0.05)',
                        marginBottom: '50px'
                    }}>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ddbe3d', marginBottom: '15px', marginTop: 0 }}>Primera Generación Master Live Training</h4>
                        <p style={{ fontSize: '1.1rem', color: '#002d44', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
                            20 participantes · 90 días de entrenamiento integral · Una experiencia diseñada para transformar la forma en que te conoces, lideras y construyes tu vida.
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button onClick={handleAction} className="mlt-btn-main" style={{ padding: '20px 45px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Aplicar a la Primera Generación
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 11. Footer */}
            <footer className="mlt-footer">
                <div className="mlt-footer-content">
                    <a href="https://www.autenticos.co/" target="_blank" rel="noopener noreferrer">
                        <img src="/Logo-Blanco.png" alt="Auténticos" className="mlt-footer-logo" />
                    </a>
                    <div className="mlt-footer-social">
                        <a href="https://www.autenticos.co/" target="_blank" rel="noopener noreferrer"><Globe size={18} /></a>
                        <a href="https://www.instagram.com/autenticos.co/" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
                        <a href="https://www.facebook.com/clubautenticos" target="_blank" rel="noopener noreferrer"><Facebook size={18} /></a>
                        <a href="https://www.youtube.com/@AutenticosTV" target="_blank" rel="noopener noreferrer"><Youtube size={18} /></a>
                        <a href="https://www.linkedin.com/company/autenticos/?viewAsMember=true" target="_blank" rel="noopener noreferrer"><Linkedin size={18} /></a>
                    </div>
                </div>
            </footer>


            {/* Botón Regresar al Inicio */}
            <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                className="mlt-scroll-top-float"
                title="Regresar al inicio"
            >
                <ChevronUp size={22} strokeWidth={3} />
            </button>

            {/* Botón Flotante WhatsApp */}
            <a 
                href="https://wa.me/573164287586?text=Hola,%20quiero%20mayor%20informaci%C3%B3n%20sobre%20el%20autodiagn%C3%B3stico%20de%20los%206%20dominios"
                target="_blank"
                rel="noopener noreferrer"
                className="mlt-whatsapp-float"
            >
                <svg viewBox="0 0 24 24" width="35" height="35" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.123.553 4.197 1.604 6.013L0 24l6.135-1.61a11.782 11.782 0 005.912 1.583h.005c6.635 0 12.032-5.397 12.035-12.031a11.792 11.792 0 00-3.493-8.504z"/>
                </svg>
            </a>

            {/* Modal de Pago */}
            {isModalOpen && (
                <div className="mlt-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="mlt-form-container mlt-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="mlt-modal-close" onClick={() => setIsModalOpen(false)}>
                            <X size={24} />
                        </button>
                        <h3 className="mlt-form-title">Formulario de registro</h3>
                        {error && <div style={{ color: '#ff4d4d', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mlt-form-group">
                                <label>Nombre Completo</label>
                                <input 
                                    type="text" 
                                    name="full_name" 
                                    value={formData.full_name} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                            <div className="mlt-form-group">
                                <label>Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="tu@email.com"
                                />
                            </div>
                            <div className="mlt-form-group">
                                <label>Celular</label>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="300 123 4567"
                                />
                            </div>
                            <div className="mlt-form-group">
                                <label>Ciudad</label>
                                <input 
                                    type="text" 
                                    name="city" 
                                    value={formData.city} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="Ej: Cali"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="mlt-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        <Loader2 className="animate-spin" size={20} />
                                        PROCESANDO...
                                    </span>
                                ) : "CONTINUAR AL PAGO"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MltLanding;
