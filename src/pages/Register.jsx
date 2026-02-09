import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';


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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name && day && month && email && year) {
            setLoading(true);

            // Construct date for storage (ISO format for DB is best, but we text for now based on strings)
            // Let's try to format as YYYY-MM-DD for the date column
            const monthIndex = months.indexOf(month) + 1;
            const formattedDate = `${year}-${monthIndex.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

            try {
                // Insert into Supabase
                const { data, error } = await supabase
                    .from('users')
                    .insert([
                        {
                            name,
                            email,
                            birth_date: formattedDate,
                            // whatsapp: '', // Add if field exists in form later
                        }
                    ])
                    .select(); // Return the inserted row to get the ID

                if (error) {
                    console.error('Error registering user:', error);
                    alert('Hubo un error al registrar. Por favor intenta nuevamente.');
                    setLoading(false);
                    return;
                }

                if (data && data.length > 0) {
                    const newUser = data[0];
                    // Pass to parent/app which saves to localStorage
                    onRegister(newUser);
                    setLoading(false);
                    navigate('/test');
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                setLoading(false);
                alert('Ocurrió un error inesperado.');
            }
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
