import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, ExternalLink, User, X, Share2, ArrowLeft, Eye, Lock } from 'lucide-react';
import EnneagramChart from '../components/EnneagramChart';
import { getEnneagramInfo } from '../utils/calculator';

import './Result.css';

import html2canvas from 'html2canvas'; // Import html2canvas

const EnneatypeModal = ({ isOpen, onClose, type }) => {
    const modalRef = React.useRef(null); // Ref for the modal content

    if (!isOpen || !type) return null;
    const info = getEnneagramInfo(type);

    const handleShare = async () => {
        if (!modalRef.current) return;

        try {
            // Generate image from modal content
            const canvas = await html2canvas(modalRef.current, {
                backgroundColor: '#ffffff', // Force white canvas
                scale: 3, // Increase scale for better detail
                useCORS: true,
                onclone: (clonedDoc) => {
                    const clonedModal = clonedDoc.querySelector('.ennea-modal-content');
                    if (clonedModal) {
                        clonedModal.style.background = '#ffffff'; // Force solid white
                        clonedModal.style.boxShadow = 'none'; // Remove shadow for clean card look
                        clonedModal.style.transform = 'none'; // Avoid transform issues
                        clonedModal.style.animation = 'none'; // Avoid capture during animation
                        clonedModal.style.borderRadius = '0'; // Optional: squared look or keep rounded
                    }

                    // Force image styles if needed
                    const clonedImg = clonedDoc.querySelector('.ennea-modal-coin img');
                    if (clonedImg) {
                        clonedImg.style.mixBlendMode = 'normal'; // Reset blend mode just in case
                    }
                }
            });

            const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const imageFile = new File([imageBlob], `eneatipo-${type}.png`, { type: 'image/png' });

            const shareData = {
                title: `Mi Eneatipo es ${type} - ${info.name}`,
                text: `He descubierto que soy Eneatipo ${type} en el Test de Eneagrama. ${info.role}\n\n¡Descubre el tuyo en https://enesencia.autenticos.co`,
                files: [imageFile],
            };

            // Check if native sharing with files is supported
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
                await navigator.share(shareData);
            } else {
                // Fallback: Download image
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `eneatipo-${type}.png`;
                link.click();
                alert('La imagen se ha descargado porque tu navegador no soporta compartir imágenes directamente.');
            }
        } catch (error) {
            console.error('Error sharing image:', error);
            // Fallback to text sharing if image fails
            const shareUrl = `${window.location.origin}/result/${type}`;
            if (navigator.share) {
                navigator.share({
                    title: `Mi Eneatipo es ${type} - ${info.name}`,
                    text: `He descubierto que soy Eneatipo ${type} en el Test de Eneagrama. ${info.role}\n\n¡Descubre el tuyo en https://enesencia.autenticos.co`,
                    url: shareUrl,
                }).catch(console.error);
            } else {
                navigator.clipboard.writeText(shareUrl);
                alert('¡Enlace copiado al portapapeles! (No se pudo generar la imagen)');
            }
        }
    };

    const getNumberColor = (num) => {
        const t = parseInt(num);
        if ([8, 9, 1].includes(t)) return '#E74C3C'; // Gut
        if ([2, 3, 4].includes(t)) return '#2ECC71'; // Heart
        if ([5, 6, 7].includes(t)) return '#3498DB'; // Head
        return '#002d44';
    };

    return (
        <div className="ennea-modal-overlay" onClick={onClose}>
            <div className="ennea-modal-content" onClick={(e) => e.stopPropagation()} ref={modalRef}>
                <button className="modal-close-btn" onClick={onClose} data-html2canvas-ignore>
                    <X size={24} />
                </button>

                <div className="ennea-modal-header">
                    <h2 className="ennea-modal-title" style={{ color: getNumberColor(type) }}>
                        Eneatipo {type} — {info.name}
                    </h2>
                    <p className="ennea-modal-role">{info.role}</p>
                </div>

                <div className="ennea-modal-coin">
                    <div className="ennea-modal-coin-wrapper">
                        <img src={info.image || "/logo-moneda.png"} alt={`Eneatipo ${type}`} />
                    </div>
                </div>

                <div className="ennea-modal-description">
                    <p>{info.description}</p>
                    <p className="ennea-modal-disclaimer" data-html2canvas-ignore>
                        Este resultado no busca encasillarte, sino ofrecerte un punto de partida para la reflexión. El autoconocimiento es un proceso, no una etiqueta.
                    </p>
                </div>

                <div className="ennea-modal-footer" data-html2canvas-ignore>
                    <button className="modal-btn-back" onClick={onClose}>
                        <ArrowLeft size={18} /> Regresar
                    </button>
                    <button className="modal-btn-share" onClick={handleShare}>
                        Compartir <Share2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};



