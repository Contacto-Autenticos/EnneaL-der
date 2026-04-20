import React, { useState } from 'react';
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
                if (codeData.is_multi_use) {
                    // Es un código de evento (multiuso) -> Pasa directo
                    console.log('Código de evento válido detectado');
                } else {
                    // Es un código estándar (un sólo uso)
                    if (codeData.is_used) {
                        throw new Error('El código ya ha sido utilizado.');
                    }
                    
                    // Marcar como usado
                    const { error: updateError } = await supabase
                        .from('access_codes')
                        .update({ 
                            is_used: true, 
                            used_by: userData.email,
                            used_at: now.toISOString(),
                            used_in_program: 'Fascinantes'
                        })
                        .eq('code', cleanCode);

                    if (updateError) throw new Error('Error al procesar el código. Intenta de nuevo.');
                }

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
                
                navigate('/autodiag-intro');
                return;

            } catch (err) {
                setCodeError(err.message);
                setIsValidating(false);
                return;
            }
        }

        // Si NO hay código, proceder al pago normalmente
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
                                🔒 Tus datos están protegidos y no serán compartidos con terceros.
                            </p>

                            <button type="submit" className="btn-start-adv" disabled={isValidating}>
                                {isValidating ? (
                                    'Validando...'
                                ) : (
                                    accessCode.trim() ? (
                                        <>Comenzar autodiagnóstico <ArrowRight size={19} /></>
                                    ) : (
                                        <>Continuar al pago <ArrowRight size={19} /></>
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
