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
            {/* Header Banner - Full Width */}
            <div className="register-banner-container">
                <img
                    src="/Eneagrama banner registro.png"
                    alt="Eneagrama Banner Registro"
                    className="register-banner-img"
                />
            </div>

            <div className="container register-form-container">
                <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Antes de comenzar...</h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label>Nombre</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontFamily: 'var(--font-family)',
                                    fontSize: '1rem'
                                }}
                                placeholder="Tu nombre"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label>Fecha de nacimiento</label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                required
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontFamily: 'var(--font-family)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontFamily: 'var(--font-family)',
                                    fontSize: '1rem'
                                }}
                                placeholder="tu@email.com"
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                backgroundColor: 'var(--color-secondary)',
                                color: 'white',
                                padding: '15px',
                                fontSize: '1.1rem',
                                marginTop: '10px',
                                borderRadius: '8px'
                            }}
                        >
                            {loading ? 'Cargando...' : 'Continuar'}
                        </button>
                    </form>
                </div>
                <div style={{ marginTop: 'auto', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                    <img
                        src="/logo-autenticos-azul.png"
                        alt="Logo Auténticos"
                        style={{ maxHeight: '35px', opacity: 0.8 }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Register;
