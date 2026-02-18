import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { supabase } from '../supabaseClient';
import './AdvancedIntro.css';

const AdvancedIntro = ({ onRegister, user: existingUser, targetRoute = '/advanced-test', showOrganization = false }) => {
    const navigate = useNavigate();
    const [name, setName] = useState(existingUser?.name || '');
    const [organization, setOrganization] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [email, setEmail] = useState(existingUser?.email || '');
    const [loading, setLoading] = useState(false);

    // Date helpers
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    useEffect(() => {
        if (existingUser?.birth_date) {
            const [y, m, d] = existingUser.birth_date.split('-');
            setYear(parseInt(y).toString());
            setMonth(months[parseInt(m) - 1]);
            setDay(parseInt(d).toString());
        }
    }, [existingUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const monthIndex = months.indexOf(month) + 1;
        const formattedDate = `${year}-${monthIndex.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        const normalizedEmail = email.trim().toLowerCase();

        const userData = {
            name,
            email: normalizedEmail,
            birth_date: formattedDate,
            id: existingUser?.id || Date.now().toString()
        };

        try {
            // Save to Supabase
            const { error } = await supabase
                .from('user_leads')
                .insert([
                    {
                        full_name: name,
                        email: normalizedEmail,
                        birth_date: formattedDate,
                        source: 'advanced_analysis',
                        organization: showOrganization ? organization : null
                    }
                ]);

            if (error) console.error('Error storing lead:', error);
        } catch (err) {
            console.error('Submission error:', err);
        } finally {
            onRegister(userData);
            setLoading(false);
            navigate(targetRoute);
        }
    };

    return (
        <div className="container home-container advanced-intro">
            <div className="home-content-wrapper">
                <div className="home-logo-container">
                    <img
                        src="/Circulo_Eneagrama_Autenticos_02.png"
                        alt="Logo Eneagrama - Autenticos"
                        className="home-logo animate-zoom-in-slow"
                    />
                </div>

                <h1 className="home-title">
                    Perfil Auténtico de liderazgo
                </h1>
                <p className="home-description">
                    Un análisis profundo de tu motivación central <br />
                    y patrón de liderazgo.
                </p>

                <div className="advanced-form-section">
                    <p className="advanced-form-instruction">
                        Completa tus datos para generar tu informe avanzado.
                    </p>

                    <form onSubmit={handleSubmit} className="advanced-reg-form">
                        <div className="form-group-adv">
                            <label>Nombre y apellido</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Tu nombre y apellido"
                                className="adv-input"
                            />
                        </div>

                        {showOrganization && (
                            <div className="form-group-adv">
                                <label>Organización o empresa</label>
                                <input
                                    type="text"
                                    value={organization}
                                    onChange={(e) => setOrganization(e.target.value)}
                                    placeholder="Nombre de la empresa"
                                    className="adv-input"
                                />
                            </div>
                        )}

                        <div className="form-group-adv">
                            <label>Fecha de nacimiento</label>
                            <div className="date-grid-adv">
                                <select value={day} onChange={(e) => setDay(e.target.value)} required className="adv-input">
                                    <option value="" disabled>Día</option>
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <select value={month} onChange={(e) => setMonth(e.target.value)} required className="adv-input">
                                    <option value="" disabled>Mes</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <select value={year} onChange={(e) => setYear(e.target.value)} required className="adv-input">
                                    <option value="" disabled>Año</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-group-adv">
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="tu@email.com"
                                className="adv-input"
                            />
                        </div>

                        <p className="privacy-note">
                            🔒 Tus datos están protegidos y no serán compartidos con terceros.
                        </p>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-start-adv"
                        >
                            {loading ? 'Procesando...' : 'Análisis avanzado'} <ArrowRight size={19} />
                        </button>
                    </form>
                </div>
            </div>

            <div className="home-footer">
                <img
                    src="/logo-azul.png"
                    alt="Auténticos Logo Azul"
                    className="home-footer-logo"
                />
            </div>
        </div>
    );
};

export default AdvancedIntro;
