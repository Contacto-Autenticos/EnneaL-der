import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Lock,
    Rocket,
    Star
} from 'lucide-react';
import './CourseLanding.css';

const PUBLIC_KEY = 'pub_prod_ceDiKCiH2oITOqT5nkOdz7hm5coX7A7t';
const WOMPI_CURRENCY = 'COP';

const CourseLanding = () => {
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

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setShowPriceModal(true);
    };

    const handleProceedToRegister = () => {
        setShowPriceModal(false);
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
                    source: `workshop_${selectedPlan}`,
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

            const amountInCents = plan === 'virtual' ? 36000000 : 59700000;
            const reference = `prog-${plan}-${Date.now()}`;

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
        handlePlanSelect(plan);
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
                    <span className="al-hero-title-top" style={{ fontSize: '0.6em', marginBottom: '10px' }}>Descubre qué hay detrás de tu forma de pensar, decidir y reaccionar.</span>
                    <span className="al-gold-text" style={{ fontSize: '0.8em', lineHeight: '1.2' }}>Aprende a usar ese conocimiento a tu favor.</span>
                </h1>

                <div className="course-intro-content">
                    <p className="al-hero-subtitle" style={{ fontSize: '1.2rem', fontWeight: '400', opacity: '0.9', maxWidth: '800px', margin: '0 auto 1.5rem', lineHeight: '1.8' }}>
                        Cuando comprendes cómo funciona tu personalidad, muchas piezas empiezan a encajar y desde ese lugar, nuevas formas de vivir, decidir y relacionarte comienzan a ser posibles.
                    </p>
                </div>

                <div className="al-hero-actions">
                </div>
            </section>

            {/* NEW: Introspection Section */}
            <section className="course-introspection al-animate">
                <div className="al-section-content">
                    <div className="introspection-no-box">
                        <h2 className="introspection-title" style={{ color: '#ddbe3d', fontSize: 'clamp(28px, 5vw, 42px)', marginBottom: '60px' }}>
                            Tal vez te ha pasado que
                        </h2>
                        
                        <div className="introspection-cards-grid">
                            {[
                                "A veces reaccionas de una manera que no entiendes del todo.",
                                "Repites ciertos patrones en decisiones, relaciones o situaciones importantes, aunque sabes que quisieras hacerlo diferente.",
                                "En algunos momentos sientes que actúas en automático. Como si una parte de ti tomara decisiones antes de que puedas detenerte a observarlas."
                            ].map((text, i) => (
                                <div key={i} className="introspection-card al-animate" style={{ animationDelay: `${i * 0.2}s` }}>
                                    <p>{text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="introspection-divider" style={{ margin: '80px auto' }}></div>

                        <div className="introspection-question-wrapper">
                            <p className="introspection-transition" style={{ marginBottom: '40px', fontSize: '1.2rem' }}>
                                Y aunque has leído, reflexionado o trabajado en ti mismo, aún hay preguntas que permanecen abiertas:
                            </p>
                            
                            <div className="introspection-cards-grid questions">
                                {[
                                    "¿Por qué pienso de esta manera?",
                                    "¿Por qué algunas situaciones me afectan tanto?",
                                    "¿Por qué ciertas decisiones se vuelven tan difíciles?"
                                ].map((q, i) => (
                                    <div key={i} className="introspection-card question-card al-animate" style={{ animationDelay: `${(i + 3) * 0.2}s`, borderColor: 'rgba(221, 190, 61, 0.4)' }}>
                                        <p style={{ color: '#ddbe3d', fontWeight: '700', margin: 0 }}>{q}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '80px', textAlign: 'center' }}>
                            <p className="introspection-closing" style={{ marginBottom: '20px' }}>
                                Muchas personas pasan años intentando cambiar comportamientos sin comprender realmente qué los origina.
                            </p>
                            <p className="introspection-closing" style={{ fontWeight: '700', marginBottom: '60px', fontSize: '1.4rem' }}>
                                El autoconocimiento profundo comienza cuando empiezas a ver con claridad cómo funciona tu personalidad.
                            </p>

                            <a href="#precios" className="al-btn-primary closing-cta">
                                Quiero conocer mi personalidad
                            </a>

                            <p className="introspection-transition" style={{ marginTop: '40px' }}>
                                Aquí te compartimos un camino para comprenderte con mayor profundidad
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Map Section */}
            <section className="course-map al-animate">
                <div className="al-section-content">
                    <div className="course-map-header">
                        <h2 className="al-hero-title">
                            <span className="al-hero-title-top">Autoconocimiento basado en el eneagrama</span>
                            <span className="al-gold-text" style={{ fontSize: '0.75em', marginTop: '15px' }}>uno de los modelos más profundos para comprender la personalidad humana</span>
                        </h2>
                        <p className="al-hero-subtitle" style={{ fontSize: '1.2rem', textAlign: 'center', margin: '20px auto 0', fontWeight: '400', color: 'rgba(255,255,255,0.7)', maxWidth: '800px' }}>
                            No es superstición ni solo teoría, es una herramienta practica para observarte con mayor conciencia y abrir nuevas posibilidades de transformación.
                        </p>
                    </div>

                    <div className="course-map-highlights">
                        <p className="introspection-transition" style={{ marginBottom: '30px' }}>En este programa podrás:</p>

                        <div className="map-grid">
                            {[
                                'Comprender cómo funciona tu tipo de personalidad y cuáles son sus motivaciones profundas.',
                                'Identificar los patrones automáticos que influyen en tu manera de pensar, decidir y reaccionar.',
                                'Reconocer las fortalezas naturales que forman parte de tu esencia.',
                                'Descubrir las trampas inconscientes que muchas veces limitan tu crecimiento.',
                                'Aprender a observar tus reacciones con mayor conciencia para abrir nuevas posibilidades de elección.',
                                'Fortalecer tu liderazgo personal y la forma en que te relacionas con otros.'
                            ].map((item, i) => (
                                <div key={i} className="map-item">
                                    <div className="map-item-dot"></div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>

                        <p className="introspection-closing" style={{ marginTop: '50px', marginBottom: '40px' }}>
                            Cuando empiezas a verte con claridad:
                        </p>

                        <div className="map-grid">
                            {[
                                'Dejas de reaccionar en automático y comienzas a tomar decisiones con mayor conciencia.',
                                'Comprendes mejor tus emociones y las de las personas que te rodean.',
                                'Puedes reconocer tus patrones antes de que dirijan tus acciones.',
                                'Tu manera de liderar, relacionarte y tomar decisiones comienza a transformarse.'
                            ].map((item, i) => (
                                <div key={i} className="map-item">
                                    <div className="map-item-dot"></div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>

                        <p className="introspection-closing" style={{ marginTop: '60px', fontStyle: 'italic', fontWeight: '400', opacity: '0.8' }}>
                            "El autoconocimiento no cambia quién eres, pero sí transforma la forma en que te relacionas contigo mismo y con el mundo."
                        </p>
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
                                <button className="al-btn-primary" style={{ marginTop: '20px', backgroundColor: '#ddbe3d', color: '#002d44', fontWeight: '900', border: 'none', padding: '22px 30px', width: '100%' }} onClick={() => handlePlanSelect('virtual')}>Seleccionar Virtual</button>
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
                                <button className="al-btn-primary" style={{ marginTop: '20px', backgroundColor: '#ddbe3d', color: '#002d44', fontWeight: '900', border: 'none', padding: '22px 30px', width: '100%' }} onClick={() => handlePlanSelect('presencial')}>Seleccionar Presencial</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Step 2: Price Summary Modal */}
            {showPriceModal && (
                <div className="registration-modal-overlay" onClick={() => setShowPriceModal(false)}>
                    <div className="registration-modal-content al-animate" style={{ padding: '0', overflow: 'hidden', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowPriceModal(false)} style={{ zIndex: 10 }}>✕</button>
                        
                        <div className={`al-pricing-card card-featured`} style={{ border: 'none', borderRadius: '0', margin: '0' }}>
                            <div className="al-pricing-glow"></div>
                            <div className="al-pricing-header">
                                <h3>{selectedPlan === 'virtual' ? 'Programa Virtual' : 'Programa Presencial'}</h3>
                            </div>

                            <div className="al-pricing-content">
                                <div className="al-price-box">
                                    <div className="al-current-price">
                                        <span className="al-price-number">{selectedPlan === 'virtual' ? '$360.000' : '$597.000'}</span>
                                        <span className="al-currency">COP</span>
                                    </div>
                                    <div style={{ color: '#ddbe3d', fontWeight: '700', textAlign: 'center', marginTop: '10px' }}>
                                        {selectedPlan === 'virtual' ? '14, 15, 16, 17 de abril' : '11 de abril'}
                                    </div>
                                </div>

                                <div className="al-pricing-grid">
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
                                    onClick={handleProceedToRegister}
                                    style={{ 
                                        backgroundColor: '#ddbe3d', 
                                        color: '#002d44', 
                                        fontWeight: '900', 
                                        border: 'none',
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        padding: '20px'
                                    }}
                                >
                                    <span>INSCRIBIRME {selectedPlan?.toUpperCase()}</span> <Lock size={20} />
                                </button>
                                {selectedPlan === 'presencial' && (
                                    <p className="al-footer-desc" style={{ color: 'rgba(255,200,200,0.8)', marginTop: '10px', fontWeight: 'bold', fontSize: '11px', textAlign: 'center' }}>
                                        * NO INCLUYE COSTOS DE DESPLAZAMIENTO *
                                    </p>
                                )}

                                <p className="al-footer-desc" style={{ color: 'rgba(255,255,255,0.3)', marginTop: '0', textAlign: 'center' }}>
                                    Acceso instantáneo • Pago seguro vía Wompi
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Registration Modal */}
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
                                <span className="name-white">
                                    {"Felipe".split('').map((char, i) => <span key={i}>{char}</span>)}
                                </span>
                                <span className="name-yellow">
                                    {"Beltran H.".split('').map((char, i) => <span key={i}>{char === ' ' ? '\u00A0' : char}</span>)}
                                </span>
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
                                        onClick={() => handlePlanSelect('virtual')}
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
                                        <span className="al-price-number">$597.000</span>
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
                                        onClick={() => handlePlanSelect('presencial')}
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

export default CourseLanding;
