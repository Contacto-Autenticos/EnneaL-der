import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Register = ({ onRegister }) => {
    const [name, setName] = useState('');
    // Split date state
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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

            // Construct date string (YYYY-MM-DD)
            // Note: Month is 0-indexed in Date, but here we just store the string or index.
            // Let's store readable format or ISO. The backend/test usually just needs a value.
            // Let's us store "DD/MM/YYYY" or similar for display, or ISO for logic.
            // Using a simple string format for now as requested by user flow (just data collection).
            // Mapping month name to index for potential future logic if needed, 
            // but distinct fields are often sent as is.
            // Let's combine for the user object.
            const birthDate = `${day} de ${month} de ${year}`;

            // Create user object
            const newUser = {
                name,
                birth_date: birthDate,
                email,
                id: Date.now().toString()
            };

            onRegister(newUser);
            setLoading(false);
            navigate('/test');
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
                    <h2 className="register-title">Antes de comenzar...</h2>

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-group">
                            <label>Nombre</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="form-input"
                                placeholder="Tu nombre"
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
                            {loading ? 'Cargando...' : 'Continuar'}
                        </button>
                    </form>
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
