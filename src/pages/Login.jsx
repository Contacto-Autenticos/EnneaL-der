
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Check if user has a profile, if not redirect to register (optional, but good practice)
            // For now, assume if they log in they might want to see results or retake test
            // Redirect to home or result? Let's go to result to check previous results if we implemented that,
            // or maybe straight to test? User request says "ingresar y realizar el test".
            navigate('/test');
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            backgroundColor: 'var(--color-bg)'
        }}>
            <div className="container" style={{ maxWidth: '400px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img
                        src="/gold-logo.png"
                        alt="Logo Eneagrama"
                        style={{ height: '80px', marginBottom: '1rem' }}
                    />
                    <h2 style={{ color: 'var(--color-primary)' }}>Iniciar Sesión</h2>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: '#666' }}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            marginTop: '10px',
                            justifyContent: 'center',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Cargando...' : 'Ingresar'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
                    ¿No tienes cuenta? <span onClick={() => navigate('/register')} style={{ color: 'var(--color-secondary)', cursor: 'pointer', fontWeight: 'bold' }}>Regístrate aquí</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
