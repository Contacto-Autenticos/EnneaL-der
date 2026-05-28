import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultVideoIntro.css';

const ResultVideoIntro = ({ type }) => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [videoError, setVideoError] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isFading, setIsFading] = useState(false);
    const [hasEnded, setHasEnded] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleVideoEnded = () => {
        setHasEnded(true);
        setIsFading(true);
        // Wait for CSS transition (0.8s) before navigating
        setTimeout(() => {
            navigate('/eneagrama-advanced-analysis-result');
        }, 800);
    };

    const handleSkip = () => {
        setIsFading(true);
        setTimeout(() => {
            navigate('/eneagrama-advanced-analysis-result');
        }, 400); // Shorter fade for skip
    };

    // Use a clean version of type
    const cleanType = String(type).trim();
    // The folder is capitalized as 'Videos' in the public directory
    const videoSrc = cleanType ? `/Videos/Eneatipo-${cleanType}-intro-${isMobile ? 'mobile' : 'desktop'}.mp4` : null;

    useEffect(() => {
        if (videoSrc && videoRef.current) {
            videoRef.current.load();
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Autoplay check:", error);
                    // Only show play button if it hasn't ended and we're not fading
                    if (!hasEnded && !isFading) {
                        setIsPaused(true);
                    }
                });
            }
        }
    }, [videoSrc]);

    if (!type) {
        return (
            <div className="video-intro-page">
                <div style={{ color: 'white', textAlign: 'center' }}>
                    <p>Cargando información del resultado...</p>
                    <button className="al-btn-main" onClick={handleSkip} style={{ marginTop: '20px' }}>
                        VER RESULTADO
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`video-intro-page ${isFading ? 'fade-out-active' : ''}`}>
            {/* Transition Overlay */}
            <div className="video-fade-overlay"></div>

            <div className="video-controls-overlay">
                {!isFading && (
                    <button className="skip-video-btn" onClick={handleSkip}>
                        {videoError ? 'IR AL RESULTADO' : 'SALTAR'}
                    </button>
                )}
            </div>

            <video
                key={videoSrc}
                ref={videoRef}
                className="intro-video"
                autoPlay
                muted
                playsInline
                preload="metadata"
                onEnded={handleVideoEnded}
                onError={(e) => {
                    console.error("Video element error:", e);
                    setVideoError(true);
                }}
                onPlay={() => setIsPaused(false)}
                onPause={() => {
                    // Only show pause state if not at end and not fading
                    if (!videoRef.current?.ended && !isFading) {
                        setIsPaused(true);
                    }
                }}
                src={videoSrc}
            >
                Tu navegador no soporta videos.
            </video>

            {isPaused && !videoError && !isFading && !hasEnded && (
                <div className="play-overlay" onClick={() => videoRef.current?.play()}>
                    <div className="play-button-icon">▶</div>
                    <p>Haz clic para reproducir el video promocional</p>
                </div>
            )}

            {videoError && (
                <div className="error-overlay">
                    <p>No se pudo cargar el video de tu Eneatipo {type}.</p>
                    <span className="error-path">Ruta intentada: {videoSrc}</span>
                    <div style={{ marginTop: '15px', fontSize: '12px', color: '#ffaaaa' }}>
                        Por favor verifica que los archivos estén en: <br/>
                        <code>public/Videos/</code>
                    </div>
                    <button className="al-btn-main" onClick={handleSkip} style={{ marginTop: '20px', padding: '12px 30px' }}>
                        CONTINUAR AL RESULTADO
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResultVideoIntro;
