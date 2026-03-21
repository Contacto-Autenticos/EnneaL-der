import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Star, Shield, Target, BookOpen, Users, ArrowRight, CheckCircle2, Play, ArrowLeft, Lock, Rocket } from 'lucide-react';
import './CourseLanding.css';

const VideoLoopWithFlash = ({ src }) => {
    const videoRef = useRef(null);
    const [showFlash, setShowFlash] = useState(false);

    const handleVideoEnd = () => {
        setShowFlash(true);
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play();
            }
            setTimeout(() => {
                setShowFlash(false);
            }, 300); // Duration of the flash effect
        }, 100); // Buffer before restart
    };

    return (
        <div style={{ 
            position: 'relative', 
            width: '100%', 
            maxHeight: '520px', // Restricting height for symmetric crop
            borderRadius: '24px', 
            overflow: 'hidden', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', 
            border: '1px solid rgba(255,255,255,0.1)' 
        }}>
            <video 
                ref={videoRef}
                src={src}
                autoPlay 
                muted 
                playsInline
                onEnded={handleVideoEnd}
                style={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'block',
                    objectFit: 'cover',
                    objectPosition: 'center' // This ensures top and bottom are cropped equally
                }}
            />
            {/* Mask for "Veo" logo at bottom right */}
            <div style={{ 
                position: 'absolute', 
                bottom: '8px', 
                right: '8px', 
                width: '60px', 
                height: '30px', 
                background: '#0a161e', 
                zIndex: 5,
                borderRadius: '4px'
            }} />
            {showFlash && (
                <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: '#fff', 
                    zIndex: 10,
                    transition: 'opacity 0.2s ease-in-out'
                }} />
            )}
        </div>
    );
};

const PUBLIC_KEY = 'pub_prod_ceDiKCiH2oITOqT5nkOdz7hm5coX7A7t';
const WOMPI_CURRENCY = 'COP';

