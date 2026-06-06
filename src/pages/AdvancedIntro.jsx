import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { supabase } from '../supabaseClient';
import './AdvancedIntro.css';

const AdvancedIntro = ({ onRegister, user: existingUser, targetRoute = '/advanced-test', showOrganization = false, requireAccessCode = false, initialEnneatype }) => {
    const navigate = useNavigate();
    const [name, setName] = useState(existingUser?.name || '');
    const [organization, setOrganization] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [email, setEmail] = useState(existingUser?.email || '');
    const [loading, setLoading] = useState(false);
    const [codeError, setCodeError] = useState(null);

    // Date helpers
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Read code from URL
        const codeFromUrl = searchParams.get('code');
        if (codeFromUrl) {
            setAccessCode(codeFromUrl);
        }

        if (existingUser?.birth_date) {
            const [y, m, d] = existingUser.birth_date.split('-');
            setYear(parseInt(y).toString());
            setMonth(months[parseInt(m) - 1]);
            setDay(parseInt(d).toString());
        }
    }, [existingUser, searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setCodeError(null);

        if (requireAccessCode && !accessCode.trim()) {
            setCodeError({ type: 'invalid', message: 'Por favor, ingresa un código de acceso.' });
            setLoading(false);
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Validate access code if provided (forced or optional)
        if (requireAccessCode || accessCode.trim()) {
            try {
                const cleanCode = accessCode.trim().toUpperCase();
                const { data: codeData, error: fetchError } = await supabase
                    .from('access_codes')
                    .select('*')
                    .eq('code', cleanCode)
                    .single();

                if (fetchError || !codeData) {
                    setCodeError({ type: 'invalid', message: 'El código de acceso ingresado no existe o es inválido.' });
                    setLoading(false);
                    return;
                }

                const now = new Date();

                // Validación de expiración
                if (codeData.expires_at && new Date(codeData.expires_at) < now) {
                    setCodeError({ type: 'invalid', message: 'El código de acceso ha expirado.' });
                    setLoading(false);
                    return;
                }

                // Validación de uso (solo para códigos de un solo uso)
                if (!codeData.is_multi_use && codeData.is_used) {
                    setCodeError({
                        type: 'used',
                        message: 'Este código de acceso ya fue utilizado. Puedes adquirir un nuevo acceso aquí.'
                    });
                    setLoading(false);
                    return;
                }

                // Registrar uso (para ambos tipos)
                console.log('Registrando uso del código:', { cleanCode, email: normalizedEmail });
                const { error: updateError } = await supabase
                    .from('access_codes')
                    .update({
                        is_used: true,
                        used_by: normalizedEmail,
                        used_at: now.toISOString(),
                        used_in_program: 'Genuinos'
                    })
                    .eq('code', cleanCode);
                
                if (!updateError) {
                    console.log('Uso registrado exitosamente en Supabase');
                    // NUEVO: Registrar en el historial de usos
                    await supabase.from('access_code_usages').insert([{
                        code: cleanCode,
                        user_email: normalizedEmail,
                        program: 'Genuinos'
                    }]);
                } else {
                    console.error('Error al actualizar uso del código:', updateError);
                }

                if (updateError) {
                    console.error('Error updating access code:', updateError);
                    setCodeError({ type: 'invalid', message: 'Error procesando el código. Intenta nuevamente.' });
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.error('Code validation error:', err);
                setCodeError({ type: 'invalid', message: 'Ocurrió un error al validar el código.' });
                setLoading(false);
                return;
            }
        }

        const monthIndex = months.indexOf(month) + 1;
        const formattedDate = `${year}-${monthIndex.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        const userData = {
            name,
            email: normalizedEmail,
            birth_date: formattedDate,
            id: existingUser?.id || Date.now().toString(),
            organization: showOrganization ? organization : null,
            access_code: requireAccessCode ? accessCode.trim() : null
        };

        const partnerSource = localStorage.getItem('partner_source');

        try {
            // Save to Supabase
            const { error } = await supabase
                .from('user_leads')
                .insert([
                    {
                        full_name: name,
                        email: normalizedEmail,
                        birth_date: formattedDate,
                        source: partnerSource ? `alianza_${partnerSource}` : 'advanced_analysis',
                        organization: showOrganization ? organization : null,
                        enneatype: initialEnneatype
                    }
                ]);

            if (error) console.error('Error storing lead:', error);
        } catch (err) {
            console.error('Submission error:', err);
        } finally {
            onRegister(userData);
            setLoading(false);
            navigate(targetRoute);
        }
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
                        Personalicemos tu informe
                    </h1>
                    <p className="home-description">
                        Solo necesitamos algunos datos básicos antes de comenzar.
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

                            {showOrganization && (
                                <div className="form-group-adv">
                                    <label>Código organización</label>
                                    <input
                                        type="text"
                                        value={organization}
                                        onChange={(e) => setOrganization(e.target.value)}
                                        placeholder="Ingresa el código (opcional)"
                                        className="adv-input"
                                        disabled={organization === 'NO_CODE'}
                                    />
                                    <div className="no-code-checkbox-wrapper">
                                        <label className="no-code-label">
                                            <input
                                                type="checkbox"
                                                checked={organization === 'NO_CODE'}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setOrganization('NO_CODE');
                                                    } else {
                                                        setOrganization('');
                                                    }
                                                }}
                                            />
                                            No tengo código de organización
                                        </label>
                                    </div>
                                </div>
                            )}

                            {requireAccessCode && (
                                <div className="form-group-adv access-code-group">
                                    <label>Confirmar Código de Acceso *</label>
                                    <input
                                        type="text"
                                        value={accessCode}
                                        onChange={(e) => setAccessCode(e.target.value)}
                                        placeholder="Ingresa tu código de un solo uso"
                                        className={`adv-input ${codeError ? 'input-error' : ''}`}
                                        required
                                    />
                                    {codeError && (
                                        <div className={`error-message ${codeError.type}`}>
                                            <p>{codeError.message}</p>
                                            {codeError.type === 'used' && (
                                                <button
                                                    type="button"
                                                    className="btn-buy-access"
                                                    onClick={() => navigate('/eneagrama-payment')}
                                                >
                                                    Adquirir nuevo acceso
                                                </button>
                                            )}
                                            <a 
                                                href="https://wa.me/573164287586?text=Hola,%20tengo%20un%20problema%20con%20mi%20c%C3%B3digo%20de%20acceso%20en%20la%20plataforma%20y%20necesito%20ayuda." 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ display: 'inline-block', marginTop: '15px', padding: '10px 20px', background: '#25D366', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none', textAlign: 'center' }}
                                            >
                                                Contactar Soporte
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            <p className="privacy-note">
                                🔒 Tus datos están protegidos y no serán compartidos con terceros.
                            </p>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-start-adv"
                            >
                                {loading ? 'Procesando...' : 'Continuar con mi análisis'} <ArrowRight size={19} />
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdvancedIntro;
