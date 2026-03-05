import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { executiveKitData } from '../data/executiveKitInfo';
import { RefreshCw, Plus, Key, ChevronDown, ChevronUp, Download, CheckCircle2, LogOut, Link, Copy, ExternalLink } from 'lucide-react';
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
    const [loadingResponses, setLoadingResponses] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState(null);

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
        }
    }, [isAuthenticated]);

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

            <div className="admin-layout-wrapper">
                {/* TOP SECTION: 3 Columns */}
                <div className="admin-top-section">
                    {/* CARD 1: Accesos Premium */}
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

                            <div className="codes-table-wrapper" style={{ maxHeight: '200px' }}>
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
                                                <td colSpan="3" style={{ textAlign: 'center', padding: '10px' }}>
                                                    {loading ? 'Cargando...' : 'No hay códigos.'}
                                                </td>
                                            </tr>
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
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: Generador Plan de Accion */}
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2><Download size={20} /> Generador Plan de Accion</h2>
                        </div>
                        <div className="pdf-generator-section">
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '15px' }}>
                                Descarga el PDF completo para cualquier eneatipo.
                            </p>

                            <div className="form-group-admin" style={{ marginBottom: '15px' }}>
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
                                    <RefreshCw size={18} className="spinning" />
                                ) : pdfSuccess ? (
                                    <CheckCircle2 size={18} color="#4ade80" />
                                ) : (
                                    <Download size={18} />
                                )}
                                {isGeneratingPdf ? ' Generando...' : pdfSuccess ? ' ¡Listo!' : ' Descargar PDF'}
                            </button>
                        </div>
                    </div>

                    {/* CARD 3: Links de Compartir */}
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
                </div>

                {/* BOTTOM SECTION: 2 Columns (Questions) */}
                <div className="admin-bottom-section">
                    {/* Test Inicial */}
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
                                            <div
                                                className={`question-group-header ${isExpanded ? 'active' : ''}`}
                                                onClick={() => toggleInitialGroup(groupKey)}
                                            >
                                                <span>{initialGroupLabels[groupKey]} ({groupQ.length})</span>
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                            <div className={`question-group-content ${isExpanded ? 'expanded' : ''}`}>
                                                {groupQ.map(q => (
                                                    <div key={q.id} className="question-item">
                                                        <div className="question-item-top">
                                                            <span className="q-id" style={{ fontSize: '0.85rem' }}>{q.id}.</span>
                                                            {editingId === q.id ? (
                                                                <textarea
                                                                    className="edit-q-textarea"
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <span className="q-text" style={{ fontSize: '0.85rem' }}>{q.text}</span>
                                                            )}
                                                        </div>
                                                        <div className="q-actions" style={{ marginTop: '10px' }}>
                                                            {editingId === q.id ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleSaveQuestion(q.id)}
                                                                        className="btn-save-q"
                                                                        disabled={savingId === q.id}
                                                                    >
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

                    {/* Test Avanzado */}
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
                                            <div
                                                className={`question-group-header ${isExpanded ? 'active' : ''}`}
                                                onClick={() => toggleGroup(typeStr)}
                                            >
                                                <span>Eneatipo {typeStr} ({groupQ.length})</span>
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </div>
                                            <div className={`question-group-content ${isExpanded ? 'expanded' : ''}`}>
                                                {groupQ.map(q => (
                                                    <div key={q.id} className="question-item">
                                                        <div className="question-item-top">
                                                            <span className="q-id" style={{ fontSize: '0.85rem' }}>{q.id}.</span>
                                                            {editingId === q.id ? (
                                                                <textarea
                                                                    className="edit-q-textarea"
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <span className="q-text" style={{ fontSize: '0.85rem' }}>{q.text}</span>
                                                            )}
                                                        </div>
                                                        <div className="q-actions" style={{ marginTop: '10px' }}>
                                                            {editingId === q.id ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleSaveQuestion(q.id, true)}
                                                                        className="btn-save-q"
                                                                        disabled={savingId === q.id}
                                                                    >
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
                </div>

                {/* RESPONSES SECTION: Full width */}
                <div className="admin-responses-section">
                    <div className="admin-card" style={{ width: '100%' }}>
                        <div className="admin-card-header">
                            <h2>Respuestas del Test Avanzado</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '0.9rem', color: '#b89b2d', fontWeight: 'bold' }}>
                                    {testResponses.length} registros
                                </span>
                                <button onClick={fetchTestResponses} className="btn-refresh" disabled={loadingResponses} title="Actualizar">
                                    <RefreshCw size={16} className={loadingResponses ? 'spinning' : ''} />
                                </button>
                            </div>
                        </div>

                        <div className="codes-table-wrapper" style={{ maxHeight: '400px' }}>
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
                                        testResponses.map(r => (
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
                                                    <button
                                                        className="btn-ver-respuestas"
                                                        onClick={() => setSelectedResponse(r)}
                                                    >
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
                </div>
            </div>

            {/* MODAL: Ver respuestas */}
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
                                </p>                  </div>
                            <button className="responses-modal-close" onClick={() => setSelectedResponse(null)}>✕</button>
                        </div>
                        <div className="responses-modal-body">
                            {(selectedResponse.answers || []).map((a, idx) => (
                                <div key={idx} className="response-item">
                                    <span className="response-number">{idx + 1}</span>
                                    <div className="response-content">
                                        <p className="response-question">{a.text}</p>
                                        <span className="response-answer">{a.answer_label || '—'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden wrapper for the PDF Generator target */}
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