const Result = ({ result, user, onReset }) => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = React.useState(null);
    const [activePhase, setActivePhase] = React.useState(1);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // Progressive revelation sequence
    React.useEffect(() => {
        if (!result) return;

        const timers = [
            setTimeout(() => setActivePhase(2), 1000), // Radar
            setTimeout(() => setActivePhase(3), 2500), // Highlight
            setTimeout(() => setActivePhase(4), 4000), // Main Result
            setTimeout(() => setActivePhase(5), 5200), // Cards
            setTimeout(() => setActivePhase(6), 6500), // CTAs
        ];

        return () => timers.forEach(t => clearTimeout(t));
    }, [result]);

    const openModal = (type) => {
        setSelectedType(type);
        setIsModalOpen(true);
    };

    // If no result, redirect
    if (!result) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                No hay resultados disponibles.
                <button
                    onClick={() => window.location.href = '/test'}
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: '#002d44',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Realizar Test
                </button>
            </div>
        );
    }

    // ... code ...



    const { enneatypes, enneatypeScores } = result;

    // Calculate Top 3
    const top3 = useMemo(() => {
        if (!enneatypeScores) return [];

        // Filter out any potential invalid types (like 0 if it existed) and ensure only 1-9
        const validTypes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

        // Use enneatypeScores object for reliable iteration
        return Object.entries(enneatypeScores)
            .filter(([type]) => validTypes.includes(type))
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([type, score], index) => {
                let affinity = "Media";
                // Force affinity based on rank order
                if (index === 0) affinity = "Muy Alta";
                else if (index === 1) affinity = "Alta";
                else if (index === 2) affinity = "Media";

                // Get info for title
                const info = getEnneagramInfo(type) || { name: "Indeterminado" };

                return { type, score, affinity, title: info.name };
            });
    }, [enneatypeScores, enneatypes]);

    const handleChartClick = () => {
        navigate('/detailed-result');
    };

    const handleDetailedAnalysis = () => {
        navigate('/payment');
    };

    return (
        <div className="result-page fade-in">
            <div className="result-container">

                <header className={`result-header phase-active-${activePhase}`}>
                    <h1 className="result-title">
                        {activePhase < 4 ? "TÚ PERFIL HA SIDO REVELADO" : "TU RESULTADO"}
                    </h1>
                    <p className="result-subtitle">
                        {activePhase < 4
                            ? "Estamos analizando tu patrón dominante…"
                            : "Muestras una fuerte afinidad con 3 eneatipos."
                        }
                    </p>
                </header>

                <div
                    className="result-chart-wrapper"
                    onClick={handleChartClick}
                >
                    <EnneagramChart
                        scores={enneatypeScores || {}}
                        phase={activePhase}
                        top3Types={top3.map(t => parseInt(t.type))}
                    />
                </div>

                <div className={`result-summary phase-active-${activePhase}`}>

                    <div className={`top-results-cards ${activePhase >= 5 ? 'revealed' : 'hidden'}`}>
                        <p style={{
                            fontSize: '0.8rem',
                            color: '#666',
                            textAlign: 'center',
                            marginBottom: '10px',
                            fontStyle: 'italic'
                        }}>
                            Toca cada tarjeta para mayor información
                        </p>
                        {top3.map((item) => (
                            <div
                                key={item.type}
                                onClick={() => openModal(item.type)}
                                className="result-card"
                            >
                                {/* Left Side: Type and Title */}
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{
                                        color: '#002d44',
                                        fontWeight: '800',
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase'
                                    }}>
                                        Eneatipo {item.type}
                                    </div>
                                    <div style={{
                                        color: '#666',
                                        fontSize: '0.75rem',
                                        marginTop: '1px'
                                    }}>
                                        {item.title}
                                    </div>
                                </div>

                                {/* Center: View Icon */}
                                <div className="card-eye-wrapper">
                                    <Eye size={20} className="card-eye-wrapper-icon" />
                                </div>

                                {/* Right Side: Affinity */}
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        color: '#ddbe3d',
                                        fontWeight: '700',
                                        fontSize: '0.85rem'
                                    }}>
                                        {item.affinity}
                                    </div>
                                    <div style={{
                                        color: '#999',
                                        fontSize: '0.65rem',
                                        textTransform: 'uppercase',
                                        marginTop: '1px',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Afinidad
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={`advanced-analysis-section ${activePhase >= 6 ? 'revealed' : 'hidden'}`}>
                        <h3 className="advanced-analysis-title">
                            Tu resultado actual es solo la superficie
                        </h3>
                        <p className="advanced-analysis-note">
                            Si quieres comprender con mayor profundidad tu esencia y la motivación central que guía tus decisiones, el análisis avanzado te dará una lectura mucho más precisa y reveladora.
                        </p>
                    </div>



                    <div className={`action-buttons-group ${activePhase >= 6 ? 'revealed' : 'hidden'}`}>
                        <button
                            className="btn-result btn-advanced-shimmer"
                            onClick={handleDetailedAnalysis}
                        >
                            <Lock size={20} className="btn-icon-blue" />
                            <span>DESBLOQUEAR MI ANÁLISIS AVANZADO</span>
                        </button>

                        <button
                            onClick={onReset}
                            className="btn-result btn-repeat-secondary"
                        >
                            <RotateCcw size={18} />
                            <span>Repetir Test</span>
                        </button>
                    </div>

                    <EnneatypeModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        type={selectedType}
                    />


                </div>


                {/* Brand footer */}
                <div className="detailed-brand-footer" style={{ marginTop: '30px', textAlign: 'center' }}>
                    <img
                        src="/logo-azul.png"
                        alt="Logo Auténticos"
                        className="register-footer-logo"
                        style={{ maxWidth: '150px', height: 'auto' }}
                    />
                </div>

            </div>
        </div>
    );
};

export default Result;
