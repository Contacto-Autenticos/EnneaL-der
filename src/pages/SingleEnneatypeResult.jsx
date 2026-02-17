import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { getEnneagramInfo } from '../utils/calculator';
import './SingleEnneatypeResult.css';

const SingleEnneatypeResult = () => {
    const { type } = useParams();
    const navigate = useNavigate();
    const info = getEnneagramInfo(type);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!info || info.name === "Indeterminado") {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Eneatipo no encontrado.</p>
                <button onClick={() => navigate('/result')} style={{ padding: '10px 20px', marginTop: '10px' }}>
                    Volver
                </button>
            </div>
        );
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Mi Eneatipo es ${type} - ${info.name}`,
                    text: `He descubierto que soy Eneatipo ${type} en el Test de Eneagrama. ${info.role}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback for desktop/unsupported
            navigator.clipboard.writeText(window.location.href);
            alert('¡Enlace copiado al portapapeles!');
        }
    };

    // Color logic based on enneatype triad
    const getNumberColor = (type) => {
        const t = parseInt(type);
        if ([8, 9, 1].includes(t)) return '#E74C3C'; // Red (Gut/Instinctive)
        if ([2, 3, 4].includes(t)) return '#2ECC71'; // Green (Heart/Feeling)
        if ([5, 6, 7].includes(t)) return '#3498DB'; // Blue (Head/Thinking)
        return '#002d44'; // Default fallback
    };

    return (
        <div className="single-result-page fade-in" style={{ padding: '20px 20px 40px', maxWidth: '600px', margin: '0 auto' }}>

            {/* Header */}
            <header style={{ textAlign: 'center', marginBottom: '30px', marginTop: '10px' }}>
                <h1 style={{
                    color: '#002d44',
                    fontSize: '1.8rem',
                    marginBottom: '5px',
                    fontWeight: '800',
                    textTransform: 'uppercase'
                }}>
                    Eneatipo <span style={{ color: getNumberColor(type) }}>{type}</span> - {info.name}
                </h1>
                <h2 style={{
                    color: '#ddbe3d', // Gold
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    margin: '0'
                }}>
                    {info.role}
                </h2>
            </header>

            {/* Coin Image */}
            <div className="coin-container" style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '30px'
            }}>
                <div style={{
                    width: '280px',
                    height: '280px',
                    borderRadius: '50%',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)', // Stronger shadow per reference
                    overflow: 'hidden',
                    // border: '4px solid #fff', // Optional white border
                    position: 'relative' // For overlay effects if needed
                }}>
                    <img
                        src={info.image || "/moneda-autenticos.png"}
                        alt={`Moneda Eneatipo ${type}`}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: 'scale(1.17)'
                        }}
                    />
                </div>
            </div>

            {/* Description */}
            <div className="description-container" style={{ textAlign: 'center', marginBottom: '40px' }}>
                <p style={{
                    color: '#333',
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    whiteSpace: 'pre-line' // Handle newlines in description
                }}>
                    {info.description || "Descripción detallada no disponible."}
                </p>

                <p style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    marginTop: '20px',
                    fontStyle: 'italic',
                    color: '#444'
                }}>
                    Este resultado no busca encasillarte, sino ofrecerte un punto de partida para la reflexión. El autoconocimiento es un proceso, no una etiqueta.
                </p>
            </div>

            {/* Sticky/Fixed Bottom Buttons or Inline? User said "En la parte inferior" */}


            <div className="footer-buttons">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/result')}
                    className="footer-btn btn-back"
                >
                    <ArrowLeft size={18} />
                    <span>Regresar</span>
                </button>

                {/* Share Button */}
                <button
                    onClick={handleShare}
                    className="footer-btn btn-share"
                >
                    <span>Compartir</span>
                    <Share2 size={18} />
                </button>
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
    );
};

export default SingleEnneatypeResult;
