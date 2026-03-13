import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultVideoIntro.css';

const ResultVideoIntro = ({ type }) => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [videoError, setVideoError] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleVideoEnded = () => {
        console.log("Video ended, navigating...");
        navigate('/advanced-analysis-result');
    };

    const handleSkip = () => {
        navigate('/advanced-analysis-result');
    };

    const videoSrc = type ? `/videos/Eneatipo-${type}-intro-${isMobile ? 'mobile' : 'desktop'}.mp4` : null;

    useEffect(() => {
        if (videoSrc) {
            console.log("Attempting to load video:", videoSrc);
            if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().catch(err => {
                    console.warn("Autoplay was blocked or failed:", err);
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
            <button className="skip-video-btn" onClick={handleSkip}>
                {videoError ? 'IR AL RESULTADO' : 'SALTAR'}
            </button>
            <video
                ref={videoRef}
                className="intro-video"
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
                onError={(e) => {
                    console.error("Video error details:", e);
                    setVideoError(true);
                }}
                onCanPlay={() => console.log("Video can play")}
                src={videoSrc}
            >
                Tu navegador no soporta videos.
            </video>
            {videoError && (
                <div style={{ position: 'absolute', bottom: '20%', color: 'white', textAlign: 'center', background: 'rgba(0,0,0,0.7)', padding: '20px', borderRadius: '10px' }}>
                    <p>Hubo un problema al cargar el video de tu Eneatipo {type}.</p>
                    <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.8 }}>Ruta intentada: {videoSrc}</p>
                </div>
            )}
        </div>
    );
};

export default ResultVideoIntro;
