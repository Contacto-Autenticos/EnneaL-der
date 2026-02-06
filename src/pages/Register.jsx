import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Register = ({ onRegister }) => {
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name && birthDate && email) {
            setLoading(true);
            try {
                // Use email as default password for "simple access"
                // This is not secure but fulfills the request for simplicity + functional auth
                const defaultPassword = email;

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password: defaultPassword,
                });

                if (error) {
                    // Check if user already exists
                    if (error.message.includes('already registered') || error.message.includes('User already exists')) {
                        // Attempt to sign in instead
                        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                            email,
                            password: defaultPassword,
                        });

                        if (signInError) {
                            // If sign in fails (wrong password or other issue), show error
                            // This might happen if they registered previously with a different password
                            if (signInError.message.includes("Invalid login credentials")) {
                                alert("Este correo ya está registrado con una contraseña diferente. Por favor, ve a Login.");
                                navigate('/login');
                                return;
                            }
                            throw signInError;
                        };

                        if (signInData?.user) {
                            // Check if profile exists, if not create it (rare edge case)
                            const { data: profile } = await supabase.from('profiles').select('id').eq('id', signInData.user.id).single();

                            if (!profile) {
                                await supabase.from('profiles').insert([{
                                    id: signInData.user.id,
                                    name,
                                    birth_date: birthDate,
                                }]);
                            }

                            onRegister({ name, birthDate, email, id: signInData.user.id });
                            navigate('/test');
                            return;
                        }

                    } else if (error.message.includes('rate limit')) {
                        // Handle rate limit error specifically
                        alert("Has intentado registrarte demasiadas veces en poco tiempo. \n\nSi ya tienes cuenta, por favor intenta Iniciar Sesión con tu contraseña anterior.\n\nSi no, espera unos minutos antes de intentar de nuevo.");
                        return;
                    } else {
                        throw error;
                    }
                }

                if (data?.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: data.user.id,
                                name,
                                birth_date: birthDate,
                            }
                        ]);

                    if (profileError) throw profileError;

                    // Update parent state if needed, or rely on auth listener (App.jsx)
                    // onRegister is passed from App.jsx but it just sets local user state.
                    // We can call it for immediate feedback.
                    onRegister({ name, birthDate, email, id: data.user.id });

                    navigate('/test');
                }
            } catch (error) {
                console.error("Error registering:", error.message);
                alert("Error al registrarse: " + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
            {/* Header Banner - Full Width */}
            <div style={{ width: '100%', maxHeight: '180px', overflow: 'hidden' }}>
                <img
                    src="/Eneagrama banner registro.png"
                    alt="Eneagrama Banner Registro"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                    }}
                />
            </div>

            <div className="container" style={{ justifyContent: 'center', flex: 1, padding: '20px' }}>
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
