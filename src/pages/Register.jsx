import React, { useState } from 'react';



const Register = ({ onRegister }) => {
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

            // Pass to parent/app which saves to localStorage
            onRegister(newUser);
            setLoading(false);
            // Redirect to external URL for "Deepen more"
            window.location.href = 'https://www.autenticos.co/9-tipos-de-liderazgo';
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
                    <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
                        Quieres conocer más de tu eneatipo, déjanos tus datos y te compartimos la información de forma gratuita
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
                            {loading ? 'Cargando...' : 'Enviar'}
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
