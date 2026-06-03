import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Calendar, MapPin, Clock, Tag, Target, Users, Loader2, Globe, Instagram, Linkedin, Youtube, Heart, Brain, CheckCircle, DollarSign, Utensils, Rocket, Map, Navigation, X, Volume2, VolumeX } from 'lucide-react';
import './WorkshopInscripcionHazQueSuceda.css';

const WorkshopInscripcionHazQueSuceda = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const [hasInteracted, setHasInteracted] = useState(false);
    
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

    const workshopConfig = {
        title: "Haz Que Suceda",
        subtitle: "Un día para reflexionar, para sentir y para tomar acción.",
        price: 750000,
        date: "27 de junio",
        location: "Casa Obeso, Cali Colombia",
        time: "9:00 AM - 5:00 PM",
        name: "Haz que suceda"
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "HAZ QUE SUCEDA | Taller experiencial";

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

        return () => {
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
                    amount: workshopConfig.price,
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
                    unit_price: workshopConfig.price,
                    title: workshopConfig.name,
                    user_email: formData.email,
                    back_url_custom: `${window.location.origin}/inscripcion-status`
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

    return (
        <div className="hqs-page">
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

                    <div className="hqs-music-seal">
                        <img src="/Haz que suceda/Medalla-musica.png" alt="Música en Vivo" className="hqs-seal-img" />
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>
                            <button className="hqs-audio-toggle" onClick={toggleAudio}>
                                {isPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
                            </button>
                            <span className="hqs-audio-note">{isPlaying ? 'Escuchando' : 'Clic para escuchar'}</span>
                        </div>
                    </div>

                    <audio ref={audioRef} loop src="/Haz que suceda/Musica - Te creo.mp3" />

                    <p className="hqs-subtitle">
                        UN TALLER EXPERIENCIAL CON <strong className="hqs-text-gold">MÚSICA EN VIVO</strong> QUE CAMBIARÁ LA FORMA DE <strong className="hqs-text-gold">ALCANZAR</strong> LO QUE TE PROPONES.
                    </p>

                    <button className="hqs-cta-btn" onClick={() => setIsModalOpen(true)}>
                        TU MOMENTO ES AHORA
                    </button>
                </div>
            </section>

            <section className="hqs-section-dark">
                <div className="hqs-section-dark-content">
                    <div className="hqs-facilitators">
                        <div className="hqs-section-title-wrapper">
                            <span className="hqs-line"></span>
                            <h3 className="hqs-section-title">FACILITADORES</h3>
                            <span className="hqs-line"></span>
                        </div>
                        <div className="hqs-fac-grid">
                            <div className="hqs-fac-card">
                                <a href="https://www.instagram.com/soycarloslopera/" target="_blank" rel="noopener noreferrer">
                                    <img src="/Haz que suceda/Carlos Lopera_02.png" alt="Carlos Lopera" className="hqs-fac-img-clean" />
                                </a>
                                <h4>CARLOS<br/>LOPERA</h4>
                            </div>
                            <div className="hqs-fac-card">
                                <a href="https://www.instagram.com/paulaguayaba/" target="_blank" rel="noopener noreferrer">
                                    <img src="/Haz que suceda/Paula Guayaba_02.png" alt="Paula Guayaba" className="hqs-fac-img-clean" />
                                </a>
                                <h4>PAULA<br/>GUAYABA</h4>
                            </div>
                            <div className="hqs-fac-card">
                                <a href="https://www.instagram.com/felipebeltranhernandez/" target="_blank" rel="noopener noreferrer">
                                    <img src="/Haz que suceda/Felipe Beltran_02.png" alt="Felipe Beltrán" className="hqs-fac-img-clean" />
                                </a>
                                <h4>FELIPE<br/>BELTRÁN</h4>
                            </div>
                        </div>
                    </div>

                    <div className="hqs-info-box-wrapper">
                        <div className="hqs-info-box">
                            <div className="hqs-info-grid">
                                <div className="hqs-info-item">
                                    <Calendar className="hqs-info-icon" size={28} />
                                    <div>
                                        <span className="hqs-info-label">FECHA</span>
                                        <span className="hqs-info-val">SÁBADO<br/><strong className="hqs-info-big">27</strong> de junio</span>
                                    </div>
                                </div>
                                <div className="hqs-info-item">
                                    <Clock className="hqs-info-icon" size={28} />
                                    <div>
                                        <span className="hqs-info-label">HORARIO</span>
                                        <span className="hqs-info-val"><strong className="hqs-info-medium">9:00 AM</strong><br/><span className="hqs-dash">-</span><br/><strong className="hqs-info-medium">5:00 PM</strong></span>
                                    </div>
                                </div>
                                <div className="hqs-info-item">
                                    <MapPin className="hqs-info-icon" size={28} />
                                    <div>
                                        <span className="hqs-info-label">LUGAR</span>
                                        <span className="hqs-info-val"><strong className="hqs-info-medium">Casa Obeso</strong><br/>Cali, Colombia</span>
                                        <div style={{ marginTop: '12px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                            <a href="https://www.google.com/maps/search/Casa+Obeso+Mejia,+Cali" target="_blank" rel="noopener noreferrer" className="hqs-map-icon-link" title="Ver en Mapa">
                                                <Map size={20} />
                                            </a>
                                            <a href="https://waze.com/ul?q=Casa%20Obeso%20Mejia%20Cali" target="_blank" rel="noopener noreferrer" className="hqs-map-icon-link" title="Navegar">
                                                <Navigation size={20} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="hqs-info-item hqs-info-price">
                                    <DollarSign className="hqs-info-icon" size={28} />
                                    <div>
                                        <span className="hqs-info-label">INVERSIÓN</span>
                                        <span className="hqs-info-val">
                                            <strong className="hqs-info-big-price">$750.000</strong> <span style={{fontWeight: '400', fontSize: '1rem'}}>COP</span><br/>
                                            por persona<br/>
                                            <span style={{fontSize: '0.75rem', color: '#ddbe3d', display: 'block', marginTop: '6px', fontWeight: '500'}}>INCLUYE ALMUERZO Y REFRIGERIOS •</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hqs-includes-wrapper">
                        <span className="hqs-dot">•</span>
                        <div className="hqs-includes">
                            <span style={{textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center'}}>UN DÍA - UNA DECISIÓN - UNA NUEVA REALIDAD</span>
                        </div>
                        <span className="hqs-dot">•</span>
                    </div>

                    <button className="hqs-cta-btn-alt" onClick={() => setIsModalOpen(true)}>
                        HAZ QUE SUCEDA
                    </button>
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
                            ) : "INSCRIBIRME Y PAGAR"}
                        </button>
                    </form>
                    </div>
                </div>
            )}
            
            <footer className="hqs-footer">
                <div className="hqs-footer-content">
                    <img src="/Logo-Blanco.png" alt="Auténticos" className="hqs-footer-logo" />
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
        </div>
    );
};

export default WorkshopInscripcionHazQueSuceda;
