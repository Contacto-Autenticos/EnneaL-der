import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Lock, X } from 'lucide-react';
import './Hub.css';

const Hub = () => {
    const navigate = useNavigate();
    const [showLockModal, setShowLockModal] = useState(false);

    const handleCardClick = (program) => {
        if (program.locked) {
            setShowLockModal(true);
        } else {
            navigate(program.path);
        }
    };

    return (
        <div className="hub-container animate-fade-in">
            <div className="hub-content">
                <header className="hub-header">
                    <h1 className="hub-title">Centro de Análisis</h1>
                    <p className="hub-subtitle">Explora tus diferentes facetas y potencia tu autoconocimiento.</p>
                </header>

                <div className="programs-section" style={{ marginTop: '10px', marginBottom: '20px' }}>
                    <div className="programs-list">
                        {[
                            { name: 'GENUINOS', icon: '/Iconos de programas/Programa_genuinos_huella_icono.png', path: '/Genuinos' },
                            { name: 'FASCINANTES', icon: '/Logo-Fascinantes-03.png', path: '/Fascinantes' },
                            { name: 'EXTRAORDINARIOS', icon: '/Logo-Extraordinarios-03.png', path: '/Extraordinarios', locked: true },
                            { name: 'TRASCENDENTES', icon: '/Logo-Trascendentes-03.png', path: '/Trascendentes', locked: true },
                            { name: 'CONSCIENTES', icon: '/Logo-Conscientes-03.png', path: '/Conscientes', locked: true }
                        ].map((program, index) => (
                            <div 
                                key={index} 
                                className={`program-square-card ${program.locked ? 'opalizado' : ''}`}
                                onClick={() => handleCardClick(program)}
                                style={{ cursor: 'pointer', position: 'relative' }}
                            >
                                {program.locked && (
                                    <div className="card-lock-icon">
                                        <Lock size={22} color="#ddbe3d" />
                                    </div>
                                )}
                                <div className="program-square-icon">
                                    <img src={program.icon} alt={program.name} />
                                </div>
                                <h4 className="program-square-name">{program.name}</h4>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="hub-footer-actions">
                    <button 
                        className="btn-my-results"
                        onClick={() => navigate('/my-results')}
                    >
                        <BarChart2 size={20} /> Mis Resultados Consolidados
                    </button>
                </div>

                <div className="hub-sync-container">
                    <p className="hub-sync-note">
                        Tus resultados se guardan localmente. <br />
                        Pronto podrás sincronizarlos con tu cuenta.
                    </p>
                </div>
            </div>

            <footer className="hub-footer">
                <img src="/logo-azul.png" alt="Auténticos" className="hub-footer-logo" />
            </footer>

            {/* Modal de Acceso Bloqueado */}
            {showLockModal && (
                <div className="lock-modal-overlay" onClick={() => setShowLockModal(false)}>
                    <div className="lock-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="lock-modal-close" onClick={() => setShowLockModal(false)}>
                            <X size={24} />
                        </button>
                        <div className="lock-modal-icon">
                            <Lock size={48} color="#ddbe3d" />
                        </div>
                        <h2 className="lock-modal-title">Acceso bloqueado</h2>
                        <p className="lock-modal-text">
                            Este programa aún no está disponible. <br />
                            Estamos trabajando en el mejor contenido para ti.
                        </p>
                        <button className="lock-modal-btn" onClick={() => setShowLockModal(false)}>
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hub;

