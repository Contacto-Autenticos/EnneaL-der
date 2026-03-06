import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { executiveKitData } from '../data/executiveKitInfo';
import { RefreshCw, Plus, Key, ChevronDown, ChevronUp, Download, CheckCircle2, LogOut, Link, Copy, ExternalLink, BarChart2, CreditCard, Calendar, Filter, Menu, X, Eye, EyeOff } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ExecutiveKitTemplate from '../components/ExecutiveKitTemplate';
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { questions as staticQuestions } from '../data/questions';
import './Admin.css';

const Admin = () => {
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Dashboard State
    const [activeSection, setActiveSection] = useState('codigos');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [preguntasOpen, setPreguntasOpen] = useState(false);
    const [respuestasOpen, setRespuestasOpen] = useState(false);
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

    // Coupons State
    const [coupons, setCoupons] = useState([]);
    const [loadingCoupons, setLoadingCoupons] = useState(false);
    const [generatingCoupon, setGeneratingCoupon] = useState(false);

    // Helper to generate a random string for coupons
    const generateRandomCoupon = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'EN'; // Prefix for Enesencia
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const [newCouponCode, setNewCouponCode] = useState(generateRandomCoupon());
    const [newCouponDiscount, setNewCouponDiscount] = useState('');

    // Responses State
    const [testResponses, setTestResponses] = useState([]);
    const [initialResponses, setInitialResponses] = useState([]);
    const [loadingResponses, setLoadingResponses] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [selectedInitialResponse, setSelectedInitialResponse] = useState(null);
    const [loadingInitialDetails, setLoadingInitialDetails] = useState(false);
    const [initialResponseDetails, setInitialResponseDetails] = useState([]);

    // Response Filters
    const [filterName, setFilterName] = useState('');
    const [filterOrg, setFilterOrg] = useState('');
    const [filterEneatype, setFilterEneatype] = useState('');
    const [filterTestType, setFilterTestType] = useState('');

    // Transactions State
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');



    // Chart State
    const [chartPeriod, setChartPeriod] = useState('days7'); // 'days7' | 'week' | 'month' | 'year'
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
            fetchTransactions();
            fetchCoupons();
        }
    }, [isAuthenticated]);

    // Build chart data from testResponses whenever period changes
    useEffect(() => {
        buildChartData(testResponses, chartPeriod, setChartData);
    }, [testResponses, chartPeriod]);

    useEffect(() => {
        buildChartData(initialResponses, chartPeriod, setInitialChartData);
    }, [initialResponses, chartPeriod]);

    const buildChartData = (responses, period, setter) => {
        const counts = {};
        const now = new Date();

        // Initialize slots if days7
        if (period === 'days7') {
            const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                const key = `${days[d.getDay()]} ${d.getDate()}`;
                counts[key] = 0;
            }
        }

        (responses || []).forEach(r => {
            const d = new Date(r.created_at);
            let key;
            if (period === 'days7') {
                const diffDays = Math.floor((now - d) / 86400000);
                if (diffDays > 6) return;
                const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                key = `${days[d.getDay()]} ${d.getDate()}`;
                if (!(key in counts)) return; // Should not happen with pre-init
            }
            else if (period === 'week') {
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

    const fetchInitialResponseDetails = async (sessionId) => {
        setLoadingInitialDetails(true);
        try {
            const { data, error } = await supabase
                .from('basic_test_responses')
                .select('*')
                .eq('session_id', sessionId)
                .order('question_id', { ascending: true });

            if (error) throw error;
            setInitialResponseDetails(data || []);
            // Set a dummy selected object just to open the modal
            setSelectedInitialResponse({ session_id: sessionId });
        } catch (error) {
            console.error('Error fetching initial response details:', error);
        } finally {
            setLoadingInitialDetails(false);
        }
    };

    const fetchTransactions = async () => {
        setLoadingTransactions(true);
        try {
            let query = supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false });

            if (dateFrom) {
                query = query.gte('created_at', `${dateFrom}T00:00:00`);
            }
            if (dateTo) {
                query = query.lte('created_at', `${dateTo}T23:59:59`);
            }

            const { data, error } = await query;
            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const fetchCoupons = async () => {
        setLoadingCoupons(true);
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setCoupons(data || []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoadingCoupons(false);
        }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        if (!newCouponCode || !newCouponDiscount) return;
        setGeneratingCoupon(true);
        try {
            const { error } = await supabase
                .from('coupons')
                .insert([{
                    code: newCouponCode.trim().toUpperCase(),
                    discount_percentage: parseFloat(newCouponDiscount),
                    is_active: true
                }]);
            if (error) throw error;
            setNewCouponCode(generateRandomCoupon());
            setNewCouponDiscount('');
            fetchCoupons();
        } catch (error) {
            console.error('Error creating coupon:', error);
            alert('Error al crear el cupón. El código podría estar duplicado.');
        } finally {
            setGeneratingCoupon(false);
        }
    };

    const handleToggleCoupon = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('coupons')
                .update({ is_active: !currentStatus })
                .eq('id', id);
            if (error) throw error;
            fetchCoupons();
        } catch (error) {
            console.error('Error toggling coupon:', error);
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este cupón?')) return;
        try {
            const { error } = await supabase
                .from('coupons')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
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

    const ADMIN_USERS = [
        { username: 'Felipe-7', password: 'AdminAutenticos2026*' },
        { username: 'Carlos-9', password: 'AdminAutenticos2026*' },
        { username: 'Lorena-1', password: 'AdminAutenticos2026*' }
    ];

    const handleLogin = (e) => {
        e.preventDefault();

        const user = ADMIN_USERS.find(
            (u) => u.username === usernameInput.trim() && u.password === passwordInput
        );

        if (user) {
            setIsAuthenticated(true);
            setLoginError('');
            localStorage.setItem('adminAuth', 'true');
            localStorage.setItem('adminUser', user.username);
        } else {
            setLoginError('Usuario o contraseña incorrectos. Inténtalo de nuevo.');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUsernameInput('');
        setPasswordInput('');
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminUser');
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

            pdf.save(`Plan-de-Accion-Eneatipo-${selectedType}.pdf`);
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
                    <img
                        src="/Circulo_Eneagrama_Autenticos_02.png"
                        alt="Enesencia Logo"
                        className="admin-login-logo"
                    />
                    <h2>Acceso Administrativo</h2>
                    <form onSubmit={handleLogin}>
                        {loginError && <div className="admin-login-error">{loginError}</div>}
                        <input
                            type="text"
                            className="admin-login-input"
                            placeholder="Usuario"

                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            autoFocus
                            style={{ marginBottom: '15px' }}
                        />
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="admin-login-input"
                                placeholder="Contraseña de Administrador"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
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
            {/* ── MOBILE HEADER (Visible only on mobile via CSS) ── */}
            <div className="admin-mobile-header">
                <div className="admin-mobile-brand">
                    <img src="/Circulo_Eneagrama_Autenticos_01.jpg" alt="Logo" className="admin-mobile-logo" />
                    <span className="admin-mobile-brand-name">Enesencia Admin</span>
                </div>
                <button
                    className="admin-mobile-menu-btn"
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    aria-label={isMobileSidebarOpen ? "Cerrar menú" : "Abrir menú"}
                >
                    {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* ── SIDEBAR OVERLAY (Mobile) ── */}
            <div
                className={`admin-sidebar-overlay ${isMobileSidebarOpen ? 'show' : ''}`}
                onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* ── SIDEBAR ── */}
            <aside className={`admin-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-brand">
                    <img src="/Circulo_Eneagrama_Autenticos_01.jpg" alt="Logo" className="admin-sidebar-logo" />
                    <span className="admin-sidebar-brand-name">Enesencia</span>
                </div>

                <nav className="admin-sidebar-nav">
                    <button className={`admin-nav-item ${activeSection === 'codigos' ? 'active' : ''}`}
                        onClick={() => { setActiveSection('codigos'); setIsMobileSidebarOpen(false); }}>
                        <Key size={17} /> Códigos de acceso
                    </button>
                    <button className={`admin-nav-item ${activeSection === 'plan' ? 'active' : ''}`}
                        onClick={() => { setActiveSection('plan'); setIsMobileSidebarOpen(false); }}>
                        <Download size={17} /> Plan de Acción
                    </button>
                    <button className={`admin-nav-item ${activeSection === 'compartir' ? 'active' : ''}`}
                        onClick={() => { setActiveSection('compartir'); setIsMobileSidebarOpen(false); }}>
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
                                onClick={() => { setActiveSection('preguntas-inicial'); setIsMobileSidebarOpen(false); }}>
                                Test inicial
                            </button>
                            <button className={`admin-nav-subitem ${activeSection === 'preguntas-avanzado' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('preguntas-avanzado'); setIsMobileSidebarOpen(false); }}>
                                Test avanzado
                            </button>
                        </div>
                    )}

                    <button
                        className={`admin-nav-item ${activeSection === 'respuestas-inicial' || activeSection === 'respuestas-avanzado' ? 'active' : ''}`}
                        onClick={() => setRespuestasOpen(o => !o)}>
                        <RefreshCw size={17} /> Respuestas
                        <ChevronDown size={17} style={{ transform: respuestasOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 'auto' }} />
                    </button>
                    {respuestasOpen && (
                        <div className="admin-nav-subitems">
                            <button className={`admin-nav-subitem ${activeSection === 'respuestas-inicial' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('respuestas-inicial'); setIsMobileSidebarOpen(false); }}>
                                Test inicial
                            </button>
                            <button className={`admin-nav-subitem ${activeSection === 'respuestas-avanzado' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('respuestas-avanzado'); setIsMobileSidebarOpen(false); }}>
                                Test avanzado
                            </button>
                        </div>
                    )}

                    <button className={`admin-nav-item ${activeSection === 'graficas' ? 'active' : ''}`}
                        onClick={() => { setActiveSection('graficas'); setIsMobileSidebarOpen(false); }}>
                        <BarChart2 size={17} /> Gráficas
                    </button>
                    <button className={`admin-nav-item ${activeSection === 'transacciones' ? 'active' : ''}`}
                        onClick={() => { setActiveSection('transacciones'); setIsMobileSidebarOpen(false); }}>
                        <CreditCard size={17} /> Transacciones
                    </button>
                </nav>

                <div className="admin-sidebar-user-info" style={{
                    padding: '15px 20px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    marginTop: 'auto'
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#b89b2d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0f172a',
                        fontWeight: 'bold',
                        flexShrink: 0
                    }}>
                        {localStorage.getItem('adminUser') ? localStorage.getItem('adminUser').charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Conectado como</div>
                        <div style={{ fontWeight: '500' }}>{localStorage.getItem('adminUser') || 'Administrador'}</div>
                    </div>
                </div>
                <button onClick={handleLogout} className="admin-sidebar-logout" style={{ marginTop: '0', borderTop: 'none' }}>
                    <LogOut size={16} /> Cerrar sesión
                </button>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="admin-main">

                {/* ── SECTION: Códigos de acceso ── */}
                {activeSection === 'codigos' && (
                    <div className="admin-split-layout">
                        {/* Left Column: Access Codes */}
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
                                                <th>Correo</th>
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

                        {/* Right Column: Coupons */}
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h2><Plus size={20} /> Cupones de Descuento</h2>
                            </div>

                            <div className="code-generator-section" style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                                <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div className="form-group-admin">
                                            <label>Código</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    value={newCouponCode}
                                                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                                                    placeholder="EJ: PROMO20"
                                                    className="select-admin"
                                                    style={{ background: 'white', padding: '8px', paddingRight: '35px', width: '100%' }}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setNewCouponCode(generateRandomCoupon())}
                                                    title="Generar otro código"
                                                    style={{
                                                        position: 'absolute',
                                                        right: '8px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#b89b2d',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <RefreshCw size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="form-group-admin">
                                            <label>% Desc</label>
                                            <input
                                                type="number"
                                                value={newCouponDiscount}
                                                onChange={(e) => setNewCouponDiscount(e.target.value)}
                                                placeholder="20"
                                                className="select-admin"
                                                style={{ background: 'white', padding: '8px' }}
                                                min="1"
                                                max="100"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={generatingCoupon} className="btn-generate" style={{ height: '40px', marginTop: '0', fontSize: '0.9rem' }}>
                                        {generatingCoupon ? 'Creando...' : 'Crear Cupón'}
                                    </button>
                                </form>
                            </div>

                            <div className="codes-list-container" style={{ marginTop: '0' }}>
                                <div className="codes-list-header">
                                    <h3>Cupones configurados</h3>
                                    <button onClick={fetchCoupons} className="btn-refresh" disabled={loadingCoupons} title="Actualizar">
                                        <RefreshCw size={16} className={loadingCoupons ? 'spinning' : ''} />
                                    </button>
                                </div>
                                <div className="codes-table-wrapper" style={{ maxHeight: '400px' }}>
                                    <table className="codes-table">
                                        <thead>
                                            <tr>
                                                <th>Código</th>
                                                <th>%</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                                <th>Copiar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {coupons.length === 0 ? (
                                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>
                                                    {loadingCoupons ? 'Cargando...' : 'No hay cupones.'}
                                                </td></tr>
                                            ) : (
                                                coupons.map((c) => (
                                                    <tr key={c.id}>
                                                        <td className="code-cell">{c.code}</td>
                                                        <td style={{ textAlign: 'center' }}>{c.discount_percentage}%</td>
                                                        <td>
                                                            <span className={`status-badge ${c.is_active ? 'unused' : 'used'}`}>
                                                                {c.is_active ? 'Activo' : 'Off'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                <button
                                                                    onClick={() => handleToggleCoupon(c.id, c.is_active)}
                                                                    className="btn-action-admin refresh"
                                                                    title={c.is_active ? 'Desactivar' : 'Activar'}
                                                                >
                                                                    <RefreshCw size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteCoupon(c.id)}
                                                                    className="btn-action-admin delete"
                                                                    title="Eliminar"
                                                                >
                                                                    <span style={{ fontSize: '16px', lineHeight: '1' }}>✕</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(c.code);
                                                                    setCopySuccess(c.code);
                                                                    setTimeout(() => setCopySuccess(''), 2000);
                                                                }}
                                                                className="btn-action-admin"
                                                                title="Copiar cupón"
                                                                style={{ color: copySuccess === c.code ? '#4ade80' : '#b89b2d', margin: '0 auto' }}
                                                            >
                                                                {copySuccess === c.code ? <CheckCircle2 size={14} /> : <Copy size={14} />}
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

                {/* ── SECTION: Respuestas Avanzado ── */}
                {activeSection === 'respuestas-avanzado' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><RefreshCw size={20} /> Respuestas del Test Avanzado</h2>
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

                {/* ── SECTION: Respuestas Inicial ── */}
                {activeSection === 'respuestas-inicial' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><RefreshCw size={20} /> Respuestas del Test Inicial (Sesiones Anónimas)</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '0.9rem', color: '#b89b2d', fontWeight: 'bold' }}>{initialResponses.length} registros</span>
                                <button onClick={fetchInitialResponses} className="btn-refresh" disabled={loadingResponses}>
                                    <RefreshCw size={16} className={loadingResponses ? 'spinning' : ''} />
                                </button>
                            </div>
                        </div>

                        <div className="codes-table-wrapper" style={{ maxHeight: '500px' }}>
                            <table className="codes-table">
                                <thead>
                                    <tr>
                                        <th>Fecha y Hora</th>
                                        <th>ID de Sesión</th>
                                        <th style={{ textAlign: 'center' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingResponses ? (
                                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Cargando sesiones...</td></tr>
                                    ) : initialResponses.length === 0 ? (
                                        <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No hay sesiones registradas aún.</td></tr>
                                    ) : (
                                        initialResponses.map(r => (
                                            <tr key={r.session_id}>
                                                <td style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                                    {new Date(r.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td style={{ fontSize: '0.85rem', color: '#666', fontFamily: 'monospace' }}>
                                                    {r.session_id}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button className="btn-ver-respuestas" onClick={() => fetchInitialResponseDetails(r.session_id)} disabled={loadingInitialDetails}>
                                                        {loadingInitialDetails ? 'Cargando...' : 'Ver respuestas'}
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

                {/* ── SECTION: Transacciones ── */}
                {activeSection === 'transacciones' && (
                    <div className="admin-card">
                        <div className="admin-card-header transactions-header">
                            <h2><CreditCard size={20} /> Transacciones Wompi</h2>
                            <div className="transaction-filters">
                                <div className="filter-group">
                                    <label><Calendar size={14} /> Desde: </label>
                                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                </div>
                                <div className="filter-group">
                                    <label><Calendar size={14} /> Hasta: </label>
                                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                                </div>
                                <button onClick={fetchTransactions} className="btn-refresh transactions-apply" disabled={loadingTransactions}>
                                    <Filter size={16} /> Aplicar
                                </button>
                                <button onClick={() => { setDateFrom(''); setDateTo(''); fetchTransactions(); }} className="btn-refresh transactions-clear" title="Limpiar">
                                    <RefreshCw size={16} className={loadingTransactions ? 'spinning' : ''} />
                                </button>
                            </div>
                        </div>

                        <div className="transactions-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Estado</th>
                                        <th>Monto</th>
                                        <th>Usuario</th>
                                        <th>Correo</th>
                                        <th>Datos del pago</th>
                                        <th>Hora y Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingTransactions ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Cargando transacciones...</td></tr>
                                    ) : transactions.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>No se encontraron transacciones en este período.</td></tr>
                                    ) : (
                                        transactions.map((tr) => (
                                            <tr key={tr.id}>
                                                <td style={{ padding: '15px' }}>
                                                    <span className={`status-badge-premium ${tr.status?.toLowerCase() || ''}`}>
                                                        {tr.status === 'APPROVED' ? 'Pagada' : tr.status === 'DECLINED' ? 'Declinada' : tr.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <div style={{ fontWeight: '600', color: '#002d44', fontSize: '1.05rem' }}>
                                                        {tr.currency} ${(tr.amount_in_cents / 100).toLocaleString('es-CO')}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <div style={{ fontWeight: '600', color: '#002d44' }}>{tr.customer_name || '—'}</div>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{tr.customer_email}</div>
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#002d44' }}>#{tr.transaction_id}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#999' }}>Ref: {tr.reference}</div>
                                                    {tr.payment_method_brand && (
                                                        <div style={{ fontSize: '0.75rem', marginTop: '4px', fontWeight: 'bold', color: '#b89b2d' }}>
                                                            {tr.payment_method_brand} {tr.payment_method_type === 'CARD' ? '💳' : ''}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '15px' }}>
                                                    <div style={{ fontSize: '0.9rem', color: '#002d44', fontWeight: '500' }}>
                                                        {new Date(tr.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                                                        {new Date(tr.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
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

            {/* ── MODAL: Ver respuestas iniciales ── */}
            {selectedInitialResponse && (
                <div className="responses-modal-overlay" onClick={() => setSelectedInitialResponse(null)}>
                    <div className="responses-modal" onClick={e => e.stopPropagation()}>
                        <div className="responses-modal-header">
                            <div>
                                <h2>Respuestas del test inicial</h2>
                                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#666' }}>
                                    Sesión: <span style={{ fontFamily: 'monospace' }}>{selectedInitialResponse.session_id}</span>
                                </p>
                            </div>
                            <button className="responses-modal-close" onClick={() => setSelectedInitialResponse(null)}>✕</button>
                        </div>
                        <div className="responses-modal-body">
                            {initialResponseDetails.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No hay detalles para mostrar.</p>
                            ) : (
                                (() => {
                                    // Group answers by question type (A, B, C, X, Y, Z, special)
                                    const groups = {};
                                    initialResponseDetails.forEach(a => {
                                        const questionObj = adminQuestions.find(q => q.id === a.question_id);
                                        const type = questionObj?.type || 'A';
                                        if (!groups[type]) groups[type] = [];
                                        groups[type].push({ ...a, questionText: questionObj?.text });
                                    });

                                    // Sort groups using the same order as initialGroupsOrder
                                    const sortedKeys = initialGroupsOrder.filter(k => groups[k]).concat(
                                        Object.keys(groups).filter(k => !initialGroupsOrder.includes(k))
                                    );

                                    let globalIdx = 0;
                                    return sortedKeys.map(typeKey => (
                                        <div key={typeKey} style={{ marginBottom: '24px' }}>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                marginBottom: '12px', paddingBottom: '8px',
                                                borderBottom: '2px solid #f0f0f0'
                                            }}>
                                                <span style={{
                                                    background: '#b89b2d', color: 'white',
                                                    fontWeight: 700, fontSize: '0.82rem',
                                                    padding: '3px 10px', borderRadius: '20px'
                                                }}>{initialGroupLabels[typeKey] || `Grupo ${typeKey}`}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                                    {groups[typeKey].length} respuestas
                                                </span>
                                            </div>
                                            {groups[typeKey].map((a, i) => {
                                                globalIdx++;
                                                return (
                                                    <div key={a.id || i} className="response-item" style={{ marginBottom: '15px' }}>
                                                        <span className="response-number" style={{ background: '#002d44', color: 'white' }}>{globalIdx}</span>
                                                        <div className="response-content">
                                                            <p className="response-question" style={{ fontSize: '1.05rem', color: '#002d44', marginBottom: '4px' }}>
                                                                {a.questionText || `Pregunta ID ${a.question_id}`}
                                                            </p>
                                                            <span className="response-answer" style={{
                                                                display: 'inline-block',
                                                                background: '#f9fafb',
                                                                border: '1px solid #e5e7eb',
                                                                padding: '6px 12px',
                                                                borderRadius: '8px',
                                                                fontWeight: '600',
                                                                color: '#374151',
                                                                fontSize: '0.92rem',
                                                                lineHeight: '1.4'
                                                            }}>
                                                                {(() => {
                                                                    const qObj = adminQuestions.find(q => q.id === a.question_id) || staticQuestions.find(q => q.id === a.question_id);
                                                                    if (qObj?.type === 'special' && qObj.options) {
                                                                        const val = a.answer;

                                                                        // 1. If it's already a number (new format)
                                                                        const valNum = parseInt(val);
                                                                        if (!isNaN(valNum)) {
                                                                            const opt = qObj.options.find(o => o.value === valNum);
                                                                            if (opt) return opt.label;
                                                                        }

                                                                        // 2. If it's the old format "Algo", "Mucho", etc.
                                                                        const REVERSE_LABELS = {
                                                                            'Muy poco': 1,
                                                                            'Algo': 2,
                                                                            'Mucho': 3,
                                                                            'Totalmente': 4
                                                                        };
                                                                        const mappedValue = REVERSE_LABELS[val];
                                                                        if (mappedValue) {
                                                                            const opt = qObj.options.find(o => o.value === mappedValue);
                                                                            if (opt) return opt.label;
                                                                        }

                                                                        return val || '—';
                                                                    }
                                                                    return a.answer || '—';
                                                                })()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ));
                                })()
                            )}
                        </div>
                    </div>
                </div>
            )}

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
