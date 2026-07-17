import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { sendWebPushNotification } from '../utils/notifications';
import { Calendar, MapPin, Clock, Tag, Target, Users, Loader2, Globe, Instagram, Linkedin, Youtube, Heart, Brain, CheckCircle, DollarSign, Utensils, Rocket, Map, Navigation, X, Volume2, VolumeX } from 'lucide-react';
import './WorkshopInscripcionHazQueSuceda.css';

const WorkshopInscripcionHazQueSuceda = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingVideoIndex, setPlayingVideoIndex] = useState(null);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
    const galleryScrollRef = useRef(null);
    const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
    const testimonialScrollRef = useRef(null);
    const [galleryDots, setGalleryDots] = useState(7);
    const [testimonialDots, setTestimonialDots] = useState(5);
    const audioRef = useRef(null);
    const [hasInteracted, setHasInteracted] = useState(false);
    
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        city: '',
        hasFoodRestriction: '',
        foodRestrictionDetails: '',
        hasMobilityRequirement: '',
        mobilityRequirementDetails: ''
    });

    const [discountCode, setDiscountCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(false);
    const [discountError, setDiscountError] = useState('');

    const workshopConfig = {
        title: "Haz Que Suceda",
        subtitle: "Un día para reflexionar, para sentir y para tomar acción.",
        price: 750000,
        date: "1 de agosto",
        location: "Casa Obeso, Cali Colombia",
        time: "9:00 AM - 5:00 PM",
        name: "Haz que suceda"
    };

    const finalPrice = discountApplied ? workshopConfig.price * 0.5 : workshopConfig.price;

    const applyDiscount = () => {
        if (discountCode.toUpperCase() === 'TECREO') {
            setDiscountApplied(true);
            setDiscountError('');
        } else {
            setDiscountApplied(false);
            setDiscountError('Código inválido');
        }
    };

    const scrollToGalleryImage = (index) => {
        setActiveGalleryIndex(index);
        if (galleryScrollRef.current) {
            const container = galleryScrollRef.current;
            const item = container.children[index];
            if (item) {
                container.scrollTo({
                    left: item.offsetLeft - container.offsetLeft - 20,
                    behavior: 'smooth'
                });
            }
        }
    };

    const handleGalleryScroll = (e) => {
        const container = e.target;
        const scrollPosition = container.scrollLeft;
        const itemWidth = container.children[0].offsetWidth + 20; // Item width + gap
        const currentIndex = Math.round(scrollPosition / itemWidth);
        setActiveGalleryIndex(currentIndex);
    };

    const scrollToTestimonialVideo = (index) => {
        setActiveTestimonialIndex(index);
        if (testimonialScrollRef.current) {
            const container = testimonialScrollRef.current;
            const item = container.children[index];
            if (item) {
                container.scrollTo({
                    left: item.offsetLeft - container.offsetLeft - 20,
                    behavior: 'smooth'
                });
            }
        }
    };

    const handleTestimonialScroll = (e) => {
        const container = e.target;
        const scrollPosition = container.scrollLeft;
        const itemWidth = container.children[0].offsetWidth + 20;
        const currentIndex = Math.round(scrollPosition / itemWidth);
        setActiveTestimonialIndex(currentIndex);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "HAZ QUE SUCEDA | Taller experiencial";

        const updateDots = () => {
            if (window.innerWidth >= 768) {
                setGalleryDots(9); // 11 items - 3 visible + 1
                setTestimonialDots(4); // 5 items - 2 visible + 1
            } else {
                setGalleryDots(11);
                setTestimonialDots(5);
            }
        };
        updateDots();
        window.addEventListener('resize', updateDots);

        const updateMeta = (name, content) => {
            let element = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
            if (element) {
                element.setAttribute('content', content);
            } else {
                element = document.createElement('meta');
                if (name.startsWith('og:') || name.startsWith('twitter:')) {
                    element.setAttribute('property', name);
                } else {
                    element.setAttribute('name', name);
                }
                element.setAttribute('content', content);
                document.head.appendChild(element);
            }
            return element;
        };

        const prevDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
        const prevOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
        const prevOgDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
        const prevOgImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
        
        updateMeta('description', "Un día para reflexionar, para sentir y para tomar accion.");
        updateMeta('og:title', "HAZ QUE SUCEDA | Taller experiencial");
        updateMeta('og:description', "Un día para reflexionar, para sentir y para tomar accion.");
        updateMeta('og:image', "https://enesencia.autenticos.co/Haz%20que%20suceda/Puerta-cuadrada.jpg");

        const targetDate = new Date('2026-08-01T09:00:00').getTime();
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => {
            window.removeEventListener('resize', updateDots);
            clearInterval(interval);
            document.title = "Enesencia | Auténticos";
            if (prevDescription) updateMeta('description', prevDescription);
            if (prevOgTitle) updateMeta('og:title', prevOgTitle);
            if (prevOgDesc) updateMeta('og:description', prevOgDesc);
            if (prevOgImage) updateMeta('og:image', prevOgImage);
        };
    }, []);

    useEffect(() => {
        const handleFirstClick = () => {
            if (!hasInteracted && audioRef.current) {
                audioRef.current.play().then(() => {
                    setIsPlaying(true);
                }).catch(err => console.log("Audio autoplay prevented", err));
                setHasInteracted(true);
            }
        };

        if (!hasInteracted) {
            document.addEventListener('click', handleFirstClick);
        }

        return () => {
            document.removeEventListener('click', handleFirstClick);
        };
    }, [hasInteracted]);

    const toggleAudio = (e) => {
        e.stopPropagation();
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play();
                setIsPlaying(true);
            }
            setHasInteracted(true);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return; // Prevención de doble clic
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
                    workshop_name: workshopConfig.name,
                    amount: finalPrice,
                    payment_status: 'PENDING',
                    raw_data: {
                        food_restriction: formData.hasFoodRestriction === 'si' ? formData.foodRestrictionDetails : 'No',
                        mobility_requirement: formData.hasMobilityRequirement === 'si' ? formData.mobilityRequirementDetails : 'No'
                    }
                }])
                .select();

            if (insertError) throw insertError;

            const registrationId = data[0].id;

            localStorage.setItem('workshop_email', formData.email.trim().toLowerCase());
            localStorage.setItem('workshop_name', formData.full_name);
            localStorage.setItem('workshop_reg_id', registrationId);

            const reference = `workshop-hqs-${registrationId}-${Date.now()}`;
            
            const { data: mpData, error: mpError } = await supabase.functions.invoke('create-mp-preference', {
                body: {
                    reference,
                    unit_price: finalPrice,
                    title: workshopConfig.name,
                    user_email: formData.email,
                    back_url_custom: `${window.location.origin}/inscripcion-status`
                }
            });

            if (mpError) throw mpError;
            if (mpData?.error) throw new Error(mpData.error);

            if (mpData?.init_point) {
                // Notificación de intención de compra
                try {
                    await sendWebPushNotification('purchase_intent', { 
                        email: formData.email, 
                        product: workshopConfig.name 
                    });
                } catch(e) {
                    console.error(e);
                }
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

    return (
        <div className="hqs-page">
            {/* Top Bar Countdown */}
            <div style={{ backgroundColor: '#000', padding: '30px 20px', display: 'flex', justifyContent: 'center' }}>
                <div className="hqs-section-title-wrapper" style={{ width: '100%', maxWidth: '900px', justifyContent: 'center', margin: 0 }}>
                    <span className="hqs-line"></span>
                    <div className="hqs-countdown-container" style={{ margin: '0 20px', marginBottom: 0 }}>
                        <div className="hqs-countdown-item">
                            <span className="hqs-countdown-number">{timeLeft.days}</span>
                            <span className="hqs-countdown-label">DÍAS</span>
                        </div>
                        <div className="hqs-countdown-item">
                            <span className="hqs-countdown-number">{timeLeft.hours}</span>
                            <span className="hqs-countdown-label">HORAS</span>
                        </div>
                        <div className="hqs-countdown-item">
                            <span className="hqs-countdown-number">{timeLeft.minutes}</span>
                            <span className="hqs-countdown-label">MIN</span>
                        </div>
                        <div className="hqs-countdown-item">
                            <span className="hqs-countdown-number">{timeLeft.seconds}</span>
                            <span className="hqs-countdown-label">SEG</span>
                        </div>
                    </div>
                    <span className="hqs-line"></span>
                </div>
            </div>

            <section className="hqs-hero">
                <div className="hqs-hero-content">
                    <div className="hqs-top-text">
                        UN DÍA PARA REFLEXIONAR,<br/>
                        PARA SENTIR Y PARA TOMAR<br/>
                        <span className="hqs-text-orange">ACCIÓN.</span>
                    </div>
                    
                    <h1 className="hqs-main-title">
                        <span className="hqs-title-white">HAZ QUE</span><br/>
                        <span className="hqs-title-gold">SUCEDA</span>
                    </h1>
                    
                    <ul className="hqs-points-list">
                        <li><Heart className="hqs-icon" size={28} /> <span>LO SIENTES EN TU <strong className="hqs-text-gold">CORAZÓN,</strong></span></li>
                        <li><Brain className="hqs-icon" size={28} /> <span>LO DECIDES EN TU <strong className="hqs-text-gold">MENTE,</strong></span></li>
                        <li><CheckCircle className="hqs-icon" size={28} /> <span>LO HACES <strong className="hqs-text-gold">REALIDAD.</strong></span></li>
                    </ul>
                </div>
            </section>

            {/* Section 2: CTA and Countdown */}
            <section className="hqs-section-dark">
                <div className="hqs-section-dark-content">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '80px', flexWrap: 'wrap' }}>
                        {/* Left: Music Seal */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                            <img src="/Haz que suceda/Medalla-musica.png" alt="Música en Vivo" className="hqs-seal-img" />
                            <audio ref={audioRef} loop src="/Haz que suceda/Musica - Te creo.mp3" />
                        </div>

                        {/* Right: Text and CTA */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: '1', minWidth: '300px', maxWidth: '600px' }}>
                            <p className="hqs-subtitle" style={{ margin: '0 auto 40px', fontSize: '1.3rem', width: '100%' }}>
                                UN TALLER EXPERIENCIAL CON <strong className="hqs-text-gold">MÚSICA EN VIVO</strong> QUE CAMBIARÁ LA FORMA DE <strong className="hqs-text-gold">ALCANZAR</strong> LO QUE TE PROPONES.
                            </p>

                            <button className="hqs-cta-btn" onClick={() => setIsModalOpen(true)}>
                                TU MOMENTO ES AHORA
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section: Qualification */}
            <section className="hqs-section-light">
                <div className="hqs-section-light-content">
                    <div className="hqs-section-title-wrapper" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
                        <span className="hqs-line"></span>
                        <h3 className="hqs-section-title" style={{textAlign: 'center'}}>ESTE TALLER ES PARA TI SI...</h3>
                        <span className="hqs-line"></span>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '30px',
                        marginTop: '40px',
                        width: '100%',
                        maxWidth: '1000px',
                        margin: '40px auto 0'
                    }}>
                        <div style={{ background: '#ffffff', padding: '35px 25px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.3s ease' }}>
                            <Target size={48} color="#ddbe3d" style={{ marginBottom: '20px' }} />
                            <h4 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#111', fontWeight: 'bold' }}>Buscas enfoque</h4>
                            <p style={{ color: '#555', lineHeight: '1.6', margin: 0 }}>Sientes que tienes gran potencial, pero la indecisión o el exceso de análisis te mantienen en el mismo lugar.</p>
                        </div>
                        <div style={{ background: '#ffffff', padding: '35px 25px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.3s ease' }}>
                            <Users size={48} color="#ddbe3d" style={{ marginBottom: '20px' }} />
                            <h4 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#111', fontWeight: 'bold' }}>Quieres elevar tu entorno</h4>
                            <p style={{ color: '#555', lineHeight: '1.6', margin: 0 }}>Sabes que necesitas conectar con personas de alto valor, mentores y emprendedores que compartan tu visión.</p>
                        </div>
                        <div style={{ background: '#ffffff', padding: '35px 25px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.3s ease' }}>
                            <Rocket size={48} color="#ddbe3d" style={{ marginBottom: '20px' }} />
                            <h4 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#111', fontWeight: 'bold' }}>Estás listo para accionar</h4>
                            <p style={{ color: '#555', lineHeight: '1.6', margin: 0 }}>Estás cansado de las excusas y quieres un plan o un empujón emocional exacto para materializar lo que te propones.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="hqs-section-gray">
                <div className="hqs-section-gray-content">
                    <div className="hqs-facilitators">
                        <div className="hqs-section-title-wrapper">
                            <span className="hqs-line"></span>
                            <h3 className="hqs-section-title">FACILITADORES</h3>
                            <span className="hqs-line"></span>
                        </div>
                        <div className="hqs-fac-grid">
                            <div className="hqs-fac-card">
                                <a href="https://www.instagram.com/soycarloslopera/" target="_blank" rel="noopener noreferrer">
                                    <img src="/Haz que suceda/Carlos Lopera_02.png?v=2" alt="Carlos Lopera" className="hqs-fac-img-clean" />
                                </a>
                                <h4>CARLOS<br/>LOPERA</h4>
                                <p className="hqs-fac-title">Empresario serial</p>
                            </div>
                            <div className="hqs-fac-card">
                                <a href="https://www.instagram.com/paulaguayaba/" target="_blank" rel="noopener noreferrer">
                                    <img src="/Haz que suceda/Paula Guayaba_02.png?v=2" alt="Paula Guayaba" className="hqs-fac-img-clean" />
                                </a>
                                <h4>PAULA<br/>GUAYABA</h4>
                                <p className="hqs-fac-title">Músico profesional y<br/>Coach de vida plena</p>
                            </div>
                            <div className="hqs-fac-card">
                                <a href="https://www.instagram.com/felipebeltranhernandez/" target="_blank" rel="noopener noreferrer">
                                    <img src="/Haz que suceda/Felipe Beltran_02.png?v=2" alt="Felipe Beltrán" className="hqs-fac-img-clean" />
                                </a>
                                <h4>FELIPE<br/>BELTRÁN</h4>
                                <p className="hqs-fac-title">Emprendedor y<br/>mentor de vida</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Gallery */}
            <section className="hqs-section-light" style={{ overflow: 'hidden', padding: '80px 0' }}>
                <div className="hqs-section-light-content" style={{ maxWidth: '100%' }}>
                    <div className="hqs-section-title-wrapper" style={{ marginBottom: '20px', width: '100%', maxWidth: '900px', margin: '0 auto 20px', padding: '0 20px' }}>
                        <span className="hqs-line"></span>
                        <h3 className="hqs-section-title" style={{textAlign: 'center'}}>EXPERIENCIAS ANTERIORES</h3>
                        <span className="hqs-line"></span>
                    </div>
                    
                    <div className="hqs-gallery-carousel" ref={galleryScrollRef} onScroll={handleGalleryScroll}>
                        {[
                            "1.JPG",
                            "2.JPG",
                            "3.JPG",
                            "4.jpg",
                            "5.JPG",
                            "6.jpg",
                            "7.JPG",
                            "8.jpg",
                            "9.jpg",
                            "10.JPG",
                            "11.JPG"
                        ].map((imgName, idx) => (
                            <div key={idx} className="hqs-gallery-item">
                                <img 
                                    src={`/Haz que suceda/${imgName}`} 
                                    alt={`Experiencia ${idx + 1}`} 
                                    loading="lazy" 
                                />
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                        {[...Array(galleryDots).keys()].map((idx) => (
                            <button
                                key={idx}
                                onClick={() => scrollToGalleryImage(idx)}
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: activeGalleryIndex === idx ? '#ddbe3d' : 'rgba(0, 0, 0, 0.2)',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    transition: 'background 0.3s ease'
                                }}
                                aria-label={`Ir a la imagen ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 4: Testimonials */}
            <section className="hqs-section-dark">
                <div className="hqs-section-dark-content" style={{ padding: '20px 0' }}>
                    <div className="hqs-testimonials" style={{ marginBottom: 0 }}>
                        <div className="hqs-section-title-wrapper" style={{ marginBottom: '20px' }}>
                            <span className="hqs-line"></span>
                            <h3 className="hqs-section-title" style={{textAlign: 'center'}}>LO QUE DICEN QUIENES LO VIVIERON</h3>
                            <span className="hqs-line"></span>
                        </div>
                        <div className="hqs-testimonials-grid" ref={testimonialScrollRef} onScroll={handleTestimonialScroll}>
                            {["f8GeoiqP8-4", "WRs0-x9xp4g", "um8Ltkwtvqc", "tEeh1PqaZBg", "Xc8yU2OHvuQ"].map((id, index) => (
                                <div key={index} className="hqs-testimonial-video" style={{ position: 'relative', cursor: playingVideoIndex === index ? 'default' : 'pointer' }} onClick={() => setPlayingVideoIndex(index)}>
                                    {playingVideoIndex !== index ? (
                                        <>
                                            <img 
                                                src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`} 
                                                alt={`Testimonio ${index + 1}`} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '16/9', display: 'block' }} 
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
                                            src={`https://www.youtube.com/embed/${id}?rel=0&autoplay=1`} 
                                            title={`Testimonio ${index + 1}`} 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                        ></iframe>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                            {[...Array(testimonialDots).keys()].map((idx) => (
                                <button
                                    key={idx}
                                    onClick={() => scrollToTestimonialVideo(idx)}
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: activeTestimonialIndex === idx ? '#ddbe3d' : 'rgba(255, 255, 255, 0.3)',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                        transition: 'background 0.3s ease'
                                    }}
                                    aria-label={`Ir al testimonio ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 5: Event Info */}
            <section className="hqs-section-gray">
                <div className="hqs-section-gray-content">
                    <div className="hqs-section-title-wrapper" style={{ marginBottom: '40px', width: '100%' }}>
                        <span className="hqs-line"></span>
                        <h3 className="hqs-section-title" style={{textAlign: 'center'}}>AGÉNDATE</h3>
                        <span className="hqs-line"></span>
                    </div>
                    <div className="hqs-info-grid">
                        <div className="hqs-info-item">
                            <Calendar className="hqs-info-icon" size={32} />
                            <div>
                                <span className="hqs-info-label">FECHA</span>
                                <span className="hqs-info-val">SÁBADO<br/><strong className="hqs-info-big">1</strong> de agosto</span>
                            </div>
                        </div>
                        <div className="hqs-info-item">
                            <Clock className="hqs-info-icon" size={32} />
                            <div>
                                <span className="hqs-info-label">HORARIO</span>
                                <span className="hqs-info-val"><strong className="hqs-info-medium">9:00 AM</strong><br/><span className="hqs-dash">-</span><br/><strong className="hqs-info-medium">5:00 PM</strong></span>
                            </div>
                        </div>
                        <div className="hqs-info-item">
                            <MapPin className="hqs-info-icon" size={32} />
                            <div>
                                <span className="hqs-info-label">LUGAR</span>
                                <span className="hqs-info-val"><strong className="hqs-info-medium">Casa Obeso</strong><br/>Cali, Colombia</span>
                                <div style={{ marginTop: '12px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                    <a href="https://www.google.com/maps/search/Casa+Obeso+Mejia,+Cali" target="_blank" rel="noopener noreferrer" className="hqs-map-icon-link" title="Ver en Mapa">
                                        <Map size={22} />
                                    </a>
                                    <a href="https://waze.com/ul?q=Casa%20Obeso%20Mejia%20Cali" target="_blank" rel="noopener noreferrer" className="hqs-map-icon-link" title="Navegar">
                                        <Navigation size={22} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 5: Pricing Box */}
            <section className="hqs-section-light">
                <div className="hqs-section-light-content">
                    <div className="hqs-pricing-section">
                        <div className="hqs-pricing-box">
                            <div className="hqs-pricing-ribbon">CUPOS LIMITADOS</div>
                            <h3 className="hqs-pricing-title">INVERSIÓN</h3>
                            <div className="hqs-pricing-amount">
                                $750.000 <span className="hqs-pricing-currency">COP</span>
                            </div>
                            <div className="hqs-pricing-iva">por persona (IVA incluido)</div>
                            <ul className="hqs-pricing-benefits">
                                <li><CheckCircle size={20} className="hqs-text-gold" /> Acceso completo de 9:00 AM a 5:00 PM</li>
                                <li><Utensils size={20} className="hqs-text-gold" /> Almuerzo y refrigerios incluidos</li>
                                <li><Heart size={20} className="hqs-text-gold" /> Música en vivo y dinámicas experienciales</li>
                                <li><Rocket size={20} className="hqs-text-gold" /> Un día, una decisión, una nueva realidad</li>
                            </ul>
                            <button className="hqs-cta-btn-alt hqs-pricing-btn" onClick={() => setIsModalOpen(true)}>
                                HAZ QUE SUCEDA
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section: Guarantee */}
            <section className="hqs-section-gray" style={{ padding: '60px 0' }}>
                <div className="hqs-section-gray-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 20px' }}>
                    <img 
                        src="/Haz que suceda/Garantia.png" 
                        alt="Garantía de Satisfacción" 
                        style={{ maxWidth: '450px', width: '100%', marginBottom: '25px' }} 
                    />
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '2.2rem', color: '#111', fontWeight: 'bold', margin: 0, fontFamily: 'Outfit, sans-serif', lineHeight: '1.1' }}>
                            Tranquilo, tu compra está
                        </h3>
                        <h3 style={{ fontSize: '2.6rem', color: '#ddbe3d', fontWeight: 'bold', margin: 0, fontFamily: 'Outfit, sans-serif', lineHeight: '1.1' }}>
                            100% protegida.
                        </h3>
                    </div>
                    <p style={{ maxWidth: '600px', fontSize: '1.2rem', lineHeight: '1.6', color: '#444', margin: 0 }}>
                        Si al finalizar el evento sientes que no era para ti, ni contribuyó en tu desarrollo. Te devolvemos el 100% de tu dinero.
                    </p>
                </div>
            </section>

            {/* Section 6: FAQ */}
            <section className="hqs-section-light" style={{ background: '#ffffff' }}>
                <div className="hqs-section-light-content">
                    <div className="hqs-faq-section">
                        <div className="hqs-section-title-wrapper">
                            <span className="hqs-line"></span>
                            <h3 className="hqs-section-title" style={{textAlign: 'center'}}>PREGUNTAS FRECUENTES</h3>
                            <span className="hqs-line"></span>
                        </div>
                        <div className="hqs-faq-container">
                            {[
                                { q: '¿A quién va dirigido este taller?', a: 'A cualquier persona que quiera tomar acción y transformar su realidad.' },
                                { q: '¿Qué incluye el valor de la inscripción?', a: 'Acceso completo al taller de 9:00 AM a 5:00 PM, música en vivo, almuerzo y refrigerios.' },
                                { q: '¿Cuáles son los métodos de pago?', a: 'Aceptamos todos los medios de pago a través de Mercado Pago (PSE, Tarjetas de Crédito, Efecty, etc.)' },
                                { q: '¿Puedo ceder mi entrada si finalmente no puedo asistir?', a: 'Sí, puedes transferir tu entrada notificándonos con al menos 48 horas de anticipación.' }
                            ].map((faq, idx) => (
                                <details key={idx} className="hqs-faq-item">
                                    <summary className="hqs-faq-question">{faq.q}</summary>
                                    <div className="hqs-faq-answer">{faq.a}</div>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {isModalOpen && (
                <div className="hqs-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="workshop-form-container hqs-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="hqs-modal-close" onClick={() => setIsModalOpen(false)}>
                            <X size={24} />
                        </button>
                        <h3 className="workshop-form-title">Formulario de registro</h3>
                    {error && <div style={{ color: '#ff4d4d', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="workshop-form-group">
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
                        <div className="workshop-form-group">
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
                        <div className="workshop-form-group">
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
                        <div className="workshop-form-group">
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

                        <div className="workshop-form-group">
                            <label>¿Tiene alguna restricción alimentaria, alergia o requerimiento especial de alimentación que debamos tener en cuenta?</label>
                            <div className="hqs-radio-group">
                                <label className="hqs-radio-label">
                                    <input type="radio" name="hasFoodRestriction" value="si" checked={formData.hasFoodRestriction === 'si'} onChange={handleChange} required />
                                    Sí
                                </label>
                                <label className="hqs-radio-label">
                                    <input type="radio" name="hasFoodRestriction" value="no" checked={formData.hasFoodRestriction === 'no'} onChange={handleChange} required />
                                    No
                                </label>
                            </div>
                            {formData.hasFoodRestriction === 'si' && (
                                <input 
                                    type="text" 
                                    name="foodRestrictionDetails" 
                                    value={formData.foodRestrictionDetails || ''} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="¿Cuál?"
                                    style={{ marginTop: '10px' }}
                                />
                            )}
                        </div>

                        <div className="workshop-form-group">
                            <label>¿Requiere algún tipo de apoyo o consideración especial relacionada con movilidad, accesibilidad o acceso al lugar del evento?</label>
                            <div className="hqs-radio-group">
                                <label className="hqs-radio-label">
                                    <input type="radio" name="hasMobilityRequirement" value="si" checked={formData.hasMobilityRequirement === 'si'} onChange={handleChange} required />
                                    Sí
                                </label>
                                <label className="hqs-radio-label">
                                    <input type="radio" name="hasMobilityRequirement" value="no" checked={formData.hasMobilityRequirement === 'no'} onChange={handleChange} required />
                                    No
                                </label>
                            </div>
                            {formData.hasMobilityRequirement === 'si' && (
                                <input 
                                    type="text" 
                                    name="mobilityRequirementDetails" 
                                    value={formData.mobilityRequirementDetails || ''} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="¿Cuál?"
                                    style={{ marginTop: '10px' }}
                                />
                            )}
                        </div>

                        <div className="workshop-form-group">
                            <label>Código de Descuento (Opcional)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="text" 
                                    value={discountCode} 
                                    onChange={(e) => {
                                        setDiscountCode(e.target.value);
                                        setDiscountError('');
                                    }} 
                                    placeholder="Ingresa tu código"
                                    style={{ flex: 1, textTransform: 'uppercase' }}
                                    disabled={discountApplied}
                                />
                                <button 
                                    type="button" 
                                    onClick={applyDiscount}
                                    style={{
                                        padding: '10px 15px',
                                        backgroundColor: discountApplied ? '#10b981' : '#333',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: discountApplied ? 'default' : 'pointer',
                                        fontWeight: 'bold',
                                        minWidth: '100px'
                                    }}
                                    disabled={discountApplied || !discountCode}
                                >
                                    {discountApplied ? 'APLICADO' : 'APLICAR'}
                                </button>
                            </div>
                            {discountError && <span style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>{discountError}</span>}
                            {discountApplied && <span style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>¡Descuento del 50% aplicado exitosamente! Valor final: ${finalPrice.toLocaleString('es-CO')} COP</span>}
                        </div>

                        <button 
                            type="submit" 
                            className="workshop-submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <Loader2 className="animate-spin" size={20} />
                                    PROCESANDO...
                                </span>
                            ) : `INSCRIBIRME Y PAGAR ${discountApplied ? `($${finalPrice.toLocaleString('es-CO')})` : ''}`}
                        </button>
                        <div style={{ marginTop: '15px', textAlign: 'center', color: '#666', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <span role="img" aria-label="Seguro">🔒</span> Pago 100% Seguro cifrado por Mercado Pago
                        </div>
                    </form>
                    </div>
                </div>
            )}
            
            <footer className="hqs-footer">
                <div className="hqs-footer-content">
                    <a href="https://www.autenticos.co/" target="_blank" rel="noopener noreferrer">
                        <img src="/Logo-Blanco.png" alt="Auténticos" className="hqs-footer-logo" />
                    </a>
                    <div className="hqs-footer-social">
                        <a href="https://www.autenticos.co/" target="_blank" rel="noopener noreferrer"><Globe size={18} /></a>
                        <a href="https://www.instagram.com/autenticos.co/" target="_blank" rel="noopener noreferrer"><Instagram size={18} /></a>
                        <a href="https://www.linkedin.com/company/autenticos/?viewAsMember=true" target="_blank" rel="noopener noreferrer"><Linkedin size={18} /></a>
                        <a href="https://www.youtube.com/@AutenticosTV" target="_blank" rel="noopener noreferrer"><Youtube size={18} /></a>
                    </div>
                </div>
            </footer>

            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/573164287586?text=Hola%2C%20quiero%20mayor%20información%20sobre%20el%20taller%20Haz%20Que%20Suceda"
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-float"
                title="Escríbenos por WhatsApp"
            >
                <svg viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.004 0C7.165 0 0 7.163 0 16.001c0 2.82.736 5.573 2.134 7.997L.074 32l8.2-2.148A15.93 15.93 0 0016.004 32C24.838 32 32 24.837 32 16.001 32 7.163 24.838 0 16.004 0zm0 29.393a13.346 13.346 0 01-7.213-2.106l-.517-.307-5.362 1.406 1.43-5.226-.337-.535a13.306 13.306 0 01-2.042-7.124c0-7.38 6.005-13.387 13.387-13.387 7.38 0 13.387 6.007 13.387 13.387 0 7.382-6.352 13.392-13.733 13.392zm7.335-10.025c-.402-.201-2.38-1.175-2.749-1.309-.369-.134-.637-.201-.906.201-.268.402-1.04 1.309-1.275 1.578-.235.268-.47.302-.872.1-.402-.201-1.698-.626-3.234-1.996-1.195-1.066-2.002-2.384-2.236-2.786-.235-.402-.025-.62.176-.82.181-.18.402-.47.603-.704.201-.235.268-.402.402-.67.134-.268.067-.503-.034-.704-.1-.201-.906-2.183-1.241-2.988-.327-.784-.659-.678-.906-.69-.235-.012-.503-.015-.771-.015s-.704.1-1.073.503c-.369.402-1.41 1.377-1.41 3.36 0 1.982 1.443 3.897 1.644 4.165.201.268 2.838 4.332 6.879 6.074.961.415 1.712.663 2.297.849.965.307 1.843.264 2.537.16.774-.116 2.38-.973 2.716-1.912.336-.94.336-1.745.235-1.912-.1-.168-.369-.268-.771-.47z"/>
                </svg>
            </a>

            {/* Floating Audio Button */}
            <div className="hqs-floating-audio">
                <button className="hqs-audio-toggle" onClick={toggleAudio} title={isPlaying ? "Silenciar música" : "Reproducir música"}>
                    {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </button>
            </div>
        </div>
    );
};

export default WorkshopInscripcionHazQueSuceda;
