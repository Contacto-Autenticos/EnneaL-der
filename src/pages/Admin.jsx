import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { questions } from '../data/questions';
import { advancedQuestions } from '../data/advancedQuestions';
import { executiveKitData } from '../data/executiveKitInfo';
import { RefreshCw, Plus, Key, ChevronDown, ChevronUp, Download, CheckCircle2, LogOut } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ExecutiveKitTemplate from '../components/ExecutiveKitTemplate';
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
    const [selectedType, setSelectedType] = useState('1');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [pdfSuccess, setPdfSuccess] = useState(false);

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
        }
    }, [isAuthenticated]);

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

    // Group advanced questions by enneatype
    const groupedAdvancedQuestions = advancedQuestions.reduce((acc, q) => {
        if (!acc[q.enneatype]) {
            acc[q.enneatype] = [];
        }
        acc[q.enneatype].push(q);
        return acc;
    }, {});

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

            pdf.save(`Kit-Ejecutivo-Eneagrama-Tipo-${selectedType}.pdf`);
            setPdfSuccess(true);

            setTimeout(() => setPdfSuccess(false), 3000);

        } catch (error) {
            console.error('Error generating Executive Kit PDF:', error);
            alert('Hubo un error al generar el Kit Ejecutivo. Revisa la consola para más detalles.');
        } finally {
            setIsGeneratingPdf(false);
            if (kitRoot) kitRoot.style.display = 'none';
        }
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
        <div className="admin-container" style={{ maxWidth: '1400px' }}>
            <div className="admin-header">
                <h1>Panel de Administrador</h1>
                <p>Gestiona recursos premium y configuración</p>
                <button onClick={handleLogout} className="btn-logout">
                    <LogOut size={16} /> Cerrar Sesión
                </button>
            </div>

            <div className="admin-grid">

                {/* COLUMN 1: Accesos Premium y Generación PDF */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><Key size={20} /> Accesos Premium</h2>
                        </div>

                        <div className="code-generator-section">
                            <button
                                onClick={handleGenerateCode}
                                disabled={generating}
                                className="btn-generate"
                            >
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

                            <div className="codes-table-wrapper" style={{ maxHeight: '300px' }}>
                                <table className="codes-table">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Estado</th>
                                            <th>Usado por</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {codes.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                                                    {loading ? 'Cargando códigos...' : 'Aún no hay códigos generados.'}
                                                </td>
                                            </tr>
                                        ) : (
                                            codes.map((item) => (
                                                <tr key={item.code}>
                                                    <td className="code-cell">{item.code}</td>
                                                    <td>
                                                        <span className={`status-badge ${item.is_used ? 'used' : 'unused'}`}>
                                                            {item.is_used ? 'Usado' : 'Disponible'}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '0.8rem' }}>{item.used_by || '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><Download size={20} /> Generador Kit Ejecutivo</h2>
                        </div>
                        <div className="pdf-generator-section">
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginTop: '-10px' }}>
                                Genera y descarga el PDF del Kit Ejecutivo completo para cualquier eneatipo bajo demanda.
                            </p>

                            <div className="form-group-admin">
                                <label htmlFor="type-select">Selecciona el Eneatipo:</label>
                                <select
                                    id="type-select"
                                    className="select-admin"
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    disabled={isGeneratingPdf}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                        <option key={num} value={num.toString()}>
                                            Eneatipo {num}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className="btn-download-pdf"
                                onClick={handleDownloadPdf}
                                disabled={isGeneratingPdf}
                            >
                                {isGeneratingPdf ? (
                                    <>
                                        <RefreshCw size={18} className="spinning" />
                                        Generando PDF (Puede tardar un poco)...
                                    </>
                                ) : pdfSuccess ? (
                                    <>
                                        <CheckCircle2 size={18} color="#4ade80" />
                                        ¡Descargado con éxito!
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        Descargar PDF del Tipo {selectedType}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: Banco de Preguntas Iniciales */}
                <div className="admin-card" style={{ height: 'fit-content' }}>
                    <div className="admin-card-header">
                        <h2>Test Inicial</h2>
                        <span style={{ fontSize: '0.9rem', color: '#b89b2d', fontWeight: 'bold' }}>
                            {questions.length} Activas
                        </span>
                    </div>

                    <div className="questions-list" style={{ maxHeight: '700px' }}>
                        {questions.map((q) => (
                            <div key={q.id} className="question-item">
                                <span className="q-id">{q.id}.</span>
                                <span className="q-text">{q.text}</span>
                                <span className="q-type">Tipo {q.type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLUMN 3: Banco de Preguntas Avanzadas */}
                <div className="admin-card" style={{ height: 'fit-content' }}>
                    <div className="admin-card-header">
                        <h2>Test Avanzado</h2>
                        <span style={{ fontSize: '0.9rem', color: '#b89b2d', fontWeight: 'bold' }}>
                            {advancedQuestions.length} Activas
                        </span>
                    </div>

                    <div style={{ maxHeight: '700px', overflowY: 'auto', paddingRight: '5px' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(typeNum => {
                            const typeStr = typeNum.toString();
                            const groupQ = groupedAdvancedQuestions[typeStr] || [];
                            const isExpanded = expandedGroup === typeStr;

                            return (
                                <div key={typeStr} className="question-group">
                                    <div
                                        className={`question-group-header ${isExpanded ? 'active' : ''}`}
                                        onClick={() => toggleGroup(typeStr)}
                                    >
                                        <span>Eneatipo {typeStr} ({groupQ.length})</span>
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                    <div className={`question-group-content ${isExpanded ? 'expanded' : ''}`}>
                                        {groupQ.map(q => (
                                            <div key={q.id} className="question-item" style={{ backgroundColor: 'white' }}>
                                                <span className="q-id" style={{ fontSize: '0.85rem' }}>{q.id}.</span>
                                                <span className="q-text" style={{ fontSize: '0.85rem' }}>{q.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ERROR FIX: Hidden wrapper for the PDF Generator target */}
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
