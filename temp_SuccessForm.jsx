import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import './MltDireccionLanding.css'; // Reusing styles

const SuccessForm = () => {
    const [formData, setFormData] = useState({
        q1: '',
        q2: '',
        q3: '',
        q4: '',
        q5: '5'
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        const storedEmail = localStorage.getItem('mlt_email');
        const storedName = localStorage.getItem('mlt_name');
        if (storedEmail) setEmail(storedEmail);
        if (storedName) setName(storedName);
        
        // Background isolation
        document.body.style.backgroundColor = '#ffffff';
        document.body.style.color = '#002d44';
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

        try {
            // First we try to find their registration to update it
            let targetId = null;
            if (email) {
                const { data } = await supabase
                    .from('workshop_registrations')
                    .select('id, raw_data')
                    .eq('email', email)
                    .order('created_at', { ascending: false })
                    .limit(1);
                
                if (data && data.length > 0) {
                    targetId = data[0].id;
                    const existingRaw = data[0].raw_data || {};
                    
                    await supabase
                        .from('workshop_registrations')
                        .update({
                            raw_data: {
                                ...existingRaw,
                                form_answers: formData
                            }
                        })
                        .eq('id', targetId);
                }
            }

            // Fallback if we couldn't update (e.g. opened in different browser)
            // Just creating a log entry in case
            if (!targetId) {
                await supabase.from('workshop_registrations').insert([{
                    email: email || 'unknown',
                    full_name: name || 'unknown',
                    workshop_name: 'MLT Dirección - Formulario Post Pago',
                    payment_status: 'FORM_ONLY',
                    raw_data: { form_answers: formData }
                }]);
            }

            setSuccess(true);
        } catch (err) {
            console.error("Error saving form:", err);
            alert("Hubo un pequeño error guardando tus respuestas, pero tu pago está confirmado. Nos pondremos en contacto contigo.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
                <CheckCircle2 size={80} color="#25D366" style={{ marginBottom: '20px' }} />
                <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#ddbe3d' }}>¡Gracias por tus respuestas!</h1>
                <p style={{ fontSize: '18px', maxWidth: '600px', lineHeight: '1.6', color: '#002d44' }}>
                    Hemos recibido tu información con éxito. Únete a nuestro grupo oficial de WhatsApp para recibir todas las indicaciones previas a nuestro primer encuentro.
                </p>
                <p style={{ fontSize: '18px', marginTop: '20px', color: '#002d44' }}>
                    <strong>Primer encuentro:</strong> Lunes 7 de septiembre, 7:30 p.m.
                </p>
                <a 
                    href="https://chat.whatsapp.com/HTrWhrXrwPkDMhYcSEo8LU" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                        marginTop: '30px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        background: '#25D366', 
                        color: '#ffffff', 
                        padding: '15px 30px', 
                        borderRadius: '30px', 
                        textDecoration: 'none', 
                        fontWeight: 'bold', 
                        fontSize: '18px',
                        boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    UNIRME AL GRUPO DE WHATSAPP
                </a>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ color: '#ddbe3d', fontSize: '32px', marginBottom: '20px' }}>¡Bienvenido/a a MLT Dirección!</h1>
                <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#002d44', textAlign: 'left' }}>
                    Me alegra mucho que vayamos a trabajar juntos durante estos 30 días.
                    Antes de nuestro primer encuentro quiero conocerte un poco mejor y, especialmente, entender cuál es la situación sobre la que quieres trabajar.
                </p>
                <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#002d44', textAlign: 'left', marginTop: '15px' }}>
                    Te invito a llenar este breve formulario de preparación. No necesitas tener las respuestas perfectas. Precisamente vamos a comenzar por encontrar claridad. Toda la información suministrada será confidencial y se utilizará exclusivamente durante este proceso.
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ background: '#002d44', padding: '40px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '16px', color: '#ddbe3d' }}>
                            1. ¿Qué está ocurriendo actualmente en tu vida que quieres trabajar?
                        </label>
                        <textarea 
                            name="q1" required value={formData.q1} onChange={handleChange}
                            rows="4"
                            style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '16px' }}
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '16px', color: '#ddbe3d' }}>
                            2. ¿Qué decisión, cambio o situación llevas tiempo intentando resolver?
                        </label>
                        <textarea 
                            name="q2" required value={formData.q2} onChange={handleChange}
                            rows="3"
                            style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '16px' }}
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '16px', color: '#ddbe3d' }}>
                            3. ¿Qué has hecho hasta ahora para resolverla?
                        </label>
                        <textarea 
                            name="q3" required value={formData.q3} onChange={handleChange}
                            rows="3"
                            style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '16px' }}
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '16px', color: '#ddbe3d' }}>
                            4. ¿Qué tendría que haber cambiado dentro de 30 días para que dijeras “valió la pena hacer este proceso”?
                        </label>
                        <textarea 
                            name="q4" required value={formData.q4} onChange={handleChange}
                            rows="3"
                            style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '16px' }}
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '16px', color: '#ddbe3d' }}>
                            5. Del 1 al 10, ¿qué tan dispuesto estás a tomar decisiones y actuar durante estas cuatro semanas?
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <input 
                                type="range" 
                                name="q5" 
                                min="1" max="10" 
                                value={formData.q5} 
                                onChange={handleChange}
                                style={{ flex: 1, accentColor: '#ddbe3d' }}
                            />
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ddbe3d', minWidth: '30px' }}>{formData.q5}</span>
                        </div>
                    </div>

                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        marginTop: '40px', width: '100%', padding: '20px', 
                        background: '#ddbe3d', color: '#002d44', 
                        border: 'none', borderRadius: '12px', 
                        fontSize: '18px', fontWeight: 'bold', 
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                    }}
                >
                    {loading ? 'Enviando...' : 'Enviar mis respuestas e Iniciar'}
                    {!loading && <ArrowRight />}
                </button>
            </form>
        </div>
    );
};

export default SuccessForm;
