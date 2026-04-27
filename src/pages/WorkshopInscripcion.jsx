import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Calendar, MapPin, Clock, Tag, Target, Users, Loader2, Globe, Instagram, Linkedin, Youtube } from 'lucide-react';
import './WorkshopInscripcion.css';

const WorkshopInscripcion = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        city: ''
    });

    const workshopConfig = {
        title: "Todos los seres humanos estamos viviendo",
        subtitle: "Por debajo de nuestras posibilidades.",
        price: 396000,
        date: "1 DE MAYO",
        location: "CAFE DEL RIO - CALI COLOMBIA",
        time: "9:00AM - 1:00PM",
        name: "Workshop Presencial Fascinantes"
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Inscripción Taller Presencial | Auténticos";
    }, []);

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
            // 1. Guardar pre-registro en Supabase
            const { data, error: insertError } = await supabase
                .from('workshop_registrations')
                .insert([{
                    full_name: formData.full_name,
                    email: formData.email.trim().toLowerCase(),
                    phone: formData.phone,
                    city: formData.city,
                    workshop_name: workshopConfig.name,
                    amount: workshopConfig.price,
                    payment_status: 'PENDING'
                }])
                .select();

            if (insertError) throw insertError;

            const registrationId = data[0].id;

            // 2. Guardar datos en localStorage para la página de retorno
            localStorage.setItem('workshop_email', formData.email.trim().toLowerCase());
            localStorage.setItem('workshop_name', formData.full_name);
            localStorage.setItem('workshop_reg_id', registrationId);

            // 3. Crear preferencia de Mercado Pago
            const reference = `workshop-${registrationId}-${Date.now()}`;
            
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

            // 4. Redirigir a Mercado Pago
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
        <div className="workshop-inscripcion">
            <section className="workshop-hero">
                <div className="workshop-hero-content">
                    <h1 className="workshop-main-title">
                        <span>¡ESTÁS VIVIENDO</span>
                        <span>POR DEBAJO DE</span>
                        <span className="text-yellow">TUS POSIBILIDADES!</span>
                    </h1>
                    
                    <ul className="workshop-feature-list">
                        <li><strong>Identifica</strong> tu estado de bienestar</li>
                        <li><strong>Aprende</strong> como elevarlo</li>
                        <li><strong>Diseña</strong> un plan de acción</li>
                    </ul>

                    <p className="workshop-signal-text">La señal que estabas esperando</p>

                </div>
            </section>

            <section className="workshop-blue-section">
                <div className="workshop-info-container">
                    <div className="workshop-experience-box">
                        <Users className="workshop-exp-icon" size={60} />
                        <div className="workshop-exp-text">
                            <span className="workshop-exp-header">UNA EXPERIENCIA PRESENCIAL</span>
                            <h2 className="workshop-exp-main">DE <span className="workshop-hours-blue">4 HORAS</span></h2>
                            <span className="workshop-exp-footer">para dejar de postergar lo que ya sabes.</span>
                        </div>
                    </div>

                    <div className="workshop-details-grid">
                        <div className="workshop-detail-item">
                            <Calendar className="workshop-detail-icon" size={32} />
                            <span className="workshop-detail-val">{workshopConfig.date}</span>
                            <span className="workshop-detail-label">FECHA</span>
                        </div>
                        <div className="workshop-detail-item">
                            <MapPin className="workshop-detail-icon" size={32} />
                            <span className="workshop-detail-val">{workshopConfig.location}</span>
                            <span className="workshop-detail-label">LUGAR</span>
                        </div>
                        <div className="workshop-detail-item">
                            <Clock className="workshop-detail-icon" size={32} />
                            <span className="workshop-detail-val">{workshopConfig.time}</span>
                            <span className="workshop-detail-label">HORARIO</span>
                        </div>
                        <div className="workshop-detail-item">
                            <Tag className="workshop-detail-icon" size={32} />
                            <span className="workshop-detail-val">${workshopConfig.price.toLocaleString('es-CO')}</span>
                            <span className="workshop-detail-label">INVERSIÓN</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="workshop-white-section">
                <h2 className="workshop-closing-text">
                    DEJA DE POSTERGAR <br />
                    <span>VIVE DESDE TODO TU POTENCIAL</span>
                </h2>

                <div className="workshop-form-container" id="registro">
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

            </section>
            <footer className="workshop-social-footer">
                <div className="footer-content">
                    <img src="/Logo-Blanco.png" alt="Auténticos" className="footer-logo-white" />
                    <div className="footer-social-links">
                        <a href="https://www.autenticos.co/" target="_blank" rel="noopener noreferrer" title="Web">
                            <Globe size={24} />
                        </a>
                        <a href="https://www.instagram.com/autenticos.co/" target="_blank" rel="noopener noreferrer" title="Instagram">
                            <Instagram size={24} />
                        </a>
                        <a href="https://www.linkedin.com/company/autenticos/?viewAsMember=true" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                            <Linkedin size={24} />
                        </a>
                        <a href="https://www.youtube.com/@AutenticosTV" target="_blank" rel="noopener noreferrer" title="YouTube">
                            <Youtube size={24} />
                        </a>
                    </div>
                    <p className="footer-social-text">Para mayor información síguenos en nuestras redes sociales</p>
                </div>
            </footer>

            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/573164287586?text=Hola%2C%20quiero%20información%20sobre%20el%20Workshop%20Fascinantes"
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

export default WorkshopInscripcion;