const GenuinosLanding = () => {
    const navigate = useNavigate();
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [signatureData, setSignatureData] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null); // 'virtual' or 'presencial'
    const [paymentError, setPaymentError] = useState(null);

    // Registration Form State
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [regData, setRegData] = useState({
        full_name: '',
        email: '',
        phone: ''
    });
    const [regLoading, setRegLoading] = useState(false);

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setShowPriceModal(true);
    };

    const handleEnrollDirect = (plan) => {
        setSelectedPlan(plan);
        setShowRegisterForm(true);
    };


    const handleRegistration = async (e) => {
        e.preventDefault();
        setRegLoading(true);
        try {
            // 1. Save Lead to Supabase
            const { error: leadError } = await supabase
                .from('user_leads')
                .insert([{
                    full_name: regData.full_name,
                    email: regData.email.trim().toLowerCase(),
                    phone: regData.phone,
                    source: `genuinos_${selectedPlan}`, // Updated source for tracking
                    created_at: new Date().toISOString()
                }]);

            if (leadError) console.error('Error saving lead:', leadError);

            // 2. Proceed to Payment Signature
            await initiatePayment(selectedPlan, regData.email);
            
            setShowRegisterForm(false);
        } catch (err) {
            console.error('Registration error:', err);
            setPaymentError('Error al registrar tus datos. Por favor intenta de nuevo.');
        } finally {
            setRegLoading(false);
        }
    };

    const initiatePayment = async (plan, customerEmail) => {
        try {
            setPaymentLoading(true);
            setPaymentError(null);

            const amountInCents = plan === 'virtual' ? 36000000 : 57000000;
            const reference = `gen-${plan}-${Date.now()}`; // Updated reference

            const { data, error } = await supabase.functions.invoke('create-wompi-signature', {
                body: { reference, amount: amountInCents, currency: WOMPI_CURRENCY }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            setSignatureData({
                ...data,
                amountInCents,
                customerEmail // Store for later if needed
            });
        } catch (err) {
            console.error('Error fetching signature:', err);
            setPaymentError(`Error al iniciar pago: ${err.message || 'Intenta de nuevo'}`);
            setPaymentLoading(false);
        }
    };

    const handlePayment = async (plan) => {
        // Redundant with handlePlanSelect but kept for compatibility or updated to use select
        handleSelectPlan(plan);
    };

    useEffect(() => {
        if (signatureData && selectedPlan) {
            const script = document.createElement('script');
            script.src = 'https://checkout.wompi.co/widget.js';
            script.setAttribute('data-render', 'button');
            script.setAttribute('data-public-key', PUBLIC_KEY);
            script.setAttribute('data-currency', WOMPI_CURRENCY);
            script.setAttribute('data-amount-in-cents', signatureData.amountInCents);
            script.setAttribute('data-reference', signatureData.reference);
            script.setAttribute('data-signature:integrity', signatureData.signature);
            script.setAttribute('data-redirect-url', `${window.location.origin}/payment-status`); 

            const containerId = selectedPlan === 'virtual' ? 'wompi-container-virtual' : 'wompi-container-presencial';
            const container = document.getElementById(containerId);
            
            if (container) {
                container.innerHTML = ''; 
                container.appendChild(script);

                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.tagName === 'FORM' || node.tagName === 'BUTTON' || node.querySelector?.('button')) {
                                const btn = node.tagName === 'BUTTON' ? node : node.querySelector('button');
                                if (btn) {
                                    // Forzar estilos premium
                                    btn.style.setProperty('width', '100%', 'important');
                                    btn.style.setProperty('border-radius', '100px', 'important');
                                    btn.style.setProperty('background-color', selectedPlan === 'virtual' ? '#ddbe3d' : 'transparent', 'important');
                                    btn.style.setProperty('border', selectedPlan === 'virtual' ? 'none' : '1px solid #ddbe3d', 'important');
                                    btn.style.setProperty('color', selectedPlan === 'virtual' ? '#001a2c' : '#ddbe3d', 'important');
                                    btn.style.setProperty('font-size', '18px', 'important');
                                    btn.style.setProperty('font-weight', '900', 'important');
                                    btn.style.setProperty('min-height', '70px', 'important');
                                    btn.style.setProperty('letter-spacing', '0.1em', 'important');
                                    btn.style.setProperty('text-transform', 'uppercase', 'important');
                                    btn.style.setProperty('cursor', 'pointer', 'important');
                                    btn.style.setProperty('transition', 'all 0.3s ease', 'important');
                                    
                                    // Forzar nuestro texto e icono para evitar que Wompi ponga "Paga con Wompi"
                                    const planText = selectedPlan === 'virtual' ? 'INSCRIBIRME VIRTUAL' : 'INSCRIBIRME PRESENCIAL';
                                    btn.innerHTML = `<span>${planText}</span> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock" style="margin-left: 10px; vertical-align: middle;"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
                                    
                                    setPaymentLoading(false);

                                    // Intentar abrir automáticamente la pasarela para que el usuario no deba clickear 2 veces
                                    setTimeout(() => {
                                        if (btn && typeof btn.click === 'function') {
                                            btn.click();
                                        }
                                    }, 100);
                                }
                            }
                        });
                    });
                });
                observer.observe(container, { childList: true, subtree: true });

                return () => observer.disconnect();
            }
        }
    }, [signatureData, selectedPlan]);

    useEffect(() => {
        window.scrollTo(0, 0);
        // Apply body classes for styling if needed, similar to AdvancedLanding
        document.body.style.backgroundColor = '#002d44';
        document.body.style.color = '#ffffff';

        return () => {
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
        };
    }, []);

    return (
        <div className="course-landing-container">
            <div className="al-bg-glow"></div>

            {/* Navigation */}
            <nav className="al-nav scrolled">
                <div className="al-nav-content">
                    <div className="al-logo-wrapper">
                        <img src="/Logo-Blanco.png" alt="Auténticos Logo" className="al-logo" />
                    </div>
                    <div className="al-nav-links">
                        <span onClick={() => window.history.back()} className="al-nav-back-arrow" title="Volver">
                            <ArrowLeft size={16} />
                        </span>
                    </div>
                </div>
            </nav>

            {/* Hero / Intro Section */}
            <section className="al-hero al-animate">
                <div className="al-tag">
                    <Star size={14} /> PROGRAMA AVANZADO
                </div>

                <h1 className="al-hero-title">
                    <span className="al-hero-title-top" style={{ fontSize: '0.8em', marginBottom: '30px' }}>
                        Descubre cómo estás liderando realmente
                    </span>
                    <span className="al-gold-text" style={{ fontSize: '0.5em', lineHeight: '1.2' }}>
                        Identifica la estructura desde la que tomas <br className="al-mobile-br" /> decisiones, reaccionas bajo presión <br className="al-mobile-br" /> y lideras a otros usando el Eneagrama <br className="al-mobile-br" /> aplicado al mundo empresarial.
                    </span>
                </h1>

                <div className="course-intro-content" style={{ marginTop: '30px' }}>
                    <div className="al-hero-bullets" style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '12px', 
                        alignItems: 'center',
                        marginBottom: '40px'
                    }}>
                        {[
                            "Descubre tu tipo de liderazgo dominante",
                            "Entiende por qué repites ciertos patrones",
                            "Aprende cómo mejorar tu forma de decidir"
                        ].map((bullet, idx) => (
                            <div key={idx} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px',
                                fontSize: '1.1rem',
                                color: 'rgba(255,255,255,0.9)',
                                background: 'rgba(255,255,255,0.05)',
                                padding: '10px 20px',
                                borderRadius: '50px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <span style={{ color: '#ddbe3d' }}>✔</span>
                                <span>{bullet}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="al-hero-actions">
                    <a href="#precios" className="al-btn-primary closing-cta" style={{ padding: '20px 40px', fontSize: '1.1rem', fontWeight: '900' }}>
                        QUIERO DESCUBRIR MI MAPA INTERIOR
                    </a>
                </div>
            </section>

            {/* NEW: Introspection Section - Leadership Focus */}
            <section className="course-introspection al-animate">
                <div className="al-section-content">
                    <div className="introspection-no-box" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <p className="introspection-closing" style={{ fontSize: '2.5rem', marginBottom: '40px', textAlign: 'center', fontWeight: '800', lineHeight: '1.2' }}>
                            Muchas personas con talento y potencial de liderazgo se encuentran con una realidad difícil de explicar.
                        </p>
                        
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '30px', 
                            marginBottom: '60px',
                            flexWrap: 'wrap'
                        }}>
                            {["Tienen experiencia.", "Tienen conocimiento.", "Tienen capacidad."].map((text, i) => (
                                <div key={i} style={{ 
                                    background: 'rgba(221, 190, 61, 0.1)', 
                                    padding: '15px 25px', 
                                    borderRadius: '12px',
                                    border: '1px solid rgba(221, 190, 61, 0.3)',
                                    color: '#ddbe3d',
                                    fontWeight: '700',
                                    fontSize: '1.25rem'
                                }}>
                                    {text}
                                </div>
                            ))}
                        </div>

                        <div style={{ textAlign: 'left', display: 'block', padding: '0' }}>
                            <p className="introspection-transition" style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '35px', fontStyle: 'normal', fontWeight: '500' }}>
                                Y aun así aparecen situaciones que se repiten:
                            </p>
                            
                            <ul style={{ 
                                listStyle: 'none', 
                                padding: '0', 
                                margin: '0 0 50px 0',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '20px'
                            }}>
                                {[
                                    "decisiones que generan tensión en el equipo",
                                    "conflictos que escalan innecesariamente",
                                    "presión que activa reacciones impulsivas",
                                    "dificultad para delegar o confiar",
                                    "patrones que vuelven a aparecer una y otra vez"
                                ].map((item, idx) => (
                                    <li key={idx} style={{ 
                                        display: 'flex', 
                                        alignItems: 'flex-start', 
                                        gap: '12px',
                                        fontSize: '1.25rem',
                                        color: 'rgba(255,255,255,0.9)',
                                        lineHeight: '1.4'
                                    }}>
                                        <span style={{ color: '#ddbe3d', fontSize: '1.5rem', lineHeight: '1' }}>•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '4rem' }}>
                            <p className="introspection-closing" style={{ fontSize: '0.4em', marginBottom: '10px', color: '#fff' }}>
                                Y lo más importante…
                            </p>
                            
                            <p className="introspection-closing" style={{ fontSize: '0.6em', fontWeight: '800', color: '#ddbe3d', marginBottom: '30px' }}>
                                No es falta de inteligencia.
                            </p>
                            
                            <p className="introspection-closing" style={{ fontSize: '0.35em', lineHeight: '1.6', opacity: '0.9', maxWidth: '700px', margin: '0 auto', color: 'rgba(255,255,255,0.8)' }}>
                                El problema es que la mayoría de las personas lidera desde una <strong style={{ color: '#fff', fontSize: '1.3em' }}>estructura automática</strong> que nunca aprendió a reconocer.
                            </p>

                            <div style={{ marginTop: '50px' }}>
                                <a href="#precios" className="al-btn-primary closing-cta">
                                    COMENZAR MI TRANSFORMACIÓN
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Map Section - Two Columns */}
            <section className="course-map al-animate">
                <div className="al-section-content">
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                        gap: '60px',
                        alignItems: 'center',
                        marginTop: '40px'
                    }}>
                        {/* Left Column: Text */}
                        <div className="map-text-column">
                            <h2 style={{ fontSize: '2.2rem', color: '#ddbe3d', marginBottom: '25px', lineHeight: '1.2' }}>
                                Imagina que tu forma de pensar, sentir y actuar estuviera guiada por un mapa invisible.
                            </h2>
                            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.85)', marginBottom: '35px', lineHeight: '1.6' }}>
                                Un mapa que se formó a lo largo de tu vida para ayudarte a adaptarte al mundo.
                            </p>

                            <div style={{ marginBottom: '40px' }}>
                                <p style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '20px', fontWeight: '600' }}>Ese mapa determina:</p>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {[
                                        'cómo percibes las oportunidades',
                                        'cómo interpretas el conflicto',
                                        'cómo reaccionas bajo presión',
                                        'cómo tomas decisiones importantes'
                                    ].map((item, i) => (
                                        <li key={i} style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '12px', 
                                            fontSize: '1.2rem', 
                                            color: 'rgba(255,255,255,0.8)',
                                            marginBottom: '12px'
                                        }}>
                                            <div style={{ width: '6px', height: '6px', background: '#ddbe3d', borderRadius: '50%' }}></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', marginBottom: '20px', lineHeight: '1.6' }}>
                                El Eneagrama es uno de los sistemas más profundos que existen para comprender ese mapa.
                            </p>
                            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', lineHeight: '1.6' }}>
                                Cuando puedes verlo con claridad, empiezas a recuperar algo muy valioso: <span style={{ color: '#ddbe3d' }}>la capacidad de elegir cómo responder.</span>
                            </p>
                        </div>

                        {/* Right Column: Video */}
                        <div className="map-video-column">
                            <VideoLoopWithFlash src="/Videos/Eneagrama-Autenticos.mp4" />
                        </div>
                    </div>
                </div>
            </section>
            {/* NEW: Experience Section */}
            <section className="course-experience al-animate">
                <div className="al-section-content">
                    <div className="introspection-box">
                        <h2 className="al-hero-title" style={{ fontSize: 'clamp(28px, 5vw, 42px)', marginBottom: '60px', textAlign: 'center' }}>
                            <span className="al-hero-title-top">Este proceso está diseñado para</span>
                            <span className="al-gold-text">acompañarte a:</span>
                        </h2>

                        <ul className="introspection-list">
                            <li>Observarte con mayor profundidad.</li>
                            <li>Comprender tu personalidad desde una mirada más amplia.</li>
                            <li>Reconocer las dinámicas internas que influyen en tu forma de vivir, decidir y relacionarte.</li>
                            <li>Y abrir un camino de desarrollo que nazca desde la conciencia, no desde la exigencia.</li>
                        </ul>

                        <div className="introspection-divider"></div>

                        <p className="introspection-closing" style={{ fontSize: '1.4rem', fontWeight: '700' }}>
                            El objetivo no es etiquetarte, sino comprenderte con mayor profundidad.
                        </p>
                    </div>
                </div>
            </section>

            {/* NEW: Workshop Modalities Section */}
            <section className="course-modalities al-animate">
                <div className="al-section-content">
                    <div className="modalities-header">
                        <h2 className="al-hero-title" style={{ fontSize: 'clamp(28px, 5vw, 42px)' }}>
                            <span className="al-hero-title-top">Este taller es especialmente</span>
                            <span className="al-gold-text">valioso para ti, sí:</span>
                        </h2>

                        <div className="target-audience-grid">
                            {[
                                'Quieres comprenderte con mayor profundidad.',
                                'Te interesa el desarrollo personal real, más allá de ideas superficiales.',
                                'Deseas tomar decisiones con mayor claridad y conciencia.',
                                'Buscas herramientas para liderar mejor tu vida personal o profesional.',
                                'Quieres comprender mejor a las personas con las que trabajas o convives.',
                                'Sientes que es momento de dar un paso profundo hacia tu autoconocimiento y transformación.'
                            ].map((item, i) => (
                                <div key={i} className="target-item">
                                    <div className="target-dot"></div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="modalities-choice-box">
                        <p className="introspection-transition text-center" style={{ marginBottom: '40px', fontSize: '1.6rem', color: '#ddbe3d', fontWeight: '800', textAlign: 'center' }}>
                            Comienza aquí, accede a este contenido de dos formas:
                        </p>

                        <div className="modality-cards">
                            <div className="modality-card">
                                <div className="modality-tag">EN LÍNEA</div>
                                <h3 className="modality-title">Taller virtual en vivo</h3>
                                <div className="modality-stats">
                                    <span>4 sesiones</span>
                                    <div className="stats-divider"></div>
                                    <span>2 horas por sesión</span>
                                </div>
                                <div className="modality-date-info" style={{ marginTop: '10px', color: '#ddbe3d', fontWeight: '700', fontSize: '0.95rem' }}>
                                    14, 15, 16, 17 de abril<br/>
                                    7:00 PM a 9:00 PM (Hora Col)
                                </div>
                                <p style={{ marginTop: '15px' }}>Un espacio de aprendizaje progresivo donde exploraremos el sistema completo del Eneagrama.</p>
                                <button className="al-btn-primary" style={{ marginTop: '20px', backgroundColor: '#ddbe3d', color: '#002d44', fontWeight: '900', border: 'none', padding: '22px 30px', width: '100%' }} onClick={() => handleSelectPlan('virtual')}>Seleccionar Virtual</button>
                            </div>

                            <div className="modality-card card-featured">
                                <div className="modality-tag">Cali, Colombia</div>
                                <h3 className="modality-title">Taller presencial</h3>
                                <div className="modality-stats">
                                    <span>Jornada Intensiva</span>
                                    <div className="stats-divider"></div>
                                    <span>8 horas</span>
                                </div>
                                <div className="modality-date-info" style={{ marginTop: '10px', color: '#ddbe3d', fontWeight: '700', fontSize: '0.95rem' }}>
                                    11 de abril<br/>
                                    9:00 AM a 5:00 PM
                                </div>
                                <p style={{ marginTop: '15px' }}>Donde vivirás una experiencia profunda de autoconocimiento y comprensión de los patrones humanos.</p>
                                <button className="al-btn-primary" style={{ marginTop: '20px', backgroundColor: '#ddbe3d', color: '#002d44', fontWeight: '900', border: 'none', padding: '22px 30px', width: '100%' }} onClick={() => handleSelectPlan('presencial')}>Seleccionar Presencial</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Step 3: Registration Modal */}
            {showPriceModal && (
                <div className="registration-modal-overlay" onClick={() => setShowPriceModal(false)}>
                    <div className="registration-modal-content al-animate" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: '0', overflow: 'hidden' }}>
                        <button className="modal-close-btn" onClick={() => setShowPriceModal(false)}>✕</button>
                        
                        <div className={`al-pricing-card card-featured`} style={{ margin: '0', borderRadius: '0', border: 'none' }}>
                            <div className="al-pricing-header">
                                <h3>{selectedPlan === 'virtual' ? 'Programa Virtual' : 'Programa Presencial'}</h3>
                            </div>
                            <div className="al-pricing-content" style={{ padding: '40px' }}>
                                <div className="al-price-box">
                                    <div className="al-current-price">
                                        <span className="al-price-number">{selectedPlan === 'virtual' ? '$360.000' : '$570.000'}</span>
                                        <span className="al-currency">COP</span>
                                    </div>
                                    <div style={{ color: '#ddbe3d', fontWeight: '700', textAlign: 'center', marginTop: '10px' }}>
                                        {selectedPlan === 'virtual' ? '14, 15, 16, 17 de abril' : '11 de abril'}
                                    </div>
                                </div>

                                <div className="al-pricing-grid" style={{ marginTop: '30px' }}>
                                    {(selectedPlan === 'virtual' ? [
                                        '4 Sesiones en vivo',
                                        'Guías de ejercicios prácticos',
                                        'Sesiones de Q&A grabadas',
                                        'Comunidad exclusiva',
                                        'Acceso de por vida a grabaciones',
                                        'Certificado de finalización'
                                    ] : [
                                        'Jornada Intensiva (8 horas)',
                                        'Material físico de trabajo',
                                        'Refrigerios incluidos',
                                        'Comunidad presencial',
                                        'Networking con asistentes',
                                        'Certificado de finalización'
                                    ]).map((item, i) => (
                                        <div key={i} className="al-pricing-item">
                                            <CheckCircle2 size={16} /> {item}
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    className="al-btn-buy" 
                                    style={{ width: '100%', marginTop: '30px' }}
                                    onClick={() => {
                                        setShowPriceModal(false);
                                        setShowRegisterForm(true);
                                    }}
                                >
                                    Inscribirme {selectedPlan === 'virtual' ? 'Virtual' : 'Presencial'} <Lock size={20} />
                                </button>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '15px', textAlign: 'center' }}>Acceso instantáneo • Pago seguro vía Wompi</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showRegisterForm && (
                <div className="registration-modal-overlay" onClick={() => setShowRegisterForm(false)}>
                    <div className="registration-modal-content al-animate" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowRegisterForm(false)}>✕</button>
                        
                        <h2 className="al-hero-title" style={{ fontSize: '1.8rem', marginBottom: '30px', textAlign: 'center' }}>
                            <span className="al-hero-title-top" style={{ fontSize: '0.6em' }}>Completa tus datos</span>
                            <span className="al-gold-text" style={{ fontSize: '0.9em' }}>para la inscripción {selectedPlan === 'virtual' ? 'Virtual' : 'Presencial'}</span>
                        </h2>
                        
                        <form onSubmit={handleRegistration} className="advanced-reg-form" style={{ background: 'rgba(255,255,255,0.02)', padding: '0', border: 'none' }}>
                            <div className="form-group-adv">
                                <label>Nombre Completo</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="adv-input"
                                    placeholder="Como aparecerá en tu certificado"
                                    value={regData.full_name}
                                    onChange={(e) => setRegData({...regData, full_name: e.target.value})}
                                />
                            </div>
                            <div className="form-group-adv">
                                <label>Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    required 
                                    className="adv-input"
                                    placeholder="Donde recibirás el acceso"
                                    value={regData.email}
                                    onChange={(e) => setRegData({...regData, email: e.target.value})}
                                />
                            </div>
                            <div className="form-group-adv">
                                <label>Número de Celular (WhatsApp)</label>
                                <input 
                                    type="tel" 
                                    required 
                                    className="adv-input"
                                    placeholder="Ej: +57 300 123 4567"
                                    value={regData.phone}
                                    onChange={(e) => setRegData({...regData, phone: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="al-btn-primary confirm-btn-premium" 
                                style={{ 
                                    width: '100%', 
                                    marginTop: '20px',
                                    backgroundColor: '#ffffff',
                                    color: '#002d44',
                                    fontSize: '1.1rem',
                                    padding: '20px',
                                    fontWeight: '900'
                                }} 
                                disabled={regLoading}
                            >
                                {regLoading ? 'Procesando...' : 'Confirmar Datos e Inscribirme'}
                            </button>
                            
                            {paymentError && (
                                <p style={{ color: '#ff6b6b', marginTop: '15px', textAlign: 'center', fontSize: '0.9rem' }}>{paymentError}</p>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* NEW: Instructor Section */}
            <section className="course-instructor al-animate">
                <div className="al-section-content">
                    <div className="instructor-flex">
                        <div className="instructor-image-container">
                            <div className="instructor-image-glow"></div>
                            <img src="/FB-Enesencia-2.png" alt="Felipe Beltrán" className="instructor-image" />
                        </div>

                        <div className="instructor-info">
                            <h2 className="instructor-name">
                                <span className="name-white">Felipe</span>
                                <span className="name-yellow">Beltran</span>
                            </h2>
                            <div className="instructor-divider"></div>
                            <p className="instructor-bio">
                                <strong>Conferencista internacional</strong> con más de 18 años de experiencia en liderazgo, innovación y desarrollo humano.
                            </p>
                            <p className="instructor-bio">
                                Ha acompañado procesos de formación en más de 30 ciudades y ha trabajado con miles de personas explorando cómo comprender mejor la naturaleza humana y el potencial personal.
                            </p>
                            <p className="instructor-bio testimony">
                                "A través del eneagrama empecé a comprender quién era, por qué pensaba, sentía y hacía las cosas de una determinada manera.
                            </p>
                            <p className="instructor-bio testimony">
                                Entonces dejé de juzgarme y empecé a aceptarme. Concentré mi energía en potenciar mis talentos naturales para ponerlos al servicio mío y de los demás."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Closing Section */}
            <section className="course-closing al-animate">
                <div className="al-section-content">
                    <div className="closing-box">
                        <p className="closing-lead">
                            Comprender cómo funciona tu personalidad puede cambiar la forma en que te relacionas contigo mismo y con los demás.
                        </p>

                        <div className="closing-statement">
                            <p>El autoconocimiento no cambia tu vida por sí solo.</p>
                            <p className="al-gold-text">Lo que la transforma es la claridad que aparece cuando comienzas a verte con mayor conciencia.</p>
                        </div>

                        <a href="#precios" className="al-btn-primary closing-cta">
                            RESERVA TU LUGAR
                        </a>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="precios" className="al-section al-pricing-section">
                <div className="al-section-content">
                    <div className="al-pricing-wrapper al-animate">
                        {/* Tarjeta Virtual */}
                        <div className={`al-pricing-card ${selectedPlan === 'virtual' ? 'card-featured' : ''}`}>
                            <div className="al-pricing-glow"></div>
                            <div className="al-pricing-header">
                                <h3>Programa Virtual</h3>
                            </div>

                            <div className="al-pricing-content">
                                <div className="al-price-box">
                                    <div className="al-current-price">
                                        <span className="al-price-number">$360.000</span>
                                        <span className="al-currency">COP</span>
                                    </div>
                                    <div style={{ color: '#ddbe3d', fontWeight: '700', textAlign: 'center', marginTop: '10px' }}>
                                        14, 15, 16, 17 de abril
                                    </div>
                                </div>

                                <div className="al-pricing-grid">
                                    {[
                                        '4 Sesiones en vivo',
                                        'Guías de ejercicios prácticos',
                                        'Sesiones de Q&A grabadas',
                                        'Comunidad exclusiva',
                                        'Acceso de por vida a grabaciones',
                                        'Certificado de finalización'
                                    ].map((item, i) => (
                                        <div key={i} className="al-pricing-item">
                                            <CheckCircle2 size={16} /> {item}
                                        </div>
                                    ))}
                                </div>
                                <div id="wompi-container-virtual">
                                    <button
                                        className="al-btn-buy"
                                        onClick={() => handleEnrollDirect('virtual')}
                                        disabled={paymentLoading && selectedPlan === 'virtual'}
                                        style={{ backgroundColor: '#ddbe3d', color: '#002d44', fontWeight: '900', border: 'none' }}
                                    >
                                        {paymentLoading && selectedPlan === 'virtual' ? 'Iniciando...' : 'Inscribirme Virtual'} <Lock size={24} />
                                    </button>
                                </div>

                                <p className="al-footer-desc" style={{ color: 'rgba(255,255,255,0.3)', marginTop: '0' }}>
                                    Acceso instantáneo • Pago seguro vía Wompi
                                </p>
                            </div>
                        </div>

                        {/* Tarjeta Presencial */}
                        <div className={`al-pricing-card ${selectedPlan === 'presencial' ? 'card-featured' : ''}`}>
                            <div className="al-pricing-glow"></div>
                            <div className="al-pricing-header" style={{ background: '#002d44' }}>
                                <h3 style={{ color: '#ddbe3d' }}>Programa Presencial</h3>
                            </div>

                            <div className="al-pricing-content">
                                <div className="al-price-box">
                                    <div className="al-current-price">
                                        <span className="al-price-number">$570.000</span>
                                        <span className="al-currency">COP</span>
                                    </div>
                                    <div style={{ color: '#ddbe3d', fontWeight: '700', textAlign: 'center', marginTop: '10px' }}>
                                        11 de abril
                                    </div>
                                </div>

                                <div className="al-pricing-grid">
                                    {[
                                        'Jornada Intensiva (8 horas)',
                                        'Material físico de trabajo',
                                        'Refrigerios incluidos',
                                        'Comunidad presencial',
                                        'Networking con asistentes',
                                        'Certificado de finalización'
                                    ].map((item, i) => (
                                        <div key={i} className="al-pricing-item">
                                            <CheckCircle2 size={16} /> {item}
                                        </div>
                                    ))}
                                </div>

                                <div id="wompi-container-presencial">
                                    <button
                                        className="al-btn-buy"
                                        onClick={() => handleEnrollDirect('presencial')}
                                        disabled={paymentLoading && selectedPlan === 'presencial'}
                                        style={{ backgroundColor: '#ddbe3d', color: '#002d44', fontWeight: '900', border: 'none' }}
                                    >
                                        {paymentLoading && selectedPlan === 'presencial' ? 'Iniciando...' : 'Inscribirme Presencial'} <Lock size={24} />
                                    </button>
                                </div>

                                <p className="al-footer-desc" style={{ color: 'rgba(255,200,200,0.8)', marginTop: '0', fontWeight: 'bold' }}>
                                    * NO INCLUYE COSTOS DE DESPLAZAMIENTO *
                                </p>
                                <p className="al-footer-desc" style={{ color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>
                                    Cupos limitados • Pago seguro vía Wompi
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
            {/* Mobile FAB */}
            <div className="al-mobile-fab">
                <a href="#precios" className="al-btn-fab" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                    Asegurar mi cupo
                </a>
            </div>
        </div>
    );
};

export default GenuinosLanding;
