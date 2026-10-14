import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, X, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import './LiderazgoTestIntro.css';

const LiderazgoTestIntro = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [orgCode, setOrgCode] = useState('');
    const [orgError, setOrgError] = useState('');
    const [orgSuccess, setOrgSuccess] = useState('');
    const [currentOrg, setCurrentOrg] = useState('');

    useEffect(() => {
        const prevTitle = document.title;
        document.title = "Diagnóstico de Competencias de Liderazgo | Auténticos";

        const updateMeta = (name, content) => {
            let element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                if (name.startsWith('og:') || name.startsWith('twitter:')) {
                    element.setAttribute('property', name);
                } else {
                    element.setAttribute('name', name);
                }
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        updateMeta('description', "Reconoce cómo estás liderando y descubre tus áreas de mayor impacto. Evaluación integral en 5 dimensiones clave con reporte inmediato (5 a 7 min).");
        updateMeta('og:title', "Diagnóstico de Competencias de Liderazgo | Auténticos");
        updateMeta('og:description', "Reconoce cómo estás liderando y descubre tus áreas de mayor impacto. Evaluación integral en 5 dimensiones clave con reporte inmediato (5 a 7 min).");
        updateMeta('og:image', "https://enesencia.autenticos.co/og-liderazgo.jpg");
        updateMeta('twitter:title', "Diagnóstico de Competencias de Liderazgo | Auténticos");
        updateMeta('twitter:description', "Reconoce cómo estás liderando y descubre tus áreas de mayor impacto. Evaluación integral en 5 dimensiones clave con reporte inmediato (5 a 7 min).");
        updateMeta('twitter:image', "https://enesencia.autenticos.co/og-liderazgo.jpg");

        // Cargar organización guardada previamente
        const savedOrg = localStorage.getItem('liderazgo_organization');
        if (savedOrg) {
            setCurrentOrg(savedOrg);
            setOrgCode(savedOrg);
        }

        // Abrir modal automáticamente al ingresar a la página
        const timer = setTimeout(() => {
            setShowModal(true);
        }, 400);

        return () => {
            document.title = prevTitle;
            clearTimeout(timer);
        };
    }, []);

    const handleValidateCode = (e) => {
        if (e) e.preventDefault();
        setOrgError('');
        setOrgSuccess('');

        const cleanCode = orgCode.trim().toUpperCase();
        if (!cleanCode) {
            setOrgError('Por favor ingresa un código de organización.');
            return;
        }

        if (cleanCode === 'RESILIENTES' || cleanCode === 'CCC') {
            const orgName = cleanCode === 'CCC' ? 'CCC' : 'RESILIENTES';
            setOrgError('');
            setOrgSuccess(`¡Código validado exitosamente! Organización vinculada: ${orgName}`);
            setCurrentOrg(orgName);
            localStorage.setItem('liderazgo_organization', orgName);
            setTimeout(() => {
                setShowModal(false);
            }, 700);
        } else {
            setOrgError('El código ingresado no es válido. Verifica e intenta de nuevo.');
        }
    };

    const handleSkipCode = () => {
        setOrgError('');
        setOrgSuccess('');
        setShowModal(false);
    };

    return (
        <div className="container li-intro-container animate-fade-in">
            <div className="li-intro-content-wrapper">
                <div className="li-intro-logo-container">
                    <img
                        src="/Faro azul.png"
                        alt="Faro Azul"
                        className="li-intro-gold-logo animate-zoom-in-slow"
                    />
                </div>
                
                <div className="li-intro-header">
                    <h1 className="li-intro-title">Diagnóstico de competencias de Liderazgo</h1>
                </div>

                {/* Badge de Organización vinculada o botón para abrir modal */}
                {currentOrg ? (
                    <div className="li-org-badge animate-fade-in">
                        <Building2 size={15} />
                        <span>Organización: <strong>{currentOrg}</strong></span>
                        <button 
                            type="button" 
                            onClick={() => { setOrgCode(currentOrg); setOrgError(''); setOrgSuccess(''); setShowModal(true); }}
                            className="li-org-badge-edit"
                        >
                            Cambiar
                        </button>
                    </div>
                ) : (
                    <button 
                        type="button" 
                        onClick={() => { setOrgCode(''); setOrgError(''); setOrgSuccess(''); setShowModal(true); }}
                        className="li-org-link-btn"
                    >
                        <Building2 size={14} /> ¿Tienes un código de organización?
                    </button>
                )}

                <div className="li-intro-body">
                    <p className="li-intro-subtitle">Reconoce cómo estás liderando y dónde puedes crecer.</p>

                    <div className="li-intro-text-box">
                        <p>
                            Explora tu desarrollo actual en cinco dimensiones: liderazgo personal, estratégico, relacional, multiplicador, y consciente y trascendente. Este autodiagnóstico te ayudará a identificar fortalezas y aspectos que requieren atención, a partir de cómo percibes tus comportamientos y decisiones habituales.
                        </p>
                        
                        <p className="li-intro-highlight">
                            <strong>Responde desde tu experiencia cotidiana.</strong>
                        </p>

                        <p>
                            Considera tu comportamiento promedio durante los últimos 90 días. Elige la frecuencia que mejor describa cómo actúas, incluso cuando las cosas se complican. Evita responder desde tus intenciones, compararte con otras personas o basarte en situaciones excepcionales.
                        </p>

                        <p className="li-duration">Duración aproximada: 5 a 7 minutos</p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/liderazgo-test')}
                    className="li-btn-continue"
                >
                    Continuar <ArrowRight size={20} />
                </button>
            </div>

            <div className="li-intro-footer">
                <img
                    src="/logo-azul.png"
                    alt="Auténticos Logo Azul"
                    className="li-intro-footer-logo"
                />
            </div>

            {/* Modal de Código de Organización renderizado en el body para oscurecer toda la pantalla */}
            {showModal && typeof document !== 'undefined' && createPortal(
                <div className="li-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="li-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button 
                            type="button" 
                            className="li-modal-close" 
                            onClick={() => setShowModal(false)}
                            title="Cerrar"
                        >
                            <X size={18} />
                        </button>

                        <div className="li-modal-icon-wrap">
                            <Building2 size={30} />
                        </div>

                        <h3 className="li-modal-title">Código de Organización</h3>
                        <p className="li-modal-desc">
                            Si perteneces a una organización o equipo, ingresa el código asignado para vincular tus resultados.
                        </p>

                        <form onSubmit={handleValidateCode}>
                            <div className="li-modal-input-wrap">
                                <KeyRound size={18} className="li-modal-input-icon" />
                                <input
                                    type="text"
                                    className="li-modal-input"
                                    placeholder="CCC"
                                    value={orgCode}
                                    onChange={(e) => {
                                        setOrgCode(e.target.value.toUpperCase());
                                        if (orgError) setOrgError('');
                                    }}
                                    autoFocus
                                />
                            </div>

                            {orgError && (
                                <div className="li-modal-error">
                                    <AlertCircle size={16} />
                                    <span>{orgError}</span>
                                </div>
                            )}

                            {orgSuccess && (
                                <div className="li-modal-success">
                                    <CheckCircle2 size={16} />
                                    <span>{orgSuccess}</span>
                                </div>
                            )}

                            <button type="submit" className="li-modal-btn-submit">
                                Validar Código
                            </button>
                        </form>

                        <button 
                            type="button" 
                            className="li-modal-skip-btn"
                            onClick={handleSkipCode}
                        >
                            Continuar sin código
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default LiderazgoTestIntro;
