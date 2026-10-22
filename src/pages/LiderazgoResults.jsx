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
import LiderazgoLeadModal, { checkIsLiderazgoRegistered } from '../components/LiderazgoLeadModal';
import { supabase } from '../supabaseClient';
import './LiderazgoResults.css';

const LiderazgoResults = () => {
    const navigate = useNavigate();
    const [showLeadModal, setShowLeadModal] = useState(!checkIsLiderazgoRegistered());
    
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

    // User Lead State (populated via LiderazgoLeadModal or localStorage)
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);

    // PDF Generation State & Ref
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const reportTemplateRef = useRef(null);

    // Pre-populate or check registered status
    useEffect(() => {
        if (!checkIsLiderazgoRegistered()) {
            setShowLeadModal(true);
        } else {
            setIsRegistered(true);
        }

        const savedUserStr = localStorage.getItem('tempAutodiagUser') || localStorage.getItem('liderazgo_user_data');
        if (savedUserStr) {
            try {
                const parsed = JSON.parse(savedUserStr);
                if (parsed.name || parsed.full_name) setFullName(parsed.name || parsed.full_name);
                if (parsed.email) setEmail(parsed.email);
                if (parsed.phone) setPhone(parsed.phone);
            } catch (e) {
                // ignore
            }
        }

        document.title = "Tu Reporte de Liderazgo | Auténticos";
    }, []);

    const handleLeadModalSuccess = async (userData) => {
        setFullName(userData.full_name);
        setEmail(userData.email);
        setPhone(userData.phone);
        setIsRegistered(true);
        setShowLeadModal(false);

        // Si ya existía un registro previo en sesión, actualizarlo con los datos del usuario
        try {
            const existingId = sessionStorage.getItem('liderazgo_saved_id');
            const savedOrg = localStorage.getItem('liderazgo_organization') || null;
            if (existingId) {
                await supabase.from('liderazgo_results').update({
                    is_anonymous: false,
                    full_name: userData.full_name,
                    email: userData.email,
                    phone: userData.phone,
                    birth_date: userData.birth_date,
                    organization: savedOrg
                }).eq('id', existingId);
            }

            // Sincronización opcional con Odoo CRM
            if (results) {
                await supabase.functions.invoke('odoo-integration', {
                    body: {
                        email: userData.email,
                        name: userData.full_name,
                        phone: userData.phone,
                        test_type: 'Test de Liderazgo',
                        results_summary: `Nivel: ${results.level?.label || 'General'} (${results.totalScore} pts). Fortaleza: ${results.topStrengths?.[0]?.name || 'N/A'}. Área crítica: ${results.topRisks?.[0]?.name || 'N/A'}`
                    }
                });
            }
        } catch (err) {
            console.error('Error actualizando resultado tras registro modal:', err);
        }
    };

    // Auto-save result (with user data if registered, or anonymous) in this session
    useEffect(() => {
        const autoSaveResult = async () => {
            if (!results) return;

            const alreadySavedId = sessionStorage.getItem('liderazgo_saved_id');
            if (alreadySavedId) return;

            if (sessionStorage.getItem('liderazgo_saving_lock')) return;
            sessionStorage.setItem('liderazgo_saving_lock', 'true');

            try {
                const rawAnswers = localStorage.getItem('liderazgo_results');
                let parsedAnswers = null;
                if (rawAnswers) {
                    try { parsedAnswers = JSON.parse(rawAnswers); } catch (e) {}
                }

                let savedUser = null;
                try {
                    const savedUserStr = localStorage.getItem('liderazgo_user_data') || localStorage.getItem('tempAutodiagUser');
                    if (savedUserStr) savedUser = JSON.parse(savedUserStr);
                } catch (e) {}

                const isRegisteredUser = Boolean(savedUser && (savedUser.full_name || savedUser.name) && savedUser.email);
                const cleanName = savedUser?.full_name || savedUser?.name || null;
                const cleanEmail = savedUser?.email || null;
                const cleanPhone = savedUser?.phone || null;
                const cleanBirthDate = savedUser?.birth_date || null;
                const savedOrg = localStorage.getItem('liderazgo_organization') || null;

                const { data, error } = await supabase.from('liderazgo_results').insert([{
                    is_anonymous: !isRegisteredUser,
                    full_name: cleanName,
                    email: cleanEmail,
                    phone: cleanPhone,
                    birth_date: cleanBirthDate,
                    organization: savedOrg,
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

                    if (isRegisteredUser) {
                        try {
                            await supabase.functions.invoke('odoo-integration', {
                                body: {
                                    email: cleanEmail,
                                    name: cleanName,
                                    phone: cleanPhone,
                                    test_type: 'Test de Liderazgo',
                                    results_summary: `Nivel: ${results.level?.label || 'General'} (${results.totalScore} pts). Fortaleza: ${results.topStrengths?.[0]?.name || 'N/A'}. Área crítica: ${results.topRisks?.[0]?.name || 'N/A'}`
                                }
                            });
                        } catch (odooErr) {
                            console.log('Odoo sync notice:', odooErr);
                        }
                    }
                }
            } catch (err) {
                console.error('Error guardando resultado de liderazgo:', err);
            } finally {
                sessionStorage.removeItem('liderazgo_saving_lock');
            }
        };

        autoSaveResult();
    }, [results]);

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
                    <p className="lr-subtitle">Análisis de competencias para el Liderazgo</p>
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

                {/* 6. Plan de Acción */}
                <section className="lr-section lr-plan-section">
                    <div className="lr-card-header">
                        <ClipboardList className="lr-icon-teal" />
                        <h3>Plan de Acción</h3>
                    </div>
                    <div className="lr-plan-content">
                        <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#334155', margin: 0 }}>
                            Los resultados aquí obtenidos serán utilizados para el diseño de nuestros entrenamientos. Si desea más información escríbenos a{' '}
                            <a 
                                href="mailto:contacto@autenticos.co" 
                                style={{ color: '#0d9488', fontWeight: 600, textDecoration: 'underline' }}
                            >
                                contacto@autenticos.co
                            </a>
                        </p>
                    </div>
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

            {/* Modal de Registro Obligatorio si el usuario llega directo a resultados sin registrarse */}
            <LiderazgoLeadModal 
                isOpen={showLeadModal} 
                onSuccess={handleLeadModalSuccess} 
            />
        </div>
    );
};

export default LiderazgoResults;
