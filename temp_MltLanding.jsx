import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
    Target,
    Award,
    Lock,
    ArrowRight,
    Calendar,
    Users,
    ChevronDown,
    ChevronUp,
    Globe
} from 'lucide-react';
import './MltDireccionLanding.css';

const MltDireccionLanding = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        goal: '',
        coupon: ''
    });
    const [openFaq, setOpenFaq] = useState(null);
    const [showCoupon, setShowCoupon] = useState(false);

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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const mltConfig = {
        title: "MLT Dirección",
        priceInCOP: 900000,
        name: "MLT Dirección - Primera Cohorte"
    };

    const isFree = formData.coupon.trim().toUpperCase() === 'GRATITUD';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            const priceInCOP = isFree ? 0 : mltConfig.priceInCOP;

            const { data, error: insertError } = await supabase
                .from('workshop_registrations')
                .insert([{
                    full_name: formData.full_name,
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone,
                    workshop_name: mltConfig.name,
                    amount: priceInCOP,
                    payment_status: isFree ? 'COMPLETED' : 'PENDING',
                    raw_data: {
                        source: 'MLT Direccion Landing',
                        goal: formData.goal,
                        coupon: formData.coupon
                    }
                }])
                .select();

            if (insertError) throw insertError;

            const registrationId = data[0].id;
            localStorage.setItem('mlt_email', formData.email.trim().toLowerCase());
            localStorage.setItem('mlt_name', formData.full_name);

            if (isFree) {
                window.location.href = '/mlt-direccion-success';
                return;
            }

            const reference = `mlt-dir-${registrationId}-${Date.now()}`;
            
            const { data: mpData, error: mpError } = await supabase.functions.invoke('create-mp-preference', {
                body: {
                    reference,
                    price: priceInCOP,
                    title: mltConfig.name,
                    user_email: formData.email,
                    back_url_custom: `${window.location.origin}/mlt-direccion-success`
                }
            });

            if (mpError) throw mpError;
            if (mpData?.error) throw new Error(mpData.error);

            if (mpData?.initPoint || mpData?.init_point) {
                window.location.href = mpData.initPoint || mpData.init_point;
            } else {
                throw new Error("No se pudo generar el link de pago.");
            }
            
            
        } catch (err) {
            console.error("Error en el registro:", err);
            setError("Hubo un problema al procesar tu registro. Por favor intenta de nuevo.");
            setLoading(false);
        }
    };

    const faqs = [
        {
            q: "¿Qué incluye el proceso de MLT Dirección?",
            a: "Incluye 4 encuentros virtuales de 90 minutos, herramientas de trabajo, ejercicios entre sesiones y acompañamiento por WhatsApp."
        },
        {
            q: "¿Para quién es exactamente?",
            a: "Para personas que están atravesando un momento de cambio, bloqueo, dispersión o decisión importante en su vida personal o profesional. Saben que necesitan actuar, pero tienen demasiadas variables abiertas."
        },
        {
            q: "¿Es un proceso de terapia o consultoría?",
            a: "No es terapia, no es un curso grabado, no es una consultoría técnica ni promete resolver todos los aspectos de la vida. Trabaja sobre una situación prioritaria que necesita dirección."
        },
        {
            q: "¿Cuál es el resultado esperado al final?",
            a: "Terminar el proceso sabiendo qué quieres resolver, qué has decidido y qué vas a hacer a continuación, junto con un plan de acción para los siguientes 30-90 días."
        }
    ];

    return (
        <div id="inicio" className="dominios-landing-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <div className="mlt-bg-glow"></div>

            <div style={{ flex: 1 }}>
                {/* Hero Section */}
                <section className="mlt-hero mlt-animate" style={{ minHeight: 'auto', padding: '60px 0', justifyContent: 'flex-start' }}>
                    <div className="mlt-section-content mlt-hero-container">
                        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                <div style={{ background: 'rgba(221, 190, 61, 0.1)', border: '1px solid #ddbe3d', padding: '8px 16px', borderRadius: '30px', color: '#ddbe3d', fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                    MLT Dirección
                                </div>
                            </div>
                            <h1 className="mlt-hero-title" style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: '1.2', marginBottom: '30px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto 20px auto' }}>
                                30 días para recuperar claridad y <span style={{ color: '#ddbe3d' }}>volver a avanzar.</span>
                            </h1>
                            <p style={{ fontSize: '20px', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', maxWidth: '800px', margin: '0 auto 40px auto' }}>
                                Hay momentos en los que el problema no es que no sepamos hacer las cosas. Tenemos demasiadas ideas, posibilidades, preocupaciones o decisiones abiertas al mismo tiempo y terminamos perdiendo dirección.
                            </p>
                            
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                <button onClick={() => setIsModalOpen(true)} className="mlt-btn-main" style={{ padding: '20px 45px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    Inscribirme Ahora
                                    <ArrowRight size={24} />
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '60px' }}>
                            {[
                                { icon: <Calendar size={30} />, text: "4 encuentros de 90 min" },
                                { icon: <Target size={30} />, text: "Trabajamos tu caso real" },
                                { icon: <Users size={30} />, text: <>Grupo reducido <br/> (máx 10)</> },
                                { icon: <Award size={30} />, text: "Plan de 30-90 días" }
                            ].map((item, idx) => (
                                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '25px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
                                    <div style={{ color: '#ddbe3d' }}>{item.icon}</div>
                                    <span style={{ fontSize: '18px', fontWeight: '600' }}>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Para Quién Es */}
                <section className="mlt-section mlt-animate" style={{ background: '#ffffff', color: '#002d44', padding: '80px 0' }}>
                    <div className="mlt-section-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h2 className="mlt-section-title" style={{ fontWeight: '900', textAlign: 'center', marginBottom: '40px', color: '#002d44' }}>
                            ¿Para quién es <span style={{ color: '#ddbe3d' }}>MLT Dirección?</span>
                        </h2>
                        <p style={{ fontSize: '20px', lineHeight: '1.6', textAlign: 'center', marginBottom: '40px' }}>
                            Personas que están atravesando un momento de cambio, bloqueo, dispersión o decisión importante en su vida personal o profesional. Saben que necesitan actuar, pero tienen demasiadas variables abiertas, llevan tiempo postergando una decisión o simplemente han perdido dirección.
                        </p>
                    </div>
                </section>

                {/* Ruta Section */}
                <section className="mlt-section mlt-animate" style={{ padding: '80px 0' }}>
                    <div className="mlt-section-content">
                        <h2 className="mlt-section-title" style={{ color: '#ddbe3d', marginBottom: '60px', textAlign: 'center' }}>La Ruta de los 30 Días</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '800px', margin: '0 auto' }}>
                            {[
                                { title: "Sesión 1 — Claridad", subtitle: "¿Qué está pasando realmente?", desc: "Entender qué está pasando realmente y definir cuál es el asunto que necesitas resolver." },
                                { title: "Sesión 2 — Decisión", subtitle: "¿Qué voy a elegir y a qué debo renunciar?", desc: "Identificar las decisiones pendientes, evaluar posibilidades y elegir una dirección." },
                                { title: "Sesión 3 — Acción", subtitle: "¿Cómo convierto la decisión en movimiento?", desc: "Convertir esa decisión en prioridades, acciones y un plan concreto." },
                                { title: "Sesión 4 — Dirección", subtitle: "¿Cómo sostengo el rumbo después de los 30 días?", desc: "Construir una brújula personal y un plan de 30–90 días que te permita sostener el avance." }
                            ].map((s, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '16px', borderLeft: '4px solid #ddbe3d' }}>
                                    <h3 style={{ fontSize: '24px', color: '#ddbe3d', marginBottom: '10px' }}>{s.title}</h3>
                                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>{s.subtitle}</h4>
                                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Cohorte details */}
                <section className="mlt-section mlt-animate" style={{ background: '#ffffff', padding: '80px 0' }}>
                    <div className="mlt-section-content" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 className="mlt-section-title" style={{ color: '#002d44', marginBottom: '20px' }}>Primera Cohorte <br/> Septiembre 2026</h2>
                        <p style={{ fontSize: '20px', color: '#002d44', marginBottom: '40px', fontWeight: 'bold' }}>Comenzamos la próxima semana y todo el proceso termina dentro de septiembre.</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', textAlign: 'left' }}>
                            <div style={{ background: '#0a192f', padding: '40px', borderRadius: '20px', color: '#ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                <h3 style={{ color: '#ddbe3d', marginBottom: '25px', fontSize: '22px', borderBottom: '1px solid rgba(221,190,61,0.2)', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Target size={24} /> Detalles Generales
                                </h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '16px' }}>
                                    <li style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}><span style={{ color: '#ddbe3d', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Inicio</span> <span>Lunes 7 de septiembre</span></li>
                                    <li style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}><span style={{ color: '#ddbe3d', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Horario</span> <span>7:30 p.m. – 9:00 p.m. (Colombia)</span></li>
                                    <li style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}><span style={{ color: '#ddbe3d', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Modalidad</span> <span>Virtual (Zoom/Meet)</span></li>
                                    <li style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}><span style={{ color: '#ddbe3d', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Inversión</span> <span>$900.000 COP</span></li>
                                </ul>
                            </div>
                            <div style={{ background: '#0a192f', padding: '40px', borderRadius: '20px', color: '#ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                                <h3 style={{ color: '#ddbe3d', marginBottom: '25px', fontSize: '22px', borderBottom: '1px solid rgba(221,190,61,0.2)', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Calendar size={24} /> Calendario de Sesiones
                                </h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '16px' }}>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ background: 'rgba(221,190,61,0.1)', color: '#ddbe3d', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', minWidth: '90px', textAlign: 'center' }}>Sesión 1</div>
                                        <span>Lunes 7 de sept.</span>
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ background: 'rgba(221,190,61,0.1)', color: '#ddbe3d', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', minWidth: '90px', textAlign: 'center' }}>Sesión 2</div>
                                        <span>Lunes 14 de sept.</span>
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ background: 'rgba(221,190,61,0.1)', color: '#ddbe3d', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', minWidth: '90px', textAlign: 'center' }}>Sesión 3</div>
                                        <span>Lunes 21 de sept.</span>
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ background: 'rgba(221,190,61,0.1)', color: '#ddbe3d', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', minWidth: '90px', textAlign: 'center' }}>Sesión 4</div>
                                        <span>Lunes 28 de sept.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button onClick={() => setIsModalOpen(true)} className="mlt-btn-main" style={{ marginTop: '50px', padding: '20px 60px' }}>
                                Asegurar mi cupo
                            </button>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="mlt-section" style={{ padding: '80px 0' }}>
                    <div className="mlt-section-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 className="mlt-section-title" style={{ textAlign: 'center', marginBottom: '50px' }}>Preguntas <span style={{ color: '#ddbe3d' }}>Frecuentes</span></h2>
                        <div className="mlt-faq-container">
                            {faqs.map((faq, index) => (
                                <div key={index} className={`mlt-faq-item ${openFaq === index ? 'active' : ''}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                                    <div className="mlt-faq-question">
                                        <h3 style={{ color: '#ffffff' }}>{faq.q}</h3>
                                        <div className="mlt-faq-icon">
                                            {openFaq === index ? <ChevronUp size={24} color="#ddbe3d"/> : <ChevronDown size={24} color="rgba(255,255,255,0.5)"/>}
                                        </div>
                                    </div>
                                    <div className="mlt-faq-answer">
                                        <p style={{ color: 'rgba(255,255,255,0.9)' }}>{faq.a}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About Us Section */}
                <section className="mlt-section mlt-animate" style={{ background: '#ffffff', color: '#002d44', padding: '80px 0' }}>
                    <div className="mlt-section-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 className="mlt-section-title" style={{ color: '#002d44', marginBottom: '40px', textAlign: 'center' }}>¿Quiénes están detrás de <span style={{ color: '#ddbe3d' }}>MLT Dirección?</span></h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', fontSize: '18px', lineHeight: '1.7', textAlign: 'left' }}>
                            <p>
                                <strong>Auténticos</strong> es una iniciativa dedicada al desarrollo humano, el liderazgo y la transformación personal, que crea experiencias para ayudar a las personas a conocerse mejor, tomar decisiones con mayor claridad y construir una vida más consciente y coherente.
                            </p>
                            <p>
                                <strong>Felipe Beltrán</strong> es economista, empresario, mentor y conferencista, con más de 20 años de experiencia acompañando personas, líderes y organizaciones en procesos de estrategia, liderazgo, innovación y desarrollo humano. Es creador de la metodología <em>Master Live Training (MLT)</em>, de la cual nace MLT Dirección.
                            </p>
                            <p style={{ background: 'rgba(221,190,61,0.1)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #ddbe3d' }}>
                                MLT Dirección reúne esa experiencia en un proceso práctico de 30 días para quienes necesitan ordenar sus ideas, tomar decisiones y volver a avanzar con dirección.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer Section */}
            <footer style={{ background: '#002d44', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '20px 0', marginTop: 'auto' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <img src="/Logo-Blanco.png" alt="Auténticos" style={{ height: '35px' }} />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <a href="#" style={{ color: '#ddbe3d', transition: 'opacity 0.3s' }}><Globe size={20} /></a>
                            <a href="#" style={{ color: '#ddbe3d', transition: 'opacity 0.3s' }}>
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            </a>
                            <a href="#" style={{ color: '#ddbe3d', transition: 'opacity 0.3s' }}>
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                            </a>
                            <a href="#" style={{ color: '#ddbe3d', transition: 'opacity 0.3s' }}>
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                            </a>
                            <a href="#" style={{ color: '#ddbe3d', transition: 'opacity 0.3s' }}>
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Modals */}
            {isModalOpen && (
                <div className="mlt-modal-overlay">
                    <div className="mlt-modal-content" style={{ background: '#ffffff', color: '#002d44', borderRadius: '16px', padding: '30px', maxWidth: '500px', width: '90%' }}>
                        <div className="mlt-modal-header" style={{ borderBottom: '1px solid rgba(0,45,68,0.1)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ color: '#002d44', margin: 0, fontSize: '24px' }}>Inscripción a MLT Dirección</h2>
                            <button className="mlt-modal-close" onClick={() => setIsModalOpen(false)} style={{ color: '#002d44', background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer' }}>×</button>
                        </div>
                        <div className="mlt-modal-body">
                            <p style={{ marginBottom: '20px', color: 'rgba(0,45,68,0.8)', lineHeight: '1.5' }}>
                                Estás a un paso de recuperar tu claridad. Por favor, completa tus datos para generar tu link de pago seguro.
                            </p>
                            <form onSubmit={handleSubmit} className="mlt-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className="mlt-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ color: '#002d44', fontWeight: 'bold', fontSize: '14px' }}>Nombre Completo</label>
                                    <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} placeholder="Ej. Juan Pérez" style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(0,45,68,0.2)', background: '#f8f9fa', color: '#002d44', fontFamily: 'inherit', fontSize: '15px', boxSizing: 'border-box' }} />
                                </div>
                                <div className="mlt-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ color: '#002d44', fontWeight: 'bold', fontSize: '14px' }}>Correo Electrónico</label>
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="juan@ejemplo.com" style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(0,45,68,0.2)', background: '#f8f9fa', color: '#002d44', fontFamily: 'inherit', fontSize: '15px', boxSizing: 'border-box' }} />
                                </div>
                                <div className="mlt-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ color: '#002d44', fontWeight: 'bold', fontSize: '14px' }}>Teléfono (WhatsApp)</label>
                                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+57 300 000 0000" style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(0,45,68,0.2)', background: '#f8f9fa', color: '#002d44', fontFamily: 'inherit', fontSize: '15px', boxSizing: 'border-box' }} />
                                </div>
                                <div className="mlt-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ color: '#002d44', fontWeight: 'bold', fontSize: '14px' }}>¿Qué situación concreta te gustaría haber aclarado al terminar estos 30 días?</label>
                                    <textarea name="goal" required value={formData.goal} onChange={handleChange} placeholder="Escribe brevemente tu situación..." rows="3" style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(0,45,68,0.2)', background: '#f8f9fa', color: '#002d44', fontFamily: 'inherit', fontSize: '15px', boxSizing: 'border-box', resize: 'vertical' }}></textarea>
                                </div>
                                <div className="mlt-form-group" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label 
                                        onClick={() => setShowCoupon(!showCoupon)}
                                        style={{ color: '#002d44', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        ¿Tienes un cupón de descuento? {showCoupon ? '▼' : '►'}
                                    </label>
                                    {showCoupon && (
                                        <input type="text" name="coupon" value={formData.coupon} onChange={handleChange} style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(0,45,68,0.2)', background: '#f8f9fa', color: '#002d44', fontFamily: 'inherit', fontSize: '15px', boxSizing: 'border-box', textTransform: 'uppercase', marginTop: '5px' }} />
                                    )}
                                </div>
                                
                                <div style={{ padding: '15px', background: isFree ? 'rgba(0, 179, 126, 0.15)' : 'rgba(221, 190, 61, 0.15)', border: `1px solid ${isFree ? 'rgba(0, 179, 126, 0.4)' : 'rgba(221, 190, 61, 0.4)'}`, borderRadius: '8px', marginTop: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', color: '#002d44' }}>Total a pagar:</span>
                                    <span style={{ color: isFree ? '#00b37e' : '#b89a2b', fontSize: '20px', fontWeight: '900' }}>
                                        {isFree ? 'GRATIS' : '$900.000 COP'}
                                    </span>
                                </div>

                                {error && <div style={{ color: '#ff4444', marginBottom: '15px', fontSize: '14px', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
                                
                                <button type="submit" className="mlt-btn-main" style={{ width: '100%', padding: '15px', background: isFree ? '#00b37e' : '#ddbe3d', color: isFree ? '#ffffff' : '#002d44', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'background 0.3s ease' }} disabled={loading}>
                                    {loading ? 'Procesando...' : (isFree ? 'Completar Registro Gratis' : 'Continuar al pago seguro')}
                                </button>
                                <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#00b37e', fontWeight: '900', fontSize: '18px', letterSpacing: '0.5px' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                                        COMPRA 100% SEGURA
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px' }}>
                                        <img src="/visa.png" alt="Visa" style={{ height: '28px', objectFit: 'contain' }} />
                                        <img src="/mastercard.png" alt="Mastercard" style={{ height: '36px', objectFit: 'contain' }} />
                                        <img src="/mercadopago.png" alt="Mercado Pago" style={{ height: '38px', objectFit: 'contain' }} />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MltDireccionLanding;
