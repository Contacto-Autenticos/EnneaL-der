import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Star, Shield, Target, BookOpen, Users, ArrowRight, CheckCircle2, Check, Play, ArrowLeft, Lock, Rocket, ChevronLeft, ChevronRight, ClipboardList, UserSearch, RefreshCw, Instagram, Linkedin, Globe } from 'lucide-react';
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
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1.066', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <video 
                ref={videoRef}
                src={src}
                autoPlay 
                muted 
                playsInline
                onEnded={handleVideoEnd}
                style={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    height: 'auto',
                    display: 'block' 
                }}
            />
            {showFlash && (
                <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0
                    , 
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
        <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ display: 'grid', width: '100%' }}>
                {testimonials.map((testimonial, i) => (
                    <div 
                        key={i} 
                        style={{ 
                            gridArea: '1 / 1',
                            opacity: currentIndex === i ? 1 : 0,
                            pointerEvents: currentIndex === i ? 'auto' : 'none',
                            visibility: currentIndex === i ? 'visible' : 'hidden',
                            transition: 'opacity 0.5s ease',
                            background: 'rgba(255, 255, 255, 0.03)', 
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '32px',
                            padding: 'clamp(30px, 6vw, 45px) clamp(20px, 5vw, 40px)',
                            position: 'relative',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            boxSizing: 'border-box'
                        }}
                    >
                        <div style={{ color: '#ddbe3d', fontSize: '2.5rem', position: 'absolute', top: '10px', left: '10px', opacity: 0.1, lineHeight: '1', fontFamily: 'serif', pointerEvents: 'none' }}>❝</div>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.95)', lineHeight: '1.8', marginBottom: '35px', position: 'relative', zIndex: 1, fontStyle: 'italic' }}>
                            {testimonial.text}
                        </p>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: 'auto', textAlign: 'center' }}>
                            <div style={{ width: '100%' }}>
                                <h5 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '4px', fontWeight: '800' }}>{testimonial.name}</h5>
                                <p style={{ color: '#ddbe3d', fontSize: '0.85rem', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{testimonial.title}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                <button onClick={prev} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}><ChevronLeft size={20} /></button>
                                <button onClick={next} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}><ChevronRight size={20} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '25px' }}>
                {testimonials.map((_, i) => (
                    <button 
                        key={i} 
                        onClick={() => setCurrentIndex(i)}
                        style={{ 
                            width: i === currentIndex ? '20px' : '6px', 
                            height: '6px', 
                            borderRadius: '3px', 
                            background: i === currentIndex ? '#ddbe3d' : 'rgba(255,255,255,0.2)', 
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            transition: 'all 0.3s' 
                        }} 
                    />
                ))}
            </div>
        </div>
    );
};

// MercadoPago - precios en COP (no centavos)
const MP_PRICES = { virtual: 365000, presencial: 870000 };

