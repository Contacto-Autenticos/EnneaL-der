import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Star, Shield, Target, BookOpen, Users, ArrowRight, CheckCircle2, Play, ArrowLeft, Lock, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';
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
        <div style={{ position: 'relative', width: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <video 
                ref={videoRef}
                src={src}
                autoPlay 
                muted 
                playsInline
                onEnded={handleVideoEnd}
                style={{ width: '100%', display: 'block' }}
            />
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

const ImageCarousel = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    useEffect(() => {
        const interval = setInterval(next, 3000);
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div style={{ position: 'relative', width: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img 
                src={images[currentIndex]} 
                alt={`Slide ${currentIndex}`} 
                style={{ 
                    width: '100%', 
                    height: 'auto', 
                    display: 'block', 
                    aspectRatio: '16/10',
                    objectFit: 'cover'
                }} 
            />
            <button 
                onClick={prev}
                style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(10,22,30,0.7)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.3s' }}
            >
                <ChevronLeft size={24} />
            </button>
            <button 
                onClick={next}
                style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(10,22,30,0.7)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, transition: 'all 0.3s' }}
            >
                <ChevronRight size={24} />
            </button>
            <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {images.map((_, i) => (
                    <div 
                        key={i} 
                        style={{ 
                            width: i === currentIndex ? '24px' : '8px', 
                            height: '8px', 
                            borderRadius: '4px', 
                            background: i === currentIndex ? '#ddbe3d' : 'rgba(255,255,255,0.4)', 
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }} 
                    />
                ))}
            </div>
        </div>
    );
};

const TestimonialCarousel = ({ testimonials }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    useEffect(() => {
        const interval = setInterval(next, 10000); // More time to read
        return () => clearInterval(interval);
    }, [testimonials.length]);

    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '380px' }}>
            <div key={currentIndex} className="al-animate" style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '32px',
                padding: '45px 40px',
                position: 'relative',
                boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                <div style={{ color: '#ddbe3d', fontSize: '4rem', position: 'absolute', top: '15px', left: '25px', opacity: 0.2, lineHeight: '1', fontFamily: 'serif' }}>❝</div>
                <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.95)', lineHeight: '1.8', marginBottom: '35px', position: 'relative', zIndex: 1, fontStyle: 'italic' }}>
                    {testimonials[currentIndex].text}
                </p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h5 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '4px', fontWeight: '800' }}>{testimonials[currentIndex].name}</h5>
                        <p style={{ color: '#ddbe3d', fontSize: '0.85rem', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{testimonials[currentIndex].title}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={prev} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={18} /></button>
                        <button onClick={next} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '25px' }}>
                {testimonials.map((_, i) => (
                    <div key={i} style={{ width: i === currentIndex ? '20px' : '6px', height: '6px', borderRadius: '3px', background: i === currentIndex ? '#ddbe3d' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s' }} />
                ))}
            </div>
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
    const [openFaq, setOpenFaq] = useState(null);

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
            {/* NEW: Experience Section - Simplified with Image */}
            <section className="course-experience al-animate">
                <div className="al-section-content">
                    <div style={{ textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
                        <img 
                            src="/Genuinos-programa-autenticos.png?v=2" 
                            alt="Genuinos Programa Auténticos" 
                            style={{ 
                                width: '100%', 
                                maxWidth: '800px', 
                                height: 'auto', 
                                borderRadius: '24px',
                                marginBottom: '50px',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 20px rgba(221, 190, 61, 0.1)',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }} 
                        />
                        
                        <div style={{ padding: '0 20px' }}>
                            <p style={{ fontSize: '1.6rem', color: '#fff', lineHeight: '1.5', marginBottom: '30px', fontWeight: '500' }}>
                                Un proceso diseñado para ayudarte a comprender tu estructura interior y desarrollar una forma más consciente de liderar tu vida y tu trabajo.
                            </p>
                            
                            <p style={{ fontSize: '1.8rem', color: '#ddbe3d', fontWeight: '800', marginBottom: '30px' }}>
                                No es teoría.
                            </p>
                            
                            <p style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto' }}>
                                Este sistema práctico para transformar cómo piensas, decides y actúas. Combina tres elementos fundamentales.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Program Elements Section */}
            <section className="course-program-elements al-animate" style={{ padding: '100px 0', background: 'rgba(10, 22, 30, 0.5)' }}>
                <div className="al-section-content" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
                    <h3 style={{ 
                        fontSize: 'clamp(20px, 4vw, 24px)', 
                        color: '#fff', 
                        textAlign: 'left', 
                        marginBottom: '80px', 
                        fontWeight: '700',
                        paddingLeft: '20px',
                        borderLeft: '4px solid #ddbe3d',
                        lineHeight: '1.4'
                    }}>
                        Este programa combina tres elementos fundamentales.
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '120px' }}>
                        {/* 1. Diagnóstico */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'center', gap: '60px' }}>
                            <div>
                                <h4 style={{ color: '#ddbe3d', fontSize: '1.8rem', marginBottom: '25px', fontWeight: '800', lineHeight: '1.2' }}>
                                    1. Diagnóstico profundo de personalidad
                                </h4>
                                <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.95)', lineHeight: '1.6', marginBottom: '25px' }}>
                                    Comenzarás realizando un test estructural basado en el Eneagrama que te permitirá identificar:
                                </p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {[
                                        'tu tipo de personalidad dominante',
                                        'tu centro de inteligencia predominante',
                                        'tus motivaciones profundas',
                                        'tus reacciones automáticas bajo presión',
                                        'tu estilo natural de liderazgo'
                                    ].map((item, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem' }}>
                                            <div style={{ width: '8px', height: '8px', background: '#ddbe3d', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p style={{ fontSize: '1.1rem', color: '#fff', fontWeight: '600', fontStyle: 'italic', background: 'rgba(221, 190, 61, 0.1)', padding: '15px 20px', borderRadius: '12px', borderLeft: '3px solid #ddbe3d' }}>
                                    Este diagnóstico te permitirá ver con mayor claridad el mapa desde el cual estás operando hoy.
                                </p>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <img 
                                    src="/Portada-Analisis Avanzado-3.png?v=2" 
                                    alt="Diagnóstico profundo" 
                                    style={{ width: '100%', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} 
                                />
                            </div>
                        </div>

                        {/* 2. Curso */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'center', gap: '60px' }}>
                            <div className="program-media-order-mobile" style={{ order: 1 }}>
                                <ImageCarousel images={['/genuinos-virtual-1.png', '/genuinos-presencial-1.JPG', '/genuinos-presencial-2.JPG', '/genuinos-presencial-3.JPG']} />
                            </div>
                            <div style={{ order: 2 }}>
                                <h4 style={{ color: '#ddbe3d', fontSize: '1.8rem', marginBottom: '25px', fontWeight: '800', lineHeight: '1.2' }}>
                                    2. Curso online o presencial de comprensión estructural
                                </h4>
                                <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.95)', lineHeight: '1.6', marginBottom: '25px' }}>
                                    En el curso aprenderás de forma clara y práctica:
                                </p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {[
                                        'cómo se forman los patrones de personalidad',
                                        'las nueve estrategias principales del Eneagrama',
                                        'cómo reaccionan las personas bajo presión',
                                        'cómo influyen estas estructuras en el liderazgo',
                                        'cómo interpretar tus propias motivaciones y emociones'
                                    ].map((item, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem' }}>
                                            <div style={{ width: '8px', height: '8px', background: '#ddbe3d', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p style={{ fontSize: '1.1rem', color: '#fff', fontWeight: '600', fontStyle: 'italic', background: 'rgba(221, 190, 61, 0.1)', padding: '15px 20px', borderRadius: '12px', borderLeft: '3px solid #ddbe3d' }}>
                                    Este conocimiento te permitirá comprender el mapa completo.
                                </p>
                            </div>
                        </div>

                        {/* 3. Plan de Acción */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'center', gap: '60px' }}>
                            <div>
                                <h4 style={{ color: '#ddbe3d', fontSize: '1.8rem', marginBottom: '25px', fontWeight: '800', lineHeight: '1.2' }}>
                                    3. Plan de acción personal
                                </h4>
                                <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.95)', lineHeight: '1.6', marginBottom: '25px' }}>
                                    Además del curso recibirás un plan de trabajo diseñado para aplicar lo aprendido en tu vida real.
                                </p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 35px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {[
                                        'ejercicios de autoobservación',
                                        'gestión de emociones dominantes',
                                        'activación de tu centro menos desarrollado',
                                        'recomendaciones para tomar decisiones más conscientes'
                                    ].map((item, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem' }}>
                                            <div style={{ width: '8px', height: '8px', background: '#ddbe3d', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div style={{ 
                                    background: 'linear-gradient(90deg, rgba(221, 190, 61, 0.1) 0%, rgba(221, 190, 61, 0.02) 100%)', 
                                    padding: '25px', 
                                    borderRadius: '16px',
                                    border: '1px solid rgba(221, 190, 61, 0.2)'
                                }}>
                                    <p style={{ fontSize: '1.3rem', color: '#fff', fontWeight: '700', lineHeight: '1.4', margin: 0 }}>
                                        La idea no es solo comprender tu personalidad. <br/>
                                        <span style={{ color: '#ddbe3d', fontSize: '1.5rem', fontWeight: '900' }}>Es empezar a transformarla.</span>
                                    </p>
                                </div>
                            </div>
                            <div>
                                <img 
                                    src="/Portada - Plan de Acción-1.jpg" 
                                    alt="Plan de acción personal" 
                                    style={{ width: '100%', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Workshop Modalities Section */}
            <section className="course-modalities al-animate">
                <div className="al-section-content">
                    <div className="modalities-header">
                        <h2 className="al-hero-title" style={{ fontSize: 'clamp(32px, 6vw, 48px)' }}>
                            <span className="al-hero-title-top">Este taller es especialmente</span>
                            <span className="al-gold-text">valioso para ti, sí:</span>
                        </h2>

                        <div className="target-audience-grid">
                            {[
                                'Emprendedor',
                                'Empresario',
                                'Líder de equipo',
                                'Profesional con potencial de liderazgo',
                                'Consultor, Mentor o Coach interesado en profundizar en el comportamiento humano.',
                                'Te interesa el desarrollo personal, más allá de ideas superficiales.'
                            ].map((item, i) => (
                                <div key={i} className="target-item">
                                    <div className="target-dot"></div>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '500', lineHeight: '1.4' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '100px', marginTop: '100px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '100px', alignItems: 'start' }}>
                        {/* Left Column */}
                        <div style={{ paddingRight: '20px' }}>
                            <h3 style={{ color: '#ddbe3d', fontSize: '2.2rem', fontWeight: '900', marginBottom: '35px', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                                RESULTADOS QUE PUEDES ESPERAR
                            </h3>
                            <p style={{ fontSize: '1.15rem', marginBottom: '30px', color: '#fff', fontWeight: '500' }}>
                                Las personas que realizan este proceso suelen experimentar:
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 60px 0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                {[
                                    'mayor claridad sobre su forma de pensar y reaccionar',
                                    'comprensión de patrones repetitivos en su vida',
                                    'mejoras en comunicación y relaciones',
                                    'decisiones más conscientes',
                                    'mayor coherencia entre lo que piensan, sienten y hacen'
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', gap: '14px', color: 'rgba(255,255,255,0.9)', fontSize: '1.05rem', alignItems: 'center' }}>
                                        <CheckCircle2 size={22} style={{ color: '#ddbe3d', flexShrink: 0 }} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right Column */}
                        <div style={{ position: 'sticky', top: '120px' }}>
                            <TestimonialCarousel testimonials={[
                                {
                                    name: "Pilar Martínez",
                                    title: "Coach Transformacional | Facilitadora de Consciencias | Directora de Mandrágora Life",
                                    text: "Alegría, sabiduría, entusiasmo, acción, pasión, conocimiento, energía, líder, compromiso social... son solo unas pocas palabras entre muchas que siento y pienso con Felipe. Gran emprendedor, sabio y líder. Auténticos fue una experiencia para mirar hacia dentro, conocerse y quererse más. Como terapeuta me abre una ventana para saber cómo conectar con cada paciente con el fin de potenciar su ser. Gracias Felipe por tu luz, entrega y pasión. Nos inspiramos cada día con hermosos y valiosos seres como tu."
                                },
                                {
                                    name: "Felipe Andrés Varela Chavéz",
                                    title: "Músico / Empresario y CEO de Bluetidemusic-Musician Agent",
                                    text: "A través de Auténticos con Felipe pude entender tantas, pero tantas cosas acerca de mi personalidad que no podría nombrarlas todas. Es un espacio muy poderoso para mejorar las relaciones personales a todo nivel, por lo que te va a hacer tu vida familiar, personal y laboral mucho más llevadera. Gracias Felipe Beltrán por compartir todo tu conocimiento de una manera clara y divertida."
                                },
                                {
                                    name: "Isabela Echeverry Penon",
                                    title: "Directora de Emprendimiento e Innovación de la Cámara de Comercio de Cali",
                                    text: "El equipo de Auténticos tiene una genuina pasión e interés por ayudar a otros. Personalmente su MLT, me sirvió (y al equipo) para aprender a comunicarnos mejor y moderar nuestro fuego interior. Además es el líder metodológico y facilitador de más de 10 talleres con 200 emprendedores de la CCC en el marco de #ValientesCCC. Su carisma y conocimiento hacen que cada sesión sea no solo productiva sino inolvidable."
                                },
                                {
                                    name: "Josué Cobaleda",
                                    title: "Profesional de escalamiento e innovación en Innpulsa Colombia",
                                    text: "Felipe y su equipo de Auténticos a través de la mentoría me ayudaron a acercarme a mi mejor versión. Comencé a leer hasta 4 veces más que lo que leía antes, me ejercitaba el doble de lo que antes lo hacía, cambié varios modelos mentales y mi energía tuvo una subida importante. Incluso mi relación con Dios comenzó a fortalecerse al formar hábitos diarios que me ayudaron a seguir construyendo la vida que quiero. La base de conocimiento y la practicidad de sus consejos hacen tener resultados desde el primer día. Sin duda se puede confiar en este equipo, Lo recomiendo."
                                },
                                {
                                    name: "Carlos Andrés Duque",
                                    title: "Consultor Junior en proyectos de consultoría Financiera",
                                    text: "Para mi los talleres de Auténticos, han significado un cambio fuertes para mi vida, he podido a través del eneagrama abrazar el autoconocimiento , darme cuenta de la estructura de mi personalidad y cómo me manejaba ante actitudes inconscientes o automáticas que debía traer a la luz y sanar. Me comencé a reconocer con todo mi potencial, cómo un diamante en bruto que decidí forjar y pulir."
                                }
                            ]} />
                        </div>
                    </div>

                    {/* Centered Value Proposition Block */}
                    <div style={{ 
                        maxWidth: '850px', 
                        margin: '100px auto 0', 
                        textAlign: 'center',
                        padding: '60px 40px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '32px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                         <h3 style={{ color: '#ddbe3d', fontSize: '2.2rem', fontWeight: '900', marginBottom: '35px', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                            DIFERENCIA DE ESTE PROCESO
                        </h3>
                        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.9)', marginBottom: '40px' }}>
                            Muchos cursos de Eneagrama se enfocan en describir tipos de personalidad. <strong style={{color: '#fff'}}>GENUINOS</strong> se enfoca en algo distinto. No se trata solo de saber qué tipo eres, se trata de comprender:
                        </p>
                        
                        <div style={{ display: 'inline-block', textAlign: 'left', marginBottom: '50px' }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {[
                                    'la estructura desde la cual interpretas el mundo',
                                    'la emoción que guía tus reacciones',
                                    'el patrón que aparece bajo presión',
                                    'las posibilidades de desarrollo que tienes por delante'
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem' }}>
                                        <div style={{ width: '12px', height: '2px', background: '#ddbe3d', borderRadius: '2px' }}></div>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div style={{  
                            borderTop: '4px solid #ddbe3d', 
                            paddingTop: '30px', 
                            background: 'rgba(221, 190, 61, 0.03)',
                            borderRadius: '16px',
                            padding: '30px'
                        }}>
                                <p style={{ fontSize: '1.3rem', color: '#fff', fontWeight: '700', margin: 0 }}>
                                    Por eso este programa no es solo información. <br/>
                                    <span style={{ color: '#ddbe3d', fontSize: '1.5rem', marginTop: '10px', display: 'block' }}>Es un proceso de autoconocimiento aplicado a la vida real y al liderazgo.</span>
                                </p>
                            </div>

                            <div style={{ marginTop: '70px' }}>
                                <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.95)', marginBottom: '35px', fontWeight: '500', maxWidth: '600px', margin: '0 auto 40px' }}>
                                    Empieza hoy a comprender el mapa desde el cual tomas decisiones y lideras.
                                </p>
                                <a href="#precios" className="al-btn-primary" style={{ 
                                    display: 'inline-block',
                                    backgroundColor: '#ddbe3d', 
                                    color: '#002d44', 
                                    fontWeight: '900', 
                                    padding: '22px 45px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    fontSize: '1.1rem',
                                    letterSpacing: '0.05em',
                                    boxShadow: '0 15px 30px rgba(221, 190, 61, 0.2)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    COMENZAR MI PROCESO GENUINOS
                                </a>
                            </div>
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

            {/* NEW: FAQ Section (Accordion Style) */}
            <section className="course-faq al-section al-animate" style={{ background: 'linear-gradient(to bottom, var(--al-blue-light) 0%, var(--al-blue-dark) 100%)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '140px' }}>
                <div className="al-section-content">
                    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                            <h2 style={{ fontSize: 'clamp(42px, 8vw, 68px)', fontWeight: '900', color: '#fff', margin: 0, lineHeight: '0.9', letterSpacing: '-0.03em', textTransform: 'none' }}>
                                Preguntas
                            </h2>
                            <h2 style={{ fontSize: 'clamp(42px, 8vw, 68px)', fontWeight: '900', color: '#ddbe3d', margin: 0, lineHeight: '0.9', letterSpacing: '-0.03em', textTransform: 'none' }}>
                                frecuentes
                            </h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {[
                                {
                                    q: "¿Necesito conocimientos previos sobre Eneagrama?",
                                    a: "No. El programa está diseñado para que cualquier persona pueda comprender el sistema desde cero."
                                },
                                {
                                    q: "¿Cuánto tiempo toma completar el curso?",
                                    a: "El curso puede completarse en aproximadamente 90 minutos, aunque muchas personas prefieren revisarlo con calma y aplicar los ejercicios."
                                },
                                {
                                    q: "¿Este programa es solo teoría?",
                                    a: "No. El proceso incluye ejercicios prácticos y un plan de acción personal para aplicar lo aprendido."
                                }
                            ].map((item, i) => (
                                <div key={i} style={{ 
                                    background: 'rgba(255, 255, 255, 0.03)', 
                                    border: '1px solid rgba(255, 255, 255, 0.08)', 
                                    borderRadius: '24px', 
                                    overflow: 'hidden',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}>
                                    <button 
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        style={{ 
                                            width: '100%', 
                                            padding: '30px 40px', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            background: 'none', 
                                            border: 'none', 
                                            cursor: 'pointer',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.01em' }}>{item.q}</span>
                                        <span style={{ color: '#ddbe3d', fontSize: '1.8rem', fontWeight: '300', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.4s ease' }}>
                                            +
                                        </span>
                                    </button>
                                    
                                    <div style={{ 
                                        padding: openFaq === i ? '0 40px 40px 40px' : '0 40px',
                                        maxHeight: openFaq === i ? '500px' : '0',
                                        opacity: openFaq === i ? 1 : 0,
                                        overflow: 'hidden',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}>
                                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.15rem', lineHeight: '1.7', margin: 0 }}>
                                            {item.a}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '120px', textAlign: 'center' }}>
                            <p style={{ fontSize: '1.55rem', color: '#fff', fontWeight: '600', marginBottom: '15px', lineHeight: '1.4', maxWidth: '700px', margin: '0 auto 20px' }}>
                                Comprender cómo funcionas por dentro puede cambiar la forma en que lideras tu vida y tu trabajo.
                            </p>
                            <p style={{ fontSize: '1.8rem', color: '#ddbe3d', fontWeight: '900', marginBottom: '50px' }}>
                                Empieza hoy.
                            </p>
                            
                            <a href="#precios" className="al-btn-primary" style={{ 
                                display: 'inline-block',
                                backgroundColor: '#ddbe3d', 
                                color: '#002d44', 
                                fontWeight: '900', 
                                padding: '24px 55px',
                                borderRadius: '16px',
                                textDecoration: 'none',
                                fontSize: '1.25rem',
                                letterSpacing: '0.05em',
                                boxShadow: '0 20px 40px rgba(221, 190, 61, 0.25)',
                                transition: 'all 0.3s ease',
                                textTransform: 'uppercase'
                            }}>
                                QUIERO DESCUBRIR MI MAPA PERSONAL
                            </a>
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
