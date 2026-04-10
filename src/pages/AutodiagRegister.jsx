import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './AdvancedIntro.css';

const AutodiagRegister = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [email, setEmail] = useState('');

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const monthIndex = months.indexOf(month) + 1;
        const formattedDate = `${year}-${monthIndex.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        const userData = {
            name,
            email: email.trim().toLowerCase(),
            birth_date: formattedDate
        };

        // Guardamos temporalmente en localstorage para procesarlo despues del pago
        localStorage.setItem('tempAutodiagUser', JSON.stringify(userData));
        
        navigate('/autodiag-payment');
    };

    return (
        <div className="advanced-intro-page">
            <div className="advanced-intro">
                <div className="adv-content-wrapper">
                    <div className="home-logo-container">
                        <img
                            src="/logo-moneda.png"
                            alt="Logo Eneagrama - Autenticos"
                            className="home-logo animate-zoom-in-slow"
                        />
                    </div>

                    <h1 className="home-title">
                        Registro de Autodiagnóstico
                    </h1>
                    <p className="home-description">
                        Por favor completa estos datos para generar tu perfil antes de continuar.
                    </p>

                    <div className="advanced-form-section">
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

                            <button type="submit" className="btn-start-adv">
                                Continuar al pago <ArrowRight size={19} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutodiagRegister;
