import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import emailjs from '@emailjs/browser';



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
                            ? `https://www.autenticos.co/eneagrama-eneatipo-${result.enneatype}`
                            : 'https://www.autenticos.co/9-tipos-de-liderazgo';

                        try {
                            /* 
                                REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL EMAILJS CREDENTIALS:
                                1. Service ID: Create a service in EmailJS (select Gmail)
                                2. Template ID: Create an email template
                                3. Public Key: Found in your Account -> General
                            */
                            await emailjs.send(
                                'service_29pk8s1',
                                'template_6emj63o',
                                {
                                    to_name: name,
                                    to_email: email,
                                    result_link: resultLink
                                },
                                'jvBHZwalOIEABW7qV'
                            );
                            console.log('Email sent successfully');
                        } catch (emailError) {
                            console.error('Failed to send email:', emailError);
                            // We don't block the user flow if email fails, just log it
                        }
                    }
                } catch (err) {
                    console.error('Unexpected error storing lead:', err);
                }
            };

            // Execute save
            saveToSupabase().then((success) => {
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
                            src="/Moneda-autenticos.png"
                            alt="Logo Auténticos"
                            className="register-logo-img animate-fade-in"
                        />
                    </div>
                    <p style={{ textAlign: 'center', marginBottom: '25px', color: '#111', fontWeight: '600', fontSize: '1.1rem', lineHeight: '1.4' }}>
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

                        <button
                            type="submit"
                            className="btn-submit"
                        >
                            {loading ? 'Cargando...' : 'Ver'}
                        </button>
                    </form>

                    <button
                        onClick={() => navigate('/result')}
                        className="btn-back-register"
                    >
                        <ArrowLeft size={18} /> Regresar
                    </button>
                </div>
                <div className="register-footer">
                    <img
                        src="/Auténticos - Logo Azul-OP2.png"
                        alt="Logo Auténticos"
                        className="register-footer-logo"
                    />
                </div>
            </div>
        </div>
    );
};

export default Register;
