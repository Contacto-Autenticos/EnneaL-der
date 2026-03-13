import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultVideoIntro.css';

const ResultVideoIntro = ({ type }) => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [videoError, setVideoError] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleVideoEnded = () => navigate('/advanced-analysis-result');
    const handleSkip = () => navigate('/advanced-analysis-result');

    // Use a clean version of type and a cache buster
    const cleanType = String(type).trim();
    const videoSrc = cleanType ? `/videos/Eneatipo-${cleanType}-intro-${isMobile ? 'mobile' : 'desktop'}.mp4?v=${Date.now()}` : null;

    useEffect(() => {
        if (videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Autoplay prevented:", error);
                    setIsPaused(true);
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
        <div className="video-intro-page">
            <div className="video-controls-overlay">
                <button className="skip-video-btn" onClick={handleSkip}>
                    {videoError ? 'IR AL RESULTADO' : 'SALTAR'}
                </button>
            </div>

            <video
                key={videoSrc}
                ref={videoRef}
                className="intro-video"
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
                onError={(e) => {
                    console.error("Error loading video:", videoSrc);
                    setVideoError(true);
                }}
                onPlay={() => setIsPaused(false)}
                onPause={() => setIsPaused(true)}
            >
                <source src={videoSrc} type="video/mp4" />
                Tu navegador no soporta videos.
            </video>

            {isPaused && !videoError && (
                <div className="play-overlay" onClick={() => videoRef.current?.play()}>
                    <div className="play-button-icon">▶</div>
                    <p>Haz clic para reproducir el video promocional</p>
                </div>
            )}

            {videoError && (
                <div className="error-overlay">
                    <p>No se pudo cargar el video de tu Eneatipo {type}.</p>
                    <span className="error-path">Ruta: {videoSrc.split('?')[0]}</span>
                    <button className="al-btn-main" onClick={handleSkip} style={{ marginTop: '20px', padding: '12px 30px' }}>
                        CONTINUAR AL RESULTADO
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResultVideoIntro;
