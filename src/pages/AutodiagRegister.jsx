import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Key } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './AdvancedIntro.css';

const AutodiagRegister = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [email, setEmail] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [codeError, setCodeError] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [savedCount, setSavedCount] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(84);

    // Check for saved progress on mount
    useEffect(() => {
        const isPaid = localStorage.getItem('autodiagPaid') === 'true';
        const hasUser = localStorage.getItem('tempAutodiagUser');
        const saved = localStorage.getItem('fascinantesProgress');
        
        if (isPaid && hasUser && saved) {
            try {
                const { index, answers } = JSON.parse(saved);
                if (index > 0 && answers && Object.keys(answers).length > 0) {
                    setSavedCount(Object.keys(answers).length);
                    setShowResumeModal(true);
                }
            } catch { /* ignore */ }
        }
    }, []);

    const handleResumeTest = () => {
        navigate('/dominios-test');
    };

    const handleRestartTest = () => {
        localStorage.removeItem('fascinantesProgress');
        navigate('/dominios-intro');
    };

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCodeError('');

        const monthIndex = months.indexOf(month) + 1;
        const formattedDate = `${year}-${monthIndex.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        const userData = {
            name,
            email: email.trim().toLowerCase(),
            birth_date: formattedDate
        };

        // Si hay código de acceso, validarlo primero
        if (accessCode.trim()) {
            setIsValidating(true);
            try {
                const cleanCode = accessCode.trim().toUpperCase();
                
                // Buscar el código en la BD
                const { data: codeData, error: fetchError } = await supabase
                    .from('access_codes')
                    .select('*')
                    .eq('code', cleanCode)
                    .single();

                if (fetchError || !codeData) {
                    throw new Error('El código ingresado no es válido.');
                }

                const now = new Date();

                // Validación de expiración (para ambos tipos)
                if (codeData.expires_at && new Date(codeData.expires_at) < now) {
                    throw new Error('El código ha expirado.');
                }

                // Validación de uso
                if (!codeData.is_multi_use && codeData.is_used) {
                    throw new Error('El código ya ha sido utilizado.');
                }
                
                // Actualizar registro de uso (para ambos tipos)
                console.log('Registrando uso del código (Fascinantes):', { cleanCode, email: userData.email });
                const { error: updateError } = await supabase
                    .from('access_codes')
                    .update({ 
                        is_used: true, 
                        used_by: userData.email,
                        used_at: now.toISOString(),
                        used_in_program: 'Fascinantes'
                    })
                    .eq('code', cleanCode);

                if (!updateError) {
                    console.log('Uso registrado exitosamente en Supabase (Fascinantes)');
                    // NUEVO: Registrar en el historial de usos
                    await supabase.from('access_code_usages').insert([{
                        code: cleanCode,
                        user_email: userData.email,
                        program: 'Fascinantes'
                    }]);
                } else {
                    console.error('Error al actualizar uso en Supabase:', updateError);
                }

                if (updateError) throw new Error('Error al procesar el código. Intenta de nuevo.');

                // Registrar al usuario en leads
                await supabase.from('user_leads').insert([{
                    full_name: userData.name,
                    email: userData.email,
                    birth_date: userData.birth_date,
                    source: 'fascinantes_access_code'
                }]);

                // Guardar datos y autorizar el acceso
                localStorage.setItem('tempAutodiagUser', JSON.stringify(userData));
                localStorage.setItem('autodiagPaid', 'true');
                
                navigate('/dominios-intro');
                return;

            } catch (err) {
                setCodeError(err.message);
                setIsValidating(false);
                return;
            }
        }

        // Si NO hay código, proceder al pago normalmente
        localStorage.setItem('tempAutodiagUser', JSON.stringify(userData));
        navigate('/dominios-payment');
    };

    return (
        <div className="advanced-intro-page">
            {/* Resume Progress Modal */}
            {showResumeModal && (
                <div className="resume-modal-overlay" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, padding: '20px', backdropFilter: 'blur(8px)'
                }}>
                    <div style={{
                        background: 'linear-gradient(145deg, #0a1628 0%, #0d2137 100%)',
                        border: '1px solid rgba(221, 190, 61, 0.3)',
                        borderRadius: '20px', padding: '40px 35px',
                        maxWidth: '460px', width: '100%', textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        animation: 'slideUp 0.4s ease'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⏸️</div>
                        <h2 style={{ color: '#ddbe3d', fontSize: '1.5rem', margin: '0 0 12px', fontWeight: 800 }}>¡Tienes progreso guardado!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', margin: '0 0 8px', lineHeight: 1.5 }}>
                            Respondiste <strong>{savedCount}</strong> de <strong>{totalQuestions}</strong> preguntas.
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', marginBottom: '25px' }}>¿Deseas continuar donde te quedaste?</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button onClick={handleResumeTest} style={{
                                background: 'linear-gradient(135deg, #ddbe3d 0%, #b89b2d 100%)',
                                color: '#0a1628', border: 'none', padding: '14px 28px',
                                borderRadius: '12px', fontSize: '1.05rem', fontWeight: 700,
                                cursor: 'pointer', transition: 'all 0.3s ease'
                            }}>Continuar donde me quedé</button>
                            <button onClick={handleRestartTest} style={{
                                background: 'transparent', color: 'rgba(255,255,255,0.6)',
                                border: '1px solid rgba(255,255,255,0.15)', padding: '12px 28px',
                                borderRadius: '12px', fontSize: '0.95rem', fontWeight: 500,
                                cursor: 'pointer', transition: 'all 0.3s ease'
                            }}>Empezar desde cero</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="advanced-intro">
                <div className="adv-content-wrapper">
                    <div className="home-logo-container">
                        <img
                            src="/logo-moneda.png"
                            alt="Logo Eneagrama - Autenticos"
                            className="home-logo animate-zoom-in-slow"
                        />
                    </div>

                    <h1 className="home-title" style={{ lineHeight: '1.1', textTransform: 'none' }}>
                        Autodiagnóstico<br />
                        <span style={{ fontSize: '0.85em', fontWeight: 'normal' }}>dominios fundamentales</span>
                    </h1>
                    <p className="home-description">
                        Completa los siguientes datos para crear tu reporte
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

                            <div className="form-group-adv">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Key size={16} /> Código de acceso (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                    placeholder="EJ: LIDER-XXXXXX"
                                    className={`adv-input ${codeError ? 'input-error' : ''}`}
                                    style={{ border: accessCode.trim() ? '2px solid #ddbe3d' : '' }}
                                />
                                {codeError && <p className="code-error-msg" style={{ 
                                    color: '#ff4d4d', 
                                    fontSize: '0.85rem', 
                                    marginTop: '5px',
                                    fontWeight: '500'
                                }}>{codeError}</p>}
                                {accessCode.trim() && !codeError && (
                                    <p style={{ color: '#ddbe3d', fontSize: '0.8rem', marginTop: '5px' }}>
                                        ✓ Se usará este código para saltar el pago.
                                    </p>
                                )}
                            </div>

                            <p className="privacy-note">
                                🔒 Tus datos están protegidos y no serán compartidos con terceros sin tu autorización.
                            </p>

                            <button type="submit" className="btn-start-adv" disabled={isValidating}>
                                {isValidating ? (
                                    'Validando...'
                                ) : (
                                    accessCode.trim() ? (
                                        <>Continuar <ArrowRight size={19} /></>
                                    ) : (
                                        <>Continuar <ArrowRight size={19} /></>
                                    )
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutodiagRegister;
