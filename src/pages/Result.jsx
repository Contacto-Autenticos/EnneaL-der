import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, ExternalLink, User, X, Share2, ArrowLeft } from 'lucide-react';
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
                backgroundColor: null, // Transparent background if possible, or use #fff
                scale: 2, // Higher resolution
                useCORS: true // For cross-origin images
            });

            const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const imageFile = new File([imageBlob], `eneatipo-${type}.png`, { type: 'image/png' });

            const shareData = {
                title: `Mi Eneatipo es ${type} - ${info.name}`,
                text: `He descubierto que soy Eneatipo ${type} en el Test de Eneagrama. ${info.role}`,
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
                    text: `He descubierto que soy Eneatipo ${type} en el Test de Eneagrama. ${info.role}`,
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
                    <h2 className="ennea-modal-title">
                        Eneatipo <span style={{ color: getNumberColor(type) }}>{type}</span> — {info.name}
                    </h2>
                    <p className="ennea-modal-role">{info.role}</p>
                </div>

                <div className="ennea-modal-coin">
                    <div className="ennea-modal-coin-wrapper">
                        <img src={info.image || "/moneda-autenticos.png"} alt={`Eneatipo ${type}`} />
                    </div>
                </div>

                <div className="ennea-modal-description">
                    <p>{info.description}</p>
                    <p className="ennea-modal-disclaimer">
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
    const [isModalOpen, setIsModalOpen] = React.useState(false);

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

                <header className="result-header">
                    <h1 className="result-title">
                        RESULTADO
                    </h1>
                    <p style={{
                        color: '#444',
                        marginTop: '5px',
                        fontSize: '1rem',
                        lineHeight: '1.4',
                        maxWidth: '85%',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}>
                        Tus respuestas muestran una fuerte afinidad<br />
                        con estos tres eneatipos.
                    </p>
                </header>

                <div
                    className="result-chart-wrapper"
                    onClick={handleChartClick}
                >
                    <EnneagramChart scores={enneatypeScores || {}} />
                </div>

                <div className="result-summary">
                    <p style={{
                        color: '#666',
                        marginBottom: '25px',
                        fontStyle: 'italic',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        maxWidth: '85%',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}>
                        Toca un eneatipo para ver una breve descripción.
                    </p>

                    <div className="top-results-cards">
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

                    <p className="advanced-analysis-note">
                        El análisis avanzado te ayudará a identificarlo con mayor profundidad.
                    </p>



                    <div className="action-buttons-group">
                        <div className="action-buttons-row">
                            <button
                                onClick={onReset}
                                className="btn-result btn-repeat"
                            >
                                <RotateCcw size={18} />
                                <span>Repetir Test</span>
                            </button>

                            <button
                                className="btn-result btn-advanced"
                                onClick={handleDetailedAnalysis}
                            >
                                <span>Accede al análisis avanzado</span>
                                <ExternalLink size={18} />
                            </button>
                        </div>

                        <button
                            onClick={() => navigate('/register')}
                            className="btn-result btn-register"
                        >
                            <User size={18} />
                            <span>Registro</span>
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