const GenuinosLanding = () => {
    const navigate = useNavigate();
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null); // 'virtual' or 'presencial'
    const [paymentError, setPaymentError] = useState(null);
    const [isTimelineVisible, setIsTimelineVisible] = useState(false);
    const timelineRef = useRef(null);

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
    const [activeInstructor, setActiveInstructor] = useState(0);
    const [showMobileFab, setShowMobileFab] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const [prevPurchaseDiscount, setPrevPurchaseDiscount] = useState(0);
    const [checkingDiscount, setCheckingDiscount] = useState(false);
    const lastScrollY = useRef(0);
    const instructorsCount = 2;

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveInstructor((prev) => (prev + 1) % instructorsCount);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setShowPriceModal(true);
    };

    const handleEnrollDirect = (plan) => {
        setSelectedPlan(plan);
        setPrevPurchaseDiscount(0); // Reset discount
        setShowRegisterForm(true);
    };

    const checkPreviousPurchases = async (email) => {
        if (!email || !email.includes('@')) return;
        
        setCheckingDiscount(true);
        try {
            // Buscamos todas las transacciones aprobadas para este usuario
            const { data, error } = await supabase
                .from('transactions')
                .select('amount_in_cents, reference')
                .eq('customer_email', email.trim().toLowerCase())
                .in('status', ['APPROVED', 'approved']);

            if (error) throw error;

            if (data && data.length > 0) {
                // Filtrar por referencias que empiecen con 'ref-' (Análisis Avanzado / Plan de Acción)
                // y que NO sean de este mismo programa (que empiezan con 'gen-')
                const qualifyingTransactions = data.filter(t => 
                    t.reference && t.reference.toLowerCase().startsWith('ref-')
                );

                if (qualifyingTransactions.length > 0) {
                    // Sumamos los montos de todas las compras previas calificadas
                    const totalCents = qualifyingTransactions.reduce((sum, t) => sum + (t.amount_in_cents || 0), 0);
                    const discount = totalCents / 100;
                    
                    setPrevPurchaseDiscount(discount);
                    console.log('Descuento acumulado encontrado:', discount);
                } else {
                    setPrevPurchaseDiscount(0);
                }
            } else {
                setPrevPurchaseDiscount(0);
            }
        } catch (err) {
            console.error('Error checking purchases:', err);
        } finally {
            setCheckingDiscount(false);
        }
    };


    const handleRegistration = async (e) => {
        e.preventDefault();
        setRegLoading(true);
        setPaymentError(null);
        try {
            // 1. Save Lead to Supabase
            const { error: leadError } = await supabase
                .from('user_leads')
                .insert([{
                    full_name: regData.full_name,
                    email: regData.email.trim().toLowerCase(),
                    phone: regData.phone,
                    source: `genuinos_${selectedPlan}`,
                    created_at: new Date().toISOString()
                }]);

            if (leadError) console.error('Error saving lead:', leadError);

            // 2. Proceed to Payment
            const opened = await initiatePayment(selectedPlan, regData.email, regData.full_name);
            
            // If opened in new tab successfully, we can close the form
            if (opened) {
                setShowRegisterForm(false);
            }
        } catch (err) {
            console.error('Registration error:', err);
            setPaymentError('Hubo un error al procesar el pago. Por favor intenta de nuevo.');
        } finally {
            setRegLoading(false);
        }
    };

    const initiatePayment = async (plan, customerEmail, customerName) => {
        setPaymentLoading(true);
        setPaymentError(null);
        try {
            // Aplicar descuento si existe
            const baseAmount = MP_PRICES[plan];
            const amount = baseAmount - prevPurchaseDiscount;
            const reference = `gen-${plan}${prevPurchaseDiscount > 0 ? '-disc' : ''}-${Date.now()}`;

            // Guardar datos del comprador para la página de retorno
            localStorage.setItem('genuinos_email', customerEmail);
            localStorage.setItem('genuinos_name', customerName || 'Participante');
            localStorage.setItem('genuinos_discount', prevPurchaseDiscount.toString());

            const { data, error } = await supabase.functions.invoke('create-mp-preference', {
                body: {
                    plan,
                    amount,
                    reference,
                    back_url_base: window.location.origin,
                }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            // Intentar abrir en nueva pestaña
            if (data?.init_point) {
                const newWindow = window.open(data.init_point, '_blank');
                
                // Si el bloqueador de popups impidió abrirlo, redirigir en la misma pestaña
                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    window.location.href = data.init_point;
                    return false; // Indicamos que no se abrió en nueva pestaña (se redirigió)
                }
                
                setPaymentLoading(false);
                return true; // Éxito abriendo nueva pestaña
            } else {
                throw new Error('No se recibió el link de pago de MercadoPago');
            }
        } catch (err) {
            console.error('Error iniciando pago MP:', err);
            setPaymentError(`Error al iniciar el pago: ${err.message || 'Intenta de nuevo'}`);
            setPaymentLoading(false);
            throw err;
        }
    };

    const handlePayment = async (plan) => {
        // Redundant with handlePlanSelect but kept for compatibility or updated to use select
        handleSelectPlan(plan);
    };

    // MercadoPago: no se necesita useEffect para widget - el pago es por redirección

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsTimelineVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (timelineRef.current) {
            observer.observe(timelineRef.current);
        }

        return () => {
            if (timelineRef.current) {
                observer.unobserve(timelineRef.current);
            }
        };
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        // Apply body classes for styling if needed, similar to AdvancedLanding
        document.body.style.backgroundColor = '#002d44';
        document.body.style.color = '#ffffff';

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Header Visibility Logic (Headroom)
            if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
                setShowHeader(false); // Scrolling down
            } else {
                setShowHeader(true); // Scrolling up or at top
            }
            lastScrollY.current = currentScrollY;

            // Mobile FAB Logic
            if (currentScrollY > 400) {
                setShowMobileFab(true);
            } else {
                setShowMobileFab(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="course-landing-container">
            <div className="al-bg-glow"></div>

            {/* Navigation */}
            <nav className={`al-nav scrolled ${!showHeader ? 'nav-hidden' : ''}`}>
                <div className="al-nav-content">
                    <div className="al-logo-wrapper">
                        <img src="/Logo-Blanco.png" alt="Auténticos Logo" className="al-logo" />
                    </div>
                    <div className="al-nav-links" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <a href="https://www.linkedin.com/company/autenticos" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                            <Linkedin size={20} />
                        </a>
                        <a href="https://www.instagram.com/autenticos.co" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                            <Instagram size={20} />
                        </a>
                        <a href="https://www.autenticos.co" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.3s' }} onMouseEnter={(e) => e.target.style.color = '#ddbe3d'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                            <Globe size={20} />
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero / Intro Section */}
            <section className="al-hero al-animate">
                <h1 className="al-impact-header" style={{ color: '#fff', marginBottom: '30px', lineHeight: '1.1' }}>
                    Transforma la forma en que <br />
                    piensas, decides y <br />
                    lideras tu vida
                </h1>
                <p className="al-gold-text" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: '700', lineHeight: '1.4', maxWidth: '900px', margin: '0 auto 40px auto' }}>
                    Identifica la estructura desde la que tomas decisiones, reaccionas bajo presión y lideras a otros usando el Eneagrama aplicado al mundo real.
                </p>

                <p style={{ color: '#fff', fontSize: 'clamp(1.15rem, 4vw, 1.25rem)', marginBottom: '40px', maxWidth: '1000px', margin: '0 auto 40px auto' }}>
                    No es teoría, es un proceso práctico de transformación personal y liderazgo consciente.
                </p>

                <div className="al-hero-actions">
                    <a href="#precios" className="al-btn-primary al-btn-glow" style={{ padding: '18px 35px', borderRadius: '100px', fontSize: '18px', fontWeight: '900', textDecoration: 'none', background: '#ddbe3d', color: '#002d44', whiteSpace: 'nowrap' }}>
                        QUIERO INICIAR MI PROCESO
                    </a>
                    <a href="#programa-genuinos" className="al-btn-primary al-btn-glow" style={{ padding: '18px 35px', borderRadius: '100px', fontSize: '18px', fontWeight: '900', textDecoration: 'none', background: '#ddbe3d', color: '#002d44', whiteSpace: 'nowrap' }}>
                        VER CÓMO FUNCIONA
                    </a>
                </div>

            </section>

            {/* NEW: Introspection Section - Leadership Focus */}
            <section className="course-introspection al-section al-animate">
                <div className="al-section-content">
                    <div className="introspection-no-box" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h2 id="al-introspection-main-title" className="introspection-closing" style={{ marginBottom: '50px', textAlign: 'center', fontWeight: '900', lineHeight: '1.1', color: '#fff' }}>
                            No estás bloqueado… <br/>
                            <span style={{ color: '#ddbe3d' }}>estás repitiendo patrones que no ves</span>
                        </h2>
                        
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', marginBottom: '10px' }}>
                                Probablemente eres una persona capaz, inteligente y con potencial.
                            </p>
                            <p style={{ fontSize: '1.4rem', color: '#ddbe3d', fontWeight: '800' }}>
                                Aún así…
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                            <div style={{ 
                                background: 'rgba(255, 255, 255, 0.03)', 
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '32px',
                                padding: 'clamp(30px, 5vw, 50px)',
                                maxWidth: '700px',
                                width: '100%',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                                borderTop: '4px solid #ddbe3d'
                            }}>
                                <ul style={{ 
                                    listStyle: 'none', 
                                    padding: '0', 
                                    margin: '0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '24px'
                                }}>
                                    {[
                                        "Tomas decisiones de manera reactiva",
                                        "Te exiges mucho, pero no avanzas como quisieras",
                                        "Repites comportamientos que ya sabes que no te funcionan",
                                        "Sientes que podrías dar más… pero algo te frena"
                                    ].map((item, idx) => (
                                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                                            <div style={{ width: '10px', height: '10px', background: '#ddbe3d', borderRadius: '50%', marginTop: '8px', flexShrink: 0, boxShadow: '0 0 10px rgba(221, 190, 61, 0.5)' }}></div>
                                            <span style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '500', lineHeight: '1.4' }}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', padding: '0' }}>
                            <p className="introspection-closing" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', marginBottom: '30px', color: '#fff', fontWeight: '700' }}>
                                No es falta de capacidad.
                            </p>
                            
                            <p className="introspection-closing" style={{ fontSize: 'clamp(1.6rem, 6vw, 2.4rem)', fontWeight: '800', color: '#ddbe3d', marginBottom: '30px', lineHeight: '1.1' }}>
                                Es falta de claridad sobre cómo funcionas por dentro.
                            </p>
                            
                            <div style={{ marginTop: '0' }}>
                                <a href="#precios" className="al-btn-primary al-btn-glow closing-cta" style={{ marginTop: '40px', display: 'inline-block' }}>
                                    COMENZAR MI TRANSFORMACIÓN
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Map Section - Two Columns */}
            <section className="course-map al-section al-animate">
                <div className="al-section-content">
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', 
                        gap: '60px',
                        alignItems: 'center',
                        marginTop: '40px'
                    }}>
                        {/* Left Column: Text */}
                        <div className="map-text-column">
                            <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', color: '#002d44', marginBottom: '25px', lineHeight: '1.2' }}>
                                El problema no es lo que haces… <br/>
                                <span style={{ color: '#ddbe3d' }}>es desde dónde lo haces</span>
                            </h2>
                            <p style={{ fontSize: '1.25rem', color: 'rgba(0, 45, 68, 0.85)', marginBottom: '35px', lineHeight: '1.6' }}>
                                La mayoría de las personas intenta cambiar sus resultados sin entender su estructura interna.
                            </p>

                            <div style={{ marginBottom: '40px' }}>
                                <p style={{ fontSize: '1.3rem', color: '#002d44', marginBottom: '20px', fontWeight: '600' }}>Pero mientras no comprendas:</p>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {[
                                        'cómo tomas decisiones',
                                        'qué te mueve realmente',
                                        'qué te limita sin darte cuenta'
                                    ].map((item, i) => (
                                        <li key={i} style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '12px', 
                                            fontSize: '1.2rem', 
                                            color: 'rgba(0, 45, 68, 0.8)',
                                            marginBottom: '12px'
                                        }}>
                                            <div style={{ width: '6px', height: '6px', background: '#ddbe3d', borderRadius: '50%' }}></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <p style={{ fontSize: '1.2rem', color: 'rgba(0, 45, 68, 0.85)', marginTop: '20px', lineHeight: '1.6' }}>
                                    seguirás repitiendo los mismos resultados, incluso con más esfuerzo.
                                </p>
                            </div>

                            <p style={{ fontSize: '1.25rem', color: 'rgba(0, 45, 68, 0.9)', marginBottom: '20px', lineHeight: '1.6' }}>
                                El Eneagrama es uno de los sistemas más profundos que existen para comprender ese mapa.
                            </p>
                        </div>

                        {/* Right Column: Video */}
                        <div className="map-video-column mobile-img-top">
                            <VideoLoopWithFlash src="/Videos/Eneagrama-Autenticos.mp4" />
                        </div>
                    </div>
                </div>
            </section>
            {/* NEW: Experience Section - Simplified with Image */}
            <section id="programa-genuinos" className="course-experience al-section al-animate" style={{ background: '#fff', padding: '100px 0' }}>
                <div className="al-section-content">
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        flexWrap: 'wrap', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '60px',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        textAlign: 'left'
                    }}>
                        {/* Image Column */}
                        <div style={{ flex: '1', minWidth: '320px', display: 'flex', justifyContent: 'center' }}>
                            <img 
                                src="/Genuinos-programa-autenticos-3.png" 
                                alt="Genuinos Programa Auténticos" 
                                style={{ 
                                    width: '100%', 
                                    maxWidth: '432px', 
                                    height: 'auto', 
                                    borderRadius: '24px'
                                }} 
                            />
                        </div>
                        
                        {/* Text Column */}
                        <div style={{ flex: '1.2', minWidth: '320px' }}>
                            <p style={{ fontSize: '1.8rem', color: '#002d44', marginBottom: '10px', fontWeight: '400', lineHeight: '1.2' }}>
                                Por eso desde <span style={{ color: '#002d44', fontWeight: '800' }}>AUT</span><span style={{ color: '#ddbe3d', fontSize: '1.25em', fontWeight: '800' }}>é</span><span style={{ color: '#002d44', fontWeight: '800' }}>NTICOS</span> hemos creado.....
                            </p>
                            <p style={{ fontSize: '1.6rem', color: '#ddbe3d', lineHeight: '1.4', marginBottom: '20px', fontWeight: '700' }}>
                                Un programa para entenderte, desbloquearte y evolucionar
                            </p>
                            
                            <p style={{ fontSize: '1.8rem', color: '#002d44', fontWeight: '800', marginBottom: '30px', lineHeight: '1.2' }}>
                                No es teoría... No es un curso.
                            </p>
                            
                            <p style={{ fontSize: '1.25rem', color: '#444', lineHeight: '1.7', margin: '0' }}>
                                Es un proceso estructurado de autoconocimiento y transformación basado en el Eneagrama, diseñado para ayudarte a comprender tu forma de pensar, sentir y actuar… y a partir de ahí, desbloquear tu potencial.
                            </p>
                        </div>
                    </div>
                        {/* NEW: Transformation Journey Timeline */}
                        <div ref={timelineRef} className={`al-transformation-steps al-animate ${isTimelineVisible ? 'is-visible' : ''}`} style={{ textAlign: 'left', marginTop: '100px' }}>
                            <h3 id="al-transformation-title" style={{ 
                                color: '#002d44', 
                                fontSize: 'clamp(2rem, 8vw, 2.8rem)', 
                                fontWeight: '800', 
                                textAlign: 'center',
                                marginBottom: '0'
                            }}>
                                Así es como ocurre la transformación
                            </h3>

                            <div className="al-steps-timeline">
                                <div className="al-timeline-line">
                                    <div className="al-timeline-progress"></div>
                                </div>

                                {[
                                    {
                                        title: "Diagnóstico Inicial",
                                        desc: "Descubres tu tipo de personalidad con poderoso test.",
                                        icon: <ClipboardList size={32} />
                                    },
                                    {
                                        title: "Comprende cuál es tu modelo mental",
                                        desc: "Entiendes cómo piensas, decides y reaccionas.",
                                        icon: <UserSearch size={32} />
                                    },
                                    {
                                        title: "Identificación de patrones limitantes",
                                        desc: "Reconoces los comportamientos que te frenan.",
                                        icon: <Target size={32} />
                                    },
                                    {
                                        title: "Intervención práctica",
                                        desc: "Aprendes cómo cambiar esos patrones en tu vida real.",
                                        icon: <RefreshCw size={32} />
                                    },
                                    {
                                        title: "Establece un plan de acción poderoso",
                                        desc: "Llevas el conocimiento a la practica cotidiana.",
                                        icon: <CheckCircle2 size={32} />
                                    }
                                ].map((step, index) => {
                                    const isTop = index === 1 || index === 3;
                                    return (
                                        <div key={index} className="al-step-item">
                                            {/* Desktop Top Content Slot */}
                                            <div className="al-step-content al-step-content-top">
                                                {isTop && (
                                                    <>
                                                        <h4 style={{ color: '#002d44' }}>{step.title}</h4>
                                                        <p style={{ color: '#666' }}>{step.desc}</p>
                                                    </>
                                                )}
                                            </div>

                                            <div className="al-step-circle">
                                                {step.icon}
                                                <div className="al-step-number">{index + 1}</div>
                                            </div>

                                            {/* Desktop Bottom Content Slot OR Mobile Content */}
                                            <div className={`al-step-content al-step-content-bottom al-step-content-mobile ${isTop ? 'mobile-only-step-content' : ''}`}>
                                                <h4 style={{ color: '#002d44' }}>{step.title}</h4>
                                                <p style={{ color: '#666' }}>{step.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

            {/* NEW: Program Elements Section */}
            <section className="course-program-elements al-animate" style={{ padding: '90px 0', background: 'linear-gradient(to bottom, #000a12 0%, #002d44 100%)' }}>
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', alignItems: 'center', gap: '60px' }}>
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
                            <div className="mobile-img-top" style={{ position: 'relative' }}>
                                <img 
                                    src="/Portada-Analisis Avanzado-3.png?v=2" 
                                    alt="Diagnóstico profundo" 
                                    style={{ width: '100%', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} 
                                />
                            </div>
                        </div>

                        {/* 2. Curso */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', alignItems: 'center', gap: '60px' }}>
                            <div className="program-media-order-mobile" style={{ order: 1 }}>
                                <ImageCarousel images={['/genuinos-virtual-1.png', '/genuinos-virtual-2.png', '/genuinos-presencial-1.JPG', '/genuinos-presencial-2.JPG', '/genuinos-presencial-3.JPG']} />
                            </div>
                            <div style={{ order: 2 }}>
                                <h4 style={{ color: '#ddbe3d', fontSize: '1.8rem', marginBottom: '25px', fontWeight: '800', lineHeight: '1.2' }}>
                                    2. Proceso de transformación basado en eneagrama.
                                </h4>
                                <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.95)', lineHeight: '1.6', marginBottom: '25px' }}>
                                    En este proceso aprenderás de forma clara y práctica:
                                </p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {[
                                        'Como se formó tu patrón de personalidad',
                                        'Cual es tu estilo de liderazgo',
                                        'Como reaccionas bajo presión',
                                        'Como influye en tu liderazgo',
                                        'Como interpretas y actúas tus propias motivaciones....'
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', alignItems: 'center', gap: '60px' }}>
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
                            <div className="mobile-img-top">
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

            {/* NEW: Organizaciones Carousel Section */}
            <section className="al-orgs-section al-animate">
                <div className="al-orgs-header">
                    <h2 className="al-orgs-title">Organizaciones que confían en nosotros</h2>
                    <p className="al-orgs-subtitle">
                        Más de 100 organizaciones públicas, privadas y educativas han confiado en nosotros.
                    </p>
                </div>

                <div className="al-orgs-carousel-wrapper">
                    <div className="al-orgs-carousel-overlay"></div>
                    <div className="al-carousel-track-container">
                        {/* Top Row: Scrolls Left */}
                        <div className="al-carousel-track left">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, idx) => (
                                <div key={`top-${idx}`} className="al-org-logo-card">
                                    <img src={`/Organizaciones/Cliente-${num}.png`} alt={`Organización ${num}`} className="al-org-logo" loading="lazy" />
                                </div>
                            ))}
                        </div>
                        {/* Bottom Row: Scrolls Right */}
                        <div className="al-carousel-track right">
                            {[12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map((num, idx) => (
                                <div key={`bottom-${idx}`} className="al-org-logo-card">
                                    <img src={`/Organizaciones/Cliente-${num}.png`} alt={`Organización ${num}`} className="al-org-logo" loading="lazy" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="course-results al-animate">
                <div className="al-section-content">
                    <div>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', 
                                gap: '80px', 
                                alignItems: 'center' 
                            }}>
                                {/* Left Column */}
                                <div style={{ textAlign: 'left' }}>
                                    <h2 id="al-impact-outcomes-title" className="al-impact-header" style={{ 
                                        color: '#ddbe3d', 
                                        marginBottom: '40px', 
                                        fontWeight: '900',
                                        textTransform: 'uppercase'
                                    }}>
                                        Lo que empieza<br/>
                                        a cambiar<br/>
                                        en ti.
                                    </h2>
                                    <p style={{ fontSize: '1.4rem', marginBottom: '35px', color: '#fff', fontWeight: '500', maxWidth: '500px' }}>
                                        A través de este proceso:
                                    </p>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: '0', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                        {[
                                            'Tomas decisiones con mayor claridad y seguridad',
                                            'Reduces el autosabotaje',
                                            'Comprendes tus emociones y las gestionas mejor',
                                            'Mejoras tus relaciones personales y profesionales',
                                            'Lideras con más conciencia y menos reactividad',
                                            'Recuperas enfoque, energía y dirección'
                                        ].map((item, i) => (
                                            <li key={i} style={{ display: 'flex', gap: '18px', color: 'rgba(255,255,255,0.95)', fontSize: '1.3rem', alignItems: 'flex-start' }}>
                                                <div style={{ background: '#ddbe3d', padding: '4px', borderRadius: '4px', flexShrink: 0, marginTop: '4px' }}>
                                                    <CheckCircle2 size={16} color="#001a2c" strokeWidth={3} />
                                                </div>
                                                <span style={{ lineHeight: '1.3' }}>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {/* Right Column */}
                                <div style={{ 
                                    position: 'relative',
                                    paddingLeft: '20px'
                                }}>

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
                </div>
            </div>
        </section>

        {/* SECTION: Especially valuable for */}
        <section className="course-modalities al-animate" style={{ background: '#fff', color: '#002d44', padding: '100px 0' }}>
                <div className="al-section-content">
                    <div className="modalities-header">
                        <h2 className="al-hero-title" style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginBottom: '40px' }}>
                            <span className="al-hero-title-top" style={{ color: '#002d44' }}>Este proceso es especialmente</span>
                            <span className="al-gold-text" style={{ color: '#ddbe3d' }}>valioso para ti, si:</span>
                        </h2>

                        <div className="target-audience-grid">
                            {[
                                'Eres emprendedor, empresario o lideras equipos',
                                'Sientes que puedes dar más pero algo te frena',
                                'Quieres entenderte a un nivel más profundo',
                                'Estás en un momento de cambio o transición',
                                'Buscas claridad para tomar mejores decisiones',
                                'Estás cansado de repetir los mismos patrones'
                            ].map((item, i) => (
                                <div key={i} className="target-item" style={{ 
                                    background: 'rgba(0, 45, 68, 0.03)', 
                                    border: '1px solid rgba(0, 45, 68, 0.1)' 
                                }}>
                                    <div className="target-dot" style={{ background: '#ddbe3d' }}></div>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '500', lineHeight: '1.4', color: '#444' }}>{item}</span>
                                </div>
                            ))}
                        </div>

                        {/* Negative Audience Section */}
                        <div style={{ marginTop: '100px', paddingTop: '60px' }}>
                            <h2 className="al-hero-title" style={{ fontSize: 'clamp(28px, 5vw, 42px)', marginBottom: '40px', textAlign: 'center' }}>
                                <span className="al-hero-title-top" style={{ color: '#002d44' }}>Este programa</span>
                                <span style={{ color: '#ef4444', fontWeight: '800' }}>no es para ti, si:</span>
                            </h2>

                            <div className="target-audience-grid" style={{ marginTop: '20px' }}>
                                {[
                                    'Buscas respuestas rápidas sin trabajo personal',
                                    'No estás dispuesto a cuestionarte',
                                    'Prefieres seguir haciendo lo mismo esperando resultados distintos'
                                ].map((item, i) => (
                                    <div key={i} className="target-item" style={{ 
                                        borderColor: 'rgba(239, 68, 68, 0.2)', 
                                        background: 'rgba(239, 68, 68, 0.05)' 
                                    }}>
                                        <div className="target-dot" style={{ 
                                            background: '#ef4444', 
                                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)' 
                                        }}></div>
                                        <span style={{ fontSize: '1.2rem', color: '#666', fontWeight: '500' }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>


        <section className="course-modalities-extra al-animate" style={{ padding: '90px 0', background: 'linear-gradient(to bottom, #000a12 0%, #002d44 100%)' }}>
            <div className="al-section-content">

                    {/* Centered Value Proposition Block */}
                    <div style={{ 
                        maxWidth: '850px', 
                        margin: '0 auto', 
                        textAlign: 'center',
                        padding: '90px 40px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '32px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                         <h3 style={{ color: '#ddbe3d', fontSize: '2.2rem', fontWeight: '900', marginBottom: '35px', letterSpacing: '0.05em', lineHeight: '1.2' }}>
                            DIFERENCIAS DE ESTE PROCESO
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
                                    <span style={{ color: '#ddbe3d', fontSize: 'clamp(1.15rem, 5vw, 1.5rem)', marginTop: '10px', display: 'block' }}>Es un proceso de autoconocimiento aplicado a la vida real y al liderazgo.</span>
                                </p>
                            </div>

                            <div style={{ marginTop: '70px' }}>
                                <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.95)', marginBottom: '35px', fontWeight: '500', maxWidth: '600px', margin: '0 auto 40px' }}>
                                    Empieza hoy a comprender el mapa desde el cual tomas decisiones y lideras.
                                </p>
                                <a href="#precios" className="al-btn-primary al-btn-glow" style={{ 
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
                                        <span className="al-price-number">{selectedPlan === 'virtual' ? '99' : '169'}</span>
                                        <span className="al-currency">USD</span>
                                    </div>
                                    <div style={{ color: '#ddbe3d', fontWeight: '700', textAlign: 'center', marginTop: '10px' }}>
                                        {selectedPlan === 'virtual' ? '14, 15, 16, 17 de abril | 19:00 – 21:00 COT (UTC-5)' : '11 de abril / Cali - Colombia | 08:30 – 17:30'}
                                    </div>
                                </div>

                                <div className="al-pricing-grid" style={{ marginTop: '30px' }}>
                                    {(selectedPlan === 'virtual' ? [
                                        '4 Sesiones en vivo',
                                        'Acceso a las grabaciones por 30 días',
                                        'Test de personalidad',
                                        'Plan de acción'
                                    ] : [
                                        'Jornada Intensiva (8 horas)',
                                        'Material físico de trabajo',
                                        'Test de personalidad',
                                        'Plan de acción',
                                        'Networking con asistentes',
                                        'Certificado de asistencia'
                                    ]).map((item, i) => (
                                        <div key={i} className="al-pricing-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <CheckCircle2 size={18} style={{ flexShrink: 0, color: '#ddbe3d' }} /> <span>{item}</span>
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
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="email" 
                                        required 
                                        className="adv-input"
                                        placeholder="Donde recibirás el acceso"
                                        value={regData.email}
                                        onChange={(e) => setRegData({...regData, email: e.target.value})}
                                        onBlur={(e) => checkPreviousPurchases(e.target.value)}
                                        style={{ paddingRight: checkingDiscount ? '40px' : '10px' }}
                                    />
                                    {checkingDiscount && (
                                        <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)' }}>
                                            <div className="al-loading-spinner-small" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ddbe3d', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                        </div>
                                    )}
                                </div>
                                {prevPurchaseDiscount > 0 && (
                                    <div style={{ 
                                        marginTop: '10px', 
                                        padding: '12px 15px', 
                                        background: 'rgba(221, 190, 61, 0.1)', 
                                        borderLeft: '4px solid #ddbe3d',
                                        borderRadius: '8px',
                                        color: '#ddbe3d',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        animation: 'fadeIn 0.5s ease'
                                    }}>
                                        ✨ ¡Detectamos tu compra anterior! Se ha aplicado un descuento de ${prevPurchaseDiscount.toLocaleString()}.
                                        <div style={{ marginTop: '5px', color: '#fff' }}>
                                            Precio final: <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>${MP_PRICES[selectedPlan].toLocaleString()}</span> 
                                            <span style={{ marginLeft: '10px', fontSize: '1.1rem', fontWeight: '800' }}>${(MP_PRICES[selectedPlan] - prevPurchaseDiscount).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
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

            {/* NEW: Instructor Carousel Section */}
            <section className="course-instructor al-section al-animate">
                <div className="al-section-content">
                    <div style={{ position: 'relative' }}>
                        {[
                            {
                                firstName: "Felipe",
                                lastName: "Beltran",
                                image: "/FB-Enesencia-2.png",
                                bio: [
                                    "<strong>Conferencista internacional</strong> con más de 18 años de experiencia en liderazgo, innovación y desarrollo humano.",
                                    "Ha acompañado procesos de formación en más de 30 ciudades y ha trabajado con miles de personas explorando cómo comprender mejor la naturaleza humana y el potencial personal."
                                ],
                                testimony: [
                                    "\"A través del eneagrama empecé a comprender quién era, por qué pensaba, sentía y hacía las cosas de una determinada manera.",
                                    "Entonces dejé de juzgarme y empecé a aceptarme. Concentré mi energía en potenciar mis talentos naturales para ponerlos al servicio mío y de los demás.\""
                                ]
                            },
                            {
                                firstName: "Julian",
                                lastName: "Sierra",
                                image: "/JS-Enesencia-2.png",
                                bio: [
                                    "Como <strong>conferencista y facilitador</strong>, me he especializado en el diseño y ejecución de proyectos que impulsan el crecimiento empresarial, la innovación y el desarrollo del emprendimiento.",
                                    "Cuento con experiencia en metodologías de innovación y en gestión de proyectos (PMP). Mi propósito es potenciar el talento y la mentalidad de quienes lideran el cambio, combinando herramientas prácticas con una visión humana y estratégica."
                                ],
                                testimony: []
                            }
                        ].map((instructor, idx) => (
                            <div key={idx} className="instructor-flex" style={{ 
                                display: activeInstructor === idx ? 'flex' : 'none',
                                animation: 'fadeIn 0.5s ease'
                            }}>
                                <div className="instructor-image-container">
                                    <div className="instructor-image-glow"></div>
                                    <img src={instructor.image} alt={`${instructor.firstName} ${instructor.lastName}`} className="instructor-image" />
                                </div>

                                <div className="instructor-info">
                                    <h2 className="instructor-name">
                                        <span className="name-white" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            {instructor.firstName.split('').map((char, index) => (
                                                <span key={index}>{char}</span>
                                            ))}
                                        </span>
                                        <span className="name-yellow">{instructor.lastName}</span>
                                    </h2>
                                    <div className="instructor-divider"></div>
                                    
                                    {instructor.bio.map((paragraph, pIdx) => (
                                        <p key={pIdx} className="instructor-bio" dangerouslySetInnerHTML={{ __html: paragraph }}></p>
                                    ))}
                                    
                                    {instructor.testimony && instructor.testimony.map((line, lIdx) => (
                                        <p key={lIdx} className="instructor-bio testimony">{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Carousel Navigation */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '15px', 
                            marginTop: '50px' 
                        }}>
                            {[0, 1].map((dotIdx) => (
                                <button
                                    key={dotIdx}
                                    onClick={() => setActiveInstructor(dotIdx)}
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        background: activeInstructor === dotIdx ? '#ddbe3d' : 'rgba(0, 45, 68, 0.2)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: activeInstructor === dotIdx ? '0 0 10px rgba(221, 190, 61, 0.5)' : 'none'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* Pricing Section */}
            <section id="precios" className="al-section al-pricing-section">
                <div className="al-section-content">
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 className="al-hero-title" style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginBottom: '30px' }}>
                            <span className="al-gold-text">Invertir en ti es cambiar el rumbo de tu vida</span>
                        </h2>
                        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                            <p style={{ fontSize: '1.4rem', color: '#fff', fontWeight: '700', marginBottom: '20px' }}>
                                Lo que está en juego no es un curso.
                            </p>
                            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.6', marginBottom: '25px' }}>
                                Es la forma en que tomas decisiones, lideras y construyes tu vida.
                            </p>
                            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', fontStyle: 'italic' }}>
                                Seguir sin claridad también tiene un costo:<br/>
                                decisiones equivocadas, desgaste emocional, oportunidades perdidas.
                            </p>
                        </div>
                    </div>

                    <div className="al-pricing-wrapper al-animate">
                        {/* Tarjeta Virtual */}
                        <div className={`al-pricing-card ${selectedPlan === 'virtual' ? 'card-featured' : ''}`} style={{ background: '#ffffff' }}>
                            <div className="al-pricing-glow"></div>
                            <div className="al-pricing-header">
                                <h3>Programa Virtual</h3>
                            </div>

                            <div className="al-pricing-content">
                                <div className="al-price-box">
                                    <div className="al-current-price">
                                        <span className="al-price-number" style={{ color: '#002d44' }}>99</span>
                                        <span className="al-currency">USD</span>
                                    </div>
                                    <div style={{ color: '#a8900a', fontWeight: '700', textAlign: 'center', marginTop: '10px' }}>
                                        1° bloque: 14, 15 y 16 de abril <br/> 
                                        2° bloque: 21, 22 y 23 de abril <br/>
                                        19:00 – 21:00 COT (UTC-5)
                                    </div>
                                </div>

                                <div className="al-pricing-grid">
                                    {[
                                        '4 Sesiones en vivo',
                                        'Acceso a las grabaciones por 30 días',
                                        'Test de personalidad',
                                        'Plan de acción'
                                    ].map((item, i) => (
                                        <div key={i} className="al-pricing-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
                                            <CheckCircle2 size={18} style={{ flexShrink: 0, color: '#a8900a' }} /> <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                        className="al-btn-buy"
                                        onClick={() => handleEnrollDirect('virtual')}
                                        disabled={paymentLoading && selectedPlan === 'virtual'}
                                        style={{ backgroundColor: '#ddbe3d', color: '#002d44', fontWeight: '900', border: 'none' }}
                                    >
                                        {paymentLoading && selectedPlan === 'virtual' ? 'Iniciando...' : 'Inscribirme Virtual'} <Lock size={24} />
                                    </button>

                                <p className="al-footer-desc" style={{ color: 'rgba(0,0,0,0.4)', marginTop: '0' }}>
                                    Acceso instantáneo • Pago seguro vía MercadoPago
                                </p>
                            </div>
                        </div>

                        {/* Tarjeta Presencial */}
                        <div className={`al-pricing-card ${selectedPlan === 'presencial' ? 'card-featured' : ''}`} style={{ background: '#ffffff' }}>
                            <div className="al-pricing-glow"></div>
                            <div className="al-pricing-header" style={{ background: '#002d44' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, color: '#ddbe3d' }}>Programa Presencial</h2>
                            </div>

                            <div className="al-pricing-content">
                                <div className="al-price-box">
                                    <div className="al-current-price">
                                        <span className="al-price-number" style={{ color: '#002d44' }}>236</span>
                                        <span className="al-currency">USD</span>
                                    </div>
                                    <div style={{ color: '#a8900a', fontWeight: '700', textAlign: 'center', marginTop: '10px' }}>
                                        1° Bloque: 25 de abril <br/>
                                        2° Bloque: 02 de mayo <br/>
                                        Cali - Colombia | 08:30 – 17:30
                                    </div>
                                </div>

                                <div className="al-pricing-grid">
                                    {[
                                        'Jornada Intensiva (8 horas)',
                                        'Material físico de trabajo',
                                        'Test de personalidad',
                                        'Plan de acción',
                                        'Networking con asistentes',
                                        'Certificado de asistencia'
                                    ].map((item, i) => (
                                        <div key={i} className="al-pricing-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
                                            <CheckCircle2 size={18} style={{ flexShrink: 0, color: '#a8900a' }} /> <span>{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                        className="al-btn-buy"
                                        onClick={() => handleEnrollDirect('presencial')}
                                        disabled={paymentLoading && selectedPlan === 'presencial'}
                                        style={{ backgroundColor: '#ddbe3d', color: '#002d44', fontWeight: '900', border: 'none' }}
                                    >
                                        {paymentLoading && selectedPlan === 'presencial' ? 'Iniciando...' : 'Inscribirme Presencial'} <Lock size={24} />
                                    </button>

                                <p className="al-footer-desc" style={{ color: 'rgba(0,0,0,0.4)', marginTop: '15px' }}>
                                    Cupos limitados • Pago seguro vía MercadoPago
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Comparison Footer */}
                    <div style={{ marginTop: '80px', textAlign: 'center', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.6)', marginBottom: '25px', fontStyle: 'italic' }}>
                            Puedes seguir
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '45px' }}>
                            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', margin: 0 }}>• Aprendiendo por año de tus errores</p>
                            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', margin: 0 }}>• Eligiendo sin saber por qué</p>
                            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', margin: 0 }}>• Asistiendo a muchas terapias</p>
                        </div>
                        <p style={{ 
                            fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', 
                            fontWeight: '900', 
                            color: '#ddbe3d', 
                            maxWidth: '900px',
                            margin: '0 auto',
                            lineHeight: '1.2',
                            textTransform: 'none',
                            textShadow: '0 0 20px rgba(221, 190, 61, 0.2)'
                        }}>
                            O acelerar el proceso por una pequeña inversión
                        </p>
                    </div>
                </div>
            </section>

            {/* NEW: Scarcity Banner Section (Full Width) - Outside of original containers */}
            <div style={{ 
                margin: '120px 0 90px 0', 
                padding: '90px 20px',
                background: 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url("/Eneagrama_banner_05.png") center/cover no-repeat',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: 'inset 0 0 100px rgba(0,0,0,1)',
                width: '100vw',
                position: 'relative',
                left: '50%',
                right: '50%',
                marginLeft: '-50vw',
                marginRight: '-50vw'
            }}>
                <span style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: '800', 
                    letterSpacing: '0.4em', 
                    textTransform: 'uppercase',
                    marginBottom: '20px',
                    color: 'rgba(255,255,255,0.8)'
                }}>
                    VENTA OFICIAL
                </span>
                <h2 style={{ 
                    fontSize: 'clamp(36px, 7vw, 56px)', 
                    fontWeight: '900', 
                    marginBottom: '40px',
                    lineHeight: '1.2',
                    maxWidth: '900px',
                    color: '#ffffff'
                }}>
                    ¡Últimos <span style={{ color: '#ddbe3d' }}>cupos disponibles!</span>
                </h2>
                <a href="#precios" className="al-btn-main" style={{ 
                    textDecoration: 'none',
                    display: 'inline-flex',
                    margin: '10px auto'
                }}>
                    ASEGURA TU LUGAR AHORA
                    <ArrowRight size={22} />
                </a>
            </div>

            {/* NEW: FAQ Section (Accordion Style) */}
            <section className="course-faq al-section al-animate" style={{ background: 'var(--al-blue-dark)', paddingBottom: '90px', marginTop: '-2px', position: 'relative', borderTop: '2px solid #000a12', borderBottom: '2px solid #000a12' }}>
                <div className="al-section-content">
                    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <h2 className="al-impact-header" style={{ color: '#fff', fontSize: 'clamp(2rem, 6vw, 3.2rem)' }}>
                                Preguntas <span style={{ color: '#ddbe3d' }}>frecuentes</span>
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
                                    a: "El curso tiene una intensidad total de 8 horas. En modalidad virtual, se desarrolla en 4 sesiones de 2 horas cada una. En modalidad presencial, se realiza en una única jornada de 8 horas."
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

                        <div style={{ marginTop: '60px', textAlign: 'center' }}>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>
                                ¿Aún tienes dudas? Escríbenos directamente y te ayudamos a decidir.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Final CTA Section (Breakthrough) */}
            <section className="course-closing al-section al-animate" style={{ background: '#fff', padding: '140px 24px', position: 'relative' }}>
                <div className="al-section-content">
                    <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 className="al-impact-header" style={{ 
                            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', 
                            color: '#002d44', 
                            lineHeight: '1.2', 
                            marginBottom: '40px',
                            fontWeight: '900',
                            textTransform: 'none'
                        }}>
                            Este puede ser el <br/> 
                            <span style={{ color: '#ddbe3d' }}>punto de quiebre</span> <br/>
                            que estabas necesitando
                        </h2>
                        
                        <div style={{ marginBottom: '60px' }}>
                            <p style={{ fontSize: '1.6rem', color: '#444', fontWeight: '600', marginBottom: '10px' }}>
                                No necesitas más información.
                            </p>
                            <p style={{ fontSize: '1.8rem', color: '#ddbe3d', fontWeight: '900' }}>
                                Necesitas empezar.
                            </p>
                        </div>
                        
                        <a href="#precios" className="al-btn-primary al-btn-glow" style={{ 
                            display: 'inline-flex',
                            backgroundColor: '#ddbe3d', 
                            color: '#002d44', 
                            fontWeight: '900', 
                            padding: '24px 60px',
                            borderRadius: '16px',
                            textDecoration: 'none',
                            fontSize: '1.3rem',
                            letterSpacing: '0.05em',
                            boxShadow: '0 20px 40px rgba(221, 190, 61, 0.35)',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            textTransform: 'uppercase'
                        }}>
                            Quiero iniciar mi proceso ahora
                        </a>
                    </div>
                </div>
            </section>
            {/* Mobile FAB */}
            {showMobileFab && (
                <div className="al-mobile-fab">
                    <a href="#precios" className="al-btn-fab" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                        Asegurar mi cupo
                    </a>
                </div>
            )}
        </div>
    );
};

export default GenuinosLanding;
