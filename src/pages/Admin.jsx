import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { executiveKitData } from '../data/executiveKitInfo';
import { RefreshCw, Plus, Key, ChevronDown, ChevronUp, Download, CheckCircle2, LogOut, Link, Copy, ExternalLink, BarChart2, CreditCard, Calendar, Filter, Menu, User, X, Eye, EyeOff, Lightbulb, HelpCircle, Ticket } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ExecutiveKitTemplate from '../components/ExecutiveKitTemplate';
import FascinantesReportTemplate from '../components/FascinantesReportTemplate';
import {
    ResponsiveContainer, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { questions as staticQuestions } from '../data/questions';
import { fascinantesDomains, fascinantesInterpretations } from '../data/fascinantesData';
import { calculateDomainScores, getExpertAnalysis, DOMAIN_STYLES } from '../utils/fascinantesUtils';
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
    const [expandedProgram, setExpandedProgram] = useState('genuinos');
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [expandedInitialGroup, setExpandedInitialGroup] = useState(null);
    const [selectedType, setSelectedType] = useState('1');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [pdfSuccess, setPdfSuccess] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    const [isTestModeActive, setIsTestModeActive] = useState(
        localStorage.getItem('hasPaidForKit') === 'true'
    );
    const [isProgramTestActive, setIsProgramTestActive] = useState(
        localStorage.getItem('hideAdvancedProgram') !== 'true'
    );

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

    // Fascinantes Results State
    const [fascinantesResults, setFascinantesResults] = useState([]);
    const [loadingFascinantes, setLoadingFascinantes] = useState(false);
    const [fascinantesDateFrom, setFascinantesDateFrom] = useState('');
    const [fascinantesDateTo, setFascinantesDateTo] = useState('');

    // Fascinantes PDF Report State
    const [pdfReportUser, setPdfReportUser] = useState(null);
    const [isGeneratingFascinantesPdf, setIsGeneratingFascinantesPdf] = useState(null);
    const fascinantesTemplateRef = React.useRef(null);

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

    // Affiliate Codes State
    const [affiliates, setAffiliates] = useState([]);
    const [loadingAffiliates, setLoadingAffiliates] = useState(false);
    const [generatingAffiliate, setGeneratingAffiliate] = useState(false);
    const [newAffiliateCode, setNewAffiliateCode] = useState(generateRandomCoupon());
    const [newAffiliateName, setNewAffiliateName] = useState('');
    const [newAffiliateDiscount, setNewAffiliateDiscount] = useState('');

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
    const [isMultiUse, setIsMultiUse] = useState(false);
    const [expirationDate, setExpirationDate] = useState('');

    // Transactions State
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');



    // Workshop registrations State
    const [workshopRegistrations, setWorkshopRegistrations] = useState([]);
    const [loadingWorkshop, setLoadingWorkshop] = useState(false);
    const [filterWorkshopType, setFilterWorkshopType] = useState('');

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
            fetchAffiliates();
            if (activeSection === 'inscripciones') {
                fetchWorkshopRegistrations();
            }
            if (activeSection === 'fascinantes-anonimos' || activeSection === 'fascinantes-registrados') {
                fetchFascinantesResults();
            }
        }
    }, [activeSection, isAuthenticated]);

    const fetchFascinantesResults = async () => {
        setLoadingFascinantes(true);
        try {
            let query = supabase
                .from('fascinantes_results')
                .select('*')
                .order('created_at', { ascending: false });

            if (fascinantesDateFrom) {
                query = query.gte('created_at', `${fascinantesDateFrom}T00:00:00`);
            }
            if (fascinantesDateTo) {
                query = query.lte('created_at', `${fascinantesDateTo}T23:59:59`);
            }

            const { data, error } = await query;
            if (error) throw error;
            setFascinantesResults(data || []);
        } catch (error) {
            console.error('Error fetching fascinantes results:', error);
        } finally {
            setLoadingFascinantes(false);
        }
    };

    const handleDownloadFascinantesPdf = async (r) => {
        if (isGeneratingFascinantesPdf) return;

        try {
            setIsGeneratingFascinantesPdf(r.id);
            
            // Reconstruct the data needed for the template
            let domainScores = [];
            let analysis = null;
            let userAnswers = r.user_answers || {};

            // If we have user_answers, calculate everything from them for accuracy
            if (Object.keys(userAnswers).length > 0) {
                domainScores = calculateDomainScores(userAnswers);
                analysis = getExpertAnalysis(domainScores);
            } else {
                // Fallback for old records without user_answers
                domainScores = [
                    { id: 'corporal', score: r.score_corporal, style: DOMAIN_STYLES.corporal, domain: 'Dominio Corporal' },
                    { id: 'mental', score: r.score_mental, style: DOMAIN_STYLES.mental, domain: 'Dominio Mental' },
                    { id: 'emocional', score: r.score_emocional, style: DOMAIN_STYLES.emocional, domain: 'Dominio Emocional' },
                    { id: 'social', score: r.score_social, style: DOMAIN_STYLES.social, domain: 'Dominio Social' },
                    { id: 'espiritual', score: r.score_espiritual, style: DOMAIN_STYLES.espiritual, domain: 'Dominio Espiritual' },
                    { id: 'financiero', score: r.score_financiero, style: DOMAIN_STYLES.financiero, domain: 'Dominio Financiero' }
                ].map(s => {
                    const interpretation = fascinantesInterpretations.find(interp => 
                        s.score >= interp.range[0] && s.score <= interp.range[1]
                    ) || fascinantesInterpretations[0];
                    return { ...s, interpretation: interpretation.name, definition: interpretation.definition, full: 70 };
                });
                analysis = getExpertAnalysis(domainScores);
            }

            // Set the state to render the hidden template
            setPdfReportUser({
                name: r.full_name || 'Usuario Anónimo',
                date: new Date(r.created_at).toLocaleDateString(),
                domainScores,
                analysis,
                userAnswers
            });

            // Wait for React to render the template
            await new Promise(resolve => setTimeout(resolve, 800));

            const kitRoot = fascinantesTemplateRef.current;
            if (!kitRoot) throw new Error('Template ref not found');

            const pages = kitRoot.querySelectorAll('.pdf-page');
            const pdf = new jsPDF('p', 'mm', 'a4');

            for (let i = 0; i < pages.length; i++) {
                const canvas = await html2canvas(pages[i], {
                    scale: 3,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    width: 794,
                    height: 1123
                });

                const imgData = canvas.toDataURL('image/png');
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            }

            const fileName = `Reporte_Fascinantes_${(r.full_name || 'Anonimo').replace(/\s+/g, '_')}_${r.id}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error('Error generating Fascinantes PDF:', error);
            alert('Error al generar el PDF. Revisa la consola.');
        } finally {
            setIsGeneratingFascinantesPdf(null);
            setPdfReportUser(null);
        }
    };

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

    const fetchWorkshopRegistrations = async () => {
        setLoadingWorkshop(true);
        try {
            // Fetch workshop leads
            const { data: leads, error: leadsError } = await supabase
                .from('user_leads')
                .select('*')
                .or('source.eq.workshop_virtual,source.eq.workshop_presencial')
                .order('created_at', { ascending: false });

            if (leadsError) throw leadsError;

            // Fetch successful transactions related to workshops
            const { data: trans, error: transError } = await supabase
                .from('transactions')
                .select('*')
                .ilike('reference', 'prog-%')
                .eq('status', 'APPROVED');

            if (transError) throw transError;

            // Map transactions to leads by email and time proximity or reference
            const combined = leads.map(lead => {
                const workshopType = lead.source === 'workshop_virtual' ? 'Virtual' : 'Presencial';
                const paidTrans = trans.find(t => 
                    t.customer_email.toLowerCase() === lead.email.toLowerCase() &&
                    t.reference.includes(lead.source.split('_')[1])
                );

                return {
                    ...lead,
                    workshopType,
                    paymentStatus: paidTrans ? 'APPROVED' : 'PENDING/FAILED',
                    paidAt: paidTrans ? paidTrans.created_at : lead.created_at
                };
            });

            setWorkshopRegistrations(combined);
        } catch (error) {
            console.error('Error fetching workshop registrations:', error);
        } finally {
            setLoadingWorkshop(false);
        }
    };

    const fetchAffiliates = async () => {
        setLoadingAffiliates(true);
        try {
            const { data, error } = await supabase
                .from('affiliate_codes')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setAffiliates(data || []);
        } catch (error) {
            console.error('Error fetching affiliates:', error);
        } finally {
            setLoadingAffiliates(false);
        }
    };

    const handleCreateAffiliate = async (e) => {
        e.preventDefault();
        if (!newAffiliateCode || !newAffiliateName || !newAffiliateDiscount) return;
        setGeneratingAffiliate(true);
        try {
            const { error } = await supabase
                .from('affiliate_codes')
                .insert([{
                    code: newAffiliateCode.trim().toUpperCase(),
                    commercial_name: newAffiliateName.trim(),
                    discount_percentage: parseFloat(newAffiliateDiscount),
                    is_active: true
                }]);
            if (error) throw error;
            setNewAffiliateCode(generateRandomCoupon());
            setNewAffiliateName('');
            setNewAffiliateDiscount('');
            fetchAffiliates();
        } catch (error) {
            console.error('Error creating affiliate:', error);
            alert(`Error al crear el código de afiliado: ${error.message || 'Código duplicado o tabla no encontrada.'}`);
        } finally {
            setGeneratingAffiliate(false);
        }
    };

    const handleToggleAffiliate = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('affiliate_codes')
                .update({ is_active: !currentStatus })
                .eq('id', id);
            if (error) throw error;
            fetchAffiliates();
        } catch (error) {
            console.error('Error toggling affiliate:', error);
        }
    };

    const handleDeleteAffiliate = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este código de afiliado?')) return;
        try {
            const { error } = await supabase
                .from('affiliate_codes')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchAffiliates();
        } catch (error) {
            console.error('Error deleting affiliate:', error);
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
            const insertData = { code: newCode };
            if (isMultiUse) {
                insertData.is_multi_use = true;
            }
            if (expirationDate) {
                insertData.expires_at = new Date(expirationDate).toISOString();
            }

            const { error } = await supabase
                .from('access_codes')
                .insert([insertData]);

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

    const calculateFascinantesLevel = (r) => {
        const total = (r.score_corporal || 0) + (r.score_mental || 0) + (r.score_emocional || 0) + 
                      (r.score_social || 0) + (r.score_espiritual || 0) + (r.score_financiero || 0);
        
        if (total >= 353) return "Nivel 5 Plenitud";
        if (total >= 286) return "Nivel 4 Desarrollo";
        if (total >= 219) return "Nivel 3 Funcional";
        if (total >= 152) return "Nivel 2 Inestabilidad";
        return "Nivel 1 Supervivencia";
    };

    const handleDownloadFascinantesExcel = (data, filename) => {

        const e = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
        
        // Headers
        const isAnon = filename.includes('Anonimos');
        const headers = isAnon 
            ? [e('Numero de usuario'), e('Fecha'), e('Nivel obtenido'), e('Corporal'), e('Mental'), e('Emocional'), e('Social'), e('Espiritual'), e('Financiero')]
            : [e('Nombre'), e('F. Nacimiento'), e('Email'), e('Fecha Realización'), e('Nivel obtenido'), e('Corporal'), e('Mental'), e('Emocional'), e('Social'), e('Espiritual'), e('Financiero')];


        const rows = data.map(r => {
            const dateStr = new Date(r.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            if (isAnon) {
                return [
                    e(`#${r.id}`),
                    e(dateStr),
                    e(calculateFascinantesLevel(r)),

                    r.score_corporal,
                    r.score_mental,
                    r.score_emocional,
                    r.score_social,
                    r.score_espiritual,
                    r.score_financiero
                ];
            } else {
                return [
                    e(r.full_name),
                    e(r.birth_date),
                    e(r.email),
                    e(dateStr),
                    e(calculateFascinantesLevel(r)),

                    r.score_corporal,
                    r.score_mental,
                    r.score_emocional,
                    r.score_social,
                    r.score_espiritual,
                    r.score_financiero
                ];
            }
        });

        const allRows = [headers, ...rows];
        const csvContent = '\uFEFF' + allRows.map(r => r.join(';')).join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadAllInitialExcel = async () => {
        try {
            let allData = [];
            let from = 0;
            const limit = 1000;
            let hasMore = true;

            // Pagination loop to fetch ALL records from basic_test_responses
            while (hasMore) {
                const { data, error } = await supabase
                    .from('basic_test_responses')
                    .select('*')
                    .order('created_at', { ascending: true })
                    .range(from, from + limit - 1);

                if (error) throw error;
                if (!data || data.length === 0) {
                    hasMore = false;
                } else {
                    allData = [...allData, ...data];
                    if (data.length < limit) {
                        hasMore = false;
                    } else {
                        from += limit;
                    }
                }
            }

            if (allData.length === 0) {
                alert('No hay datos para exportar.');
                return;
            }

            const sessionMap = new Map();
            allData.forEach(r => {
                if (!sessionMap.has(r.session_id)) {
                    sessionMap.set(r.session_id, r.created_at);
                }
            });

            const sortedSessions = Array.from(sessionMap.entries())
                .sort((a, b) => new Date(a[1]) - new Date(b[1]))
                .map(s => s[0]);

            const getSessionNumber = (sid) => sortedSessions.indexOf(sid) + 1;
            const e = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

            const rows = [[
                e('Usuario #'),
                e('N° Pregunta'),
                e('Enunciado'),
                e('Respuesta'),
                e('Fecha')
            ]];

            // Group by session to sort consistently
            const groupedBySession = {};
            allData.forEach(r => {
                if (!groupedBySession[r.session_id]) groupedBySession[r.session_id] = [];
                groupedBySession[r.session_id].push(r);
            });

            sortedSessions.forEach(sid => {
                // IMPORTANT: Use (a, b) => Number(a.question_id) - Number(b.question_id) for numeric sort
                const sessionRows = groupedBySession[sid].sort((a, b) => Number(a.question_id) - Number(b.question_id));
                const userNum = getSessionNumber(sid);

                sessionRows.forEach(r => {
                    const qObj = adminQuestions.find(q => q.id === r.question_id) || staticQuestions.find(q => q.id === r.question_id);
                    let finalAnswer = r.answer;
                    if (qObj?.type === 'special' && qObj.options) {
                        const valNum = parseInt(r.answer);
                        if (!isNaN(valNum)) {
                            const opt = qObj.options.find(o => o.value === valNum);
                            if (opt) finalAnswer = opt.label;
                        } else {
                            const REVERSE_LABELS = { 'Muy poco': 1, 'Algo': 2, 'Mucho': 3, 'Totalmente': 4 };
                            const mappedValue = REVERSE_LABELS[r.answer];
                            if (mappedValue) {
                                const opt = qObj.options.find(o => o.value === mappedValue);
                                if (opt) finalAnswer = opt.label;
                            }
                        }
                    }
                    const dateStr = new Date(r.created_at).toLocaleString();
                    rows.push([
                        Number(userNum),
                        Number(r.question_id),
                        e(qObj?.text || staticQuestions.find(sq => sq.id === Number(r.question_id))?.text || `ID ${r.question_id}`),
                        e(finalAnswer),
                        e(dateStr)
                    ]);
                });
            });

            const csvContent = '\uFEFF' + rows.map(r => r.join(';')).join('\r\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Reporte_General_Test_Inicial_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert('Error al exportar.');
        }
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
                    <span className="admin-sidebar-brand-name">Enesencia Admin</span>
                </div>

                <nav className="admin-sidebar-nav">
                    <button 
                        className={`admin-nav-program ${expandedProgram === 'genuinos' ? 'active' : ''}`}
                        onClick={() => setExpandedProgram(expandedProgram === 'genuinos' ? null : 'genuinos')}
                    >
                        GENUINOS
                        <ChevronDown size={14} style={{ transform: expandedProgram === 'genuinos' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 'auto' }} />
                    </button>
                    
                    {expandedProgram === 'genuinos' && (
                        <div className="admin-nav-program-content">
                            <button className={`admin-nav-item ${activeSection === 'codigos' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('codigos'); setIsMobileSidebarOpen(false); }}>
                                <Key size={17} /> Códigos de acceso
                            </button>
                            <button className={`admin-nav-item ${activeSection === 'cupones' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('cupones'); setIsMobileSidebarOpen(false); }}>
                                <Ticket size={17} /> Descuentos
                            </button>
                            <button className={`admin-nav-item ${activeSection === 'afiliados' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('afiliados'); setIsMobileSidebarOpen(false); }}>
                                <Plus size={17} /> Afiliados
                            </button>
                            <button className={`admin-nav-item ${activeSection === 'compartir' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('compartir'); setIsMobileSidebarOpen(false); }}>
                                <Link size={17} /> Compartir
                            </button>
                            <button className={`admin-nav-item ${activeSection === 'plan' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('plan'); setIsMobileSidebarOpen(false); }}>
                                <Download size={17} /> Plan de acción
                            </button>

                            <button
                                className={`admin-nav-item ${activeSection === 'preguntas-inicial' || activeSection === 'preguntas-avanzado' ? 'active' : ''}`}
                                onClick={() => setPreguntasOpen(o => !o)}>
                                <HelpCircle size={17} /> Preguntas
                                <ChevronDown size={17} style={{ transform: preguntasOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 'auto' }} />
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
                                <Lightbulb size={17} /> Respuestas
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
                            <button className={`admin-nav-item ${activeSection === 'inscripciones' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('inscripciones'); setIsMobileSidebarOpen(false); }}>
                                <Calendar size={17} /> Inscripciones
                            </button>
                        </div>
                    )}

                    {/* --- OTHER PROGRAMS (Placeholders) --- */}
                    <button 
                        className={`admin-nav-program ${expandedProgram === 'fascinantes' ? 'active' : ''}`}
                        onClick={() => setExpandedProgram(expandedProgram === 'fascinantes' ? null : 'fascinantes')}
                    >
                        FASCINANTES
                        <ChevronDown size={14} style={{ transform: expandedProgram === 'fascinantes' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 'auto' }} />
                    </button>
                    {expandedProgram === 'fascinantes' && (
                        <div className="admin-nav-program-content">
                            <button className={`admin-nav-item ${activeSection === 'codigos' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('codigos'); setIsMobileSidebarOpen(false); }}>
                                <Key size={17} /> Códigos de acceso
                            </button>
                            <button className={`admin-nav-item ${activeSection === 'fascinantes-anonimos' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('fascinantes-anonimos'); setIsMobileSidebarOpen(false); }}>
                                Usuarios Anónimos
                            </button>
                            <button className={`admin-nav-item ${activeSection === 'fascinantes-registrados' ? 'active' : ''}`}
                                onClick={() => { setActiveSection('fascinantes-registrados'); setIsMobileSidebarOpen(false); }}>
                                Usuarios Registrados
                            </button>
                        </div>
                    )}

                    <button 
                        className={`admin-nav-program ${expandedProgram === 'extraordinarios' ? 'active' : ''}`}
                        onClick={() => setExpandedProgram(expandedProgram === 'extraordinarios' ? null : 'extraordinarios')}
                    >
                        EXTRAORDINARIOS
                        <ChevronDown size={14} style={{ transform: expandedProgram === 'extraordinarios' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 'auto' }} />
                    </button>
                    {expandedProgram === 'extraordinarios' && (
                        <div className="admin-nav-program-content placeholder">
                            <span>Próximamente...</span>
                        </div>
                    )}

                    <button 
                        className={`admin-nav-program ${expandedProgram === 'trascendentes' ? 'active' : ''}`}
                        onClick={() => setExpandedProgram(expandedProgram === 'trascendentes' ? null : 'trascendentes')}
                    >
                        TRASCENDENTES
                        <ChevronDown size={14} style={{ transform: expandedProgram === 'trascendentes' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 'auto' }} />
                    </button>
                    {expandedProgram === 'trascendentes' && (
                        <div className="admin-nav-program-content placeholder">
                            <span>Próximamente...</span>
                        </div>
                    )}

                    <button 
                        className={`admin-nav-program ${expandedProgram === 'conscientes' ? 'active' : ''}`}
                        onClick={() => setExpandedProgram(expandedProgram === 'conscientes' ? null : 'conscientes')}
                    >
                        CONSCIENTES
                        <ChevronDown size={14} style={{ transform: expandedProgram === 'conscientes' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 'auto' }} />
                    </button>
                    {expandedProgram === 'conscientes' && (
                        <div className="admin-nav-program-content placeholder">
                            <span>Próximamente...</span>
                        </div>
                    )}
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
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><Key size={20} /> Códigos de acceso</h2>
                        </div>
                        <div className="code-generator-section" style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '15px', 
                            background: 'rgba(0, 40, 85, 0.05)', 
                            padding: '20px', 
                            borderRadius: '12px', 
                            marginBottom: '20px', 
                            border: '1px solid rgba(0, 40, 85, 0.1)' 
                        }}>
                            <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#002855', fontWeight: '600' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={isMultiUse} 
                                        onChange={(e) => setIsMultiUse(e.target.checked)}
                                        style={{ width: '20px', height: '20px', accentColor: '#b89b2d' }}
                                    />
                                    <span>Código Multiuso (Evento)</span>
                                </label>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ color: '#002855', fontSize: '0.95rem', fontWeight: '600' }}>Fecha de caducidad (Opcional):</span>
                                    <input 
                                        type="datetime-local" 
                                        value={expirationDate}
                                        onChange={(e) => setExpirationDate(e.target.value)}
                                        className="select-admin"
                                        style={{ 
                                            background: '#ffffff', 
                                            color: '#002855', 
                                            border: '1px solid rgba(0, 40, 85, 0.2)', 
                                            padding: '8px 12px', 
                                            borderRadius: '8px',
                                            outline: 'none',
                                            fontWeight: '500'
                                        }}
                                    />
                                </div>
                            </div>

                            <button onClick={handleGenerateCode} disabled={generating} className="btn-generate" style={{ alignSelf: 'flex-start' }}>
                                <Plus size={22} />
                                {generating ? 'Generando...' : 'Nuevo código de acceso'}
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
                                            <th style={{ textAlign: 'center' }}>Copiar</th>
                                            <th>Tipo</th>
                                            <th>Programa</th>
                                            <th>Estado / Expiración</th>
                                            <th>Uso / Correo</th>
                                            <th>Fecha Uso</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {codes.length === 0 ? (
                                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>
                                                {loading ? 'Cargando...' : 'No hay códigos.'}
                                            </td></tr>
                                        ) : (
                                            codes.slice(0, 10).map((item) => (
                                                <tr key={item.code}>
                                                    <td className="code-cell">{item.code}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(item.code);
                                                                setCopySuccess(item.code);
                                                                setTimeout(() => setCopySuccess(''), 2000);
                                                            }}
                                                            className="btn-action-admin"
                                                            title="Copiar código"
                                                            style={{ color: copySuccess === item.code ? '#4ade80' : '#b89b2d', margin: '0 auto' }}
                                                        >
                                                            {copySuccess === item.code ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <span style={{ 
                                                            fontSize: '0.75rem', 
                                                            padding: '2px 8px', 
                                                            borderRadius: '10px',
                                                            background: item.is_multi_use ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                                                            color: item.is_multi_use ? '#1e40af' : '#334155', // Darker blue and slate
                                                            border: item.is_multi_use ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(148, 163, 184, 0.4)',
                                                            fontWeight: '600'
                                                        }}>
                                                            {item.is_multi_use ? 'Multiuso' : 'Único'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ 
                                                            fontSize: '0.8rem',
                                                            color: item.used_in_program === 'Fascinantes' ? '#60a5fa' : 
                                                                   item.used_in_program === 'Genuinos' ? '#ddbe3d' : '#94a3b8',
                                                            fontWeight: item.used_in_program ? '600' : '400'
                                                        }}>
                                                            {item.used_in_program || '-'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            {(() => {
                                                                const isExpired = item.expires_at && new Date(item.expires_at) < new Date();
                                                                if (item.is_multi_use) {
                                                                    return (
                                                                        <span className={`status-badge ${isExpired ? 'used' : 'unused'}`}>
                                                                            {isExpired ? 'Expirado' : 'Disponible'}
                                                                        </span>
                                                                    );
                                                                }
                                                                return (
                                                                    <span className={`status-badge ${item.is_used || isExpired ? 'used' : 'unused'}`}>
                                                                        {item.is_used ? 'Usado' : (isExpired ? 'Expirado' : 'Disponible')}
                                                                    </span>
                                                                );
                                                            })()}
                                                            {item.expires_at && (
                                                                <span style={{ fontSize: '0.7rem', color: new Date(item.expires_at) < new Date() ? '#ef4444' : '#94a3b8' }}>
                                                                    Exp: {new Date(item.expires_at).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: '0.8rem', color: '#111827', fontWeight: item.used_by ? '500' : '400' }}>{item.used_by || '-'}</td>
                                                    <td style={{ fontSize: '0.8rem', color: '#111827', fontWeight: item.used_at ? '500' : '400' }}>
                                                        {item.used_at ? new Date(item.used_at).toLocaleString('es-CO', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : '-'}
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

                {/* ── SECTION: Cupones de descuento ── */}
                {activeSection === 'cupones' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><Ticket size={20} /> Descuentos</h2>
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
                                <button type="submit" disabled={generatingCoupon} className="btn-generate">
                                    <Plus size={22} />
                                    {generatingCoupon ? 'Creando...' : 'Nuevo cupón de descuento'}
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
                                            <th style={{ textAlign: 'center' }}>Copiar</th>
                                            <th style={{ textAlign: 'center' }}>%</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
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
                                                    <td style={{ textAlign: 'center' }}>
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
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── SECTION: Afiliados ── */}
                {activeSection === 'afiliados' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><Plus size={20} /> Códigos de Afiliados / Comerciales</h2>
                        </div>

                        <div className="code-generator-section" style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                            <form onSubmit={handleCreateAffiliate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                    <div className="form-group-admin">
                                        <label>Código</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                value={newAffiliateCode}
                                                onChange={(e) => setNewAffiliateCode(e.target.value.toUpperCase())}
                                                placeholder="EJ: COMERCIAL01"
                                                className="select-admin"
                                                style={{ background: 'white', padding: '8px', paddingRight: '35px', width: '100%' }}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setNewAffiliateCode(generateRandomCoupon())}
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
                                        <label>Nombre Comercial</label>
                                        <input
                                            type="text"
                                            value={newAffiliateName}
                                            onChange={(e) => setNewAffiliateName(e.target.value)}
                                            placeholder="Nombre de la persona"
                                            className="select-admin"
                                            style={{ background: 'white', padding: '8px', width: '100%' }}
                                            required
                                        />
                                    </div>
                                    <div className="form-group-admin">
                                        <label>% Descuento</label>
                                        <input
                                            type="number"
                                            value={newAffiliateDiscount}
                                            onChange={(e) => setNewAffiliateDiscount(e.target.value)}
                                            placeholder="20"
                                            className="select-admin"
                                            style={{ background: 'white', padding: '8px', width: '100%' }}
                                            min="1"
                                            max="100"
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" disabled={generatingAffiliate} className="btn-generate">
                                    <Plus size={22} />
                                    {generatingAffiliate ? 'Creando...' : 'Crear código de afiliado'}
                                </button>
                            </form>
                        </div>

                        <div className="codes-list-container" style={{ marginTop: '0' }}>
                            <div className="codes-list-header">
                                <h3>Afiliados configurados</h3>
                                <button onClick={fetchAffiliates} className="btn-refresh" disabled={loadingAffiliates} title="Actualizar">
                                    <RefreshCw size={16} className={loadingAffiliates ? 'spinning' : ''} />
                                </button>
                            </div>
                            <div className="codes-table-wrapper" style={{ maxHeight: '400px' }}>
                                <table className="codes-table">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th style={{ textAlign: 'center' }}>Copiar</th>
                                            <th>Comercial</th>
                                            <th style={{ textAlign: 'center' }}>%</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {affiliates.length === 0 ? (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '10px' }}>
                                                {loadingAffiliates ? 'Cargando...' : 'No hay afiliados configurados.'}
                                            </td></tr>
                                        ) : (
                                            affiliates.map((a) => (
                                                <tr key={a.id}>
                                                    <td className="code-cell">{a.code}</td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(a.code);
                                                                setCopySuccess(a.code);
                                                                setTimeout(() => setCopySuccess(''), 2000);
                                                            }}
                                                            className="btn-action-admin"
                                                            title="Copiar código"
                                                            style={{ color: copySuccess === a.code ? '#4ade80' : '#b89b2d', margin: '0 auto' }}
                                                        >
                                                            {copySuccess === a.code ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                                        </button>
                                                    </td>
                                                    <td style={{ fontWeight: '600' }}>{a.commercial_name}</td>
                                                    <td style={{ textAlign: 'center' }}>{a.discount_percentage}%</td>
                                                    <td>
                                                        <span className={`status-badge ${a.is_active ? 'unused' : 'used'}`}>
                                                            {a.is_active ? 'Activo' : 'Off'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                onClick={() => handleToggleAffiliate(a.id, a.is_active)}
                                                                className="btn-action-admin refresh"
                                                                title={a.is_active ? 'Desactivar' : 'Activar'}
                                                            >
                                                                <RefreshCw size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAffiliate(a.id)}
                                                                className="btn-action-admin delete"
                                                                title="Eliminar"
                                                            >
                                                                <span style={{ fontSize: '16px', lineHeight: '1' }}>✕</span>
                                                            </button>
                                                        </div>
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
                    <>
                        <div className="admin-card">
                            <div className="admin-card-header">
                                <h2><Download size={20} /> Generador plan de acción</h2>
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

                            <div className="pdf-static-manager">
                                <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Download size={18} /> Pdfs estáticos para descarga del usuario
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '15px' }}>
                                    Una vez generes los PDFs, deberás subirlos al servidor en la carpeta <code style={{ background: '#f0f0f0', padding: '2px 4px', borderRadius: '4px', color: '#002d44' }}>public/pdfs/</code> con los nombres correspondientes para que los usuarios puedan descargarlos automáticamente desde su página de resultados avanzados.
                                </p>
                                <div className="static-pdfs-grid">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                        <div key={num} className="static-pdf-card">
                                            <div className="static-pdf-info">
                                                <span className="pdf-type-badge">Tipo {num}</span>
                                                <span className="pdf-filename">Plan-de-Accion-Eneatipo-{num}.pdf</span>
                                            </div>
                                            <button
                                                className="btn-ver-static"
                                                onClick={() => window.open(`/pdfs/Plan-de-Accion-Eneatipo-${num}.pdf`, '_blank')}
                                                title="Ver PDF guardado actualmente en el servidor"
                                            >
                                                <ExternalLink size={16} /> Ver actual
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── SECTION: Modo de Prueba (Global) ── */}
                        <div className="admin-card" style={{ marginTop: '20px' }}>
                            <div className="admin-card-header">
                                <h2><Eye size={20} /> Modo de prueba: Visualización de recuadros</h2>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '15px' }}>
                                    Activa o desactiva estos recuadros para probar su visualización en la página de resultados de <strong>este navegador</strong>.
                                </p>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                    <button
                                        className={`btn-generate`}
                                        style={{
                                            background: isTestModeActive ? '#dc2626' : 'linear-gradient(135deg, var(--color-primary) 0%, #b89b2d 100%)',
                                            flex: '1',
                                            minWidth: '250px'
                                        }}
                                        onClick={() => {
                                            if (isTestModeActive) {
                                                localStorage.removeItem('hasPaidForKit');
                                                setIsTestModeActive(false);
                                            } else {
                                                localStorage.setItem('hasPaidForKit', 'true');
                                                setIsTestModeActive(true);
                                            }
                                        }}
                                    >
                                        {isTestModeActive ? (
                                            <><EyeOff size={18} /> Ocultar Plan de Acción</>
                                        ) : (
                                            <><Eye size={18} /> Mostrar Plan de Acción</>
                                        )}
                                    </button>

                                    <button
                                        className={`btn-generate`}
                                        style={{
                                            background: !isProgramTestActive ? 'linear-gradient(135deg, var(--color-primary) 0%, #b89b2d 100%)' : '#dc2626',
                                            flex: '1',
                                            minWidth: '250px'
                                        }}
                                        onClick={() => {
                                            if (isProgramTestActive) {
                                                localStorage.setItem('hideAdvancedProgram', 'true');
                                                setIsProgramTestActive(false);
                                            } else {
                                                localStorage.removeItem('hideAdvancedProgram');
                                                setIsProgramTestActive(true);
                                            }
                                        }}
                                    >
                                        {isProgramTestActive ? (
                                            <><EyeOff size={18} /> Ocultar Programa Avanzado</>
                                        ) : (
                                            <><Eye size={18} /> Mostrar Programa Avanzado</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── SECTION: Compartir ── */}
                {activeSection === 'compartir' && (
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><Link size={20} /> Links para compartir</h2>
                        </div>
                        <div className="sharing-links-section">
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '15px' }}>
                                Copia los enlaces para enviar a los usuarios.
                            </p>
                            <div className="share-link-item">
                                <label style={{ fontWeight: 'bold' }}>Página de inicio (Test inicial)</label>
                                <div className="link-input-group">
                                    <input readOnly value={window.location.origin} />
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleCopyLink('/')}
                                            className="btn-action-admin"
                                            title="Copiar"
                                            style={{ color: copySuccess === '/' ? '#4ade80' : '#b89b2d' }}
                                        >
                                            {copySuccess === '/' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                        </button>
                                        <button
                                            onClick={() => window.open(window.location.origin, '_blank')}
                                            className="btn-action-admin"
                                            title="Abrir en nueva ventana"
                                            style={{ color: '#002d44' }}
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="share-link-item" style={{ marginTop: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Test liderazgo (Corporativo)</label>
                                <div className="link-input-group">
                                    <input readOnly value={`${window.location.origin}/test-liderazgo`} />
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleCopyLink('/test-liderazgo')}
                                            className="btn-action-admin"
                                            title="Copiar"
                                            style={{ color: copySuccess === '/test-liderazgo' ? '#4ade80' : '#b89b2d' }}
                                        >
                                            {copySuccess === '/test-liderazgo' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                        </button>
                                        <button
                                            onClick={() => window.open(`${window.location.origin}/test-liderazgo`, '_blank')}
                                            className="btn-action-admin"
                                            title="Abrir en nueva ventana"
                                            style={{ color: '#002d44' }}
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="share-link-item" style={{ marginTop: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Ejemplo resultado análisis avanzado</label>
                                <div className="link-input-group">
                                    <input readOnly value={`${window.location.origin}/advanced-analysis-result/1`} />
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleCopyLink('/advanced-analysis-result/1')}
                                            className="btn-action-admin"
                                            title="Copiar"
                                            style={{ color: copySuccess === '/advanced-analysis-result/1' ? '#4ade80' : '#b89b2d' }}
                                        >
                                            {copySuccess === '/advanced-analysis-result/1' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                        </button>
                                        <button
                                            onClick={() => window.open(`${window.location.origin}/advanced-analysis-result/1`, '_blank')}
                                            className="btn-action-admin"
                                            title="Abrir en nueva ventana"
                                            style={{ color: '#002d44' }}
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="share-link-item" style={{ marginTop: '15px' }}>
                                <label style={{ fontWeight: 'bold' }}>Ejemplo plan de acción</label>
                                <div className="link-input-group">
                                    <input readOnly value="https://drive.google.com/file/d/1PxjaxcBWnH1g3gZYl1EVRS6FPF8PUs0S/view?usp=sharing" />
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText("https://drive.google.com/file/d/1PxjaxcBWnH1g3gZYl1EVRS6FPF8PUs0S/view?usp=sharing");
                                                setCopySuccess("ejemplo-plan");
                                                setTimeout(() => setCopySuccess(''), 2000);
                                            }}
                                            className="btn-action-admin"
                                            title="Copiar"
                                            style={{ color: copySuccess === 'ejemplo-plan' ? '#4ade80' : '#b89b2d' }}
                                        >
                                            {copySuccess === 'ejemplo-plan' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                        </button>
                                        <button
                                            onClick={() => window.open("https://drive.google.com/file/d/1PxjaxcBWnH1g3gZYl1EVRS6FPF8PUs0S/view?usp=sharing", '_blank')}
                                            className="btn-action-admin"
                                            title="Abrir en nueva ventana"
                                            style={{ color: '#002d44' }}
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                }

                {/* ── SECTION: Preguntas Test Inicial ── */}
                {
                    activeSection === 'preguntas-inicial' && (
                        <div className="admin-card">
                            <div className="admin-card-header responses-header-flex">
                                <h2><HelpCircle size={20} /> Preguntas test inicial</h2>
                                <div className="header-actions-group">
                                    <span className="registros-badge">
                                        {adminQuestions.length} activas
                                    </span>
                                </div>
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
                    )
                }

                {/* ── SECTION: Preguntas Test Avanzado ── */}
                {
                    activeSection === 'preguntas-avanzado' && (
                        <div className="admin-card">
                            <div className="admin-card-header responses-header-flex">
                                <h2><HelpCircle size={20} /> Preguntas test avanzado</h2>
                                <div className="header-actions-group">
                                    <span className="registros-badge">
                                        {adminAdvancedQuestions.length} activas
                                    </span>
                                </div>
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
                    )
                }

                {/* ── SECTION: Respuestas Avanzado ── */}
                {
                    activeSection === 'respuestas-avanzado' && (
                        <div className="admin-card">
                            <div className="admin-card-header responses-header-flex">
                                <h2><Lightbulb size={20} /> Respuestas test avanzado</h2>
                                <div className="header-actions-group">
                                    <span className="registros-badge">
                                        {(() => {
                                            const filtered = testResponses.filter(r => {
                                                const nameMatch = !filterName || (r.user_name || '').toLowerCase().includes(filterName.toLowerCase());
                                                const orgMatch = !filterOrg || (r.organization_code || '').toLowerCase().includes(filterOrg.toLowerCase());
                                                const eneatypeMatch = !filterEneatype || String(r.enneatype) === filterEneatype;
                                                const testTypeMatch = !filterTestType || String(r.test_type) === filterTestType;
                                                const commercialMatch = !filterCommercial || (r.commercial_name || '').toLowerCase().includes(filterCommercial.toLowerCase());
                                                return nameMatch && orgMatch && eneatypeMatch && testTypeMatch && commercialMatch;
                                            });
                                            const hasFilter = filterName || filterOrg || filterEneatype || filterTestType || filterCommercial;
                                            return hasFilter ? `${filtered.length} / ${testResponses.length}` : `${testResponses.length}`;
                                        })()} registros
                                    </span>
                                    <div className="header-buttons-wrapper">
                                        <button onClick={fetchTestResponses} className="btn-refresh-boxed" disabled={loadingResponses} title="Actualizar">
                                            <RefreshCw size={18} className={loadingResponses ? 'spinning' : ''} />
                                        </button>
                                    </div>
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
                                <input
                                    className="resp-filter-input"
                                    type="text"
                                    placeholder="Buscar comercial..."
                                    value={filterCommercial}
                                    onChange={e => setFilterCommercial(e.target.value)}
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
                                {(filterName || filterOrg || filterEneatype || filterTestType || filterCommercial) && (
                                    <button className="resp-filter-clear" onClick={() => { setFilterName(''); setFilterOrg(''); setFilterEneatype(''); setFilterTestType(''); setFilterCommercial(''); }}>
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
                                            <th>Comercial</th>
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
                                                        <td style={{ textAlign: 'center', fontSize: '0.82rem' }}>
                                                            {r.commercial_name ? (
                                                                <span style={{ color: '#b89b2d', fontWeight: 600 }}>{r.commercial_name}</span>
                                                            ) : (
                                                                <span style={{ color: '#9ca3af' }}>-</span>
                                                            )}
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
                    )
                }

                {/* ── SECTION: Respuestas Inicial ── */}
                {
                    activeSection === 'respuestas-inicial' && (
                        <div className="admin-card">
                            <div className="admin-card-header responses-header-flex">
                                <h2><Lightbulb size={20} /> Respuestas test inicial</h2>
                                <div className="header-actions-group">
                                    <span className="registros-badge">{initialResponses.length} registros</span>
                                    <div className="header-buttons-wrapper">
                                        <button
                                            onClick={handleDownloadAllInitialExcel}
                                            className="btn-download-excel-complete"
                                            title="Descargar Excel"
                                        >
                                            <Download size={16} />
                                            <span className="btn-text">Descargar excel</span>
                                        </button>
                                        <button onClick={fetchInitialResponses} className="btn-refresh-boxed" disabled={loadingResponses} title="Actualizar">
                                            <RefreshCw size={18} className={loadingResponses ? 'spinning' : ''} />
                                        </button>
                                    </div>
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
                    )
                }

                {/* ── SECTION: Inscripciones Taller ── */}
                {activeSection === 'inscripciones' && (
                    <div className="admin-card">
                        <div className="admin-card-header responses-header-flex">
                            <h2><Calendar size={20} /> Inscripciones al taller</h2>
                            <div className="header-actions-group">
                                <span className="registros-badge">
                                    {workshopRegistrations.filter(r => !filterWorkshopType || r.workshopType === filterWorkshopType).length} registros
                                </span>
                                <div className="header-buttons-wrapper">
                                    <button onClick={fetchWorkshopRegistrations} className="btn-refresh-boxed" disabled={loadingWorkshop} title="Actualizar">
                                        <RefreshCw size={18} className={loadingWorkshop ? 'spinning' : ''} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="resp-filters" style={{ justifyContent: 'flex-end' }}>
                            <select
                                className="resp-filter-select"
                                value={filterWorkshopType}
                                onChange={e => setFilterWorkshopType(e.target.value)}
                            >
                                <option value="">Todos los talleres</option>
                                <option value="Virtual">Virtual</option>
                                <option value="Presencial">Presencial</option>
                            </select>
                            {filterWorkshopType && (
                                <button className="resp-filter-clear" onClick={() => setFilterWorkshopType('')}>
                                    ✕ Limpiar
                                </button>
                            )}
                        </div>

                        <div className="codes-table-wrapper" style={{ maxHeight: '600px' }}>
                            <table className="codes-table">
                                <thead>
                                    <tr>
                                        <th>Taller</th>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Celular</th>
                                        <th>Fecha Pago/Registro</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingWorkshop ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
                                    ) : workshopRegistrations.length === 0 ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No hay inscripciones registradas aún.</td></tr>
                                    ) : (
                                        workshopRegistrations
                                            .filter(r => !filterWorkshopType || r.workshopType === filterWorkshopType)
                                            .map(r => (
                                                <tr key={r.id}>
                                                    <td>
                                                        <span className={`status-badge ${r.workshopType === 'Virtual' ? 'unused' : 'used'}`}>
                                                            {r.workshopType}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: '500' }}>{r.full_name || '-'}</td>
                                                    <td style={{ fontSize: '0.85rem' }}>{r.email || '-'}</td>
                                                    <td style={{ fontSize: '0.85rem' }}>{r.phone || '-'}</td>
                                                    <td style={{ fontSize: '0.8rem' }}>
                                                        {new Date(r.paidAt).toLocaleString('es-CO', { 
                                                            day: '2-digit', month: '2-digit', year: 'numeric', 
                                                            hour: '2-digit', minute: '2-digit' 
                                                        })}
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${r.paymentStatus === 'APPROVED' ? 'unused' : 'used'}`} style={{ fontSize: '0.7rem' }}>
                                                            {r.paymentStatus === 'APPROVED' ? 'PAGADO' : 'PENDIENTE'}
                                                        </span>
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
                {
                    activeSection === 'graficas' && (
                        <div className="charts-main-container">
                            {/* ── PRIMERA GRÁFICA: TEST INICIAL ── */}
                            <div className="admin-card chart-card">
                                <div className="admin-card-header responses-header-flex">
                                    <h2><BarChart2 size={22} /> Actividad test inicial</h2>
                                    <div className="header-actions-group">
                                        <span className="registros-badge">{initialResponses.length} registros totales</span>
                                    </div>
                                </div>

                                <div className="chart-period-tabs">
                                    {[
                                        { id: 'days7', label: '7 días' },
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

                            {/* ── SEGUNDA GRÁFICA: TEST AVANZADO ── */}
                            <div className="admin-card chart-card" style={{ marginTop: '30px' }}>
                                <div className="admin-card-header responses-header-flex">
                                    <h2><BarChart2 size={22} /> Actividad test avanzado</h2>
                                    <div className="header-actions-group">
                                        <span className="registros-badge">{testResponses.length} registros totales</span>
                                    </div>
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
                        </div>
                    )
                }

                {/* ── SECTION: Transacciones ── */}
                {
                    activeSection === 'transacciones' && (
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
                    )
                }

                {/* ── SECTION: Fascinantes Resultados Anónimos ── */}
                {
                    activeSection === 'fascinantes-anonimos' && (
                        <div className="admin-card">
                            <div className="admin-card-header responses-header-flex">
                                <h2><User size={20} /> Usuarios anónimos - Autodiagnóstico</h2>
                                <div className="header-actions-group">
                                    <div className="transaction-filters" style={{ marginRight: '15px', border: 'none', padding: 0, background: 'none' }}>
                                        <div className="filter-group">
                                            <input type="date" value={fascinantesDateFrom} onChange={(e) => setFascinantesDateFrom(e.target.value)} />
                                        </div>
                                        <div className="filter-group">
                                            <input type="date" value={fascinantesDateTo} onChange={(e) => setFascinantesDateTo(e.target.value)} />
                                        </div>
                                        <button onClick={fetchFascinantesResults} className="btn-refresh-boxed" style={{ height: '38px' }} title="Aplicar filtros">
                                            <Filter size={16} />
                                        </button>
                                        <button onClick={() => { setFascinantesDateFrom(''); setFascinantesDateTo(''); fetchFascinantesResults(); }} className="btn-refresh-boxed" style={{ height: '38px' }} title="Limpiar filtros">
                                            <RefreshCw size={16} className={loadingFascinantes ? 'spinning' : ''} />
                                        </button>
                                        <button 
                                            onClick={() => handleDownloadFascinantesExcel(fascinantesResults.filter(r => r.is_anonymous), 'Reporte_Fascinantes_Anonimos')} 
                                            className="btn-ver-respuestas" 
                                            style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <Download size={16} /> Excel
                                        </button>
                                    </div>
                                    <span className="registros-badge">
                                        {fascinantesResults.filter(r => r.is_anonymous).length} registros
                                    </span>
                                </div>
                            </div>

                            <div className="codes-table-wrapper" style={{ maxHeight: '600px' }}>
                                <table className="codes-table">
                                    <thead>
                                        <tr>
                                            <th># Usuario</th>
                                            <th>Fecha</th>
                                            <th>Nivel Obtenido</th>

                                            <th style={{ textAlign: 'center' }}>C.</th>
                                            <th style={{ textAlign: 'center' }}>M.</th>
                                            <th style={{ textAlign: 'center' }}>E.</th>
                                            <th style={{ textAlign: 'center' }}>S.</th>
                                            <th style={{ textAlign: 'center' }}>Es.</th>
                                            <th style={{ textAlign: 'center' }}>F.</th>
                                            <th style={{ textAlign: 'center' }}>Reporte</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingFascinantes ? (
                                            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>Cargando resultados...</td></tr>
                                        ) : fascinantesResults.filter(r => r.is_anonymous).length === 0 ? (
                                            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>No hay resultados registrados aún.</td></tr>
                                        ) : (() => {
                                            const anonData = fascinantesResults.filter(r => r.is_anonymous);
                                            return anonData.map((r, index) => (
                                                <tr key={r.id}>
                                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>#{anonData.length - index}</td>
                                                    <td style={{ fontSize: '0.85rem' }}>
                                                        {new Date(r.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td style={{ fontWeight: '600', color: '#b89b2d' }}>{calculateFascinantesLevel(r)}</td>

                                                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{r.score_corporal}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{r.score_mental}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{r.score_emocional}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{r.score_social}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{r.score_espiritual}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{r.score_financiero}</td>
                                                     <td style={{ textAlign: 'center' }}>
                                                         <button 
                                                             className="btn-ver-respuestas" 
                                                             style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto' }}
                                                             onClick={() => handleDownloadFascinantesPdf(r)}
                                                             disabled={isGeneratingFascinantesPdf === r.id}
                                                         >
                                                             {isGeneratingFascinantesPdf === r.id ? (
                                                                 <RefreshCw size={14} className="spinning" />
                                                             ) : (
                                                                 <><Download size={14} /> PDF</>
                                                             )}
                                                         </button>
                                                     </td>

                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }

                {/* ── SECTION: Fascinantes Resultados Registrados ── */}
                {
                    activeSection === 'fascinantes-registrados' && (
                        <div className="admin-card">
                            <div className="admin-card-header responses-header-flex">
                                <h2><User size={20} /> Usuarios registrados - Autodiagnóstico</h2>
                                <div className="header-actions-group">
                                    <div className="transaction-filters" style={{ marginRight: '15px', border: 'none', padding: 0, background: 'none' }}>
                                        <div className="filter-group">
                                            <input type="date" value={fascinantesDateFrom} onChange={(e) => setFascinantesDateFrom(e.target.value)} />
                                        </div>
                                        <div className="filter-group">
                                            <input type="date" value={fascinantesDateTo} onChange={(e) => setFascinantesDateTo(e.target.value)} />
                                        </div>
                                        <button onClick={fetchFascinantesResults} className="btn-refresh-boxed" style={{ height: '38px' }} title="Aplicar filtros">
                                            <Filter size={16} />
                                        </button>
                                        <button onClick={() => { setFascinantesDateFrom(''); setFascinantesDateTo(''); fetchFascinantesResults(); }} className="btn-refresh-boxed" style={{ height: '38px' }} title="Limpiar filtros">
                                            <RefreshCw size={16} className={loadingFascinantes ? 'spinning' : ''} />
                                        </button>
                                        <button 
                                            onClick={() => handleDownloadFascinantesExcel(fascinantesResults.filter(r => !r.is_anonymous), 'Reporte_Fascinantes_Registrados')} 
                                            className="btn-ver-respuestas" 
                                            style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <Download size={16} /> Excel
                                        </button>
                                    </div>
                                    <span className="registros-badge">
                                        {fascinantesResults.filter(r => !r.is_anonymous).length} registros
                                    </span>
                                </div>
                            </div>

                            <div className="codes-table-wrapper" style={{ maxHeight: '600px' }}>
                                <table className="codes-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Nombre</th>
                                            <th>F. Nacimiento</th>
                                            <th>Email</th>
                                            <th>Fecha Realización</th>
                                            <th>Nivel Obtenido</th>

                                            <th style={{ textAlign: 'center' }}>C.</th>
                                            <th style={{ textAlign: 'center' }}>M.</th>
                                            <th style={{ textAlign: 'center' }}>E.</th>
                                            <th style={{ textAlign: 'center' }}>S.</th>
                                            <th style={{ textAlign: 'center' }}>Es.</th>
                                            <th style={{ textAlign: 'center' }}>F.</th>
                                            <th style={{ textAlign: 'center' }}>Reporte</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingFascinantes ? (
                                            <tr><td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>Cargando resultados...</td></tr>
                                        ) : fascinantesResults.filter(r => !r.is_anonymous).length === 0 ? (
                                            <tr><td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>No hay resultados registrados aún.</td></tr>
                                        ) : (() => {
                                            const regData = fascinantesResults.filter(r => !r.is_anonymous);
                                            return regData.map((r, index) => (
                                                <tr key={r.id}>
                                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>#{regData.length - index}</td>
                                                    <td style={{ fontWeight: '500' }}>{r.full_name}</td>
                                                    <td style={{ fontSize: '0.85rem' }}>{r.birth_date}</td>
                                                    <td style={{ fontSize: '0.85rem' }}>{r.email}</td>
                                                    <td style={{ fontSize: '0.85rem' }}>
                                                        {new Date(r.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td style={{ fontWeight: '600', color: '#b89b2d' }}>{calculateFascinantesLevel(r)}</td>

                                                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{r.score_corporal}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{r.score_mental}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{r.score_emocional}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{r.score_social}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{r.score_espiritual}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: '500' }}>{r.score_financiero}</td>
                                                     <td style={{ textAlign: 'center' }}>
                                                         <button 
                                                             className="btn-ver-respuestas" 
                                                             style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto' }}
                                                             onClick={() => handleDownloadFascinantesPdf(r)}
                                                             disabled={isGeneratingFascinantesPdf === r.id}
                                                         >
                                                             {isGeneratingFascinantesPdf === r.id ? (
                                                                 <RefreshCw size={14} className="spinning" />
                                                             ) : (
                                                                 <><Download size={14} /> PDF</>
                                                             )}
                                                         </button>
                                                     </td>

                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }
            </main>

            {/* ── MODAL: Ver respuestas ── */}
            {
                selectedResponse && (
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
            {
                selectedInitialResponse && (
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
                )
            }


            {/* Hidden wrapper for PDF Generators */}
            <div id="admin-hidden-kit-printable" style={{ display: 'none' }}>
                <ExecutiveKitTemplate
                    data={executiveKitData[selectedType]}
                    type={selectedType}
                    name="Líder"
                />
            </div>

            {pdfReportUser && (
                <div 
                    ref={fascinantesTemplateRef}
                    style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm', background: 'white' }}
                >
                    <FascinantesReportTemplate 
                        userAnswers={pdfReportUser.userAnswers}
                        domainScores={pdfReportUser.domainScores}
                        analysis={pdfReportUser.analysis}
                        userName={pdfReportUser.name}
                        date={pdfReportUser.date}
                        hideQAPages={Object.keys(pdfReportUser.userAnswers).length === 0}
                    />
                </div>
            )}
        </div>
    );
};

export default Admin;
