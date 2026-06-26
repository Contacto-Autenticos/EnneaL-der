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
    X,
    Calendar,
    Mountain,
    MessageCircle,
    Users
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

    // Informativa state
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [infoLoading, setInfoLoading] = useState(false);
    const [infoSuccess, setInfoSuccess] = useState(false);
    const [infoError, setInfoError] = useState(null);
    const [infoFormData, setInfoFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const getNextInfoSession = () => {
        const colTimeStr = new Date().toLocaleString("en-US", {timeZone: "America/Bogota"});
        const colDate = new Date(colTimeStr);
        
        // Target: Thursday (4)
        let daysToAdd = (4 - colDate.getDay() + 7) % 7;
        
        // If it's Thursday but after 19:30, move to next Thursday
        if (daysToAdd === 0 && (colDate.getHours() > 19 || (colDate.getHours() === 19 && colDate.getMinutes() >= 30))) {
            daysToAdd = 7;
        }
        
        colDate.setDate(colDate.getDate() + daysToAdd);
        colDate.setHours(19, 30, 0, 0); 
        
        // Base start date: June 25, 2026, 19:30
        const startDate = new Date(2026, 5, 25, 19, 30, 0, 0); // Month 5 is June
        let finalDate = colDate;
        
        if (colDate.getTime() < startDate.getTime()) {
            finalDate = startDate;
        }
        
        const pad = (n) => n.toString().padStart(2, '0');
        return `${finalDate.getFullYear()}-${pad(finalDate.getMonth()+1)}-${pad(finalDate.getDate())}T19:30:00-05:00`;
    };

    const getFormattedNextSessionDate = () => {
        const isoDate = getNextInfoSession();
        const dateObj = new Date(isoDate);
        
        const options = { 
            timeZone: "America/Bogota", 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric'
        };
        const formatter = new Intl.DateTimeFormat('es-CO', options);
        let formatted = formatter.format(dateObj).replace(',', '');
        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
        return `${formatted} a las 7:30 PM`;
    };

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        setInfoLoading(true);
        setInfoError(null);

        try {
            // Guardar en la BD
            const { error: insertError } = await supabase
                .from('workshop_registrations')
                .insert([{
                    full_name: infoFormData.name,
                    email: infoFormData.email.trim().toLowerCase(),
                    phone: infoFormData.phone,
                    workshop_name: 'Sesión Informativa MLT Grupal',
                    payment_status: 'FREE',
                    raw_data: { source: 'MLT Landing Modal' }
                }]);

            if (insertError) throw insertError;

            // Calcular fechas (45 minutos de duración)
            const startTimeStr = getNextInfoSession();
            const startD = new Date(startTimeStr);
            const endD = new Date(startD.getTime() + 45 * 60000);
            const pad = (n) => n.toString().padStart(2, '0');
            const endTimeStr = `${endD.getFullYear()}-${pad(endD.getMonth()+1)}-${pad(endD.getDate())}T${pad(endD.getHours())}:${pad(endD.getMinutes())}:00-05:00`;

            // Invocar Edge Function
            const { data, functionError } = await supabase.functions.invoke('register-informativa', {
                body: {
                    name: infoFormData.name,
                    email: infoFormData.email.trim().toLowerCase(),
                    phone: infoFormData.phone,
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            });

            if (functionError) throw functionError;
            if (data?.error) throw new Error(data.error);

            setInfoSuccess(true);
            setInfoFormData({ name: '', email: '', phone: '' });

        } catch (err) {
            console.error("Error en registro de sesión informativa:", err);
            setInfoError("Hubo un problema al procesar tu registro. Por favor intenta de nuevo.");
        } finally {
            setInfoLoading(false);
        }
    };

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
    const handlePrev = () => {
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

    const handleNext = () => {
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
            }, 600); // Wait for current transition to finish
        } else {
            setTransitionEnabled(true);
            setTestimonialIndex((prev) => prev + 1);
        }
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
        window.open('/postulacion-mlt', '_blank');
    };

    return (
        <div id="inicio" className="dominios-landing-container">
            {/* Background Layer */}
            <div className="mlt-bg-glow"></div>



            {/* 2. Hero Section */}
            <section className="mlt-hero mlt-animate" style={{ minHeight: 'auto', padding: '60px 0', justifyContent: 'flex-start' }}>
                <div className="mlt-section-content mlt-hero-container">
                    <div>
                        {/* 1. Full width header */}
                        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                            <h1 className="mlt-hero-title" style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', lineHeight: '1.3', marginBottom: '20px', textAlign: 'center', maxWidth: '900px', margin: '0 auto 20px auto' }}>
                                Recupera la claridad, la confianza y la dirección necesarias para liderar mejor <span style={{ color: '#ddbe3d' }}>tu vida, tu equipo y tu futuro.</span>
                            </h1>
                        </div>

                        {/* 2. Video placeholder */}
                        <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto 60px auto', background: '#000000', aspectRatio: '16/9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                            <iframe 
                                width="100%" 
                                height="100%" 
                                src="https://www.youtube.com/embed/Cr5EebrKbQU" 
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                referrerPolicy="strict-origin-when-cross-origin" 
                                allowFullScreen
                            ></iframe>
                        </div>

                        {/* 3. Content Grid (Text + Image) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px', alignItems: 'center', marginBottom: '60px', textAlign: 'left' }}>
                            {/* Left: Text & List */}
                            <div>
                                <h2 style={{ color: '#ddbe3d', fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: '600', letterSpacing: '0.02em', margin: '0 0 20px 0' }}>
                                    Desarrolla a la persona que sostiene al líder.
                                </h2>
                                <p style={{ fontSize: '20px', lineHeight: '1.6', marginBottom: '35px', color: 'rgba(255,255,255,0.9)' }}>
                                    Has crecido profesionalmente, asumido mayores responsabilidades y hoy tomas decisiones que impactan a otras personas. Sabes que el siguiente nivel de liderazgo no depende solo de nuevas herramientas, sino de quién eres y de quién estás llamado a convertirte.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                    {[
                                        "90 días de entrenamiento",
                                        "5 experiencias inmersivas",
                                        "6 conversatorios en vivo",
                                        "Comunidad exclusiva",
                                        "Acompañamiento continuo",
                                        "Solo 21 participantes"
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
                                    src="/mlt/mlt-S1-1.jpg" 
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
                                Sesión informativa
                                <ArrowRight size={24} />
                            </button>
                        </div>
                    </div>
                </div>


            </section>

            {/* 3. Empathy Section */}
            <section className="mlt-section mlt-animate" style={{ background: '#ffffff', color: '#002d44', padding: '80px 0' }}>
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
                            "Te cuesta delegar.",
                            "Algunos conflictos consumen demasiada energía.",
                            "El tiempo nunca parece suficiente.",
                            "A veces te preguntas si estás construyendo la vida que deseas."
                        ].map((text, i) => (
                            <div key={i} className="mlt-empathy-item">
                                <div className="mlt-empathy-bullet"></div>
                                <p className="mlt-empathy-text">{text}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ margin: '90px auto 0 auto', width: '100%', textAlign: 'left' }}>
                        <p style={{ fontSize: '18.5px', lineHeight: '1.6', marginBottom: '0', color: '#002d44' }}>
                            Tal vez no te faltan más conocimientos, herramientas o capacidades. Lo que quizás estás buscando es algo más profundo: <strong style={{ color: '#ddbe3d' }}>claridad, dirección y fortaleza personal</strong> para sostener el nivel de impacto que deseas generar. El problema no siempre está en lo que haces, generalmente está en quién eres mientras lo haces.
                        </p>
                    </div>
                </div>
            </section>

            {/* 3.5. Why this happens Section */}
            <section className="mlt-section mlt-animate" style={{ padding: '80px 0', position: 'relative' }}>
                <style>{`
                    .mlt-why-mobile-title { display: none; }
                    @media (max-width: 899px) {
                        .mlt-why-mobile-title { display: block; }
                        .mlt-why-desktop-title { display: none; }
                    }
                `}</style>
                <div className="mlt-section-content mlt-why-grid">
                    
                    {/* Mobile Title */}
                    <div className="mlt-why-mobile-title" style={{ textAlign: 'left' }}>
                        <h2 className="mlt-section-title" style={{ color: '#ddbe3d', marginBottom: '30px', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800' }}>
                            ¿Por qué ocurre esto?
                        </h2>
                    </div>

                    {/* Image (Man on mountain) - Moved up for mobile order */}
                    <div className="mlt-why-image">
                        <img loading="lazy" src="/mlt/mlt-S2-1.jpg" 
                            alt="¿Por qué ocurre esto?" 
                            style={{ 
                                width: '100%', 
                                maxWidth: '450px', 
                                height: 'auto', 
                                borderRadius: '24px', 
                                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'block'
                            }} 
                        />
                    </div>

                    {/* Left: Text */}
                    <div className="mlt-why-left" style={{ textAlign: 'left' }}>
                        <h2 className="mlt-section-title mlt-why-desktop-title" style={{ color: '#ddbe3d', marginBottom: '30px', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800' }}>
                            ¿Por qué ocurre esto?
                        </h2>
                        <div style={{ fontSize: '18px', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <p>
                                La mayoría de las personas dedica buena parte de su vida a desarrollar capacidades, adquirir conocimientos, construir relaciones, alcanzar metas y generar resultados.
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
                            
                            <p style={{ color: '#ddbe3d' }}>
                                No es porque hayas hecho algo mal ni porque te falten herramientas.
                            </p>
                            <p>
                                La vida que quieres construir requiere una versión más grande de ti.
                            </p>
                        </div>
                    </div>


                    
                    {/* Left: Image (Water Glass) */}
                    <div className="mlt-why-left-image" style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '450px', height: '100%', minHeight: '400px' }}>
                            <img loading="lazy" src="/Baso de agua.jpg" 
                                alt="Capacidad y Agua" 
                                style={{ 
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%', 
                                    height: '100%', 
                                    borderRadius: '24px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                    objectFit: 'cover'
                                }} 
                            />
                        </div>
                    </div>
                    
                    {/* Right: Extra Text (Continuation) */}
                    <div className="mlt-why-right-text" style={{ fontSize: '18px', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', textAlign: 'left', width: '100%', marginTop: '40px' }}>
                        <p style={{ marginBottom: '20px' }}>
                            Muchas personas intentan responder a ese llamado trabajando más, haciendo cursos o esforzándose cada vez más. Pero pocas se detienen a preguntarse si han desarrollado la capacidad necesaria para sostener aquello que desean recibir.
                        </p>
                        <p style={{ marginBottom: '20px', fontWeight: 'bold', color: '#ddbe3d' }}>
                            No puedes recibir más si el envase sigue siendo pequeño.
                        </p>
                        <p style={{ marginBottom: '20px' }}>
                            No puedes sostener una empresa más grande con la misma mentalidad que te permitió construirla.
                        </p>
                        <p style={{ marginBottom: '20px' }}>
                            No puedes liderar más personas sin expandir tu capacidad para comprenderlas, inspirarlas y acompañarlas.
                        </p>
                        <p style={{ marginBottom: '30px' }}>
                            No puedes aspirar a una vida más plena sin desarrollar primero a la persona que habrá de vivirla.
                        </p>
                        <p style={{ fontWeight: 'bold', color: '#ddbe3d', fontSize: '20px', marginBottom: '0' }}>
                            ¿Quién necesitas llegar a ser para sostener la vida, el liderazgo y el impacto que deseas construir?
                        </p>
                    </div>

                </div>
            </section>

            {/* 4. Why changes don't last Section */}
            <section className="mlt-section mlt-animate" style={{ background: '#ffffff', padding: '80px 0', position: 'relative' }}>
                <div className="mlt-section-content" style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 className="mlt-section-title" style={{ color: '#002d44', marginBottom: '80px', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '900' }}>
                        ¿Por qué la mayoría de <span className="mlt-gold-text" style={{ display: 'inline' }}>cambios</span> no duran?
                    </h2>

                    {/* Part 1: Text Left (all paragraphs), Image Right */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '60px',
                        alignItems: 'stretch'
                    }}>
                        <div style={{ fontSize: '1.15rem', lineHeight: '1.7', color: 'rgba(0, 45, 68, 0.85)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <p>La mayoría de los procesos de desarrollo trabajan aspectos aislados de la persona. Algunos se enfocan en liderazgo, otros en productividad, comunicación o bienestar.</p>
                            <p>El problema es que la vida no funciona por partes. Tus resultados son el reflejo de tus acciones. Tus acciones son el reflejo de tus pensamientos. Y tus pensamientos están profundamente influenciados por la forma en que te comprendes a ti mismo.</p>
                            <p><strong>Por eso los cambios superficiales rara vez generan resultados sostenibles.</strong></p>
                            <p>Cuando comprendes que tu forma de pensar, sentir, relacionarte, liderar y actuar están conectadas, comienzas a verte como un sistema y no como un conjunto de piezas separadas y es por eso que el Master Live Training fue diseñado como un sistema integral de desarrollo humano.</p>
                            <p style={{ fontWeight: 'bold', color: '#002d44' }}>No trabajamos únicamente sobre lo que haces, trabajamos sobre la persona que lo hace.</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', height: '100%' }}>
                            <img loading="lazy" src="/mlt/Habitos negativos.jpg" 
                                alt="Hábitos Negativos" 
                                style={{ maxWidth: '100%', width: '100%', height: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', objectFit: 'cover' }}
                            />
                        </div>
                    </div>

                </div>
            </section>

            {/* 6. Nosotros / Origen Section */}
            <section className="mlt-section mlt-animate" style={{ color: '#ffffff', padding: '80px 0' }}>
                <div className="mlt-section-content" style={{ maxWidth: '1200px' }}>
                    <style>{`
                        .mlt-origen-mobile-title { display: none; }
                        .mlt-origen-grid {
                            display: grid;
                            grid-template-columns: 1fr;
                            gap: 40px;
                            align-items: center;
                        }
                        @media (min-width: 900px) {
                            .mlt-origen-grid {
                                grid-template-columns: 1fr 1fr;
                                gap: 60px;
                            }
                            .mlt-origen-left {
                                grid-column: 1 / 2;
                                grid-row: 1 / 2;
                            }
                            .mlt-origen-right {
                                grid-column: 2 / 3;
                                grid-row: 1 / 2;
                            }
                        }
                        @media (max-width: 899px) {
                            .mlt-origen-mobile-title { display: block; }
                            .mlt-origen-desktop-title { display: none; }
                        }
                    `}</style>
                    <div className="mlt-origen-grid">
                        
                        <div className="mlt-origen-mobile-title">
                            <h2 className="mlt-section-title" style={{ marginBottom: '30px', color: '#ffffff', textAlign: 'left' }}>
                                Master Live Training nace de una <span className="mlt-gold-text">convicción sencilla</span>
                            </h2>
                        </div>

                        {/* Image Column (Right on desktop, 2nd on mobile) */}
                        <div className="mlt-origen-right" style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                                width: '100%',
                                maxWidth: '350px',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                <img loading="lazy" src="/Bombillo-2.webp" 
                                    alt="Origen Master Live Training" 
                                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} 
                                />
                            </div>
                        </div>

                        {/* Text Column (Left on desktop, 3rd on mobile) */}
                        <div className="mlt-origen-left">
                            <h2 className="mlt-section-title mlt-origen-desktop-title" style={{ marginBottom: '30px', color: '#ffffff', textAlign: 'left' }}>
                                Master Live Training nace de una <span className="mlt-gold-text">convicción sencilla</span>
                            </h2>
                            <p style={{ fontSize: '1.25rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.85)' }}>
                                Cuando una persona se conoce mejor, desarrolla sus capacidades y actúa de manera coherente con aquello que realmente importa, su vida comienza a transformarse de una forma más profunda y sostenible. Ese es el propósito que da origen a esta experiencia.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4.5. Modelo de Formación (Ported) */}
            <section id="desarrollo-humano" className="mlt-section mlt-animate" style={{ background: '#ffffff', padding: '80px 0', position: 'relative' }}>
                <div className="mlt-section-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="mlt-section-title" style={{ color: '#002d44', marginBottom: '20px' }}>
                            ¿Cómo vivirás <span style={{ color: '#ddbe3d' }}>la experiencia?</span>
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: 'rgba(0, 45, 68, 0.85)', maxWidth: '900px', margin: '0 auto', lineHeight: '1.6' }}>
                            Durante 90 días vivirás un proceso de transformación diseñado para convertir el conocimiento en consciencia, la consciencia en acción y la acción en resultados sostenibles.
                            <br /><br />
                            A lo largo del programa participarás en cinco experiencias presenciales inmersivas, seis conversatorios en vivo y accederás a contenidos exclusivos en video dentro de una comunidad de aprendizaje que acompañará tu evolución en cada etapa del proceso.
                        </p>
                    </div>
                    
                    <MltInteractiveModel />
                </div>
            </section>

            {/* 5. 6 Pilares Section */}
            <section className="mlt-section mlt-animate" style={{ padding: '80px 0' }}>
                <div className="mlt-section-content">
                    <style>{`
                        .mlt-title-line {
                            height: 1px;
                            width: 80px;
                            background: #ddbe3d;
                        }
                        .mlt-title-subtitle {
                            color: #ddbe3d;
                            font-size: 18px;
                            letter-spacing: 0.2em;
                            font-weight: 600;
                            text-transform: uppercase;
                        }
                        @media (max-width: 768px) {
                            .mlt-title-line {
                                display: none;
                            }
                            .mlt-title-subtitle {
                                font-size: 15px;
                                letter-spacing: 0.1em;
                                white-space: nowrap;
                            }
                        }
                    `}</style>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="mlt-section-title" style={{ color: '#ffffff', marginBottom: '20px', fontSize: 'clamp(36px, 6vw, 64px)' }}>
                            Lo que transformarás en <span className="mlt-gold-text" style={{ display: 'inline' }}>90 días</span>
                        </h2>
                        <p style={{ 
                            fontSize: '1.25rem', 
                            lineHeight: '1.6',
                            color: 'rgba(255, 255, 255, 0.85)', 
                            maxWidth: '700px',
                            margin: '0 auto'
                        }}>
                            Seis pilares para convertirte en la mejor versión de ti y liderar con propósito e impacto.
                        </p>
                    </div>
                    
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                        gap: '15px',
                        maxWidth: '1100px',
                        margin: '0 auto'
                    }}>
                        {[
                            { img: "Iconos MLT-S1-Claridad.png", t: <>CLARIDAD<br/>PERSONAL</>, d: "Comprende quién eres y define tu siguiente paso." },
                            { img: "Iconos MLT-S1-Direccion.png", t: <>DIRECCIÓN Y<br/>ENFOQUE</>, d: "Diseña una hoja de ruta para avanzar con intención." },
                            { img: "Iconos MLT-S1-liderazgo.png", t: <>LIDERAZGO<br/>CONSCIENTE</>, d: "Lidera e influye con mayor coherencia." },
                            { img: "Iconos MLT-S1-Herramientas.png", t: <>HERRAMIENTAS<br/>PRÁCTICAS</>, d: "Convierte el aprendizaje en resultados reales." },
                            { img: "Iconos MLT-S1-Comunidad.png", t: <>COMUNIDAD DE<br/>CRECIMIENTO</>, d: "Crece junto a líderes comprometidos." },
                            { img: "Iconos MLT-S1-Coherencia.png", t: <>COHERENCIA DE<br/>VIDA</>, d: "Alinea lo que piensas, sientes y haces." }
                        ].map((item, i) => (
                            <div key={i} className="mlt-white-card" style={{ 
                                background: '#000a12', 
                                padding: '24px', 
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '15px',
                                alignItems: 'flex-start',
                                cursor: 'default'
                            }}>
                                <div style={{ flexShrink: 0, width: '65px', height: '65px' }}>
                                    <img src={`/mlt/${item.img}`} alt={item.t} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                <div>
                                    <h4 style={{ color: '#ffffff', fontSize: '1.05rem', fontWeight: '800', marginBottom: '10px', lineHeight: '1.3' }}>{item.t}</h4>
                                    <div style={{ height: '2px', width: '30px', background: '#ddbe3d', marginBottom: '10px' }}></div>
                                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0, letterSpacing: '-0.2px' }}>{item.d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* NEW SECTION: Todo lo que necesitas */}
            <section className="mlt-section mlt-animate" style={{ background: '#ffffff', color: '#002d44', padding: '40px 0' }}>
                <div className="mlt-section-content" style={{ maxWidth: '1200px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', color: '#002d44', margin: 0, fontWeight: '500' }}>
                            Todo lo que necesitas para convertir el conocimiento en una vida con mayor <span style={{ fontWeight: '800' }}>claridad, liderazgo e impacto.</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* 7. ¿Para quién es? Section */}
            <section className="mlt-section mlt-animate" style={{ paddingTop: '40px' }}>
                <div className="mlt-section-content" style={{ maxWidth: '1200px' }}>
                    <h2 className="mlt-section-title" style={{ textAlign: 'center', marginBottom: '60px' }}>
                        ¿Para quién es <span className="mlt-gold-text" style={{ display: 'inline' }}>Master Live Training?</span>
                    </h2>


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
                                Es para personas que:
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {[
                                    "Han alcanzado logros importantes, pero saben que aún pueden crecer.",
                                    "Buscan mayor claridad sobre quiénes son y hacia dónde quieren dirigir su vida.",
                                    "Desean fortalecer su liderazgo y aumentar su impacto.",
                                    "Comprenden que el crecimiento sostenible comienza por la persona.",
                                    "Están dispuestos a cuestionarse, aprender y evolucionar.",
                                    "Valoran crecer junto a otras personas comprometidas con su desarrollo."
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
                            <h3 style={{ color: '#ff3232', fontSize: '1.5rem', fontWeight: '800', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                No es para quienes:
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {[
                                    "Buscan soluciones rápidas sin un trabajo personal profundo.",
                                    "Esperan que otros resuelvan sus desafíos.",
                                    "No están dispuestos a reflexionar, practicar y aplicar lo aprendido.",
                                    "Creen que ya no tienen nada nuevo por descubrir sobre sí mismos.",
                                    "Buscan herramientas sin trabajar sobre la persona que las utiliza.",
                                    "No están dispuestos a cuestionar sus hábitos, ideas o creencias."
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
                            No se trata de hacer más. Se trata de convertirte en la persona capaz de sostener más.
                        </p>
                    </div>

                    <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button onClick={handleAction} className="mlt-btn-main">
                            SESIÓN INFORMATIVA
                            <ArrowRight size={22} />
                        </button>
                    </div>

                </div>
            </section>





            {/* 7. Testimonials Section */}
            <section className="mlt-section mlt-animate" style={{ background: '#ffffff', color: '#002d44', padding: '80px 0' }}>
                <div className="mlt-section-content">
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '15px' }}>
                            <div style={{ height: '2px', width: '60px', background: '#ddbe3d' }}></div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#ddbe3d', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                CONFIANZA QUE RESPALDA RESULTADOS
                            </span>
                            <div style={{ height: '2px', width: '60px', background: '#ddbe3d' }}></div>
                        </div>
                        <h2 className="mlt-section-title" style={{ color: '#002d44', marginBottom: '20px' }}>
                            Organizaciones que <span className="mlt-gold-text" style={{ display: 'inline' }}>confían en nosotros</span>
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#002d44', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6', fontWeight: '500' }}>
                            Empresas, universidades y organizaciones que han confiado en nuestra metodología.
                        </p>
                    </div>

                    <style>{`
                        .mlt-logos-grid {
                            display: grid;
                            grid-template-columns: repeat(8, 1fr);
                            gap: 5px;
                            justify-content: center;
                            align-items: center;
                        }
                        @media (max-width: 1024px) {
                            .mlt-logos-grid {
                                grid-template-columns: repeat(4, 1fr);
                                gap: 15px;
                            }
                        }
                        @media (max-width: 600px) {
                            .mlt-logos-grid {
                                grid-template-columns: repeat(2, 1fr);
                                gap: 15px;
                            }
                        }
                    `}</style>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
                        <div className="mlt-logos-grid">
                            {[1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14, 15, 18, 20, 21].map((num) => (
                                <div key={num} style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100px',
                                    padding: '5px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'default'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.15)';
                                    e.currentTarget.style.filter = 'drop-shadow(0 0 12px rgba(221, 190, 61, 0.5))';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.filter = 'none';
                                }}
                                >
                                    <img 
                                        src={`/mlt/Logos clientes/Cliente-${num}.png`} 
                                        alt={`Organización que confía en nosotros`} 
                                        style={{ 
                                            maxWidth: '100%', 
                                            maxHeight: '100%', 
                                            objectFit: 'contain'
                                        }} 
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Felipe Beltran Profile */}
                    <div style={{ marginTop: '80px', display: 'flex', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', flexWrap: 'wrap', gap: '50px', maxWidth: '1200px', margin: '80px auto 0 auto', padding: '0 20px' }}>
                        {/* Left: Image (Glued to bottom) */}
                        <div style={{ flex: '1', minWidth: '300px', maxWidth: '450px', display: 'flex', justifyContent: 'center', marginBottom: '-80px' }}>
                            <img src="/felipe-beltran.png" alt="Felipe Beltran" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain', objectPosition: 'bottom' }} />
                        </div>
                        {/* Right: Text */}
                        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h3 style={{ color: '#002d44', marginBottom: '20px', textAlign: 'left', lineHeight: '0.95', fontSize: 'clamp(2.5rem, 4.5vw, 3.8rem)', fontWeight: '900' }}>
                                <span style={{ letterSpacing: '0.11em', display: 'block', marginLeft: '0.05em' }}>Felipe</span>
                                <span style={{ color: '#ddbe3d', letterSpacing: '-0.02em', display: 'block' }}>Beltran</span>
                            </h3>
                            <div style={{ height: '4px', width: '70px', background: '#ddbe3d', marginBottom: '30px', marginTop: '10px' }}></div>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#002d44', marginBottom: '20px' }}>
                                Durante más de <strong>25 años</strong> he acompañado a líderes, empresarios y organizaciones a crecer, innovar y transformarse. Soy economista, coach, empresario y conferencista internacional, y he tenido la oportunidad de impactar a más de <strong>75.000 personas</strong> en <strong>32 ciudades</strong> y 6 países.
                            </p>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#002d44', marginBottom: '0' }}>
                                Sin embargo, mi mayor aprendizaje no ha venido de los escenarios, sino de comprender que las transformaciones más profundas comienzan cuando una persona decide <strong>conocerse, asumir la responsabilidad de su vida y liderar desde la consciencia.</strong> Ese es el propósito con el que creé Master Live Training.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* 8. Precios */}
            <style>{`
                .pricing-new-card {
                    background: #001a29;
                    border: 1px solid #ddbe3d;
                    border-radius: 16px;
                    padding: 60px 40px 40px;
                    position: relative;
                    color: #ffffff;
                    margin-top: 40px;
                }
                .pricing-pill {
                    background: #ddbe3d;
                    color: #002d44;
                    padding: 8px 20px;
                    border-radius: 20px;
                    font-weight: 800;
                    font-size: 14px;
                    letter-spacing: 0.1em;
                    position: absolute;
                    top: -18px;
                    left: 50%;
                    transform: translateX(-50%);
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .pricing-pill::before, .pricing-pill::after {
                    content: '';
                    width: 4px;
                    height: 4px;
                    background: #002d44;
                    border-radius: 50%;
                }
                .pricing-grid-new {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0;
                    margin: 40px 0;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .pricing-item-new {
                    padding: 30px;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 15px;
                    border-right: 1px solid rgba(255,255,255,0.1);
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .pricing-item-new:nth-child(4n) {
                    border-right: none;
                }
                .pricing-item-new:nth-child(n+5) {
                    border-bottom: none;
                }
                .pricing-icon-wrapper {
                    width: 50px;
                    height: 50px;
                    flex-shrink: 0;
                    border-radius: 50%;
                    border: 1px solid #ddbe3d;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #ddbe3d;
                }
                @media (max-width: 1024px) {
                    .pricing-grid-new {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .pricing-item-new:nth-child(2n) {
                        border-right: none;
                    }
                    .pricing-item-new:nth-child(n+3) {
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                    }
                    .pricing-item-new:nth-child(n+7) {
                        border-bottom: none;
                    }
                }
                @media (max-width: 600px) {
                    .pricing-grid-new {
                        grid-template-columns: 1fr;
                    }
                    .pricing-item-new {
                        border-right: none;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                        flex-direction: row;
                        align-items: center;
                    }
                    .pricing-item-new:last-child {
                        border-bottom: none;
                    }
                }
            `}</style>
            <section id="precios" className="mlt-section">
                <div className="mlt-section-content">
                    <div className="pricing-new-card mlt-animate">
                        <div className="pricing-pill">
                            PRIMERA GENERACIÓN
                        </div>
                        
                        <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800', marginBottom: '50px', color: '#ffffff' }}>
                            ÚNETE A LA <span style={{ color: '#ddbe3d' }}>PRIMERA GENERACIÓN</span>
                        </h2>

                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', flexWrap: 'wrap', marginBottom: '20px' }}>
                            <div style={{ textAlign: 'center', color: '#888' }}>
                                <div style={{ fontSize: '28px', fontWeight: '500', textDecoration: 'line-through' }}>
                                    USD 3.800
                                </div>
                                <div style={{ fontSize: '14px', letterSpacing: '0.1em', marginTop: '5px' }}>
                                    VALOR REGULAR
                                </div>
                            </div>
                            
                            <ArrowRight color="#ddbe3d" size={32} />

                            <div style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '24px', fontWeight: '700', marginTop: '15px' }}>USD</span>
                                    <span style={{ fontSize: 'clamp(60px, 8vw, 90px)', fontWeight: '900', lineHeight: '1' }}>2.900</span>
                                </div>
                                <div style={{ fontSize: '16px', letterSpacing: '0.1em', color: '#ddbe3d', marginTop: '5px', fontWeight: '600' }}>
                                    VALOR ESPECIAL DE LANZAMIENTO
                                </div>
                            </div>
                        </div>

                        <div className="pricing-grid-new">
                            <div className="pricing-item-new">
                                <div className="pricing-icon-wrapper"><Calendar size={24} /></div>
                                <div style={{ fontSize: '15px', color: '#ccc', lineHeight: '1.4' }}>
                                    <span style={{ color: '#fff', fontWeight: '700' }}>90 DÍAS</span><br/>
                                    de entrenamiento integral
                                </div>
                            </div>
                            <div className="pricing-item-new">
                                <div className="pricing-icon-wrapper"><Mountain size={24} /></div>
                                <div style={{ fontSize: '15px', color: '#ccc', lineHeight: '1.4' }}>
                                    <span style={{ color: '#fff', fontWeight: '700' }}>5 EXPERIENCIAS</span><br/>
                                    inmersivas
                                </div>
                            </div>
                            <div className="pricing-item-new">
                                <div className="pricing-icon-wrapper"><MessageCircle size={24} /></div>
                                <div style={{ fontSize: '15px', color: '#ccc', lineHeight: '1.4' }}>
                                    <span style={{ color: '#fff', fontWeight: '700' }}>6 CONVERSATORIOS</span><br/>
                                    en vivo
                                </div>
                            </div>
                            <div className="pricing-item-new">
                                <div className="pricing-icon-wrapper"><Brain size={24} /></div>
                                <div style={{ fontSize: '15px', color: '#ccc', lineHeight: '1.4' }}>
                                    <span style={{ color: '#fff', fontWeight: '700' }}>DIAGNÓSTICOS</span><br/>
                                    y herramientas de autoconocimiento
                                </div>
                            </div>
                            <div className="pricing-item-new">
                                <div className="pricing-icon-wrapper"><PlayCircle size={24} /></div>
                                <div style={{ fontSize: '15px', color: '#ccc', lineHeight: '1.4' }}>
                                    <span style={{ color: '#fff', fontWeight: '700' }}>RECURSOS, GRABACIONES</span><br/>
                                    y materiales de trabajo
                                </div>
                            </div>
                            <div className="pricing-item-new">
                                <div className="pricing-icon-wrapper"><Users size={24} /></div>
                                <div style={{ fontSize: '15px', color: '#ccc', lineHeight: '1.4' }}>
                                    <span style={{ color: '#fff', fontWeight: '700' }}>COMUNIDAD EXCLUSIVA</span><br/>
                                    de participantes
                                </div>
                            </div>
                            <div className="pricing-item-new">
                                <div className="pricing-icon-wrapper"><Award size={24} /></div>
                                <div style={{ fontSize: '15px', color: '#ccc', lineHeight: '1.4' }}>
                                    <span style={{ color: '#fff', fontWeight: '700' }}>CERTIFICACIÓN</span><br/>
                                    y Colección Legacy
                                </div>
                            </div>
                            <div className="pricing-item-new">
                                <div className="pricing-icon-wrapper"><Star size={24} /></div>
                                <div style={{ fontSize: '15px', color: '#ccc', lineHeight: '1.4' }}>
                                    <span style={{ color: '#fff', fontWeight: '700' }}>COLECCIÓN LEGACY</span><br/>
                                    de Auténticos
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
                            <button 
                                onClick={handleAction} 
                                style={{ 
                                    background: 'linear-gradient(to right, #ddbe3d, #cba92d)', 
                                    border: 'none', 
                                    color: '#002d44', 
                                    fontSize: '1.25rem', 
                                    fontWeight: '800', 
                                    cursor: 'pointer',
                                    padding: '20px 40px',
                                    borderRadius: '8px',
                                    textTransform: 'uppercase',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    transition: 'all 0.3s',
                                    boxShadow: '0 10px 20px rgba(221, 190, 61, 0.2)'
                                }}
                            >
                                <ArrowRight size={24} color="#002d44" /> APLICAR A LA PRIMERA GENERACIÓN
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#777', marginTop: '20px', fontSize: '13px', letterSpacing: '0.05em' }}>
                                <Lock size={14} color="#ddbe3d" /> PROCESO DE APLICACIÓN PRIVADO Y CONFIDENCIAL
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 9. Garantía */}
            <section className="mlt-section" style={{ background: '#ffffff', padding: '80px 0' }}>
                <div className="mlt-section-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '60px',
                        flexWrap: 'wrap',
                        marginBottom: '60px'
                    }}>
                        {/* Columna Izquierda: Imagen */}
                        <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
                            <img loading="lazy" src="/mlt/Nuestro Compromiso-3.png" 
                                alt="100% Compromiso" 
                                style={{ maxWidth: '320px', width: '100%', height: 'auto', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.15))' }}
                            />
                        </div>
                        
                        {/* Columna Derecha: Textos */}
                        <div style={{
                            flex: '1 1 450px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px',
                            fontSize: '1.25rem',
                            lineHeight: '1.8',
                            color: 'rgba(0,45,68,0.85)',
                            textAlign: 'left'
                        }}>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 10px 0', color: '#002d44', lineHeight: '1.2' }}>
                                Nuestro <span className="mlt-gold-text" style={{ display: 'inline' }}>compromiso contigo</span>
                            </h3>
                            <p style={{ margin: 0 }}>
                                Sabemos que invertir en tu desarrollo personal es una decisión importante.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <span style={{ color: '#ddbe3d', fontWeight: 'bold' }}>&#10003;</span>
                                    <span>Nuestra experiencia, metodología y acompañamiento.</span>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <span style={{ color: '#ddbe3d', fontWeight: 'bold' }}>&#10003;</span>
                                    <span>Un espacio seguro para aprender y crecer.</span>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <span style={{ color: '#ddbe3d', fontWeight: 'bold' }}>&#10003;</span>
                                    <span>Herramientas y experiencias diseñadas para generar cambios sostenibles.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', color: '#002d44' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 20px 0', color: '#002d44' }}>
                                Hay algo que no podemos hacer por ti
                            </h3>
                            <p style={{ fontSize: '1.15rem', lineHeight: '1.6', margin: '0 auto 30px auto', maxWidth: '800px', color: 'rgba(0,45,68,0.85)' }}>
                                No podemos recorrer el camino en tu lugar. La transformación ocurre cuando una experiencia significativa encuentra a una persona dispuesta a aprovecharla. Nosotros nos comprometemos con la experiencia.
                            </p>
                            <p style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 30px 0', color: '#002d44' }}>
                                ¿Estás dispuesto a comprometerte contigo mismo?
                            </p>

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

                    {/* CTA Sesión Informativa (Inside FAQ) */}
                    <div style={{ maxWidth: '800px', margin: '80px auto 0', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '20px', color: '#ffffff' }}>¿Aún tienes dudas?</h3>
                        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', margin: '0 auto 30px', lineHeight: '1.6' }}>
                            Agenda una sesión informativa gratuita y en vivo (cupos limitados a 100 personas). Te explicaremos todos los detalles del Master Live Training y resolveremos tus preguntas.
                        </p>
                        <button 
                            onClick={() => setIsInfoModalOpen(true)}
                            style={{
                                padding: '16px 40px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#002d44',
                                background: '#ddbe3d',
                                border: 'none',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            AGENDAR SESIÓN INFORMATIVA <Calendar size={20} />
                        </button>
                    </div>

                </div>
            </section>

            {/* 10.5 Final Call to Action */}
            <section className="mlt-section mlt-animate" style={{ background: '#ffffff', color: '#002d44', padding: '80px 0' }}>
                <div className="mlt-section-content" style={{ maxWidth: '800px', textAlign: 'center' }}>
                    <h2 className="mlt-section-title" style={{ color: '#002d44', marginBottom: '50px' }}>
                        La vida que deseas construir <br /> te está <span className="mlt-gold-text" style={{ display: 'inline' }}>llamando.</span>
                    </h2>
                    
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '30px',
                        fontSize: '1.25rem',
                        lineHeight: '1.8',
                        color: 'rgba(0,45,68,0.85)',
                        textAlign: 'center',
                        marginBottom: '60px'
                    }}>
                        <p style={{ margin: 0, fontWeight: '600', color: '#002d44', fontSize: '1.4rem' }}>
                            Has dedicado años a construir tu vida, ahora es momento de desarrollar a la persona que la sostiene.
                        </p>
                        <p style={{ margin: 0, fontStyle: 'italic' }}>
                            Si sientes que este es tu momento, estaremos encantados de acompañarte.
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button onClick={handleAction} className="mlt-btn-main" style={{ padding: '20px 45px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase' }}>
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
                        <img loading="lazy" src="/Logo-Blanco.png" alt="Auténticos" className="mlt-footer-logo" />
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

            {/* Botón Flotante para Sesión Info */}
            <style>{`
                .info-floating-btn {
                    position: fixed;
                    bottom: 25px;
                    left: 25px;
                    z-index: 990;
                    background-color: #DDBE3D;
                    color: #002d44;
                    border: none;
                    border-radius: 50px;
                    padding: 12px 24px;
                    font-size: 15px;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(221, 190, 61, 0.4);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: pulse-ring 3s infinite;
                }
                .info-floating-btn:hover {
                    transform: translateY(-5px) scale(1.05);
                    box-shadow: 0 8px 25px rgba(221, 190, 61, 0.6);
                    background-color: #f0ce43;
                }
                @media (max-width: 768px) {
                    .info-floating-btn {
                        bottom: 20px;
                        left: 20px;
                        padding: 14px;
                        border-radius: 50%;
                    }
                    .info-floating-btn span {
                        display: none;
                    }
                }
                @keyframes pulse-ring {
                    0% { box-shadow: 0 0 0 0 rgba(221, 190, 61, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(221, 190, 61, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(221, 190, 61, 0); }
                }
            `}</style>
            <button 
                className="info-floating-btn" 
                onClick={() => setIsInfoModalOpen(true)}
                title="Agendar Sesión Informativa"
            >
                <Calendar size={22} />
                <span>Sesión Info Gratuita</span>
            </button>

            {/* Modal Sesión Informativa */}
            {isInfoModalOpen && (
                <div className="mlt-modal-overlay" onClick={() => setIsInfoModalOpen(false)}>
                    <div className="mlt-form-container mlt-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="mlt-modal-close" onClick={() => setIsInfoModalOpen(false)}>
                            <X size={24} />
                        </button>
                        
                        {infoSuccess ? (
                            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                                <CheckCircle2 size={64} color="#10B981" style={{ margin: '0 auto 20px' }} />
                                <h3 className="mlt-form-title" style={{ fontSize: '28px', color: '#10B981', marginBottom: '15px' }}>¡Registro Exitoso!</h3>
                                <p style={{ color: '#fff', opacity: 0.9, marginBottom: '25px', fontSize: '16px', lineHeight: '1.5' }}>
                                    Hemos reservado tu cupo. Revisa tu correo electrónico, allí te hemos enviado la invitación con la fecha, hora y el enlace de Google Meet. Nos vemos el jueves.
                                </p>
                                <button 
                                    className="mlt-submit-btn" 
                                    onClick={() => setIsInfoModalOpen(false)}
                                >
                                    Cerrar y Volver
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="mlt-form-title" style={{ fontSize: '24px', marginBottom: '10px' }}>Sesión Informativa Grupal</h3>
                                <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '25px', fontSize: '14px' }}>
                                    {getFormattedNextSessionDate()} (Hora Colombia).<br/>Cupos limitados.
                                </p>
                                {infoError && <div style={{ color: '#ff4d4d', marginBottom: '20px', textAlign: 'center', fontSize: '14px', background: 'rgba(255,77,77,0.1)', padding: '10px', borderRadius: '5px' }}>{infoError}</div>}
                                
                                <form onSubmit={handleInfoSubmit}>
                                    <div className="mlt-form-group">
                                        <label>Nombre Completo</label>
                                        <input 
                                            type="text" 
                                            value={infoFormData.name} 
                                            onChange={(e) => setInfoFormData({...infoFormData, name: e.target.value})} 
                                            required 
                                            placeholder="Ej: Juan Pérez"
                                        />
                                    </div>
                                    <div className="mlt-form-group">
                                        <label>Correo Electrónico</label>
                                        <input 
                                            type="email" 
                                            value={infoFormData.email} 
                                            onChange={(e) => setInfoFormData({...infoFormData, email: e.target.value})} 
                                            required 
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                    <div className="mlt-form-group">
                                        <label>Celular (WhatsApp)</label>
                                        <input 
                                            type="tel" 
                                            value={infoFormData.phone} 
                                            onChange={(e) => setInfoFormData({...infoFormData, phone: e.target.value})} 
                                            required 
                                            placeholder="Ej: +57 300 123 4567"
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="mlt-submit-btn"
                                        disabled={infoLoading}
                                    >
                                        {infoLoading ? (
                                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                <Loader2 className="animate-spin" size={20} />
                                                RESERVANDO CUPO...
                                            </span>
                                        ) : "AGENDAR MI CUPO GRATIS"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MltLanding;
