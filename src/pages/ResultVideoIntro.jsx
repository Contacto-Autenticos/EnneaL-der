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

    const videoSrc = `/videos/Eneatipo-${type}-intro-${isMobile ? 'mobile' : 'desktop'}.mp4`;

    useEffect(() => {
        console.log("Attempting to load video:", videoSrc);
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [videoSrc]);

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
                <div style={{ position: 'absolute', bottom: '20%', color: 'white', textAlign: 'center' }}>
                    <p>Hubo un problema al cargar el video.</p>
                </div>
            )}
        </div>
    );
};

export default ResultVideoIntro;
