import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
    Download, RefreshCw, ChevronRight, 
    Award, AlertTriangle, Lightbulb, ClipboardList,
    Quote, User, Target, MessageSquare, Users, Star,
    MousePointerClick, Mail, Calendar, Send, CheckCircle2,
    Loader2, Sparkles, Phone
} from 'lucide-react';

const getDimIcon = (id) => {
    switch(id) {
        case 'personal': return <User size={14} />;
        case 'estrategico': return <Target size={14} />;
        case 'relacional': return <MessageSquare size={14} />;
        case 'multiplicador': return <Users size={14} />;
        case 'trascendente': return <Star size={14} />;
        default: return null;
    }
};
import { calculateLiderazgoResults, getRecommendations } from '../utils/liderazgoUtils';
import LiderazgoSpeedometer from '../components/LiderazgoSpeedometer';
import LiderazgoRadarChart from '../components/LiderazgoRadarChart';
import LiderazgoReportTemplate from '../components/LiderazgoReportTemplate';
import { supabase } from '../supabaseClient';
import './LiderazgoResults.css';

const LiderazgoResults = () => {
    const navigate = useNavigate();
    
    const results = useMemo(() => {
        const saved = localStorage.getItem('liderazgo_results');
        if (saved) {
            try {
                return calculateLiderazgoResults(JSON.parse(saved));
            } catch (e) {
                console.error("Error parsing results", e);
                return null;
            }
        }
        return null;
    }, []);

    if (!results) {
        return (
            <div className="lr-error-container">
                <div className="lr-error-card">
                    <h2>No se encontraron resultados</h2>
                    <p>Por favor, completa el test para ver tu reporte detallado.</p>
                    <button className="lr-btn-primary" onClick={() => navigate('/liderazgo-test')}>
                        Ir al Test <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    const recommendations = getRecommendations(results);
    const overallValue = Math.round((results.totalScore / 275) * 5);

    // Lead Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // PDF Generation State & Ref
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const reportTemplateRef = useRef(null);

    // Date Select Options
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
    const months = [
        { value: '01', label: 'Enero' },
        { value: '02', label: 'Febrero' },
        { value: '03', label: 'Marzo' },
        { value: '04', label: 'Abril' },
        { value: '05', label: 'Mayo' },
        { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' },
        { value: '08', label: 'Agosto' },
        { value: '09', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' }
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 90 }, (_, i) => String(currentYear - 14 - i));

    // Pre-populate or check registered status
    useEffect(() => {
        const registered = localStorage.getItem('liderazgo_lead_registered');
        if (registered) {
            setIsRegistered(true);
        }

        const savedUserStr = localStorage.getItem('tempAutodiagUser') || localStorage.getItem('liderazgo_user_data');
        if (savedUserStr) {
            try {
                const parsed = JSON.parse(savedUserStr);
                if (parsed.name || parsed.full_name) setFullName(parsed.name || parsed.full_name);
                if (parsed.email) setEmail(parsed.email);
                if (parsed.phone) setPhone(parsed.phone);
                if (parsed.birth_date) {
                    const [y, m, d] = parsed.birth_date.split('-');
                    if (y) setYear(y);
                    if (m) setMonth(m.padStart(2, '0'));
                    if (d) setDay(d.padStart(2, '0'));
                }
            } catch (e) {
                // ignore
            }
        }
    }, []);

    // Auto-save anonymous result if not already registered or saved in this session
    useEffect(() => {
        const autoSaveAnonymous = async () => {
            if (!results) return;

            const alreadySavedId = sessionStorage.getItem('liderazgo_saved_id');
            const alreadyRegistered = localStorage.getItem('liderazgo_lead_registered');
            if (alreadySavedId || alreadyRegistered) return;

            if (sessionStorage.getItem('liderazgo_saving_lock')) return;
            sessionStorage.setItem('liderazgo_saving_lock', 'true');

            try {
                const rawAnswers = localStorage.getItem('liderazgo_results');
                let parsedAnswers = null;
                if (rawAnswers) {
                    try { parsedAnswers = JSON.parse(rawAnswers); } catch (e) {}
                }

                const { data, error } = await supabase.from('liderazgo_results').insert([{
                    is_anonymous: true,
                    full_name: null,
                    email: null,
                    phone: null,
                    birth_date: null,
                    total_score: results?.totalScore || 0,
                    level_label: results?.level?.label || 'General',
                    score_personal: results?.dimensions?.personal || 0,
                    score_estrategico: results?.dimensions?.estrategico || 0,
                    score_relacional: results?.dimensions?.relacional || 0,
                    score_multiplicador: results?.dimensions?.multiplicador || 0,
                    score_trascendente: results?.dimensions?.trascendente || 0,
                    user_answers: parsedAnswers
                }]).select();

                if (!error && data && data[0]) {
                    sessionStorage.setItem('liderazgo_saved_id', data[0].id);
                }
            } catch (err) {
                console.error('Error auto-guardando resultado de liderazgo anónimo:', err);
            } finally {
                sessionStorage.removeItem('liderazgo_saving_lock');
            }
        };

        autoSaveAnonymous();
    }, [results]);

    const handleLeadSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setSubmitError(null);

        if (!fullName.trim()) {
            setSubmitError('Por favor ingresa tu nombre y apellido.');
            return;
        }

        if (!email.trim() || !email.includes('@')) {
            setSubmitError('Por favor ingresa un correo electrónico válido.');
            return;
        }

        if (!phone.trim()) {
            setSubmitError('Por favor ingresa tu número de teléfono.');
            return;
        }

        if (!day || !month || !year) {
            setSubmitError('Por favor completa tu fecha de nacimiento (día, mes y año).');
            return;
        }

        setIsSubmitting(true);

        const birthDate = `${year}-${month}-${day}`;
        const cleanEmail = email.trim().toLowerCase();
        const cleanName = fullName.trim();
        const cleanPhone = phone.trim();

        try {
            const rawAnswers = localStorage.getItem('liderazgo_results');
            let parsedAnswers = null;
            if (rawAnswers) {
                try { parsedAnswers = JSON.parse(rawAnswers); } catch (e) {}
            }

            const existingId = sessionStorage.getItem('liderazgo_saved_id');
            if (existingId) {
                // Actualizar registro existente pasando de anónimo a registrado
                await supabase.from('liderazgo_results').update({
                    is_anonymous: false,
                    full_name: cleanName,
                    email: cleanEmail,
                    phone: cleanPhone,
                    birth_date: birthDate
                }).eq('id', existingId);
            } else {
                // Crear nuevo registro si no existía el id en sesión
                const { data: newRow } = await supabase.from('liderazgo_results').insert([{
                    is_anonymous: false,
                    full_name: cleanName,
                    email: cleanEmail,
                    phone: cleanPhone,
                    birth_date: birthDate,
                    total_score: results?.totalScore || 0,
                    level_label: results?.level?.label || 'General',
                    score_personal: results?.dimensions?.personal || 0,
                    score_estrategico: results?.dimensions?.estrategico || 0,
                    score_relacional: results?.dimensions?.relacional || 0,
                    score_multiplicador: results?.dimensions?.multiplicador || 0,
                    score_trascendente: results?.dimensions?.trascendente || 0,
                    user_answers: parsedAnswers
                }]).select();

                if (newRow && newRow[0]) {
                    sessionStorage.setItem('liderazgo_saved_id', newRow[0].id);
                }
            }

            // Guardar también en Supabase (user_leads)
            await supabase.from('user_leads').insert([{
                full_name: cleanName,
                email: cleanEmail,
                phone: cleanPhone,
                birth_date: birthDate,
                source: 'liderazgo_results'
            }]);

            // Sincronización opcional con Odoo CRM
            try {
                if (results) {
                    await supabase.functions.invoke('odoo-integration', {
                        body: {
                            email: cleanEmail,
                            name: cleanName,
                            phone: cleanPhone,
                            test_type: 'Test de Liderazgo',
                            results_summary: `Nivel: ${results.level?.label || 'General'} (${results.totalScore} pts). Fortaleza: ${results.topStrengths?.[0]?.name || 'N/A'}. Área crítica: ${results.topRisks?.[0]?.name || 'N/A'}`
                        }
                    });
                }
            } catch (odooErr) {
                console.log('Odoo sync notice:', odooErr);
            }

            // Guardar en LocalStorage
            localStorage.setItem('liderazgo_lead_registered', 'true');
            localStorage.setItem('liderazgo_user_data', JSON.stringify({
                full_name: cleanName,
                email: cleanEmail,
                phone: cleanPhone,
                birth_date: birthDate
            }));

            setIsRegistered(true);
        } catch (err) {
            setSubmitError(err.message || 'Ocurrió un error al guardar tus datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownloadPdf = async () => {
        const template = reportTemplateRef.current;
        if (!template || isDownloadingPdf) return;

        try {
            setIsDownloadingPdf(true);

            // Mostrar temporalmente el template fuera de vista
            template.style.left = '0';
            template.style.opacity = '1';

            // Pausa breve para asegurar que el navegador aplique fuentes y estilos
            await new Promise(resolve => setTimeout(resolve, 300));

            const originalScrollY = window.scrollY;
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = 210;
            const pdfHeight = 297;

            const pages = template.querySelectorAll('.pdf-page');

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const canvas = await html2canvas(page, {
                    backgroundColor: '#ffffff',
                    scale: 2.5,
                    useCORS: true,
                    width: 800,
                    height: 1131,
                    logging: false
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            }

            template.style.left = '-9999px';
            template.style.opacity = '0';
            window.scrollTo({ top: originalScrollY, left: 0, behavior: 'instant' });

            const safeName = (fullName || 'Reporte').trim().replace(/\s+/g, '_');
            pdf.save(`Diagnostico_Liderazgo_${safeName}.pdf`);
        } catch (error) {
            console.error('Error generating Liderazgo PDF:', error);
            alert('Hubo un error al generar el reporte PDF. Por favor intenta de nuevo.');
        } finally {
            setIsDownloadingPdf(false);
            if (reportTemplateRef.current) {
                reportTemplateRef.current.style.left = '-9999px';
                reportTemplateRef.current.style.opacity = '0';
            }
        }
    };

    return (
        <div className="liderazgo-results-page">
            <header className="lr-header">
                <div className="lr-header-content">
                    <img src="/Logo-Blanco.png" alt="Auténticos" className="lr-header-logo" />
                    <h1>Tu Reporte de Liderazgo</h1>
                    <p className="lr-subtitle">Análisis de competencias para el Liderazgo Extraordinario</p>
                </div>
            </header>

            <main className="lr-main">
                {/* 1. Perfil General */}
                <section className="lr-section lr-profile-hero">
                    <div className="lr-score-card">
                        <div className="lr-speed-container">
                            <LiderazgoSpeedometer value={overallValue} showLabels={false} showInfo={false} />
                            <div className="lr-total-pts">
                                <span className="pts-val">{results.totalScore}</span>
                                <span className="pts-label">PUNTOS TOTALES</span>
                            </div>
                        </div>
                        <div className="lr-level-info">
                            <span className="lr-badge">Nivel General</span>
                            <h2 className="lr-level-title" style={{ color: results.level.color }}>{results.level.label}</h2>
                            <p className="lr-level-desc">{results.level.desc}</p>
                        </div>
                    </div>
                </section>

                {/* 2. Radar Chart */}
                <section className="lr-section">
                    <h3 className="lr-section-title">Análisis por Dimensión</h3>
                    <LiderazgoRadarChart dimensions={results.allDimensions} />
                    <div className="lr-chart-hint">
                        <MousePointerClick size={16} />
                        <span>Haz clic o pasa el cursor sobre las áreas del gráfico para ver detalles específicos.</span>
                    </div>
                </section>

                <div className="lr-grid-2col">
                    {/* 3. Fortalezas */}
                    <section className="lr-section lr-card-dark">
                        <div className="lr-card-header">
                            <Award className="lr-icon-gold" />
                            <h3>Top 3 Fortalezas</h3>
                        </div>
                        <ul className="lr-list">
                            {results.topStrengths.map(s => (
                                <li key={s.id} className="lr-list-item-with-icon">
                                    {getDimIcon(s.id)}
                                    <span><strong>{s.name}:</strong> {s.subtext}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 4. Riesgos */}
                    <section className="lr-section lr-card-risk">
                        <div className="lr-card-header">
                            <AlertTriangle className="lr-icon-risk" />
                            <h3>Áreas Críticas</h3>
                        </div>
                        <ul className="lr-list">
                            {results.topRisks.map(r => (
                                <li key={r.id} className="lr-list-item-with-icon">
                                    {getDimIcon(r.id)}
                                    <span><strong>{r.name}:</strong> {r.interpretation.label}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* 5. Recomendaciones */}
                <section className="lr-section lr-recs-section">
                    <div className="lr-card-header">
                        <Lightbulb className="lr-icon-blue" />
                        <h3>Recomendaciones Prácticas</h3>
                    </div>
                    <div className="lr-recs-grid">
                        {recommendations.map((rec, i) => (
                            <div key={i} className="lr-rec-item">
                                <span className="lr-rec-num">{i + 1}</span>
                                <p>{rec}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. Plan de Desarrollo */}
                <section className="lr-section lr-plan-section">
                    <div className="lr-card-header">
                        <ClipboardList className="lr-icon-teal" />
                        <h3>Plan de Crecimiento Personalizado</h3>
                    </div>
                    <div className="lr-plan-content">
                        <p>Basado en tu perfil de <strong>{results.level.label}</strong>, tu enfoque para los próximos 90 días debe ser:</p>
                        <div className="lr-plan-steps">
                            <div className="lr-step">
                                <h4>Fase 1: Estabilización (Día 1-30)</h4>
                                <p>Enfocarte en la dimensión de <strong>{results.topRisks[0]?.name}</strong> para reducir inconsistencias.</p>
                            </div>
                            <div className="lr-step">
                                <h4>Fase 2: Expansión (Día 31-60)</h4>
                                <p>Potenciar tu fortaleza en <strong>{results.topStrengths[0]?.name}</strong> para generar mayor impacto en tu entorno.</p>
                            </div>
                            <div className="lr-step">
                                <h4>Fase 3: Trascendencia (Día 61-90)</h4>
                                <p>Integrar hábitos de liderazgo consciente para consolidar un legado sostenible.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7. Registro de Datos / Conectar con Auténticos */}
                <section className="lr-section lr-lead-capture-section">
                    <div className="lr-lead-header">
                        <div className="lr-lead-badge">
                            <Sparkles size={14} /> Conecta con Nosotros
                        </div>
                        <h3 className="lr-lead-title">Registra tus datos para conectar con el equipo de Auténticos</h3>
                        <p className="lr-lead-subtitle">
                            Déjanos tus datos para recibir acompañamiento personalizado, profundizar en tu perfil de liderazgo y explorar cómo potenciar tus resultados.
                        </p>
                    </div>

                    {isRegistered ? (
                        <div className="lr-lead-success-card">
                            <CheckCircle2 size={46} className="lr-lead-success-icon" />
                            <h4>¡Tus datos han sido registrados con éxito!</h4>
                            <p>
                                Muchas gracias{fullName ? `, ${fullName}` : ''}. Nuestro equipo revisará tu diagnóstico y te contactará pronto al correo <strong>{email}</strong>{phone ? ` o al número <strong>${phone}</strong>` : ''}.
                            </p>
                            <button 
                                type="button" 
                                className="lr-lead-btn-edit"
                                onClick={() => setIsRegistered(false)}
                            >
                                Modificar mis datos
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleLeadSubmit} className="lr-lead-form">
                            {submitError && (
                                <div className="lr-lead-error-box">
                                    <AlertTriangle size={18} />
                                    <span>{submitError}</span>
                                </div>
                            )}

                            <div className="lr-lead-form-grid">
                                {/* Nombre y apellido */}
                                <div className="lr-lead-field">
                                    <label htmlFor="lead-name">
                                        <User size={15} /> Nombre y apellido
                                    </label>
                                    <input
                                        id="lead-name"
                                        type="text"
                                        placeholder="Ej. Carlos Mendoza"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="lr-lead-input"
                                    />
                                </div>

                                {/* Correo electrónico */}
                                <div className="lr-lead-field">
                                    <label htmlFor="lead-email">
                                        <Mail size={15} /> Correo electrónico
                                    </label>
                                    <input
                                        id="lead-email"
                                        type="email"
                                        placeholder="tu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="lr-lead-input"
                                    />
                                </div>

                                {/* Número de teléfono */}
                                <div className="lr-lead-field">
                                    <label htmlFor="lead-phone">
                                        <Phone size={15} /> Número de teléfono
                                    </label>
                                    <input
                                        id="lead-phone"
                                        type="tel"
                                        placeholder="Ej. +57 300 123 4567"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        className="lr-lead-input"
                                    />
                                </div>

                                {/* Fecha de nacimiento */}
                                <div className="lr-lead-field">
                                    <label>
                                        <Calendar size={15} /> Fecha de nacimiento
                                    </label>
                                    <div className="lr-lead-date-grid">
                                        <select
                                            value={day}
                                            onChange={(e) => setDay(e.target.value)}
                                            required
                                            className="lr-lead-select"
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
                                            className="lr-lead-select"
                                        >
                                            <option value="" disabled>Mes</option>
                                            {months.map(m => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                            required
                                            className="lr-lead-select"
                                        >
                                            <option value="" disabled>Año</option>
                                            {years.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="lr-lead-btn-wrapper">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="lr-lead-submit-btn"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Registrando...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} /> Enviar mis datos
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                {/* Closing Quote */}
                <section className="lr-quote-section">
                    <Quote className="lr-quote-icon" />
                    <p className="lr-quote-text">
                        “El verdadero liderazgo no se demuestra solo en la capacidad de obtener resultados, sino en quién te conviertes, cómo impactas a otros y qué legado construyes mientras los alcanzas.”
                    </p>
                </section>
            </main>

            <footer className="lr-footer">
                <button className="lr-btn-secondary" onClick={() => navigate('/liderazgo-test')}>
                    <RefreshCw size={18} /> Repetir
                </button>
                <button 
                    className="lr-btn-primary" 
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                >
                    {isDownloadingPdf ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Generando PDF...
                        </>
                    ) : (
                        <>
                            <Download size={18} /> Descargar Reporte PDF
                        </>
                    )}
                </button>
            </footer>

            {/* Template invisible para la generación del PDF ejecutivo */}
            <LiderazgoReportTemplate 
                ref={reportTemplateRef}
                results={results}
                recommendations={recommendations}
                user={{ name: fullName, email: email }}
            />
        </div>
    );
};

export default LiderazgoResults;
