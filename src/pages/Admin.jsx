import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { executiveKitData } from '../data/executiveKitInfo';
import { RefreshCw, Plus, Key, ChevronDown, ChevronUp, Download, CheckCircle2, LogOut, Link, Copy, ExternalLink, BarChart2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ExecutiveKitTemplate from '../components/ExecutiveKitTemplate';
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import './Admin.css';

const Admin = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [loginError, setLoginError] = useState('');

    // Dashboard State
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [expandedInitialGroup, setExpandedInitialGroup] = useState(null);
    const [selectedType, setSelectedType] = useState('1');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [pdfSuccess, setPdfSuccess] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    // Questions State
    const [adminQuestions, setAdminQuestions] = useState([]);
    const [adminAdvancedQuestions, setAdminAdvancedQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [savingId, setSavingId] = useState(null);

    // Responses State
    const [testResponses, setTestResponses] = useState([]);
    const [initialResponses, setInitialResponses] = useState([]);
    const [loadingResponses, setLoadingResponses] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState(null);

    // Response Filters
    const [filterName, setFilterName] = useState('');
    const [filterOrg, setFilterOrg] = useState('');
    const [filterEneatype, setFilterEneatype] = useState('');
    const [filterTestType, setFilterTestType] = useState('');

    // Sidebar navigation
    const [activeSection, setActiveSection] = useState('codigos');
    const [preguntasOpen, setPreguntasOpen] = useState(false);

    // Chart State
    const [chartPeriod, setChartPeriod] = useState('month'); // 'week' | 'month' | 'year'
    const [chartData, setChartData] = useState([]);
    const [initialChartData, setInitialChartData] = useState([]);
    const [loadingChart, setLoadingChart] = useState(false);

    useEffect(() => {
        // Check local storage for persistent auth
        const savedAuth = localStorage.getItem('adminAuth');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCodes();
            fetchAllQuestions();
            fetchTestResponses();
            fetchInitialResponses();
        }
    }, [isAuthenticated]);

    // Build chart data from testResponses whenever period changes
    useEffect(() => {
        if (testResponses.length > 0) {
            buildChartData(testResponses, chartPeriod, setChartData);
        }
        if (initialResponses.length > 0) {
            buildChartData(initialResponses, chartPeriod, setInitialChartData);
        }
    }, [testResponses, initialResponses, chartPeriod]);

    const buildChartData = (responses, period, setter) => {
        const counts = {};
        const now = new Date();

        if (period === 'days7') {
            // Last 7 days, one slot per day
            const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                const key = `${days[d.getDay()]} ${d.getDate()}`;
                counts[key] = counts[key] || 0;
            }
        }

        responses.forEach(r => {
            const d = new Date(r.created_at);
            let key;
            if (period === 'days7') {
                // Only include last 7 days
                const diffDays = Math.floor((now - d) / 86400000);
                if (diffDays > 6) return;
                const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                key = `${days[d.getDay()]} ${d.getDate()}`;
            } else if (period === 'week') {
                const startOfYear = new Date(d.getFullYear(), 0, 1);
                const weekNum = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
                key = `Sem ${weekNum} ${d.getFullYear()}`;
            } else if (period === 'month') {
                const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                key = `${months[d.getMonth()]} ${d.getFullYear()}`;
            } else {
                key = String(d.getFullYear());
            }
            counts[key] = (counts[key] || 0) + 1;
        });
        const sorted = Object.entries(counts)
            .map(([label, usuarios]) => ({ label, usuarios }))
            .slice(-12);
        setter(sorted);
    };

    const fetchAllQuestions = async () => {
        setLoadingQuestions(true);
        try {
            const { data: qData } = await supabase.from('questions').select('*').order('id', { ascending: true });
            const { data: advData } = await supabase.from('advanced_questions').select('*').order('id', { ascending: true });
            setAdminQuestions(qData || []);
            setAdminAdvancedQuestions(advData || []);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const fetchTestResponses = async () => {
        setLoadingResponses(true);
        try {
            const { data, error } = await supabase
                .from('advanced_test_responses')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setTestResponses(data || []);
        } catch (error) {
            console.error('Error fetching responses:', error);
        } finally {
            setLoadingResponses(false);
        }
    };

    const fetchInitialResponses = async () => {
        try {
            // Since basic_test_responses has 20 rows per test, 
            // we fetch all but we'll filter by session_id in JS to be safe 
            // (or use a RPC if supported, but let's keep it simple for now)
            const { data, error } = await supabase
                .from('basic_test_responses')
                .select('session_id, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Extract unique sessions
            const uniqueSessions = [];
            const seen = new Set();
            (data || []).forEach(r => {
                if (!seen.has(r.session_id)) {
                    seen.add(r.session_id);
                    uniqueSessions.push(r);
                }
            });

            setInitialResponses(uniqueSessions);
        } catch (error) {
            console.error('Error fetching initial responses:', error);
        }
    };

    const handleEditStart = (id, currentText) => {
        setEditingId(id);
        setEditValue(currentText);
    };

    const handleSaveQuestion = async (id, isAdvanced = false) => {
        setSavingId(id);
        const table = isAdvanced ? 'advanced_questions' : 'questions';

        try {
            const { error } = await supabase
                .from(table)
                .update({ text: editValue })
                .eq('id', id);

            if (error) throw error;

            // Update local state
            if (isAdvanced) {
                setAdminAdvancedQuestions(prev => prev.map(q => q.id === id ? { ...q, text: editValue } : q));
            } else {
                setAdminQuestions(prev => prev.map(q => q.id === id ? { ...q, text: editValue } : q));
            }

            setEditingId(null);
            setEditValue('');
        } catch (error) {
            console.error('Error saving question:', error);
            alert('Error al guardar la pregunta.');
        } finally {
            setSavingId(null);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        // Simple secure hardcoded password for now
        if (passwordInput === 'AdminAutenticos2026*') {
            setIsAuthenticated(true);
            setLoginError('');
            localStorage.setItem('adminAuth', 'true');
        } else {
            setLoginError('Contraseña incorrecta. Inténtalo de nuevo.');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPasswordInput('');
        localStorage.removeItem('adminAuth');
    };

    const fetchCodes = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('access_codes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCodes(data || []);
        } catch (error) {
            console.error('Error fetching codes:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'LIDER-';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleGenerateCode = async () => {
        setGenerating(true);
        const newCode = generateRandomCode();

        try {
            const { error } = await supabase
                .from('access_codes')
                .insert([{ code: newCode }]);

            if (error) {
                console.error('Error insertando código:', error);
                alert('Hubo un error al generar el código. Intenta de nuevo.');
            } else {
                fetchCodes(); // Refresh list to show the new code at top
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setGenerating(false);
        }
    };

    const toggleGroup = (enneatype) => {
        if (expandedGroup === enneatype) {
            setExpandedGroup(null);
        } else {
            setExpandedGroup(enneatype);
        }
    };

    const toggleInitialGroup = (group) => {
        if (expandedInitialGroup === group) {
            setExpandedInitialGroup(null);
        } else {
            setExpandedInitialGroup(group);
        }
    };

    const handleCopyLink = (path) => {
        const fullLink = `${window.location.origin}${path}`;
        navigator.clipboard.writeText(fullLink);
        setCopySuccess(path);
        setTimeout(() => setCopySuccess(''), 2000);
    };

    // Group advanced questions by enneatype
    const groupedAdvancedQuestions = adminAdvancedQuestions.reduce((acc, q) => {
        if (!acc[q.enneatype]) {
            acc[q.enneatype] = [];
        }
        acc[q.enneatype].push(q);
        return acc;
    }, {});

    // Group initial questions by type
    const groupedInitialQuestions = adminQuestions.reduce((acc, q) => {
        const type = q.type || 'A';
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(q);
        return acc;
    }, {});

    const initialGroupLabels = {
        'A': 'Grupo A',
        'B': 'Grupo B',
        'C': 'Grupo C',
        'X': 'Grupo X',
        'Y': 'Grupo Y',
        'Z': 'Grupo Z',
        'special': 'Tipo Especial'
    };

    const initialGroupsOrder = ['A', 'B', 'C', 'X', 'Y', 'Z', 'special'];

    const handleDownloadPdf = async () => {
        const kitRoot = document.getElementById('admin-hidden-kit-printable');
        if (!kitRoot || isGeneratingPdf) return;

        try {
            setIsGeneratingPdf(true);
            setPdfSuccess(false);

            // Make it visible but off-screen for html2canvas to work properly
            kitRoot.style.display = 'block';
            kitRoot.style.position = 'absolute';
            kitRoot.style.left = '-9999px';
            kitRoot.style.top = '0';

            // Wait a moment for React to render the component fully with the new selectedType
            await new Promise(resolve => setTimeout(resolve, 500));

            const pages = kitRoot.querySelectorAll('.kit-page');
            const pdf = new jsPDF('p', 'mm', 'a4');

            for (let i = 0; i < pages.length; i++) {
                const canvas = await html2canvas(pages[i], {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false
                });

                const imgData = canvas.toDataURL('image/png');
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            }

            pdf.save(`Plan-de-Accion-Eneagrama-Tipo-${selectedType}.pdf`);
            setPdfSuccess(true);

            setTimeout(() => setPdfSuccess(false), 3000);

        } catch (error) {
            console.error('Error generating Executive Kit PDF:', error);
            alert('Hubo un error al generar el Plan de Accion. Revisa la consola para más detalles.');
        } finally {
            setIsGeneratingPdf(false);
            if (kitRoot) kitRoot.style.display = 'none';
        }
    };

    const handleDownloadExcel = (response) => {
        const e = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

        // ── Info block: each field in its own row (Label, Value)
        const org = response.organization_code && response.organization_code !== 'NO_CODE'
            ? response.organization_code : '-';
        const infoRows = [
            [e('Nombre'), e(response.user_name || '-')],
            [e('Correo electrónico'), e(response.user_email || '-')],
            [e('Eneatipo resultado final'), e(`Tipo ${response.enneatype}`)],
            [e('Tipo de test realizado'), e(`${response.test_type} preguntas`)],
            [e('Organización'), e(org)],
            [e('Código utilizado'), e(response.access_code || '-')],
            [],   // blank separator row
            // ── Q&A table header
            [e('Eneatipo'), e('N°'), e('Pregunta'), e('Respuesta')]
        ];

        // ── Q&A rows grouped by enneatype 1-9
        const answers = response.answers || [];
        const groups = {};
        answers.forEach(a => {
            const key = a.enneatype || 'Sin tipo';
            if (!groups[key]) groups[key] = [];
            groups[key].push(a);
        });
        const sortedKeys = Object.keys(groups).sort((a, b) => Number(a) - Number(b));
        const answerRows = [];
        sortedKeys.forEach(typeKey => {
            groups[typeKey].forEach((a, i) => {
                answerRows.push([
                    e(`Tipo ${typeKey}`),   // Col A: Tipo 1, Tipo 2 ...
                    i + 1,                  // Col B: 1 a 15 por eneatipo
                    e(a.text),              // Col C: enunciado
                    e(a.answer_label || '-') // Col D: respuesta
                ]);
            });
        });

        const allRows = [...infoRows, ...answerRows];
        // Semicolon separator (Spanish Excel locale) + UTF-8 BOM + \r\n for correct encoding
        const csvContent = '\uFEFF' + allRows.map(r => r.join(';')).join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const safeName = (response.user_name || 'usuario').replace(/\s+/g, '_');
        link.href = url;
        link.download = `Respuestas_${safeName}_Eneatipo${response.enneatype}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login-wrapper">
                <div className="admin-login-card">
                    <h2>Acceso Administrativo</h2>
                    <form onSubmit={handleLogin}>
                        {loginError && <div className="admin-login-error">{loginError}</div>}
                        <input
                            type="password"
                            className="admin-login-input"
                            placeholder="Contraseña de Administrador"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="admin-btn-login">
                            Iniciar Sesión
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-shell">

            {/* ── SIDEBAR ── */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <img src="/Circulo_Eneagrama_Autenticos_01.jpg" alt="Logo" className="admin-sidebar-logo" />
                    <span className="admin-sidebar-brand-name">Enesencia</span>
                </div>

                <nav className="admin-sidebar-nav">
                    <button className={`admin-nav-item ${activeSection === 'codigos' ? 'active' : ''}`}
                        onClick={() => setActiveSection('codigos')}>
                        <Key size={17} /> Códigos de acceso
                    </button>
                    <button className={`admin-nav-item ${activeSection === 'plan' ? 'active' : ''}`}
                        onClick={() => setActiveSection('plan')}>
                        <Download size={17} /> Plan de Acción
                    </button>
                    <button className={`admin-nav-item ${activeSection === 'compartir' ? 'active' : ''}`}
                        onClick={() => setActiveSection('compartir')}>
                        <Link size={17} /> Compartir
                    </button>

                    <button
                        className={`admin-nav-item ${activeSection === 'preguntas-inicial' || activeSection === 'preguntas-avanzado' ? 'active' : ''}`}
                        onClick={() => setPreguntasOpen(o => !o)}>
                        <ChevronDown size={17} style={{ transform: preguntasOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        Preguntas
                    </button>
                    {preguntasOpen && (
                        <div className="admin-nav-subitems">
                            <button className={`admin-nav-subitem ${activeSection === 'preguntas-inicial' ? 'active' : ''}`}
                                onClick={() => setActiveSection('preguntas-inicial')}>
                                Test inicial
                            </button>
                            <button className={`admin-nav-subitem ${activeSection === 'preguntas-avanzado' ? 'active' : ''}`}
                                onClick={() => setActiveSection('preguntas-avanzado')}>
                                Test avanzado
                            </button>
                        </div>
                    )}

                    <button className={`admin-nav-item ${activeSection === 'respuestas' ? 'active' : ''}`}
                        onClick={() => setActiveSection('respuestas')}>
                        <RefreshCw size={17} /> Respuestas
                    </button>
                    <button className={`admin-nav-item ${activeSection === 'graficas' ? 'active' : ''}`}
                        onClick={() => setActiveSection('graficas')}>
                        <BarChart2 size={17} /> Gráficas
                    </button>
                </nav>

                <button onClick={handleLogout} className="admin-sidebar-logout">
                    <LogOut size={16} /> Cerrar sesión
                </button>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="admin-main">

                {/* ── SECTION: Códigos de acceso ── */}
                {activeSection === 'codigos' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><Key size={20} /> Códigos de acceso</h2>
                        </div>
                        <div className="code-generator-section">
                            <button onClick={handleGenerateCode} disabled={generating} className="btn-generate">
                                <Plus size={18} />
                                {generating ? 'Generando...' : 'Crear Nuevo Código de Acceso'}
                            </button>
                        </div>
                        <div className="codes-list-container">
                            <div className="codes-list-header">
                                <h3>Últimos códigos</h3>
                                <button onClick={fetchCodes} className="btn-refresh" disabled={loading} title="Actualizar">
                                    <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                                </button>
                            </div>
                            <div className="codes-table-wrapper" style={{ maxHeight: '400px' }}>
                                <table className="codes-table">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Estado</th>
                                            <th>Usado por</th>
                                            <th>Copiar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {codes.length === 0 ? (
                                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>
                                                {loading ? 'Cargando...' : 'No hay códigos.'}
                                            </td></tr>
                                        ) : (
                                            codes.slice(0, 10).map((item) => (
                                                <tr key={item.code}>
                                                    <td className="code-cell">{item.code}</td>
                                                    <td>
                                                        <span className={`status-badge ${item.is_used ? 'used' : 'unused'}`}>
                                                            {item.is_used ? 'Usado' : 'Disponible'}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '0.8rem' }}>{item.used_by || '-'}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(item.code);
                                                                setCopySuccess(item.code);
                                                                setTimeout(() => setCopySuccess(''), 2000);
                                                            }}
                                                            title="Copiar código"
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copySuccess === item.code ? '#4ade80' : '#b89b2d', padding: '4px' }}
                                                        >
                                                            {copySuccess === item.code ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── SECTION: Plan de Acción ── */}
                {activeSection === 'plan' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><Download size={20} /> Generador Plan de Acción</h2>
                        </div>
                        <div className="pdf-generator-section">
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '15px' }}>
                                Descarga el PDF completo para cualquier eneatipo.
                            </p>
                            <div className="form-group-admin" style={{ marginBottom: '15px' }}>
                                <label htmlFor="type-select">Selecciona el Eneatipo:</label>
                                <select id="type-select" className="select-admin" value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)} disabled={isGeneratingPdf}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                        <option key={num} value={num.toString()}>Eneatipo {num}</option>
                                    ))}
                                </select>
                            </div>
                            <button className="btn-download-pdf" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                                {isGeneratingPdf ? <RefreshCw size={18} className="spinning" /> :
                                    pdfSuccess ? <CheckCircle2 size={18} color="#4ade80" /> : <Download size={18} />}
                                {isGeneratingPdf ? ' Generando...' : pdfSuccess ? ' ¡Listo!' : ' Descargar PDF'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── SECTION: Compartir ── */}
                {activeSection === 'compartir' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><Link size={20} /> Links de Compartir</h2>
                        </div>
                        <div className="sharing-links-section">
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '15px' }}>
                                Copia los enlaces para enviar a los usuarios.
                            </p>
                            <div className="share-link-item">
                                <label>Página de Inicio (Test Inicial)</label>
                                <div className="link-input-group">
                                    <input readOnly value={window.location.origin} />
                                    <button onClick={() => handleCopyLink('/')} title="Copiar">
                                        {copySuccess === '/' ? <CheckCircle2 size={16} color="#4ade80" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="share-link-item" style={{ marginTop: '15px' }}>
                                <label>Test Liderazgo (Corporativo)</label>
                                <div className="link-input-group">
                                    <input readOnly value={`${window.location.origin}/test-liderazgo`} />
                                    <button onClick={() => handleCopyLink('/test-liderazgo')} title="Copiar">
                                        {copySuccess === '/test-liderazgo' ? <CheckCircle2 size={16} color="#4ade80" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── SECTION: Preguntas Test Inicial ── */}
                {activeSection === 'preguntas-inicial' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2>Test Inicial</h2>
                            <span style={{ fontSize: '0.9rem', color: '#b89b2d', fontWeight: 'bold' }}>
                                {adminQuestions.length} Activas
                            </span>
                        </div>
                        <div className="questions-list">
                            {loadingQuestions ? (
                                <p style={{ padding: '20px', textAlign: 'center' }}>Cargando preguntas...</p>
                            ) : (
                                initialGroupsOrder.map(groupKey => {
                                    const groupQ = groupedInitialQuestions[groupKey] || [];
                                    const isExpanded = expandedInitialGroup === groupKey;
                                    return (
                                        <div key={groupKey} className="question-group">
                                            <div className={`question-group-header ${isExpanded ? 'active' : ''}`}
                                                onClick={() => toggleInitialGroup(groupKey)}>
                                                <span>{initialGroupLabels[groupKey]} ({groupQ.length})</span>
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                            <div className={`question-group-content ${isExpanded ? 'expanded' : ''}`}>
                                                {groupQ.map(q => (
                                                    <div key={q.id} className="question-item">
                                                        <div className="question-item-top">
                                                            <span className="q-id" style={{ fontSize: '0.85rem' }}>{q.id}.</span>
                                                            {editingId === q.id ? (
                                                                <textarea className="edit-q-textarea" value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)} autoFocus />
                                                            ) : (
                                                                <span className="q-text" style={{ fontSize: '0.85rem' }}>{q.text}</span>
                                                            )}
                                                        </div>
                                                        <div className="q-actions" style={{ marginTop: '10px' }}>
                                                            {editingId === q.id ? (
                                                                <>
                                                                    <button onClick={() => handleSaveQuestion(q.id)} className="btn-save-q"
                                                                        disabled={savingId === q.id}>
                                                                        {savingId === q.id ? '...' : 'Guardar'}
                                                                    </button>
                                                                    <button onClick={() => setEditingId(null)} className="btn-cancel-q">Cancelar</button>
                                                                </>
                                                            ) : (
                                                                <button onClick={() => handleEditStart(q.id, q.text)} className="btn-edit-q">Editar</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* ── SECTION: Preguntas Test Avanzado ── */}
                {activeSection === 'preguntas-avanzado' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2>Test Avanzado</h2>
                            <span style={{ fontSize: '0.9rem', color: '#b89b2d', fontWeight: 'bold' }}>
                                {adminAdvancedQuestions.length} Activas
                            </span>
                        </div>
                        <div className="questions-list">
                            {loadingQuestions ? (
                                <p style={{ padding: '20px', textAlign: 'center' }}>Cargando preguntas...</p>
                            ) : (
                                [1, 2, 3, 4, 5, 6, 7, 8, 9].map(typeNum => {
                                    const typeStr = typeNum.toString();
                                    const groupQ = groupedAdvancedQuestions[typeStr] || [];
                                    const isExpanded = expandedGroup === typeStr;
                                    return (
                                        <div key={typeStr} className="question-group">
                                            <div className={`question-group-header ${isExpanded ? 'active' : ''}`}
                                                onClick={() => toggleGroup(typeStr)}>
                                                <span>Eneatipo {typeStr} ({groupQ.length})</span>
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                            <div className={`question-group-content ${isExpanded ? 'expanded' : ''}`}>
                                                {groupQ.map(q => (
                                                    <div key={q.id} className="question-item">
                                                        <div className="question-item-top">
                                                            <span className="q-id" style={{ fontSize: '0.85rem' }}>{q.id}.</span>
                                                            {editingId === q.id ? (
                                                                <textarea className="edit-q-textarea" value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)} autoFocus />
                                                            ) : (
                                                                <span className="q-text" style={{ fontSize: '0.85rem' }}>{q.text}</span>
                                                            )}
                                                        </div>
                                                        <div className="q-actions" style={{ marginTop: '10px' }}>
                                                            {editingId === q.id ? (
                                                                <>
                                                                    <button onClick={() => handleSaveQuestion(q.id, true)} className="btn-save-q"
                                                                        disabled={savingId === q.id}>
                                                                        {savingId === q.id ? '...' : 'Guardar'}
                                                                    </button>
                                                                    <button onClick={() => setEditingId(null)} className="btn-cancel-q">Cancelar</button>
                                                                </>
                                                            ) : (
                                                                <button onClick={() => handleEditStart(q.id, q.text)} className="btn-edit-q">Editar</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* ── SECTION: Respuestas ── */}
                {activeSection === 'respuestas' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2>Respuestas del Test Avanzado</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '0.9rem', color: '#b89b2d', fontWeight: 'bold' }}>
                                    {(() => {
                                        const filtered = testResponses.filter(r => {
                                            const nameMatch = !filterName || (r.user_name || '').toLowerCase().includes(filterName.toLowerCase());
                                            const orgMatch = !filterOrg || (r.organization_code || '').toLowerCase().includes(filterOrg.toLowerCase());
                                            const eneatypeMatch = !filterEneatype || String(r.enneatype) === filterEneatype;
                                            const testTypeMatch = !filterTestType || String(r.test_type) === filterTestType;
                                            return nameMatch && orgMatch && eneatypeMatch && testTypeMatch;
                                        });
                                        const hasFilter = filterName || filterOrg || filterEneatype || filterTestType;
                                        return hasFilter ? `${filtered.length} / ${testResponses.length}` : `${testResponses.length}`;
                                    })()} registros
                                </span>
                                <button onClick={fetchTestResponses} className="btn-refresh" disabled={loadingResponses} title="Actualizar">
                                    <RefreshCw size={16} className={loadingResponses ? 'spinning' : ''} />
                                </button>
                            </div>
                        </div>

                        <div className="resp-filters">
                            <input
                                className="resp-filter-input"
                                type="text"
                                placeholder="Buscar nombre..."
                                value={filterName}
                                onChange={e => setFilterName(e.target.value)}
                            />
                            <input
                                className="resp-filter-input"
                                type="text"
                                placeholder="Buscar organización..."
                                value={filterOrg}
                                onChange={e => setFilterOrg(e.target.value)}
                            />
                            <select
                                className="resp-filter-select"
                                value={filterEneatype}
                                onChange={e => setFilterEneatype(e.target.value)}
                            >
                                <option value="">Todos los eneatipos</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                    <option key={n} value={String(n)}>Eneatipo {n}</option>
                                ))}
                            </select>
                            <select
                                className="resp-filter-select"
                                value={filterTestType}
                                onChange={e => setFilterTestType(e.target.value)}
                            >
                                <option value="">Todos los tests</option>
                                <option value="45">45 preguntas</option>
                                <option value="135">135 preguntas</option>
                            </select>
                            {(filterName || filterOrg || filterEneatype || filterTestType) && (
                                <button className="resp-filter-clear" onClick={() => { setFilterName(''); setFilterOrg(''); setFilterEneatype(''); setFilterTestType(''); }}>
                                    ✕ Limpiar
                                </button>
                            )}
                        </div>

                        <div className="codes-table-wrapper" style={{ maxHeight: '500px' }}>
                            <table className="codes-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Eneatipo</th>
                                        <th>Test</th>
                                        <th>Organización</th>
                                        <th>Código acceso</th>
                                        <th>Ver respuestas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingResponses ? (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
                                    ) : testResponses.length === 0 ? (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No hay respuestas registradas aún.</td></tr>
                                    ) : (
                                        testResponses
                                            .filter(r => {
                                                const nameMatch = !filterName || (r.user_name || '').toLowerCase().includes(filterName.toLowerCase());
                                                const orgMatch = !filterOrg || (r.organization_code || '').toLowerCase().includes(filterOrg.toLowerCase());
                                                const eneatypeMatch = !filterEneatype || String(r.enneatype) === filterEneatype;
                                                const testTypeMatch = !filterTestType || String(r.test_type) === filterTestType;
                                                return nameMatch && orgMatch && eneatypeMatch && testTypeMatch;
                                            })
                                            .map(r => (
                                                <tr key={r.id}>
                                                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                        {new Date(r.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td>{r.user_name || '-'}</td>
                                                    <td style={{ fontSize: '0.82rem' }}>{r.user_email || '-'}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <span className="status-badge used">Tipo {r.enneatype}</span>
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontSize: '0.82rem' }}>{r.test_type} preguntas</td>
                                                    <td style={{ textAlign: 'center', fontSize: '0.82rem' }}>
                                                        {r.organization_code && r.organization_code !== 'NO_CODE'
                                                            ? <span style={{ background: '#eef2ff', color: '#3730a3', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{r.organization_code}</span>
                                                            : <span style={{ color: '#9ca3af' }}>-</span>}
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontSize: '0.82rem' }}>
                                                        {r.access_code
                                                            ? <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#b89b2d' }}>{r.access_code}</span>
                                                            : <span style={{ color: '#9ca3af' }}>-</span>}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button className="btn-ver-respuestas" onClick={() => setSelectedResponse(r)}>
                                                            Ver respuestas
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── SECTION: Gráficas ── */}
                {activeSection === 'graficas' && (
                    <div className="charts-main-container">
                        {/* ── PRIMERA GRÁFICA: TEST AVANZADO ── */}
                        <div className="admin-card chart-card">
                            <div className="admin-card-header chart-header">
                                <div className="chart-title-group">
                                    <BarChart2 size={22} className="chart-icon" />
                                    <h2>Actividad Test Avanzado</h2>
                                </div>
                                <div className="chart-stats-summary">
                                    <span className="total-badge">{testResponses.length} registros totales</span>
                                </div>
                            </div>

                            <div className="chart-period-tabs">
                                {[
                                    { id: 'days7', label: '7 días' },
                                    { id: 'week', label: 'Semanas' },
                                    { id: 'month', label: 'Meses' },
                                    { id: 'year', label: 'Años' }
                                ].map(p => (
                                    <button
                                        key={p.id}
                                        className={`chart-period-btn ${chartPeriod === p.id ? 'active' : ''}`}
                                        onClick={() => setChartPeriod(p.id)}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>

                            <div className="chart-wrapper">
                                {chartData.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                                        No hay datos suficientes para mostrar la gráfica.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                            <XAxis
                                                dataKey="label"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#666', fontSize: 13, dy: 10 }}
                                                height={60}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#666', fontSize: 11 }}
                                                allowDecimals={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                                                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                            />
                                            <Legend verticalAlign="top" align="center" iconType="rect" wrapperStyle={{ paddingBottom: '20px' }} />
                                            <Bar
                                                name="Usuarios"
                                                dataKey="usuarios"
                                                fill="#002d44"
                                                radius={[6, 6, 0, 0]}
                                                barSize={45}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="usuarios"
                                                stroke="#ddbe3d"
                                                strokeWidth={3}
                                                dot={{ fill: '#ddbe3d', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6 }}
                                                name="Tendencia"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {chartData.length > 0 && (
                                <div className="chart-metrics">
                                    <div className="chart-metric-card">
                                        <div className="chart-metric-value">{chartData.reduce((acc, curr) => acc + curr.usuarios, 0)}</div>
                                        <div className="chart-metric-label">TOTAL USUARIOS</div>
                                    </div>
                                    <div className="chart-metric-card">
                                        <div className="chart-metric-value">{(chartData.reduce((acc, curr) => acc + curr.usuarios, 0) / chartData.length).toFixed(1)}</div>
                                        <div className="chart-metric-label">PROMEDIO / PERÍODO</div>
                                    </div>
                                    <div className="chart-metric-card">
                                        <div className="chart-metric-value">{Math.max(...chartData.map(d => d.usuarios))}</div>
                                        <div className="chart-metric-label">MÁXIMO</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── SEGUNDA GRÁFICA: TEST INICIAL ── */}
                        <div className="admin-card chart-card" style={{ marginTop: '30px' }}>
                            <div className="admin-card-header chart-header">
                                <div className="chart-title-group">
                                    <BarChart2 size={22} className="chart-icon" />
                                    <h2>Actividad Test Inicial</h2>
                                </div>
                                <div className="chart-stats-summary">
                                    <span className="total-badge">{initialResponses.length} registros totales</span>
                                </div>
                            </div>

                            <div className="chart-wrapper">
                                {initialChartData.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                                        No hay datos de sesiones para mostrar.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={initialChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                            <defs>
                                                <linearGradient id="barGradientInitial" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#b89b2d" />
                                                    <stop offset="100%" stopColor="#8c7a22" />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                            <XAxis
                                                dataKey="label"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#666', fontSize: 13, dy: 10 }}
                                                height={60}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 11 }} allowDecimals={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                                                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                            />
                                            <Legend verticalAlign="top" align="center" iconType="rect" wrapperStyle={{ paddingBottom: '20px' }} />
                                            <Bar
                                                name="Usuarios"
                                                dataKey="usuarios"
                                                fill="url(#barGradientInitial)"
                                                radius={[6, 6, 0, 0]}
                                                barSize={45}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="usuarios"
                                                stroke="#002d44"
                                                strokeWidth={3}
                                                dot={{ fill: '#002d44', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6 }}
                                                name="Tendencia"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {initialChartData.length > 0 && (
                                <div className="chart-metrics">
                                    <div className="chart-metric-card">
                                        <div className="chart-metric-value">{initialChartData.reduce((acc, curr) => acc + curr.usuarios, 0)}</div>
                                        <div className="chart-metric-label">TOTAL SESIONES</div>
                                    </div>
                                    <div className="chart-metric-card">
                                        <div className="chart-metric-value">{(initialChartData.reduce((acc, curr) => acc + curr.usuarios, 0) / initialChartData.length).toFixed(1)}</div>
                                        <div className="chart-metric-label">PROMEDIO / PERÍODO</div>
                                    </div>
                                    <div className="chart-metric-card">
                                        <div className="chart-metric-value">{Math.max(...initialChartData.map(d => d.usuarios))}</div>
                                        <div className="chart-metric-label">MÁXIMO</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* ── MODAL: Ver respuestas ── */}
            {selectedResponse && (
                <div className="responses-modal-overlay" onClick={() => setSelectedResponse(null)}>
                    <div className="responses-modal" onClick={e => e.stopPropagation()}>
                        <div className="responses-modal-header">
                            <div>
                                <h2>Respuestas del test</h2>
                                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#666' }}>
                                    <strong>{selectedResponse.user_name || 'Sin nombre'}</strong> &nbsp;·&nbsp;
                                    {selectedResponse.user_email} &nbsp;·&nbsp;
                                    <span style={{ color: '#b89b2d', fontWeight: 'bold' }}>Eneatipo {selectedResponse.enneatype}</span> &nbsp;·&nbsp;
                                    Test de {selectedResponse.test_type} preguntas
                                    {selectedResponse.organization_code && selectedResponse.organization_code !== 'NO_CODE' && (
                                        <> &nbsp;·&nbsp; Org: <strong style={{ color: '#3730a3' }}>{selectedResponse.organization_code}</strong></>
                                    )}
                                    {selectedResponse.access_code && (
                                        <> &nbsp;·&nbsp; Código: <strong style={{ color: '#b89b2d', fontFamily: 'monospace' }}>{selectedResponse.access_code}</strong></>
                                    )}
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                <button className="btn-ver-respuestas"
                                    onClick={() => handleDownloadExcel(selectedResponse)}
                                    title="Descargar en Excel"
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    ↓ Excel
                                </button>
                                <button className="responses-modal-close" onClick={() => setSelectedResponse(null)}>✕</button>
                            </div>
                        </div>
                        <div className="responses-modal-body">
                            {(() => {
                                const answers = selectedResponse.answers || [];
                                const groups = {};
                                answers.forEach(a => {
                                    const key = a.enneatype || 'Sin tipo';
                                    if (!groups[key]) groups[key] = [];
                                    groups[key].push(a);
                                });
                                const sortedKeys = Object.keys(groups).sort((a, b) => Number(a) - Number(b));
                                let globalIdx = 0;
                                return sortedKeys.map(typeKey => (
                                    <div key={typeKey} style={{ marginBottom: '24px' }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            marginBottom: '12px', paddingBottom: '8px',
                                            borderBottom: '2px solid #f0f0f0'
                                        }}>
                                            <span style={{
                                                background: '#002d44', color: 'white',
                                                fontWeight: 700, fontSize: '0.82rem',
                                                padding: '3px 10px', borderRadius: '20px'
                                            }}>Eneatipo {typeKey}</span>
                                            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                                {groups[typeKey].length} preguntas
                                            </span>
                                        </div>
                                        {groups[typeKey].map((a, i) => {
                                            globalIdx++;
                                            const n = globalIdx;
                                            return (
                                                <div key={i} className="response-item" style={{ marginBottom: '10px' }}>
                                                    <span className="response-number">{n}</span>
                                                    <div className="response-content">
                                                        <p className="response-question">{a.text}</p>
                                                        <span className="response-answer">{a.answer_label || '—'}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )
            }

            {/* Hidden wrapper for PDF Generator */}
            <div id="admin-hidden-kit-printable" style={{ display: 'none' }}>
                <ExecutiveKitTemplate
                    data={executiveKitData[selectedType]}
                    type={selectedType}
                    name="Líder"
                />
            </div>
        </div>
    );
};

export default Admin;
