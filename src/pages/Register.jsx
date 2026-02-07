import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Register = ({ onRegister }) => {
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && birthDate && email) {
            setLoading(true);

            // Validate age? Optional. For now just proceed.
            // No backend check needed.

            // Create user object
            const newUser = {
                name,
                birth_date: birthDate,
                email,
                id: Date.now().toString() // Generate a simple ID
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
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                required
                                className="form-input"
                            />
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
