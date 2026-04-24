import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Calendar, MapPin, Clock, Tag, Target, Users, Loader2 } from 'lucide-react';
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
        price: 360000,
        date: "1 DE MAYO",
        location: "CAFE DEL RIO",
        time: "9:00AM - 1:00PM",
        name: "Workshop Presencial de Eneagrama"
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
                    <h1 className="workshop-title">{workshopConfig.title}</h1>
                    <span className="workshop-subtitle-yellow">{workshopConfig.subtitle}</span>
                    <div className="workshop-divider"></div>
                    <p className="workshop-hero-desc">
                        Reconoce dónde estás. <br />
                        Define el plan para <span className="workshop-highlight-yellow">vivir desde tu potencial.</span>
                    </p>
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

                <div className="workshop-footer-logo">
                    <img src="/logo-azul.png" alt="Auténticos" />
                </div>
            </section>
        </div>
    );
};

export default WorkshopInscripcion;
