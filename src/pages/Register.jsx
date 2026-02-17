import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { supabase } from '../supabaseClient';
import { getEnneagramInfo } from '../utils/calculator';
import './Register.css';



const Register = ({ onRegister, result }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    // Split date state
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);


    // Date helpers
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && day && month && email && year) {
            setLoading(true);

            const monthIndex = months.indexOf(month) + 1;
            const formattedDate = `${year}-${monthIndex.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

            // Create user object strictly for local use
            const newUser = {
                name,
                email,
                birth_date: formattedDate,
                id: Date.now().toString()
            };

            // Save to Supabase
            const saveToSupabase = async () => {
                try {
                    const { error } = await supabase
                        .from('user_leads')
                        .insert([
                            {
                                full_name: name,
                                email: email,
                                birth_date: formattedDate,
                                enneatype: result?.enneatype || null
                            }
                        ]);

                    if (error) {
                        console.error('Error storing lead:', error);
                    } else {
                        // Send Email on successful DB insert
                        const resultLink = result && result.enneatype
                            ? `${window.location.origin}/result/${result.enneatype}`
                            : `${window.location.origin}/result`;

                        try {
                            // Explicitly initialize with public key
                            emailjs.init('jvBHZwalOIEABW7qV');

                            // Get enneatype info for the image URL
                            const enneaInfo = result?.enneatype ? getEnneagramInfo(result.enneatype) : null;
                            const productionUrl = 'https://enesencia.autenticos.co';
                            const imagePath = enneaInfo?.image || '/moneda-autenticos.png';
                            const resultImage = `${productionUrl}${imagePath}`;

                            const response = await emailjs.send(
                                'service_29pk8s1',
                                'template_6emj63o',
                                {
                                    to_name: name,
                                    to_email: email,
                                    result_link: resultLink,
                                    result_image: resultImage
                                }
                            );
                            console.log('Email sent successfully!', response.status, response.text, 'Image sent:', resultImage);
                        } catch (emailError) {
                            console.error('Failed to send email. Error details:', emailError);
                            // Log specific EmailJS error if available
                            if (emailError.text) console.error('EmailJS Error Text:', emailError.text);
                        }
                    }
                } catch (err) {
                    console.error('Unexpected error storing lead:', err);
                }
            };

            // Execute save
            saveToSupabase().then(() => {
                // Pass to parent/app which saves to localStorage
                onRegister(newUser);
                setLoading(false);

                // Redirect based on Enneatype result
                if (result && result.enneatype) {
                    window.location.href = `https://www.autenticos.co/eneagrama-eneatipo-${result.enneatype}`;
                } else {
                    // Fallback if no result is present
                    window.location.href = 'https://www.autenticos.co/9-tipos-de-liderazgo';
                }
            });
        }
    };

    return (
        <div className="register-page">
            <div className="container register-form-container">
                <div className="register-content-wrapper">
                    <div className="register-logo-container">
                        <img
                            src="/moneda-autenticos.png"
                            alt="Logo Auténticos"
                            className="register-logo-img animate-fade-in"
                        />
                    </div>
                    <p style={{ textAlign: 'center', marginBottom: '30px', color: '#111', fontWeight: '600', fontSize: '1rem', lineHeight: '1.3' }}>
                        ¿Quieres conocer más de tu eneatipo?<br />
                        Déjanos tus datos y accede gratis de inmediato.
                    </p>
                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-group">
                            <label>Nombre y apellido</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="form-input"
                                placeholder="Tu nombre y apellido"
                            />
                        </div>

                        <div className="form-group">
                            <label>Fecha de nacimiento</label>
                            <div className="date-inputs-container">
                                <select
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    required
                                    className="form-input date-input"
                                >
                                    <option value="" disabled>Día</option>
                                    {days.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    required
                                    className="form-input date-input"
                                >
                                    <option value="" disabled>Mes</option>
                                    {months.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    required
                                    className="form-input date-input"
                                >
                                    <option value="" disabled>Año</option>
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-input"
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div className="register-buttons-row">
                            <button
                                type="button"
                                onClick={() => navigate('/result')}
                                className="btn-back-register"
                            >
                                <ArrowLeft size={18} /> Regresar
                            </button>
                            <button
                                type="submit"
                                className="btn-submit"
                            >
                                {loading ? 'Cargando...' : 'Ver'} <Eye size={18} />
                            </button>
                        </div>
                    </form>
                </div>
                <div className="register-footer">
                    <img
                        src="/logo-azul.png"
                        alt="Logo Auténticos"
                        className="register-footer-logo"
                    />
                </div>
            </div>
        </div>
    );
};

export default Register;
